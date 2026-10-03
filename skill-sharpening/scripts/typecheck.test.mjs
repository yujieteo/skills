// Behaviour of the tsc output parser and the TOON summary of `npm run typecheck -- --summary`.
// Run: node --test skill-sharpening/scripts/typecheck.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArgs, parseTsc, reportedFiles, summarize } from "./typecheck.mjs";

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
  const out = summarize(parseTsc(OUTPUT), { first: 2 });
  assert.match(out, /^status: fail\n/);
  assert.match(out, /totals:\n  errors: 5\n  files: 3\n/);
  assert.match(out, /by_code\[3\]\{code,count,example\}:\n  TS7006,3,Parameter 'x' implicitly has an 'any' type\.\n  TS2322,1,.*\n  TS5023,1,/);
  assert.match(out, /first\[2\]\{file_line,code,message\}:\n  "b\.mjs:3:5",TS7006,.*\n  "a\.mjs:10:1",TS2322,/);
  assert.match(out, /log: \.typecheck\/tsc\.log/);
  assert.match(out, /--summary --file a\.mjs/);
});

test("summarize sorts files deterministically", () => {
  const out = summarize(parseTsc(OUTPUT));
  assert.match(out, /by_file\[3\]\{file,count\}:\n  a\.mjs,2\n  b\.mjs,2\n  \(config\),1\n/);
});

test("summarize of no errors passes with no tables or hints", () => {
  const out = summarize([]);
  assert.equal(out, "status: pass\nscope: all\ntotals:\n  errors: 0\n  files: 0\nlog: .typecheck/tsc.log");
});

test("parseArgs accepts the summary flags and refuses bad usage", () => {
  assert.deepEqual(parseArgs([]), { summary: false, first: 20 });
  assert.deepEqual(parseArgs(["--summary", "--file", "a.mjs", "--since", "main", "--first", "5"]), { summary: true, file: "a.mjs", since: "main", first: 5 });
  assert.throws(() => parseArgs(["--file", "a.mjs"]), /need --summary/);
  assert.throws(() => parseArgs(["--summary", "--file"]), /needs a value/);
  assert.throws(() => parseArgs(["--summary", "--first", "x"]), /whole number/);
  assert.throws(() => parseArgs(["--bogus"]), /unknown argument/);
});

test("reportedFiles maps a page to its copied inline scripts and keeps other paths", () => {
  const page = "generate-visualization/examples/anscombe-quartet/index.html";
  assert.deepEqual([...reportedFiles([page, "a.mjs"])], [page, ".typecheck/inline/generate-visualization-examples-anscombe-quartet-index-html.js", "a.mjs"]);
});

test("summarize points the --file hint at the top real file, never (config), and quotes odd paths", () => {
  const out = summarize(parseTsc("error TS5023: a\nerror TS5023: b\nmy dir/x.mjs(1,1): error TS7006: c\n"));
  assert.match(out, /--summary --file 'my dir\/x\.mjs'`/);
  assert.doesNotMatch(out, /--file \(config\)/);
});
