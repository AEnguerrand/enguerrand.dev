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

## Review a change

AI can complete scoped technical work and prepare a PR. Blog writing starts with the author. See [the AI workflow](docs/ai-workflow.md) for task scope, human review, and evidence limits.

Install Chromium once, fetch the target branch, then run the combined review:

```bash
npx playwright install chromium
git fetch origin
npm run review:site -- --base origin/main
```

The command runs the required site checks, builds the base revision in a temporary directory with its own lockfile, and captures both builds at 390, 768, and 1440 pixels. It writes a report, image pairs, browser traces, a rendered text and link diff, and a candidate preview under `artifacts/site-review/`. It does not merge or deploy.

GitHub Actions runs the same command for pull requests and uploads the review package, including failed-check logs. The package is evidence for the recorded revisions and source hash. A new source change needs a new run.

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
