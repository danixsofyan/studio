/* Pustaka ilustrasi stiker Sedarikini.
   Setiap entri mengembalikan daftar layer SVG. Tanda {POP} diisi otomatis
   oleh pembuat scene dengan waktu muncul yang tersebar. */

function pad(cx, cy, s, rot = 0) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="${rot}">
<path d="M -60 -34 C -112 -30 -112 30 -60 34 Z" fill="#ffffff" />
<path d="M 60 -34 C 112 -30 112 30 60 34 Z" fill="#ffffff" />
<path d="M 0 -122 C 62 -122 68 -60 64 0 C 68 60 62 122 0 122 C -62 122 -68 60 -64 0 C -68 -60 -62 -122 0 -122 Z" fill="#ffffff" />
<ellipse rx="34" ry="86" fill="#f7a8c4" /><ellipse cx="-8" cy="-30" rx="8" ry="24" fill="#ffffff" opacity="0.6" /></g></g>`;
}

function wanita(cx, cy, s, rot = 0) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="${rot}">
<path d="M -70 140 C -70 40 -40 10 0 10 C 40 10 70 40 70 140 Z" fill="#e07a8f" />
<path d="M -58 -40 C -58 -110 58 -110 58 -40 C 58 10 40 40 0 52 C -40 40 -58 10 -58 -40 Z" fill="#7a5c9e" />
<ellipse cx="0" cy="-30" rx="34" ry="40" fill="#f2c48d" />
<circle cx="-12" cy="-34" r="4" fill="#3a2a20" /><circle cx="12" cy="-34" r="4" fill="#3a2a20" />
<path d="M -10 -12 C -4 -6 4 -6 10 -12" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round" /></g></g>`;
}

const SAMPAH = [
  { x: 180, y: 1080, s: 2.4, r: -12, isi: `<path d="M -26 -18 L 26 -18 L 30 22 L -30 22 Z" fill="#f4f4f4" /><rect x="-28" y="-6" width="56" height="6" fill="#e05a47" />` },
  { x: 900, y: 1040, s: 2.4, r: 30, isi: `<rect x="-10" y="-24" width="20" height="48" rx="6" fill="#8fd0f2" /><rect x="-6" y="-32" width="12" height="10" rx="3" fill="#2f7de1" />` },
  { x: 300, y: 880, s: 2.4, r: 10, isi: `<rect x="-12" y="-20" width="24" height="40" rx="5" fill="#e04b3f" /><rect x="-12" y="-6" width="24" height="10" fill="#f5c542" />` },
  { x: 820, y: 820, s: 2.4, r: -20, isi: `<ellipse rx="16" ry="34" fill="#ffffff" /><ellipse rx="8" ry="22" fill="#f7a8c4" />` },
  { x: 150, y: 700, s: 2.4, r: -40, isi: `<rect x="-10" y="-24" width="20" height="48" rx="6" fill="#8fd0f2" /><rect x="-6" y="-32" width="12" height="10" rx="3" fill="#2f7de1" />` },
  { x: 950, y: 640, s: 2.4, r: 15, isi: `<path d="M -26 -18 L 26 -18 L 30 22 L -30 22 Z" fill="#f4f4f4" /><rect x="-28" y="-6" width="56" height="6" fill="#e05a47" />` },
  { x: 540, y: 1120, s: 2.4, r: 35, isi: `<ellipse rx="16" ry="34" fill="#ffffff" /><ellipse rx="8" ry="22" fill="#f7a8c4" />` },
];

export const ILUSTRASI = {
  pembalut: {
    label: "Satu pembalut",
    deskripsi: "Stiker satu pembalut putih-pink. Cocok untuk hook.",
    layers: () => [pad(540, 900, 1.5, -6)],
  },

  sampah: {
    label: "Sampah berserakan",
    deskripsi: "Tujuh bungkus sampah kecil berserakan. Untuk bagian masalah.",
    layers: () =>
      SAMPAH.map(
        (s) =>
          `<g transform="translate(${s.x} ${s.y}) scale(${s.s})" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="${s.r}">${s.isi}</g></g>`,
      ),
  },

  wanita: {
    label: "Satu wanita",
    deskripsi: "Figur wanita berhijab. Untuk 'satu wanita' atau tokoh.",
    layers: () => [wanita(300, 780, 1.55, 0)],
  },

  kalender: {
    label: "Kalender 30",
    deskripsi: "Kalender dengan angka 30. Untuk satu siklus bulanan.",
    layers: () => [
      `<g transform="translate(770 790) scale(1.35)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="8"><rect x="-90" y="-80" width="180" height="170" rx="20" fill="#ffffff" />
<rect x="-90" y="-80" width="180" height="52" rx="20" fill="#e04b3f" /><rect x="-90" y="-46" width="180" height="18" fill="#e04b3f" />
<rect x="-52" y="-98" width="14" height="36" rx="7" fill="#3a3f4b" /><rect x="38" y="-98" width="14" height="36" rx="7" fill="#3a3f4b" />
<text x="0" y="52" text-anchor="middle" font-family="Inter" font-weight="900" font-size="76" fill="#6f6f6f">30</text></g></g>`,
    ],
  },

  "grid-pembalut": {
    label: "25 pembalut",
    deskripsi: "Grid 5×5 berisi 25 pembalut. Untuk angka 25 pcs.",
    layers: () => {
      const hasil = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          hasil.push(pad(290 + c * 125, 660 + r * 108, 0.46, 0));
        }
      }
      return hasil;
    },
  },

  kerumunan: {
    label: "Banyak orang",
    deskripsi: "Empat puluh figur wanita. Untuk 'jutaan orang'.",
    layers: () => {
      const hasil = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 8; c++) {
          hasil.push(wanita(120 + c * 120, 700 + r * 115, 0.42, 0));
        }
      }
      return hasil;
    },
  },

  pabrik: {
    label: "Pabrik dan sumber daya",
    deskripsi: "Pabrik, pohon, dan truk. Untuk sumber daya atau produksi.",
    layers: () => [
      `<g transform="translate(250 830) scale(1.05)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="-4">
<rect x="-140" y="-40" width="280" height="150" rx="10" fill="#9fb0c9" />
<path d="M -140 -40 L -100 -92 L -60 -40 L -20 -92 L 20 -40 L 60 -92 L 100 -40 L 140 -92 L 140 -40 Z" fill="#e05a47" />
<rect x="86" y="-190" width="34" height="110" rx="6" fill="#6b7a90" />
<rect x="86" y="-166" width="34" height="14" fill="#f5c542" />
<circle cx="103" cy="-222" r="26" fill="#c9d3e0" />
<circle cx="138" cy="-254" r="32" fill="#c9d3e0" />
<rect x="-104" y="4" width="52" height="40" rx="6" fill="#f5c542" />
<rect x="-34" y="4" width="52" height="40" rx="6" fill="#f5c542" />
<rect x="36" y="4" width="52" height="40" rx="6" fill="#f5c542" />
<rect x="-20" y="62" width="56" height="48" rx="6" fill="#5b6a80" /></g></g>`,
      `<g transform="translate(860 760) scale(1.05)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="8">
<rect x="-14" y="-40" width="28" height="96" rx="6" fill="#7a4b2a" />
<circle cx="0" cy="-96" r="70" fill="#43a047" />
<circle cx="-26" cy="-118" r="34" fill="#66bb6a" /></g></g>`,
      `<g transform="translate(540 1190) scale(1.05)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="0">
<rect x="-170" y="-70" width="220" height="88" rx="10" fill="#8aa0bf" />
<path d="M 50 -70 L 112 -70 L 160 -14 L 160 18 L 50 18 Z" fill="#e05a47" />
<rect x="-156" y="-50" width="78" height="34" rx="5" fill="#f5c542" />
<circle cx="-108" cy="30" r="24" fill="#2b2321" />
<circle cx="112" cy="30" r="24" fill="#2b2321" />
<circle cx="-108" cy="30" r="9" fill="#8f98a6" />
<circle cx="112" cy="30" r="9" fill="#8f98a6" /></g></g>`,
    ],
  },

  "jam-pasir": {
    label: "Jam pasir",
    deskripsi: "Jam pasir. Untuk waktu terurai atau proses lama.",
    layers: () => [
      `<g transform="translate(880 1160) scale(0.95)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="10"><rect x="-80" y="-130" width="160" height="22" rx="8" fill="#7a4b2a" /><rect x="-80" y="108" width="160" height="22" rx="8" fill="#7a4b2a" />
<path d="M -62 -108 L 62 -108 C 62 -40 12 -16 12 0 C 12 16 62 40 62 108 L -62 108 C -62 40 -12 16 -12 0 C -12 -16 -62 -40 -62 -108 Z" fill="#cfeaf7" />
<path d="M -40 -70 L 40 -70 C 30 -40 8 -20 0 -10 C -8 -20 -30 -40 -40 -70 Z" fill="#f5c542" />
<path d="M -52 104 L 52 104 C 40 70 10 60 0 60 C -10 60 -40 70 -52 104 Z" fill="#f5c542" /></g></g>`,
    ],
  },

  produk: {
    label: "Tumpukan pembalut kain",
    deskripsi: "Tiga pembalut kain terlipat. Untuk produk guna ulang.",
    layers: () => [
      `<g transform="translate(540 960) scale(1.5)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="-8">
<path d="M -128 -30 C -128 -62 128 -62 128 -30 L 108 38 C 108 68 -108 68 -108 38 Z" fill="#f7f4ec" />
<path d="M -100 8 C -60 26 60 26 100 8" stroke="#e3dccb" stroke-width="6" fill="none" stroke-linecap="round" />
<circle cx="-86" cy="26" r="9" fill="#cfc6b2" /><circle cx="86" cy="26" r="9" fill="#cfc6b2" /></g></g>`,
      `<g transform="translate(540 1010) scale(1.5)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="6">
<path d="M -128 -30 C -128 -62 128 -62 128 -30 L 108 38 C 108 68 -108 68 -108 38 Z" fill="#fff8ec" />
<path d="M -100 8 C -60 26 60 26 100 8" stroke="#efe6d2" stroke-width="6" fill="none" stroke-linecap="round" />
<circle cx="-86" cy="26" r="9" fill="#d9cfb8" /><circle cx="86" cy="26" r="9" fill="#d9cfb8" /></g></g>`,
      `<g transform="translate(540 1060) scale(1.5)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="-3">
<path d="M -128 -30 C -128 -62 128 -62 128 -30 L 108 38 C 108 68 -108 68 -108 38 Z" fill="#fdf1f5" />
<path d="M -100 8 C -60 26 60 26 100 8" stroke="#f3d7e2" stroke-width="6" fill="none" stroke-linecap="round" />
<circle cx="-86" cy="26" r="9" fill="#e8bfd0" /><circle cx="86" cy="26" r="9" fill="#e8bfd0" /></g></g>`,
    ],
  },

  cuci: {
    label: "Mencuci",
    deskripsi: "Ember berisi air dan gelembung. Untuk cara pakai atau mencuci.",
    layers: () => [
      `<g transform="translate(540 1000) scale(1.6)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="-4">
<path d="M -120 -40 L -96 100 C -92 126 92 126 96 100 L 120 -40 Z" fill="#8fd0f2" />
<rect x="-132" y="-58" width="264" height="26" rx="12" fill="#2f7de1" />
<path d="M -92 -20 L -76 92 C -72 108 72 108 76 92 L 92 -20 Z" fill="#cfeaf7" opacity="0.7" />
<circle cx="-60" cy="-96" r="18" fill="#ffffff" opacity="0.9" /><circle cx="-20" cy="-118" r="12" fill="#ffffff" opacity="0.9" /><circle cx="24" cy="-92" r="16" fill="#ffffff" opacity="0.9" /></g></g>`,
      `<g transform="translate(760 860) scale(0.9)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="12"><ellipse rx="16" ry="34" fill="#ffffff" /><ellipse rx="8" ry="22" fill="#f7a8c4" /></g></g>`,
    ],
  },

  jemur: {
    label: "Menjemur",
    deskripsi: "Jemuran dan matahari. Untuk penutup atau produk dipakai sehari-hari.",
    layers: () => [
      `<g transform="translate(540 420)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="0"><circle cx="0" cy="0" r="86" fill="#f5c542" />
<g stroke="#f5c542" stroke-width="14" stroke-linecap="round"><path d="M 0 -132 L 0 -112" /><path d="M 0 132 L 0 112" /><path d="M -132 0 L -112 0" /><path d="M 132 0 L 112 0" /><path d="M -94 -94 L -80 -80" /><path d="M 94 -94 L 80 -80" /><path d="M -94 94 L -80 80" /><path d="M 94 94 L 80 80" /></g></g></g>`,
      `<g transform="translate(0 700) scale(1)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="0"><path d="M 60 0 C 300 40 780 40 1020 0" stroke="#7a4b2a" stroke-width="10" fill="none" stroke-linecap="round" />
<rect x="246" y="-16" width="18" height="38" rx="7" fill="#f5c542" /><rect x="716" y="-16" width="18" height="38" rx="7" fill="#f5c542" /></g></g>`,
      `<g transform="translate(330 780) scale(1.25)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="-8"><path d="M -60 -34 C -112 -30 -112 30 -60 34 Z" fill="#fff8ec" />
<path d="M 60 -34 C 112 -30 112 30 60 34 Z" fill="#fff8ec" />
<path d="M 0 -122 C 62 -122 68 -60 64 0 C 68 60 62 122 0 122 C -62 122 -68 60 -64 0 C -68 -60 -62 -122 0 -122 Z" fill="#fdf1f5" />
<ellipse rx="34" ry="86" fill="#f7a8c4" /></g></g>`,
      `<g transform="translate(730 780) scale(1.25)" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="6"><path d="M -60 -34 C -112 -30 -112 30 -60 34 Z" fill="#fff8ec" />
<path d="M 60 -34 C 112 -30 112 30 60 34 Z" fill="#fff8ec" />
<path d="M 0 -122 C 62 -122 68 -60 64 0 C 68 60 62 122 0 122 C -62 122 -68 60 -64 0 C -68 -60 -62 -122 0 -122 Z" fill="#fdf1f5" />
<ellipse rx="34" ry="86" fill="#f7a8c4" /></g></g>`,
    ],
  },
};

export function daftarIlustrasi() {
  return Object.entries(ILUSTRASI).map(([kunci, v]) => ({
    kunci,
    label: v.label,
    deskripsi: v.deskripsi,
  }));
}
