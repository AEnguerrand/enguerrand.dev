# Talks and shared website design review

final result: passed

## Author direction

Use the homepage as the visual reference. The author rejected oversized Talks typography and artwork behind the navbar. The author then required the same navbar and footer on every page, reuse of the existing footer image, and a persistent design rule. These instructions take precedence over the initial Conference journey mockup.

## Final design

- Talks uses the shared content grid, a 32–48 px page heading, 20 px Fraunces talk titles, and 12–16 px supporting text. The globe frame is capped at 600 px and stacks on narrow screens.
- A simple timeline guide replaces the large flight path. Clouds are subtle and start below the navbar. The old route image is removed.
- Every page uses the homepage navbar, including its Home link. Only active-page indicators vary. Removed the old script that changed the link label on other routes.
- Every page uses the existing HarbourFooter component, image, links, crop, and motion rules. Removed the alternate coast scene, compact page variant, footerScene prop, and newly generated footer image.
- The homepage navbar and footer design remain the reference. No replacement footer artwork was generated for this correction.
- Saved the rule in `docs/design-guidelines.md`, linked it from `AGENTS.md`, and appended the requested preference to memory.
- Article content, dates, URLs, resources, metadata, structured data, fonts, and palette remain intact.

## Visual evidence

Local ignored evidence is in `output/journey-refinement/`:

- `shared-home-comparison.png`: Home and revised Talks side by side at 1440 × 900, device scale 1, Chromium, identical fonts and reduced-motion setting.
- `shared-{390,768,1440,3440}.png`: final full-page Talks views with the common navbar and harbour footer.
- `shared-shell.mjs`: measured Home, Talks, and Projects navbar links, font styles, element geometry, footer text, footer image, and crop geometry at all four widths. All match Home; no horizontal overflow.
- `after-{320,390,768,916,1440,3440}.png`: earlier refinement captures that verified the reduced typography and artwork boundaries, before the final common-footer correction.

Inspected the matched view and final phone/desktop captures. No open P0, P1, or P2 findings in this scoped review. Full final regression evidence and exact revisions are recorded in PR #37 after the final source commit.

## Regression controls

A new static-output test checks every generated page against Home for navigation labels/destinations, footer text/links, and the existing harbour image. Mobile navigation flows also check that the Home label stays unchanged after route transitions.

Wide-screen checks now require Home and Projects to use identical footer heights. Both use the unchanged homepage height limit of 840 px. This intentionally replaces the old 680 px inner-page limit because the author removed per-page footer variants; the expectation change is visible for review. Existing pin, keyboard, heading, anchor, overflow, resource, console, and JavaScript checks remain.

## Limits and open decision

The globe keeps real city coordinates, a North Pole start, native city anchors, drag, and a static geographic fallback. Local Chromium checks do not prove physical-device behavior, Safari rendering, screen-reader support, or live external video playback. The author's design approval remains open. No merge or deployment is included.
