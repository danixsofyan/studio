/* Perhitungan waktu: membagi durasi VO ke tiap kalimat, caption per kata,
   dan judul per beat. Semua angka dalam detik, dibulatkan ke milidetik. */

export function kataDari(teks) {
  return String(teks).trim().split(/\s+/).filter(Boolean);
}

export function norm(teks) {
  return String(teks)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function bulat(n) {
  return Math.round(n * 1000) / 1000;
}

/* Bagi durasi VO ke tiap kalimat, proporsional terhadap jumlah kata.
   Kalimat terakhir menyerap sisa pembulatan supaya jumlahnya tepat. */
export function bagiKalimat(kalimat, totalDetik) {
  const totalMs = Math.round(totalDetik * 1000);
  const bobot = kalimat.map((k) => Math.max(1, kataDari(k.teks).length));
  const jumlah = bobot.reduce((a, b) => a + b, 0);
  let terpakai = 0;

  return kalimat.map((k, i) => {
    const ms =
      i === kalimat.length - 1
        ? totalMs - terpakai
        : Math.round((totalMs * bobot[i]) / jumlah);
    const mulaiMs = terpakai;
    terpakai += ms;
    return { ...k, mulai: mulaiMs / 1000, durasi: ms / 1000 };
  });
}

/* Pecah satu kalimat jadi pill caption maksimal `maksKata` kata.
   Tiap kata dapat waktu nyala sendiri (untuk efek karaoke). */
export function pecahCaption(teks, mulai, durasi, kataKunci = [], maksKata = 3) {
  const kata = kataDari(teks);
  if (kata.length === 0) return [];

  const grupKata = [];
  for (let i = 0; i < kata.length; i += maksKata) {
    grupKata.push(kata.slice(i, i + maksKata));
  }

  const bobotGrup = grupKata.map((grup) =>
    grup.reduce((a, w) => a + Math.max(2, norm(w).length), 0),
  );
  const totalBobot = bobotGrup.reduce((a, b) => a + b, 0);
  const panas = new Set(kataKunci.map(norm));

  let kursorGrup = mulai;
  return grupKata.map((grup, gi) => {
    const porsi = (durasi * bobotGrup[gi]) / totalBobot;
    const grupSelesai =
      gi === grupKata.length - 1 ? mulai + durasi : kursorGrup + porsi;

    const bobotKata = grup.map((w) => Math.max(2, norm(w).length));
    const totalKata = bobotKata.reduce((a, b) => a + b, 0);
    const jendela = Math.max(0.2, grupSelesai - kursorGrup - 0.05);
    let kursorKata = kursorGrup + 0.02;

    const kataHasil = grup.map((w, wi) => {
      const panjang = (jendela * bobotKata[wi]) / totalKata;
      const hasil = {
        teks: w,
        mulai: bulat(kursorKata),
        panas: panas.has(norm(w)),
      };
      kursorKata += panjang;
      return hasil;
    });

    const hasil = {
      mulai: bulat(kursorGrup),
      selesai: bulat(grupSelesai),
      kata: kataHasil,
    };
    kursorGrup = grupSelesai;
    return hasil;
  });
}

/* Judul bentuk string: dibagi rata sepanjang durasi suara.
   Judul bentuk objek: pakai masuk/keluar yang ditulis sendiri. */
export function bagiJudul(judul, durasiSuara) {
  if (!Array.isArray(judul) || judul.length === 0) return [];

  const semuaString = judul.every((j) => typeof j === "string");

  if (semuaString) {
    const slot = durasiSuara / judul.length;
    return judul.map((teks, i) => ({
      teks,
      masuk: i === 0 ? 0.05 : bulat(i * slot),
      keluar:
        i === judul.length - 1 ? null : bulat((i + 1) * slot - 0.12),
      atas: 360,
      ukuran: null,
    }));
  }

  return judul.map((j) => {
    if (typeof j === "string") {
      return { teks: j, masuk: 0.05, keluar: null, atas: 360, ukuran: null };
    }
    if (!j || typeof j.teks !== "string") {
      throw new Error("Item judul harus string atau objek dengan properti teks.");
    }
    return {
      teks: j.teks,
      masuk: typeof j.masuk === "number" ? j.masuk : 0.05,
      keluar: typeof j.keluar === "number" ? j.keluar : null,
      atas: typeof j.atas === "number" ? j.atas : 360,
      ukuran: typeof j.ukuran === "number" ? j.ukuran : null,
    };
  });
}

/* Waktu muncul untuk deretan stiker ilustrasi. */
export function bagiPop(jumlah, durasiSuara) {
  if (jumlah <= 0) return [];
  if (jumlah === 1) return [0.15];
  const mulai = 0.15;
  const akhir = Math.max(mulai + 0.3, durasiSuara * 0.55);
  const jeda = Math.min(0.6, 0.85 / (jumlah - 1), (akhir - mulai) / (jumlah - 1));
  return Array.from({ length: jumlah }, (_, i) => bulat(mulai + i * jeda));
}
