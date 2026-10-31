// A patch cut to any shape: the same cloth, thickness, edge, shade, lift and stitching as the rectangle's `cloth`, round a circle, a shield, a rounded rectangle or a custom path.

import assert from "node:assert/strict";
import { test } from "node:test";
import { BJJ_ZONE_IDS } from "../src/bjjgi.ts";
import { drawBjjPatch, readBjjPatch, type PatchShape } from "../src/bjjPatch.ts";
import { judogiFrame } from "../src/judogi.ts";
import { CM, PATCH_MM, cloth, clothOutline, clothPath, shapedCloth, type ClothShape } from "../src/judogiPatch.ts";
import { wellFormed } from "./helpers.ts";

const WHITE: [number, number, number] = [250, 249, 246];
const NAVY: [number, number, number] = [24, 38, 84];
const THREAD: [number, number, number] = [200, 160, 40];
const HEART = "M50 90C10 60 5 30 25 15C40 5 50 20 50 25C50 20 60 5 75 15C95 30 90 60 50 90Z";
const SHAPES: [string, ClothShape][] = [["circle", "circle"], ["shield", "shield"], ["rounded", "rounded"], ["custom", { path: HEART }]];

const nums = (d: string): number[] => [...d.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]));

test("each shape's cloth sits inside its box, and a custom path is stretched to it", () => {
  for (const [name, shape] of SHAPES) {
    for (const [x, y, w, h] of [[10, 20, 40, 30], [-8, -8, 16, 30], [100, 100, 12.5, 12.5]] as const) {
      const { defs } = shapedCloth("s", shape, x, y, w, h, WHITE, THREAD);
      const d = new RegExp(`<clipPath id="sC"><path d="([^"]+)"/>`).exec(defs)![1]!;
      const n = nums(d);
      const xs = n.filter((_, i) => i % 2 === 0);
      const ys = n.filter((_, i) => i % 2 === 1);
      assert.ok(Math.min(...xs) >= x - 0.01 && Math.max(...xs) <= x + w + 0.01, `${name} ${w}x${h}: across`);
      assert.ok(Math.min(...ys) >= y - 0.01 && Math.max(...ys) <= y + h + 0.01, `${name} ${w}x${h}: down`);
    }
  }
  const o = clothOutline({ path: HEART }, 40, 20);
  assert.equal(o, clothOutline({ path: HEART }, 40, 20));
  assert.ok(nums(o).filter((_, i) => i % 2 === 0).every((v) => v >= -20 && v <= 20));
});

test("a custom outline takes only the path commands the drawing can scale, and anything else is cut as a rounded rectangle", () => {
  assert.equal(clothPath(HEART), HEART);
  for (const bad of ["<script>", "M0 0L5 5A3 3 0 0 1 9 9", "L0 0L5 5", `M0 0${"L1 1".repeat(200)}`, 7, undefined, "M0 0 url(#x)"]) assert.equal(clothPath(bad), "", String(bad).slice(0, 20));
  assert.equal(clothOutline({ path: "<script>" }, 30, 20), clothOutline("rounded", 30, 20));
  const bad = shapedCloth("s", { path: `M0 0" onload="x` }, 0, 0, 30, 20, WHITE, THREAD);
  assert.ok(!/onload/.test(bad.defs + bad.under + bad.over));
});

test("the rectangle is `cloth` itself", () => {
  assert.deepEqual(shapedCloth("r", "rectangle", 3, 4, 40, 25, WHITE, THREAD, { mm: 4, edge: "satin" }), cloth("r", 3, 4, 40, 25, WHITE, THREAD, { mm: 4, edge: "satin" }));
});

test("the thickness is 3 to 4 mm, 3.5 by default, and the cut edge stands off the garment by it", () => {
  assert.deepEqual(PATCH_MM, { min: 3, max: 4, default: 3.5 });
  const wall = (mm?: number): number => {
    const under = shapedCloth("t", "circle", 0, 0, 30, 30, WHITE, THREAD, mm === undefined ? {} : { mm }).under;
    return Math.max(...[...under.matchAll(/<path d="[^"]+" transform="translate\(([-\d.]+) ([-\d.]+)\)" fill="#[0-9a-f]{6}"\/>/g)].map((m) => Number(m[2])));
  };
  for (const mm of [3, 3.5, 4]) assert.ok(Math.abs(wall(mm) - 0.9 * mm * CM / 10) < 0.01, `${mm} mm`);
  assert.equal(wall(), wall(3.5));
  assert.equal(wall(1), wall(3));
  assert.equal(wall(9), wall(4));
  assert.ok(wall(4) > wall(3));
  for (const [name, shape] of SHAPES) {
    assert.match(shapedCloth("t", shape, 0, 0, 30, 20, WHITE, THREAD).under, /data-thick="3.5"/, name);
    assert.match(shapedCloth("t", shape, 0, 0, 30, 20, WHITE, THREAD, { mm: 3 }).under, /data-thick="3.0"/, name);
  }
});

test("the edge is stitched as asked: a running stitch by default, a satin border when asked", () => {
  for (const [name, shape] of SHAPES) {
    const run = shapedCloth("e", shape, 0, 0, 30, 20, NAVY, THREAD);
    assert.match(run.over, /data-edge="running"/, name);
    assert.ok(run.over.includes('stroke-dasharray="1.7 1.1"') && !run.over.includes('fill-rule="evenodd"'), name);
    const satin = shapedCloth("e", shape, 0, 0, 30, 20, NAVY, THREAD, { edge: "satin" });
    assert.match(satin.over, /data-edge="satin"/, name);
    assert.ok(satin.over.includes('fill-rule="evenodd"') && !satin.over.includes('stroke-dasharray="1.7 1.1"'), name);
  }
});

test("the cloth is shaded for a light and a dark base, with its weave, gradient and lit upper-left line", () => {
  for (const base of [WHITE, NAVY]) {
    const c = shapedCloth("w", "shield", 0, 0, 30, 36, base, THREAD);
    assert.ok(c.defs.includes('<pattern id="wW"') && c.defs.includes('<linearGradient id="wG"'));
    assert.ok(c.over.includes('fill="url(#wW)"') && c.over.includes('fill="url(#wG)"'));
    assert.ok(c.over.includes('clip-path="url(#wL)"'), "the lit line");
    assert.ok(c.under.includes('fill="#1a2230" fill-opacity="0.05"'), "the lift of shadow");
  }
  assert.notEqual(shapedCloth("w", "circle", 0, 0, 30, 30, WHITE, THREAD).under, shapedCloth("w", "circle", 0, 0, 30, 30, NAVY, THREAD).under);
});

test("it draws exactly what the jiu-jitsu gi's patch draws, for every shape, edge and thickness, on a light and a dark cloth", () => {
  for (const [name, shape] of SHAPES) {
    for (const edge of ["running", "satin"] as const) {
      for (const mm of [3, 3.5, 4]) {
        for (const colour of ["white", "navy"]) {
          const p = readBjjPatch({ zone: "upper-back", shape: name === "custom" ? "custom" : name, ...(name === "custom" ? { outline: HEART } : {}), colour, edge, thicknessMm: mm }, BJJ_ZONE_IDS)!;
          const [w, h] = [31.5, 24];
          const made = drawBjjPatch("u", p, p.shape as PatchShape, { x: 0, y: 0, w, h, rot: 0 });
          const mine = shapedCloth("u", shape, -w / 2, -h / 2, w, h, p.colour, p.border, { mm, edge });
          assert.equal(made.body, `<g data-bjj-patch="upper-back" transform="translate(0 0) rotate(0)">${mine.under}${mine.over}</g>`, `${name} ${edge} ${mm} ${colour}`);
          assert.ok(made.defs.startsWith(mine.defs), `${name} ${edge} ${mm} ${colour}: defs`);
        }
      }
    }
  }
});

test("a shaped patch is strict XML on its own and on a gi at the turns the patch tests cover, with its thickness", () => {
  for (const [name, shape] of SHAPES) {
    for (const edge of ["running", "satin"] as const) {
      const c = shapedCloth("x", shape, 5, 5, 30, 24, WHITE, THREAD, { edge });
      assert.equal(wellFormed(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 34"><defs>${c.defs}</defs>${c.under}${c.over}</svg>`), null, `${name} ${edge}`);
    }
  }
  for (const yaw of [0, 30, 70, 150]) {
    const svg = judogiFrame({ mode: "suit", yaw, bjj: { patches: [{ zone: "upper-back", shape: "circle", thicknessMm: 4 }, { zone: "shin-left", shape: "shield" }] } });
    assert.equal(wellFormed(svg), null, `yaw ${yaw}`);
    assert.ok(svg.includes('data-thick="3.5"') || svg.includes('data-thick="4.0"'), `yaw ${yaw}`);
  }
});

test("two shaped patches on one page share no id", () => {
  const ids = (id: string): string[] => [...(shapedCloth(id, "circle", 0, 0, 20, 20, WHITE, THREAD).defs).matchAll(/id="([^"]+)"/g)].map((m) => m[1]!);
  const [a, b] = [ids("p1"), ids("p2")];
  assert.ok(a.length >= 4 && a.every((i) => !b.includes(i)));
});
