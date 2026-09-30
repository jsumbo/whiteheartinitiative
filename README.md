# White Heart Initiative website

Next.js 16 (App Router) site with a Decap CMS editor at `/admin`.

- Pages: `/`, `/about`, `/programs`, `/gallery`, `/contact`
- All text and photos live in `content/` (JSON) and `public/uploads/` (images). The pages read these at build time.
- The editor at `/admin` changes those files by committing to GitHub. Each save triggers a new deploy.

## Run locally

```bash
npm install
npm run dev          # site on http://localhost:3000
npm run cms          # in a second terminal: lets /admin save to your local files
```

With `npm run cms` running, open http://localhost:3000/admin and choose "Login". No GitHub account is needed locally.

## Environment variables

| Name | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Links in metadata, sitemap | e.g. `https://whiteheart.org` |
| `CMS_GITHUB_REPO` | `/admin` | `owner/repo` of this repository |
| `CMS_GITHUB_BRANCH` | `/admin` | defaults to `main` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | `/admin` login | From a GitHub OAuth App (below) |
| `RESEND_API_KEY` | Contact form | https://resend.com |
| `CONTACT_TO_EMAIL` | Contact form | Where messages are delivered |
| `CONTACT_FROM_EMAIL` | Contact form | Optional. A sender on a domain verified in Resend |

Without the Resend variables the contact form logs messages to the console in development and shows an error in production.

## Setting up the editor for the team

1. Push this repo to GitHub.
2. Create a GitHub OAuth App (GitHub > Settings > Developer settings > OAuth Apps):
   - Homepage URL: your site URL
   - Authorization callback URL: `https://YOUR-SITE/api/decap/callback`
3. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `CMS_GITHUB_REPO` on the host (e.g. Vercel) and redeploy.
4. Add each editor as a collaborator on the GitHub repo with write access. They sign in at `/admin` with their GitHub account.

Every field in the editor has a label and a short hint. Field setup is in `public/admin/config.yml`. All uploads go to `public/uploads/`.

## Before launch

- **Photos**: the photos in `public/uploads/stock-*.jpg` are temporary stock images. Replace them in the editor with real programme photos, then delete the stock files. The children in them wear another group's (JESCOR Learning) uniforms, so they should not stay up long term.
- **Program write-ups**: the paragraphs for Education, Empowerment and Health were drafted from the bullet points in the brochure. Review them under "Programs" in the editor.
- **Team**: everyone except Rashell Scott is a dummy entry (files `content/team/dummy-*.json`). Delete them under "Team" in the editor and add the real team.
- **Contact details**: email, phone and location show as `[PLACEHOLDER]` until filled in under "Contact details and social links".
- **Social links**: the links were guessed from the handle @whiteheartinitiative. Check each one. X handles are limited to 15 characters, so the X link is empty until the real account is added.

## Photo credits

All current stock photos are free to use without attribution.

| File | Source | License |
| --- | --- | --- |
| stock-circle.jpg | [Dun-ke-ke-ya-dun Traditional Game.jpg](https://commons.wikimedia.org/wiki/File:Dun-ke-ke-ya-dun_Traditional_Game.jpg) | CC0 |
| stock-mentor-group.jpg | [Dun-ke-ke-ya-dun.jpg](https://commons.wikimedia.org/wiki/File:Dun-ke-ke-ya-dun.jpg) | CC0 |
| stock-outdoor-game.jpg | [JESCOR students playing Lappa jubilantly.jpg](https://commons.wikimedia.org/wiki/File:JESCOR_students_playing_Lappa_jubilantly.jpg) | CC0 |
| stock-basket-weaving.jpg | [Students of JESCOR Learning about weaving fishing baskets.jpg](https://commons.wikimedia.org/wiki/File:Students_of_JESCOR_Learning_about_weaving_fishing_baskets.jpg) | CC0 |
| stock-creek-visit.jpg | [Students of JESCOR Learning on a tour.jpg](https://commons.wikimedia.org/wiki/File:Students_of_JESCOR_Learning_on_a_tour.jpg) | CC0 |
| stock-rope-game.jpg | [Isa ("Inside") Traditional Game.jpg](https://commons.wikimedia.org/wiki/File:Isa_(%E2%80%9CInside%E2%80%9D)_Traditional_Game.jpg) | CC0 |
| stock-study.jpg | [Liberian students.jpg](https://commons.wikimedia.org/wiki/File:Liberian_students.jpg) | Public domain |

## Project layout

```
app/                 pages, API routes (/api/contact, /api/decap/*), /admin, OG images
components/          header, footer, logo, photo banner
content/             CMS-managed JSON (pages, programs/, team/, gallery/)
lib/content.ts       reads content/ at build time
public/admin/        Decap CMS config
public/js/gallery.js gallery filter + lightbox (plain JS)
public/uploads/      all images uploaded through the CMS
```
