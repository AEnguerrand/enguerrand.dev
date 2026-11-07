import assert from 'node:assert/strict';

export async function checkGlobeLabelBounds(page) {
  await page.evaluate(() => document.fonts.ready);
  const labels = await page.locator('[data-globe-marker][visibility="visible"]').evaluateAll(markers => markers.map(marker => {
    const text = marker.querySelector('text');
    const backplate = marker.querySelector('rect');
    const glyph = text.getBBox();
    const plate = backplate.getBBox();
    const style = getComputedStyle(backplate);
    return {
      city: text.textContent.trim(), hidden: style.display === 'none', visibility: style.visibility,
      stroke: getComputedStyle(text).stroke,
      padding: {left:glyph.x-plate.x, right:plate.x+plate.width-glyph.x-glyph.width,
        top:glyph.y-plate.y, bottom:plate.y+plate.height-glyph.y-glyph.height},
      centerY: plate.y+plate.height/2,
    };
  }));
  assert.ok(labels.length > 0, 'The globe has visible city labels');
  for (const label of labels) {
    if (label.hidden) {
      assert.notEqual(label.stroke, 'none', `${label.city}: the phone label retains a readable halo`);
      continue;
    }
    assert.equal(label.visibility, 'visible', `${label.city}: the label background is visible`);
    for (const [side,padding] of Object.entries(label.padding))
      assert.ok(padding >= 2, `${label.city}: ${side} padding contains the text and flag`);
    assert.ok(Math.abs(label.padding.left-label.padding.right)<.5, `${label.city}: horizontal padding is even`);
    assert.ok(Math.abs(label.padding.top-label.padding.bottom)<.5, `${label.city}: vertical padding is even`);
    assert.ok(Math.abs(label.centerY)<.5, `${label.city}: the background aligns with its location dot`);
  }
  return labels;
}
