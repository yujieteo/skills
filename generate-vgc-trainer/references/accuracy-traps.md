# Accuracy traps

Load at step 5. Automated review rounds on the shipped trainer kept finding these; each was fixed in one place first and reappeared in siblings. After any fix, sweep every scenario for the same class.

1. **Speed order.** Within a priority bracket, list by base Speed descending; reverse under Trick Room. Set `trick_room: true` on turns where it is already up. Trick Room used this turn resolves at -7 and does not reorder that turn. A move that resolves before a debuff is not weakened by it. Stat boosts and Mega forms change Speed; state that base forms are used.
2. **Priority.** Order by priority first: switch, Protect +4, Fake Out +3, Quick Guard +3, Sucker Punch +1, normal 0, Trick Room -7. Same priority: speed decides, so Quick Guard covers both slots only when its user is faster than the Fake Out user.
3. **Fake Out.** First turn on the field only, so a second-turn option is `disabled`. It flinches; Normal-type moves do nothing to Ghosts, so `immune` with `Ghost` in the note; Protect blocks it and the one-time use is lost.
4. **Protect chain.** Success is 1, 1 in 3, 1 in 9. Show a `branches` entry for a repeat, and switching or using another move resets it. Two Protects in a row is a delay, not safe.
5. **Protect and Quick Guard reach.** Protect covers only its user. Quick Guard covers the side from priority moves, so Fake Out and Sucker Punch are `blocked`.
6. **Sucker Punch.** It fails if the target is not attacking, so into Protect the result is `fails`, note `target is not attacking`. Protect (+4) resolves first; never write that Sucker Punch goes first and fails.
7. **Pivot timing.** Parting Shot is priority 0, so speed order matters. It lowers Attack and Special Attack, then the user switches. Protect blocks it: no debuff and no switch. Into Defiant the debuff backfires. Check which later moves now hit the replacement.
8. **Spread moves.** A spread move into one Protect is not blocked. The ladder strikes through any result other than `lands`, so use `lands` with a note naming who is guarded and who is hit. Sweep every spread move in every scenario.
9. **Assumption scope.** A scenario assumption is shown on every turn; a Turn 1 claim about targets must not read as false on Turn 2.
10. **Prose against ladder.** `happens`, `why` and `takeaway` must not contradict `order` or `raw.json`.
11. **Sets and legality.** Options use only carried moves; the event regulation is not the target regulation; Mega and item clauses hold.
12. **Unsourced numbers.** Any Speed, PP or chance quoted in text needs a recorded source. Null stats next to a claim is a bug.
13. **Universal claims in docs.** Before writing that every builder imports a helper, grep. A false README claim failed review.
14. **Counts in `--verify`.** Keep the asserted total option count in sync when options are added.
