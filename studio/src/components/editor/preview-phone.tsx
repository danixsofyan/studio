"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { Asset, Scene } from "@/lib/types";
import { illustrationByKey } from "@/lib/illustrations";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ukuranJudul(teks: string) {
  const n = teks.replace("{angka}", "000").length;
  if (n <= 8) return 180;
  if (n <= 12) return 150;
  if (n <= 17) return 130;
  if (n <= 22) return 110;
  if (n <= 28) return 92;
  return 78;
}

function Highlight({ text, pink }: { text: string; pink?: string }) {
  if (!pink) return <>{text}</>;
  const index = text.toLowerCase().indexOf(pink.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-[#f9a8c8] [text-shadow:0_0_28px_rgba(249,168,200,0.55)]">
        {text.slice(index, index + pink.length)}
      </span>
      {text.slice(index + pink.length)}
    </>
  );
}

function Pill({ text, keywords }: { text: string; keywords: string[] }) {
  const panas = new Set(keywords.map((k) => k.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "")));
  const kata = text.split(/\s+/).filter(Boolean).slice(0, 6);
  return (
    <div className="absolute inset-x-[5.6%] top-[71.1%] flex justify-center">
      <div className="rounded-[1.4cqw] bg-black/78 px-[3cqw] py-[1.6cqw] text-center leading-tight text-white shadow-lg backdrop-blur-sm">
        <span className="text-[4.6cqw] font-semibold tracking-tight">
          {kata.map((k, i) => {
            const bersih = k.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
            return (
              <span key={i} className={cn(panas.has(bersih) && "text-[#ffd75e]")}>
                {k}
                {i < kata.length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}

export function PreviewPhone({
  video,
  scene,
  footage,
  index,
  total,
  durasi,
  onPrev,
  onNext,
  onExpand,
  className,
}: {
  video: { title: string; scenes: Scene[] };
  scene: Scene | null;
  footage: Array<Asset & { thumbUrl: string | null }>;
  index: number;
  total: number;
  durasi?: number;
  onPrev: () => void;
  onNext: () => void;
  onExpand?: () => void;
  className?: string;
}) {
  const klip = scene?.jenis === "klip" ? footage.find((f) => f.id === scene.klip) : null;
  const ilustrasi = (scene?.ilustrasi ?? [])
    .map((k) => illustrationByKey(k))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const headlines = (scene?.judul ?? [])
    .map((h) => (typeof h === "string" ? h : h.teks))
    .filter(Boolean);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="size-7" onClick={onPrev} disabled={total < 2}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-14 text-center text-[11px] font-medium text-muted-foreground">
            {total > 0 ? `${index + 1} / ${total}` : "—"}
          </span>
          <Button variant="outline" size="icon" className="size-7" onClick={onNext} disabled={total < 2}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Pratinjau</span>
          {onExpand && (
            <Button variant="ghost" size="icon" className="size-7" onClick={onExpand}>
              <Maximize2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[300px]">
        <div
          className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#efe9dd] shadow-[0_20px_45px_-20px_rgba(43,35,32,0.45)]"
          style={{ containerType: "inline-size" }}
        >
          {klip?.thumbUrl ? (
            <>
              <Image
                src={klip.thumbUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    ilustrasi.length > 0
                      ? `radial-gradient(circle at 28% 42%, ${ilustrasi[0].warna}55, transparent 52%), radial-gradient(circle at 74% 62%, ${ilustrasi[1]?.warna ?? "#f7a8c4"}44, transparent 55%), #efe9dd`
                      : "radial-gradient(circle at 30% 30%, #f7d7e2, transparent 55%), #efe9dd",
                }}
              />
              <div className="absolute inset-x-0 top-[34%] flex flex-wrap items-center justify-center gap-[2cqw] px-[10%]">
                {ilustrasi.map((i) => (
                  <span
                    key={i.kunci}
                    className="rounded-full border-[0.5cqw] border-white bg-white/85 px-[2.4cqw] py-[1cqw] text-[3.4cqw] font-semibold text-[#4a3a33] shadow"
                    style={{ borderColor: "white" }}
                  >
                    {i.label}
                  </span>
                ))}
              </div>
            </>
          )}

          <Image
            src={klip ? "/img/logo-sedarikini-putih.png" : "/img/logo-sedarikini.png"}
            alt="Sedarikini"
            width={170}
            height={60}
            className="absolute inset-x-0 top-[10.7%] mx-auto w-[15.7%] opacity-90"
            style={{ height: "auto" }}
          />

          <div className="absolute inset-x-[7%] top-[18.7%] space-y-[1.2cqw] text-center">
            {headlines.map((teks, i) => {
              const ukuran = ukuranJudul(teks);
              return (
                <p
                  key={i}
                  className="font-display leading-[1.02] text-white"
                  style={{
                    fontSize: `${(ukuran / 1080) * 100}cqw`,
                    textShadow:
                      "0 0 2.4cqw rgba(255,255,255,0.42), 0 0.5cqw 1.6cqw rgba(0,0,0,0.45)",
                  }}
                >
                  <Highlight
                    text={teks.replace("{angka}", String(scene?.hitung?.ke ?? 0))}
                    pink={scene?.pink}
                  />
                </p>
              );
            })}
            {headlines.length === 0 && (
              <p className="text-[2.6cqw] uppercase tracking-[0.2em] text-white/40">
                judul belum diisi
              </p>
            )}
          </div>

          {scene?.label && scene.label.length > 0 && (
            <div className="absolute inset-x-0 top-[52%] flex flex-col items-center gap-[1.4cqw]">
              {scene.label.map((l, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/92 px-[2.6cqw] py-[1cqw] text-[3.2cqw] font-semibold text-[#4a3a33] shadow"
                >
                  {l}
                </span>
              ))}
            </div>
          )}

          {scene && <Pill text={scene.teks || "Narasi belum diisi"} keywords={scene.kata_kunci ?? []} />}

          <div className="absolute inset-x-0 bottom-[2.4%] text-center">
            <span className="text-[2cqw] text-white/55">{video.title}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        {scene
          ? `${formatDuration(durasi ?? scene.teks.length / 16)} perkiraan · ${scene.teks.split(/\s+/).filter(Boolean).length} kata`
          : "Belum ada scene"}
      </p>
    </div>
  );
}
