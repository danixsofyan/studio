import Link from "next/link";
import { ArrowRight, Clapperboard, FolderUp, Mic2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewVideoDialog } from "@/components/new-video-dialog";
import { VideoCard } from "@/components/video-card";
import { listVideos, getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const [items, profile] = await Promise.all([listVideos(), getProfile()]);
  const selesai = items.filter((i) => i.video.status === "selesai").length;
  const totalScene = items.reduce((n, i) => n + i.sceneCount, 0);
  const belumSuara = !profile?.voice_id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-kecil">Ruang kerja</p>
          <h1 className="mt-1 font-display text-4xl leading-none md:text-5xl">Video</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Tulis naskah, generate VO, susun scene, lalu kirim ke antrean render.
            Footage dipilih manual oleh kamu.
          </p>
        </div>
        <NewVideoDialog />
      </div>

      {(belumSuara || items.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="surface flex items-center gap-3 p-4">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Clapperboard className="size-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{items.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">video</p>
            </div>
          </div>
          <div className="surface flex items-center gap-3 p-4">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-700">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{selesai}</p>
              <p className="mt-1 text-xs text-muted-foreground">sudah dirender</p>
            </div>
          </div>
          <div className="surface flex items-center gap-3 p-4">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-700">
              <Mic2 className="size-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{totalScene}</p>
              <p className="mt-1 text-xs text-muted-foreground">scene tersusun</p>
            </div>
          </div>
        </div>
      )}

      {belumSuara && (
        <Alert className="border-primary/25 bg-accent/40">
          <Mic2 className="text-primary" />
          <AlertTitle>Atur suara clone dulu</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              VO belum bisa digenerate sebelum voice clone ElevenLabs dipilih di
              Pengaturan.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/settings">
                Buka pengaturan <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="rounded-2xl bg-[#efe9dd] p-5">
            <Clapperboard className="size-8 text-[#b4495f]" />
          </div>
          <h2 className="mt-5 font-display text-3xl">Belum ada video</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Mulai dari satu video. Setelah dibuat, kamu bisa menulis naskah dan
            langsung generate VO.
          </p>
          <div className="mt-6 flex gap-2">
            <NewVideoDialog />
            <Button asChild variant="outline">
              <Link href="/library">
                <FolderUp className="size-4" />
                Unggah footage
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Semua video <Badge variant="secondary">{items.length}</Badge>
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/library">
                <FolderUp className="size-4" />
                Library footage
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <VideoCard key={item.video.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
