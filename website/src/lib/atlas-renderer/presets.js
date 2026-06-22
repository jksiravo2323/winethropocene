// Built-in presets. Consumers can pass these by name to applyPreset() or
// extend with their own by passing a full options object.

/**
 * @typedef {Object} PointsPreset
 * @property {number} size              0.001..0.025
 * @property {number} count             draw range (capped to actual cloud size)
 * @property {'uniform'|'depth'|'sampled'|'gradient'} mode
 * @property {string} brand             hex
 * @property {string} bg                hex
 * @property {number} rot               0..1.5 rev/sec
 * @property {boolean} additive
 */

/** @type {Record<string, PointsPreset>} */
export const POINTS_PRESETS = {
  ghost:  { size: 0.004,  count: 40000, mode: 'depth',    brand: '#e8e4d8', bg: '#0a0a0a', rot: 0.30, additive: true },
  dust:   { size: 0.0025, count: 50000, mode: 'uniform',  brand: '#d8c9a3', bg: '#161210', rot: 0.18, additive: true },
  ember:  { size: 0.006,  count: 30000, mode: 'gradient', brand: '#ffffff', bg: '#0c0805', rot: 0.40, additive: true },
  paper:  { size: 0.005,  count: 50000, mode: 'sampled',  brand: '#ffffff', bg: '#f4efe6', rot: 0.30, additive: false },
};

/**
 * @typedef {Object} DitherPreset
 * @property {string} ink               hex
 * @property {string} paper             hex
 * @property {number} bias              -0.3..0.3 (negative = more paper)
 * @property {4|8} bayer                Bayer matrix size (1-bit mode only)
 * @property {number} lx                -1..1 directional light X
 * @property {number} ly                -1..1 directional light Y
 * @property {number} exp               0.3..5.0 exposure (shader gain)
 * @property {number} rot               0..1.5 rev/sec
 * @property {boolean} tex              texture-driven luma (multiply vertex colour into Lambert)
 * @property {'binary'|'cmyk'} process  shader path
 * @property {number} grid              CMYK dot-grid spacing in pixels (3..14)
 */

/** @type {Record<string, DitherPreset>} */
export const DITHER_PRESETS = {
  obra:          { ink: '#0d0d0d', paper: '#eae2cf', bias:  0.00, bayer: 8, lx:  0.5, ly:  0.8, exp: 1.00, rot: 0.30, tex: false, process: 'binary', grid: 6 },
  daguerreotype: { ink: '#1a1410', paper: '#d8c9a3', bias:  0.05, bayer: 8, lx:  0.5, ly:  0.7, exp: 1.20, rot: 0.30, tex: true,  process: 'binary', grid: 6 },
  cmyk:          { ink: '#101010', paper: '#f5f0e2', bias: -0.05, bayer: 8, lx:  0.5, ly:  0.8, exp: 2.80, rot: 0.30, tex: true,  process: 'cmyk',   grid: 6 },
  blueprint:     { ink: '#e8efff', paper: '#1b2748', bias:  0.00, bayer: 8, lx:  0.4, ly:  0.6, exp: 1.10, rot: 0.30, tex: false, process: 'binary', grid: 6 },
  newsprint:     { ink: '#3a2618', paper: '#f4ead6', bias:  0.00, bayer: 4, lx:  0.6, ly:  0.7, exp: 0.95, rot: 0.30, tex: false, process: 'binary', grid: 6 },
  xray:          { ink: '#ffffff', paper: '#000000', bias: -0.10, bayer: 8, lx:  0.3, ly:  0.5, exp: 1.20, rot: 0.30, tex: false, process: 'binary', grid: 6 },
};
