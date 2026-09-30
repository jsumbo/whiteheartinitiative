import { adminConfigured, checkCredentials, createSession, SESSION_COOKIE, SESSION_HOURS } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(ip, recent);
  return recent.length >= MAX_ATTEMPTS;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(message = "", username = "", status = 200) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Sign in | White Heart Initiative site editor</title>
  <link rel="icon" href="/logo-mark.png" type="image/png" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px;
      background: #0b3d0b; font-family: "Helvetica Neue", Arial, sans-serif; color: #1a2410; }
    main { width: 100%; max-width: 380px; background: #fff; padding: 32px 24px; border-top: 6px solid #b89b2e; }
    img { display: block; height: 64px; width: auto; margin-bottom: 24px; }
    h1 { font-size: 1.5rem; margin: 0 0 4px; color: #0b3d0b; }
    p { margin: 0 0 20px; }
    label { display: block; font-weight: 700; margin-top: 16px; }
    input { display: block; width: 100%; margin-top: 4px; padding: 12px; font-size: 1.1rem; border: 2px solid #9aa596; }
    input:focus { outline: 3px solid #b89b2e; outline-offset: 1px; border-color: #0b3d0b; }
    button { margin-top: 24px; width: 100%; padding: 14px; font-size: 1.1rem; font-weight: 700; border: 0;
      background: #0b3d0b; color: #fff; cursor: pointer; }
    button:hover { background: #33412a; }
    button:focus-visible { outline: 3px solid #b89b2e; outline-offset: 3px; }
    .error { background: #fde8e8; color: #7a1010; padding: 10px 12px; font-weight: 700; margin: 16px 0 0; }
  </style>
</head>
<body>
  <main>
    <img src="/logo.png" alt="White Heart Initiative" />
    <h1>Site editor</h1>
    <p>Sign in to change the website.</p>
    ${message ? `<p class="error" role="alert">${escape(message)}</p>` : ""}
    <form method="post" action="/admin/login">
      <label for="username">Username</label>
      <input id="username" name="username" autocomplete="username" required value="${escape(username)}" ${username ? "" : "autofocus"} />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required ${username ? "autofocus" : ""} />
      <button type="submit">Sign in</button>
    </form>
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function GET() {
  if (!adminConfigured()) return page("The editor login is not set up yet. See the README.", "", 500);
  return page();
}

export async function POST(request: Request) {
  if (!adminConfigured()) return page("The editor login is not set up yet. See the README.", "", 500);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooManyAttempts(ip)) return page("Too many attempts. Please wait 15 minutes and try again.", "", 429);

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    attempts.get(ip)!.push(Date.now());
    return page("Wrong username or password.", username, 401);
  }

  attempts.delete(ip);
  const secure = new URL(request.url).protocol === "https:";
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
      "Set-Cookie": `${SESSION_COOKIE}=${createSession()}; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}${secure ? "; Secure" : ""}`,
    },
  });
}
