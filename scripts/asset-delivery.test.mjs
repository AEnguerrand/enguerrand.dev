import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile('src/data/responsive-assets.json', 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const variants = [...Object.values(manifest.globe.phone), ...Object.values(manifest.globe.desktop), ...manifest.harbour, ...Object.values(manifest.icons).flat()];

test('responsive assets derive from the unchanged checked-in sources', async () => {
  for (const [source, hash] of Object.entries(manifest.sources)) assert.equal(sha(await readFile(`public${source}`)), hash, source);
  for (const item of variants) {
    const bytes = await readFile(`public${item.src}`);
    assert.match(item.src, new RegExp(`\\.${sha(bytes).slice(0, 12)}\\.webp$`));
    const image = await sharp(bytes).metadata();
    assert.equal(image.width, item.width);
    assert.equal(image.height, item.height);
    assert.equal(bytes.length, item.bytes);
  }
});

test('phone and desktop globe maps keep their delivery budgets', () => {
  const bytes = profile => Object.values(profile).reduce((sum, item) => sum + item.bytes, 0);
  assert.ok(bytes(manifest.globe.phone) < 200_000);
  assert.ok(bytes(manifest.globe.desktop) < 500_000);
  assert.ok(manifest.harbour[0].bytes < 100_000);
  assert.ok(manifest.icons['/projects/foliobruma-scanner-icon.png'][0].bytes < 2_000);
});

test('immutable cache rules are limited to content-addressed asset directories', async () => {
  const headers = await readFile('public/_headers', 'utf8');
  const rules = headers.split('\n').filter(line => line.startsWith('/'));
  assert.deepEqual(rules, ['/_astro/*', '/images/optimized/*']);
  assert.equal((headers.match(/Cache-Control: public, max-age=31536000, immutable/g) ?? []).length, 2);
  assert.ok(!headers.includes('/*\n  Cache-Control: no-cache'));
});
