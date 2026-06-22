import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://winethropocene.xyz",
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: { enabled: true },
  }),
  integrations: [mdx()],
  vite: {
    ssr: {
      external: ["three"],
    },
    resolve: {
      conditions: ["browser", "import"],
    },
  },
});
