#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repository = resolve(process.argv[2] ?? dirname(dirname(scriptDirectory)));
const unsupported = /^(?:disable-model-invocation|argument-hint|mode|icon|color|reminder):.*\n/gm;
const pstackSkills = new Set([
  "architect", "arena", "automate-me", "blast-radius", "bro", "create-verification-skill",
  "figure-it-out", "how", "interrogate", "maintain-verification-skill", "make-bot-ui",
  "no-comments", "recall", "reflect", "setup-pstack", "show-me-your-work", "swarm", "tdd",
  "technical-writing", "typescript-best-practices", "unslop", "why",
  "principle-attack-the-premise", "principle-boundary-discipline", "principle-build-the-lever",
  "principle-encode-lessons-in-structure", "principle-exhaust-the-design-space",
  "principle-experience-first", "principle-fix-root-causes", "principle-foundational-thinking",
  "principle-guard-the-context-window", "principle-laziness-protocol",
  "principle-make-operations-idempotent", "principle-migrate-callers-then-delete-legacy-apis",
  "principle-minimize-reader-load", "principle-model-the-domain", "principle-never-block-on-the-human",
  "principle-outcome-oriented-execution", "principle-prove-it-works",
  "principle-redesign-from-first-principles", "principle-separate-before-serializing-shared-state",
  "principle-sequence-verifiable-units", "principle-subtract-before-you-add",
  "principle-test-behavior-not-implementation", "principle-type-system-discipline",
]);
const legacyRuntimeNotice = "> Read [the pstack Codex runtime](../poteto-mode/references/codex-runtime.md) before acting on host-specific instructions.\n\n";
const agentRuntimeNotice = "> Host actions: [agent runtime](../poteto-mode/references/agent-runtime.md).\n\n";

for (const entry of readdirSync(repository, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
  const skillPath = join(repository, entry.name, "SKILL.md");
  if (!existsSync(skillPath)) continue;

  const original = readFileSync(skillPath, "utf8");
  const explicitOnly = /^disable-model-invocation:\s*true\s*$/m.test(original);
  let normalized = original.replace(unsupported, "");
  normalized = normalized.replaceAll(legacyRuntimeNotice, agentRuntimeNotice);
  normalized = normalized.replaceAll(`${agentRuntimeNotice}\n${agentRuntimeNotice}`, agentRuntimeNotice);
  if (entry.name === "typescript-best-practices") {
    normalized = normalized.replace(/^paths:.*\n/m, "");
  }
  if (entry.name === "poteto-mode") {
    normalized = normalized.replace(/^name:\s*Poteto Mode\s*$/m, "name: poteto-mode");
  }
  if (pstackSkills.has(entry.name) && !normalized.includes(agentRuntimeNotice.trim())) {
    normalized = normalized.replace(/^(---\n[\s\S]*?\n---\n)/, `$1\n${agentRuntimeNotice}`);
  }
  if (normalized !== original) writeFileSync(skillPath, normalized);

  if (!explicitOnly) continue;
  const agentsDirectory = join(repository, entry.name, "agents");
  const openAiPath = join(agentsDirectory, "openai.yaml");
  if (existsSync(openAiPath)) continue;
  mkdirSync(agentsDirectory, { recursive: true });
  writeFileSync(openAiPath, "policy:\n  allow_implicit_invocation: false\n");
}
