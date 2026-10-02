// Behaviour of the collection linter and frontmatter parser on small fixture collections.
// Run: node --test skill-sharpening/scripts/verify-collection.test.mjs

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/skills.mjs";
import { lintCollection } from "./verify-collection.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "verify-collection.mjs");
const BODY = "This body explains the workflow in enough words that the linter treats it as a real entry point for an agent.";
const roots = [];
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

// files: { "relative/path": "content" }. Returns the fixture repository root.
function collection(files) {
  const root = mkdtempSync(join(tmpdir(), "skills-lint-"));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

const skill = (name, description = `Use when testing the ${name} fixture.`, body = BODY) =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}\n`;
const router = (...names) => `---\nname: skills-router\ndescription: Use when choosing a skill.\n---\n\n${BODY}\n\n| Task | Skill |\n| --- | --- |\n${names.map((n) => `| x | \`${n}\` |`).join("\n")}\n`;
const rules = (findings) => findings.map((f) => `${f.rule} ${f.file}`);

test("a clean collection has no findings", () => {
  const root = collection({ "alpha/SKILL.md": skill("alpha"), "skills-router/SKILL.md": router("alpha"), "PROVENANCE.md": "`alpha` `skills-router`\n" });
  assert.deepEqual(lintCollection(root), { skillCount: 2, errors: [], warnings: [] });
});

test("layout, name, router and link errors are reported with their rules", () => {
  const root = collection({
    "alpha/SKILL.md": skill("wrong-name", undefined, `${BODY} See [missing](references/nope.md).`),
    "notes/readme.md": "stray directory",
    "beta/nested/SKILL.md": skill("nested"),
    "beta/SKILL.md": skill("beta"),
    "skills-router/SKILL.md": router("beta", "ghost"),
  });
  const { errors } = lintCollection(root);
  assert.deepEqual(rules(errors), [
    "layout/not-a-skill notes",
    "layout/nested-skill beta/nested/SKILL.md",
    "name/matches-directory alpha/SKILL.md",
    "links/unresolved alpha/SKILL.md",
    "router/unknown-skill skills-router/SKILL.md",
    "router/missing-skill alpha/SKILL.md",
  ]);
});

test("description rules: word limit, tags, duplicates and missing trigger", () => {
  const long = `Use when ${"word ".repeat(70).trim()}.`;
  const root = collection({
    "alpha/SKILL.md": skill("alpha", long),
    "beta/SKILL.md": skill("beta", "Use when <b>bold</b> things happen."),
    "gamma/SKILL.md": skill("gamma", "Shared text for testing."),
    "delta/SKILL.md": skill("delta", "Shared text for testing."),
  });
  const { errors, warnings } = lintCollection(root);
  assert.deepEqual(rules(errors), [
    "description/word-limit alpha/SKILL.md",
    "description/no-tags beta/SKILL.md",
    "description/duplicate gamma/SKILL.md", // skills load in directory order, so delta claims the text first
  ]);
  assert.deepEqual(rules(warnings), ["description/trigger delta/SKILL.md", "description/trigger gamma/SKILL.md"]);
});

test("warnings: thin body, missing mentioned path, provenance and non-executable scripts", () => {
  const root = collection({
    "alpha/SKILL.md": skill("alpha", undefined, "Too short. Open `references/absent.md`."),
    "alpha/scripts/run.sh": "#!/bin/sh\n",
    "alpha/scripts/ok.sh": "#!/bin/sh\n",
    "PROVENANCE.md": "nothing listed\n",
  });
  chmodSync(join(root, "alpha/scripts/ok.sh"), 0o755);
  const { errors, warnings } = lintCollection(root);
  assert.deepEqual(errors, []);
  assert.deepEqual(rules(warnings), [
    "entrypoint/empty-body alpha/SKILL.md",
    "paths/missing alpha/SKILL.md",
    "provenance/missing alpha/SKILL.md",
    "scripts/not-executable alpha/scripts/run.sh",
  ]);
});

test("agents/openai.yaml accepts known keys and rejects unknown or invalid ones", () => {
  const root = collection({
    "alpha/SKILL.md": skill("alpha"),
    "alpha/agents/openai.yaml": "policy:\n  allow_implicit_invocation: maybe\ninterface:\n  display_name: Alpha\n  colour: red\nextra:\n",
  });
  assert.deepEqual(lintCollection(root).errors.map((f) => f.message), [
    "allow_implicit_invocation must be true or false",
    "unknown key interface.colour",
    "unknown top-level key extra",
  ]);
});

test("the CLI fails on errors, and on warnings only under --strict", () => {
  const run = (root, ...args) => {
    try {
      return { code: 0, out: execFileSync("node", [SCRIPT, root, ...args], { encoding: "utf8", stdio: "pipe" }) };
    } catch (failure) {
      return { code: failure.status, out: failure.stdout };
    }
  };
  const warnOnly = collection({ "alpha/SKILL.md": skill("alpha", "No trigger words here.") });
  assert.equal(run(warnOnly).code, 0);
  assert.match(run(warnOnly).out, /^status: valid\nskills: 1\nerrors: 0 warnings: 1\n/);
  const strict = run(warnOnly, "--strict");
  assert.equal(strict.code, 1);
  assert.match(strict.out, /status: invalid\nskills: 1\nerrors: 0 warnings: 1 \(strict\)/);
  assert.equal(run(collection({ "alpha/SKILL.md": skill("beta") })).code, 1);
});

test("parseFrontmatter reads quoted, block and continued scalars, and reports bad lines", () => {
  const { fields, body, errors } = parseFrontmatter(
    "---\nname: 'it''s'\ndescription: >-\n  folded\n  text\nliteral: |\n  a\n  b\nquoted: \"x\\ty\"\nplain: one\n  two\nnot a key\n---\nBody\n",
  );
  assert.deepEqual(fields, { name: "it's", description: "folded text", literal: "a\nb", quoted: "x\ty", plain: "one two" });
  assert.equal(body, "Body\n");
  assert.deepEqual(errors, ["cannot parse frontmatter line 12: not a key"]);
  assert.deepEqual(parseFrontmatter("no frontmatter").errors, ["missing YAML frontmatter"]);
});
