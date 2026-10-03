// The claude-cli backend: each eval model call is one headless `claude -p` run, so the evals bill the Claude
// subscription that the local Claude Code CLI is logged in to, not an API key. See ../references/linting-and-evals.md.
//
// The CLI normally loads the user's CLAUDE.md, skills, settings, hooks, plugins and MCP servers. Every call here turns
// those off and runs in a new empty directory, so the only context is the system prompt and the prompt the runner
// passes. Then a "with skill" run and a baseline run differ only by the skill.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** @typedef {{ role: "user" | "assistant", content: string }} Turn */
/** @typedef {{ input_tokens: number, output_tokens: number, cache_read_input_tokens?: number | null, cache_creation_input_tokens?: number | null }} Usage */
/** @typedef {{ text: string, structured: unknown, usage: Usage }} CliResult */

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

/**
 * The arguments for one `claude -p` call. The prompt goes on stdin.
 * @param {{ model: string, system: string, effort?: string, schema?: object }} call
 */
export function cliArgs({ model, system, effort, schema }) {
  const args = ["-p", ...ISOLATION_FLAGS, "--output-format", "json", "--model", model, "--system-prompt", system];
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
  /** @type {{ is_error?: boolean, subtype?: string, stop_reason?: string, result?: string, structured_output?: unknown, usage?: Usage }} */
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
  };
}

/**
 * Runs one isolated `claude -p` call in a new empty directory.
 * @param {{ model: string, system: string, prompt: string, effort?: string, schema?: object, timeoutMs?: number, bin?: string }} call
 * @returns {Promise<CliResult>}
 */
export async function runClaude({ prompt, timeoutMs = 600_000, bin = "claude", ...call }) {
  const directory = mkdtempSync(join(tmpdir(), "skill-eval-"));
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
    rmSync(directory, { recursive: true, force: true });
  }
}
