# Writing scenarios and option explanations

Load at step 2. Aim: a player who presses every button learns the rule, the exception and the cost.

## Scenario

- One fundamental per scenario. Fields: `title`, `short`, `lesson` (two sentences), `assumption`, `takeaway` (one sentence), `rules` tags.
- Cover the fundamental from both sides: the use that works, the tempting misuse, and the counter. For Protect, Fake Out and pivots that means: free Fake Out turn, Protect into Fake Out, Quick Guard for both slots, Protect to scout, the Protect chain and switch reset, a pivot that repositions, and a pivot that fails.
- Turn 2 uses the consequence of turn 1: Fake Out spent, chain at 1 in 3, Trick Room up. Give a spent move a `disabled` option with the reason.
- The opponent plan is scripted and hidden until the player acts. Scope each assumption to the turn it holds for; the page renders it above every turn.
- State speed order in `assumption` from recorded base Speed, and say when Trick Room reverses it.

## Options

- List every reasonable line for the two slots: protect, attack (single target or spread), set up, support, switch, pivot, and the combinations. Include the greedy line, the passive line and the switch line even when wrong. Keep about 4 to 6 per turn; 3 only when the board offers few.
- Only moves the set carries. Check the set, not memory of the species.
- Exactly one `best` per turn. `ok` works but costs tempo or a resource. `bad` backfires against the scripted plan. Best means best against the plan and the lesson.

## Explanation shape

Concise, checkable, no fluff. Every sentence must agree with `raw.json` and the ladder.

- `label`: `Slot A: move → target · Slot B: move`.
- `order`: ladder entries in resolution order; `note` about 8 words.
- `happens`: one to three sentences of mechanics in resolution order.
- `why`: one to two sentences of transferable principle.
- `branches`: only for real chance, such as `1 in 3` for a repeated Protect.
- `checks`: type multipliers recomputed from the chart.

Write the wrong lines as carefully as the right one; the explanation of a failure is the lesson.
