# Website design guidelines

The homepage is the visual reference for every page on enguerrand.dev. Keep the site minimalist, calm, and cute. Use Fraunces headings, Space Grotesk body text, the blue accent, pale background, and restrained surfaces.

## Shared navbar and footer

- Use the same navbar and footer on every page. Reuse the shared components in `BaseLayout.astro` and `HarbourFooter.astro`.
- Keep one navbar layout, type scale, spacing, and mobile behavior. Hide the name on the homepage because the introduction already identifies the author. On every other page, show “Enguerrand Allamel” as the link to the homepage. Do not use “Home” as the navbar brand.
- This brand visibility rule and the active-page indicator are the only route-specific navbar differences. Keep the navigation controls in the same position. The hidden homepage brand must not receive keyboard focus or appear in the accessibility tree.
- Keep the existing homepage harbour footer, its links, artwork, crop rules, and motion behavior across the site.
- Use `public/images/scenic/vancouver-harbour-map-aligned.webp` as the footer source. Do not generate or introduce new footer artwork. The author authorized smaller responsive copies of this same source in the audit completion task; preserve the composition, crop and shared layout.
- Do not add per-page footer scenes, compact variants, other branding variants, or separate navbar designs.
- Keep page-specific art below the navbar and separate from the shared footer. A page redesign does not authorize a shared-shell redesign.

## Page content

- Match the homepage's content width, spacing, type hierarchy, and simple list treatment.
- Keep introductions compact. Use shared page styles rather than oversized mockup typography. Talk titles use the homepage's 20 px Fraunces style.
- Keep native links, clear keyboard focus, one H1, and ordered section headings. Preserve article content and metadata.
- Decorative artwork supports the content. It must not obscure links, extend behind navigation, or cause horizontal scrolling.
- Check phone, tablet, desktop, and wide-screen layouts. Reuse the existing review workflow and record evidence limits.

These rules record the author's instructions from 2026-11-06. A future change to the shared navbar, footer, or footer image needs an explicit change of scope from the author.
