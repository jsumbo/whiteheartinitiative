import fs from "node:fs/promises";
import path from "node:path";

// Serves photos uploaded in the admin (content/uploads). They live outside /public because
// Next.js only serves files that were in /public when the site was built.

const dir = path.join(process.cwd(), "content", "uploads");
const types: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[file]">) {
  const name = path.basename((await ctx.params).file);
  const type = types[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(dir, name));
    // File names are unique per upload, so browsers can keep them for a year.
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
