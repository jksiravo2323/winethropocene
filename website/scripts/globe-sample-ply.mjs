// Bake the atlas globe as a SAMPLED-FROM-TEXTURE point cloud: scatter points
// over the whole unit sphere (equal-area) and colour each one by sampling a
// desaturated NASA Blue Marble at its lon/lat. The atlas renderer's points
// module (src/lib/atlas-renderer/points.js, mode 'sampled') then draws them as
// the site's ethereal dots — the AESTHETIC LAB "Point cloud + Sampled from
// texture" look — except the points now wear the real planet's tones, and they
// cover the oceans too (dark dots) so the globe reads solid, not see-through.
//
// Positions use the SAME lonLatToVec3 (R=0.5) as the live pins, so continents
// sit under their pins. Greyscale tone = desaturate + contrast + gamma lift onto
// a floor, so the Blue Marble's near-black oceans never fall to a void.
//
// Usage: node scripts/globe-sample-ply.mjs [satellite.jpg] [output.ply] [count]
//   defaults: source_models/blue-marble.jpg  public/clouds/globe-sampled.ply  220000

import fs from "node:fs";
import sharp from "sharp";
import { lonLatToVec3 } from "../src/lib/geo.js";

const inPath = process.argv[2] || "source_models/blue-marble.jpg";
const outPath = process.argv[3] || "public/clouds/globe-sampled.ply";
const COUNT = parseInt(process.argv[4] || "150000", 10);
const CULL = parseFloat(process.argv[5] || "0.12"); // drop points darker than this (ocean)

// Land-only, high-contrast greyscale tone. Ocean is culled, so the dots only land
// on continents/ice; the dark backing sphere in AtlasGlobe.astro is the solid
// "ocean". Spread the kept land luminance across a punchy range with a brightness
// floor so even dim land reads (and glows under additive blending).
function tone(luma) {
  let t = (luma - CULL) / (0.72 - CULL); // coast→0, bright land→1 (ice saturates)
  t = Math.min(1, Math.max(0, t));
  t = Math.pow(t, 0.75);
  return 0.34 + 0.66 * t; // grey 0.34..1.0
}

const { data, info } = await sharp(inPath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const TW = info.width, TH = info.height, CH = info.channels;

function sampleLuma(lon, lat) {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const px = Math.min(TW - 1, Math.max(0, Math.floor(u * TW)));
  const py = Math.min(TH - 1, Math.max(0, Math.floor(v * TH)));
  const i = (py * TW + px) * CH;
  return (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
}

// Equal-area sphere sampling (z uniform → lat = asin(z)) for even dot density,
// rejecting points whose sampled luminance is below CULL (i.e. ocean) until we
// have COUNT land points.
const DEG = 180 / Math.PI;
const body = Buffer.alloc(COUNT * 16); // 12B xyz float + 4B rgba uchar
let kept = 0;
let tries = 0;
const MAX_TRIES = COUNT * 60;
while (kept < COUNT && tries < MAX_TRIES) {
  tries++;
  const lon = Math.random() * 360 - 180;
  const lat = Math.asin(Math.random() * 2 - 1) * DEG;
  const luma = sampleLuma(lon, lat);
  if (luma < CULL) continue; // skip ocean
  const [x, y, z] = lonLatToVec3(lon, lat, 0.5);
  const grey = Math.round(tone(luma) * 255);
  const o = kept * 16;
  body.writeFloatLE(x, o);
  body.writeFloatLE(y, o + 4);
  body.writeFloatLE(z, o + 8);
  body[o + 12] = grey;
  body[o + 13] = grey;
  body[o + 14] = grey;
  body[o + 15] = 255;
  kept++;
}

const header =
  "ply\n" +
  "format binary_little_endian 1.0\n" +
  "comment globe sampled from NASA Blue Marble, ocean culled (scripts/globe-sample-ply.mjs)\n" +
  `element vertex ${kept}\n` +
  "property float x\nproperty float y\nproperty float z\n" +
  "property uchar red\nproperty uchar green\nproperty uchar blue\nproperty uchar alpha\n" +
  "end_header\n";
fs.writeFileSync(outPath, Buffer.concat([Buffer.from(header, "latin1"), body.subarray(0, kept * 16)]));
console.log(
  `${inPath} -> ${outPath}  (${kept} land pts, cull ${CULL}, ${(tries / kept).toFixed(1)} tries/pt)`,
);
