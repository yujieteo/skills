---
name: generate-beamer-talk
description: "Build or change a LaTeX beamer talk in the owner's beamerswitch template, where one talk.tex deterministically produces slides, presenter notes, a printable script, a handout, transparencies and an article. Use for beamer, LaTeX slides, PDF talks, pdfpc notes, or handouts; HTML decks use generate-slide-deck."
---

# Generate beamer talk

The template lives in the owner's `template` repository (a sibling checkout of
`visuals`). Each talk is `talks/<slug>/talk.tex`; `scripts/build.py` compiles
it six times under different jobnames, and beamerswitch plus `tex/yjtalk.sty`
pick the output from the suffix:

| Output | For |
| --- | --- |
| `talk-slides.pdf` | the projector, one page per overlay step |
| `talk-notes.pdf` | presenting with `pdfpc --notes=right` |
| `talk-script.pdf` | printed notes, one page per frame with a thumbnail |
| `talk-handout.pdf` | the audience, 3 frames per A4 page |
| `talk-trans.pdf` | one page per frame, no overlays |
| `talk-article.pdf` | readers: frames plus the prose between them |

The template repo's `SKILLS.md` routes to its own sub-skills for repo detail;
this skill decides what to do and in what order.

## Invariants

- One source file per talk. Output differences are expressed with modes
  (`<handout:0>`, `\only<article>`, `\mode<article>{}`), never with copies.
- Deterministic: no `\today`, no shell escape, no beamerswitch `also=`; every
  number on a slide comes from a generated `data/numbers.tex`.
- Every frame has a `\note{}`. Notes are cues for the presenter, grounded in the
  frame or its data, with a transition that names the next frame's question.
- Data comes from a snapshot of `visuals/data/<slug>/` plus a `derive.py` with
  `--sync` and `--verify`; the talk never reads visuals at build time.
- Done means `python3 scripts/build.py --check <slug>` passes (lint, stale
  data, TeX errors, overfull boxes, page-count agreement, byte-identical
  rebuild) and you have looked at the rendered slides and script.
- Do not push, publish, or edit visuals unless asked.

## Playbooks

Load the one that matches the task.

| Task | Playbook |
| --- | --- |
| New talk from a brief or topic | [playbooks/new-talk.md](playbooks/new-talk.md) |
| Turn an HTML deck from `generate-slide-deck` into a beamer talk | [playbooks/convert-html-deck.md](playbooks/convert-html-deck.md) |
| Refresh data, fix a failing build, or edit an existing talk | [playbooks/refresh-and-fix.md](playbooks/refresh-and-fix.md) |
| Change the template itself: theme, modes, variants, build, starter | [playbooks/template-change.md](playbooks/template-change.md) |
| Rehearse, present, or share the outputs | [playbooks/present-and-share.md](playbooks/present-and-share.md) |

## Reference talks

- `talks/feature-gallery/talk.tex`: one frame per technique (overlays, TikZ and
  pgfplots in steps, blocks, columns, tables, listings, multi-item notes,
  mode-specific content, slides-only frames, appendix buttons). Copy frames
  from it rather than inventing constructs.
- `talks/breeden-litzenberger/talk.tex`: an argued talk whose charts and
  numbers come from visuals data through `derive.py`.

## Report

Talk path, frame list with titles, the six output page counts, whether
`--check` passed, the data snapshot date, and anything left to verify.
