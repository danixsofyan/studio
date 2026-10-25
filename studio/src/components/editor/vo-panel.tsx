"use client";

import { useRef, useState } from "react";
import { AudioLines, Loader2, Mic2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Asset } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AudioState = { asset: Asset; url: string; duration: number | null };

function ukurDurasi(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const selesai = (value: number | null) => {
      audio.src = "";
      resolve(value);
    };
    const batas = setTimeout(() => selesai(null), 10_000);
    audio.onloadedmetadata = () => {
      clearTimeout(batas);
      selesai(Number.isFinite(audio.duration) ? audio.duration : null);
    };
    audio.onerror = () => {
      clearTimeout(batas);
      selesai(null);
    };
    audio.src = url;
  });
}

export function VoPanel({
  videoId,
  script,
  onScriptChange,
  audio,
  onAudioChange,
  voiceConfigured,
  wordCount,
}: {
  videoId: string;
  script: string;
  onScriptChange: (value: string) => void;
  audio: AudioState | null;
  onAudioChange: (audio: AudioState | null) => void;
  voiceConfigured: boolean;
  wordCount: number;
}) {
  const [loading, setLoading] = useState<"generate" | "upload" | null>(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const karakter = [...script].length;
  const perkiraan = wordCount > 0 ? wordCount / 2.4 : 0;

  async function generate() {
    if (!script.trim()) return toast.error("Naskah masih kosong.");
    if (karakter > 4800) {
      return toast.error("Naskah lebih dari 4.800 karakter. Ringkas dulu.");
    }
    setLoading("generate");
    try {
      const res = await fetch("/api/vo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, text: script }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal generate VO.");

      const duration = data.url ? await ukurDurasi(data.url) : null;
      if (duration && data.asset?.id) {
        await fetch(`/api/assets/${data.asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration }),
        });
      }
      onAudioChange({ asset: data.asset, url: data.url, duration });
      toast.success(`VO siap · ${formatDuration(duration ?? 0)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate VO.");
    } finally {
      setLoading(null);
    }
  }

  async function unggah(file: File) {
    setLoading("upload");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi habis. Muat ulang halaman.");

      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase() || ".mp3";
      const path = `${user.id}/audio/${videoId}-manual-${Date.now()}${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const localUrl = URL.createObjectURL(file);
      const duration = await ukurDurasi(localUrl);
      URL.revokeObjectURL(localUrl);

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "audio",
          name: file.name,
          bucket: "audio",
          path,
          size: file.size,
          duration,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal mencatat VO.");

      await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vo_asset_id: data.asset.id }),
      });

      const { data: signed } = await supabase.storage
        .from("audio")
        .createSignedUrl(path, 60 * 60 * 4);

      onAudioChange({
        asset: data.asset,
        url: signed?.signedUrl ?? "",
        duration,
      });
      toast.success("VO diunggah.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah VO.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic2 className="size-4 text-primary" />
              Naskah & suara
            </CardTitle>
            <CardDescription>
              Satu paragraf utuh. VO dipotong otomatis mengikuti urutan kalimat.
            </CardDescription>
          </div>
          {audio && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setKonfirmasi(true)}
              disabled={loading !== null || !voiceConfigured}
            >
              {loading === "generate" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Generate ulang
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          rows={7}
          placeholder="Tulis narasi utuh di sini. Pisahkan kalimat dengan titik — tiap kalimat menjadi satu scene."
          className="resize-y text-sm leading-relaxed"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {wordCount} kata · {karakter}/4.800 karakter
            {!audio && perkiraan > 0 && ` · ±${formatDuration(perkiraan)}`}
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".mp3,.wav,.m4a,.aac,.flac,.ogg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) unggah(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => fileRef.current?.click()}
              disabled={loading !== null}
            >
              {loading === "upload" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Upload className="size-3" />
              )}
              Unggah VO
            </Button>
            <Button
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => (audio ? setKonfirmasi(true) : generate())}
              disabled={loading !== null || !voiceConfigured || !script.trim()}
            >
              {loading === "generate" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <AudioLines className="size-3" />
              )}
              {audio ? "Buat ulang" : "Generate VO"}
            </Button>
          </div>
        </div>

        {!voiceConfigured && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            Voice clone belum dipilih. Buka Pengaturan untuk memilih suara ElevenLabs.
          </p>
        )}

        {audio?.url && (
          <div className="rounded-xl border border-border/70 bg-secondary/40 p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <AudioLines className="size-3.5" />
                VO aktif · {formatDuration(audio.duration)}
              </span>
              <span>{audio.asset.name}</span>
            </div>
            <audio controls src={audio.url} className="mt-2 h-9 w-full" />
          </div>
        )}
      </CardContent>

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buat VO baru?</AlertDialogTitle>
            <AlertDialogDescription>
              VO lama akan diganti dan file-nya dihapus dari storage. Durasi scene
              ikut berubah, jadi cek ulang jeda judul setelahnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setKonfirmasi(false);
                generate();
              }}
            >
              Buat VO baru
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
