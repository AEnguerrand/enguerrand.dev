import assert from 'node:assert/strict';

// Provider playback is outside this deterministic test; requests are stubbed by the caller.
export async function checkVideoActivation(page, origin, navigate) {
  const providerRequests = [];
  const record = request => {
    if (/youtube|vimeo/.test(new URL(request.url()).hostname)) providerRequests.push(request.url());
  };
  page.on('request', record);
  const states = [];
  try {
    for (const [index, slug] of ['kubecon-na-2024', 'kubecon-china-2024'].entries()) {
      const url = `${origin}/talks/${slug}/`;
      if (!index) await page.goto(url, {waitUntil:'networkidle'});
      else {
        await page.evaluate(href => {
          const a = document.createElement('a'); a.href=href; a.textContent='Next talk';
          a.dataset.reviewVideoLink=''; document.querySelector('main').prepend(a);
        }, url);
        await navigate(() => page.locator('[data-review-video-link]').click(), url);
      }
      const video = page.locator('talk-video');
      const button = video.getByRole('button', {name:'Load video', exact:true});
      await button.waitFor({state:'visible'});
      const before = providerRequests.length;
      assert.equal(await video.locator('iframe').count(), 0, 'The player waits for activation');
      assert.equal(before, index, 'Only the earlier activated player can request a provider');
      assert.match(await video.locator('.video-source a').getAttribute('href'), /^https:\/\//);
      const request = page.waitForRequest(request => /youtube|vimeo/.test(new URL(request.url()).hostname));
      await button.focus(); await page.keyboard.press(index ? 'Space' : 'Enter');
      await request;
      const iframe=video.locator('iframe'); await iframe.waitFor();
      assert.equal(await iframe.count(), 1);
      assert.ok(await iframe.getAttribute('title'));
      assert.equal(await iframe.evaluate(node=>node===document.activeElement), true, 'Focus follows activation');
      assert.equal(providerRequests.length, before+1, 'Only activation loads the provider');
      const frame=await iframe.boundingBox();
      assert.ok(Math.abs(frame.width/frame.height-16/9)<.02, 'The player keeps its 16:9 frame');
      states.push({slug,keyboard:index?'Space':'Enter',providerRequests:providerRequests.length,frame});
    }
  } finally { page.off('request', record); }
  return {states,limit:'Provider responses are stubbed. This proves activation and keyboard behavior, not playback.'};
}
