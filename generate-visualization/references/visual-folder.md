# The visual's folder (workflow step 8)

Loaded from [SKILL.md](../SKILL.md) once `viz/<slug>/index.html` and its data exist. Every file below lives in `viz/<slug>/` of yujieteo/visuals, so a worker that owns one visual never edits a file another worker edits. `schema/visual.schema.json` and `e2e/README.md` in the monorepo are the authority for the field lists; this page says what each file is for.

## `visual.json`

The catalogue entry the site publishes, plus the tooling fields. Copy a neighbour's and change every field.

- Required: `title`, `summary` (the page's one key message, with its numbers), `source_url`, `fetched` (the date of the data, not of the commit), `data` (the file published as `data.json`), `webmcp_tools`, `tags` (reuse existing lowercase, hyphenated tags; add one only for a new subject), `category`.
- Optional: `links`, `assets`, `downloads` (pinned large files, never committed), `published: false`, `uses` (shared files outside `viz/` this visual depends on, so a change to one runs its checks), `checks` (commands in place of the defaults), `typecheck`.
- `webmcp_tools` names exactly the tools the page registers. `scripts/check.py` fails when `visual.json`, the agent card and the page disagree.

## The agent card: `SKILLS.md`

How an agent uses the published page, not how to change it. Frontmatter `name` is the slug; `description` says to use the page and its read-only WebMCP tools to answer questions from its embedded data. Then, in this order:

1. One paragraph: the key message with its numbers, where to open the page (`index.html` or `https://teoyujie.org/visuals/<slug>/`), that it works offline, and a link to `AGENTS.md`.
2. `## Tasks`: a table from a question an agent might have to the tool call or control that answers it.
3. `## Inputs`: the embedded data (source, fetch date, coverage) and the controls.
4. `## WebMCP tools`: a table of tool, input and return. Every tool is read-only (`readOnlyHint: true`). A tool that returns rows returns bounded JSON such as `{columns, rows, total, truncated, next_steps}`, with a stated row cap, so an agent knows how much it did not see and how to ask for the rest.
5. `## Exports`: each export, how to trigger it, and its output; say plainly when there is none.
6. `## Worked example`: two or three numbered steps with a real call and the real value it returns, copied from the page's own output.

## `AGENTS.md`

At most a few lines specific to changing this visual: whether `index.html` is generated and by what (`build.py` from which files), how to refresh the data, the one command that checks it (`python3 ../../scripts/check.py <slug>`), and a link to the monorepo's `SKILLS.md` for every other rule.

## `tests/`

The visual's own model, fixture and page tests: `*.test.mjs` for `node --test`, `test_*.py` for unittest. A test reads only this folder and the shared tooling, never another visual's folder, because CI runs it on a sparse checkout without them. Time each test you add and keep it fast. A builder's `--verify` fails when the committed page is stale.

## `e2e/manifest.json`

How the shared browser harness drives the visual: its `primary` control (a stable selector and an action), an optional `ready` selector, `offline: true` when it works from `file://`, `skip` with a reason for each check that does not apply, and recorded `findings`. Use stable, user-visible handles (roles, accessible names, ids, `data-testid`), never layout selectors. A recorded finding is reported on every run but does not fail CI; any failure not recorded fails it. Fuller checks go in `e2e/full.test.mjs`.

## Narrated decks

A page that exports a narrated beamdswitch deck carries `beamdswitch.js`, a byte-identical copy of the site's `templates/beamdswitch.js`, and its decks declare `voice: bf_emma` unless the report names another. Never re-copy a changed template by hand: the monorepo's sync script or workflow updates every copy in one pull request, which lands before the site's change.
