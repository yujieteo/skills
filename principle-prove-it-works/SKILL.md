---
name: principle-prove-it-works
description: "Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'"
---

> Host actions: [agent runtime](../poteto-mode/references/agent-runtime.md).


# Prove It Works

Verify every task output by checking the real thing directly. Do not infer from proxies, self-reports, or "it compiles."

**Why:** Unverified work has unknown correctness. Indirect verification (file mtimes, output freshness, agent self-reports, cached screenshots) feels cheaper than direct observation. Acting on a wrong inference costs far more than checking the source.

Check the real thing, not a proxy:
- Check process liveness directly, not indirectly through derived state
- Read the actual value, not a cached or derived representation
- When verification fails, suspect the observation method before suspecting the system

## A green run proves only the tests that ran

- Read which tests ran, not only that the run passed. An environment that cannot start a dependency may skip or mock every test that needs it and still report green.
- A test added with a change must fail on the base commit and pass on the branch. A test that passes on both checks nothing.
- A reported status must agree with the status derived from the record. A worker's "done" counts only when the commit it names is on the pull request branch and its checks ran on that commit.

Sources: the mocked database is Armin Ronacher's story in his [interview](https://www.youtube.com/watch?v=SxuQs9GGYbk); the base-commit check is from Dex Horthy's [interview](https://www.youtube.com/watch?v=xgkjtF89-44); authored against derived status is Dan Zakon's process lint in the [10X interview](https://www.youtube.com/watch?v=QBfXiWvM0qc). All are on David Ondrej's channel.

## Script the check when you can

The strongest proof is a deterministic script that re-runs the same comparison, not a one-time eyeball. Write the script, run it, and keep its output as an artifact a reviewer can re-run instead of trusting your word.

Keep the artifact visible for the human. Commit it only for large or complex work where the trail has to be auditable later, like a big port or migration (the **show-me-your-work** skill).
