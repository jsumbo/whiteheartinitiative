import { NextResponse } from "next/server";
import { adminConfigured, checkCredentials, startSession } from "@/lib/admin/auth";
import { fail } from "@/lib/admin/api";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(request: Request) {
  if (!adminConfigured()) return fail("The admin login is not set up. Add ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET to .env.local.", 500);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) return fail("Too many attempts. Please wait 15 minutes and try again.", 429);

  const body = await request.json().catch(() => ({}));
  if (!checkCredentials(String(body.username ?? "").trim(), String(body.password ?? ""))) {
    attempts.set(ip, [...recent, now]);
    return fail("Wrong username or password.", 401);
  }

  attempts.delete(ip);
  await startSession(new URL(request.url).protocol === "https:");
  return NextResponse.json({ ok: true });
}
