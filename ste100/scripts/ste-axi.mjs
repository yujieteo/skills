#!/usr/bin/env node
// `ste-axi check [files|-]`: a deterministic STE100 checker for prose. It flags each problem sentence with file:line,
// so an agent fixes only the flagged lines instead of a second read of the whole text. It prints a short TOON
// report: findings first, then counts by rule. Exit codes: 0 clean, 1 findings, 2 usage error or no prose to check.
// Usage: ste-axi check <file>... | ste-axi check -   (the "-" reads standard input)
// Heuristics only, with no network and no dictionary: see "Known limits" in ste100/SKILL.md.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const USAGE = "usage: ste-axi check <file>... | ste-axi check -";
export const MAX_DESCRIPTIVE = 25;
export const MAX_INSTRUCTION = 20;
export const MAX_NOUNS = 3;

// The "use the approved word instead" table, from the Words section of ste100/SKILL.md. Keys are regex sources.
/** @type {[string, string][]} */
export const APPROVED = [
  ["utili[sz](?:e|es|ed|ing)", "use"],
  ["initiat(?:e|es|ed|ing)", "start"],
  ["commenc(?:e|es|ed|ing)", "start"],
  ["terminat(?:e|es|ed|ing)", "stop"],
  ["facilitat(?:e|es|ed|ing)", "help"],
  ["assist(?:s|ed|ing)?", "help"],
  ["demonstrat(?:e|es|ed|ing)", "show"],
  ["obtain(?:s|ed|ing)?", "get"],
  ["ascertain(?:s|ed|ing)?", "find"],
  ["endeavou?r(?:s|ed|ing)?", "try"],
  ["approximately", "about"],
  ["sufficient", "enough"],
  ["numerous", "many"],
  ["in order to", "to"],
  ["prior to", "before"],
  ["subsequent to", "after"],
  ["take[sn]? out|took out", "remove"],
  ["carr(?:y|ies|ied) on", "continue"],
  ["a must", "a requirement"],
];

// -ing words that are not verb forms (nouns, prepositions) or are approved STE nouns.
export const ING_ALLOW = new Set(
  ("bring ceiling cling during evening anything everything fling heading king meaning morning nothing ping " +
    "ring sing sling something spring sting string swing thing warning wing wring").split(" "),
);

// Words that start an instruction. A sentence is an instruction when it starts with one of these, also after
// a condition ("If the check fails, stop the deploy.").
export const IMPERATIVE = new Set(
  ("add apply ask avoid build call change check choose close commit compare confirm copy create delete do " +
    "edit enable disable find fix follow give go install keep let load make mark merge move open pass push " +
    "put read record remove rename replace report restart run see select send set show start stop tell test " +
    "try type update use verify wait write").split(" "),
);

// Function words, pronouns, auxiliaries and common verbs and adjectives: a noun cluster never contains these.
const NOT_NOUN = new Set(
  ("a an the this that these those my your our their its his her each every all any some no not and or but nor " +
    "if then than so because when while where which who whom whose what how why to of in on at by for from with " +
    "into onto over under about after before between through during without within as is are was were be been " +
    "am do does did done has have had will would can could shall should may might must it he she they we you i " +
    "me us them him there here such out up down off like one two three four five six seven eight nine ten more most less many much few " +
    "new old good bad big small long short high low same other only also very too just first last next " +
    "get gets got give gives go goes make makes made take takes use uses fail fails pass passes show shows " +
    "need needs start starts stop stops run runs keep keeps see sees put puts send sends find finds say says " +
    "read reads write writes stay stays").split(" ").concat([...IMPERATIVE]),
);

const BE = new Set("is are was were be been being am".split(" "));
// Common irregular past participles; regular ones end in -ed.
const IRREGULAR_PARTICIPLE = new Set(
  ("built bought brought caught chosen done drawn driven eaten fallen felt forgotten found given gone held hidden " +
    "kept known laid led left lost made meant paid put read seen sent set shown shut sold spent split taken " +
    "thought told understood won written").split(" "),
);
const CONTRACTION = /\b(?:\w+n['’]t|(?:it|that|there|here|what|who|let|he|she|where|how)['’]s|\w+['’](?:re|ve|ll|d|m))\b/gi;

/** @typedef {{ file: string, line: number, rule: string, detail: string, text: string }} Finding */
/** @typedef {{ text: string, orig: string, lines: number[] }} Unit */

// Replaces every character of a match with spaces except one marker, so offsets keep their lines. A final ., ! or ?
// after a letter or digit stays when a capital letter or the end of the unit comes next, so that it ends the sentence.
/** @param {string} s @param {RegExp} re */
const mask = (s, re) =>
  s.replace(re, (m, /** @type {number} */ at, /** @type {string} */ all) => {
    const end = /[A-Za-z0-9]([.!?]+)["”`]?$/.exec(m);
    const keep = end && end.index > 0 && /^\s*(?:[A-Z]|$)/.test(all.slice(at + m.length)) ? end[1] : "";
    const cut = end && keep ? end.index + 1 : m.length;
    return "X" + m.slice(1, cut).replace(/[^\n]/g, " ") + keep + " ".repeat(m.length - cut - keep.length);
  });

// Masks what the check must skip: inline code, URLs, Markdown link targets, quoted text and abbreviations.
/** @param {string} s */
export function maskSkipped(s) {
  s = mask(s, /`[^`\n]*`/g);
  s = mask(s, /\b(?:https?|ftp):\/\/[^\s)>\]]+|\bwww\.[^\s)>\]]+/g);
  s = s.replace(/\]\([^)\n]*\)/g, (m) => "]" + " ".repeat(m.length - 1));
  s = mask(s, /"[^"\n]*"|“[^”\n]*”/g);
  s = s.replace(/\b(?:e\.g|i\.e|etc|vs|cf)\./gi, (m) => "X" + " ".repeat(m.length - 1));
  return s;
}

// Splits Markdown or plain text into prose units with the line of each character. Skips front matter, fenced code,
// indented code, HTML lines and table separators. A paragraph is one unit; a heading, a list item or a table cell
// starts a new unit. Lines of one quoted paragraph are one unit, and an indented paragraph in a list item is prose.
/** @param {string} source @returns {Unit[]} */
export function proseUnits(source) {
  const lines = source.split(/\r?\n/);
  /** @type {Unit[]} */
  const units = [];
  /** @type {{ orig: string, lines: number[] } | null} */
  let current = null;
  let fence = "";
  let quoted = false;
  let list = false;
  let i = 0;
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end > 0) i = end + 1;
  }
  const flush = () => {
    if (current && current.orig.trim()) units.push({ text: maskSkipped(current.orig), ...current });
    current = null;
    quoted = false;
  };
  // orig is the source text of the unit, with its lines joined by "\n". flush masks it once for the whole unit;
  // masking keeps lengths, so offsets match.
  /** @param {string} orig @param {number} line */
  const append = (orig, line) => {
    if (!current) current = { orig: "", lines: [] };
    if (current.orig) {
      current.orig += "\n";
      current.lines.push(line);
    }
    current.orig += orig;
    for (let k = 0; k < orig.length; k++) current.lines.push(line);
  };
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const line = i + 1;
    const open = /^\s*(```+|~~~+)/.exec(raw);
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = "";
      continue;
    }
    if (raw.trim() && !/^\s/.test(raw)) list = false;
    if (open) {
      flush();
      fence = open[1];
      continue;
    }
    if (!raw.trim() || /^( {4}|\t)/.test(raw) && !current && !list || /^\s*</.test(raw) || /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(raw)) {
      flush();
      continue;
    }
    if (/^\s*\|/.test(raw)) {
      flush();
      let at = 0;
      for (const cell of maskSkipped(raw).split("|")) {
        if (cell.trim()) append(raw.slice(at, at + cell.length), line), flush();
        at += cell.length + 1;
      }
      continue;
    }
    const block = /^\s*(>\s*)?(#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?/.exec(raw);
    if (block && (block[1] || block[2])) {
      const quote = !!block[1];
      const marker = block[2] ?? "";
      if (!(quote && quoted && !marker)) flush();
      if (quote && !raw.slice(block[0].length).trim()) {
        flush();
        continue;
      }
      if (/^[-*+\d]/.test(marker)) list = true;
      const pad = " ".repeat(block[0].length);
      append(pad + raw.slice(block[0].length), line);
      quoted = quote;
      if (marker.startsWith("#")) flush();
      continue;
    }
    append(raw, line);
  }
  flush();
  return units;
}

/** @typedef {{ text: string, start: number }} Sentence */

// Splits a unit into sentences at ., ! or ? before a space or the end, also with closing marks such as ), ** or a
// quote between. A ., ! or ? in a word stays in its sentence.
/** @param {string} text @returns {Sentence[]} */
export function sentences(text) {
  /** @type {Sentence[]} */
  const out = [];
  const re = /(?:[^.!?]|[.!?](?![.!?]*[)\]"'’”*_]*(?:\s|$)))+(?:[.!?]+[)\]"'’”*_]*(?=\s|$))?|[.!?]+[)\]"'’”*_]*/g;
  let m;
  while ((m = re.exec(text))) {
    if (!m[0]) break;
    const lead = m[0].length - m[0].trimStart().length;
    if (m[0].trim() && /[A-Za-z]/.test(m[0])) out.push({ text: m[0].trim(), start: m.index + lead });
  }
  return out;
}

/** @param {string} sentence */
const words = (sentence) => [...sentence.matchAll(/[A-Za-z0-9](?:[\w'’./-]*\w)?/g)];

// A technical name stays as it is: a token with a capital after its first letter, a digit, "_", "/" or ".", an
// all-capitals token, or a capitalized word that does not start the sentence.
/** @param {string} word @param {boolean} first */
export const technical = (word, first) =>
  /[A-Z]/.test(word.slice(1)) || /[\d_/.]/.test(word) || (!first && /^[A-Z]/.test(word)) || word === "X";

// True when the sentence is an instruction: it starts with an imperative verb, also after a leading condition.
/** @param {string} sentence */
export function isInstruction(sentence) {
  const body = sentence.replace(/^\W+/, "");
  const first = (/** @type {string} */ s) => (/^[A-Za-z]+/.exec(s)?.[0] ?? "").toLowerCase();
  if (IMPERATIVE.has(first(body))) return true;
  const cond = /^(?:if|when|before|after|unless|once)\b[^,]*,\s*([\s\S]*)$/i.exec(body);
  return !!cond && IMPERATIVE.has(first(cond[1]));
}

const excerpt = (/** @type {string} */ s) => (s.length > 60 ? s.slice(0, 57) + "..." : s).replace(/\s+/g, " ");

// Checks one source text and returns its findings in line order, and the number of sentences it checked.
/** @param {string} source @param {string} file @returns {{ findings: Finding[], sentences: number }} */
export function checkText(source, file) {
  /** @type {{ at: number, finding: Finding }[]} */
  const found = [];
  let count = 0;
  let unitStart = 0;
  for (const u of proseUnits(source)) {
    const unit = { ...u, start: unitStart };
    unitStart += u.text.length + 1;
    for (const s of sentences(unit.text)) {
      count++;
      const lineAt = (/** @type {number} */ offset) => unit.lines[Math.min(s.start + offset, unit.lines.length - 1)];
      const text = excerpt(unit.orig.slice(s.start, s.start + s.text.length));
      /** @param {string} rule @param {string} detail @param {number} [offset] */
      const add = (rule, detail, offset = 0) => found.push({ at: unit.start + s.start + offset, finding: { file, line: lineAt(offset), rule, detail, text } });
      const ws = words(s.text);
      const instruction = isInstruction(s.text);
      const max = instruction ? MAX_INSTRUCTION : MAX_DESCRIPTIVE;
      if (ws.length > max) add(instruction ? "long-instruction" : "long-descriptive", `${ws.length} words, max ${max}`);
      for (const m of s.text.matchAll(/;/g)) add("semicolon", "write two sentences", m.index);
      for (const m of s.text.matchAll(CONTRACTION)) add("contraction", m[0], m.index);
      ws.forEach((m, k) => {
        const w = m[0];
        if (technical(w, k === 0)) return;
        const lower = w.toLowerCase();
        if (/^[a-z]{2,}ing$/i.test(w) && lower.length > 4 && !ING_ALLOW.has(lower)) add("ing-form", w, m.index);
      });
      for (const [source, use] of APPROVED) {
        for (const m of s.text.matchAll(new RegExp(`\\b(?:${source.replace(/ /g, "\\s+")})\\b`, "gi"))) {
          if (m.index === 0 || !/^[A-Z]/.test(m[0])) add("approved-word", `${m[0].replace(/\s+/g, " ")} -> ${use}`, m.index);
        }
      }
      for (let k = 0; k + 1 < ws.length; k++) {
        if (!BE.has(ws[k][0].toLowerCase())) continue;
        let j = k + 1;
        if (j < ws.length && /^(?:not|\w+ly)$/i.test(ws[j][0]) && j + 1 < ws.length) j++;
        const p = ws[j][0].toLowerCase();
        if (!technical(ws[j][0], false) && (/^[a-z]{2,}ed$/.test(p) || IRREGULAR_PARTICIPLE.has(p))) {
          add("passive", `${ws[k][0]} ${ws.slice(k + 1, j + 1).map((x) => x[0]).join(" ")}`, ws[k].index);
        }
      }
      /** @type {RegExpMatchArray[]} */
      let run = [];
      const flushRun = () => {
        if (run.length > MAX_NOUNS) add("noun-cluster", run.map((x) => x[0]).join(" "), run[0].index);
        run = [];
      };
      ws.forEach((m, k) => {
        const w = m[0];
        const lower = w.toLowerCase();
        const gap = k > 0 && /[^\s]/.test(s.text.slice(ws[k - 1].index + ws[k - 1][0].length, m.index));
        if (gap) flushRun();
        const noun = /^[a-z]+$/.test(lower) && !technical(w, k === 0) && !NOT_NOUN.has(lower) && !/(?:ly|ed|ing|ous|ful|ive|able|ible)$/.test(lower);
        if (noun) run.push(m);
        else flushRun();
      });
      flushRun();
    }
  }
  // In text order: by line, then by place in the text.
  found.sort((a, b) => a.finding.line - b.finding.line || a.at - b.at);
  return { findings: found.map((f) => f.finding), sentences: count };
}

// One TOON cell: quoted when it is empty or has a delimiter, a quote, a colon or edge spaces.
/** @param {string | number} v */
export const cell = (v) => {
  const s = String(v);
  return typeof v === "number" || (s && !/[,:"\\\n]|^\s|\s$|^-?\d/.test(s)) ? s : `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
};

/** @param {string} name @param {string[]} fields @param {(string | number)[][]} rows */
const table = (name, fields, rows) => [`${name}[${rows.length}]{${fields.join(",")}}:`, ...rows.map((r) => "  " + r.map(cell).join(","))];

// The report and its exit code for checked inputs.
/** @param {{ file: string, findings: Finding[], sentences: number }[]} results */
export function report(results) {
  const findings = results.flatMap((r) => r.findings);
  const sentenceCount = results.reduce((n, r) => n + r.sentences, 0);
  /** @type {Map<string, number>} */
  const byRule = new Map();
  for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
  const rules = [...byRule].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const code = findings.length ? 1 : 0;
  const lines = [`status: ${code ? "fail" : "pass"}`];
  if (findings.length) {
    lines.push(...table("findings", ["file_line", "rule", "detail", "text"], findings.map((f) => [`${f.file}:${f.line}`, f.rule, f.detail, f.text])));
    lines.push(...table("by_rule", ["rule", "count"], rules));
  }
  lines.push("totals:", `  inputs: ${results.length}`, `  sentences: ${sentenceCount}`, `  findings: ${findings.length}`);
  if (findings.length) {
    lines.push(...table("help", ["hint"], [["Fix only the flagged lines, then run `ste-axi check` again"], ["A finding can be a false alarm: see Known limits in SKILL.md of the ste100 skill"]]));
  }
  return { text: lines.join("\n"), code };
}

// Runs the command line and returns the output and the exit code. readInput reads a path, or standard input for "-".
/** @param {string[]} argv @param {(path: string) => string} readInput */
export function main(argv, readInput) {
  const inputs = [...argv];
  if (inputs.shift() !== "check") return { text: USAGE, code: 2 };
  const unknown = inputs.find((a) => a.startsWith("--"));
  if (unknown) return { text: `${USAGE}\nerror: unknown option ${unknown}`, code: 2 };
  if (!inputs.length) return { text: `${USAGE}\nerror: no input; give files, or - for standard input`, code: 2 };
  const results = [];
  for (const input of inputs) {
    let source;
    try {
      source = readInput(input);
    } catch (e) {
      return { text: `error: cannot read ${input}: ${e instanceof Error ? e.message : e}`, code: 2 };
    }
    const name = input === "-" ? "stdin" : input;
    const checked = checkText(source, name);
    if (!checked.sentences) return { text: `error: ${name} has no prose to check; an empty input is not a pass`, code: 2 };
    results.push({ file: name, ...checked });
  }
  return report(results);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { text, code } = main(process.argv.slice(2), (p) => readFileSync(p === "-" ? 0 : p, "utf8"));
  (code === 2 ? process.stderr : process.stdout).write(text + "\n");
  process.exitCode = code;
}
