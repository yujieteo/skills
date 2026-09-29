#!/usr/bin/env python3
"""Check the finished explainer: runtime, stream sync, audible audio, sample frames.

    check_video.py VIDEO [--target-seconds 180] [--tolerance 10] [--frames DIR]

Exits non-zero when the runtime is outside target +/- tolerance, the video and
audio streams differ by more than half a second, or the audio is near-silent.
``--frames DIR`` also writes one PNG every ``--every`` seconds, plus contact
sheets of six frames, for a visual pass.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def probe(video):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,duration,width,height,r_frame_rate",
         "-of", "json", str(video)],
        check=True, capture_output=True, text=True,
    )
    return json.loads(result.stdout)


def mean_volume(video):
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(video), "-vn", "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    mean = re.search(r"mean_volume: (-?[\d.]+|-inf) dB", result.stderr)
    peak = re.search(r"max_volume: (-?[\d.]+|-inf) dB", result.stderr)
    return (float(mean.group(1)) if mean else float("-inf"), float(peak.group(1)) if peak else float("-inf"))


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("video", type=Path)
    parser.add_argument("--target-seconds", type=float, default=180.0)
    parser.add_argument("--tolerance", type=float, default=10.0)
    parser.add_argument("--frames", type=Path, help="write sample frames into this directory")
    parser.add_argument("--every", type=float, default=15.0, help="seconds between sample frames")
    args = parser.parse_args()

    info = probe(args.video)
    duration = float(info["format"]["duration"])
    streams = {s["codec_type"]: s for s in info["streams"]}
    problems = []
    if "video" not in streams or "audio" not in streams:
        problems.append("expected one video and one audio stream")
    else:
        video_seconds = float(streams["video"].get("duration", duration))
        audio_seconds = float(streams["audio"].get("duration", duration))
        if abs(video_seconds - audio_seconds) > 0.5:
            problems.append(f"video {video_seconds:.2f}s and audio {audio_seconds:.2f}s differ by more than 0.5s")
        print(f"video: {streams['video']['codec_name']} {streams['video']['width']}x{streams['video']['height']} "
              f"@ {streams['video']['r_frame_rate']}, {video_seconds:.2f}s")
        print(f"audio: {streams['audio']['codec_name']}, {audio_seconds:.2f}s")
    low, high = args.target_seconds - args.tolerance, args.target_seconds + args.tolerance
    print(f"runtime: {duration:.2f}s (target {args.target_seconds:.0f}s +/- {args.tolerance:.0f}s)")
    if not low <= duration <= high:
        problems.append(f"runtime {duration:.1f}s is outside {low:.0f}-{high:.0f}s")
    mean, peak = mean_volume(args.video)
    print(f"audio level: mean {mean} dB, peak {peak} dB")
    if mean < -45:
        problems.append(f"audio is near-silent (mean {mean} dB)")

    if args.frames:
        args.frames.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(args.video), "-vf", f"fps=1/{args.every}",
             str(args.frames / "frame-%03d.png")],
            check=True,
        )
        count = len(list(args.frames.glob("frame-*.png")))
        for sheet, first in enumerate(range(1, count + 1, 6)):
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-start_number", str(first),
                 "-i", str(args.frames / "frame-%03d.png"), "-vf", "tile=2x3", "-frames:v", "1",
                 "-update", "1", str(args.frames / f"sheet-{sheet}.png")],
                check=True,
            )
        print(f"frames: {count} written to {args.frames}, with sheet-N.png contact sheets of six")

    if problems:
        sys.exit("FAIL: " + "; ".join(problems))
    print("OK")


if __name__ == "__main__":
    main()
