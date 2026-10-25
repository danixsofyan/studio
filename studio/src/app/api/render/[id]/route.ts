import { NextResponse } from "next/server";
import { jsonError, withUser } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { id } = await params;
  const { data: job, error: dbError } = await supabase
    .from("render_jobs")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (dbError) return jsonError(dbError.message, 500);
  if (!job) return jsonError("Job tidak ditemukan.", 404);

  let url: string | null = null;
  if (job.result_asset_id) {
    const { data: asset } = await supabase
      .from("assets")
      .select("*")
      .eq("id", job.result_asset_id)
      .maybeSingle();
    if (asset) {
      const { data: signed } = await supabase.storage
        .from(asset.bucket)
        .createSignedUrl(asset.path, 60 * 60 * 4);
      url = signed?.signedUrl ?? null;
    }
  }

  const { data: thumbnails } = await supabase
    .from("assets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("kind", "thumbnail")
    .like("path", `${user.id}/thumbnails/${job.video_id}/%`)
    .order("path", { ascending: true });

  const snapshots = (
    await Promise.all(
      (thumbnails ?? []).map(async (a) => {
        const { data: signed } = await supabase.storage
          .from(a.bucket)
          .createSignedUrl(a.path, 60 * 60 * 4);
        return signed?.signedUrl ?? null;
      }),
    )
  ).filter((x): x is string => Boolean(x));

  return NextResponse.json({ job, url, snapshots });
}
