import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, withUser } from "@/lib/http";

const skema = z.object({
  videoId: z.string().uuid(),
  text: z.string().max(4800).optional(),
  voiceId: z.string().max(80).optional(),
});

const API = "https://api.elevenlabs.io/v1";

export async function POST(request: Request) {
  const { supabase, user, error } = await withUser();
  if (error) return error;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return jsonError(
      "ELEVENLABS_API_KEY belum diisi di server. Tambahkan di .env.local (lokal) atau Environment Variables Vercel.",
      503,
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = skema.safeParse(body);
  if (!parsed.success) return jsonError("Data VO tidak valid.");

  const { data: video, error: dbError } = await supabase
    .from("videos")
    .select("*")
    .eq("id", parsed.data.videoId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (dbError) return jsonError(dbError.message, 500);
  if (!video) return jsonError("Video tidak ditemukan.", 404);

  const text = (parsed.data.text ?? video.script ?? "").trim();
  if (!text) return jsonError("Naskah masih kosong. Tulis narasi dulu.");
  if (text.length > 4800) {
    return jsonError(
      `Naskah ${text.length} karakter. Batas satu permintaan 4.800 karakter; ringkas atau pecah videonya.`,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const voiceId =
    parsed.data.voiceId ||
    profile?.voice_id ||
    video.voice_id ||
    process.env.ELEVENLABS_VOICE_ID;

  if (!voiceId) {
    return jsonError(
      "Voice ID belum diatur. Buka Pengaturan → pilih suara clone ElevenLabs.",
      400,
    );
  }

  const modelId = profile?.voice_model || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  const voiceSettings = profile?.voice_settings || {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.25,
    use_speaker_boost: true,
  };

  let audio: ArrayBuffer;
  try {
    const response = await fetch(
      `${API}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
        signal: AbortSignal.timeout(120_000),
      },
    );

    if (!response.ok) {
      let pesan = `ElevenLabs menolak permintaan (HTTP ${response.status}).`;
      try {
        const data = await response.json();
        pesan = data.detail?.message ?? data.detail ?? data.message ?? pesan;
      } catch {
        // biarkan pesan bawaan
      }
      const saran =
        response.status === 401
          ? " API key salah atau dicabut."
          : response.status === 402 || response.status === 403
            ? " Kredit habis atau plan tidak mendukung cloning/komersial."
            : response.status === 422
              ? " Voice ID tidak valid."
              : "";
      return jsonError(pesan + saran, response.status === 429 ? 429 : 502);
    }

    audio = await response.arrayBuffer();
  } catch (err) {
    return jsonError(
      err instanceof Error && err.name === "TimeoutError"
        ? "ElevenLabs terlalu lama merespons. Coba lagi."
        : "Gagal menghubungi ElevenLabs.",
      504,
    );
  }

  if (audio.byteLength < 1000) return jsonError("Audio yang diterima kosong.", 502);

  const stamp = Date.now();
  const path = `${user.id}/audio/${video.id}-${stamp}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from("audio")
    .upload(path, audio, { contentType: "audio/mpeg", upsert: false });

  if (uploadError) return jsonError(`Gagal menyimpan audio: ${uploadError.message}`, 500);

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .insert({
      owner_id: user.id,
      kind: "audio",
      name: `VO ${video.title} ${new Date(stamp).toLocaleDateString("id-ID")}.mp3`,
      bucket: "audio",
      path,
      size: audio.byteLength,
    })
    .select()
    .single();

  if (assetError || !asset) {
    await supabase.storage.from("audio").remove([path]);
    return jsonError(assetError?.message ?? "Gagal menyimpan catatan audio.", 500);
  }

  const lama = video.vo_asset_id
    ? await supabase.from("assets").select("*").eq("id", video.vo_asset_id).maybeSingle()
    : null;

  await supabase
    .from("videos")
    .update({ vo_asset_id: asset.id, voice_id: voiceId, script: text, status: "draf" })
    .eq("id", video.id)
    .eq("owner_id", user.id);

  if (lama?.data) {
    await supabase.storage.from(lama.data.bucket).remove([lama.data.path]);
    await supabase.from("assets").delete().eq("id", lama.data.id).eq("owner_id", user.id);
  }

  const { data: signed } = await supabase.storage
    .from("audio")
    .createSignedUrl(path, 60 * 60 * 4);

  return NextResponse.json({
    asset,
    url: signed?.signedUrl ?? null,
    characters: text.length,
    estimatedCredits: text.length,
  });
}
