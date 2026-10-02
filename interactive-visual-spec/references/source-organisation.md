# Source organisation

Part of the [canonical interactive visual specification](../SKILL.md): how the single file is organised inside. Section 25, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 25. Source Organisation

Although delivery is a single HTML file, implementation should remain conceptually separated.

A typical internal structure is:

```text
DATA
CONSTANTS
STATE
PARSING
DERIVATIONS
MODEL
VIEW HELPERS
RENDER
INTERACTIONS
PERSISTENCE
EXPORT
INITIALIZATION
```

Avoid a collection of unrelated event handlers modifying DOM nodes.
