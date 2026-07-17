"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Images, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoBar } from "@/components/logo-bar";
import { FramedPhoto } from "@/components/framed-photo";
import { useSubmissions } from "@/hooks/use-submissions";
import { downloadFramedImage } from "@/lib/image";
import { getFrame } from "@/lib/frames";
import type { Submission } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GalleryPage() {
  const { submissions, loading } = useSubmissions({ photosOnly: true });
  const [selected, setSelected] = useState<Submission | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!selected?.photo_url) return;
    setDownloading(true);
    try {
      await downloadFramedImage(
        selected.photo_url,
        getFrame(selected.frame).src,
        `kren-wall-${selected.name.toLowerCase().replace(/\s+/g, "-")}.png`
      );
    } catch {
      toast.error("Gagal mengunduh. Coba lagi ya.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-background to-muted/60">
      <header className="flex items-center justify-between px-4 pt-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 shrink-0">
          <Link href="/" aria-label="Kembali ke beranda">
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </Button>
        <LogoBar size="small" />
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Galeri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua momen berbingkai dari KREN 2026 — diperbarui langsung.
        </p>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-2xl" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <Images className="size-12 text-muted-foreground/50" aria-hidden />
            <p className="text-muted-foreground">
              Belum ada foto — jadilah yang pertama di KREN Wall!
            </p>
            <Button asChild className="rounded-full">
              <Link href="/share">Bagikan Momenmu</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {submissions.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(s)}
                  className="group block w-full overflow-hidden rounded-2xl text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Lihat foto dari ${s.name}`}
                >
                  <FramedPhoto
                    photoUrl={s.photo_url!}
                    frameId={s.frame}
                    alt={`Foto dari ${s.name}`}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="px-1 py-2">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.message}
                    </p>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          {selected && (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 pb-4">
                <DialogHeader>
                  <DialogTitle>{selected.name}</DialogTitle>
                  <DialogDescription>
                    {formatDate(selected.created_at)}
                  </DialogDescription>
                </DialogHeader>
                <FramedPhoto
                  photoUrl={selected.photo_url!}
                  frameId={selected.frame}
                  alt={`Foto dari ${selected.name}`}
                  sizes="400px"
                  priority
                  className="mx-auto w-full max-w-xs max-h-[50dvh]"
                />
                <p className="text-sm break-words">{selected.message}</p>
              </div>
              <div className="flex shrink-0 gap-3 border-t bg-background p-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 rounded-full"
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Unduh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="flex-1 rounded-full"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
