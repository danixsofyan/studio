import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatus, VideoStatus } from "@/lib/types";

const VIDEO: Record<VideoStatus, { label: string; className: string }> = {
  draf: { label: "Draf", className: "bg-secondary text-secondary-foreground" },
  siap: { label: "Siap", className: "bg-emerald-100 text-emerald-800" },
  render: { label: "Sedang render", className: "bg-amber-100 text-amber-900" },
  selesai: { label: "Selesai", className: "bg-primary/12 text-primary" },
};

const JOB: Record<JobStatus, { label: string; className: string }> = {
  antre: { label: "Antre", className: "bg-secondary text-secondary-foreground" },
  dikerjakan: { label: "Dikerjakan", className: "bg-amber-100 text-amber-900" },
  selesai: { label: "Selesai", className: "bg-emerald-100 text-emerald-800" },
  gagal: { label: "Gagal", className: "bg-destructive/12 text-destructive" },
};

export function VideoStatusBadge({
  status,
  className,
}: {
  status: VideoStatus;
  className?: string;
}) {
  const item = VIDEO[status] ?? VIDEO.draf;
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", item.className, className)}>
      {item.label}
    </Badge>
  );
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const item = JOB[status] ?? JOB.antre;
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", item.className)}>
      {item.label}
    </Badge>
  );
}
