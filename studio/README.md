# Sedarikini Studio

Web app untuk memproduksi video Sedarikini: naskah → VO ElevenLabs → susun scene →
antrean render → MP4 1080×1920. Dibangun dengan Next.js 16, shadcn/ui, dan Supabase.

```
┌─────────────────────────────┐        ┌──────────────────┐
│  Vercel                     │        │  Supabase        │
│  Next.js + shadcn           │◀──────▶│  Postgres + Auth │
│  editor, library, settings  │        │  Storage         │
│  API: VO, asset, render     │        │  RLS per user    │
└──────────────┬──────────────┘        └────────▲─────────┘
               │ render_jobs (antre)            │ MP4 + frame
               ▼                                │
        ┌───────────────────────────────────────┴────┐
        │  Worker lokal (Mac)                        │
        │  _TEMPLATE → buat → check → render → upload│
        └────────────────────────────────────────────┘
```

Vercel tidak bisa menjalankan ffmpeg/HyperFrames atau menyimpan footage besar.
Karena itu render tetap di Mac, lewat worker yang mengambil job dari Supabase.
Semua yang lain (UI, database, auth, generate VO, upload footage) berjalan di Vercel.

## 1. Jalankan lokal

```bash
cd studio
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=            # opsional, bisa diatur di Pengaturan
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

```bash
npm run dev
# buka http://localhost:3000
```

## 2. Siapkan Supabase

1. <https://supabase.com/dashboard> → **New project** (region Singapore).
2. **SQL Editor** → paste `supabase/migrations/0001_init.sql` → **Run**.
3. **Authentication → Providers → Email** → matikan **Confirm email** (disarankan),
   lalu **Save**.
4. **Project Settings → API Keys** → salin URL + anon/publishable key.
5. Buka aplikasi → **Daftar** akun pertama.

Migrasi membuat:

| Tabel | Isi |
| --- | --- |
| `profiles` | email, voice_id, model, voice settings |
| `videos` | judul, naskah, `scenes` jsonb, status |
| `assets` | footage, VO, MP4, thumbnail |
| `render_jobs` | antrean render + progress + log |

Bucket storage: `footage`, `audio`, `renders`, `thumbnails` — semuanya privat,
diakses lewat signed URL. RLS membatasi setiap user ke folder `/{user_id}/...`.

Detail: `supabase/README.md`.

## 3. Jalankan worker render

Di terminal terpisah:

```bash
cd worker
npm install
cp .env.example .env
```

Isi `worker/.env`:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # secret, jangan dipakai di Vercel
```

```bash
npm run cek      # cek ffmpeg, npx, koneksi Supabase
npm start        # jalan terus, ambil job tiap 5 detik
npm run sekali   # proses satu job lalu keluar
```

Worker memakai `_TEMPLATE` di folder induk dan menyimpan project sementara di
`_RENDER/<job-id>`. Footage di-cache di `_RENDER/.cache` supaya render ulang
tidak mengunduh berkas yang sama.

## 4. Deploy ke Vercel

1. Push folder ini ke GitHub (repo boleh berisi `studio/`, `worker/`, `_TEMPLATE/`).
2. <https://vercel.com/new> → import repo.
3. **Root Directory**: `studio`.
4. Framework otomatis **Next.js**. Build command `npm run build`.
5. **Environment Variables** (Production + Preview):

   | Nama | Nilai |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL project |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key |
   | `ELEVENLABS_API_KEY` | API key ElevenLabs |
   | `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` |

6. Deploy.
7. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://nama-app.vercel.app`
   - **Redirect URLs**: `https://nama-app.vercel.app/**`
8. Buka domain Vercel → daftar/masuk.

> Jangan menaruh `SUPABASE_SERVICE_ROLE_KEY` di Vercel. Kunci itu hanya untuk
> worker lokal.

## 5. Alur pemakaian

1. **Footage** → unggah klip (langsung dari browser ke Supabase, tidak lewat Vercel).
2. **Video baru** → beri judul.
3. Tulis naskah utuh di panel **Naskah & suara**.
4. **Generate VO** (ElevenLabs) atau **Unggah VO**.
5. **Pecah naskah** → satu kalimat jadi satu scene.
6. Per scene: pilih footage/ilustrasi, isi judul, kata pink, kata kunci caption.
7. Panel **Pemeriksaan** harus 0 error.
8. **Render** → worker lokal mengambil job → MP4 muncul di panel render.
9. Putar/unduh hasil. Frame pratinjau tersimpan untuk kartu video.

Pratinjau di kanan adalah perkiraan CSS dari gaya final (judul Instrument Serif
italic, pill caption, logo). Hasil pasti tetap dari render HyperFrames.

## 6. Yang perlu diketahui

- **Render hanya di Mac.** Kalau worker mati, job tetap `antre` dan diproses saat
  worker hidup lagi.
- **Satu job sekaligus** supaya laptop tidak kepanasan.
- **Supabase Free = 1 GB.** Footage 4K cepat memenuhi kuota. Kompres klip ke
  1080p sebelum upload, atau hapus render lama setelah diunduh.
- **ElevenLabs** butuh plan **Starter** ($6/bln) untuk lisensi komersial dan voice
  cloning. Free plan tidak boleh untuk konten promosi.
- **VO disimpan sebagai MP3** di Supabase; worker menormalkannya ke 48 kHz mono
  WAV sebelum render.
- **Tidak ada upload lewat Vercel**, jadi batas body 4,5 MB tidak berlaku.
- **Auth**: email + password, atau tautan masuk. Kalau konfirmasi email aktif,
  tautan diarahkan ke `/auth/callback`.

## 7. Struktur

```
studio/
  src/app/(app)/videos        dashboard + editor
  src/app/(app)/library       upload & pilih footage
  src/app/(app)/settings      voice clone + karakter suara
  src/app/api/vo              generate VO ElevenLabs
  src/app/api/render          antrean render
  src/app/api/assets          registrasi asset
  src/components/editor/      editor scene, preview, panel render
  src/lib/                    Supabase client, validasi, tipe
  supabase/migrations/        skema + RLS + storage
worker/
  index.mjs                   loop render lokal
  .env.example
```

## 8. Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| Login terus balik ke halaman masuk | `NEXT_PUBLIC_*` salah, atau Site URL Supabase belum diisi domain Vercel. |
| Generate VO 503 | `ELEVENLABS_API_KEY` belum ada di environment. Restart dev server setelah mengubah `.env.local`. |
| Generate VO 422 | Voice ID tidak valid. Pilih ulang di **Pengaturan**. |
| Job tetap `antre` | Worker belum jalan / service key salah. Cek `npm run cek`. |
| Job gagal di check | Buka log worker, biasanya ada scene tanpa footage atau judul `{angka}` tanpa angka berjalan. |
| Thumbnail tidak muncul | Browser tidak bisa decode codec (mis. HEVC di Chrome). Render tetap jalan; thumbnail bisa kosong. |
| Upload footage gagal di tengah | File besar terputus. Ulangi; gunakan klip 1080p yang lebih kecil. |

## 9. Perintah

```bash
npm run dev      # pengembangan
npm run build    # produksi
npm run lint     # eslint
```

Worker:

```bash
npm run cek
npm start
npm run sekali
```
