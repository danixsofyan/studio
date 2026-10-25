import { FolderUp, HardDrive } from "lucide-react";
import { FootageUploader } from "@/components/footage-uploader";
import { FootageGrid } from "@/components/footage-grid";
import { listLibrary } from "@/lib/data";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { footage } = await listLibrary();
  const totalSize = footage.reduce((n, a) => n + (a.size ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-kecil">Bahan mentah</p>
          <h1 className="mt-1 font-display text-4xl leading-none md:text-5xl">Footage</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Satu tempat untuk semua klip. Pilih dari sini saat menyusun scene, tanpa
            menyalin folder.
          </p>
        </div>
        <div className="surface flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <HardDrive className="size-3.5" />
          {footage.length} klip · {formatBytes(totalSize)}
        </div>
      </div>

      <FootageUploader />

      <div className="flex items-center gap-2">
        <FolderUp className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Semua klip</h2>
      </div>

      <FootageGrid items={footage} />

      <div className="surface p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">Tips supaya render mulus</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Rekam vertikal, HDR dimatikan di iPhone (Settings › Camera › Formats).</li>
          <li>Satu klip = satu aksi, 5–10 detik. Lebih mudah dipotong saat menyusun.</li>
          <li>Nama file deskriptif: <code>cuci-clodi-01.MOV</code>, <code>sampah-tps-02.MOV</code>.</li>
          <li>Footage 4K boleh; worker menormalkan ke 1080×1920 sebelum render.</li>
        </ul>
      </div>
    </div>
  );
}
