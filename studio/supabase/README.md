# Supabase

## 1. Buat project

1. Buka <https://supabase.com/dashboard> → **New project**.
2. Region terdekat: **Singapore**.
3. Simpan database password.

## 2. Jalankan migrasi

1. Buka **SQL Editor** → **New query**.
2. Paste seluruh isi `supabase/migrations/0001_init.sql`.
3. Klik **Run**. Semua tabel, RLS, trigger, dan bucket storage dibuat.

## 3. Matikan konfirmasi email (disarankan)

**Authentication → Providers → Email** → matikan **Confirm email**, lalu **Save**.
Kalau dibiarkan aktif, setelah daftar kamu harus klik tautan di email sebelum
bisa masuk. Tautan itu diarahkan ke `/auth/callback` dan tetap berfungsi.

## 4. Salin kunci

**Project Settings → API Keys**:

| Kunci | Dipakai di |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / publishable | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role / secret | `SUPABASE_SERVICE_ROLE_KEY` (hanya worker lokal) |

Jangan pernah menaruh `service_role` di Vercel atau di browser.

## 5. Storage

Bucket dibuat otomatis oleh migrasi:

| Bucket | Isi |
| --- | --- |
| `footage` | klip mentah dari HP |
| `audio` | VO hasil ElevenLabs |
| `renders` | MP4 final |
| `thumbnails` | frame pratinjau dari worker |

Semua privat. Aplikasi memakai signed URL berumur pendek.
