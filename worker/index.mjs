#!/usr/bin/env node
/*
  Sedarikini Worker — merender video di Mac.

  Vercel hanya menjalankan UI + Supabase. Worker ini yang:
    1. mengambil job "antre" dari Supabase
    2. menyusun project dari _TEMPLATE
    3. mengunduh VO + footage
    4. menjalankan buat → check → render
    5. mengunggah MP4 + frame pratinjau

  Pakai:
    npm install
    cp .env.example .env      # isi SUPABASE_URL + SERVICE_ROLE_KEY
    npm start                 # jalan terus, cek antrean tiap 5 detik
    npm run sekali            # proses satu job lalu keluar
    npm run cek               # cek koneksi + tools
*/

import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createClient } from "@supabase/supabase-js";

const WORKER_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(WORKER_DIR);
const TEMPLATE = path.resolve(process.env.TEMPLATE_DIR || path.join(ROOT, "_TEMPLATE"));
const WORK_DIR = path.resolve(process.env.WORK_DIR || path.join(ROOT, "_RENDER"));
const CACHE_DIR = path.join(WORK_DIR, ".cache");
const POLL = Math.max(2, Number(process.env.POLL_SECONDS || 5));
const KEEP_FAILED = process.env.KEEP_FAILED === "1";
const HF = process.env.HYPERFRAMES_VERSION || "0.8.186";
const SEKALI = process.argv.includes("--sekali");
const CEK = process.argv.includes("--cek");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(`
✖ SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diisi.

  cp .env.example .env
  lalu isi kedua nilai dari Supabase → Project Settings → API Keys.
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const cap = () =>
  new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const rel = (p) => path.relative(ROOT, p) || ".";

/* ------------------------------------------------------------------ */
/* perintah                                                            */
/* ------------------------------------------------------------------ */

function jalankan(cmd, args, opsi = {}) {
  return new Promise((resolve, reject) => {
    const anak = spawn(cmd, args, {
      cwd: opsi.cwd,
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let keluaran = "";
    const teruskan = (buf) => {
      const teks = buf.toString();
      keluaran += teks;
      opsi.onData?.(teks);
    };

    anak.stdout.on("data", teruskan);
    anak.stderr.on("data", teruskan);

    anak.on("error", (err) => reject(new Error(`${cmd} gagal dijalankan: ${err.message}`)));
    anak.on("close", (kode) => {
      if (kode === 0) return resolve(keluaran);
      const ekor = keluaran.trim().split("\n").slice(-12).join("\n");
      reject(new Error(`${cmd} berhenti dengan kode ${kode}.\n${ekor}`));
    });
  });
}

async function cekTools() {
  const hasil = {};
  for (const bin of ["node", "npx", "ffmpeg", "ffprobe"]) {
    try {
      await jalankan("which", [bin]);
      hasil[bin] = true;
    } catch {
      hasil[bin] = false;
    }
  }
  return hasil;
}

async function durasi(file) {
  const out = await jalankan("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  const n = Number(out.trim());
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/* berkas                                                              */
/* ------------------------------------------------------------------ */

const LEWATI = new Set([".hyperframes", "node_modules", "renders", "compositions", "footage"]);
const LEWATI_AKAR = new Set(["video.json", "index.html", "meta.json", "video.contoh.json"]);

function salinTemplate(tujuan) {
  fs.cpSync(TEMPLATE, tujuan, {
    recursive: true,
    filter: (src) => {
      const r = path.relative(TEMPLATE, src);
      if (!r) return true;
      const bagian = r.split(path.sep);
      if (bagian[0] === "assets" && ["audio", "footage"].includes(bagian[1])) return false;
      if (bagian.length === 1 && LEWATI_AKAR.has(bagian[0])) return false;
      if (LEWATI.has(bagian[0])) return false;
      return true;
    },
  });

  for (const folder of ["footage", "compositions", "renders", "assets/audio", "assets/footage"]) {
    fs.mkdirSync(path.join(tujuan, folder), { recursive: true });
  }
}

async function unduhAset(asset, tujuan) {
  const { data: signed, error } = await supabase.storage
    .from(asset.bucket)
    .createSignedUrl(asset.path, 600);

  if (error || !signed?.signedUrl) {
    throw new Error(`Gagal membuat tautan unduhan untuk ${asset.name}: ${error?.message ?? "?"}`);
  }

  const res = await fetch(signed.signedUrl);
  if (!res.ok || !res.body) {
    throw new Error(`Gagal mengunduh ${asset.name}: HTTP ${res.status}`);
  }

  await fsp.mkdir(path.dirname(tujuan), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tujuan));
  return tujuan;
}

async function unduhFootage(asset) {
  const ext = path.extname(asset.path) || ".mov";
  const cache = path.join(CACHE_DIR, `${asset.id}${ext}`);
  if (fs.existsSync(cache) && fs.statSync(cache).size > 1024) return { file: cache, ext };
  const temp = `${cache}.part`;
  await unduhAset(asset, temp);
  fs.renameSync(temp, cache);
  return { file: cache, ext };
}

/* ------------------------------------------------------------------ */
/* job                                                                 */
/* ------------------------------------------------------------------ */

function buatPencatat(job) {
  const baris = [];
  let progres = 0;
  let kotor = false;
  let mengirim = false;

  async function flush(paksa = false) {
    if (mengirim) return;
    if (!kotor && !paksa) return;
    mengirim = true;
    kotor = false;
    try {
      await supabase
        .from("render_jobs")
        .update({
          log: baris.join("").slice(-200_000),
          progress: progres,
        })
        .eq("id", job.id);
    } catch (err) {
      console.error("[worker] gagal memperbarui log:", err.message);
    } finally {
      mengirim = false;
    }
  }

  const timer = setInterval(() => flush(), 2000);

  return {
    catat(teks, persen) {
      const isi = teks.toString().replace(/\s+$/, "");
      if (!isi) return;
      for (const barisBaru of isi.split("\n")) {
        baris.push(`${barisBaru}\n`);
        console.log(`[${job.id.slice(0, 8)}] ${barisBaru}`);
      }
      if (typeof persen === "number") progres = Math.max(progres, Math.min(99, persen));
      kotor = true;
    },
    progres(n) {
      progres = Math.max(progres, Math.min(99, n));
      kotor = true;
    },
    async selesai() {
      clearInterval(timer);
      await flush(true);
    },
    async gagal() {
      clearInterval(timer);
      await flush(true);
    },
  };
}

function susunVideoJson(video, scenes, asetKlip) {
  const kalimat = scenes.map((s, i) => {
    const n = i + 1;
    if (!s.teks || !String(s.teks).trim()) {
      throw new Error(`Scene ${n}: narasi kosong.`);
    }
    const hasil = { teks: String(s.teks).trim() };

    if (s.jenis === "klip") {
      if (!s.klip || !asetKlip.has(s.klip)) {
        throw new Error(`Scene ${n}: footage tidak ditemukan di library.`);
      }
      hasil.klip = s.klip;
    } else {
      const il = (s.ilustrasi ?? []).filter(Boolean);
      if (il.length === 0) throw new Error(`Scene ${n}: ilustrasi belum dipilih.`);
      hasil.ilustrasi = il.length === 1 ? il[0] : il;
    }

    if (s.stiker?.length) hasil.stiker = s.stiker;
    if (s.judul?.length) hasil.judul = s.judul;
    if (s.pink) hasil.pink = s.pink;
    if (s.kata_kunci?.length) hasil.kata_kunci = s.kata_kunci;
    if (s.label?.length) hasil.label = s.label;
    if (s.hitung) hasil.hitung = s.hitung;
    if (typeof s.mulai_media === "number") hasil.mulai_media = s.mulai_media;
    if (typeof s.kecepatan === "number") hasil.kecepatan = s.kecepatan;
    return hasil;
  });

  return {
    judul: video.title,
    vo: "assets/audio/vo.wav",
    ekor: typeof video.tail === "number" ? video.tail : 2.6,
    kalimat,
  };
}

async function ambilFrame(mp4, detik, tujuan) {
  await jalankan("ffmpeg", [
    "-v", "error", "-y",
    "-ss", String(detik),
    "-i", mp4,
    "-frames:v", "1",
    "-vf", "scale=540:-2",
    "-q:v", "3",
    tujuan,
  ]);
}

async function proses(job) {
  const log = buatPencatat(job);
  let folder = null;

  try {
    log.catat(`Job ${job.id}`, 2);
    log.catat(`Worker ${os.hostname()} · ${new Date().toLocaleString("id-ID")}`);

    const { data: video, error: errVideo } = await supabase
      .from("videos")
      .select("*")
      .eq("id", job.video_id)
      .maybeSingle();

    if (errVideo) throw new Error(errVideo.message);
    if (!video) throw new Error("Video tidak ditemukan.");
    if (!Array.isArray(video.scenes) || video.scenes.length === 0) {
      throw new Error("Video belum punya scene.");
    }

    folder = path.join(WORK_DIR, job.id);

    log.catat("Menyiapkan folder project dari _TEMPLATE…", 6);
    fs.mkdirSync(WORK_DIR, { recursive: true });
    if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
    salinTemplate(folder);

    /* ---------- VO ---------- */
    log.catat("Mengunduh VO…", 12);
    if (!video.vo_asset_id) {
      throw new Error("VO belum digenerate. Buat VO di editor sebelum render.");
    }

    const { data: voAsset, error: errVo } = await supabase
      .from("assets")
      .select("*")
      .eq("id", video.vo_asset_id)
      .eq("owner_id", job.owner_id)
      .maybeSingle();

    if (errVo) throw new Error(errVo.message);
    if (!voAsset) throw new Error("File VO tidak ditemukan di library.");

    const extVo = path.extname(voAsset.path) || ".mp3";
    const voMentah = path.join(folder, `assets/audio/vo-asli${extVo}`);
    await unduhAset(voAsset, voMentah);

    log.catat("Menormalkan VO ke 48 kHz mono…", 16);
    await jalankan("ffmpeg", [
      "-v", "error", "-y",
      "-i", voMentah,
      "-ar", "48000",
      "-ac", "1",
      "-c:a", "pcm_s16le",
      path.join(folder, "assets/audio/vo.wav"),
    ]);
    const lamaVo = await durasi(path.join(folder, "assets/audio/vo.wav"));
    log.catat(`VO ${lamaVo.toFixed(2)} dtk`);

    /* ---------- footage ---------- */
    const idsKlip = [
      ...new Set(
        video.scenes
          .filter((s) => s.jenis === "klip" && s.klip)
          .map((s) => s.klip),
      ),
    ];

    const asetKlip = new Map();
    if (idsKlip.length > 0) {
      const { data: klipRows, error: errKlip } = await supabase
        .from("assets")
        .select("*")
        .in("id", idsKlip)
        .eq("owner_id", job.owner_id);

      if (errKlip) throw new Error(errKlip.message);
      for (const row of klipRows ?? []) {
        asetKlip.set(row.id, row);
      }
    }

    let selesai = 0;
    for (const [i, id] of idsKlip.entries()) {
      const asset = asetKlip.get(id);
      if (!asset) throw new Error(`Footage ${id} tidak ada di library.`);
      log.catat(`Mengunduh footage ${i + 1}/${idsKlip.length}: ${asset.name}`, 18 + (i / idsKlip.length) * 10);
      const { file, ext } = await unduhFootage(asset);
      fs.copyFileSync(file, path.join(folder, "footage", `${id}${ext}`));
      selesai += 1;
    }
    log.catat(`${selesai} footage siap`);

    /* ---------- video.json ---------- */
    log.catat("Menulis video.json…", 30);
    const videoJson = susunVideoJson(video, video.scenes, asetKlip);
    fs.writeFileSync(path.join(folder, "video.json"), JSON.stringify(videoJson, null, 2) + "\n");

    /* ---------- buat ---------- */
    log.catat("Menyusun scene HTML…", 36);
    await jalankan("node", ["scripts/buat.mjs", "--no-preview"], {
      cwd: folder,
      onData: (t) => log.catat(t, 38),
    });

    /* ---------- check ---------- */
    log.catat("Menjalankan check…", 44);
    await jalankan("npx", ["--yes", `hyperframes@${HF}`, "check"], {
      cwd: folder,
      onData: (t) => log.catat(t, 46),
    });
    log.catat("Check lolos.");

    /* ---------- render ---------- */
    log.catat("Render MP4 1080×1920 — ini yang paling lama…", 50);
    await jalankan("npx", ["--yes", `hyperframes@${HF}`, "render"], {
      cwd: folder,
      onData: (t) => log.catat(t, 60),
    });

    const folderRender = path.join(folder, "renders");
    const kandidat = fs
      .readdirSync(folderRender)
      .filter((f) => f.toLowerCase().endsWith(".mp4"))
      .map((f) => ({ file: path.join(folderRender, f), mtime: fs.statSync(path.join(folderRender, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    if (kandidat.length === 0) throw new Error("Render selesai tapi tidak ada file MP4.");
    const mp4 = kandidat[0].file;
    const totalDurasi = await durasi(mp4);
    log.catat(`MP4 selesai: ${path.basename(mp4)} · ${totalDurasi.toFixed(1)} dtk`, 82);

    /* ---------- snapshot ---------- */
    log.catat("Mengambil frame pratinjau…", 84);
    const capSnap = path.join(folder, "snap");
    fs.mkdirSync(capSnap, { recursive: true });
    const titik = [1, totalDurasi * 0.3, totalDurasi * 0.6, Math.max(1, totalDurasi - 1.2)];
    const snaps = [];
    for (const [i, t] of titik.entries()) {
      const keluar = path.join(capSnap, `snap-${i + 1}.jpg`);
      try {
        await ambilFrame(mp4, t, keluar);
        if (fs.existsSync(keluar)) snaps.push(keluar);
      } catch (err) {
        log.catat(`Frame ${i + 1} gagal: ${err.message}`);
      }
    }

    /* ---------- upload ---------- */
    log.catat("Mengunggah hasil ke Supabase…", 88);

    const pathRender = `${job.owner_id}/renders/${video.id}/${job.id}.mp4`;
    const blob = await fs.openAsBlob(mp4, { type: "video/mp4" });
    const { error: errUpload } = await supabase.storage
      .from("renders")
      .upload(pathRender, blob, { contentType: "video/mp4", upsert: true });
    if (errUpload) throw new Error(`Upload MP4 gagal: ${errUpload.message}`);

    const pathSnaps = [];
    const snapAssets = [];
    for (const [i, file] of snaps.entries()) {
      const p = `${job.owner_id}/thumbnails/${video.id}/${job.id}-${i + 1}.jpg`;
      const buf = fs.readFileSync(file);
      const { error } = await supabase.storage
        .from("thumbnails")
        .upload(p, buf, { contentType: "image/jpeg", upsert: true });
      if (error) {
        log.catat(`Frame ${i + 1} gagal diunggah: ${error.message}`);
        continue;
      }
      pathSnaps.push(p);
      snapAssets.push({
        owner_id: job.owner_id,
        kind: "thumbnail",
        name: `Frame ${video.title} ${i + 1}.jpg`,
        bucket: "thumbnails",
        path: p,
        size: buf.length,
      });
    }

    // Hapus snapshot lama video ini supaya galeri tidak campur.
    const { data: lama } = await supabase
      .from("assets")
      .select("*")
      .eq("owner_id", job.owner_id)
      .eq("kind", "thumbnail")
      .like("path", `${job.owner_id}/thumbnails/${video.id}/%`);

    const lamaLain = (lama ?? []).filter((a) => !pathSnaps.includes(a.path));
    if (lamaLain.length > 0) {
      await supabase.storage.from("thumbnails").remove(lamaLain.map((a) => a.path));
      await supabase.from("assets").delete().in("id", lamaLain.map((a) => a.id));
    }

    if (snapAssets.length > 0) {
      const { error } = await supabase.from("assets").insert(snapAssets);
      if (error) log.catat(`Catatan snapshot gagal: ${error.message}`);
    }

    const { data: renderAsset, error: errRenderAsset } = await supabase
      .from("assets")
      .insert({
        owner_id: job.owner_id,
        kind: "render",
        name: `${video.title} ${cap()}.mp4`,
        bucket: "renders",
        path: pathRender,
        thumb_path: pathSnaps[0] ?? null,
        size: fs.statSync(mp4).size,
        duration: totalDurasi,
      })
      .select()
      .single();

    if (errRenderAsset) throw new Error(`Catatan render gagal: ${errRenderAsset.message}`);

    const sekarang = new Date().toISOString();
    await supabase
      .from("render_jobs")
      .update({
        status: "selesai",
        progress: 100,
        result_asset_id: renderAsset.id,
        error: null,
        finished_at: sekarang,
      })
      .eq("id", job.id);

    await supabase.from("videos").update({ status: "selesai" }).eq("id", video.id);

    log.progres(100);
    log.catat(`Selesai · ${(renderAsset.size / 1024 / 1024).toFixed(1)} MB`, 100);
    await log.selesai();

    if (!KEEP_FAILED) fs.rmSync(folder, { recursive: true, force: true });
    return true;
  } catch (err) {
    const pesan = err instanceof Error ? err.message : String(err);
    console.error(`[${job.id.slice(0, 8)}] ✖ ${pesan}`);
    log.catat(`\n✖ ${pesan}`);
    await log.gagal();

    await supabase
      .from("render_jobs")
      .update({
        status: "gagal",
        error: pesan.slice(0, 2000),
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    await supabase.from("videos").update({ status: "siap" }).eq("id", job.video_id);

    if (folder && !KEEP_FAILED) fs.rmSync(folder, { recursive: true, force: true });
    if (folder && KEEP_FAILED) console.error(`Folder gagal disimpan: ${rel(folder)}`);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* loop                                                                */
/* ------------------------------------------------------------------ */

let berhenti = false;
process.on("SIGINT", () => {
  console.log("\nMenunggu job selesai, lalu berhenti… (Ctrl+C lagi untuk paksa)");
  if (berhenti) process.exit(1);
  berhenti = true;
});

async function ambilJob() {
  const { data: kandidat, error } = await supabase
    .from("render_jobs")
    .select("*")
    .eq("status", "antre")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!kandidat) return null;

  const { data: diklaim, error: errKlaim } = await supabase
    .from("render_jobs")
    .update({ status: "dikerjakan", started_at: new Date().toISOString(), worker: os.hostname() })
    .eq("id", kandidat.id)
    .eq("status", "antre")
    .select()
    .maybeSingle();

  if (errKlaim) throw new Error(errKlaim.message);
  return diklaim ?? null;
}

async function main() {
  const tools = await cekTools();
  console.log("\n▸ Sedarikini Worker");
  console.log(`  node     ${tools.node ? "✓" : "✖"}`);
  console.log(`  npx      ${tools.npx ? "✓" : "✖"}`);
  console.log(`  ffmpeg   ${tools.ffmpeg ? "✓" : "✖"}`);
  console.log(`  ffprobe  ${tools.ffprobe ? "✓" : "✖"}`);
  console.log(`  template ${TEMPLATE}`);
  console.log(`  kerja    ${WORK_DIR}`);
  console.log(`  supabase ${SUPABASE_URL}`);

  if (!tools.node || !tools.npx || !tools.ffmpeg || !tools.ffprobe) {
    console.error("\n✖ Lengkapi tools di atas sebelum menjalankan worker.\n");
    process.exit(1);
  }

  if (!fs.existsSync(path.join(TEMPLATE, "scripts", "buat.mjs"))) {
    console.error(`\n✖ Template tidak ditemukan di ${TEMPLATE}\n`);
    process.exit(1);
  }

  if (CEK) {
    const { error } = await supabase.from("render_jobs").select("id").limit(1);
    if (error) {
      console.error(`\n✖ Tidak bisa membaca render_jobs: ${error.message}\n`);
      process.exit(1);
    }
    console.log("\n✓ Siap menerima job.\n");
    return;
  }

  fs.mkdirSync(WORK_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  console.log(`\n  menunggu job tiap ${POLL} detik…\n`);

  do {
    let job = null;
    try {
      job = await ambilJob();
    } catch (err) {
      console.error("Gagal mengambil job:", err.message);
    }

    if (job) {
      await proses(job);
      console.log("")
    } else if (SEKALI) {
      console.log("Tidak ada job di antrean.");
      return;
    } else {
      await tidur(POLL * 1000);
    }
  } while (!SEKALI && !berhenti);

  console.log("Worker berhenti.");
}

main().catch((err) => {
  console.error("✖ Worker berhenti:", err);
  process.exit(1);
});
