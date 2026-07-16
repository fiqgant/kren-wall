import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo resmi. Tinggi render tiap logo dikompensasi terhadap padding
 * internal file-nya supaya BOBOT VISUAL seimbang:
 * - kren.png (1898x531): huruf memenuhi kanvas → tinggi acuan.
 * - logo.png WBI (500x181): huruf ~80% tinggi kanvas → sedikit lebih tinggi.
 * - logo_wbiic.png (1000x600): konten hanya ~45% tinggi kanvas
 *   (banyak ruang kosong) → butuh ~2x tinggi acuan agar terlihat setara.
 */
const LOGOS = [
  {
    src: "/kren.png",
    alt: "KREN 2026",
    width: 1898,
    height: 531,
    className: "h-6 md:h-7",
    small: "h-4 md:h-5",
  },
  {
    src: "https://wbiic.wbi.ac.id/images/logo.png",
    alt: "Politeknik Wilmar Bisnis Indonesia",
    width: 500,
    height: 181,
    className: "h-8 md:h-9",
    small: "h-5 md:h-6",
  },
  {
    src: "https://wbiic.wbi.ac.id/images/logo_wbiic.png",
    alt: "WBI Business Initiative Center",
    width: 1000,
    height: 600,
    className: "h-14 md:h-16",
    small: "h-9 md:h-10",
  },
] as const;

interface LogoBarProps {
  /** Versi kecil untuk pojok layar Smart TV. */
  size?: "default" | "small";
  className?: string;
}

export function LogoBar({ size = "default", className }: LogoBarProps) {
  return (
    <div
      className={cn("flex items-center gap-2 md:gap-4", className)}
      aria-label="KREN 2026, Politeknik Wilmar Bisnis Indonesia, dan WBI Business Initiative Center"
    >
      {LOGOS.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className={cn(
            "w-auto object-contain",
            size === "small" ? logo.small : logo.className
          )}
          priority
        />
      ))}
    </div>
  );
}
