import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Derive smaller files from the checked-in art. Never replace or redraw a source.
const directory = 'public/images/optimized';
await mkdir(directory, { recursive: true });
const sources = {};
async function variant(source, width, quality = 86) {
  const original = await readFile(`public${source}`);
  sources[source] = createHash('sha256').update(original).digest('hex');
  const bytes = await sharp(original).resize({ width, withoutEnlargement: true }).webp({ quality, alphaQuality: 95, effort: 6 }).toBuffer();
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const name = `${source.split('/').at(-1).replace(/\.[^.]+$/, '')}-${width}.${hash}.webp`;
  await writeFile(`${directory}/${name}`, bytes);
  const metadata = await sharp(bytes).metadata();
  return { src: `/images/optimized/${name}`, width: metadata.width, height: metadata.height, bytes: bytes.length };
}
const manifest = {
  sources,
  globe: {
    phone: {
      colour: await variant('/images/earth/natural-earth.webp', 1024),
      normal: await variant('/images/earth/earth-normal.webp', 512, 90),
      elevation: await variant('/images/earth/earth-elevation.webp', 512),
      clouds: await variant('/images/earth/earth-clouds.webp', 512),
    },
    desktop: {
      colour: await variant('/images/earth/natural-earth.webp', 2048, 90),
      normal: await variant('/images/earth/earth-normal.webp', 1024, 90),
      elevation: await variant('/images/earth/earth-elevation.webp', 1024),
      clouds: await variant('/images/earth/earth-clouds.webp', 1024),
    },
  },
  harbour: await Promise.all([640, 960, 1280].map(width => variant('/images/scenic/vancouver-harbour-map-aligned.webp', width, 90))),
  icons: {
    '/projects/foliobruma-scanner-icon.png': await Promise.all([40, 80, 120].map(width => variant('/projects/foliobruma-scanner-icon.png', width, 90))),
  },
};
await writeFile('src/data/responsive-assets.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({phoneGlobeBytes:Object.values(manifest.globe.phone).reduce((sum,x)=>sum+x.bytes,0),desktopGlobeBytes:Object.values(manifest.globe.desktop).reduce((sum,x)=>sum+x.bytes,0),harbour:manifest.harbour.map(x=>({width:x.width,bytes:x.bytes})),icon:manifest.icons['/projects/foliobruma-scanner-icon.png'].map(x=>({width:x.width,bytes:x.bytes}))},null,2));
