# Riset konten: isu lingkungan & produk sekali pakai

Tanggal riset: 25 Oktober 2026 · Sumber data: Apify (Instagram, TikTok, Threads,
YouTube, Facebook, X) · 196 item · biaya $1,02 dari kredit $5.

## Ringkasan

1. **Konten pembalut kain yang menang di TikTok bukan konten lingkungan.** Yang
   viral adalah konten yang membantah "ribet": *"gak seribet yang kalian
   bayangin"* (895 rb views), *"nyuci tuh mudah banget"* (369 rb), *"seawet itu"*
   (2,2 jt). Isu lingkungan hampir tidak disebut.
2. **Konten zero waste yang menang justru anti-kesempurnaan.** *"Zero waste
   bukan tentang jadi sempurna"* 1,43 jt views dan *"nunggu sempurna mah gak
   mulai-mulai"* 1,35 jt views. Rasa bersalah tidak laku; izin untuk mulai kecil
   yang laku.
3. **Audiens Indonesia menyukai "sampah jadi sesuatu".** Bank sampah yang
   mengolah plastik jadi BBM (5,3 rb likes di Threads, 1,3 rb reaksi di
   Facebook), river barrier Manado (39 rb views TikTok), plastik jadi bahan
   bangunan (42 rb views YouTube). Solusi nyata lebih dibagikan daripada berita
   suram.
4. **Ada celah besar: sampah menstruasi tidak pernah masuk percakapan
   lingkungan.** Konten lingkungan yang viral membahas sachet, botol, dan
   styrofoam. Konten pembalut kain berhenti di demo produk. Belum ada yang
   menghubungkan keduanya dengan cara yang jujur.
5. **Format "skala waktu" terbukti kuat.** *"Dipakai 15 menit, mencemari
   ratusan tahun"*, *"sachet kopi hancur 100 tahun lagi"*, *"plastik dipakai 5
   menit, sampahnya bertahan ratusan tahun"*. Cocok dipakai untuk pembalut.

## Metode

| Platform | Actor | Kueri | Item | Biaya |
| --- | --- | --- | --- | --- |
| TikTok | `apidojo/tiktok-scraper` | sampah plastik, pembalut kain, zero waste indonesia, diet kantong plastik | 40 | $0,01 |
| Instagram | `apify/instagram-scraper` | #sampahplastik, #pembalutkain, #zerowasteindonesia | 50 | $0,25 |
| Threads | `igview-owner/threads-search-scraper` | sampah plastik | 20 | $0,42 |
| YouTube | `streamers/youtube-scraper` | sampah plastik indonesia, pembalut kain | 16 | $0,27 |
| Facebook | `scraper_one/facebook-posts-search` | sampah plastik | 15 | $0,06 |
| X | `apidojo/tweet-scraper` | sampah plastik, pembalut sekali pakai | 20 | $0,01 |

Keterbatasan: sampel kecil dan diambil sekali, bukan data populasi. Metrik
Instagram diambil dari postingan terbaru per hashtag sehingga *likes*-nya rendah
dan tidak bisa dibandingkan langsung dengan TikTok. Hasil X didominasi twit
lama dan bermutu rendah, jadi tidak dipakai sebagai dasar rekomendasi.

## Yang perform

### TikTok — pembalut kain (sinyal terkuat)

| Views | Likes | Akun | Isi |
| --- | --- | --- | --- |
| 2.205.715 | 20.805 | @yuspinofficialstore | "Iya memang seawet itu" |
| 1.038.228 | 6.589 | @spalspillworthit | #pembalutkain #pembalutramahlingkungan |
| 895.415 | 4.682 | @yuspinofficialstore | "gak seribet yang kalian bayangin" |
| 369.642 | 2.837 | @yuspinofficialstore | "nyuci pembalut kain tuh mudah banget" |
| 189.542 | 1.082 | @yuspinofficialstore | "ganti pembalut kain sekarang" |
| 45.775 | 3.476 | @cipopz | testimoni 2 tahun: "life changing, lebih hemat dan sehat" |

### TikTok — lingkungan

| Views | Likes | Akun | Isi |
| --- | --- | --- | --- |
| 1.434.560 | 16.349 | @anggiapiki | "zero waste bukan soal jadi sempurna" |
| 1.356.618 | 33.883 | @cynthiaslestari | "nunggu sempurna mah gak mulai-mulai" |
| 1.005.843 | 11.847 | @anggiapiki | kompos hemat tempat |
| 87.226 | 17.337 | @srimulyati0603 | sampah jadi karya |
| 39.048 | 5.663 | @notrashtriangle | river barrier di Manado |

### Instagram

- `@aniessignment` (39 likes): *"Pembalut sekali pakai memang praktis, tapi
  berapa banyak sampah yang dihasilkan setiap bulannya?"*
- `@adindaysminh01` (35 likes): *"Ke mana perginya ribuan pembalut sekali pakai
  yang kita buang tiap bulan?"*
- `@grinia.id`: mitos paper cup — *"ngerasa lebih ramah lingkungan, padahal
  tidak"*.
- `@x.tw0era`: *"dipakai hanya 15 menit, tapi mencemari bumi hingga ratusan
  tahun"*.

### Threads

- `@banksampah_banjarnegara` (5.351 likes): panen bahan bakar dari sampah
  plastik.
- `@almasqol` (3.374 likes): nasi dibungkus tanpa kertas/kantong.
- `@sunymessy` (1.321 likes): kebakaran akibat pembakaran sampah plastik —
  satu-satunya konten "bakar sampah" yang tinggi, dan itu karena berita, bukan
  edukasi.

### YouTube

- *Sisi Gelap Industri Plastik: Sampah Dunia yang Berakhir di Indonesia* —
  60.763 views.
- *Dari sampah plastik menjadi bahan bangunan* (DW Indonesia) — 42.688 views.
- *Sampah Plastik Indonesia Bisa Jadi Bahan Bakar?* — 9.877 views.
- Konten pembalut kain di YouTube justru kecil (24–3.654 views); audiensnya ada
  di TikTok dan Instagram.

### Facebook

- Pirolisis plastik jadi BBM — 1.301 reaksi, 356 komentar.
- Tirto.id: pengolahan sampah RW di Karet Kuningan — 935 reaksi.
- Data Zero Waste Indonesia: 10,83 juta ton sampah plastik per tahun.

## Enam pola yang terbukti

1. **Bantah "ribet", jangan jual rasa bersalah.** Tiga video teratas pembalut
   kain semuanya menjawab keberatan, bukan memamerkan data lingkungan.
2. **Beri izin untuk belum sempurna.** Dua video zero waste teratas justru
   menyerang perfeksionisme. Komentar 170–371 per video menandakan percakapan.
3. **Mitos vs fakta.** Paper cup, "plastik berawal dari niat baik", "15 menit vs
   ratusan tahun". Format ini memancing komentar "aku baru tahu".
4. **Solusi lokal mengalahkan berita bencana.** Bank sampah, river barrier,
   plastik jadi BBM/paving. Orang membagikan hal yang terasa mungkin.
5. **Skala waktu dan biaya tersembunyi.** "Berapa lama terurai", "ke mana air
   bilasan detergen", "biaya hidup vs gaya hidup". Angka kecil yang mengejutkan.
6. **Perjalanan setelah dibuang.** "Memilah sampah tidak berhenti di tempat
   sampah." Audiens ingin tahu apa yang terjadi setelah tong sampah.

## Celah untuk Sedarikini

- **Sampah menstruasi masih tak terlihat.** Tidak ada konten viral yang
  menghitung sampah pembalut sekali pakai, padahal topiknya sangat dekat dengan
  audiens perempuan.
- **Konten pembalut kain tidak punya "setelahnya".** Semua berhenti di "nyaman,
  awet, murah". Tidak ada yang menutup dengan konsekuensi lingkungan.
- **Belum ada yang memakai nada anti-kesempurnaan untuk menstruasi.** "Nggak
  harus langsung 100% kain" belum ada yang membuatnya.
- **Belum ada demo 3 menit cuci yang jujur.** Yang ada cuma klaim "gampang";
  belum ada tayangan proses nyata tanpa potongan.
- **Belum ada sudut biaya tahunan dalam rupiah.** Audiens "hemat" sangat besar
  (video testimoni 2 tahun dapat 3.476 likes).

## 10 ide konten

| # | Hook | Sudut | Format | Kenapa |
| --- | --- | --- | --- | --- |
| 1 | "Sepanjang hidup, satu perempuan bisa meninggalkan ribuan pembalut." | angka seumur hidup | ilustrasi + angka besar | belum ada yang membuat; paling dekat dengan produk |
| 2 | "Pembalut sekali pakai itu sebagian besar plastik. Yang nempel di badanmu berjam-jam." | mitos vs fakta | ilustrasi bahan + teks | pola mitos terbukti |
| 3 | "Aku nggak langsung 100% zero waste. Dan itu nggak apa-apa." | anti-kesempurnaan | footage + ilustrasi | 2 video teratas platform pakai nada ini |
| 4 | "Cuci pembalut kain: 3 menit. Nggak pakai ribet." | bantah keberatan | footage proses nyata | pola @yuspinofficialstore |
| 5 | "Setahun pakai pembalut sekali pakai: segini uangnya." | biaya tahunan | kartu angka + ilustrasi | "hemat" = 3.476 likes |
| 6 | "Ke mana perginya pembalut yang kamu buang?" | perjalanan sampah | footage TPS/TPA + ilustrasi | pola "afterlife" |
| 7 | "Pembalut kain bukan untuk semua orang. Ini yang perlu kamu tahu." | jujur plus-minus | talking + ilustrasi | FAQ & kepercayaan |
| 8 | "Dipakai 15 menit. Bertahan ratusan tahun." | skala waktu | teks kinetik | hook terbukti lintas platform |
| 9 | "Zero waste versi aku: satu kebiasaan, bukan sepuluh." | mulai kecil | footage rumah | nada @anggiapiki |
| 10 | "Sampah yang kita pilah, jadi apa?" | solusi lokal | footage bank sampah | Threads/FB tertinggi |

## Tiga naskah siap produksi

Semua 8 scene, 60–110 kata, mengikuti gaya Sedarikini (hook–masalah–solusi,
"kamu/kita", tanpa melarang).

### A. "Ribuan pembalut" (ide 1 + 2)

1. Sepanjang hidup, satu perempuan bisa meninggalkan ribuan pembalut sekali pakai.
2. Bukan satu. Bukan sepuluh. Ribuan.
3. Dan hampir semuanya berakhir di tempat pembuangan akhir.
4. Sebagian besar pembalut sekali pakai terbuat dari plastik.
5. Plastik butuh ratusan tahun untuk terurai. Kamu memakainya beberapa jam.
6. Pembalut kain bisa dipakai ulang, ratusan kali, lalu dicuci.
7. Kamu nggak harus langsung mengganti semuanya hari ini.
8. Coba satu siklus dulu. Satu pembalut. Satu bulan.

Butuh ilustrasi baru: `tumpukan-pembalut` (gunung pembalut) dan `tpa`.

### B. "Nggak langsung 100%" (ide 3)

1. Aku nggak langsung jadi zero waste.
2. Percobaan pertamaku malah gagal.
3. Bocor. Ribet. Nggak nyaman.
4. Tapi aku nggak berhenti di situ.
5. Aku ganti satu hal dulu: pembalut.
6. Satu perubahan, bukan sepuluh.
7. Kalau nunggu sempurna, kita nggak akan pernah mulai.
8. Mulai dari satu. Itu sudah cukup.

Cocok pakai footage rumah/aktivitas yang sudah ada, tanpa harus merekam ulang
banyak.

### C. "3 menit" (ide 4)

1. Pembalut kain itu ribet?
2. Cuci: tiga menit.
3. Bilas, sabun, kucek, jemur.
4. Nggak perlu mesin cuci.
5. Nggak perlu direndam semalaman.
6. Kering dua sampai tiga jam di bawah matahari.
7. Sekali beli, dipakai bertahun-tahun.
8. Ribetnya cuma di kepala.

Butuh footage mencuci (bukan dari folder "Bakar sampah").

## Footage yang sudah tersedia

Folder `Bakar sampah/footage` berisi 11 klip, semuanya bertema sampah dibakar
dan tumpukan sampah:

1. vegetasi dengan asap di kejauhan; 2. asap di balik tembok jalan;
3. jalan tanah dengan tumpukan sampah; 4. tumpukan sampah terbakar (siang);
5. pembakaran malam; 6. tong sampah di belakang rumah; 7. asap dekat rumah;
8. asap di atas sawah; 9. asap di balik pagar bambu; 10. tumpukan kantong sampah
di pinggir jalan; 11. jalan dengan asap pembakaran.

Yang masih bisa dipakai untuk ide baru: klip 3 dan 10 (tumpukan sampah) untuk
scene "sampah menumpuk", bukan for hook. Klip 1, 2, 8 bisa jadi b-roll suasana.
Sisanya terlalu spesifik "bakar sampah" dan sebaiknya tidak jadi pembuka.

## Catatan data

Angka berikut dipakai di naskah dan **perlu diverifikasi sebelum tayang**:

- 144.349 ton sampah per hari, ±75% belum terkelola (Zero Waste Indonesia,
  mengutip SIPSN/DPR, September 2026).
- 10,83 juta ton sampah plastik per tahun (Zero Waste Indonesia).
- "Ribuan pembalut seumur hidup" — kisaran literatur 5.000–15.000; pilih
  "ribuan" agar aman, atau hitung eksplisit dengan asumsi yang ditulis di
  caption.
- "Sebagian besar berbahan plastik" — aman. Hindari "90%" tanpa sumber primer.
- "Ratusan tahun" untuk pembalut sekali pakai — aman bila ditulis "ratusan
  tahun", bukan angka pasti.

## Lampiran

- TikTok pembalut: <https://www.tiktok.com/@yuspinofficialstore/video/7638920884945833237>,
  <https://www.tiktok.com/@yuspinofficialstore/video/7675561464320560404>
- YouTube: <https://www.youtube.com/watch?v=jF-bfst-x8E>,
  <https://www.youtube.com/watch?v=OIXWGzYkmms>
- Threads: <https://www.threads.com/@banksampah_banjarnegara/post/DdN9thqHWhk>
- Facebook: <https://www.facebook.com/reel/2193009651647165/>
- Data mentah hasil scraping: `$TMPDIR/apify/*.json` di mesin ini (tidak
  di-commit karena berisi data pihak ketiga).
