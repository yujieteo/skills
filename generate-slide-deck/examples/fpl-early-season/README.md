# FPL early season deck

"Buy the defence, check the luck": an 11-slide, about 14-minute deck on Fantasy
Premier League after Gameweek 5 of 2026/27, built by following
`generate-slide-deck` and annotated by `presentation-coach`. It is the reference
output for both skills and the hand-off copy for a later site change.

| File | Role |
| --- | --- |
| `index.html` | The deck: one self-contained file, all CSS, JavaScript and data inlined. This is what a site publishes. |
| `notes.md` | Presenter notes from `presentation-coach`. Private: the deck loads it from the same folder for the `N` and `P` views and works without it. Publish it only on request. |
| `data.json` | The compact dataset embedded in `index.html` (195 players, 20 clubs, five gameweeks of fixtures). |
| `build-data.mjs` | Dependency-free Node script that fetches the public FPL API and writes `data.json`. |

Intended site path: `data/decks/fpl-early-season/index.html` in yujieteo/site,
copied verbatim, as
`generate-slide-deck` describes for publishing.

## View it

Serve the folder over HTTP so the notes load:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Notes load only from localhost, not from the
`[::]` or `0.0.0.0` address the server prints.

`→` and `←` move, `N` shows notes, `P` opens the presenter window, `?` lists
the keys.

## Refresh it

```sh
node build-data.mjs
node ../../scripts/embed-data.mjs index.html data.json
```

Then recompute every number typed into a headline, callout, and `notes.md`
(they are hand-written), rerun the browser checks in the skill's step 7, and
run `node ../../scripts/check-deck.mjs index.html` and
`node ../../../presentation-coach/scripts/check-notes.mjs index.html notes.md`.

## Sources

Official FPL API `bootstrap-static` and `fixtures` endpoints, fetched on the
date stored in `data.json`. Expected goals against per club is a regular
starter's figure; goals come from finished fixtures. The story follows the
`fpl-llm-wiki` notes and the `fpl-expected-goals` visualization.
