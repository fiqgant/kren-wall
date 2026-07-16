"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoBar } from "@/components/logo-bar";
import { AnimatedBackground } from "@/components/animated-background";

export default function ThanksPage() {
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
