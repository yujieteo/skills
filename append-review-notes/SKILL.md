---
name: append-review-notes
description: Sharpen notes into compact, viewpoint-neutral entries and publish them to teoyujie.org/notes.html from the canonical site repository. Use when the user invokes this skill with notes to append, or explicitly asks to review related published notes.
---

# Append and publish site notes

Treat `data/notes.md` as the sole source of truth. The generated `site/notes.html`
is a publication artifact; never edit it by hand.

Invoking this skill with notes authorizes the complete publish workflow below:
sharpen, append, validate, build, commit, push `main`, deploy, and verify. Do not
show a draft or request routine confirmation. Ask only when a required fact is
ambiguous or the safety checks require a decision.

## Resolve the site

- Use the checkout whose `origin` resolves to `git@github.com:yujieteo/site.git`.
  Verify the remote, repository root, branch, and deployment configuration at
  runtime; do not mistake an intermediate clone for the canonical checkout.
- Read the repository's `SKILLS.md`, `AGENTS.md` if present, and relevant build
  documentation before changing files.
- Work on `main`. Fetch first and update only by fast-forward. Stop on a detached
  head, divergence, merge/rebase state, unresolved deployment destination, or
  overlapping local edits. Preserve unrelated changes and never force-push.
- Never write SSH details, credentials, private paths, or deployment secrets into
  the repository or this skill.

## Sharpen into atomic entries

Split the input into independently useful ideas. Keep tightly coupled reasoning
together, but do not combine ideas merely because they arrived in one message.
Use a compact pattern when it fits:

`lead claim -> link on the exact supported phrase -> interpretation, question, or implication`

- Tighten prose, remove repetition, repair ambiguous or misleading wording, and
  make each entry understandable when found alone.
- Prefer wording that does not presuppose a viewpoint. Preserve the user's actual
  judgment when stated; neutrality must not erase it.
- Distinguish what a source says from the user's inference. Preserve meaningful
  uncertainty and calibrate hedges such as “may,” “suggests,” and “I think.”
- Preserve quotations, URLs, numbers, formulas, and factual meaning. Do not add a
  conclusion that the supplied material does not support.
- Preserve user-provided links. Prefer canonical, public, durable URLs when a
  choice exists. Inspect enough of a cited source to identify it and separate its
  claims from the user's inference; for a paper, normally verify its canonical
  URL, title, authors, and abstract. Preserve the user's epistemic status. Stop
  if an essential or sole source cannot be identified. Otherwise report a
  broken, gated, or ambiguous nonessential link after publication.
- Keep entries short and plain. Borrow the compact, source-linked mechanics of
  Stallman.org's Political Notes, not its ideology, rhetoric, or terminology.

## Date, order, and tags

- Use the current date in `Asia/Singapore` unless the user supplies another date.
- Maintain exactly one `## YYYY-MM-DD` heading per date, with date sections in
  descending order. Insert a new date near the top; for an existing date, insert
  the new entries at the top of that section.
- Keep notes as blank-line-delimited Markdown paragraphs. Put tags in a trailing
  whitespace-separated run.
- Infer tags from the existing corpus and check for missing dimensions. Make tags
  orthogonal: use the smallest nonredundant set whose members express independent
  facets such as field, concept, activity, or status. Avoid synonyms and tags
  already implied by a more precise tag.
- Use arXiv mathematics classes as field tags when applicable, for example
  `#math.CA`, `#math.AG`, or another verified `math.XX` class. The generator
  accepts letters, digits, underscores, hyphens, and dots; published tags are
  normalized to lowercase.
- Search the current date and related entries before inserting. Do not publish an
  exact duplicate. For a likely near-duplicate, add only the genuinely new point
  or connection.

## Lightweight related-note review

Keep ordinary publishing cheap: use targeted `rg` searches for shared tags,
terms, links, or concepts, then read only the matching neighborhoods and current
date section. Inspect a small relevant sample, normally no more than five entries.

- Use the sample to calibrate neutral wording, hedges, attribution, tag choices,
  and source-versus-inference boundaries.
- Draw a useful connection to an older note when the connection is supported and
  improves retrieval; prefer a stable dated link over repeating old text. Derive
  the fragment from generated output and verify that its target exists—never
  invent an anchor from an assumed format.
- Report a materially outdated, contradictory, or mistagged older entry, but do
  not rewrite historical notes during a normal append run.
- Only revise, merge, prune, or retag older entries when the user explicitly asks
  for a review or normalization pass. Keep such a pass bounded to the requested
  topic or period, preserve uncertainty, and publish it through the same release
  workflow.

## Publish

1. Modify only `data/notes.md`, then run from the repository root:

   ```sh
   .venv/bin/python scripts/validate.py
   .venv/bin/python scripts/build.py
   ```

2. Confirm `site/notes.html` contains every new date, entry, link, and tag, and
   `site/corpus.json` contains the matching note records. Run `git diff --check`;
   inspect the scoped diff and generated output. Ensure the build did not
   introduce unrelated generated churn.
3. Commit only `data/notes.md`, `site/notes.html`, `site/corpus.json`, and any
   other demonstrably required generated artifact. Use a concise note-publishing
   commit message.
4. Fetch immediately before pushing. If remote `main` advanced, do not force:
   update by fast-forward, rebuild and reverify on the new base, or stop when the
   integration is not mechanical. Push the exact commit to `origin main` and
   verify that remote `main` resolves to it.
5. Resolve the SCP destination from secure runtime configuration. Upload
   `site/corpus.json` and the generated notes page to unique temporary files in
   the destination directory, verify both checksums, and atomically rename the
   corpus first and then `notes.html` over SSH. Keep recoverable copies of both
   previous files until public verification succeeds.
   Conceptually:

   ```sh
   scp site/corpus.json <ssh-target>:<document-root>/<unique-corpus-temp-name>
   scp site/notes.html <ssh-target>:<document-root>/<unique-notes-temp-name>
   ssh <ssh-target> '<verify both; preserve current files; rename corpus, then notes>'
   ```

   Resolve placeholders safely at runtime. Never mirror, delete, or deploy
   unrelated files.
6. Compare both deployed files with their local generated files, then fetch
   `https://teoyujie.org/corpus.json` and `https://teoyujie.org/notes.html` with
   cache-busting if necessary. Verify both public responses contain the new
   records and match the intended artifacts.

## Recovery and completion

- If a preflight, validation, or build check fails, do not commit, push, or deploy.
- If push succeeds but deployment fails, keep the published commit, retry only the
  safe deployment/verification step, and report the split state. Never rewrite
  published history to conceal a deployment failure.
- If SCP succeeds but public verification fails, compare local, remote, and HTTP
  checksums/content before retrying. Restore the preserved prior page if the new
  artifact is corrupt or incomplete. Avoid repeated blind uploads.
- Finish only when local source, generated output, remote `main`, deployed file,
  and public page agree. Report the commit, branch, deployed file, live result,
  any link warnings or related-note findings, and any remaining working-tree
  changes.
