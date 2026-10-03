#!/usr/bin/env node
// Fetch the public FPL API and write the compact dataset the deck embeds.
// Usage: node build-data.mjs [out.json]   (default: data.json beside this file)
// Refresh: rerun, then `node ../../scripts/embed-data.mjs index.html data.json`.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The fields of the public FPL API this script reads.
 * @typedef {{ id: number, is_current: boolean, finished: boolean }} FplEvent
 * @typedef {{ id: number, short_name: string, name: string }} FplTeam
 * @typedef {{ web_name: string, team: number, element_type: number, now_cost: number, total_points: number, minutes: number,
 *   goals_scored: number, assists: number, expected_goal_involvements: string, form: string, selected_by_percent: string,
 *   expected_goals: string, expected_goals_conceded: string }} FplPlayer
 * @typedef {{ events: FplEvent[], teams: FplTeam[], elements: FplPlayer[], total_players: number }} FplBootstrap
 * @typedef {{ event: number | null, finished_provisional: boolean, team_h: number, team_a: number, team_h_score: number,
 *   team_a_score: number, team_h_difficulty: number, team_a_difficulty: number }} FplFixture
 */
const API = "https://fantasy.premierleague.com/api";
const out = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "data.json");
const MIN_MINUTES = 270; // three full matches: below this, points-per-million is noise
/** @type {Record<number, string>} */
const POS = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
/** @param {string} path @returns {Promise<unknown>} */
const get = async (path) => {
  const response = await fetch(`${API}/${path}/`);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
};

const [boot, fixtures] = /** @type {[FplBootstrap, FplFixture[]]} */ (await Promise.all([get("bootstrap-static"), get("fixtures")]));
const gw = boot.events.find((e) => e.is_current) ?? boot.events.filter((e) => e.finished).at(-1);
if (!gw) throw new Error("the FPL season has no current or finished gameweek yet");
const teamById = new Map(boot.teams.map((t) => [t.id, t]));
/** @param {number} id */
const team = (id) => { const t = teamById.get(id); if (!t) throw new Error(`unknown FPL team ${id}`); return t; };
const num = Number;

const players = boot.elements
  .filter((e) => e.minutes >= MIN_MINUTES)
  .map((e) => ({
    n: e.web_name,
    t: team(e.team).short_name,
    p: POS[e.element_type],
    c: e.now_cost / 10,
    pts: e.total_points,
    m: e.minutes,
    gi: e.goals_scored + e.assists,
    xgi: +num(e.expected_goal_involvements).toFixed(2),
    f: num(e.form),
    own: num(e.selected_by_percent),
  }));

const teams = boot.teams.map((t) => {
  const roster = boot.elements.filter((e) => e.team === t.id);
  const played = fixtures.filter((f) => f.finished_provisional && (f.team_h === t.id || f.team_a === t.id));
  let gf = 0, ga = 0;
  for (const f of played) {
    const home = f.team_h === t.id;
    gf += home ? f.team_h_score : f.team_a_score;
    ga += home ? f.team_a_score : f.team_h_score;
  }
  return {
    s: t.short_name,
    name: t.name,
    gf,
    ga,
    xgf: +roster.reduce((sum, e) => sum + num(e.expected_goals), 0).toFixed(1),
    // A regular starter's expected_goals_conceded is the team's while he is on the pitch.
    xga: +Math.max(...roster.map((e) => num(e.expected_goals_conceded))).toFixed(1),
  };
});

const HORIZON = 5;
const horizon = boot.teams.map((t) => ({
  s: t.short_name,
  d: Array.from({ length: HORIZON }, (_, k) => {
    const round = gw.id + 1 + k;
    return fixtures
      .filter((f) => f.event === round && (f.team_h === t.id || f.team_a === t.id))
      .map((f) => {
        const home = f.team_h === t.id;
        return { o: team(home ? f.team_a : f.team_h).short_name, h: home, r: home ? f.team_h_difficulty : f.team_a_difficulty };
      });
  }),
}));

const dataset = {
  fetched: new Date().toISOString().slice(0, 10),
  gameweek: gw.id,
  season: "2026/27",
  managers: boot.total_players,
  source: `${API}/bootstrap-static/ and ${API}/fixtures/`,
  min_minutes: MIN_MINUTES,
  players,
  teams,
  horizon: { first: gw.id + 1, rows: horizon },
};
writeFileSync(out, JSON.stringify(dataset));
console.log(`wrote ${out}: ${players.length} players, ${teams.length} teams, GW${gw.id}`);
