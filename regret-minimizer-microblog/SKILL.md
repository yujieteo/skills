---
name: regret-minimizer-microblog
description: Mine notes for avoidable regret, exploration mistakes, durable wins, and one focus action. Track experiments through linked TODO and result notes. Publish a general-audience microblog post when a durable thesis emerges. Use for regret reviews, exploration decisions, or recurring decision patterns.
---

# Regret minimizer microblog

Turn accumulated notes into learning and action. Use **bandit-inspired regret
analysis**, not fictitious calculated regret: prose rarely supplies the rewards,
counterfactuals, or stochastic assumptions needed for a formal bound.

Read [references/regret-method.md](references/regret-method.md) before analyzing a
corpus or choosing actions. It defines the comparators, regret mechanisms,
evidence discipline, and literature basis.

## Resolve the corpus

For teoyujie.org, use the canonical checkout whose `origin` resolves to
`git@github.com:yujieteo/site.git`. Read the repository instructions and treat
`data/notes.md` and `data/blog/*.md` as sources; generated `site/` files are
publication artifacts.

Read the complete requested corpus. Analyze recent notes first, then trace themes
backward so old evidence informs recurring patterns without overriding changed
circumstances. Search existing posts and notes for duplicates before proposing an
action or thesis.

## Build the decision record

Group only comparable choices within a domain. For every material candidate,
record:

- decision, arms, context, remaining horizon, and feedback delay;
- observed evidence separately from inference;
- named comparator and likely regret mechanism;
- uncertainty, missing feedback, experiment cost, switching cost, and downside;
- smallest useful action, observable, deadline, and stop/change/continue rule.

Use low/medium/high or bounded ranges when the corpus lacks sound numerical
inputs. Mention frequency is not reward. One observation can reveal a useful
pattern; three outcome-bearing observations from distinct dates or contexts make
it established enough to act on, rather than statistical proof.

For one-shot, irreversible, incomparable, feedback-poor, or unsafe decisions,
use ordinary decision analysis. Preserve option value. In high-stakes domains,
still choose one concrete critical action; when evidence is weak, obtaining
qualified evidence may be that action.

## Choose actions

Return two layers:

1. **Easy wins:** include every nonredundant action that is one-time or naturally
   self-terminating, concrete, low-cost, low-maintenance, and plausibly creates a
   durable benefit or preserves an option. Prefer reversibility. Batch them into
   one bounded session when their combined switching cost could erode focus.
2. **Major focus:** show the three strongest contenders with compact reasoning,
   then select exactly one. First satisfy safety and feasibility; next prioritize
   closing windows; then maximize robust long-horizon regret reduction; break
   ties by information value and lower total cost.

Every selected action must be SMART: specify the next physical action, quantity
or duration, deadline or review date, observable success signal, and a
stop/change/continue rule. Protect capacity for the major focus before scheduling
easy wins. Use the shortest horizon that can produce meaningful feedback.

Classify actions visibly:

- `#easy-win`: immediate, low-downside, durable one-time gain;
- `#experiment`: uncertain but cheap and diagnostic;
- `#act-now`: delay materially increases plausible regret.

## Prepare linked notes

Use `#regret` for a calibrated diagnosis and `#todo` for its SMART response. Keep
them separate unless diagnosis and action form one genuinely atomic note. Keep
the detailed decision record in the review; publish only the assumptions needed
to understand and revisit the conclusion.

Give every experiment a collision-checked tag of the form `#exp-` followed by
seven lowercase hexadecimal characters. Reuse it on the originating `#todo` and
all later `#result` notes. Wording edits preserve the identifier; a materially
different experiment receives a new one.

An expired review date without a result is a high-priority feedback gap. A result
note states the tested action, observation, and keep/change/stop decision. When
the user explicitly supplies a completed experiment, sharpen and publish the
result directly through `$append-review-notes`. Otherwise show regret and TODO
candidates before invoking that skill to append them.

## Decide whether to publish a post

A single strong observation is enough when it reveals a useful general decision
pattern. Publish only when there is a clear, nonduplicative thesis, a practical
decision rule, and value for a general audience. Two observations support a
recurring pattern; three independent outcome-bearing observations support a
confident action claim.

Lead with a recognizable practical problem. Explain the regret model with
rigorous clarity, derive the action rule, and end with concrete application.
Do not add a ceremonial section attacking the analogy. Keep necessary
assumptions and scope local to the claims they qualify. Generalize or anonymize
personal details unless they are already public or the user explicitly approves
them.

Create `data/blog/<lowercase-hyphen-slug>.md` with exactly the required
frontmatter (`title`, `date`, `summary`, `category`) and optional `tags` and
`slug`. Use the current Asia/Singapore date. Use comma-separated tags when stored
as a string.

## Publish autonomously and recoverably

Direct blog publication is authorized when the thesis gate above passes. Do not
request routine confirmation.

1. Require the canonical repository on clean, synchronized `main`. Fetch and
   update only by fast-forward. Stop on divergence, detached HEAD, merge/rebase
   state, overlapping edits, or unresolved deployment configuration.
2. Create only the intended source, then run the repository validator, build,
   Python tests, JavaScript tests, and `git diff --check`. Inspect the generated
   post, blog index, corpus record, and scoped diff; reject unrelated churn.
3. Commit the source and demonstrably required generated artifacts. Fetch again
   before pushing. If remote `main` advanced, fast-forward, rebuild, and reverify
   only when integration is mechanical. Never force-push.
4. Resolve deployment details from secure runtime configuration. Deploy the
   corpus first, then blog index and post as one recoverable unit using unique
   temporary files, checksum verification, atomic renames, and preserved prior
   copies. Never commit secrets or deploy unrelated files.
5. Verify local files, remote `main`, deployed checksums, and cache-busted public
   pages agree. After a partial failure, retain a pushed commit, restore corrupt
   deployed files when needed, and retry only safe deployment/verification work.

Finish with the chosen major action, easy wins, candidate notes, and any feedback
gaps. For a published post, include its title, live link, commit, verification
state, and a two-or-three-sentence summary of the main thesis.
