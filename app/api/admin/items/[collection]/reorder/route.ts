import { NextResponse } from "next/server";
import { fail, refreshSite, requireAdmin } from "@/lib/admin/api";
import { getCollectionDef } from "@/lib/admin/schema";
import { store } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/items/[collection]/reorder">) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const def = getCollectionDef((await ctx.params).collection);
  if (!def) return fail("Unknown section.", 404);

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : null;
  if (!ids) return fail("Missing order.");

  await store.reorder(def.name, ids);
  refreshSite();
  return NextResponse.json({ ok: true });
}
