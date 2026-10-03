# Linting and evals

This collection has two kinds of checks. They answer different questions.

| | Lint | Evals |
|---|---|---|
| Question | Is each skill well formed? | Does each skill work when a model uses it? |
| How | Reads files and checks rules | Sends prompts to Claude and grades the replies |
| Cost | Free, about 1 second | API calls or Claude subscription use, a few minutes |
| Result | The same every run | Varies a little between runs |
| When | Every commit, and in CI on every PR | After you change a skill's description or instructions |

Lint catches broken structure: a typo in a link, a missing router row, or a description that is too long. Evals catch broken behavior: a description so vague that the wrong skill loads, or instructions the model ignores.

## Lint

```sh
node skill-sharpening/scripts/verify-collection.mjs            # errors fail, warnings print
node skill-sharpening/scripts/verify-collection.mjs --strict   # warnings fail too
node --test skill-sharpening/scripts/verify-collection.test.mjs   # the linter's own tests, on fixture collections
```

Each finding names the file, the problem, and the rule id in brackets:

```
error: orphan/SKILL.md: skill has no row in skills-router/SKILL.md [router/missing-skill]
```

Fix every error. A warning is a smell worth a look, not always a bug.

| Rule | Severity | What it checks |
|---|---|---|
| `layout/not-a-skill` | error | Every top-level directory, except hidden ones and an installed `node_modules`, has a `SKILL.md` |
| `layout/nested-skill` | error | No `SKILL.md` below the top level |
| `frontmatter/parse`, `frontmatter/unknown-key`, `frontmatter/required` | error | Frontmatter parses, uses only `name`, `description`, `allowed-tools`, `license`, or `metadata`, and has `name` and `description` |
| `name/format`, `name/matches-directory` | error | `name` is lowercase kebab case and equals the directory name |
| `description/word-limit`, `description/char-limit` | error | Description is at most 60 words and 1024 characters |
| `description/no-tags`, `description/duplicate` | error | No XML or HTML tags, and no two skills share a description |
| `description/trigger` | warning | Description says when to use the skill ("Use when ...", "Apply when ...") |
| `entrypoint/word-limit` | error | `SKILL.md` is at most 2000 words |
| `entrypoint/empty-body` | warning | `SKILL.md` has real instructions, unless it delegates to another skill |
| `links/unresolved` | error in `SKILL.md`, warning elsewhere | Every relative Markdown link resolves |
| `paths/missing` | warning | Backticked `references/`, `playbooks/`, `assets/`, and `examples/` paths exist |
| `agents/*` | error | `agents/openai.yaml` uses known keys, and `allow_implicit_invocation` is `true` or `false` |
| `router/missing-skill`, `router/unknown-skill` | error | Every skill has a row in `skills-router` (principles may be routed through `poteto-mode/references/principles.md`), and the router names only real skills |
| `provenance/missing` | warning | Every skill is listed in `PROVENANCE.md` |
| `scripts/not-executable` | warning | `.sh` and `.py` files in `scripts/` are executable |

The frontmatter parser understands folded (`>-`) and literal (`|`) descriptions. The earlier validator read `description: >-` as the one-word description `>-`, so it never checked the length of those descriptions.

## Evals

The evals live in [`../evals/`](../evals/). They need Node 22 and a one-time install:

```sh
cd skill-sharpening/evals
npm ci
```

### Choose a backend

The runner sends each model call through one of two backends. Every eval command takes `--backend`.

| Backend | How each call runs | Who pays | Needs |
|---|---|---|---|
| `api` (default) | The Anthropic API, through `@anthropic-ai/sdk` | API usage, at list price | `ANTHROPIC_API_KEY`, or `ant auth login` once |
| `claude-cli` | One headless `claude -p` run | The Claude subscription that Claude Code is logged in to | The `claude` CLI on `PATH`, logged in to a subscription |

To run the evals on a subscription, use `claude-cli`. It never reads or needs an API key: it removes `ANTHROPIC_*` variables from each call's environment, so a key in your shell cannot move the bill to the API.

```sh
node run.mjs isolation --backend claude-cli           # first, prove each call is isolated (2 calls)
node run.mjs triggers --backend claude-cli
node run.mjs behavior --backend claude-cli --skill ste100 --baseline
```

The subscription's limits are shared with every other Claude Code session on the account, such as an agent fleet. So `claude-cli` runs 2 calls at a time by default, not 4, and every command prints its call count before it starts. Run one skill or `--only` while you iterate. Each result reports the API list price of the same tokens, for comparison; the subscription does not bill it.

#### Isolation

The CLI normally loads your `CLAUDE.md`, skills, plugins, settings, hooks and MCP servers. Then a "with skill" run would also see your other skills and rules, and the baseline would not be a baseline. So each `claude-cli` call:

- runs in a new empty temporary directory, which it deletes after the call;
- passes `--safe-mode` (no `CLAUDE.md`, skills, plugins, hooks or custom agents), `--setting-sources ""` (no settings files), `--strict-mcp-config` (no MCP servers), `--disable-slash-commands`, `--tools ""` (no tools) and `--no-session-persistence` (no saved transcript);
- replaces the whole system prompt with the runner's prompt (`--system-prompt`), and gets its JSON answers through `--json-schema`.

The only difference between a with-skill run and a baseline run is the skill text in the system prompt. Login still works, because `--safe-mode` keeps authentication.

`node run.mjs isolation --backend claude-cli` proves this with two real calls. It plants a `CLAUDE.md`, a project skill and project hooks in a directory, each with a marker, and runs a with-skill call and a baseline call from there. Each call lists every marker and skill it can see. The check passes when the with-skill call sees only the probe skill's marker, the baseline sees nothing, and no hook ran. `--control` runs the same probe with the project's files loaded on purpose. It must fail, which shows that the check can find a leak. [`claude-cli.test.mjs`](../evals/claude-cli.test.mjs) tests the flags, environment and directory of each call offline, with a fake `claude`, and CI runs it.

### Check the eval files (free)

```sh
node run.mjs check
```

This validates the eval files without calling the API: every expected skill exists, case ids are unique, and every behavior case has assertions. CI runs it.

### Trigger evals: does the right skill load?

```sh
node run.mjs triggers
```

The runner shows Claude every skill's name and description, the way an agent host does, plus one user request from [`triggers.json`](../evals/triggers.json). Claude names the one skill it would load, or `none`. A case passes when the answer is in the case's `expect` list. An empty `expect` list means no skill should load.

A failure means a description is unclear or overlaps with another skill. The output prints the model's reason. Fix the description, not the test case, unless the case itself was wrong.

### Behavior evals: does the skill change the answer?

```sh
node run.mjs behavior                      # every skill with cases
node run.mjs behavior --skill tdd          # one skill
node run.mjs behavior --baseline           # also run without the skill, for comparison
```

For each case in [`cases/`](../evals/cases/), the runner:

1. Loads the skill's `SKILL.md` into the system prompt, then sends the case's `prompt`, plus any earlier `history` turns.
2. Gives the reply to a second Claude call, the judge. The judge checks each `assertion` and quotes the reply as evidence.
3. Marks the case passed when every assertion passes.

`--baseline` runs each case a second time without the skill. If the baseline passes as often as the skill does, the skill adds nothing for that case: either the case is too easy or the skill's instructions are not doing work.

The candidate model cannot run tools during a behavior eval. Write cases for what a skill decides or writes in one reply, not for multi-step tool work such as publishing a podcast.

### Options

| Option | Default | Meaning |
|---|---|---|
| `--model` | `claude-opus-5-5` | Model under test |
| `--judge-model` | `claude-opus-5-5` | Model that grades behavior replies |
| `--effort` | model default | `low`, `medium`, `high`, `xhigh`, or `max` |
| `--runs N` | 1 | Repeat each case N times to measure variance |
| `--only ID` | all | Run only cases whose id contains ID |
| `--skill NAME` | all | Behavior evals for one skill |
| `--backend` | `api` | `api` or `claude-cli`; see [Choose a backend](#choose-a-backend) |
| `--concurrency N` | 4 for `api`, 2 for `claude-cli` | Parallel requests |

Each run prints the call count before it starts. At the end it prints token counts, calls, wall time and an approximate cost, and saves the full replies and verdicts to `evals/results/` (gitignored). The trigger suite makes one request per case. The behavior suite makes two per case (reply and judge), and twice that with `--baseline`. Run one skill or `--only` while you iterate.

A model refusal counts as a failed case. The runner does not fall back to another model, so every result comes from the model you named.

### Add a case

Trigger case, in `triggers.json`:

```json
{ "id": "tdd-regression", "prompt": "Write a failing regression test for the off-by-one in paginate() first, then fix it.", "expect": ["tdd"] }
```

Behavior case, in `cases/<skill>.json` (the file name must equal the `skill` field):

```json
{
  "skill": "tdd",
  "cases": [
    {
      "id": "tdd-cheap-bug",
      "prompt": "Bug: slugify(\"Hello  World\") returns hello--world ...",
      "assertions": ["The reply says the new test should be run and seen to fail before the production code changes."]
    }
  ]
}
```

Good cases:

- Read like a real request. Do not mention evals, tests of the skill, or the skill's name unless a user would type it.
- Include near misses: a request that sounds like a skill but should load another one, or none.
- Have assertions a stranger can check from the reply alone. "Asks who the questionnaire is for" is checkable. "Is helpful" is not.
- Test what the skill changes. If the baseline passes an assertion too, the assertion does not measure the skill.

Run `node run.mjs check` after every edit.

### Record a run

[`RESULTS.md`](../evals/RESULTS.md) keeps a summary of each run that you want to keep: pass or fail for each skill or case, calls, wall time and cost. Copy the numbers from the run's output. Do not copy replies or verdicts, which can hold private data; they stay in the gitignored `results/` folder.

## In CI

The `CI` workflow runs the linter and `run.mjs check` on every push and PR. The `Evals` workflow runs the paid evals only when started by hand from the Actions tab, and only when the repository has an `ANTHROPIC_API_KEY` secret. It uses the `api` backend and uploads the results as a build artifact. The `claude-cli` backend runs only on a machine where Claude Code is logged in to a subscription, not in CI.
