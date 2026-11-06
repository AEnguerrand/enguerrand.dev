# Website design review

final result: passed

## Current navbar rule

The author refined the shared-navbar rule: hide the upper-left brand on Home because the introduction already identifies the author. On every other page, show “Enguerrand Allamel” as the link to Home. Keep one navbar layout, control positions, fonts, spacing, and mobile behavior. The shared harbour footer and no-new-footer-image rule remain unchanged.

The brand is a native server-rendered link. The homepage body class hides it with CSS visibility, which preserves the navbar geometry while removing the link from keyboard focus and the accessibility tree. The body class follows Astro route changes, so no new branding script or hydration is needed. Updated `docs/design-guidelines.md`, `AGENTS.md`, and the requested memory note with this exception.

## Visual and interaction evidence

Local ignored evidence: `output/navbar-branding/`.

- `comparison.png`: Home and Talks at the same 1440 × 900 viewport, device scale 1, Chromium, identical fonts and reduced-motion setting. The final views wait for fonts and the live globe to load. Inspected both together.
- `home-{320,390,768,1440}.png` and `talks-{320,390,768,1440}.png`: responsive views. The narrow interaction captures also show keyboard focus.
- `capture.mjs`: compared navigation control geometry against the previous preview at all four widths; no position changes. Verified correct brand visibility, the native home link, keyboard focus, internal navigation, Back/Forward, no overflow, and no page errors. The homepage brand is absent from accessible link queries. Visibility also works with JavaScript disabled.

No open P0, P1, or P2 findings in this scoped change. Article content, metadata, TalkJourney layout, globe behavior, footer content, and existing images remain unchanged.

## Regression controls

The shared-output check requires the actual name as the native home-link label. Mobile navigation flows check that the name is hidden only on Home, including a return through the brand link and browser history.

The first-keyboard-control check now expects the menu button on phone Home, the Talks link on desktop Home, and the name/home link on inner pages. It still requires the expected control to be visible and have a focus outline. This is the requested branding exception, not a removal of keyboard coverage.

The existing combined review checks the final source after commit. Exact revisions, source hash, report location, check results, and evidence limits are recorded in PR #37.

## Retained site direction

Use the homepage content grid and restrained type scale. Talks keeps the smaller polar globe, 32–48 px heading, 20 px talk titles, event names, and subtle clouds below navigation. Every page uses the existing harbour footer component, links, image, crop rules, and motion behavior. No page-specific footer designs or generated footer images.

## Limits and open decision

Evidence is local Chromium, including a focused accessibility-tree check. It does not prove full screen-reader support, Safari rendering, physical-device behavior, or live external video playback. The author has not yet approved the final visual result. No merge or deployment is included.
