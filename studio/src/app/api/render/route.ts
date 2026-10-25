import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const skema = z.object({ videoId: z.string().uuid() });

export async function POST(request: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError("Video tidak valid.");

  const { data: video, error: dbError } = await supabase
    .from("videos")
    .select("*")
    .eq("id", parsed.data.videoId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (dbError) return jsonError(dbError.message, 500);
  if (!video) return jsonError("Video tidak ditemukan.", 404);

  if (!Array.isArray(video.scenes) || video.scenes.length === 0) {
    return jsonError("Belum ada scene untuk dirender.");
  }

  const { data: aktif } = await supabase
    .from("render_jobs")
    .select("*")
    .eq("video_id", video.id)
    .in("status", ["antre", "dikerjakan"])
    .maybeSingle();

  if (aktif) {
    return NextResponse.json(
      { job: aktif, pesan: "Video ini sudah ada di antrean render." },
      { status: 409 },
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("render_jobs")
    .insert({
      owner_id: user.id,
      video_id: video.id,
      status: "antre",
      progress: 0,
      log: "",
    })
    .select()
    .single();

  if (jobError) return jsonError(jobError.message, 500);

  await supabase
    .from("videos")
    .update({ status: "render" })
    .eq("id", video.id)
    .eq("owner_id", user.id);

  return NextResponse.json({ job }, { status: 202 });
}
