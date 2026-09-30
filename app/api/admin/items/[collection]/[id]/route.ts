import { NextResponse } from "next/server";
import { fail, refreshSite, requireAdmin } from "@/lib/admin/api";
import { clean, getCollectionDef } from "@/lib/admin/schema";
import { store } from "@/lib/store";

type Ctx = RouteContext<"/api/admin/items/[collection]/[id]">;

export async function PUT(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { collection, id } = await ctx.params;
  const def = getCollectionDef(collection);
  if (!def) return fail("Unknown section.", 404);
  if (!(await store.getItem(def.name, id))) return fail("This entry no longer exists.", 404);

  const { data, error } = clean(def.fields, await request.json().catch(() => null));
  if (error) return fail(error);

  await store.updateItem(def.name, id, data);
  refreshSite();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { collection, id } = await ctx.params;
  const def = getCollectionDef(collection);
  if (!def) return fail("Unknown section.", 404);

  await store.deleteItem(def.name, id);
  refreshSite();
  return NextResponse.json({ ok: true });
}
