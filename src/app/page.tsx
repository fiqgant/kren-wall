import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoBar } from "@/components/logo-bar";
import { AnimatedBackground } from "@/components/animated-background";
import { FadeIn } from "@/components/fade-in";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <AnimatedBackground />

      <header className="relative z-10 flex justify-center px-4 pt-6">
        <LogoBar />
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-5 py-12 text-center">
        <FadeIn>
          <p className="text-xs font-semibold tracking-[0.35em] text-primary uppercase">
            KREN 2026
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-5xl font-extrabold tracking-tight text-balance">
            KREN{" "}
            <span className="bg-gradient-to-r from-[#4f8a86] to-teal-400 bg-clip-text text-transparent">
              Wall
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-xl font-bold tracking-tight">ARE YOU NEXT?</p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="max-w-xs text-sm text-muted-foreground">
            Bagikan momen kamu di acara KREN! Foto dan komentar terbaik akan dipilih. Tag @politeknikwbi dan @wbi_nexgenofe di Instagram untuk dapat hadiah menarik.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25"
            >
              <Link href="/share">
                <Camera className="size-5" aria-hidden />
                Bagikan Momenmu
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full text-base"
            >
              <Link href="/gallery">Galeri</Link>
            </Button>
          </div>
        </FadeIn>


      </section>

      <footer className="relative z-10 pb-6 text-center text-xs text-muted-foreground">
        KREN 2026 · Politeknik Wilmar Bisnis Indonesia · WBIIC
      </footer>
    </main>
  );
}
