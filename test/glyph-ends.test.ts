import assert from "node:assert/strict";
import { test } from "node:test";

import { WEIGHTS } from "../src/glyphs.ts";
import { drawRun, layout } from "../src/text.ts";
import { renderJersey } from "../src/index.ts";
import { pathPoints } from "./svgbox.ts";

const WEIGHT_IDS = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
// Flat-footed and flat-topped glyphs: the end of a stem or a bar is the edge of the letter's box, so a cut-off one shows.
const FLAT_FOOT = "BDEHIKLMNPRUXZ14";
const FLAT_TOP = "BDEFHIKMNPRTVWXYZ57";

test("a stroke is capped square, fill and outline alike, so a stem's end is the letter's edge and the outline closes round it", () => {
  for (const weight of WEIGHT_IDS) {
    const run = layout("MORRIS", 0, 0, { height: 120, weight });
    const svg = drawRun(run, "#fff", { colour: "#000", width: 3 }, "#888");
    const strokes = [...svg.matchAll(/<path [^>]*stroke-width/g)].map((m) => m[0]);
    assert.ok(strokes.length >= 3, `${weight}: outline, fill and stitch strokes`);
    for (const s of strokes) assert.match(s, /stroke-linecap="square"/, `${weight}: ${s.slice(0, 60)}`);
  }
});

test("no letter or digit is cut off: its ink reaches the box's foot and top, and never past it", () => {
  for (const weight of WEIGHT_IDS) {
    for (const c of LETTERS) {
      const run = layout(c, 0, 0, { height: 60, weight });
      const ys = pathPoints(run.d).map((p) => p[1]);
      const foot = Math.max(...ys) + run.sw / 2;
      const top = Math.min(...ys) - run.sw / 2;
      const box = run.height / 2;
      assert.ok(foot <= box + 0.05 && top >= -box - 0.05, `${weight} ${c}: ink ${top.toFixed(2)} to ${foot.toFixed(2)} inside ${box.toFixed(2)}`);
      if (FLAT_FOOT.includes(c)) assert.ok(Math.abs(foot - box) < 0.05, `${weight} ${c}: the foot is cut short by ${(box - foot).toFixed(2)}`);
      if (FLAT_TOP.includes(c)) assert.ok(Math.abs(top + box) < 0.05, `${weight} ${c}: the top is cut short by ${(top + box).toFixed(2)}`);
    }
  }
});

test("a letter's width is its box: a bar or a dash reaches both edges", () => {
  for (const c of "-HEFTL") {
    const run = layout(c, 0, 0, { height: 60, weight: "bold" });
    const xs = pathPoints(run.d).map((p) => p[0]);
    const half = run.width / 2;
    assert.ok(Math.min(...xs) - run.sw / 2 >= -half - 0.05 && Math.max(...xs) + run.sw / 2 <= half + 0.05, `${c} stays in its box`);
  }
  const dash = layout("-", 0, 0, { height: 60, weight: "bold" });
  const dx = pathPoints(dash.d).map((p) => p[0]);
  assert.ok(Math.abs(Math.max(...dx) + dash.sw / 2 - dash.width / 2) < 0.05, "the dash reaches the edge of its box");
});

test("the name on a jersey's back, flat, carries its square-capped outline for every letter", () => {
  for (const name of ["MORRIS", "Smith", "O'Brien", "ST-PIERRE", "NAKAMURA"]) {
    const svg = renderJersey({ cut: "hockey", colors: ["#c8102e", "#f4f0e4", "#1b2a6b"], number: 23, name, view: "back" });
    assert.doesNotMatch(svg, /stroke-linecap="butt"[^>]*stroke="#[0-9a-f]{6}" stroke-width="[\d.]+"\/><path d="M[^"]*" fill="none" stroke-linejoin="miter" stroke-miterlimit="2.5" stroke-linecap="butt"/, name);
    assert.doesNotMatch(svg, /stroke-miterlimit="2.5" stroke-linecap="butt"/, `${name}: a glyph stroke ends flat inside its letter`);
  }
});
