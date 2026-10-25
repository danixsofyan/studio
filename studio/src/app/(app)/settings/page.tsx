import { Terminal, HardDrive, ArrowRight } from "lucide-react";
import { getProfile, currentUser } from "@/lib/data";
import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, user] = await Promise.all([getProfile(), currentUser()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="label-kecil">Konfigurasi</p>
        <h1 className="mt-1 font-display text-4xl leading-none md:text-5xl">Pengaturan</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Suara, model, dan worker render. Cukup diatur sekali.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <SettingsForm profile={profile as Profile | null} email={user?.email ?? ""} />

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                Worker render
              </CardTitle>
              <CardDescription>
                Vercel tidak bisa menjalankan ffmpeg. Render dikerjakan di Mac kamu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                Worker mengambil job dari Supabase, menyusun project dari{" "}
                <code>_TEMPLATE</code>, lalu mengunggah MP4 kembali.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-[#2b2320] p-3 text-[11px] leading-relaxed text-[#f6efe6]">
{`cd worker
npm install
cp .env.example .env   # isi service role key
npm start`}
              </pre>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">satu job sekaligus</Badge>
                <Badge variant="secondary">log real-time</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                Penyimpanan
              </CardTitle>
              <CardDescription>Supabase Free = 1 GB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Footage 4K cepat memenuhi kuota. Kalau mulai penuh, kompres klip ke
                1080p sebelum upload atau naikkan plan Supabase.
              </p>
              <p className="flex items-center gap-1 text-foreground">
                <ArrowRight className="size-3.5" />
                MP4 hasil render bisa diunduh lalu dihapus dari cloud.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
