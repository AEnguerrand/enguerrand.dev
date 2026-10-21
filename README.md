# enguerrand.dev

Personal website built with Astro + Tailwind.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Agent work and checks

Read [AGENTS.md](AGENTS.md) before changes. Use the existing Astro and Tailwind components to preserve the site design.

```bash
npm run check:site
npm run build
npm run test:site
```

The checks cover generated HTML, headings, links, resources, dates, Stars data, and blog publication. Also inspect phone, tablet, and desktop layouts.

## Edit homepage projects

Edit `projects` in `src/content/pages/home.md`. Each entry has a `title`, a short `description`, and an HTTP(S) `url`. Keep entries in the order they should appear. The homepage links directly to each project; its navigation scrolls to this section. Set `projects: []` to show the empty state.

The homepage shows Talks first, then Blog and Projects. Blog automatically displays up to three published posts, excluding drafts and future dates. Exploration details stay in the same Home content file.

## Write a blog post

Create a file such as `src/content/posts/my-first-post.md`. Its file name becomes `/blog/my-first-post/`.

```markdown
---
title: "My first post"
description: "A short description for the listing and search."
draft: true
tags: [Security]
---

## Start here

Write your post in Markdown. The page adds the H1 from your title.
```

Three draft outlines are ready for Canada, security, and AI. Run `npm run dev` and open `/blog/` to preview drafts locally. Drafts are marked in development. Draft Markdown remains visible to anyone who can read this repository; only the built website excludes it. Production builds exclude drafts and future posts from routes, listings, search, and the sitemap.

To publish, replace the outline with your article, set `draft: false`, and add `publishDate: "YYYY-MM-DD"` with the publication date. Run the checks, then commit and deploy through the normal workflow. Dates use UTC. A future date needs a new build on or after that date; there is no automatic publication scheduler. `npm run preview` shows production output and does not show drafts.

## Deploy (Cloudflare Workers - Static Assets)

This site is deployed as static assets through Cloudflare Workers using `wrangler.toml`.

### Workers Builds (recommended)

Connect this repository in Cloudflare Workers Builds and use:

- Root directory: `.`
- Build command: `npm ci && npm run build`
- Deploy command: `npx wrangler deploy`

`wrangler.toml` defines the static assets directory (`dist`) and HTML/404 handling.

### Local deploy (optional)

```bash
npm run deploy:cf
```

## Content

- Pages: `src/pages/`
- Talks and page content: `src/content/`
- Components: `src/components/`

## GitHub Stars

The `/github-stars` page is generated from:

- `data/starred-lists.json`
- `public/data/starred-groups.json`

Refresh data:

```bash
npm run stars:refresh
```

Stars scripts use `uv`. Optional env vars: `GITHUB_TOKEN`, `GITHUB_COOKIE`.

## Search metadata

Page titles and descriptions are set through `BaseLayout`. Keep them specific to the page and consistent with its visible content. Page canonicals, sitemap URLs, internal page links, and structured article URLs use trailing slashes, matching the static host. Query strings are excluded from canonical URLs.

The shared layout supplies stable Person/WebSite identity, page metadata, and social previews. Home and Resume identify the author through ProfilePage data. Talk and published blog pages supply article author, image, and publication metadata. Do not infer a modification date from an event date. The current social image is 1536 × 1536; update its metadata if the asset changes.

Search and 404 pages are `noindex` and absent from the sitemap. Search remains crawlable so a crawler can read its `noindex` tag. Draft and future blog posts remain excluded from production. Run `npm run check:site`, `npm run build`, and `npm run test:site` before publishing; the output checks cover all generated page canonicals, metadata, internal routes, sitemap membership, and structured data.

After deployment, use Google Search Console to submit `https://enguerrand.dev/sitemap-index.xml` and inspect representative URLs. Validate structured data with Google's Rich Results Test. These external checks need the deployed site and account access; passing local checks does not prove indexing, ranking, or rich-result eligibility.
