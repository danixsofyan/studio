"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

function pesanError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email atau password salah.";
  if (m.includes("email not confirmed"))
    return "Email belum dikonfirmasi. Cek kotak masuk, atau matikan konfirmasi email di Supabase.";
  if (m.includes("already registered")) return "Email ini sudah terdaftar. Coba masuk.";
  if (m.includes("password should be")) return "Password minimal 6 karakter.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Tunggu sebentar.";
  return message;
}

export function LoginForm({ next, siap }: { next: string; siap: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"masuk" | "daftar" | "tautan" | null>(null);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    if (!siap) return toast.error("Supabase belum dikonfigurasi.");
    setLoading("masuk");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(null);
    if (error) return toast.error(pesanError(error.message));
    router.replace(next);
    router.refresh();
  }

  async function daftar(e: React.FormEvent) {
    e.preventDefault();
    if (!siap) return toast.error("Supabase belum dikonfigurasi.");
    setLoading("daftar");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(null);
    if (error) return toast.error(pesanError(error.message));
    if (data.session) {
      router.replace(next);
      router.refresh();
      return;
    }
    toast.success("Akun dibuat. Cek email untuk mengonfirmasi, lalu masuk.");
  }

  async function kirimTautan() {
    if (!siap) return toast.error("Supabase belum dikonfigurasi.");
    if (!email) return toast.error("Isi email dulu.");
    setLoading("tautan");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(null);
    if (error) return toast.error(pesanError(error.message));
    toast.success("Tautan masuk dikirim. Cek email.");
  }

  return (
    <Tabs defaultValue="masuk" className="gap-5">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="masuk">Masuk</TabsTrigger>
        <TabsTrigger value="daftar">Daftar</TabsTrigger>
      </TabsList>

      <TabsContent value="masuk">
        <form onSubmit={masuk} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-masuk">Email</Label>
            <Input
              id="email-masuk"
              type="email"
              autoComplete="email"
              placeholder="kamu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-masuk">Password</Label>
            <Input
              id="password-masuk"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading !== null}>
            {loading === "masuk" && <Loader2 className="size-4 animate-spin" />}
            Masuk
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            atau
          </span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={kirimTautan}
          disabled={loading !== null}
        >
          {loading === "tautan" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Kirim tautan masuk
        </Button>
      </TabsContent>

      <TabsContent value="daftar">
        <form onSubmit={daftar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-daftar">Email</Label>
            <Input
              id="email-daftar"
              type="email"
              autoComplete="email"
              placeholder="kamu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-daftar">Password</Label>
            <Input
              id="password-daftar"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading !== null}>
            {loading === "daftar" && <Loader2 className="size-4 animate-spin" />}
            Buat akun
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Kalau konfirmasi email aktif, kamu perlu klik tautan di email sebelum
            bisa masuk.
          </p>
        </form>
      </TabsContent>
    </Tabs>
  );
}
