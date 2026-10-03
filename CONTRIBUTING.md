# Contributing

This is a personal collection that a daily automation also edits (see `skill-sharpening/`). Changes are welcome as pull requests, but the owner decides what fits their taste.

## Before you open a pull request

```sh
node skill-sharpening/scripts/verify-collection.mjs
```

If you changed any JavaScript (the `.mjs` scripts or an example page's inline scripts), also type-check it; TypeScript is a development-only tool pinned in the root `package.json`, and there is no build step or test framework:

```sh
npm ci && npm ci --prefix skill-sharpening/evals
npm run typecheck
```

When the type check fails, run `npm run typecheck -- --summary` instead of counting or sorting the tsc output by hand. It writes the full log to `.typecheck/tsc.log` and prints a short TOON summary: the totals, the error counts by code and by file, and the first 20 errors. Add `--file <path>` for one file, `--since <ref>` for only the files changed since a git ref, or `--first <n>` for more or fewer errors than the default of 20. `--file` and `--since` only narrow the list: the output always gives the total error count and the count outside the scope, and the result and exit code follow all errors. To get a result for the scope alone, add `--scope-verdict`; the output then says `scoped verdict`. A path that tsc does not check, or a ref that git cannot resolve, is a usage error. The exit code is 0 for no errors, 1 for type errors, and 2 for a usage or setup error.

The same checks run in CI. If you changed the linter itself, also run its tests: `node --test skill-sharpening/scripts/verify-collection.test.mjs`. If you changed `skill-sharpening/scripts/typecheck.mjs`, run `node --test skill-sharpening/scripts/typecheck.test.mjs`. If you changed `skill-sharpening/evals/claude-cli.mjs`, run `node --test skill-sharpening/evals/claude-cli.test.mjs`. If you changed a skill's description or instructions, also run its evals. They call the Anthropic API; add `--backend claude-cli` to run them on a Claude subscription instead:

```sh
cd skill-sharpening/evals && npm ci
node run.mjs triggers
node run.mjs behavior --skill <name> --baseline
```

If you touched `poteto-mode/scripts/`, also run `poteto-mode/scripts/setup.sh --check` (needs Bun).

## Rules

- One skill per top-level directory. The directory name equals the `name` in its `SKILL.md`, because the repository installs as `~/.codex/skills`.
- `SKILL.md` needs `name` and `description` frontmatter. Keep the description to a trigger of at most 60 words and the file to at most 2000 words. Put bulky, situational guidance in `references/` or `playbooks/` and link it.
- Add a row to [`skills-router/SKILL.md`](skills-router/SKILL.md) for a new skill.
- Adapted material needs an entry in [`PROVENANCE.md`](PROVENANCE.md).
- Never commit credentials, hostnames, private paths, or personal data.

[Linting and evals](skill-sharpening/references/linting-and-evals.md) explains every lint rule and how to add eval cases. More detail is in [`skills-router/references/working-in-this-repo.md`](skills-router/references/working-in-this-repo.md).
