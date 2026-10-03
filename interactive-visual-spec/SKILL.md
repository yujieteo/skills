---
name: interactive-visual-spec
description: The canonical parent specification every interactive visual on teoyujie.org/visuals inherits, split by concern. Use when writing a visual's domain spec, checking a visual against the canonical requirements, or deciding which repository owns a visual's tests. Skills that build visuals load it themselves.
---

# Canonical interactive visual specification

This document defines the default requirements for interactive visuals published on teoyujie.org/visuals.

Individual visual specifications should describe only their domain-specific model, computations, examples, diagrams, and interactions. Everything here is inherited unless explicitly overridden.

Every skill that creates a visual (`generate-visualization`, `generate-vgc-trainer`, `generate-slide-deck`, and any later one) inherits this specification and links here instead of restating it. Where one of them disagrees with this specification, this specification wins.

## Load only what the task touches

The 45 sections are split by concern. Each section lives in exactly one reference, keeps the specification's wording and numbering, and every MUST, SHOULD and MAY stands as written. Cite a requirement as "§N".

| Concern | Sections | Reference |
|---|---|---|
| What the delivered file is: one self-contained HTML artifact, portability, determinism, performance, metadata, navigation | 2, 3, 4, 24, 39, 40 | [artifact-contract.md](references/artifact-contract.md) |
| State architecture, URL state, persistence, import and export, Beam MD Switch export | 5, 12, 13, 14, 15 | [state-and-export.md](references/state-and-export.md) |
| Responsive layout, touch, keyboard, Cmd/Ctrl+K search, accessibility, no-JS behaviour, printing | 8, 9, 10, 11, 20, 22, 23 | [interaction-and-accessibility.md](references/interaction-and-accessibility.md) |
| Objective, progressive disclosure, transparency, manipulation, examples, exercises, tone, no false authority | 1, 6, 16, 17, 18, 19, 41, 42 | [pedagogy-and-transparency.md](references/pedagogy-and-transparency.md) |
| Visual grammar and motion | 7, 21 | [visual-grammar.md](references/visual-grammar.md) |
| Internal structure of the single file | 25 | [source-organisation.md](references/source-organisation.md) |
| Three-repository test ownership, browser matrix, E2E contract, CI layers, offline test, fixtures, invariants | 26 to 37 | [test-ownership.md](references/test-ownership.md) |
| Manual acceptance pass and the four-layer definition of done | 38, 44 | [acceptance.md](references/acceptance.md) |
| Template for a domain-specific visual spec | 43 | [domain-spec-template.md](references/domain-spec-template.md) |

Building a new visual touches all of them; read the table top to bottom. A change touches only the rows it changes, plus [test-ownership.md](references/test-ownership.md) and [acceptance.md](references/acceptance.md), which every change ends at.

## Visual style guide

[style-guide.md](references/style-guide.md) is the shared look that §7 asks for: colour tokens for both themes, type, spacing, panels, controls, chart marks, motion, and how a visual follows the site's Light, Dark or System choice. It is not a numbered section; [assets/style-tokens.css](assets/style-tokens.css) holds its values as one block to paste into a visual. Building or restyling a visual reads it with the visual grammar row above.

## Domain-specific specs inherit this one

A spec for one visual follows the template in [domain-spec-template.md](references/domain-spec-template.md). It says near the beginning that all requirements from the Canonical Interactive Visual Specification apply, describes only its domain, and overrides a requirement here only explicitly, naming the section it overrides.

## Three test layers

Model tests, technical browser E2E and website integration are three separate owners (§26 to §34). Every public visual is one folder `viz/<slug>/` of the yujieteo/visuals monorepo, which replaced one repository per visual. Model and page tests live in the folder's `tests/`. Technical browser E2E lives in its `e2e/` (`manifest.json`, and `full.test.mjs` for fuller checks), run by the shared harness in the monorepo's `e2e/` in jobs of their own. That harness came from the archived yujieteo/technical-e2e. Website integration stays in yujieteo/site, which never takes the other two over. [test-ownership.md](references/test-ownership.md) says how this maps onto §26 to §28.

## 45. Core Principle

The system should optimize for artifacts that remain understandable and executable years later.

The default engineering preference is therefore:

```text
explicit > implicit
deterministic > magical
portable > convenient
inspectable > opaque
state-driven > DOM-driven
semantic tests > screenshot tests
progressive disclosure > dashboard overload
manipulation > passive explanation
examples > abstraction alone
separate test ownership > duplicated E2E suites
```

The visual itself is a durable executable explanation.
