import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ============================================================================
// Winethropocene Content Collections
// ============================================================================

// --- Articles (primary content type — magazine articles) ---
// One .mdx file per article under src/content/articles/<slug>.mdx.
// Produced from the Research Brief pipeline. Rendered by ArticleLayout.astro
// at /articles/<slug>, with inline animated charts via MDX.
const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    /** One-line framing shown under the title. */
    subtitle: z.string().optional(),
    /** Date used for sorting. */
    date: z.coerce.date(),
    /** Short blurb for listing cards. */
    summary: z.string(),
    authors: z.array(z.string()).default([]),
    /** Theme from Winethropocene taxonomy. */
    theme: z.string(),
    /** Primary geography. */
    region: z.string().optional(),
    /** Post typology. */
    typology: z.enum(["field-report", "data-story", "curated-brief"]),
    /** Hero image path under /public. */
    heroImage: z.string().optional(),
    /** Credit caption for the hero image. */
    heroCredit: z.string().optional(),
    heroCreditUrl: z.string().optional(),
    /** Accent colour for charts, rules, links. */
    accent: z.string().optional(),
    /** Sourcing confidence. */
    confidence: z.enum(["green", "amber", "red"]).optional(),
    tags: z.array(z.string()).default([]),
    /** Slugs of related articles. */
    related: z.array(z.string()).default([]),
    references: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().optional(),
          kind: z.enum(["primary", "secondary"]).default("secondary"),
        }),
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

// --- Atlas (wine regions, varieties, climate phenomena) ---
// One .md file per entry under src/content/atlas/<slug>.md.
// Drives the 3D globe, Leaflet map, card grid, and per-entry pages.
const atlas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/atlas" }),
  schema: z.object({
    title: z.string(),
    place: z.string(),
    /** Canonical country name — drives the country filter. */
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    category: z.enum([
      "region",
      "variety",
      "phenomenon",
      "producer",
      "institution",
    ]),
    /** Optional sub-category for finer grouping. */
    subcategory: z.string().optional(),
    /** Short blurb — map popup + card. */
    summary: z.string().optional(),
    subtitle: z.string().optional(),
    status: z
      .enum(["thriving", "adapting", "at-risk", "transforming", "historical"])
      .optional(),
    climateZone: z
      .enum([
        "mediterranean",
        "continental",
        "maritime",
        "semi-arid",
        "alpine",
        "tropical",
      ])
      .optional(),
    /** Key grape varieties. */
    varieties: z.array(z.string()).default([]),
    /** Elevation range, e.g. "900–1,500m". */
    elevation: z.string().optional(),
    /** Primary climate threat. */
    primaryThreat: z.string().optional(),
    /** Display period, e.g. "Pre-Roman–present". */
    period: z.string().optional(),
    /** Any specific cost/economic detail. */
    costToUser: z.string().optional(),
    /** Reach / scale. */
    population: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Hero image path under /public. */
    image: z.string().optional(),
    imageCredit: z.string().optional(),
    imageCreditUrl: z.string().optional(),
    confidence: z.enum(["green", "amber", "red"]).optional(),
    related: z.array(z.string()).default([]),
    references: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().optional(),
          kind: z.enum(["primary", "secondary"]).default("secondary"),
        }),
      )
      .default([]),
    url: z.string().optional(),
  }),
});

// --- Team (editorial team) ---
const team = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(100),
    photo: z.string().optional(),
  }),
});

// --- Press (media coverage) ---
const press = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/press" }),
  schema: z.object({
    title: z.string(),
    outlet: z.string(),
    date: z.coerce.date().optional(),
    dateLabel: z.string().optional(),
    url: z.string().optional(),
  }),
});

// --- Producers (wine producer directory) ---
const producers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/producers" }),
  schema: z.object({
    name: z.string(),
    region: z.string(),
    country: z.string(),
    summary: z.string(),
    website: z.string().optional(),
    logo: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { articles, atlas, team, press, producers };
