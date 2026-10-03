---
name: parallel-safe-repository
description: Lay out a repository so many agents can change it at once without merge conflicts, cross-talk between tests, or hand-run chores. Use when designing or restructuring a repository that parallel agents work in, when two pull requests keep conflicting on the same shared file, or when CI runs everything for every change.
---

# Parallel-safe repository

Many agents in many worktrees each open a pull request against the same base. Every file that two of them must edit is a merge conflict waiting to happen, and every test that reads another unit's files is a failure that lands on the wrong pull request. Design both out of the layout; do not police them with instructions (**principle-separate-before-serializing-shared-state**).

## Rules

1. **One folder per unit.** A unit (a visual, a page, a service, a skill) is one folder that holds its source, data, builder, tests, metadata and agent guide. Adding or changing a unit is an edit inside its folder only.
2. **Nothing shared lists the units.** Catalogues, galleries, indexes and combined reports are generated from the folders' own metadata and never committed. A hand-maintained list that every new unit appends to is the commonest source of conflicts between parallel pull requests. A check may still compare every unit with a router or registry, but each unit's row should be its own line, never a count or an ordered block.
3. **Generated files are read-only.** Change the source and rerun the generator; never hand-edit the output. On a merge conflict in a committed generated file, take either side, then regenerate it from the merged sources. Build output that should never be committed is ignored, and a check fails a branch that tracks it.
4. **CI runs only what a change touches.** A script maps the changed paths to the units they select: a path in a unit's folder selects that unit; a shared file a unit declares it uses selects its users; documentation selects none; any other shared tooling selects all. Each selected unit runs in its own job.
5. **A unit's tests read only its own folder and the shared tooling.** Run each unit's job on a sparse checkout that holds only those, so a test that reaches into another unit fails in CI instead of passing by accident. Time each test you add, and keep the shared suite's total cost flat as units grow.
6. **Mechanical cross-cutting changes run as a script.** When one change must repeat in many folders (a byte-identical template that every unit carries, for example), a script or a manually started workflow makes it and opens one pull request, checked unit by unit. That pull request lands before the change that needs it. Never re-copy by hand.
7. **One writer for a single source of truth.** A file that must stay whole (a notes log, a ledger) gets one writer at a time: land its changes one at a time, or give each writer its own file and merge at read time.
8. **Agents find their way by routing.** The root `AGENTS.md` points to one router (`SKILLS.md`) that maps each task to the one playbook that owns it. Each unit carries a short guide (its `SKILLS.md` or `AGENTS.md`) with only what is specific to it. See **writing-for-agents** for how to word the pointers.

## Check a layout

Ask of each shared file: does a new unit or an ordinary change have to edit it? If yes, generate it, split it per unit, or give it one writer. Ask of each test: can it fail because of a change to another unit? If yes, move it into that unit or narrow what it reads.

## Sources

This is the design of the owner's yujieteo/visuals monorepo (its `docs/monorepo.md`), which replaced one repository per visual with one folder per visual, and the generated-files and notes rules of yujieteo/site.
