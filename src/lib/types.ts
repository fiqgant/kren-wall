export interface DeviceInfo {
  device_id: string;
  user_agent: string;
  screen_width: number;
  screen_height: number;
  language: string;
  platform: string;
  timezone: string;
}

/** A single visitor submission (row in the `submissions` table). */
export interface Submission {
  id: string;
  name: string;
  message: string;
  photo_url: string | null;
  frame: number;
  has_photo: boolean;
  created_at: string;
  ip?: string | null;
  device_id?: string | null;
  user_agent?: string | null;
  screen_info?: Record<string, unknown> | null;
}

/** Payload accepted by POST /api/submit. */
export interface SubmitPayload {
  name: string;
  message: string;
  photo_url: string | null;
  frame: number;
  device_info: DeviceInfo;
}

export interface BannedDevice {
  id: string;
  ip: string | null;
  device_id: string | null;
  reason: string;
  banned_by: string;
  created_at: string;
}

export const MESSAGE_MAX_LENGTH = 300;
export const NAME_MAX_LENGTH = 60;
export const SUBMIT_COOLDOWN_MS = 30_000;

/** sessionStorage key the share page uses to hand the just-submitted
 * photo off to the thanks page for the Instagram Story share prompt. */
export const LAST_SHARE_KEY = "kren-last-share";

export interface LastShare {
  photoUrl: string;
  frameId: number;
  name: string;
}
