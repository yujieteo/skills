# State, URL, persistence and export

Part of the [canonical interactive visual specification](../SKILL.md): how state flows, is addressed, persisted and exported. Sections 5, 12, 13, 14, 15, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 5. State Architecture

Interaction should conceptually follow:

```text
input
  ↓
parse
  ↓
normalize
  ↓
state
  ↓
derive
  ↓
analyse
  ↓
render
```

Prefer:

```text
state -> render()
```

over UI elements directly mutating unrelated DOM elements.

The state representation should be understandable independently of the interface.

Stable IDs should be used for important:

* examples,
* objects,
* concepts,
* steps,
* scenarios,
* parameters,
* diagrams.

## 12. URL State

Where the visual has identifiable concepts, examples, sections, or scenarios, meaningful state SHOULD be representable through URL fragments.

Example:

```text
#concept=bayes-rule
#example=monty-hall
#step=4
```

Browser:

```text
Back
Forward
reload
deep link
```

should behave sensibly.

Ephemeral interaction state need not be encoded in the URL.

## 13. Persistence

Persist state only when persistence improves the instrument.

Prefer:

```text
URL fragment       shareable navigation
localStorage       local working state
JSON               complete machine-readable state
Markdown           human-readable state/reasoning
```

Persistence MUST have:

```text
schema version
reset mechanism
safe handling of old data
```

Never silently treat incompatible stored state as valid.

## 14. Import / Export

For tools where retaining a session is meaningful, support deterministic:

```text
Export JSON
Import JSON
Copy Markdown
```

The JSON representation should contain the semantic state rather than a serialization of DOM state.

Example:

```text
{
  "schemaVersion": 1,
  "visual": "example-slug",
  "state": {}
}
```

Markdown should communicate the human reasoning:

```text
# Scenario
## Inputs
## Assumptions
## Derived quantities
## Result
## Sensitivity
## Notes
```

## 15. Beam MD Switch / Presentation Export

Visuals intended for teaching, explanation, mathematical exposition, or presentations SHOULD support Beam MD Switch export.

For visualisations whose specification explicitly requests presentation capability, this becomes mandatory.

The export should preserve the conceptual order:

```text
problem
→ objects
→ manipulation
→ observation
→ derivation
→ conclusion
```

Presentation and interactive modes MUST derive from the same underlying state.

Do not maintain an independent presentation-only copy of the mathematics.

Where appropriate preserve:

* selected example,
* current step,
* parameter values,
* diagram state,
* reasoning order,
* speaker notes,
* current derivation.
