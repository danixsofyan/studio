#!/usr/bin/env node
/* Mesin video Jalur B.
   Baca video.json → normalkan footage → hitung waktu → tulis scene HTML.

   Pakai:
     npm run buat              (buat + buka preview)
     npm run buat -- --no-preview
*/

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ILUSTRASI, daftarIlustrasi } from "./lib/ilustrasi.mjs";
import {
  cariSumber,
  daftarFootage,
  durasiAudio,
  normalisasiFootage,
  slugify,
} from "./lib/media.mjs";
import {
  bagiJudul,
  bagiKalimat,
  bulat,
  pecahCaption,
} from "./lib/waktu.mjs";
import {
  captionsHtml,
  indexHtml,
  sceneHtml,
  watermarkHtml,
} from "./lib/html.mjs";

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE_VIDEO = path.join(AKAR, "video.json");
const FOLDER_FOOTAGE = path.join(AKAR, "footage");
const FOLDER_NORMAL = path.join(AKAR, "assets", "footage");
const FOLDER_SCENE = path.join(AKAR, "compositions");

const argumen = new Set(process.argv.slice(2));
const bukaPreview = !argumen.has("--no-preview");

function gagal(pesan) {
  console.error(`\n✖ ${pesan}\n`);
  process.exit(1);
}

function bacaJson(file) {
  if (!fs.existsSync(file)) {
    gagal(`File tidak ditemukan: ${path.relative(AKAR, file)}`);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    gagal(`video.json tidak valid: ${err.message}`);
  }
}

function angka(n, bawaan) {
  return typeof n === "number" && Number.isFinite(n) ? n : bawaan;
}

function teks(n, bawaan = "") {
  return typeof n === "string" && n.trim() ? n.trim() : bawaan;
}

function array(n) {
  return Array.isArray(n) ? n : [];
}

function relatif(file) {
  return path.relative(AKAR, file).split(path.sep).join("/");
}

function validasi(video) {
  if (!Array.isArray(video.kalimat) || video.kalimat.length === 0) {
    gagal('video.json belum punya daftar "kalimat". Isi minimal satu kalimat.');
  }

  video.kalimat.forEach((k, i) => {
    const nomor = i + 1;
    if (!teks(k.teks)) gagal(`Kalimat ke-${nomor}: "teks" kosong.`);
    const adaKlip = Boolean(teks(k.klip));
    const adaIlustrasi =
      Array.isArray(k.ilustrasi) ? k.ilustrasi.length > 0 : Boolean(teks(k.ilustrasi));
    if (adaKlip === adaIlustrasi) {
      gagal(
        `Kalimat ke-${nomor}: isi salah satu — "klip" untuk footage, atau "ilustrasi" untuk scene krem.`,
      );
    }
    if (adaKlip && array(k.stiker).length === 0 && !teks(k.judul)) {
      // footage tanpa judul masih boleh; ini cuma pengingat, bukan error
    }
    const kunci = Array.isArray(k.ilustrasi) ? k.ilustrasi : [k.ilustrasi].filter(Boolean);
    kunci.forEach((nama) => {
      if (!ILUSTRASI[nama]) {
        gagal(
          `Kalimat ke-${nomor}: ilustrasi "${nama}" tidak ada.\n` +
            `Pilihan: ${daftarIlustrasi().map((x) => x.kunci).join(", ")}`,
        );
      }
    });
    array(k.stiker).forEach((nama) => {
      if (!ILUSTRASI[nama]) {
        gagal(
          `Kalimat ke-${nomor}: stiker "${nama}" tidak ada.\n` +
            `Pilihan: ${daftarIlustrasi().map((x) => x.kunci).join(", ")}`,
        );
      }
    });
    if (k.hitung) {
      if (typeof k.hitung.ke !== "number") {
        gagal(`Kalimat ke-${nomor}: "hitung.ke" harus angka.`);
      }
      const judul = Array.isArray(k.judul) ? k.judul : [];
      const adaSlot = judul.some(
        (j) => typeof j === "string" && j.includes("{angka}"),
      ) || judul.some((j) => j && typeof j.teks === "string" && j.teks.includes("{angka}"));
      if (!adaSlot) {
        gagal(
          `Kalimat ke-${nomor}: pakai "hitung" tapi tidak ada "{angka}" di salah satu judul.`,
        );
      }
    }
  });
}

function siapkanKalimat(kalimat) {
  return kalimat.map((k) => {
    if (teks(k.klip)) {
      const nama = teks(k.klip);
      const sumber = cariSumber(FOLDER_FOOTAGE, nama);
      const hasil = normalisasiFootage(
        sumber,
        FOLDER_NORMAL,
        nama,
        (pesan) => console.log(pesan),
      );
      return {
        ...k,
        jenis: "footage",
        media: {
          file: relatif(hasil.file),
          mulai: angka(k.mulai_media, 0),
          kecepatan: angka(k.kecepatan, 1),
          zoom: angka(k.zoom, 1.08),
          durasiSumber: hasil.durasi,
        },
      };
    }

    const kunci = Array.isArray(k.ilustrasi) ? k.ilustrasi : [teks(k.ilustrasi)];
    return {
      ...k,
      jenis: "ilustrasi",
      kunciIlustrasi: kunci,
      media: null,
    };
  });
}

function tulis(file, isi) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, isi);
}

function hapusSceneLama() {
  if (!fs.existsSync(FOLDER_SCENE)) return;
  for (const nama of fs.readdirSync(FOLDER_SCENE)) {
    if (/^s\d+\.html$/.test(nama) || nama === "captions.html" || nama === "watermark.html") {
      fs.unlinkSync(path.join(FOLDER_SCENE, nama));
    }
  }
}

function main() {
  const video = bacaJson(FILE_VIDEO);
  validasi(video);

  const judulVideo = teks(video.judul, "video-baru");
  const jalurVo = path.resolve(AKAR, teks(video.vo, "assets/audio/vo.wav"));
  if (!fs.existsSync(jalurVo)) {
    gagal(
      `VO tidak ditemukan: ${relatif(jalurVo)}\n` +
        `Letakkan file suara di assets/audio/ lalu isi "vo" di video.json.`,
    );
  }
  const durasiVo = durasiAudio(jalurVo);
  const ekor = Math.max(0, angka(video.ekor, 2.6));

  console.log(`\n▸ ${judulVideo}`);
  console.log(`  VO ${bulat(durasiVo)} dtk · ekor ${bulat(ekor)} dtk`);
  console.log(`  footage tersedia: ${daftarFootage(FOLDER_FOOTAGE).length} file`);

  if (daftarFootage(FOLDER_FOOTAGE).length === 0 && video.kalimat.some((k) => k.klip)) {
    gagal("Belum ada file di footage/, padahal video.json memakai klip.");
  }

  const kalimat = siapkanKalimat(video.kalimat);
  const bertime = bagiKalimat(kalimat, durasiVo);

  hapusSceneLama();
  const semuaGrupCaption = [];
  const adegan = bertime.map((k, i) => {
    const id = `s${i + 1}`;
    const terakhir = i === bertime.length - 1;
    const durasiSuara = k.durasi;
    const durasi = terakhir ? bulat(k.durasi + ekor) : bulat(k.durasi);
    const judul = bagiJudul(array(k.judul), durasiSuara);
    const grup = pecahCaption(
      k.teks,
      k.mulai,
      k.durasi,
      array(k.kata_kunci),
    );
    semuaGrupCaption.push(...grup);

    const ilustrasi = array(k.kunciIlustrasi).flatMap(
      (nama) => ILUSTRASI[nama].layers(),
    );
    const stiker = array(k.stiker).flatMap((nama) => ILUSTRASI[nama].layers());

    const html = sceneHtml({
      id,
      durasi,
      durasiSuara,
      latar: k.jenis,
      media: k.media,
      ilustrasi,
      stiker,
      judul,
      hitung: k.hitung ?? null,
      label: array(k.label),
      pink: teks(k.pink, null),
      index: i,
    });
    tulis(path.join(FOLDER_SCENE, `${id}.html`), html);

    return {
      id,
      mulai: bulat(k.mulai),
      durasi,
      latar: k.jenis,
      teks: k.teks,
    };
  });

  // watermark: putih di atas footage, warna asli logo di scene krem
  const pergantian = [];
  let modeTerakhir = null;
  adegan.forEach((s) => {
    const mode = s.latar === "ilustrasi" ? "gelap" : "terang";
    if (mode !== modeTerakhir) {
      pergantian.push({ waktu: s.mulai, mode });
      modeTerakhir = mode;
    }
  });

  const total = bulat(durasiVo + ekor);
  tulis(
    path.join(FOLDER_SCENE, "captions.html"),
    captionsHtml(semuaGrupCaption, bulat(durasiVo)),
  );
  tulis(
    path.join(FOLDER_SCENE, "watermark.html"),
    watermarkHtml(pergantian, total),
  );
  tulis(
    path.join(AKAR, "index.html"),
    indexHtml({
      adegan,
      total,
      durasiVo: bulat(durasiVo),
      audio: relatif(jalurVo),
    }),
  );
  tulis(
    path.join(AKAR, "meta.json"),
    JSON.stringify(
      {
        id: slugify(judulVideo),
        name: judulVideo,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`\n  ${adegan.length} scene · total ${total} dtk`);
  adegan.forEach((s) => {
    const jenis = s.latar === "ilustrasi" ? "krem" : "footage";
    console.log(
      `   ${s.id.padEnd(4)} ${String(s.mulai).padStart(6)}s  ${String(s.durasi).padStart(5)}s  ${jenis.padEnd(8)} ${s.teks.slice(0, 46)}`,
    );
  });
  console.log(`\n✓ compositions/ + index.html diperbarui`);
  console.log(`  Cek:    npm run check`);
  console.log(`  Render: npm run render`);

  if (bukaPreview) {
    console.log(`\n▸ Membuka preview…`);
    const hasil = spawnSync(
      "npx",
      ["--yes", "hyperframes@0.8.186", "preview", "--background"],
      { cwd: AKAR, stdio: "inherit", timeout: 120000 },
    );
    if (hasil.status !== 0) {
      console.log(
        "  Preview tidak bisa dibuka otomatis. Jalankan manual: npm run dev",
      );
    }
  } else {
    console.log(`  Preview: npm run dev`);
  }
}

main();
