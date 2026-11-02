import assert from "node:assert/strict";
import { test } from "node:test";

import { canvasPixels, faceScaleFor, MAX_PIXELS, MAX_SIDE, pixelRatioFor } from "../src/pixels.ts";

test("a canvas is held to 4096 pixels a side and 6 million, whatever the box and the ratio asked for", () => {
  for (const [w, h, r] of [[5120, 2880, 4], [2560, 1440, 2], [9000, 700, 3], [300, 400, 4], [1, 1, 100], [100000, 100000, 2], [654, 1076, 2]] as const) {
    const ratio = pixelRatioFor(w, h, r);
    const size = canvasPixels(w, h, ratio);
    assert.ok(size.width * size.height <= MAX_PIXELS, `${w}x${h}@${r}: ${size.width}x${size.height}`);
    assert.ok(Math.max(size.width, size.height) <= MAX_SIDE, `${w}x${h}@${r}: ${size.width}x${size.height}`);
    assert.ok(size.width >= 1 && size.height >= 1);
  }
});

test("a small view is drawn at the screen's own ratio up to 2, and nonsense is 1", () => {
  assert.equal(pixelRatioFor(400, 500, 2), 2);
  assert.equal(pixelRatioFor(400, 500, 3), 2);
  assert.equal(pixelRatioFor(400, 500, 1), 1);
  for (const bad of [0, -1, Number.NaN, Infinity]) assert.equal(pixelRatioFor(400, 500, bad), 1);
});

test("the faces' pictures are held to 4096 across and 24 million together", () => {
  assert.equal(faceScaleFor(4, 3), 4);
  assert.ok(faceScaleFor(8, 1) * 560 <= 4096);
  for (const pieces of [1, 2, 4, 6]) {
    const k = faceScaleFor(8, pieces);
    assert.ok(pieces * 560 * 320 * k * k <= 24_000_000 + 1, `${pieces} pieces at ${k}`);
    assert.ok(k >= 1);
  }
});
