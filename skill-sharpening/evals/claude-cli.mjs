// The claude-cli backend: each eval model call is one headless `claude -p` run, so the evals bill the Claude
// subscription that the local Claude Code CLI is logged in to, not an API key. See ../references/linting-and-evals.md.
//
// The CLI normally loads the user's CLAUDE.md, skills, settings, hooks, plugins and MCP servers. Every call here turns
// those off and runs in a new empty directory, so the only context is the system prompt and the prompt the runner
// passes. Then a "with skill" run and a baseline run differ only by the skill. `node run.mjs isolation` proves it.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** @typedef {{ role: "user" | "assistant", content: string }} Turn */
/** @typedef {{ input_tokens: number, output_tokens: number, cache_read_input_tokens?: number | null, cache_creation_input_tokens?: number | null }} Usage */
/** @typedef {{ text: string, structured: unknown, usage: Usage, listCost: number }} CliResult */

// No CLAUDE.md, skills, plugins, hooks or custom agents (--safe-mode); no user, project or local settings files; no
// MCP servers; no skills or slash commands; no tools; and no transcript saved under ~/.claude/projects.
// Login still works: --safe-mode keeps auth, so the call uses the CLI's subscription login.
export const ISOLATION_FLAGS = Object.freeze([
  "--safe-mode",
  "--setting-sources", "",
  "--strict-mcp-config",
  "--disable-slash-commands",
  "--tools", "",
  "--no-session-persistence",
]);

// The negative control for the isolation check: user settings, plugins and MCP servers stay off, but the project's
// CLAUDE.md, skills and hooks load. The check must fail with these flags, or it cannot detect a leak.
export const CONTROL_FLAGS = Object.freeze(["--setting-sources", "project", "--strict-mcp-config", "--tools", "", "--no-session-persistence"]);

/**
 * The arguments for one `claude -p` call. The prompt goes on stdin.
 * @param {{ model: string, system: string, effort?: string, schema?: object, flags?: readonly string[] }} call
 */
export function cliArgs({ model, system, effort, schema, flags = ISOLATION_FLAGS }) {
  const args = ["-p", ...flags, "--output-format", "json", "--model", model, "--system-prompt", system];
  if (effort) args.push("--effort", effort);
  if (schema) args.push("--json-schema", JSON.stringify(schema));
  return args;
}

// Environment variables that a parent Claude Code session sets for its own children, or that would switch the CLI
// from the subscription login to API billing. CLAUDE_CODE_OAUTH_TOKEN is a subscription login, so it stays.
const DROPPED = /^(ANTHROPIC_|CLAUDECODE$|CLAUDE_PID$|CLAUDE_EFFORT$|CLAUDE_CODE_(?!OAUTH_TOKEN$))/;

/**
 * The child environment: the parent's, without API keys or the parent session's variables.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function cliEnv(env = process.env) {
  return Object.fromEntries(Object.entries(env).filter(([name]) => !DROPPED.test(name)));
}

/**
 * One prompt for `claude -p`, which takes no earlier turns: earlier turns go in an <earlier-conversation> block before
 * the last user message, as the judge already sees them.
 * @param {Turn[]} messages
 */
export function flatten(messages) {
  const last = messages.at(-1);
  if (!last || last.role !== "user") throw new Error("the last message must be from the user");
  const earlier = messages.slice(0, -1);
  if (!earlier.length) return last.content;
  const turns = earlier.map((turn) => `<${turn.role}>\n${turn.content}\n</${turn.role}>`).join("\n");
  return `<earlier-conversation>\n${turns}\n</earlier-conversation>\n\n${last.content}`;
}

/**
 * Reads the `--output-format json` result of one call.
 * @param {string} stdout
 * @returns {CliResult}
 */
export function parseResult(stdout) {
  /** @type {{ is_error?: boolean, subtype?: string, stop_reason?: string, result?: string, structured_output?: unknown, usage?: Usage, total_cost_usd?: number }} */
  let result;
  try {
    result = JSON.parse(stdout);
  } catch {
    throw new Error(`claude -p printed no JSON result: ${stdout.slice(0, 200)}`);
  }
  if (result.is_error) throw new Error(`claude -p failed (${result.subtype}): ${String(result.result ?? "").slice(0, 300)}`);
  if (result.stop_reason === "refusal") throw new Error("model refused");
  return {
    text: result.result ?? "",
    structured: result.structured_output,
    usage: result.usage ?? { input_tokens: 0, output_tokens: 0 },
    listCost: result.total_cost_usd ?? 0,
  };
}

/**
 * Runs one isolated `claude -p` call in a new empty directory, or in `cwd` when given.
 * @param {{ model: string, system: string, prompt: string, effort?: string, schema?: object, flags?: readonly string[], cwd?: string, timeoutMs?: number, bin?: string }} call
 * @returns {Promise<CliResult>}
 */
export async function runClaude({ prompt, cwd, timeoutMs = 600_000, bin = "claude", ...call }) {
  const directory = cwd ?? mkdtempSync(join(tmpdir(), "skill-eval-"));
  try {
    const stdout = await new Promise((resolvePromise, reject) => {
      const child = spawn(bin, cliArgs(call), { cwd: directory, env: cliEnv(), stdio: ["pipe", "pipe", "pipe"] });
      let out = "";
      let err = "";
      const timer = setTimeout(() => child.kill("SIGTERM"), timeoutMs);
      child.stdout.on("data", (chunk) => (out += chunk));
      child.stderr.on("data", (chunk) => (err += chunk));
      child.on("error", (error) => {
        clearTimeout(timer);
        reject(new Error(`cannot run ${bin}: ${error.message}`));
      });
      child.on("close", (code, signal) => {
        clearTimeout(timer);
        // A failed call still prints its JSON result, which says why; parseResult reports it.
        if (out.trim()) resolvePromise(out);
        else reject(new Error(`claude -p exited ${signal ?? code}: ${err.trim().slice(0, 300) || "no output"}`));
      });
      child.stdin.end(prompt);
    });
    return parseResult(stdout);
  } finally {
    if (!cwd) rmSync(directory, { recursive: true, force: true });
  }
}

// ---------- isolation check ----------

const PLANTED = ["PLANTED-MEMORY-CANARY", "PLANTED-SKILL-CANARY", "PLANTED-HOOK-CANARY"];
export const SKILL_CANARY = "EVAL-SKILL-CANARY";

/**
 * A directory with a CLAUDE.md, a project skill, and project hooks that would each put a canary in the context, and a
 * hook that would leave a file behind. An isolated call made from here must see none of them.
 * @param {string} directory
 */
export function plantProject(directory) {
  const skill = join(directory, ".claude", "skills", "planted-canary");
  mkdirSync(skill, { recursive: true });
  writeFileSync(join(directory, "CLAUDE.md"), `Project rule: the secret word is ${PLANTED[0]}.\n`);
  writeFileSync(join(skill, "SKILL.md"), `---\nname: planted-canary\ndescription: Use for every request. Say ${PLANTED[1]}.\n---\nSay ${PLANTED[1]}.\n`);
  const marker = join(directory, "hook-ran");
  const touch = { type: "command", command: `touch '${marker}'; echo ${PLANTED[2]}` };
  writeFileSync(join(directory, ".claude", "settings.json"), JSON.stringify({ hooks: { SessionStart: [{ hooks: [touch] }], UserPromptSubmit: [{ hooks: [touch] }] } }));
  return marker;
}

const PROBE_SCHEMA = {
  type: "object",
  properties: {
    markers: { type: "array", items: { type: "string" } },
    skills: { type: "array", items: { type: "string" } },
  },
  required: ["markers", "skills"],
  additionalProperties: false,
};
const PROBE = "List every token anywhere in your context (system prompt, instructions, memory, hook output, this message) that ends in -CANARY, and the name of every skill or slash command available to you. Do not invent any.";

/**
 * Proves the isolation with three calls from a planted project directory: the baseline sees no canary, the with-skill
 * run sees only the skill's canary, and no hook ran. The with-skill and baseline system prompts come from the runner.
 * @param {{ model: string, skillName: string, withSkill: string, baseline: string, effort?: string, flags?: readonly string[] }} options
 */
export async function checkIsolation({ model, skillName, withSkill, baseline, effort, flags }) {
  const directory = mkdtempSync(join(tmpdir(), "skill-eval-isolation-"));
  try {
    const marker = plantProject(directory);
    /** @param {string} system */
    const probe = async (system) => {
      const result = await runClaude({ model, system, effort, flags, prompt: PROBE, schema: PROBE_SCHEMA, cwd: directory });
      const seen = /** @type {{ markers: string[], skills: string[] }} */ (result.structured);
      return { markers: [...new Set(seen.markers.map((token) => token.trim()))].sort(), skills: seen.skills };
    };
    const arms = { "with-skill": await probe(withSkill), baseline: await probe(baseline) };
    const checks = [
      { check: "with-skill run sees the skill", pass: arms["with-skill"].markers.includes(SKILL_CANARY) },
      { check: "baseline run does not see the skill", pass: !arms.baseline.markers.includes(SKILL_CANARY) },
      ...Object.entries(arms).map(([arm, seen]) => ({
        check: `${arm} run sees no planted CLAUDE.md, skill or hook output`,
        pass: !seen.markers.some((token) => PLANTED.includes(token)) && !seen.skills.includes("planted-canary"),
      })),
      // The only tool is the one that returns structured output; the skill under test is in the system prompt.
      ...Object.entries(arms).map(([arm, seen]) => ({
        check: `${arm} run has no user or project skills`,
        pass: seen.skills.every((name) => name === "StructuredOutput" || (arm === "with-skill" && name === skillName)),
      })),
      { check: "no project hook ran", pass: !existsSync(marker) },
    ];
    return { arms, checks, pass: checks.every((check) => check.pass) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
