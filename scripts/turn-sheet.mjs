// Draws a sheet of the shirts whose sleeves reach past the body, at rest and at the angles where a turn cuts them off most, so that the clipping can be looked at: each drawing is an image of the size the
// SVG says, with a thin red frame round it, so whatever the view box cuts off is missing at the frame. Chromium draws it (Playwright is a dev dependency). Run it from a checkout, before and after a change,
// and compare the two:
//
//   node scripts/turn-sheet.mjs <out.png> [--scale=2]
import { writeFileSync } from "node:fs";
import process from "node:process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { inkBox } from "../test/svgbox.ts";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const out = args.find((a) => !a.startsWith("--")) ?? "turn-sheet.png";
const D = await import(pathToFileURL(join(process.cwd(), "src/index.ts")).href);
const T = await import(pathToFileURL(join(process.cwd(), "src/turn-entry.ts")).href);

const SIZE = 150;
const colors = ["#c8102e", "#f4f0e4", "#1b2a6b"];
const CUTS = ["football", "rugby", "soccer", "baseball", "handball"];
/** The sleeve of a cut whose drawing goes furthest past the body. */
const widest = (cut) => Object.keys(D.CUTS[cut].sleeves).sort((a, b) => reach(D.renderJersey({ cut, sleeve: b, look: "line" })) - reach(D.renderJersey({ cut, sleeve: a, look: "line" })))[0];
const reach = (svg) => {
  const ink = inkBox(svg);
  return Math.max(-ink.x0, ink.x1 - 200);
};
/** The pixels per unit are the same in every cell: 150 for the body's 200 units, so a wider box is a wider picture. */
const cell = (svg, caption) => `<figure><img src="data:image/svg+xml;utf8,${encodeURIComponent(svg)}"><figcaption>${caption}</figcaption></figure>`;
let html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font:11px system-ui;color:#222}h2{font-size:13px;margin:10px 12px 2px}.row{display:flex;gap:10px;margin:4px 12px;align-items:flex-start}.name{width:90px;padding-top:70px}figure{margin:0}img{outline:1px dashed #b33;outline-offset:0;background:#fff}figcaption{text-align:center;color:#666}</style>`;
html += `<h2>Each cut at rest in its default sleeve and its widest, and turned a few degrees (where the cloth's edge pushes a sleeve out most), in cloth and in line. The red dashes are the edge of the drawing.</h2>`;
for (const cut of CUTS) {
  const wide = widest(cut);
  const base = { cut, colors, number: 23, name: "Morris", size: SIZE };
  html += `<div class="row"><div class="name">${cut}<br>${D.CUTS[cut].sleeve} / ${wide}</div>`;
  html += cell(D.renderJersey({ ...base, look: "line" }), `still, ${D.CUTS[cut].sleeve}, line`);
  html += cell(D.renderJersey({ ...base, sleeve: wide, look: "line" }), `still, ${wide}, line`);
  html += cell(T.jerseyFrame({ ...base, sleeve: wide, yaw: -8, thickness: 14 }), `${wide}, yaw -8, thickness 14`);
  html += cell(T.jerseyFrame({ ...base, sleeve: wide, yaw: 8, thickness: 40 }), `${wide}, yaw 8, thickness 40`);
  html += cell(T.jerseyFrame({ ...base, sleeve: wide, yaw: -8, thickness: 40, look: "line" }), `${wide}, yaw -8, thickness 40, line`);
  html += `</div>`;
}
html += `<h2>Two views, a matchup and a whole uniform of the widest cut.</h2><div class="row">`;
html += cell(D.renderJersey({ cut: "football", colors, number: 23, sleeve: "elbow", view: "both", size: 110 }), "football, both views");
html += cell(D.kitMatchup({ away: { cut: "football", colors: ["#ffffff", "#1b2a6b"], sleeve: "elbow", label: "Japan", number: 7 }, home: { cut: "football", colors, sleeve: "elbow", label: "Canada", number: 9 }, view: "front", size: 420 }), "football matchup");
html += cell(D.renderJersey({ cut: "football", colors, sleeve: "elbow", kit: true, helmet: "#1b2a6b", size: 150 }), "football kit");
html += cell(D.renderJersey({ cut: "basketball", colors, kit: true, size: 150 }), "basketball kit");
html += `</div>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 5 * (SIZE + 60) + 240, height: 800 }, deviceScaleFactor: Number(flags.scale ?? 2) });
await page.setContent(html);
await page.waitForFunction(() => [...document.images].every((i) => i.complete));
writeFileSync(out, await page.screenshot({ fullPage: true }));
await browser.close();
console.log(out);
