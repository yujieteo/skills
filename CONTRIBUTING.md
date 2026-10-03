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

The same checks run in CI. If you changed the linter itself, also run its tests: `node --test skill-sharpening/scripts/verify-collection.test.mjs`. If you changed a skill's description or instructions, also run its evals (they call the Anthropic API):

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
