# Working in this repository

Load this only when you are changing the collection itself.

## Layout

- Each top-level directory is one skill and one installed unit under `~/.codex/skills/<name>/`. Do not move, nest, or rename a skill directory without updating every pointer. The directory name must equal the `name` in its `SKILL.md`.
- `SKILL.md` is the always-loaded entry point. Keep it short and put bulky, situational material in `references/`, `playbooks/`, `assets/`, or `examples/` inside the same skill, linked with a relative Markdown link.
- Root files (`README.md`, `CONTRIBUTING.md`, `PROVENANCE.md`, `PSTACK-UPSTREAM.md`) are for humans on GitHub. Skills never load from them.
- Update `PROVENANCE.md` when a skill changes lineage.

## Rules that the validator enforces

- Frontmatter has `name` and `description`, plus optionally `allowed-tools`, `license`, or `metadata`.
- Description is at most 60 words. State the trigger, not the method.
- `SKILL.md` is at most 2000 words.
- Every relative link in `SKILL.md` resolves.
- Every skill has a router row, and `agents/openai.yaml` uses known keys.

The full rule list is in [linting-and-evals.md](../../skill-sharpening/references/linting-and-evals.md).

## Validate

```sh
node skill-sharpening/scripts/verify-collection.mjs
node skill-sharpening/evals/run.mjs check                 # eval files are well formed
node skill-sharpening/scripts/normalize-frontmatter.mjs   # rewrites in place; review the diff
poteto-mode/scripts/setup.sh --check                      # only when you touched poteto-mode/scripts
npm run typecheck -- --summary                            # after npm ci; when you changed JavaScript
```

For type errors, use `npm run typecheck -- --summary` (add `--file <path>` or `--since <ref>` to narrow it). Do not pipe tsc output through `grep -c`, `sort`, or `uniq`. The summary gives the counts by code and by file and the first errors. The full log goes to `.typecheck/tsc.log`. Exit 0 is pass, 1 is type errors, and 2 is a usage or setup error.

## Adding a skill

1. Create `<name>/SKILL.md` with the frontmatter above. Follow `writing-for-agents`.
2. Add one row to the matching table in [../SKILL.md](../SKILL.md).
3. Record lineage in `PROVENANCE.md` if the skill is adapted from upstream.
4. Add a trigger case to `skill-sharpening/evals/triggers.json`, and behavior cases in `skill-sharpening/evals/cases/<name>.json` if the skill's effect shows in one reply.
5. Run the validator.
