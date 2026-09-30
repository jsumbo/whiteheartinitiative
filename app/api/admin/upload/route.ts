import { NextResponse } from "next/server";
import sharp from "sharp";
import { fail, requireAdmin } from "@/lib/admin/api";
import { slugify } from "@/lib/content";
import { store } from "@/lib/store";

const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// Saves an uploaded photo into the uploads folder. Large phone photos are shrunk
// to at most 2400px wide and saved as JPEG so the folder stays small.
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("No photo was received.");
  if (!TYPES.includes(file.type)) return fail("Please upload a JPG, PNG or WebP photo.");
  if (file.size > MAX_BYTES) return fail("This photo is over 15 MB. Please pick a smaller one.");

  let bytes: Buffer;
  try {
    bytes = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return fail("This file could not be read as a photo.");
  }

  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "photo";
  const name = `${Date.now().toString(36)}-${base}.jpg`;
  const url = await store.upload(name, "image/jpeg", new Uint8Array(bytes).buffer);
  return NextResponse.json({ ok: true, url });
}
