import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    summary: z.string(),
    authors: z.array(z.string()).default([]),
    theme: z.string(),
    region: z.string().optional(),
    typology: z.enum(["field-report", "data-story", "curated-brief"]),
    heroImage: z.string().optional(),
    heroCredit: z.string().optional(),
    heroCreditUrl: z.string().optional(),
    accent: z.string().optional(),
    confidence: z.enum(["green", "amber", "red"]).optional(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    references: z.array(z.object({
      label: z.string(),
      url: z.string().optional(),
      kind: z.enum(["primary", "secondary"]).default("secondary"),
    })).default([]),
    draft: z.boolean().default(false),
  }),
});

const atlas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/atlas" }),
  schema: z.object({
    title: z.string(),
    place: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    category: z.enum(["region", "variety", "phenomenon", "producer", "institution"]),
    subcategory: z.string().optional(),
    summary: z.string().optional(),
    subtitle: z.string().optional(),
    status: z.enum(["thriving", "adapting", "at-risk", "transforming", "historical"]).optional(),
    climateZone: z.enum(["mediterranean", "continental", "maritime", "semi-arid", "alpine", "tropical"]).optional(),
    varieties: z.array(z.string()).default([]),
    elevation: z.string().optional(),
    primaryThreat: z.string().optional(),
    period: z.string().optional(),
    costToUser: z.string().optional(),
    population: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageCredit: z.string().optional(),
    imageCreditUrl: z.string().optional(),
    confidence: z.enum(["green", "amber", "red"]).optional(),
    related: z.array(z.string()).default([]),
    references: z.array(z.object({
      label: z.string(),
      url: z.string().optional(),
      kind: z.enum(["primary", "secondary"]).default("secondary"),
    })).default([]),
    url: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/team" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number().default(100),
    photo: z.string().optional(),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/press" }),
  schema: z.object({
    title: z.string(),
    outlet: z.string(),
    date: z.coerce.date(),
    url: z.string().optional(),
    summary: z.string().optional(),
    logo: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const producers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/producers" }),
  schema: z.object({
    name: z.string(),
    country: z.string(),
    region: z.string(),
    lat: z.number(),
    lon: z.number(),
    website: z.string().optional(),
    summary: z.string(),
    practices: z.array(z.string()).default([]),
    varieties: z.array(z.string()).default([]),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { articles, atlas, team, press, producers };
