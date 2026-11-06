import assert from "node:assert/strict";
import { join } from "node:path";

// Follow real links: a direct page load cannot detect stale transition state.
export async function captureRegressions(browser, origin, output, candidate) {
  const results = [];
  const cases = [
    ...[320, 390, 767].map(width => ({ name: `navigation-${width}`, width, kind: "navigation" })),
    { name: "navigation-motion-390", width: 390, kind: "navigation", motion: "no-preference" },
    ...[390, 1440].map(width => ({ name: `search-return-${width}`, width, kind: "search" })),
    { name: "scenery-home-motion-1440", width: 1440, kind: "scenery", page: "home", motion: "no-preference" },
    ...[1920, 2560, 3440].flatMap(width => ["home", "projects"].map(page => ({
      name: `scenery-${page}-${width}`, width, kind: "scenery", page,
    }))),
  ];
  for (const test of cases) {
    const context = await browser.newContext({
      viewport: { width: test.width, height: 900 }, reducedMotion: test.motion ?? "reduce",
      locale: "en-CA", timezoneId: "UTC",
    });
    await context.route("**/*", request => new URL(request.request().url()).origin === origin
      ? request.continue() : request.fulfill({ status: 200, contentType: "text/plain", body: "" }));
    if (candidate) await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", response => {
      if (response.url().startsWith(origin) && response.status() >= 400)
        errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    let metrics;
    try {
      if (test.kind === "navigation") {
        await page.goto(origin, { waitUntil: "networkidle" });
        const toggle = page.getByRole("button", { name: "Open navigation", exact: true });
        const assertClosed = async () => {
          await toggle.waitFor({ state: "visible" });
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          assert.equal(await page.locator("main").evaluate(node => node.inert), false);
        };
        for (const label of ["Talks", "Projects"]) {
          await assertClosed();
          await toggle.click();
          await page.getByRole("navigation", { name: "Main navigation", exact: true })
            .getByRole("link", { name: label, exact: true }).click();
          await page.waitForURL(`${origin}/${label.toLowerCase()}/`);
          await assertClosed();
        }
        await page.goBack();
        await page.waitForURL(`${origin}/talks/`);
        await assertClosed();
        await page.goForward();
        await page.waitForURL(`${origin}/projects/`);
        await assertClosed();
        await toggle.click();
        await page.keyboard.press("Escape");
        await assertClosed();
        assert.equal(await toggle.evaluate(node => node === document.activeElement), true, "Escape returns focus");
        await toggle.click();
        await page.setViewportSize({ width: 768, height: 900 });
        await page.waitForFunction(() => !document.querySelector("[data-site-nav-links]").inert);
        await page.setViewportSize({ width: test.width, height: 900 });
        await assertClosed();
        metrics = { internalLinks: 2, backForward: true, escapeFocus: true, resize: true };
      } else if (test.kind === "search") {
        await page.goto(`${origin}/search/?q=slsa&filter=talk`, { waitUntil: "networkidle" });
        const input = page.getByLabel("Query", { exact: true });
        const expectCount = count => page.waitForFunction(expected =>
          document.querySelector("[data-search-count]")?.textContent === `${expected} results`, count);
        await expectCount(2);
        const footer = page.getByRole("navigation", { name: "Footer navigation" });
        await footer.getByRole("link", { name: "Talks", exact: true }).click();
        await page.waitForURL(`${origin}/talks/`);
        await footer.getByRole("link", { name: "Search", exact: true }).click();
        await page.waitForURL(`${origin}/search/`);
        await input.fill("slsa");
        await expectCount(4);
        const filter = async value => {
          if (test.width < 768) await page.getByLabel("Content type").selectOption(value);
          else await page.locator(`[data-search-filter="${value}"]`).click();
        };
        await filter("project");
        await expectCount(0);
        assert.equal(new URL(page.url()).searchParams.get("filter"), "project");
        await filter("all");
        await expectCount(4);
        await page.locator('[data-search-results] a[href="/talks/kubecon-na-2024/"]').click();
        await page.waitForURL(`${origin}/talks/kubecon-na-2024/`);
        await page.goBack();
        await page.waitForURL(`${origin}/search/?q=slsa`);
        await expectCount(4);
        assert.equal(await input.inputValue(), "slsa");
        await page.goForward();
        await page.waitForURL(`${origin}/talks/kubecon-na-2024/`);
        await page.goBack();
        await expectCount(4);
        await input.fill("zznoresultzz");
        await expectCount(0);
        await page.locator("[data-search-empty]").waitFor({ state: "visible" });
        await input.fill("slsa");
        await expectCount(4);
        metrics = { initialQuery: true, returnVisit: true, filters: true, backForward: true, emptyState: true };
      } else {
        await page.goto(`${origin}${test.page === "home" ? "/" : "/projects/"}`, { waitUntil: "networkidle" });
        await page.locator(".harbour-art").scrollIntoViewIfNeeded();
        await page.locator(".harbour-art img").evaluate(image => image.decode());
        await page.evaluate(async () => {
          await document.fonts.ready;
          window.scrollTo({ top: 0, behavior: "instant" });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        metrics = await page.evaluate(() => {
          const box = selector => {
            const node = document.querySelector(selector);
            if (!node) return null;
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          };
          return { overflow: document.documentElement.scrollWidth > innerWidth,
            forest: box(".forest"), painting: box(".painting"), footer: box(".harbour-art"),
            scene: box(".harbour-scene"), image: box(".harbour-art img"), aircraft: box(".harbour-landing svg"),
            aircraftHidden: getComputedStyle(document.querySelector(".harbour-landing")).display === "none" };
        });
        // Save the image before checking limits, so baseline failures stay reviewable.
        await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true, animations: "disabled" });
        assert.equal(metrics.overflow, false, "Scenery must not cause horizontal scrolling");
        assert.ok(metrics.footer.width <= 1441, "Footer scene width must stay bounded");
        assert.ok(metrics.footer.height <= (test.page === "home" ? 560 : 440), "Footer height must stay bounded");
        if (test.page === "home") {
          assert.ok(metrics.forest.width <= 1441, "Hero crop width must stay bounded");
          assert.ok(metrics.painting.height <= 650, "Hero painting must not grow behind the text");
        }
        for (const key of ["x", "y", "width", "height"]) {
          assert.ok(Math.abs(metrics.scene[key] - metrics.image[key]) < 1, `Image ${key} must match the scene`);
          if (!metrics.aircraftHidden)
            assert.ok(Math.abs(metrics.scene[key] - metrics.aircraft[key]) < 1, `Aircraft ${key} must match the painting scene`);
        }
        assert.equal(metrics.aircraftHidden, test.motion !== "no-preference", "Aircraft follow the motion preference");
      }
    } catch (error) {
      errors.push(error.message);
    } finally {
      if (test.kind !== "scenery" || !metrics)
        await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: false, animations: "disabled" });
      if (candidate) await context.tracing.stop({ path: join(output, `${test.name}.zip`) });
      await context.close();
    }
    results.push({ route: test.name, width: test.width, screenshot: `${test.name}.png`,
      trace: candidate ? `${test.name}.zip` : undefined, metrics, errors,
      status: errors.length ? "failed" : "passed" });
  }
  return results;
}
