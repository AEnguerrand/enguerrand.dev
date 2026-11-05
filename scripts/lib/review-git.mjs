import { execFileSync } from "node:child_process";

// Keep raw output for NUL-delimited paths and porcelain status.
export function gitOutput(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

export function getChangedFiles(cwd, base) {
  const tracked = gitOutput(cwd, "diff", "--name-only", "-z", base, "--");
  const untracked = gitOutput(cwd, "ls-files", "--others", "--exclude-standard", "-z");
  return [...new Set([...tracked.split("\0"), ...untracked.split("\0")].filter(Boolean))].sort();
}

export function getHumanReviewPaths(files) {
  return files.filter((file) => /^(src\/content\/|src\/lib\/posts\.ts|src\/content\.config\.ts|src\/pages\/blog\/|src\/layouts\/|scripts\/|\.github\/|AGENTS\.md|package(?:-lock)?\.json|astro\.config\.mjs|wrangler\.toml)/.test(file));
}

export function getWhitespaceChecks(base, head) {
  return [
    { name: "revision-diff-check", args: ["diff", "--check", base, head, "--"] },
    { name: "diff-check", args: ["diff", "--check"] },
    { name: "staged-diff-check", args: ["diff", "--cached", "--check"] },
  ];
}
