// Geo tile utilities for tile-based map rendering
export interface GeoTile {
  x: number;
  y: number;
  value: number;
  label?: string;
}

export function generateTileGrid(
  latMin: number, latMax: number, lonMin: number, lonMax: number,
  rows: number, cols: number,
  valueFn: (lat: number, lon: number) => number
): GeoTile[][] {
  const grid: GeoTile[][] = [];
  const latStep = (latMax - latMin) / rows;
  const lonStep = (lonMax - lonMin) / cols;
  for (let r = 0; r < rows; r++) {
    const row: GeoTile[] = [];
    for (let c = 0; c < cols; c++) {
      const lat = latMin + latStep * (r + 0.5);
      const lon = lonMin + lonStep * (c + 0.5);
      row.push({ x: c, y: r, value: valueFn(lat, lon) });
    }
    grid.push(row);
  }
  return grid;
}
