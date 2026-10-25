export type SceneType = "klip" | "ilustrasi";

export type HeadlineLine = {
  teks: string;
  masuk?: number;
  keluar?: number;
  atas?: number;
  ukuran?: number;
};

export type CountUp = {
  ke: number;
  mulai?: number;
  durasi?: number;
  dari?: number;
};

export type Scene = {
  id: string;
  teks: string;
  jenis: SceneType;
  /** id asset footage; worker memetakan ke file di folder footage/ */
  klip?: string;
  ilustrasi?: string[];
  stiker?: string[];
  judul?: Array<string | HeadlineLine>;
  pink?: string;
  kata_kunci?: string[];
  label?: string[];
  hitung?: CountUp;
  mulai_media?: number;
  kecepatan?: number;
};

export type VideoStatus = "draf" | "siap" | "render" | "selesai";

export type Video = {
  id: string;
  owner_id: string;
  title: string;
  status: VideoStatus;
  script: string;
  scenes: Scene[];
  tail: number;
  vo_asset_id: string | null;
  voice_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetKind = "footage" | "audio" | "render" | "thumbnail";

export type Asset = {
  id: string;
  owner_id: string;
  kind: AssetKind;
  name: string;
  bucket: string;
  path: string;
  thumb_path: string | null;
  size: number | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type JobStatus = "antre" | "dikerjakan" | "selesai" | "gagal";

export type RenderJob = {
  id: string;
  owner_id: string;
  video_id: string;
  status: JobStatus;
  progress: number;
  log: string;
  result_asset_id: string | null;
  error: string | null;
  worker: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  voice_id: string | null;
  voice_model: string | null;
  voice_settings: Record<string, unknown> | null;
};
