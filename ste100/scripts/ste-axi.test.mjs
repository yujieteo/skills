// Behaviour of `ste-axi check`: one fixture text for each rule and each skip case, the report and the exit codes.
// Run: node --test ste100/scripts/ste-axi.test.mjs

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkText, isInstruction, main } from "./ste-axi.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "ste-axi.mjs");

/** @param {string} text */
const rules = (text) => checkText(text, "t.md").findings.map((f) => `${f.line}:${f.rule}:${f.detail}`);

test("a clean text gives no findings", () => {
  assert.deepEqual(rules("The test failed.\nRun the test again. If the check fails, stop the deploy.\n"), []);
});

test("long-descriptive flags a descriptive sentence over 25 words", () => {
  const long = "The report " + "has one more word ".repeat(6) + "and it ends here.";
  assert.deepEqual(rules(long), ["1:long-descriptive:30 words, max 25"]);
  assert.deepEqual(rules("The report " + "has one word ".repeat(7) + "and it."), []);
});

test("long-instruction flags an instruction over 20 words, also after a condition", () => {
  const steps = "Run the test " + "and the next test ".repeat(4) + "now please.";
  assert.deepEqual(rules(steps), ["1:long-instruction:21 words, max 20"]);
  assert.deepEqual(rules("If it fails, " + steps.toLowerCase()), ["1:long-instruction:24 words, max 20"]);
  assert.equal(isInstruction("When the check fails, stop the deploy."), true);
  assert.equal(isInstruction("The check fails."), false);
});

test("ing-form flags -ing verbs and keeps allowed nouns and technical names", () => {
  assert.deepEqual(rules("The worker is running the test."), ["1:ing-form:running"]);
  assert.deepEqual(rules("Add a warning string to the Running Header and the during_build flag."), []);
});

test("contraction flags short forms but not possessives", () => {
  assert.deepEqual(rules("Don't stop. It's late. The user's file is here."), ["1:contraction:Don't", "1:contraction:It's"]);
});

test("semicolon flags each semicolon", () => {
  assert.deepEqual(rules("The test failed; the deploy stopped."), ["1:semicolon:write two sentences"]);
});

test("passive flags be + past participle, regular and irregular, with an adverb between", () => {
  assert.deepEqual(rules("The PR was merged. The file is not written. The test is quickly done."), [
    "1:passive:was merged",
    "1:passive:is not written",
    "1:passive:is quickly done",
  ]);
});

test("noun-cluster flags more than 3 nouns in a row", () => {
  assert.deepEqual(rules("Read the validation pipeline status page header."), ["1:noun-cluster:validation pipeline status page header"]);
  assert.deepEqual(rules("Read the status of the validation run."), []);
});

test("approved-word gives the STE word to use instead", () => {
  assert.deepEqual(rules("We utilize the tool in order to initiate a demonstrated fix."), [
    "1:approved-word:utilize -> use",
    "1:approved-word:in order to -> to",
    "1:approved-word:initiate -> start",
    "1:approved-word:demonstrated -> show",
  ]);
});

test("skips fenced code, indented code, front matter and HTML", () => {
  const text = ["---", "name: it's running", "---", "", "```sh", "don't; it's running", "```", "", "    it's running", "", "<p>it's running</p>", "The test failed."].join("\n");
  assert.deepEqual(rules(text), []);
});

test("skips inline code, URLs, link targets and quoted text", () => {
  assert.deepEqual(rules("Run `don't; running` and see https://x.org/a;running or [the doc](a_running.md)."), []);
  assert.deepEqual(rules('The user said "it\'s running; don\'t stop" to me.'), []);
});

test("skips technical names with capitals, digits, dots or underscores", () => {
  assert.deepEqual(rules("The JSONParsing tool and v2ing and file.ing and set_ing pass."), []);
});

test("a dot, ! or ? in a word does not hide the words before it", () => {
  assert.deepEqual(rules("The worker is running and we don't stop; the package.json file was changed."), [
    "1:ing-form:running",
    "1:contraction:don't",
    "1:semicolon:write two sentences",
    "1:passive:was changed",
  ]);
  const long = "Version 1.2 of the tool " + "has one more word ".repeat(5) + "and it ends here.";
  assert.deepEqual(rules(long), ["1:long-descriptive:29 words, max 25"]);
  assert.deepEqual(rules("See Node.js docs.\nThe worker is running."), ["2:ing-form:running"]);
});

test("the lines of one quoted paragraph are one unit, and an empty quote line ends it", () => {
  const long = "The report " + "has one more word ".repeat(6) + "and it ends here.";
  const half = long.split(" ").slice(0, 12).join(" ");
  const rest = long.split(" ").slice(12).join(" ");
  assert.deepEqual(rules(`> ${half}\n> ${rest}\n`), ["1:long-descriptive:30 words, max 25"]);
  assert.deepEqual(rules(`> ${half}.\n>\n> ${rest}\n`), []);
});

test("an indented paragraph in a list item is prose, indented code after a paragraph is not", () => {
  assert.deepEqual(rules("- Run the test.\n\n    The worker is running.\n"), ["3:ing-form:running"]);
  assert.deepEqual(rules("The test failed.\n\n    it's running\n"), []);
});

test("reports the line of the word in a paragraph that spans lines", () => {
  const f = checkText("The first line is fine and\nthe worker is running.\n", "t.md").findings;
  assert.deepEqual(f.map((x) => [x.line, x.rule]), [[2, "ing-form"]]);
});

test("a list item, a heading and a table cell are separate units", () => {
  const text = "# Heading here\n- Run the test\n- Stop the deploy\n\n| Rule | Note |\n| --- | --- |\n| it's | fine |\n";
  assert.deepEqual(rules(text), ["7:contraction:it's"]);
});

test("the report puts findings first, then counts by rule, and exits 1", () => {
  const { text, code } = main(["check", "a.md"], () => "Don't stop; run.\n");
  assert.equal(code, 1);
  assert.match(text, /^status: fail\nfindings\[2\]\{file_line,rule,detail,text\}:\n  "a\.md:1",contraction,Don't,/);
  assert.match(text, /by_rule\[2\]\{rule,count\}:\n  contraction,1\n  semicolon,1\n/);
  assert.match(text, /totals:\n  inputs: 1\n  sentences: 1\n  findings: 2\n/);
});

test("a clean input exits 0 and --json gives the same findings", () => {
  assert.deepEqual(main(["check", "a.md"], () => "The test failed.\n"), { text: "status: pass\ntotals:\n  inputs: 1\n  sentences: 1\n  findings: 0", code: 0 });
  const out = main(["check", "--json", "a.md"], () => "It's late.\n");
  assert.equal(out.code, 1);
  assert.equal(JSON.parse(out.text).findings[0].rule, "contraction");
});

test("usage errors, empty and unreadable inputs exit 2, never a pass", () => {
  const read = () => "x";
  assert.equal(main([], read).code, 2);
  assert.equal(main(["lint", "a.md"], read).code, 2);
  assert.equal(main(["check"], read).code, 2);
  assert.equal(main(["check", "--bad", "a.md"], read).code, 2);
  assert.equal(main(["check", "a.md"], () => "  \n```\ncode\n```\n").code, 2);
  const missing = main(["check", "a.md"], () => {
    throw new Error("ENOENT");
  });
  assert.equal(missing.code, 2);
  assert.match(missing.text, /cannot read a\.md/);
});

test("the command line runs from a directory outside the skill", () => {
  const run = spawnSync(process.execPath, [SCRIPT, "check", "-"], { cwd: tmpdir(), input: "It's late.\n", encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /"stdin:1",contraction/);
  assert.doesNotMatch(run.stdout, /ste100\//);
});

test("the command line reads standard input for -", () => {
  const run = spawnSync(process.execPath, [SCRIPT, "check", "-"], { input: "It's late.\n", encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /"stdin:1",contraction/);
  const empty = spawnSync(process.execPath, [SCRIPT, "check", "-"], { input: "", encoding: "utf8" });
  assert.equal(empty.status, 2);
});
