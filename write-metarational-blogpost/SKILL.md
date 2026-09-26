---
name: write-metarational-blogpost
description: "Draft or revise a post in data/blog/ using metarationality.com's practice: treat categories as purpose-laden and revisable, not fixed."
---

# Write metarational blogpost

Use this workflow when the user asks to draft a new post in `data/blog/`, or revise an existing one, and wants it to reason the way [metarationality.com](https://metarationality.com/) does. This is a stance applied to whatever the post is about — it does not require the post's topic to be metarationality itself.

## Checklist

Apply every item below as a concrete edit, not commentary about the theory. Never mention “metarationality,” “ontological remodeling,” “nebulosity,” or similar vocabulary in the post unless it is explicitly about that subject. The moves should show up as sharper prose, not jargon.

1. **Surface the category before using it.** If the argument leans on a definition, classification, or “this counts as X” judgment, state what is grouped and why in one sentence before building on it.
2. **Test categories against edge cases.** Before asserting a definition is clean, check the closest counterexample. If edge cases keep multiplying, say that it breaks down at the edges instead of adding exceptions or dropping the hard case.
3. **Tie claims to a stated purpose.** Replace “the right answer is X” with “for [this purpose], X; for [that purpose], Y” when the answer depends on the reader’s goal. Claim one right answer only when it genuinely does not.
4. **Name the revision.** When updating an earlier idea or term, say whether the old category was dropped, survives as informal shorthand, or received a new precise meaning. Do not say only that it became “more nuanced.”
5. **Cut dormitive-principle explanations.** If a sentence labels something (“complexity,” “emergence,” “a skill issue”) without a mechanism, supply one or admit the cause is unknown.
6. **Flag gerrymandering.** If a boundary mainly protects a desired conclusion, say so plainly rather than presenting a post-hoc criterion as principled.
7. **Separate local success from rules.** Do not turn one situation into a general rule, or defend a general rule only with one anecdote.
8. **Justify experiments honestly.** An approach can be worth trying because nothing has ruled it out and the current approach is stuck. Do not manufacture certainty.

## Structure

- **Default:** apply the checklist invisibly. Use no visible framework or extra headers.
- **Concept posts:** only when the post is explicitly about a definition, category dispute, or framework, set `category: Concept` and use this arc: state the common category, show its edge-case failure, then say whether it is dropped, informal, or redefined.

## Workflow

1. Read the draft or brief. Identify the categories, definitions, and “right answer” claims that carry the argument; ignore throwaway phrasing.
2. Draft or revise the post with the checklist applied to that set.
3. Search for absolutist phrasing (“the truth is,” “objectively,” “always,” “the correct way”) and unexplained labels (“it’s complexity,” “it’s culture”). Justify genuinely purpose-independent claims or rewrite them.
4. Save to `data/blog/` using the repository’s frontmatter: `title`, `date`, `summary`, `category`, and `tags`. Set `category: Concept` only for concept posts.
5. From the repository root, validate and rebuild:

   ```sh
   .venv/bin/python scripts/validate.py
   .venv/bin/python scripts/build.py
   ```

6. Report which checklist items changed the draft materially, and flag any absolutist claim retained because it is genuinely purpose-independent.

Link to a specific metarationality.com page only when the post directly builds on that page’s argument — never as decoration or an appeal to authority.
