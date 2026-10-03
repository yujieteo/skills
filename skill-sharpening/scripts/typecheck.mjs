#!/usr/bin/env node
// The `npm run typecheck` entry point: copies the example pages' inline scripts (extract-inline.mjs), then runs tsc.
// With no flags it prints tsc's own output. With --summary it writes the full tsc log to .typecheck/tsc.log and prints
// a short TOON verdict instead: totals, error counts by code and by file (largest first, ties by name), and the first
// errors in tsc's order. Exit codes: 0 no errors, 1 type errors, 2 usage or environment error.
// Usage: npm run typecheck [-- --summary [--file <path>] [--since <ref>] [--scope-verdict] [--first <n>]], where --first defaults to 20.
// --file and --since only narrow the listed errors; the verdict and exit code follow all errors unless --scope-verdict.
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
const USAGE = "usage: npm run typecheck [-- --summary [--file <path>] [--since <ref>] [--scope-verdict] [--first <n>, default 20]]";
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

// The TOON summary of parsed errors, and its exit code. scope is the set of reported file names a --file or --since
// filter keeps (see reportedFiles), or null for no filter. The filter only narrows what is listed: the verdict and the
// exit code follow every error, unless scopeVerdict asks for a verdict on the scope alone, which the output then says.
/** @param {TscError[]} all @param {{ scope?: Set<string> | null, label?: string, scopeVerdict?: boolean, first?: number, log?: string }} [options] */
export function summarize(all, { scope = null, label = "all", scopeVerdict = false, first = 20, log = LOG } = {}) {
  const shown = scope ? all.filter((e) => scope.has(e.file)) : all;
  const outside = all.length - shown.length;
  const judged = scopeVerdict ? shown : all;
  const fileCount = (/** @type {TscError[]} */ errors) => new Set(errors.map((e) => e.file)).size;
  const byCode = countBy(shown, (e) => e.code);
  const byFile = countBy(shown, (e) => e.file || "(config)");
  const lines = [
    `status: ${judged.length ? "fail" : "pass"}`,
    `verdict: ${scopeVerdict ? "scoped verdict" : "all errors"}`,
    `scope: ${cell(label)}`,
    "totals:",
    `  errors: ${all.length}`,
    `  files: ${fileCount(all)}`,
  ];
  if (scope) lines.push("scoped:", `  errors: ${shown.length}`, `  files: ${byFile.length}`, `  outside_scope: ${outside}`);
  if (shown.length) {
    lines.push(...table("by_code", ["code", "count", "example"], byCode.map(([code, c]) => [code, c.count, c.first.message])));
    lines.push(...table("by_file", ["file", "count"], byFile.map(([file, c]) => [file, c.count])));
    lines.push(...table("first", ["file_line", "code", "message"], shown.slice(0, first).map((e) => [location(e), e.code, e.message])));
  }
  lines.push(`log: ${log}`);
  const hints = [];
  if (outside) hints.push(`${outside} errors are outside the scope; run \`npm run typecheck -- --summary\` without filters to list them`);
  if (shown.length) {
    const top = byFile.find(([file]) => file !== "(config)");
    if (!scope && byFile.length > 1 && top) hints.push(`Run \`npm run typecheck -- --summary --file ${shellArg(top[0])}\` to see the errors of the top file`);
    hints.push(`Read ${log} for the full tsc output`);
  }
  if (judged.length) hints.push("Run `npm run typecheck -- --summary` again after a fix");
  if (hints.length) lines.push(...table("help", ["hint"], hints.map((h) => [h])));
  return { text: lines.join("\n"), code: judged.length ? 1 : 0 };
}

// The files tsc checked, from its --listFiles lines (absolute paths), as repository-relative names.
/** @param {string} text @param {string} root */
export function parseListedFiles(text, root) {
  return new Set(text.split(/\r?\n/).filter((l) => isAbsolute(l)).map((l) => relative(root, l)));
}

// Resolves --file and --since into the set of reported file names to list. Throws an Error with a usage message when
// the path is not a checked file of the repository or the ref does not resolve, so a bad filter never gives a pass.
/** @param {string} root @param {{ file?: string, since?: string }} args @param {Set<string>} checked @param {string} [cwd] */
export function resolveScope(root, args, checked, cwd = root) {
  /** @type {Set<string>[]} */
  const sets = [];
  const label = [];
  if (args.file) {
    const want = relative(root, resolve(cwd, args.file));
    const inRepo = want !== "" && !want.startsWith("..") && !isAbsolute(want);
    if (!inRepo || !statSync(join(root, want), { throwIfNoEntry: false })?.isFile()) throw new Error(`--file ${args.file}: no such file in the repository`);
    const names = reportedFiles([want]);
    if (![...names].some((f) => f && checked.has(f))) throw new Error(`--file ${want}: tsc does not check this file`);
    sets.push(names);
    label.push(`file ${want}`);
  }
  if (args.since) {
    const git = (/** @type {string[]} */ ...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    try {
      git("rev-parse", "--verify", "--quiet", `${args.since}^{commit}`);
    } catch {
      throw new Error(`--since ${args.since}: not a git commit or ref`);
    }
    // Changed tracked files (a renamed file under its new name) plus new untracked ones.
    const lines = (/** @type {string} */ out) => out.split("\n").filter(Boolean);
    sets.push(reportedFiles([...lines(git("diff", "--name-only", args.since, "--")), ...lines(git("ls-files", "--others", "--exclude-standard"))]));
    label.push(`since ${args.since}`);
  }
  // Both filters keep only the files in both sets.
  const scope = sets.length ? new Set([...sets[0]].filter((f) => sets.every((s) => s.has(f)))) : null;
  return { scope, label: label.join(", ") || "all" };
}

/** @param {string[]} argv */
export function parseArgs(argv) {
  /** @type {{ summary: boolean, file?: string, since?: string, first: number, scopeVerdict: boolean }} */
  const args = { summary: false, first: 20, scopeVerdict: false };
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
    else if (a === "--scope-verdict") args.scopeVerdict = true;
    else if (a === "--first") {
      args.first = Number(value());
      if (!Number.isInteger(args.first) || args.first < 0) throw new Error("--first needs a whole number");
    } else throw new Error(`unknown argument ${a}`);
  }
  if (!args.summary && (args.file || args.since || args.scopeVerdict || argv.includes("--first"))) throw new Error("--file, --since, --scope-verdict and --first need --summary");
  if (args.scopeVerdict && !args.file && !args.since) throw new Error("--scope-verdict needs --file or --since");
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
  const run = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json", "--pretty", "false", "--listFiles"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
  if (run.error) return usageError(`tsc did not start: ${run.error.message}`);
  mkdirSync(join(ROOT, ".typecheck"), { recursive: true });
  writeFileSync(join(ROOT, LOG), run.stdout + run.stderr);
  const errors = parseTsc(run.stdout);
  if (run.status !== 0 && !errors.length) return usageError(`tsc exited ${run.status} with no parsed errors; read ${LOG}`);
  let scoped;
  try {
    scoped = resolveScope(ROOT, args, parseListedFiles(run.stdout, ROOT), process.env.INIT_CWD ?? process.cwd());
  } catch (err) {
    return usageError(/** @type {Error} */ (err).message);
  }
  const { text, code } = summarize(errors, { ...scoped, scopeVerdict: args.scopeVerdict, first: args.first });
  console.log(text);
  process.exit(code);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
