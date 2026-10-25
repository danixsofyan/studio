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

/* Pembungkus satu layer stiker. Semua koordinat memakai ruang 1080×1920. */
function lapis(isi, cx, cy, s = 1, rot = 0) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})" filter="url(#__ID__-stk)"><g data-pop="{POP}" data-keep data-rot="${rot}">${isi}</g></g>`;
}

/* Satu tetes air, dipakai untuk hujan. */
function tetes(cx, cy, s = 1) {
  return `<path transform="translate(${cx} ${cy}) scale(${s})" d="M 0 -34 C 20 -6 22 12 0 16 C -22 12 -20 -6 0 -34 Z" fill="#8fd0f2" />`;
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

  bakar: {
    label: "Sampah dibakar",
    deskripsi: "Tumpukan sampah, api, dan asap. Untuk pembakaran sampah.",
    layers: () => [
      lapis(`<ellipse cx="0" cy="150" rx="250" ry="30" fill="#ded7c6" />`, 540, 980, 1.3, 0),
      lapis(`<path d="M -170 130 C -210 90 -170 40 -120 60 L -40 20 C 20 -10 70 20 90 60 L 180 90 C 220 110 200 150 140 155 L -120 155 C -160 155 -180 150 -170 130 Z" fill="#cfc6b2" />
<rect x="-150" y="60" width="60" height="80" rx="8" fill="#f4f4f4" transform="rotate(-10 -120 100)" />
<rect x="-156" y="92" width="72" height="8" fill="#e05a47" transform="rotate(-10 -120 96)" />
<rect x="-20" y="30" width="26" height="74" rx="8" fill="#8fd0f2" />
<rect x="-15" y="18" width="16" height="16" rx="4" fill="#2f7de1" />
<rect x="70" y="50" width="34" height="66" rx="8" fill="#e04b3f" />
<rect x="70" y="74" width="34" height="14" fill="#f5c542" />
<ellipse cx="150" cy="126" rx="16" ry="26" fill="#ffffff" />
<rect x="-60" y="86" width="40" height="52" rx="6" fill="#e8dfc9" transform="rotate(8 -40 110)" />`, 540, 995, 1.5, 0),
      lapis(`<path d="M -70 60 C -120 10 -70 -50 -40 -110 C -20 -50 20 -60 30 -110 C 65 -50 90 -10 88 40 C 86 90 40 110 0 110 C -35 110 -62 90 -70 60 Z" fill="#e05a47" />
<path d="M -26 62 C -50 20 -14 -20 -4 -60 C 10 -20 46 -4 46 40 C 46 74 16 88 -4 88 C -18 88 -26 78 -26 62 Z" fill="#f5c542" />`, 540, 915, 1.5, -3),
      lapis(`<circle cx="0" cy="0" r="78" fill="#c9d3e0" />
<circle cx="-92" cy="-60" r="54" fill="#d8e0ea" />
<circle cx="86" cy="-76" r="60" fill="#d8e0ea" />
<circle cx="-8" cy="-148" r="56" fill="#c9d3e0" />
<circle cx="-104" cy="-176" r="36" fill="#e2e8f0" />
<circle cx="76" cy="-204" r="32" fill="#e2e8f0" />`, 540, 730, 0.95, 4),
    ],
  },

  asap: {
    label: "Kepulan asap",
    deskripsi: "Asap mengepul dan menyebar. Untuk asap pembakaran.",
    layers: () => [
      lapis(`<circle cx="0" cy="0" r="56" fill="#dfe6ee" />
<circle cx="26" cy="-70" r="64" fill="#d8e0ea" />
<circle cx="-24" cy="-146" r="72" fill="#c9d3e0" />
<circle cx="30" cy="-226" r="80" fill="#d8e0ea" />
<circle cx="-40" cy="-306" r="74" fill="#c9d3e0" />
<circle cx="36" cy="-380" r="58" fill="#e2e8f0" />
<circle cx="-30" cy="-444" r="40" fill="#e2e8f0" />`, 540, 1110, 1.2, 0),
    ],
  },

  udara: {
    label: "Udara tercemar",
    deskripsi: "Orang-orang menghirup udara berisi partikel halus dan asap.",
    layers: () => {
      const hasil = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          hasil.push(wanita(240 + c * 150, 1010 + r * 118, 0.62, 0));
        }
      }
      return hasil.concat([
        lapis(`<circle cx="0" cy="0" r="72" fill="#dfe6ee" opacity="0.92" />
<circle cx="94" cy="-30" r="52" fill="#e8eef4" opacity="0.92" />
<circle cx="-88" cy="-42" r="44" fill="#e8eef4" opacity="0.92" />`, 540, 610, 1.15, 0),
        lapis(`<circle cx="0" cy="0" r="16" fill="#8b8172" />
<circle cx="104" cy="-58" r="12" fill="#a89e8c" />
<circle cx="-108" cy="-44" r="10" fill="#8b8172" />
<circle cx="46" cy="-134" r="13" fill="#a89e8c" />
<circle cx="-64" cy="-158" r="9" fill="#8b8172" />
<circle cx="150" cy="-182" r="10" fill="#a89e8c" />
<circle cx="-166" cy="-124" r="8" fill="#8b8172" />
<circle cx="-8" cy="-216" r="9" fill="#a89e8c" />`, 540, 790, 1.35, 0),
      ]);
    },
  },

  "paru-paru": {
    label: "Paru-paru",
    deskripsi: "Paru-paru dengan partikel yang masuk. Untuk dampak ke pernapasan.",
    layers: () => [
      lapis(`<rect x="-18" y="-230" width="36" height="130" rx="18" fill="#c9d3e0" />
<path d="M 0 -120 C -34 -112 -58 -96 -72 -74 M 0 -120 C 34 -112 58 -96 72 -74" stroke="#c9d3e0" stroke-width="20" fill="none" stroke-linecap="round" />
<path d="M -26 -100 C -110 -120 -190 -70 -196 20 C -202 110 -140 180 -80 170 C -28 162 -26 100 -26 20 Z" fill="#f7a8c4" />
<path d="M 26 -100 C 110 -120 190 -70 196 20 C 202 110 140 180 80 170 C 28 162 26 100 26 20 Z" fill="#f7a8c4" />
<path d="M -40 -40 C -80 -30 -120 0 -130 40 M -40 30 C -80 40 -110 70 -118 110 M 40 -40 C 80 -30 120 0 130 40 M 40 30 C 80 40 110 70 118 110" stroke="#e07a8f" stroke-width="12" fill="none" stroke-linecap="round" />
<circle cx="-104" cy="30" r="13" fill="#6b5b4f" />
<circle cx="-70" cy="86" r="9" fill="#6b5b4f" />
<circle cx="-132" cy="96" r="7" fill="#6b5b4f" />
<circle cx="104" cy="36" r="12" fill="#6b5b4f" />
<circle cx="76" cy="92" r="8" fill="#6b5b4f" />
<circle cx="132" cy="104" r="6" fill="#6b5b4f" />`, 540, 930, 1.4, 0),
      lapis(`<circle cx="0" cy="0" r="10" fill="#6b5b4f" />
<circle cx="48" cy="26" r="7" fill="#6b5b4f" />
<circle cx="-42" cy="34" r="8" fill="#6b5b4f" />
<circle cx="18" cy="70" r="6" fill="#6b5b4f" />`, 540, 640, 1.4, 0),
    ],
  },

  abu: {
    label: "Abu dan residu",
    deskripsi: "Gundukan abu dengan bongkahan logam. Untuk residu pembakaran.",
    layers: () => [
      lapis(`<ellipse cx="0" cy="120" rx="250" ry="30" fill="#ded7c6" />
<path d="M -230 120 C -190 40 -90 0 0 0 C 90 0 200 40 240 120 Z" fill="#a89e8c" />
<path d="M -150 120 C -120 66 -50 42 0 42 C 54 42 130 66 160 120 Z" fill="#c2b7a3" />
<circle cx="-120" cy="96" r="8" fill="#8b8172" />
<circle cx="-40" cy="78" r="7" fill="#8b8172" />
<circle cx="70" cy="92" r="9" fill="#8b8172" />
<circle cx="140" cy="110" r="6" fill="#8b8172" />`, 540, 950, 1.4, 0),
      lapis(`<path d="M -46 -20 L 0 -46 L 46 -20 L 46 24 L 0 50 L -46 24 Z" fill="#6b7a90" />
<path d="M -46 -20 L 0 6 L 46 -20 L 46 24 L 0 50 L -46 24 Z" fill="#8aa0bf" />
<path d="M -46 -20 L 0 6 L 0 50 L -46 24 Z" fill="#5b6a80" />`, 420, 948, 1.2, -10),
      lapis(`<path d="M -40 -18 L 0 -40 L 40 -18 L 40 20 L 0 42 L -40 20 Z" fill="#7a6a5a" />
<path d="M -40 -18 L 0 6 L 40 -18 L 40 20 L 0 42 L -40 20 Z" fill="#9a8a76" />`, 680, 964, 1.0, 14),
    ],
  },

  "tanah-air": {
    label: "Tanah dan air",
    deskripsi: "Residu mencemari tanah dan terbawa air hujan ke saluran air.",
    layers: () => [
      lapis(`<rect x="-250" y="0" width="500" height="150" rx="14" fill="#b09068" />
<path d="M -250 0 C -200 -20 -150 0 -100 -6 C -50 -12 0 6 50 0 C 100 -6 150 8 200 0 C 226 -4 240 0 250 0 L 250 24 L -250 24 Z" fill="#8f9a52" />
<path d="M -250 96 C -180 74 -110 106 -40 88 C 30 70 100 102 170 84 C 200 76 230 82 250 88 L 250 150 L -250 150 Z" fill="#8fd0f2" />
<path d="M -236 120 C -200 108 -170 128 -134 118 C -100 108 -80 128 -50 120 L -50 140 L -236 140 Z" fill="#7a8f5a" opacity="0.85" />
<circle cx="196" cy="126" r="26" fill="#5b6a80" />
<circle cx="196" cy="126" r="13" fill="#3a3f4b" />`, 540, 1080, 1.5, 0),
      lapis(`<path d="M -190 0 C -150 -56 -90 -70 -40 -56 C -10 -48 30 -30 60 0 Z" fill="#a89e8c" />
<circle cx="-120" cy="-18" r="9" fill="#8b8172" />
<circle cx="-60" cy="-32" r="7" fill="#8b8172" />
<circle cx="10" cy="-14" r="8" fill="#8b8172" />`, 390, 1088, 1.3, 0),
      lapis(`${tetes(-150, 0, 1.1)}${tetes(-40, -60, 0.9)}${tetes(80, -10, 1.2)}${tetes(180, -70, 0.8)}`, 540, 860, 1.3, 0),
    ],
  },

  kembali: {
    label: "Kembali ke kita",
    deskripsi: "Asap yang sama kembali ke permukiman. Untuk dampak yang berbalik.",
    layers: () => [
      lapis(`<rect x="-130" y="-20" width="260" height="160" rx="10" fill="#f4efe2" />
<path d="M -160 -20 L 0 -130 L 160 -20 Z" fill="#e05a47" />
<rect x="-46" y="70" width="92" height="70" rx="8" fill="#7a5c9e" />
<rect x="-104" y="26" width="46" height="46" rx="8" fill="#8fd0f2" />
<rect x="58" y="26" width="46" height="46" rx="8" fill="#8fd0f2" />`, 560, 1050, 1.55, 0),
      lapis(`<circle cx="0" cy="0" r="42" fill="#c9d3e0" />
<circle cx="70" cy="-26" r="52" fill="#d8e0ea" />
<circle cx="142" cy="-54" r="44" fill="#c9d3e0" />
<circle cx="206" cy="-74" r="32" fill="#e2e8f0" />`, 200, 900, 1.25, 0),
      lapis(`<circle cx="0" cy="0" r="30" fill="#dfe6ee" />
<circle cx="46" cy="-18" r="34" fill="#e8eef4" />
<circle cx="94" cy="-34" r="26" fill="#e2e8f0" />`, 400, 846, 1.0, 0),
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
