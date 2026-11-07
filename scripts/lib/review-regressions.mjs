import assert from "node:assert/strict";
import { join } from "node:path";
import { checkTextScaling } from "./review-text-scaling.mjs";
import { checkVideoActivation } from "./review-video.mjs";
import { checkGlobeLabelBounds } from "./review-globe-labels.mjs";

// Use native links between valid routes to cover history without a directory detour.
export async function checkRadarHistory(page, origin, navigate) {
  const states = [];
  const visit = async path => {
    await page.evaluate(href => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = "History test destination";
      link.dataset.reviewHistoryLink = "";
      document.querySelector("main").prepend(link);
    }, path);
    await navigate(() => page.locator("[data-review-history-link]").click(), `${origin}${path}`);
  };
  const expectState = async path => {
    const expected = new URL(path, origin);
    const query = expected.searchParams.get("q") ?? "";
    const language = expected.searchParams.get("language") ?? "";
    const status = expected.searchParams.get("status") ?? "";
    const filtering = Boolean(query || language || status);
    await page.waitForFunction(active => {
      const summary = document.querySelector("[data-radar-filter-summary]")?.textContent.trim();
      return active ? /^\d+ repositor(?:y|ies) found\.$/.test(summary ?? "") : summary?.startsWith("Page ");
    }, filtering);
    assert.equal(page.url(), expected.href, "History preserves the destination filter URL");
    assert.equal(await page.locator("[data-radar-query]").inputValue(), query);
    assert.equal(await page.locator("[data-radar-language]").inputValue(), language);
    assert.equal(await page.locator("[data-radar-status]").inputValue(), status);
    const state = await page.locator("[data-radar-filter]").evaluate(root => ({
      topic: root.dataset.radarFilter, page: Number(root.dataset.radarPage), total: Number(root.dataset.radarTotal),
      summary: root.querySelector("[data-radar-filter-summary]").textContent.trim(),
    }));
    const parts = expected.pathname.split("/").filter(Boolean);
    assert.equal(state.topic, parts[1]);
    assert.equal(state.page, Number(parts[2] ?? 1));
    assert.equal(await page.locator("[data-radar-default]").isVisible(), !filtering);
    assert.equal(await page.locator("[data-radar-filter-results]").isVisible(), filtering);
    if (filtering) {
      const count = await page.locator("[data-radar-filter-results] h3").count();
      assert.ok(count > 0, "The known filter has repository matches");
      assert.equal(state.summary, `${count} ${count === 1 ? "repository" : "repositories"} found.`);
      if (language) for (const label of await page.locator(".radar-result-labels").allTextContents())
        assert.equal(label.split(" · ")[0], language);
    } else {
      const count = `${state.total} ${state.total === 1 ? "repository" : "repositories"}`;
      assert.equal(state.summary, `Page ${state.page}. ${count} in this topic.`);
      assert.ok((await page.locator(".site-page-meta").textContent()).includes(count));
      assert.ok((await page.locator('meta[name="description"]').getAttribute("content")).includes(count));
    }
    states.push({ path, ...state });
  };
  const rust = "/github-stars/rust/?language=Rust";
  const data = "/github-stars/data/?language=Python";
  await page.goto(`${origin}${rust}`, { waitUntil: "networkidle" });
  await expectState(rust);
  await visit("/github-stars/data/");
  await expectState("/github-stars/data/");
  await page.locator("[data-radar-language]").selectOption("Python");
  await expectState(data);
  await navigate(() => page.goBack(), `${origin}${rust}`);
  await expectState(rust);
  await navigate(() => page.goForward(), `${origin}${data}`);
  await expectState(data);

  const first = "/github-stars/kubernetes/?q=kube&language=Go&status=active";
  const second = "/github-stars/kubernetes/2/";
  await visit(first);
  await expectState(first);
  await visit(second);
  await expectState(second);
  await navigate(() => page.goBack(), `${origin}${first}`);
  await expectState(first);
  await navigate(() => page.goForward(), `${origin}${second}`);
  await expectState(second);
  await page.locator("[data-radar-language]").selectOption("Go");
  await expectState(`${second}?language=Go`);
  await visit(`${second}?language=Python`);
  await expectState(`${second}?language=Python`);
  await navigate(() => page.goBack(), `${origin}${second}?language=Go`);
  await expectState(`${second}?language=Go`);
  await navigate(() => page.goForward(), `${origin}${second}?language=Python`);
  await expectState(`${second}?language=Python`);
  await page.locator("[data-radar-clear]").click();
  await expectState(second);
  return { crossTopicHistory: true, paginatedHistory: true, queryHistory: true, clear: true, states };
}

// Follow real links: a direct page load cannot detect stale transition state.
export async function captureRegressions(browser, origin, output, candidate) {
  const results = [];
  const cases = [
    { name: "text-scaling-320", width: 320, kind: "text" },
    { name: "video-activation-390", width: 390, kind: "video" },
    ...[390, 1440].map(width => ({ name: `radar-history-${width}`, width, kind: "radar" })),
    ...[320, 390, 767].map(width => ({ name: `navigation-${width}`, width, kind: "navigation" })),
    { name: "navigation-motion-390", width: 390, kind: "navigation", motion: "no-preference" },
    ...[390, 1440].map(width => ({ name: `search-return-${width}`, width, kind: "search" })),
    ...[320, 390, 768, 916, 1440, 3440].map(width => ({ name: `talk-globe-${width}`, width, kind: "globe" })),
    { name: "scenery-home-motion-3440", width: 3440, kind: "scenery", page: "home", motion: "no-preference" },
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
    // History changes the URL before Astro swaps the document and runs its scripts.
    // Wait for the destination to be ready before the next sequential interaction.
    const navigate = async (action, url) => {
      await page.evaluate(() => {
        window.__reviewNavigation = new Promise(resolve => {
          document.addEventListener("astro:page-load", () => resolve(), { once: true });
        });
      });
      await action();
      await page.waitForURL(url);
      await page.waitForFunction(() => window.__reviewNavigation.then(() =>
        !document.documentElement.hasAttribute("data-astro-transition")));
    };
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", response => {
      if (response.url().startsWith(origin) && response.status() >= 400)
        errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    let metrics;
    try {
      if (test.kind === "text") {
        metrics = await checkTextScaling(page, origin);
      } else if (test.kind === "video") {
        metrics = await checkVideoActivation(page, origin, navigate);
      } else if (test.kind === "radar") {
        metrics = await checkRadarHistory(page, origin, navigate);
      } else if (test.kind === "navigation") {
        await page.goto(origin, { waitUntil: "networkidle" });
        const toggle = page.locator("[data-site-nav-toggle]");
        const assertClosed = async () => {
          await toggle.waitFor({ state: "visible" });
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          assert.equal(await toggle.getAttribute("aria-label"), "Open navigation");
          assert.equal(await page.locator("main").evaluate(node => node.inert), false);
          assert.equal((await page.locator(".site-brand").textContent()).trim(), "Enguerrand Allamel");
          assert.equal(await page.locator(".site-brand").isVisible(), new URL(page.url()).pathname !== "/",
            "The name is hidden only on Home");
        };
        await toggle.click();
        const lastNavLink = page.locator("[data-site-nav-links] a").last();
        await lastNavLink.waitFor({ state: "visible" });
        await lastNavLink.focus();
        await page.keyboard.press("Tab");
        assert.equal(await toggle.evaluate(node => node === document.activeElement), true, "Home menu wraps past its hidden brand");
        await page.keyboard.press("Shift+Tab");
        assert.equal(await lastNavLink.evaluate(node => node === document.activeElement), true, "Home menu wraps in reverse");
        await page.keyboard.press("Escape");
        for (const label of ["Talks", "Projects"]) {
          await assertClosed();
          await toggle.click();
          await navigate(() => page.getByRole("navigation", { name: "Main navigation", exact: true })
            .getByRole("link", { name: label, exact: true }).click(), `${origin}/${label.toLowerCase()}/`);
          await assertClosed();
        }
        await navigate(() => page.goBack(), `${origin}/talks/`);
        await assertClosed();
        await navigate(() => page.goForward(), `${origin}/projects/`);
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
        await navigate(() => page.locator(".site-brand").click(), `${origin}/`);
        await assertClosed();
        await navigate(() => page.goBack(), `${origin}/projects/`);
        await assertClosed();
        metrics = { internalLinks: 2, backForward: true, escapeFocus: true, resize: true, homeBrandVisibility: true };
      } else if (test.kind === "search") {
        await page.goto(`${origin}/search/?q=slsa&filter=talk`, { waitUntil: "networkidle" });
        const input = page.getByRole("searchbox", { name: candidate ? "Search this site" : "Query", exact: true });
        const allResultCount = candidate ? 5 : 4;
        const expectCount = count => page.waitForFunction(expected =>
          document.querySelector("[data-search-count]")?.textContent === `${expected} results`, count);
        await expectCount(2);
        const footer = page.getByRole("navigation", { name: "Footer navigation" });
        await navigate(() => footer.getByRole("link", { name: "Talks", exact: true }).click(), `${origin}/talks/`);
        await navigate(() => footer.getByRole("link", { name: "Search", exact: true }).click(), `${origin}/search/`);
        await input.fill("slsa");
        await expectCount(allResultCount);
        if (candidate) assert.equal(await page.locator('[data-search-results] a[href="/resume/"]').count(), 1, "Complete résumé text adds the SLSA result");
        const filter = async value => {
          if (test.width < 768) await page.getByLabel("Content type").selectOption(value);
          else await page.locator(`[data-search-filter="${value}"]`).click();
        };
        await filter("project");
        await expectCount(0);
        assert.equal(new URL(page.url()).searchParams.get("filter"), "project");
        await filter("all");
        await expectCount(allResultCount);
        await navigate(() => page.locator('[data-search-results] a[href="/talks/kubecon-na-2024/"]').click(),
          `${origin}/talks/kubecon-na-2024/`);
        await navigate(() => page.goBack(), `${origin}/search/?q=slsa`);
        await expectCount(allResultCount);
        assert.equal(await input.inputValue(), "slsa");
        await navigate(() => page.goForward(), `${origin}/talks/kubecon-na-2024/`);
        await navigate(() => page.goBack(), `${origin}/search/?q=slsa`);
        await expectCount(allResultCount);
        await input.fill("zznoresultzz");
        await expectCount(0);
        await page.locator("[data-search-empty]").waitFor({ state: "visible" });
        await input.fill("slsa");
        await expectCount(allResultCount);
        metrics = { initialQuery: true, returnVisit: true, filters: true, backForward: true, emptyState: true };
      } else if (test.kind === "globe") {
        await page.goto(`${origin}/talks/`, { waitUntil: "networkidle" });
        const globe = page.locator("talk-globe");
        const markers = globe.locator("[data-globe-marker]");
        assert.equal(await markers.count(), 3);
        for (const marker of await markers.all()) {
          assert.equal(await marker.getAttribute("visibility"), "visible", "All talk cities start in view");
          assert.equal(await marker.getAttribute("tabindex"), "0", "Each visible city is keyboard reachable");
        }
        const orientation = JSON.parse(await globe.locator("geographic-globe").getAttribute("data-orientation"));
        assert.equal(orientation[1], -90, "The initial view looks down from the North Pole");
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        metrics = { initialCities: 3, orientation, labels: await checkGlobeLabelBounds(page) };
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map(image => { image.loading = "eager"; return image.decode(); }));
        });
        metrics.layout = await page.evaluate(() => {
          const levels = [...document.querySelectorAll("main h1,main h2,main h3")].map(node => Number(node.tagName.slice(1)));
          const ids = [...document.querySelectorAll("[id]")].map(node => node.id);
          return { h1: document.querySelectorAll("h1").length,
            skippedHeading: levels.some((level, index) => level > (levels[index - 1] ?? 0) + 1),
            duplicateIds: ids.length !== new Set(ids).size,
            missingAnchors: [...document.querySelectorAll('a[href^="#"]')].map(link => link.getAttribute("href").slice(1)).filter(id => id && !document.getElementById(id)),
            pinsInViewport: [...document.querySelectorAll(".globe-pin,.globe-label")].every(node => {
              const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth;
            }),
          };
        });
        await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true, animations: "disabled" });
        assert.equal(metrics.layout.h1, 1);
        assert.equal(metrics.layout.skippedHeading, false);
        assert.equal(metrics.layout.duplicateIds, false);
        assert.deepEqual(metrics.layout.missingAnchors, []);
        assert.equal(metrics.layout.pinsInViewport, true, "Initial city pins and labels must fit the viewport");
        for (const [city, event] of [["Paris", "OWASP France Chapter Meetup"], ["Hong Kong", "KubeCon + CloudNativeCon + Open Source Summit China 2024"], ["Salt Lake City", "KubeCon + CloudNativeCon North America 2024"]]) {
          const pin = page.getByRole("link", { name: `Show talks in ${city}`, exact: true });
          const target = await pin.getAttribute("href");
          assert.match(target, /^#talk-place-/, "Cities use native document anchors");
          await pin.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(`${origin}/talks/${target}`);
          const article = page.locator(target);
          assert.equal(await article.evaluate(node => node === document.activeElement), true, "Selection transfers keyboard focus to the talk");
          assert.ok((await article.innerText()).includes(event));
          const box = await article.boundingBox();
          assert.ok(box.y >= 0 && box.y < 900, "The selected talk must scroll into view");
        }
      } else {
        await page.goto(`${origin}${test.page === "home" ? "/" : "/projects/"}`, { waitUntil: "networkidle" });
        await page.locator(".harbour-art").scrollIntoViewIfNeeded();
        // A responsive source can change while decode() is pending. Check the selected image.
        await page.waitForFunction(() => {
          const image = document.querySelector(".harbour-art img");
          return image?.complete && image.naturalWidth > 0;
        });
        if (candidate && test.motion === "no-preference")
          await page.locator(".harbour-landing[data-motion-ready]").waitFor({ state: "visible" });
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
        assert.ok(Math.abs(metrics.footer.x) < 1 && Math.abs(metrics.footer.width - test.width) < 1,
          "Footer artwork must reach both viewport edges");
        assert.ok(metrics.footer.height <= 840, "The shared homepage footer height must stay bounded");
        if (test.page === "projects") {
          const home = results.find(result => result.route === `scenery-home-${test.width}`);
          assert.equal(metrics.footer.height, home?.metrics?.footer.height,
            "Every page must use the same footer crop as Home");
        }
        if (test.page === "home") {
          assert.ok(Math.abs(metrics.forest.x) < 1 && Math.abs(metrics.forest.width - test.width) < 1,
            "Hero artwork must reach both viewport edges");
          assert.ok(metrics.forest.height <= 560, "The visible hero crop must stay bounded");
          const horizon = metrics.painting.y + metrics.painting.height * .7;
          assert.ok(horizon > metrics.forest.y + metrics.forest.height * .15 &&
            horizon < metrics.forest.y + metrics.forest.height * .85,
            "Keep the painted mountain and lake horizon inside the visible crop");
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
      if (!["scenery", "globe"].includes(test.kind) || !metrics)
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
