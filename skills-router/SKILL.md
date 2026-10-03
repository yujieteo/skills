---
name: skills-router
description: Map a task type to the one skill in this collection that fits. Use when unsure which skill applies, before loading several, or when working on this skills repository itself.
---

# Skills router

Pick the row that matches the task, load only that skill, and let it load its own `references/` or `playbooks/` on demand. Do not read several skills to compare them. A skill you do not load costs nothing.

## Understand

| Task | Skill |
|---|---|
| How something works, where it should live | `how` |
| Why it is this way, regressions, postmortems | `why` |
| Reconstruct recent working context | `recall` |
| Primary-source research into a Markdown file | `research` |
| Learn a concept with the user | `teach` |
| Restate the last message plainly | `bro`, `wait-what` |

## Plan and design

| Task | Skill |
|---|---|
| Stress-test a plan by interview | `grill-me`, `grilling`, `grill-with-docs` (also writes ADRs and a glossary) |
| Domain vocabulary, `CONTEXT.md`, ADRs | `domain-modeling` |
| Deep-module interface design | `codebase-design` |
| Types and signatures before code | `architect` |
| Throwaway build to settle a design question | `prototype` |
| Find architectural deepening opportunities | `improve-codebase-architecture` |
| Spec from the conversation | `to-spec` |
| Tracer-bullet tickets from a plan | `to-tickets` |
| Work larger than one session | `wayfinder` |
| Questions for someone else to answer | `to-questionnaire` |
| Large or novel work with no matching playbook | `figure-it-out` |

## Build and fix

| Task | Skill |
|---|---|
| Implement a spec or tickets | `implement` |
| Test-first, regression test | `tdd` |
| Hard bug or perf regression | `diagnosing-bugs` |
| What else could this change break | `blast-radius` |
| In-progress merge or rebase conflict | `resolving-merge-conflicts` |
| Edit `.ts` or `.tsx` | `typescript-best-practices` |
| Project-local verification skill | `create-verification-skill`, then `maintain-verification-skill` |
| Interactive bash walkthrough for a human | `wizard` |
| Bot webhook UI | `make-bot-ui` |
| Repeated computation to internalise | `internalise-computation` |

## Review and ship

| Task | Skill |
|---|---|
| Review a diff against standards and spec | `code-review` |
| Adversarial multi-model review | `interrogate` |
| How much review a change needs: full pipeline or CI only | `review-by-risk` |
| Comment audit before review | `no-comments` |
| Decision trail for unattended work | `show-me-your-work` |
| Hand the session to another agent | `handoff` |
| Issue and external PR triage | `triage` |
| Turn a session into skill edits | `reflect` |

## Parallel work and style

| Task | Skill |
|---|---|
| N workers, one merged report | `swarm` |
| Competing candidates, graft the best | `arena` |
| Repository layout that many parallel agents can change without conflicts | `parallel-safe-repository` |
| Full poteto workflow (PR babysit, shipping, autopilot, and more) | `poteto-mode`, which owns its `playbooks/` |
| Capture my working style as a skill | `automate-me` |
| Which engineering principle applies | `poteto-mode/references/principles.md`, then the one `principle-*` skill |

## Write

| Task | Skill |
|---|---|
| Any prose, cut AI tells | `unslop` |
| Docs, READMEs, PR bodies, commit messages | `technical-writing` |
| All human-facing prose in ASD-STE100 Simplified Technical English | `ste100` |
| Skills, `AGENTS.md`, `CLAUDE.md` | `writing-for-agents` |

## Generate and publish (owner's site and notes)

| Task | Skill |
|---|---|
| Data source to static visualization | `generate-visualization` |
| Canonical requirements, domain spec or test ownership for any interactive visual | `interactive-visual-spec` |
| Visualizations to a slide deck, then speaker notes | `generate-slide-deck`, `presentation-coach` |
| LaTeX beamer talk: slides, pdfpc notes, handout, article, web deck, Manim video from one `.tex` | `generate-beamer-talk` |
| Notes to a podcast episode or explainer video | `generate-podcast`, `generate-explainer-video` |
| Sharpen and publish notes | `append-review-notes` |
| Regret and experiment log from notes | `regret-minimizer-microblog` |
| Blog post in `data/blog/` | `write-metarational-blogpost` |
| Verify math sources | `math-source-hunter` |
| Pokemon VGC meta | `vgc-meta-research` |
| Interactive VGC tactical-practice trainer | `generate-vgc-trainer` |

## Set up and maintain

| Task | Skill |
|---|---|
| Issue tracker, labels, doc layout for the engineering skills | `setup-matt-pocock-skills` |
| pstack host settings | `setup-pstack` |
| Fresh Mac to the working agent workstation (herdr, firstmate, Claude Code, Codex) | `mac-agent-workstation` |
| Refine or publish this whole collection | `skill-sharpening` |
| Edit this repository | [references/working-in-this-repo.md](references/working-in-this-repo.md) |
