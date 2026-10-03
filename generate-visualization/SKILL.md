---
name: generate-visualization
description: Fetch a data source (website, API endpoint, or CSV) and generate a self-contained static visualization as one folder of the yujieteo/visuals monorepo, published at teoyujie.org/visuals by the site's next build and deploy. Use when the user gives a data source and wants a new or refreshed visualization.
---

# Generate visualization

Use this workflow when the user prompts with a data source — a website to scrape,
an API endpoint (optionally with a local credentials file path), or a CSV/data
file — and wants a new, or refreshed, static visualization generated as one folder
`viz/<slug>/` of the yujieteo/visuals monorepo and published to the Visuals
section of teoyujie.org.

The monorepo's own `SKILLS.md` is the authority for its rules and commands;
read it first, and the folder's `AGENTS.md` before changing an existing visual.
Where this skill and that file disagree on a repository fact, that file wins.

Every visualization inherits the canonical parent specification,
[interactive-visual-spec](../interactive-visual-spec/SKILL.md): the artifact
contract, state and export, interaction and accessibility, pedagogy, visual
grammar, test ownership, and the definition of done. Load the reference for the
concern at hand from its table; do not restate it here. The data-chart layer on
top of it lives in [visuals-design-spec.md](visuals-design-spec.md); this file
is the executable workflow. Where either disagrees with the canonical
specification, the canonical specification wins. A worked example of the
data-chart layer is
[examples/anscombe-quartet/index.html](examples/anscombe-quartet/index.html).

## Privacy and scope

- Never write credentials, API keys, usernames, hostnames, IP addresses, private
  local paths, SSH configuration, or deployment secrets into any repo, and
  never an absolute user-home path (`scripts/check_repo.py` scans for one).
- Obtain any API key file path from the current request or secure local
  configuration at execution time. Read a key file only to perform the fetch;
  never copy its contents or path contents into a commit.
- Treat `viz/<slug>/raw.{csv,json}` as the sole source of truth for that
  visualization's data. When the folder has a builder, `index.html` is
  generated: change the data, `src/` or `build.py` and rerun it; never
  hand-edit the page.
- Work inside `viz/<slug>/` only. Shared tooling (`scripts/`, `schema/`,
  `tests/`, `design-tokens.json`, CI) is a separate change that runs every
  visual's checks. Do not change unrelated files; if pre-existing changes are
  present, inspect them and follow the user's requested commit scope.
- Never commit the catalogue or gallery, and never add a hand-maintained list
  of visuals anywhere: both are generated from the folders' `visual.json`
  files (see **parallel-safe-repository**).

## Repository layout (quick reference)

```
yujieteo/visuals/
  viz/<slug>/
    index.html            # the published page: one file, works offline
    visual.json           # catalogue entry and tooling fields; schema/visual.schema.json
    raw.json | raw.csv    # the data, published beside the page as data.json
    meta.json             # provenance: source_url, fetched, key_file_used
    build.py, src/        # builder and sources, when the page is generated
    tests/                # its own tests: *.test.mjs (node --test), test_*.py (unittest)
    e2e/manifest.json     # how the shared browser harness drives it
    SKILLS.md             # agent card: how an agent uses the page and its tools
    AGENTS.md             # a few lines specific to changing this visual
  scripts/                # shared tooling: check.py, check_repo.py, build_catalogue.py, ...
  design-tokens.json      # shared tokens; the style guide wins where they disagree

yujieteo/site/            # builds every viz/<slug>/ from a visuals checkout (VISUALS_REPO)
```

[references/visual-folder.md](references/visual-folder.md) says what goes in
`visual.json`, the agent card `SKILLS.md`, `AGENTS.md`, `tests/` and
`e2e/manifest.json`.

## Workflow

1. **Resolve the slug.** Derive kebab-case from the source name, domain, or API
   resource. Use `visualization` only when the source has no usable name. Never
   ask for a slug. If a `viz/<slug>/index.html` already
   exists, this is a **refresh** — note that explicitly and carry the existing
   `source_url` forward unless the user gives a new one.

2. **Fetch the source.**
   - Website: fetch and extract the tabular/structured data.
   - API endpoint: if the prompt includes a key-file path, read the key from
     that local file only, use it for the request, and discard it from memory
     once the fetch completes. Never write it anywhere.
   - CSV/data file: read directly.

3. **Persist raw data** to `viz/<slug>/raw.csv` (or `raw.json` only if
   the data is genuinely hierarchical) and `viz/<slug>/meta.json`:
   ```json
   {
     "slug": "<slug>",
     "source_url": "<original source>",
     "fetched": "<ISO 8601 date>",
     "key_file_used": false
   }
   ```

4. **Survey before choosing.** Inventory every field before choosing a story or
   representation. Record its inferred role, cardinality, null rate, and sample
   values. For each free-text field, also record length distribution, term
   frequencies, entropy, and near-duplicates. Treat any non-trivial free-text
   field as a primary subject candidate. Treat numeric, temporal, geographic,
   and categorical fields as supporting evidence unless no text field qualifies.
   If no text qualifies, use entropy, concentration, and cardinality surprises.

5. **Choose one story.** Internally enumerate two to four candidates. For each,
   name the question, fields, and proposed representation. Select the strongest
   surprise signal, not the easiest chart. Commit to one disputable sentence
   about the data before choosing its representation. Run exactly one critique
   that asks, "Is this the most interesting thing in the data, or just the
   easiest thing to visualize?" If it fails, choose one other candidate. Commit
   after that single revision. There is no abstention path.

6. **Start from the shared style.** Paste the
   [token block](../interactive-visual-spec/assets/style-tokens.css) first in
   the page's inline `<style>` and follow the
   [visual style guide](../interactive-visual-spec/references/style-guide.md)
   for colour, type, controls, chart marks, motion and the site theme. Where
   `design-tokens.json` disagrees with the guide, the guide wins.

7. **Generate `viz/<slug>/index.html`** as one self-contained HTML
   artifact under the canonical
   [artifact contract](../interactive-visual-spec/references/artifact-contract.md)
   (§2 to §4): inline CSS, data, and JavaScript, no network request after
   generation, and working through `file://` and in an iframe. Organise the
   script as [source-organisation.md](../interactive-visual-spec/references/source-organisation.md)
   describes. Emit exactly one visible key message. Every further
   representation (the data table, detail on selection) shows the same story
   and stays synchronized with it (§17); use interaction only to reveal more of
   that story, and do not add a second, unrelated chart. Follow the
   data-chart rules in [visuals-design-spec.md](visuals-design-spec.md) and use
   [examples/anscombe-quartet/index.html](examples/anscombe-quartet/index.html)
   as their reference implementation. Do not add external assets,
   dependencies, CDN links, or a runtime build step. Use compact row arrays,
   CSV, or TSV for flat data and minimal nested JSON for hierarchical data. Register the fixed, read-only WebMCP
   baseline plus at most one
   viz-specific tool:
   ```js
   const mc = (typeof document !== 'undefined' && document.modelContext) ||
              (typeof navigator !== 'undefined' && navigator.modelContext);

   mc?.registerTool({
     name: 'get_data',
     description: 'Return the full underlying dataset for this visualization.',
     inputSchema: { type: 'object', properties: {} },
     annotations: { readOnlyHint: true },
     async execute() { /* return the parsed dataset */ }
   });

   mc?.registerTool({
     name: 'get_metadata',
     description: 'Title, source, fetch date, and field descriptions.',
     inputSchema: { type: 'object', properties: {} },
     annotations: { readOnlyHint: true },
     async execute() { /* return title/source/fetched/fields */ }
   });

   mc?.registerTool({
     name: 'query',
     description: 'Filter or aggregate the data matching the current chart.',
     inputSchema: { type: 'object', properties: { filter: { type: 'object' } } },
     annotations: { readOnlyHint: true },
     async execute({ filter }) { /* return filtered/aggregated subset */ }
   });
   // Optional, only if the chart type needs it, e.g.:
   // mc?.registerTool({ name: 'drill_down', ... , annotations: { readOnlyHint: true } });
   ```
   Fall back gracefully (tools simply aren't registered) where `modelContext`
   isn't available, so the page never requires it (§2 forbids requiring
   runtime APIs) — do not add the `@mcp-b` polyfill as an external dependency
   unless the user asks for it explicitly.

8. **Complete the folder.** Write `visual.json` (copy a neighbour's and change
   every field), the agent card `SKILLS.md`, a short `AGENTS.md`, its tests
   in `tests/`, and `e2e/manifest.json`, as
   [references/visual-folder.md](references/visual-folder.md) says. Test each
   layer where
   [test-ownership.md](../interactive-visual-spec/references/test-ownership.md)
   puts it: model fixtures and deterministic generation in `tests/`,
   browser behaviour in `e2e/`, and nothing in yujieteo/site.

9. **Check.** Run the pre-commit checklist in
   [visuals-design-spec.md](visuals-design-spec.md) on the page and fix
   anything it flags. Then, from the monorepo root, run
   `python3 scripts/check.py <slug>` and `python3 scripts/check_repo.py`, and
   `python3 scripts/check.py --changed` for everything the branch touches.
   Nothing else lists the visual: CI, the catalogue and the site find the
   folder.

10. **Commit and open the pull request** to yujieteo/visuals on the branch the
    user asked for; do not silently substitute another branch name. The
    monorepo's review-by-risk rule decides the review: a data-only refresh
    takes CI only, while a new page, a builder or a test change takes the full
    pipeline (see **review-by-risk**).

11. **Publish (only if asked).** There is no site pull request: yujieteo/site
    builds every `viz/<slug>/` from its visuals checkout. After the visuals pull
    request merges, follow the site's own `SKILLS.md` deploy playbook, which
    owns the build, the upload and the post-deploy checks. Get the deploy
    destination from the owner at run time, never from a file in a repo.

12. **Report**: the pull request URL, the check results, whether it was
    deployed, and the data's `fetched` date (for staleness visibility). The
    visualization is done only when all four layers of the
    [definition of done](../interactive-visual-spec/references/acceptance.md)
    (§44) hold and the §38 manual acceptance pass is complete; name any layer
    that is not. Mention any remaining working-tree changes.

## Refreshing an existing visualization

Triggered by re-prompting with an existing slug (and, for API sources, a
possibly new key-file path). Runs the **identical** workflow above from step 2 —
re-fetch, overwrite `raw.*` and `meta.json` in place, rerun the builder (or
regenerate `index.html`), update `fetched` in `visual.json`, then re-run steps
9 to 12. A refresh that changes only the data and the page its builder
regenerates is data-only and takes the fast path. There is no separate refresh
code path.

---

Stop and ask for direction if the requested branch, the deploy destination,
or a required API key file path cannot be resolved safely.
