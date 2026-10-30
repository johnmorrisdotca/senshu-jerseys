// A sewn patch's thickness (3 to 4 mm, 3.5 by default, John's spec of 2026-10-30) and its edge stitch (running or satin), at the turns the other judogi tests cover.

import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi, judogiFrame } from "../src/judogi.ts";
import { CM, PATCH_EDGES, PATCH_MM, cloth, patchMm, readPatch } from "../src/judogiPatch.ts";

const FLAG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="7" height="20" fill="#d52b1e"/><rect x="23" width="7" height="20" fill="#d52b1e"/></svg>`;

test("a sewn patch is 3 to 4 mm thick, 3.5 mm by default, and a thickness outside the spec is brought to it", () => {
  assert.deepEqual(PATCH_MM, { min: 3, max: 4, default: 3.5 });
  assert.deepEqual(PATCH_EDGES, ["running", "satin"]);
  assert.equal(patchMm(undefined), 3.5);
  assert.equal(patchMm(2), 3);
  assert.equal(patchMm(9), 4);
  assert.equal(patchMm(3.25), 3.25);
  assert.equal(readPatch({ style: "ijf" })?.mm, 3.5);
  assert.equal(readPatch({ style: "zekken", thicknessMm: 4 })?.mm, 4);
  assert.equal(readPatch({ style: "ijf", thicknessMm: 12 })?.mm, 4);
});

test("the edge of a patch stands off the cloth by its thickness, and a thicker patch stands further off", () => {
  // The lowest layer of the wall lies 0.9 of the thickness below the face (CM units to the centimetre, so a millimetre is CM / 10). The face is 10 + 50 = 60.
  const lowest = (mm: number): number => {
    const under = cloth("t", 10, 10, 40, 50, [250, 249, 246], [120, 126, 140], { mm }).under;
    const solid = [...under.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="[-\d.]+" height="([-\d.]+)" rx="1.1" fill="#[0-9a-f]{6}"\/>/g)];
    return Math.max(...solid.map((m) => Number(m[2]) + Number(m[3]))) - 60;
  };
  for (const mm of [3, 3.5, 4]) assert.ok(Math.abs(lowest(mm) - 0.9 * mm * CM / 10) < 0.02, `${mm} mm: the wall is ${lowest(mm).toFixed(3)} deep`);
  assert.ok(lowest(4) > lowest(3));
  assert.match(cloth("t", 0, 0, 40, 50, [250, 249, 246], [120, 126, 140]).under, /data-thick="3.5"/);
});

test("the back patch's thickness is drawn at the turns the judogi tests cover, face on and turned", () => {
  for (const yaw of [0, 30, 70, 150]) {
    const svg = judogiFrame({ mode: "pieces", yaw, backPatch: { style: "ijf" } });
    assert.ok(svg.includes('data-thick="3.5"'), `the patch's edge at yaw ${yaw}`);
  }
  assert.ok(judogiFrame({ mode: "pieces", yaw: 150, backPatch: { style: "zekken", thicknessMm: 3 } }).includes('data-thick="3.0"'));
});

test("a patch's edge is stitched as asked: running by default, satin when asked, and a bordered emblem is satin", () => {
  const back = renderJudogi({ mode: "jacket", view: "back", belt: "black", backPatch: { style: "ijf" } });
  assert.ok(back.includes('data-edge="running"'));
  assert.ok(!back.includes('data-edge="satin"'));
  const satin = renderJudogi({ mode: "jacket", view: "back", belt: "black", backPatch: { style: "zekken", edge: "satin", thicknessMm: 3 } });
  assert.ok(satin.includes('data-edge="satin"') && satin.includes('data-thick="3.0"'));
  assert.ok(!satin.includes('data-edge="running"'));
  const emblem = renderJudogi({ mode: "jacket", view: "front", belt: "black", emblem: { svg: FLAG, frame: "bordered" } });
  assert.ok(emblem.includes('data-edge="satin"'));
});
