"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogoBar } from "@/components/logo-bar";
import { AnimatedBackground } from "@/components/animated-background";
import { composeFramedBlob, downloadFramedImage } from "@/lib/image";
import { getFrame } from "@/lib/frames";
import { LAST_SHARE_KEY, type LastShare } from "@/lib/types";

const IG_CAPTION =
  "Yuk share momen KREN-mu di Instagram Story dan tag @politeknikwbi & @wbi_nexgenofe! Foto & komentar paling menarik akan dipilih dan dapat hadiah 🎁";

export default function ThanksPage() {
  const [lastShare, setLastShare] = useState<LastShare | null>(null);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(LAST_SHARE_KEY);
    sessionStorage.removeItem(LAST_SHARE_KEY);
    if (!raw) return;
    try {
      setLastShare(JSON.parse(raw));
    } catch {
      // ignore malformed/stale value
    }
  }, []);

  async function handleShareInstagram() {
    if (!lastShare) return;
    setSharing(true);
    try {
      const blob = await composeFramedBlob(
        lastShare.photoUrl,
        getFrame(lastShare.frameId).src
      );
      const file = new File([blob], "kren-wall.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "KREN Wall",
          text: IG_CAPTION,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kren-wall.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.info("Foto diunduh — unggah manual ke Instagram Story kamu ya.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Gagal membagikan foto. Coba lagi ya.");
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    if (!lastShare) return;
    setDownloading(true);
    try {
      await downloadFramedImage(
        lastShare.photoUrl,
        getFrame(lastShare.frameId).src,
        `kren-wall-${lastShare.name.toLowerCase().replace(/\s+/g, "-")}.png`
      );
    } catch {
      toast.error("Gagal mengunduh. Coba lagi ya.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyCaption() {
    try {
      await navigator.clipboard.writeText(IG_CAPTION);
      toast.success("Teks disalin! Tempel di caption atau stiker teks Story kamu.");
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <AnimatedBackground />

      <header className="relative z-10 flex justify-center px-6 pt-8">
        <LogoBar />
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4f8a86] to-teal-500 shadow-xl shadow-primary/30"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <Check className="size-12 text-white" strokeWidth={3} aria-hidden />
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Terima Kasih!
          </h1>
          <p className="max-w-sm text-muted-foreground">
            Kenanganmu sudah ditambahkan ke KREN Wall.
          </p>
        </motion.div>

        {lastShare && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-sm rounded-2xl border bg-background/70 p-4 text-left backdrop-blur"
          >
            <p className="text-sm font-semibold">Bagikan ke Instagram Story</p>
            <p className="mt-1 text-xs text-muted-foreground">{IG_CAPTION}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={handleShareInstagram}
                disabled={sharing}
                size="sm"
                className="flex-1 rounded-full"
              >
                {sharing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Share2 className="size-4" />
                )}
                Bagikan
              </Button>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                variant="outline"
                size="sm"
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
                onClick={handleCopyCaption}
                variant="outline"
                size="sm"
                className="w-full rounded-full"
              >
                <Copy className="size-4" /> Salin teks
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="h-12 rounded-full px-8 shadow-lg shadow-primary/25">
            <Link href="/gallery">Lihat Galeri</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
            <Link href="/share">Kirim Lagi</Link>
          </Button>
        </motion.div>
      </section>

      <footer className="relative z-10 pb-6 text-center text-xs text-muted-foreground">
        KREN 2026 — ARE YOU NEXT?
      </footer>
    </main>
  );
}
