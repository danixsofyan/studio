"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, FolderUp, LogOut, Settings2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/videos", label: "Video", icon: Clapperboard },
  { href: "/library", label: "Footage", icon: FolderUp },
  { href: "/settings", label: "Pengaturan", icon: Settings2 },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function keluar() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar/70 px-4 py-6 md:flex">
        <Link href="/videos" className="flex items-center gap-2.5 px-2">
          <Image
            src="/img/logo-sedarikini.png"
            alt="Sedarikini"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-contain"
          />
          <div className="leading-tight">
            <p className="font-display text-xl tracking-tight">Sedarikini</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Studio
            </p>
          </div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const aktif = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  aktif
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-xl border border-border/80 bg-card/70 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5 text-primary" />
              Render di Mac
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Antrean render diproses worker lokal. Jangan tutup laptop saat render.
            </p>
          </div>
          <div className="px-1">
            <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 px-2 text-xs"
              onClick={keluar}
            >
              <LogOut className="size-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/videos" className="flex items-center gap-2">
            <Image
              src="/img/logo-sedarikini.png"
              alt="Sedarikini"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="font-display text-lg">Studio</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                size="sm"
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={keluar}>
              <LogOut className="size-4" />
            </Button>
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
