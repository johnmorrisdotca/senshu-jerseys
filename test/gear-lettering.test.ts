// The lettering on a cap or a helmet stays whole inside the outline it is sewn on, in every view: measured from the finished drawing, against the crown's or the shell's own outline.
import assert from "node:assert/strict";
import { test } from "node:test";

import { renderCap, renderHelmet, type CapOptions, type HelmetOptions } from "../src/index.ts";
import { contrast, readColour } from "../src/colour.ts";
import { colourOver, leastRoom, letterDiscs, letteringOf, outlineOf, panelOf } from "./lettering.ts";

// The crown's own outline is drawn 1.6 wide (0.8 inside it): a letter touching that line would still read as cut.
const MARGIN = 0.8;
const TEAMS = [["#c8102e", "#ffffff"], ["#0a2d8a", "#ffffff", "#c8102e"], ["#ffffff", "#c8102e"], ["#101010", "#f2c230"]];
const MARKS = ["C", "CA", "CAN", "CANA", "WWW", "MMM", "USA", "JPN", "日", "日本", "日本語"];

test("a cap's letters sit whole inside the crown, front and side, for one to four letters and for kanji", () => {
  let n = 0;
  for (const view of ["front", "side"] as const) {
    for (const tone of ["solid", "two-tone"] as const) {
      for (const colors of TEAMS) {
        for (const initials of MARKS) {
          const o: CapOptions = { colors, tone, initials, view };
          const svg = renderCap(o);
          assert.ok(letterDiscs(svg).length > 0, `${view} ${initials}: letters are drawn`);
          const room = leastRoom(svg, outlineOf(svg, "d"));
          assert.ok(room >= MARGIN, `${view} ${tone} ${initials}: the lettering has ${room.toFixed(1)} units to the crown's edge`);
          n++;
        }
      }
    }
  }
  assert.equal(n, 2 * 2 * TEAMS.length * MARKS.length);
});

test("on a two-tone cap's side view the letters sit on the front panel, clear of its seam and of its far edge", () => {
  for (const initials of MARKS) {
    const svg = renderCap({ view: "side", initials, tone: "two-tone", colors: ["#0a2d8a", "#ffffff", "#c8102e"] });
    const room = leastRoom(svg, panelOf(svg) ?? []);
    assert.ok(room >= MARGIN, `${initials}: ${room.toFixed(1)} units to the panel's edge`);
  }
});

test("a cap's lettering is the same in the line look, which has no fill to keep it in", () => {
  for (const view of ["front", "side"] as const) {
    for (const initials of MARKS) {
      const svg = renderCap({ view, initials, look: "line" });
      const room = leastRoom(svg, outlineOf(svg, "d"));
      assert.ok(room >= MARGIN, `${view} ${initials}: ${room.toFixed(1)}`);
    }
  }
});

test("a side view's lettering is turned away: narrower than the front's, on the front panel, to the right of the seam", () => {
  const span = (view: "front" | "side"): { w: number; x0: number } => {
    const xs = letterDiscs(renderCap({ initials: "USA", view })).map((d) => d.at[0]);
    return { w: Math.max(...xs) - Math.min(...xs), x0: Math.min(...xs) };
  };
  const front = span("front");
  const side = span("side");
  assert.ok(side.w < front.w * 0.8, `the side's ${side.w.toFixed(0)} against the front's ${front.w.toFixed(0)}`);
  assert.ok(side.x0 > 108, "on the front panel, past the seam");
});

test("a helmet's number and mark stay whole inside the shell, facing either way", () => {
  let n = 0;
  for (const kind of ["football", "hockey", "batting"] as const) {
    for (const facing of ["right", "left"] as const) {
      for (const number of [1, 4, 7, 12, 27, 88, 99]) {
        const o: HelmetOptions = { kind, facing, mark: "number", number };
        const svg = renderHelmet(o);
        assert.ok(letterDiscs(svg).length > 0, `${kind} ${facing} ${number}: the number is drawn`);
        const room = leastRoom(svg, outlineOf(svg, "s", facing === "left"));
        assert.ok(room >= MARGIN, `${kind} ${facing} ${number}: the number has ${room.toFixed(1)} units to the shell's edge`);
        n++;
      }
    }
  }
  assert.equal(n, 3 * 2 * 7);
});

test("every letter reads on each colour of the cap it sits over: its fill or its outline has 3 to 1 against it, front and side, solid and two-tone", () => {
  const rgb = (hex: string): [number, number, number] => readColour(hex) as [number, number, number];
  const hexes = new Set<string>();
  let crossed = 0;
  for (const view of ["front", "side"] as const) {
    for (const tone of ["solid", "two-tone"] as const) {
      for (const colors of [...TEAMS, ["#ffffff", "#c8102e", "#c8102e"], ["#0a2d8a", "#0a2d8a", "#ffffff"], ["#101010", "#101010", "#f2c230"], ["#f2c230", "#101010", "#101010"], ["#2e7d32", "#2e7d32", "#ffffff"], ["#0a2d8a", "#ffffff", "#c8102e"]]) {
        for (const initials of ["C", "CA", "CAN", "USA", "JPN", "日本"]) {
          const svg = renderCap({ colors, tone, initials, view });
          const panel = tone === "two-tone" ? panelOf(svg) : undefined;
          const names = { crown: String(colors[0]), panel: tone === "two-tone" ? String(colors[2] ?? "#f4f0e4") : String(colors[0]) };
          const runs = letteringOf(svg);
          assert.ok(runs.length > 0, `${view} ${initials}: letters`);
          for (const run of runs) {
            const over = colourOver(run, outlineOf(svg, "d"), panel, names);
            if (over.size > 1) crossed++;
            for (const hex of over) {
              hexes.add(hex);
              const best = Math.max(contrast(rgb(run.fill), rgb(hex)), run.outline === undefined ? 0 : contrast(rgb(run.outline), rgb(hex)));
              assert.ok(best >= 3, `${view} ${tone} ${colors.join("/")} ${initials}: letters ${run.fill}${run.outline === undefined ? "" : ` outlined ${run.outline}`} read ${best.toFixed(1)} to 1 on ${hex}`);
            }
          }
        }
      }
    }
  }
  assert.ok(crossed > 20, `${crossed} runs lie over two colours`);
  assert.ok(hexes.size >= 6, "several colours are measured");
});
