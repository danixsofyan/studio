"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, MoreHorizontal, Play, Trash2, Copy, Clock } from "lucide-react";
import { toast } from "sonner";
import type { VideoRingkas } from "@/lib/data";
import { relativeTime } from "@/lib/format";
import { VideoStatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function VideoCard({ item }: { item: VideoRingkas }) {
  const router = useRouter();
  const [hapus, setHapus] = useState(false);
  const [loading, setLoading] = useState(false);

  async function hapusVideo() {
    setLoading(true);
    const res = await fetch(`/api/videos/${item.video.id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data.error ?? "Gagal menghapus.");
    }
    toast.success("Video dihapus.");
    router.refresh();
  }

  async function duplikat() {
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${item.video.title} (salinan)` }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error ?? "Gagal menduplikasi.");
    await fetch(`/api/videos/${data.video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script: item.video.script,
        scenes: item.video.scenes,
        tail: item.video.tail,
      }),
    });
    toast.success("Video diduplikasi.");
    router.push(`/videos/${data.video.id}`);
  }

  return (
    <>
      <Card className="group overflow-hidden border-border/80 p-0 transition-shadow hover:shadow-md">
        <Link href={`/videos/${item.video.id}`} className="block">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#efe9dd]">
            {item.thumbUrl ? (
              <Image
                src={item.thumbUrl}
                alt=""
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#f7d7e2,transparent_55%),radial-gradient(circle_at_75%_70%,#e7dfd0,transparent_60%)]">
                <div className="rounded-2xl border border-white/60 bg-white/40 p-4 backdrop-blur">
                  <Film className="size-7 text-[#b4495f]" />
                </div>
              </div>
            )}
            <div className="absolute left-3 top-3">
              <VideoStatusBadge status={item.video.status} />
            </div>
            {item.renderUrl && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/55 p-2 text-white backdrop-blur">
                <Play className="size-3.5 fill-current" />
              </div>
            )}
          </div>
        </Link>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/videos/${item.video.id}`} className="min-w-0">
              <h3 className="truncate font-semibold leading-tight">{item.video.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.sceneCount} scene · {item.wordCount} kata
              </p>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/videos/${item.video.id}`}>
                    <Film className="size-4" />
                    Buka editor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={duplikat}>
                  <Copy className="size-4" />
                  Duplikat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setHapus(true)}
                >
                  <Trash2 className="size-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {relativeTime(item.video.updated_at)}
            </span>
            {item.job && item.job.status !== "selesai" && (
              <span>{item.job.status === "gagal" ? "Render gagal" : `Render ${item.job.progress}%`}</span>
            )}
            {item.job?.status === "selesai" && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Play className="size-3" />
                Sudah dirender
              </span>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={hapus} onOpenChange={setHapus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus video ini?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.video.title}&rdquo; beserta scene dan riwayat render-nya akan
              dihapus. File footage tetap ada di library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={hapusVideo}
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
