import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { captureBrowser, snapshotOutput } from "./lib/review-browser.mjs";
import { getChangedFiles, getHumanReviewPaths, getWhitespaceChecks, gitOutput } from "./lib/review-git.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const { values } = parseArgs({ options: { base: { type: "string", default: "origin/main" } } });
const git = (...args) => gitOutput(root, ...args);
const base = git("rev-parse", "--verify", `${values.base}^{commit}`).trim();
const head = git("rev-parse", "HEAD").trim();
const output = join(root, "artifacts/site-review", `${new Date().toISOString().replaceAll(":", "-")}-${head.slice(0, 8)}`);
await mkdir(output, { recursive: true });
const files = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean).sort();
async function sourceHash() {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(`${file}\0`);
    try { hash.update(await readFile(join(root, file))); } catch (error) { if (error.code !== "ENOENT") throw error; hash.update("DELETED"); }
    hash.update("\0");
  }
  return hash.digest("hex");
}
const changedFiles = getChangedFiles(root, base);
const report = {
  base, head, sourceHash: await sourceHash(), workingTree: git("status", "--porcelain"),
  started: new Date().toISOString(), status: "running", changedFiles,
  humanReview: getHumanReviewPaths(changedFiles),
  checks: [],
  limits: ["Author content and publication decisions need human review.", "Chromium only; screenshots use reduced motion and fixed viewports.", "External requests are replaced with empty responses; live resources and video playback are not checked.", "Automated keyboard and structure checks do not prove full screen-reader support.", "No merge, deployment, branch-rule update, or content publication is performed."],
};
let baseline;
function step(name, command, args, cwd = root) {
  console.log(`Running ${name}`);
  const log = join(output, `${name}.log`);
  const result = spawnSync(command, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 300_000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  const details = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ? `\n${result.error.message}` : ""}`;
  // Capture the process output before throwing so failed checks still have evidence.
  return writeFile(log, details).then(() => {
    report.checks.push({ name, command: [command, ...args], status: result.status === 0 ? "passed" : "failed", log: `${name}.log` });
    if (result.status !== 0) throw new Error(`${name} failed. See ${log}`);
  });
}
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
try {
  for (const check of getWhitespaceChecks(base, head))
    await step(check.name, "git", check.args);
  await step("check-site", "npm", ["run", "check:site"]);
  await step("build", "npm", ["run", "build"]);
  await step("test-site", "npm", ["run", "test:site"]);
  baseline = await mkdtemp(join(tmpdir(), "website-review-base-"));
  const archive = execFileSync("git", ["archive", base], { cwd: root, maxBuffer: 128 * 1024 * 1024 });
  execFileSync("tar", ["-x", "-C", baseline], { input: archive });
  await step("base-install", "npm", ["ci", "--no-audit", "--no-fund"], baseline);
  await step("base-build", "npm", ["run", "build"], baseline);
  for (const [label, dist] of [["base", join(baseline, "dist")], ["candidate", join(root, "dist")]]) {
    const destination = join(output, label);
    await mkdir(destination);
    const pageCount = await snapshotOutput(dist, destination);
    console.log(`Capturing ${label}: ${pageCount} built pages, 15 browser views`);
    report[label === "base" ? "baseline" : label] = { pageCount, ...await captureBrowser(dist, destination, label === "candidate") };
  }
  const diff = spawnSync("git", ["diff", "--no-index", "--text", "--", join(output, "base/text-and-links.json"), join(output, "candidate/text-and-links.json")], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  if (![0, 1].includes(diff.status)) throw new Error(`Text diff failed: ${diff.stderr}`);
  await writeFile(join(output, "text-and-links.diff"), diff.stdout);
  await cp(join(root, "dist"), join(output, "preview"), { recursive: true });
  report.checks.push({ name: "browser", status: report.candidate.results.every((item) => item.status === "passed") ? "passed" : "failed" });
  if (report.checks.at(-1).status === "failed") throw new Error("Candidate browser checks failed. See candidate/checks.json");
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error.message;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (await sourceHash() !== report.sourceHash || git("status", "--porcelain") !== report.workingTree) {
    report.status = "failed";
    report.error = "Source changed during validation. Run review:site again on stable source.";
    process.exitCode = 1;
  }
  report.finished = new Date().toISOString();
  await writeFile(join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  const summary = `# Site review: ${report.status}\n\nBase: ${base}\n\nCandidate HEAD: ${head}\n\nSource SHA-256: ${report.sourceHash}\n\nWorking tree: ${report.workingTree ? "has uncommitted changes; this report is not proof for HEAD alone" : "clean"}\n\n${report.error ?? ""}\n\n## Checks\n\n${report.checks.map((item) => `- ${item.name}: ${item.status}`).join("\n")}\n\n## Human review paths\n\n${report.humanReview.map((file) => `- ${file}`).join("\n") || "None detected. This does not constitute approval."}\n\n## Limits\n\n${report.limits.map((item) => `- ${item}`).join("\n")}\n\nOpen review.html for images. Read text-and-links.diff for rendered text, metadata, structured data, and link changes. Full details are in report.json. Checks after the first failure are not run.\n`;
  await writeFile(join(output, "summary.md"), summary);
  const images = (report.candidate?.results ?? []).map((item) => `<section><h2>${escape(item.route)} at ${item.width}px</h2><p>${escape(item.status)} ${escape(item.errors.join("; "))}</p><div class="pair">${["base", "candidate"].map((label) => `<figure><figcaption>${label}</figcaption><a href="${label}/${item.screenshot}"><img loading="lazy" src="${label}/${item.screenshot}" alt="${label}: ${escape(item.route)} at ${item.width}px"></a></figure>`).join("")}</div>${item.trace ? `<a href="candidate/${item.trace}">Candidate trace</a>` : ""}</section>`).join("");
  await writeFile(join(output, "review.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Site review</title><style>body{font:16px system-ui;max-width:1200px;margin:2rem auto;padding:1rem}pre{white-space:pre-wrap;overflow-wrap:anywhere}.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem}figure{margin:0}img{width:100%;border:1px solid #aaa}section{margin:3rem 0}a:focus-visible{outline:3px solid blue}</style><h1>Site review: ${escape(report.status)}</h1><p><a href="summary.md">Summary</a> · <a href="report.json">Full report</a> · <a href="text-and-links.diff">Text and link diff</a></p><pre>${escape(summary)}</pre>${images}</html>`);
  if (baseline) await rm(baseline, { recursive: true, force: true });
  console.log(`Review package: ${resolve(output)}`);
}
