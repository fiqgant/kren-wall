"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, ImagePlus, Info, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoBar } from "@/components/logo-bar";
import { CropEditor } from "@/components/crop-editor";
import { createClient } from "@/lib/supabase/client";
import { FRAMES, DEFAULT_FRAME_ID, getFrame } from "@/lib/frames";
import {
  buildStoragePath,
  MAX_UPLOAD_BYTES,
  type CroppedImage,
} from "@/lib/image";
import {
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  SUBMIT_COOLDOWN_MS,
} from "@/lib/types";
import { collectDeviceInfo } from "@/lib/device";

const COOLDOWN_KEY = "kren-last-submit";

export default function SharePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [frameId, setFrameId] = useState(DEFAULT_FRAME_ID);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<CroppedImage | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Bersihkan object URL saat diganti atau unmount.
  useEffect(() => {
    return () => {
      if (rawImage) URL.revokeObjectURL(rawImage);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  }, [rawImage, croppedUrl]);

  const IMAGE_EXTENSIONS = /\.(jpe?g|png|heic|heif|webp|gif)$/i;

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // iOS Safari can report an empty MIME type for HEIC photos picked
    // from the library — fall back to checking the file extension.
    const looksLikeImage =
      file.type.startsWith("image/") ||
      (file.type === "" && IMAGE_EXTENSIONS.test(file.name));
    if (!looksLikeImage) {
      toast.error("Pilih file gambar ya.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Foto lebih dari 10MB. Pilih yang lebih kecil ya.");
      return;
    }
    setRawImage(URL.createObjectURL(file));
  }

  function handleCropApply(result: CroppedImage) {
    setCroppedImage(result);
    setCroppedUrl(URL.createObjectURL(result.blob));
    setRawImage(null);
  }

  function clearPhoto() {
    setCroppedImage(null);
    setCroppedUrl(null);
  }

  function cooldownRemaining(): number {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0);
    return Math.max(0, last + SUBMIT_COOLDOWN_MS - Date.now());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Nama dan pesan wajib diisi.");
      return;
    }

    const wait = cooldownRemaining();
    if (wait > 0) {
      toast.info(
        `Sabar ya! Kamu bisa kirim lagi dalam ${Math.ceil(wait / 1000)} detik. 😊`
      );
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (croppedImage) {
        const supabase = createClient();
        const path = buildStoragePath(croppedImage.extension);
        const { error: uploadError } = await supabase.storage
          .from("kren-wall")
          .upload(path, croppedImage.blob, {
            contentType: croppedImage.contentType,
            cacheControl: "31536000",
          });
        if (uploadError) throw new Error(uploadError.message);
        photoUrl = supabase.storage.from("kren-wall").getPublicUrl(path)
          .data.publicUrl;
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          photo_url: photoUrl,
          frame: frameId,
          device_info: collectDeviceInfo(),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 429) {
        toast.info(
          `Sabar ya! Kamu bisa kirim lagi dalam ${body.retryAfter ?? 30} detik. 😊`
        );
        return;
      }

      if (res.status === 403) {
        toast.error(body.error || "Perangkat Anda diblokir permanen.");
        return;
      }

      if (!res.ok) throw new Error("Gagal mengirim");

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      router.push("/thanks");
    } catch {
      toast.error("Ada yang salah. Coba lagi ya.");
    } finally {
      setSubmitting(false);
    }
  }

  const frame = getFrame(frameId);

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-md px-5 py-8"
      >
        <h1 className="text-2xl font-bold tracking-tight">Bagikan Momenmu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tinggalkan pesan — tambahkan foto kalau mau — dan lihat momenmu
          tampil langsung di KREN Wall.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX_LENGTH}
              placeholder="Nama kamu"
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="message">Pesan *</Label>
              <span
                className="text-xs text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                {message.length}/{MESSAGE_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))
              }
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder="Pesanmu untuk KREN Wall…"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Foto (opsional)</Label>
            <input
              ref={fileInputRef}
              id="photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFilePick}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleFilePick}
            />
            {croppedUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={clearPhoto}
                className="w-full"
              >
                <X className="size-4" /> Hapus foto
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-24 flex-1 flex-col border-dashed"
                >
                  <Camera className="size-5 text-primary" />
                  Kamera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 flex-1 flex-col border-dashed"
                >
                  <ImagePlus className="size-5 text-primary" />
                  Galeri
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Maks. 10MB</p>
          </div>

          {croppedUrl && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Pilih bingkai</legend>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrameId(f.id)}
                    aria-pressed={frameId === f.id}
                    aria-label={`Bingkai: ${f.name}`}
                    className={`relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      frameId === f.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={croppedUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <Image
                      src={f.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="pointer-events-none object-cover"
                    />
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div aria-label="Pratinjau" className="space-y-2">
            <p className="text-sm font-medium">Pratinjau</p>
            <div className="relative mx-auto aspect-[9/16] w-48 overflow-hidden rounded-xl bg-muted shadow-lg">
              {croppedUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={croppedUrl}
                    alt="Foto kamu setelah dipotong"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <Image
                    src={frame.src}
                    alt=""
                    aria-hidden
                    fill
                    sizes="192px"
                    className="pointer-events-none object-cover"
                  />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#4f8a86] to-teal-500 p-5 text-center text-white">
                  <p className="line-clamp-[8] text-base font-semibold break-words">
                    {message || "Pesanmu tampil di sini"}
                  </p>
                  <p className="text-xs opacity-90">— {name || "Nama kamu"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-accent p-3 text-accent-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="text-xs leading-relaxed">
              Mohon gunakan bahasa yang sopan dan unggah foto yang pantas.
              Kiriman yang mengandung kata kasar atau konten tidak senonoh
              akan dihapus oleh panitia.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-base shadow-lg shadow-primary/25"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Mengirim…
              </>
            ) : (
              <>
                <Send className="size-5" /> Kirim ke KREN Wall
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {rawImage && (
        <CropEditor
          imageSrc={rawImage}
          onApply={handleCropApply}
          onCancel={() => setRawImage(null)}
        />
      )}
    </main>
  );
}
