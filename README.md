# Winethropocene

Source for the **Winethropocene** website — an editorial project about wine in
the age of climate change, documenting how wine production shifts as regions dry
out, new latitudes open, and growers adapt.

Live at **<https://winethropocene.xyz>**.

## Stack

- **Astro 5** static site with content collections (articles, atlas, producers,
  team, press)
- **three.js** background point clouds + **Leaflet** atlas map
- Deployed to **Cloudflare Workers**

## Develop

```sh
cd website
npm install
npm run dev        # local dev server
npm run build      # production build
npm run deploy     # build + wrangler deploy
```

See [`website/CLAUDE.md`](website/CLAUDE.md) for the stack, routes, content
schemas, and the point-cloud system, and [`website/DEPLOY.md`](website/DEPLOY.md)
for deploy details.

## Repository layout

This repository tracks the **`website/`** directory only. Everything outside it
is build tooling or local-only working files.
