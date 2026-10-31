# AI work and human review

AI can complete a scoped technical task, fix failures, and prepare a pull request. The author controls personal claims, editorial choices, publication, merge, and deployment.

## Start with a task contract

State the result, allowed changes, protected content, required checks, limits on time or attempts, and stopping condition. For example:

> Fix horizontal overflow on talk pages. Preserve article text, resource URLs, typography, and the current layout. Produce a PR with the site review package. Continue routine fixes within this scope. If a content or design decision is needed, report it with the evidence. Stop before merge or deployment.

Use one concern per PR. Reuse the existing components and design tokens. A separate reviewer is useful only when it adds a distinct result.

## Keep writing author-led

The author writes the first blog draft. AI can check examples, sources, spelling, structure, links, and rendering. Return suggested edits separately unless the author asks for edits in the file. Keep the original wording available in the diff. Do not turn missing facts or opinions into invented prose.

A draft stays `draft: true` until the author requests publication. Publication also needs a valid `publishDate`. A future date on this static site needs a new build on or after that date. Do not publish an outline or synthetic test content.

## Generate review evidence

Use Node.js 22.12 or later and npm:

```bash
npm ci
npx playwright install chromium
git fetch origin
npm run review:site -- --base origin/main
```

The base ref resolves to a full commit before work starts. Use the intended target revision. The command checks whitespace across the base-to-HEAD diff and in local working-tree and staged changes, then runs `check:site`, `build`, and `test:site` once on the candidate. The publication tests make three additional builds in an isolated copy: empty, unpublished, and mixed content. These fixtures never enter the author's posts or the candidate output.

The command extracts the base with `git archive`, installs its locked dependencies, and builds it in a temporary directory. It compares that output with the candidate using the same browser, fonts, viewport sizes, locale, time zone, and reduced-motion setting. The temporary baseline is removed when the command ends. The candidate output stays in `dist/`.

Review packages have a unique directory under `artifacts/site-review/`:

| File | Purpose |
| --- | --- |
| `review.html` | Image pairs for Home, KubeCon NA 2024, Blog, AWS Summit Paris 2025, and Stars at 390, 768, and 1440 pixels |
| `summary.md`, `report.json` | Revisions, source hash, working-tree state, check results, changed files, human-review paths, and limits |
| `text-and-links.diff` | Changes to rendered main text, exact code-block text, links, metadata, and structured data across all built pages |
| `base/`, `candidate/` | Output snapshots, JavaScript asset sizes, screenshots, and browser results; candidate traces include each route and viewport |
| `*.log` | Output from each command, including a failed command |
| `preview/` | Candidate static output for local review |

Open `review.html` in a browser. To view the candidate site with its absolute asset paths, serve `preview/` from a local HTTP server. For example, replace `PACKAGE` with the generated package directory:

```bash
python3 -m http.server 4321 --directory PACKAGE/preview
npx playwright show-trace PACKAGE/candidate/home-390.zip
```

The browser checks one H1, heading order, IDs, local anchors, horizontal overflow, console errors, local HTTP failures, the skip link and its focus outline, search open/query/close behavior (Escape can first clear the native search field), and static talk links without JavaScript. They reject unexpected Astro islands on the tested routes. A feature that needs hydration must make that exception explicit in review.

Review all visible differences. There is no automatic visual-baseline acceptance. The JavaScript inventory records asset bytes on disk; it does not measure network transfer or inline script bytes. The text diff covers generated public pages, so unpublished prose stays out of it. It preserves code-block indentation, tabs, blank lines, and trailing spaces in a separate `codeBlocks` field. Prose whitespace is normalized. Changed-file lists use NUL delimiters so filenames with accents, spaces, tabs, or newlines reach the human-review classification intact.

## Interpret results

A clean working tree ties the report to the recorded candidate commit and source hash. A dirty working tree is marked as such; HEAD alone does not identify that source. The runner fails if source or working-tree state changes during validation. Any later source edit requires a new run.

Checks stop at the first failed command. Later checks are not run. Baseline browser findings are recorded for comparison; candidate failures block a passing result. A report can pass while still listing paths that need author review. Path flags are advisory and do not prove the absence of personal claims elsewhere.

External requests, including video embeds, are replaced with empty responses. Live playback and external destinations are not checked. Browser evidence uses Chromium and reduced motion. It does not prove other browsers, full-motion behavior, touch input, or screen-reader support.

## CI and approval

The `Site review` workflow checks the exact PR head against its event's base commit. It uses Node.js 22, read-only repository permissions, and no saved checkout credentials. It uploads evidence for 14 days even after failure. It does not publish a preview, post comments, merge, or deploy. Existing Cloudflare deployment behavior is unchanged.

After the workflow has run, the repository owner can make `Site checks and review evidence` a required branch check and set a human merge rule that fits the account setup. Adding this workflow does not configure GitHub branch protection. Rerun against the new target revision if the base changes. CI results and checks are review evidence; author approval remains separate.

Changes to author content, publication filters, schema, blog routes, layouts, tests, workflows, and agent rules are listed for human review. These include changes to the controls themselves. Do not weaken checks, change expectations, or treat an agent-authored approval flag as proof of human approval.

The PR must state the result, report link, exact revisions, check results, open decisions, and evidence limits. At a handover, also record changed files, open processes, and the next step. Stop before merge, deployment, and publication unless the author has requested that action.
