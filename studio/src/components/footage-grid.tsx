"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Film, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "@/lib/types";
import { formatBytes, formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export type LibraryItem = Asset & { thumbUrl: string | null; url: string | null };

export function FootageGrid({ items }: { items: LibraryItem[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState<LibraryItem | null>(null);
  const [hapus, setHapus] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(false);

  async function hapusAset() {
    if (!hapus) return;
    setLoading(true);
    const res = await fetch(`/api/assets/${hapus.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Gagal menghapus footage.");
      return;
    }
    toast.success("Footage dihapus.");
    setHapus(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center px-6 py-14 text-center">
        <Film className="size-7 text-muted-foreground" />
        <p className="mt-3 font-medium">Library masih kosong</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Unggah klip di atas. Setelah ada di sini, footage bisa dipakai di semua video.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setPreview(item)}
              className="relative block aspect-video w-full overflow-hidden bg-[#efe9dd]"
            >
              {item.thumbUrl ? (
                <Image
                  src={item.thumbUrl}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Film className="size-6 text-[#b4495f]" />
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <span className="rounded-full bg-black/55 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="size-3.5 fill-current" />
                </span>
              </span>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {formatDuration(item.duration)}
              </span>
            </button>
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium" title={item.name}>
                  {item.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatBytes(item.size)}
                  {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => setHapus(item)}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Hapus</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate text-base">{preview?.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Clock className="size-3.5" />
              {formatDuration(preview?.duration)} · {formatBytes(preview?.size)}
            </DialogDescription>
          </DialogHeader>
          {preview?.url && (
            <video
              src={preview.url}
              controls
              autoPlay
              playsInline
              className="max-h-[65vh] w-full rounded-lg bg-black"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(hapus)} onOpenChange={(open) => !open && setHapus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus footage ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {hapus?.name} akan dihapus dari library dan storage. Video yang masih
              memakai klip ini tidak akan bisa dirender sampai klipnya diganti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={hapusAset}
              disabled={loading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {loading ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
