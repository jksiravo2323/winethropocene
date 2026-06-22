# Winethropocene Website

Source for winethropocene.com — wine, climate, and adaptation.

## Stack

- **[Astro 5](https://astro.build)** with the `@astrojs/cloudflare` adapter — deploys as a Cloudflare Worker.
- **[three.js](https://threejs.org)** — the slowly rotating point-cloud object behind every page.
- **[Leaflet](https://leafletjs.com)** — the interactive atlas map.
- Content lives as Markdown collections under `src/content/` (schemas in `src/content.config.ts`).
- No CSS framework; one shared stylesheet (`src/styles/site.css`). Brand: `#000` background, `#FFB4F9` accent, IBM Plex Sans.

## Develop

```sh
npm install
npm run dev      # local Astro dev server → http://localhost:4321
```

## Build & deploy

```sh
npm run build    # → dist/ (Astro build, incl. the Cloudflare worker)
npm run deploy   # build + wrangler deploy
```

The Worker is connected to GitHub; pushes to `main` auto-build and deploy. See [DEPLOY.md](./DEPLOY.md) for the Cloudflare + Porkbun DNS walkthrough.

## Project layout

```
WEBSITE/
├── src/
│   ├── pages/            # one .astro file per route
│   ├── components/       # AtlasEntry, PointCloudBackdrop, AtlasGlobe, …
│   ├── layouts/          # BaseLayout (nav + footer)
│   ├── lib/              # atlas.ts (taxonomy), atlas-renderer/ (three.js engine), geo.js
│   ├── content/          # Markdown collections (programmes, publications, podcast, press, team, hub)
│   ├── content.config.ts # collection schemas (source of truth)
│   └── styles/site.css
├── public/
│   ├── clouds/*.ply      # point clouds rendered by PointCloudBackdrop
│   ├── meshes/*.glb      # served mirror of the source meshes
│   └── atlas/            # per-entry hero images + dot renders
├── scripts/              # glb-to-ply.mjs, globe-to-ply.mjs, atlas-image.mjs, atlas-stipple.py
├── source_models/        # source .glb meshes (truth) + land-110m.geojson
├── atlas-pipeline/        # claude.ai chat-path docs for authoring atlas entries
├── docs/                 # editorial / handover notes (copy drafts, design review, research briefs)
├── CLAUDE.md             # project notes for Claude Code
└── DEPLOY.md             # deployment walkthrough
```

Working from Claude Code? See [CLAUDE.md](./CLAUDE.md) — it routes to the `atlas-entry` and `floating-object` skills.
