import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const skema = z.object({
  duration: z.number().nonnegative().nullable().optional(),
  thumb_path: z.string().trim().max(500).nullable().optional(),
  name: z.string().trim().min(1).max(200).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Data tidak valid.");

  const { data, error: dbError } = await supabase
    .from("assets")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return NextResponse.json({ asset: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { id } = await params;

  const { data: asset, error: dbError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (dbError) return jsonError(dbError.message, 500);
  if (!asset) return jsonError("Asset tidak ditemukan.", 404);

  if (asset.kind === "footage") {
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title, scenes")
      .eq("owner_id", user.id);

    const dipakai = (videos ?? []).filter((v) =>
      Array.isArray(v.scenes) && v.scenes.some((s: { klip?: string }) => s?.klip === id),
    );

    if (dipakai.length > 0) {
      return jsonError(
        `Footage ini masih dipakai di ${dipakai.length} video: ${dipakai
          .map((v) => v.title)
          .slice(0, 3)
          .join(", ")}. Ganti dulu di editor sebelum menghapus.`,
        409,
      );
    }
  }

  const paths = [asset.path];
  if (asset.thumb_path) paths.push(asset.thumb_path);

  await supabase.storage.from(asset.bucket).remove(paths);

  const { error: hapusError } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (hapusError) return jsonError(hapusError.message, 500);
  return NextResponse.json({ ok: true });
}
