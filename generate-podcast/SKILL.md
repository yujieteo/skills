---
name: generate-podcast
description: "Generate a dated ~30-minute spoken episode from a repository's tagged notes with local Kokoro TTS, then validate and publish it through that repository's own build. Use when the user asks for a podcast from their notes."
---

# Generate and publish a podcast episode

Create one dated, roughly 30-minute audio episode from a repository's tagged
notes and publish it through that repository's normal build and release flow.

Use this when the user asks for an episode from their notes, such as "make me a
podcast from my notes" or "publish this week's episode". Invoking it authorizes
the complete workflow below: select, generate, validate, build, commit, push,
deploy, and verify. The build, release, and hosting steps follow the invoking
repository's own documentation; this skill supplies the episode workflow and
assumes no particular layout or host.

## Repository-supplied inputs

The invoking repository names each of these once and passes the resolved values
through. Never hard-code another repository's paths.

- **Notes source** — the canonical daily-notes document. It must expose dated
  entries, each holding notes with `content` Markdown and canonical tag ids.
  (The reference implementation uses `data/notes.md`.)
- **Tag registry** — tag definitions with a `class` per tag, so subject tags can
  be told apart from workflow tags. (Reference: `data/note-tags.json`.)
- **Episode store** — directory for `<episode-id>.yaml` metadata, with an
  `audio/` subdirectory for `<episode-id>.mp3`. (Reference: `data/podcasts/`.)
- **Metadata schema** — JSON Schema for an episode record. (Reference:
  `schema/podcasts.schema.json`.)
- **Site name** — the name spoken in the introduction, read from repository
  configuration. (Reference: `data/cv/cv.yaml`.)
- **Synthesis runtime** — the local Kokoro environment and its voice id
  (default `af_heart`).
- **Build and release commands** — the repository's own validation, build, and
  deploy procedure, with secrets and destinations resolved at runtime.

Read previously published episodes from the episode store before planning; they
drive the "not used before" rules.

## Focus selection

- The seed is the most common subject tag that has not led a previous episode.
  Subject tags are the ones whose registry class marks subject matter (`topic`,
  `project`, `arxiv-math` in the reference). Workflow tags describing action or
  state (`todo`, `read`, `focus`) never lead or join an episode focus.
- Order candidate seeds by note count, then distinct spoken words, then tag id;
  fall back to all subject tags when every tag has already led an episode.
- Expand the focus with tags that co-occur with the seed and the growing focus.
  Prefer tags touching the seed, then tags adding the most new material, then
  tags touching the focus, then larger tags; cap this connected expansion at 12
  tags.
- Continue with the most common remaining subject tags until the focus can
  supply the target duration, capped at 24 focus tags. This keeps the opening
  sections on-theme while guaranteeing enough material when a subject is small.
- Group each note under the first focus tag it matches. Order notes not used by
  an earlier episode first, then newest first, so fresh material leads.
- The target duration is an aim, not a minimum. A thin focus publishes shorter
  rather than adding filler.

## Script

Build the spoken script from the selected plan: an introduction naming the site,
episode date, and leading focus tags; one section per focus tag, each opened
with a "First, notes on <tag>" or "Next, notes on <tag>" transition; the note
bodies reduced to prose; and a closing outro.

Reduce each note's Markdown to listenable prose before synthesis: drop link
targets and bare URLs, strip code fences and emphasis markers, remove heading and
list markers, spell out a small set of LaTeX commands, and collapse whitespace.
The goal is comprehensible speech, not a faithful TeX render.

## Local synthesis

- Speech comes from the Kokoro-82M model through the `kokoro` Python package on
  the local machine. Output is mono 24 kHz MP3 at 64 kbps encoded with
  `lameenc`; a short lead silence precedes the intro and a short pause separates
  sections. No paid or remote speech service is used.
- One-time setup from the repository root, installing the repository's base
  requirements plus its podcast requirements file (reference:
  `requirements-podcast.txt`):

  ```sh
  uv venv --python 3.13 .venv
  uv pip install -r requirements.txt -r <podcast-requirements-file>
  ```

  `uv` is optional; `python3.13 -m venv .venv` plus the same `pip install`
  lines produce an equivalent environment. The pipeline needs
  `kokoro>=0.9.4`, `espeakng-loader==0.2.4`, `soundfile>=0.12`,
  `lameenc>=1.7`, and `numpy>=1.26`. The first synthesis downloads the Kokoro
  model.
- Keep the runtime optional: planning and metadata code must stay importable
  without Kokoro installed, and a missing runtime should raise a clear install
  hint rather than a bare import error.

## Output contract

Write metadata to `<episode-store>/<episode-id>.yaml`, where `<episode-id>` is
`<YYYY-MM-DD>-<focus-slug>`, dated in the repository's local timezone, and
`<focus-slug>` slugifies the first three focus tags. Audio lives at
`<episode-store>/audio/<episode-id>.mp3`, with the `audio` field store-relative.
Validate the record against the repository's metadata schema.

Fields, unchanged from the reference implementation:

- `id` — episode id, equal to the file stem.
- `date` — ISO date.
- `title` — human title derived from the leading focus tags.
- `summary` — one sentence naming the focus and the source-note span.
- `focus_tags` — ordered canonical tags that define the episode focus.
- `notes` — the `note:<sha256>` ids of the notes actually rendered.
- `duration_seconds` — measured MP3 duration.
- `voice` — Kokoro voice id.
- `audio` — `audio/<episode-id>.mp3`, relative to the episode store.

Refuse to overwrite a published episode: stop if the metadata or audio file
already exists rather than replacing it.

## Generate

Run the plan step first, then generate:

```sh
.venv/bin/python <podcast-script> plan --target-minutes 30
.venv/bin/python <podcast-script> generate --target-minutes 30
```

- `plan` selects the episode without rendering audio; review the focus and
  candidate counts before committing to a long render.
- `generate` writes the metadata and MP3. Flags: `--target-minutes N` sets the
  duration aim (greater than 0, at most 240), `--date YYYY-MM-DD` sets the
  episode date, and `--voice <id>` changes the Kokoro voice.
- Rendering starts from a 150-words-per-minute estimate, updates the measured
  rate after each segment, and reserves the outro, so the finished episode never
  exceeds the target; it truncates the last note rather than overrunning. Check
  the printed duration, and listen to a sample when the result matters.
- Write metadata atomically (temp file plus rename) and encode audio to a
  temporary `.part` file renamed into place only on success, so a failed render
  leaves no half-published episode.

## Publish and verify

Publication belongs to the invoking repository, not to this skill. Follow that
repository's build and release documentation and keep secrets, hostnames, and
destinations out of the repository.

1. Run the repository's validation and build. A build normally regenerates a
   podcast index page, a per-episode page, a byte copy of the MP3, and a
   `podcast:<episode-id>` record in the published corpus, using the record's
   `url`, `date`, `tags` (the focus tags), `summary`, `audioUrl`, and
   `durationSeconds`. Treat those generated pages and corpus records as build
   outputs and never hand-edit them. Confirm the new episode appears and the
   diff has no unrelated churn.
2. Commit the episode metadata, the audio, and the generated files the build
   changed. Push the branch the user requests; never rewrite published history.
3. Deploy changed public files atomically: unique temporary names, checksum
   verification, preserved prior files, a web-readable mode, and atomic
   renames. Never use deletion or mirroring flags, and never remove remote
   files.
4. Verify the deployed index, episode page, and MP3 over HTTPS with HTTP 200
   responses and the expected episode content; a 403 means the file is not
   web-readable. Restore the preserved files if any deployed artifact is corrupt
   or incomplete.

## Stays repository-specific

The reference implementation lives in the personal site repository. What stays
there and must not be copied into a generic checkout: the exact notes, tag, CV,
schema, and episode-store paths; the `podcast.py` and `kokoro_tts.py` entry
points; the corpus and build integration; the deploy host and SCP conventions;
and the site's own verification playbook. This skill describes the workflow; a
repository adopting it supplies its own scripts, paths, and release procedure.
