"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LogoBar } from "@/components/logo-bar";
import { AnimatedBackground } from "@/components/animated-background";
import { FramedPhoto } from "@/components/framed-photo";
import { useSubmissions } from "@/hooks/use-submissions";
import type { Submission } from "@/lib/types";

const SLIDE_MS = 8000;
const BANNER_MS = 5000;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Tiga gaya transisi slide yang dirotasi supaya tidak monoton:
 * fade+zoom, geser horizontal, geser vertikal.
 */
const SLIDE_VARIANTS: Variants[] = [
  {
    initial: { opacity: 0, scale: 1.06 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
  {
    initial: { opacity: 0, x: 120 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -120 },
  },
  {
    initial: { opacity: 0, y: 90 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -90 },
  },
];

/** Teks masuk bertahap (pesan → nama → tanggal). */
const textContainer: Variants = {
  animate: { transition: { staggerChildren: 0.18, delayChildren: 0.35 } },
};
const textItem: Variants = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function PhotoSlide({ submission }: { submission: Submission }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[3.5vmin] px-[5vmin] pt-[9vmin] pb-[6vmin] landscape:flex-row landscape:gap-[6vmin] landscape:py-[6vmin]">
      {/* Ken Burns: zoom pelan selama slide tampil */}
      <motion.div
        className="shrink-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.045 }}
        transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
      >
        <FramedPhoto
          photoUrl={submission.photo_url!}
          frameId={submission.frame}
          alt={`Foto dari ${submission.name}`}
          sizes="70vmin"
          priority
          className="h-[64vh] w-auto shadow-2xl shadow-teal-500/20 landscape:h-[76vh]"
        />
      </motion.div>

      <motion.div
        variants={textContainer}
        initial="initial"
        animate="animate"
        className="max-w-[88vw] space-y-[2vmin] text-center landscape:max-w-[42vw] landscape:text-left"
      >
        <motion.p
          variants={textItem}
          className="text-[5.5vmin] leading-snug font-semibold text-white break-words landscape:text-[4.2vmin]"
        >
          “{submission.message}”
        </motion.p>
        <motion.p
          variants={textItem}
          className="text-[4.5vmin] font-bold text-[#7fc2bd] landscape:text-[3.2vmin]"
        >
          {submission.name}
        </motion.p>
        <motion.p
          variants={textItem}
          className="text-[2.8vmin] text-white/50 landscape:text-[2.2vmin]"
        >
          {formatDate(submission.created_at)}
        </motion.p>
      </motion.div>
    </div>
  );
}

function TextSlide({ submission }: { submission: Submission }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-[5vmin] px-[8vmin] text-center">
      <AnimatedBackground variant="dark" />
      <motion.div
        variants={textContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 space-y-[4vmin]"
      >
        <motion.p
          variants={textItem}
          className="mx-auto max-w-[85vw] text-[6.5vmin] leading-tight font-bold text-white break-words"
        >
          “{submission.message}”
        </motion.p>
        <motion.div variants={textItem}>
          <p className="text-[4.5vmin] font-bold text-[#7fc2bd]">
            {submission.name}
          </p>
          <p className="mt-[1vmin] text-[2.8vmin] text-white/50">
            {formatDate(submission.created_at)}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function IdleSlide() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-[4vmin] px-[8vmin] text-center">
      <AnimatedBackground variant="dark" />
      <motion.h1
        className="relative z-10 text-[11vmin] font-extrabold text-white"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        KREN <span className="text-[#7fc2bd]">Wall</span>
      </motion.h1>
      <motion.p
        className="relative z-10 text-[5.5vmin] font-bold tracking-wide text-white/80"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ARE YOU NEXT?
      </motion.p>
      <p className="relative z-10 text-[3.2vmin] text-white/50">
        Pindai kode QR dan bagikan momenmu.
      </p>
    </div>
  );
}

export default function TvPage() {
  const { submissions } = useSubmissions();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [arrival, setArrival] = useState<Submission | null>(null);
  const seenIds = useRef<Set<string> | null>(null);

  const count = submissions.length;

  const next = useCallback(
    () => setIndex((i) => (count ? (i + 1) % count : 0)),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (count ? (i - 1 + count) % count : 0)),
    [count]
  );

  // Slide otomatis tiap 8 detik kecuali dijeda.
  useEffect(() => {
    if (paused || count === 0) return;
    const timer = setInterval(next, SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, count, next]);

  // Jaga index tetap valid saat ada kiriman dihapus realtime.
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  // Banner "baru bergabung": deteksi id baru dari realtime
  // (muatan awal hanya mengisi daftar id, tanpa banner).
  useEffect(() => {
    if (submissions.length === 0) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(submissions.map((s) => s.id));
      return;
    }
    const fresh = submissions.find((s) => !seenIds.current!.has(s.id));
    if (fresh) {
      submissions.forEach((s) => seenIds.current!.add(s.id));
      setArrival(fresh);
      const t = setTimeout(() => setArrival(null), BANNER_MS);
      return () => clearTimeout(t);
    }
  }, [submissions]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "f":
        case "F":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
        case " ":
          e.preventDefault();
          setPaused((p) => !p);
          break;
        case "ArrowRight":
          next();
          break;
        case "ArrowLeft":
          prev();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Mode TV: sembunyikan kursor + scrollbar selama halaman ini aktif.
  useEffect(() => {
    document.documentElement.classList.add("tv-mode");
    document.body.classList.add("tv-mode");
    return () => {
      document.documentElement.classList.remove("tv-mode");
      document.body.classList.remove("tv-mode");
    };
  }, []);

  const current = count > 0 ? submissions[index % count] : null;
  const variant = SLIDE_VARIANTS[index % SLIDE_VARIANTS.length];

  return (
    <main
      className="dark relative h-dvh w-screen overflow-hidden bg-black"
      aria-label="Tampilan langsung KREN Wall"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id ?? "idle"}
          variants={variant}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="h-full"
        >
          {current ? (
            current.has_photo && current.photo_url ? (
              <PhotoSlide submission={current} />
            ) : (
              <TextSlide submission={current} />
            )
          ) : (
            <IdleSlide />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Banner kiriman baru masuk (realtime) */}
      <AnimatePresence>
        {arrival && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute top-[12vmin] left-1/2 z-30 flex -translate-x-1/2 items-center gap-[1.5vmin] rounded-full bg-[#4f8a86] px-[3vmin] py-[1.5vmin] shadow-2xl shadow-teal-500/40"
          >
            <Sparkles className="size-[3vmin] text-white" aria-hidden />
            <p className="text-[2.6vmin] font-semibold whitespace-nowrap text-white">
              {arrival.name} baru saja bergabung di KREN Wall!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-[2vmin] left-1/2 z-20 flex w-max -translate-x-1/2 items-center gap-[3vmin] rounded-2xl bg-white/90 px-[2vmin] py-[1vmin] landscape:left-[3vmin] landscape:translate-x-0">
        <LogoBar size="small" />
      </div>

      <div className="absolute top-[2.2vmin] right-[3vmin] z-20 hidden items-center gap-3 landscape:flex">
        {paused && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[1.8vmin] text-white/70">
            Jeda
          </span>
        )}
        <span className="text-[2.2vmin] font-bold tracking-widest text-[#7fc2bd] uppercase">
          KREN 2026
        </span>
      </div>

      {/* Progress bar durasi slide */}
      {count > 0 && !paused && (
        <motion.div
          key={`progress-${current?.id ?? index}`}
          className="absolute bottom-0 left-0 z-20 h-[0.5vmin] min-h-1 bg-gradient-to-r from-[#4f8a86] to-teal-300"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
        />
      )}

      {count > 0 && (
        <div className="absolute bottom-[2.5vmin] left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {submissions.slice(0, 12).map((s, i) => (
            <span
              key={s.id}
              className={`h-[0.6vmin] min-h-1 rounded-full transition-all duration-500 ${
                i === index % Math.min(count, 12)
                  ? "w-[3vmin] bg-[#4f8a86]"
                  : "w-[1vmin] bg-white/25"
              }`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
