export const vertexShader = `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5, 0.5));
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, 1.0 - d * 2.0);
  }
`;
