# Winethropocene Website: UBS Hub Reuse Plan

> **Status:** Phase 4 complete
> **Last Updated:** 2026-06-23 (Phase 4 delivered)
> **Source Engine:** `~/Documents/AUTONOMY_LIVE/UBS/WEBSITE/` (Astro 5 + Cloudflare Workers)
> **Target:** `~/Documents/Winethropocene/website/`

---

## What We're Reusing

The UBS Hub site (`ubshub.org`) is an **Astro 5 + three.js + Leaflet** static site deployed on Cloudflare Workers. Winethropocene is an **online magazine** about wine, climate change, and adaptation. The core reuse strategy is: **fork the engine, remap the taxonomy, replace the content.**

GitHub: https://github.com/jksiravo2323/winethropocene

---

## Phase 1: Scaffolding ✅ Complete
- Fork UBS Hub engine, install deps, remap content collections
- Adapt BaseLayout, Splash, SectionHero with Winethropocene branding
- Create all page routes: index, articles, atlas, producers, about, contact, media, 404

## Phase 2: Seed Content ✅ Complete
- 4 articles: extreme-weather-2025-2026, latitude-migration, bordeaux-hybrids, water-wars
- 11 atlas entries: regions (Uco Valley, Champagne, Bordeaux, Venice Lagoon, Denmark, English Wine), varieties (PIWI, Criolla), phenomena (Andean Water Basin, Southern Europe Aridity, Emerging Vine Diseases)
- Team: Julian Siravo, Producers: Cantina Giardino, Press: placeholder

## Phase 3: Visual Theming & Polish ✅ Complete
- Wine-terroir palette (#8B2252 Bordeaux, #C4743E terracotta)
- Atlas category SVG icons, favicon, OG image

## Phase 4: Hero Images, QA & Deploy ✅ Complete
- Enhanced SVG hero images for all 4 articles
- Responsive QA passed: zero overflow at 375px, 768px, 1440px across all 5 routes
- Deployed to Cloudflare Workers as `winethropocene`
- Pushed to GitHub: https://github.com/jksiravo2323/winethropocene
- Custom domain `winethropocene.com` pending DNS configuration on Porkbun

**Next:** Custom domain DNS, Cloudflare domain verification.
