// A woven label's thickness (2 to 4 mm, 3 by default) and its sewn-on edge, at the turns the patch tests cover (see judogiPatchBuild.test.ts).

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { LABEL_MM, labelMm, readLabel } from "../src/judogiLabel.ts";

test("a label is 2 to 4 mm thick, 3 mm by default, and a thickness outside the range is brought to it", () => {
  assert.deepEqual(LABEL_MM, { min: 2, max: 4, default: 3 });
  assert.equal(labelMm(undefined), 3);
  assert.equal(labelMm(1), 2);
  assert.equal(labelMm(9), 4);
  assert.equal(labelMm(2.5), 2.5);
  assert.equal(readLabel(true)?.mm, 3);
  assert.equal(readLabel({ thicknessMm: 2 })?.mm, 2);
  assert.equal(readLabel({ thicknessMm: 12 })?.mm, 4);
});

test("the approval label, the neck label and the belt's label are drawn thick with a sewn edge, at the turns the patch tests cover", () => {
  for (const yaw of [0, 30, 70, 150]) {
    const svg = judogiFrame({ mode: "pieces", yaw, label: true, branding: true });
    assert.ok(svg.includes('data-thick="3.0"'), `the label's edge at yaw ${yaw}`);
    assert.ok(svg.includes('data-edge="running"'), `the label's stitched edge at yaw ${yaw}`);
  }
  const thin = renderJudogi({ mode: "jacket", view: "front", belt: "black", label: { thicknessMm: 2 } });
  assert.ok(thin.includes('data-thick="2.0"') && !thin.includes('data-thick="3.0"'));
  const thick = renderJudogi({ mode: "jacket", view: "front", belt: "black", label: { thicknessMm: 4 } });
  assert.ok(thick.includes('data-thick="4.0"'));
});

test("a belt's end tags stay flat: only the belt's approval label is thick", () => {
  const tags = renderJudogi({ mode: "belt", view: "flat", belt: "black", beltTags: true });
  assert.ok(tags.includes("<g") && !tags.includes("data-thick"));
  const label = renderJudogi({ mode: "belt", view: "flat", belt: "black", label: true });
  assert.ok(label.includes('data-thick="3.0"') && label.includes('data-edge="running"'));
});
