import { NextResponse } from "next/server";
import { fail, refreshSite, requireAdmin } from "@/lib/admin/api";
import { clean, getDocDef } from "@/lib/admin/schema";
import { store } from "@/lib/store";

export async function PUT(request: Request, ctx: RouteContext<"/api/admin/docs/[key]">) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const def = getDocDef((await ctx.params).key);
  if (!def) return fail("Unknown page.", 404);

  const { data, error } = clean(def.fields, await request.json().catch(() => null));
  if (error) return fail(error);

  await store.setDoc(def.key, data);
  refreshSite();
  return NextResponse.json({ ok: true });
}
