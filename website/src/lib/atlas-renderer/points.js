import { dither } from "./dither.js";

export function createPointCloud(
  imageData: ImageData,
  width: number,
  height: number,
  depth: number,
  preset: { size: number; color: string }
) {
  const mask = dither(imageData, 0.5);
  const positions: number[] = [];
  const colors: number[] = [];
  const r = parseInt(preset.color.slice(1, 3), 16) / 255;
  const g = parseInt(preset.color.slice(3, 5), 16) / 255;
  const b = parseInt(preset.color.slice(5, 7), 16) / 255;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      const x = ((i % imageData.width) / imageData.width - 0.5) * width;
      const y = (0.5 - Math.floor(i / imageData.width) / imageData.height) * height;
      const z = (Math.random() - 0.5) * depth;
      positions.push(x, y, z);
      colors.push(r, g, b);
    }
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}
