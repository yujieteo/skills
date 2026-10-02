---
name: generate-slide-deck
description: "Build a self-contained HTML and JavaScript slide deck that combines several data visualizations into one argued story, checked slide by slide in a real browser, ready to host as static files on the owner's site. Use when the user asks for a presentation, slide deck, or talk built from data. Speaker notes come from presentation-coach."
---

# Generate slide deck

Turn one topic into a deck of about ten slides in which several visualizations
build a single argument. It extends `generate-visualization`: that skill makes
one chart with one message; this one sequences several under one thesis. Reuse
its data, privacy, design-token and site-integration rules instead of restating
them, and do not modify that skill. A deck is an interactive visual, so it
also inherits the canonical
[interactive-visual-spec](../interactive-visual-spec/SKILL.md), which wins on
any disagreement.

The output is static files: one `index.html` with all CSS, JavaScript and data
inlined, plus a sidecar `notes.md` written by `presentation-coach`. No build
server, CDN, framework or external asset.

## Privacy and scope

Apply the privacy and scope section of `generate-visualization` unchanged: no
credentials, hostnames, IP addresses, SSH details or private local paths in any
file. Read an API key file only to fetch. Do not edit the site repository's
generated files or deploy unless the user asks for that step.

## Layout

```
visuals/                          # sibling of the site checkout, as for visualizations
  decks/<slug>/index.html         # the deck (final artifact)
  decks/<slug>/data.json          # compact dataset the deck embeds
  decks/<slug>/notes.md           # presenter notes, from presentation-coach; private
  data/<slug>/raw.*, meta.json    # raw fetch and provenance, as in generate-visualization
```

A worked example, and the reference for what a finished deck looks like, is
[examples/fpl-early-season/](examples/fpl-early-season/): `index.html`,
`notes.md`, `data.json`, and `build-data.mjs`, the dependency-free fetcher that
produces `data.json`.

## Workflow

Script and asset paths below are relative to this skill's directory.

1. **Frame the brief.** Take topic, audience, and length from the request; if
   missing, assume an informed general audience and about one minute per slide
   (ten to twelve slides). Derive a kebab-case slug. If `decks/<slug>/`
   exists, this is a **refresh**: keep the thesis and slide ids unless told
   otherwise.
2. **Gather material.** Prefer what exists: published visualizations under
   `viz/<slug>/` and their `data/<slug>/`, and any notes or wiki for the topic
   (read-only). Fetch fresh data with steps 2 to 5 of `generate-visualization`
   (fetch, persist `raw.*` and `meta.json`, survey the fields, choose the
   story) for every question the existing material cannot answer.
3. **Write the thesis and storyboard.** State one disputable sentence the deck
   proves. Plan an arc: frame, evidence, a **turn** where the data complicates
   the first finding, a decision, and sources. Every visualization must answer
   a question the thesis raises; cut any that only decorate. Give each slide
   an id `sNN-kebab-name`, a headline that states the finding (a full sentence
   with the number in it), and its chart form. Use different forms across the
   deck (bars, scatter, dumbbell, heat grid, table) so slides do not blur.
4. **Derive `data.json`.** Write a small dependency-free builder (Node) that
   fetches or reads the raw data and emits only the fields the charts use,
   rounded, under about 100 KB. Record `fetched`, source, and thresholds in it.
   Keep raw dumps out of the deck. Follow `build-data.mjs` in the example.
5. **Apply the design.** Read `visuals/design-tokens.json` (create it as
   `generate-visualization` step 6 says if missing) and copy its values into
   the shell's `:root`. The deck uses one fixed light theme. Follow the
   `dataviz` skill for colour when it is available: categorical hues in fixed
   order, at most three hues in a scatter plot, colour follows the entity
   across slides, red and blue reserved for above/below or hot/cold meanings
   that a legend states.
6. **Build the deck.**
   - Copy [assets/deck-shell.html](assets/deck-shell.html) to
     `decks/<slug>/index.html`. The shell owns navigation, scaling, notes,
     presenter sync, WebMCP and the audit; do not edit its runtime script per
     deck (fix it in the skill if it is wrong).
   - Replace `{{TITLE}}`, `{{DESCRIPTION}}`, and everything between the
     `SLIDES:START` and `SLIDES:END` markers with the deck's
     `<section class="slide" id="…" data-title="…">` elements.
   - Draw each chart in a `.chart` container from `Deck.paint(slideId, (slide,
     data) => …)`: `Deck.chart(host, {margin})` gives an SVG the size of its
     container in stage pixels; `Deck.linear`, `Deck.ticks`, `Deck.svg`, and
     `Deck.hover(el, html)` do the rest. Charts read the embedded data
     (`Deck.data()`), never a network call.
   - Put the data in with
     `node scripts/embed-data.mjs decks/<slug>/index.html decks/<slug>/data.json`.
   - End the content script with `Deck.registerTools({source, source_url,
     fetched})` and `Deck.boot()`. The tools are the read-only WebMCP baseline
     from `generate-visualization` (`get_data`, `get_metadata`) plus `get_slide`.
   - Reveal elements one at a time with `data-step="1"`, `"2"`, and so on;
     `→` shows the next step before advancing.
7. **Check in a real browser, then fix and repeat.** Run
   `node scripts/check-deck.mjs decks/<slug>/index.html`. Serve the folder over
   HTTP (`python3 -m http.server`), open it with `chrome-devtools-axi`, set the
   viewport with `emulate --viewport 1920x1080x1`, and:
   - for each slide, `eval "Deck.go(N-1, 99)"`, take a screenshot, and read it:
     headline fits, no orphan word, labels legible and unclipped, legend
     matches marks, nothing is left empty;
   - `eval "JSON.stringify(Deck.audit())"` must return `[]` (text under 22 px,
     overlapping labels, content leaving the stage or slide margin);
   - press `→`, `←`, `Home`, `End`, `N`, `P` and load `#5` directly; resize to
     1280x720 and check the slide still fits;
   - hover a mark to see its tooltip; confirm the console has no errors other
     than a 404 for an absent `notes.md`.

   Every failure gets fixed at its source: the slide, the painter, or the
   shell in this skill. Rebuild and recheck all slides until the audit is
   clean and every screenshot reads well. The known pitfalls are below.
8. **Get the notes.** Invoke `presentation-coach` on the finished deck. It
   writes `decks/<slug>/notes.md`; check that `N` and `P` show them and that
   the plain audience view shows none.
9. **Commit** the deck files in the `visuals` repo on the branch the user
   asked for; do not substitute another branch.
10. **Publish (only if asked).** Follow steps 9 to 15 of
    `generate-visualization` with kind `deck`: the stub points at
    `decks/<slug>/index.html`, the build copies it verbatim to
    `site/decks/<slug>/index.html`, and `notes.md` stays private unless the
    user says to publish it. If the site build has no `deck` kind yet, stop
    at step 9 and hand over the `decks/<slug>/` folder; do not change the site
    without being asked.
11. **Report** the folder path, slide list, check results, the data's
    `fetched` date, the refresh command, and anything left open.

## Slide rules (stage is 1920x1080)

- One message per slide; the headline is the message. Two lines at most.
- Type floor: body 32 px, chart labels 24 px, footnotes 22 px. The audit
  enforces 22 px.
- Direct-label the marks that matter; do not label every point. Tooltips carry
  the rest.
- Every chart slide ends with a source line naming the data and its date.
- Numbers in headlines and callouts are typed by hand: recompute each from
  `data.json` before committing, and again on every refresh.
- Colour SVG text with `style="fill:…"`, not the `fill` attribute; the shell's
  `.lbl` and `.axis` classes override attributes.
- Give the axis title 20 px more room than the tick labels need, or they
  collide. Use two side-by-side panels instead of one crowded 20-row chart.
- Decks are landscape; they scale down but are not designed for phones.

## Keys

`→` `Space` `Enter` next; `←` back; `Home` `End`; `N` notes dock; `P` presenter
window (current notes, next slide title, timer, synced with the main window);
`F` fullscreen; `?` help. The URL hash `#N` deep-links to slide N.

## Refreshing

Rerun the builder, `embed-data.mjs`, and step 7 in full; re-verify every
hand-typed number; then ask `presentation-coach` to refresh the affected notes.
