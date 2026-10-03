# Briefs for delegated work

The delegated-work branch of [`writing-for-agents`](SKILL.md). Everything in `SKILL.md` still applies; this file adds what a brief must carry because its reader cannot ask you a question.

A brief, a loop prompt or a dispatched task is a document an agent runs without you, so it carries what the agent cannot ask for:

- **Specification**: the outcome, in one sentence a stranger could act on.
- **Verification**: how the agent tells done from not done, as a completion criterion it can check.
- **Hard rules**: what it must never do (push to the default branch, leave its worktree, merge). An agent takes a goal literally and finds the shortest path to it; a goal without fences gets met in ways you did not want.
- **Known failure modes**: the agent's habitual misses for this kind of work, each turned into a step it performs, such as checking the page at phone width.

Sources: the three parts of a loop are from swyx's [interview](https://www.youtube.com/watch?v=EWk9PBbKqzc) and literal goals are from the [interview with Magnus of Browser Use](https://www.youtube.com/watch?v=R--bWH0x8_c), both on David Ondrej's channel.
