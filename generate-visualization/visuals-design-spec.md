# Visuals design spec

The data-chart layer of `generate-visualization` output. Every generated
`viz/<slug>/index.html` first inherits the canonical parent specification,
[interactive-visual-spec](../interactive-visual-spec/SKILL.md); this file adds
only the rules specific to a chart of fetched data, and links to the canonical
sections ("§N") instead of restating them. Where this file and the canonical
specification disagree, the canonical specification wins. `SKILL.md` is the
executable workflow. The worked example
[`examples/anscombe-quartet/index.html`](examples/anscombe-quartet/index.html)
is the reference implementation of the rules below.

Three concerns govern every chart, in order: mobile first, Tufte data-ink,
then interaction. The colours, type, controls and chart marks themselves come
from the shared [visual style guide](../interactive-visual-spec/references/style-guide.md);
start every page from its
[token block](../interactive-visual-spec/assets/style-tokens.css).

## Mobile first

Design for the narrow case and let the wide case fall out. The canonical
responsive and touch rules apply in full:
[§8 and §9](../interactive-visual-spec/references/interaction-and-accessibility.md)
(function from about 320 px to large desktop with no horizontal viewport
overflow, a mobile layout that is not a shrunk desktop, targets of about
44 × 44 px, nothing hover-only). For a chart, that means:

- **Fluid sizing, never fixed pixel canvases.** Size every chart and table to
  its container. For SVG that means a `viewBox` plus a percentage or
  container-relative width:
  `<svg viewBox="0 0 320 200" class="chart" role="img" aria-label="…">` with
  CSS like `.chart { width: 100%; height: auto; }`. Never
  `<svg width="900" height="500">` with no `viewBox`. Use `<canvas>` only where
  SVG or DOM is inappropriate (§2), and then re-render it on resize.
- **A wide component scrolls, never the page.** If a table or chart is
  intrinsically wide, give *that component* its own scroll box
  (`overflow-x: auto`) so the component scrolls and the page does not.
- **Legible type at phone width.** Body text at least ~16px. Chart labels and
  axis numbers never below ~11–12px. A value the user cannot read in full by
  tap or keyboard is a missing value: keep each repeated chart at least ~320px
  wide so its `viewBox` text never shrinks, and never truncate a label without
  a way to reach the full text.
- **Data points stay reachable by touch.** An SVG data point too small to tap
  is never the only way to act: pair it with an HTML control or a larger
  invisible hit area.
- **Small multiples reflow.** A grid of small multiples collapses to one
  column at phone width.

**Widths to check before committing:** 320, 360, 390, 844 (a landscape phone,
e.g. iPhone 12/13/14 landscape), and a desktop width (1280).

## Tufte data-ink

Maximise the ratio of ink that shows data to ink that does not. Spend pixels
on the numbers, not on the frame. This is the chart form of the canonical
[visual grammar](../interactive-visual-spec/references/visual-grammar.md)
(§7): thin rules, minimal decoration, no gradients unless mathematically
meaningful.

- **Maximise the data-ink ratio.** Remove everything that is not data and does
  not directly support reading the data.
- **Erase non-data-ink.** Heavy gridlines, chart boxes and borders, redundant
  legends, drop shadows, gradients, 3D effects, decorative fills, and icons
  that only decorate all go.
- **Label data directly, not via a legend.** Put the name next to the
  line, bar, or point it names. A legend forces a color match by eye and
  wastes phone space; a direct label puts the name at the data.
- **Use small multiples to compare.** When comparing groups or conditions,
  repeat one small chart per group on identical scales instead of stacking
  many series in one frame. Identical scales make the differences visible.
- **Keep data density high and scaffolding muted.** A thin baseline and a few
  endpoint tick labels beat a full grid. The grid is scaffolding: keep it
  faint and minimal, or drop it.
- **Color encodes data, state, or interaction, never decoration.** Data color
  distinguishes values or categories; accent color marks state and
  interaction (§7). Never use color to tint the frame or fill empty space, and
  never let it be the sole carrier of meaning (§7).
- **Label the data, not the chrome.** Annotations explain the numbers ("the
  outlier", "this set is curved"), not the axes and title.

## Interaction

Interaction reveals more of the same story, never a second story. The skill's
single-story rule stands: one key message, and every interaction opens up more
of that message. The canonical keyboard, accessibility, motion and no-JS rules
apply in full: [§10, §20 and §22](../interactive-visual-spec/references/interaction-and-accessibility.md)
and [§21](../interactive-visual-spec/references/visual-grammar.md). For a
chart, that means:

- **Reveal more of the same story.** Tap, focus, or select surfaces detail
  about the same data — exact values, the underlying rows, a note on the one
  point that matters — not a different chart or a new narrative.
- **Clear affordances and signposts.** What is interactive looks interactive;
  what can be tapped or tabbed announces itself.
- **A way back to the default state.** Any selection or filter has an explicit
  return to the starting overview — a "Show all"/"Reset" control, or Esc.
- **Accessible state and a text alternative.** Interactive elements carry
  state (`aria-pressed`, `aria-expanded`). The chart has a text alternative:
  `role="img"` with `aria-label`, plus the underlying data as a real HTML
  table or list in the page. Live updates use `aria-live="polite"`.
- **Reduced motion means an opacity fade at most.** Under
  `@media (prefers-reduced-motion: reduce)` all animation and transition is
  disabled or reduced to an opacity-only fade, and JavaScript reads
  `matchMedia('(prefers-reduced-motion: reduce)')` before animating.
- **The full story survives without JavaScript.** Beyond the §22 minimum, the
  chart, the key message, and the data table render as static HTML and SVG.
  JavaScript only adds the enhancement (detail on tap, filtering).

## Pre-commit checklist

Run this on every new or refreshed `viz/<slug>/index.html` before committing.
Every item must be a yes; fix anything that is not. It covers the data-chart
layer only: publishing also needs the canonical
[§38 manual acceptance pass](../interactive-visual-spec/references/acceptance.md).

1. **Widths checked** at 320, 360, 390, 844 (landscape phone), and 1280
   (desktop).
2. **No horizontal page scroll** at any of those widths
   (`document.documentElement.scrollWidth <= window.innerWidth`); a wide
   component scrolls inside its own container instead.
3. **Legible type:** body text ≥ ~16px; no chart label below ~11–12px; every
   value reachable in full by tap or keyboard.
4. **Touch targets about 44×44px** for every interactive element (§9); nothing
   interactive is hover-only.
5. **Keyboard path works:** Tab reaches every control in order, focus is
   visible, Enter/Space activates, Esc returns to default (§10, §20).
6. **Contrast meets §20:** about 4.5:1 for normal text and 3:1 for large text
   and important UI graphics, data marks included.
7. **Data-ink review:** every gridline, border, legend, fill, and color is
   either data or directly supports reading data — otherwise removed. Labels
   sit on the data, not in a legend.
8. **House style:** the [style guide checklist](../interactive-visual-spec/references/style-guide.md#checklist)
   passes, in light and dark.
