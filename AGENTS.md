# Repository instructions

Use ASD-STE100 Simplified Technical English (STE) by default.

## Project

- This is the personal website at https://enguerrand.dev.
- Keep Astro and static output. Content lives in `src/content/`; its schema is `src/content.config.ts`.
- Use Node.js 22.12 or later and npm. Commit `package-lock.json` with dependency changes.
- Build output is `dist/`. Cloudflare Workers serves it as static assets. Do not deploy or merge unless the user requests it.
- Preserve unrelated work. Use a scoped branch. After validation, commit, push, and create or update a pull request. Use Conventional Commits. Do not force-push.

## UI contract

- Preserve the Fraunces headings, Space Grotesk body text, blue accent, pale background, and restrained surfaces.
- The Once UI pilot covers Home and `/talks/kubecon-na-2024/`. Other pages retain their current components until the user extends the migration.
- Pilot React components live in `src/components/pilot/`. Brand aliases live in `src/styles/once-ui.css`. Keep this stylesheet on the pilot routes.
- Use Once UI `Column`, `Row`, `Grid`, `Heading`, `Text`, `Button`, and `SmartLink`. Use token props for layout and spacing. Static panels use `Column`; `Card` is for interactive surfaces.
- Read `node_modules/@once-ui-system/core/AGENTS.md`, `ai/manifest.json`, `ai/rules.compact.md`, and the relevant task bundle before new Once UI work. Use installed package types as the API reference. Do not copy obsolete version examples.
- Use the root `LayoutProvider` for Astro. Do not add Next.js. Render native links on the server; add an Astro `client:*` directive only when browser state is required.
- Keep shared presentation rules in `PilotUI.tsx`. Avoid duplicate Tailwind and Once UI controls within a pilot page. Keep custom CSS for brand aliases, typography, prose, and embeds.
- Use one H1 per page and H2 for sections. Check keyboard focus, anchor targets, phone layouts, and long text. Do not invent achievements or metrics.
- Keep content URLs, metadata, structured data, resources, and article text intact. A short `displayTitle` can differ from the full title.
- Import checked-in JSON at build time. Do not read source-relative files with `import.meta.url` inside compiled Astro pages. Missing data must not appear as a zero count.

## Validation

- Run `npm run check:pilot`, `npm run build`, and `npm run test:pilot` on the final source. Run `git diff --check`.
- Inspect Home and the pilot talk at phone, tablet, and desktop widths. Check at least one unchanged talk page and Stars for regressions.
- Verify headings, internal links, resources, keyboard focus, horizontal overflow, console errors, and JavaScript output. Keep Astro pages static unless a feature needs hydration.
- Record checks and evidence limits in the pull request. Screenshots do not prove screen-reader support or live video playback.

## Account quota use

- Keep one concern per coordinator phase. At a natural gate, retain a short handover with the exact head, changed files, check results, open processes, limits, and next step. Prefer a fresh context for a new phase. Aim to hand over or compact before active input grows past 80,000 tokens when its size is available.
- Start a subagent only for a distinct deliverable that saves total work. Give it a short task brief, file ownership, and exact references. Use no inherited chat history by default. Follow project model rules. End the agent after its result; do not send acknowledgement-only follow-ups.
- Batch independent reads and searches. Use narrow searches, then 40–80 lines. Do not reread unchanged files. Filter structured tool results before printing. Aim for at most 2,000 output tokens per inspection; expand only for evidence needed to decide the next action.
- Start a long command once. Use its completion event or a bounded wait instead of repeated status calls. Do not inspect the same unchanged status through several tools. Keep required user progress reports concise.
- Finish code, tests, benchmark evidence, and result notes before final validation. Keep one build owner. Agents run focused checks; the coordinator runs each required combined profile once on the final source. Repeat only after a relevant change, failure, or unresolved concern. Project check requirements still apply.
- Use Standard speed unless the user requests a faster tier. Keep required tests, approval controls, and model choices. Do not treat cached tokens as free quota or claim an exact quota saving from token counts.
