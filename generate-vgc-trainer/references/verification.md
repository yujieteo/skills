# Verification

Load at step 6. Three layers; each must pass before the PR.

## 1. Data

```sh
python3 generate-vgc-trainer/scripts/verify-trainer-data.py viz/<slug>
```

Checks structure, one best per turn, priority order, speed order (Trick Room aware), recorded Speed, carried moves, Fake Out and Sucker Punch labels, spread-move labels and type math. It complements the builder.

## 2. Builder `--verify`

Assert, at least: source ids resolve and `meta.sources` equals `raw.sources`; team size, item clause, legality flags for the target regulation; key priorities and PP; Protect chain values; per option one-best, movesets, priority order, type math; total option count; the committed page equals a fresh render; one `<h1>` and one `<script>`; no external asset; three `registerTool` calls with `readOnlyHint:true`; required copy (`Regulation Set M-C` or the target name, `Not verified`, the event regulation, `hypothetical`, `matchMedia`, `prefers-reduced-motion`). After any shared-helper change, run every builder's `--verify`.

## 3. Browser

Technical browser E2E lives in `viz/<slug>/e2e/` of yujieteo/visuals (`manifest.json`, and `full.test.mjs` for fuller checks), driven by the shared harness in the monorepo's `e2e/`, which came from the archived yujieteo/technical-e2e ([test ownership](../../interactive-visual-spec/references/test-ownership.md), §28). Write the trainer's checks there; the steps below are the browser checks to run by hand before the PR.

Serve the repo (`python3 -m http.server`) and use `chrome-devtools-axi`.

- Widths: `emulate --viewport "320x800x2,mobile,touch"`, then 360, 390 and 844; then 1280. `resize` will not go below about 500 px, so use `emulate` for phones.
- At each width: `document.documentElement.scrollWidth <= innerWidth`; ladder text not clipped after a resize; interactive elements at least 44 px tall; no `console` errors; keyboard reaches every option.
- Drive every scenario: best line to the takeaway; a wrong line shows the verdict and only `Show the best line`; a disabled option shows its reason; tabs tick.
- WebMCP: stub `navigator.modelContext = {registerTool: t => tools.push(t)}`, re-run the inline script, and confirm three tools, all read-only, and `query({verdict:"best"})` returns rows.
- Capture screenshots of the first view, a best line, a backfire and a mobile ladder as PR evidence.

## Review

The repo's review pipeline reads the facts. Treat each factual finding as a class and sweep every scenario, then rerun all three layers.
