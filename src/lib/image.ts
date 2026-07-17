import type { Area } from "react-easy-crop";

export const OUTPUT_WIDTH = 720;
export const OUTPUT_HEIGHT = 1280;
export const WEBP_QUALITY = 0.8;
export const TARGET_MAX_BYTES = 300 * 1024;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Loads an image element from an object URL / data URL. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas export failed")),
      type,
      quality
    );
  });
}

let webpSupport: boolean | null = null;

/** Safari (all iOS versions as of writing) can't *encode* WebP via canvas
 * — it silently falls back to PNG, which breaks our size-targeting loop.
 * Detect once and use JPEG there instead. */
function supportsWebpEncoding(): boolean {
  if (webpSupport !== null) return webpSupport;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupport;
}

export interface CroppedImage {
  blob: Blob;
  contentType: string;
  extension: string;
}

/**
 * Crops the source image to the pixel area selected in react-easy-crop,
 * applies rotation, resizes to 720x1280 and compresses (~80%, stepping
 * quality down until the result fits the 300KB target). Uses WebP where
 * supported, JPEG elsewhere (Safari/iOS).
 */
export async function getCroppedImage(
  imageSrc: string,
  cropPixels: Area,
  rotation = 0
): Promise<CroppedImage> {
  const image = await loadImage(imageSrc);

  // Draw the rotated source onto an intermediate canvas large enough
  // to contain it, then crop from that.
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const bboxWidth = image.width * cos + image.height * sin;
  const bboxHeight = image.width * sin + image.height * cos;

  const stage = document.createElement("canvas");
  stage.width = Math.round(bboxWidth);
  stage.height = Math.round(bboxHeight);
  const stageCtx = stage.getContext("2d");
  if (!stageCtx) throw new Error("Canvas not supported");

  stageCtx.translate(stage.width / 2, stage.height / 2);
  stageCtx.rotate(radians);
  stageCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const out = document.createElement("canvas");
  out.width = OUTPUT_WIDTH;
  out.height = OUTPUT_HEIGHT;
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Canvas not supported");
  outCtx.imageSmoothingQuality = "high";

  outCtx.drawImage(
    stage,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  const contentType = supportsWebpEncoding() ? "image/webp" : "image/jpeg";
  const extension = contentType === "image/webp" ? "webp" : "jpg";

  let quality = WEBP_QUALITY;
  let blob = await canvasToBlob(out, contentType, quality);
  while (blob.size > TARGET_MAX_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(out, contentType, quality);
  }
  return { blob, contentType, extension };
}

/** Builds the dated storage path: photos/YYYY/MM/DD/<uuid>.<extension> */
export function buildStoragePath(extension: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `photos/${yyyy}/${mm}/${dd}/${crypto.randomUUID()}.${extension}`;
}

/**
 * Composites the photo with its PNG frame on a canvas and triggers a
 * download. Frames are never baked into stored images — only here,
 * at export time.
 */
export async function downloadFramedImage(
  photoUrl: string,
  frameSrc: string,
  fileName: string
): Promise<void> {
  const [photo, frame] = await Promise.all([
    loadImage(photoUrl),
    loadImage(frameSrc),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(photo, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  ctx.drawImage(frame, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const blob = await canvasToBlob(canvas, "image/png", 1);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
