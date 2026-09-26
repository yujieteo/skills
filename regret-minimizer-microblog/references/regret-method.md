# Practical regret method

Use this reference to analyze a notes corpus and choose actions. The concepts are
drawn from multi-armed-bandit theory, but the output is a practical decision
record unless the input actually supplies a formal model and observations.

## Applicability gate

A bandit framing is most useful for repeated choices among comparable arms where
feedback arrives soon enough to improve later choices. First identify:

- arms and decision-time context;
- horizon or deadline;
- reward and hard guardrails;
- observation delay and missing/censored feedback;
- experiment, activation, and switching costs;
- whether rewards are plausibly stationary.

Use ordinary decision analysis when choices are one-shot, noncomparable,
irreversible, unsafe to test, or too feedback-poor to learn. Hard safety and
ethical constraints remain outside the reward score.

## Evidence discipline

Separate observations from interpretations. For each arm retain trials, observed
outcomes, recency, context, confidence, switching cost, and missing evidence.
The notes are selected and confounded; mention count is not reward, and realized
disappointment is not counterfactual regret.

Name the comparator:

- **Best fixed arm:** stable repeated decisions; compare with the best single
  action in hindsight.
- **Current-best arm:** use only when drift or a regime change is explicit.
- **Satisficing threshold:** use when a sufficiently good arm is cheaper to
  identify than the exact best.

Do not mix fixed-arm, dynamic, Bayesian, pseudo-regret, and best-arm
identification claims. Use qualitative ordering unless probabilities, rewards,
and costs are observed or explicitly supplied.

## Regret mechanisms

Check every domain for:

- **Under-exploration:** a plausible arm remains untested despite a safe,
  informative trial.
- **Over-exploration:** novelty continues after an incumbent is sufficiently
  good, displacing execution.
- **Stale exploitation:** an old winner persists after context or rewards drift.
- **Context blindness:** the best arm changes with repeatable decision-time
  features.
- **Switching churn:** gross benefit is erased by setup and transition costs.
- **Horizon mismatch:** information arrives too late to repay its acquisition.
- **Reward misspecification:** the proxy crowds out the real aim or violates a
  guardrail.
- **Missing feedback:** experiments and TODOs accumulate without observations,
  preventing learning.

## Explore or exploit

Use this qualitative value-of-information test:

`chance that the result changes a future choice x remaining uses x plausible benefit`

Explore only when that value plausibly exceeds experiment cost, switching cost,
and downside. This is an intuition, not a theorem.

Explore earlier when results can improve many future choices. Near a hard
deadline, exploit or satisfice unless learning transfers to later episodes.
When rewards drift, downweight stale evidence, use recent windows or deliberate
resets, and schedule a recheck after regime changes. Add contextual distinctions
only when the context is observable at decision time and evidence is not split
too thinly. Batch trials and require an improvement margin large enough to repay
switching costs.

Prefer the smallest safe experiment that discriminates among live hypotheses.
An experiment is valuable because it can change a later decision, not because it
is novel. Stop exploring when a robust arm clears an explicit adequacy threshold
and learning the exact optimum costs more than the likely gain.

## Literature anchors

- Lai and Robbins, “Asymptotically Efficient Adaptive Allocation Rules” (1985),
  establishes the information-dependent logarithmic lower-bound tradition for
  stationary stochastic bandits: <https://doi.org/10.1016/0196-8858(85)90002-8>.
- Auer, Cesa-Bianchi, and Fischer, “Finite-time Analysis of the Multiarmed Bandit
  Problem” (2002), gives finite-time UCB guarantees under bounded stationary
  rewards: <https://doi.org/10.1023/A:1013689704352>.
- Kaufmann, Korda, and Munos, “Thompson Sampling: An Asymptotically Optimal
  Finite-Time Analysis” (2012): <https://arxiv.org/abs/1205.4217>.
- Russo and Van Roy, “Learning to Optimize via Information-Directed Sampling,”
  connects immediate regret with information gain:
  <https://arxiv.org/abs/1403.5556>.
- Russo and Van Roy, “Satisficing in Time-Sensitive Bandit Learning,” explains
  why learning a near-best action can dominate identifying the exact optimum:
  <https://arxiv.org/abs/1803.02855>.
- Besbes, Gur, and Zeevi, “Stochastic Multi-Armed-Bandit Problem with
  Non-stationary Rewards,” treats drift and variation-budget dynamic regret:
  <https://arxiv.org/abs/1307.5449>.
- Li, Chu, Langford, and Schapire, “A Contextual-Bandit Approach to Personalized
  News Article Recommendation,” is a concrete contextual-bandit treatment:
  <https://arxiv.org/abs/1003.0146>.
- Dekel, Ding, Koren, and Peres, “Bandits with Switching Costs,” shows that
  switching costs change the regret problem structurally:
  <https://arxiv.org/abs/1310.2997>.

Formal guarantees in these papers rely on models that ordinary notes do not
satisfy. Use their distinctions and decision principles with explicit
assumptions; never borrow their bounds as decoration.
