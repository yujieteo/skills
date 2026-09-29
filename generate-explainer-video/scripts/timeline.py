"""Manim helpers that keep animation timed to the Kokoro narration.

Import from the scene file:

    sys.path.insert(0, os.path.join(os.environ["EXPLAINER_SKILL"], "scripts"))
    from timeline import ExplainerScene

Write each narration scene as ``self.begin("id")``, animations placed with
``self.at(sentence_index, fraction)``, then ``self.finish()``. Waiting is
computed from the absolute timeline in ``timings.json``, not from summed
durations, so animation rounding never accumulates into drift. Captions are
drawn by a per-frame updater, so they never block the animations.
"""

import json
import os
import textwrap
from pathlib import Path

from manim import (
    BLACK, DOWN, RoundedRectangle, Scene, Text, VGroup, WHITE, config,
)

CAPTION_FONT_SIZE = 24
CAPTION_WRAP = 80
CAPTION_TAIL = 0.15
CAPTION_PANEL_OPACITY = 0.72
# Set by build_video.py (--font, else the first installed sans face). Scene files
# import it so every Text uses one typeface: Manim's default renders as a serif.
FONT = os.environ.get("EXPLAINER_FONT", "")


class ExplainerScene(Scene):
    """One Manim scene that plays every narration scene back to back."""

    def setup(self):
        path = Path(os.environ.get("EXPLAINER_TIMINGS", "timings.json"))
        self.timings = json.loads(path.read_text(encoding="utf-8"))
        self.by_id = {scene["id"]: scene for scene in self.timings["scenes"]}
        self.current = None
        self._start_captions()

    @property
    def now(self):
        return self.renderer.time

    def hold_until(self, seconds):
        """Wait until the absolute timeline reaches ``seconds`` (no-op if past)."""
        remaining = seconds - self.now
        if remaining > 1 / self.camera.frame_rate:
            self.wait(remaining)

    def budget(self, seconds):
        """Seconds left until ``seconds`` on the timeline, never below one frame."""
        return max(seconds - self.now, 1 / self.camera.frame_rate)

    def begin(self, scene_id):
        """Start narration scene ``scene_id``; returns its timing record."""
        self.hold_until(self.by_id[scene_id]["window_start"])
        self.current = self.by_id[scene_id]
        return self.current

    def span(self, sentence):
        """Absolute (start, end) seconds of a sentence in the current scene."""
        entry = self.current["captions"][sentence]
        return entry["start"], entry["end"]

    def at(self, sentence, fraction=0.0):
        """Wait until ``fraction`` of the way through a spoken sentence."""
        start, end = self.span(sentence)
        self.hold_until(start + fraction * (end - start))

    def finish(self):
        """Hold until this scene's window closes."""
        self.hold_until(self.current["window_end"])

    def _start_captions(self):
        if os.environ.get("EXPLAINER_CAPTIONS", "1") == "0":
            return
        entries = [c for s in self.timings["scenes"] for c in s["captions"]]
        # Manim fixes the list of mobjects it redraws at the start of each play()
        # and wait(), so a caption swapped in mid-call would leave the old one
        # ghosted underneath. Build every caption up front, keep them all in the
        # scene, and toggle opacity from the clock instead.
        boxes = [self._caption_box(c["text"]) for c in entries]
        holder = VGroup(*boxes)

        def refresh(_, dt):
            time = self.now
            active = next(
                (i for i, c in enumerate(entries)
                 if c["start"] - 0.05 <= time < c["end"] + CAPTION_TAIL),
                None,
            )
            for index, (panel, label) in enumerate(boxes):
                shown = 1.0 if index == active else 0.0
                panel.set_fill(BLACK, opacity=CAPTION_PANEL_OPACITY * shown)
                label.set_opacity(shown)

        refresh(None, 0)
        holder.add_updater(refresh)
        holder.set_z_index(100)
        self.add(holder)

    def _caption_box(self, text):
        label = Text(
            textwrap.fill(text, CAPTION_WRAP), font=FONT, font_size=CAPTION_FONT_SIZE,
            color=WHITE, line_spacing=0.9,
        )
        limit = config.frame_width - 1.0
        if label.width > limit:
            label.scale_to_fit_width(limit)
        panel = RoundedRectangle(
            corner_radius=0.12, width=label.width + 0.6, height=label.height + 0.3,
            fill_color=BLACK, fill_opacity=CAPTION_PANEL_OPACITY, stroke_width=0,
        )
        pair = VGroup(panel, label)
        label.move_to(panel)
        pair.to_edge(DOWN, buff=0.28)
        return panel, label
