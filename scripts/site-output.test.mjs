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

test("Home keeps the original hero layout, three selected talks, and the contact target", () => {
  const selected = home.nodes.find((n) => attrs(n).id === "selected-talks");
  assert.equal(walk(selected).filter((n) => n.tagName === "h3").length, 3);
  assert.ok(home.html.includes("lg:grid-cols-[1.35fr_1fr]"));
  assert.ok(home.nodes.some((n) => attrs(n).id === "contact"));
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
