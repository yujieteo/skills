#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repository = resolve(process.argv[2] ?? dirname(dirname(scriptDirectory)));
const allowedKeys = new Set(["name", "description", "allowed-tools", "license", "metadata"]);
const problems = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === ".system") return [];
    const target = join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const skillPath of walk(repository).filter((file) => basename(file) === "SKILL.md")) {
  const content = readFileSync(skillPath, "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    problems.push(`${skillPath}: missing YAML frontmatter`);
    continue;
  }

  const fields = Object.fromEntries(
    frontmatter[1]
      .split("\n")
      .filter((line) => /^[A-Za-z][A-Za-z0-9_-]*:/.test(line))
      .map((line) => {
        const separator = line.indexOf(":");
        return [line.slice(0, separator), line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "")];
      }),
  );

  for (const key of Object.keys(fields)) {
    if (!allowedKeys.has(key)) problems.push(`${skillPath}: unsupported frontmatter key ${key}`);
  }
  if (!fields.name || !fields.description) problems.push(`${skillPath}: name and description are required`);
  if (fields.name && fields.name !== basename(dirname(skillPath))) {
    problems.push(`${skillPath}: name ${fields.name} does not match its directory`);
  }

  for (const [, target] of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (/^(https?:|#|mailto:)|^link$/.test(target)) continue;
    const localTarget = normalize(join(dirname(skillPath), target.split("#")[0]));
    if (!existsSync(localTarget)) {
      problems.push(`${skillPath}: unresolved local link ${target}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log("Skill collection is valid.");
