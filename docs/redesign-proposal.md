# Website redesign proposal

Status: implemented as a local proposal; design QA and the audit fixes are documented separately. This branch is a proposal; it does not authorize merge or deployment.

## Scope

Use the current homepage as the visual reference. Keep the shared navbar and existing harbour footer, including their art and motion. Keep the Home name visibility rule. Add a focus-visible skip link and fix keyboard wrapping without changing the navbar design. The author explicitly authorized simpler copy. Preserve factual meaning, dates, metrics, URLs, identity/date metadata, resources and publication rules; remove repetition without inventing claims.

Choose one shared design direction: open pale surfaces, Fraunces headings, Space Grotesk body text, blue links, small watercolor objects, and brief purposeful motion. Use existing components and static Astro output.

## Page coverage

- Home: preserve the accepted hero, layout, scenery, and motion; simplify project and exploration copy.
- Talks index: lighter atlas finish, smaller phone globe, calm timeline feedback.
- All five talk pages: compact introduction, clear resources, readable notes and metadata.
- Projects: small document, archive and weather illustrations; preserve logos and actions.
- Radar: one small notebook illustration, selected-resource emphasis, simpler boundaries.
- Repository topics and every paginated list: clear grouping, consistent type and working filters.
- Talk topics and each topic page: the same title hierarchy and row treatment as Home.
- About: early phone portrait, paper frame, lead/body hierarchy and coherent actions.
- Resume: readable experience hierarchy and complete search data; preserve claims.
- Search and command palette: consistent results, empty states, honest enhancement fallback.
- Blog index and post template: clean reading structure, honest empty state, publication safeguards.
- Privacy: clear reading measure and quiet sections.
- 404: a small existing-library illustration and clear recovery.

## Motion

Keep existing hero/footer motion. Add brief hover/focus responses to related illustrations, timeline markers and native link rows. Reuse existing reveal behavior. Keep layout stable, touch scrolling natural, and reduced-motion states static. Do not add another animation framework.

## Evidence and completion gate

Inspect every generated route and all page templates. Capture phone, tablet, desktop and wide layouts. Verify links, resources, headings, focus, overflow, console output, search/filter/history, globe pointer behavior, and reduced motion. Run the required combined review once on the final source, compare author content and protected shell, and prepare a draft PR with exact revisions and evidence limits. Stop before merge or deployment.

## Content source

The Projects detail for Foliobruma Scanner was checked against its public README on 2026-11-06, blob `74b85d3f909f5636c1d9f712140a502638db01d5`: https://github.com/AEnguerrand/foliobruma-scanner/blob/main/README.md. It describes document-camera capture, page review, PDF export and offline scanning without an account.

## Illustration assets

Four transparent watercolor illustrations were generated for this proposal: document-to-PDF, archive box, weather map and field guide. They use the approved homepage and concept images as style references. The scanner illustration is generic software imagery, not product hardware or a third-party logo. Production copies are 512 × 384 WebP assets with alpha, prepared from the generated originals. Existing logos, portrait, hero and harbour art remain in use.

## Review notes

See `design-qa.md` for visual comparisons, corrected findings, motion checks and evidence limits. Final combined validation is recorded in the generated `artifacts/site-review/` package and the draft PR. All five talk summaries and bodies, Home project/exploration copy and About copy need author review. Résumé facts are preserved, with five past-role bullets changed to past tense. No published blog post was added.

The palette interaction script is bundled once instead of repeated inline on every page. Its data stays server-rendered, and full résumé search remains available. The 60 KB repository-directory check remains unchanged. Exploration-copy assertions now check the authorized shorter text. Duplicate article Overview IDs were removed by using the heading Talk overview while preserving the existing overview anchor for session details.

The browser review now selects the navigation toggle by its stable data attribute while still asserting its accessible label and expanded state. It uses the clearer Search this site field label. These changes prevent stale selectors from hiding the real navigation and search assertions.

The SLSA search assertion now expects five matches on the candidate and checks the added Resume link. The original four matches remain. This records the intended improvement from complete résumé indexing.

## Audit completion

The follow-up fixes are listed in `docs/audit-completion.md`. They cover Radar history, responsive assets, session/notes/slide languages, topic aliases, project context, resume links, click-to-load video, large text, asset caching and the review workflow. The shared shell script is now a fingerprinted module so the existing HTML budget remains in force. GitHub Actions stays disabled at the author's explicit request. Local checks do not authorize merge or deployment.
