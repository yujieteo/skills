# script.json format

`synthesize.py` reads this file and `build_video.py` copies its metadata fields.

```json
{
  "id": "2026-09-29-fpl-where-the-points-hide",
  "title": "Human title",
  "summary": "One sentence naming the topic and the source notes.",
  "date": "2026-09-29",
  "focus_tags": ["fpl", "strategy"],
  "voice": "af_heart",
  "speed": 1.0,
  "sources": ["path/or/note-id", "..."],
  "scenes": [
    {"id": "intro", "title": "Shown in metadata", "narration": "Two or three sentences."}
  ]
}
```

- `id` is `<YYYY-MM-DD>-<slug>` and names the output folder and MP4.
- `scenes[].id` must be unique; the scene file refers to scenes by it.
- `narration` is split into sentences on `.`, `!`, `?` and a space. Each
  sentence becomes one caption and one timing anchor, so animations can be
  placed by sentence number (zero-based) in the scene file. Avoid abbreviations
  with full stops ("St.", "vs.") that would split a sentence early.
- `speed` is optional and defaults to 1.0; use it only to trim the runtime by a
  few percent after the wording is final.
- `sources` lists the notes or files the claims came from, for the hand-off.
