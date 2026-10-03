# Publish to the site

Load at step 7. The trainer is one folder `viz/<slug>/` of the yujieteo/visuals monorepo, and yujieteo/site builds every such folder from its visuals checkout. There is no site pull request, catalogue stub or pinned commit.

## Visuals PR

Files: everything in `viz/<slug>/` only: the data, `build.py`, the generated `index.html`, `visual.json` (`tags: [pokemon, vgc, strategy, training]`, `webmcp_tools: [get_data, get_metadata, query]`, `summary` the same as the page description), the agent card `SKILLS.md`, `AGENTS.md`, `tests/` and `e2e/manifest.json`, as [visual-folder.md](../../generate-visualization/references/visual-folder.md) says. Run `python3 scripts/check.py <slug>` and `python3 scripts/check_repo.py` from the monorepo root. The PR body starts with the assumptions and follow-ups, then intent, changes, testing evidence. A new trainer adds a builder and tests, so it takes the full review pipeline (**review-by-risk**). Never merge without the owner.

## Deploy (only if asked)

After the visuals PR merges, follow the site's own `SKILLS.md` deploy playbook: it builds from the visuals checkout at the merged commit, uploads, and runs the post-deploy checks. Get the destination from the owner at run time; stop and ask if it is missing. Report the visuals commit the build read and the deploy result, or say deploy is not done.
