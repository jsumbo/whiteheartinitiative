import { readCookie, SESSION_COOKIE, verifySession } from "@/lib/admin-auth";

// Serves the Decap CMS editor at /admin, for signed-in editors only (see /admin/login).
// Field setup lives in public/admin/config.yml.
//
// Edits are saved to GitHub with CMS_GITHUB_TOKEN, a token kept on the server. After an editor
// signs in with the site username and password, the token is handed to the editor page so
// nobody on the team needs their own GitHub account.

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  if (!verifySession(readCookie(request, SESSION_COOKIE))) {
    return new Response(null, { status: 303, headers: { Location: "/admin/login", "Cache-Control": "no-store" } });
  }

  const backend = {
    name: "github",
    repo: process.env.CMS_GITHUB_REPO ?? "OWNER/REPO",
    branch: process.env.CMS_GITHUB_BRANCH ?? "main",
  };
  const token = process.env.CMS_GITHUB_TOKEN ?? "";
  // On localhost Decap saves through the local server started by `npm run dev` (the "proxy" backend).
  const host = new URL(request.url).hostname;
  const local = host === "localhost" || host === "127.0.0.1";
  const storedUser = local ? { backendName: "proxy" } : token ? { backendName: "github", token } : null;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Site editor | White Heart Initiative</title>
  <link rel="icon" href="/logo-mark.png" type="image/png" />
  <link href="/admin/config.yml" type="text/yaml" rel="cms-config-url" />
  <style>
    #whi-logout { position: fixed; right: 12px; bottom: 12px; z-index: 1000; padding: 10px 16px; background: #0b3d0b;
      color: #fff; font: 700 14px/1 Arial, sans-serif; text-decoration: none; }
    #whi-logout:focus-visible { outline: 3px solid #b89b2e; outline-offset: 2px; }
  </style>
</head>
<body>
  <a id="whi-logout" href="/admin/logout">Sign out</a>
  <script>
    // The editor already signed in with the site username and password, so skip Decap's own login screen.
    var user = ${JSON.stringify(storedUser)};
    try {
      if (user) localStorage.setItem("decap-cms-user", JSON.stringify(user));
    } catch (e) {}
    window.CMS_MANUAL_INIT = true;
  </script>
  <script src="https://unpkg.com/decap-cms@^3.8.0/dist/decap-cms.js"></script>
  <script>CMS.init({ config: { backend: ${JSON.stringify(backend)} } });</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, private" },
  });
}
