---
name: review-by-risk
description: Choose how much review a change gets from the paths its diff touches, then land it on the matching path. Use when deciding whether a pull request needs the full review pipeline or only CI, when writing a repository's review tiers, or when tempted to review a change again.
---

# Review by risk

The diff decides the review, not the request, the author's confidence or a model's opinion. Agents make building cheap; review is the slow station, so spend it where a mistake is expensive and nowhere else.

## 1. Read the tier from the diff

List the changed paths against the merge base (`git diff --name-only origin/main...HEAD`) and put the whole change on one tier:

- **Fast path:** every changed path is data-only (a record and the file its builder regenerates from it), documentation-only, or mechanical. Mechanical means moving or copying already-reviewed content without changing its logic, tests or tooling: a byte-identical import with its history, a regenerated file, a copied page, a template synced by the repository's own sync script.
- **Full pipeline:** anything that touches logic, a builder, sources, tests, CI, shared tooling, templates or deploy files. A copy edited after copying, or an import that also edits code to fit, is no longer mechanical.

One full-pipeline path puts the whole change on the full pipeline. When a repository writes its own tier rule (a `SKILLS.md`, `AGENTS.md` or verify playbook), its list of paths wins over the categories above.

Write the tier as a rule over paths, so that a script or any agent gets the same answer. A deterministic rule is cheaper than a model and cannot be argued with; give a judgement to a model only where no rule can be written.

## 2. Land each tier

**Fast path.** Run the repository's local checks, then open a plain pull request. It reaches the default branch only after CI passes on the exact commit that lands. CI often runs only on pull requests, so a pushed branch alone proves nothing. On a red run, fix on the branch and wait for green again. When the base moves, rebase and wait for CI on the new head. Never push a fast-path change to the default branch red or untested.

**Full pipeline.** The repository's review gate (for example no-mistakes) runs review, tests and CI, and its findings are fixed through the gate.

## 3. Review once, then stop

For a full-pipeline change, one review by a model other than the author's, with its findings merged into one list, is the review. Do not ask for another round to feel safe: a model asked for the five biggest problems returns five whether or not they exist. Another round is earned only by a new diff or a finding that changed the design.

## 4. Check the line, not only the change

Review buys two things: a gate on dangerous changes, and insight into the system that produced them.

- From time to time, read a change that took the fast path. Check that the tier rule still draws the line in the right place, and move a path to the full pipeline when it carried a real mistake.
- Ask agents to say when a change crosses a boundary you care about (a schema, the public API, the build or the deploy path), rather than reading every line of every change.
- When review or CI catches a mistake, ask why the process let it in, and add the check that stops that class of mistake (**principle-encode-lessons-in-structure**). The fix alone repairs one instance.

## Sources

The tiers come from the owner's yujieteo/visuals and yujieteo/site repositories. Review once and stop is from David Ondrej's [own agentic setup](https://www.youtube.com/watch?v=c9nRxEy1kUY). The two purposes of review, and asking why a bug was there, are from Matt Pocock's [interview](https://www.youtube.com/watch?v=nQwJVHCtDDY). Being told about boundary crossings is from Guillermo Rauch's [interview](https://www.youtube.com/watch?v=WeiB_gLOdQE). Review as the slow station is Dex Horthy's point, from Goldratt's *The Goal*, in his [interview](https://www.youtube.com/watch?v=xgkjtF89-44). All four videos are on David Ondrej's channel.
