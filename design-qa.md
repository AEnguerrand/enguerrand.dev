# Homepage design QA

final result: passed

## Target and evidence

- Selected visual: `/Users/enguerrandallamel/.codex/generated_images/01a15cd5-09c4-7a40-b043-f07cec09a84f/exec-4c8cf463-1791-478d-99df-ef523d97f947.png`.
- Implementation: http://127.0.0.1:4322/ (production build).
- Desktop capture: `output/homepage-qa/home-desktop.jpg`, 972 × 1863 pixels, CSS viewport 972 × 1000, density 1.
- Mobile capture: `output/homepage-qa/home-mobile.jpg`, 390 × 2458 pixels, CSS viewport 390 × 844, density 1.
- Captures are local review evidence, not application assets. They are kept in this worktree and not included in the commit.
- Reference: 972 × 1620 pixels. Compared at the same 972-pixel width, without stretching either page. Both source and rendered capture were shown in the same browser-tool comparison result.
- State: homepage, interests collapsed, two real projects, no published posts. The mock used three sample posts and three sample projects; content height is intentionally different.
- Also inspected rendered layouts at 768 and 1440 pixels; checked horizontal bounds at 320, 390, and 1440 pixels.

## Comparison history

1. First capture: intro heading too small relative to the selected design; portrait too large; header and intro gaps pushed Talks down. P2.
2. Changed the heading scale, reduced portrait to 180 pixels, and reduced header, intro, and talk-row spacing. Shortened event labels to avoid repeating dates.
3. Compared the revised capture with the selected mock at the same width. Titles are clear, Talks come first, and Blog/Projects form two desktop columns. No remaining actionable P0/P1/P2 findings.

## Required surfaces

- Fonts: existing Fraunces Variable for the introduction and section headings; existing Space Grotesk Variable for body, navigation, and entry titles. Families verified in computed browser styles. Heading weights and wrapping inspected at desktop, tablet, and phone widths.
- Layout: open header/footer, compact introduction, two talk rows, two desktop content columns, one phone column. No nested cards. No horizontal overflow at tested narrow and wide widths.
- Colours: existing CSS tokens, background, and focus styles retained. The generated mock approximates the original palette; implementation uses exact site values.
- Images: existing real `/avatar.webp`, with circular crop and explicit dimensions. The generated mock portrait is not substituted for the real photo. Lucide icons reuse the installed library.
- Content: introduction wording retained across heading and supporting statement. Real talk content and links preserved. Project copy checked against the two user-supplied public URLs on 2026-10-20. Published blog posts populate automatically; drafts and scheduled posts remain excluded. All exploration descriptions remain available through native disclosures.

## Interaction checks

- Projects navigation reaches the homepage section.
- Talk row opens the SLSA talk page; All posts opens the Blog page.
- Exploration disclosure opens and shows its full description.
- Keyboard navigation shows a visible focus outline.
- Project destinations match the two user-supplied public URLs.
- Browser error log: no errors observed on the homepage.
- Local type check and static build passed; 68 pages built; all 18 site tests passed; `git diff --check` passed.

## Accepted differences and limits

- Blog shows an honest empty state instead of sample articles. Two selected projects replace three samples.
- Interest descriptions are available through disclosures, so content is retained without large panels.
- Footer keeps Topics, Radar, and Search discoverable; existing secondary-page layouts remain unchanged.
- No new Projects archive route: the homepage section links to each project and the public GitHub repository list.
- No production deployment or hosted-build verification was performed.

## Follow-up polish

- Add published posts when ready; the list will show the latest three at build time.
- Consider a dedicated Projects archive when there are enough entries to need one.

## Implementation checklist

- [x] Recreate the approved Talks-first hierarchy.
- [x] Retain fonts, colour tokens, real portrait, and introduction.
- [x] Add user-selected projects and connect published blog content.
- [x] Inspect responsive layouts and core links.
- [x] Pass required source and output checks.
