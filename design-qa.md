# Talks journey design review

final result: passed

## Scope

Implement the attached Conference journey design on `/talks/`: a large polar globe, curved talk timeline, pale cloud background, and coastal footer. Keep the existing site header, Fraunces headings, Space Grotesk text, blue accent, native links, and static Astro output. Preserve talk articles, dates, URLs, resources, metadata, structured data, and all other page designs. Stop before merge or deployment.

## Visual evidence

- User source: `codex-clipboard-c687f73e-88f6-490f-b916-eb83243001c6.png`; preserved locally in `output/journey-qa/source.png`.
- Matched comparison: `output/journey-qa/comparison.png`. Source left, implementation right. Both use 916 CSS pixels of width at device scale 1. The browser viewport is 916 × 1717; the full implementation capture is 1793 pixels tall because it retains full event names, a resource link, and the shared footer controls.
- Final responsive captures: `output/journey-qa/final-{320,390,768,916,1440,3440}.png`.
- Capture and focused behavior check: `output/journey-qa/capture.mjs`.
- These local files are ignored evidence, not shipped site assets. The combined review package and exact final source revision are recorded in PR #37.

## Comparison history

1. The first capture showed clipped Paris and Salt Lake City pins, excess timeline spacing, and city labels with heavy text outlines. Adjusted the globe crop, row spacing, and label backplates.
2. The next comparison showed a route crossing the older year heading on wide screens. Footer artwork also covered the resource link. Adjusted the wide-screen spacing and stacking order; decorative images cannot intercept input.
3. At tablet width, long titles crowded the right column. The page now stacks at 850 pixels and below. Added space between the last event and the resource note.
4. Inspected the final full-view comparison and phone, tablet, desktop, and ultrawide captures. No open P0, P1, or P2 findings.

## Fidelity and adaptations

- The main composition, title scale, year hierarchy, curved route, plane, palette, and coastal ending follow the source. No cards, repeated city accordion, or extra headings were added.
- The globe remains interactive. Its real city coordinates differ from the illustrative positions in the mockup. The North Pole is the initial center; rotation stays still until the user drags. All three city pins and labels fit the initial viewport.
- City markers are native links to the first matching talk. Keyboard activation moves focus to that article. The timeline and all five talk links are server-rendered.
- The index uses the existing short talk titles and full conference names. A redundant parenthesized month/year is omitted from the event label because the date appears above it. Source content and talk pages are unchanged.
- The clouds, plane route, and coast are generated decorative WebP assets. They are not full-page screenshots. The existing 3D globe and geographic fallback remain live components.
- The coast and sky span the viewport. Text and globe sizes stop growing on very wide screens. Phone and tablet layouts use a contained globe and a straight list guide so long titles remain readable.
- The existing header and footer links keep their spacing and destinations. Coastal artwork applies only to Talks.

## Focused checks

Passed at 320, 390, 768, 916, 1440, and 3440 pixels: no horizontal overflow; three visible pins and labels; each city link activates with Enter and focuses its matching article; no page errors. With JavaScript disabled, all five talk links and all three city anchors remain present. With normal motion, the initial polar view stays still; drag changes orientation; keyboard selection still works after drag.

The existing static-output and browser regression checks now assert the intended native city-anchor flow instead of the removed city accordion. They also check heading order, IDs, local anchors, viewport bounds, event names, and full-page Talks screenshots. These expectation changes are visible for human review. The required combined site review runs after the final source commit.

## Limits and open decision

This is local Chromium evidence, not physical-device or screen-reader proof. Browser checks do not verify external video playback. The generated coast and clouds are close visual matches, not exact copies of the reference painting. The author's design approval remains open. No merge or deployment is included.
