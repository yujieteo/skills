---
name: internalise-computation
description: Build and publish a concise dependency ladder that makes one advanced mathematical computation executable mentally without writing. Use for research-level computations in algebra, analysis, geometry, topology, noncommutative geometry, or mathematical physics when the goal is durable internal understanding rather than ordinary exposition or mental arithmetic.
---

# Internalise one advanced computation

Turn a precise input and checkable result into a one-shot training path whose
small computations compose to reproduce the target. Invocation authorizes the
complete workflow: research, edit, validate, build, commit, push `main`, deploy,
and verify without routine confirmation.

## Resolve the Garden

- Use the canonical checkout whose `origin` is
  `git@github.com:yujieteo/site.git`. Read its live instructions, schema, and
  neighboring records before editing.
- Work on clean, synchronized `main`; fast-forward only. Stop on divergence,
  detached HEAD, an in-progress merge/rebase, unresolved deployment details, or
  overlapping local edits.
- Treat `data/notes.md` and `data/blog/*.md` as sources. Generated `site/` files
  are publication artifacts.
- Inspect existing notes and posts only to reuse established computations and
  vocabulary. The Garden is an analogy for connected understanding, not a
  framework to impose or a reason to interview the user.

## Fix the computation

Require a precise input and checkable terminal output. If the request names a
topic rather than a computation, choose the smallest representative computation
that reveals its mechanism. Proceed autonomously; pause only when the request is
genuinely ambiguous enough that different choices would answer different
questions.

The final execution permits memorized facts and intermediate values, but no
writing, calculator, code, or lookup. Separate reusable permanent knowledge from
minimal target-specific memory; never replace derivation by memorizing the final
script.

## Build the dependency ladder

Start from relevant undergraduate prerequisites, then follow the target's actual
dependencies. Model the ladder as a graph, not necessarily a linear sequence.
For each node:

1. State the prompt and checkable result.
2. Find one governing idea that generates the steps.
3. Give the shortest truthful mental derivation and an invariant or independent
   check.
4. Keep the complete unit below 300 words and understandable on one reading in
   under ten minutes.

Prefer the compact anatomy **question → governing idea → mental derivation →
answer → self-check**, but use a smaller structure when it works better. Split a
node recursively until it meets the bound. If the remaining obstacle is genuine
prerequisite study, report the exact gap rather than hiding reasoning.

Every important node must be independently cross-checked, and composing the
nodes must reproduce the target result. Optimize for reconstruction from a few
generative ideas, not a long sequence of recalled sentences.

## Choose the structural viewpoint

Use the loop **shadow → higher object → natural family → compressed shadow**:

- Begin with the simplest visible computation.
- When mathematically justified, identify the richer categorical,
  noncommutative, or field-theoretic object whose truncation, invariant,
  representation, decategorification, or specialization produces it.
- Study the smallest natural family in which the mechanism and its variation
  become visible.
- Return to the requested case with a shorter mental execution.

Prefer Connes-style organization when it clarifies the target: the algebra of
observables, spectral recovery of geometry, cyclic invariants, noncommutative
integration, duality, and passage between commutative shadows and
noncommutative structure. Prefer QFT habits when useful: symmetry, states,
observables, deformation, scale, diagrams, and local-to-global gluing.

Label theorem-backed reasoning, formal manipulation, and physical heuristic
distinctly. The simplest truthful execution model wins: richer structure earns
its place only by compressing the computation, revealing its family, or
improving transfer.

## Verify for simplicity

Find at least one authoritative source that verifies the load-bearing
mathematics. Seek additional sources only when they offer a materially simpler
mental representation. Prefer higher-category, noncommutative-geometry, and
mathematical-QFT sources when they illuminate the target; otherwise prefer the
clearest authority.

Inspect the actual source at the relevant page, section, theorem, or equation.
Never infer content from a search snippet. Keep source machinery subordinate to
the single goal of a correct, internally simple computation; do not create or
edit paper-link records.

## Write the atoms and manual

Add every meaningful standalone computation as a separate paragraph at the top
of today's `data/notes.md` section, using Asia/Singapore time. Each atom must be
self-contained, below 300 words, and include its mental route and check. Reuse
an existing atom when it meets the standard; publish a revised one only when the
new representation is genuinely better.

Create one `data/blog/*.md` training manual categorized by mathematical subject
and tagged `mental-computation`. Make it extremely concise and phone-readable:

- show the dependency route;
- place each solution in a collapsible section after its prompt;
- use minimal links at claims that depend on sources and finish with a compact
  references section;
- end with a compressed prompts-only run of the complete computation;
- add only a few lines of spaced recall and recombination prompts.

Each training unit remains below 300 words. The whole post may contain as many
units as the honest dependency graph requires. Later difficulty is evidence to
split or rewrite the relevant unit.

## Validate and publish as one unit

Follow the repository's current validation, build, test, commit, push, and
deployment instructions. Verify the new notes in `site/notes.html`, the post and
index in `site/blog/`, and all matching records in `site/corpus.json`; inspect
the scoped diff and reject unrelated generated churn.

Commit only the intended sources and required generated artifacts. Fetch again
before pushing; if remote `main` advanced, fast-forward, rebuild, and reverify
only when mechanical. Deploy corpus first, then the notes page, blog index, and
post as one recoverable publication unit using unique temporary files and
checksum verification. Restore the prior set after any partial failure.

Finish only when local sources, generated output, remote `main`, deployed files,
and cache-busted public pages agree. Report the target computation, dependency
atoms, source gaps, commit, branch, deployed pages, verification result, and any
remaining working-tree changes.
