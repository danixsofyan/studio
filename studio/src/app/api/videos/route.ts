import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const skema = z.object({
  title: z.string().trim().min(1, "Judul belum diisi.").max(120),
});

export async function POST(request: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Data tidak valid.");

  const { data, error: dbError } = await supabase
    .from("videos")
    .insert({
      owner_id: user.id,
      title: parsed.data.title,
      status: "draf",
      script: "",
      scenes: [],
      tail: 2.6,
    })
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return NextResponse.json({ video: data }, { status: 201 });
}
