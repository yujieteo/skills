# Yu Jie's Skills

This is my working collection of agent skills: small, opinionated instructions refined around how I actually think and work. The repository is not a neutral catalog. It is the canonical source installed directly at `~/.codex/skills`, and a daily Codex automation is trusted to sharpen its contents, learn from my edits and reverts, reconcile useful upstream ideas, validate the result, and publish it here.

## Lineage and credit

Much of the collection began with or was adapted from [Matt Pocock's Skills for Real Engineers](https://github.com/mattpocock/skills). Matt deserves the majority of the credit for that initial body of work and its core ideas. His repository explicitly encourages users to adapt the skills, and it is distributed under the MIT License.

The pstack skills, playbooks, and principles are adapted from [Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack). Lauren created the engineering workflow behind Poteto Mode. The pstack material is MIT licensed and carries her copyright notice.

The versions here are independently maintained derivatives shaped to my preferences. Skills I wrote independently sit beside those derivatives; [`PROVENANCE.md`](PROVENANCE.md) records the distinction as accurately as the available history permits.

## Installation

Clone the repository as the Codex skills directory:

```sh
git clone git@github.com:yujieteo/skills.git ~/.codex/skills
```

OpenAI-managed system skills are intentionally excluded and remain under the local `.system/` directory.

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
