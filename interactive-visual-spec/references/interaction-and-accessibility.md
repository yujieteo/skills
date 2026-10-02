# Interaction and accessibility

Part of the [canonical interactive visual specification](../SKILL.md): how every user reaches the visual: layout, touch, keyboard, search, accessibility, no-JS and print. Sections 8, 9, 10, 11, 20, 22 and 23, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 8. Responsive Design

The application MUST function from approximately:

```text
320 px → large desktop
```

No horizontal viewport overflow should occur under normal operation.

Desktop may use:

```text
navigation | primary laboratory | secondary explanation
```

Mobile should normally collapse into:

```text
primary interaction
↓
result / visualisation
↓
explanation
↓
advanced controls
```

Mobile is not simply a shrunk desktop layout.

## 9. Touch

Interactive targets should normally be at least approximately:

```text
44 × 44 px
```

Interactions MUST NOT depend exclusively on:

```text
hover
right click
precise pointer movement
```

Any hover information must also be reachable through tap, focus, or explicit controls.

## 10. Keyboard Interaction

The complete primary workflow MUST be keyboard-operable.

Use conventional semantics:

```text
Tab              move focus
Enter / Space    activate
Escape           dismiss / return
Arrow keys       move through structured selections
```

Where useful:

```text
/              search
Cmd/Ctrl + K   command/search interface
Cmd/Ctrl+Enter execute / apply
N              next
P              previous
D              toggle details
```

Shortcuts MUST NOT interfere with ordinary text editing.

A keyboard shortcut reference should be discoverable when the application has more than a few shortcuts.

## 11. Command/Search Interface

Complex visuals SHOULD provide:

```text
Cmd+K
Ctrl+K
```

as a universal search/command surface.

Depending on the domain it may search:

* concepts,
* examples,
* mathematical objects,
* commands,
* variables,
* techniques,
* exercises,
* diagrams,
* terminology.

Search should be semantic enough to be useful but MUST remain deterministic and local.

No LLM is required at runtime.

## 20. Accessibility

Use semantic HTML.

Required:

* visible keyboard focus,
* useful accessible names,
* correct button/input semantics,
* appropriate headings,
* sensible reading order,
* non-colour state cues,
* sufficient contrast,
* reduced-motion support.

Target approximately:

```text
4.5:1 normal text
3:1 large text / important UI graphics
```

respecting WCAG-style contrast expectations.

Use:

```text
@media (prefers-reduced-motion: reduce)
```

and:

```text
@media (prefers-color-scheme: dark)
```

where appropriate.

## 22. No-JavaScript Behaviour

The document MUST still communicate something meaningful if JavaScript does not execute.

At minimum show:

```text
title
purpose
basic explanation
representative static content
notice that interaction requires JavaScript
```

Do not produce an empty page.

## 23. Printing

Expository visuals SHOULD have a useful print representation.

Printing should:

* remove irrelevant controls,
* preserve important diagrams,
* avoid clipped content,
* expand essential explanatory material where practical.
