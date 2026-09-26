---
name: math-source-hunter
description: Find and verify mathematical papers, slides, lecture notes, and exact passages, then record each reviewed source in teoyujie.org notes and searchable paper links. Use when provenance, document-level verification, or a published source review matters.
---

# Hunt, review, and publish mathematical sources

Each source retained from the hunt is a review completed today. Publish one
dated note per source and keep one searchable paper-link record per underlying
source. Invoking this skill authorizes the complete workflow: research, edit,
validate, build, commit, push `main`, deploy, and verify without routine
confirmation.

## Resolve the site

- Use the canonical checkout whose `origin` resolves to
  `git@github.com:yujieteo/site.git`. Verify its root, branch, remote, working
  tree, and deployment configuration at runtime.
- Read the repository's `SKILLS.md`, `AGENTS.md` if present, schema, and relevant
  build documentation before editing. Follow the live schema and neighboring
  YAML records rather than relying on cached structure in this skill.
- Work on `main`. Fetch first and update only by fast-forward. Stop on a detached
  head, divergence, merge/rebase state, unresolved deployment destination, or
  overlapping local edits. Preserve unrelated changes and never force-push.
- Treat `data/notes.md` and the YAML under `data/paper-links/` as sources of
  truth. Generated HTML is a publication artifact; never edit it by hand.

## Hunt with diminishing returns

Given a theorem, phrase, construction, or idea, search terminology variants and
likely historical vocabulary. Distinguish an original source from a standard
reference, modern exposition, or pedagogical treatment without adding a
source-type field to the site's data.

Search papers, books, lecture notes, slides, seminar and workshop pages, and
useful incidental candidates. PRIORITISE BEAMER SLIDES, IMPORTANT.
Continue while candidates add a distinct source
or nonredundant perspective; stop when further searching produces only weaker,
duplicate, or redundant notes.

Prefer one canonical, durable URL per underlying source. Treat abstract, PDF,
publisher, and author-hosted URLs for the same work as alternates unless their
content differs materially.

## Verify economically

Open each retained URL and confirm that the visible title or content identifies
the claimed source and supports a concrete, relevant note. Spend depth in
proportion to value:

- For a principal claim, inspect the PDF or page and record the exact page,
  slide, section, theorem, or equation when available.
- For a supplemental or incidental source, a matching abstract, introduction,
  contents page, or visible description is enough.
- Omit a marginal candidate when verification would be expensive. If an
  essential source is gated or temporarily unavailable, verify it through
  another primary location or trustworthy metadata; otherwise stop and report
  the gap.

Never infer document content from a search snippet. Do not call the earliest
source found the origin without evidence.

## Write one dated note per source

Use the current date in `Asia/Singapore` unless the user supplies another date.
For every retained source, add a separate paragraph at the top of that date's
section in `data/notes.md`. Maintain one `## YYYY-MM-DD` heading per date and
descending date order.

Each note must stand alone and say what was reviewed in that source: a compact
claim or concept, a link on the supported phrase or source title, and the
source's particular contribution, passage, or perspective. Distinguish the
source's claim from the user's inference and preserve uncertainty. Use a small,
orthogonal set of existing tags; use a verified arXiv `math.XX` field tag when
applicable.

A previously indexed source still receives a new dated note when reviewed
again. Avoid exact duplicate note text; state what this review adds or revisits.

## Maintain searchable paper links

For each retained source, search all paper-link YAML for the canonicalized URL
and obvious alternate URLs for the same work.

- For a new source, append one record to the end of the existing YAML in hunt
  order. Mirror the existing corpus and live schema: use the source title, its
  canonical URL, the URL hostname as category, and a concise searchable note.
- For an existing source, create no second record. Improve its note in place
  only when the current review adds genuinely useful searchable information.
- Keep the existing data model. Do not introduce review dates, source types, or
  a new tag convention. Do not use a whole-file importer for incremental edits.

The paper-link note should summarize why the source is useful and include an
exact location when economically verified. Retain incidental sources that pass
the same relevance and identity checks; omit mere keyword matches and
uninspected bibliography entries.

## Validate and publish as one unit

From the repository root:

1. Run `.venv/bin/python scripts/validate.py` and
   `.venv/bin/python scripts/build.py`.
2. Confirm `site/notes.html` contains every new dated entry,
   `site/papers.html` contains every new or improved searchable record, and
   `site/corpus.json` contains both kinds of matching records. Run
   `git diff --check`, inspect the scoped diff, and reject unrelated generated
   churn.
3. Commit only the intended note source, paper-link YAML, their generated pages,
   and any demonstrably required generated artifact. Fetch immediately before
   pushing. If remote `main` advanced, fast-forward, rebuild, and reverify when
   mechanical; otherwise stop. Push the exact commit and verify remote `main`.
4. Deploy the generated corpus, notes, and papers pages as one publication unit.
   Upload all three to unique temporary files, verify their checksums, preserve
   the current files, then replace the corpus first and the pages second. If any
   replacement or verification fails, restore the prior set rather than leave a
   split release.
5. Compare local and deployed files, then fetch
   `https://teoyujie.org/corpus.json`, `https://teoyujie.org/notes.html`, and
   `https://teoyujie.org/papers.html` with cache busting when needed. Finish only
   when local sources, generated output, remote `main`, deployed files, and
   public pages agree.

If validation or build fails, do not commit, push, or deploy. Report the commit,
branch, deployed pages, verification result, source gaps, and remaining working-
tree changes.
