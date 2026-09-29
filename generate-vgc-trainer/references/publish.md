# Publish to the site

Load at step 7, only when publishing is in scope. The visuals PR merges first; the site is a second PR because the site CI pins a visuals commit.

## Visuals PR

Files: `data/<slug>/`, `scripts/build_<slug>.py`, `viz/<slug>/index.html`, the regenerated gallery and README row. PR body starts with the assumptions and follow-ups, then intent, changes, testing evidence. Never merge without the owner.

## Site PR

Follow [site-integration](../../generate-visualization/references/site-integration.md) for the stub and build. For a trainer:

1. Stub `data/visuals/<slug>.yaml`: `slug`, `title`, `summary` (same as the page description), `source_url`, `fetched`, `html_path`, `data_path` (`raw.json`), `webmcp_tools: [get_data, get_metadata, query]`, `tags: [pokemon, vgc, strategy, training]`, `category`.
2. Check out visuals at the merged commit and bump the CI `ref:` on the visuals checkout step to that full SHA.
3. Build with `VISUALS_REPO=<path> python scripts/build.py` after `scripts/validate.py`, then `git diff --exit-code -- site` must be clean. Commit the generated files it produced, including the corpus revision metadata it refreshes. Never hand-edit them.
4. Verify locally: gallery entry, page, `data.json` return 200; the page matches the pinned source byte for byte; no console errors.

## Deploy

Deploy and checksum steps are in [deploy](../../generate-visualization/references/deploy.md). Get the destination from the owner at run time; stop and ask if it is missing. Report the deployed files and checksums, or say deploy is not done.
