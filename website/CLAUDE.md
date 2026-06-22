# Winethropocene Website — project notes

Source for the Winethropocene website (wine, climate & adaptation). Astro 5 +
three.js, deployed on Cloudflare.

## Stack & commands

- **Astro 5** (content collections for articles and atlas), **three.js** for the
  background point clouds, **Leaflet** for the atlas map.
- `npm run dev` — local dev server (Astro).
- `npm run build` — production build. `npm run deploy` — build + `wrangler deploy`.
- Build note: `ASTRO_TELEMETRY_DISABLED=1 npm run build` if sandboxed.

## Floating point-cloud objects

Every page has one slowly rotating point cloud behind its content, rendered by
`src/components/PointCloudBackdrop.astro` from a `.ply` in `public/clouds/`.

Map:
- `/` → `wine-bottle.ply`
- `/articles` → `grape-cluster.ply`
- `/atlas` → atlas entry pages use per-category clouds
- `/about` → `wine-glass.ply`
- `/producers`, `/contact` → `terroir-stone.ply`

PLY contract: binary LE, 50k points, `float xyz` + `uchar rgba`, normalized.
Source: `scripts/glb-to-ply.mjs`.

## Articles

Articles are the primary content type — magazine-style MDX at
`src/content/articles/<slug>.mdx`. Rendered by `ArticleLayout.astro` at
`/articles/<slug>`, with inline animated charts via MDX.

Schema in `src/content.config.ts`. Typologies: `field-report`, `data-story`,
`curated-brief`. Chart components: `StatRow`, `Figure`, `BarChart`, `LineChart`,
`Heatmap`, `GeoTileMap` in `src/components/charts/`.

## Atlas entries

The atlas is a map/globe of wine regions, varieties, and climate phenomena.
Each entry is one markdown file at `src/content/atlas/<slug>.md`. It drives the
3D globe, Leaflet map, card grid + filters, and per-entry pages.

Category taxonomy + accents live in `src/lib/atlas.ts`.

## Content collections

All under `src/content/`: `articles`, `atlas`, `team`, `press`, `producers`.
Schemas in `src/content.config.ts`.

## Layout

- `src/pages/*.astro` — one file per route
- `src/components/`, `src/layouts/`
- `src/lib/atlas-renderer/` — the three.js engine
- `public/clouds/*.ply`, `public/meshes/*.glb`
- `src/styles/site.css` — design tokens and all styles
