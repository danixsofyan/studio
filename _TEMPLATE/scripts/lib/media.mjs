/* Menemukan footage dan menormalkannya ke 1080x1920, 30 fps, SDR, H.264.
   Hasil normal disimpan di assets/footage/<slug>.mp4 supaya render cepat
   dan tidak mengubah file asli di footage/. */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function slugify(teks) {
  return String(teks)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bacaMedia(file) {
  const keluar = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-print_format", "json",
      "-show_streams",
      "-show_format",
      file,
    ],
    { encoding: "utf8" },
  );
  const data = JSON.parse(keluar);
  const video = data.streams.find((s) => s.codec_type === "video");
  const audio = data.streams.find((s) => s.codec_type === "audio");
  const rotasi =
    video?.side_data_list?.find((s) => typeof s.rotation === "number")
      ?.rotation ??
    Number(video?.tags?.rotate ?? 0);

  return {
    durasi: Number(data.format?.duration ?? 0),
    video: video ?? null,
    adaAudio: Boolean(audio),
    rotasi: Number(rotasi) || 0,
    transfer: video?.color_transfer ?? "",
    primaria: video?.color_primaries ?? "",
    piksel: video?.pix_fmt ?? "",
    lebar: Number(video?.width ?? 0),
    tinggi: Number(video?.height ?? 0),
    kodek: video?.codec_name ?? "",
  };
}

export function durasiAudio(file) {
  const info = bacaMedia(file);
  if (!info.durasi || Number.isNaN(info.durasi)) {
    throw new Error(`Durasi audio tidak terbaca: ${file}`);
  }
  return info.durasi;
}

const EKSTENSI = new Set([
  ".mov", ".mp4", ".m4v", ".avi", ".mkv", ".webm", ".mts", ".m2ts",
]);

export function daftarFootage(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => !f.startsWith(".") && EKSTENSI.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "id"));
}

export function cariSumber(folder, nama) {
  const files = daftarFootage(folder);
  const target = slugify(nama);

  const persis = files.find((f) => path.parse(f).name === nama);
  if (persis) return path.join(folder, persis);

  const viaSlug = files.find((f) => slugify(path.parse(f).name) === target);
  if (viaSlug) return path.join(folder, viaSlug);

  throw new Error(
    `Footage "${nama}" tidak ditemukan di ${folder}.\n` +
      `File yang ada: ${files.length ? files.join(", ") : "(kosong)"}`,
  );
}

function filterHdr() {
  return [
    "zscale=t=linear:npl=100",
    "format=gbrpf32le",
    "zscale=p=bt709",
    "tonemap=tonemap=hable:desat=0",
    "zscale=t=bt709:m=bt709:r=tv",
    "format=yuv420p",
  ].join(",");
}

function filterUkuran() {
  return [
    "scale=1080:1920:force_original_aspect_ratio=increase",
    "crop=1080:1920",
    "fps=30",
    "format=yuv420p",
    "setsar=1",
  ].join(",");
}

/* Kembalikan path clip normal + durasinya. Konversi hanya bila perlu. */
export function normalisasiFootage(sumber, folderTujuan, nama, log = () => {}) {
  fs.mkdirSync(folderTujuan, { recursive: true });
  const slug = slugify(nama);
  const tujuan = path.join(folderTujuan, `${slug}.mp4`);

  const sudahAda =
    fs.existsSync(tujuan) &&
    fs.statSync(tujuan).mtimeMs >= fs.statSync(sumber).mtimeMs;

  if (sudahAda) {
    return { file: tujuan, durasi: bacaMedia(tujuan).durasi, baru: false };
  }

  const info = bacaMedia(sumber);
  const hdr =
    ["arib-std-b67", "smpte2084"].includes(info.transfer.toLowerCase()) ||
    info.primaria.toLowerCase() === "bt2020";

  const rantai = hdr
    ? `${filterHdr()},${filterUkuran()}`
    : filterUkuran();

  log(
    `  konversi ${path.basename(sumber)} (${info.lebar}x${info.tinggi}` +
      `${hdr ? ", HDR→SDR" : ""}) → ${path.basename(tujuan)}`,
  );

  execFileSync(
    "ffmpeg",
    [
      "-v", "error",
      "-y",
      "-i", sumber,
      "-vf", rantai,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      tujuan,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const hasil = bacaMedia(tujuan);
  if (!hasil.durasi || Number.isNaN(hasil.durasi)) {
    throw new Error(`Konversi gagal: ${tujuan}`);
  }

  return { file: tujuan, durasi: hasil.durasi, baru: true };
}
