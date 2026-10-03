---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
---

> Host actions: [agent runtime](../poteto-mode/references/agent-runtime.md).


# Guard the Context Window

The context window is finite and non-renewable within a session. Every token should be worth its cost.

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Isolate large payloads.** Route verbose outputs, screenshots, and large documents to subagents. The main context gets summaries, not raw data.
- **Keep frequently used content inline.** Templates and references used on every invocation belong in the skill file, not in separate files that cost a read each time.
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.
- **Compress structured output.** Use TOON for repeated records when plain text is accepted. Default to three or four fields. Report totals and derived status instead of making the reader count.
- **Fetch context with code, not instructions.** A session-start hook or script that loads the facts a task needs costs no attention; an instruction telling the agent how to fetch them costs attention in every session that reads it.
- **Start fresh when a session drifts.** Write a handoff (the **handoff** skill) and continue in a new session, rather than pushing a degraded one on.
- **Truncate with recovery.** Mark omitted content with its full size and the exact way to request it. Emit an explicit zero-result state. End with only the next actions supported by the current result.

Sources: fetching with code and starting fresh are from Dex Horthy's [interview](https://www.youtube.com/watch?v=xgkjtF89-44) on David Ondrej's channel.
