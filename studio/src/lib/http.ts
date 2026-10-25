import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null as null, error: jsonError("Belum masuk.", 401) };
  }

  return { supabase, user, error: null };
}
