import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const adegan = z.object({
  id: z.string(),
  teks: z.string(),
  jenis: z.enum(["klip", "ilustrasi"]),
  klip: z.string().nullable().optional(),
  ilustrasi: z.array(z.string()).optional(),
  stiker: z.array(z.string()).optional(),
  judul: z
    .array(
      z.union([
        z.string(),
        z.object({
          teks: z.string(),
          masuk: z.number().optional(),
          keluar: z.number().optional(),
          atas: z.number().optional(),
          ukuran: z.number().optional(),
        }),
      ]),
    )
    .optional(),
  pink: z.string().optional(),
  kata_kunci: z.array(z.string()).optional(),
  label: z.array(z.string()).optional(),
  hitung: z
    .object({
      ke: z.number(),
      mulai: z.number().optional(),
      durasi: z.number().optional(),
      dari: z.number().optional(),
    })
    .optional(),
  mulai_media: z.number().optional(),
  kecepatan: z.number().optional(),
});

const skema = z.object({
  title: z.string().trim().min(1, "Judul belum diisi.").max(120).optional(),
  script: z.string().max(6000).optional(),
  scenes: z.array(adegan).max(80).optional(),
  tail: z.number().min(0).max(10).optional(),
  voice_id: z.string().max(80).nullable().optional(),
  vo_asset_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draf", "siap", "render", "selesai"]).optional(),
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
    .from("videos")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return NextResponse.json({ video: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const { id } = await params;
  const { error: dbError } = await supabase
    .from("videos")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (dbError) return jsonError(dbError.message, 500);
  return NextResponse.json({ ok: true });
}
