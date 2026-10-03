# Sourcing rules, legality and team facts

Load at step 1. Output: `viz/<slug>/raw.json` and `meta.json`, every claim traceable to a source id.

## Source order

1. Official rules: the game publisher's regulation announcement for dates, eligibility, format, Mega limit. Play! Pokemon rules documents for legality.
2. Event records for team facts: player, placement, record, event regulation, items, abilities, natures, moves (for example Limitless team lists).
3. Move and species data: Pokemon Showdown data files (`moves.ts`, the game's `mods/` overrides, `learnsets.ts`, `pokedex.ts`, `typechart.ts`) and the game's attackdex for PP and game-specific changes. PP and text can differ from mainline data; take them from the current game's dex, not memory.
4. Third-party legality lists: usable, but labelled third-party.
5. Fundamentals vocabulary: VGC Guide (pressure: proactive versus reactive moves; cores; modes; speed control). The `pokemon-vgc-llm-wiki` notes summarise these; cite the original URL, not the wiki path.

Fetch from the exact page, not a home page. If a source refuses fetching, say so in `meta.assumptions` and do not cite it.

## Legality

- Resolve the target regulation's name, window, eligibility rule and format from the official page.
- Check each species and each item against a legality source. Record the source id and whether it is official.
- If the team's event ran under a different regulation, record `regulation_played` beside the target and state the gap on the page and in the PR. Carry-over eligibility statements are evidence, not a rules document.
- Only one Mega Evolution per battle; the item clause forbids duplicate items. Default to base forms and say Mega is not simulated.
- Required page copy: the target regulation name, the phrase `Not verified` next to unconfirmed legality, and the event regulation when it differs. `--verify` asserts these strings.

## Record

`meta.json`: `slug`, `source_url`, `sources` (same URLs, same order as `raw.sources`), `fetched`, `key_file_used: false`, `assumptions`. Typical assumptions, each one sentence:

- team source and any regulation gap, and that legality is not officially confirmed;
- the practice four is the page's choice, not the player's actual bring;
- base forms only, Mega not simulated;
- opponents and plans are hypothetical, speed order is stated per scenario, no damage is simulated;
- which sources were used and which could not be fetched.

Record base Speed for every species whose order a ladder asserts, opponents included. A `null` `base_stats` next to a ladder or assumption that cites a Speed number is an unsourced claim; the shipped example had this gap for one opponent species. Record `protect_chain` values and the type chart from source data, not by hand.

## Honesty

Put an assumptions and follow-up section at the top of the PR body. Say what is scripted, what is unverified, what publishing is left. Do not present a scripted opponent as a meta read or a drill outcome as a win rate. For metagame claims, use `vgc-meta-research` and its evidence ledger.
