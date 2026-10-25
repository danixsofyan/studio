# Sedarikini — Template Video (Jalur B)

Mesin video Sedarikini. Isi satu file (`video.json`), jalankan satu perintah,
keluar MP4 1080×1920 yang gayanya sama dengan video Menspad.

## Mulai cepat

```bash
cd _TEMPLATE

# 1. buat folder video baru (di samping _TEMPLATE)
npm run baru -- "2026-11 Clodi"
cd "../2026-11 Clodi"

# 2. taruh bahan
#    assets/audio/vo.wav   ← VO (atau generate: npm run vo)
#    footage/*.MOV         ← klip dari HP, nama huruf kecil

# 3. isi video.json
#    bentuk/kolomnya lihat video.contoh.json (jangan salin isinya)

# 4. susun + cek + render
npm run buat      # bikin scene, buka preview
npm run check     # harus 0 error
npm run render    # MP4 ke renders/
```

## VO otomatis (ElevenLabs)

Sekali setup, lalu tiap video cukup menulis `script.txt`:

```bash
npm run vo -- --daftar   # lihat voice_id suara clone kamu
npm run vo -- --cek      # cek key + suara
npm run vo               # script.txt -> assets/audio/vo.wav
```

API key disimpan di `~/.config/sedarikini/elevenlabs.key`, **bukan** di folder
project. Plan Free tidak boleh dipakai untuk konten komersial; pakai Starter.
VO lama otomatis dicadangkan ke `assets/audio/riwayat/`.

## Isi folder

| Path | Isi | Boleh diedit? |
| --- | --- | --- |
| `video.json` | isi video: teks, klip, ilustrasi | **ya, satu-satunya** |
| `video.contoh.json` | contoh lengkap + daftar ilustrasi | ya (referensi) |
| `footage/` | klip asli dari HP | ya (taruh file) |
| `assets/audio/` | VO | ya (taruh file) |
| `compositions/` | scene, caption, watermark | tidak (dibuat ulang) |
| `index.html` | panggung utama | tidak (dibuat ulang) |
| `assets/footage/` | klip normal 1080×1920 SDR | tidak (dibuat ulang) |
| `scripts/` | mesin `buat` | hanya kalau perlu |

## Aturan singkat

- Satu kalimat di `video.json` = satu scene, urutannya harus sama dengan VO.
- Tiap scene pilih **satu**: `klip` (footage) atau `ilustrasi` (latar krem).
- `stiker` menempelkan ilustrasi di atas footage.
- Durasi scene dihitung otomatis dari panjang VO dan jumlah kata.
- Judul besar: serif miring bercahaya, satu kata pink.
- Caption: pill gelap di bawah, kata kunci kuning.
- Logo di `top: 205px` (putih di atas footage, warna asli di latar krem), tanpa kotak.

Detail skema lengkap ada di `AGENTS.md` (atau `CLAUDE.md`).

## Kalau bermasalah

| Gejala | Perbaikan |
| --- | --- |
| `VO tidak ditemukan` | taruh di `assets/audio/`, samakan `vo` |
| `Footage ... tidak ditemukan` | samakan nama dengan file di `footage/` |
| `ilustrasi ... tidak ada` | pakai kunci dari tabel di `AGENTS.md` |
| Caption tidak sinkron | `teks` harus persis VO; VO baru → `npm run buat` ulang |
| Hasil gelap | klip HDR; hapus `assets/footage/<nama>.mp4`, `npm run buat` ulang |
| Preview tidak terbuka | `npm run dev` |

Butuh ilustrasi yang belum ada? Jangan tambah sendiri di `compositions/`
(akan tertimpa). Catat kebutuhannya dulu.
