"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Film, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatBytes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Tahap = "menunggu" | "membaca" | "mengunggah" | "mencatat" | "selesai" | "gagal";

type Item = {
  id: string;
  file: File;
  tahap: Tahap;
  pesan?: string;
};

const EKSTENSI = [".mov", ".mp4", ".m4v", ".avi", ".mkv", ".webm", ".mts", ".m2ts"];

function ekstensiValid(name: string) {
  return EKSTENSI.some((e) => name.toLowerCase().endsWith(e));
}

function bacaVideo(file: File) {
  return new Promise<{
    duration: number;
    width: number;
    height: number;
    thumb: Blob | null;
  }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const bersih = () => URL.revokeObjectURL(url);
    const batas = setTimeout(() => {
      bersih();
      resolve({ duration: 0, width: 0, height: 0, thumb: null });
    }, 15_000);

    video.onerror = () => {
      clearTimeout(batas);
      bersih();
      reject(new Error("Browser tidak bisa membaca video ini."));
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth;
      const height = video.videoHeight;

      const ambil = () => {
        try {
          const skala = Math.min(1, 640 / Math.max(width, height, 1));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * skala));
          canvas.height = Math.max(1, Math.round(height * skala));
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              clearTimeout(batas);
              bersih();
              resolve({ duration, width, height, thumb: blob });
            },
            "image/jpeg",
            0.72,
          );
        } catch {
          clearTimeout(batas);
          bersih();
          resolve({ duration, width, height, thumb: null });
        }
      };

      video.onseeked = ambil;
      try {
        video.currentTime = Math.min(0.6, Math.max(0, duration / 2));
      } catch {
        ambil();
      }
    };
  });
}

export function FootageUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [mengerjakan, setMengerjakan] = useState(false);

  function ubah(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function proses(daftar: File[]) {
    if (mengerjakan) return;
    const valid = daftar.filter((f) => ekstensiValid(f.name));
    if (valid.length !== daftar.length) {
      toast.warning("Beberapa berkas dilewati karena bukan video.");
    }
    if (!valid.length) return;

    const baru: Item[] = valid.map((file) => ({
      id: crypto.randomUUID(),
      file,
      tahap: "menunggu",
    }));
    setItems((prev) => [...baru, ...prev]);
    setMengerjakan(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesi habis. Muat ulang halaman.");
      setMengerjakan(false);
      return;
    }

    for (const item of baru) {
      try {
        ubah(item.id, { tahap: "membaca" });
        const meta = await bacaVideo(item.file);

        const uuid = crypto.randomUUID();
        const ext = item.file.name.slice(item.file.name.lastIndexOf(".")).toLowerCase();
        const path = `${user.id}/footage/${uuid}${ext}`;
        const thumbPath = meta.thumb ? `${user.id}/thumbnails/footage/${uuid}.jpg` : null;

        ubah(item.id, { tahap: "mengunggah" });
        const { error: uploadError } = await supabase.storage
          .from("footage")
          .upload(path, item.file, {
            contentType: item.file.type || "video/quicktime",
            upsert: false,
            cacheControl: "3600",
          });
        if (uploadError) throw new Error(uploadError.message);

        if (meta.thumb && thumbPath) {
          const { error: thumbError } = await supabase.storage
            .from("thumbnails")
            .upload(thumbPath, meta.thumb, { contentType: "image/jpeg", upsert: false });
          if (thumbError) console.warn("Thumbnail gagal diunggah:", thumbError.message);
        }

        ubah(item.id, { tahap: "mencatat" });
        const res = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "footage",
            name: item.file.name,
            bucket: "footage",
            path,
            thumb_path: thumbPath,
            size: item.file.size,
            duration: meta.duration || null,
            width: meta.width || null,
            height: meta.height || null,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Gagal mencatat asset.");

        ubah(item.id, { tahap: "selesai" });
      } catch (err) {
        ubah(item.id, {
          tahap: "gagal",
          pesan: err instanceof Error ? err.message : "Gagal mengunggah.",
        });
      }
    }

    setMengerjakan(false);
    router.refresh();
  }

  const total = items.length;
  const selesai = items.filter((i) => i.tahap === "selesai").length;
  const gagal = items.filter((i) => i.tahap === "gagal").length;

  return (
    <Card className="p-0">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          proses(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors",
          mengerjakan ? "bg-secondary/40" : "hover:border-primary/40 hover:bg-accent/20",
        )}
      >
        <div className="rounded-2xl bg-[#efe9dd] p-4">
          <Film className="size-7 text-[#b4495f]" />
        </div>
        <p className="mt-4 font-semibold">Tarik klip ke sini</p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
          MOV/MP4 vertikal, 5–10 detik per aksi. Thumbnail dibuat otomatis di
          browser. Untuk file besar, jangan tutup tab selama upload.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={EKSTENSI.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            proses(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <Button
          className="mt-4"
          variant="outline"
          disabled={mengerjakan}
          onClick={() => inputRef.current?.click()}
        >
          {mengerjakan ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Pilih berkas
        </Button>
      </div>

      {total > 0 && (
        <div className="space-y-3 border-t border-border/70 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selesai}/{total} selesai
              {gagal > 0 && ` · ${gagal} gagal`}
            </span>
            {!mengerjakan && (
              <Button variant="ghost" size="sm" onClick={() => setItems([])}>
                Bersihkan
              </Button>
            )}
          </div>
          <Progress value={total ? (selesai / total) * 100 : 0} className="h-1.5" />
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-xs">
                {item.tahap === "selesai" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : item.tahap === "gagal" ? (
                  <XCircle className="size-4 shrink-0 text-destructive" />
                ) : (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatBytes(item.file.size)}
                </span>
                <span className="w-24 shrink-0 text-right text-muted-foreground">
                  {item.tahap === "selesai"
                    ? "selesai"
                    : item.tahap === "gagal"
                      ? item.pesan
                      : item.tahap === "mengunggah"
                        ? "mengunggah…"
                        : "menyiapkan…"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
