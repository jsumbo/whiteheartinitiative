import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSignedIn } from "./auth";

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Returns an error response when the request is not from a signed-in editor.
export async function requireAdmin() {
  return (await isSignedIn()) ? null : fail("Your session has ended. Please sign in again.", 401);
}

// Rebuilds the public pages so changes show straight away.
export function refreshSite() {
  revalidatePath("/", "layout");
}
