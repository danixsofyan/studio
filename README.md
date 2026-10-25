# Sedarikini Studio

Ruang produksi video Sedarikini: **naskah → VO ElevenLabs → susun scene →
render MP4 1080×1920**. Web app berjalan di Vercel, data dan auth di Supabase,
sedangkan render tetap di Mac lewat worker lokal.

## Isi repo

| Folder | Fungsi |
| --- | --- |
| `studio/` | Next.js 16 + shadcn/ui + Supabase. Ini yang di-deploy ke Vercel. |
| `worker/` | Worker render lokal (ffmpeg + HyperFrames). Tidak di-deploy. |
| `_TEMPLATE/` | Engine HyperFrames dan contoh `video.json`. |
| `_FOOTAGE/` | Library klip mentah (tidak ikut di-commit). |
| `ALUR-KERJA.md` | Alur produksi harian dan biaya. |
| `PANDUAN-VIDEO.md` | Panduan gaya dan aturan video. |

## Mulai cepat

```bash
cd studio
npm install
cp .env.example .env.local     # isi Supabase URL + anon/publishable key
npm run dev
```

Buka `http://localhost:3000`, daftar akun, lalu mulai dari menu **Footage** dan
**Video baru**.

## Deploy

1. Import repo ini ke Vercel.
2. **Root Directory** = `studio`.
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_MODEL_ID` (`eleven_multilingual_v2`)
4. Deploy, lalu isi **Site URL** dan **Redirect URLs** di Supabase Auth.

Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di Vercel. Kunci itu hanya
untuk `worker/.env` di Mac.

## Worker render

```bash
cd worker
npm install
cp .env.example .env           # isi URL + service role key
npm run cek
npm start
```

Worker mengambil job dari tabel `render_jobs`, menyiapkan project dari
`_TEMPLATE`, menjalankan `buat → check → render`, lalu mengunggah MP4 dan frame
pratinjau ke Supabase Storage.

Detail lengkap: [`studio/README.md`](studio/README.md),
[`studio/supabase/README.md`](studio/supabase/README.md), dan
[`ALUR-KERJA.md`](ALUR-KERJA.md).
