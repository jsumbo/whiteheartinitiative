import path from "node:path";
import { store } from "@/lib/store";

// Serves photos uploaded in the admin, from Appwrite or from content/uploads (see lib/store).
// They don't live in /public because Next.js only serves files that were in /public when the site was built.

const types: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[file]">) {
  const name = path.basename((await ctx.params).file);
  const type = types[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const bytes = await store.getUpload(name);
    if (!bytes) return new Response("Not found", { status: 404 });
    // File names are unique per upload, so browsers can keep them for a year.
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch (err) {
    console.error(`[uploads] could not load ${name}:`, err);
    return new Response("Could not load this photo", { status: 502 });
  }
}
