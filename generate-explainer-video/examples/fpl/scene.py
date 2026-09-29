"""FPL explainer: one Manim scene per narration scene, timed to timings.json.

Render with the skill's build script; see generate-explainer-video/SKILL.md.
Only Text is used (no LaTeX), so the file renders without a TeX install.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.environ["EXPLAINER_SKILL"], "scripts"))

from manim import (
    Circle, Create, DOWN, Dot, FadeIn, FadeOut, GrowFromEdge, Indicate, LEFT, Line,
    RIGHT, Rectangle, RoundedRectangle, Text, UP, VGroup, Write, config,
)
from timeline import ExplainerScene, FONT

BG = "#0d1524"
PANEL = "#18233a"
INK = "#f4f6fb"
MUTED = "#8e9bb5"
GREEN = "#00e676"
PINK = "#ff2d78"
CYAN = "#22d3ee"
AMBER = "#ffb020"
VIOLET = "#a78bfa"
POSITION = {"GKP": AMBER, "DEF": GREEN, "MID": CYAN, "FWD": PINK}

config.background_color = BG


def label(text, size=28, color=INK, weight="NORMAL"):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight)


def heading(text, sub=None):
    head = label(text, 44, INK, "BOLD").to_corner(UP + LEFT, buff=0.55)
    group = VGroup(head)
    if sub:
        group.add(label(sub, 24, MUTED).next_to(head, DOWN, aligned_edge=LEFT, buff=0.15))
    return group


def hbar(name, detail, value, scale, color, width_max=7.0):
    """Horizontal bar row: name+detail on the left, bar, value at the end."""
    tag = VGroup(label(name, 28, INK, "BOLD"), label(detail, 20, MUTED)).arrange(
        DOWN, aligned_edge=LEFT, buff=0.06)
    bar = Rectangle(width=max(value * scale, 0.05), height=0.5, fill_color=color,
                    fill_opacity=1, stroke_width=0)
    number = label(f"{value:g}", 30, color, "BOLD")
    return tag, bar, number


class FplExplainer(ExplainerScene):
    def construct(self):
        self.intro()
        self.rules()
        self.defenders()
        self.cleansheets()
        self.goalkeepers()
        self.xgi()
        self.ownership()
        self.fixtures()
        self.close()

    def clear(self, *extra):
        """Fade out everything on screen except the caption layer."""
        gone = [m for m in self.mobjects if m.z_index < 100]
        if gone:
            self.play(*[FadeOut(m) for m in gone], run_time=0.4)

    # -- 1 -------------------------------------------------------------
    def intro(self):
        self.begin("intro")
        pitch = VGroup(
            Rectangle(width=11, height=5.6, stroke_color=GREEN, stroke_width=3),
            Line(UP * 2.8, DOWN * 2.8, color=GREEN, stroke_width=3),
            Circle(radius=1.1, color=GREEN, stroke_width=3),
            Rectangle(width=1.8, height=3.2, stroke_color=GREEN, stroke_width=3).align_to(
                Rectangle(width=11, height=5.6), LEFT),
            Rectangle(width=1.8, height=3.2, stroke_color=GREEN, stroke_width=3).align_to(
                Rectangle(width=11, height=5.6), RIGHT),
        ).set_stroke(opacity=0.45).shift(UP * 0.25)
        title = label("Fantasy Premier League", 60, INK, "BOLD").shift(UP * 0.8)
        sub = label("Where the points hide", 40, GREEN, "BOLD").next_to(title, DOWN, buff=0.3)
        when = label("After Gameweek 5 · 2026/27 season", 26, MUTED).next_to(sub, DOWN, buff=0.35)
        self.play(Create(pitch, lag_ratio=0.15), run_time=2.0)
        self.play(FadeIn(title, shift=UP * 0.2), FadeIn(sub, shift=UP * 0.2), run_time=1.0)
        self.play(FadeIn(when), run_time=0.6)
        self.at(0, 0.2)
        chips = VGroup(*[
            VGroup(label(big, 44, color, "BOLD"), label(small, 22, MUTED)).arrange(DOWN, buff=0.08)
            for big, small, color in [("£100m", "budget", GREEN), ("15", "players", CYAN)]
        ]).arrange(RIGHT, buff=1.6).to_edge(DOWN, buff=1.6)
        self.play(FadeIn(chips[0], shift=UP * 0.2), run_time=0.6)
        self.at(0, 0.6)
        self.play(FadeIn(chips[1], shift=UP * 0.2), run_time=0.6)
        self.at(2)
        self.play(Indicate(sub, color=GREEN, scale_factor=1.08), run_time=0.9)
        self.finish()
        self.clear()

    # -- 2 -------------------------------------------------------------
    def rules(self):
        self.begin("rules")
        head = heading("The rules bound every decision")
        self.play(FadeIn(head), run_time=0.6)
        budget = VGroup(label("£100.0m", 64, GREEN, "BOLD"), label("total budget", 24, MUTED)).arrange(
            DOWN, buff=0.1).move_to(LEFT * 4.2 + UP * 1.2)
        limit = VGroup(label("max 3", 52, AMBER, "BOLD"), label("players from any one club", 24, MUTED)).arrange(
            DOWN, buff=0.1).move_to(LEFT * 4.2 + DOWN * 1.0)
        self.at(1)
        self.play(FadeIn(budget, shift=UP * 0.2), run_time=0.6)
        rows = [("GKP", 2), ("DEF", 5), ("MID", 5), ("FWD", 3)]
        pitch = RoundedRectangle(corner_radius=0.2, width=7.4, height=4.5, stroke_color=GREEN,
                                 stroke_width=3, fill_color=PANEL, fill_opacity=0.6).move_to(RIGHT * 3.1 + UP * 0.35)
        self.play(FadeIn(pitch), run_time=0.4)
        for offset, (position, count) in zip([0.1, 0.3, 0.5, 0.7], rows):
            self.at(1, offset)
            y = {"GKP": -1.55, "DEF": -0.5, "MID": 0.55, "FWD": 1.6}[position]
            dots = VGroup(*[Dot(radius=0.2, color=POSITION[position]) for _ in range(count)]).arrange(
                RIGHT, buff=0.7).move_to(pitch.get_center() + UP * y)
            tag = label(f"{count} {position}", 22, POSITION[position], "BOLD")
            tag.move_to(pitch.get_center() + LEFT * 2.95 + UP * y)
            self.play(FadeIn(dots, lag_ratio=0.2), FadeIn(tag), run_time=0.7)
        self.at(1, 0.9)
        self.play(FadeIn(limit, shift=UP * 0.2), run_time=0.6)
        self.at(2)
        self.play(Indicate(budget, color=GREEN, scale_factor=1.08), run_time=0.9)
        self.finish()
        self.clear()

    # -- 3 -------------------------------------------------------------
    def defenders(self):
        self.begin("defenders")
        head = heading("Points per million", "After Gameweek 5, players with 300+ minutes")
        self.play(FadeIn(head), run_time=0.6)
        rows = [
            ("Jayden Bogle", "DEF · LEE · £4.6m · 42 pts", 9.1, GREEN),
            ("Pascal Gross", "MID · BHA · £5.8m · 47 pts", 8.1, CYAN),
            ("Maxim De Cuyper", "DEF · BHA · £5.0m · 38 pts", 7.6, GREEN),
            ("Erling Haaland", "FWD · MCI · £15.6m · 39 pts", 2.5, PINK),
        ]
        built = []
        for i, (name, detail, value, color) in enumerate(rows):
            tag, bar, number = hbar(name, detail, value, 0.6, color)
            y = 1.5 - i * 1.05
            tag.move_to(LEFT * 4.3 + UP * y).align_to(LEFT * 6.5, LEFT)
            bar.move_to(LEFT * 1.0 + UP * y).align_to(LEFT * 1.0, LEFT)
            number.next_to(bar, RIGHT, buff=0.25)
            built.append((tag, bar, number))
        self.at(1)
        chip = VGroup(label("5 of the top 15 scorers", 26, INK, "BOLD"), label("are defenders", 22, MUTED)).arrange(
            DOWN, buff=0.05).to_corner(UP + RIGHT, buff=0.6)
        self.play(FadeIn(chip, shift=LEFT * 0.2), run_time=0.6)
        for sentence, indices in [(2, [0]), (3, [1, 2]), (4, [3])]:
            self.at(sentence)
            for i in indices:
                tag, bar, number = built[i]
                self.play(FadeIn(tag), GrowFromEdge(bar, LEFT), FadeIn(number), run_time=0.9)
        self.finish()
        self.clear()

    # -- 4 -------------------------------------------------------------
    def cleansheets(self):
        self.begin("cleansheets")
        head = heading("Clean sheets belong to teams")
        self.play(FadeIn(head), run_time=0.6)

        def card(team, gd, record_text, players, color, x):
            panel = RoundedRectangle(corner_radius=0.2, width=5.6, height=3.7, fill_color=PANEL,
                                     fill_opacity=1, stroke_color=color, stroke_width=3)
            name = label(team, 34, INK, "BOLD")
            diff = label(gd, 66, color, "BOLD")
            record = VGroup(*[label(line, 22, MUTED) for line in record_text]).arrange(DOWN, buff=0.06)
            roster = VGroup(*[label(p, 24, INK) for p in players]).arrange(DOWN, aligned_edge=LEFT, buff=0.12)
            stack = VGroup(name, diff, record, roster).arrange(DOWN, buff=0.28)
            return VGroup(panel, stack).move_to(RIGHT * x + UP * 0.55)

        brighton = card("Brighton", "+11", ["goal difference", "16 scored · 5 conceded"],
                      ["De Cuyper · 38 pts", "Vušković · 32 pts"], CYAN, -3.3)
        city = card("Manchester City", "+8", ["goal difference"], ["Gvardiol · 37 pts"], GREEN, 3.3)
        self.at(1)
        self.play(FadeIn(brighton, shift=UP * 0.3), run_time=0.8)
        self.at(2)
        self.play(FadeIn(city, shift=UP * 0.3), run_time=0.8)
        self.at(3)
        rule = label("Buy the cheapest starter from the best defence", 30, AMBER, "BOLD").move_to(DOWN * 1.9)
        self.play(Write(rule), run_time=1.6)
        self.finish()
        self.clear()

    # -- 5 -------------------------------------------------------------
    def goalkeepers(self):
        self.begin("goalkeepers")
        head = heading("Goalkeeper value is flat", "Total points after Gameweek 5")
        self.play(FadeIn(head), run_time=0.6)
        keepers = [
            ("Tzolakis", "Hull City · £4.7m", 34, AMBER),
            ("Raya", "Arsenal · £6.1m", 30, MUTED),
            ("Alisson", "Liverpool · £5.5m", 27, MUTED),
        ]
        floor = -1.3
        columns = []
        for i, (name, detail, points, color) in enumerate(keepers):
            x = -4.7 + i * 2.9
            bar = Rectangle(width=1.5, height=points * 0.085, fill_color=color, fill_opacity=1, stroke_width=0)
            bar.move_to([x, floor + bar.height / 2, 0])
            value = label(str(points), 34, color if color != MUTED else INK, "BOLD").next_to(bar, UP, buff=0.12)
            tag = VGroup(label(name, 28, INK, "BOLD"), label(detail, 20, MUTED)).arrange(DOWN, buff=0.06).next_to(
                bar, DOWN, buff=0.15)
            columns.append((bar, value, tag))
        self.at(1)
        bar, value, tag = columns[0]
        self.play(GrowFromEdge(bar, DOWN), FadeIn(tag), run_time=0.8)
        self.play(FadeIn(value), run_time=0.3)
        self.at(2)
        for bar, value, tag in columns[1:]:
            self.play(GrowFromEdge(bar, DOWN), FadeIn(tag), run_time=0.8)
            self.play(FadeIn(value), run_time=0.3)
        self.at(3)
        saves = VGroup(
            label("Saves made", 24, MUTED),
            label("Tzolakis 17", 34, AMBER, "BOLD"),
            label("Raya 9", 34, INK, "BOLD"),
        ).arrange(DOWN, buff=0.2)
        ppm = VGroup(
            label("Points per million", 24, MUTED),
            label("7.2 vs 4.9", 34, INK, "BOLD"),
        ).arrange(DOWN, buff=0.15)
        side = VGroup(saves, ppm).arrange(DOWN, buff=0.6).move_to(RIGHT * 4.9 + UP * 0.3)
        self.play(FadeIn(saves, shift=LEFT * 0.2), run_time=0.7)
        self.play(FadeIn(ppm), run_time=0.5)
        self.at(4)
        self.finish()
        self.clear()

    # -- 6 -------------------------------------------------------------
    def xgi(self):
        self.begin("xgi")
        head = heading("Expected goal involvement", "xGI = expected goals + expected assists")
        self.play(FadeIn(head), run_time=0.6)
        legend = VGroup(
            VGroup(Rectangle(width=0.35, height=0.2, fill_color=PINK, fill_opacity=1, stroke_width=0),
                   label("actual goal involvements", 22, MUTED)).arrange(RIGHT, buff=0.2),
            VGroup(Rectangle(width=0.35, height=0.2, fill_color=CYAN, fill_opacity=1, stroke_width=0),
                   label("expected (xGI)", 22, MUTED)).arrange(RIGHT, buff=0.2),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.15).to_corner(UP + RIGHT, buff=0.6)
        self.at(1)
        self.play(FadeIn(legend), run_time=0.6)
        players = [
            ("Pascal Gross", 7, 2.63, "+4.37", 2),
            ("João Pedro", 6, 2.36, "+3.64", 3),
            ("Igor Thiago", 1, 3.29, "-2.29", 4),
        ]
        scale = 0.85
        origin_x = -3.6
        for i, (name, actual, expected, gap, sentence) in enumerate(players):
            y = 1.5 - i * 1.2
            title = label(name, 28, INK, "BOLD").move_to([-5.2, y, 0]).align_to(LEFT * 6.6, LEFT)
            a_bar = Rectangle(width=actual * scale, height=0.42, fill_color=PINK, fill_opacity=1, stroke_width=0)
            a_bar.move_to([origin_x, y + 0.27, 0]).align_to(LEFT * 0 + LEFT * 3.6, LEFT)
            e_bar = Rectangle(width=expected * scale, height=0.42, fill_color=CYAN, fill_opacity=1, stroke_width=0)
            e_bar.move_to([origin_x, y - 0.27, 0]).align_to(LEFT * 3.6, LEFT)
            a_num = label(f"{actual}", 26, PINK, "BOLD").next_to(a_bar, RIGHT, buff=0.15)
            e_num = label(f"{expected}", 26, CYAN, "BOLD").next_to(e_bar, RIGHT, buff=0.15)
            tag = label(gap, 40, GREEN if gap.startswith("+") else AMBER, "BOLD").move_to([5.2, y, 0])
            self.at(sentence)
            self.play(FadeIn(title), GrowFromEdge(a_bar, LEFT), GrowFromEdge(e_bar, LEFT),
                      FadeIn(a_num), FadeIn(e_num), run_time=1.0)
            self.play(FadeIn(tag, scale=1.3), run_time=0.4)
        self.at(5)
        verdict = label("Sell the overperformers · buy the underperformers", 28, AMBER, "BOLD").move_to(DOWN * 1.95)
        self.play(Write(verdict), run_time=1.6)
        self.finish()
        self.clear()

    # -- 7 -------------------------------------------------------------
    def ownership(self):
        self.begin("ownership")
        head = heading("Ownership lags form", "Owned by the crowd vs current form")
        self.play(FadeIn(head), run_time=0.6)
        owned_head = label("Owned by", 22, VIOLET, "BOLD").move_to([-1.9, 1.85, 0])
        form_head = label("Form", 22, GREEN, "BOLD").move_to([4.6, 1.85, 0])
        rows = [("Szoboszlai", 32.9, "3.0", 1), ("Bogle", 7.1, "9.0", 2)]
        self.play(FadeIn(owned_head), FadeIn(form_head), run_time=0.5)
        for i, (name, owned, form, sentence) in enumerate(rows):
            y = 0.9 - i * 1.4
            title = label(name, 30, INK, "BOLD").move_to([-5.4, y, 0]).align_to(LEFT * 6.6, LEFT)
            o_bar = Rectangle(width=owned * 0.11, height=0.5, fill_color=VIOLET, fill_opacity=1, stroke_width=0)
            o_bar.move_to([0, y, 0]).align_to(LEFT * 3.4, LEFT)
            o_num = label(f"{owned}%", 28, VIOLET, "BOLD").next_to(o_bar, RIGHT, buff=0.2)
            chip = VGroup(
                RoundedRectangle(corner_radius=0.15, width=1.5, height=0.85, fill_color=PANEL,
                                 fill_opacity=1, stroke_color=GREEN, stroke_width=3),
                label(form, 38, GREEN, "BOLD"),
            ).move_to([4.6, y, 0])
            chip[1].move_to(chip[0])
            self.at(sentence)
            self.play(FadeIn(title), GrowFromEdge(o_bar, LEFT), FadeIn(o_num), run_time=0.9)
            self.play(FadeIn(chip, scale=0.8), run_time=0.5)
        self.at(3)
        price = VGroup(
            label("Gross +£0.1m", 32, GREEN, "BOLD"),
            label("765,270 net transfers in", 24, MUTED),
        ).arrange(DOWN, buff=0.1).move_to(DOWN * 1.65)
        self.play(FadeIn(price, shift=UP * 0.2), run_time=0.7)
        self.finish()
        self.clear()

    # -- 8 -------------------------------------------------------------
    def fixtures(self):
        self.begin("fixtures")
        head = heading("Fixtures give a transfer its horizon", "Difficulty rating from the fixtures endpoint")
        self.play(FadeIn(head), run_time=0.6)
        self.at(1)
        colors = {1: "#00c853", 2: "#76e07a", 3: "#c8d64a", 4: "#ff9f1c", 5: PINK}
        scale = VGroup(*[
            VGroup(Rectangle(width=1.5, height=0.7, fill_color=colors[n], fill_opacity=1, stroke_width=0),
                   label(str(n), 30, BG, "BOLD"))
            for n in range(1, 6)
        ])
        for tile in scale:
            tile[1].move_to(tile[0])
        scale.arrange(RIGHT, buff=0.12).move_to(UP * 0.9)
        easy = label("easy", 22, MUTED).next_to(scale[0], DOWN, buff=0.15)
        hard = label("hard", 22, MUTED).next_to(scale[4], DOWN, buff=0.15)
        self.play(FadeIn(scale, lag_ratio=0.15), FadeIn(easy), FadeIn(hard), run_time=1.2)
        self.at(2)
        for team, value, x_slot in [("Fulham", 2.0, 1), ("Leeds", 4.0, 3)]:
            anchor = scale[x_slot].get_center()
            marker = VGroup(
                label(team, 30, INK, "BOLD"),
                label(f"avg {value}", 26, colors[int(value)], "BOLD"),
            ).arrange(DOWN, buff=0.08).move_to(anchor + DOWN * 1.9)
            arrow = Line(marker.get_top() + UP * 0.05, anchor + DOWN * 0.7, color=colors[int(value)], stroke_width=4)
            self.play(FadeIn(marker, shift=UP * 0.2), Create(arrow), run_time=0.8)
        self.at(3)
        horizon = label("Buy form only if the next 3 games let it continue", 28, AMBER, "BOLD").move_to(DOWN * 1.95)
        self.play(Write(horizon), run_time=1.6)
        self.finish()
        self.clear()

    # -- 9 -------------------------------------------------------------
    def close(self):
        self.begin("close")
        head = heading("The recap")
        self.play(FadeIn(head), run_time=0.6)
        items = [
            ("Cheap defenders from strong defences", GREEN),
            ("Cheap goalkeepers", AMBER),
            ("xGI over hot streaks", CYAN),
            ("Follow the fixtures", VIOLET),
            ("Buy before the price rises", PINK),
        ]
        start, end = self.span(0)
        stack = VGroup()
        for i, (text, color) in enumerate(items):
            row = VGroup(Dot(radius=0.14, color=color), label(text, 32, INK, "BOLD")).arrange(RIGHT, buff=0.3)
            stack.add(row)
        stack.arrange(DOWN, aligned_edge=LEFT, buff=0.3).move_to(UP * 0.9 + LEFT * 0.5)
        for i, row in enumerate(stack):
            self.hold_until(start + (0.05 + 0.17 * i) * (end - start))
            self.play(FadeIn(row, shift=RIGHT * 0.3), run_time=0.6)
        self.at(1)
        source = VGroup(
            label("Recheck every number", 24, MUTED),
            label("fantasy.premierleague.com/api · vaastav/Fantasy-Premier-League", 26, CYAN, "BOLD"),
        ).arrange(DOWN, buff=0.1).move_to(DOWN * 1.7)
        self.play(FadeIn(source, shift=UP * 0.2), run_time=0.7)
        self.at(2)
        thanks = label("Thanks for watching", 40, GREEN, "BOLD").move_to(UP * 0.2)
        self.play(FadeOut(stack), FadeOut(source), FadeOut(head), run_time=0.5)
        self.play(FadeIn(thanks, scale=0.9), run_time=0.8)
        self.finish()
