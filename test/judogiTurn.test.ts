import assert from "node:assert/strict";
import { test } from "node:test";
import { EMBLEM_AT, EMBLEM_ROOM, jacketDesc, sleeveRegion } from "../src/judogiJacket.ts";
import { readMarks } from "../src/judogiMarks.ts";
import { CM } from "../src/judogiPatch.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { placeCell, turn } from "../src/volume.ts";

const rad = (d: number): number => (d * Math.PI) / 180;
const YAWS = [0, 1, 2, 3, 4, 8, 15, 30, 45, 60, 90];

/** The silhouette's width of the torso (not the sleeves) between two heights of the drawing, at a turn: the widest the visible cells reach. */
function bodyWidth(tied: boolean, yaw: number, lo: number, hi: number): number {
  const d = jacketDesc(1, tied);
  const cy = Math.cos(rad(yaw)), sy = Math.sin(rad(yaw)), cp = Math.cos(rad(d.pitch)), sp = Math.sin(rad(d.pitch));
  let mn = Infinity;
  let mx = -Infinity;
  for (const c of pieceCells(d)) {
    if ((c.g !== 0 && c.g !== 3) || !placeCell(c, yaw, d.pitch).visible) continue;
    for (let k = 0; k < 3; k++) {
      const y = c.p[3 * k + 1] as number;
      if (y < lo || y > hi) continue;
      const x = turn(c.p[3 * k] as number, y, c.p[3 * k + 2] as number, cy, sy, cp, sp)[0];
      mn = Math.min(mn, x);
      mx = Math.max(mx, x);
    }
  }
  return mx - mn;
}

test("the jacket's body is never wider turned a little than face on, and only narrows from there", () => {
  for (const tied of [false, true]) {
    for (const [lo, hi] of [[60, 80], [110, 120], [150, 170]] as const) {
      const w = YAWS.map((yaw) => bodyWidth(tied, yaw, lo, hi));
      const front = w[0] as number;
      w.forEach((v, i) => assert.ok(v <= front * 1.004, `rows ${lo}-${hi} ${tied ? "tied" : "loose"} at ${YAWS[i]} degrees: ${v.toFixed(2)} against ${front.toFixed(2)} face on`));
      // Smooth: no step between neighbouring angles beyond what the turn itself accounts for, and never wider than the one before by more than a hair.
      for (let i = 1; i < w.length; i++) {
        const step = (w[i] as number) - (w[i - 1] as number);
        assert.ok(step <= front * 0.004, `rows ${lo}-${hi}: widens by ${step.toFixed(2)} from ${YAWS[i - 1]} to ${YAWS[i]} degrees`);
      }
      assert.ok((w[w.length - 1] as number) < front * 0.8, "side on it is as deep as a person, far narrower than face on");
    }
  }
});

const inside = (x: number, y: number, poly: readonly (readonly [number, number])[]): boolean => {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i] as [number, number];
    const [xj, yj] = poly[j] as [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
};

test("the national emblem is small, on the chest above the lapels' crossing, and never on a sleeve's cloth", () => {
  const flag = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 1'><rect width='2' height='1' fill='#d00'/></svg>";
  for (const emblem of [{}, { svg: flag }, { svg: flag, widthCm: 30, heightCm: 20 }]) {
    const m = readMarks({ emblem });
    const e = m?.emblem;
    assert.ok(e !== undefined);
    let w = e.widthCm * CM;
    let h = e.heightCm * CM;
    // As it is drawn: no larger than the limit and the room the chest has.
    const k = Math.min(1, Math.sqrt((100 * CM * CM) / (w * h)));
    w *= k;
    h *= k;
    const room = Math.min(1, EMBLEM_ROOM.w / w, EMBLEM_ROOM.h / h);
    w *= room;
    h *= room;
    assert.ok((w * h) / (CM * CM) <= 100 + 1e-6);
    for (const side of [-1, 1] as const) {
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]] as const) {
        const x = EMBLEM_AT[0] + (dx * w) / 2;
        const y = EMBLEM_AT[1] + (dy * h) / 2;
        assert.ok(!inside(x, y, sleeveRegion(side)), `corner ${dx},${dy} lies on the ${side < 0 ? "left" : "right"} sleeve's drawing`);
      }
    }
  }
  // The default is a hand's width, not most of the chest: well under the limit.
  const def = readMarks({ emblem: {} })?.emblem;
  assert.ok(def !== undefined && def.widthCm * def.heightCm <= 60 && def.widthCm <= 9.5);
  const f = readMarks({ emblem: { svg: flag } })?.emblem;
  assert.ok(f !== undefined && f.widthCm * f.heightCm <= 60 && f.widthCm <= 9.5);
});
