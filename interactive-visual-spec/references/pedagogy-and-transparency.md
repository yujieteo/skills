# Pedagogy and transparency

Part of the [canonical interactive visual specification](../SKILL.md): what the visual teaches and how honestly it reasons. Sections 1 to 42, in the specification's own wording and numbering. Nothing here is weakened or added; where a skill disagrees, this text governs.

## 1. Objective

Each visual should be a small, durable thinking instrument rather than a conventional web application.

A visual should make some object, process, computation, argument, or decision manipulable enough that the user can:

1. see its structure,
2. change its assumptions,
3. observe consequences,
4. understand why the result changed,
5. move between intuitive and technical representations,
6. export or communicate the resulting reasoning where appropriate.

The preferred progression is:

```text
intuition
  ↓
concrete example
  ↓
interactive manipulation
  ↓
visual structure
  ↓
formal representation
  ↓
computation / derivation
  ↓
general principle
```

For practical tools:

```text
observation
  ↓
structured inputs
  ↓
assumptions
  ↓
model
  ↓
derived quantities
  ↓
sensitivity / alternatives
  ↓
action
```

The interface should expose the reasoning rather than merely returning an answer.

## 6. Progressive Disclosure

Do not place the entire subject on screen simultaneously.

The normal progression is:

```text
simple
→ concrete
→ visual
→ quantitative
→ formal
→ technical
```

An introductory user should be able to operate the visual without first understanding the advanced terminology.

An expert should be able to expose the underlying mathematics or mechanics.

Prefer:

```text
overview
↓
selected object
↓
details
↓
derivation
↓
technical notes
```

over giant dashboards.

## 16. Mathematical / Computational Transparency

Never make important calculations mysterious.

For any substantial result expose, where useful:

```text
inputs
formula
intermediate quantities
result
interpretation
```

Users should be able to answer:

Why did the visual produce this result?

without inspecting JavaScript.

For probabilistic or approximate tools, explicitly distinguish:

```text
observation
assumption
estimate
derived quantity
uncertainty
interpretation
```

Do not manufacture precision.

## 17. Manipulation Before Explanation

When possible, allow the user to interact with the mathematical object directly.

Examples:

```text
drag the point
move the parameter
select the simplex
step through the diagram chase
change the generating function
perturb the probability
modify the queue
change the PDE coefficients
toggle a field/operator
```

Then update all dependent representations simultaneously.

Prefer synchronized representations:

```text
object
↕
diagram
↕
formula
↕
table
↕
explanation
```

Selection in one representation should highlight the corresponding object elsewhere.

## 18. Examples

Conceptual tools MUST contain concrete examples.

Prefer several examples showing genuinely different phenomena rather than many cosmetic variations.

Examples should normally progress:

```text
toy
→ archetypical
→ nontrivial
→ pathological / boundary case
→ advanced
```

Where a subject has standard archetypical problems, include them.

Examples MUST be internally reproducible.

## 19. Exercises

Teaching-oriented visuals SHOULD include exercises when appropriate.

Order them:

```text
recognition
→ direct calculation
→ parameter variation
→ prediction
→ explanation
→ construction
→ synthesis
→ difficult / research-adjacent
```

Where useful:

```text
Predict first
→ run visualisation
→ compare
→ explain discrepancy
```

is preferred over passive exposition.

## 41. Tone

Interface copy should be:

```text
short
precise
descriptive
non-judgmental
technically accurate
```

Prefer:

```text
Posterior increases because this observation is more likely under H₁.
```

over:

```text
Great! Your hypothesis is probably correct!
```

Likewise, mathematical tools should explain rather than congratulate.

## 42. No False Authority

Practical reasoning tools MUST expose their assumptions.

Do not disguise a heuristic as objective truth.

Prefer:

```text
Under these assumptions…
Using this model…
If these observations are independent…
At the selected estimate…
```

When outputs are uncertain, show:

```text
range
sensitivity
scenario comparison
```

rather than fake decimal precision.
