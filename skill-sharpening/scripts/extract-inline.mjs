#!/usr/bin/env node
// Copies each page's own inline <script> blocks into .typecheck/inline/ (gitignored) so tsc can check them: one
// file per page, its blocks in order, so later blocks see earlier declarations as they do in the page. Each file is
// a module, so one page's top-level names never meet another's. Run by `npm run typecheck`.
// Usage: node skill-sharpening/scripts/extract-inline.mjs <page.html> ...
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { INLINE_DIR, inlineFile } from "./typecheck.mjs";

const pages = process.argv.slice(2);
if (!pages.length) throw new Error("usage: node skill-sharpening/scripts/extract-inline.mjs <page.html> ...");
const out = new URL(`../../${INLINE_DIR}`, import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const parts = ["export {}; // extracted for type checking only"];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    // Only classic and module scripts with inline code; data blocks (application/json) and src= scripts are not code here.
    if (/\bsrc=/.test(attrs) || /\btype="(?!text\/javascript|module)/.test(attrs)) continue;
    const line = html.slice(0, (m.index ?? 0) + m[0].indexOf(">") + 1).split("\n").length;
    parts.push(`// ${page}:${line}, <script${attrs}>`, m[2]);
  }
  writeFileSync(new URL(`../../${inlineFile(page)}`, import.meta.url), parts.join("\n"));
}
console.log(`extracted the inline scripts of ${pages.length} pages into .typecheck/inline/`);
