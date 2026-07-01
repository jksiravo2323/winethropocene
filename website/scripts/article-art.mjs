#!/usr/bin/env node
// Turn one Midjourney portrait "cover" master into the article art set.
// Applies the consistent print finish (film grain + edge vignette) the
// style bible calls for, then emits three derived assets under public/articles:
//
//   <slug>-cover.webp   1200×1800  (2:3)        — article-page hero + reuse
//   <slug>-card.webp     800×1131  (210:297)    — listing-card cover
//   <slug>-og.jpg       1200×630   (1.91:1)     — social/OG; portrait letterboxed
//                                                  onto the Mildew aubergine canvas
//
// Usage:
//   node scripts/article-art.mjs <master-image> <slug> [--grade]
//   node scripts/article-art.mjs ~/Downloads/water-wars-mj.png water-wars
//
// Flags:
//   --grade   apply a light Mildew cohesion grade (soft-light aubergine wash +
//             slight desaturation). Off by default — the prompt does the
//             recolouring; use this only if a master drifts off-palette.
//
// Requires: sharp (already a site dependency).
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// --- Mildew palette ---------------------------------------------------------
const BG = { r: 0x12, g: 0x0a, b: 0x10 }; // #120A10 aubergine near-black

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const grade = argv.includes("--grade");
const [input, slug] = argv.filter((a) => !a.startsWith("--"));
if (!input || !slug) {
  console.error("Usage: node scripts/article-art.mjs <master-image> <slug> [--grade]");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/articles");
mkdirSync(outDir, { recursive: true });

// --- finish layers ----------------------------------------------------------
// Subtle gaussian film grain, regenerated per output size so the grain stays a
// consistent physical size rather than scaling with the image.
function grain(w, h) {
  return sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 128, g: 128, b: 128 },
      noise: { type: "gaussian", mean: 128, sigma: 9 },
    },
  })
    .png()
    .toBuffer();
}

// Faint edge vignette: white centre (no change under multiply) → dark edge.
function vignette(w, h) {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="v" cx="50%" cy="48%" r="72%">
      <stop offset="55%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#8a8088"/>
    </radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#v)"/>
  </svg>`;
  return Buffer.from(svg);
}

// Optional Mildew cohesion wash (soft-light aubergine).
function gradeWash(w, h) {
  return sharp({
    create: { width: w, height: h, channels: 4, background: { ...BG, alpha: 0.16 } },
  })
    .png()
    .toBuffer();
}

async function finish(pipeline, w, h) {
  const layers = [
    { input: await grain(w, h), blend: "overlay" },
    { input: vignette(w, h), blend: "multiply" },
  ];
  if (grade) layers.push({ input: await gradeWash(w, h), blend: "soft-light" });
  return pipeline.composite(layers);
}

// --- one derived asset ------------------------------------------------------
// mode "cover" = fill+crop (centre); mode "contain" = fit + aubergine letterbox.
async function emit({ name, w, h, mode, fmt }) {
  let base = sharp(input).rotate().resize(w, h, {
    fit: mode === "cover" ? "cover" : "contain",
    position: "centre",
    background: BG,
  });
  base = await finish(base, w, h);
  const out = resolve(outDir, name);
  const enc =
    fmt === "jpg"
      ? base.jpeg({ quality: 86, mozjpeg: true })
      : base.webp({ quality: 82 });
  await enc.toFile(out);
  console.log(`  ✓ ${name}  (${w}×${h})`);
}

console.log(`article-art: ${slug}${grade ? "  [grade]" : ""}`);
await emit({ name: `${slug}-cover.webp`, w: 1200, h: 1800, mode: "cover", fmt: "webp" });
await emit({ name: `${slug}-card.webp`, w: 800, h: 1131, mode: "cover", fmt: "webp" });
await emit({ name: `${slug}-og.jpg`, w: 1200, h: 630, mode: "contain", fmt: "jpg" });
console.log(`Done → website/public/articles/`);
