# Redesign visual QA

final result: passed

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
- No remaining actionable P0, P1, or P2 visual findings in the inspected states.
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

This passes local design QA, not author approval. Physical devices, Safari/Firefox, a screen reader, live video playback and external destinations were not established by these captures. The blog article is a synthetic layout fixture because the site has no published posts. Remote résumé certification logos are outside the deterministic capture boundary. The author still needs to review the proposed illustrations and copy before merge. No merge or deployment is authorized.

## Implementation checklist

- [x] Compare source and rendered pages together, including focused regions.
- [x] Resolve article typography and repository title mismatches.
- [x] Verify phone, tablet and desktop templates and useful motion states.
- [x] Preserve the homepage, shared navbar design and existing harbour footer.
- [x] Keep synthetic posts outside source and production output.
- [ ] Attach the final combined review package and exact revisions to the draft PR.
