/**
 * Coarse world tile-grid layout for the GeoTileMap choropleth. Each country is
 * one cell on a 14-col × 9-row grid, placed roughly by geography (west→east,
 * north→south). This is a tile-grid cartogram, not a projected map — it needs
 * no boundary data, reads clearly as "the world", and animates as a grid.
 *
 * Values in reports are assigned by region band (the source maps are modelled
 * regional estimates), so we colour by region via worldTilesByRegion().
 */
export type Region =
  | "northAmerica"
  | "southAmerica"
  | "europe"
  | "africa"
  | "middleEast"
  | "asia"
  | "oceania";

export interface Tile {
  code: string;
  label: string;
  region: Region;
  row: number;
  col: number;
}

export const WORLD_TILES: Tile[] = [
  // North America
  { code: "CAN", label: "Canada", region: "northAmerica", row: 1, col: 2 },
  { code: "USA", label: "United States", region: "northAmerica", row: 2, col: 2 },
  { code: "MEX", label: "Mexico", region: "northAmerica", row: 3, col: 2 },
  // South America
  { code: "COL", label: "Colombia", region: "southAmerica", row: 4, col: 3 },
  { code: "PER", label: "Peru", region: "southAmerica", row: 5, col: 3 },
  { code: "BRA", label: "Brazil", region: "southAmerica", row: 5, col: 4 },
  { code: "CHL", label: "Chile", region: "southAmerica", row: 6, col: 3 },
  { code: "ARG", label: "Argentina", region: "southAmerica", row: 6, col: 4 },
  // Europe
  { code: "IRL", label: "Ireland", region: "europe", row: 2, col: 5 },
  { code: "GBR", label: "United Kingdom", region: "europe", row: 2, col: 6 },
  { code: "NOR", label: "Norway", region: "europe", row: 1, col: 7 },
  { code: "SWE", label: "Sweden", region: "europe", row: 1, col: 8 },
  { code: "ESP", label: "Spain", region: "europe", row: 3, col: 5 },
  { code: "FRA", label: "France", region: "europe", row: 3, col: 6 },
  { code: "DEU", label: "Germany", region: "europe", row: 2, col: 7 },
  { code: "POL", label: "Poland", region: "europe", row: 2, col: 8 },
  { code: "ITA", label: "Italy", region: "europe", row: 3, col: 7 },
  // Middle East
  { code: "TUR", label: "Türkiye", region: "middleEast", row: 3, col: 8 },
  { code: "SAU", label: "Saudi Arabia", region: "middleEast", row: 4, col: 9 },
  // Africa
  { code: "MAR", label: "Morocco", region: "africa", row: 4, col: 6 },
  { code: "EGY", label: "Egypt", region: "africa", row: 4, col: 8 },
  { code: "NGA", label: "Nigeria", region: "africa", row: 5, col: 6 },
  { code: "ETH", label: "Ethiopia", region: "africa", row: 5, col: 8 },
  { code: "KEN", label: "Kenya", region: "africa", row: 6, col: 8 },
  { code: "ZAF", label: "South Africa", region: "africa", row: 7, col: 7 },
  // Asia
  { code: "RUS", label: "Russia", region: "asia", row: 1, col: 10 },
  { code: "IND", label: "India", region: "asia", row: 4, col: 10 },
  { code: "CHN", label: "China", region: "asia", row: 3, col: 11 },
  { code: "THA", label: "Thailand", region: "asia", row: 5, col: 11 },
  { code: "VNM", label: "Vietnam", region: "asia", row: 5, col: 12 },
  { code: "IDN", label: "Indonesia", region: "asia", row: 6, col: 12 },
  { code: "JPN", label: "Japan", region: "asia", row: 3, col: 13 },
  // Oceania
  { code: "AUS", label: "Australia", region: "oceania", row: 7, col: 12 },
  { code: "NZL", label: "New Zealand", region: "oceania", row: 8, col: 13 },
];

export interface PlacedTile extends Tile {
  value: number;
}

/** Attach a value to every tile from a region→value map. */
export function worldTilesByRegion(byRegion: Partial<Record<Region, number>>): PlacedTile[] {
  return WORLD_TILES.map((t) => ({ ...t, value: byRegion[t.region] ?? 0 }));
}
