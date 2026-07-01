# Changelog

Running log of significant code, config, and documentation changes. Every agent
working in this repo must read this before starting and append to it after
making meaningful changes. See [CLAUDE.md](CLAUDE.md) for the full protocol.

---

## 2026-07-01 — Atlas renamed to "Atlas of the Winethropocene"

**Agent:** Interpreter (deepseek-v4-pro)
**Files:** `website/src/pages/atlas.astro`, `website/CLAUDE.md`
**Summary:** Replaced "Atlas of Oenological Collapse and Repair" with "Atlas of the Winethropocene" in the atlas page hero (SectionHero component). Index page heading retains the old name per explicit exclusion. The `oenological-shift` taxonomy slug in article frontmatter is a data key, not copy, and was left unchanged.
**Doc updates:** `website/CLAUDE.md` updated to reflect new atlas name.


## 2026-07-01 — Editorial critique pass: SEO bug, de-templating, funnel

**Agent:** Claude (Opus 4.8)
**Files:** `website/src/layouts/BaseLayout.astro`,
`website/src/components/Newsletter.astro` (new), `website/src/pages/rss.xml.js` (new),
`website/src/components/ArticleLayout.astro`, `website/src/pages/{index,about,articles,producers,media,contact,atlas}.astro`,
`website/src/pages/{articles,atlas}/[slug].astro`,
`website/src/content/atlas/{bordeaux-france,champagne-france,andean-water-basin,southern-europe-aridity,piwi-varieties,criolla-varieties,venice-lagoon-italy,english-wine}.md`,
`website/src/content/articles/{pruning-adaptation,latitude-migration}.mdx`,
`website/package.json` (+`@astrojs/rss`)

**Summary:** Acted on a close editorial critique of the live site. **Bug:**
OG/Twitter tags hardcoded `winethropocene.com` while the site serves on
`winethropocene.xyz` — every social share resolved to the wrong host. Rebuilt the
head to derive `og:url`/`og:image`/canonical from `Astro.site`, added a canonical
tag and an RSS discovery link. **Positioning:** locked one proposition — *"Reads
the climate crisis through wine"* — across the splash credit, homepage title, and
footer (replacing the four competing taglines); unified the Atlas name to *"Atlas
of Oenological Collapse and Repair"* everywhere (British spelling; fixed the
American "Enological" in the atlas hero and the `enological-shift` theme slug).
**Copy de-templating:** thinned the signature "the question is whether…" closer
to a single atlas entry (Uco Valley), rewriting six others; halved "quietly"
(8→4); matched the English-wine teaser to its body ("have beaten" not "now
beats"); reframed the About mission line from "we don't argue a case" to "we
argue through arrangement"; standardised "7,000 years"; dropped the homepage
entry-count. **Structure:** unlinked the empty Media page from nav/footer;
right-sized the Producers leads (removed the Andes/Venice/Denmark/Patagonia
overpromise and the Patagonia ghost reference); dropped the "Launching 15 August
2026" aside. **Funnel:** new Buttondown-backed `Newsletter.astro` in the About
aside, site footer, and article end; new `/rss.xml` feed from the articles
collection. **Per-page SEO:** distinct meta descriptions on all six top-level
pages; per-entry `og:image` (article `heroImage` / atlas `image`) wired through
`BaseLayout`. Production build passes; preview-verified.

**Follow-up round (same session):** homepage hero rebuilt — the top block had been
rendering the *latest article's* summary (Santorini), so the page opened mid-story;
it now leads with an orienting two-directional-ledger thesis, with the latest
article demoted to the "Latest article" side card. Theme label **"Techno Grapes" →
"Engineered Vines"** (slug `techno-grapes` → `engineered-vines` on
`bordeaux-hybrids.mdx`). Simonit piece re-typed **`curated-brief` → `field-report`**.
Newsletter/RSS are built but intentionally **not wired to a live list yet** —
Buttondown username in `Newsletter.astro` stays a placeholder (`winethropocene`)
until setup. Adding real producer/press entries is content work, not done here.

**Doc updates:** `website/CLAUDE.md` (footer tagline, Atlas name, newsletter/RSS,
domain-derived head).

---

## 2026-07-01 — Doc audit: fonts, atlas, point clouds corrected

**Agent:** Interpreter (deepseek-v4-pro)
**Files:** `CLAUDE.md`, `AGENTS.md`, `website/CLAUDE.md`, `website/src/styles/site.css`,
`website/src/components/charts/LineChart.astro`, `website/src/components/charts/BarChart.astro`,
`website/src/pages/about.astro`, `CHANGELOG.md` (created)

**Summary:** Full audit of documentation vs. codebase reality. Found and fixed:
fonts had been replaced (PicNic/Velvelyne in, Fraunces/Hanken out) but CLAUDE.md
and AGENTS.md still claimed the old stack; stale "Fraunces" and "IBM Plex"
comments in CSS and chart components; about page referenced `winethropocene.com`
instead of canonical `winethropocene.xyz`; `website/CLAUDE.md` claimed
`PointCloudBackdrop.astro` rendered on every page but the component does not
exist (point clouds are on disk but unused); claimed Leaflet for the atlas map
but it's a custom canvas renderer; claimed per-category point clouds for atlas
entries — none exist. Created CHANGELOG.md and added mandatory log-discipline
instructions to CLAUDE.md and AGENTS.md.

**Doc updates:** `CLAUDE.md`, `AGENTS.md`, `website/CLAUDE.md` all corrected.
`CHANGELOG.md` created as the shared audit trail.

---

## 2026-06-23 — Rebrand: PicNic + Velvelyne fonts, Mildew palette

**Agent:** manual (Julian)
**Files:** `website/src/styles/site.css`, `website/public/fonts/`

**Summary:** Replaced Caprasimo/Fraunces/Hanken Grotesk with PicNic (wordmark,
`--font-poster`) and Velvelyne (headings + body, four weight cuts). Caprasimo
kept as fallback behind PicNic. Adopted "Mildew" palette with aubergine near-black
`--bg: #120A10`.

**Doc updates:** `CLAUDE.md` brand invariants updated at the time (font portion
was later found stale on 2026-07-01 and corrected).

---

## 2026-06-23 — Retired private master branch

**Agent:** manual (Julian)
**Files:** git refs only

**Summary:** Retired the old private `master` branch. Full history preserved in
tag `archive/private-workspace-master`. Single-branch workflow: `main` only.
