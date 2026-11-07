import { mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";
import sharp from "sharp";
import satori from "satori";

const fontCache = new Map();
async function fontsFor(root) {
  if (!fontCache.has(root)) fontCache.set(root, Promise.all([
    ["Fraunces", "fraunces", 600], ["Space Grotesk", "space-grotesk", 400],
  ].map(async ([name, slug, weight]) => ({
    name, weight, style: "normal",
    data: await readFile(join(root, `src/assets/social-fonts/${slug}.ttf`)),
  }))));
  return fontCache.get(root);
}

async function textLayer(text, { root, heading = false, size, height, color = "#05354a" }) {
  const fonts = await fontsFor(root);
  // Fit the full text; do not crop long talk titles or repository names.
  for (let fontSize = size; fontSize >= 18; fontSize -= 2) {
    let measuredHeight = 0;
    const svg = await satori({ type: "div", props: {
      style: { width: 1024, fontFamily: heading ? "Fraunces" : "Space Grotesk",
        fontWeight: heading ? 600 : 400, fontSize, lineHeight: 1.15, wordBreak: "break-word", color },
      children: text,
    } }, { width: 1024, fonts, onNodeDetected: (node) => { measuredHeight = Math.max(measuredHeight, node.height); } });
    if (measuredHeight > 0 && measuredHeight <= height) return Buffer.from(svg);
  }
  throw new Error(`Sharing card text does not fit: ${text}`);
}

export async function renderSocialCard({ title, description, home = false }, root) {
  const heading = home ? "Enguerrand Allamel" : title.replace(/ \| Enguerrand Allamel$/, "");
  const summary = home ? description.replace(/^Enguerrand Allamel, /, "") : description;
  const label = await textLayer("enguerrand.dev", { root, size: 28, height: 40, color: "#2673be" });
  const headline = await textLayer(heading, { root, heading: true, size: 78, height: 244 });
  const detail = await textLayer(summary, { root, size: 28, height: 110, color: "#3b6287" });
  const rule = Buffer.from('<svg width="1024" height="2"><path d="M0 1H1024" stroke="#b9cadc" stroke-width="2"/></svg>');
  return sharp({ create: { width: 1200, height: 630, channels: 3, background: "#edf2f8" } })
    .composite([
      { input: label, left: 88, top: 64 },
      { input: headline, left: 88, top: 158 },
      { input: detail, left: 88, top: 432 },
      { input: rule, left: 88, top: 566 },
    ])
    .png().toBuffer();
}

const attributes = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
function headMetadata(html) {
  const document = parse(html);
  const head = document.childNodes.find((node) => node.tagName === "html")?.childNodes.find((node) => node.tagName === "head");
  if (!head) throw new Error("Built page has no head");
  const values = {};
  for (const node of head.childNodes) {
    const attrs = attributes(node);
    if (node.tagName === "meta") values[attrs.property ?? attrs.name] = attrs.content;
    if (node.tagName === "link" && attrs.rel === "canonical") values.canonical = attrs.href;
  }
  return values;
}

export function createSeoBuild() {
  const indexable = new Set();
  let root;
  let site;
  return {
    includeInSitemap: (url) => indexable.has(url),
    integration: {
      name: "site-seo-assets",
      hooks: {
        "astro:config:done": ({ config }) => {
          root = fileURLToPath(config.root);
          site = config.site;
        },
        "astro:build:done": async ({ dir, logger }) => {
          indexable.clear();
          const output = fileURLToPath(dir);
          const files = (await readdir(output, { recursive: true })).filter((file) => file.endsWith(".html")).sort();
          let cards = 0;
          for (const file of files) {
            const metadata = headMetadata(await readFile(join(output, file), "utf8"));
            const path = file === "404.html" ? "/404/" : `/${file.replace(/index\.html$/, "")}`;
            const pageUrl = new URL(path, site).toString();
            // Aliases stay accessible. Only the preferred page goes in the sitemap and writes its card.
            if (metadata.canonical !== pageUrl) continue;
            if (!/\bnoindex\b/i.test(metadata.robots ?? "")) indexable.add(pageUrl);
            const image = new URL(metadata["og:image"]);
            if (image.origin !== new URL(site).origin || !image.pathname.startsWith("/og/")) continue;
            const target = resolve(output, `.${decodeURIComponent(image.pathname)}`);
            if (!target.startsWith(resolve(output, "og") + sep)) throw new Error(`Invalid sharing card path: ${image}`);
            const card = await renderSocialCard({
              title: metadata["og:title"], description: metadata["og:description"], home: path === "/",
            }, root);
            await mkdir(dirname(target), { recursive: true });
            await sharp(card).toFile(target);
            cards++;
          }
          logger.info(`Generated ${cards} sharing cards; ${indexable.size} canonical pages for the sitemap.`);
        },
      },
    },
  };
}
