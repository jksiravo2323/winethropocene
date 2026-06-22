# Deploying ubshub.org

The site is built with [Astro](https://astro.build) + the `@astrojs/cloudflare` adapter and deploys as a **Cloudflare Worker** with static assets (project name: `ubshub`). All routes opt into `prerender = true`, so the worker just serves prerendered HTML — no SSR at request time.

## Quick reference

| Setting | Value |
|---|---|
| Repo | `jksiravo2323/ubshub-website` (private) |
| Hosting | Cloudflare Workers (with Workers Assets) |
| Worker name | `ubshub` (live at `ubshub.jksiravo.workers.dev`) |
| Build command | `npm run build` |
| Build output | `dist` |
| Node version | `22` (or `20`) |
| Deploy command | `npx wrangler deploy` (auto-detected) |
| Custom domain | `ubshub.org` + `www.ubshub.org` (Phase 3) |
| DNS | Porkbun (keep nameservers as-is — preserves email) |
| Adapter | `@astrojs/cloudflare@^12` |
| Config | `astro.config.mjs`, `wrangler.jsonc` |

## Preview locally

```sh
npm install          # first time only
npm run dev          # dev server at http://localhost:4321 with live reload
# or
npm run build && npm run preview   # production build, served at http://localhost:4321
```

The `.claude/launch.json` `site` server still serves `dist/` for the Claude preview pane.

---

## 1 — Cloudflare Worker setup (already done)

The Worker is connected to GitHub. Pushes to `main` auto-build and deploy via `wrangler deploy`. Staging URL: <https://ubshub.jksiravo.workers.dev>.

## 2 — Attach the custom domain (Phase 3)

The Worker is created — now point `ubshub.org` at it.

In the **`ubshub` Worker** project → **Settings → Domains & Routes → Add → Custom Domain**:

Add **both**:
- `ubshub.org`
- `www.ubshub.org`

Cloudflare shows the exact DNS records needed. Keep that screen open.

## 3 — DNS at Porkbun

Go to <https://porkbun.com/account/domain_management> → **ubshub.org** → **DNS Records**.

**Do not change nameservers.** Leave Porkbun's defaults so email keeps working.

Add the records Cloudflare provided. Typically:

| Type   | Host       | Answer / Target           |
|--------|------------|---------------------------|
| CNAME  | `www`      | `ubshub.pages.dev`        |
| ALIAS  | *(apex)*   | `ubshub.pages.dev`        |

If Porkbun won't accept ALIAS at the apex, use the A/AAAA pair Cloudflare shows you instead.

**Leave alone:**
- `MX` records (Porkbun email)
- `TXT` records starting with `v=spf1`, `v=DMARC1`, or any DKIM selector
- `CNAME` records for `*._domainkey` (DKIM)

Plan B if apex is fiddly: add only the `www` CNAME, then use Porkbun **URL Forwarding** to redirect `ubshub.org` → `https://www.ubshub.org`.

## 4 — Wait + verify

- DNS propagation: usually minutes.
- Cloudflare auto-issues an SSL cert once records resolve.
- Final checks:
  1. `https://www.ubshub.org` loads with a padlock.
  2. `https://ubshub.org` loads or redirects to `www`.
  3. Send a test email to `@ubshub.org` to confirm Porkbun email still works.

---

## Updating the site

Edit a file → commit → push:

```sh
git add .
git commit -m "Update X"
git push
```

Cloudflare Pages picks it up, builds (~30 s for Astro), deploys. The Pages dashboard shows live progress.

## Adding content (no code edits)

| Type | Where | Schema |
|---|---|---|
| Publication | `src/content/publications/<slug>.md` | `title, year, date, authors, summary, pdfUrl?, coverImage?, draft?` |
| Podcast episode | `src/content/podcast/<slug>.md` | `title, episode, date, summary, guests, audioUrl?, spotifyUrl?, applePodcastsUrl?, draft?` |
| Team member | `src/content/team/<slug>.md` | `name, role, order, photo?` + Markdown body for bio |
| Press item | `src/content/press/<slug>.md` | `title, outlet, date or dateLabel, url?` |
| Atlas (future map) | `src/content/programmes/<slug>.md` | `title, place, lat, lon, category, url?, summary?` |

Drop a file, commit, push. The build picks it up automatically.

## Rollback

Cloudflare Pages dashboard → **Deployments** → pick an older deployment → **Rollback**. Instant revert.

## Known TODOs

- Confirm `hello@ubshub.org` (or pick another) on the Contact page.
- Wire up real PDF URLs in publication frontmatter; drop the files under `public/assets/reports/`.
- Replace placeholder partner logos (homepage + network) with real ones in `public/assets/partners/`.
- Replace `/assets/logo-white.png` favicon with a real `.ico` or 32×32 PNG.
- Optional: enable **Cloudflare Web Analytics** (privacy-friendly, no banner).
- Optional: hook up Decap CMS for non-technical editors.
