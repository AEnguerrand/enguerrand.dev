# Redesign visual QA

final result: passed

## Talks and About follow-up — 6 November 2026

The author requested these pages in the same approved style, with the shared navbar and footer unchanged. This pass carries the selected 404/Radar direction into the existing page layouts. It keeps the globe, portrait, biography, talk records, resources and metadata. The result is local implementation and a draft PR update; merge and deployment remain outside scope.

### Visual references and evidence

- Style references: the selected `output/interior-headers/option-1.png`, the accepted Home capture in `artifacts/site-review/2026-11-06T23-52-04.240Z-1cc8c23c/candidate/home-1440.png`, and `output/interior-headers/compiled/chromium-radar-1440.png`.
- Source captures: `output/talks-about/before-{talks,about}-{390,768,1440}.png`, from the built candidate `5f01f82863452a4e6819d4c9e3da404dcd1a5d0b`.
- Revised captures: `output/talks-about/dev/chromium-{talks,about}-{390,768,1440}.png`. Matched before/after comparisons use `compare-{talks,about}-{390,768,1440}.png`, with the source on the left. The phone comparisons show the portrait, title, biography and links at readable size.
- `style-comparison.png` contains Home and Radar above revised Talks and About. This checks the shared visual language; the four pages do not have identical content or structure.
- CSS viewports are 390 × 900, 768 × 900 and 1440 × 900, device scale factor 1, pale theme, initial loaded state and reduced motion. Full-page heights vary with content. Desktop panels are downsampled to 720 pixels; other panels retain their capture width. `comparison-dimensions.json` records exact source/output sizes. Final built captures use the same checks and comparison under `output/talks-about/compiled/`.

### Findings and corrections

- Resolved P2: Talks placed the newest year beside the globe and older years across the full page, so the reading column jumped left. All years now share one left column, with the globe on the right. Dates, titles, events and native city anchors are preserved.
- Resolved P2: About separated the portrait from its introduction and used a tall portrait block before the phone biography. The desktop portrait now begins beside the heading. The phone portrait is a small framed image beside the short heading; the biography uses the full width below it.
- Resolved P2 during verification: the first new Talks layout used a sticky globe. A jump to an older talk reached the sticky container boundary and clipped the globe. The final globe uses normal document flow. All city targets receive focus and remain visible. `first-pass/` retains the initial captures; `dev/` records the correction.
- The initial source-capture script waited for a hidden, lazy globe fallback image that is not painted while WebGL is active. The capture now decodes only displayed images and separately waits for the lazy harbour. No product loading behavior was changed.
- No actionable P0, P1 or P2 findings remain in the inspected states.

### Fidelity, content and interaction

- Typography and spacing: existing Fraunces headings, Space Grotesk body, compact sizes, open rows and thin timeline separators remain. Both year headings have the same left edge at every checked width. Long titles and event names wrap without horizontal overflow.
- Color and surfaces: the existing pale blue, navy ink, blue links, cream portrait frame, subtle shadow and restrained focus/hover styles remain. No new card system, scenery, footer art or illustration asset was introduced.
- Images and icons: the same polar globe, geographic assets, labels, flags and portrait are reused. Paris, Hong Kong and Salt Lake City remain visible initially. Label-background bounds pass. Existing Phosphor icons and the real portrait remain; no generated person or approximate image substitute was added.
- Copy: the original About headline moves to the description beneath “About me”. All three biography paragraphs are unchanged. The project row becomes “Side projects” with “Software I build outside work.”, matching the author's broader project scope. A short globe instruction explains the existing city links. Talk copy, event records, URLs, dates, languages, structured data and the approved A08/A19 text remain unchanged.
- Function: city links work with keyboard focus on the matching talk. The complete globe can be brought into view on a short screen by scrolling. Résumé and project links work by keyboard. Native links remain without JavaScript. No new client script or Astro island is added.
- Motion: the About biography becomes visible with normal motion. The existing portrait straightens when a link receives focus. At reduced motion, it has no transform or transition. Tests cover 390 and 1440 pixels.

### Checks and limits

`output/talks-about/dev/checks.json` records 30 views: Chromium at 320, 390, 600, 700, 701, 768, 850, 851, 916, 1440 and 2560 pixels; WebKit and Firefox at 390 and 1440. They pass heading order, single H1, no horizontal overflow, displayed local images, no page errors, globe labels and aligned years. Ten additional flows cover city anchors, a short viewport, About actions, no JavaScript and synthetic 200% text. `motion.json` adds four normal/reduced-motion states. At phone widths, the biography begins before 360 CSS pixels.

The combined review records final-source validation separately. Its exact revisions, hash, clean-commit binding and final built-page checks are attached to the PR. Physical touch, installed Safari, native zoom, screen-reader output and production behavior remain outside this evidence. A02, A04, A05 and A14 stay open; Actions stays disabled. This pass does not change checks, publication rules, workflow permissions, shared shell files or author-content files.

## Selected 404 and Radar headers — 6 November 2026

The author selected the first displayed option and explicitly kept the shared navbar and footer. This pass changes the 404 introduction and opts Radar into a larger illustration layout. Existing page typography, the homepage, navigation, harbour artwork, article copy and saved bookmark data are protected. Completion requires the local visual review, the combined site checks and a draft PR update. Merge and deployment are outside this task.

### Visual target and capture conditions

- Selected source: `output/interior-headers/option-1.png`, copied from `/Users/enguerrandallamel/.codex/generated_images/01a1af32-8cfe-71b1-bd1b-c62576149af9/exec-7e01b70a-7233-4761-a2ff-9f75cdfff318.png`.
- The source is 1374 × 1145 pixels with two content-only excerpts. It has no browser frame, navbar or footer. Its design-board captions are not website content.
- Implementation: `output/interior-headers/dev/chromium-404-1440.png` and `chromium-radar-1440.png`, captured at a 1440 × 900 CSS viewport and device scale factor 1. Full-page heights differ with route content.
- Full-view comparison: `output/interior-headers/dev/comparison-board.png`. Focused comparisons: `compare-404-header.png` and `compare-radar-header.png`. Each puts source on the left and implementation on the right.
- `comparison-dimensions.json` records each crop and scale. Focused source regions are scaled to the site's 1024-pixel content column; implementation header captures are 1024 × 376 pixels, with a 1024 × 280 content crop. The design board is not a full-page height specification. The site's existing 42-pixel desktop H1 and 16-pixel body text take priority over the larger raster mockup text.
- All comparisons use the initial loaded page, pale theme and reduced motion. Full-page captures wait for the existing lazy harbour image. The development toolbar is tooling, not deployed content. The final built output receives a separate capture under `output/interior-headers/compiled/`.

### Findings and comparison history

- Resolved P2: the first implementation gave the illustration 34% of the desktop grid and a 240-pixel image box. Both objects looked too small beside the selected reference. The final layout uses 42% and a 280-pixel box. The 601–900-pixel layout retains a smaller art column. `first-pass/` preserves the initial captures and comparisons; `dev/` contains the revised comparisons and checks.
- No actionable P0, P1 or P2 differences remain in the inspected views. The large illustration layout is opt-in, so other page introductions keep their existing layout.
- A first capture attempt included Astro's development-toolbar headings in a locator. The site heading locator was scoped to `main`. A later capture returned before a lazy footer image loaded. The capture now waits for that image before measurement. These were evidence-collection fixes; neither required product changes.

### Fidelity and behavior

- Typography: existing Fraunces headings, Space Grotesk body, font weights and compact type sizes remain. Text is live HTML. The phone title and description use the full content width.
- Layout: open two-column introductions match the selected direction. On phones, the small illustration sits beside the eyebrow above the title. It does not narrow the description or recovery links. Radar keeps all three signals and the complete bookmark library below the intro.
- Colors and surfaces: existing pale background, navy ink, blue links, button shape and focus styles remain. No new cards, borders, shadows or scenic background were added.
- Artwork: `public/images/illustrations/off-course.webp` is a 1024 × 640 transparent WebP (97,344 bytes). The built-in image generator recreated the selected paper boat, folded map, small mountains, dashed route and blue watercolor pool, with no text or UI. Alpha edges were inspected on the pale background. Original generated file: `/Users/enguerrandallamel/.codex/generated_images/01a1b33e-3b42-7463-a1a9-932db9de7d52/exec-a11687ac-e102-499f-9c4c-b2b7addb118a.png`. Radar reuses the checked-in field guide; the shared harbour source is unchanged.
- Icons: existing Phosphor icons remain. The 404 signpost is replaced by the selected raster illustration. Decorative images have empty alt text; no CSS or SVG art substitutes were introduced.
- Content: the 404 heading is “A little off course.”, with the existing error explanation, Home action and a new native Search link. Page metadata, `noindex`, and the Error 404 eyebrow remain. Radar labels, notes, counts, dates, links and metadata are unchanged.
- Interaction: Home and Search recovery links work; keyboard focus is visible. Radar search opens, finds the KubeCon SLSA talk and closes with Escape. Both pages keep native links without JavaScript. No new hydration or browser script is needed.

### Checks and limits

`output/interior-headers/dev/checks.json` records 24 route views: Chromium at 320, 390, 600, 601, 768, 1024, 1440 and 2560 pixels; WebKit and Firefox at 390 and 1440. All have one H1, no horizontal overflow, loaded local images, no Astro islands and no page errors or failed local assets. Seven additional flow checks cover the two recovery links, Radar search, both pages without JavaScript, and both pages with synthetic 200% text at 320 pixels.

The final combined report validates the completed source separately. Its exact revisions, source hash and post-commit binding are recorded in the PR. No check, publication rule, workflow permission or shared shell file was changed for this pass. GitHub Actions stays disabled.

Headless engines do not prove physical-device behavior, installed Safari, native zoom or screen-reader support. Local preview routing does not prove production HTTP 404 behavior. The audit's four remaining device, screen-reader and production checks remain open. There are no additional design decisions blocking this selected header work.

## Earlier design review

The following sections record the earlier redesign and audit passes. Their evidence and limits keep their original scope.


## Scope and visual references

This is a working design proposal. The accepted homepage is the visual reference. The Projects and Radar concepts set the illustration direction; they are not pixel-exact page specifications. The user requested smaller text and the existing shared navbar and harbour footer. Those requirements take priority over the larger concept type and cropped mockups.

Source captures are in the prior review worktree:
`/Users/enguerrandallamel/.codex/worktrees/site-four-fixes/aenguerrand.github.io/output/design-deep-review/`.

- `analysis/01-home-desktop.png`: accepted homepage.
- `analysis/02-talks-desktop.png`: existing Talks page and accurate globe.
- `concepts/01-projects-workbench.png`: watercolor project objects.
- `concepts/03-radar-field-guide.png`: small field-guide illustration and open rows.

Rendered evidence is in `output/redesign/qa/`. Source and implementation were placed in the same comparison images: `compare-home.png`, `compare-talks.png`, `compare-projects.png`, and `compare-radar.png`. Focused comparisons are `focus-projects.png`, `focus-radar.png`, and `blog-typography-comparison.png`.

## Capture conditions

Chromium, CSS viewports 390 × 900, 768 × 900, and 1440 × 900, device scale factor 1. Captures use full-page height and reduced motion. PNG width therefore equals CSS viewport width. Desktop full-view comparison panels are each scaled to 700 pixels wide. Focused panels crop the implementation's 1024-pixel content column and scale it to 700 pixels. The concepts contain content regions without the shared shell; they are compared for art direction and hierarchy, not absolute page height. Their exact raster dimensions and all evidence dimensions are recorded in `output/redesign/qa/image-dimensions.json`.

The first screenshot pass missed lazy footer images. The affected captures were replaced after scrolling to the image and waiting for it to load. This was a capture issue; no footer source change was needed. External embeds were suppressed in the main capture pass. Isolated article fixtures are clearly marked and never enter the author's posts or candidate output.

## Findings and corrections

- Resolved P2: article headings retained the default heavy, near-black prose style. The shared interior prose rules now use the site ink and heading weight 500. `blog-typography-comparison.png` contains the first and corrected 390-pixel captures. Revised blog and two talk templates were checked at all three widths with no overflow or page errors.
- Resolved P2: repository links inherited a body size despite their heading wrapper. The default list now uses 20-pixel Fraunces at weight 500, matching filtered results. See `output/redesign/library/review.json` and its final captures.
- The first design pass found no further visual defects in its inspected states. A later audit found history and large-text issues; the follow-up fixes and checks are listed in `docs/audit-completion.md`.
- Final static checks also found duplicate Overview IDs and an HTML-size regression. Article headings now use Talk overview; the palette script is bundled once, with compact keyword data. The size limit and structural checks were kept. Final verification is recorded in the combined review package.

## Required design surfaces

- Typography: Fraunces headings and Space Grotesk body text load correctly. Interior H1s use 32–42 pixels; list titles use 20 pixels. Article text uses the shared ink. Long titles wrap without clipping.
- Spacing: open rows, restrained separators and the existing shell remain. The phone globe is smaller, About's photo appears in the first screen, and Project art becomes a compact side illustration. The original full-width hero and harbour remain.
- Colors: pale blue ground, blue links, dark blue ink, and cream paper details match the homepage. No new surface or shadow system was added.
- Images: four transparent WebP illustrations replace the concept art with production assets in the same watercolor direction. The scanner uses generic document-to-PDF imagery, not an invented hardware product. Existing logos, portrait, hero, harbour and accurate globe geography remain.
- Copy: shorter introductions, talk summaries and notes remove repeated wording. Dates, full talk titles, events, authors, languages, resource records, code blocks, résumé facts and Privacy text are preserved. About and Home project/exploration copy also changed. Blog content remains author-led.

## Interaction and responsive evidence

`metrics.json` records 45 initial page views; `metrics-targeted.json` records nine post-fix article views. All have one H1, no horizontal overflow, no visible broken local images and no page errors. Primary states include Home, Projects, Talks, Radar, About, Resume, repository topics/list, talk topics/detail, Search, Blog, Privacy, 404 and an isolated blog article.

Project illustration focus motion moves 4 pixels and rotates 1 degree with normal motion; the computed transform is `none` with reduced motion. Agent evidence under `output/redesign/profile/`, `talks/` and `library/` covers photo focus/reduced motion, globe touch intent and anchor focus, search/palette results, filter/clear/pagination/history, no-JavaScript links and empty/missing-data states. The combined site review supplies final static-build regression evidence and source identity separately.

## Limits and open decisions

This passes local design QA, not author approval. Follow-up checks cover headless WebKit and Firefox, plus one successful YouTube playback. Physical devices, installed Safari, a screen reader and native text zoom remain outside the evidence. External destinations are not covered in full. The blog article is a synthetic layout fixture because the site has no published posts. Remote résumé certification logos are outside the deterministic capture boundary. The author still needs to review the proposed illustrations and copy before merge. No merge or deployment is authorized.

## Implementation checklist

- [x] Compare source and rendered pages together, including focused regions.
- [x] Resolve article typography and repository title mismatches.
- [x] Verify phone, tablet and desktop templates and useful motion states.
- [x] Preserve the homepage, shared navbar design and existing harbour footer.
- [x] Keep synthetic posts outside source and production output.
- [x] Attach the design review package and exact revisions to the draft PR; refresh the evidence binding after each validated implementation change.

## Audit follow-up

Before/after Home and Talks comparisons are in `output/audit-completion/`. The accepted full-width scenes, type, spacing and shared navigation remain. Smaller copies use the original globe, harbour and Scanner assets. Language labels now distinguish notes from speech. The video placeholder grows with enlarged text, and long headings and the site name wrap at narrow widths. The final browser suite checks these cases at 320 pixels. Initial cross-browser failures remain in the evidence directory; corrected results are kept separately.

See `docs/audit-completion.md` for the item-by-item result and evidence limits. GitHub Actions remains disabled as requested. The draft PR contains the final combined report path, base, candidate, source hash, author-content paths and open review decisions.
