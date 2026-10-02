# Domain-specific spec template

Part of the [canonical interactive visual specification](../SKILL.md): the shape of every domain-specific visual spec that inherits this one. Section 43, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 43. Architecture of a Domain-Specific Spec

Future visual specifications should therefore focus primarily on:

```text
# Title
## Purpose
## Core question
## Concept model
## State
## Inputs
## Derived quantities
## Views / visualisations
## Interactions
## Examples
## Exercises
## Domain-specific invariants
## Export representation
## Domain-specific tests
## Acceptance criteria
```

They should say near the beginning:

```text
All requirements from the Canonical Interactive Visual Specification apply.
```

They SHOULD NOT repeatedly restate all generic infrastructure requirements.

## Using the template

Start a domain spec from the headings above, in that order, with the inheritance sentence directly under the title. Write only the domain: its model, computations, examples, diagrams, interactions, invariants and tests. Everything else is inherited from the [canonical specification](../SKILL.md) unless explicitly overridden; an override names the section it replaces, for example "Overrides §15: no presentation export".
