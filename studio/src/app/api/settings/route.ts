import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const skema = z.object({
  voice_id: z.string().max(80).nullable().optional(),
  voice_model: z.string().max(80).optional(),
  voice_settings: z
    .object({
      stability: z.number().min(0).max(1).optional(),
      similarity_boost: z.number().min(0).max(1).optional(),
      style: z.number().min(0).max(1).optional(),
      use_speaker_boost: z.boolean().optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Data tidak valid.");

  const { data, error: dbError } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .select()
    .single();

  if (dbError) return jsonError(dbError.message, 500);
  return NextResponse.json({ profile: data });
}
