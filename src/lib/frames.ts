/** The official KREN 2026 event frames. All frames are 9:16 (720x1280). */
export interface Frame {
  id: number;
  name: string;
  src: string;
}

// `/frames/*` is served with a 1-year immutable Cache-Control (vercel.json),
// so swapping a PNG's bytes without changing its URL leaves browsers/edge
// cache showing the old file. Bump FRAME_ASSET_VERSION whenever any frame
// file in public/frames is replaced so the querystring busts the cache.
const FRAME_ASSET_VERSION = 2;

export const FRAMES: Frame[] = [
  { id: 1, name: "KREN Classic", src: `/frames/frame1.png?v=${FRAME_ASSET_VERSION}` },
  { id: 2, name: "KREN Bold", src: `/frames/frame2.png?v=${FRAME_ASSET_VERSION}` },
  { id: 3, name: "Frame 3", src: `/frames/frame3.png?v=${FRAME_ASSET_VERSION}` },
  { id: 4, name: "Frame 4", src: `/frames/frame4.png?v=${FRAME_ASSET_VERSION}` },
  { id: 5, name: "Frame 5", src: `/frames/frame5.png?v=${FRAME_ASSET_VERSION}` },
];

export const DEFAULT_FRAME_ID = 1;

export function getFrame(id: number): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
