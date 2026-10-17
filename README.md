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

## UI pilot and agent work

Home and `/talks/kubecon-na-2024/` use Once UI 2.1 with static React rendering.
Astro, the site fonts, and the existing palette stay in place. Other pages keep
Tailwind components. Once UI utilities are scoped in `postcss.config.cjs` to
prevent collisions with Tailwind classes. Import individual components to limit
unused component CSS.

Read [AGENTS.md](AGENTS.md) before changes. Check the pilot after a build:

```bash
npm run check:pilot
npm run build
npm run test:pilot
```

The last command checks generated HTML, resource links, heading order, CSS
isolation, dates, and Stars data. Also inspect phone, tablet, and desktop layouts.

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
