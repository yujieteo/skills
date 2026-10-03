// Offline tests of the claude-cli backend: the flags, environment and directory of each `claude -p` call. A fake
// `claude` records what it got, so no model is called. `node run.mjs isolation --backend claude-cli` checks the real CLI.
// Run: node --test skill-sharpening/evals/claude-cli.test.mjs

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { CONTROL_FLAGS, cliArgs, cliEnv, flatten, ISOLATION_FLAGS, parseResult, runClaude } from "./claude-cli.mjs";

const scratch = mkdtempSync(join(tmpdir(), "claude-cli-test-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

// Prints a `claude -p` JSON result whose structured_output is what the fake received.
const fake = join(scratch, "claude");
writeFileSync(fake, `#!/usr/bin/env node
const { readdirSync, readFileSync } = require("node:fs");
const stdin = readFileSync(0, "utf8");
const seen = { args: process.argv.slice(2), env: process.env, cwd: process.cwd(), files: readdirSync("."), stdin };
console.log(JSON.stringify({ is_error: false, result: "ok", structured_output: seen, usage: { input_tokens: 3, output_tokens: 2 }, total_cost_usd: 0.01 }));
`);
chmodSync(fake, 0o755);

test("cliArgs turns off every user and project source, and tools", () => {
  const args = cliArgs({ model: "claude-haiku-4-5", system: "SYSTEM", effort: "low", schema: { type: "object" } });
  assert.deepEqual(args.slice(0, 1 + ISOLATION_FLAGS.length), ["-p", ...ISOLATION_FLAGS]);
  for (const flag of ["--safe-mode", "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence"]) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf("--setting-sources") + 1], "");
  assert.equal(args[args.indexOf("--tools") + 1], "");
  assert.equal(args[args.indexOf("--system-prompt") + 1], "SYSTEM");
  assert.equal(args[args.indexOf("--model") + 1], "claude-haiku-4-5");
  assert.equal(args[args.indexOf("--effort") + 1], "low");
  assert.equal(args[args.indexOf("--json-schema") + 1], '{"type":"object"}');
  assert.equal(args[args.indexOf("--output-format") + 1], "json");
});

test("the control flags load the project on purpose", () => {
  const args = cliArgs({ model: "m", system: "s", flags: CONTROL_FLAGS });
  assert.ok(!args.includes("--safe-mode"));
  assert.equal(args[args.indexOf("--setting-sources") + 1], "project");
});

test("cliEnv drops API keys and the parent session's variables, and keeps the subscription login", () => {
  const env = cliEnv({
    HOME: "/home/a", PATH: "/bin", CLAUDE_CONFIG_DIR: "/c", CLAUDE_CODE_OAUTH_TOKEN: "t",
    ANTHROPIC_API_KEY: "k", ANTHROPIC_AUTH_TOKEN: "k", ANTHROPIC_BASE_URL: "u",
    CLAUDECODE: "1", CLAUDE_PID: "9", CLAUDE_EFFORT: "max", CLAUDE_CODE_ENTRYPOINT: "cli", CLAUDE_CODE_SESSION_ID: "s",
  });
  assert.deepEqual(Object.keys(env).sort(), ["CLAUDE_CODE_OAUTH_TOKEN", "CLAUDE_CONFIG_DIR", "HOME", "PATH"]);
});

test("flatten puts earlier turns before the last user message", () => {
  assert.equal(flatten([{ role: "user", content: "hi" }]), "hi");
  assert.equal(
    flatten([{ role: "user", content: "a" }, { role: "assistant", content: "b" }, { role: "user", content: "c" }]),
    "<earlier-conversation>\n<user>\na\n</user>\n<assistant>\nb\n</assistant>\n</earlier-conversation>\n\nc",
  );
  assert.throws(() => flatten([{ role: "assistant", content: "b" }]), /last message/);
});

test("parseResult reports errors, refusals and missing JSON", () => {
  assert.throws(() => parseResult('{"is_error":true,"subtype":"error_max_turns","result":"x"}'), /error_max_turns/);
  assert.throws(() => parseResult('{"stop_reason":"refusal"}'), /refused/);
  assert.throws(() => parseResult("Not logged in"), /no JSON/);
  assert.deepEqual(parseResult('{"result":"hi","usage":{"input_tokens":1,"output_tokens":2},"total_cost_usd":0.5}'), {
    text: "hi", structured: undefined, usage: { input_tokens: 1, output_tokens: 2 }, listCost: 0.5,
  });
});

test("runClaude runs in a new empty directory, sends the prompt on stdin, and removes the directory", async () => {
  process.env.ANTHROPIC_API_KEY = "must-not-reach-the-child";
  try {
    const result = await runClaude({ bin: fake, model: "m", system: "s", prompt: "PROMPT" });
    const seen = /** @type {{ args: string[], env: Record<string, string>, cwd: string, files: string[], stdin: string }} */ (result.structured);
    assert.equal(seen.stdin, "PROMPT");
    assert.deepEqual(seen.files, []);
    assert.ok(!("ANTHROPIC_API_KEY" in seen.env));
    assert.ok(seen.args.includes("--safe-mode"));
    assert.ok(!existsSync(seen.cwd));
    assert.deepEqual(result.usage, { input_tokens: 3, output_tokens: 2 });
  } finally {
    delete process.env.ANTHROPIC_API_KEY;
  }
});

test("runClaude keeps a directory it was given", async () => {
  const directory = mkdtempSync(join(scratch, "cwd-"));
  await runClaude({ bin: fake, model: "m", system: "s", prompt: "p", cwd: directory });
  assert.ok(existsSync(directory));
  assert.deepEqual(readdirSync(directory), []);
});

test("runClaude reports a missing CLI", async () => {
  await assert.rejects(runClaude({ bin: join(scratch, "no-such-claude"), model: "m", system: "s", prompt: "p" }), /cannot run/);
});
