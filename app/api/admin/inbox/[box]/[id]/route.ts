import { NextResponse } from "next/server";
import { fail, requireAdmin } from "@/lib/admin/api";
import { getInboxDef } from "@/lib/admin/inbox";
import { store } from "@/lib/store";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/inbox/[box]/[id]">) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { box, id } = await ctx.params;
  const def = getInboxDef(box);
  if (!def) return fail("Unknown inbox.", 404);

  await store.deleteItem(def.name, id);
  return NextResponse.json({ ok: true });
}
