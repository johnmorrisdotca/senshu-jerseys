// Where the marks sit on the jacket's panels after the body is cut to the photographs' shape, and how a flag patch is sewn. The chest is the part of the
// front between the top lapel's collar band and the sleeve's seam (`chestSpan`): the national emblem lies wholly inside it, never on a sleeve, at every
// emblem style and at the turns where the chest faces the viewer.

import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyOutline, chestSpan, jacketDesc, sleeveRegion } from "../src/judogiJacket.ts";
import { buildMarks, layoutMarks, MERROW, readMarks, type JudogiEmblem } from "../src/judogiMarks.ts";
import { CM, EDGE_MARGIN, areasFor, corners, insideWithMargin } from "../src/judogiPlaces.ts";
import { hipOutline, hipsOf } from "../src/judogiPants.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { bodyPoint, placeCell, turn } from "../src/volume.ts";

const flag = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="7" height="20" fill="#d52b1e"/><rect x="23" width="7" height="20" fill="#d52b1e"/></svg>`;
const OPTIONS: [string, JudogiEmblem][] = [
  ["placeholder", {}],
  ["flag", { svg: flag }],
  ["flag, named", { svg: flag, caption: "CANADA" }],
  ["flag, square", { svg: flag, caption: "Nippon", style: "square" }],
  ["flag, bordered", { svg: flag, frame: "bordered" }],
  ["flag, no frame", { svg: flag, frame: "none" }],
  ["kodokan", { mark: "kodokan" }],
  ["wide flag", { svg: flag, widthCm: 12, heightCm: 8 }],
];

const emblemBox = (e: JudogiEmblem, belt = 12): ReturnType<typeof layoutMarks>["placed"][number] => {
  const l = layoutMarks(readMarks({ emblem: e, logos: [{ place: "jacket-shoulder-left" }, { place: "jacket-shoulder-right" }] })!, belt);
  const p = l.placed.find((q) => q.item.kind === "emblem");
  assert.ok(p !== undefined, "the emblem is placed");
  return p;
};

test("the national emblem lies wholly on the chest: inside the front's body, clear of the lapel's band and of both sleeves, at every style", () => {
  const front = bodyOutline(true);
  for (const [name, e] of OPTIONS) {
    for (const belt of [8, 12, 16]) {
      const p = emblemBox(e, belt);
      assert.equal(p.item.area, "chest", name);
      for (const c of corners(p.box)) {
        assert.ok(insideWithMargin(front, c, 0), `${name}: a corner (${c[0].toFixed(1)}, ${c[1].toFixed(1)}) is off the body`);
        for (const s of [-1, 1] as const) assert.ok(!insideWithMargin(sleeveRegion(s), c, 0), `${name}: a corner (${c[0].toFixed(1)}, ${c[1].toFixed(1)}) is on a sleeve`);
        const [l, r] = chestSpan(c[1]);
        assert.ok(c[0] >= l + EDGE_MARGIN - 1e-6 && c[0] <= r - EDGE_MARGIN + 1e-6, `${name}: ${c[0].toFixed(1)} is not between the lapel's band (${l.toFixed(1)}) and the sleeve's seam (${r.toFixed(1)}) with 1 cm to spare`);
      }
    }
  }
});

test("the default emblem is in the middle of the chest, between the lapel and the sleeve, and no larger than the rules' 100 cm2", () => {
  const p = emblemBox({ svg: flag });
  const [l, r] = chestSpan(p.box.y);
  assert.ok(Math.abs(p.box.x - (l + r) / 2) <= 2, `its middle ${p.box.x.toFixed(1)} against the chest's ${((l + r) / 2).toFixed(1)}`);
  assert.ok((p.box.w / CM) * (p.box.h / CM) <= 100);
});

test("at the turns where the chest faces the viewer a sleeve never covers the emblem's corners", () => {
  const body = jacketDesc(1, true);
  const sleeves = pieceCells(body).filter((c) => c.g === 1 || c.g === 2);
  for (const [name, e] of OPTIONS) {
    const p = emblemBox(e);
    for (const yaw of [-30, -20, -10, 0, 10, 20, 30]) {
      const cy = Math.cos((yaw * Math.PI) / 180);
      const sy = Math.sin((yaw * Math.PI) / 180);
      const cp = Math.cos((body.pitch * Math.PI) / 180);
      const sp = Math.sin((body.pitch * Math.PI) / 180);
      const seen = sleeves.map((c) => placeCell(c, yaw, body.pitch)).filter((q) => q.visible && q.tri !== undefined);
      for (const c of corners(p.box)) {
        const [x, y, z] = bodyPoint(body, c[0], c[1]);
        const t = turn(x, y, z, cy, sy, cp, sp);
        for (const q of seen) {
          const [ax, ay, az, bx, by, bz, dx, dy, dz] = q.tri as [number, number, number, number, number, number, number, number, number];
          const det = (by - dy) * (ax - dx) + (dx - bx) * (ay - dy);
          if (Math.abs(det) < 1e-9) continue;
          const l1 = ((by - dy) * (t[0] + 100 - dx) + (dx - bx) * (t[1] - dy)) / det;
          const l2 = ((dy - ay) * (t[0] + 100 - dx) + (ax - dx) * (t[1] - dy)) / det;
          const covered = l1 >= 0 && l2 >= 0 && l1 + l2 <= 1 && l1 * az + l2 * bz + (1 - l1 - l2) * dz > t[2] + 0.5;
          assert.ok(!covered, `${name}: a sleeve covers a corner of the emblem at yaw ${yaw}`);
        }
      }
    }
  }
});

test("every place on the jacket's front and back and on the trousers lies on its own panel", () => {
  const js = areasFor(6, { x: 90, y: 168, rot: 8 });
  const front = bodyOutline(true);
  const hips = hipOutline(hipsOf(true));
  for (const [id, a] of Object.entries(js)) {
    if (id === "chest" || id === "hem-left" || id === "lapel-hem") for (const p of a.poly) assert.ok(insideWithMargin(front, p, 0), `${id}: ${p} is off the body`);
    if (id === "sleeve-left" || id === "sleeve-right" || id === "shoulder-left" || id === "shoulder-right") {
      // A sleeve's place is the sleeve's own outline, held a margin in from its seams: it is the drawn sleeve, whatever shape that is.
      const s = id.endsWith("left") === (a.face === "jacket-front") ? 1 : -1;
      assert.deepEqual(a.poly, sleeveRegion(s as -1 | 1), `${id} follows the drawn sleeve`);
    }
    if (id.startsWith("waist-")) for (const p of a.poly) assert.ok(insideWithMargin(hips, p, 0), `${id}: ${p} is off the hips`);
  }
  // Nothing on the front's body is under the belt's band, and the hem's corner is below it.
  assert.ok((js["hem-left"]!.poly[0] as [number, number])[1] > (js["chest"]!.poly[2] as [number, number])[1] + 10, "the hem's corner is well under the chest");
});

test("a flag patch is the flag edge to edge with a thin merrowed edge, no white margin (a bordered patch is only an option)", () => {
  const mm = (MERROW / CM) * 10;
  assert.ok(mm >= 1 && mm <= 2, `the merrowed edge is ${mm.toFixed(2)} mm`);
  const cloth: [number, number, number] = [248, 247, 243];
  const widthOf = (e: JudogiEmblem): { image: number; box: number } => {
    const m = readMarks({ emblem: e })!;
    const placed = layoutMarks(m, 12).placed.find((q) => q.item.kind === "emblem")!;
    const body = buildMarks("t", m, cloth, 12).jacket.front!.body;
    const w = Number(/<image [^>]*width="([\d.]+)"/.exec(body)![1]);
    return { image: w, box: placed.box.w };
  };
  const plain = widthOf({ svg: flag });
  assert.ok(Math.abs(plain.image - plain.box) < 0.06, `the flag is ${plain.image} wide in a patch ${plain.box} wide`);
  const bordered = widthOf({ svg: flag, frame: "bordered" });
  assert.ok(bordered.box - bordered.image > 5, "a bordered patch keeps its margin of cloth round the artwork");
  const named = widthOf({ svg: flag, caption: "CANADA" });
  assert.ok(Math.abs(named.image - named.box) < 0.06, "a flag with its name under it is also edge to edge");
});
