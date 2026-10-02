#!/usr/bin/env node

// Lint the skills collection. Errors fail the run; warnings print but pass
// unless --strict is given. See ../references/linting-and-evals.md.

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkills, wordCount } from "./lib/skills.mjs";

const ALLOWED_KEYS = new Set(["name", "description", "allowed-tools", "license", "metadata"]);
const DESCRIPTION_WORD_LIMIT = 60;
const DESCRIPTION_CHAR_LIMIT = 1024;
const ENTRYPOINT_WORD_LIMIT = 2000;
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TRIGGER_PATTERN = /\b(use|apply|run|invoke)\b[^.]*\b(when|for|to|before|after|during|only|on|whenever)\b|\bmust always apply\b/i;
const OPENAI_YAML_KEYS = { policy: ["allow_implicit_invocation"], interface: ["display_name", "short_description", "default_prompt"] };
const SKIPPED_DIRECTORIES = new Set([".git", ".system", "node_modules", ".firecrawl", "dist", "build"]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED_DIRECTORIES.has(entry.name)) return [];
    const target = join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function localLinks(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  return [...withoutCode.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
    .map(([, target]) => target)
    .filter((target) => !/^([a-z][a-z0-9+.-]*:|#)|^(link|url)$/i.test(target));
}

// Layout: every top-level directory is a skill, and no skill is nested.
function checkLayout({ repository, skillNames, files, error }) {
  for (const entry of readdirSync(repository, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith(".") && !skillNames.has(entry.name)) {
      error("layout/not-a-skill", join(repository, entry.name), "top-level directory has no SKILL.md");
    }
  }
  for (const file of files.filter((path) => basename(path) === "SKILL.md")) {
    if (dirname(dirname(file)) !== repository) error("layout/nested-skill", file, "SKILL.md must sit directly in a top-level directory");
  }
}

function checkDescription({ path, description, dirName }, descriptions, { error, warn }) {
  const descriptionWords = wordCount(description);
  if (descriptionWords > DESCRIPTION_WORD_LIMIT) {
    error("description/word-limit", path, `description has ${descriptionWords} words; limit is ${DESCRIPTION_WORD_LIMIT}`);
  }
  if (description.length > DESCRIPTION_CHAR_LIMIT) {
    error("description/char-limit", path, `description has ${description.length} characters; limit is ${DESCRIPTION_CHAR_LIMIT}`);
  }
  if (/<\/?[A-Za-z][^>]*>/.test(description)) error("description/no-tags", path, "description must not contain XML or HTML tags");
  if (!TRIGGER_PATTERN.test(description)) {
    warn("description/trigger", path, "description never says when to use the skill (for example \"Use when ...\")");
  }
  const key = description.trim().toLowerCase();
  if (descriptions.has(key)) error("description/duplicate", path, `same description as ${descriptions.get(key)}`);
  else descriptions.set(key, dirName);
}

function checkEntrypoint(skill, { repository, error, warn }) {
  const { path, body } = skill;
  const entrypointWords = wordCount(skill.content);
  if (entrypointWords > ENTRYPOINT_WORD_LIMIT) {
    error("entrypoint/word-limit", path, `entrypoint has ${entrypointWords} words; limit is ${ENTRYPOINT_WORD_LIMIT}; use progressive disclosure`);
  }
  if (wordCount(body) < 20 && !/Skill tool/.test(body)) warn("entrypoint/empty-body", path, "SKILL.md body has fewer than 20 words");

  // Backticked paths such as `references/foo.md` that the skill tells an agent to open.
  const mentioned = new Set(body.match(/`((?:references|playbooks|assets|examples)\/[^`\s*<>{}]+)`/g) ?? []);
  for (const quoted of mentioned) {
    const target = quoted.slice(1, -1);
    if (!existsSync(join(skill.directory, target)) && !existsSync(join(repository, target))) {
      warn("paths/missing", path, `mentions ${target}, which does not exist`);
    }
  }
}

// Frontmatter and entry point.
function checkSkills(context) {
  const { skills, error } = context;
  const descriptions = new Map();
  for (const skill of skills) {
    const { path, fields, errors, dirName } = skill;
    for (const message of errors) error("frontmatter/parse", path, message);
    if (!fields) continue;

    for (const key of Object.keys(fields)) {
      if (!ALLOWED_KEYS.has(key)) error("frontmatter/unknown-key", path, `unsupported frontmatter key ${key}`);
    }
    if (!fields.name || !fields.description) {
      error("frontmatter/required", path, "name and description are required");
      continue;
    }
    if (!NAME_PATTERN.test(fields.name) || fields.name.length > 64) {
      error("name/format", path, `name ${fields.name} must be lowercase-kebab-case and at most 64 characters`);
    }
    if (fields.name !== dirName) error("name/matches-directory", path, `name ${fields.name} does not match directory ${dirName}`);

    checkDescription({ path, description: fields.description, dirName }, descriptions, context);
    checkEntrypoint(skill, context);
  }
}

// Relative links in every Markdown file of every skill, plus the root docs.
function checkLinks({ files, error, warn }) {
  for (const file of files.filter((path) => path.endsWith(".md"))) {
    for (const target of localLinks(readFileSync(file, "utf8"))) {
      const decoded = decodeURIComponent(target.split("#")[0]);
      if (!decoded) continue;
      if (!existsSync(normalize(join(dirname(file), decoded)))) {
        const severity = basename(file) === "SKILL.md" ? error : warn;
        severity("links/unresolved", file, `unresolved local link ${target}`);
      }
    }
  }
}

// agents/openai.yaml: only keys the host understands, with valid values.
function checkOpenAiYaml({ skills, error }) {
  for (const skill of skills) {
    const yamlPath = join(skill.directory, "agents", "openai.yaml");
    if (!existsSync(yamlPath)) continue;
    let section = null;
    for (const [index, line] of readFileSync(yamlPath, "utf8").split(/\r?\n/).entries()) {
      if (!line.trim() || line.trimStart().startsWith("#")) continue;
      const top = line.match(/^([A-Za-z_]+):\s*$/);
      const child = line.match(/^ {2}([A-Za-z_]+):\s*(.*)$/);
      if (top) {
        section = top[1];
        if (!(section in OPENAI_YAML_KEYS)) error("agents/unknown-key", yamlPath, `unknown top-level key ${section}`);
      } else if (child && section) {
        const [, key, value] = child;
        if (OPENAI_YAML_KEYS[section] && !OPENAI_YAML_KEYS[section].includes(key)) {
          error("agents/unknown-key", yamlPath, `unknown key ${section}.${key}`);
        }
        if (key === "allow_implicit_invocation" && !/^(true|false)$/.test(value)) {
          error("agents/invalid-value", yamlPath, "allow_implicit_invocation must be true or false");
        }
        if (key !== "allow_implicit_invocation" && !value) error("agents/invalid-value", yamlPath, `${section}.${key} is empty`);
      } else {
        error("agents/parse", yamlPath, `cannot parse line ${index + 1}: ${line}`);
      }
    }
  }
}

// Router: every skill is reachable, and the router names no missing skill.
function checkRouter({ repository, skillNames, error }) {
  const routerPath = join(repository, "skills-router", "SKILL.md");
  if (!existsSync(routerPath)) return;
  const router = readFileSync(routerPath, "utf8");
  const principlesPath = join(repository, "poteto-mode", "references", "principles.md");
  const principles = existsSync(principlesPath) ? readFileSync(principlesPath, "utf8") : "";
  const routed = new Set([...router.matchAll(/^\|.*\|\s*$/gm)].flatMap(([row]) => [...row.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1])));
  for (const name of routed) {
    if (!skillNames.has(name)) error("router/unknown-skill", routerPath, `routes to ${name}, which is not a skill`);
  }
  for (const name of skillNames) {
    if (name === "skills-router" || routed.has(name)) continue;
    if (name.startsWith("principle-") && principles.includes(name)) continue;
    error("router/missing-skill", join(repository, name, "SKILL.md"), "skill has no row in skills-router/SKILL.md");
  }
}

// Provenance: every skill's lineage is recorded.
function checkProvenance({ repository, skillNames, warn }) {
  const provenancePath = join(repository, "PROVENANCE.md");
  if (!existsSync(provenancePath)) return;
  const provenance = readFileSync(provenancePath, "utf8");
  const listed = new Set([...provenance.matchAll(/`([a-z0-9-]+\*?)`/g)].map((m) => m[1]));
  const wildcards = [...listed].filter((name) => name.endsWith("*")).map((name) => name.slice(0, -1));
  for (const name of skillNames) {
    if (listed.has(name) || wildcards.some((prefix) => name.startsWith(prefix))) continue;
    warn("provenance/missing", join(repository, name, "SKILL.md"), "skill is not listed in PROVENANCE.md");
  }
}

// Scripts that ship with a skill should be runnable.
function checkScripts({ files, warn }) {
  for (const file of files.filter((path) => /\/scripts\/[^/]+\.(sh|py)$/.test(path) && !path.includes(".template."))) {
    const executable = (statSync(file).mode & 0o111) !== 0;
    if (!executable) warn("scripts/not-executable", file, "script is not executable (chmod +x)");
  }
}

// Run every check over one collection. Findings come back errors first, each in discovery order.
export function lintCollection(repository) {
  const findings = [];
  const report = (severity, rule, file, message) => findings.push({ severity, rule, file: relative(repository, file), message });
  const skills = loadSkills(repository);
  const context = {
    repository,
    skills,
    skillNames: new Set(skills.map((skill) => skill.dirName)),
    files: walk(repository),
    error: (...rest) => report("error", ...rest),
    warn: (...rest) => report("warning", ...rest),
  };
  for (const check of [checkLayout, checkSkills, checkLinks, checkOpenAiYaml, checkRouter, checkProvenance, checkScripts]) check(context);
  const errors = findings.filter((finding) => finding.severity === "error");
  const warnings = findings.filter((finding) => finding.severity === "warning");
  return { skillCount: skills.length, errors, warnings };
}

function main(args) {
  const strict = args.includes("--strict");
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const repository = resolve(args.find((arg) => !arg.startsWith("--")) ?? dirname(dirname(scriptDirectory)));
  const { skillCount, errors, warnings } = lintCollection(repository);
  for (const finding of [...errors, ...warnings]) {
    const stream = finding.severity === "error" ? console.error : console.warn;
    stream(`${finding.severity}: ${finding.file}: ${finding.message} [${finding.rule}]`);
  }

  const failed = errors.length > 0 || (strict && warnings.length > 0);
  console.log(`status: ${failed ? "invalid" : "valid"}`);
  console.log(`skills: ${skillCount}`);
  console.log(`errors: ${errors.length} warnings: ${warnings.length}${strict ? " (strict)" : ""}`);
  console.log(`limits: description<=${DESCRIPTION_WORD_LIMIT} entrypoint<=${ENTRYPOINT_WORD_LIMIT}`);
  return failed ? 1 : 0;
}

// Run as a CLI only when executed directly, so tests can import lintCollection.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
