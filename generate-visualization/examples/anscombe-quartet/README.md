# Anscombe's quartet

The reference implementation for `generate-visualization`, following
[`visuals-design-spec.md`](../../visuals-design-spec.md). It is one
self-contained `index.html` — inline CSS, data, and JavaScript, no external
assets, no build step.

The story: four datasets share identical summary statistics (mean x = 9,
mean y = 7.5, variance x = 11, variance y = 4.12, correlation ≈ 0.82, fitted
line y = 3 + 0.5x) yet trace four very different shapes. It is the canonical
demonstration that a summary can hide everything that matters.

| File | Role |
| --- | --- |
| `index.html` | The chart: four small-multiple scatter plots, a tap/keyboard detail panel, and the full data table, all in one file. |

## View it

```sh
python3 -m http.server 8000
```

Open the printed address. The four plots are buttons: tap or Tab to one (and
press Enter or Space) to read its values and what to notice; "Show all" or Esc
returns to the overview. The data table below is the text alternative and
scrolls inside its own box on a phone.

## What it demonstrates

- **Mobile first** — viewport meta; SVG with `viewBox` and `width: 100%`
  (fluid, no fixed pixel canvas); a grid that is one column at 360 and 390 CSS
  px and two columns at desktop; body text 16px and chart labels 12px; every
  interactive target ≥ 44×44px; the table scrolls inside its container rather
  than widening the page; nothing depends on hover.
- **Tufte data-ink** — small multiples on identical scales instead of one
  overplotted frame; direct labels on the plots and on the outlier points; a
  muted baseline with only endpoint tick labels; one accent color used for
  data only; no gridlines, boxes, legend, shadows, or decoration.
- **Interaction** — detail on tap, keyboard, or focus (never hover only);
  visible `:focus-visible` state; a "Show all" reset and Esc to return;
  `aria-pressed`, `aria-label`, `aria-live`, and a data-table text
  alternative; `prefers-reduced-motion` respected; color never carries meaning
  alone; the charts, notes, and table render fully with JavaScript disabled.
