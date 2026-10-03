// Behaviour of the tsc output parser and the TOON summary of `npm run typecheck -- --summary`.
// Run: node --test skill-sharpening/scripts/typecheck.test.mjs

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { parseArgs, parseListedFiles, parseTsc, reportedFiles, resolveScope, summarize } from "./typecheck.mjs";

const OUTPUT = [
  "b.mjs(3,5): error TS7006: Parameter 'x' implicitly has an 'any' type.",
  "a.mjs(10,1): error TS2322: Type 'string' is not assignable to type 'number'.",
  "  The expected type comes from property 'n'.",
  "b.mjs(9,2): error TS7006: Parameter 'y' implicitly has an 'any' type.",
  "a.mjs(12,4): error TS7006: Parameter 'z' implicitly has an 'any' type.",
  "error TS5023: Unknown compiler option 'foo'.",
  "",
].join("\n");

test("parseTsc reads located errors, config errors, and skips continuation lines", () => {
  const errors = parseTsc(OUTPUT);
  assert.equal(errors.length, 5);
  assert.deepEqual(errors[1], { file: "a.mjs", line: 10, col: 1, code: "TS2322", message: "Type 'string' is not assignable to type 'number'." });
  assert.deepEqual(errors[4], { file: "", line: 0, col: 0, code: "TS5023", message: "Unknown compiler option 'foo'." });
});

test("summarize counts by code and file, largest first with ties by name, and keeps tsc order in first", () => {
  const out = summarize(parseTsc(OUTPUT), { first: 2 }).text;
  assert.match(out, /^status: fail\n/);
  assert.match(out, /totals:\n  errors: 5\n  files: 3\n/);
  assert.match(out, /by_code\[3\]\{code,count,example\}:\n  TS7006,3,Parameter 'x' implicitly has an 'any' type\.\n  TS2322,1,.*\n  TS5023,1,/);
  assert.match(out, /first\[2\]\{file_line,code,message\}:\n  "b\.mjs:3:5",TS7006,.*\n  "a\.mjs:10:1",TS2322,/);
  assert.match(out, /log: \.typecheck\/tsc\.log/);
  assert.match(out, /--summary --file a\.mjs/);
});

test("summarize sorts files deterministically", () => {
  const out = summarize(parseTsc(OUTPUT)).text;
  assert.match(out, /by_file\[3\]\{file,count\}:\n  a\.mjs,2\n  b\.mjs,2\n  \(config\),1\n/);
});

test("summarize of no errors passes with no tables or hints", () => {
  assert.deepEqual(summarize([]), { text: "status: pass\nverdict: all errors\nscope: all\ntotals:\n  errors: 0\n  files: 0\nlog: .typecheck/tsc.log", code: 0 });
});

test("parseArgs accepts the summary flags and refuses bad usage", () => {
  assert.deepEqual(parseArgs([]), { summary: false, first: 20, scopeVerdict: false });
  assert.deepEqual(parseArgs(["--summary", "--file", "a.mjs", "--since", "main", "--first", "5", "--scope-verdict"]), { summary: true, file: "a.mjs", since: "main", first: 5, scopeVerdict: true });
  assert.throws(() => parseArgs(["--summary", "--scope-verdict"]), /needs --file or --since/);
  assert.throws(() => parseArgs(["--file", "a.mjs"]), /need --summary/);
  assert.throws(() => parseArgs(["--summary", "--file"]), /needs a value/);
  assert.throws(() => parseArgs(["--summary", "--first", "x"]), /whole number/);
  assert.throws(() => parseArgs(["--bogus"]), /unknown argument/);
});

test("reportedFiles maps a page to its copied inline scripts, keeps other paths and errors without a location", () => {
  const page = "generate-visualization/examples/anscombe-quartet/index.html";
  assert.deepEqual([...reportedFiles([page, "a.mjs"])], ["", page, ".typecheck/inline/generate-visualization-examples-anscombe-quartet-index-html.js", "a.mjs"]);
});

test("summarize points the --file hint at the top real file, never (config), and quotes odd paths", () => {
  const out = summarize(parseTsc("error TS5023: a\nerror TS5023: b\nmy dir/x.mjs(1,1): error TS7006: c\n")).text;
  assert.match(out, /--summary --file 'my dir\/x\.mjs'`/);
  assert.doesNotMatch(out, /--file \(config\)/);
});

// False-pass cases: a filter that matches nothing must never turn errors elsewhere into a pass.
test("a filter that matches nothing still fails on errors outside the scope and counts them", () => {
  const { text, code } = summarize(parseTsc("b.mjs(1,1): error TS7006: x\n"), { scope: reportedFiles(["a.mjs"]), label: "file a.mjs" });
  assert.equal(code, 1);
  assert.match(text, /^status: fail\nverdict: all errors\nscope: file a\.mjs\ntotals:\n  errors: 1\n  files: 1\nscoped:\n  errors: 0\n  files: 0\n  outside_scope: 1\n/);
  assert.match(text, /1 errors are outside the scope/);
});

test("--scope-verdict judges the scope alone and says so with the count outside it", () => {
  const { text, code } = summarize(parseTsc("b.mjs(1,1): error TS7006: x\n"), { scope: reportedFiles(["a.mjs"]), label: "file a.mjs", scopeVerdict: true });
  assert.equal(code, 0);
  assert.match(text, /^status: pass\nverdict: scoped verdict\n/);
  assert.match(text, /outside_scope: 1\n/);
});

test("parseListedFiles keeps the absolute --listFiles lines as repository paths", () => {
  assert.deepEqual([...parseListedFiles("/r/a.mjs\nb.mjs(1,1): error TS1: x\n/r/.typecheck/inline/p.js\n", "/r")], ["a.mjs", ".typecheck/inline/p.js"]);
});

/** @type {string[]} */
const roots = [];
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

// A git repository with a.mjs and notes.txt committed, for resolveScope.
function repo() {
  const root = mkdtempSync(join(tmpdir(), "typecheck-scope-"));
  roots.push(root);
  const git = (/** @type {string[]} */ ...a) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd: root, stdio: "ignore" });
  git("init", "-q");
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "a.mjs"), "export const a = 1;\n");
  writeFileSync(join(root, "notes.txt"), "x\n");
  git("add", ".");
  git("commit", "-qm", "base");
  return { root, git };
}

test("resolveScope refuses a missing path, a directory, and a file tsc does not check", () => {
  const { root } = repo();
  const checked = new Set(["a.mjs"]);
  assert.throws(() => resolveScope(root, { file: "missing.mjs" }, checked), /no such file/);
  assert.throws(() => resolveScope(root, { file: "src" }, checked), /no such file/);
  assert.throws(() => resolveScope(root, { file: "../outside.mjs" }, checked), /no such file/);
  assert.throws(() => resolveScope(root, { file: "notes.txt" }, checked), /tsc does not check this file/);
  assert.deepEqual(resolveScope(root, { file: "a.mjs" }, checked).label, "file a.mjs");
  // An absolute path through a symlinked parent (macOS /var, /tmp) names the same file.
  const linkDir = mkdtempSync(join(tmpdir(), "typecheck-link-"));
  roots.push(linkDir);
  const link = join(linkDir, "repo");
  symlinkSync(root, link);
  assert.deepEqual(resolveScope(realpathSync(root), { file: join(link, "a.mjs") }, checked).label, "file a.mjs");
});

test("resolveScope refuses an unknown ref", () => {
  const { root } = repo();
  assert.throws(() => resolveScope(root, { since: "no-such-ref" }, new Set()), /not a git commit or ref/);
});

test("resolveScope keeps a file renamed since the ref under its new name", () => {
  const { root, git } = repo();
  renameSync(join(root, "a.mjs"), join(root, "b.mjs"));
  git("add", "-A");
  const { scope } = resolveScope(root, { since: "HEAD" }, new Set(["b.mjs"]));
  assert.ok(scope?.has("b.mjs"));
  const { code } = summarize(parseTsc("b.mjs(1,1): error TS7006: x\n"), { scope, scopeVerdict: true });
  assert.equal(code, 1);
});
