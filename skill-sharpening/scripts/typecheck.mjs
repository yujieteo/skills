#!/usr/bin/env node
// The `npm run typecheck` entry point: copies the example pages' inline scripts (extract-inline.mjs), then runs tsc.
// With no flags it prints tsc's own output. With --summary it writes the full tsc log to .typecheck/tsc.log and prints
// a short TOON verdict instead: totals, error counts by code and by file (largest first, ties by name), and the first
// errors in tsc's order. Exit codes: 0 no errors, 1 type errors, 2 usage or environment error.
// Usage: npm run typecheck [-- --summary [--file <path>] [--since <ref>] [--first <n>]], where --first defaults to 20
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PAGES = [
  "generate-slide-deck/assets/deck-shell.html",
  "generate-slide-deck/examples/fpl-early-season/index.html",
  "generate-visualization/examples/anscombe-quartet/index.html",
];
const LOG = ".typecheck/tsc.log";
const USAGE = "usage: npm run typecheck [-- --summary [--file <path>] [--since <ref>] [--first <n>, default 20]]";
export const INLINE_DIR = ".typecheck/inline/";

// The copy of a page's inline scripts that extract-inline.mjs writes and tsc reports errors under.
/** @param {string} page */
export const inlineFile = (page) => `${INLINE_DIR}${page.replace(/[^A-Za-z0-9]+/g, "-")}.js`;

// The file names tsc reports for these repository paths: a page also stands for its copied inline scripts, and
// the empty name of errors without a location is always kept, as those fail the check for every file.
/** @param {string[]} paths */
export const reportedFiles = (paths) => new Set(["", ...paths.flatMap((p) => (PAGES.includes(p) ? [p, inlineFile(p)] : [p]))]);

/** @param {string} path */
const shellArg = (path) => (/^[\w./-]+$/.test(path) ? path : `'${path.replaceAll("'", "'\\''")}'`);

/** @typedef {{ file: string, line: number, col: number, code: string, message: string }} TscError */

// Parses `tsc --pretty false` output. A diagnostic starts `file(line,col): error TSnnnn: message`; indented lines
// after it continue its message, and the first line is kept. Errors without a location (TS5xxx config errors) get file "".
/** @param {string} text @returns {TscError[]} */
export function parseTsc(text) {
  /** @type {TscError[]} */
  const errors = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(line) ?? /^()error (TS\d+): (.*)$/.exec(line);
    if (!m) continue;
    if (m.length === 6) errors.push({ file: m[1], line: Number(m[2]), col: Number(m[3]), code: m[4], message: m[5] });
    else errors.push({ file: "", line: 0, col: 0, code: m[2], message: m[3] });
  }
  return errors;
}

// Counts by key, largest count first, ties by key, so the same errors always give the same order.
/** @param {TscError[]} errors @param {(e: TscError) => string} key */
function countBy(errors, key) {
  /** @type {Map<string, { count: number, first: TscError }>} */
  const counts = new Map();
  for (const e of errors) {
    const k = key(e);
    const c = counts.get(k);
    if (c) c.count++;
    else counts.set(k, { count: 1, first: e });
  }
  return [...counts].sort(([a, x], [b, y]) => y.count - x.count || (a < b ? -1 : a > b ? 1 : 0));
}

/** @param {string | number} v */
function cell(v) {
  const s = String(v);
  return s === "" || /[,"\n:]|^\s|\s$/.test(s) ? JSON.stringify(s) : s;
}

/** @param {string} name @param {string[]} fields @param {(string | number)[][]} rows */
function table(name, fields, rows) {
  return [`${name}[${rows.length}]{${fields.join(",")}}:`, ...rows.map((r) => `  ${r.map(cell).join(",")}`)];
}

/** @param {TscError} e */
const location = (e) => (e.file ? `${e.file}:${e.line}:${e.col}` : "(config)");

// The TOON summary of parsed errors. scope names the filter applied (for example "file src/a.mjs"), or "all".
/** @param {TscError[]} errors @param {{ scope?: string, first?: number, log?: string }} [options] */
export function summarize(errors, { scope = "all", first = 20, log = LOG } = {}) {
  const byCode = countBy(errors, (e) => e.code);
  const byFile = countBy(errors, (e) => e.file || "(config)");
  const lines = [
    `status: ${errors.length ? "fail" : "pass"}`,
    `scope: ${cell(scope)}`,
    "totals:",
    `  errors: ${errors.length}`,
    `  files: ${byFile.length}`,
  ];
  if (errors.length) {
    lines.push(...table("by_code", ["code", "count", "example"], byCode.map(([code, c]) => [code, c.count, c.first.message])));
    lines.push(...table("by_file", ["file", "count"], byFile.map(([file, c]) => [file, c.count])));
    lines.push(...table("first", ["file_line", "code", "message"], errors.slice(0, first).map((e) => [location(e), e.code, e.message])));
  }
  lines.push(`log: ${log}`);
  const hints = [];
  if (errors.length) {
    const top = byFile.find(([file]) => file !== "(config)");
    if (byFile.length > 1 && top) hints.push(`Run \`npm run typecheck -- --summary --file ${shellArg(top[0])}\` to see the errors of the top file`);
    hints.push(`Read ${log} for the full tsc output`);
    hints.push("Run `npm run typecheck -- --summary` again after a fix");
  }
  if (hints.length) lines.push(...table("help", ["hint"], hints.map((h) => [h])));
  return lines.join("\n");
}

/** @param {string[]} argv */
export function parseArgs(argv) {
  /** @type {{ summary: boolean, file?: string, since?: string, first: number }} */
  const args = { summary: false, first: 20 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--summary") args.summary = true;
    else if (a === "--file") args.file = value();
    else if (a === "--since") args.since = value();
    else if (a === "--first") {
      args.first = Number(value());
      if (!Number.isInteger(args.first) || args.first < 0) throw new Error("--first needs a whole number");
    } else throw new Error(`unknown argument ${a}`);
  }
  if (!args.summary && (args.file || args.since || argv.includes("--first"))) throw new Error("--file, --since and --first need --summary");
  return args;
}

/** @param {string} message */
function usageError(message) {
  console.log(`status: error\nerror: ${cell(message)}\nhelp[1]{hint}:\n  ${cell(USAGE)}`);
  process.exit(2);
}

function main() {
  /** @type {ReturnType<typeof parseArgs>} */
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    return usageError(/** @type {Error} */ (err).message);
  }
  const tsc = join(ROOT, "node_modules/typescript/bin/tsc");
  if (!existsSync(tsc)) return usageError("tsc is not installed; run npm ci");
  const extract = spawnSync(process.execPath, [join(ROOT, "skill-sharpening/scripts/extract-inline.mjs"), ...PAGES], { cwd: ROOT, encoding: "utf8" });
  if (extract.status !== 0) return usageError(`extract-inline.mjs failed: ${(extract.stderr || extract.stdout).trim().split("\n")[0]}`);
  if (!args.summary) {
    process.stdout.write(extract.stdout);
    const run = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json"], { cwd: ROOT, stdio: "inherit" });
    if (run.error) return usageError(`tsc did not start: ${run.error.message}`);
    process.exit(run.status === 0 ? 0 : run.status === 2 || run.status === 1 ? 1 : 2);
  }
  const run = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json", "--pretty", "false"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
  if (run.error) return usageError(`tsc did not start: ${run.error.message}`);
  mkdirSync(join(ROOT, ".typecheck"), { recursive: true });
  writeFileSync(join(ROOT, LOG), run.stdout + run.stderr);
  let errors = parseTsc(run.stdout);
  if (run.status !== 0 && !errors.length) return usageError(`tsc exited ${run.status} with no parsed errors; read ${LOG}`);
  const scope = [];
  if (args.file) {
    const want = relative(ROOT, resolve(process.env.INIT_CWD ?? process.cwd(), args.file));
    const inRepo = want !== "" && !want.startsWith("..") && !isAbsolute(want);
    if (!inRepo || !statSync(join(ROOT, want), { throwIfNoEntry: false })?.isFile()) return usageError(`--file ${want} is not a file in the repository`);
    const wanted = reportedFiles([want]);
    errors = errors.filter((e) => wanted.has(e.file));
    scope.push(`file ${want}`);
  }
  if (args.since) {
    let changed;
    try {
      // Changed tracked files plus new untracked ones, so a file not yet added still counts.
      const git = (/** @type {string[]} */ ...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
      changed = reportedFiles([...git("diff", "--name-only", args.since, "--"), ...git("ls-files", "--others", "--exclude-standard")]);
    } catch {
      return usageError(`git diff failed for ${args.since}`);
    }
    errors = errors.filter((e) => changed.has(e.file));
    scope.push(`since ${args.since}`);
  }
  console.log(summarize(errors, { scope: scope.join(", ") || "all", first: args.first }));
  process.exit(errors.length ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
