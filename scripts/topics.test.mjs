import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { z } from "astro/zod";

function loadSource(path, dependencies = {}) {
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

const topics = loadSource("src/lib/topics.ts");
const seo = loadSource("src/lib/seo.ts", { "./topics": topics });
const { getTalkPresentation } = loadSource("src/lib/talk-presentation.ts", { "./topics": topics, "./seo": seo });
const schema = loadSource("src/content.config.ts", {
  "astro:content": { defineCollection: (value) => value },
  "astro/loaders": { glob: (value) => value },
  "astro/zod": { z },
}).collections.talks.schema;

const legacyTopics = [
  "aws", "aws-summit", "cloudnativecon", "cloud security", "compliance",
  "cryptocurrency", "javascript", "kubecon", "ledger", "npm", "owasp",
  "phishing", "security", "software supply chain security", "supply chain", "wiz",
];

test("supply chain aliases combine talks without counting a talk twice", () => {
  const talks = [
    { data: { tags: ["supply chain", "npm"] } },
    { data: { tags: ["software supply chain security", "kubecon"] } },
    { data: { tags: ["supply chain", "software supply chain security"] } },
  ];
  const counts = topics.countTopics(talks);
  assert.equal(counts.find(({ name }) => name === "software supply chain security").count, 3);
  assert.equal(counts.some(({ name }) => name === "supply chain"), false);
  assert.equal(topics.topicHref("supply chain"), "/topics/software-supply-chain-security/");
  assert.deepEqual(topics.canonicalTopics(["Supply Chain", "software supply chain security"]), ["software supply chain security"]);
});

test("all previous topic routes stay available, including aliases after source tag changes", () => {
  const routes = topics.topicRoutes(legacyTopics);
  assert.equal(routes.length, legacyTopics.length);
  for (const topic of legacyTopics) {
    assert.ok(routes.some((route) => route.slug === topics.topicSlug(topic)), topic);
  }
  const canonicalOnly = topics.topicRoutes(["software supply chain security"]);
  assert.deepEqual(canonicalOnly.map(({ slug }) => slug).sort(), ["software-supply-chain-security", "supply-chain"]);
  assert.equal(topics.topicTitle("supply chain"), "Supply Chain");
  assert.equal(topics.topicDescription("supply chain"), topics.topicDescriptions["supply chain"]);
});

test("subject browsing separates tool, event, and organisation tags", () => {
  for (const topic of ["cloud security", "supply chain", "phishing", "compliance"]) {
    assert.equal(topics.topicKind(topic), "subject");
  }
  for (const topic of ["aws", "javascript", "npm", "wiz"]) {
    assert.equal(topics.topicKind(topic), "technology");
  }
  for (const topic of ["aws-summit", "cloudnativecon", "kubecon", "ledger", "owasp"]) {
    assert.equal(topics.topicKind(topic), "community");
  }
  assert.deepEqual(topics.canonicalTopics(["kubecon", "cloudnativecon"]), ["kubecon", "cloudnativecon"]);
});

const baseTalk = { id: "example", data: { title: "Example", date: "2024-08-21" } };

test("legacy mixed language metadata does not become a spoken-language claim", () => {
  const result = getTalkPresentation({ ...baseTalk, data: {
    ...baseTalk.data, language: ["English", "Chinese"], notesLanguages: ["English"],
  } });
  assert.deepEqual(result.talkMetadata, [{ label: "Notes language", value: "English" }]);
});

test("session, notes, and translated slide languages stay distinct", () => {
  const result = getTalkPresentation({ ...baseTalk, data: {
    ...baseTalk.data,
    sessionLanguages: ["French"],
    notesLanguages: ["English"],
    resources: [
      { label: "English Slides", url: "https://example.test/english.pdf", language: "English" },
      { label: "Chinese Slides", url: "https://example.test/chinese.pdf", language: "Chinese", translation: "automatic" },
    ],
  } });
  assert.deepEqual(result.talkMetadata, [
    { label: "Session language", value: "French" },
    { label: "Notes language", value: "English" },
    { label: "Slides language", value: "English, Chinese (automatic translation)" },
  ]);
  assert.equal(result.resources[1].label, "Chinese Slides");
  assert.equal(result.resources[1].displayLabel, "Chinese Slides (automatic translation)");
  assert.equal(result.resources[1].url, "https://example.test/chinese.pdf");
});

test("talk schema validates the separate language and translation fields", () => {
  assert.equal(schema.safeParse({ ...baseTalk.data, notesLanguages: [""] }).success, false);
  assert.equal(schema.safeParse({ ...baseTalk.data, sessionLanguages: ["French"] }).success, true);
  assert.equal(schema.safeParse({ ...baseTalk.data, resources: [
    { label: "Slides", url: "https://example.test/slides.pdf", language: "Chinese", translation: "unknown" },
  ] }).success, false);
});


test("canonical URLs consolidate topic aliases without changing other routes", () => {
  const site = new URL("https://enguerrand.dev");
  assert.equal(seo.canonicalUrl("/topics/supply-chain?from=nav#talks", site), "https://enguerrand.dev/topics/software-supply-chain-security/");
  for (const path of ["/", "/talks/", "/topics/software-supply-chain-security/", "/404.html"])
    assert.equal(seo.canonicalUrl(path, site), `https://enguerrand.dev${path}`);
  assert.equal(seo.socialImagePath("/topics/supply-chain/"), "/og/topics/software-supply-chain-security/index.png");
  assert.equal(seo.socialImagePath("/"), "/og/index.png");
  assert.equal(seo.socialImagePath("/index/"), "/og/index/index.png");
});
