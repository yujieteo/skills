# Yu Jie's Skills

This is my working collection of agent skills: small, opinionated instructions refined around how I actually think and work. The repository is not a neutral catalog. It is the canonical source installed directly at `~/.codex/skills`, and a daily Codex automation is trusted to sharpen its contents, learn from my edits and reverts, reconcile useful upstream ideas, validate the result, and publish it here.

## Repository layout

Each top-level directory is one skill, anchored by a `SKILL.md` with YAML frontmatter (`name` and `description`). Supporting material sits beside it when the skill needs it:

- `agents/` — host policy or subagent configuration for the skill.
- `references/` — longer material the `SKILL.md` loads on demand.
- `scripts/` — runnable helpers, when the skill ships any.
- `assets/` and `examples/` — templates a skill copies from, and finished worked outputs that show what the skill produces, such as `generate-slide-deck/assets/deck-shell.html` and `generate-slide-deck/examples/fpl-early-season/`. `generate-vgc-trainer/assets/starter/` is a minimal valid dataset that the skill's `scripts/verify-trainer-data.py` checks.
- Named documents the skill points to, such as `poteto-mode/playbooks/`, `domain-modeling/ADR-FORMAT.md`, and `wizard/template.sh`.

`skills-router/` is the short entry point: one table that maps a task type to the single skill that fits, so an agent loads one skill instead of scanning all of them. Add a row there when you add a skill. Skills keep their bulky, situational material in `references/` or `playbooks/` and link to it, so the always-loaded `SKILL.md` stays small.

`poteto-mode/` is the largest subtree, with its own scripts, references, and playbooks. `skill-sharpening/` holds the collection linter, frontmatter normalizer, and evals used by the daily automation.

Repository-level files sit at the root: `README.md`, [`CONTRIBUTING.md`](CONTRIBUTING.md), `LICENSE`, the two provenance records, and `.github/` for CI and the pull request template. Skill directories stay flat at the top level because the repository is installed as `~/.codex/skills`.

## Lineage and credit

Much of the collection began with or was adapted from [Matt Pocock's Skills for Real Engineers](https://github.com/mattpocock/skills). Matt deserves the majority of the credit for that initial body of work and its core ideas. His repository explicitly encourages users to adapt the skills, and it is distributed under the MIT License.

The pstack skills, playbooks, and principles are adapted from [Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack). Lauren created the engineering workflow behind Poteto Mode. The pstack material is MIT licensed and carries her copyright notice.

The versions here are independently maintained derivatives shaped to my preferences. Skills I wrote independently sit beside those derivatives; [`PROVENANCE.md`](PROVENANCE.md) records the distinction as accurately as the available history permits.

## Provenance

[`PROVENANCE.md`](PROVENANCE.md) records which skills are derivatives of upstream work and which were developed independently, and [`PSTACK-UPSTREAM.md`](PSTACK-UPSTREAM.md) records the verified pstack source revision and license terms. The upstream sources are:

- [mattpocock/skills](https://github.com/mattpocock/skills) — MIT, the origin of most of the initial collection.
- [pstack in cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack) — MIT, Copyright (c) 2026 Lauren Tan (`@poteto`).

Update the provenance files whenever a skill changes lineage.

## Installation

Clone the repository as the Codex skills directory:

```sh
git clone git@github.com:yujieteo/skills.git ~/.codex/skills
```

That is the canonical install target. The skill instructions are portable to Claude and Cursor, which read project- or user-level skill directories of their own; copy or symlink the skills you want into the host's skill path. OpenAI-managed system skills are intentionally excluded and remain under the local `.system/` directory.

## Poteto Mode tools

Poteto Mode works in Claude, Codex, and Cursor. Its optional orchestration and GitHub watcher tools use Bun and TypeScript. Run the setup for your platform:

```sh
poteto-mode/scripts/setup.sh
```

On native Windows, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\poteto-mode\scripts\setup.ps1
```

Both scripts install Bun after confirmation, install locked dependencies, and verify the tools. See [the runtime setup guide](poteto-mode/references/runtime-setup.md) for check-only and non-interactive modes.

## Verification

Run the collection validator before committing:

```sh
node skill-sharpening/scripts/verify-collection.mjs
```

It lints the collection: frontmatter, names, description and entrypoint limits, local links, `agents/openai.yaml`, router and provenance coverage. Errors fail the run; warnings print. It reads only; it changes nothing.

Evals check that skills work when a model uses them: that a request loads the right skill, and that a loaded skill changes the reply as intended. They call the Anthropic API, so they cost money and run by hand. [Linting and evals](skill-sharpening/references/linting-and-evals.md) explains both, every lint rule, and how to add eval cases.

To exercise the Poteto Mode helpers without changing the toolchain:

```sh
poteto-mode/scripts/setup.sh --check
```

That verifies the existing toolchain without changing it, then runs the tests, type checker, and helper smoke tests. To run the checks directly against locked dependencies:

```sh
cd poteto-mode/scripts
bun install --frozen-lockfile
bun test orch watch-pr
bun run typecheck
```

The [CI workflow](.github/workflows/ci.yml) runs the collection linter, the eval file check, and the Poteto Mode tests and type checker on every push to `main` and every pull request. The [Evals workflow](.github/workflows/evals.yml) runs the paid evals when started by hand.
