/** The two official KREN 2026 event frames. All frames are 9:16 (720x1280). */
export interface Frame {
  id: number;
  name: string;
  src: string;
}

export const FRAMES: Frame[] = [
  { id: 1, name: "KREN Classic", src: "/frames/frame1.png" },
  { id: 2, name: "KREN Bold", src: "/frames/frame2.png" },
];

export const DEFAULT_FRAME_ID = 1;

export function getFrame(id: number): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
