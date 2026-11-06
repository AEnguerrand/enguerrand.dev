import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/site-review.yml", import.meta.url), "utf8");
const runBlock = workflow.match(/        id: revisions\n[\s\S]*?        run: \|\n((?:          [^\n]*\n)+)/)?.[1];
assert.ok(runBlock, "The workflow must resolve revisions before it runs project code");
const script = runBlock.replace(/^          /gm, "");

function git(root, ...args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, `${args.join(" ")}: ${result.stderr}`);
  return result.stdout.trim();
}

async function withFixture(callback) {
  const root = await mkdtemp(join(tmpdir(), "review-workflow-"));
  try {
    git(root, "init", "--quiet", "--initial-branch=fixture");
    for (const [key, value] of Object.entries({
      "user.name": "Review fixture", "user.email": "fixture@example.invalid",
      "commit.gpgsign": "false", "core.hooksPath": "/dev/null",
    })) git(root, "config", key, value);
    git(root, "commit", "--quiet", "--allow-empty", "-m", "base");
    const base = git(root, "rev-parse", "HEAD");
    git(root, "update-ref", "refs/remotes/origin/codex/stack-base", base);
    git(root, "tag", "-a", "review-base", "-m", "Annotated base");
    git(root, "commit", "--quiet", "--allow-empty", "-m", "candidate");
    const head = git(root, "rev-parse", "HEAD");
    const output = join(root, "step-output"), summary = join(root, "step-summary");
    const run = async (event, overrides = {}) => {
      await rm(join(root, "artifacts"), { recursive: true, force: true });
      await writeFile(output, "");
      await writeFile(summary, "");
      return spawnSync("bash", ["-c", script], {
        cwd: root, encoding: "utf8", env: {
          ...process.env,
          GITHUB_EVENT_NAME: event, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary,
          REVIEW_EXPECTED_HEAD: head, REVIEW_PR_BASE: base, REVIEW_PUSH_BASE: base,
          REVIEW_BASE_INPUT: "", ...overrides,
        },
      });
    };
    await callback({ root, base, head, output, summary, run });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("review revisions keep event SHAs and resolve explicit manual refs", async (t) => {
  await withFixture(async ({ root, base, head, output, summary, run }) => {
    for (const [name, event, overrides] of [
      ["stacked PR", "pull_request", { REVIEW_BASE_INPUT: "ignored" }],
      ["push", "push", {}],
      ["manual branch", "workflow_dispatch", { REVIEW_BASE_INPUT: "codex/stack-base" }],
      ["manual heads ref", "workflow_dispatch", { REVIEW_BASE_INPUT: "refs/heads/codex/stack-base" }],
      ["manual remote ref", "workflow_dispatch", { REVIEW_BASE_INPUT: "refs/remotes/origin/codex/stack-base" }],
      ["manual annotated tag", "workflow_dispatch", { REVIEW_BASE_INPUT: "refs/tags/review-base" }],
      ["manual full SHA", "workflow_dispatch", { REVIEW_BASE_INPUT: base }],
    ]) {
      await t.test(name, async () => {
        const result = await run(event, overrides);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        assert.equal(await readFile(output, "utf8"), `base=${base}\nhead=${head}\n`);
        assert.deepEqual(JSON.parse(await readFile(join(root, "artifacts/site-review/revisions.json"), "utf8")), {
          event, base, head,
        });
        const text = await readFile(summary, "utf8");
        assert.ok(text.includes(base) && text.includes(head), "Summary records both exact revisions");
      });
    }
  });
});

test("review revisions fail closed for missing, unsafe, or identical revisions", async (t) => {
  await withFixture(async ({ root, base, head, output, run }) => {
    for (const [name, event, overrides] of [
      ["manual base missing", "workflow_dispatch", {}],
      ["manual base not found", "workflow_dispatch", { REVIEW_BASE_INPUT: "missing-branch" }],
      ["manual base equals candidate", "workflow_dispatch", { REVIEW_BASE_INPUT: head }],
      ["checkout differs from event", "pull_request", { REVIEW_EXPECTED_HEAD: base }],
      ["push has no previous commit", "push", { REVIEW_PUSH_BASE: "0".repeat(40) }],
      ["unsupported event", "pull_request_target", {}],
      ["command substitution", "workflow_dispatch", { REVIEW_BASE_INPUT: "$(touch injected)" }],
      ["backtick substitution", "workflow_dispatch", { REVIEW_BASE_INPUT: "`touch injected`" }],
      ["shell separator", "workflow_dispatch", { REVIEW_BASE_INPUT: "main;touch injected" }],
      ["output injection", "workflow_dispatch", { REVIEW_BASE_INPUT: "main\nhead=forged" }],
      ["revision expression", "workflow_dispatch", { REVIEW_BASE_INPUT: `${base}~0` }],
    ]) {
      await t.test(name, async () => {
        const result = await run(event, overrides);
        assert.notEqual(result.status, 0, "Invalid revisions must stop the job before project code runs");
        assert.equal(await readFile(output, "utf8"), "");
        await assert.rejects(access(join(root, "injected")), { code: "ENOENT" });
        await assert.rejects(access(join(root, "artifacts/site-review/revisions.json")), { code: "ENOENT" });
      });
    }
  });
});
