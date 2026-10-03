// Shared helpers for reading the skills collection. Used by the linter and the evals.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Parse the YAML frontmatter subset these skills use: `key: value`, single- and
// double-quoted scalars, block scalars (`>`, `>-`, `|`, `|-`), plain scalars that
// continue on indented lines, and nested maps (kept as raw text).
/**
 * @param {string} content a SKILL.md file
 * @returns {{ fields: Record<string, string> | null, body: string, errors: string[] }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { fields: null, body: content, errors: ["missing YAML frontmatter"] };

  const lines = match[1].split(/\r?\n/);
  /** @type {Record<string, string>} */
  const fields = {};
  /** @type {string[]} */
  const errors = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.*))?$/);
    if (!keyMatch) {
      errors.push(`cannot parse frontmatter line ${index + 2}: ${line}`);
      continue;
    }
    const [, key, rawValue = ""] = keyMatch;
    /** @type {string[]} */
    const continuation = [];
    while (index + 1 < lines.length && (/^\s+\S/.test(lines[index + 1]) || lines[index + 1] === "")) {
      continuation.push(lines[++index]);
    }
    if (key in fields) errors.push(`duplicate frontmatter key ${key}`);
    fields[key] = scalar(rawValue.trim(), continuation, key, errors);
  }
  return { fields, body: content.slice(match[0].length), errors };
}

/**
 * One frontmatter value: the text after the key and its continuation lines.
 * @param {string} value @param {string[]} continuation @param {string} key @param {string[]} errors
 * @returns {string}
 */
function scalar(value, continuation, key, errors) {
  const block = value.match(/^([>|])([+-]?)$/);
  if (block) {
    const indent = Math.min(...continuation.filter((l) => l.trim()).map((l) => /** @type {RegExpMatchArray} */ (l.match(/^\s*/))[0].length));
    const text = continuation.map((l) => l.slice(indent));
    const joined = block[1] === "|" ? text.join("\n") : text.join(" ").replace(/\s+/g, " ");
    return block[2] === "+" ? joined : joined.trim();
  }
  const rest = continuation.map((l) => l.trim()).filter(Boolean);
  if (value.startsWith('"')) {
    const full = [value, ...rest].join(" ");
    try {
      return JSON.parse(full);
    } catch {
      errors.push(`${key}: invalid double-quoted string`);
      return full.slice(1, -1);
    }
  }
  if (value.startsWith("'")) {
    const full = [value, ...rest].join(" ");
    if (!full.endsWith("'")) errors.push(`${key}: unterminated single-quoted string`);
    return full.slice(1, -1).replaceAll("''", "'");
  }
  if (!value && rest.length) return continuation.join("\n"); // nested map, kept raw
  return [value, ...rest].join(" ");
}

/** @param {string} text */
export function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Every top-level directory that holds a SKILL.md, with its parsed frontmatter.
/**
 * @typedef {{ directory: string, dirName: string, path: string, content: string } & ReturnType<typeof parseFrontmatter>} Skill
 */
/** @param {string} repository @returns {Skill[]} */
export function loadSkills(repository) {
  return readdirSync(repository, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => join(repository, entry.name, "SKILL.md"))
    .filter((path) => existsSync(path))
    .map((path) => {
      const content = readFileSync(path, "utf8");
      const directory = path.slice(0, -"/SKILL.md".length);
      return { directory, dirName: /** @type {string} */ (directory.split("/").pop()), path, content, ...parseFrontmatter(content) };
    });
}
