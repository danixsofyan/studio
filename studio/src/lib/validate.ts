import { ILUSTRASI_KEYS } from "./illustrations";
import type { Asset, Scene, Video } from "./types";

export type Issue = {
  level: "error" | "warning";
  scene?: number;
  message: string;
};

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);

const norm = (text: string) =>
  text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Panjang VO. Kalau belum ada VO, pakai 2,4 kata/detik sebagai perkiraan. */
export function durationOf(video: Video, voDuration: number | null) {
  if (voDuration && voDuration > 0) return voDuration;
  const total = video.scenes.reduce((n, s) => n + words(s.teks).length, 0);
  return Math.max(4, total / 2.4);
}

/** Bagi durasi ke tiap scene, proporsional terhadap jumlah kata (sama dengan mesin). */
export function splitDuration(scenes: Scene[], total: number) {
  const weights = scenes.map((s) => Math.max(1, words(s.teks).length));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  let used = 0;
  return scenes.map((scene, index) => {
    const isLast = index === scenes.length - 1;
    const ms = isLast ? Math.round(total * 1000) - used : Math.round((total * 1000 * weights[index]) / sum);
    const start = used / 1000;
    used += ms;
    return { scene, start, duration: ms / 1000, end: used / 1000 };
  });
}

export function validate(video: Video, assets: Asset[], voDuration: number | null) {
  const issues: Issue[] = [];
  const footageIds = new Set(assets.filter((a) => a.kind === "footage").map((a) => a.id));

  if (!video.title.trim()) {
    issues.push({ level: "error", message: "Judul video belum diisi." });
  }

  if (video.scenes.length === 0) {
    issues.push({ level: "error", message: "Belum ada scene. Tambahkan minimal satu." });
  }

  if (!video.vo_asset_id) {
    issues.push({
      level: "warning",
      message: "VO belum digenerate. Panjang video masih perkiraan.",
    });
  }

  video.scenes.forEach((scene, index) => {
    const n = index + 1;
    const text = scene.teks.trim();

    if (!text) {
      issues.push({ level: "error", scene: n, message: `Scene ${n}: narasi masih kosong.` });
    }

    if (scene.jenis === "klip") {
      if (!scene.klip) {
        issues.push({ level: "error", scene: n, message: `Scene ${n}: footage belum dipilih.` });
      } else if (!footageIds.has(scene.klip)) {
        issues.push({
          level: "error",
          scene: n,
          message: `Scene ${n}: footage tidak ada di library.`,
        });
      }
    } else if (!scene.ilustrasi?.length) {
      issues.push({
        level: "error",
        scene: n,
        message: `Scene ${n}: pilih minimal satu ilustrasi.`,
      });
    }

    for (const key of [...(scene.ilustrasi ?? []), ...(scene.stiker ?? [])]) {
      if (!ILUSTRASI_KEYS.has(key)) {
        issues.push({
          level: "error",
          scene: n,
          message: `Scene ${n}: ilustrasi "${key}" tidak dikenal.`,
        });
      }
    }

    const headlines = (scene.judul ?? []).map((h) => (typeof h === "string" ? h : h.teks));
    if (headlines.some((h) => h.length > 46)) {
      issues.push({
        level: "warning",
        scene: n,
        message: `Scene ${n}: judul lebih dari 46 karakter, berisiko terpotong.`,
      });
    }

    if (scene.hitung) {
      if (!headlines.some((h) => h.includes("{angka}"))) {
        issues.push({
          level: "error",
          scene: n,
          message: `Scene ${n}: ada angka berjalan, tapi judul tidak punya {angka}.`,
        });
      }
      if (!Number.isFinite(scene.hitung.ke)) {
        issues.push({
          level: "error",
          scene: n,
          message: `Scene ${n}: angka tujuan belum diisi.`,
        });
      }
    }

    if (scene.pink) {
      const target = norm(scene.pink);
      if (!headlines.some((h) => norm(h).includes(target))) {
        issues.push({
          level: "warning",
          scene: n,
          message: `Scene ${n}: kata pink "${scene.pink}" tidak ada di judul.`,
        });
      }
    }

    for (const keyword of scene.kata_kunci ?? []) {
      const target = norm(keyword);
      if (target && !norm(text).includes(target)) {
        issues.push({
          level: "warning",
          scene: n,
          message: `Scene ${n}: kata kunci "${keyword}" tidak ada di narasi.`,
        });
      }
    }

    if (scene.jenis === "klip" && headlines.length === 0 && !(scene.stiker ?? []).length) {
      issues.push({
        level: "warning",
        scene: n,
        message: `Scene ${n}: footage tanpa judul dan tanpa stiker akan terasa kosong.`,
      });
    }
  });

  const total = durationOf(video, voDuration);
  if (video.scenes.length > 0 && total / video.scenes.length < 1.1) {
    issues.push({
      level: "warning",
      message: "Rata-rata scene di bawah 1,1 detik. Pertimbangkan menggabungkan kalimat.",
    });
  }

  return issues;
}

export function statusCount(issues: Issue[]) {
  return {
    errors: issues.filter((i) => i.level === "error").length,
    warnings: issues.filter((i) => i.level === "warning").length,
  };
}
