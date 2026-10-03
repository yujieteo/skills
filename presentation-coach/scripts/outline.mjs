#!/usr/bin/env node
// Usage: node outline.mjs <deck.html> [--json]
// Lists each slide of a generate-slide-deck deck: id, title, headline, static text, reveal steps.
// Chart labels are drawn by JavaScript and are not in the static text; read rendered text in a browser.
import { readFileSync } from "node:fs";

const [path, flag] = process.argv.slice(2);
if (!path) {
  console.error("usage: outline.mjs <deck.html> [--json]");
  process.exit(2);
}
const html = readFileSync(path, "utf8");
const strip = (/** @type {string} */ fragment) =>
  fragment
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const slides = [...html.matchAll(/<section class="slide[^"]*" id="([^"]+)"([^>]*)>([\s\S]*?)<\/section>/g)].map(([, id, attrs, body], index) => ({
  n: index + 1,
  id,
  title: (attrs.match(/data-title="([^"]*)"/) ?? [])[1] ?? "",
  headline: strip((body.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/) ?? [])[1] ?? ""),
  steps: Math.max(0, ...[...body.matchAll(/data-step="(\d+)"/g)].map((m) => Number(m[1]))),
  charts: [...body.matchAll(/class="chart"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*class="chart"/g)].length,
  text: strip(body),
}));

if (flag === "--json") console.log(JSON.stringify(slides, null, 2));
else for (const s of slides) console.log(`${s.n}. ${s.id}${s.charts ? " [chart]" : ""}${s.steps ? ` [${s.steps} reveal steps]` : ""}\n   headline: ${s.headline}\n   text: ${s.text}\n`);
