import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseSiap } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const siap = supabaseSiap();

  if (siap) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/videos");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#2b2320] text-[#f6efe6] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#d9556f]/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-[#f7a8c4]/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-[#f7a8c4]">
            Sedarikini
          </p>
          <h1 className="mt-6 max-w-md font-display text-6xl leading-[1.05]">
            Satu tempat untuk script, suara, dan video.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#cfc4b8]">
            Tulis narasi, generate VO, pilih footage, lalu kirim ke antrean render.
            Gayanya tetap sama dengan Menspad.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3 text-xs text-[#cfc4b8]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-display text-2xl text-white">1080×1920</p>
            <p className="mt-1">Vertikal, 30 fps</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-display text-2xl text-white">1 klip</p>
            <p className="mt-1">satu aksi, 5–10 detik</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              Sedarikini
            </p>
            <h1 className="mt-2 font-display text-4xl">Studio</h1>
          </div>

          {!siap && (
            <Alert className="mb-6 border-amber-300 bg-amber-50 text-amber-900">
              <AlertTriangle />
              <AlertTitle>Supabase belum diatur</AlertTitle>
              <AlertDescription>
                Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di{" "}
                <code>.env.local</code>, lalu restart server. Panduan ada di{" "}
                <code>supabase/README.md</code>.
              </AlertDescription>
            </Alert>
          )}

          {params.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle />
              <AlertTitle>Tautan tidak valid</AlertTitle>
              <AlertDescription>
                Tautan masuk sudah kedaluwarsa. Coba kirim ulang.
              </AlertDescription>
            </Alert>
          )}

          <LoginForm next={params.next ?? "/videos"} siap={siap} />

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            Dengan masuk, kamu menyetujui bahwa konten hanya dipakai untuk
            Sedarikini dan VO memakai lisensi komersial ElevenLabs.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Butuh bantuan?{" "}
            <Link href="https://supabase.com/docs" className="underline">
              Panduan Supabase
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
