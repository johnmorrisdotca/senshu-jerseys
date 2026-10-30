import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { CORD_T, CORD_W } from "../src/judogiPants.ts";
import { wellFormed } from "./helpers.ts";

const YAWS = [0, 30, 60, 90];

test("the drawstring is flat braided cord: 1 cm wide and 3 to 5 mm thick at 2.63 units to the centimetre", () => {
  assert.equal(CORD_W / 2.63, 1, "1 cm across");
  const thickCm = CORD_T / 2.63;
  assert.ok(thickCm >= 0.3 && thickCm <= 0.5, `${thickCm.toFixed(2)} cm thick`);
});

test("the trousers draw the cord at its width, face on and turned, with the same thickness edge", () => {
  const cord = `stroke-width="${CORD_W.toFixed(2)}"`;
  const front = renderJudogi({ mode: "pants", colour: "white", view: "front" });
  assert.equal(wellFormed(front), null);
  assert.ok(front.includes(cord), "the cord's top face is 1 cm wide");
  assert.ok(front.includes(`translate(${(CORD_T * 0.5).toFixed(2)} ${(CORD_T * 0.9).toFixed(2)})`), "the thickness edge is offset under the cord");
  for (const yaw of YAWS) {
    const svg = judogiFrame({ mode: "pants", colour: "white", yaw });
    assert.equal(wellFormed(svg), null, `yaw ${yaw}`);
    assert.ok(svg.includes(cord), `the cord at yaw ${yaw}`);
    assert.ok(svg.includes(`data-yaw="${yaw}"`));
  }
});
