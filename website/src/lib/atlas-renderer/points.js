// Points renderer: loads a binary .ply, renders as THREE.Points with switchable
// colour modes (uniform brand colour, depth fade, sampled-from-texture, gradient).
// Returns a small object with imperative setters — the consumer drives the UI.

import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { POINTS_PRESETS } from './presets.js';

/**
 * @param {Object} ctx
 * @param {THREE.Scene} ctx.scene           - Shared scene this group attaches to.
 * @param {string} ctx.url                  - URL of the .ply file.
 * @param {import('./presets.js').PointsPreset} [ctx.initial]
 * @returns {PointsRenderer}
 */
export function createPointsModule(ctx) {
  const initial = ctx.initial ?? POINTS_PRESETS.ghost;

  const group = new THREE.Group();
  ctx.scene.add(group);

  /** @type {Float32Array | null} */ let positions = null;
  /** @type {{uniform: Float32Array, depth: Float32Array, sampled: Float32Array, gradient: Float32Array} | null} */ let variants = null;
  /** @type {THREE.BufferGeometry | null} */ let geom = null;
  /** @type {THREE.PointsMaterial | null} */ let mat = null;
  /** @type {THREE.Points | null} */ let pts = null;
  let totalCount = 0;
  let rotSpeed = initial.rot;
  let colourMode = initial.mode;

  function shuffle(pos, col) {
    const n = pos.length / 3;
    const idx = new Uint32Array(n);
    for (let i = 0; i < n; i++) idx[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const p = new Float32Array(pos.length);
    const c = col ? new Float32Array(col.length) : null;
    for (let i = 0; i < n; i++) {
      const s = idx[i] * 3, d = i * 3;
      p[d] = pos[s]; p[d + 1] = pos[s + 1]; p[d + 2] = pos[s + 2];
      if (c && col) { c[d] = col[s]; c[d + 1] = col[s + 1]; c[d + 2] = col[s + 2]; }
    }
    return { p, c };
  }

  function bakeVariants(pos, sampledCol) {
    const n = pos.length / 3;
    const v = {
      uniform: new Float32Array(pos.length),
      depth: new Float32Array(pos.length),
      sampled: sampledCol ?? new Float32Array(pos.length).fill(1),
      gradient: new Float32Array(pos.length),
    };
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
      const y = pos[i * 3 + 1];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const span = Math.max(1e-5, maxY - minY);
    for (let i = 0; i < n; i++) {
      const z = pos[i * 3 + 2];
      const t = Math.min(1, Math.max(0, z + 0.5));
      v.depth[i * 3] = v.depth[i * 3 + 1] = v.depth[i * 3 + 2] = 0.15 + t * 0.85;
      const yt = (pos[i * 3 + 1] - minY) / span;
      v.gradient[i * 3]     = 0.92;
      v.gradient[i * 3 + 1] = 0.85 - yt * 0.4;
      v.gradient[i * 3 + 2] = 0.6  - yt * 0.45;
    }
    return v;
  }

  function applyUniformColour(hex) {
    if (!variants) return;
    const c = new THREE.Color(hex);
    const arr = variants.uniform;
    for (let i = 0; i < arr.length; i += 3) { arr[i] = c.r; arr[i + 1] = c.g; arr[i + 2] = c.b; }
  }

  function pushColourMode(m) {
    if (!geom || !variants) return;
    const src = variants[m];
    const attr = geom.getAttribute('color');
    if (attr) {
      attr.array.set(src);
      attr.needsUpdate = true;
    } else {
      geom.setAttribute('color', new THREE.BufferAttribute(src.slice(), 3));
    }
  }

  function updateCount(n) {
    if (geom) geom.setDrawRange(0, Math.min(n, totalCount));
  }

  // Load the cloud.
  let loaded = false;
  new PLYLoader().load(ctx.url, (raw) => {
    const rawPos = raw.getAttribute('position').array;
    const rawCol = raw.getAttribute('color') ? raw.getAttribute('color').array : null;
    const { p, c } = shuffle(rawPos, rawCol);
    positions = p;
    totalCount = p.length / 3;
    variants = bakeVariants(p, c);
    applyUniformColour(initial.brand);
    geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(p, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(p.length), 3));
    pushColourMode(colourMode);
    mat = new THREE.PointsMaterial({
      size: initial.size,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: initial.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    pts = new THREE.Points(geom, mat);
    group.add(pts);
    geom.setDrawRange(0, Math.min(initial.count, totalCount));
    loaded = true;
  });

  return {
    group,
    isLoaded: () => loaded,
    tick(dt) { group.rotation.y += rotSpeed * dt; },
    setSize(v)         { if (mat) mat.size = v; },
    setCount(n)        { updateCount(n); },
    setColourMode(m)   { colourMode = m; pushColourMode(m); },
    setBrandColour(h)  { applyUniformColour(h); if (colourMode === 'uniform') pushColourMode('uniform'); },
    setRotSpeed(v)     { rotSpeed = v; },
    setAdditive(on)    { if (mat) { mat.blending = on ? THREE.AdditiveBlending : THREE.NormalBlending; mat.needsUpdate = true; } },
    applyPreset(p) {
      this.setSize(p.size);
      this.setCount(p.count);
      this.setColourMode(p.mode);
      this.setBrandColour(p.brand);
      this.setRotSpeed(p.rot);
      this.setAdditive(p.additive);
      // bg handled by parent (it's a scene-level concern)
    },
    dispose() {
      ctx.scene.remove(group);
      if (geom) geom.dispose();
      if (mat) mat.dispose();
    },
  };
}

/** @typedef {ReturnType<typeof createPointsModule>} PointsRenderer */
