---
name: principle-encode-lessons-in-structure
description: "Apply when you catch yourself writing the same instruction a second time, or notice a recurring correction. Encode the rule as a lint, metadata flag, runtime check, or script instead of more text."
---

> Host actions: [agent runtime](../poteto-mode/references/agent-runtime.md).


# Encode Lessons in Structure

Encode recurring fixes in mechanisms (tools, code, metadata, automation) instead of textual instructions. Every error, human correction, and unexpected outcome is a learning signal. Capture it, route it, and close the loop.

**Why:** Textual instructions are easy to miss. They require the reader to notice, remember, and comply. Structural mechanisms (lint rules, metadata flags, runtime checks, automation scripts) enforce the rule without cooperation.

**Pattern:**
When you catch yourself writing the same instruction a second time:
1. Ask: can this be a lint rule, a metadata flag, a runtime check, or a script?
2. If yes, encode it. Delete the instruction
3. If no (requires judgment), make the instruction more prominent and add an example of the failure mode

**Pick the strongest mechanism.** When more than one mechanism would work, choose the strongest the situation allows (an unrepresentable state that cannot compile, then a lint or banned API that fails CI, then a canonical helper, then a runtime check), because agents copy whatever the surrounding code already does and a weaker guard becomes the next template.

**Corollary:** If the fix is structural, only use the structural fix. The instruction is the symptom.

**Hooks and locks turn rules into facts.** A rule in a brief depends on every agent reading and obeying it. A pre-tool hook that blocks destructive commands, or a lock that lets one agent at a time run the ship sequence (merge, verify, push, deploy, health check), cannot be skipped.

**When review catches a bug, ask why it was there.** The finding shows that the process let the bug in. Fix the instance, then add the check that would have caught it. If someone keeps stealing your bike, buy a lock.

**Lint the process, not only the code.** Where work records its own state (a spec marked complete, a brief marked finished), check that state against what the record shows (its tickets, its pull request), so drift fails a check instead of waiting for a reader.

Sources: hooks and the push lock are from David Ondrej's [own agentic setup](https://www.youtube.com/watch?v=c9nRxEy1kUY); the bike lock is from Matt Pocock's [interview](https://www.youtube.com/watch?v=nQwJVHCtDDY); the process lint is Dan Zakon's, from the [10X interview](https://www.youtube.com/watch?v=QBfXiWvM0qc), all on David Ondrej's channel.

**Feedback loop:**
- **Capture every correction.** When the human intervenes or tests fail, decide if it's a one-off or a pattern.
- **Route to the right layer.** One-off -> brain note. Recurring fix -> skill or lint rule. Systemic issue -> principle.
- **Close the loop.** Don't just record. Apply now or create a concrete todo.

**Anti-patterns:**
- Acknowledging without recording ("I'll keep that in mind" does not persist)
- Recording without routing (a brain note about a lint rule that should exist is wasted unless the lint rule gets implemented)
- Fixing without generalizing (fixing one instance while leaving the recurring pattern intact)
