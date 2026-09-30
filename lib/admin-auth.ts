import { createHmac, timingSafeEqual } from "node:crypto";

// Username/password login for the site editor at /admin.
// Credentials come from ADMIN_USERNAME and ADMIN_PASSWORD. Sessions are signed with ADMIN_SESSION_SECRET.

export const SESSION_COOKIE = "whi_admin_session";
export const SESSION_HOURS = 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return value;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  // Compare hashes so the check takes the same time whatever the input length.
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  // Evaluate both so a wrong username and a wrong password take the same time.
  const okUser = safeEqual(username, u);
  const okPass = safeEqual(password, p);
  return Boolean(u && p) && okUser && okPass;
}

export function createSession() {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${process.env.ADMIN_USERNAME}.${expires}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifySession(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;
  const payload = Buffer.from(encoded, "base64url").toString();
  if (!safeEqual(signature, sign(payload))) return false;
  const [username, expires] = [payload.slice(0, payload.lastIndexOf(".")), Number(payload.slice(payload.lastIndexOf(".") + 1))];
  // Changing ADMIN_USERNAME logs everyone out.
  return username === process.env.ADMIN_USERNAME && expires > Date.now();
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
