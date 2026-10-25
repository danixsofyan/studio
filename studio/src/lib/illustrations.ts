export type Illustration = {
  kunci: string;
  label: string;
  deskripsi: string;
  warna: string;
  ikon: string;
};

/** Sama persis dengan pustaka di _TEMPLATE/scripts/lib/ilustrasi.mjs. */
export const ILLUSTRATIONS: Illustration[] = [
  {
    kunci: "pembalut",
    label: "Satu pembalut",
    deskripsi: "Stiker satu pembalut putih-pink. Cocok untuk hook.",
    warna: "#f7a8c4",
    ikon: "pembalut",
  },
  {
    kunci: "sampah",
    label: "Sampah berserakan",
    deskripsi: "Tujuh bungkus sampah kecil. Untuk bagian masalah.",
    warna: "#e05a47",
    ikon: "sampah",
  },
  {
    kunci: "wanita",
    label: "Satu wanita",
    deskripsi: "Figur wanita berhijab. Untuk 'satu wanita' atau tokoh.",
    warna: "#7a5c9e",
    ikon: "wanita",
  },
  {
    kunci: "kalender",
    label: "Kalender 30",
    deskripsi: "Kalender dengan angka 30. Untuk satu siklus bulanan.",
    warna: "#e04b3f",
    ikon: "kalender",
  },
  {
    kunci: "grid-pembalut",
    label: "25 pembalut",
    deskripsi: "Grid 5×5 berisi 25 pembalut. Untuk angka 25 pcs.",
    warna: "#d9556f",
    ikon: "grid",
  },
  {
    kunci: "kerumunan",
    label: "Banyak orang",
    deskripsi: "Empat puluh figur wanita. Untuk 'jutaan orang'.",
    warna: "#8a6fb0",
    ikon: "kerumunan",
  },
  {
    kunci: "pabrik",
    label: "Pabrik dan sumber daya",
    deskripsi: "Pabrik, pohon, dan truk. Untuk sumber daya atau produksi.",
    warna: "#6b7f8a",
    ikon: "pabrik",
  },
  {
    kunci: "jam-pasir",
    label: "Jam pasir",
    deskripsi: "Jam pasir. Untuk waktu terurai atau proses lama.",
    warna: "#d9a441",
    ikon: "jam",
  },
  {
    kunci: "produk",
    label: "Tumpukan pembalut kain",
    deskripsi: "Tiga pembalut kain terlipat. Untuk produk guna ulang.",
    warna: "#e07a8f",
    ikon: "produk",
  },
  {
    kunci: "cuci",
    label: "Mencuci",
    deskripsi: "Ember berisi air dan gelembung. Untuk cara pakai atau mencuci.",
    warna: "#4f9bc4",
    ikon: "cuci",
  },
  {
    kunci: "jemur",
    label: "Menjemur",
    deskripsi: "Jemuran dan matahari. Untuk penutup atau produk sehari-hari.",
    warna: "#e0a93f",
    ikon: "jemur",
  },
];

export const ILUSTRASI_KEYS = new Set(ILLUSTRATIONS.map((i) => i.kunci));

export function illustrationByKey(key: string) {
  return ILLUSTRATIONS.find((i) => i.kunci === key);
}
