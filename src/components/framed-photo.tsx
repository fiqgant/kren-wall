import Image from "next/image";
import { getFrame } from "@/lib/frames";
import { cn } from "@/lib/utils";

interface FramedPhotoProps {
  photoUrl: string;
  frameId: number;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a 9:16 photo with its PNG event frame overlaid live —
 * the frame is never merged into the stored image.
 */
export function FramedPhoto({
  photoUrl,
  frameId,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 320px",
  priority = false,
}: FramedPhotoProps) {
  const frame = getFrame(frameId);

  return (
    <div
      className={cn(
        "relative aspect-[9/16] overflow-hidden rounded-2xl",
        className
      )}
    >
      <Image
        src={photoUrl}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <Image
        src={frame.src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className="pointer-events-none object-cover"
      />
    </div>
  );
}
