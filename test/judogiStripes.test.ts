import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { BELT_PRESETS, STRIPE_COLOURS, beltPreset, stripeHex } from "../src/judogiStripes.ts";
import { bandsOf, endMark, readStyle } from "../src/judogiStripes.ts";
import { wellFormed } from "./helpers.ts";

const rects = (svg: string): number => svg.match(/<rect /g)?.length ?? 0;

test("a belt with no style is drawn as it always was, and a style that names no colour comes to nothing", () => {
  assert.equal(readStyle(undefined), undefined);
  assert.equal(readStyle({}), undefined);
  assert.equal(readStyle({ split: "not-a-colour", along: [{ colour: "#12" }], bars: [{ colour: 5 as unknown as string }] }), undefined);
  assert.equal(renderJudogi({ mode: "belt", belt: "green" }), renderJudogi({ mode: "belt", belt: "green", beltStyle: {} }));
  assert.notEqual(renderJudogi({ mode: "belt", belt: "green" }), renderJudogi({ mode: "belt", belt: "green", beltStyle: { split: "blue" } }));
});

test("colours are belt colours, the extra names or a hex colour", () => {
  for (const c of STRIPE_COLOURS) assert.match(stripeHex(c) ?? "", /^#[0-9a-f]{6}$/);
  assert.equal(stripeHex("#AABBCC"), "#aabbcc");
  assert.equal(stripeHex("red-white"), undefined);
  assert.equal(stripeHex(undefined), undefined);
});

test("stripes along the belt lie in the width: a split is the lower half, a centre stripe is in the middle, edges are two", () => {
  const split = bandsOf(readStyle({ split: "orange" }));
  assert.deepEqual(split.map((b) => [b.from, b.to]), [[0.5, 1]]);
  const centre = bandsOf(readStyle({ along: [{ colour: "white" }] }));
  assert.equal(centre.length, 1);
  const c = centre[0]!;
  assert.ok(Math.abs((c.from + c.to) / 2 - 0.5) < 1e-9 && c.to - c.from > 0.1 && c.to - c.from < 0.3);
  const edges = bandsOf(readStyle({ along: [{ colour: "black", at: "edges", widthCm: 0.5 }] }));
  assert.equal(edges.length, 2);
  assert.ok(edges[0]!.from === 0 && edges[1]!.to === 1);
  // A stripe asked for past the edge is kept inside the belt; the split comes first, so a stripe lies over it.
  const wide = bandsOf(readStyle({ split: "blue", along: [{ colour: "white", at: 1, widthCm: 9 }] }));
  assert.ok(wide.every((b) => b.from >= 0 && b.to <= 1));
  assert.equal(wide[0]!.fill, stripeHex("blue"));
});

test("bars, tags and tips are drawn across the end they are asked for, and counted", () => {
  const three = readStyle({ bars: [{ colour: "red", count: 3 }] });
  assert.equal(rects(endMark(three, 0, 5.5)), 3);
  assert.equal(rects(endMark(three, 1, 5.5)), 3);
  const left = readStyle({ bars: [{ colour: "red", count: 2, ends: "left" }] });
  assert.equal(rects(endMark(left, 0, 5.5)), 2);
  assert.equal(endMark(left, 1, 5.5), "");
  // A tip is one block, and its degrees are bars on it.
  const tip = readStyle({ tip: { colour: "black", lengthCm: 7, bars: { colour: "white", count: 4 } } });
  assert.equal(rects(endMark(tip, 0, 5.5)), 5);
  // More bars than the end can hold are cut, not drawn past the knot.
  const many = readStyle({ bars: [{ colour: "white", count: 6, widthCm: 3, gapCm: 3 }] });
  assert.ok(rects(endMark(many, 1, 5.5)) < 6);
  // Nothing but a style along the belt marks no end.
  assert.equal(endMark(readStyle({ split: "blue" }), 0, 5.5), "");
});

test("every preset is a real belt with colours that exist, and each draws a well-formed belt and jacket", () => {
  assert.ok(BELT_PRESETS.length >= 20);
  assert.equal(new Set(BELT_PRESETS.map((p) => p.id)).size, BELT_PRESETS.length, "ids are unique");
  for (const p of BELT_PRESETS) {
    assert.equal(beltPreset(p.id), p);
    assert.ok(p.source.length > 0 && p.system.length > 0 && p.label.length > 0);
    const read = readStyle(p.style);
    assert.ok(read !== undefined, `${p.id} has nothing to draw`);
    for (const mode of ["belt", "jacket"] as const) {
      const svg = judogiFrame({ mode, belt: p.belt, beltStyle: p.style, yaw: 25 });
      assert.equal(wellFormed(svg), null, p.id);
      assert.notEqual(svg, judogiFrame({ mode, belt: p.belt, yaw: 25 }), `${p.id} changes the drawing`);
    }
  }
  assert.equal(beltPreset("nope"), undefined);
});

test("the British Judo Mon grades are a coloured belt with one to three tags", () => {
  for (const mon of [4, 9, 18]) assert.ok(beltPreset(`mon-${mon}`) !== undefined);
  const nine = beltPreset("mon-9");
  assert.equal(nine?.belt, "orange");
  assert.equal(nine?.style.bars?.[0]?.count, 3);
  assert.equal(beltPreset("mon-12")?.belt, "green");
  assert.equal(beltPreset("mon-16")?.belt, "brown");
});

test("stripes are on the belt in every view: flat, worn, turned and alone, with and without embroidery", () => {
  const style = { split: "orange", bars: [{ colour: "red", count: 2 }] };
  for (const view of ["front", "back", "flat"] as const) {
    const svg = renderJudogi({ mode: "pieces", view, belt: "yellow", beltStyle: style, embroidery: [{ place: "belt-end-left", text: "JUDO", thread: "navy" }] });
    assert.equal(wellFormed(svg), null);
    assert.ok(svg.includes(stripeHex("orange") as string) || view === "back", view);
  }
  const turned = judogiFrame({ mode: "belt", belt: "blue", beltStyle: style, yaw: 70 });
  assert.equal(wellFormed(turned), null);
  assert.ok(turned.includes(stripeHex("red") as string));
});

test("the women's black belt has one white line down its whole length, on a black belt", () => {
  const p = beltPreset("womens-black-white-line");
  assert.equal(p?.belt, "black");
  const bands = bandsOf(readStyle(p?.style));
  assert.equal(bands.length, 1);
  assert.equal(bands[0]?.fill, stripeHex("white"));
  assert.ok(Math.abs((bands[0]!.from + bands[0]!.to) / 2 - 0.5) < 1e-9 && bands[0]!.to - bands[0]!.from > 0.2);
  // Along the whole belt, so no end carries a bar.
  assert.equal(endMark(readStyle(p?.style), 0, 5.5), "");
  assert.equal(endMark(readStyle(p?.style), 1, 5.5), "");
});
