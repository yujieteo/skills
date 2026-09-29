# Writing the Manim scene file

The scene file renders every narration scene in one Manim `Scene`, so the
video is a single timeline that matches `narration.wav` exactly.

## Skeleton

```python
import os, sys
sys.path.insert(0, os.path.join(os.environ["EXPLAINER_SKILL"], "scripts"))
from manim import *
from timeline import ExplainerScene, FONT

class Explainer(ExplainerScene):
    def construct(self):
        self.intro()
        self.point_one()

    def intro(self):
        self.begin("intro")                # jump to this scene's window
        title = Text("Title", font=FONT, font_size=60)
        self.play(FadeIn(title), run_time=1.0)
        self.at(1, 0.3)                    # 30% through sentence 1
        self.play(title.animate.shift(UP))
        self.finish()                      # hold to the end of the window
        self.play(FadeOut(title), run_time=0.4)
```

`build_video.py` sets `EXPLAINER_SKILL`, `EXPLAINER_TIMINGS`, and
`EXPLAINER_FONT`. The helpers:

- `begin(id)` waits for the scene window to open and returns its timing record.
- `at(sentence, fraction=0)` waits until that point in a spoken sentence.
- `span(sentence)` gives `(start, end)` seconds; `hold_until(t)` and
  `budget(t)` work on absolute timeline seconds.
- `finish()` holds until the window closes, so the next scene starts on cue.

A `play()` that overruns the next `at()` simply starts late; keep animations
short (0.4-1.0 s) and put the visual on the sentence that introduces it.

## Layout rules

The frame is 14.22 x 8 units, centre at the origin.

- Keep content between y = +3.6 and y = -2.1. The caption strip owns the
  bottom of the frame and takes up to three lines.
- Heading at the top left, at most 44 pt; body labels 24-34 pt; nothing under
  20 pt. Write every number the narration says on screen too.
- Reveal one idea per sentence: bars grow as they are named, the takeaway line
  appears on the closing sentence.
- Use one accent colour per meaning and a dark background with white text.
- Draw with `Text`, `Rectangle`, `RoundedRectangle`, `Line`, `Dot`; avoid
  `MathTex`, which needs LaTeX. Compute layout from data, not by eye.
- Clear the screen at the end of each scene with a short `FadeOut`.
