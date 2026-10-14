// A contact sheet of a preset module, to look at while writing it: front and back, one card per preset, with its id under it.
//
//   node scripts/preset-sheet.mjs nhl-classic out.png [filter]      the module src/presets/nhl-classic.ts, to a PNG (a PNG outside the repository)
//
// The module exports an array of presets (named by its upper-case league: NHL_CLASSIC). `filter` keeps the ids that contain it.
import { writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const [name, out, filter] = process.argv.slice(2);
if (name === undefined || out === undefined) {
  console.error("usage: node scripts/preset-sheet.mjs <module> <out.png> [filter]");
  process.exit(1);
}
const root = fileURLToPath(new URL("..", import.meta.url));
const lib = await import(`${root}src/index.ts`);
const mod = await import(`${root}src/presets/${name}.ts`);
const list = Object.values(mod).flat().filter((p) => p && typeof p === "object" && "options" in p && (filter === undefined || p.id.includes(filter)));
let html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f4f1ea;font:11px system-ui;color:#20262d}.g{display:flex;flex-wrap:wrap;gap:10px;padding:10px}.c{width:230px;text-align:center}.c div{height:2.6em;overflow:hidden}</style><div class="g">`;
for (const p of list) html += `<div class="c">${lib.renderJersey({ ...p.options, view: "both", number: 9, size: 108 })}<div>${p.id}<br>${p.team}, ${p.years}</div></div>`;
html += "</div>";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 300 }, deviceScaleFactor: 1.5 });
await page.setContent(html);
writeFileSync(out, await page.screenshot({ fullPage: true }));
await browser.close();
console.log(`${list.length} presets drawn to ${out}`);
