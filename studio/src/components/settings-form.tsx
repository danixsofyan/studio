"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mic2, Play, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Voice = {
  id: string;
  name: string;
  category: string;
  language: string;
  preview: string | null;
  clone: boolean;
};

const MODEL = [
  { value: "eleven_multilingual_v2", label: "Multilingual v2 — paling natural (disarankan)" },
  { value: "eleven_turbo_v2_5", label: "Turbo v2.5 — lebih cepat, lebih murah" },
  { value: "eleven_flash_v2_5", label: "Flash v2.5 — paling cepat" },
];

export function SettingsForm({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string;
}) {
  const router = useRouter();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);

  const [voiceId, setVoiceId] = useState(profile?.voice_id ?? "");
  const [model, setModel] = useState(profile?.voice_model ?? "eleven_multilingual_v2");
  const settings = (profile?.voice_settings ?? {}) as Record<string, number | boolean>;
  const [stability, setStability] = useState(Number(settings.stability ?? 0.5));
  const [similarity, setSimilarity] = useState(Number(settings.similarity_boost ?? 0.75));
  const [style, setStyle] = useState(Number(settings.style ?? 0.25));
  const [boost, setBoost] = useState(Boolean(settings.use_speaker_boost ?? true));

  async function ambilSuara() {
    setMemuat(true);
    const res = await fetch("/api/elevenlabs/voices");
    const data = await res.json().catch(() => ({}));
    setMemuat(false);
    setConfigured(data.configured !== false);
    setVoices(data.voices ?? []);
    setPesan(data.message ?? null);
  }

  useEffect(() => {
    ambilSuara();
  }, []);

  async function simpan() {
    setMenyimpan(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voice_id: voiceId || null,
        voice_model: model,
        voice_settings: {
          stability,
          similarity_boost: similarity,
          style,
          use_speaker_boost: boost,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMenyimpan(false);
    if (!res.ok) return toast.error(data.error ?? "Gagal menyimpan.");
    toast.success("Pengaturan suara disimpan.");
    router.refresh();
  }

  const terpilih = voices.find((v) => v.id === voiceId);
  const klon = voices.filter((v) => v.clone);
  const lain = voices.filter((v) => !v.clone);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mic2 className="size-4 text-primary" />
                Suara VO
              </CardTitle>
              <CardDescription>
                Pilih voice clone kamu. Suara ini dipakai untuk semua video.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={ambilSuara} disabled={memuat}>
              {memuat ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Muat ulang
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!configured && (
            <Alert variant="destructive">
              <AlertTitle>API key ElevenLabs belum ada</AlertTitle>
              <AlertDescription>
                Tambahkan <code>ELEVENLABS_API_KEY</code> di <code>.env.local</code>{" "}
                (lokal) atau Environment Variables Vercel, lalu restart.
              </AlertDescription>
            </Alert>
          )}

          {pesan && configured && (
            <Alert>
              <AlertTitle>ElevenLabs</AlertTitle>
              <AlertDescription>{pesan}</AlertDescription>
            </Alert>
          )}

          {memuat ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          ) : voices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada suara. Buat clone di elevenlabs.io, lalu muat ulang.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={voiceId} onValueChange={setVoiceId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih suara" />
                  </SelectTrigger>
                  <SelectContent>
                    {klon.length > 0 && (
                      <>
                        {klon.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} · clone
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {lain.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} {v.category ? `· ${v.category}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {terpilih && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{terpilih.category || "suara"}</Badge>
                    {terpilih.clone && <Badge className="bg-primary/10 text-primary">clone</Badge>}
                    {terpilih.preview && (
                      <audio controls src={terpilih.preview} className="h-7 max-w-[220px]" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Karakter suara</CardTitle>
          <CardDescription>
            Samakan dengan video Menspad supaya seri tetap konsisten. Perubahan di
            sini berlaku untuk VO berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SliderField
            label="Stability"
            value={stability}
            onChange={setStability}
            hint="Rendah = lebih ekspresif, tinggi = lebih stabil."
          />
          <SliderField
            label="Similarity"
            value={similarity}
            onChange={setSimilarity}
            hint="Seberapa dekat dengan suara asli."
          />
          <SliderField
            label="Style"
            value={style}
            onChange={setStyle}
            hint="0 untuk narasi bersih, naikkan untuk lebih dramatis."
          />
          <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
            <div>
              <p className="text-sm font-medium">Speaker boost</p>
              <p className="text-xs text-muted-foreground">Memperjelas vokal di musik latar.</p>
            </div>
            <Switch checked={boost} onCheckedChange={setBoost} />
          </div>

          <Button onClick={simpan} disabled={menyimpan}>
            {menyimpan ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Simpan pengaturan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={1}
        step={0.05}
        onValueChange={(v) => onChange(v[0] ?? 0)}
      />
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
