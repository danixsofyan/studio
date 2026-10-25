import { NextResponse } from "next/server";
import { withUser } from "@/lib/http";

const API = "https://api.elevenlabs.io/v1";

export async function GET() {
  const { error } = await withUser();
  if (error) return error;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      voices: [],
      message: "ELEVENLABS_API_KEY belum diisi di server.",
    });
  }

  try {
    const res = await fetch(`${API}/voices`, {
      headers: { "xi-api-key": apiKey },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const pesan =
        res.status === 401
          ? "API key salah atau sudah dicabut."
          : res.status === 403
            ? "Plan tidak mendukung fitur ini."
            : `ElevenLabs mengembalikan HTTP ${res.status}.`;
      return NextResponse.json({ configured: true, voices: [], message: pesan });
    }

    const data = await res.json();
    const voices = (data.voices ?? []).map(
      (v: {
        voice_id: string;
        name: string;
        category?: string;
        labels?: Record<string, string>;
        preview_url?: string;
      }) => ({
        id: v.voice_id,
        name: v.name,
        category: v.category ?? "",
        language: v.labels?.language ?? v.labels?.accent ?? "",
        preview: v.preview_url ?? null,
        clone: (v.category ?? "").toLowerCase().includes("clon"),
      }),
    );

    return NextResponse.json({ configured: true, voices });
  } catch {
    return NextResponse.json({
      configured: true,
      voices: [],
      message: "Gagal menghubungi ElevenLabs.",
    });
  }
}
