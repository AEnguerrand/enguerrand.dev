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
const projectsPage = await page("projects/index.html");

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

test("Home shows talks first, clear titles, and real content states", () => {
  const selected = home.nodes.find((n) => attrs(n).id === "selected-talks");
  const links = walk(selected).filter((n) => n.tagName === "a").map((n) => attrs(n).href);
  assert.ok(links.includes("/talks/meetup-owasp-france-chapter-10-2025/"));
  assert.ok(links.includes("/talks/kubecon-na-2024/"));
  assert.deepEqual(home.nodes.filter((n) => n.tagName === "h2").map(text), ["Talks", "Projects", "Explore"]);
  assert.equal(text(home.nodes.find((n) => n.tagName === "h1")), "Hi, I'm Enguerrand.");
  const contact = home.nodes.find((n) => attrs(n).id === "contact");
  assert.equal(walk(contact).filter((n) => n.tagName === "a").length, 3);
  assert.ok(home.nodes.some((n) => "data-hero-motion" in attrs(n)), "Home must keep its one-time hero choreography");
  assert.ok(home.nodes.some((n) => n.tagName === "button" && "data-confetti-trigger" in attrs(n)), "Home portrait must expose the optional celebration interaction");
  const workIndex = home.nodes.find((n) => n.tagName === "nav" && attrs(n)["aria-label"] === "Explore my work");
  assert.deepEqual(walk(workIndex).filter((n) => n.tagName === "a").map((n) => attrs(n).href), ["#selected-talks", "#projects", "#explore"]);
  assert.match(text(selected), /November 2024/);
  const blog = home.nodes.find((n) => attrs(n).id === "blog");
  assert.equal(blog, undefined, "Home must hide Blog until a post is published");
  const projects = home.nodes.find((n) => attrs(n).id === "projects");
  assert.deepEqual(walk(projects).filter((n) => n.tagName === "h3").map(text), ["Foliobruma Scanner", "Foliobruma"]);
  for (const url of ["https://github.com/AEnguerrand/foliobruma-scanner", "https://foliobruma.com"])
    assert.ok(walk(projects).some((n) => n.tagName === "a" && attrs(n).href === url));
  assert.ok(walk(projects).some((n) => n.tagName === "a" && attrs(n).href === "https://github.com/AEnguerrand/foliobruma-scanner" && text(n) === "GitHub"));
  assert.ok(walk(projects).some((n) => n.tagName === "a" && attrs(n).href === "https://foliobruma.com" && text(n) === "Website"));
  assert.ok(walk(projects).some((n) => n.tagName === "a" && attrs(n).href === "/projects/"));
  assert.match(text(selected), /Notes.*French/s);
  assert.match(text(selected), /Video.*Slides.*Lab.*English/s);
  const homeText = text(home.nodes[0]);
  for (const filler of [
    "Selected talks, notes, recordings, and practical examples.",
    "I’m building tools to scan and preserve paper records.",
    "Topics I'm spending time on lately.",
  ]) assert.ok(!homeText.includes(filler), `Home must omit filler subtitle: ${filler}`);
  for (const value of [
    "AI-first development security",
    "Building guardrails for agentic workflows, LLM tooling, and developer AI assistants without slowing teams down.",
    "Security automation in delivery platforms",
    "Embedding practical controls across CI/CD pipelines, cloud infrastructure, and Kubernetes platforms so secure defaults are part of the path to production.",
    "Detection and response",
    "Improving cloud-native detection, SIEM coverage, and response workflows so incidents are easier to understand and faster to contain.",
    "Secure-by-default platform patterns",
    "Shaping architecture reviews, threat modeling, and platform guardrails that help engineering teams move quickly without accumulating security debt.",
  ]) assert.ok(homeText.includes(value), `Home must preserve exploration copy: ${value}`);
  assert.doesNotMatch(text(home.nodes[0]), /Sample content|Example project|titles to confirm/);
});

test("Talks and Projects indexes start directly with useful content", async () => {
  const talksIndex = await page("talks/index.html");
  const projectsText = text(projectsPage.nodes[0]);
  const talksText = text(talksIndex.nodes[0]);
  assert.ok(!projectsText.includes("Software I build to scan, preserve, and organize the paper records that matter."));
  assert.ok(!talksText.includes("Conference sessions, meetups, and field notes on cloud and software supply chain security."));
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
  assert.ok(
    walk(topResources).some(
      (n) =>
        n.tagName === "a" &&
        attrs(n).class.split(" ").includes("site-action") &&
        attrs(n).class.split(" ").includes("site-action-primary"),
    ),
    "Primary resource link lost its button style",
  );
  const aws = await page("talks/aws-summit-paris-2025/index.html");
  for (const current of [talk, aws]) {
    const resources = current.nodes.find((n) => attrs(n)["aria-label"] === "Session resources");
    for (const link of walk(resources).filter((n) => n.tagName === "a")) {
      if (attrs(link).class.split(" ").includes("site-action-primary"))
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
  assert.ok(stars.includes(`${dataset.total_repos} repositories`));
  assert.ok(stars.includes(`${count} topics`));
  const directory = await page("github-stars/index.html");
  assert.ok(Buffer.byteLength(directory.html) < 60000, "Stars directory must remain small");
  for (const group of dataset.groups.filter(g => g.repos.length)) {
    assert.ok(directory.nodes.some(n => attrs(n).href === `/github-stars/${group.slug}/`));
    const names = [];
    const count = Math.ceil(group.repos.length / 36);
    for (let number = 1; number <= count; number++) {
      const list = await page(`github-stars/${group.slug}/${number === 1 ? "" : `${number}/`}index.html`);
      assert.ok(Buffer.byteLength(list.html) < 200000, "Stars list page is too large");
      assert.ok(list.nodes.some(n => attrs(n)["data-radar-filter"] === group.slug), `Missing repository filter for ${group.slug}`);
      assert.ok(list.nodes.some(n => "data-radar-query" in attrs(n)), `Missing repository query for ${group.slug}`);
      const headings = list.nodes.filter(n => n.tagName === "h3");
      assert.ok(headings.length <= 36, "List pagination exceeded its bound");
      names.push(...headings.map(n => text(n).replace("↗", "").trim()));
    }
    assert.deepEqual(names, group.repos.map(repo => repo.full_name), `Missing or duplicated repository in ${group.slug}`);
  }
  assert.doesNotMatch(stars, /Starred repositories are unavailable/);
  assert.ok(radar.includes(`${count} topics`));
  assert.ok(radar.includes("Current signals"));
  const radarPage = await page("radar/index.html");
  for (const slug of ["security", "kubernetes", "supply-chain-security", "ci-cd", "mcp", "aws", "dev", "ai-ml"])
    assert.ok(radarPage.nodes.some((node) => attrs(node).href === `/github-stars/${slug}/`), `Radar is missing ${slug}`);
  assert.ok(radarPage.nodes.some((node) => node.tagName === "button" && "data-command-palette-open" in attrs(node)));
  assert.match(radarPage.html, /⌘ K/);
});

test("Generated pages have no Once UI assets or markup", async () => {
  const files = await readdir(output, { recursive: true });
  for (const file of files.filter((f) => /\.(html|css|js)$/.test(f)))
    assert.doesNotMatch(await load(file), /data-once-ui|@once-ui-system|once-ui-(?:provider|button|flex)/, file);
  const lock = await readFile(new URL("../package-lock.json", import.meta.url), "utf8");
  assert.doesNotMatch(lock, /@once-ui-system/);
});

test("Blog is honest, empty, and hidden from primary navigation until content exists", async () => {
  const blog = await page("blog/index.html");
  assert.match(text(blog.nodes[0]), /No posts yet/);
  assert.equal(blog.nodes.filter((n) => n.tagName === "h1").length, 1);
  const homeNav = home.nodes.find((n) => n.tagName === "nav" && attrs(n)["aria-label"] === "Main navigation");
  assert.ok(!walk(homeNav).some((n) => n.tagName === "a" && attrs(n).href === "/blog/"));
  const files = await readdir(output, { recursive: true });
  const postFiles = await readdir(new URL("../src/content/posts/", import.meta.url));
  assert.equal(postFiles.filter((f) => f.endsWith(".md")).length, 0);
  assert.ok(!files.some((f) => /^blog\/(ai-development|moving-to-canada|security-guardrails)\//.test(f)));
});

test("Primary navigation is consistent across Home, Blog, and talks", async () => {
  const blog = await page("blog/index.html");
  const expected = ["Talks", "Projects", "Radar", "About"];
  for (const current of [home, blog, talk]) {
    const nav = current.nodes.find((n) => n.tagName === "nav" && attrs(n)["aria-label"] === "Main navigation");
    assert.deepEqual(walk(nav).filter((n) => n.tagName === "a").slice(1).map(text), expected);
    assert.ok(walk(nav).some((n) => n.tagName === "a" && attrs(n).href === "/projects/"));
  }
});

test("Command-K opens a site-wide modal instead of leaving the page", async () => {
  for (const current of [home, await page("radar/index.html"), talk]) {
    const dialog = current.nodes.find((node) => node.tagName === "dialog" && attrs(node).id === "site-command-dialog");
    assert.ok(dialog, "Missing command dialog");
    const input = walk(dialog).find((node) => node.tagName === "input" && attrs(node)["data-command-input"] !== undefined);
    assert.equal(attrs(input).role, "combobox");
    assert.equal(attrs(input)["aria-controls"], "command-dialog-results");
    assert.ok(walk(dialog).some((node) => node.tagName === "ul" && attrs(node).role === "listbox"));
  }
  const homeHtml = await load("index.html");
  assert.match(homeHtml, /site-command:open/);
  assert.doesNotMatch(homeHtml, /searchParams\.set\("focus", "1"\)/);
});

test("Shared shell keeps route width stable and uses client navigation", async () => {
  for (const current of [home, await page("radar/index.html"), talk]) {
    for (const tag of ["header", "main", "footer"])
      assert.ok(current.nodes.some((node) => node.tagName === tag && attrs(node).class.split(" ").includes("site-shell")));
  }
  const cssFiles = (await readdir(new URL("../dist/_astro/", import.meta.url))).filter((file) => file.endsWith(".css"));
  const css = (await Promise.all(cssFiles.map((file) => load(`_astro/${file}`)))).join("\n");
  assert.match(css, /scrollbar-gutter:stable both-edges/);
  assert.match(css, /cubic-bezier\(\.22,1,\.36,1\)/);
  assert.doesNotMatch(css, /radial-gradient/);
  const homeOutput = await load("index.html");
  assert.match(homeOutput, /astro-view-transitions/);
  assert.match(homeOutput, /data-astro-transition-persist="site-header"/);
  assert.match(homeOutput, /data-site-nav-toggle/);
  assert.match(homeOutput, /data-site-nav-indicator/);
  assert.match(homeOutput, /data-reveal-group/);
});

test("Motion stays prominent on content pages and static on the resume", async () => {
  const radar = await page("radar/index.html");
  const resume = await page("resume/index.html");
  const homeBody = home.nodes.find((node) => node.tagName === "body");
  const radarBody = radar.nodes.find((node) => node.tagName === "body");
  const resumeBody = resume.nodes.find((node) => node.tagName === "body");
  assert.equal(attrs(homeBody)["data-motion"], "full");
  assert.equal(attrs(radarBody)["data-motion"], "subtle");
  assert.equal(attrs(resumeBody)["data-motion"], "static");
  assert.ok(radar.nodes.some((node) => attrs(node).class?.split(" ").includes("motion-card")));
});

test("Projects has a dedicated page with the public project list", () => {
  assert.equal(projectsPage.nodes.filter((n) => n.tagName === "h1").length, 1);
  assert.deepEqual(
    projectsPage.nodes.filter((n) => n.tagName === "h2" && attrs(n).id !== "project-list-heading").map(text),
    ["Foliobruma Scanner", "Foliobruma"],
  );
  for (const url of ["https://github.com/AEnguerrand/foliobruma-scanner", "https://foliobruma.com"])
    assert.ok(projectsPage.nodes.some((n) => n.tagName === "a" && attrs(n).href === url));
  const firstProjectImage = projectsPage.nodes.find((n) => n.tagName === "img" && attrs(n).src === "/projects/foliobruma-scanner-icon.png");
  assert.equal(attrs(firstProjectImage).loading, "eager");
  assert.equal(attrs(firstProjectImage).fetchpriority, "high");
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
    if (["index.html", "about/index.html", "resume/index.html"].includes(file)) {
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


// The review found heading and fragment issues outside the original two-page sample.
test("All generated pages keep ordered headings, unique IDs, valid fragments, and static output", () => {
  const byPath = new Map(builtPages.map(p => [new URL(canonical(p.nodes)).pathname, p]));
  for (const {file, html, nodes} of builtPages) {
    let previous = 0;
    for (const heading of nodes.filter(n => /^h[1-6]$/.test(n.tagName ?? ""))) {
      const level = Number(heading.tagName[1]);
      assert.ok(level <= previous + 1, `${file}: skipped heading before ${text(heading)}`);
      previous = level;
    }
    const ids = nodes.map(n => attrs(n).id).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
    for (const a of nodes.filter(n => n.tagName === "a")) {
      const href = attrs(a).href;
      if (!href || (!href.startsWith("/") && !href.startsWith("#"))) continue;
      const url = new URL(href, canonical(nodes));
      if (!url.hash) continue;
      const target = byPath.get(url.pathname);
      assert.ok(target?.nodes.some(n => attrs(n).id === decodeURIComponent(url.hash.slice(1))), `${file}: missing fragment ${href}`);
    }
    assert.doesNotMatch(html, /<astro-island/, `${file}: unexpected hydration`);
  }
});

test("Review fixes keep the concise Home introduction, talks list, and search state", async () => {
  assert.match(text(home.nodes[0]), /I'm a Senior Platform Security Engineer based in Vancouver. Here I share talks, notes, and the software I'm building./);
  const archive = await page("talks/index.html");
  assert.equal(archive.nodes.filter(n => n.tagName === "h3").length, 5);
  for (const heading of archive.nodes.filter(n => n.tagName === "h3"))
    assert.equal(walk(heading).filter(n => n.tagName === "a").length, 1);
  const search = await page("search/index.html");
  assert.equal(search.nodes.filter(n => attrs(n)["aria-pressed"] === "true").length, 1);
  assert.equal(search.nodes.filter(n => "data-search-filter" in attrs(n)).length, 4);
  assert.ok(search.nodes.some(n => attrs(n).role === "status" && attrs(n)["aria-live"] === "polite"));
  for (const current of builtPages.filter(p => p.file.startsWith("talks/") && p.file !== "talks/index.html")) {
    assert.ok(!graph(current.nodes).some(n => n["@type"] === "VideoObject"), "Do not publish recording metadata with an unverified upload date");
    assert.doesNotMatch(current.html, /https:\/\/github.com\/AEnguerrand\/kubecon-cloudnativecon-china-2024-supply-chain-security["<]/);
    const actions = current.nodes.find(n => attrs(n)["aria-label"] === "Session resources");
    assert.ok(walk(actions).filter(n => n.tagName === "a").length <= 2, "Talk header has too many actions");
  }
});
