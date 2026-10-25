# Panduan Bikin Video Sedarikini

Diperbarui 24 Oktober 2026.

## Gambaran alur

Satu video Sedarikini dibuat dalam 6 langkah. Danny cukup menyiapkan laptop sekali di awal. Setelah itu, istri bisa membuat video sendiri dengan mengikuti panduan ini dari atas ke bawah.

1. **Tulis script**: 60–110 kata, untuk video 25–45 detik.
2. **Buat suara (VO)** di ElevenLabs, simpan sebagai `VO.mp3`.
3. **Rekam dan pilih footage**: 4–8 klip pendek dari HP.
4. **Minta Claude membuat video**: salin folder template, lalu tempel satu pesan siap pakai.
5. **Preview dan revisi**: tonton di browser, kirim semua catatan dalam satu pesan.
6. **Render dan upload**: ketik `render`, ambil file MP4, lalu unggah ke Instagram, TikTok, dan YouTube.

| Langkah | Dikerjakan oleh | Perkiraan waktu |
| --- | --- | --- |
| Persiapan laptop (sekali saja) | Danny | 30–60 menit |
| 1–3 Script, VO, footage | Istri | 30–60 menit |
| 4 Claude menyusun video | Claude | 10–20 menit menunggu |
| 5 Preview dan revisi | Istri | 10–30 menit |
| 6 Render | Laptop | 3–12 menit menunggu |

Perkiraan waktu di tabel ini berdasarkan dua video yang sudah dibuat (edu sekali pakai dan Menspad), jadi bisa berbeda tergantung panjang video dan jumlah revisi.

## Pilih jalur: Claude Code atau OpenCode

Ada dua jalur. Langkah 1–3 (script, VO, footage) sama persis. Bedanya di langkah 4–6.

| | Jalur A: Claude Code | Jalur B: OpenCode gratis |
| --- | --- | --- |
| Biaya AI | Langganan Claude (Pro/Max) | Rp0 (model gratis) |
| Cara membuat video | Minta Claude lewat chat, dibuat dari nol | Isi `video.json`, lalu jalankan `npm run buat` |
| Revisi | Apa saja: footage, ilustrasi baru, efek baru | Hanya memilih dari footage, judul, dan ilustrasi yang tersedia di template |
| Kemudahan | Paling mudah, tinggal chat | Perlu sedikit membuka dan mengedit file |
| Status | Siap dipakai | **Belum siap:** mesin video (`video.json` dan `npm run buat`) masih dibuat |

Saran: mulai dengan **Jalur A**. Pakai **Jalur B** untuk video rutin setelah mesin video selesai dan sudah diuji di laptop Danny.

## Persiapan sekali di laptop istri (dikerjakan Danny)

Tujuannya, laptop istri punya alat yang sama dan folder kerja yang sama dengan laptop Danny. Dengan begitu, Claude di kedua laptop menghasilkan gaya video yang sama.

- [ ] **Jalur A:** pasang **Claude desktop app** dan login ke akun Claude milik istri sendiri. Pakai tab **Code**, karena Claude perlu mengakses file video di laptop.
- [ ] **Jalur B:** pasang **OpenCode** (opencode.ai). Lalu pilih model gratis: ketik `/models` di OpenCode dan pilih yang berlabel gratis, atau sambungkan API key OpenRouter dan pilih model berakhiran `:free`.
- [ ] **Pasang Node.js (versi LTS)** dari nodejs.org. Ini dibutuhkan HyperFrames, alat yang merakit dan merender video.
- [ ] **Pasang ffmpeg** (di Mac lewat Homebrew: `brew install ffmpeg`). Dipakai untuk mengonversi footage HP. Cara pasangnya bisa ditanyakan ke Claude.
- [ ] **Buat folder bersama** "Sedarikini Konten" di Google Drive atau iCloud. Isinya:
    - `_TEMPLATE`: salinan project Menspad (gaya footage dengan ilustrasi) yang sudah dibersihkan, dipakai sebagai cetakan.
    - `CLAUDE.md` (dibaca Claude Code) dan `AGENTS.md` (dibaca OpenCode): aturan gaya Sedarikini, isinya sama, dibaca otomatis setiap kali bekerja di folder ini.
    - `logo-sedarikini-black.png`
    - satu folder per video, misalnya `2026-10 Menspad`
- [ ] **Uji sekali bersama**: buat satu video pendek dari template, lalu tonton preview-nya di browser.

Setelah daftar ini selesai, istri cukup membuka Claude desktop app (Jalur A) atau OpenCode (Jalur B), memilih folder "Sedarikini Konten", lalu mengikuti langkah 1–6.

## Langkah 1 — Menyusun script

Script yang baik cukup menyampaikan satu pesan, dibuka dengan hook di kalimat pertama, dan ditutup dengan ajakan kecil. Panjang 60–110 kata menghasilkan video sekitar 25–45 detik.

**Struktur yang terbukti jalan** (dipakai di video Menspad):

1. **Hook (1 kalimat)**: benda sehari-hari yang dipegang penonton. Contoh: "1 pembalut ini terlihat biasa…"
2. **Masalah (2–3 kalimat)**: dampak yang tidak terlihat, pakai angka yang bisa dibayangkan (25 pcs per bulan, 800 tahun).
3. **Solusi (1–2 kalimat)**: produk guna ulang, sebutkan manfaatnya (hemat, nggak nyampah).

**Aturan bahasa:**

- Pakai "kamu" atau "kita", kalimat pendek, seperti bicara ke teman.
- Ajak dengan lembut ("Mulai dari satu barang aja"), jangan melarang ("Berhenti…").
- Angka hanya dari sumber yang jelas. Kalau ragu, tulis "ratusan tahun", bukan angka pasti.
- Tulis angka sebagai kata kalau ingin dibaca jelas oleh suara AI ("dua puluh lima").

**Prompt siap tempel ke Claude untuk merapikan script:**

```
Tolong rapikan script video Sedarikini ini supaya lebih humanis dan enak didengar.
Panjang maksimal 100 kata, kalimat pendek, pakai "kamu/kita".
Struktur: hook 1 kalimat, masalah dengan angka, solusi guna ulang di akhir.
Jangan tambah angka yang tidak ada di script asli.
Berikan 2 versi.

Script:
[tempel script di sini]
```

## Langkah 2 — Membuat suara (VO) di ElevenLabs

Buat seluruh script dalam **satu file suara utuh**, jangan per kalimat. Jeda antarkalimat terdengar lebih alami, dan Claude bisa menyinkronkan semua bagian video dari satu file.

1. Buka elevenlabs.io dan login, lalu pilih **Text to Speech**.
2. Pilih suara **Riri**, suara yang dipakai di video Menspad dan edu sekali pakai, supaya semua video terdengar konsisten.
3. Tempel script final dari langkah 1.
4. Klik **Generate**, lalu dengarkan sampai habis. Perhatikan kata yang salah ucap, terutama angka dan istilah seperti "menspad".
5. Kalau ada yang salah ucap, ubah ejaan di script, lalu generate ulang. Contoh: "25 pcs" ditulis "dua puluh lima pcs", "menspad" ditulis "mens-pad".
6. Klik **Download** (format MP3) dan beri nama file `VO.mp3`.

Catatan:

- Simpan script final di samping VO, dengan teks yang persis sama dengan yang dibacakan. Claude memakai teks ini untuk caption.
- Setelah VO berubah, jangan lupa beri tahu Claude. Timing seluruh video harus dihitung ulang.

## Langkah 3 — Merekam dan memilih footage

Footage asli membuat video terasa jujur dan dekat. Ilustrasi dipakai untuk bagian angka dan data yang tidak bisa direkam.

**Setting iPhone sebelum merekam (penting):**

- Matikan **Settings › Camera › Formats › HDR Video**. Rekaman HDR membuat hasil render gelap dan kusam. Masalah ini sempat terjadi di video Menspad.
- Rekam **vertikal**, kamera belakang, cahaya terang (dekat jendela atau di luar).
- Tahan HP stabil, 5–10 detik per klip. Satu klip = satu aksi.

**Checklist shot per video** (sesuaikan dengan script):

- [ ] Produk sekali pakai (rak toko, sampah, kemasan) untuk bagian masalah
- [ ] Dampak (tumpukan sampah, TPS). Fokus ke tumpukannya, bukan jalannya.
- [ ] Produk Sedarikini close-up di atas meja kayu
- [ ] Cara pakai atau cuci produk
- [ ] Produk dijemur atau dipakai sehari-hari untuk penutup

**Penamaan file:** nama sesuai isi, huruf kecil, contoh `cuci menspad.MOV`, `sampah tps.MOV`. Claude memilih klip berdasarkan nama ini.

Bagian yang tidak punya footage (angka, jutaan orang, proses pabrik) akan dibuat Claude sebagai ilustrasi berwarna di latar krem.

## Langkah 4 — Membuat video

Setiap video punya foldernya sendiri, disalin dari `_TEMPLATE`, supaya gaya, logo, dan font selalu sama.

1. Di folder "Sedarikini Konten", salin folder `_TEMPLATE`, lalu ganti namanya. Contoh: `2026-11 Clodi`.
2. Masukkan `VO.mp3` ke `assets/`, dan semua klip ke `footage/`.

### Jalur A: Claude Code

3. Buka Claude desktop app › tab **Code** › pilih folder video tersebut.
4. Tempel pesan berikut, lalu ganti bagian dalam kurung siku:

```
Buat video Sedarikini baru di folder ini, gayanya sama seperti video Menspad:
footage asli + judul serif bercahaya + caption pill + ilustrasi krem untuk angka.

Script (persis seperti VO):
[tempel script final]

VO: assets/VO.mp3
Footage: folder footage/ (cek HDR, konversi ke SDR kalau perlu)

Watermark logo di tengah atas, caption di area aman Reels/TikTok/Shorts.
Setelah selesai, jalankan check dan buka preview. Jangan render dulu.
```

Claude akan menyusun video, mengecek hasilnya, lalu membuka preview. Proses ini butuh sekitar 10–20 menit.

### Jalur B: OpenCode gratis (belum siap)

3. Buka OpenCode di folder video tersebut.
4. Tempel pesan berikut:

```
Isi file video.json di folder ini mengikuti contoh di video.contoh.json.
Script (persis seperti VO):
[tempel script final]
Pasangkan tiap kalimat dengan klip di footage/ yang namanya paling cocok.
Untuk kalimat tentang angka atau data, pakai ilustrasi dari daftar di video.contoh.json.
Lalu jalankan: npm run buat
```

5. Atau isi `video.json` sendiri dengan melihat contoh, lalu jalankan `npm run buat` di terminal.
6. Preview terbuka otomatis di browser.

## Langkah 5 — Preview dan revisi

Preview terbuka di browser di **http://localhost:3002**. Tonton sampai habis minimal dua kali, sekali dengan suara dan sekali tanpa suara.

**Yang dicek:**

- [ ] Kalimat pembuka langsung menarik (detik 0–2)
- [ ] Caption terbaca dan tidak menutupi gambar penting
- [ ] Footage cocok dengan kalimat yang sedang dibacakan
- [ ] Logo terlihat dan tidak mengganggu
- [ ] Tidak ada bagian yang gelap atau kosong

**Cara memberi catatan (hemat kuota):** kumpulkan semua catatan dulu, lalu kirim **dalam satu pesan**, pakai detik:

```
Revisi:
1. Detik 3–5: footage terlalu gelap, ganti klip lain
2. Detik 15: caption menutup ilustrasi, turunkan sedikit
3. Detik 40: hapus logo reuse
```

Perubahan kecil, seperti mengganti teks judul, bisa juga dilakukan langsung di preview dengan mengklik teksnya.

- **Jalur A:** kirim catatan di atas ke Claude.
- **Jalur B:** ubah `video.json` (ganti nama klip, kata judul, atau ilustrasi), lalu jalankan `npm run buat` lagi. Kalau butuh hal baru di luar template, catat dan minta Danny mengerjakannya dengan Claude.

## Langkah 6 — Render dan upload

Kalau preview sudah oke, ketik **`render`** di Claude (Jalur A) atau jalankan **`npm run render`** (Jalur B). Hasilnya ada di folder `renders/` dalam folder video tersebut, berupa file MP4 vertikal 1080×1920.

- Lama render 3–12 menit, tergantung jumlah footage. Laptop boleh dipakai, asal tidak ditutup.
- Setelah render, tonton file MP4-nya sekali sampai habis. Di Jalur A, bisa juga minta Claude: "cek hasil render di detik awal dan akhir".

**Checklist upload:**

| Platform | Yang diisi | Catatan |
| --- | --- | --- |
| Instagram Reels | Caption + 3–5 hashtag + link Shopee di bio | Pilih cover dari frame judul |
| TikTok | Deskripsi maksimal 2 baris | Deskripsi panjang naik dan menutup bagian bawah video |
| YouTube Shorts | Judul singkat + #shorts | Durasi di bawah 60 detik |

## Aturan gaya Sedarikini dan masalah umum

**Aturan yang selalu sama di setiap video:**

- Ukuran 1080×1920 vertikal, 30 fps.
- Logo watermark di tengah atas: putih di atas footage, logo asli di latar krem. Tanpa kotak atau bayangan.
- Caption di dalam pill gelap, per kata, kata kunci berwarna kuning. Letaknya di atas area tombol platform.
- Judul besar huruf serif miring bercahaya, satu kata diberi warna pink.
- Ilustrasi flat berwarna dengan garis tepi putih, seperti stiker.
- Jangan tambahkan @sedarikini atau simbol lain di akhir video, karena logo sudah ada di watermark.

**Masalah umum dan solusinya:**

| Masalah | Penyebab | Solusi |
| --- | --- | --- |
| Hasil render gelap dan kusam, awal video hitam | Footage HDR dari iPhone | Minta Claude: "cek HDR footage dan render ulang dalam SDR" |
| Caption tidak sinkron dengan suara | VO diganti setelah video dibuat | Minta Claude: "VO sudah diganti, sinkronkan ulang" |
| Preview tidak terbuka | Server preview mati | Minta Claude: "buka lagi preview-nya" |
| Kuota Claude cepat habis | Revisi dikirim satu per satu | Kumpulkan catatan, kirim sekali |
| OpenCode berhenti di tengah jalan | Batas harian model gratis habis | Coba lagi besok, atau ganti ke model gratis lain lewat `/models` |
| Hasil OpenCode berantakan | Model gratis mengubah file selain `video.json` | Minta OpenCode hanya mengedit `video.json`, atau salin ulang dari `_TEMPLATE` |
