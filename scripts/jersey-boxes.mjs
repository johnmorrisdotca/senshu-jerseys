// Prints the room each cut needs so that nothing is cut off: how far its ink goes past the drawing's 200 by 232 box, still and at every turn. It measures the finished SVG (every path with its stroke, run
// through its transforms and clips: test/svgbox.ts), over every sleeve the cut has, every look, the options that change the silhouette (raglan sleeves, cuffs, shoulder numbers) and a full sweep of yaw at
// thicknesses from 0 to 40, and prints, for each cut, the `reach` to put in src/cuts.ts: the room on each side of the 200 units, so that the box is `-reach 0 200 + 2 * reach 232`. `pnpm test` holds the numbers.
//
//   node scripts/jersey-boxes.mjs            the cuts that need room, and how much
//   node scripts/jersey-boxes.mjs --all      every cut, with how far its ink goes past the box
//   node scripts/jersey-boxes.mjs <cut>...   only these cuts
import process from "node:process";
import { inkBox } from "../test/svgbox.ts";
import { CUTS, CUT_IDS, JERSEY_WIDTH, renderJersey } from "../src/index.ts";
import { jerseyFrame } from "../src/turn-entry.ts";

const PAD = 0.5;
const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

const args = process.argv.slice(2);
const all = args.includes("--all");
const wanted = args.filter((a) => !a.startsWith("--"));
const cuts = CUT_IDS.filter((c) => wanted.length === 0 || wanted.includes(c));

/** Every drawing of a cut that has a different silhouette. */
const variants = (cut) => {
  const sleeves = Object.keys(CUTS[cut].sleeves);
  const out = [];
  for (const sleeve of sleeves.length === 0 ? ["none"] : sleeves) for (const raglan of sleeves.length === 0 ? [false] : [false, true]) for (const extra of [{}, { cuffs: [20, 1], sleeveStripes: 3, sleeveNumbers: true, number: 23, piping: true }]) out.push({ cut, sleeve, raglan, ...extra });
  return out;
};

const rows = [];
for (const cut of cuts) {
  let still = { x0: 0, x1: 0 };
  let turned = { x0: 0, x1: 0 };
  const grow = (b, ink) => {
    b.x0 = Math.max(b.x0, -ink.x0);
    b.x1 = Math.max(b.x1, ink.x1 - JERSEY_WIDTH);
  };
  for (const v of variants(cut)) {
    for (const look of ["cloth", "flat", "line"]) {
      for (const view of ["front", "back"]) {
        const o = { ...v, look, view };
        const s = inkBox(renderJersey(o));
        if (s !== undefined) grow(still, s);
        for (const thickness of [0, 14, 40]) for (const yaw of [...range(-180, 175, 5), ...range(-20, 20, 1)]) {
          const t = inkBox(jerseyFrame({ ...o, yaw, thickness }));
          if (t !== undefined) grow(turned, t);
        }
      }
    }
  }
  const need = (b) => Math.max(b.x0, b.x1);
  const reach = (n) => (n > 0 ? Math.ceil((n + PAD) * 10) / 10 : 0);
  rows.push({ cut, still: need(still), turned: need(turned), reach: reach(need(turned)) });
}
for (const r of rows) {
  if (!all && r.reach === 0) continue;
  console.log(`${r.cut.padEnd(11)} still past ${r.still.toFixed(2).padStart(6)}  turned past ${r.turned.toFixed(2).padStart(6)}  reach: ${r.reach}`);
}
