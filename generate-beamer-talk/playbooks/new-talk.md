# Playbook: new talk

1. **Locate the template.** Find the `template` checkout (usually beside
   `visuals`). Read its `SKILLS.md`. Confirm `latexmk` and TeX Live exist; if
   not, install the packages listed in its README before writing anything.
2. **Frame the brief.** Topic, audience, length; default to an informed
   general audience and one frame per minute. Derive a kebab-case slug.
3. **Write the thesis and storyboard** before LaTeX: one disputable sentence;
   an arc of question, mechanism, evidence, a turn where the story gets
   complicated, and what to remember. Each frame gets a title that states its
   finding as a full sentence and a named technique from the feature gallery.
4. **Scaffold.** `make new SLUG=<slug> TITLE="<claim>"`.
5. **Data first.** For each frame that shows data, follow the template's
   `.agents/skills/talk-data-from-visuals/SKILL.md`: snapshot, `derive.py`,
   CSV and `numbers.tex`. Run `derive.py`, then `derive.py --verify`.
6. **Write frames** by copying gallery frames. Put the argument in prose
   between frames for the article. Add `\yjsource{}` to every chart frame.
7. **Write notes** on every frame as you go: what to stress, what to point
   at, the transition, likely questions. Use `presentation-coach`'s rules for
   content; the notes live in `\note{}`, not a `notes.md`.
8. **Build and look.** `python3 scripts/build.py --check <slug>`. Render
   `talk-slides.pdf`, `talk-dark.pdf` and `talk-script.pdf` with
   `pdftoppm -r 50 -png` and read
   every page: titles fit, labels legible, nothing clipped, each note matches
   its frame, the article reads as prose.
9. **Fix at the source and repeat** until `--check` passes and every page
   reads well.
10. **Commit** the talk directory (not `build/`) on the branch the user named.
