#!/usr/bin/env node
/* Membuat VO dari script.txt lewat ElevenLabs API, langsung ke assets/audio/vo.wav.

   Sekali setup:
     1. Plan ElevenLabs Starter (atau lebih tinggi) — wajib untuk lisensi komersial.
     2. Simpan API key di ~/.config/sedarikini/elevenlabs.key
     3. Isi voice_id di ~/.config/sedarikini/config.json

   Pakai:
     npm run vo -- --daftar          lihat daftar suara + voice_id
     npm run vo                      baca script.txt, tulis assets/audio/vo.wav
     npm run vo -- --file lain.txt
     npm run vo -- --teks "Satu kalimat pendek."
     npm run vo -- --cek             cek key + suara tanpa generate
*/

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { durasiAudio } from "./lib/media.mjs";

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_DIR = path.join(os.homedir(), ".config", "sedarikini");
const KEY_FILE = path.join(CONFIG_DIR, "elevenlabs.key");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const API = "https://api.elevenlabs.io/v1";

const BAWAAN = {
  voice_id: "",
  model_id: "eleven_multilingual_v2",
  output_format: "mp3_44100_128",
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.25,
    use_speaker_boost: true,
  },
};

function gagal(pesan) {
  console.error(`\n✖ ${pesan}\n`);
  process.exit(1);
}

function arg(nama, bawaan = null) {
  const i = process.argv.indexOf(nama);
  if (i === -1) return bawaan;
  const nilai = process.argv[i + 1];
  if (!nilai || nilai.startsWith("--")) return bawaan;
  return nilai;
}

function bendera(nama) {
  return process.argv.includes(nama);
}

function siapkanConfig() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(BAWAAN, null, 2) + "\n");
    fs.chmodSync(CONFIG_FILE, 0o600);
    console.log(`  dibuat: ${CONFIG_FILE}`);
  }
  if (!fs.existsSync(KEY_FILE)) {
    fs.writeFileSync(
      KEY_FILE,
      "# Tempel API key ElevenLabs di baris berikutnya, lalu simpan.\n" +
        "# Ambil dari https://elevenlabs.io/app/settings/api-keys\n" +
        "# Jangan taruh file ini di folder project atau Google Drive.\n" +
        "sk_\n",
    );
    fs.chmodSync(KEY_FILE, 0o600);
    console.log(`  dibuat: ${KEY_FILE}`);
  }
}

function bacaKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  if (!fs.existsSync(KEY_FILE)) {
    gagal(
      `API key belum ada di ${KEY_FILE}\n` +
        `Jalankan sekali: npm run vo -- --daftar (file contoh akan dibuat), lalu isi key-nya.`,
    );
  }
  const isi = fs
    .readFileSync(KEY_FILE, "utf8")
    .split("\n")
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith("#"))
    .join("");
  if (!isi || !isi.startsWith("sk_") || isi.length < 20) {
    gagal(
      `API key belum diisi dengan benar di ${KEY_FILE}\n` +
        `Baris yang aktif harus diawali "sk_".`,
    );
  }
  return isi;
}

function bacaConfig() {
  siapkanConfig();
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  } catch (err) {
    gagal(`config.json tidak valid: ${err.message}`);
  }
  return { ...BAWAAN, ...data, voice_settings: { ...BAWAAN.voice_settings, ...(data.voice_settings || {}) } };
}

async function panggil(jalur, opsi = {}) {
  const key = bacaKey();
  const res = await fetch(`${API}${jalur}`, {
    ...opsi,
    headers: {
      "xi-api-key": key,
      ...(opsi.headers || {}),
    },
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    let pesan = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      pesan = data.detail?.message ?? data.detail ?? data.message ?? pesan;
    } catch {
      const teks = await res.text().catch(() => "");
      if (teks) pesan = teks.slice(0, 300);
    }
    const saran =
      res.status === 401
        ? "API key salah atau sudah dicabut."
        : res.status === 402 || res.status === 403
          ? "Kredit habis, atau plan tidak mendukung fitur ini (perlu Starter untuk komersial/cloning)."
          : res.status === 422
            ? "Voice ID atau parameter tidak valid. Coba: npm run vo -- --daftar"
            : res.status === 429
              ? "Terlalu banyak permintaan. Tunggu sebentar lalu ulangi."
              : "";
    gagal(`${pesan}${saran ? `\n${saran}` : ""}`);
  }
  return res;
}

async function daftarSuara() {
  const res = await panggil("/voices");
  const data = await res.json();
  const suara = data.voices ?? [];
  if (suara.length === 0) {
    gagal("Akun ini belum punya suara. Buat clone dulu di elevenlabs.io.");
  }
  console.log(`\n▸ ${suara.length} suara tersedia\n`);
  for (const v of suara) {
    const kategori = v.category ?? "-";
    const bahasa = v.labels?.language ?? v.labels?.accent ?? "";
    const klon = kategori.toLowerCase().includes("clon") ? " ← clone" : "";
    console.log(`  ${v.voice_id}  ${v.name}`);
    console.log(`      ${kategori}${bahasa ? ` · ${bahasa}` : ""}${klon}`);
  }
  console.log(
    `\n  Salin voice_id pilihan ke ${CONFIG_FILE}\n  Contoh: { "voice_id": "xxxxxxxx" }\n`,
  );
}

function bacaTeks(config) {
  const langsung = arg("--teks");
  if (langsung) return langsung.trim();

  const file = path.resolve(AKAR, arg("--file", "script.txt"));
  if (!fs.existsSync(file)) {
    gagal(
      `Script tidak ditemukan: ${path.relative(AKAR, file)}\n` +
        `Buat script.txt berisi teks yang akan dibacakan, atau pakai --teks "..."`,
    );
  }
  const teks = fs
    .readFileSync(file, "utf8")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!teks) gagal("script.txt kosong.");
  return teks;
}

function cadangkanVo(tujuan) {
  if (!fs.existsSync(tujuan)) return;
  const folder = path.join(path.dirname(tujuan), "riwayat");
  fs.mkdirSync(folder, { recursive: true });
  const cap = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "-");
  const simpan = path.join(folder, `vo-${cap}.wav`);
  fs.renameSync(tujuan, simpan);
  console.log(`  VO lama disimpan: ${path.relative(AKAR, simpan)}`);
}

async function buatVo(config) {
  if (!config.voice_id) {
    gagal(
      `voice_id belum diisi di ${CONFIG_FILE}\n` +
        `Jalankan: npm run vo -- --daftar  lalu salin voice_id suara kamu.`,
    );
  }
  const teks = bacaTeks(config);
  const karakter = [...teks].length;
  if (karakter > 4800) {
    gagal(
      `Script terlalu panjang: ${karakter} karakter (batas satu request 5000).\n` +
        `Pecah jadi dua bagian atau ringkas script.`,
    );
  }

  const tujuan = path.resolve(AKAR, arg("--out", "assets/audio/vo.wav"));
  const sementara = path.join(AKAR, ".vo-sementara.mp3");

  console.log(`\n▸ ElevenLabs · ${config.model_id}`);
  console.log(`  ${karakter} karakter · voice ${config.voice_id.slice(0, 8)}…`);
  console.log(`  menunggu audio…`);

  const res = await panggil(
    `/text-to-speech/${config.voice_id}?output_format=${config.output_format}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: teks,
        model_id: config.model_id,
        voice_settings: config.voice_settings,
      }),
    },
  );

  const audio = Buffer.from(await res.arrayBuffer());
  if (audio.length < 1000) gagal("Audio yang diterima kosong.");
  fs.writeFileSync(sementara, audio);

  fs.mkdirSync(path.dirname(tujuan), { recursive: true });
  cadangkanVo(tujuan);

  try {
    execFileSync(
      "ffmpeg",
      [
        "-v", "error", "-y",
        "-i", sementara,
        "-ar", "48000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        tujuan,
      ],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
  } finally {
    fs.rmSync(sementara, { force: true });
  }

  const durasi = durasiAudio(tujuan);
  console.log(`\n✓ ${path.relative(AKAR, tujuan)}`);
  console.log(`  ${durasi.toFixed(2)} dtk · 48 kHz mono`);
  console.log(`  perkiraan kredit terpakai: ${karakter}`);
  console.log(`\n  Berikutnya: lengkapi video.json lalu npm run buat\n`);
}

async function cek(config) {
  console.log(`\n▸ Konfigurasi`);
  console.log(`  key:  ${KEY_FILE}`);
  console.log(`  config: ${CONFIG_FILE}`);
  console.log(`  model: ${config.model_id}`);
  console.log(`  voice: ${config.voice_id || "(belum diisi)"}`);

  bacaKey();

  if (!config.voice_id) {
    console.log(`\n  Isi voice_id dulu. Jalankan: npm run vo -- --daftar\n`);
    return;
  }

  const res = await panggil(`/voices/${config.voice_id}`);
  const v = await res.json();
  console.log(`  nama:  ${v.name ?? "?"}`);
  console.log(`  tipe:  ${v.category ?? "?"}`);
  console.log(`\n✓ Siap. Jalankan: npm run vo\n`);
}

const config = bacaConfig();

if (bendera("--daftar")) {
  await daftarSuara();
} else if (bendera("--cek")) {
  await cek(config);
} else {
  await buatVo(config);
}
