#!/usr/bin/env node
/* Membuat folder video baru dari template ini.

   Pakai:
     npm run baru -- "2026-11 Clodi"

   Hasil: folder saudara (di samping _TEMPLATE) berisi template bersih:
   scripts, assets (font/logo), footage kosong, compositions kosong.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "./lib/media.mjs";

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDUK = path.dirname(AKAR);
const nama = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!nama || !nama.trim()) {
  console.error(`
✖ Nama video belum diisi.

  Pakai: npm run baru -- "2026-11 Clodi"
`);
  process.exit(1);
}

const judul = nama.trim();
const tujuan = path.join(INDUK, judul);

if (fs.existsSync(tujuan)) {
  console.error(`\n✖ Folder sudah ada: ${tujuan}\n  Pilih nama lain.\n`);
  process.exit(1);
}

const lewati = (src) => {
  const rel = path.relative(AKAR, src);
  const bagian = rel.split(path.sep);
  if (bagian[0] === ".hyperframes" || bagian[0] === "node_modules") return false;
  if (rel === "index.html" || rel === "video.json") return false;
  if (bagian[0] === "renders" && bagian.length > 1) return false;
  if (bagian[0] === "compositions" && bagian.length > 1) return false;
  if (bagian[0] === "assets" && ["footage", "audio"].includes(bagian[1]) && bagian.length > 2) {
    return false;
  }
  return true;
};

fs.cpSync(AKAR, tujuan, { recursive: true, filter: lewati });

for (const folder of [
  "footage",
  "compositions",
  "renders",
  "assets/audio",
  "assets/footage",
]) {
  fs.mkdirSync(path.join(tujuan, folder), { recursive: true });
}

fs.writeFileSync(
  path.join(tujuan, "meta.json"),
  JSON.stringify(
    { id: slugify(judul), name: judul, createdAt: new Date().toISOString() },
    null,
    2,
  ) + "\n",
);

fs.writeFileSync(
  path.join(tujuan, "video.json"),
  JSON.stringify(
    {
      judul,
      vo: "assets/audio/vo.wav",
      ekor: 2.6,
      kalimat: [],
    },
    null,
    2,
  ) + "\n",
);

console.log(`
✓ Folder dibuat: ${tujuan}

  Langkah berikutnya:
    1. taruh VO di   assets/audio/vo.wav   (atau: npm run vo)
    2. taruh klip di footage/
    3. isi video.json  (bentuknya lihat video.contoh.json)
    4. npm run buat && npm run check
`);
