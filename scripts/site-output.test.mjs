import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { parse } from "parse5";

const output = new URL("../dist/", import.meta.url);
const load = (path) => readFile(new URL(path, output), "utf8");
const attrs = (node) =>
  Object.fromEntries(
    (node.attrs ?? []).map(({ name, value }) => [name, value]),
  );
const walk = (node) => [node, ...(node.childNodes ?? []).flatMap(walk)];
const text = (node) => node.value ?? (node.childNodes ?? []).map(text).join("");
const page = async (path) => {
  const html = await load(path);
  return { html, nodes: walk(parse(html)) };
};
const home = await page("index.html");
const talk = await page("talks/kubecon-na-2024/index.html");

for (const [name, { html, nodes }] of [
  ["Home", home],
  ["talk", talk],
]) {
  test(`${name}: static HTML has ordered headings and working local anchors`, () => {
    const headings = nodes.filter((n) => /^h[1-6]$/.test(n.tagName ?? ""));
    assert.equal(headings.filter((n) => n.tagName === "h1").length, 1);
    let previous = 0;
    for (const heading of headings) {
      const level = Number(heading.tagName[1]);
      assert.ok(
        level <= previous + 1,
        `Skipped heading before ${text(heading)}`,
      );
      previous = level;
    }
    const ids = nodes.map((n) => attrs(n).id).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, "Duplicate IDs");
    for (const node of nodes.filter((n) => n.tagName === "a")) {
      const href = attrs(node).href;
      if (href?.startsWith("#"))
        assert.ok(ids.includes(href.slice(1)), `Missing anchor ${href}`);
    }
    assert.doesNotMatch(html, /<astro-island|client:load|next\/static/);
  });
}

test("Home keeps a short introduction, three linked talks, and the approved section order", () => {
  const selected = home.nodes.find((n) => attrs(n).id === "selected-talks");
  assert.equal(walk(selected).filter((n) => n.tagName === "h3").length, 3);
  const intro = home.nodes.find((n) => attrs(n)["aria-label"] === "Introduction");
  assert.deepEqual(walk(intro).filter((n) => n.tagName === "a").map((n) => text(n).trim()), ["Explore talks", "Read resume"]);
  const headings = home.nodes.filter((n) => n.tagName === "h2").map(text);
  assert.deepEqual(headings, ["Selected talks", "Writing", "What I'm exploring now", "Let's connect"]);
  assert.doesNotMatch(text(selected), /Read details/);
  assert.equal(walk(selected).filter((n) => n.tagName === "a" && attrs(n).href?.startsWith("/topics/")).length, 0);
  for (const heading of walk(selected).filter((n) => n.tagName === "h3"))
    assert.ok(walk(heading).some((n) => n.tagName === "a" && attrs(n).href?.startsWith("/talks/")));
  const contact = home.nodes.find((n) => attrs(n).id === "contact");
  assert.equal(walk(contact).filter((n) => n.tagName === "a").length, 3);
  assert.match(text(selected), /Nov 15, 2024/);
});

test("Talk keeps source resources, full structured title, and a stable calendar date", async () => {
  const source = await readFile(
    new URL("../src/content/talks/kubecon-na-2024.md", import.meta.url),
    "utf8",
  );
  const links = talk.nodes
    .filter((n) => n.tagName === "a")
    .map((n) => attrs(n).href);
  for (const [, url] of source.matchAll(/url: "([^"]+)"/g))
    assert.ok(links.includes(url), `Missing resource ${url}`);
  const fullTitle = source.match(/^title: "(.+)"$/m)[1];
  const graph = JSON.parse(
    text(talk.nodes.find((n) => attrs(n).type === "application/ld+json")),
  )["@graph"];
  assert.equal(
    graph.find((n) => n["@type"] === "TechArticle").headline,
    fullTitle,
  );
  assert.equal(
    attrs(talk.nodes.find((n) => attrs(n).rel === "canonical")).href,
    "https://enguerrand.dev/talks/kubecon-na-2024/",
  );
  assert.match(
    text(talk.nodes.find((n) => n.tagName === "time")),
    /November 15, 2024/,
  );
  const topResources = talk.nodes.find((n) => attrs(n)["aria-label"] === "Session resources");
  assert.ok(walk(topResources).some((n) => n.tagName === "a" && attrs(n).class.includes("bg-primary")), "Primary resource link lost its button style");
  const aws = await page("talks/aws-summit-paris-2025/index.html");
  for (const current of [talk, aws]) {
    const resources = current.nodes.find((n) => attrs(n)["aria-label"] === "Session resources");
    for (const link of walk(resources).filter((n) => n.tagName === "a")) {
      assert.ok(attrs(link).class.split(" ").includes("whitespace-normal"));
      assert.ok(!attrs(link).class.split(" ").includes("whitespace-nowrap"), "Resource label must wrap on phones");
    }
  }
  const video = attrs(talk.nodes.find((n) => n.tagName === "iframe"));
  assert.equal(video.loading, "lazy");
  assert.equal(video.src, "https://www.youtube.com/embed/0w_dBmvu5l8");
});

test("Stars and Radar use the checked-in dataset in production output", async () => {
  const dataset = JSON.parse(
    await readFile(
      new URL("../public/data/starred-groups.json", import.meta.url),
      "utf8",
    ),
  );
  const count = dataset.groups.filter((g) => g.repos.length > 0).length;
  const stars = text((await page("github-stars/index.html")).nodes[0]);
  const radar = text((await page("radar/index.html")).nodes[0]);
  assert.ok(stars.includes(`${dataset.total_repos} Stars`));
  assert.ok(stars.includes(`${count} Lists`));
  assert.ok(
    stars.includes(
      dataset.groups.find((g) => g.repos.length > 0).repos[0].full_name,
    ),
  );
  assert.doesNotMatch(stars, /Starred repositories are unavailable/);
  assert.ok(radar.includes(`${dataset.total_repos} repos`));
  assert.ok(radar.includes(`${count} lists`));
});

test("Generated pages have no Once UI assets or markup", async () => {
  const files = await readdir(output, { recursive: true });
  for (const file of files.filter((f) => /\.(html|css|js)$/.test(f)))
    assert.doesNotMatch(await load(file), /once-ui|@once-ui-system/, file);
  const lock = await readFile(new URL("../package-lock.json", import.meta.url), "utf8");
  assert.doesNotMatch(lock, /@once-ui-system/);
});

test("Blog is linked and private drafts stay out of production routes, search, and sitemap", async () => {
  const blog = await page("blog/index.html");
  assert.match(text(blog.nodes[0]), /No posts published yet/);
  assert.equal(blog.nodes.filter((n) => n.tagName === "h1").length, 1);
  assert.ok(home.nodes.some((n) => attrs(n).href === "/blog/"));
  const files = await readdir(output, { recursive: true });
  const postFiles = await readdir(new URL("../src/content/posts/", import.meta.url));
  assert.equal(postFiles.filter((f) => f.endsWith(".md")).length, 3);
  const publicText = (await Promise.all(files.filter((f) => /\.(html|xml|js|json)$/.test(f)).map(load))).join("\n");
  for (const filename of postFiles.filter((f) => f.endsWith(".md"))) {
    const slug = filename.slice(0, -3);
    assert.ok(!files.some((f) => f.startsWith(`blog/${slug}/`)), `Draft route emitted: ${slug}`);
    const source = await readFile(new URL(`../src/content/posts/${filename}`, import.meta.url), "utf8");
    const title = source.match(/^title: "(.+)"$/m)[1];
    assert.ok(!publicText.includes(title), `Draft title leaked: ${title}`);
    assert.ok(!publicText.includes(`/blog/${slug}/`), `Draft URL leaked: ${slug}`);
  }
});

// Check the public search contract against every built page, not just source templates.
const builtFiles = await readdir(output, { recursive: true });
const builtPages = await Promise.all(builtFiles.filter((f) => f.endsWith(".html")).map(async (file) => ({ file, ...await page(file) })));
const meta = (nodes, name) => attrs(nodes.find((n) => n.tagName === "meta" && (attrs(n).name === name || attrs(n).property === name))).content;
const canonical = (nodes) => attrs(nodes.find((n) => n.tagName === "link" && attrs(n).rel === "canonical")).href;
const graph = (nodes) => JSON.parse(text(nodes.find((n) => attrs(n).type === "application/ld+json")))["@graph"];

test("SEO: every indexed page has unique metadata, a matching canonical, and a sitemap entry", async () => {
  const sitemap = await load("sitemap-0.xml");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const titles = new Set();
  const descriptions = new Set();
  for (const { file, nodes } of builtPages) {
    assert.equal(nodes.filter((n) => n.tagName === "h1").length, 1, `${file}: one H1`);
    const title = text(nodes.find((n) => n.tagName === "title"));
    const description = meta(nodes, "description");
    assert.ok(title && description, `${file}: missing metadata`);
    const url = canonical(nodes);
    const expectedPath = file === "404.html" ? "/404/" : file === "index.html" ? "/" : `/${file.replace(/index\.html$/, "")}`;
    assert.equal(url, `https://enguerrand.dev${expectedPath}`, file);
    assert.equal(meta(nodes, "og:url"), url, file);
    assert.equal(meta(nodes, "og:title"), title, file);
    assert.equal(meta(nodes, "twitter:description"), description, file);
    if (meta(nodes, "robots").includes("noindex")) {
      assert.ok(!sitemapUrls.includes(url), `${file}: noindex URL in sitemap`);
    } else {
      assert.ok(!titles.has(title), `${file}: duplicate title`);
      assert.ok(!descriptions.has(description), `${file}: duplicate description`);
      titles.add(title);
      descriptions.add(description);
      assert.ok(sitemapUrls.includes(url), `${file}: missing from sitemap`);
    }
  }
  for (const url of sitemapUrls)
    assert.ok(builtPages.some(({ nodes }) => canonical(nodes) === url), `Sitemap URL has no page: ${url}`);
});

test("SEO: page, profile, and article structured data agree with public URLs", () => {
  const websiteDescriptions = new Set();
  for (const { file, nodes } of builtPages) {
    const url = canonical(nodes);
    const data = graph(nodes);
    const webpage = data.find((n) => n["@id"] === `${url}#webpage`);
    assert.equal(webpage.url, url, file);
    assert.equal(webpage.name, meta(nodes, "og:title"), file);
    websiteDescriptions.add(data.find((n) => n["@type"] === "WebSite").description);
    if (["index.html", "resume/index.html"].includes(file)) {
      assert.equal(webpage["@type"], "ProfilePage");
      assert.equal(webpage.mainEntity["@id"], "https://enguerrand.dev/#person");
    }
    for (const article of data.filter((n) => ["TechArticle", "BlogPosting"].includes(n["@type"]))) {
      assert.equal(article.url, url, file);
      assert.equal(article.mainEntityOfPage, url, file);
      assert.equal(article.author.name, "Enguerrand Allamel", file);
      assert.equal(article.author.url, "https://enguerrand.dev/", file);
      assert.equal(article.image, meta(nodes, "og:image"), file);
      assert.equal(meta(nodes, "article:published_time").slice(0, 10), article.datePublished.slice(0, 10), file);
      assert.equal(meta(nodes, "article:author"), "https://enguerrand.dev/", file);
    }
    for (const list of data.filter((n) => n["@type"] === "BreadcrumbList"))
      assert.equal(list.itemListElement.at(-1).item, url, file);
  }
  assert.equal(websiteDescriptions.size, 1, "Site description must not change on each page");
});

test("SEO: search can be crawled to read noindex and internal links use canonical routes", async () => {
  const robots = await load("robots.txt");
  assert.doesNotMatch(robots, /Disallow:\s*\/search/);
  assert.match(robots, /Sitemap: https:\/\/enguerrand\.dev\/sitemap-index\.xml/);
  assert.match(meta((await page("search/index.html")).nodes, "robots"), /noindex/);
  for (const { file, nodes } of builtPages) {
    for (const link of nodes.filter((n) => n.tagName === "a")) {
      const href = attrs(link).href;
      if (!href?.startsWith("/") || href.startsWith("//")) continue;
      const target = new URL(href, "https://enguerrand.dev");
      if (/\.[a-z0-9]+$/i.test(target.pathname)) continue;
      assert.ok(target.pathname.endsWith("/"), `${file}: noncanonical link ${href}`);
      assert.ok(builtPages.some(({ nodes: targetNodes }) => canonical(targetNodes) === `${target.origin}${target.pathname}`), `${file}: missing link ${href}`);
    }
    const image = new URL(meta(nodes, "og:image"));
    assert.equal(image.origin, "https://enguerrand.dev");
    assert.ok(builtFiles.includes(image.pathname.slice(1)), `${file}: missing social image`);
    assert.equal(meta(nodes, "og:image:width"), "1536");
    assert.equal(meta(nodes, "og:image:height"), "1536");
  }
});
