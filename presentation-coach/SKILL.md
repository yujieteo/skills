---
name: presentation-coach
description: "Turn a finished slide deck into private speaker notes that tell the presenter what to emphasise, how to move between slides, how long to spend, and what questions to expect. Use when the user asks for presenter notes, a talk track, or rehearsal help for a deck. Builds nothing in the deck itself."
---

# Presentation coach

Read a finished deck and write the notes a presenter wants at their elbow:
what to stress, what to point at, how to hand over to the next slide, how long
to take, and what the audience will ask. The notes are for the presenter only.

This skill never builds or edits slides. Decks come from `generate-slide-deck`
(or any deck whose slides have stable ids); if a slide is wrong, say so in the
report and let the deck skill fix it. The two skills meet at one file,
`notes.md`, next to the deck's `index.html`, in the format in
[references/notes-format.md](references/notes-format.md). A deck built from
`generate-slide-deck` loads that file into its notes panel (`N`) and presenter
window (`P`) and shows nothing to the audience by default.

## Rules

- **Ground every claim.** A number, name, or cause in the notes must appear in
  the deck or its embedded data. To add a fact, recompute it from the deck's
  source first; if you cannot, write `verify:` in front of it. Never invent
  anecdotes, quotes, or audience reactions.
- **Notes are cues, not a script.** The presenter should glance, not read.
  Keep each slide under about 150 words; lead with the one thing to stress.
- **Address the presenter as "you"** and say what to do: "pause on the
  gap", "point at the red bar". Plain sentences, no slide-reading.
- **Never block on questions.** Infer audience and length from the deck (a
  site deck defaults to an informed general audience and about one minute per
  slide), write the assumption into the `deck` section, and continue.
- **Notes stay private.** Do not copy `notes.md` into a site's published
  output or index unless the user asks; the deck works without it.
- **Coach the material as it is.** If the deck overclaims, flag the slide and
  give the honest framing in `Watch out`; do not soften the data.

## Workflow

1. **Read the deck.** Run `node scripts/outline.mjs <deck.html>` (relative to
   this skill) for each slide's id, headline and static text. Chart labels are
   drawn by script, so for chart slides also read the rendered slide: serve the
   folder, open it with `chrome-devtools-axi`, and evaluate
   `JSON.stringify(Deck.slides.map(s => ({id: s.id, text: s.innerText})))`.
   Look at each chart slide's screenshot so you can say what to point at.
2. **Find the through-line.** Write one sentence the audience should repeat
   afterwards, then the two or three slides that carry it, the slide with the
   surprise, and the slide that asks the audience to do something. Every
   per-slide emphasis should serve that sentence.
3. **Set the clock.** Choose the total time (ask only if the user gave none
   and the deck offers no cue). Budget by slide role using
   [references/slide-patterns.md](references/slide-patterns.md), then make the
   slide times add up to the total within 10%. Slides with reveal steps get
   the time of their steps.
4. **Write the `deck` section.** Takeaway, audience and assumptions, total
   time, opening line, closing line, numbers worth memorising, and an
   **If short on time** cut list by slide id, cheapest cut first.
5. **Write one section per slide,** in deck order, with the fields in the
   format reference: Time, Emphasise, Point at (chart slides), Say,
   Transition, Likely questions, Watch out. Chart slides need a Point at line;
   every slide but the last needs a Transition that names the next slide's
   question, not just "next slide".
6. **Write likely questions from the material.** Use the deck's own weak
   spots: small samples, definitions, how a number was computed, what a
   colour means, what the data cannot show. Answer each in one or two
   sentences from the deck's data, and point to the slide that holds the
   evidence.
7. **Save and check.** Write `notes.md` beside the deck, then run
   `node scripts/check-notes.mjs <deck.html> <notes.md>`. It verifies slide
   coverage and order, required fields, and the time budget. Fix every
   problem it lists.
8. **See it work.** With the deck served over HTTP, open it, press `N`, and
   step through: each slide's notes should load and match the slide. Press
   `P` to confirm the presenter window shows the same notes and a timer. Load
   the deck without pressing anything and confirm the audience view shows no
   notes. If notes do not load, the id or format is wrong, not the deck.
9. **Report** the notes path, the planned time, the through-line sentence,
   any slide you flagged as overclaiming, and any `verify:` items left.

## Quality bar

- The Emphasise line of each slide can be said aloud in one breath and is
  different from the slide headline (it adds why it matters or what to do
  with it).
- Timing has slack: the total leaves the last minute for questions unless the
  user says otherwise.
- The cut list still tells a complete story when applied.
- Questions are ones a sceptical member of this audience would ask, not
  generic ones such as "any questions?".
- Nothing in the notes contradicts the deck.

## Refreshing

If the deck changes, rerun the outline, keep the through-line if it still
holds, and revise only the sections whose slides changed. Re-run
`check-notes.mjs`; a renamed slide id shows up as a missing section.
