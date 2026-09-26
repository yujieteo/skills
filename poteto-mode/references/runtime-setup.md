# Set up Poteto Mode tools

Poteto Mode's instructions work in Claude, Codex, and Cursor. Two playbook helpers require Bun. `orch` is required by Orchestrate. `watch-pr` is required by the GitHub paths in Babysit and Shipping. Other skills do not require Bun. Bun runs their TypeScript directly. The local package installs the TypeScript compiler and Bun type definitions for static checks.

## macOS, Linux, and WSL

Run:

```sh
poteto-mode/scripts/setup.sh
```

The script installs stable Bun for the current user after confirmation. It then installs locked dependencies, runs the tests and type checker, and smoke-tests both helpers. Use `--yes` for a non-interactive installation or `--check` for read-only verification.

## Native Windows

Run from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\poteto-mode\scripts\setup.ps1
```

Use `-Yes` for a non-interactive installation or `-Check` for read-only verification.

## Agent hosts

The skills describe capabilities, not product commands. Map delegation, questions, browser control, terminal execution, and pull request inspection to the tools that the active Claude, Codex, or Cursor host exposes. Outside the playbook paths that require `orch` or `watch-pr`, use native host tools for equivalent checks and label the substitution.

The installers execute Bun's official installation endpoints at `https://bun.com/install` and `https://bun.sh/install.ps1`. These endpoints return executable code. If your environment forbids remote installation scripts, install Bun through an approved package manager and rerun in check mode.

## Resolve helper commands

Resolve the skills root from the loaded `poteto-mode/SKILL.md` path. Do not assume that the current project contains these scripts.

- `orch` means `bun <skills-root>/poteto-mode/scripts/orch/orch.ts`.
- `watch-pr` means `bun <skills-root>/poteto-mode/scripts/watch-pr/cli.ts`.

Use those resolved commands whenever a playbook uses the short names.

## Recovery

Run the setup script again. Installation and dependency resolution are repeatable. If Bun is installed but unavailable, add `~/.bun/bin` on macOS, Linux, or WSL, or `%USERPROFILE%\.bun\bin` on Windows, to `PATH`.
