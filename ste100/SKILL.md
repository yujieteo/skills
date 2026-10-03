---
name: ste100
description: Write answers, reports, status lines and other prose for people in ASD-STE100 Simplified Technical English (https://www.asd-ste100.org/). Use when the user or project requires STE for human-facing prose such as replies, summaries or PR descriptions, or when checking or rewriting prose for STE compliance.
---

# ASD-STE100 Simplified Technical English

Use this skill when the user or the project requires human-facing prose in ASD-STE100 Simplified Technical English (STE).
This skill summarizes the STE writing rules in practical form.
The official specification and its dictionary are available free on request from https://www.asd-ste100.org/.

## Scope

Apply STE to all prose that a person reads: chat answers, reports, status and outcome lines, summaries, escalations and PR descriptions.
Do not apply STE to code, commands, file paths, identifiers, log or tool output, quoted text, or the exact words of the user.
A technical name (a product, a file, a command, an API) stays as it is, even when it is not an approved STE word.

## Words

1. Use simple, common words. Prefer the STE approved word to a synonym: "use", not "utilize"; "start", not "initiate"; "help", not "facilitate"; "show", not "demonstrate".
2. Use one word for one meaning, and one meaning for one word. When you call a thing a "worker", do not also call it an "agent" or a "helper" in the same text.
3. Use a word only as its approved part of speech. For example, "test" is a noun and a verb, but do not write "a must" or "a fix" when the standard verb form is clearer.
4. Do not use slang, idioms, jargon, metaphors or humor. Do not use phrasal verbs when a single verb is available: "remove", not "take out"; "continue", not "carry on".
5. Do not use contractions: write "do not", not "don't"; "it is", not "it's".
6. Use technical names and technical verbs only for things that have no simple word.

## Noun clusters

Do not put more than three nouns in a row.
Break a long cluster with a preposition: "the status of the validation run", not "validation run status record update".

## Verbs

1. Use only these verb forms: the imperative ("Run the test."), the simple present ("The test fails."), the simple past ("The test failed."), the simple future ("The test will fail."), the infinitive ("to run"), and the past participle as an adjective ("the merged PR").
2. Do not use the -ing form of a verb, except in a technical name ("Running Header" as a name) or as a modifier in a technical name.
3. Use the active voice. Use the passive voice only in descriptive text when the agent of the action is not known or not important.
4. Do not use complex tenses such as "has been running" or "would have failed". Write "ran" or "failed".

## Sentences

1. Write one topic in each sentence.
2. Keep instructions (procedural sentences) to a maximum of 20 words.
3. Keep descriptive sentences to a maximum of 25 words.
4. Do not leave out words such as "the", "a", "is" or "that" to make a sentence shorter.
5. Use a vertical list or a table when you give more than two related items.
6. Use connecting words ("but", "because", "then", "thus") to show how sentences relate.

## Instructions and procedures

1. Write one instruction in each sentence, unless two actions occur at the same time.
2. Use the imperative: "Merge the PR.", not "The PR should be merged."
3. Put a condition before the instruction: "If the check fails, stop the deploy."
4. Put a warning or a caution before the instruction it applies to, and start it with a clear command.

## Descriptive text

1. Give the most important information first: the result, then the reason, then the details.
2. Write one topic in each paragraph.
3. Keep paragraphs to a maximum of six sentences.

## Punctuation and numbers

1. Do not use semicolons. Write two sentences.
2. Use a colon only to introduce a list or a table.
3. Use parentheses only for short technical additions, not for full sentences.
4. Write numbers as digits, with units: "3 PRs", "7 minutes", "25 words".

## Check before you send

Before you send prose, read it once against these questions:

1. Is the most important point in the first sentence?
2. Is each sentence 25 words or fewer (20 or fewer for an instruction)?
3. Did you use the active voice and simple verb tenses, with no -ing verbs?
4. Did you use the same word for the same thing all the way through?
5. Did you remove slang, idioms, contractions and semicolons?

If an answer is "no", rewrite that part before you send it.

## Run the checker

Before you send prose, run the deterministic checker on it.
The checker is `scripts/ste-axi.mjs` in the directory of this skill.
Use the absolute path of the installed skill, so that the command works from all repositories:

```sh
STE_AXI=~/.claude/skills/ste100/scripts/ste-axi.mjs  # the scripts/ste-axi.mjs file of this skill
node "$STE_AXI" check reply.md
printf '%s\n' "$TEXT" | node "$STE_AXI" check -
```

The script uses Node only and no network.
It prints a short TOON report: the findings first, each with `file:line`, then the counts by rule.
Add `--json` for JSON output.
The exit code is 0 for no findings and 1 for findings.
The exit code is 2 for a usage error, a file that it cannot read, or an input with no prose.

Fix only the flagged lines, then run the check again.
Do not read the full text again for the rules that the checker covers.

| Rule | Flags |
| --- | --- |
| `long-descriptive` | A descriptive sentence of more than 25 words |
| `long-instruction` | An instruction of more than 20 words |
| `ing-form` | A word that ends in -ing, except an allowed noun |
| `contraction` | A short form such as `don't` or `it's` |
| `semicolon` | A semicolon in prose |
| `passive` | A form of "be" with a past participle |
| `noun-cluster` | More than 3 nouns in a row |
| `approved-word` | A word from the approved-word table, with the STE word to use |

The checker does not check these parts of a text:

- Front matter, fenced code, indented code and HTML lines.
- Inline code, URLs, link targets and quoted text.
- Technical names. A technical name has a capital letter after the first letter, a digit, `_`, `/` or `.` in it.
- Capitalized words in the middle of a sentence.

### Known limits

The checker uses word patterns, not grammar, so it gives false alarms and misses some errors.

1. An instruction is a sentence that starts with a verb from a fixed list, also after a condition. Other instructions get the limit of 25 words.
2. The passive rule also flags an adjective after "be", for example "is based". It misses most irregular participles that are not on its list.
3. The noun rule flags a run of words that are not on a list of function words, common verbs and adjectives. It can flag a verb or an adjective.
4. The -ing rule flags a noun that ends in -ing and is not on the allow list, for example a gerund used as a noun.
5. The checker does not check meaning: one word for one meaning, one topic in each sentence, or the order of information. Use the questions above for these rules.

## Relation to other instructions

STE controls the language of prose.
Other instructions continue to control content, structure and safety: for example, project rules on what to report and how to link a PR.
A name that another instruction requires, such as a form of address, stays as it is.
Slang words that a project or persona uses for style are not STE words: do not use them.
For document structure, rhythm and other layers of technical writing, use the `technical-writing` skill.
