// Dither / halftone renderer: loads a .glb, Lambert-lit, post-processed through
// a custom ShaderPass that does either Bayer 1-bit or CMYK halftone. Owns its
// own scene + composer. The renderer/canvas/camera are shared with the parent.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BAYER_4, BAYER_8, makeBayerTexture } from './bayer.js';
import { DITHER_FRAGMENT_SHADER, DITHER_VERTEX_SHADER } from './shaders.js';
import { DITHER_PRESETS } from './presets.js';

/**
 * @param {Object} ctx
 * @param {THREE.WebGLRenderer} ctx.renderer
 * @param {THREE.PerspectiveCamera} ctx.camera
 * @param {string} ctx.url                   - URL of the .glb mesh.
 * @param {import('./presets.js').DitherPreset} [ctx.initial]
 * @returns {DitherRenderer}
 */
export function createDitherModule(ctx) {
  const initial = ctx.initial ?? DITHER_PRESETS.obra;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(initial.paper);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35 * Math.min(initial.exp, 1.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.1 * Math.min(initial.exp, 1.8));
  dirLight.position.set(initial.lx, initial.ly, 1).normalize();
  scene.add(ambient, dirLight);

  const group = new THREE.Group();
  scene.add(group);

  const bayerTex4 = makeBayerTexture(4, BAYER_4);
  const bayerTex8 = makeBayerTexture(8, BAYER_8);

  /** @type {EffectComposer | null} */ let composer = null;
  /** @type {ShaderPass | null} */    let ditherPass = null;
  let rotSpeed = initial.rot;
  let loaded = false;
  let texMode = initial.tex || initial.process === 'cmyk';

  function applyTextureMode(on) {
    texMode = on;
    group.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.vertexColors = on;
        obj.material.needsUpdate = true;
      }
    });
  }

  // Load the mesh.
  new GLTFLoader().load(ctx.url, (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        // Lambert so the directional light produces a luma range to dither
        // against. DoubleSide hides any non-watertight gap or normal-flipped
        // backface. flatShading gives crisp facets — the right look for ordered
        // dither (Gouraud smoothing muddies the bands).
        obj.material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          flatShading: true,
          vertexColors: texMode,
        });
      }
    });
    group.add(gltf.scene);

    composer = new EffectComposer(ctx.renderer);
    composer.setPixelRatio(1);
    composer.setSize(
      ctx.renderer.domElement.clientWidth,
      ctx.renderer.domElement.clientHeight,
    );
    composer.addPass(new RenderPass(scene, ctx.camera));

    ditherPass = new ShaderPass({
      uniforms: {
        tDiffuse:   { value: null },
        uBayerTex:  { value: initial.bayer === 4 ? bayerTex4 : bayerTex8 },
        uBayerSize: { value: initial.bayer },
        uInk:       { value: new THREE.Color(initial.ink) },
        uPaper:     { value: new THREE.Color(initial.paper) },
        uBias:      { value: initial.bias },
        uHalftone:  { value: initial.process === 'cmyk' ? 1.0 : 0.0 },
        uGridSize:  { value: initial.grid },
        uExposure:  { value: initial.exp },
      },
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_FRAGMENT_SHADER,
    });
    composer.addPass(ditherPass);
    loaded = true;
  });

  return {
    scene,
    group,
    isLoaded: () => loaded,
    tick(dt) { group.rotation.y += rotSpeed * dt; },
    render() {
      if (composer) composer.render();
      else ctx.renderer.render(scene, ctx.camera); // pre-load fallback (rare)
    },
    resize(w, h) {
      if (composer) {
        composer.setPixelRatio(1);
        composer.setSize(w, h);
      }
    },
    setInk(h)     { if (ditherPass) ditherPass.uniforms.uInk.value.set(h); },
    setPaper(h)   {
      if (ditherPass) ditherPass.uniforms.uPaper.value.set(h);
      scene.background = new THREE.Color(h);
    },
    setBias(v)    { if (ditherPass) ditherPass.uniforms.uBias.value = v; },
    setBayer(sz)  {
      if (ditherPass) {
        ditherPass.uniforms.uBayerSize.value = sz;
        ditherPass.uniforms.uBayerTex.value = sz === 4 ? bayerTex4 : bayerTex8;
      }
    },
    setLight(x, y) { dirLight.position.set(x, y, 1).normalize(); },
    setExposure(v) {
      // Two-stage gain: lights up to a cap, then shader exposure beyond.
      const litGain = Math.min(v, 1.8);
      dirLight.intensity = 1.1 * litGain;
      ambient.intensity = 0.35 * litGain;
      if (ditherPass) ditherPass.uniforms.uExposure.value = v;
    },
    setRotSpeed(v) { rotSpeed = v; },
    setProcess(p)  {
      if (ditherPass) ditherPass.uniforms.uHalftone.value = p === 'cmyk' ? 1.0 : 0.0;
      if (p === 'cmyk') applyTextureMode(true);
    },
    setGridSize(v) { if (ditherPass) ditherPass.uniforms.uGridSize.value = v; },
    setTextureMode: applyTextureMode,
    applyPreset(p) {
      this.setInk(p.ink);
      this.setPaper(p.paper);
      this.setBias(p.bias);
      this.setBayer(p.bayer);
      this.setLight(p.lx, p.ly);
      this.setExposure(p.exp);
      this.setRotSpeed(p.rot);
      this.setProcess(p.process);
      this.setGridSize(p.grid);
      applyTextureMode(p.tex || p.process === 'cmyk');
    },
    dispose() {
      if (composer) composer.dispose?.();
      bayerTex4.dispose();
      bayerTex8.dispose();
      group.traverse((obj) => {
        if (obj.isMesh) { obj.geometry.dispose(); obj.material.dispose(); }
      });
    },
  };
}

/** @typedef {ReturnType<typeof createDitherModule>} DitherRenderer */
