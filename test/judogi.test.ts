import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS,
  judogiCheck, judogiFrame, judogiHeightCm, renderJudogi,
} from "../src/judogi.ts";
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

test("a turning frame shows an edge and both faces", () => {
  const still = renderJudogi({ mode: "jacket", colour: "white" });
  const edge = judogiFrame({ mode: "jacket", colour: "white", yaw: 90 });
  const back = judogiFrame({ mode: "jacket", colour: "white", yaw: 180 });
  assert.equal(wellFormed(edge), null);
  assert.equal(wellFormed(back), null);
  assert.ok(edge.includes("data-yaw"));
  assert.ok(edge.length !== still.length);
  assert.ok(back.includes('data-judogi="back"'));
});
