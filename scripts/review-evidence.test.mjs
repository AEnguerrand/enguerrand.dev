import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { snapshotOutput } from "./lib/review-browser.mjs";
import { getChangedFiles, getHumanReviewPaths, getWhitespaceChecks } from "./lib/review-git.mjs";

async function withFixture(prefix, callback) {
  const root = await mkdtemp(join(tmpdir(), prefix));
  try { await callback(root); } finally { await rm(root, { recursive: true, force: true }); }
}

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, `${args.join(" ")}: ${result.error ?? ""}\n${result.stderr}`);
  return result.stdout.trim();
}

function initGit(root) {
  git(root, "init", "--quiet");
  for (const [key, value] of Object.entries({
    "user.name": "Review fixture", "user.email": "fixture@example.invalid",
    "commit.gpgsign": "false", "core.hooksPath": "/dev/null", "core.quotePath": "true",
  })) git(root, "config", key, value);
}

const htmlEscape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

test("rendered evidence detects changes to significant code whitespace", async (t) => {
  for (const [name, before, after] of [
    ["indentation", "if ready:\n    deploy()\n", "if ready:\ndeploy()\n"],
    ["tabs", "if ready:\n\tdeploy()\n", "if ready:\n    deploy()\n"],
    ["blank lines", "deploy()\n\nverify()\n", "deploy()\nverify()\n"],
    ["trailing spaces", "deploy()  \n", "deploy()\n"],
  ]) {
    await t.test(name, async () => withFixture("review-code-", async (root) => {
      const snapshots = [];
      for (const [label, code] of [["base", before], ["candidate", after]]) {
        const dist = join(root, label, "dist"), output = join(root, label, "output");
        await mkdir(dist, { recursive: true });
        await mkdir(output);
        // Syntax-highlighting spans must not lose the whitespace between tokens.
        await writeFile(join(dist, "index.html"), `<html><head><title>Example</title></head><body><main><h1>Example</h1><pre><code><span>${htmlEscape(code)}</span></code></pre></main></body></html>`);
        await snapshotOutput(dist, output);
        snapshots.push(JSON.parse(await readFile(join(output, "text-and-links.json"), "utf8")));
      }
      assert.equal(snapshots[0][0].content, snapshots[1][0].content, "Normalized prose alone would miss this change");
      assert.deepEqual(snapshots[0][0].codeBlocks, [before]);
      assert.deepEqual(snapshots[1][0].codeBlocks, [after]);
      assert.notDeepEqual(snapshots[0], snapshots[1], "Review evidence must show the code change");
    }));
  }
});

test("author-content flags retain tracked, staged, and untracked special filenames", async () => {
  await withFixture("review-paths-", async (root) => {
    initGit(root);
    await mkdir(join(root, "src/content/posts"), { recursive: true });
    const tracked = "src/content/posts/café.md";
    const staged = "src/content/posts/résumé draft.md";
    const untracked = "src/content/posts/notes\tpart\none.md";
    await writeFile(join(root, tracked), "Original draft\n");
    git(root, "add", "--", tracked);
    git(root, "commit", "--quiet", "-m", "base");
    const base = git(root, "rev-parse", "HEAD");
    await writeFile(join(root, tracked), "Changed draft\n");
    await writeFile(join(root, staged), "Staged draft\n");
    git(root, "add", "--", staged);
    await writeFile(join(root, untracked), "Untracked draft\n");
    const expected = [tracked, staged, untracked].sort();
    const changed = getChangedFiles(root, base);
    assert.deepEqual(changed, expected);
    assert.deepEqual(getHumanReviewPaths(changed), expected);
  });
});

test("whitespace checks reject committed, unstaged, and staged errors", async () => {
  await withFixture("review-whitespace-", async (root) => {
    initGit(root);
    const file = join(root, "example.txt");
    await writeFile(file, "line\n");
    git(root, "add", ".");
    git(root, "commit", "--quiet", "-m", "base");
    const base = git(root, "rev-parse", "HEAD");
    function results() {
      const head = git(root, "rev-parse", "HEAD");
      return Object.fromEntries(getWhitespaceChecks(base, head).map(({ name, args }) => {
        const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
        assert.ok(result.status === 0 || result.status === 2, result.stderr);
        return [name, result.status];
      }));
    }
    const clean = { "revision-diff-check": 0, "diff-check": 0, "staged-diff-check": 0 };
    assert.deepEqual(results(), clean);
    await writeFile(file, "line \n");
    git(root, "add", ".");
    git(root, "commit", "--quiet", "-m", "committed whitespace");
    assert.equal(git(root, "status", "--porcelain"), "");
    assert.deepEqual(results(), { ...clean, "revision-diff-check": 2 });
    await writeFile(file, "line\n");
    git(root, "add", ".");
    git(root, "commit", "--quiet", "-m", "fix whitespace");
    assert.deepEqual(results(), clean);
    await writeFile(file, "line \n");
    assert.deepEqual(results(), { ...clean, "diff-check": 2 });
    git(root, "add", ".");
    assert.deepEqual(results(), { ...clean, "staged-diff-check": 2 });
  });
});
