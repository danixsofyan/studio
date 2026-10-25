"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Download,
  Loader2,
  Play,
  RefreshCw,
  ScanLine,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { RenderJob } from "@/lib/types";
import { formatDuration, relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JobStatusBadge } from "@/components/status-badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function RenderPanel({
  job,
  renderUrl,
  snapshots,
  errors,
  disabled,
  totalDuration,
  onMulai,
}: {
  job: RenderJob | null;
  renderUrl: string | null;
  snapshots: string[];
  errors: number;
  disabled: boolean;
  totalDuration: number;
  onMulai: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [logTerbuka, setLogTerbuka] = useState(false);
  const [putar, setPutar] = useState(false);

  const aktif = job?.status === "antre" || job?.status === "dikerjakan";

  async function mulai() {
    setLoading(true);
    try {
      await onMulai();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="size-4 text-primary" />
          Render
        </CardTitle>
        <CardDescription>
          {formatDuration(totalDuration)} · 1080×1920 · 30 fps · worker lokal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/8 p-2.5 text-[11px] text-destructive">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{errors} masalah harus diperbaiki sebelum render.</span>
          </div>
        )}

        <Button
          className="w-full"
          onClick={mulai}
          disabled={loading || aktif || disabled || errors > 0}
        >
          {loading || aktif ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Video className="size-4" />
          )}
          {aktif ? "Sedang dirender…" : job?.status === "selesai" ? "Render ulang" : "Render video"}
        </Button>

        {job && (
          <div className="space-y-2 rounded-xl border border-border/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <JobStatusBadge status={job.status} />
              <span className="text-[11px] text-muted-foreground">
                {job.status === "selesai"
                  ? relativeTime(job.finished_at ?? job.created_at)
                  : aktif
                    ? `${job.progress}%`
                    : relativeTime(job.created_at)}
              </span>
            </div>
            {aktif && <Progress value={job.progress} className="h-1.5" />}
            {job.error && <p className="text-[11px] text-destructive">{job.error}</p>}

            <Collapsible open={logTerbuka} onOpenChange={setLogTerbuka}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-full justify-between px-1 text-[11px]">
                  Log worker
                  <ChevronDown className={cn("size-3 transition-transform", logTerbuka && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-1 max-h-44 overflow-auto rounded-lg bg-[#2b2320] p-2.5 text-[10px] leading-relaxed text-[#e8ded2]">
{job.log || "Menunggu worker mengambil job…"}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {renderUrl && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => setPutar(true)}>
              <Play className="size-4" />
              Putar hasil render
            </Button>
            <a
              href={renderUrl}
              download
              className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            >
              <Download className="size-3" />
              Unduh MP4
            </a>
          </div>
        )}

        {snapshots.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <ScanLine className="size-3" />
              Frame dari render terakhir
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {snapshots.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-[9/16] w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Frame ${i + 1}`} className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {job?.status === "gagal" && (
          <Button variant="ghost" size="sm" className="w-full text-[11px]" onClick={mulai}>
            <RefreshCw className="size-3" />
            Coba render lagi
          </Button>
        )}
      </CardContent>

      <Dialog open={putar} onOpenChange={setPutar}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hasil render</DialogTitle>
          </DialogHeader>
          {renderUrl && (
            <video
              src={renderUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] w-full rounded-xl bg-black"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
