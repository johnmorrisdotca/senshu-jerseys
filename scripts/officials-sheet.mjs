// A contact sheet of the officials' presets, to look at while changing them: front and back, one card per preset, with a made-up name and number on the back and its id under it.
//
//   node scripts/officials-sheet.mjs out.png [filter] [size]   a PNG outside the repository; `filter` keeps the ids that contain it
import { writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const [out, filter, size = "150"] = process.argv.slice(2);
if (out === undefined) {
  console.error("usage: node scripts/officials-sheet.mjs <out.png> [filter] [size]");
  process.exit(1);
}
const root = fileURLToPath(new URL("..", import.meta.url));
const lib = await import(`${root}src/index.ts`);
const { OFFICIALS } = await import(`${root}src/presets/officials.ts`);
const NAMES = ["Beaumont", "Okafor", "Lindqvist", "Tanaka", "Marchetti", "Hollis", "Duval", "Reyes"];
const list = OFFICIALS.filter((p) => filter === undefined || filter === "" || p.id.includes(filter));
let html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#f4f1ea;font:11px system-ui;color:#20262d}.g{display:flex;flex-wrap:wrap;gap:10px;padding:10px}.c{width:${Number(size) * 2 + 24}px;text-align:center}.c div{height:2.6em;overflow:hidden}</style><div class="g">`;
list.forEach((p, i) => {
  html += `<div class="c">${lib.renderJersey({ ...p.options, view: "both", number: 10 + ((i * 7) % 80), name: NAMES[i % NAMES.length], size: Number(size) })}<div>${p.id}<br>${p.team}, ${p.years}</div></div>`;
});
html += "</div>";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 300 }, deviceScaleFactor: 1.5 });
await page.setContent(html);
writeFileSync(out, await page.screenshot({ fullPage: true }));
await browser.close();
console.log(`${list.length} presets drawn to ${out}`);
