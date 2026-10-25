"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Film,
  ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { Asset, HeadlineLine, Scene } from "@/lib/types";
import { ILLUSTRATIONS, illustrationByKey } from "@/lib/illustrations";
import type { Issue } from "@/lib/validate";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDuration } from "@/lib/format";

type Baris = HeadlineLine;

function keBaris(judul: Scene["judul"]): Baris[] {
  if (!Array.isArray(judul)) return [];
  return judul.map((j) => (typeof j === "string" ? { teks: j } : { ...j }));
}

function dariBaris(baris: Baris[]): Array<string | HeadlineLine> {
  const adaLanjut = baris.some(
    (b) => b.masuk !== undefined || b.keluar !== undefined || b.atas !== undefined || b.ukuran !== undefined,
  );
  return baris
    .filter((b) => b.teks.trim() !== "" || adaLanjut)
    .map((b) =>
      adaLanjut
        ? {
            teks: b.teks,
            ...(b.masuk !== undefined ? { masuk: b.masuk } : {}),
            ...(b.keluar !== undefined ? { keluar: b.keluar } : {}),
            ...(b.atas !== undefined ? { atas: b.atas } : {}),
            ...(b.ukuran !== undefined ? { ukuran: b.ukuran } : {}),
          }
        : b.teks,
    );
}

const daftar = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function angkaAtauKosong(value: string) {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function SceneCard({
  scene,
  index,
  total,
  footage,
  mulai,
  durasi,
  issues,
  selected,
  onSelect,
  onChange,
  onRemove,
  onDuplicate,
  onMove,
}: {
  scene: Scene;
  index: number;
  total: number;
  footage: Array<Asset & { thumbUrl: string | null }>;
  mulai: number;
  durasi: number;
  issues: Issue[];
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Scene>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (arah: -1 | 1) => void;
}) {
  const [lanjutan, setLanjutan] = useState(false);
  const [pilihFootage, setPilihFootage] = useState(false);

  const klip = footage.find((f) => f.id === scene.klip);
  const baris = useMemo(() => keBaris(scene.judul), [scene.judul]);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  function ubahBaris(baru: Baris[]) {
    onChange({ judul: dariBaris(baru) });
  }

  function tambahBaris() {
    ubahBaris([...baris, { teks: "" }]);
  }

  function hapusBaris(i: number) {
    ubahBaris(baris.filter((_, idx) => idx !== i));
  }

  function ubahSatu(i: number, patch: Partial<Baris>) {
    ubahBaris(baris.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  const ilustrasiTerpilih = scene.ilustrasi ?? [];

  function toggleIlustrasi(kunci: string) {
    const ada = ilustrasiTerpilih.includes(kunci);
    onChange({
      ilustrasi: ada
        ? ilustrasiTerpilih.filter((k) => k !== kunci)
        : [...ilustrasiTerpilih, kunci],
    });
  }

  function toggleStiker(kunci: string) {
    const sekarang = scene.stiker ?? [];
    onChange({
      stiker: sekarang.includes(kunci)
        ? sekarang.filter((k) => k !== kunci)
        : [...sekarang, kunci],
    });
  }

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 transition-colors",
        selected && "ring-2 ring-primary/35",
        errors.length > 0 && "border-destructive/40",
      )}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center gap-3 border-b border-border/60 px-4 py-3",
          selected ? "bg-accent/35" : "bg-card",
        )}
        onClick={onSelect}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#efe9dd] text-xs font-semibold text-[#7a5c4e]">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">
            {scene.teks.trim() || <span className="text-muted-foreground">Narasi belum diisi</span>}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDuration(mulai)}–{formatDuration(mulai + durasi)} · {Math.round(durasi)} dtk
          </p>
        </div>
        <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
          {scene.jenis === "klip" ? (
            <>
              <Film className="size-3" /> footage
            </>
          ) : (
            <>
              <ImageIcon className="size-3" /> ilustrasi
            </>
          )}
        </Badge>
        {errors.length > 0 && (
          <Badge variant="destructive" className="shrink-0">
            {errors.length}
          </Badge>
        )}
        {errors.length === 0 && warnings.length > 0 && (
          <Badge className="shrink-0 bg-amber-100 text-amber-900">{warnings.length}</Badge>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-7 sm:inline-flex"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-7 sm:inline-flex"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-7 sm:inline-flex"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`teks-${scene.id}`}>Narasi (satu kalimat)</Label>
            <span className="text-[11px] text-muted-foreground">
              {scene.teks.trim().split(/\s+/).filter(Boolean).length} kata
            </span>
          </div>
          <Textarea
            id={`teks-${scene.id}`}
            value={scene.teks}
            onChange={(e) => onChange({ teks: e.target.value })}
            rows={2}
            placeholder="Satu kalimat yang dibacakan VO…"
            className="resize-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Latar scene</Label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
              <button
                type="button"
                onClick={() => {
                  onChange({
                    jenis: "klip",
                    klip: scene.klip ?? footage[0]?.id,
                  });
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  scene.jenis === "klip" ? "bg-card shadow-sm" : "text-muted-foreground",
                )}
              >
                <Film className="size-3.5" />
                Footage
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    jenis: "ilustrasi",
                    ilustrasi: scene.ilustrasi?.length ? scene.ilustrasi : ["pembalut"],
                  })
                }
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  scene.jenis === "ilustrasi" ? "bg-card shadow-sm" : "text-muted-foreground",
                )}
              >
                <ImageIcon className="size-3.5" />
                Krem
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{scene.jenis === "klip" ? "Footage" : "Ilustrasi"}</Label>
            {scene.jenis === "klip" ? (
              <Dialog open={pilihFootage} onOpenChange={setPilihFootage}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 overflow-hidden">
                    {klip?.thumbUrl ? (
                      <Image
                        src={klip.thumbUrl}
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                        className="size-6 rounded object-cover"
                      />
                    ) : (
                      <Film className="size-4" />
                    )}
                    <span className="truncate">{klip?.name ?? "Pilih footage"}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Pilih footage</DialogTitle>
                    <DialogDescription>
                      {footage.length} klip di library.{" "}
                      <Link href="/library" className="underline">
                        Unggah klip baru
                      </Link>
                    </DialogDescription>
                  </DialogHeader>
                  {footage.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Library masih kosong.
                    </p>
                  ) : (
                    <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                      {footage.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            onChange({ klip: f.id });
                            setPilihFootage(false);
                          }}
                          className={cn(
                            "overflow-hidden rounded-lg border text-left transition-colors",
                            scene.klip === f.id
                              ? "border-primary ring-2 ring-primary/25"
                              : "border-border hover:border-primary/40",
                          )}
                        >
                          <div className="relative aspect-video bg-secondary">
                            {f.thumbUrl ? (
                              <Image src={f.thumbUrl} alt="" fill unoptimized className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Film className="size-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                              {formatDuration(f.duration)}
                            </span>
                          </div>
                          <p className="truncate p-2 text-[11px]">{f.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pilih di bawah. Urutan pilih = urutan muncul.
              </p>
            )}
          </div>
        </div>

        {scene.jenis === "ilustrasi" && (
          <div className="space-y-2">
            <Label>Ilustrasi</Label>
            <div className="flex flex-wrap gap-1.5">
              {ILLUSTRATIONS.map((il) => {
                const posisi = ilustrasiTerpilih.indexOf(il.kunci);
                const aktif = posisi !== -1;
                return (
                  <button
                    key={il.kunci}
                    type="button"
                    title={il.deskripsi}
                    onClick={() => toggleIlustrasi(il.kunci)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                      aktif
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: il.warna }}
                    />
                    {il.label}
                    {aktif && (
                      <span className="ml-0.5 rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                        {posisi + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Judul di layar</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={tambahBaris}>
              <Plus className="size-3" />
              Baris
            </Button>
          </div>
          {baris.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
              Tanpa judul. Tambahkan 1–2 baris pendek untuk hook.
            </p>
          )}
          <div className="space-y-2">
            {baris.map((b, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="flex-1 space-y-1">
                  <Input
                    value={b.teks}
                    onChange={(e) => ubahSatu(i, { teks: e.target.value })}
                    placeholder={i === 0 ? "satu pembalut" : "terlihat biasa."}
                    className="h-9"
                  />
                  {(b.masuk !== undefined || b.keluar !== undefined || b.atas !== undefined || b.ukuran !== undefined) && (
                    <div className="grid grid-cols-4 gap-1">
                      <AngkaKecil
                        label="masuk"
                        value={b.masuk}
                        onChange={(v) => ubahSatu(i, { masuk: v })}
                      />
                      <AngkaKecil
                        label="keluar"
                        value={b.keluar}
                        onChange={(v) => ubahSatu(i, { keluar: v })}
                      />
                      <AngkaKecil
                        label="atas px"
                        value={b.atas}
                        onChange={(v) => ubahSatu(i, { atas: v })}
                      />
                      <AngkaKecil
                        label="ukuran"
                        value={b.ukuran}
                        onChange={(v) => ubahSatu(i, { ukuran: v })}
                      />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 size-8 shrink-0 text-muted-foreground"
                  onClick={() => hapusBaris(i)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-[11px]">Kata pink</Label>
            <Input
              value={scene.pink ?? ""}
              onChange={(e) => onChange({ pink: e.target.value || undefined })}
              placeholder="biasa"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Kata kunci caption</Label>
            <Input
              value={(scene.kata_kunci ?? []).join(", ")}
              onChange={(e) => onChange({ kata_kunci: daftar(e.target.value) })}
              placeholder="sekali, sampah"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Label (pisah koma)</Label>
            <Input
              value={(scene.label ?? []).join(", ")}
              onChange={(e) => onChange({ label: daftar(e.target.value) })}
              placeholder="1 wanita, 1 siklus"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Collapsible open={lanjutan} onOpenChange={setLanjutan}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground">
              <Sparkles className="size-3" />
              Opsi lanjutan
              <ChevronDown className={cn("size-3 transition-transform", lanjutan && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {scene.jenis === "klip" && (
              <div className="space-y-2">
                <Label className="text-[11px]">Stiker di atas footage</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ILLUSTRATIONS.map((il) => {
                    const aktif = (scene.stiker ?? []).includes(il.kunci);
                    return (
                      <button
                        key={il.kunci}
                        type="button"
                        onClick={() => toggleStiker(il.kunci)}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                          aktif
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        {il.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border/70 p-2.5">
              <div>
                <p className="text-xs font-medium">Angka berjalan</p>
                <p className="text-[10px] text-muted-foreground">
                  Tulis {"{angka}"} di salah satu baris judul.
                </p>
              </div>
              <Switch
                checked={Boolean(scene.hitung)}
                onCheckedChange={(on) =>
                  onChange({
                    hitung: on ? { ke: 800, mulai: 1, durasi: 0.9 } : undefined,
                  })
                }
              />
            </div>

            {scene.hitung && (
              <div className="grid grid-cols-3 gap-2">
                <AngkaKecil
                  label="ke"
                  value={scene.hitung.ke}
                  onChange={(v) => onChange({ hitung: { ...scene.hitung!, ke: v ?? 0 } })}
                />
                <AngkaKecil
                  label="mulai (dtk)"
                  value={scene.hitung.mulai}
                  onChange={(v) => onChange({ hitung: { ...scene.hitung!, mulai: v } })}
                />
                <AngkaKecil
                  label="durasi (dtk)"
                  value={scene.hitung.durasi}
                  onChange={(v) => onChange({ hitung: { ...scene.hitung!, durasi: v } })}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <AngkaKecil
                label="mulai footage (dtk)"
                value={scene.mulai_media}
                onChange={(v) => onChange({ mulai_media: v })}
              />
              <AngkaKecil
                label="kecepatan"
                value={scene.kecepatan}
                onChange={(v) => onChange({ kecepatan: v })}
                placeholder="1"
              />
            </div>

            {ilustrasiTerpilih.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Ilustrasi:{" "}
                {ilustrasiTerpilih
                  .map((k) => illustrationByKey(k)?.label ?? k)
                  .join(" → ")}
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {(errors.length > 0 || warnings.length > 0) && (
          <ul className="space-y-1 rounded-lg bg-secondary/60 p-2.5 text-[11px]">
            {errors.map((e, i) => (
              <li key={`e${i}`} className="text-destructive">
                {e.message}
              </li>
            ))}
            {warnings.map((w, i) => (
              <li key={`w${i}`} className="text-amber-800">
                {w.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function AngkaKecil({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <Input
        type="number"
        step="0.1"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(angkaAtauKosong(e.target.value))}
        className="h-8 text-xs"
      />
    </label>
  );
}
