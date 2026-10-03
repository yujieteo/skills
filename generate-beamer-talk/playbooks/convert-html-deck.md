# Playbook: HTML deck to beamer talk

Source: `decks/<slug>/` from `generate-slide-deck`, in the repository the user
names (`index.html`, `data.json`, `notes.md`). Target: `template/talks/<slug>/talk.tex`.

1. **Outline the deck.** Run `presentation-coach`'s `scripts/outline.mjs` on
   `index.html` for slide ids, titles and static text. Read `notes.md`.
2. **Map slides to frames one to one.** Keep slide order and titles. Add
   `label=<slide-id>` to each frame so references survive.
3. **Data.** Snapshot `data.json` into `talks/<slug>/data/`, and write a
   `derive.py` that turns it into CSVs and `numbers.tex`. Do not re-fetch; the
   HTML deck's builder owns fetching.
4. **Charts.** Rebuild each chart with pgfplots (`yj` style) from the CSVs,
   keeping the chart form. HTML hover tooltips have no PDF equivalent: move the
   most important tooltip value into a direct label or the note.
5. **Reveals.** `data-step="n"` becomes `<n->` on the element.
6. **Notes.** Each `notes.md` section's Emphasise, Point at, Transition and
   Likely questions become that frame's `\note{}` (use `\note[item]` for
   lists). Keep the `deck` section's takeaway and cut list in a comment at the
   top of `talk.tex`.
7. **Build, look, fix** as in [new-talk.md](new-talk.md) steps 8 and 9.
