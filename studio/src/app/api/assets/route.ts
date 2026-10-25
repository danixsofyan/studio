import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";
import type { Asset } from "@/lib/types";

const skema = z.object({
  kind: z.enum(["footage", "audio", "render", "thumbnail"]),
  name: z.string().trim().min(1).max(200),
  bucket: z.enum(["footage", "audio", "renders", "thumbnails"]),
  path: z.string().trim().min(1).max(500),
  thumb_path: z.string().trim().max(500).nullable().optional(),
  size: z.number().nonnegative().nullable().optional(),
  duration: z.number().nonnegative().nullable().optional(),
  width: z.number().int().nonnegative().nullable().optional(),
  height: z.number().int().nonnegative().nullable().optional(),
});

export async function POST(request: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Data tidak valid.");

  const data = parsed.data;
  if (!data.path.startsWith(`${user.id}/`)) {
    return jsonError("Path harus berada di folder pengguna.", 403);
  }
  if (data.thumb_path && !data.thumb_path.startsWith(`${user.id}/`)) {
    return jsonError("Path thumbnail harus berada di folder pengguna.", 403);
  }

  const { data: asset, error: dbError } = await supabase
    .from("assets")
    .insert({ ...data, owner_id: user.id })
    .select()
    .single();

  if (dbError) {
    if (dbError.code === "23505") {
      const { data: ada } = await supabase
        .from("assets")
        .select("*")
        .eq("bucket", data.bucket)
        .eq("path", data.path)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (ada) return NextResponse.json({ asset: ada as Asset });
    }
    return jsonError(dbError.message, 500);
  }

  return NextResponse.json({ asset }, { status: 201 });
}
