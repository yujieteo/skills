#!/usr/bin/env node
// Usage: node embed-data.mjs <deck.html> <data.json>
// Replaces the contents of <script type="application/json" id="deck-data"> with compact JSON.
import { readFileSync, writeFileSync } from "node:fs";

const [deckPath, dataPath] = process.argv.slice(2);
if (!deckPath || !dataPath) {
  console.error("usage: embed-data.mjs <deck.html> <data.json>");
  process.exit(2);
}
const html = readFileSync(deckPath, "utf8");
const json = JSON.stringify(JSON.parse(readFileSync(dataPath, "utf8"))).replace(/</g, "\\u003c");
const pattern = /(<script type="application\/json" id="deck-data">)[\s\S]*?(<\/script>)/;
if (!pattern.test(html)) {
  console.error(`${deckPath}: no <script id="deck-data"> block`);
  process.exit(1);
}
writeFileSync(deckPath, html.replace(pattern, (_, open, close) => open + json + close));
console.log(`embedded ${json.length} bytes into ${deckPath}`);
