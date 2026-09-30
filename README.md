# White Heart Initiative website

Next.js 16 site with a built-in admin panel at `/admin`.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the admin username, password and a random session secret.

## Content

Everything editable in `/admin` is saved to `content/` (JSON) and `content/uploads/` (photos). The host needs a writable disk for saves to persist.

## Before launch

- Replace the stock photos (`content/uploads/stock-*.jpg`) and the dummy team members.
- Fill in the contact email, phone and location, and check the social links.
