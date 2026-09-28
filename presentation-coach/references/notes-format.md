# Notes file format

`notes.md` sits beside a deck's `index.html`. The deck runtime parses it in the
browser, so the shape is strict and small.

```markdown
# Speaker notes: <deck title>

## deck
**Takeaway:** The sentence the audience should repeat.
**Audience:** Who this is for and what they already know (state any assumption).
**Total time:** 12:00
**Opening:** The first thing you say.
**Closing:** The last thing you say.
**Numbers to know:**
- 9.1 points per £m: the best value in the data
**If short on time:**
- Cut s08-ownership first, then s06-attack-luck.

## s01-title
**Time:** 0:45
**Emphasise:** One thing to stress.
**Point at:** What to show on the visual.
**Say:** Two to four spoken cues.
**Transition:** The line that leads into the next slide.
**Likely questions:**
- Question? Answer in one or two sentences; evidence on slide s05.
**Watch out:** A caveat or trap.
```

## Rules

- One `## <id>` section per slide, where `<id>` is the slide's `id` attribute,
  in deck order. The extra `## deck` section holds deck-level guidance; it is
  never matched to a slide, and the deck shows it beneath the first slide's
  notes.
- A field starts a line with `**Label:**` and may continue on following
  plain lines (joined with spaces) or with `-` bullets. Labels are free text,
  but use the names above so `check-notes.mjs` can find them.
- `Time` uses `m:ss`. Slide times sum to `Total time` within 10%.
- Required on every slide: `Time`, `Emphasise`, `Say`; `Transition` on all but
  the last slide. Required in `## deck`: `Takeaway`, `Audience`, `Total time`,
  `If short on time`.
- Inline formatting is limited to `**bold**` and `` `code` ``. No tables, no
  headings inside a section, no HTML.
- Keep each slide under 220 words (the checker's limit); aim for 150.
