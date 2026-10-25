/* Penyusun HTML: scene, caption, watermark, dan index.
   Semua file yang dihasilkan diberi tanda "dibuat otomatis". */

import { bagiPop, bulat } from "./waktu.mjs";

const TANDA = "<!-- dibuat otomatis oleh `npm run buat` — jangan diedit manual -->";

export function esc(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ukuranJudul(teks) {
  const n = String(teks).replace("{angka}", "000").length;
  if (n <= 8) return 180;
  if (n <= 12) return 150;
  if (n <= 17) return 130;
  if (n <= 22) return 110;
  if (n <= 28) return 92;
  return 78;
}

function ukuranPill(teks) {
  const n = String(teks).length;
  if (n <= 12) return 58;
  if (n <= 17) return 52;
  if (n <= 23) return 46;
  if (n <= 29) return 40;
  return 36;
}

function hias(teks, pink, prefix) {
  const adaAngka = String(teks).includes("{angka}");
  let hasil = esc(teks);

  if (pink && !adaAngka) {
    const posisi = String(teks).toLowerCase().indexOf(String(pink).toLowerCase());
    if (posisi >= 0) {
      const sebelum = esc(String(teks).slice(0, posisi));
      const kena = esc(String(teks).slice(posisi, posisi + pink.length));
      const sesudah = esc(String(teks).slice(posisi + pink.length));
      hasil = `${sebelum}<em>${kena}</em>${sesudah}`;
    }
  }

  if (adaAngka) {
    hasil = hasil.replace(/\{angka\}/g, `<span id="${prefix}-num">0</span>`);
  }

  return hasil;
}

function kepala(kelas, prefix, latar) {
  return `      @font-face {
        font-family: "Instrument Serif";
        src: url("assets/fonts/InstrumentSerif-Italic.ttf") format("truetype");
        font-style: italic;
        font-display: block;
      }
      #root {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: ${latar === "ilustrasi" ? "#efe9dd" : "#000000"};
        font-family: "Inter", sans-serif;
      }
      #${prefix}-cam {
        position: absolute;
        inset: 0;
      }
      #${prefix}-cam video {
        position: absolute;
        left: 0;
        top: 0;
        width: 1080px;
        height: 1920px;
        object-fit: cover;
      }
      .${prefix}-shade {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 30%, rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0) 55%);
      }
      #${prefix}-clip svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .${prefix}-hl {
        position: absolute;
        left: 0;
        right: 0;
        padding: 0 40px;
        text-align: center;
        font-family: "Instrument Serif", serif;
        font-style: italic;
        line-height: 1;
        letter-spacing: -0.01em;
        white-space: nowrap;
        color: #fff8ec;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 214, 150, 0.85), 0 0 60px rgba(255, 190, 120, 0.45);
      }
      .${prefix}-hl.dark {
        color: #2b2321;
        text-shadow: none;
      }
      .${prefix}-hl em {
        font-style: italic;
        color: #ffc2d8;
      }
      .${prefix}-hl.dark em {
        color: #d6456f;
      }
      .${prefix}-tag {
        position: absolute;
        padding: 9px 24px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.55);
        color: #8a837b;
        font-weight: 800;
        font-size: 34px;
        letter-spacing: 0.01em;
        white-space: nowrap;
      }
      .${kelas} {}`;
}

function filterStiker(prefix) {
  return `        <defs>
          <filter id="${prefix}-stk" x="-30%" y="-30%" width="160%" height="170%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="grow" />
            <feFlood flood-color="#ffffff" />
            <feComposite in2="grow" operator="in" result="edge" />
            <feMerge result="cut"><feMergeNode in="edge" /><feMergeNode in="SourceGraphic" /></feMerge>
            <feDropShadow in="cut" dx="0" dy="10" stdDeviation="0" flood-color="#000000" flood-opacity="0.25" />
          </filter>
        </defs>`;
}

function layerSvg(layers, prefix, durasiSuara) {
  const waktu = bagiPop(layers.length, durasiSuara);
  const isi = layers
    .map((layer, i) => {
      if (!layer.includes("{POP}")) {
        throw new Error("Layer ilustrasi tidak punya penanda {POP}.");
      }
      return layer.replace(/__ID__/g, prefix).replace(/\{POP\}/g, String(waktu[i]));
    })
    .join("\n");
  return `${filterStiker(prefix)}\n${isi}`;
}

function labelHtml(label, prefix, latar, durasiSuara) {
  if (!Array.isArray(label) || label.length === 0) return "";
  const bawaan =
    latar === "ilustrasi"
      ? [
          { kiri: 200, atas: 1060 },
          { kiri: 640, atas: 1005 },
        ]
      : [{ kiri: 640, atas: 1100 }];

  return label
    .map((l, i) => {
      const item = typeof l === "string" ? { teks: l } : l;
      const pos = bawaan[i] ?? bawaan[bawaan.length - 1];
      const kiri = typeof item.kiri === "number" ? item.kiri : pos.kiri;
      const atas = typeof item.atas === "number" ? item.atas : pos.atas;
      const rot = typeof item.rot === "number" ? item.rot : 0;
      const waktu = bulat(Math.min(1.6, durasiSuara * 0.35) + i * 0.45);
      const kecil = String(item.teks).length > 18 ? "font-size:28px;" : "";
      return `      <div class="${prefix}-tag" data-pop="${waktu}" data-rot="${rot}" data-layout-allow-overflow style="left:${kiri}px;top:${atas}px;${kecil}">${esc(item.teks)}</div>`;
    })
    .join("\n");
}

function judulHtml(judul, prefix, latar, durasiSuara) {
  if (!Array.isArray(judul) || judul.length === 0) return "";
  return judul
    .map((j) => {
      const angka = j.teks.trim() === "{angka}";
      const ukuran = j.ukuran ?? (angka ? 320 : ukuranJudul(j.teks));
      const atas = j.atas ?? (angka ? 540 : 360);
      const hl =
        j.keluar === null || j.keluar === undefined
          ? String(j.masuk)
          : `${j.masuk},${j.keluar}`;
      const kelas = latar === "ilustrasi" ? ` class="${prefix}-hl dark"` : ` class="${prefix}-hl"`;
      return `      <div${kelas} data-hl="${hl}" data-layout-allow-overlap style="top:${atas}px;font-size:${ukuran}px">${hias(j.teks, j.pink, prefix)}</div>`;
    })
    .join("\n");
}

export function sceneHtml(cfg) {
  const {
    id,
    durasi,
    durasiSuara,
    latar,
    media,
    ilustrasi = [],
    stiker = [],
    judul = [],
    hitung = null,
    label = [],
    pink = null,
    index,
  } = cfg;

  const prefix = id;
  const layers = [...ilustrasi, ...stiker];
  const adaSvg = layers.length > 0;

  const beats = judul.map((j) => ({ ...j, pink: j.pink ?? pink }));

  const cam = media
    ? `      <div id="${prefix}-cam" data-layout-allow-overflow>
        <video id="${prefix}-v" class="clip" src="${media.file}" data-start="0" data-duration="${durasi}" data-media-start="${media.mulai ?? 0}" data-playback-rate="${media.kecepatan ?? 1}" data-track-index="0" muted playsinline></video>
      </div>
      <div class="${prefix}-shade"></div>`
    : "";

  const zonaHitung = hitung
    ? `        var n = { v: 0 };
        tl.to(n, { v: ${Number(hitung.ke)}, duration: ${Number(hitung.durasi ?? 0.9)}, ease: "power2.out", onUpdate: function () {
          var el = document.getElementById("${prefix}-num");
          if (el) el.textContent = Math.round(n.v);
        } }, ${Number(hitung.mulai ?? 0.8)});`
    : "";

  const zoom = media
    ? `        tl.fromTo("#${prefix}-cam", { scale: 1, transformOrigin: "50% 50%" }, { scale: ${Number(media.zoom ?? 1.08)}, duration: ${durasi}, ease: "none" }, 0);`
    : "";

  return `<template>
  ${TANDA}
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
    <style>
${kepala(`${prefix}-scene`, prefix, latar)}
    </style>
${cam}
    <div id="${prefix}-clip" class="clip" data-start="0" data-duration="${durasi}" data-track-index="1">
      ${
        adaSvg
          ? `<svg viewBox="0 0 1080 1920" aria-hidden="true" data-layout-ignore>
${layerSvg(layers, prefix, durasiSuara)}
      </svg>`
          : ""
      }
${judulHtml(beats, prefix, latar, durasiSuara)}
${labelHtml(label, prefix, latar, durasiSuara)}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script src="assets/pop.js"></script>
    <script>
      (function () {
        var root = document.querySelector('[data-composition-id="${id}"]');
        var tl = gsap.timeline({ paused: true });
        window.pop.scene(tl, root, ${durasi});
${zoom}
        root.querySelectorAll("[data-hl]").forEach(function (el) {
          var t = el.getAttribute("data-hl").split(",").map(parseFloat);
          if (t[0] > 0) tl.fromTo(el, { opacity: 0, filter: "blur(10px)", scale: 1.06 },
            { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.25, ease: "power3.out" }, t[0]);
          if (t[1]) tl.to(el, { opacity: 0, filter: "blur(8px)", duration: 0.18, ease: "power2.in" }, t[1]);
        });
${zonaHitung}
        window.__timelines = window.__timelines || {};
        window.__timelines["${id}"] = tl;
      })();
    </script>
  </div>
</template>
`;
}

export function captionsHtml(grup, durasi) {
  const div = grup
    .map((g, i) => {
      const teks = g.kata.map((k) => k.teks).join(" ");
      const span = g.kata
        .map(
          (k, j) =>
            `<span class="w${k.panas ? " hot" : ""}" id="cap-${i}-w${j}">${esc(k.teks)}</span>`,
        )
        .join(" ");
      return `      <div class="cap" id="cap-${i}"><span class="pill" style="font-size:${ukuranPill(teks)}px">${span}</span></div>`;
    })
    .join("\n");

  const panggilan = grup
    .map((g, i) => {
      const kata = g.kata.map((k) => k.mulai).join(", ");
      const selesai = bulat(g.selesai);
      return `        cap("#cap-${i}", ${g.mulai}, ${selesai}, [${kata}]);`;
    })
    .join("\n");

  return `<template>
  ${TANDA}
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
    <style>
      #root {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      #cap-clip {
        position: absolute;
        inset: 0;
      }
      .cap {
        position: absolute;
        left: 60px;
        right: 60px;
        top: 1365px;
        text-align: center;
        opacity: 0;
      }
      .pill {
        display: inline-block;
        padding: 12px 28px 14px;
        border-radius: 22px;
        background: rgba(24, 22, 22, 0.78);
        font-family: "Inter", sans-serif;
        font-weight: 800;
        line-height: 1.15;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.45);
      }
    </style>
    <div id="cap-clip" class="clip" data-start="0" data-duration="${durasi}" data-track-index="0">
${div}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
        // pill muncul di kata pertama; tiap kata menyala saat dibacakan
        function cap(id, start, end, words) {
          tl.fromTo(id, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(2)" }, start);
          words.forEach(function (t, j) {
            var hot = document.querySelector(id + "-w" + j).classList.contains("hot");
            tl.to(id + "-w" + j, { color: hot ? "#ffd27a" : "#ffffff", duration: 0.06, ease: "none" }, t);
          });
          tl.to(id, { opacity: 0, duration: 0.08, ease: "power2.in" }, end - 0.08);
          tl.set(id, { opacity: 0, visibility: "hidden" }, end);
        }
${panggilan}
        window.__timelines = window.__timelines || {};
        window.__timelines["captions"] = tl;
      })();
    </script>
  </div>
</template>
`;
}

export function watermarkHtml(pergantian, total) {
  const awal = pergantian[0]?.mode ?? "terang";
  const putihAwal = awal === "terang";
  const set = pergantian
    .slice(1)
    .map(({ waktu, mode }) => {
      const terang = mode === "terang";
      return `        tl.set("#wm-white", { opacity: ${terang ? 0.8 : 0} }, ${waktu});\n        tl.set("#wm-color", { opacity: ${terang ? 0 : 0.9} }, ${waktu});`;
    })
    .join("\n");

  return `<template>
  ${TANDA}
  <div id="root" data-composition-id="watermark" data-width="1080" data-height="1920">
    <style>
      #root {
        position: absolute;
        inset: 0;
      }
      #wm-clip {
        position: absolute;
        inset: 0;
      }
      /* tengah atas, di bawah bilah aplikasi. Putih di atas footage,
         warna asli logo di atas latar krem. Tanpa kotak, tanpa bayangan. */
      .wm {
        position: absolute;
        top: 205px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 170px;
        height: auto;
      }
      #wm-white {
        opacity: ${putihAwal ? 0.8 : 0};
      }
      #wm-color {
        opacity: ${putihAwal ? 0 : 0.9};
      }
    </style>
    <div id="wm-clip" class="clip" data-start="0" data-duration="${total}" data-track-index="0">
      <img id="wm-white" class="wm" src="assets/img/logo-sedarikini-putih.png" alt="" />
      <img id="wm-color" class="wm" src="assets/img/logo-sedarikini.png" alt="" />
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        var tl = gsap.timeline({ paused: true });
        // ganti ke logo berwarna saat scene ilustrasi krem tampil
${set}
        window.__timelines["watermark"] = tl;
      })();
    </script>
  </div>
</template>
`;
}

export function indexHtml({ adegan, total, durasiVo, audio }) {
  const host = adegan
    .map(
      (s) => `      <div
        id="${s.id}"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-start="${s.mulai}"
        data-duration="${s.durasi}"
        data-track-index="1"
        data-track-kind="graphics"
        data-width="1080"
        data-height="1920"
      ></div>`,
    )
    .join("\n");

  return `<!doctype html>
${TANDA}
<html lang="id" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: #000000;
      }
      #root {
        position: relative;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${host}
      <div
        id="captions"
        data-composition-id="captions"
        data-composition-src="compositions/captions.html"
        data-start="0"
        data-duration="${durasiVo}"
        data-track-index="2"
        data-track-kind="captions"
        data-width="1080"
        data-height="1920"
        style="z-index: 5"
      ></div>
      <div
        id="watermark"
        data-composition-id="watermark"
        data-composition-src="compositions/watermark.html"
        data-start="0"
        data-duration="${total}"
        data-track-index="4"
        data-track-kind="graphics"
        data-width="1080"
        data-height="1920"
        style="z-index: 6"
      ></div>
      <audio id="vo" class="clip" src="${audio}" data-start="0" data-track-index="3" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
}
