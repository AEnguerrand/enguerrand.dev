import assert from "node:assert/strict";

// This is a layout surrogate. It does not test native browser zoom or OS text settings.
export async function checkTextScaling(page, origin) {
  const paths = ["/talks/", "/github-stars/", "/resume/", "/talks/kubecon-na-2024/"];
  const previousViewport = page.viewportSize();
  const results = [];
  await page.setViewportSize({ width: 320, height: 900 });
  try {
    for (const path of paths) {
      await page.goto(new URL(path, origin).href, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        // Capture every computed value before changing an ancestor's font size.
        const sizes = [...document.querySelectorAll("*")]
          .filter(node => node instanceof HTMLElement)
          .map(node => {
            const style = getComputedStyle(node);
            return { node, fontSize: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight) };
          });
        for (const { node, fontSize, lineHeight } of sizes) {
          if (Number.isFinite(fontSize)) node.style.fontSize = `${fontSize * 2}px`;
          if (Number.isFinite(lineHeight)) node.style.lineHeight = `${lineHeight * 2}px`;
        }
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const metrics = await page.evaluate(() => {
        const bounds = node => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
            width: rect.width, height: rect.height };
        };
        const elements = [".site-nav", ".site-brand", "[data-site-nav-toggle]", "main h1"]
          .map(selector => {
            const node = document.querySelector(selector);
            if (!node) return { selector, missing: true };
            const range = document.createRange();
            range.selectNodeContents(node);
            const textRects = selector === "main h1" ? [...range.getClientRects()].map(rect => ({
              left: rect.left, right: rect.right,
            })) : [];
            return { selector, ...bounds(node), textRects };
          });
        const frame = document.querySelector("[data-video-frame]");
        const note = document.querySelector("[data-video-note]");
        return { viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth,
          elements, video: frame && note ? { frame: bounds(frame), note: bounds(note), hidden: note.hidden } : null };
      });
      assert.ok(metrics.documentWidth <= metrics.viewportWidth + 1, `${path}: no document overflow at 200% text`);
      for (const element of metrics.elements) {
        assert.ok(!element.missing, `${path}: ${element.selector} exists`);
        assert.ok(element.width > 0 && element.height > 0, `${path}: ${element.selector} is rendered`);
        assert.ok(element.left >= -1 && element.right <= metrics.viewportWidth + 1,
          `${path}: ${element.selector} stays within the viewport at 200% text`);
        for (const rect of element.textRects) assert.ok(rect.left >= -1 && rect.right <= metrics.viewportWidth + 1,
          `${path}: heading text stays within the viewport at 200% text`);
      }
      if (path === "/talks/kubecon-na-2024/") {
        assert.ok(metrics.video, "The video page has a placeholder note");
        const { frame, note, hidden } = metrics.video;
        assert.equal(hidden, false, "The video placeholder note is visible");
        assert.ok(note.width > 0 && note.height > 0, "The video placeholder note has visible dimensions");
        assert.ok(note.left >= frame.left - 1 && note.right <= frame.right + 1
          && note.top >= frame.top - 1 && note.bottom <= frame.bottom + 1,
        "The video placeholder contains its note at 200% text");
      }
      results.push({ path, ...metrics });
    }
  } finally {
    if (previousViewport) await page.setViewportSize(previousViewport);
  }
  return { width: 320, textScale: 2,
    method: "Double each HTMLElement's precomputed font-size and numeric line-height at a fixed viewport.",
    limit: "Synthetic text-only scaling; native browser zoom and OS text settings are not verified.", results };
}
