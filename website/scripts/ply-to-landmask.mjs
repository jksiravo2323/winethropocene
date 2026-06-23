// Reconstruct an equirectangular land map from the baked land point cloud
// (public/clouds/globe-sampled.ply — points sampled from NASA Blue Marble with
// the oceans culled). We invert each point's xyz back to lon/lat (the exact
// inverse of lonLatToVec3), splat it onto an equirectangular raster, and write a
// greyscale PNG. The dither globe (src/lib/atlas-renderer/dither.js) then maps
// this onto the sphere so CONTINENTS drive the stipple: land = dense dots, ocean
// = a faint floor so the sphere still reads solid.
//
// Usage: node scripts/ply-to-landmask.mjs
//   in:  public/clouds/globe-sampled.ply
//   out: public/meshes/earth-land.png   (2048x1024, single channel)

import fs from "node:fs";
import sharp from "sharp";

const IN = "public/clouds/globe-sampled.ply";
const OUT = "public/meshes/earth-land.png";
const W = 2048, H = 1024;
const OCEAN = 70;     // ocean floor grey (0..255) — faint stipple so the sphere reads solid
const BRUSH = 3;      // splat radius in px — fills continents from the scattered points
const DEG = 180 / Math.PI;

// --- Parse the binary-LE PLY header (x y z float + r g b a uchar = 16B/vert) ---
const buf = fs.readFileSync(IN);
const headerEnd = buf.indexOf("end_header\n", "latin1") ;
const header = buf.toString("latin1", 0, headerEnd);
const count = parseInt(/element vertex (\d+)/.exec(header)[1], 10);
const STRIDE = 16;
let off = headerEnd + "end_header\n".length;

// --- Raster, initialised to the ocean floor ---
const img = new Uint8Array(W * H).fill(OCEAN);
function splat(px, py) {
  for (let dy = -BRUSH; dy <= BRUSH; dy++) {
    const y = py + dy;
    if (y < 0 || y >= H) continue;
    for (let dx = -BRUSH; dx <= BRUSH; dx++) {
      if (dx * dx + dy * dy > BRUSH * BRUSH) continue;
      let x = px + dx;
      if (x < 0) x += W; else if (x >= W) x -= W; // wrap longitude seam
      img[y * W + x] = 255;
    }
  }
}

const R = 0.5;
for (let i = 0; i < count; i++) {
  const o = off + i * STRIDE;
  const x = buf.readFloatLE(o);
  const y = buf.readFloatLE(o + 4);
  const z = buf.readFloatLE(o + 8);
  // Invert lonLatToVec3: y = R cos(phi); theta = atan2(z, -x); lon = theta - 180.
  const phi = Math.acos(Math.max(-1, Math.min(1, y / R)));
  const lat = 90 - phi * DEG;
  let lon = Math.atan2(z, -x) * DEG - 180;
  if (lon < -180) lon += 360; else if (lon > 180) lon -= 360;
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const px = Math.min(W - 1, Math.max(0, Math.floor(u * W)));
  const py = Math.min(H - 1, Math.max(0, Math.floor(v * H)));
  splat(px, py);
}

await sharp(Buffer.from(img), { raw: { width: W, height: H, channels: 1 } })
  .blur(1.2)            // soften the splat edges into solid coastlines
  .png()
  .toFile(OUT);

console.log(`${IN} (${count} land pts) -> ${OUT} (${W}x${H}, ocean ${OCEAN})`);
