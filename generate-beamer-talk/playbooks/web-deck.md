# Playbook: talk to interactive web deck

The web sibling of a beamer talk, in the spirit of `generate-slide-deck`, but
built from the PDF so frames of any complexity carry over exactly.

1. **Build the slides:** `python3 scripts/build.py --only slides,dark <slug>`.
2. **Convert:** `python3 scripts/to_web.py <slug>`. It writes
   `talks/<slug>/build/web/` and checks it:
   - `index.html` is the runtime from `web/shell.html` with the manifest inlined;
   - `slides/light|dark/NNN.svg` holds every page;
   - `notes.md` is in presentation-coach's format, with one `## <slide-id>`
     section per frame, split into Emphasise, Say, Transition and Likely
     questions from the `\note` text.
3. **Drive it in a browser** (Playwright or chrome-devtools-axi), served over
   HTTP at 1280x800 and at phone width:
   - step through overlays;
   - press T, O, `/` with a word, C, D, and load `#5`;
   - open P and confirm the presenter window follows and shows notes;
   - `await Talk.audit()` returns `[]`, and the console shows no errors.
4. **Publish only when asked,** and without `notes.md` unless the user wants
   notes public. `presentation-coach` can sharpen the notes, but its edits
   belong in `\note{}` in talk.tex; `notes.md` is regenerated.

Runtime changes go in `web/shell.html` for every talk, never in one
generated `index.html`.
