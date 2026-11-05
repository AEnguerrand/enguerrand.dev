import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';

test('painted pines reconstruct the original at rest without a pine tip on the fixed plate', async () => {
  const atlas = JSON.parse(await readFile('src/components/home/forest-trees.json', 'utf8'));
  const [original, plate, sprites] = await Promise.all(['forest', 'forest-plate', 'forest-trees'].map(name =>
    sharp(`public/images/scenic/${name}.webp`).raw().toBuffer()));
  const painted = Buffer.from(plate);
  for (const tree of atlas.trees) {
    for (let y=0; y<tree.height; y++) for (let x=0; x<tree.width; x++) {
      const src = 4*((tree.ay+y)*atlas.atlasWidth+tree.ax+x);
      const dst = 3*((tree.top+y)*1600+tree.left+x);
      const alpha = sprites[src+3]/255;
      for (let c=0;c<3;c++) painted[dst+c] = Math.round(sprites[src+c]*alpha + painted[dst+c]*(1-alpha));
    }
  }
  assert.ok(painted.equals(original), 'resting layers must reproduce every source pixel');
  // The darkest part of the tall left tip must uncover open sky as it moves.
  const tip = 3*(378*1600+34), sky = 3*(378*1600+42);
  assert.ok(original[tip] < 30);
  for (let c=0;c<3;c++) assert.ok(Math.abs(plate[tip+c]-original[sky+c]) <= 5);
});
