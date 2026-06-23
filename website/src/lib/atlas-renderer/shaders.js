// Dither / halftone shader. One ShaderPass, two algorithms:
//   uHalftone == 0  → Binary 1-bit Bayer (Obra Dinn-style)
//   uHalftone == 1  → CMYK process halftone, four rotated dot screens
// Both sample the screen-space pattern via gl_FragCoord so the pattern stays
// stable while the geometry rotates underneath.

export const DITHER_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const DITHER_FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D uBayerTex;
uniform float uBayerSize;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uBias;
uniform float uHalftone;
uniform float uGridSize;
uniform float uExposure;
varying vec2 vUv;

// Round-dot screen at a given rotation. Rotates gl_FragCoord (not UV) so the
// dot grid stays pixel-aligned and stable as the model spins beneath. sqrt(value)
// so dot AREA scales linearly with ink density — perceptually even.
float halftoneDot(vec2 fragCoord, float angle, float gridSize, float value) {
  float c = cos(angle), s = sin(angle);
  mat2 R = mat2(c, -s, s, c);
  vec2 p = R * fragCoord / gridSize;
  vec2 cell = fract(p) - 0.5;
  float dist = length(cell);
  float radius = sqrt(clamp(value, 0.0, 1.0)) * 0.75;
  return 1.0 - smoothstep(radius - 0.05, radius + 0.05, dist);
}

void main() {
  vec3 src = texture2D(tDiffuse, vUv).rgb;
  // Shader-side exposure runs AFTER the composer's 8-bit render target so it
  // has unbounded headroom. Lift dark textures here, not via light intensity.
  src *= uExposure;

  if (uHalftone > 0.5) {
    // ---- CMYK halftone -----------------------------------------------------
    float k = 1.0 - max(max(src.r, src.g), src.b);
    vec3 cmy = (vec3(1.0) - src - k) / max(0.001, 1.0 - k);
    cmy = clamp(cmy, 0.0, 1.0);

    float gs = uGridSize;
    // Classical CMYK screen angles — different rotations across channels avoid
    // moire patterns between them.
    float dotC = halftoneDot(gl_FragCoord.xy, 0.2618, gs, cmy.x + uBias);  // 15°
    float dotM = halftoneDot(gl_FragCoord.xy, 1.3090, gs, cmy.y + uBias);  // 75°
    float dotY = halftoneDot(gl_FragCoord.xy, 0.0,    gs, cmy.z + uBias);  //  0°
    float dotK = halftoneDot(gl_FragCoord.xy, 0.7854, gs, k     + uBias);  // 45°

    vec3 cyanInk    = vec3(0.10, 0.80, 0.95);
    vec3 magentaInk = vec3(0.95, 0.10, 0.55);
    vec3 yellowInk  = vec3(1.00, 0.92, 0.15);
    vec3 col = uPaper;
    col *= mix(vec3(1.0), cyanInk,    dotC);
    col *= mix(vec3(1.0), magentaInk, dotM);
    col *= mix(vec3(1.0), yellowInk,  dotY);
    col *= mix(vec3(1.0), uInk,       dotK);
    gl_FragColor = vec4(col, 1.0);
  } else {
    // ---- Binary 1-bit Bayer dither -----------------------------------------
    // POSITIVE mapping: ink marks where the surface is LIT (high luma), paper is
    // the empty field. So uInk = the bright stipple dots, uPaper = the dark page
    // background — lit hemisphere fills with dots, shadow side + background fall
    // away to bg. (The reverse mix would give an x-ray negative.)
    float luma = dot(src, vec3(0.2126, 0.7152, 0.0722));
    vec2 bayerUv = gl_FragCoord.xy / uBayerSize;
    float threshold = texture2D(uBayerTex, bayerUv).r;
    float v = step(threshold, luma + uBias);
    gl_FragColor = vec4(mix(uPaper, uInk, v), 1.0);
  }
}
`;
