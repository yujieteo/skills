#!/usr/bin/env node
// Usage: node check-deck.mjs <deck.html>
// Static checks for a deck built from assets/deck-shell.html. Layout checks need a browser: run Deck.audit().
import { readFileSync, statSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: check-deck.mjs <deck.html>");
  process.exit(2);
}
const html = readFileSync(path, "utf8");
const problems = [];

const slides = [...html.matchAll(/<section class="slide[^"]*" id="([^"]+)"([^>]*)>/g)];
if (slides.length < 2) problems.push("fewer than two <section class=\"slide\"> elements");
const ids = slides.map((m) => m[1]);
for (const id of new Set(ids.filter((id, k) => ids.indexOf(id) !== k))) problems.push(`duplicate slide id ${id}`);
for (const [, id, rest] of slides) if (!/data-title="[^"]+"/.test(rest)) problems.push(`${id}: missing data-title`);

if (/\{\{[A-Z_]+\}\}/.test(html)) problems.push("unreplaced {{PLACEHOLDER}} left in the file");
if (/<title>[^<]*Deck title/i.test(html) || /Replace this painter/.test(html)) problems.push("template example content still present");

const data = html.match(/<script type="application\/json" id="deck-data">([\s\S]*?)<\/script>/);
if (!data) problems.push('missing <script id="deck-data">');
else {
  try {
    if (!Object.keys(JSON.parse(data[1])).length) problems.push("deck-data is empty");
  } catch (error) {
    problems.push(`deck-data is not valid JSON: ${error.message}`);
  }
}

const external = html.match(/(?:src|href)="https?:\/\/[^"]*"|url\(\s*["']?https?:|@import|<link[^>]+stylesheet/g) ?? [];
const scriptSrc = html.match(/<script[^>]+src=/g) ?? [];
for (const hit of [...external.filter((h) => !/^href=/.test(h)), ...scriptSrc]) problems.push(`external or non-inline dependency: ${hit}`);
if (!/Deck\.boot\(\)/.test(html)) problems.push("Deck.boot() is never called");
if (!/Deck\.registerTools\(/.test(html)) problems.push("Deck.registerTools(...) is never called");
if (/<img[^>]+src="(?!data:)/.test(html)) problems.push("<img> with a non-inline src");

const bytes = statSync(path).size;
if (bytes > 1_000_000) problems.push(`file is ${(bytes / 1e6).toFixed(1)} MB; keep decks under 1 MB`);

if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log(`ok: ${slides.length} slides, ${(bytes / 1024).toFixed(0)} KB, no external dependencies`);
