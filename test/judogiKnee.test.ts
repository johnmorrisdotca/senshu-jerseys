import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { pantsFace } from "../src/judogiPants.ts";
import { wellFormed } from "./helpers.ts";

const PANEL = `stroke-width="0.6" stroke-opacity="0.6"`;
const ink = { uid: "k", cloth: [250, 250, 250] as [number, number, number] };

test("the trousers' reinforced knee is drawn by default, and `knee: false` leaves it out", () => {
  const on = renderJudogi({ mode: "pants", view: "flat" });
  assert.equal(renderJudogi({ mode: "pants", view: "flat", knee: true }), on);
  assert.ok(on.includes(PANEL), "the panel's outline");
  const off = renderJudogi({ mode: "pants", view: "flat", knee: false });
  assert.ok(!off.includes(PANEL), "no panel outline");
  assert.ok(off.length < on.length, "less drawing");
  assert.equal(wellFormed(off), null);
});

test("`knee: false` changes only the front of the trousers, in every mode and turned", () => {
  assert.equal(renderJudogi({ mode: "pants", view: "flat-back", knee: false }).replace(/jg[0-9a-z]+/g, "ID"), renderJudogi({ mode: "pants", view: "flat-back" }).replace(/jg[0-9a-z]+/g, "ID"));
  for (const mode of ["suit", "pieces"] as const) {
    assert.ok(!renderJudogi({ mode, view: "flat", knee: false }).includes(PANEL), mode);
    assert.ok(renderJudogi({ mode, view: "flat" }).includes(PANEL), mode);
  }
  for (const yaw of [0, 40, 90]) {
    const svg = judogiFrame({ mode: "pants", yaw, knee: false });
    assert.equal(wellFormed(svg), null, `yaw ${yaw}`);
    assert.ok(svg.length < judogiFrame({ mode: "pants", yaw }).length, `yaw ${yaw}`);
  }
});

test("the two drawings do not share ids, and pantsFace takes the same choice", () => {
  const id = (s: string): string => /id="(jg[0-9a-z]+)/.exec(s)![1]!;
  assert.notEqual(id(renderJudogi({ mode: "pants", knee: false })), id(renderJudogi({ mode: "pants" })));
  assert.ok(pantsFace(ink, "front").body.includes(PANEL));
  assert.ok(!pantsFace(ink, "front", false, false).body.includes(PANEL));
  assert.equal(pantsFace(ink, "front", false, true).body, pantsFace(ink, "front").body);
});
