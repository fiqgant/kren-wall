"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCroppedImage, type CroppedImage } from "@/lib/image";
import { toast } from "sonner";

interface CropEditorProps {
  /** Object URL of the original picked file. */
  imageSrc: string;
  onApply: (result: CroppedImage) => void;
  onCancel: () => void;
}

/**
 * Fullscreen 9:16 crop editor (react-easy-crop): drag, pinch/wheel zoom,
 * pan and 90° rotation. Nothing is processed until the user hits Apply.
 */
export function CropEditor({ imageSrc, onApply, onCancel }: CropEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const result = await getCroppedImage(imageSrc, croppedAreaPixels, rotation);
      onApply(result);
    } catch {
      toast.error("Gagal memproses foto. Coba foto lain ya.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Potong fotomu"
    >
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={9 / 16}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
        />
      </div>

      <div className="glass flex flex-col gap-4 rounded-t-3xl bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
        <div className="flex items-center gap-3">
          <ZoomOut className="size-4 shrink-0 text-white/60" aria-hidden />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Perbesar"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#4f8a86]"
          />
          <ZoomIn className="size-4 shrink-0 text-white/60" aria-hidden />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            aria-label="Putar 90 derajat"
          >
            <RotateCw className="size-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={onCancel}
            disabled={processing}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleApply}
            disabled={processing || !croppedAreaPixels}
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Memproses…
              </>
            ) : (
              "Terapkan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
