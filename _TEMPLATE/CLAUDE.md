# Sedarikini — Jalur B (OpenCode)

Project ini membuat video Sedarikini dari satu file: **`video.json`**.
Mesin `npm run buat` menyusun scene, caption, judul, watermark, dan timing.

> **Jangan edit `index.html` atau `compositions/*.html`.** Keduanya dihasilkan
> otomatis dan akan tertimpa setiap `npm run buat`. Edit `video.json` saja.

## Skill HyperFrames

Sebelum mengubah composition atau menyentuh HyperFrames, baca skill `/hyperframes`
(atau `~/.config/opencode/skills/hyperframes/SKILL.md`). Skill itu memuat kontrak
render, aturan `data-start`, timeline GSAP, dan cara memeriksa hasil.

## Alur kerja

1. Dari `_TEMPLATE`: `npm run baru -- "2026-11 Clodi"`.
2. Siapkan VO: taruh di `assets/audio/vo.wav`, atau tulis `script.txt` lalu
   `npm run vo` (ElevenLabs API, butuh plan Starter).
3. Letakkan klip di `footage/`, nama huruf kecil sesuai isi
   (`cuci clodi.MOV`, `sampah tps.MOV`).
4. Isi `video.json` mengikuti `video.contoh.json`.
5. Jalankan `npm run buat` → file HTML dibuat + preview terbuka.
6. `npm run check` → harus 0 error.
7. Tonton preview, kumpulkan catatan, perbaiki `video.json`, ulangi `npm run buat`.
8. `npm run render` → MP4 di `renders/`.

## Struktur

| Path | Isi |
| --- | --- |
| `video.json` | **Satu-satunya file yang diedit untuk isi video** |
| `video.contoh.json` | Contoh lengkap + daftar ilustrasi |
| `footage/` | Klip asli dari HP (boleh HDR, `.MOV`) |
| `assets/audio/` | VO |
| `assets/footage/` | Klip normal 1080×1920 SDR (dibuat otomatis) |
| `compositions/` | Scene + caption + watermark (dibuat otomatis) |
| `index.html` | Panggung utama (dibuat otomatis) |
| `scripts/` | Mesin `buat` (jangan diubah tanpa perlu) |

## Perintah

```bash
npm run baru -- "2026-11 Clodi"   # buat folder video baru dari template
npm run vo -- --daftar            # daftar suara + voice_id (ElevenLabs)
npm run vo -- --cek               # cek API key + suara
npm run vo                        # script.txt -> assets/audio/vo.wav
npm run buat                      # susun video + buka preview
npm run check                     # lint + runtime + layout + motion + contrast
npm run dev                       # preview manual (blokir terminal)
npm run render                    # render MP4 1080x1920 ke renders/
```

Alur kerja lengkap ada di `../ALUR-KERJA.md`.

## Skema video.json

```json
{
  "judul": "2026-11 Clodi",
  "vo": "assets/audio/vo.wav",
  "ekor": 2.6,
  "kalimat": [
    {
      "teks": "Satu pembalut ini terlihat biasa.",
      "klip": "pembalut sekali pakai",
      "mulai_media": 0,
      "kecepatan": 1,
      "stiker": ["pembalut"],
      "judul": ["satu pembalut", "terlihat biasa."],
      "pink": "biasa",
      "kata_kunci": ["biasa"]
    },
    {
      "teks": "rata-rata menggunakan dua puluh lima pcs.",
      "ilustrasi": ["wanita", "kalender"],
      "judul": ["25 pcs"],
      "pink": "25",
      "label": ["1 wanita", "1 siklus / bulan"],
      "kata_kunci": ["25", "pcs"]
    }
  ]
}
```

| Kunci | Wajib | Arti |
| --- | --- | --- |
| `judul` | ya | Nama project |
| `vo` | ya | Path VO, mis. `assets/audio/vo.wav` |
| `ekor` | tidak | Detik tambahan setelah VO habis (default 2.6) |
| `kalimat` | ya | Satu kalimat = satu scene, urut seperti VO |
| `teks` | ya | Kalimat untuk caption (persis yang diucapkan) |
| `klip` | salah satu | Nama file di `footage/` tanpa ekstensi |
| `ilustrasi` | salah satu | Nama ilustrasi (string) atau daftar nama |
| `stiker` | tidak | Ilustrasi yang ditempel di atas footage |
| `mulai_media` | tidak | Detik awal klip yang dipakai |
| `kecepatan` | tidak | 0.1–10, memperlambat klip |
| `judul` (di kalimat) | tidak | Teks besar; daftar teks atau objek |
| `pink` | tidak | Satu kata di judul yang diberi warna pink |
| `kata_kunci` | tidak | Kata caption yang diberi warna kuning |
| `label` | tidak | Label kecil di bawah ilustrasi (`["1 wanita"]` atau objek posisi) |
| `hitung` | tidak | Angka berjalan, mis. `{"ke": 800}` |

### Bentuk judul

- **Daftar teks** → muncul bergantian, dibagi rata sepanjang kalimat:
  `"judul": ["satu pembalut", "terlihat biasa."]`
- **Objek** → atur sendiri waktu dan posisi (detik dari awal scene):
  ```json
  "judul": [
    { "teks": "sampah pembalut", "masuk": 0.05, "keluar": 1.0 },
    { "teks": "{angka}", "masuk": 1.0, "keluar": 1.6, "atas": 560, "ukuran": 330 },
    { "teks": "tahun untuk terurai.", "masuk": 1.6, "atas": 900, "ukuran": 110 }
  ]
  ```
  `keluar` kosong = tetap sampai scene selesai. `atas` dan `ukuran` dalam piksel.

### Angka berjalan

```json
"judul": [{ "teks": "{angka}", "masuk": 1.0, "atas": 560, "ukuran": 330 }],
"hitung": { "ke": 800, "mulai": 1.1, "durasi": 0.9 }
```

## Ilustrasi yang tersedia

| Kunci | Untuk |
| --- | --- |
| `pembalut` | Satu pembalut, hook |
| `sampah` | Sampah berserakan, bagian masalah |
| `wanita` | Satu figur wanita |
| `kalender` | Kalender 30, satu siklus |
| `grid-pembalut` | 25 pembalut, angka 25 pcs |
| `kerumunan` | Banyak orang, "jutaan" |
| `pabrik` | Sumber daya dan produksi |
| `jam-pasir` | Waktu lama, terurai |
| `produk` | Tumpukan pembalut kain |
| `cuci` | Mencuci, cara pakai |
| `jemur` | Menjemur, penutup |

Tidak ada ilustrasi yang cocok? Pakai footage, atau catat kebutuhan baru untuk Danny.
Jangan menambah efek baru di `compositions/` karena akan tertimpa.

## Aturan gaya Sedarikini (tidak boleh berubah)

- 1080×1920 vertikal, 30 fps.
- Logo watermark di tengah atas (`top: 205px`): putih di atas footage, warna
  asli logo di latar krem. Tanpa kotak, tanpa bayangan.
- Caption dalam pill gelap di `top: 1365px`, per kata, kata kunci kuning
  (`#ffd27a`). Jangan naikkan ke area tombol platform.
- Judul serif miring bercahaya; satu kata pink (`#ffc2d8` di footage,
  `#d6456f` di krem).
- Ilustrasi flat dengan garis tepi putih, seperti stiker.
- Latar krem untuk angka/data: `#efe9dd`.
- Jangan menambah `@sedarikini` atau teks penutup lain; logo sudah ada.

## Footage dan HDR

- iPhone: matikan **Settings › Camera › Formats › HDR Video**. HDR membuat hasil
  render gelap dan kusam.
- Mesin ini mendeteksi HDR (HLG/PQ) dan mengonversinya ke SDR otomatis saat
  `npm run buat`, lalu menyimpan hasilnya di `assets/footage/`.
- File asli di `footage/` tidak diubah.
- Rekam vertikal, 5–10 detik per klip, satu klip satu aksi.

## Kalau bermasalah

| Gejala | Perbaikan |
| --- | --- |
| `VO tidak ditemukan` | Taruh file di `assets/audio/` dan samakan path `vo` |
| `Footage ... tidak ditemukan` | Samakan nama di `video.json` dengan nama file di `footage/` |
| `ilustrasi ... tidak ada` | Pakai salah satu kunci di tabel ilustrasi |
| Caption tidak sinkron | Pastikan `teks` persis sama dengan VO; VO diganti → `npm run buat` ulang |
| Hasil gelap | Cek apakah klip HDR; hapus `assets/footage/<nama>.mp4` lalu `npm run buat` ulang |
| Preview tidak terbuka | `npm run dev` |
| Hasil berantakan | Salin ulang folder dari `_TEMPLATE`, jangan edit file hasil generate |

## Kontrak HyperFrames (ringkas)

1. Setiap elemen berwaktu punya `data-start` dan durasi; scene memakai `class="clip"`.
2. Satu timeline paused per composition, didaftarkan di `window.__timelines`.
3. Sub-composition memakai `data-composition-src="compositions/file.html"`.
4. Video bersuara memakai `data-has-audio="true"`; footage senyap `muted`.
5. Hanya logika deterministik: tanpa `Date.now()`, `Math.random()`, atau fetch.
6. Setelah mengubah apa pun: `npm run check`, lalu lihat frame dengan
   `npx hyperframes snapshot --at <detik>`.
