import { NextResponse } from "next/server";
import { fail, refreshSite, requireAdmin } from "@/lib/admin/api";
import { clean, getCollectionDef } from "@/lib/admin/schema";
import { store } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/items/[collection]">) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const def = getCollectionDef((await ctx.params).collection);
  if (!def) return fail("Unknown section.", 404);

  const { data, error } = clean(def.fields, await request.json().catch(() => null));
  if (error) return fail(error);

  const item = await store.createItem(def.name, data);
  refreshSite();
  return NextResponse.json({ ok: true, id: item.id });
}
