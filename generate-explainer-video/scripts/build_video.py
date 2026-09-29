#!/usr/bin/env python3
"""Render the Manim scene file against timings.json and mux it with the narration.

    build_video.py --work DIR --scene scene.py --scene-class Name [--quality m]

``DIR`` is the folder ``synthesize.py`` wrote (it must hold ``script.json``,
``timings.json`` and ``narration.wav``). Writes ``DIR/<id>.mp4`` (H.264 video,
AAC audio) and ``DIR/metadata.json``.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
QUALITY_DIR = {"l": "480p15", "m": "720p30", "h": "1080p60", "p": "1440p60", "k": "2160p60"}


PREFERRED_FONTS = ["Inter", "Helvetica Neue", "Arial", "Liberation Sans", "DejaVu Sans"]


def pick_font(requested):
    """Return ``requested`` or the first installed face from PREFERRED_FONTS."""
    import manimpango

    installed = set(manimpango.list_fonts())
    if requested:
        if requested not in installed:
            sys.exit(f"font {requested!r} is not installed; see manimpango.list_fonts()")
        return requested
    for name in PREFERRED_FONTS:
        if name in installed:
            return name
    sys.exit("no sans font found; pass --font with a name from manimpango.list_fonts()")


def run(command, env=None):
    print("+", " ".join(str(part) for part in command), flush=True)
    subprocess.run(command, check=True, env=env)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--scene", type=Path, required=True, help="Manim scene file")
    parser.add_argument("--scene-class", required=True)
    parser.add_argument("--quality", choices=sorted(QUALITY_DIR), default="m", help="Manim -q flag (default m, 720p30)")
    parser.add_argument("--font", help="typeface for every Text (default: first installed sans)")
    parser.add_argument("--no-captions", action="store_true")
    args = parser.parse_args()

    work = args.work.resolve()
    timings = work / "timings.json"
    narration = work / "narration.wav"
    script_path = work / "script.json"
    for needed in (script_path, timings, narration, args.scene):
        if not needed.exists():
            sys.exit(f"missing {needed}; run synthesize.py first")
    script = json.loads(script_path.read_text(encoding="utf-8"))
    timeline = json.loads(timings.read_text(encoding="utf-8"))
    total = timeline["total_seconds"]

    env = dict(os.environ, EXPLAINER_SKILL=str(SKILL), EXPLAINER_TIMINGS=str(timings),
               EXPLAINER_FONT=pick_font(args.font))
    if args.no_captions:
        env["EXPLAINER_CAPTIONS"] = "0"
    media = work / "media"
    run([
        sys.executable, "-m", "manim", "render", f"-q{args.quality}", "--media_dir", str(media),
        "--format", "mp4", str(args.scene), args.scene_class,
    ], env)
    silent = media / "videos" / args.scene.stem / QUALITY_DIR[args.quality] / f"{args.scene_class}.mp4"

    stem = script["id"]
    output = work / f"{stem}.mp4"
    run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(silent), "-i", str(narration),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-t", f"{total:.3f}",
        "-movflags", "+faststart", str(output),
    ])
    seconds = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(output)],
        check=True, capture_output=True, text=True,
    ).stdout)
    metadata = {
        "id": stem,
        "date": script.get("date"),
        "title": script["title"],
        "summary": script.get("summary", ""),
        "focus_tags": script.get("focus_tags", []),
        "sources": script.get("sources", []),
        "duration_seconds": round(seconds, 2),
        "voice": timeline["voice"],
        "video": output.name,
        "audio": "narration.wav",
        "captions": "captions.srt",
        "scenes": [
            {"id": s["id"], "title": s["title"], "start": s["window_start"], "end": s["window_end"]}
            for s in timeline["scenes"]
        ],
    }
    (work / "metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {output} ({seconds:.1f}s) and metadata.json")


if __name__ == "__main__":
    main()
