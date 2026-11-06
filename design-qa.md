# Talks page design review

final result: passed

## Current scope

The author rejected the first large Conference journey implementation: its text and globe were too large, its artwork reached into the navigation, and its style did not fit Home. The current direction uses the homepage content grid and restrained type scale. The navbar must remain unchanged. Keep the interactive polar globe, real talk content, event names, and coastal ending. Stop before merge or deployment.

## Changes

- Use the shared page heading, capped at 48 px; use the homepage's 32 px phone heading scale. The previous desktop heading reached 94 px.
- Use 20 px Fraunces talk titles, 16 px introduction text, and 12–14 px event metadata. Remove permanent link underlines; retain hover and keyboard focus states.
- Place the globe beside the introduction and recent talks. Its frame is capped at 600 px; the previous frame reached 1020 px. Stack it at tablet and phone widths.
- Replace the large flight-path illustration with a simple timeline guide. Remove the unused route asset. Align older talks with the shared content grid.
- Reduce cloud opacity from .65 to .22. Start all Talks artwork below the navbar, with a transparent top fade.
- Keep navbar markup, CSS, and behavior unchanged. No edits to BaseLayout, shared CSS, or navigation scripts are part of this refinement.
- Keep article content, dates, URLs, resources, metadata, structured data, and the coastal footer unchanged.

## Visual evidence

- The initial concept remains in `output/journey-qa/source.png`; the author's later correction takes precedence over its oversized composition.
- Homepage comparison: `output/journey-refinement/home-comparison.png`. Home and revised Talks use the same 1440 × 900 viewport, device scale 1, Chromium, fonts, and reduced-motion setting. Inspected both views together.
- Previous composition: `output/journey-refinement/before-1440.png`.
- Revised full-page captures: `output/journey-refinement/after-{320,390,768,916,1440,3440}.png`.
- Capture and measurement script: `output/journey-refinement/capture.mjs`.
- Evidence is local and ignored by Git. The final combined review package and exact source revision are recorded in PR #37.

## Checks and findings

The focused check compares navbar text, element rectangles, fonts, padding, gaps, background color/image, and display values against the previous preview. All values are unchanged at 320, 390, 768, 916, 1440, and 3440 pixels. A first comparison differed only in browser serialization of the no-image background position (`0%` versus `0px`); comparison now checks the actual background color and image properties.

At all six widths, there is no horizontal overflow. The navbar ends at y=64; the cloud artwork starts at y=104 on narrow screens and y=112 on desktop. The heading measures 32–48 px, and talk titles measure 20 px. Reviewed the responsive captures, the Home comparison, spacing, copy, colors, and image placement. No open P0, P1, or P2 findings in this scoped review.

The existing 34-view combined regression profile checks headings, anchors, visible city pins and labels, keyboard activation, mobile navigation, Search return visits, page resources, JavaScript output, and console errors. No checks or expectations were changed for this refinement. The full suite runs after the final source commit.

## Limits and open decision

The globe keeps real city coordinates, a North Pole start, native city anchors, and a geographic fallback. Local Chromium evidence does not prove physical-device behavior, Safari rendering, screen-reader support, or live external video playback. The author has not yet approved the refined design. No merge or deployment is included.
