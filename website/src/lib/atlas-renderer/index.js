// Public entry. Single factory createAtlasRenderer that owns the canvas,
// renderer, camera, orbit controls and the RAF loop. Loads point cloud and/or
// dither mesh on demand, switchable at runtime.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPointsModule } from './points.js';
import { createDitherModule } from './dither.js';
import { DITHER_PRESETS, POINTS_PRESETS } from './presets.js';

export { POINTS_PRESETS, DITHER_PRESETS };

/**
 * @typedef {Object} AtlasRendererOptions
 * @property {HTMLCanvasElement} canvas      - Canvas to render into.
 * @property {'points'|'dither'} [mode='points']
 * @property {string} [plyUrl]               - Required for points mode.
 * @property {string} [glbUrl]               - Required for dither mode.
 * @property {string} [pointsPreset='ghost']
 * @property {string} [ditherPreset='obra']
 * @property {Partial<import('./presets.js').PointsPreset>} [points]  - Overrides on top of points preset.
 * @property {Partial<import('./presets.js').DitherPreset>} [dither]  - Overrides on top of dither preset.
 * @property {boolean} [controls=true]       - Enable OrbitControls (drag, scroll).
 * @property {boolean} [autoResize=true]     - Listen on window resize.
 */

/**
 * @param {AtlasRendererOptions} opts
 * @returns {AtlasRenderer}
 */
export function createAtlasRenderer(opts) {
  if (!opts.canvas) throw new Error('atlas-renderer: opts.canvas is required');

  const canvas = opts.canvas;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 0.1, 2.2);

  /** @type {OrbitControls | null} */
  let controls = null;
  if (opts.controls !== false) {
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.6;
    controls.maxDistance = 6;
  }

  let mode = opts.mode || 'points';

  // Lazy modules — only instantiated when first needed.
  let pointsMod = null;
  let ditherMod = null;
  const pointsScene = new THREE.Scene();
  pointsScene.background = new THREE.Color(
    (opts.points?.bg) ?? POINTS_PRESETS[opts.pointsPreset || 'ghost']?.bg ?? '#0a0a0a'
  );

  function ensurePoints() {
    if (pointsMod) return pointsMod;
    if (!opts.plyUrl) throw new Error('atlas-renderer: plyUrl required for points mode');
    const preset = { ...POINTS_PRESETS[opts.pointsPreset || 'ghost'], ...(opts.points || {}) };
    pointsMod = createPointsModule({ scene: pointsScene, url: opts.plyUrl, initial: preset });
    return pointsMod;
  }
  function ensureDither() {
    if (ditherMod) return ditherMod;
    if (!opts.glbUrl) throw new Error('atlas-renderer: glbUrl required for dither mode');
    const preset = { ...DITHER_PRESETS[opts.ditherPreset || 'obra'], ...(opts.dither || {}) };
    ditherMod = createDitherModule({ renderer, camera, url: opts.glbUrl, initial: preset });
    return ditherMod;
  }

  // Eagerly create the initial mode's module so it starts loading.
  if (mode === 'points') ensurePoints();
  else if (mode === 'dither') ensureDither();

  function applyPixelRatio() {
    // Dither requires DPR=1 so each Bayer cell / halftone dot maps to one
    // physical pixel. Points mode benefits from retina.
    renderer.setPixelRatio(mode === 'dither' ? 1 : Math.min(window.devicePixelRatio, 2));
  }
  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
    applyPixelRatio();
    renderer.setSize(w, h, false);
    if (ditherMod) ditherMod.resize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const onWinResize = () => resize();
  if (opts.autoResize !== false) window.addEventListener('resize', onWinResize);

  // RAF loop.
  const clock = new THREE.Clock();
  let stopped = false;
  function frame() {
    if (stopped) return;
    const dt = clock.getDelta();
    if (controls) controls.update();
    if (mode === 'dither') {
      const m = ensureDither();
      m.tick(dt);
      m.render();
    } else {
      const m = ensurePoints();
      m.tick(dt);
      renderer.render(pointsScene, camera);
    }
    requestAnimationFrame(frame);
  }
  frame();

  /** @typedef {Object} AtlasRenderer */
  return {
    /** Switch render mode. Lazily instantiates the target module on first switch. */
    setMode(m) {
      mode = m;
      if (m === 'points') ensurePoints();
      else if (m === 'dither') ensureDither();
      resize(); // pixel ratio differs per mode
    },
    /** Apply a built-in or custom points preset. */
    applyPointsPreset(nameOrObj) {
      const p = typeof nameOrObj === 'string' ? POINTS_PRESETS[nameOrObj] : nameOrObj;
      if (!p) return;
      ensurePoints().applyPreset(p);
      if (p.bg) pointsScene.background = new THREE.Color(p.bg);
    },
    /** Apply a built-in or custom dither preset. */
    applyDitherPreset(nameOrObj) {
      const p = typeof nameOrObj === 'string' ? DITHER_PRESETS[nameOrObj] : nameOrObj;
      if (!p) return;
      ensureDither().applyPreset(p);
    },
    /** Direct access to module setters for finer per-property control. */
    get points() { return ensurePoints(); },
    get dither() { return ensureDither(); },
    /** Manually trigger a resize (e.g. after parent container layout change). */
    resize,
    /** Stop the RAF loop and dispose GPU resources. */
    dispose() {
      stopped = true;
      if (opts.autoResize !== false) window.removeEventListener('resize', onWinResize);
      controls?.dispose();
      pointsMod?.dispose();
      ditherMod?.dispose();
      renderer.dispose();
    },
  };
}
