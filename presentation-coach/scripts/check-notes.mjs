#!/usr/bin/env node
// Usage: node check-notes.mjs <deck.html> <notes.md>
// Checks a notes file against its deck: coverage, order, required fields, and the time budget.
import { readFileSync } from "node:fs";

const [deckPath, notesPath] = process.argv.slice(2);
if (!deckPath || !notesPath) {
  console.error("usage: check-notes.mjs <deck.html> <notes.md>");
  process.exit(2);
}
const deckIds = [...readFileSync(deckPath, "utf8").matchAll(/<section class="slide[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
const sections = [];
let lastKey = null;
for (const line of readFileSync(notesPath, "utf8").split("\n")) {
  const heading = line.match(/^##\s+(\S+)\s*$/);
  if (heading) {
    sections.push({ id: heading[1], fields: {}, words: 0 });
    lastKey = null;
    continue;
  }
  const current = sections.at(-1);
  if (!current) continue;
  current.words += line.split(/\s+/).filter(Boolean).length;
  const field = line.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
  if (field) {
    lastKey = field[1].trim().toLowerCase();
    current.fields[lastKey] = field[2].trim();
  } else if (lastKey && line.trim()) {
    current.fields[lastKey] = `${current.fields[lastKey]} ${line.trim().replace(/^[-*]\s+/, "")}`.trim();
  }
}

const problems = [];
const seconds = (text = "") => {
  const clock = text.match(/^(\d+):(\d{2})$/);
  return clock ? Number(clock[1]) * 60 + Number(clock[2]) : null;
};
const byId = new Map(sections.map((s) => [s.id, s]));
if (sections.length !== byId.size) problems.push("duplicate section ids");
for (const s of sections) if (s.id !== "deck" && !deckIds.includes(s.id)) problems.push(`${s.id}: no slide with this id`);
const order = sections.filter((s) => s.id !== "deck").map((s) => s.id);
if (order.join() !== deckIds.filter((id) => byId.has(id)).join()) problems.push("sections are not in deck order");

const deck = byId.get("deck");
if (!deck) problems.push("missing ## deck section");
else for (const key of ["takeaway", "audience", "total time", "if short on time"]) if (!deck.fields[key]) problems.push(`deck: missing **${key}**`);

let total = 0;
deckIds.forEach((id, k) => {
  const s = byId.get(id);
  if (!s) return problems.push(`${id}: no notes section`);
  for (const key of ["time", "emphasise", "say"]) if (!s.fields[key]) problems.push(`${id}: missing **${key}**`);
  if (k < deckIds.length - 1 && !s.fields.transition) problems.push(`${id}: missing **transition**`);
  const t = seconds(s.fields.time);
  if (s.fields.time && t === null) problems.push(`${id}: time must look like m:ss, got "${s.fields.time}"`);
  total += t ?? 0;
  if (s.words > 220) problems.push(`${id}: ${s.words} words; notes should be glanceable (220 max)`);
});
const planned = seconds(deck?.fields["total time"]);
if (planned && Math.abs(total - planned) > planned * 0.1) problems.push(`slide times sum to ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}, not within 10% of total time ${deck.fields["total time"]}`);

if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log(`ok: ${deckIds.length} slides covered, ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")} planned`);
