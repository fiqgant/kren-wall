import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only admin routes need auth; keeps every public page on the fast path.
  matcher: ["/admin/:path*", "/admin"],
};
