---
name: vgc-meta-research
description: Research the current Pokemon VGC metagame from tournament and usage data, interpret it through positioning, pivoting, protecting, and learning, then publish source-linked notes to teoyujie.org. Use for VGC trend, metagame, tournament, or fundamentals research intended for the site.
---

# Research and publish VGC meta notes

Produce atomic notes that help a player act. Treat usage, conversion, pairings,
and results as measurements from a situated competitive environment. Interpret
them through VGC fundamentals. Invoke this skill only when publication is in
scope.

## Frame the question

Resolve the current official regulation, its effective dates, the available
completed events, and each source's update time. Use recent completed events in
the current regulation as the main population. Use older formats only for an
explicit comparison.

Operationalize the question before collecting data. Keep these estimands
separate unless a model links them:

- population usage or change in usage;
- entrant-to-day-two or entrant-to-cut conversion;
- battle win rate under declared pairings and pilots;
- performance conditional on partners, archetype, event, or player history;
- a fundamentals claim about positions or decisions that the available data can
  observe.

For words such as `stronger`, `better`, or `improving`, select one estimand and
state which competing meanings remain untested.

When the requested thesis or interpretation has an unsettled product decision,
invoke `$grill-me` before research. Build the decision tree around what the note
should help a player understand or change. Find factual inputs yourself. Proceed
without an interview when the requested question and publication intent are
already settled.

## Gather evidence

Read [the source policy](references/sources-and-evidence.md) before collecting
data. Start with the narrowest current slice that can answer the question.

Keep a compact evidence ledger in TOON. Use one row per observation:

```toon
evidence[count=N]{source,population,measure,limits}:
  example_source,"event entrants, n=128","Pokemon X teams=16; rate=12.5%","synthetic example"

claims[count=N]{claim,status,basis,limits}:
  "Pokemon X usage increased","derived","two comparable event rates","causality unknown"
```

Use only `measured`, `derived`, `inferred`, or `unknown` for `status`. Precompute
totals and denominators. State an explicit zero-result state. Show at most 20 raw
rows. When more exist, add `result_summary{total,shown,recovery}` with the exact
query URL or command that recovers the full set.

## Interpret probability correctly

For every quantitative claim, identify:

- the sample space and observational unit;
- the sampling or selection process;
- the conditioning variables, including regulation, event, phase, team sheet,
  and player population when available;
- the estimand and denominator;
- the uncertainty caused by sample size, missingness, dependence, censoring,
  selection, and source lag.

Define the probability model as `(Omega, F, P)` when the analysis uses
probability. State what an outcome in `Omega` represents, which events belong to
`F`, and which population or mechanism gives `P` its meaning. Define random
variables and conditioning events before using their distributions. Treat an
empirical percentage as an estimator under a data-generating and selection
process. Do not assume observations are independent or identically distributed
merely because a rate is available.

For selection questions, define an entrant measure `mu` and a selected measure
`nu` on comparable variables. Check common support and positivity. When
`nu` is absolutely continuous with respect to `mu`, use the density ratio
`dnu/dmu` only as a declared selection contrast. Otherwise report where the
contrast is unidentified. A conditional conversion model such as
`P(Cut | Pokemon, event, partners, player history)` is valid only for observed
covariates and supported strata.

Do not turn frequency into causal strength, a posterior, or a player's win
probability without a justified model. Do not compare percentages whose events,
populations, or conditioning information differ. Do not condition on a selected
event phase, such as top cut, and then generalize to entrants without modeling
that selection.

Use exact counts with rates when available. Prefer intervals or sensitivity
analysis to unsupported precision. Weight aggregates only when the target
measure justifies the weights. Show event-level measures beside pooled measures.
Name dependence among teams, players, events, archetypes, and repeated
observations. Use event-level contrasts and a cluster-aware bootstrap or a
justified hierarchical model for uncertainty. If the data cannot support one,
label the interval unavailable instead of using an independent binomial model.

Treat a discovered `riser` as a post-selection claim. Record how many Pokemon,
events, windows, and statistics were scanned. Separate a discovery window from a
later confirmation window when possible. Otherwise use a multiplicity-aware or
shrinkage analysis and name regression to the mean as a live alternative. Say
`unknown` when the source cannot identify the quantity.

## Model the game ontologically

Treat categories as purpose-built models, not intrinsic objects. Define what
counts as an archetype, mode, role, position, pivot, protection line, or learning
signal for the present question. State boundary cases and overlapping
membership. Remodel the categories when the evidence makes the current ontology
misleading.

Represent the ontology as entities, relations, roles, states, transitions, and
observations. Keep a role separate from the Pokemon that fills it, a team mode
separate from a fixed archetype label, and an observed action separate from the
player's latent plan. State which distinctions are identifiable from the data.

Use the meta-rational stance from *In the Cells of the Eggplant*. Examine how a
formal measure connects to the surrounding practice that produced it. Ask what
the model excludes, which distinctions matter for action, and when another model
would serve the player's purpose better. Preserve contextual ambiguity instead
of forcing exhaustive or disjoint labels.

## Connect evidence to fundamentals

Each publishable insight must use evidence and at least one fundamental:

- **Positioning.** How board state, speed order, damage ranges, information,
  resources, and future turn options change the value of a line.
- **Pivoting.** How a player changes modes, board states, targets, tempo, or win
  conditions in response to revealed information.
- **Protecting.** How Protect, defensive switching, redirection, denial, and
  resource preservation trade immediate tempo for option value.
- **Learning.** What evidence a player can collect, which hypothesis it updates,
  and what practice or review loop tests the update.

A trend is publishable only when its direction, comparison point, time window,
and practical consequence are clear.

## Write atomic notes

Write several short notes when the findings support independent ideas. Each note
must stand alone and contain:

1. A concrete claim with regulation and population context.
2. The smallest sufficient evidence, with counts or denominators when known.
3. A fundamentals-based interpretation.
4. A practice, teambuilding, or in-game implication.
5. The material uncertainty and direct source links.

Prefer a narrow qualified claim over a tier list. Distinguish the source's facts
from your inference. Do not publish a claim supported only by a usage rank when
the conclusion concerns tournament conversion, matchup quality, or causation.

## Publish and verify

Pass only the finished atomic notes and their source links to
`$append-review-notes`. Invoking this skill authorizes that skill to own
`data/notes.md`, tags, duplicate checks, the site build, the commit, the push to
`main`, deployment, and public verification. Do not reproduce or bypass its
safeguards.

Report the regulation, evidence window, source coverage, number of notes,
published URL, commit, and material unknowns. End with only the next research or
practice step that follows from the result.
