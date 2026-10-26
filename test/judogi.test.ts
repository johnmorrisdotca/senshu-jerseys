import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS,
  judogiCheck, judogiFrame, judogiHeightCm, renderJudogi,
} from "../src/judogi.ts";
import { jacketDesc } from "../src/judogiJacket.ts";
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
  // Jacket and trousers are two pieces, each with its description to turn it in place, and both faces of each marked for judogiPrepare.
  assert.equal(pieces.match(/data-piece="/g)?.length, 2);
  assert.equal(pieces.match(/data-face="/g)?.length, 4);
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

test("a belt on its own keeps its shade on the belt, and casts its shadows only on a jacket", () => {
  const worn = judogiFrame({ mode: "jacket", belt: "black" });
  const alone = judogiFrame({ mode: "belt", belt: "black" });
  assert.equal(wellFormed(alone), null);
  // On its own the belt's shade is kept to the belt: one clip shape for the ring, one for the knot and one for each end.
  assert.equal(alone.match(/<clipPath id="[^"]*Fc">((?:<path d="[^"]*"\/>)+)<\/clipPath>/)?.[1]?.match(/<path/g)?.length, 4);
  assert.ok(worn.length > alone.length);
});
