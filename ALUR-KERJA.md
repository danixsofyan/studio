# Alur kerja Sedarikini — satu chat, satu folder

Tujuan: kamu hanya perlu **memilih footage** dan **memberi catatan**. Sisanya
(ide, script, VO, folder, penyusunan, cek, render) dikerjakan lewat chat.

## Sekali setup (dikerjakan bersama)

- [ ] Langganan **ElevenLabs Starter** ($6/bln) — wajib untuk lisensi komersial
      dan clone suara. Free plan tidak boleh dipakai untuk konten promosi.
- [ ] Ambil API key di <https://elevenlabs.io/app/settings/api-keys>.
- [ ] Buka file key, ganti baris `sk_` dengan key asli, lalu simpan:
      ```bash
      open -e ~/.config/sedarikini/elevenlabs.key
      ```
      Jangan pernah menempel API key di chat. File ini izinnya 600 dan tidak
      boleh ikut ke Google Drive.
- [ ] Minta agen menjalankan `npm run vo -- --daftar` untuk menemukan voice_id
      suara clone, lalu isi `~/.config/sedarikini/config.json`.
- [ ] Cek: `cd _TEMPLATE && npm run vo -- --cek`.

Semua file ini sudah dibuat otomatis saat pertama kali `npm run vo` dijalankan.

## Alur tiap video

1. **Kamu** kirim satu pesan:
   ```
   Ide: ...
   Durasi target: 30–40 dtk
   Footage: [nama klip]
   Nada: hangat / tegas / edukatif
   CTA: ...
   Catatan: ...
   ```
   Belum ada ide? Tulis "kasih 3 ide tentang clodi".

2. **Saya** kirim 2–3 opsi script (hook → masalah → solusi) beserta perkiraan durasi.

3. **Kamu** pilih satu, atau minta revisi. Ini satu-satunya keputusan teks.

4. **Saya**:
   - buat folder `YYYY-MM Judul/` dari `_TEMPLATE`
   - tulis `script.txt`, generate VO ke `assets/audio/vo.wav`
   - salin footage pilihanmu, normalkan ke 1080×1920 SDR
   - susun `video.json`, jalankan `npm run buat` + `npm run check`
   - kirim beberapa frame + preview

5. **Kamu** tonton preview, kirim catatan dalam satu pesan (pakai detik).

6. **Saya** revisi, cek ulang, lalu render MP4.

## Library footage

Klip mentah disimpan di `_FOOTAGE/` (di samping `_TEMPLATE`), bukan disalin ke
tiap project. Saat membuat video, cukup sebut nama klipnya — agen menyalin dan
menormalkannya. Aturan nama ada di `_FOOTAGE/README.md`.

Kalau lupa isi tiap klip, minta **contact sheet**: satu gambar berisi thumbnail
semua klip + nama filenya.

## Yang tetap manual

- Memilih klip footage (kamu yang tahu isinya).
- Menyetujui script dan hasil preview.
- Pembayaran langganan ElevenLabs.

## Biaya

| Item | Biaya | Cakupan |
| --- | --- | --- |
| ElevenLabs Starter | $6/bln | 30.000 kredit ≈ 40–50 video (script 100 kata) |
| OpenCode | Rp0 | model gratis |
| Render | Rp0 | lokal di laptop |

## Perintah yang berguna

```bash
# dari dalam folder _TEMPLATE
npm run baru -- "2026-11 Clodi"     # buat folder video baru
npm run vo -- --daftar              # lihat voice_id suara clone
npm run vo -- --cek                 # cek key + suara
npm run vo                          # script.txt -> assets/audio/vo.wav

# dari dalam folder video
npm run buat                        # susun + preview
npm run check                       # harus 0 error
npm run render                      # MP4 ke renders/
```

## Aturan supaya tetap konsisten

- Jangan ganti voice, model, atau voice settings di tengah seri.
- VO lama otomatis dicadangkan ke `assets/audio/riwayat/` saat digenerate ulang.
- Kalau VO diganti, `npm run buat` harus dijalankan ulang (timing ikut berubah).
- Satu script = satu file `script.txt`; jangan campur dengan catatan produksi.
- Footage: rekam vertikal, 5–10 detik per aksi, HDR dimatikan di iPhone.
