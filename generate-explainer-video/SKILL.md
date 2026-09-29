---
name: generate-explainer-video
description: "Turn a note or tag cluster from the owner's notes into a ~3-minute explainer video: script it, narrate with local Kokoro, animate with Manim timed to the audio, mux with ffmpeg, and verify the runtime. Use when the user asks for a short video or explainer from their notes."
---

# Generate a three-minute explainer video

Turn material from the owner's notes into one narrated, animated explainer of
about three minutes. Narration is local Kokoro speech, visuals are Manim scenes
timed to that speech, and ffmpeg joins them. No paid or remote service is used.

This is the video sibling of [generate-podcast](../generate-podcast/SKILL.md).
It reuses that skill's repository-supplied inputs, focus selection, note-to-prose
reduction, and Kokoro setup rather than restating them; read it first. This
skill adds the script, scenes, muxing, and checks. Invoking it authorizes
select, script, synthesize, render, and verify. It never deploys: publishing
follows the invoking repository's own release flow.

## Inputs

Take the notes source, tag registry, site name, and voice (default `af_heart`)
from the invoking repository exactly as `generate-podcast` describes them.
For British English use a `b` voice (`bf_emma`, `bf_isabella`, `bm_george`,
`bm_lewis`); `synthesize.py` picks the Kokoro pipeline language from the
voice id's first letter, so the voice and pronunciation always match. Add:

- **Explainer store** — a stable directory holding one `<id>/` folder per
  explainer, outside version control if the repository ignores binaries.
- **Skill directory** — where this skill is checked out; scripts below are
  relative to it.

## One-time setup

Manim needs Cairo, Pango, and pkg-config to build; ffmpeg does the muxing.

```sh
brew install ffmpeg pkg-config cairo pango        # macOS; apt: ffmpeg pkg-config libcairo2-dev libpango1.0-dev
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python -r generate-explainer-video/requirements.txt
```

`python3.13 -m venv .venv && .venv/bin/python -m pip install -r ...` works
without `uv`. Use a local virtual environment, never a global install. The
first synthesis downloads the Kokoro model; keep the network available
once. Only text is drawn, so no LaTeX install is needed.
`ffmpeg -version` and `.venv/bin/manim --version` confirm the toolchain.

## Workflow

Pick `<id>` as `<YYYY-MM-DD>-<slug>` and work in `<store>/<id>/`. Every command
below runs from the directory holding `.venv`.

### 1. Pick the note

- If the user names a note, tag, or topic, use it. Otherwise choose as
  `generate-podcast` does (Focus selection) with a three-minute target, and say
  what was chosen.
- Three minutes is roughly 400 spoken words, so one dense note or a small tag
  cluster of about 1,000 words of source is enough. Drop material rather than
  rushing; a thin topic yields a shorter, honest video.
- Reduce the notes to prose with `generate-podcast`'s Script reduction, then
  extract the claims and every number worth showing.

### 2. Script the narration

Write `<store>/<id>/script.json`; see [script format](references/script-format.md).
It holds 7-9 scenes of 15-25 seconds, each a few short sentences.

- Explain, do not read notes aloud: state the point, show one number, move on.
- Take every figure, name, and date verbatim from the source. Invent no claim.
- Budget about 130 words per minute: numbers and names slow Kokoro below the
  usual 150. Aim for 380-420 words.
- Write for the ear: digits for numbers ("9.1", "£4.6m" as "4.6 million
  pounds"), spell initialisms ("X G I", "F P L"), keep sentences under 25 words,
  and put punctuation where a pause belongs. Captions show the text as written.

### 3. Synthesize and time it

```sh
.venv/bin/python generate-explainer-video/scripts/synthesize.py <store>/<id>/script.json
```

This writes per-scene WAVs, `narration.wav`, `captions.srt`, and `timings.json`
(sentence-level times, a visual window per scene), then prints words, seconds,
and words per minute. It exits non-zero unless the runtime is within 10 seconds
of 180. If it is long or short, edit the script or set `"speed"` (1.0-1.1) in
`script.json`, and rerun. Fix the runtime here, before any animation exists.

### 4. Write the Manim scenes

Write `<store>/<id>/scene.py` following [scene authoring](references/scene-authoring.md):
one `ExplainerScene` subclass with a method per narration scene, animations
placed on spoken sentences with `self.at(sentence, fraction)`. `examples/fpl/`
holds a complete script and scene file to copy from.

### 5. Render and mux

```sh
.venv/bin/python generate-explainer-video/scripts/build_video.py \
  --work <store>/<id> --scene <store>/<id>/scene.py --scene-class <SceneClass> --quality l
```

`--quality l` (480p15) renders in about half a minute and is for iterating.
Render the final with `--quality m` (720p30, about seven minutes for three
minutes of video) or `h`. It muxes H.264 video with
the AAC narration into `<id>.mp4` and writes `metadata.json`.

### 6. Verify, then repeat

```sh
.venv/bin/python generate-explainer-video/scripts/check_video.py <store>/<id>/<id>.mp4 --frames <store>/<id>/frames --every 6
```

It checks the runtime (180 s +/- 10 s), that video and audio streams agree to
0.5 s, and that the audio is audible, then writes frames and `sheet-N.png`
contact sheets. Open every sheet and look for:

- text overlapping bars, cards, or the caption strip, or running off the frame;
- a caption ghosted under the next one, or a serif font;
- visuals arriving before or after the sentence that introduces them;
- empty stretches longer than about five seconds, and unreadable small text.

Fix the scene file, re-render at `l`, and repeat until clean; then render the
final at `m` and run the check on it. Listen to a sample of `narration.wav`
for mispronounced names and numbers when accuracy matters, and adjust spelling
in `script.json` (re-run from step 3, since timings shift).

## Output contract

`<store>/<id>/` holds the hand-off set, which stays put once verified:

- `<id>.mp4` — the finished video; `metadata.json` — `id`, `date`, `title`,
  `summary`, `focus_tags`, `sources`, `duration_seconds`, `voice`, file names,
  and per-scene windows, so a later site change can list it like a podcast
  episode;
- `script.json`, `scene.py` — the narration and source of the visuals;
- `narration.wav`, `captions.srt`, `timings.json`, `audio/` — the audio and timing;
- `media/`, `frames/` — render cache and review frames, safe to delete.

Commit `script.json` and `scene.py` as a small example when asked; never commit
the MP4, WAVs, or `media/`. Report the store path, `<id>.mp4`, and its measured
duration when done. Do not deploy, upload, or touch remote hosts.

## Pitfalls this skill was built around

- Manim fixes which mobjects it redraws at the start of each `play()`/`wait()`,
  so a caption swapped in mid-call leaves the old one ghosted. `ExplainerScene`
  builds all captions once and toggles opacity; do not add your own swapping text.
- Manim's default face is a serif. Import `FONT` from `timeline` and pass it to
  every `Text`; `build_video.py` picks an installed sans or takes `--font`.
- The Homebrew ffmpeg has no `subtitles` filter, so captions are drawn by
  Manim and `captions.srt` ships as a sidecar rather than being burned in.
- Waiting on absolute timeline seconds keeps visuals from drifting; never pad
  scenes with fixed `self.wait()` durations.
