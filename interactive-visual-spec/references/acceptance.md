# Acceptance and definition of done

Part of the [canonical interactive visual specification](../SKILL.md): the manual pass before publishing and the four-layer definition of done. Sections 38 and 44, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 38. Manual Acceptance Pass

Before publishing a visual, manually inspect at least:

```text
desktop Safari
desktop Firefox
desktop Chromium
mobile Safari
320 px viewport
large desktop
light mode
dark mode
reduced motion
keyboard-only
touch
file://
iframe
offline
Back/Forward
deep link
Reset
no-JS fallback
```

For applicable visuals additionally inspect:

```text
JSON export/import
Markdown export
Beam MD Switch export
print output
```

## 44. Definition of Done

A visual is complete only when all four layers are satisfied:

```text
1. CONCEPTUAL
   The model and examples are correct.
2. ARTIFACT
   The standalone HTML behaves correctly and remains portable.
3. TECHNICAL E2E
   The independent browser-level suite verifies the artifact.
4. SITE
   teoyujie.org exposes and integrates the artifact correctly.
```

In shorthand:

```text
correct mathematics
+ inspectable model
+ deterministic artifact
+ standalone browser verification
+ correct site integration
= done
```
