import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { createSeoBuild } from "./src/lib/seo-build.mjs";

const seo = createSeoBuild();

export default defineConfig({
  site: "https://enguerrand.dev",
  integrations: [
    mdx(),
    react(),
    // Read the rendered canonical/robots tags before the sitemap hook runs.
    seo.integration,
    sitemap({ filter: seo.includeInSitemap }),
  ],
});
