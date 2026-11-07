# Website audit fixes

This records the implementation work from the 6 November 2026 design and technical audits. It keeps the accepted homepage, shared navbar, name visibility rule, and existing harbour scene. The result is a local proposal for author review. Merge and deployment are separate decisions.

## Current status

All 19 items have implementation changes. Thirteen have passed local checks, and the author approved A08 and A19 ("8,19: Good"). The author also confirmed that the globe and loading look good on their phone and requested closure of A02 and A04. Only A05 (screen-reader pronunciation) and A14 (production caching/navigation after release) remain open.

| Item | Implementation and local evidence | Status and remaining work |
| --- | --- | --- |
| A01: Menu focus | Visible controls form the focus loop. Home and inner-page checks cover forward/reverse wrap and Escape. The extra inner-page checks passed after Astro navigation at 390 and 767 pixels. | Local checks passed. |
| A02: Globe gestures | Touch input waits for horizontal intent. Vertical gesture and city-anchor checks passed in Chromium emulation. | Closed: the author confirmed the globe works well on their phone and requested closure after testing candidate `d260f775ee52167b8fc28ad164584b109c556a0d`. |
| A03: Resume search | Search uses the structured resume data. Terraform, Equativ and Procurify queries, existing results, filters and history were checked. | Local checks passed. |
| A04: Talks load | Smaller maps reduce local resource bytes. Rendered checks preserve the three cities, initial view, fallback and anchors. | Closed: the author confirmed loading looks good on their phone and requested closure on the same candidate. This is user acceptance, not a timed performance benchmark. |
| A05: Language markup | French text has language markup. Session, notes and slides use separate fields with the author-confirmed languages. | Open: verify French pronunciation with a screen reader. |
| A06: Search fallback | Controls stay disabled until search starts. Native browse links remain available. Disabled JavaScript and forced initialization failure checks passed. | Local checks passed. |
| A07: Talk subjects | Supply-chain subjects share a collection. Subjects, tools and events have separate groups. Existing topic routes and search were checked. | Local checks passed; labels remain part of the overall author review. |
| A08: Talk copy | The edit proposal reduces repetition, uses distinct takeaways and labels the AWS abstract accurately. Existing titles and resources remain. | Author approved on 6 November 2026. |
| A09: Project detail | Each project has useful detail from linked public project documentation. Actions and destinations were checked. | Local checks passed; content remains part of the overall author review. |
| A10: Phone talk layout | The phone globe frame and gaps use less height. Narrow layouts, labels and talk rows were inspected. | Local checks passed; the size remains a design choice for author review. |
| A11: Topic hierarchy | Topic pages use a short Talks section label and compact talk titles. Headings and narrow layouts were checked. | Local checks passed. |
| A12: Skip link | The shared link is clipped until keyboard focus and moves focus to main content. A later fix prevents off-screen paint during elastic scrolling. | Local keyboard, navigation and hidden-paint checks passed; native phone overscroll is not simulated. |
| A13: Artwork delivery | Smaller copies of the same artwork serve phone widths. Wide views and normal/reduced-motion resource behavior were checked. | Local checks passed. |
| A14: Asset caching | Local Wrangler checks confirm immutable caching for fingerprinted assets and revalidation for HTML and mutable images. | Open: verify live headers and navigation after a separately authorized release. |
| A15: Video activation | The player loads on request. Pointer, keyboard, focus and native fallback checks passed. One live YouTube recording played. | Local activation checks passed. The playback check does not prove every provider or recording. |
| A16: Repository labels | All 22 categories have clear labels and short descriptions, shared by the topic directory, category pages, Radar and search. Safe wallet services and unsorted bookmarks have explicit names. Slugs, counts and saved repository records stay unchanged. | Local checks passed: all 22 descriptions, category links and counts, phone/tablet/desktop layouts, and native links without JavaScript. |
| A17: Empty Blog search | Search no longer promises articles when the Blog has no published posts. Draft and future-post filters remain. | Local checks passed. |
| A18: About links | Descriptions now match Projects and Talks. Existing sections and destinations remain. | Local checks passed; copy remains part of the overall author review. |
| A19: Resume copy | Completed-role verbs use past tense. Speaking and project entries link to existing evidence. | Author approved on 6 November 2026. |

**New follow-up G01:** The user reported uneven white backgrounds around the globe city labels. The label backgrounds now use measured text and flag bounds with even padding. Chromium, WebKit and Firefox checks cover font loading, resize, drag and anchors. A separate flag span preserves the emoji when the city text uses a halo. Geometry and focused visual checks passed; this remains local browser evidence. Track it separately from A16 and the original audit items.

## Responsive recheck follow-ups

These three items come from the later all-page responsive recheck. They are separate from the original 19 items and the earlier Radar history fix.

| Item | Change | Status and local evidence |
| --- | --- | --- |
| R01: Phone globe labels | At phone widths, city labels use 16 SVG units, about 12.4 CSS pixels in the existing 280-pixel globe. The halo, flags, city links and tap circles remain. | Fixed. Chromium, WebKit and Firefox checks pass at 320–1440 pixels, including the 600/601-pixel change. Labels remain in view with no overlap, and all three keyboard links work. No-JavaScript captures pass. The author has since closed A02/A04 after their phone test. |
| R02: Search empty text | The All filter says “No matches found. Try another word.” A narrower type can also suggest choosing All. The empty Blog message remains separate. | Fixed. Unmatched All/project queries, filter changes, the no-posts state and return to matching results pass in all three browser engines. Search history is also covered by the final combined review. |
| R03: Audit status | A08/A19 now record the author's approval. A02/A04 now have phone acceptance; only A05/A14 remain open from the original audit. | Fixed. A08/A19 approval, A02/A04 phone acceptance and the two remaining checks are recorded here. The original audit and PR 38 receive the final report and source identity. |

The navbar, footer, artwork, article text and author-content files are unchanged by these follow-ups. Focused evidence is saved in `output/responsive-small-fixes/`; the required final combined report and exact source identity are recorded in PR 38 and the original audit file. A prior report does not validate later source.

## Phone acceptance and skip-link follow-up

The author tested the local phone preview of `d260f775ee52167b8fc28ad164584b109c556a0d` and said: “the globe and loading look good on my phone.” They explicitly requested closure of A02 and A04. Device model, OS, browser version and load timings were not supplied; do not infer them or claim coverage of other devices.

The author also reported “Skip to content” appearing above the navbar during scrolling. The link had been moved above the page with a transform. It now stays visually clipped and transparent until keyboard focus, so exposing the page edge cannot reveal it. The native anchor, focus outline and main-content destination remain. The navbar and footer design are unchanged. Focused evidence is in `output/skip-link-fix/`; a synthetic page displacement checks the paint boundary but does not claim to reproduce native iOS elastic scrolling.

Focused checks cover 27 cases in Chromium, WebKit and Firefox: hidden paint when the page is displaced, visible keyboard focus, activation, hiding after activation, client navigation, phone/desktop widths and no JavaScript. WebKit uses its Option-Tab link-navigation shortcut. The native phone gesture itself remains outside these automated checks.

The font check found the same loaded fonts on Home, Talks and Projects, including after client navigation: Fraunces headings and Space Grotesk body text. Home's title uses weight 600; interior titles use 500. The Home introduction is also larger. These style differences explain the visual change; no font or typography rule was changed in this follow-up.

## Motion and text follow-up

The author requested two small motion effects and the proposed text edits, with the shared navbar and footer unchanged.

- Selecting a globe city gives its matching talk a soft blue highlight that fades after 2.4 seconds. Selecting the same city replays the cue. The native anchor and keyboard focus remain. Reduced motion uses a steady highlight; native links also work without JavaScript.
- The existing 404 illustration gently rocks once for 2.2 seconds, then stops. It stays still with reduced motion. No artwork was created or replaced.
- The Home hero and About introduction name Procurify as the current employer, as requested by the author and already recorded in the resume. About and the secondary project descriptions use simpler text. The Home statement, Projects heading, talk records, resource links, metadata and article text remain.

Focused browser evidence is in `output/playwright/motion-copy/`. It covers city selection, repeated selection, keyboard focus, history, reduced motion, the 404 home link and no-JavaScript behavior. The final combined review and its commit binding are recorded in PR 38 and the current-status section of the original audit. Earlier phone acceptance remains tied to its tested candidate; it is not a claim that the new motion was tested on that phone. A05/A14 remain open.

## Evidence and final validation

The pre-fix responsive review is in `output/responsive-recheck-2026-11-06/`. It covers candidate `89ef4035cefb6b9cd2abddb8098fc1f8f29ed25f`, with 280 Chromium views across 70 routes, 40 focused WebKit/Firefox views and 23 interaction checks. It identified R01–R03 above; it is not proof of the later fixes.

Fresh focused evidence for these fixes is in `output/responsive-small-fixes/`: phone label comparisons, three-engine views, native city links, filter-specific empty messages, the no-posts state and return to results. The final combined review runs on the finished source. Its exact base, candidate, source hash, working-tree state and commit binding are recorded in PR 38 and the current-status section of the original audit. A report from a dirty working tree is not proof for its HEAD alone.

Earlier implementation evidence remains in `output/audit-completion/`, `output/a16-category/`, `output/a16-globe/`, `output/interior-headers/` and `output/talks-about/`. Each result retains its original source identity.

GitHub Actions stays disabled at the author's request. No merge, deployment or publication is authorized. A08 and A19 are approved; other copy and design review remains separate. Browser emulation does not prove physical-phone behavior, screen-reader output, native zoom or installed Safari behavior.

## Fixes

| Item | Result | Evidence |
| --- | --- | --- |
| Radar history (earlier follow-up) | Back and Forward preserve each topic's query, language, status and page. An outgoing page cannot change the destination URL. | Browser regressions cover cross-topic, paginated and query-only history at phone and desktop widths. |
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

## Project labels and video follow-up

Home and Projects now use the same project-type captions: “macOS app”, “Web app”, and “Weather website”. These replace the mixed platform, readiness, and country labels. Descriptions, project links, layout, navbar, and footer stay the same.

The extra provider link below the talk player is removed. With JavaScript disabled, a native “Watch on YouTube” or “Watch on Vimeo” link appears inside the placeholder. The original video URLs also remain in Sources and resources. The browser checks require the extra link to be absent during normal activation and require a visible, keyboard-focusable fallback without JavaScript. Video loading and focus checks remain in place.

The source-bound result and rendered previews are recorded in the follow-up PR and `output/project-labels/review.md`. A05 and A14 retain their existing status; these presentation edits do not close them.

## SEO follow-up

The first five SEO improvements are implemented. The visible page content, design, navbar, and footer stay the same. Search Console is deferred until after release.

| Item | Change | Acceptance check |
| --- | --- | --- |
| SEO01: Topic alias | `/topics/supply-chain/` remains accessible and points search engines to `/topics/software-supply-chain-security/`. Metadata and structured data use that preferred URL. | The sitemap contains the preferred URL and excludes the alias. Existing links and talk content remain available. |
| SEO02: Empty Blog | The Blog uses `noindex, follow` until it has a published post. The sitemap follows the rendered robots and canonical tags. | Empty and draft/future-only fixtures exclude the Blog. A published-post fixture includes the Blog and article. No draft route, text, or sharing image is emitted. |
| SEO03: Search descriptions | Home and About name the current Procurify role. Projects describes the current side projects. | Meta descriptions, social descriptions, and page structured data agree. Visible copy is unchanged. |
| SEO04: Current employer | Person structured data includes `worksFor: Procurify`. | The employer and job title agree across all generated pages. |
| SEO05: Sharing cards | Each canonical page gets a 1200 × 630 PNG card with its own title and description. The topic alias shares the preferred page's image. | OG, Twitter, and article image URLs agree. Every referenced image exists, has the correct dimensions, and has distinct content for distinct pages. |

Cards use build-only copies of the site's licensed Fraunces and Space Grotesk fonts. Satori embeds their outlines; Sharp writes the PNG files. These dependencies add no browser code. The compatible `satori` → `fflate` override uses patched version 0.7.5. It is separate from the existing `postcss-selector-parser` override.

The existing publication filter remains authoritative. The new tests cover the three publication states, intentional canonical alias, employer data, and generated sharing assets. The combined review still checks the original site contracts. The canonical test names the one allowed alias and explicitly rejects its sitemap entry. Image-size assertions now require 1200 × 630. The publication fixture clears the inherited Node test-runner context and requires a positive test count; previously the nested runner could skip its files and return success.

The final combined report and source binding are recorded in PR 38. `output/seo-improvements/review.md` records the local result, comparison with the preceding candidate, card previews, and limits. Local metadata checks do not prove indexing, search rankings, or how a third-party service caches a preview.

A05 and A14 remain open. After an authorized release, verify the live canonical tags, sitemap, robots tags, and sharing-image responses, then set up Search Console and submit the sitemap. No release, remote CI, or indexing result is claimed here.

## Asset measurements

Fresh local Chromium contexts compare the previous proposal with this implementation. At 390 pixels and device scale factor 1, initial Talks resources fall from about 4.17 MB to 1.20 MB. The four globe maps fall from 2,581,194 to 125,170 bytes. Desktop maps total 429,844 bytes. The 640-pixel harbour copy is 68,070 bytes; the original is 451,772 bytes. All are derived from the checked-in originals.

These are uncompressed local resource body sizes, excluding the HTML navigation body. They are not production transfer sizes, field speed scores or a claim about a physical phone. Device scale factor 3 also selects a suitable larger harbour copy. Three.js remains part of the interactive globe.

Evidence: `output/audit-completion/asset-measurements.json`, `compare-talks-390.png`, `compare-talks-1440.png`, `compare-home-390.png` and `compare-home-1440.png`. The layout and geographic orientation remain the same in the comparisons.

## Validation and review controls

The final gate is `npm run review:site -- --base origin/codex/fix-site-navigation-and-scenery`. It runs type, build, unit, static-output, whitespace and Chromium checks against the actual PR target. The report records the source hash and working-tree state. If it runs before commit, `commit-binding.json` must bind that same hash to the clean committed revision. Exact revisions and report paths belong in PR 38.

The browser suite covers Home, KubeCon, Blog, an unchanged talk and Stars at phone, tablet and desktop widths. Further checks cover navigation, search, Radar history, globe anchors, wide scenes, large text and video activation. The full-route crawl checks all 70 generated pages at phone and desktop widths. WebKit and Firefox evidence is separate under `output/audit-completion/cross-browser/`; initial failed captures are retained with the corrected checks.

The shell script is now one fingerprinted module. The Stars HTML limit stays at 60,000 bytes. Tests still enforce static output, publication rules, metadata, resources and structure. Browser checks wait for visible navigation links and the selected responsive image to finish loading before they inspect these states. This fixes capture timing without removing assertions.

## What remains outside local proof

- A08 and A19 have author approval. Other copy and proposed illustrations remain subject to author review; passing tests do not give that approval.
- A02/A04 are closed from the author's phone report. A05 still needs a screen-reader check. Other devices, native text zoom and installed browser versions are not covered by that acceptance or by Playwright.
- One recorded YouTube playback check succeeded. This does not prove every provider or recording will always play.
- GitHub Actions remains disabled by explicit request. No remote CI result is claimed.
- PR 38 is stacked on PR 37. Neither merge nor deployment is authorized. Production cache headers must be checked after an authorized release.

No new blog post, personal fact or achievement was invented. Existing footer artwork was resized, not replaced.
