---
name: generate-vgc-trainer
description: Build an interactive Pokemon VGC tactical-practice trainer from a short brief. Scripted turn-by-turn scenarios, button choices, sourced mechanics and regulation legality, honest assumptions, mobile verification, then publish to the site. Use for VGC drill, practice, or scenario pages; use vgc-meta-research for metagame notes.
---

# Generate a VGC tactical trainer

A trainer is a static page where the player presses a button to choose a line each turn and sees the order the turn resolves in, why it works or fails, and a takeaway. It teaches fundamentals (Protect, Fake Out, Quick Guard, pivots, speed control) in common scenarios of one regulation. It is a specialisation of [generate-visualization](../generate-visualization/SKILL.md): load that skill for the design spec, the WebMCP baseline, site integration and deploy. This skill adds the domain layer.

Worked source, read only when you need a concrete shape: the `yujieteo/visuals` trainer (`scripts/build_vgc_protect_fakeout_pivot_trainer.py`, `data/vgc-protect-fakeout-pivot-trainer/`, `viz/vgc-protect-fakeout-pivot-trainer/`, PR 9) and its site publication (`yujieteo/site` PR 16). Do not copy its scenarios or team claims; reproduce the method.

## Brief

Resolve these from the request; ask only for what has no sensible default.

| Input | Default |
|---|---|
| Regulation | Current official regulation; record its dates |
| Team and source | A cited event team list, not memory |
| Fundamentals | One per scenario, from the request |
| Bring four | Your choice; say it is not the player's real bring |
| Scenarios | 5 to 7, about 2 turns each, 4 to 6 options per turn |
| Publish | Visuals repo PR first; site only if asked |

## Workflow

1. **Source and record.** Fetch rules, legality, team and move facts; write `raw.json` and `meta.json` with every assumption. Read [sourcing-and-assumptions.md](references/sourcing-and-assumptions.md).
2. **Design scenarios.** One fundamental per scenario, a hidden scripted opponent plan, and every reasonable choice as an option. Read [writing-options.md](references/writing-options.md).
3. **Author data.** Start from [assets/starter](assets/starter/) and the schema in [data-model.md](references/data-model.md). Outcomes are authored, not simulated.
4. **Build.** Write `scripts/build_<slug>.py` that renders one dependency-free `viz/<slug>/index.html`, registers the three read-only WebMCP tools, and has `--verify`. Follow [data-model.md](references/data-model.md) for page behaviour and the design spec in generate-visualization.
5. **Check accuracy.** Walk every scenario against [accuracy-traps.md](references/accuracy-traps.md), then run `python3 generate-vgc-trainer/scripts/verify-trainer-data.py data/<slug>`. Fix a class of error everywhere, not only where it was reported.
6. **Verify.** Run the builder with `--verify`, then drive the page in a browser at 360, 390 and desktop widths. Read [verification.md](references/verification.md).
7. **Ship.** Open the visuals PR with the assumptions section first. Publishing to the site is a second PR and a deploy; read [publish.md](references/publish.md).
8. **Report** the PR URLs, assumptions, verification evidence, and what is not done.

## Rules

- Never state unverified legality as fact. Say what was checked, by whom, and what was not.
- A team played under one regulation is not automatically legal in another. Record both.
- Opponents and plans are hypothetical; damage is not simulated; speed order is stated per scenario from recorded base Speed.
- Every mechanic and fact cites a source id in `raw.json`; a blocked source is not cited.
- Options use only moves the set carries.
- Never hand-edit generated site files, and never commit credentials, hosts or private paths.
- Do not modify the visuals or site repos except through their own PR flow when the task calls for it.
