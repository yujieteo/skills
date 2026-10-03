# Provenance

## Matt Pocock-derived collection

The following skills were initially installed together from [`mattpocock/skills`](https://github.com/mattpocock/skills) and are maintained here as opinionated derivatives under its MIT License:

- `code-review`
- `codebase-design`
- `diagnosing-bugs`
- `domain-modeling`
- `grill-me`
- `grill-with-docs`
- `handoff`
- `implement`
- `improve-codebase-architecture`
- `prototype`
- `research`
- `resolving-merge-conflicts`
- `setup-matt-pocock-skills`
- `teach`
- `to-questionnaire`
- `to-spec`
- `to-tickets`
- `triage`
- `wait-what`
- `wayfinder`
- `wizard`
- `writing-for-agents`

This classification is based on the common installation cohort and matching upstream names. Preserve upstream attribution when any of these are renamed, merged, or split.

## Independently developed collection

The following skills were developed separately in this local collection:

- `append-review-notes`
- `generate-beamer-talk`
- `generate-explainer-video`
- `generate-podcast`
- `generate-slide-deck`
- `generate-visualization`
- `generate-vgc-trainer`
- `interactive-visual-spec`
- `grilling`
- `mac-agent-workstation`
- `internalise-computation`
- `math-source-hunter`
- `parallel-safe-repository`
- `presentation-coach`
- `regret-minimizer-microblog`
- `review-by-risk`
- `skill-sharpening`
- `skills-router`
- `ste100`
- `vgc-meta-research`
- `write-metarational-blogpost`

## Lauren Tan's pstack-derived collection

The following skills, the `poteto-mode` playbooks, and the `principle-*` skills are adapted from [pstack in Cursor's public plugins repository](https://github.com/cursor/plugins/tree/main/pstack), authored by Lauren Tan (`@poteto`) and licensed under MIT:

- `architect`, `arena`, `automate-me`, `blast-radius`, `bro`, `create-verification-skill`, `figure-it-out`, `how`, `interrogate`, `maintain-verification-skill`, `make-bot-ui`, `no-comments`, `recall`, `reflect`, `setup-pstack`, `show-me-your-work`, `swarm`, `tdd`, `technical-writing`, `typescript-best-practices`, `unslop`, and `why`
- `poteto-mode` and its playbooks, references, and scripts
- every `principle-*` skill

The local import did not preserve its source revision. [`PSTACK-UPSTREAM.md`](PSTACK-UPSTREAM.md) records the verified upstream source and license. Do not claim that this local copy matches a specific upstream commit. This collection changes Cursor-specific runtime instructions where Codex exposes different capabilities.

## Material from the owner's other repositories and blog

`parallel-safe-repository`, `review-by-risk` and some sections of other skills come from the owner's own [yujieteo/visuals](https://github.com/yujieteo/visuals) (`docs/monorepo.md`, `SKILLS.md`) and [yujieteo/site](https://github.com/yujieteo/site) (`SKILLS.md`, `skills/`), and from the owner's blog posts in `data/blog/` of yujieteo/site. Several of those posts summarise interviews on [David Ondrej's channel](https://www.youtube.com/@DavidOndrej). The ideas taken from them belong to the people interviewed, and each skill that uses one names its source and links the video:

- Dex Horthy, [Ex-NASA dev reveals his Agentic Engineering Workflow](https://www.youtube.com/watch?v=xgkjtF89-44): review as the bottleneck, the base-commit test check, fetching context with code.
- Armin Ronacher, [Pi Agent dev reveals his Agentic Engineering Workflow](https://www.youtube.com/watch?v=SxuQs9GGYbk): tests that a broken environment mocked away.
- Alex Lieberman and Dan Zakon, [$75M founder reveals his Agentic Engineering setup](https://www.youtube.com/watch?v=QBfXiWvM0qc): linting the process, authored against derived status.
- David Ondrej, [My Agentic Engineering Workflow (after 6,775 sessions)](https://www.youtube.com/watch?v=c9nRxEy1kUY): review once and stop, guard hooks, the push lock, priority order, asking before building.
- Matt Pocock, [Matt Pocock's Agentic Engineering Workflow](https://www.youtube.com/watch?v=nQwJVHCtDDY): the two purposes of review, asking why a bug was there.
- Guillermo Rauch, [Vercel CEO reveals his Agentic Engineering Workflow](https://www.youtube.com/watch?v=WeiB_gLOdQE): asking agents to flag boundary crossings.
- Magnus of Browser Use, [Watch this 100x developer use GPT-6 Astra](https://www.youtube.com/watch?v=R--bWH0x8_c): literal goals, proposals sorted by effort.
- swyx, [What Top 1% of Agentic Engineers Do Differently](https://www.youtube.com/watch?v=EWk9PBbKqzc): the three parts of a loop, Stroustrup's "each makes sense, together madness".
- Daniel Miessler, [Ex-Apple dev reveals his Agentic Engineering Workflow](https://www.youtube.com/watch?v=A-JBaNvv3Tk): the instructions file as a router.

The extended skills keep their original lineage: `principle-encode-lessons-in-structure`, `principle-guard-the-context-window`, `principle-never-block-on-the-human`, `principle-prove-it-works` and `principle-subtract-before-you-add` stay pstack derivatives, and `writing-for-agents` stays a Matt Pocock derivative, each with these local additions.

Update this file whenever provenance becomes more precise or a skill changes lineage.
