import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import { z } from "astro/zod";

// Exercise the source without an Astro build or a content-store write.
function loadSource(path, dependencies) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.equal(result.diagnostics.length, 0, `${path}: TypeScript syntax`);
  const exports = {};
  new Function("require", "exports", result.outputText)((id) => {
    assert.ok(Object.hasOwn(dependencies, id), `Unexpected import: ${id}`);
    return dependencies[id];
  }, exports);
  return exports;
}

const schema = loadSource("src/content.config.ts", {
  "astro:content": { defineCollection: (value) => value },
  "astro/loaders": { glob: (value) => value },
  "astro/zod": { z },
}).collections.posts.schema;
const base = { title: "Example", description: "Example description" };
const entries = [
  { id: "future", data: { draft: false, publishDate: "2026-10-18" } },
  { id: "draft", data: { draft: true, publishDate: "2026-10-17" } },
  { id: "z", data: { draft: false, publishDate: "2026-10-17" } },
  { id: "a", data: { draft: false, publishDate: "2026-10-17" } },
  { id: "older", data: { draft: false, publishDate: "2026-10-16" } },
  { id: "missing", data: { draft: false } },
];
const posts = loadSource("src/lib/posts.ts", {
  "astro:content": { getCollection: async (name) => {
    assert.equal(name, "posts");
    return entries;
  } },
});
const now = new Date("2026-10-17T00:00:00.000Z");

test("posts default to draft and publication requires a date", () => {
  assert.equal(schema.parse(base).draft, true);
  assert.equal(schema.safeParse({ ...base, draft: false }).success, false);
  assert.equal(schema.safeParse({ ...base, draft: false, publishDate: "2026-10-17" }).success, true);
});

test("publication dates must be valid calendar dates", () => {
  for (const publishDate of ["2026-02-30", "2026-13-01", "2026-1-01", "invalid"]) {
    assert.equal(schema.safeParse({ ...base, publishDate }).success, false, publishDate);
  }
  assert.equal(schema.safeParse({ ...base, publishDate: "2028-02-29" }).success, true);
});

test("production selection excludes drafts, future posts, and missing dates", async () => {
  assert.deepEqual((await posts.getPosts({ now })).map((post) => post.id), ["a", "z", "older"]);
});

test("publication starts at midnight UTC", () => {
  const data = { draft: false, publishDate: "2026-10-17" };
  assert.equal(posts.isPublishedPost(data, new Date("2026-10-16T23:59:59.999Z")), false);
  assert.equal(posts.isPublishedPost(data, now), true);
});

test("explicit local preview includes unpublished entries", async () => {
  assert.equal((await posts.getPosts({ now, includeUnpublished: true })).length, entries.length);
});

test("date display uses UTC and links encode path segments", () => {
  assert.equal(posts.formatPostDate("2026-10-17"), "October 17, 2026");
  assert.equal(posts.postHref("hello world"), "/blog/hello%20world/");
});
