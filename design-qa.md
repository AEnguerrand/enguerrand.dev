# Painted site redesign: local review

## Result

The approved design uses a layered forest hero and a full harbour footer on Home, with a shorter harbour on other pages. Projects share a compact layout. Exploration stays open. Resume typography and dates are consistent; LinkedIn has a primary button. Search shares its index with the command palette, retains URL state, uses one mobile filter, and closes on the first Escape. Mobile navigation starts closed when scripting is enabled and stays usable without JavaScript.

Talks keeps real geographic mapping, location selection, clouds, relief, and motion with a lighter painted palette. The harbour has two staggered plane sequences; the hero plane and ferry motion are excluded. Article text, personal claims, content URLs, publication rules, and dates are preserved. The only content-file edit is the Search interface description.

## Evidence

Before PR preparation, `check:site`, `build`, `test:site` (50 tests including a retired terrain prototype), and whitespace checks passed. Browser inspections covered Home, Talks, Projects, Radar, About, Resume, Search, KubeCon NA 2024, OWASP France October 2025, Blog, and Kubernetes repositories at 390, 820, and 1440px. No horizontal overflow, missing image, or site JavaScript exception was found. Mobile menu, command search, filter reload, keyboard focus, and globe location selection were checked. Screenshots are local in `output/playwright/`.

Final PR validation uses `npm run review:site -- --base origin/main` against the latest main branch. Its generated report records the exact revisions, source hash, check results, text/link differences, and baseline/candidate images. The PR links that report. Unused terrain, ferry, portrait, and earlier art experiments remain local and are excluded from the commit.

## Review-check changes

The author requested removal of the skip link. The browser review checks the first navigation link and its visible keyboard outline on the candidate; baseline skip-link activation remains checked when present. Candidate search must close on the first Escape. Full-page captures scroll through the page first so lazy-loaded scenery appears. The output tests retain the published-blog fixture requirements. New tests cover the final geographic globe, pine layers, and harbour flight paths; the unused terrain prototype is excluded.

## Limits

Browser screenshots do not prove physical-device behavior, screen-reader support, live video playback, or measured performance. External embeds are blocked in the combined comparison. Earlier live-embed checks produced two third-party permissions-policy messages. Build warnings include an empty blog collection and a large Three.js chunk. Map geometry is retained; terrain exaggeration, paint colours, clouds, and flight paths are artistic. No merge or deployment is authorized by this review.
