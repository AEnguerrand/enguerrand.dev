# Sharing card fonts

These fonts are build-only assets. They do not change the website's web fonts.

- `fraunces.ttf`: Fraunces, weight 600, from `@fontsource-variable/fraunces` 5.2.9.
- `space-grotesk.ttf`: Space Grotesk, weight 400, from `@fontsource-variable/space-grotesk` 5.2.10.

The source for each is `files/<name>-latin-wght-normal.woff2` in the installed package. FontTools 4.60.1 was used to instantiate the weight, remove WOFF2 compression, and rename the internal families to `Site Card Fraunces` and `Site Card Space Grotesk`. The included SIL Open Font Licenses permit redistribution and modification. No Python tool is needed during a site build.

Satori embeds the glyph outlines in SVG before Sharp converts the card to PNG. This avoids system-font substitution and preserves the selected font weights. Keep these files and their licenses together.
