# Site-wide design QA

final result: passed

## Target and evidence

- Source visual truth: `output/homepage-review-2026-10-20/01-desktop.jpg` and `output/homepage-review-2026-10-20/02-mobile.jpg`.
- Approved review: `output/homepage-review-2026-10-20/review.md`.
- Implementation: http://127.0.0.1:4322/ from the final production build.
- Desktop implementation: `output/homepage-improvements-qa/implementation-desktop.jpg`, 1440 × 1819 pixels, CSS viewport 1440 × 1000, density 1.
- Mobile implementation: `output/homepage-improvements-qa/implementation-mobile.jpg`, 390 × 2303 pixels, CSS viewport 390 × 844, density 1.
- Supporting captures: `output/homepage-improvements-qa/implementation-blog.jpg` and `output/homepage-improvements-qa/implementation-talk.jpg`.
- Site-wide audit reports: `output/pixel-audit-2026-10-21/code/report.md`, `output/pixel-audit-2026-10-21/desktop/report.md`, and `output/pixel-audit-2026-10-21/mobile/report.md`.
- Site-wide source: the final production build at http://127.0.0.1:4322/ after the open editorial system was applied to every Astro route.
- State: two selected talks, two real projects, no published Blog posts, exploration items collapsed.
- The source and final desktop images, then the source and final mobile images, were inspected together in one comparison result. Neither image was stretched.
- The later personality pass was compared before and after at identical 1440 × 1000 and 390 × 844 viewports.
- Full-page comparison was sufficient because the changed areas are visible at their native width and use one continuous layout. Focused crops were not needed.

## Comparison history

1. The approved review found an unbalanced empty Blog column, inconsistent navigation on secondary pages, Projects below Blog on phones, a long mobile introduction, generic project actions, and talk rows that did not explain their available material. P1 and P2.
2. The implementation moved Projects before Blog, made the empty Blog state compact, shared the main navigation and footer across pages, shortened the supporting introduction, added project status and specific actions, and added talk material and language labels.
3. The first browser pass showed that the talk material list had a generic accessible label. Removed that label so assistive technology can use the visible values in the talk link name. P2 fixed.
4. The final same-input comparison shows a shorter page with clear section priority. Projects has the larger desktop column and comes before Blog on phones. The first talk is visible sooner on phones. No actionable P0, P1, or P2 finding remains.
5. User feedback found the simplified page too restrained. A first colour pass used accent words, numbered sections, coloured metadata, and a large footer statement. The result was too strong. P2.
6. The final revision keeps the gradient name, a small brand dot, one coloured talk label, and a smaller footer statement. Section numbers and extra red content accents were removed. Same-input desktop and phone comparisons confirmed the quieter balance. No actionable P0, P1, or P2 finding remains.
7. The next review found the quiet hero too flat. The final refinement restores two clear hero buttons with blue and red hover states, keeps contact links secondary, changes the footer label to `Based in Vancouver, BC, Canada 🇨🇦`, and replaces the Resume navigation item with an About page that links to the full resume.
8. The collapsed Currently exploring rows hid the descriptions. They are now compact cards that show the complete topic and explanation without an extra interaction.
9. The first restored buttons were too large beside the contact links. Their final size is 40 pixels high with a compact radius and padding; the blue and red hover states remain.
10. Home and About now use one shared action hierarchy. Main actions use the same compact button styles; contact and profile destinations use the same text-link style.
11. The final composition review found an unfinished empty Blog column and clickable-looking exploration cards. Blog now has a deliberate writing-status panel, while Currently exploring uses a lighter static reading list with no hover affordance. Desktop and phone checks confirm that the sections stay balanced and readable.
12. The name in the Home title now uses the solid primary blue. The previous blue-to-red text gradient was removed.
13. The hero action block was still too large at normal viewing scale. The two actions now use shorter labels and 36-pixel buttons, while Email, GitHub, and LinkedIn use compact text links with small 15-pixel icons.
14. The footer slogan was removed. The footer now ends with the Vancouver label, email address, and utility links only.
15. The next improvement pass gives Foliobruma Scanner its official app icon and turns the empty Blog area into a compact reading path. It also places the portrait beside the name on phones, removes excess project and exploration rules, and darkens the primary blue slightly so small blue text meets AA contrast. Checks at 320, 390, and 1440 CSS pixels show one H1, no horizontal overflow, a loaded 320-pixel project image, and a skip link that stays above the viewport until keyboard focus moves to it.
16. The exploration copy was restored to its original four topics and descriptions. The four items use a stable two-by-two desktop layout and a one-column phone layout. A source regression test now protects every topic and description.
17. The full website now uses the same open editorial system as Home. Talks, talk details, Topics, Blog, Search, About, Resume, GitHub Stars, Radar, Privacy, and 404 use the shared shell, page title scale, dividers, list rows, links, and compact actions. Raised card containers were removed from route content. The talk video keeps its responsive frame and now has a visible source fallback.
18. The skip link now moves focus to a zero-height target at the start of the main content. The verified focus target is `main-content`, its top is 87 CSS pixels, and the page stays at scroll position 0 instead of jumping into Home content.
19. Projects now has a dedicated `/projects/` page with the complete public project list. The main navigation and Home hero link to this page, while Home keeps a shorter project preview. The decorative dot beside the header name was removed because it did not communicate a state or action.
20. A restrained motion layer adds slow movement to the background colour fields, small arrow movement on hover, and a slight lift and rotation on project artwork. All three effects are disabled by `prefers-reduced-motion`.
21. Home now omits the Blog section when there are no published posts. Projects uses the available width, and the Blog route remains available from the main navigation.
22. Generic subtitles were removed below the Home section titles and the Talks and Projects page titles. Project descriptions, talk summaries, dates, formats, and links remain because they help visitors choose what to open.

## Required surfaces

- Fonts: existing Fraunces Variable and Space Grotesk Variable remain in use. The heading and body hierarchy is unchanged.
- Colours: existing background, text, accent, rule, and focus tokens remain in use. Colour emphasis is limited to the name, small brand mark, talk availability label, project status, and the first footer phrase.
- Images: the real `/avatar.webp` remains sharp, circular, and proportionate at phone and desktop widths.
- Spacing: the introduction is shorter, talk rows remain easy to scan, and the Projects/Blog columns have clear visual weight. The phone layout keeps consistent section spacing.
- Copy: the introduction states role, location, and site purpose. Project status and destination labels are specific. The empty Blog state does not offer an empty archive. Talk cards state notes, video, slides, lab, and language when available.
- Secondary pages: all routes use the same open header, footer, title scale, section dividers, and action hierarchy as Home. Talk notes use a narrower reading measure. Talk pages identify notes, video fallback, and source resources clearly.

## Browser and interaction checks

- Home and Blog: 390, 768, and 1440 CSS pixels.
- KubeCon talk: 390, 768, and 1440 CSS pixels, including video, notes, slides, lab, and resource links.
- AWS Summit talk and GitHub Stars: 390 CSS pixels for regression coverage.
- All tested routes have one H1, five header links, and zero horizontal overflow.
- The Home exploration cards show every description without requiring an extra action.
- The first keyboard stop is the skip link and it has a visible 2-pixel outline.
- Project and talk links retain their destinations. The KubeCon page shows `Watch talk`, `Read notes`, an embedded video, and `Sources and resources`.
- Browser console: no errors observed during the final route and interaction checks.
- The final personality revision has one H1 and zero horizontal overflow at 390 and 1440 CSS pixels.
- The site-wide final desktop pass covered Home, Talks, a talk detail, About, Search, GitHub Stars, Radar, Resume, Privacy, and Topics at 1280 × 720. Every route has one H1 and zero horizontal overflow.
- The mobile audit covered Home at 320, 390, and 768 CSS pixels and eight representative secondary routes at 390 CSS pixels. It found no horizontal overflow. Its card and spacing findings were fixed in the site-wide conversion.
- Search remains functional after the redesign: the query `SLSA` returns the two expected talks.
- The Radar footer reaches the bottom of the 720-pixel viewport on a short page.

## Source validation

- `npm run check:site`: passed.
- `npm run build`: passed; 69 pages built.
- `npm run test:site`: passed; 19 tests, including exact exploration-copy protection.
- `git diff --check`: passed.

## Limits

- Browser checks do not prove full screen-reader behavior.
- The video embed and external resource destinations were present; live external playback was not tested.
- The local production build was inspected. Hosted Cloudflare deployment is outside this change.
