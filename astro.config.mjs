import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Bundle Once UI's extensionless ESM imports in Astro's server environments.
  vite: {
    plugins: [
      {
        name: "once-ui-server-imports",
        configEnvironment(name) {
          if (name !== "client")
            return {
              resolve: { noExternal: [/^@once-ui-system\/core(?:\/|$)/] },
            };
        },
      },
    ],
  },
  site: "https://enguerrand.dev",
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/search/"),
    }),
  ],
});
