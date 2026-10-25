import { createClient } from "./supabase/server";
import type { Asset, RenderJob, Video } from "./types";

export type VideoRingkas = {
  video: Video;
  sceneCount: number;
  wordCount: number;
  renderUrl: string | null;
  thumbUrl: string | null;
  job: RenderJob | null;
};

export async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function signed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  path: string | null | undefined,
) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 4);
  return data?.signedUrl ?? null;
}

export async function listVideos(): Promise<VideoRingkas[]> {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from("videos")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!videos?.length) return [];

  const ids = videos.map((v) => v.id as string);

  const [{ data: jobs }, { data: assets }] = await Promise.all([
    supabase
      .from("render_jobs")
      .select("*")
      .in("video_id", ids)
      .order("created_at", { ascending: false }),
    supabase.from("assets").select("*").in("kind", ["render", "thumbnail"]),
  ]);

  const assetById = new Map<string, Asset>((assets ?? []).map((a) => [a.id as string, a as Asset]));
  const jobByVideo = new Map<string, RenderJob>();
  for (const job of (jobs ?? []) as RenderJob[]) {
    if (!jobByVideo.has(job.video_id)) jobByVideo.set(job.video_id, job);
  }

  return Promise.all(
    videos.map(async (raw) => {
      const video = raw as Video;
      const job = jobByVideo.get(video.id) ?? null;
      const render = job?.result_asset_id ? assetById.get(job.result_asset_id) : null;

      const [renderUrl, thumbUrl] = await Promise.all([
        render ? signed(supabase, render.bucket, render.path) : null,
        render?.thumb_path ? signed(supabase, render.bucket, render.thumb_path) : null,
      ]);

      return {
        video,
        sceneCount: Array.isArray(video.scenes) ? video.scenes.length : 0,
        wordCount: Array.isArray(video.scenes)
          ? video.scenes.reduce(
              (n, s) => n + String(s.teks ?? "").trim().split(/\s+/).filter(Boolean).length,
              0,
            )
          : 0,
        renderUrl,
        thumbUrl,
        job,
      };
    }),
  );
}

export async function getVideo(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Video | null) ?? null;
}

export type EditorData = {
  video: Video;
  assets: Asset[];
  footage: Array<Asset & { thumbUrl: string | null }>;
  audio: Asset | null;
  audioUrl: string | null;
  latestJob: RenderJob | null;
  render: Asset | null;
  renderUrl: string | null;
  snapshots: string[];
};

export async function getEditorData(id: string): Promise<EditorData | null> {
  const supabase = await createClient();
  const video = await getVideo(id);
  if (!video) return null;

  const [{ data: assetRows }, { data: jobRows }] = await Promise.all([
    supabase.from("assets").select("*").order("created_at", { ascending: false }),
    supabase
      .from("render_jobs")
      .select("*")
      .eq("video_id", id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const assets = (assetRows ?? []) as Asset[];
  const jobs = (jobRows ?? []) as RenderJob[];
  const latestJob = jobs[0] ?? null;

  const footageRows = assets.filter((a) => a.kind === "footage");
  const audio = assets.find((a) => a.id === video.vo_asset_id) ?? null;

  const renderAssetIds = new Set(
    jobs.map((j) => j.result_asset_id).filter((x): x is string => Boolean(x)),
  );
  const render =
    [...assets]
      .filter((a) => a.kind === "render" && renderAssetIds.has(a.id))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;

  const snapshotRows = assets
    .filter(
      (a) =>
        a.kind === "thumbnail" &&
        a.path.startsWith(`${video.owner_id}/thumbnails/${video.id}/`),
    )
    .sort((a, b) => a.path.localeCompare(b.path));

  const [footage, audioUrl, renderUrl, snapshots] = await Promise.all([
    Promise.all(
      footageRows.map(async (a) => ({
        ...a,
        thumbUrl: a.thumb_path ? await signed(supabase, a.bucket, a.thumb_path) : null,
      })),
    ),
    audio ? signed(supabase, audio.bucket, audio.path) : null,
    render ? signed(supabase, render.bucket, render.path) : null,
    Promise.all(snapshotRows.map((a) => signed(supabase, a.bucket, a.path))),
  ]);

  return {
    video,
    assets,
    footage,
    audio,
    audioUrl,
    latestJob,
    render,
    renderUrl,
    snapshots: snapshots.filter((x): x is string => Boolean(x)),
  };
}

export async function listLibrary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .in("kind", ["footage", "audio"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const assets = (data ?? []) as Asset[];
  const withUrl = await Promise.all(
    assets.map(async (a) => ({
      ...a,
      thumbUrl: a.thumb_path ? await signed(supabase, a.bucket, a.thumb_path) : null,
      url: await signed(supabase, a.bucket, a.path),
    })),
  );

  return {
    footage: withUrl.filter((a) => a.kind === "footage"),
    audio: withUrl.filter((a) => a.kind === "audio"),
  };
}

export async function getProfile() {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}
