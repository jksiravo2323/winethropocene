// Standard ordered-dither matrices (Bayer), row-major.
// Indexed by gl_FragCoord.xy in the dither shader so the pattern stays nailed
// to the screen grid as geometry rotates beneath it — the Obra Dinn signature.
import * as THREE from 'three';

export const BAYER_8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

export const BAYER_4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
];

/**
 * Build a Bayer matrix as a small DataTexture. NearestFilter + RepeatWrapping
 * gives one matrix cell per pixel of the canvas.
 *
 * @param {number} size - Matrix side (4 or 8).
 * @param {number[]} values - Flat row-major matrix values in [0, size*size).
 * @returns {THREE.DataTexture}
 */
export function makeBayerTexture(size, values) {
  const denom = size * size;
  const data = new Uint8Array(values.length * 4);
  for (let i = 0; i < values.length; i++) {
    const v = Math.round((values[i] / denom) * 255);
    data[i * 4]     = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
