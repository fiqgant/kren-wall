import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  SUBMIT_COOLDOWN_MS,
  type SubmitPayload,
} from "@/lib/types";

const lastSubmitByIp = new Map<string, number>();
const MAX_TRACKED_IPS = 10_000;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function isBanned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ip: string,
  deviceId: string | null
): Promise<boolean> {
  try {
    const orClauses: string[] = [];
    if (ip && ip !== "unknown") orClauses.push(`ip.eq.${ip}`);
    if (deviceId) orClauses.push(`device_id.eq.${deviceId}`);
    if (orClauses.length === 0) return false;

    const { data } = await supabase
      .from("banned_devices")
      .select("id")
      .or(orClauses.join(","))
      .limit(1);

    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();
  const last = lastSubmitByIp.get(ip) ?? 0;

  if (now - last < SUBMIT_COOLDOWN_MS) {
    const retryAfter = Math.ceil((last + SUBMIT_COOLDOWN_MS - now) / 1000);
    return NextResponse.json(
      { error: "Too many submissions", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let payload: SubmitPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim().slice(0, NAME_MAX_LENGTH);
  const message = String(payload.message ?? "")
    .trim()
    .slice(0, MESSAGE_MAX_LENGTH);
  const frame = payload.frame === 2 ? 2 : 1;
  const photoUrl =
    typeof payload.photo_url === "string" &&
    payload.photo_url.includes("/storage/v1/object/public/kren-wall/")
      ? payload.photo_url
      : null;

  if (!name || !message) {
    return NextResponse.json(
      { error: "Name and message are required" },
      { status: 400 }
    );
  }

  const deviceInfo = payload.device_info;
  const deviceId = deviceInfo?.device_id?.trim() || null;

  const supabase = await createClient();

  const banned = await isBanned(supabase, ip, deviceId);
  if (banned) {
    return NextResponse.json({ error: "Perangkat Anda diblokir permanen karena melanggar aturan." }, { status: 403 });
  }

  const { error } = await supabase.from("submissions").insert({
    name,
    message,
    photo_url: photoUrl,
    frame,
    has_photo: photoUrl !== null,
    ip,
    device_id: deviceId,
    user_agent: deviceInfo?.user_agent?.slice(0, 500) || null,
    screen_info: deviceInfo
      ? {
          screen_width: deviceInfo.screen_width,
          screen_height: deviceInfo.screen_height,
          language: deviceInfo.language,
          platform: deviceInfo.platform,
          timezone: deviceInfo.timezone,
        }
      : null,
  });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (lastSubmitByIp.size > MAX_TRACKED_IPS) lastSubmitByIp.clear();
  lastSubmitByIp.set(ip, now);

  return NextResponse.json({ ok: true }, { status: 201 });
}
