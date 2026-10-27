import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS,
  judogiCheck, judogiFrame, judogiHeightCm, renderJudogi,
} from "../src/judogi.ts";
import { beltFace, beltPaint } from "../src/judogiBelt.ts";
import { jacketDesc } from "../src/judogiJacket.ts";
import { strapCells, strapFace, strapWidth } from "../src/judogiStrap.ts";
import { placeCell, type VolumeDesc } from "../src/volume.ts";
import { pantsDesc } from "../src/judogiPants.ts";
import { wellFormed } from "./helpers.ts";

test("lists are generic and the Japanese belt names stay short", () => {
  assert.deepEqual([...JUDOGI_COLOURS], ["white", "blue"]);
  assert.ok(JUDOGI_MODES.includes("pieces") && JUDOGI_MODES.includes("suit"));
  assert.ok(JUDOGI_VIEWS.includes("flat"));
  assert.ok(JUDOGI_SIZES.includes("170") && JUDOGI_SIZES.includes("3"));
  assert.equal(judogiHeightCm("3"), 170);
  assert.equal(judogiHeightCm("190"), 190);
  for (const belt of JUDOGI_BELTS) {
    if (belt === "none") continue;
    const { en, ja } = JUDOGI_BELT_LABELS[belt];
    assert.ok(en.length >= 3 && en.length <= 12, en);
    assert.ok([...ja].length >= 1 && [...ja].length <= 4, ja);
  }
  assert.ok(!JSON.stringify(JUDOGI_COLOURS).includes("adidas"));
});

test("every colour, mode and view draws well-formed SVG with a yearless title", () => {
  for (const colour of JUDOGI_COLOURS) {
    for (const mode of JUDOGI_MODES) {
      for (const view of JUDOGI_VIEWS) {
        const svg = renderJudogi({ colour, mode, view, belt: "black", size: "170", language: "en" });
        const err = wellFormed(svg);
        assert.equal(err, null, `${colour} ${mode} ${view}: ${err}`);
        assert.match(svg, /^<svg /);
        assert.match(svg, /role="img"/);
        assert.ok(!svg.includes("IJF") && !svg.includes("OFFICIAL"));
      }
    }
  }
});

test("Japanese titles sit on the drawing, and the clock is not read", () => {
  const a = renderJudogi({ colour: "blue", mode: "suit", belt: "white", language: "ja", size: "180" });
  const b = renderJudogi({ colour: "blue", mode: "suit", belt: "white", language: "ja", size: "180" });
  assert.equal(a, b);
  assert.ok(a.includes("柔道着") && a.includes("着用"));
});

test("the IJF size check passes every named size and cites the rules", () => {
  for (const size of JUDOGI_SIZES) {
    const check = judogiCheck({ size });
    assert.equal(check.ok, true, size);
    assert.ok(check.notes.length >= 6);
    assert.ok(check.notes.every((n) => n.fact.includes("IJF")));
  }
});

test("a turning frame is the jersey volume pipeline: each piece turns on its own, and the flat view does not", () => {
  const front = renderJudogi({ mode: "jacket", colour: "white", view: "front" });
  const edge = judogiFrame({ mode: "jacket", colour: "white", yaw: 90 });
  const back = judogiFrame({ mode: "jacket", colour: "white", view: "back" });
  const pieces = renderJudogi({ mode: "pieces" });
  const flat = renderJudogi({ mode: "pieces", view: "flat" });
  for (const svg of [front, edge, back, pieces, flat]) assert.equal(wellFormed(svg), null);
  assert.ok(edge.includes('data-yaw="90"'));
  assert.notEqual(front, edge);
  assert.notEqual(front, back);
  // Jacket, belt and trousers are three pieces, each with its description to turn it in place, and both faces of each marked with the box a page paints it in.
  assert.equal(pieces.match(/data-piece="/g)?.length, 3);
  assert.equal(pieces.match(/data-face="/g)?.length, 6);
  assert.ok(!flat.includes("data-piece=") && !flat.includes('data-vol="'));
});

test("the trousers' legs are two tubes, hanging from a hip that parts into them", () => {
  const d = pantsDesc(1);
  assert.equal(d.sl.length, 2);
  assert.equal(d.hang, true);
  assert.equal(d.lobes?.[0], 0);
  assert.equal(d.lobes?.[d.lobes.length - 1], 1);
  // Each leg starts at the hip's last row, a little under it, and as wide as half of it.
  const bottom = d.y[d.y.length - 1] as number;
  for (const leg of d.sl) {
    const [sx, sy, , , ax, ay] = leg.q as [number, number, number, number, number, number];
    assert.ok(sy <= bottom && ay <= bottom && sy > bottom - 6, "a leg starts just under the hip");
    assert.ok(Math.abs(Math.abs(sx - ax) - ((d.a[d.a.length - 1] as number) - 1.2)) < 2, "a leg is half the hip wide");
  }
  // The sleeves of the jacket hang beside the body, not from it.
  const j = jacketDesc(1);
  assert.equal(j.sl.length, 2);
  assert.equal(j.hang, undefined);
});

test("a piece is shaded smoothly in opaque greys that multiply, never in half-transparent black", () => {
  const svg = judogiFrame({ mode: "jacket", yaw: 30 });
  assert.ok(svg.includes("mix-blend-mode:multiply"));
  assert.ok(svg.includes("<linearGradient") && svg.includes('stop-color="#'));
  // The jersey's shade, half-transparent black, would draw the grid as lines on white cloth.
  assert.ok(!/fill="#000" fill-opacity/.test(svg));
});

test("a belt is a solid strap: two turns 5 mm thick, a knot that stands off them, and ends with a back and two edges", () => {
  const alone = judogiFrame({ mode: "belt", belt: "black" });
  const worn = judogiFrame({ mode: "jacket", belt: "black" });
  assert.equal(wellFormed(alone), null);
  assert.equal(wellFormed(worn), null);
  const descOf = (svg: string): VolumeDesc[] => [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc);
  const ring = descOf(alone)[0]?.strap;
  const tied = descOf(worn).find((d) => d.strap !== undefined)?.strap;
  assert.ok(ring !== undefined && tied !== undefined);
  // IJF: 4-5 mm; a black belt 4.5-5 cm wide, a rank belt 4 cm (2.63 units to the centimetre).
  assert.ok(ring.t / 2.63 >= 0.4 && ring.t / 2.63 <= 0.5);
  assert.ok(ring.w / 2.63 >= 4.5 && ring.w / 2.63 <= 5);
  assert.ok(strapWidth("green") / 2.63 >= 3.9 && strapWidth("green") / 2.63 <= 4.1);
  const cells = strapCells(ring);
  // Seen from the front, the far half of a ring on its own shows its inside; worn, the jacket fills it and there is no inside.
  const inside = cells.filter((c) => c.n[2] > 0.5 && c.p[2]! < 0 && c.p[5]! < 0 && c.p[8]! < 0);
  assert.ok(inside.length > 0 && inside.every((c) => placeCell(c, 0, 14).visible));
  assert.equal(strapCells(tied).filter((c) => c.n[2] > 0.5 && c.p[2]! < 0).length, 0);
  // Turned side on, the hanging ends still show: their edges face the viewer, a strap's thickness wide.
  const sideOn = cells.filter((c) => Math.abs(c.n[0]) > 0.9 && c.p[1]! > ring.y + 30 && placeCell(c, 90, 14).visible);
  assert.ok(sideOn.length > 0);
  // The worn turns' edges behind the jacket stay hidden from the front.
  assert.ok(strapCells(tied).filter((c) => c.also !== undefined && c.p[2]! < -5).every((c) => !placeCell(c, 0, 8).visible));
  // The jacket under it carries only the belt's shadow, not a drawing of it.
  assert.ok(worn.match(/data-piece="/g)?.length === 2);
});

test("a kohaku belt's panels run along the strap, on its ends as on its turns", () => {
  const p = beltPaint("u", "red-white");
  assert.ok(p !== undefined);
  // The strap's face is one straight length of belt, its panels a pattern along it.
  const face = strapFace(p, 12.5);
  assert.ok(face.body.includes(`fill="${p.fill}"`));
  // Down a hanging end, the strip's length runs with the end: a front cell's drawing goes along x as the end goes down.
  const ends = strapCells({ y: 28, sag: 3, w: 12.5, t: 1.3, a: 66, b: 30, full: 2, side: 0, worn: false }).filter((c) => c.p[1]! > 60 && c.n[2] > 0.9 && c.tex[1] === 0 && c.tex[3] === 0);
  assert.ok(ends.length > 0);
  for (const c of ends) {
    const down = Math.abs(c.p[4]! - c.p[1]!);
    const along = Math.abs(c.tex[2]! - c.tex[0]!);
    assert.ok(down > 3 && Math.abs(along - Math.hypot(c.p[3]! - c.p[0]!, c.p[4]! - c.p[1]!)) < 1.5);
  }
  // Laid flat, each hanging end is drawn along its own length and turned into place.
  assert.equal(beltFace(p, "front").body.match(/rotate\(/g)?.length, 2);
});
