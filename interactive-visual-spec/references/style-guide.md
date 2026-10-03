# Visual style guide

Part of the [canonical interactive visual specification](../SKILL.md), but not one of its numbered sections: §7 says the family of visuals should feel related, and this guide says exactly how. It fixes the colours, type, spacing, panels, controls, chart marks, motion and theme handling that every visual on teoyujie.org/visuals shares, so a reader moving between visuals sees one design. Where it and a numbered section disagree, the numbered section wins.

The values are not new. They are the site's own tokens (`static/css/style.css` in `yujieteo/site`) and the conventions the strongest existing visuals already share: [mohr](https://teoyujie.org/visuals/mohr/), [beamdiag](https://teoyujie.org/visuals/beamdiag/) and [phasors](https://teoyujie.org/visuals/phasors/) are the reference implementations.

[`assets/style-tokens.css`](../assets/style-tokens.css) holds every value below as one block. A new visual pastes it first in its inline `<style>` and adds only domain rules after it. Never link to it: a visual stays one self-contained file (§2).

## Coverage

The guide covers every visual the site publishes, and every new one: each folder `viz/<slug>/` of `yujieteo/visuals` (its `visual.json` is its catalogue entry), and the two the site keeps itself in `visuals/<slug>/` with a stub `data/visuals/<slug>.yaml` (`beamdswitch` and `connes-qft`). One visual is exempt and keeps its own look:

| Visual | Why it is exempt |
|---|---|
| `beamdswitch` | It is vendored unchanged from the private `yujieteo/beamdswitch` repository (its folder's README names the upstream), so it follows that project's design rather than the site's. |

A visual's own specification may raise a limit the guide strains, but never drop a guide item, and it names the new figure. For example, information-gain raised its own-code budget to 100,500 bytes to fit the theme script and dark blocks.

## Theme: follow the site

A visual is a standalone page on the same origin as the site, so it reads the reader's site-wide theme choice directly.

1. Put the site's own theme script in `<head>`, before any style: the line from `templates/base.html`, with `id="site-theme"` so a test that lists the page's scripts can name it:

   ```html
   <script id="site-theme">try { var t = localStorage.getItem("theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch (e) {}</script>
   ```

   It must run before first paint, so the page never flashes the wrong theme. The `try` keeps it silent under `file://`, in a sandboxed iframe and in private windows, where it falls back to the system setting.
2. Declare `color-scheme: light dark` on `:root`. Put dark values under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and repeat them under `:root[data-theme="dark"]` with `color-scheme: dark`. Add `:root[data-theme="light"] { color-scheme: light; }`. The token block does all of this.
3. A visual with its own theme control writes the same key: `localStorage.setItem("theme", "light")` or `"dark"`, and `removeItem("theme")` for System, inside `try`. One choice then holds across the site and every visual. Never invent a second key such as `<slug>-theme`.
4. Every colour drawn by script (canvas, generated SVG attributes) comes from the tokens at draw time, `getComputedStyle(document.documentElement).getPropertyValue("--c1")`, never from a hex literal in JavaScript. Redraw when `matchMedia("(prefers-color-scheme: dark)")` fires `change` and when `data-theme` on `<html>` changes.
5. Every visual supports both themes. A light-only or dark-only page is a divergence to fix.

## Colour tokens

Use these names. A domain colour (`--shear`, `--survey`, `--tension`) is declared as an alias of a token, such as `--shear: var(--c1);`, never as a new hex value, so it switches theme with the palette.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#1d1d1f` | Page and panel background |
| `--fg` | `#1d1d1f` | `#f5f5f7` | Body text, headings, direct labels, pressed control fill |
| `--muted` | `#6e6e73` | `#a1a1a6` | Secondary text, notes, tick labels, axis titles |
| `--faint` | `#a1a1a6` | `#6e6e73` | Decoration and context marks only, never text |
| `--surface` | `#f5f5f7` | `#2c2c2e` | Insets, readouts, tooltips, hover |
| `--border` | `#d2d2d7` | `#48484a` | Panel borders, section rules, table rules |
| `--control` | `#86868b` | `#8e8e93` | Outlines of buttons, fields, selects and segmented groups |
| `--grid` | `#e8e8ed` | `#333336` | Gridlines |
| `--axis` | `#86868b` | `#8e8e93` | Axes, baselines, ticks, zero lines |
| `--focus` | `#0071e3` | `#2997ff` | The accent: focus ring, links, primary action, slider and checkbox fill |
| `--on-focus` | `#ffffff` | `#1d1d1f` | Text on `--focus` |
| `--c1` | `#2a78d6` | `#3987e5` | Series 1 (blue); the default for a single series |
| `--c2` | `#eb6834` | `#d95926` | Series 2 (orange) |
| `--c3` | `#8a4fd8` | `#a77bf0` | Series 3 (violet) |
| `--c4` | `#0f8b8d` | `#3bb6b8` | Series 4 (teal) |
| `--hl` | `#c43d2f` | `#ff6961` | Highlight: the one datum or series the story is about |
| `--ok` / `--warn` / `--bad` | `#1a7f4b` / `#9a6700` / `#c4261d` | `#30c07a` / `#e3b341` / `#ff6961` | Check results, always with a word or icon |

Contrast against `--bg`: `--fg`, `--muted`, `--focus`, `--hl` and the status colours meet 4.5:1 for text in both themes. On light `--surface`, `--focus` (4.3:1) and `--warn` (4.47:1) fall just short, so a link or warning on an inset is set in `--fg` (underlined, or with its icon) instead. `--control` meets 3:1 on `--bg` and `--surface`, so an outlined button or field is visible as a control (§20); `--border` (1.5:1) only separates content and never outlines a control on its own. Every series colour meets the 3:1 that §20 asks for data marks. `--c2` light (3.2:1) and `--c1` light (4.4:1) do not meet 4.5:1, so write labels in `--fg` or `--muted` beside a series rather than in the series colour.

The series hues follow the Solarized accent order (blue, orange, violet, cyan) that §7 prefers, on the site's neutral greys instead of Solarized's cream base, so they sit on the same background as the rest of teoyujie.org.

### Palettes

- **Categorical:** `--c1` to `--c4` in that order. Past four series, use small multiples, or grey everything with `--faint` and colour only the series in question.
- **Highlight:** the story's datum in `--hl`; its context in `--faint`, or its series colour at 35% opacity. Only one highlight per view. `--hl` and `--bad` are both red, so a view that shows status never also uses `--hl` for emphasis.
- **Sequential:** one hue ramped towards the background, `color-mix(in srgb, var(--c1) N%, var(--bg))` for N from 15 to 100, so it inverts correctly in dark mode.
- **Diverging:** `--c1` for negative, `--bg` at the midpoint, `--c2` for positive, mixed the same way.
- **Regions and bands:** the series colour at 12 to 16%, `color-mix(in srgb, var(--c1) 14%, transparent)`.
- **Grayscale check (§7):** pair series with a second channel. Line dashes in order: solid, `6 3`, `2 3`, `8 3 2 3`. Point shapes in order: circle, square, triangle, diamond.

## Typography

| Token | Stack | Use |
|---|---|---|
| `--sans` | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif` | Everything by default |
| `--mono` | `"SFMono-Regular", Consolas, "Liberation Mono", monospace` | Numbers, readouts, tick labels, eyebrow and section labels, code |
| `--math` | `"Cambria Math", "STIX Two Math", "Latin Modern Math", Cambria, "Times New Roman", serif` | Mathematical notation only: variables, formulas, diagram symbols |

Never download a font: the stacks use installed fonts, so the page makes no network request (§2). Body and headings are always `--sans`; a serif body is a divergence even in a mathematics visual.

| Role | Size | Weight and style |
|---|---|---|
| Title `h1` | `clamp(2rem, 6vw, 3.25rem)` | 700, line-height 1.04, letter-spacing −0.045em, max-width 20ch |
| Section heading `h2` | 1.125rem | 600, letter-spacing −0.015em |
| Lede under the title | 1.125rem | 400, `--fg`, max-width 66ch |
| Body | 1rem (16px) | 400, line-height 1.55, letter-spacing −0.011em |
| Controls, notes, table cells | 0.875rem | 400; notes in `--muted` |
| Eyebrow, panel and field-group labels | 0.75rem | `--mono` 600, uppercase, letter-spacing 0.06em, `--muted` |
| Chart text | 0.75rem | Tick labels `--mono`; axis titles `--sans` 600; never below 11px as rendered at 320px |

Set `font-variant-numeric: tabular-nums` on every number that changes, so columns and readouts do not jitter. Never uppercase a unit: an axis title is sentence case, "Shear force V (N)", because uppercasing turns mm into MM.

## Spacing and layout

- Space on the site's scale only: 0.25, 0.5, 0.75, 1, 1.5, 2, 3 rem (`--space-1` to `--space-12`).
- Page: `main { width: min(100% - 2rem, 80rem); margin: auto; padding: clamp(1.25rem, 5vw, 3rem) 0 3rem; }`. The 1rem gutter holds at 320px.
- Order from the top: eyebrow, title, lede, optional scope callout, a toolbar between two rules, then the laboratory. Separate major parts with a 1px `--border` rule and 1.5 to 2rem of space, not with background bands.
- Desktop laboratory: plot and controls side by side, `grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem)`; below about 56rem, one column with the primary interaction first (§8).
- Every grid and flex child that holds a chart or table gets `min-width: 0`; a wide table scrolls in its own `overflow-x: auto` box.

## Panels and controls

- **Eyebrow:** a row of `--mono` labels above the title: a link to `Visuals` (`../../visuals.html`, the catalogue on the site), the subject, and a property such as "Works offline".
- **Card:** `--bg` background, 1px `--border`, radius 0.5rem, padding 1rem, no shadow. A card's heading uses the label style.
- **Inset and readout:** `--surface` background, no border, radius 0.5rem.
- **Scope or caveat callout:** 1px `--border` with a 3px `--focus` left border, radius 0.5rem.
- **Shadow:** only on things that float over content (popover, tooltip, dialog): `0 8px 24px var(--shadow)`.
- **Button:** pill (radius 999px), 1px `--control`, `--bg` fill, `--fg` text at 0.875rem, min-height 2.25rem; hover fills `--surface`.
- **Pressed or selected** (`aria-pressed="true"`, a checked segment, the current tab): fill `--fg`, text `--bg`. This dark chip is the selected state everywhere; never use the accent or a series colour for it.
- **Primary action** (at most one per view): fill `--focus`, text `--on-focus`.
- **Segmented control:** one `--control` pill outline around borderless segments.
- **Text input and select:** radius 0.5rem, 1px `--control`, min-height 2.25rem; numbers in `--mono`. Disabled fields fill `--surface` with `--muted` text.
- **Range, checkbox, radio:** native, with `accent-color: var(--focus)`.
- **Focus:** `outline: 2px solid var(--focus); outline-offset: 2px` on `:focus-visible`, never removed.
- **Touch (§9):** under `@media (pointer: coarse)` every button, segment, select and input is at least 2.75rem (44px) tall.

## Chart conventions

These sit on top of the data-ink rules in [visuals-design-spec.md](../../generate-visualization/visuals-design-spec.md).

- **Frame:** no chart box, no background fill; the plot sits on `--bg`.
- **Gridlines:** 1px `--grid`, three to five, horizontal only unless both axes are quantitative.
- **Axes:** 1px `--axis` baseline and zero line; ticks 4px outward in `--axis`. Label the ends and round values only.
- **Tick labels:** 0.75rem `--mono` in `--muted`, tabular figures.
- **Axis title:** 0.75rem `--sans` 600 in `--muted`, sentence case with units in parentheses, at the top left of the plot or the end of the axis, never rotated when it fits horizontally.
- **Marks:** lines 2px (1.5px when more than two share a plot), round joins and caps; points radius 3.5px with a hit area of at least 44px; bars square-cornered with gaps at least 30% of the band.
- **Labels:** directly on the data in `--fg` at 0.75 to 0.8125rem; annotations in `--muted`.
- **Reference lines:** 1px `--muted`, dashed `4 3`, labelled.
- **Selection:** the selected mark gets `--hl` or a 2px `--fg` ring; the rest of the series stays as it was.
- **Tooltips and readouts:** `--surface`, 1px `--border`, radius 0.5rem, numbers in `--mono`; also reachable by tap and focus (§9).
- **SVG:** `viewBox` with `width: 100%`, colours set by CSS classes on the tokens (`.chart text { fill: var(--muted); }`) rather than `fill="#…"` attributes. **Canvas:** scale by `devicePixelRatio` and read token values at draw time (see Theme).

## Motion

- UI state changes (hover, pressed, shown, hidden) fade with the site's tokens: `--fade-duration: 200ms`, `--fade-ease: cubic-bezier(0.2, 0, 0, 1)`.
- Explanatory motion (§21: interpolation, trajectory, construction) uses the same easing and lasts 200 to 600ms; new input cancels it and jumps to the new state.
- Nothing loops, bounces, overshoots or moves for decoration.
- Under `prefers-reduced-motion: reduce`, `--fade-duration` is 0ms, every animation and transition is off, and script checks `matchMedia("(prefers-reduced-motion: reduce)")` before animating and jumps to the final state.

## Print

Print always uses the light palette (the token block forces it) and hides controls marked `.no-print` (§23).

## Applying the guide to an existing visual

A restyle changes how a visual looks, never what it computes or does.

1. Screenshot it first at 390 and 1280 wide, in light and dark.
2. Rename its tokens to the names above (common old names: `--rule` and `--line` are `--border`, or `--control` where they outline a control; `--base` is `--surface`; `--accent` and `--blue` are `--focus` or `--c1` by role; `--ink`, `--text` and `--foreground` are `--fg`; `--secondary` is `--muted`; `--background` is `--bg`; `--selected` and `--red` are `--hl` when they mark a selection) and set each value from the table. Keep domain names as aliases.
3. Add the theme script and the dark block if missing; replace hex colours in script with token reads.
4. Bring type, controls, panels and chart marks to the rules above. Leave layout alone unless it breaks one.
5. Change no element id, data attribute, ARIA name, text, URL or storage state key, or export format: tests, WebMCP tools and saved links depend on them. The one exception is a private theme key (`mohr-theme`, `rr-theme`), which moves to the shared `theme` key above.
6. Screenshot again at the same sizes and compare. Run the visual's own tests; they must pass unchanged.

## Checklist

Every item is a yes before a visual ships or a restyle merges.

1. The site theme script is first in `<head>`, and the page follows Light, Dark and System from the site.
2. Both themes are complete, including canvas and script-drawn colours.
3. Only the token names and values above; domain colours are aliases.
4. Body and headings in `--sans`; numbers in `--mono` with tabular figures; serif only for notation.
5. Title, eyebrow, lede, cards, buttons, inputs and the selected state match this guide.
6. Charts: no box, faint grid, `--axis` baselines, `--mono` ticks, sentence-case axis titles with units, direct labels, one `--hl`.
7. Motion uses the fade tokens and stops under reduced motion.
8. Print falls back to the light palette.
