# Playbook: refresh, edit, or fix a talk

## Refresh data

1. `python3 talks/<slug>/derive.py --sync ../visuals`, then `derive.py`.
2. Read the diff of `talks/<slug>/data/`. If a headline number moved, re-read
   every frame title, note and article paragraph that states it: the macro
   updates the digits, not the claim built on them.
3. `python3 scripts/build.py --check <slug>`.

## Edit

Keep frame order and labels unless told otherwise. A new frame needs a note;
a removed frame's references (`\hyperlink`, `label=`) must go too.

## Fix a failing build

Read the template's `.agents/skills/talk-build-verify/SKILL.md`; it maps each
failure message to its cause. Rules of thumb:

- Only `article` fails: a presentation-only construct is unguarded.
- Overfull boxes: the frame is too full; cut or split, do not shrink fonts
  below `\footnotesize`.
- Not reproducible: something reads the clock or a random seed.
- Never raise a tolerance, delete a check, or add `% no-note` to get green.
