import { SESSION_COOKIE } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Clears the login cookie and the editor's saved GitHub session, then returns to the sign-in page.
export function GET() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="robots" content="noindex" />
<title>Signing out</title></head><body><p>Signing out...</p><script>
try { localStorage.removeItem("decap-cms-user"); localStorage.removeItem("netlify-cms-user"); } catch (e) {}
window.location.replace("/admin/login");
</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
