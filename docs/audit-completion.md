# Website audit fixes

This records the implementation work from the 6 November 2026 design and technical audits. It keeps the accepted homepage, shared navbar, name visibility rule, and existing harbour scene. The result is a local proposal for author review. Merge and deployment are separate decisions.

## Current status

All 19 items have implementation changes. Thirteen have passed local checks; six still need a specific author, device, screen-reader or live check. These counts do not mean that all items are closed.

| Item | Implementation and local evidence | Status and remaining work |
| --- | --- | --- |
| A01: Menu focus | Visible controls form the focus loop. Home and inner-page checks cover forward/reverse wrap and Escape. The extra inner-page checks passed after Astro navigation at 390 and 767 pixels. | Local checks passed. |
| A02: Globe gestures | Touch input waits for horizontal intent. Vertical gesture and city-anchor checks passed in Chromium emulation. | Open: confirm scrolling, rotation and city taps on a physical phone. |
| A03: Resume search | Search uses the structured resume data. Terraform, Equativ and Procurify queries, existing results, filters and history were checked. | Local checks passed. |
| A04: Talks load | Smaller maps reduce local resource bytes. Rendered checks preserve the three cities, initial view, fallback and anchors. | Open: check responsiveness on a physical phone. Local byte sizes are not field performance. |
| A05: Language markup | French text has language markup. Session, notes and slides use separate fields with the author-confirmed languages. | Open: verify French pronunciation with a screen reader. |
| A06: Search fallback | Controls stay disabled until search starts. Native browse links remain available. Disabled JavaScript and forced initialization failure checks passed. | Local checks passed. |
| A07: Talk subjects | Supply-chain subjects share a collection. Subjects, tools and events have separate groups. Existing topic routes and search were checked. | Local checks passed; labels remain part of the overall author review. |
| A08: Talk copy | The edit proposal reduces repetition, uses distinct takeaways and labels the AWS abstract accurately. Existing titles and resources remain. | Open: the author must accept the edited copy. |
| A09: Project detail | Each project has useful detail from linked public project documentation. Actions and destinations were checked. | Local checks passed; content remains part of the overall author review. |
| A10: Phone talk layout | The phone globe frame and gaps use less height. Narrow layouts, labels and talk rows were inspected. | Local checks passed; the size remains a design choice for author review. |
| A11: Topic hierarchy | Topic pages use a short Talks section label and compact talk titles. Headings and narrow layouts were checked. | Local checks passed. |
| A12: Skip link | The shared link appears on first focus and moves focus to main content. Extra phone checks passed after Astro navigation. | Local checks passed. |
| A13: Artwork delivery | Smaller copies of the same artwork serve phone widths. Wide views and normal/reduced-motion resource behavior were checked. | Local checks passed. |
| A14: Asset caching | Local Wrangler checks confirm immutable caching for fingerprinted assets and revalidation for HTML and mutable images. | Open: verify live headers and navigation after a separately authorized release. |
| A15: Video activation | The player loads on request. Pointer, keyboard, focus and native fallback checks passed. One live YouTube recording played. | Local activation checks passed. The playback check does not prove every provider or recording. |
| A16: Repository labels | All 22 categories have clear labels and short descriptions, shared by the topic directory, category pages, Radar and search. Safe wallet services and unsorted bookmarks have explicit names. Slugs, counts and saved repository records stay unchanged. | Local checks passed: all 22 descriptions, category links and counts, phone/tablet/desktop layouts, and native links without JavaScript. |
| A17: Empty Blog search | Search no longer promises articles when the Blog has no published posts. Draft and future-post filters remain. | Local checks passed. |
| A18: About links | Descriptions now match Projects and Talks. Existing sections and destinations remain. | Local checks passed; copy remains part of the overall author review. |
| A19: Resume copy | Completed-role verbs use past tense. Speaking and project entries link to existing evidence. | Open: the author must accept the copy. |

**New follow-up G01:** The user reported uneven white backgrounds around the globe city labels. The label backgrounds now use measured text and flag bounds with even padding. Chromium, WebKit and Firefox checks cover font loading, resize, drag and anchors. A separate flag span preserves the emoji when the city text uses a halo. Geometry and focused visual checks passed; this remains local browser evidence. Track it separately from A16 and the original audit items.

## Evidence and final validation

The previous complete review covers base `a722020063ca7eb135f496b4aff8dfc5715f135d` and candidate `4bc1e1677273c1e66ed3337859e27e744eb80f8a`. Report: `artifacts/site-review/2026-11-06T22-13-25.733Z-6dbc1714`. Source SHA-256: `08d8fbc434fbdf00e9e59b363cd2a8256d8e039cd2b8d41fe37c4ef94f7c72f5`. The report ran from a dirty working tree; `commit-binding.json` binds the same source hash to that clean candidate. It records passing type, build, whitespace and test checks: 86 tests and 38 Chromium checks. A separate route crawl passed for 70 routes and 140 views. Extra A01, A06 and A12 checks are in `output/audit-completion/exact-audit-followup.json`.

The previous report proves that candidate only. A16 checks are in `output/a16-category/checks.json` (22 categories and 12 page views); G01 measurements, images and limits are in `output/a16-globe/`. The required combined review runs again on the final source before commit. Its exact report, source hash and commit binding are attached to PR 38 and the current-status section of the original audit. Do not use the previous report as proof for later source.

GitHub Actions stays disabled at the author's request. No merge, deployment or publication is authorized. Author review of the copy and design remains open. Browser emulation does not prove physical-phone behavior, screen-reader output, native zoom or installed Safari behavior.

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
