import { createServer } from "node:http";
import { readFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve, extname, join, sep } from "node:path";
import { chromium } from "playwright";
import { parse } from "parse5";
import { captureRegressions } from "./review-regressions.mjs";

const routes = ["/", "/talks/kubecon-na-2024/", "/blog/", "/talks/aws-summit-paris-2025/", "/github-stars/"];
const widths = [390, 768, 1440];
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const walk = (node) => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attrs = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
const text = (node) => ["script", "style"].includes(node.tagName) ? "" : node.value ?? (node.childNodes ?? []).map(text).join("");

export async function snapshotOutput(dist, output) {
  const files = (await readdir(dist, { recursive: true })).sort();
  const pages = [];
  for (const file of files.filter((name) => name.endsWith(".html"))) {
    const html = await readFile(join(dist, file), "utf8");
    const nodes = walk(parse(html));
    pages.push({
      file,
      title: text(nodes.find((n) => n.tagName === "title") ?? {}),
      metadata: nodes.filter((n) => n.tagName === "meta" || (n.tagName === "link" && attrs(n).rel === "canonical")).map(attrs),
      structuredData: nodes.filter((n) => attrs(n).type === "application/ld+json").map((n) => JSON.parse(n.childNodes.map((child) => child.value ?? "").join(""))),
      content: text(nodes.find((n) => n.tagName === "main") ?? {}).replace(/\s+/g, " ").trim(),
      // Code indentation, blank lines, tabs, and trailing spaces can change an example.
      codeBlocks: nodes.filter((n) => n.tagName === "pre").map(text),
      links: nodes.filter((n) => n.tagName === "a").map((n) => ({ text: text(n).replace(/\s+/g, " ").trim(), href: attrs(n).href })),
    });
  }
  await writeFile(join(output, "text-and-links.json"), `${JSON.stringify(pages, null, 2)}\n`);
  const javascript = [];
  for (const file of files.filter((name) => name.endsWith(".js")))
    javascript.push({ file, bytes: (await readFile(join(dist, file))).byteLength });
  await writeFile(join(output, "javascript.json"), `${JSON.stringify({ assets: javascript, totalAssetBytes: javascript.reduce((sum, item) => sum + item.bytes, 0), note: "Asset bytes on disk. Inline scripts are not included; this is not a browser transfer measurement." }, null, 2)}\n`);
  return pages.length;
}

export async function captureBrowser(dist, output, candidate) {
  await mkdir(output, { recursive: true });
  const server = createServer(async (request, response) => {
    try {
      let name = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (name.endsWith("/")) name += "index.html";
      const file = resolve(dist, `.${name}`);
      if (!file.startsWith(`${resolve(dist)}${sep}`)) throw new Error("Invalid path");
      const body = await readFile(file);
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  await new Promise((ok, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", ok); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const results = [];
  try {
    browser = await chromium.launch();
    for (const width of widths) {
      for (const route of routes) {
        const name = `${route === "/" ? "home" : route.slice(1, -1).replaceAll("/", "-")}-${width}`;
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", locale: "en-CA", timezoneId: "UTC" });
        // External embeds are outside this check. Keep comparison runs deterministic.
        await context.route("**/*", (request) => new URL(request.request().url()).origin === origin
          ? request.continue() : request.fulfill({ status: 200, contentType: "text/plain", body: "" }));
        if (candidate) await context.tracing.start({ screenshots: true, snapshots: true });
        const page = await context.newPage();
        page.setDefaultTimeout(10_000);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        const localFailures = [];
        page.on("response", (response) => { if (response.url().startsWith(origin) && response.status() >= 400) localFailures.push(`${response.status()} ${new URL(response.url()).pathname}`); });
        let metrics;
        try {
          const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
          if (response.status() !== 200) throw new Error(`HTTP ${response.status()}`);
          await page.evaluate(() => document.fonts.ready);
          metrics = await page.evaluate(() => {
            const levels = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")].map((node) => Number(node.tagName.slice(1)));
            const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
            return {
              h1: document.querySelectorAll("h1").length,
              overflow: document.documentElement.scrollWidth > innerWidth,
              skippedHeading: levels.some((level, index) => level > (levels[index - 1] ?? 0) + 1),
              duplicateIds: ids.length !== new Set(ids).size,
              missingAnchors: [...document.querySelectorAll('a[href^="#"]')].map((link) => link.getAttribute("href").slice(1)).filter((id) => id && !document.getElementById(decodeURIComponent(id))),
              islands: document.querySelectorAll("astro-island").length,
            };
          });
          // Load lazy scenery before the full-page comparison, then restore the top.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 700) {
              window.scrollTo(0, y);
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
            window.scrollTo(0, 0);
          });
          await page.screenshot({ path: join(output, `${name}.png`), fullPage: true, animations: "disabled" });
          if (metrics.h1 !== 1 || metrics.overflow || metrics.skippedHeading || metrics.duplicateIds || metrics.missingAnchors.length || metrics.islands)
            errors.push(`Page structure: ${JSON.stringify(metrics)}`);
          await page.keyboard.press("Tab");
          const skip = await page.evaluate(() => {
            const node = document.activeElement;
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return { tag: node.tagName, label: node.getAttribute("aria-label"), href: node.getAttribute("href"), visible: style.visibility !== "hidden" && box.width > 0 && box.height > 0 && box.top >= 0 && box.bottom > 0 && box.left >= 0, outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 };
          });
          // The proposal exposes a focus-visible skip link before the shared navbar.
          // Older baselines can still start with a visible brand or navigation control.
          const expectsSkip = await page.locator('a[href="#main-content"]').count() > 0;
          if (candidate && !expectsSkip) errors.push("Shared skip link is missing");
          const homeWithoutBrand = !expectsSkip && route === "/";
          const expectedFirstLink = expectsSkip ? "#main-content" : homeWithoutBrand ? "/talks/" : "/";
          const correctControl = homeWithoutBrand && width < 768
            ? skip.tag === "BUTTON" && skip.label === "Open navigation"
            : skip.tag === "A" && skip.href === expectedFirstLink;
          if (!correctControl || !skip.visible || !skip.outline) errors.push(`First keyboard control: ${JSON.stringify(skip)}`);
          if (expectsSkip) {
            await page.keyboard.press("Enter");
            if (await page.evaluate(() => document.activeElement.id) !== "main-content") errors.push("Skip link did not move focus");
          }
          if (route === "/") {
            await page.keyboard.press("ControlOrMeta+k");
            await page.locator("#command-dialog-input").fill("SLSA");
            await page.locator('#command-dialog-results a[href="/talks/kubecon-na-2024/"]').waitFor({ state: "visible" });
            await page.keyboard.press("Escape");
            // Chromium first uses Escape to clear a non-empty native search input.
            // With the query cleared, the next Escape must close the dialog.
            await page.waitForFunction(() => !document.querySelector("#site-command-dialog").open || document.querySelector("#command-dialog-input").value === "");
            if (!candidate && await page.locator("#site-command-dialog").evaluate((dialog) => dialog.open)) await page.keyboard.press("Escape");
            await page.locator("#site-command-dialog").waitFor({ state: "hidden" });
          }
        } catch (error) {
          errors.push(error.message);
          await page.screenshot({ path: join(output, `${name}-failure.png`), fullPage: true }).catch(() => {});
        } finally {
          if (candidate) await context.tracing.stop({ path: join(output, `${name}.zip`) });
          await context.close();
        }
        results.push({ route, width, screenshot: `${name}.png`, trace: candidate ? `${name}.zip` : undefined, metrics, errors: [...errors, ...localFailures], status: errors.length || localFailures.length ? "failed" : "passed" });
      }
    }
    results.push(...await captureRegressions(browser, origin, output, candidate));
    // The public links must also work without browser JavaScript.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(origin);
    if (!await page.locator('main a[href="/talks/kubecon-na-2024/"]').count()) throw new Error("Talk link missing without JavaScript");
    await page.goto(`${origin}/talks/kubecon-na-2024/`);
    const recording = page.locator("talk-video");
    const fallback = recording.locator("a");
    if (await fallback.count() !== 1 || !await fallback.isVisible()) throw new Error("Video fallback missing without JavaScript");
    if (!/^https:\/\//.test(await fallback.getAttribute("href") ?? "")) throw new Error("Video fallback URL is invalid");
    if (await recording.locator("iframe").count() || await recording.locator("[data-video-load]").isVisible()) throw new Error("Video needs a usable native fallback without JavaScript");
    await fallback.focus();
    if (!await fallback.evaluate(node => node === document.activeElement)) throw new Error("Video fallback is not keyboard focusable");
    await context.close();
    await writeFile(join(output, "checks.json"), `${JSON.stringify(results, null, 2)}\n`);
    return { browser: browser.version(), results };
  } finally {
    await browser?.close();
    await new Promise((ok) => server.close(ok));
  }
}
