---
name: principle-never-block-on-the-human
description: "Apply when tempted to ask 'should I do X?' on reversible work. Proceed, present the result, let the human course-correct after the fact; reserve confirmation for irreversible actions."
---

> Host actions: [agent runtime](../poteto-mode/references/agent-runtime.md).


# Never Block on the Human

The human supervises asynchronously. Agents must stay unblocked. Make reasonable decisions, proceed, and let the human course-correct after the fact.

**Why:** Every permission pause stalls the pipeline and makes the human the bottleneck. Since code changes are reversible and reviewable, a wrong decision usually costs less than blocking.

**Pattern:**
- **Proceed, then present.** Do the work, show the result. Don't ask "should I do X?" Do X, explain why.
- **Make the system self-healing.** When you notice a problem, log it and fix it in the next round.

**When a decision is the human's, make it cheap to answer:**
- **The human is the bottleneck.** More agents do not help when every one of them waits on the same person; batch decisions and order them by priority, so a decision that blocks important work is answered first.
- **Front-load the decisions.** Before building, list the consequential choices (product, architecture, interfaces) and ask once, while changing course is cheap. Then build without asking again.
- **Carry the reason.** Each request states the question, the options, a recommended default, and why. The reason is what lets the human see weeks later why they said yes.
- **Say how long it takes to answer.** Quick decisions go first; a decision that needs a long look is marked as one, so it is not answered at swiping speed.

Sources: priority order and asking before building are from David Ondrej's [own agentic setup](https://www.youtube.com/watch?v=c9nRxEy1kUY); the bottleneck is Dex Horthy's, in his [interview](https://www.youtube.com/watch?v=xgkjtF89-44); proposals sorted by effort are from the [interview with Magnus of Browser Use](https://www.youtube.com/watch?v=R--bWH0x8_c), all on David Ondrej's channel.

**Boundaries:**
- **Irreversible actions** (force-push, delete production data, send external messages) still require confirmation.
- **Reversible actions** (write code, edit notes, split tasks) should proceed without blocking.
- **Product direction** comes from the human. *Execution* should not block.
