// Geo utilities for coordinate conversion and map projections
export function latLonToMercator(lat: number, lon: number, width: number, height: number) {
  const x = (lon + 180) * (width / 360);
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  return { x, y };
}
