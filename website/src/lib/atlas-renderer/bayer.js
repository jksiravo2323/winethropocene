// Bayer ordered dithering for point cloud generation
export function bayerMatrix(size: number): number[][] {
  if (size === 2) {
    return [[0, 2], [3, 1]];
  }
  const prev = bayerMatrix(size / 2);
  const result: number[][] = [];
  for (let i = 0; i < size; i++) {
    result.push([]);
    for (let j = 0; j < size; j++) {
      result[i][j] = 4 * prev[i % (size / 2)][j % (size / 2)] +
        ((i < size / 2) ? (j < size / 2 ? 0 : 2) : (j < size / 2 ? 3 : 1));
    }
  }
  return result;
}
