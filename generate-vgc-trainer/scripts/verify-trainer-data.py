#!/usr/bin/env python3
"""Check a VGC trainer's data against the rules its reviews kept catching.

Usage: verify-trainer-data.py <data-dir>
Reads <data-dir>/raw.json, scenarios.json and meta.json (shapes in
references/data-model.md). Prints one line per problem and exits 1 if any.
Stdlib only. Complements, never replaces, the builder's own --verify.
"""
import json
import sys
from pathlib import Path

RESULTS = {"lands", "blocked", "immune", "fails", "flinched"}
VERDICTS = {"best", "ok", "bad"}
SPREAD = {"allAdjacentFoes", "allAdjacent", "all"}


def check(data_dir):
    d = Path(data_dir)
    raw = json.loads((d / "raw.json").read_text(encoding="utf-8"))
    scen = json.loads((d / "scenarios.json").read_text(encoding="utf-8"))
    meta = json.loads((d / "meta.json").read_text(encoding="utf-8"))
    moves, species = raw["moves"], raw["species"]
    members = {m["species"]: m for m in raw["team"]["members"]}
    chart = raw.get("type_chart", {})
    errs = []

    if meta.get("sources") != [s["url"] for s in raw["sources"]]:
        errs.append("meta.sources differs from raw.sources")
    if not meta.get("assumptions"):
        errs.append("meta.assumptions is empty; record every assumption")
    if len({m["item"] for m in members.values()}) != len(members):
        errs.append("item clause: two team members share an item")

    def speed(name):
        bs = (species.get(name) or {}).get("base_stats")
        return bs["spe"] if bs else None

    for sc in scen["scenarios"]:
        for f in ("id", "title", "short", "lesson", "assumption", "takeaway", "rules", "turns"):
            if not sc.get(f):
                errs.append(f"{sc.get('id')}: missing {f}")
        for t in sc["turns"]:
            where = f"{sc['id']} / {t['title']}"
            on_board = {m["name"]: "you" for m in t["you"]} | {m["name"]: "opp" for m in t["opp"]}
            if len(t["you"]) != 2 or len(t["opp"]) != 2:
                errs.append(f"{where}: doubles needs two Pokemon per side")
            n = len(t["options"])
            if not 3 <= n <= 7:
                errs.append(f"{where}: {n} options; aim for about 4 to 6 reasonable choices")
            if [o["verdict"] for o in t["options"]].count("best") != 1:
                errs.append(f"{where}: needs exactly one best option")
            for o in t["options"]:
                tag = f"{where} / {o['label']}"
                if o["verdict"] not in VERDICTS:
                    errs.append(f"{tag}: bad verdict")
                if o.get("disabled"):
                    if o["order"] or o["verdict"] == "best":
                        errs.append(f"{tag}: disabled option must have no order and not be best")
                    continue
                for f in ("order", "happens", "why"):
                    if not o.get(f):
                        errs.append(f"{tag}: missing {f}")
                prev = None
                for i, a in enumerate(o["order"]):
                    if a["result"] not in RESULTS or a["side"] not in ("you", "opp"):
                        errs.append(f"{tag}: bad result or side on {a['move']}")
                    mvn = a["move"]
                    if mvn != "switch" and mvn not in moves:
                        errs.append(f"{tag}: {mvn} not in raw.moves")
                        continue
                    if on_board.get(a["who"]) != a["side"]:
                        errs.append(f"{tag}: {a['who']} is not on the {a['side']} side this turn")
                    if a["side"] == "you" and mvn != "switch" and mvn not in members.get(a["who"], {}).get("moves", []):
                        errs.append(f"{tag}: {a['who']} does not carry {mvn}")
                    pr = 6 if mvn == "switch" else moves[mvn]["priority"]
                    if prev:
                        ppr, pwho, pmv = prev
                        if pr > ppr:
                            errs.append(f"{tag}: {mvn} (+{pr}) listed after {pmv} ({ppr:+d}); order by priority")
                        elif pr == ppr and mvn != "switch" and pmv != "switch":
                            s1, s2 = speed(pwho), speed(a["who"])
                            if pwho != a["who"] and (s1 is None or s2 is None):
                                errs.append(f"{tag}: record base Speed in raw.json for {pwho if s1 is None else a['who']}")
                            elif pwho != a["who"] and s1 != s2 and (s1 < s2) != bool(t.get("trick_room")):
                                errs.append(f"{tag}: {pwho} ({s1}) before {a['who']} ({s2}) breaks speed order"
                                            + (" under Trick Room" if t.get("trick_room") else ""))
                    prev = (pr, a["who"], mvn)
                    if mvn == "Fake Out" and a["result"] == "immune" and "Ghost" not in a["note"]:
                        errs.append(f"{tag}: Fake Out immune note must name Ghost")
                    guarded = any(b["who"] == a.get("target") and b["move"] == "Protect" for b in o["order"][:i])
                    if mvn == "Sucker Punch" and a["result"] == "blocked" and guarded:
                        errs.append(f"{tag}: Sucker Punch fails into Protect; it is not 'blocked'")
                    if moves.get(mvn, {}).get("target") in SPREAD and a["result"] == "blocked" and "hits" not in a["note"]:
                        errs.append(f"{tag}: spread move labelled blocked; say who is guarded and who still gets hit")
                for c in o.get("checks", []):
                    x = 1.0
                    for dtype in c["def"]:
                        x *= chart.get(c["move"], {}).get(dtype, 1)
                    if x != c["x"]:
                        errs.append(f"{tag}: type check {c['move']} into {c['def']} is x{x}, not x{c['x']}")
    return list(dict.fromkeys(errs))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    problems = check(sys.argv[1])
    print("\n".join(problems) if problems else "trainer data ok")
    sys.exit(1 if problems else 0)
