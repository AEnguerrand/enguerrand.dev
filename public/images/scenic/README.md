# Painted scenery

The forest and harbour illustrations were prepared during the local website design work. They are decorative artwork, not geographic or navigation data.

- `forest.webp`: the approved static hero painting.
- `forest-plate.webp`: fixed background with foreground pine crowns removed.
- `forest-trees.webp`: crown sprite atlas. Its coordinates are in `src/components/home/forest-trees.json`.
- `vancouver-harbour-map-aligned.webp`: the approved harbour composition.

Run `node scripts/build-forest-layers.mjs` to reconstruct the forest plate and atlas. The layer test verifies that the resting composite reproduces every source pixel. Motion respects reduced-motion preferences.

Plane sprites and their stylesheet are generated at build time by the Astro endpoints in `src/pages/images/scenic/` and `src/pages/styles/`. Flight paths, perspective, and painted scale are illustrative, not live traffic or aviation guidance.
