---
name: skill-sharpening
description: Refine the canonical personal Codex skills collection in place, learn its author's idiosyncratic taste from repository history, reconcile useful upstream changes, and publish the validated collection to its public Git repository. Use for the daily skills-maintenance automation or when explicitly sharpening the whole collection.
---

# Skill sharpening

Treat the repository containing this skill as the canonical Codex installation and as an evolving expression of its author's taste. Improve the collection itself, not merely a report about it.

Read [references/publishing.md](references/publishing.md) before changing or publishing anything.

## Daily loop

1. Fetch the public repository and `mattpocock/skills`. Inspect the working tree, recent commits, prior automation commits, user-authored corrections, reverts, and the current skills. Infer taste from repeated choices and from corrections more strongly than from untouched inherited text.
2. Checkpoint the exact pre-run state in Git before any destructive transformation. Include an already-dirty tree: the local directory is canonical, so preserve and incorporate those edits rather than stashing them away.
3. Audit every managed skill for weak invocation pointers, stale references, duplication, no-op prose, unclear completion criteria, unnecessary context load, broken links, inconsistent terminology, missing validation, or a useful upstream change. Apply AXI to agent-facing structured output: compact fields, bounded content with recovery hints, pre-computed totals, explicit empty states, and contextual next steps.
4. Exercise full editorial authority. Rewrite, rename, merge, split, add, or delete managed skills when that makes the collection more coherent and more faithful to the author's demonstrated preferences. Preserve intent across structural changes and update every affected pointer.
5. Reconcile useful upstream changes as inputs, never as automatic overwrites. Keep local decisions when they better express the author's taste. Record provenance for imported or adapted material.
6. Run `scripts/normalize-frontmatter.mjs` before validation. Run `scripts/verify-collection.mjs` for collection structure and the bundled `skill-creator` validator for YAML frontmatter. Test scripts that changed, inspect the final diff, and scan tracked content for credentials, private material, machine-specific secrets, and accidental system or cache files.
7. Update the collection index and attribution when names, scope, or provenance changed. Keep `.system`, caches, OS metadata, and unrelated installed artifacts untracked.
8. If the result is defensible and all gates pass, create one coherent daily commit and push directly to `origin/main`. Because the repository lives at the active Codex skills path, a successful commit is also the synchronization step.
9. If no concrete improvement survives review, restore no files merely to create activity; leave the tree unchanged and finish successfully with a short audit result.

## Hard gates

Stop before pushing when validation fails, a secret or private artifact may be exposed, provenance is unknown for redistributed material, Git cannot reconcile with the remote, or the checkpoint cannot be established. Explain the exact gate and leave recoverable local state. Agent confidence never substitutes for redistribution rights.

## Completion

The run is complete only when every managed skill was considered, the final tree is internally consistent, all changed skills validate, provenance and public-safe checks pass, and either one atomic refinement commit is present on `origin/main` or there was no defensible change.
