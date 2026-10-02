# Artifact contract

Part of the [canonical interactive visual specification](../SKILL.md): what the delivered file is and where it runs. Sections 2, 3, 4, 24, 39 and 40, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 2. Fundamental Artifact Constraint

Every visual MUST be distributable as exactly one self-contained HTML artifact.

Preferred canonical deployment:

```text
/visuals/<slug>/index.html
```

The artifact MUST contain:

```text
HTML
inline CSS
inline JavaScript
inline SVG where needed
inline data
```

It MUST NOT require:

```text
a build step at runtime
npm
frameworks
CDNs
external fonts
external JavaScript
external CSS
runtime APIs
analytics
telemetry
accounts
remote assets
network requests
```

Use:

```text
vanilla HTML
vanilla CSS
vanilla JavaScript
SVG
Canvas only where SVG/DOM is inappropriate
```

The final generated HTML is the product.

## 3. Portability

The visual MUST work correctly:

```text
online
offline
over HTTPS
through file://
inside an iframe
on desktop
on mobile
with keyboard only
with touch only
```

Opening:

```text
file:///.../index.html
```

should yield a useful, functioning artifact.

Network access MUST NOT be required after generation.

## 4. Determinism

Given identical state and identical inputs:

```text
render(state) → identical interface
derive(state) → identical derived values
export(state) → identical export
```

Randomized demonstrations MUST:

* expose their seed,
* permit resetting the seed,
* produce deterministic output for a given seed.

Avoid hidden state.

## 24. Performance

The visual should feel instantaneous.

Avoid dependencies primarily because dependencies destroy portability and durability, not merely because of download size.

Prefer reasonably small artifacts.

Indicative budgets:

```text
simple visual       < 50 KB
ordinary visual     < 150 KB
complex visual      justify larger size
```

These are engineering targets rather than arbitrary hard failures where rich embedded data is genuinely required.

## 39. Metadata

Each artifact should contain suitable:

```text
<title>
<meta name="description">
<meta name="viewport">
canonical URL
Open Graph metadata where repository convention requires it
```

Metadata should describe the actual visual rather than the site generically.

## 40. Navigation

Every visual should make its location in the collection obvious.

Normally provide a restrained link back to:

```text
Visuals
```

Do not turn the visual itself into a general site-navigation interface.

The tool should remain focused.
