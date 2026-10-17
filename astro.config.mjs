import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://enguerrand.dev",
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/search/"),
    }),
  ],
});
