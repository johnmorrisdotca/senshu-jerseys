// Overlap: the shirts of a lineup, a matchup's front and back, and the `both` view tucked under one another.
import assert from "node:assert/strict";
import { test } from "node:test";

import { CUT_IDS, jerseyLineup, kitMatchup, renderJersey } from "../src/index.ts";
import { DEFAULT_OVERLAP, MAX_OVERLAP, overlapOf } from "../src/overlap.ts";
import { wellFormed } from "./helpers.ts";
import { inkBox, viewBoxOf } from "./svgbox.ts";

const players = Array.from({ length: 5 }, (_, i) => ({ number: i + 1, name: `P${i + 1}` }));
const widthOf = (svg: string): number => {
  const b = viewBoxOf(svg);
  return b.x1 - b.x0;
};
const filters = (svg: string): number => (svg.match(/<filter /g) ?? []).length;
const filtered = (svg: string): number => (svg.match(/ filter="url\(#[^)]+\)"/g) ?? []).length;

test("overlap is a fraction from 0 to 0.4; anything else is read safely", () => {
  assert.equal(MAX_OVERLAP, 0.4);
  assert.equal(overlapOf(0.25), 0.25);
  assert.equal(overlapOf(9), 0.4);
  assert.equal(overlapOf(-1), 0);
  assert.equal(overlapOf(Number.NaN), 0);
  assert.equal(overlapOf("0.3"), 0);
  assert.equal(overlapOf(undefined, DEFAULT_OVERLAP), DEFAULT_OVERLAP);
  assert.equal(overlapOf(Infinity, DEFAULT_OVERLAP), DEFAULT_OVERLAP);
});

test("a lineup with no overlap is spaced as it was; each step of overlap closes the row by that part of a shirt's width", () => {
  const rows = { rows: [5] };
  assert.equal(widthOf(jerseyLineup(players, { ...rows, overlap: 0 })), 5 * 84 + 20);
  // A shirt is 200 units drawn at 0.34: 68 units wide, so 0.25 is 17 units closer, four times over.
  assert.equal(widthOf(jerseyLineup(players, { ...rows, overlap: 0.25 })), 4 * (84 - 17) + 84 + 20);
  assert.ok(widthOf(jerseyLineup(players, { ...rows, overlap: 0.4 })) < widthOf(jerseyLineup(players, { ...rows, overlap: 0.15 })));
  assert.equal(jerseyLineup(players, rows), jerseyLineup(players, { ...rows, overlap: DEFAULT_OVERLAP }));
  assert.equal(jerseyLineup(players, { ...rows, overlap: 5 }), jerseyLineup(players, { ...rows, overlap: 0.4 }));
  assert.equal(jerseyLineup(players, { ...rows, overlap: -3 }), jerseyLineup(players, { ...rows, overlap: 0 }));
});

test("overlapping shirts cast a shadow, each but the first of a row, and with no overlap there is none", () => {
  const none = jerseyLineup(players, { rows: [5], overlap: 0 });
  assert.equal(filters(none), 0);
  assert.equal(filtered(none), 0);
  const some = jerseyLineup(players, { rows: [2, 3], overlap: 0.2 });
  assert.equal(filters(some), 1);
  assert.equal(filtered(some), 3);
  const id = /<filter id="([^"]+)"/.exec(some)?.[1] as string;
  assert.ok(some.includes(`url(#${id})`));
  assert.equal(wellFormed(some), null);
  assert.doesNotMatch(some, /NaN|undefined|Infinity/);
});

test("a shirt is drawn after the one on its left, so its body covers the last one's sleeve", () => {
  const svg = jerseyLineup([{ number: 11 }, { number: 22 }], { rows: [2], overlap: 0.3, labels: "none" });
  const first = svg.indexOf("translate(");
  const second = svg.indexOf("translate(", first + 1);
  assert.ok(first >= 0 && second > first);
  // The second group carries the filter and the first does not.
  assert.doesNotMatch(svg.slice(first, svg.indexOf(">", first)), /filter=/);
  assert.match(svg.slice(second, svg.indexOf(">", second)), /filter="url\(#/);
});

test("a matchup tucks each side's back under its front in the both view only", () => {
  const away = { cut: "soccer", colors: ["#fff", "#1b2a6b"], label: "Gulls" } as const;
  const home = { cut: "soccer", colors: ["#c8102e", "#fff"], label: "Bison" } as const;
  const both = (overlap?: number) => kitMatchup({ away, home, view: "both", overlap });
  assert.ok(widthOf(both(0.25)) < widthOf(both(0)));
  assert.equal(both(), both(DEFAULT_OVERLAP));
  assert.equal(filters(both(0)), 0);
  assert.equal(filters(both(0.25)), 1);
  assert.equal(filtered(both(0.25)), 2);
  // One shirt a side has nothing to tuck under.
  for (const view of ["front", "back"] as const) {
    assert.equal(kitMatchup({ away, home, view, overlap: 0.3 }), kitMatchup({ away, home, view, overlap: 0 }));
    assert.equal(kitMatchup({ away, home, view }), kitMatchup({ away, home, view, overlap: 0 }));
  }
  assert.equal(wellFormed(both(0.4)), null);
});

test("the both view of a jersey keeps its side by side drawing unless asked, then tucks the back under the front", () => {
  for (const cut of CUT_IDS) {
    const plain = renderJersey({ cut, view: "both", number: 9 });
    assert.equal(plain, renderJersey({ cut, view: "both", number: 9, overlap: 0 }));
    assert.equal(filters(plain), 0);
    const tucked = renderJersey({ cut, view: "both", number: 9, overlap: 0.25 });
    assert.equal(widthOf(plain) - widthOf(tucked), 0.25 * 200, cut);
    assert.equal(filters(tucked), 1);
    assert.equal(filtered(tucked), 1);
    assert.equal(wellFormed(tucked), null);
    // A single view has nothing to tuck.
    assert.equal(renderJersey({ cut, view: "front", overlap: 0.3 }), renderJersey({ cut, view: "front" }));
  }
});

test("tucked drawings of every cut stay inside their box, at the most overlap", () => {
  for (const cut of CUT_IDS) {
    const docs = [
      jerseyLineup(players, { rows: [2, 3], jersey: { cut }, overlap: MAX_OVERLAP }),
      kitMatchup({ away: { cut }, home: { cut }, view: "both", overlap: MAX_OVERLAP }),
      renderJersey({ cut, view: "both", number: 23, name: "Morris", overlap: MAX_OVERLAP }),
    ];
    for (const svg of docs) {
      const view = viewBoxOf(svg);
      const ink = inkBox(svg);
      assert.ok(ink !== undefined, cut);
      const past = Math.max(0, view.x0 - ink.x0, view.y0 - ink.y0, ink.x1 - view.x1, ink.y1 - view.y1);
      assert.ok(past <= 0.1, `${cut} goes ${past} past its box`);
    }
  }
});
