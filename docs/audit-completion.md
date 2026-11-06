# Website audit fixes

This closes the implementation work from the 6 November 2026 design and technical audits. It keeps the accepted homepage, shared navbar, name visibility rule, and existing harbour scene. The result is a local proposal for author review. Merge and deployment are separate decisions.

## Fixes

| Item | Result | Evidence |
| --- | --- | --- |
| R01: Radar history | Back and Forward preserve each topic's query, language, status and page. An outgoing page cannot change the destination URL. | Browser regressions cover cross-topic, paginated and query-only history at phone and desktop widths. |
| A04: Talks load cost | The same globe maps have phone and desktop sizes. The initial view still shows Paris, Hong Kong and Salt Lake City from above the North Pole. | Asset hashes, byte budgets, before/after resource records and rendered comparisons. |
| A05: Languages | Session, notes and slides have separate fields. The author confirmed French for OWASP Paris and AWS Summit Paris; English for both KubeCon talks and Wiz. Chinese slides are marked as an automatic translation. | Author reply, original notes and slide sources, static output and topic tests. |
| A07: Topics | Subjects, tools and events have separate groups. Supply chain resolves to Software supply chain security. The old URL still works and contains the full related talk set. | All 16 existing topic routes remain. Alias and search tests check the combined set. |
| A09: Projects | Each project has a useful detail beyond its short Home description. | Public project documentation is linked in `src/data/project-details.ts`. |
| A13: Artwork | Phones use smaller copies of the same harbour scene and Scanner icon. Static pages and reduced-motion views skip the footer motion stylesheet. | Source checksums, responsive image checks, normal/reduced-motion browser checks. |
| A19: Resume | Speaking and project entries link to existing evidence. | Native links, heading checks and rendered page review. |
| A14: Caching | Only fingerprinted Astro assets and optimized images have one-year immutable caching. HTML and mutable original images retain revalidation. | Local Wrangler HTTP headers in `output/audit-completion/cache-headers.json`. Production verification needs an authorized release. |
| A15: Video | A keyboard-accessible button loads the player on request. A native source link works without JavaScript. | No provider request before activation; Enter/Space, focus, transition and player-ratio checks. Separate live playback evidence is recorded. |
| Singular counts | A one-item list says “1 repository” in its heading, description and summary. | Static and browser checks, including the no-JavaScript fallback. |
| Large text | The site name and long headings wrap at narrow widths. The video placeholder grows with its text. | 320-pixel synthetic 200% text checks. These do not claim native browser zoom or OS text-size coverage. |
| Review workflow | Pull requests can target stacked branches. Manual runs require an explicit base, and the workflow records exact revisions. | Local shell fixtures cover invalid refs, mismatched revisions and self-comparisons. GitHub Actions stays disabled at the author's request. |

## Asset measurements

Fresh local Chromium contexts compare the previous proposal with this implementation. At 390 pixels and device scale factor 1, initial Talks resources fall from about 4.17 MB to 1.20 MB. The four globe maps fall from 2,581,194 to 125,170 bytes. Desktop maps total 429,844 bytes. The 640-pixel harbour copy is 68,070 bytes; the original is 451,772 bytes. All are derived from the checked-in originals.

These are uncompressed local resource body sizes, excluding the HTML navigation body. They are not production transfer sizes, field speed scores or a claim about a physical phone. Device scale factor 3 also selects a suitable larger harbour copy. Three.js remains part of the interactive globe.

Evidence: `output/audit-completion/asset-measurements.json`, `compare-talks-390.png`, `compare-talks-1440.png`, `compare-home-390.png` and `compare-home-1440.png`. The layout and geographic orientation remain the same in the comparisons.

## Validation and review controls

The final gate is `npm run review:site -- --base origin/codex/fix-site-navigation-and-scenery`. It runs type, build, unit, static-output, whitespace and Chromium checks against the actual PR target. The report records the source hash and working-tree state. If it runs before commit, `commit-binding.json` must bind that same hash to the clean committed revision. Exact revisions and report paths belong in PR 38.

The browser suite covers Home, KubeCon, Blog, an unchanged talk and Stars at phone, tablet and desktop widths. Further checks cover navigation, search, Radar history, globe anchors, wide scenes, large text and video activation. The full-route crawl checks all 70 generated pages at phone and desktop widths. WebKit and Firefox evidence is separate under `output/audit-completion/cross-browser/`; initial failed captures are retained with the corrected checks.

The shell script is now one fingerprinted module. The Stars HTML limit stays at 60,000 bytes. Tests still enforce static output, publication rules, metadata, resources and structure. Browser checks wait for visible navigation links and the selected responsive image to finish loading before they inspect these states. This fixes capture timing without removing assertions.

## What remains outside local proof

- The author must review the edited copy and proposed illustrations. Passing tests do not give author approval.
- A physical phone, installed Safari, a screen reader and native text zoom still need manual checks. Playwright WebKit is not a claim about an iPhone or the installed Safari app.
- One recorded YouTube playback check succeeded. This does not prove every provider or recording will always play.
- GitHub Actions remains disabled by explicit request. No remote CI result is claimed.
- PR 38 is stacked on PR 37. Neither merge nor deployment is authorized. Production cache headers must be checked after an authorized release.

No new blog post, personal fact or achievement was invented. Existing footer artwork was resized, not replaced.
