# enguerrand.dev

[enguerrand.dev](https://enguerrand.dev) is my personal website for talks, projects, selected technical resources, and writing.

It is built with [Astro](https://astro.build) and Tailwind CSS, then deployed as a static site on Cloudflare Workers.

## Local development

```bash
npm install
npm run dev
```

Before submitting changes, read [AGENTS.md](AGENTS.md) and run:

```bash
npm run check:site
npm run build
npm run test:site
```

## Content

- Homepage copy and projects: `src/content/pages/home.md`
- Pages: `src/pages/`
- Talks and posts: `src/content/`
- Components: `src/components/`
- GitHub Stars data: `data/` and `public/data/`

Keep blog posts in `src/content/posts/` with `draft: true` while writing. To publish, set `draft: false` and add a valid `publishDate`.

Refresh the GitHub Stars data with:

```bash
npm run stars:refresh
```

The refresh scripts use `uv` and can use `GITHUB_TOKEN` and `GITHUB_COOKIE`.

## Deployment

Cloudflare Workers Builds runs `npm ci && npm run build`, then `npx wrangler deploy`. The static output and routing configuration are in `wrangler.toml`.

For a local deployment:

```bash
npm run deploy:cf
```
