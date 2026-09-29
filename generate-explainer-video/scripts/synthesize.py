#!/usr/bin/env python3
"""Turn a narration script into per-scene Kokoro audio and a shared timeline.

Reads ``script.json`` and writes, under ``--out``:

* ``audio/NN-<scene-id>.wav``  one mono 24 kHz file per scene
* ``narration.wav``            all scenes joined with fixed pauses
* ``captions.srt``             sentence-level subtitles
* ``timings.json``             the timeline the Manim scene file reads

Nothing is sent to a remote speech service. The optional Kokoro runtime is
imported lazily so ``--help`` and the timeline maths work without it.
"""

import argparse
import json
import os
import re
import sys
import wave
from pathlib import Path

SAMPLE_RATE = 24000
DEFAULT_VOICE = "af_heart"
# Kokoro voice ids start with their language: a = American English,
# b = British English (bf_emma, bf_isabella, bm_george, bm_lewis, ...), then
# e, f, h, i, j, p, z for other languages. The pipeline must use the same
# code, or a British voice is read with American pronunciation.
LANG_CODES = set("abefhijpz")
LEAD_SECONDS = 0.5
GAP_SECONDS = 0.7
TAIL_SECONDS = 1.5
SENTENCES = r"(?<=[.!?])\s+"


def load_kokoro():
    # Kokoro shells out to uv to fetch its English model on first use; a direct
    # ``.venv/bin/python`` call does not set this the way activation does.
    os.environ.setdefault("VIRTUAL_ENV", sys.prefix)
    try:
        import numpy
        from kokoro import KPipeline
    except ImportError as exc:
        sys.exit(
            "Kokoro is not installed. Install it with: "
            "uv pip install -r generate-explainer-video/requirements.txt"
        )
    return numpy, KPipeline


def write_wav(path, samples, numpy):
    pcm = (numpy.clip(samples, -1.0, 1.0) * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(pcm.tobytes())


def srt_time(seconds):
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"


def lang_code_for(voice):
    """The Kokoro pipeline language for a voice id such as af_heart or bf_emma."""
    if len(voice) < 4 or voice[0] not in LANG_CODES or voice[1] not in "fm" or voice[2] != "_":
        sys.exit(f"Unrecognised Kokoro voice id {voice!r}: expected e.g. af_heart (American) "
                 "or bf_emma (British).")
    return voice[0]


def synthesize(script, out, voice, speed):
    lang_code = lang_code_for(voice)
    numpy, KPipeline = load_kokoro()
    pipeline = KPipeline(lang_code=lang_code)
    audio_dir = out / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    def silence(seconds):
        return numpy.zeros(int(seconds * SAMPLE_RATE), dtype="float32")

    parts = [silence(LEAD_SECONDS)]
    clock = LEAD_SECONDS
    scenes = []
    for index, scene in enumerate(script["scenes"]):
        captions = []
        chunks = []
        start = clock
        for _, _, audio in pipeline(
            scene["narration"], voice=voice, speed=speed, split_pattern=SENTENCES
        ):
            samples = numpy.asarray(audio, dtype="float32")
            chunks.append(samples)
        sentences = [
            s.strip() for s in re.split(SENTENCES, scene["narration"].strip()) if s.strip()
        ]
        if len(sentences) != len(chunks):
            sentences = [scene["narration"].strip()]
            chunks = [numpy.concatenate(chunks)]
        cursor = start
        for sentence, samples in zip(sentences, chunks):
            duration = samples.size / SAMPLE_RATE
            captions.append({"start": round(cursor, 3), "end": round(cursor + duration, 3), "text": sentence})
            cursor += duration
        spoken = numpy.concatenate(chunks)
        write_wav(audio_dir / f"{index:02d}-{scene['id']}.wav", spoken, numpy)
        parts.append(spoken)
        clock = cursor
        scenes.append({
            "id": scene["id"],
            "title": scene.get("title", scene["id"]),
            "audio_start": round(start, 3),
            "audio_end": round(clock, 3),
            "captions": captions,
        })
        if index < len(script["scenes"]) - 1:
            parts.append(silence(GAP_SECONDS))
            clock += GAP_SECONDS
    parts.append(silence(TAIL_SECONDS))
    total = clock + TAIL_SECONDS

    # Visual windows tile the timeline: each scene owns the time from the end
    # of the previous window up to the moment the next scene starts speaking.
    for position, scene in enumerate(scenes):
        scene["window_start"] = 0.0 if position == 0 else scenes[position - 1]["window_end"]
        scene["window_end"] = round(
            scenes[position + 1]["audio_start"] if position + 1 < len(scenes) else total, 3
        )
    write_wav(out / "narration.wav", numpy.concatenate(parts), numpy)
    return {
        "voice": voice,
        "lang_code": lang_code,
        "speed": speed,
        "sample_rate": SAMPLE_RATE,
        "total_seconds": round(total, 3),
        "scenes": scenes,
    }


def write_srt(timings, path):
    lines = []
    number = 1
    for scene in timings["scenes"]:
        for caption in scene["captions"]:
            lines += [
                str(number),
                f"{srt_time(caption['start'])} --> {srt_time(caption['end'])}",
                caption["text"],
                "",
            ]
            number += 1
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("script", type=Path, help="script.json with a scenes list")
    parser.add_argument("--out", type=Path, default=None, help="working directory for outputs (default: the folder holding script.json)")
    parser.add_argument("--voice", default=None, help=f"Kokoro voice id (default {DEFAULT_VOICE})")
    parser.add_argument("--speed", type=float, default=None, help="Kokoro speaking speed (default: script speed, else 1.0)")
    parser.add_argument("--target-seconds", type=float, default=180.0)
    parser.add_argument("--tolerance", type=float, default=10.0, help="allowed seconds either side of target")
    args = parser.parse_args()

    script = json.loads(args.script.read_text(encoding="utf-8"))
    args.out = args.out or args.script.resolve().parent
    words = sum(len(scene["narration"].split()) for scene in script["scenes"])
    voice = args.voice or script.get("voice") or DEFAULT_VOICE
    speed = args.speed or script.get("speed") or 1.0
    args.out.mkdir(parents=True, exist_ok=True)
    timings = synthesize(script, args.out, voice, speed)
    (args.out / "timings.json").write_text(json.dumps(timings, indent=2) + "\n", encoding="utf-8")
    write_srt(timings, args.out / "captions.srt")

    total = timings["total_seconds"]
    print(f"{words} words, {total:.1f}s narration ({words / (total / 60):.0f} wpm) with voice {voice}")
    low, high = args.target_seconds - args.tolerance, args.target_seconds + args.tolerance
    if not low <= total <= high:
        gap = "long" if total > high else "short"
        sys.exit(
            f"Narration is too {gap}: {total:.1f}s is outside {low:.0f}-{high:.0f}s. "
            "Edit the script (about 150 words per minute) before building scenes."
        )


if __name__ == "__main__":
    main()
