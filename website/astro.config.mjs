// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://winethropocene.xyz",
  integrations: [mdx()],
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
  }),
  trailingSlash: "never",
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    resolve: { preserveSymlinks: true },
  },
});
