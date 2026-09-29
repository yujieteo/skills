# Playbook: talk to narrated Manim video

The video sibling of a beamer talk, compatible with `generate-explainer-video`:
same `script.json`, same `timings.json`, same timing API in the scene runtime.

1. **Narrate.** Add `\narration{...}` to each frame in talk.tex. Write it for
   the ear, one sentence per overlay step, with numbers through the talk's
   macros. Aim for about 130 words a minute. Section dividers narrate
   themselves.
2. **Draft silently.** Build the slides, then run `python3 scripts/to_manim.py
   <slug>`, which renders at 480p with estimated timings. Open every image in
   `build/video/frames/` and check:
   - the slide is readable;
   - the caption sits below the slide;
   - the last reveal lands by the last sentence.
   Fix narration or overlays in talk.tex and rerun.
3. **Voice it.** Run generate-explainer-video's `synthesize.py` on
   `talks/<slug>/build/video/script.json`, setting `--target-seconds` to the
   draft's length and giving a wide `--tolerance`. Then rerun `to_manim.py`
   with `--quality m`. It uses Kokoro's timings while they match the script
   and muxes `narration.wav`. Listen to names and numbers.
4. **Animate natively where it pays.** For a chart or derivation worth
   animating, add `talks/<slug>/manim/<label>.py` with `animate(scene, frame)`,
   copying `talks/breeden-litzenberger/manim/density.py`, and give the frame
   `label=<label>`. Data comes from the talk's generated files.
5. **Report** the MP4 path, its measured length, whether it is narrated or
   silent, and any frame that still speaks only its title.

Never commit the MP4, WAVs or `media/`; they live under `build/`.
