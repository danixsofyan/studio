"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clapperboard,
  Film,
  ImageIcon,
  Loader2,
  Plus,
  Scissors,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { RenderJob, Scene, Video } from "@/lib/types";
import type { EditorData } from "@/lib/data";
import { durationOf, splitDuration, validate } from "@/lib/validate";
import { formatDuration, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoStatusBadge } from "@/components/status-badge";
import { SceneCard } from "./scene-card";
import { VoPanel, type AudioState } from "./vo-panel";
import { PreviewPhone } from "./preview-phone";
import { CheckPanel } from "./check-panel";
import { RenderPanel } from "./render-panel";

type SaveState = "idle" | "saving" | "saved" | "error";

export function Editor({
  initial,
  voiceConfigured,
}: {
  initial: EditorData;
  voiceConfigured: boolean;
}) {
  const router = useRouter();

  const [video, setVideo] = useState<Video>(initial.video);
  const [footage] = useState(initial.footage);
  const [audio, setAudio] = useState<AudioState | null>(
    initial.audio && initial.audioUrl
      ? {
          asset: initial.audio,
          url: initial.audioUrl,
          duration: initial.audio.duration,
        }
      : null,
  );
  const [job, setJob] = useState<RenderJob | null>(initial.latestJob);
  const [renderUrl, setRenderUrl] = useState<string | null>(initial.renderUrl);
  const [snapshots, setSnapshots] = useState<string[]>(initial.snapshots);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.video.scenes[0]?.id ?? null,
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [expanded, setExpanded] = useState(false);
  const [menyiapkanRender, setMenyiapkanRender] = useState(false);

  const voDuration = audio?.duration ?? null;
  const totalDuration = durationOf(video, voDuration);
  const timings = useMemo(
    () => splitDuration(video.scenes, totalDuration),
    [video.scenes, totalDuration],
  );
  const issues = useMemo(
    () => validate(video, footage, voDuration),
    [video, footage, voDuration],
  );
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const selectedIndex = Math.max(
    0,
    video.scenes.findIndex((s) => s.id === selectedId),
  );
  const selectedScene = video.scenes[selectedIndex] ?? null;
  const selectedTiming = timings[selectedIndex];

  const kataTotal = video.scenes.reduce(
    (n, s) => n + s.teks.trim().split(/\s+/).filter(Boolean).length,
    0,
  );

  /* ---------------- simpan ---------------- */

  const serial = JSON.stringify({
    title: video.title,
    script: video.script,
    scenes: video.scenes,
    tail: video.tail,
    vo_asset_id: video.vo_asset_id,
  });
  const serialRef = useRef(serial);
  serialRef.current = serial;
  const lastSaved = useRef(serial);
  const videoRef = useRef(video);
  videoRef.current = video;
  const footageRef = useRef(footage);
  footageRef.current = footage;
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const savePromise = useRef<Promise<boolean> | null>(null);

  async function kirim(): Promise<boolean> {
    const snapshot = serialRef.current;
    const current = videoRef.current;
    const sekarang = audioRef.current?.duration ?? null;
    const cek = validate(current, footageRef.current, sekarang);
    const status =
      current.status === "render"
        ? "render"
        : cek.some((i) => i.level === "error") || current.scenes.length === 0
          ? "draf"
          : "siap";

    setSaveState("saving");
    try {
      const res = await fetch(`/api/videos/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: current.title,
          script: current.script,
          scenes: current.scenes,
          tail: current.tail,
          vo_asset_id: current.vo_asset_id,
          status,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
      lastSaved.current = snapshot;
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("error");
      return false;
    }
  }

  async function simpanSekarang(): Promise<boolean> {
    if (savePromise.current) await savePromise.current;
    const tugas = kirim();
    savePromise.current = tugas;
    try {
      return await tugas;
    } finally {
      if (savePromise.current === tugas) savePromise.current = null;
    }
  }

  useEffect(() => {
    if (serial === lastSaved.current) return;
    const timer = setTimeout(() => {
      simpanSekarang();
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serial]);

  /* ---------------- polling render ---------------- */

  useEffect(() => {
    if (!job) return;
    if (job.status !== "antre" && job.status !== "dikerjakan") return;

    let aktif = true;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/render/${job.id}`);
      if (!res.ok || !aktif) return;
      const data = await res.json();
      setJob(data.job);
      if (data.url) setRenderUrl(data.url);
      if (Array.isArray(data.snapshots) && data.snapshots.length > 0) {
        setSnapshots(data.snapshots);
      }
      if (data.job.status === "selesai") {
        setVideo((v) => ({ ...v, status: "selesai" }));
        toast.success("Render selesai.");
        router.refresh();
      }
      if (data.job.status === "gagal") {
        toast.error(data.job.error ?? "Render gagal. Cek log worker.");
        setVideo((v) => ({ ...v, status: "siap" }));
      }
    }, 3000);

    return () => {
      aktif = false;
      clearInterval(timer);
    };
  }, [job?.id, job?.status, router]);

  /* ---------------- scene ---------------- */

  function ubahVideo(patch: Partial<Video>) {
    setVideo((v) => ({ ...v, ...patch }));
  }

  function ubahScene(id: string, patch: Partial<Scene>) {
    setVideo((v) => ({
      ...v,
      scenes: v.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function sceneBaru(jenis: "klip" | "ilustrasi"): Scene {
    return {
      id: crypto.randomUUID(),
      teks: "",
      jenis,
      klip: jenis === "klip" ? footage[0]?.id : undefined,
      ilustrasi: jenis === "ilustrasi" ? ["pembalut"] : undefined,
      judul: [],
      kata_kunci: [],
    };
  }

  function tambahScene(jenis: "klip" | "ilustrasi") {
    const baru = sceneBaru(jenis);
    setVideo((v) => ({ ...v, scenes: [...v.scenes, baru] }));
    setSelectedId(baru.id);
  }

  function hapusScene(id: string) {
    const index = video.scenes.findIndex((s) => s.id === id);
    if (index === -1) return;
    const dihapus = video.scenes[index];
    const sisa = video.scenes.filter((s) => s.id !== id);
    setVideo((v) => ({ ...v, scenes: sisa }));
    if (selectedId === id) setSelectedId(sisa[Math.min(index, sisa.length - 1)]?.id ?? null);

    toast("Scene dihapus.", {
      action: {
        label: "Urungkan",
        onClick: () => {
          setVideo((v) => {
            const salinan = [...v.scenes];
            salinan.splice(index, 0, dihapus);
            return { ...v, scenes: salinan };
          });
          setSelectedId(id);
        },
      },
    });
  }

  function duplikatScene(id: string) {
    const index = video.scenes.findIndex((s) => s.id === id);
    if (index === -1) return;
    const salinan: Scene = {
      ...structuredClone(video.scenes[index]),
      id: crypto.randomUUID(),
    };
    const daftar = [...video.scenes];
    daftar.splice(index + 1, 0, salinan);
    setVideo((v) => ({ ...v, scenes: daftar }));
    setSelectedId(salinan.id);
  }

  function pindahScene(id: string, arah: -1 | 1) {
    const index = video.scenes.findIndex((s) => s.id === id);
    const target = index + arah;
    if (index === -1 || target < 0 || target >= video.scenes.length) return;
    const daftar = [...video.scenes];
    [daftar[index], daftar[target]] = [daftar[target], daftar[index]];
    setVideo((v) => ({ ...v, scenes: daftar }));
  }

  function pecahNaskah() {
    if (!video.script.trim()) return toast.error("Naskah masih kosong.");
    if (video.scenes.length > 0) {
      const lanjut = window.confirm(
        `Ganti ${video.scenes.length} scene yang ada dengan hasil pecahan naskah?`,
      );
      if (!lanjut) return;
    }

    const kalimat =
      video.script
        .replace(/\s+/g, " ")
        .match(/[^.!?]+[.!?]+/g)
        ?.map((s) => s.trim())
        .filter(Boolean) ?? [];

    if (kalimat.length === 0) return toast.error("Tidak ada kalimat yang bisa dipecah.");

    const baru = kalimat.map((teks) => {
      const scene = sceneBaru(footage.length > 0 ? "klip" : "ilustrasi");
      return {
        ...scene,
        id: crypto.randomUUID(),
        teks,
      };
    });

    setVideo((v) => ({ ...v, scenes: baru }));
    setSelectedId(baru[0]?.id ?? null);
    toast.success(`${baru.length} scene dibuat. Lengkapi footage dan judulnya.`);
  }

  /* ---------------- render ---------------- */

  async function mulaiRender() {
    setMenyiapkanRender(true);
    try {
      const ok = await simpanSekarang();
      if (!ok) {
        toast.error("Gagal menyimpan video. Coba lagi.");
        return;
      }
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data.job) {
        setJob(data.job);
        setVideo((v) => ({ ...v, status: "render" }));
        toast.info("Video ini sudah ada di antrean render.");
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Gagal masuk antrean.");
        return;
      }
      setJob(data.job);
      setVideo((v) => ({ ...v, status: "render" }));
      toast.success("Masuk antrean render. Worker akan mengambilnya.");
    } finally {
      setMenyiapkanRender(false);
    }
  }

  /* ---------------- tampilan ---------------- */

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href="/videos">
              <ArrowLeft className="size-4" />
              Semua video
            </Link>
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px]",
                saveState === "error" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {saveState === "saving" && <Loader2 className="size-3 animate-spin" />}
              {saveState === "saved" && <Check className="size-3 text-emerald-600" />}
              {saveState === "error" && <TriangleAlert className="size-3" />}
              {saveState === "saving"
                ? "Menyimpan…"
                : saveState === "saved"
                  ? "Tersimpan"
                  : saveState === "error"
                    ? "Gagal menyimpan"
                    : `Diperbarui ${relativeTime(video.updated_at)}`}
            </span>
            <VideoStatusBadge status={video.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(true)}
              disabled={!selectedScene}
            >
              <Sparkles className="size-3.5" />
              Pratinjau
            </Button>
            <Button
              size="sm"
              onClick={mulaiRender}
              disabled={menyiapkanRender || errors.length > 0 || video.scenes.length === 0}
            >
              {menyiapkanRender ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Clapperboard className="size-3.5" />
              )}
              Render
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Input
              value={video.title}
              onChange={(e) => ubahVideo({ title: e.target.value })}
              className="h-auto border-0 bg-transparent px-0 !text-3xl font-semibold shadow-none focus-visible:ring-0 md:!text-4xl"
              maxLength={120}
            />
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{video.scenes.length} scene</span>
              <span>{kataTotal} kata</span>
              <span>{formatDuration(totalDuration)}</span>
              <span>
                {errors.length} error · {warnings.length} peringatan
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <VoPanel
            videoId={video.id}
            script={video.script}
            onScriptChange={(script) => ubahVideo({ script })}
            audio={audio}
            onAudioChange={(next) => {
              setAudio(next);
              ubahVideo({ vo_asset_id: next?.asset.id ?? null });
            }}
            voiceConfigured={voiceConfigured}
            wordCount={video.script.trim().split(/\s+/).filter(Boolean).length}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Scene</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={pecahNaskah}>
                <Scissors className="size-3.5" />
                Pecah naskah
              </Button>
              <Button variant="outline" size="sm" onClick={() => tambahScene("klip")}>
                <Film className="size-3.5" />
                Footage
              </Button>
              <Button variant="outline" size="sm" onClick={() => tambahScene("ilustrasi")}>
                <ImageIcon className="size-3.5" />
                Ilustrasi
              </Button>
            </div>
          </div>

          {video.scenes.length === 0 ? (
            <div className="surface flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="rounded-2xl bg-[#efe9dd] p-4">
                <Clapperboard className="size-7 text-[#b4495f]" />
              </div>
              <p className="mt-4 font-display text-2xl">Belum ada scene</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Tulis naskah di atas lalu klik <strong>Pecah naskah</strong>, atau
                tambah scene satu per satu.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={pecahNaskah}>
                  <Scissors className="size-3.5" />
                  Pecah naskah
                </Button>
                <Button size="sm" onClick={() => tambahScene("klip")}>
                  <Plus className="size-3.5" />
                  Scene pertama
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {video.scenes.map((scene, index) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  index={index}
                  total={video.scenes.length}
                  footage={footage}
                  mulai={timings[index]?.start ?? 0}
                  durasi={timings[index]?.duration ?? 0}
                  issues={issues.filter((i) => i.scene === index + 1)}
                  selected={scene.id === selectedId}
                  onSelect={() => setSelectedId(scene.id)}
                  onChange={(patch) => ubahScene(scene.id, patch)}
                  onRemove={() => hapusScene(scene.id)}
                  onDuplicate={() => duplikatScene(scene.id)}
                  onMove={(arah) => pindahScene(scene.id, arah)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pb-4">
            <Button variant="outline" size="sm" onClick={() => tambahScene("klip")}>
              <Plus className="size-3.5" />
              Scene footage
            </Button>
            <Button variant="outline" size="sm" onClick={() => tambahScene("ilustrasi")}>
              <Plus className="size-3.5" />
              Scene ilustrasi
            </Button>
          </div>
        </div>

        <aside className="space-y-4 self-start xl:sticky xl:top-6">
          <div className="surface p-3">
            <PreviewPhone
              video={video}
              scene={selectedScene}
              footage={footage}
              index={selectedIndex}
              total={video.scenes.length}
              durasi={selectedTiming?.duration}
              onPrev={() => {
                const prev = video.scenes[Math.max(0, selectedIndex - 1)];
                if (prev) setSelectedId(prev.id);
              }}
              onNext={() => {
                const next = video.scenes[Math.min(video.scenes.length - 1, selectedIndex + 1)];
                if (next) setSelectedId(next.id);
              }}
              onExpand={() => setExpanded(true)}
            />
            {selectedTiming && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Scene ini muncul {formatDuration(selectedTiming.start)}–
                {formatDuration(selectedTiming.end)}
              </p>
            )}
          </div>

          <CheckPanel
            issues={issues}
            totalDuration={totalDuration}
            sceneCount={video.scenes.length}
          />

          <RenderPanel
            job={job}
            renderUrl={renderUrl}
            snapshots={snapshots}
            errors={errors.length}
            disabled={video.scenes.length === 0}
            totalDuration={totalDuration}
            onMulai={mulaiRender}
          />

          {audio && (
            <div className="surface flex items-center justify-between gap-2 p-3 text-[11px] text-muted-foreground">
              <span>
                VO {formatDuration(audio.duration)} · {audio.asset.name}
              </span>
              <Badge variant="secondary">aktif</Badge>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Pratinjau scene</DialogTitle>
          </DialogHeader>
          <PreviewPhone
            video={video}
            scene={selectedScene}
            footage={footage}
            index={selectedIndex}
            total={video.scenes.length}
            durasi={selectedTiming?.duration}
            onPrev={() => {
              const prev = video.scenes[Math.max(0, selectedIndex - 1)];
              if (prev) setSelectedId(prev.id);
            }}
            onNext={() => {
              const next = video.scenes[Math.min(video.scenes.length - 1, selectedIndex + 1)];
              if (next) setSelectedId(next.id);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
