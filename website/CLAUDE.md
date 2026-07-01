# Winethropocene Website — project notes

Source for the Winethropocene website (wine, climate & adaptation). Astro 5 +
three.js, deployed on Cloudflare.

## Stack & commands

- **Astro 5** (content collections for articles and atlas), **three.js** for the
  atlas globe (Bayer-dithered), custom 2D canvas for the atlas map (square
  elevation renderer — no Leaflet).
- `npm run dev` — local dev server (Astro).
- `npm run build` — production build. `npm run deploy` — build + `wrangler deploy`.
- Build note: `ASTRO_TELEMETRY_DISABLED=1 npm run build` if sandboxed.

## Background: SpreadCanvas (not point clouds)

Behind every main page (homepage, about, articles, atlas, producers, contact,
media) sits `src/components/SpreadCanvas.astro` — a crisp square "infection"
that slowly, permanently creeps across the hero (monotonic growth model, no
die-back). Rendered on a full-viewport `<canvas>` at z-index 0 behind page
content.

Article-reading and atlas-entry detail pages do NOT use SpreadCanvas.

Point clouds (`public/clouds/*.ply`) exist on disk but are NOT rendered on any
page. The `PointCloudBackdrop.astro` component referenced in older docs was
removed. The `.ply` loader in `src/lib/atlas-renderer/points.js` is part of the
atlas-renderer engine's alternative "points" mode, not used in production.

## Articles

Articles are the primary content type — magazine-style MDX at
`src/content/articles/<slug>.mdx`. Rendered by `ArticleLayout.astro` at
`/articles/<slug>`, with inline animated charts via MDX.

Schema in `src/content.config.ts`. Typologies: `field-report`, `data-story`,
`curated-brief`. Chart components: `StatRow`, `Figure`, `BarChart`, `LineChart`,
`Heatmap`, `GeoTileMap` in `src/components/charts/`.

## Atlas

The atlas (`/atlas`) is a **two-view system** with a map/globe toggle:

| View | Component | Tech |
|---|---|---|
| Map | `AtlasMap.astro` | Custom 2D canvas — square elevation map. DEM texture (`earth-elevation.png`) filtered through a wine-ramp gradient. Water mask (`earth-water.png`) gates ocean cells. |
| Globe | `AtlasGlobe.astro` | three.js — Lambert-lit sphere mesh (`globe.glb`) post-processed through a Bayer-ordered dither ShaderPass ("obra" preset, Obra Dinn stipple aesthetic). Ink: `#D1557A` (--pink), paper: `#120A10` (--bg). Pins are billboarded category-tinted sprites composited in a second render pass. |

Both views share pin data, filter events (`atlas:filter`, `atlas:view`), a
hover card, and the `atlas:open` event that opens the entry modal.

Each atlas entry is one markdown file at `src/content/atlas/<slug>.md`. The
detail page (`/atlas/[slug].astro`) renders via `AtlasEntry.astro` with hero
image, metadata rows, tags, varieties, full body, references, and related
entries.

Category taxonomy, statuses, climate zones, and threats are defined in
`src/lib/atlas.ts`. Category accent colours:
- Region: `#C84B4B` (wine red)
- Variety: `#C8A27A` (earth/terracotta)
- Phenomenon: `#E8875B` (heat/amber)
- Producer: `#5B9BD5` (water blue)
- Institution: `#9C89B8` (muted purple)

Icons are in `public/atlas/icons/` — all use `stroke="currentColor"` and
inherit the category accent.

The globe rendering engine lives in `src/lib/atlas-renderer/`:
- `index.js` — factory, owns renderer/camera/OrbitControls/RAF loop
- `dither.js` — GLB mesh + Dither ShaderPass (Bayer 1-bit or CMYK halftone)
- `shaders.js` — GLSL for both dither modes
- `points.js` — PLY point cloud loader (alternative mode, not used in production)
- `presets.js` — named presets for dither and points modules
- `bayer.js` — Bayer 4×4 and 8×8 threshold matrices

## Content collections

All under `src/content/`: `articles`, `atlas`, `team`, `press`, `producers`.
Schemas in `src/content.config.ts`.

## Layout

- `src/pages/*.astro` — one file per route
- `src/components/`, `src/layouts/`
- `src/styles/site.css` — design tokens and all styles
- `public/meshes/` — `.glb`, `.gltf`, elevation/water/land textures
- `public/clouds/` — `.ply` point cloud files (on disk, not rendered)
- `public/fonts/` — PicNic, Velvelyne (four cuts), Caprasimo (fallback)

## SEO, newsletter & RSS

- `BaseLayout.astro` derives `og:url` / `og:image` / `<link rel="canonical">`
  from `Astro.site` (`https://winethropocene.xyz` in `astro.config.mjs`) — never
  hardcode the host. Pages pass their own `description`; detail pages also pass
  `ogImage` (article `heroImage` / atlas `image`). The primary proposition,
  repeated sitewide, is **"Reads the climate crisis through wine."** The map is
  the **"Atlas of Oenological Collapse and Repair"** (British spelling).
- `Newsletter.astro` is a Buttondown embed form (no backend). The username lives
  in one `BUTTONDOWN_USERNAME` constant at the top — **currently a guess; confirm
  it.** Placed in the About aside, the site footer, and the article end.
- `src/pages/rss.xml.js` (`@astrojs/rss`) prerenders `/rss.xml` from the articles
  collection; discovery link is in `BaseLayout`'s head.
- **Media** is intentionally unlinked from nav/footer while `press` is empty (the
  route still resolves). Re-add it to the `nav` array once coverage exists.
