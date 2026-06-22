import type { CollectionEntry } from "astro:content";

export type AtlasEntry = CollectionEntry<"atlas">;

export interface CategoryMeta {
  key: string;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "region", label: "Region", color: "#C4743E" },
  { key: "variety", label: "Variety", color: "#5B9BD5" },
  { key: "phenomenon", label: "Phenomenon", color: "#E8875B" },
  { key: "producer", label: "Producer", color: "#8B2252" },
  { key: "institution", label: "Institution", color: "#9B7BB8" },
];

export function categoryMeta(key?: string): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

export const STATUSES = [
  { key: "thriving", label: "Thriving", dot: "#6ee7a8" },
  { key: "adapting", label: "Adapting", dot: "#facc15" },
  { key: "at-risk", label: "At Risk", dot: "#f87171" },
  { key: "transforming", label: "Transforming", dot: "#5B9BD5" },
  { key: "historical", label: "Historical", dot: "#9B7BB8" },
] as const;

export function statusLabel(
  key?: string
): string | undefined {
  return STATUSES.find((s) => s.key === key)?.label;
}

export function statusMeta(
  key?: string
): (typeof STATUSES)[number] | undefined {
  return STATUSES.find((s) => s.key === key);
}

export const CLIMATE_ZONES = [
  { key: "mediterranean", label: "Mediterranean" },
  { key: "continental", label: "Continental" },
  { key: "maritime", label: "Maritime" },
  { key: "semi-arid", label: "Semi-arid" },
  { key: "alpine", label: "Alpine" },
  { key: "tropical", label: "Tropical" },
] as const;
