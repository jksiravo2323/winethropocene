#!/usr/bin/env python3
"""Render an atlas photo as a dense grayscale point field ("stipple") on the
dark page background — the 2D analogue of the site's rotating .ply point clouds.

Points are placed on a jittered grid (no screen-door grid artefact) and kept
with probability proportional to local luminance, so bright areas read as dense
constellations of points and shadows fall away into the background. A soft bloom
gives the additive "ghost" glow.

Usage: atlas-stipple.py <input-image> <output.png> [spacing]
Called by scripts/atlas-image.mjs, but runnable standalone.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

BG = 10  # #0a0a0a page background

inp, outp = sys.argv[1], sys.argv[2]
SPACING = int(sys.argv[3]) if len(sys.argv) > 3 else 3  # smaller = denser

W, H = 1280, 720
g = np.asarray(Image.open(inp).convert("L").resize((W, H)), np.float32) / 255.0
# Lift detail: pull shadows down, expand midtones (more definition than a
# straight luminance map) without blowing out highlights.
g = np.clip((g - 0.10) / 0.82, 0, 1) ** 1.05

canvas = np.full((H, W), BG, np.uint8)
out = Image.fromarray(canvas, "L")
d = ImageDraw.Draw(out)
rng = np.random.default_rng(7)

ys, xs = np.mgrid[0:H:SPACING, 0:W:SPACING]
xs = xs.ravel()
ys = ys.ravel()
half = SPACING // 2
jx = (xs + rng.integers(-half, half + 1, xs.size)).clip(0, W - 1)
jy = (ys + rng.integers(-half, half + 1, ys.size)).clip(0, H - 1)
lum = g[jy, jx]
# Denser keep curve (**0.85) → midtones retain more points = more definition.
keep = rng.random(lum.size) < (lum ** 0.85)
jx, jy, lum = jx[keep], jy[keep], lum[keep]

for x, y, l in zip(jx, jy, lum):
    v = int(70 + 185 * l)
    r = 1 if l < 0.8 else 1.4  # brightest points a touch larger
    d.ellipse([x - r, y - r, x + r, y + r], fill=v)

# Soft additive bloom for the glow.
base = np.asarray(out).astype(np.float32)
bloom = np.asarray(out.filter(ImageFilter.GaussianBlur(1.3))).astype(np.float32)
out = Image.fromarray(np.clip(base + 0.45 * (bloom - BG), 0, 255).astype(np.uint8), "L")

if outp.lower().endswith(".webp"):
    out.save(outp, quality=74, method=6)  # ~10× smaller than PNG for this grain
else:
    out.save(outp, optimize=True)
print(f"  stipple → {outp}  (spacing {SPACING}, {jx.size} points)")
