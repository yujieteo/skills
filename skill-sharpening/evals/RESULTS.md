# Recorded eval results

Summaries of eval runs, kept so that a later run has a reference. The full replies and verdicts stay in `results/`, which git ignores. Add a section for each run that you want to keep, newest first.

## 2026-10-03: first run, on the Claude subscription

All runs used `--backend claude-cli`, `claude-opus-5-5` for the model and the judge, the model's default effort, and concurrency 2. Claude Code was version 2.1.288. The subscription paid for the calls. The "list price" column is the API price of the same tokens, from `total_cost_usd`.

### Isolation check

| Command | Result | Calls | Wall time |
|---|---|---|---|
| `node run.mjs isolation --backend claude-cli` | 7/7 checks pass | 2 | 10 s |
| `node run.mjs isolation --backend claude-cli --control` | 3 checks fail, as the control must | 2 | 12 s |

The with-skill run saw the probe skill's marker and no other marker. The baseline run saw no marker and no skill. Neither run saw the planted `CLAUDE.md`, project skill or hook output, and no project hook ran. The control loads the project's files on purpose. It saw the planted `CLAUDE.md` and hook output and ran the hook, so the check can find a leak.

### Trigger suite

| Cases | Passed | Calls | Wall time | Tokens in / out | List price |
|---|---|---|---|---|---|
| 54 | 54 (100%) | 54 | 106 s | 475,633 / 6,710 | $0.43 |

Each case expects one skill (or one of a few), or no skill. Every one of the 53 skills that a case expects loaded for its case, and the three `none` cases loaded no skill. The suite does not test the other 36 skills in the collection.

### Behavior cases

Each case ran once with the skill and once without it (`--baseline`). Each run made two calls: one reply and one judge.

| Skill | Case | With skill | Baseline | Calls | Wall time | List price |
|---|---|---|---|---|---|---|
| ste100 | ste100-status-update | 7/7 | 5/7 | 8 | 43 s | — |
| ste100 | ste100-rewrite-procedure | 6/6 | 6/6 | | | |
| writing-for-agents | wfa-pointer-placement | 3/3 | 2/3 | 8 | 34 s | $0.15 |
| writing-for-agents | wfa-negation-rewrite | 4/4 | 4/4 | | | |
| review-by-risk | rbr-edited-copy | 3/3 | 2/3 | 8 | 48 s | $0.18 |
| review-by-risk | rbr-review-again | 3/3 | 1/3 | | | |
| parallel-safe-repository | psr-shared-index | 3/3 | 3/3 | 8 | 50 s | $0.25 |
| parallel-safe-repository | psr-ci-selection | 4/4 | 4/4 | | | |

Calls, wall time and list price are for each skill's run, on the skill's first row. The ste100 run did not record its list price.

Every case passes with its skill. Four cases also pass without the skill, so they do not show what the skill adds: `ste100-rewrite-procedure`, `wfa-negation-rewrite`, `psr-shared-index` and `psr-ci-selection`. Make these cases harder, or replace them, before you use them to compare two versions of a skill.
