# Geographic Earth assets

## Natural, illustrated-style globe

The current renderer uses `natural-earth.webp`, derived from NASA Blue Marble July 2004:
https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/july/world.200407.3x5400x2700.jpg

Colours are graded to sage land and blue-grey oceans; geographic coordinates are unchanged. `earth-elevation.webp` comes from NASA's GEBCO topography image:
https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/topography/gebco_08_rev_elev_5400x2700.jpg

The Talks sphere uses a maximum radial displacement of 0.6% of its radius. It shares its orientation with the geographic markers, makes a short introductory turn, and turns to selected locations. Cloud height and lighting are artistic, not current weather. Reduced motion retains a still sphere.

Cloud alpha and terrain normal textures come from the Three.js example texture collection:
https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets
Files: earth_clouds_1024.png and earth_normal_2048.jpg. Licence: https://github.com/mrdoob/three.js/blob/dev/LICENSE (included in THREE-LICENSE.txt).

Regenerate with `node scripts/build-natural-earth-assets.mjs /tmp/earth-nasa-july.jpg` after downloading the credited cloud, normal, and elevation inputs to /tmp/earth-clouds.png, /tmp/earth-normal.jpg, and /tmp/earth-elevation.jpg. The fallback uses the same land/cloud coordinates with an approximate static light treatment, without GPU displacement. All visitor assets are local. The horizon assets support the optional horizon mode; the site footer uses a separate harbour illustration.

Regional Vancouver colour uses NASA GIBS BlueMarble_ShadedRelief, EPSG:4326,
500m matrix 7, rows 16–19 and columns 22–28. Bounds: 130.5° W to 114.75° W,
45° N to 54° N. Source service:
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml
Rebuild with `node scripts/build-vancouver-colour.mjs` before the natural-earth
asset script. Both textures use `scripts/paint-earth.mjs`. The regional view
retains the source coastlines; paint colours and vertical relief are artistic.
