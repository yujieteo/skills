# Visual grammar and motion

Part of the [canonical interactive visual specification](../SKILL.md): how the family of visuals looks and moves. Sections 7 and 21, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 7. Visual Grammar

The family of visuals should feel related.

Use a restrained scientific-notebook / laboratory aesthetic.

Preferred characteristics:

* neutral background,
* high-information density without crowding,
* generous whitespace,
* thin rules and borders,
* strong typography,
* monospaced numerics where useful,
* accent colours primarily for state and interaction,
* minimal decoration,
* no gradients unless mathematically meaningful,
* no ornamental animation.

Solarized-compatible light/dark colours are preferred where colour is important.

The interface should still make sense in grayscale.

Colour MUST NOT be the sole carrier of meaning.

Use:

```text
colour
+ shape
+ text
+ line style
+ position
```

where distinctions matter.

## 21. Motion

Motion should explain change.

Acceptable:

```text
interpolation
state transition
flow
trajectory
construction
causal progression
```

Avoid decorative motion.

Animations MUST:

* be short,
* be interruptible,
* respect reduced motion,
* leave the final state understandable without animation.
