import { constants } from "node:fs";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Build the real pages in a temporary copy. Never add fixtures to the author's posts.
test("production builds cover empty, unpublished, and mixed blog content", { timeout: 240_000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), "website-publication-"));
  try {
    for (const name of ["src", "public", "astro.config.mjs", "package.json", "package-lock.json", "tsconfig.json", "tailwind.config.cjs", "postcss.config.cjs"])
      await cp(join(root, name), join(fixture, name), {
        recursive: true,
        filter: (source) => source !== join(root, "src/content/posts"),
      });
    // Astro compiles dependency .astro files relative to the fixture root.
    // Copy dependencies with clone-on-write where available; an external symlink breaks that root.
    await cp(join(root, "node_modules"), join(fixture, "node_modules"), {
      recursive: true, verbatimSymlinks: true, mode: constants.COPYFILE_FICLONE,
    });
    await mkdir(join(fixture, "scripts"));
    await cp(join(root, "scripts/site-output.test.mjs"), join(fixture, "scripts/site-output.test.mjs"));
    const posts = join(fixture, "src/content/posts");
    await mkdir(posts, { recursive: true });
    const post = (title, fields) => `---\ntitle: "${title}"\ndescription: "Publication test fixture."\n${fields}\n---\n\nSynthetic test content.\n`;
    const hidden = {
      "fixture-default-draft": post("FIXTURE DEFAULT DRAFT", ""),
      "fixture-explicit-draft": post("FIXTURE EXPLICIT DRAFT", "draft: true\npublishDate: \"2000-01-01\""),
      "fixture-future": post("FIXTURE FUTURE POST", "draft: false\npublishDate: \"9999-12-31\""),
    };
    for (const state of ["empty", "unpublished", "mixed"]) {
      if (state === "unpublished")
        for (const [id, content] of Object.entries(hidden)) await writeFile(join(posts, `${id}.md`), content);
      if (state === "mixed")
        await writeFile(join(posts, "fixture-published.md"), post("FIXTURE PUBLISHED POST", "draft: false\npublishDate: \"2000-01-01\""));
      await rm(join(fixture, ".astro"), { recursive: true, force: true });
      const build = spawnSync("npm", ["run", "build"], {
        cwd: fixture, encoding: "utf8", timeout: 70_000, maxBuffer: 20 * 1024 * 1024,
        env: { ...process.env, NODE_ENV: "production", ASTRO_TELEMETRY_DISABLED: "1" },
      });
      assert.equal(build.status, 0, `${state}: ${build.error ?? ""}\n${build.stdout}\n${build.stderr}`);
      const dist = join(fixture, "dist");
      const files = await readdir(dist, { recursive: true });
      const htmlFiles = files.filter((name) => name.endsWith(".html"));
      const allHtml = (await Promise.all(htmlFiles.map((file) => readFile(join(dist, file), "utf8")))).join("\n");
      const sitemap = await readFile(join(dist, "sitemap-0.xml"), "utf8");
      for (const id of Object.keys(hidden)) {
        assert.ok(!files.some((file) => file.startsWith(`blog/${id}/`)), `${state}: leaked route ${id}`);
        assert.ok(!allHtml.includes(id), `${state}: leaked listing or search item ${id}`);
        const title = hidden[id].match(/title: "([^"]+)"/)[1];
        assert.ok(!allHtml.includes(title), `${state}: leaked text ${title}`);
        assert.ok(!sitemap.includes(id), `${state}: leaked sitemap item ${id}`);
      }
      const blog = await readFile(join(dist, "blog/index.html"), "utf8");
      assert.equal(blog.includes("No posts yet"), state !== "mixed", state);
      if (state === "mixed") {
        assert.ok(files.includes("blog/fixture-published/index.html"));
        for (const file of ["index.html", "blog/index.html", "search/index.html"])
          assert.ok((await readFile(join(dist, file), "utf8")).includes("/blog/fixture-published/"), `${file}: missing published post`);
        assert.ok(sitemap.includes("https://enguerrand.dev/blog/fixture-published/"));
        const article = await readFile(join(dist, "blog/fixture-published/index.html"), "utf8");
        assert.match(article, /BlogPosting/);
        const checks = spawnSync(process.execPath, ["--test", "scripts/site-output.test.mjs"], {
          cwd: fixture, encoding: "utf8", timeout: 30_000, maxBuffer: 5 * 1024 * 1024,
        });
        assert.equal(checks.status, 0, `Published-content output checks: ${checks.stdout}\n${checks.stderr}`);
      }
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
