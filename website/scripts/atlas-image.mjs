#!/usr/bin/env node
// Standardise an atlas hero image: center-crop to a uniform 16:9 frame so every
// card/hero/tooltip is consistent (object-fit can't normalise wildly different
// source aspect ratios). Output is a stripped, optimised JPEG under public/atlas.
//
// Usage:  node scripts/atlas-image.mjs <input-image> <slug>
// Example: node scripts/atlas-image.mjs ~/Downloads/foo-unsplash.jpg kerala-kfon
//          → public/atlas/kerala-kfon.jpg  (1280×720)
//
// Requires ImageMagick (`magick`). The pointcloud-style grayscale/dot rendering
// is applied at display time in CSS, so this keeps the full-colour photo.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Prefer the project venv's Python (has Pillow + numpy) for the stipple pass.
function pythonBin(root) {
  const venv = resolve(root, ".venv/bin/python");
  return existsSync(venv) ? venv : "python3";
}

const W = 1280;
const H = 720; // 16:9

const [, , input, slug] = process.argv;
if (!input || !slug) {
  console.error("Usage: node scripts/atlas-image.mjs <input-image> <slug>");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public/atlas", `${slug}.jpg`);
const dots = resolve(root, "public/atlas", `${slug}.dots.webp`);

// 1. Standardised 16:9 colour crop (kept as the grayscale base layer).
execFileSync(
  "magick",
  [
    input,
    "-auto-orient", // respect EXIF rotation before cropping
    "-resize", `${W}x${H}^`, // cover: fill the frame, keep aspect (no warp)
    "-gravity", "center",
    "-extent", `${W}x${H}`, // crop the overflow to an exact 16:9 frame
    "-strip", // drop metadata (credit is captured in frontmatter)
    "-quality", "82",
    out,
  ],
  { stdio: "inherit" },
);

// 2. Dense grayscale point-field ("stipple") rendered from the crop.
execFileSync(
  pythonBin(root),
  [resolve(root, "scripts/atlas-stipple.py"), out, dots],
  { stdio: "inherit" },
);

console.log(`✓ ${slug}: ${slug}.jpg + ${slug}.dots.png  (${W}×${H})`);
