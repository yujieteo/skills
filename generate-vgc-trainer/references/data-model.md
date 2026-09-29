# Data model and page behaviour

Load at steps 3 and 4. The builder renders one page from three JSON files; the page never simulates.

## Files under `data/<slug>/`

- `raw.json`: `topic`, `sources[{id,url,label,used_for}]`, `regulation{name,official_window,eligibility,format,mega,item_clause,legality_of_team_in_<reg>,sources}`, `team{player,event,placement,record,regulation_played,members[{species,item,ability,nature,moves,types,base_stats}],sources}`, `practice_four`, `species{name:{types,abilities,base_stats,source}}`, `moves{name:{type,category,power,accuracy,priority,pp_showdown,pp_champions,target,effect,source}}`, `protect_chain`, `type_chart`.
- `meta.json`: `slug`, `source_url`, `sources[]`, `fetched`, `key_file_used`, `assumptions[]`.
- `scenarios.json`: `{scenarios:[{id,title,short,rules[],lesson,assumption,takeaway,turns[]}]}`.

A turn: `title`, `prompt`, `field`, `you[2]` and `opp[2]` as `{name,tags[]}`, `bench[]`, `opp_plan`, optional `trick_room`, `options[]`.

An option: `id`, `label`, `verdict` (`best|ok|bad`), `order[{who,side,move,target,result,note}]`, `happens[]`, optional `branches[{p,text}]`, `why[]`, `checks[{move,def[],x}]`, or `disabled` (reason text, empty `order`, never best).

`result` vocabulary: `lands`, `blocked` (guarded by Protect or Quick Guard), `immune` (type immunity), `fails` (condition unmet), `flinched`.

`assets/starter/` is a minimal valid dataset; copy it and run `scripts/verify-trainer-data.py` on it.

## How buttons resolve

Pressing an option renders its authored outcome:

1. A badge: Best line, Works but costly, Backfires, or Unavailable for a disabled option.
2. An SVG ladder of `order`: priority pill (`+3`, `0`, `sw`), side colour, move, target, note, and result, struck through when not `lands`.
3. `happens`, then `branches`, `why`, and type math from `checks`.
4. Best line: `Next turn →`, or on the last turn the takeaway and `Next scenario →`. Anything else: only `Show the best line`, so a wrong answer cannot advance.

The opponent plan stays hidden until a choice. Tabs show completion ticks. A disabled option uses `aria-disabled` so it stays focusable and explains itself.

## Builder shape

One Python file with stdlib only: `render(raw, scen, meta, tokens)` fills a CSS and JS template from `design-tokens.json` and inlines the data; `verify()` asserts the checks in [verification.md](verification.md); `--verify` re-renders and fails if the committed page is stale, then verifies. Output has one `<h1>`, one `<script>`, a `<noscript>` summary of every takeaway, `aria-live` results, a re-render when width changes, and no external asset. The root gallery uses the shared helper if the repo has one.

The three WebMCP tools follow generate-visualization: `get_data`, `get_metadata` and `query` (filter options by `scenario`, `verdict`, `move`), all `readOnlyHint: true`.
