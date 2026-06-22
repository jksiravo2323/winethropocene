import { getCollection, type CollectionEntry } from "astro:content";

export type AtlasEntry = CollectionEntry<"atlas">;
export type CategoryKey = AtlasEntry["data"]["category"];

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  /** Accent colour for pins, card borders, gradient fallbacks. */
  accent: string;
  blurb: string;
}

// Wine atlas category taxonomy — regions, varieties, phenomena, producers,
// and institutions. Order here is the order categories appear in the filter bar.
export const CATEGORIES: CategoryMeta[] = [
  {
    key: "region",
    label: "Region",
    accent: "#C84B4B", // wine red
    blurb: "Wine-growing regions and appellations.",
  },
  {
    key: "variety",
    label: "Variety",
    accent: "#C8A27A", // earth / terracotta
    blurb: "Grape varieties — heritage, hybrid, and emerging.",
  },
  {
    key: "phenomenon",
    label: "Phenomenon",
    accent: "#E8875B", // heat / amber
    blurb: "Climate events, ecological shifts, and environmental pressures.",
  },
  {
    key: "producer",
    label: "Producer",
    accent: "#5B9BD5", // water blue
    blurb: "Winegrowers and estates at the front line of change.",
  },
  {
    key: "institution",
    label: "Institution",
    accent: "#9C89B8", // muted purple
    blurb: "Regulatory bodies, research institutes, and appellation systems.",
  },
];

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));
const FALLBACK = CATEGORIES[0]; // "region"

export function categoryMeta(key: string): CategoryMeta {
  return CATEGORY_BY_KEY.get(key as CategoryKey) ?? FALLBACK;
}

export function accentFor(entry: AtlasEntry): string {
  return categoryMeta(entry.data.category).accent;
}

// Each category renders its own floating point-cloud object on the atlas entry
// page. Paths are under public/clouds/.
const CLOUD_BY_CATEGORY: Record<CategoryKey, string> = {
  region: "/clouds/vine-tendril.ply",
  variety: "/clouds/grape-cluster.ply",
  phenomenon: "/clouds/globe.ply",
  producer: "/clouds/wine-bottle.ply",
  institution: "/clouds/barrel.ply",
};

export function cloudForCategory(key: string): string {
  return CLOUD_BY_CATEGORY[key as CategoryKey] ?? CLOUD_BY_CATEGORY.region;
}

// --- Status taxonomy ---
export type StatusKey =
  | "thriving"
  | "adapting"
  | "at-risk"
  | "transforming"
  | "historical";

export interface StatusMeta {
  key: StatusKey;
  label: string;
  color: string;
}

export const STATUS_META: StatusMeta[] = [
  { key: "thriving", label: "Thriving", color: "#6ee7a8" }, // green — stable
  { key: "adapting", label: "Adapting", color: "#8fd3ff" }, // blue — changing
  { key: "at-risk", label: "At Risk", color: "#ffcf6e" }, // amber — stressed
  { key: "transforming", label: "Transforming", color: "#ff9f8f" }, // coral — in flux
  { key: "historical", label: "Historical", color: "#9aa0a6" }, // grey — past
];

const STATUS_BY_KEY = new Map(STATUS_META.map((s) => [s.key, s]));

export function statusMeta(status?: string): StatusMeta | undefined {
  if (!status) return undefined;
  return STATUS_BY_KEY.get(status as StatusKey);
}

export function statusLabel(status?: string): string | undefined {
  if (!status) return undefined;
  return STATUS_BY_KEY.get(status as StatusKey)?.label ?? status;
}

// Status filter groups
export type StatusGroupKey = "active" | "changing" | "historical";

export interface StatusGroupMeta {
  key: StatusGroupKey;
  label: string;
  statuses: string[];
}

export const STATUS_GROUPS: StatusGroupMeta[] = [
  {
    key: "active",
    label: "Thriving / Adapting",
    statuses: ["thriving", "adapting"],
  },
  {
    key: "changing",
    label: "At Risk / Transforming",
    statuses: ["at-risk", "transforming"],
  },
  { key: "historical", label: "Historical", statuses: ["historical"] },
];

const STATUS_GROUP_BY_STATUS = new Map<string, StatusGroupKey>(
  STATUS_GROUPS.flatMap((g) => g.statuses.map((s) => [s, g.key])),
);

export function statusGroupOf(status?: string): StatusGroupKey | undefined {
  if (!status) return undefined;
  return STATUS_GROUP_BY_STATUS.get(status);
}

// --- Climate zone options ---
export type ClimateZoneKey =
  | "mediterranean"
  | "continental"
  | "maritime"
  | "semi-arid"
  | "alpine"
  | "tropical";

export interface ClimateZoneMeta {
  key: ClimateZoneKey;
  label: string;
}

export const CLIMATE_ZONES: ClimateZoneMeta[] = [
  { key: "mediterranean", label: "Mediterranean" },
  { key: "continental", label: "Continental" },
  { key: "maritime", label: "Maritime" },
  { key: "semi-arid", label: "Semi-Arid" },
  { key: "alpine", label: "Alpine" },
  { key: "tropical", label: "Tropical" },
];

// --- Threat taxonomy (for filtering) ---
export const THREATS = [
  { key: "water-scarcity", label: "Water Scarcity" },
  { key: "aridity", label: "Aridity / Desertification" },
  { key: "disease", label: "Disease Pressure" },
  { key: "fire", label: "Wildfire" },
  { key: "frost", label: "Frost" },
  { key: "hail", label: "Hail" },
  { key: "smoke", label: "Smoke Taint" },
  { key: "market", label: "Market Pressure" },
  { key: "regulation", label: "Regulatory Change" },
];

// --- Load helpers ---
export async function loadAtlas(): Promise<{
  entries: AtlasEntry[];
  bySlug: Map<string, AtlasEntry>;
}> {
  const entries = (await getCollection("atlas")).sort((a, b) =>
    a.data.title.localeCompare(b.data.title),
  );
  const bySlug = new Map(entries.map((e) => [e.id, e]));
  return { entries, bySlug };
}
