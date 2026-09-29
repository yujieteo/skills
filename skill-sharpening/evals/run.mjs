#!/usr/bin/env node

// Evals for the skills collection. See ../references/linting-and-evals.md.
//
//   node run.mjs check                 validate the eval files (offline, free)
//   node run.mjs triggers              does each request pick the right skill?
//   node run.mjs behavior [--baseline] does a loaded skill change the answer as intended?

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkills } from "../scripts/lib/skills.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repository = resolve(here, "..", "..");
const PRICES = { "claude-opus-5-5": [4, 20], "claude-sonnet-5-5": [2, 10], "claude-haiku-4-5": [1, 5] }; // $ per million tokens, input/output

const [command, ...rest] = process.argv.slice(2);
const options = parseOptions(rest);
const skills = loadSkills(repository);
const skillNames = new Set(skills.map((skill) => skill.dirName));

function parseOptions(list) {
  const parsed = {
    model: "claude-opus-5-5",
    judgeModel: "claude-opus-5-5",
    effort: undefined,
    concurrency: 4,
    runs: 1,
    baseline: false,
    skill: undefined,
    only: undefined,
  };
  for (let index = 0; index < list.length; index++) {
    const flag = list[index];
    const value = () => list[++index];
    if (flag === "--model") parsed.model = value();
    else if (flag === "--judge-model") parsed.judgeModel = value();
    else if (flag === "--effort") parsed.effort = value();
    else if (flag === "--concurrency") parsed.concurrency = Number(value());
    else if (flag === "--runs") parsed.runs = Number(value());
    else if (flag === "--baseline") parsed.baseline = true;
    else if (flag === "--skill") parsed.skill = value();
    else if (flag === "--only") parsed.only = value();
    else throw new Error(`unknown option ${flag}`);
  }
  return parsed;
}

// ---------- eval files ----------

function loadTriggerCases() {
  return JSON.parse(readFileSync(join(here, "triggers.json"), "utf8")).cases;
}

function loadBehaviorSuites() {
  const directory = join(here, "cases");
  return readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({ file, ...JSON.parse(readFileSync(join(directory, file), "utf8")) }));
}

function check() {
  const problems = [];
  const ids = new Set();
  const seen = (id, where) => {
    if (!id) problems.push(`${where}: case has no id`);
    else if (ids.has(id)) problems.push(`${where}: duplicate case id ${id}`);
    ids.add(id);
  };

  const triggers = loadTriggerCases();
  for (const testCase of triggers) {
    seen(testCase.id, "triggers.json");
    if (!testCase.prompt) problems.push(`triggers.json ${testCase.id}: prompt is required`);
    if (!Array.isArray(testCase.expect)) problems.push(`triggers.json ${testCase.id}: expect must be a list (empty means no skill)`);
    for (const name of testCase.expect ?? []) {
      if (!skillNames.has(name)) problems.push(`triggers.json ${testCase.id}: ${name} is not a skill`);
    }
  }

  const suites = loadBehaviorSuites();
  for (const suite of suites) {
    if (`${suite.skill}.json` !== suite.file) problems.push(`cases/${suite.file}: skill field must match the file name`);
    if (!skillNames.has(suite.skill)) problems.push(`cases/${suite.file}: ${suite.skill} is not a skill`);
    for (const testCase of suite.cases ?? []) {
      seen(testCase.id, `cases/${suite.file}`);
      if (!testCase.prompt) problems.push(`cases/${suite.file} ${testCase.id}: prompt is required`);
      for (const turn of testCase.history ?? []) {
        if (!["user", "assistant"].includes(turn.role) || typeof turn.content !== "string") {
          problems.push(`cases/${suite.file} ${testCase.id}: history turns need a user or assistant role and string content`);
        }
      }
      if (!testCase.assertions?.length) problems.push(`cases/${suite.file} ${testCase.id}: at least one assertion is required`);
    }
  }

  const covered = new Set(triggers.flatMap((testCase) => testCase.expect));
  const behaviorCases = suites.reduce((sum, suite) => sum + suite.cases.length, 0);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`status: valid`);
  console.log(`trigger cases: ${triggers.length} (${covered.size} of ${skillNames.size} skills expected at least once)`);
  console.log(`behavior cases: ${behaviorCases} across ${suites.length} skills`);
}

// ---------- model calls ----------

let client;
let Anthropic;
let z;
let zodOutputFormat;
const usage = {};

async function setup() {
  ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  ({ z } = await import("zod"));
  ({ zodOutputFormat } = await import("@anthropic-ai/sdk/helpers/zod"));
  client = new Anthropic({ maxRetries: 4 });
}

function track(model, response) {
  const entry = (usage[model] ??= { input: 0, output: 0 });
  entry.input += response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
  entry.output += response.usage.output_tokens;
}

function request(model, fields) {
  const body = { model, max_tokens: 16000, ...fields };
  if (options.effort) body.output_config = { ...body.output_config, effort: options.effort };
  return body;
}

async function ask(model, fields) {
  const response = await client.messages.create(request(model, fields));
  track(model, response);
  if (response.stop_reason === "refusal") throw new Error(`model refused (${response.stop_details?.category ?? "no category"})`);
  return response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
}

async function askStructured(model, fields, schema) {
  const response = await client.messages.parse(request(model, { ...fields, output_config: { format: zodOutputFormat(schema) } }));
  track(model, response);
  if (response.stop_reason === "refusal") throw new Error(`model refused (${response.stop_details?.category ?? "no category"})`);
  if (!response.parsed_output) throw new Error(`no structured output (stop_reason ${response.stop_reason})`);
  return response.parsed_output;
}

async function pool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.max(1, options.concurrency) }, async () => {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = await worker(items[index]);
      } catch (failure) {
        results[index] = { error: failure instanceof Anthropic.APIError ? `${failure.status} ${failure.message}` : String(failure.message ?? failure) };
      }
      process.stderr.write(".");
    }
  });
  await Promise.all(lanes);
  process.stderr.write("\n");
  return results;
}

function repeated(cases) {
  return cases.flatMap((testCase) => Array.from({ length: options.runs }, (_, run) => ({ ...testCase, run })));
}

function save(kind, data) {
  const directory = join(here, "results");
  mkdirSync(directory, { recursive: true });
  const path = join(directory, `${kind}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(path, JSON.stringify({ kind, options, usage, ...data }, null, 2));
  return path;
}

function printCost() {
  let dollars = 0;
  for (const [model, { input, output }] of Object.entries(usage)) {
    const [inPrice, outPrice] = PRICES[model] ?? [0, 0];
    dollars += (input * inPrice + output * outPrice) / 1e6;
    console.log(`tokens ${model}: ${input} in, ${output} out`);
  }
  console.log(`approximate cost: $${dollars.toFixed(2)}`);
}

// ---------- trigger evals ----------

function skillMenu() {
  return skills.map((skill) => `- ${skill.dirName}: ${skill.fields?.description ?? ""}`).join("\n");
}

async function triggers() {
  await setup();
  const cases = repeated(loadTriggerCases().filter((testCase) => !options.only || testCase.id.includes(options.only)));
  const choice = z.object({ skill: z.enum(["none", ...skillNames]), reason: z.string() });
  const system = [
    "You are a coding agent. These skills are installed. Each line is a skill name and its description.",
    "Load a skill only when its description says it fits the user's request. Load at most one.",
    "",
    skillMenu(),
    "",
    'Reply with the one skill you would load for the user\'s request, or "none" if no skill fits.',
  ].join("\n");

  const results = await pool(cases, async (testCase) => {
    const picked = await askStructured(options.model, { system, messages: [{ role: "user", content: testCase.prompt }] }, choice);
    const expected = testCase.expect.length ? testCase.expect : ["none"];
    return { picked: picked.skill, reason: picked.reason, pass: expected.includes(picked.skill) };
  });

  const rows = cases.map((testCase, index) => ({ id: testCase.id, run: testCase.run, prompt: testCase.prompt, expect: testCase.expect, ...results[index] }));
  const failures = rows.filter((row) => !row.pass);
  for (const row of failures) {
    const expected = row.expect.length ? row.expect.join(" or ") : "none";
    console.log(`FAIL ${row.id}: expected ${expected}, got ${row.error ? `error: ${row.error}` : row.picked}`);
    if (row.reason) console.log(`     reason: ${row.reason}`);
  }
  const passed = rows.length - failures.length;
  console.log(`\ntrigger accuracy: ${passed}/${rows.length} (${((100 * passed) / rows.length).toFixed(0)}%)`);
  printCost();
  console.log(`results: ${save("triggers", { rows })}`);
  if (failures.length) process.exitCode = 1;
}

// ---------- behavior evals ----------

const NO_TOOLS = "You cannot run tools or read files in this conversation. If you would normally run a command or open a file, say so in one line and continue as far as you can.";

function candidateSystem(skill) {
  if (!skill) return `You are a coding agent.\n\n${NO_TOOLS}`;
  return [
    "You are a coding agent. The user's request loaded the skill below. Follow it.",
    "",
    `<skill name="${skill.dirName}">`,
    skill.content,
    "</skill>",
    "",
    NO_TOOLS,
  ].join("\n");
}

function context(testCase) {
  if (!testCase.history?.length) return "";
  const turns = testCase.history.map((turn) => `<${turn.role}>\n${turn.content}\n</${turn.role}>`).join("\n");
  return `<earlier-conversation>\n${turns}\n</earlier-conversation>\n\n`;
}

async function grade(testCase, answer) {
  const verdict = z.object({
    results: z.array(z.object({ assertion: z.string(), pass: z.boolean(), evidence: z.string() })),
  });
  const numbered = testCase.assertions.map((assertion, index) => `${index + 1}. ${assertion}`).join("\n");
  const graded = await askStructured(options.judgeModel, {
    system: "You grade an assistant's reply against a checklist. Judge each item strictly and independently from the reply text alone. Quote the reply as evidence. An item passes only if the reply clearly satisfies it.",
    messages: [{
      role: "user",
      content: `${context(testCase)}<request>\n${testCase.prompt}\n</request>\n\n<reply>\n${answer}\n</reply>\n\n<checklist>\n${numbered}\n</checklist>\n\nReturn one result per checklist item, in order, copying the item text into "assertion".`,
    }],
  }, verdict);
  if (graded.results.length !== testCase.assertions.length) throw new Error("judge returned the wrong number of results");
  return graded.results.map((result, index) => ({ ...result, assertion: testCase.assertions[index] }));
}

async function behavior() {
  await setup();
  const suites = loadBehaviorSuites().filter((suite) => !options.skill || suite.skill === options.skill);
  if (!suites.length) throw new Error(`no behavior cases for ${options.skill}`);
  const bySkill = new Map(skills.map((skill) => [skill.dirName, skill]));
  const arms = options.baseline ? ["with-skill", "baseline"] : ["with-skill"];
  const jobs = suites.flatMap((suite) =>
    repeated(suite.cases.filter((testCase) => !options.only || testCase.id.includes(options.only)))
      .flatMap((testCase) => arms.map((arm) => ({ ...testCase, skill: suite.skill, arm }))),
  );

  const results = await pool(jobs, async (job) => {
    const system = candidateSystem(job.arm === "with-skill" ? bySkill.get(job.skill) : null);
    const messages = [...(job.history ?? []), { role: "user", content: job.prompt }];
    const answer = await ask(options.model, { system, messages });
    const checks = await grade(job, answer);
    return { answer, checks, pass: checks.every((check) => check.pass) };
  });

  const rows = jobs.map((job, index) => ({ id: job.id, skill: job.skill, arm: job.arm, run: job.run, ...results[index] }));
  for (const row of rows) {
    const label = `${row.pass ? "PASS" : "FAIL"} ${row.id}${options.baseline ? ` [${row.arm}]` : ""}`;
    console.log(label);
    if (row.error) console.log(`     error: ${row.error}`);
    for (const check of row.checks ?? []) {
      if (!check.pass) console.log(`     x ${check.assertion}\n       ${check.evidence}`);
    }
  }

  console.log("");
  for (const arm of arms) {
    const armRows = rows.filter((row) => row.arm === arm);
    const checks = armRows.flatMap((row) => row.checks ?? []);
    const passedChecks = checks.filter((check) => check.pass).length;
    const passedCases = armRows.filter((row) => row.pass).length;
    console.log(`${arm}: cases ${passedCases}/${armRows.length}, assertions ${passedChecks}/${checks.length}`);
  }
  printCost();
  console.log(`results: ${save("behavior", { rows })}`);
  if (rows.some((row) => row.arm === "with-skill" && !row.pass)) process.exitCode = 1;
}

// ---------- entry ----------

const commands = { check, triggers, behavior };
if (!commands[command]) {
  console.error("usage: node run.mjs <check|triggers|behavior> [--model M] [--judge-model M] [--effort low|medium|high]");
  console.error("       [--concurrency N] [--runs N] [--only ID] [--skill NAME] [--baseline]");
  process.exit(2);
}
if (command !== "check" && !existsSync(join(here, "node_modules", "@anthropic-ai", "sdk"))) {
  console.error("run `npm ci` in skill-sharpening/evals first");
  process.exit(2);
}
await commands[command]();
