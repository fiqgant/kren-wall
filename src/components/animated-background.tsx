import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  /** Dark variant for the Smart TV screen. */
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Softly drifting orange gradient blobs. Pure CSS animation
 * (gradient-blob keyframes in globals.css) — zero JS cost.
 */
export function AnimatedBackground({
  variant = "light",
  className,
}: AnimatedBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        variant === "dark" ? "bg-black" : "bg-background",
        className
      )}
    >
      <div className="gradient-blob absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full bg-[#4f8a86]/20 blur-3xl" />
      <div
        className="gradient-blob absolute -right-1/4 -bottom-1/4 h-[60vmax] w-[60vmax] rounded-full bg-[#4f8a86]/15 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className={cn(
          "gradient-blob absolute top-1/3 left-1/2 h-[40vmax] w-[40vmax] rounded-full blur-3xl",
          variant === "dark" ? "bg-teal-500/10" : "bg-teal-300/25"
        )}
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
