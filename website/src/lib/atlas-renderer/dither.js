export function dither(imageData: ImageData, threshold: number): boolean[] {
  const { data, width, height } = imageData;
  const result: boolean[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    result.push(gray / 255 < threshold);
  }
  return result;
}
