import { store } from "@/lib/store";

// Handling for the contact form:
// spam checks, rate limits, saving to the admin inbox and email.

const recent = new Map<string, number[]>();

export function rateLimited(request: Request, max = 5, windowMs = 10 * 60 * 1000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > max;
}

export const field = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Saves a submission so it shows in the admin inbox. Returns false if the disk is read-only (e.g. on Vercel).
export async function saveSubmission(collection: "messages", data: Record<string, unknown>) {
  try {
    await store.createItem(collection, { ...data, receivedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error(`[forms] could not save ${collection}:`, err);
    return false;
  }
}

// Emails the team through Resend (https://resend.com) when RESEND_API_KEY and CONTACT_TO_EMAIL are set.
export async function sendEmail(subject: string, text: string, replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "White Heart Initiative website <onboarding@resend.dev>",
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  if (!res.ok) console.error("[forms] Resend error", res.status, await res.text());
  return res.ok;
}
