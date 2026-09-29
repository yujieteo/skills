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

## Validate

```sh
node skill-sharpening/scripts/verify-collection.mjs
node skill-sharpening/scripts/normalize-frontmatter.mjs   # rewrites in place; review the diff
poteto-mode/scripts/setup.sh --check                      # only when you touched poteto-mode/scripts
```

## Adding a skill

1. Create `<name>/SKILL.md` with the frontmatter above. Follow `writing-for-agents`.
2. Add one row to the matching table in [../SKILL.md](../SKILL.md).
3. Record lineage in `PROVENANCE.md` if the skill is adapted from upstream.
4. Run the validator.
