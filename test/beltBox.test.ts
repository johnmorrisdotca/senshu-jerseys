import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BASE_TURN, BOX_MAX_BELT, BOX_SIZES, BOX_TAKES, FOLD_LAYERS, beltCmOfSize, boxBeltRoom, boxDims, boxInnerCm, boxSizeFor, foldPath, lidLength, regionsOf, sceneOf, solidCells,
  type BoxState, type BoxType, type SolidDesc,
} from "../src/beltBox.ts";
import { lidTextLayout } from "../src/beltBoxFace.ts";
import { judogiCheck, renderJudogi } from "../src/judogi.ts";
import { UNITS_PER_CM } from "../src/judogiStrap.ts";
import type { Cell } from "../src/volume.ts";

const SIZES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
const scene = (beltSize: number, type: BoxType, state: BoxState, extra: { widthCm?: number; band?: boolean } = {}): ReturnType<typeof sceneOf> =>
  sceneOf({ beltSize, widthCm: extra.widthCm ?? 4.5, thickCm: 0.49, belt: true, band: extra.band ?? false, box: { type, state }, rot: 0 });

test("a belt's length is 230 cm at size 2 and 10 cm more each half size, to 350 cm at size 8", () => {
  assert.equal(beltCmOfSize(2), 230);
  assert.equal(beltCmOfSize(2.5), 240);
  assert.equal(beltCmOfSize(6), 310);
  assert.equal(beltCmOfSize(8), 350);
});

test("the box size follows the maker's menu: 2 holds up to 2.5, 3 to 3.5, 4 to 4.5, 5 is size 5, 6 holds 5.5 to 6.5", () => {
  const silver = (s: number): number | undefined => boxSizeFor(s, "silver");
  assert.deepEqual([1, 2, 2.5].map(silver), [2, 2, 2]);
  assert.deepEqual([3, 3.5].map(silver), [3, 3]);
  assert.deepEqual([4, 4.5].map(silver), [4, 4]);
  assert.equal(silver(5), 5);
  assert.deepEqual([5.5, 6, 6.5].map(silver), [6, 6, 6]);
  assert.deepEqual([7, 7.5, 8].map(silver), [undefined, undefined, undefined]);
});

test("the wooden box fits a belt of size 6 at most; a longer belt does not fit any box", () => {
  assert.equal(BOX_MAX_BELT.kiri, 6);
  assert.equal(boxSizeFor(6, "kiri"), 6);
  assert.equal(boxSizeFor(6.5, "kiri"), undefined);
  assert.equal(boxSizeFor(6.5, "silver"), 6);
  assert.equal(boxSizeFor(7, "silver"), undefined);
  // A belt that does not fit is not drawn in the box.
  for (const type of ["kiri", "silver"] as const) {
    const s = scene(8, type, "open");
    assert.equal(s.fits, false);
    assert.equal(s.belt, undefined);
  }
});

test("box dimensions: kiri 7 x 7 cm, silver 5 cm wide, and the length grows with the size", () => {
  for (const size of BOX_SIZES) {
    const k = boxDims(size, "kiri");
    assert.equal(k.w, 7);
    assert.equal(k.h, 7);
    const s = boxDims(size, "silver");
    assert.ok(Math.abs(s.baseW - 5) <= 0.2 && Math.abs(s.w - 5) <= 0.5, `silver width ${s.baseW}/${s.w}`);
  }
  const inner = BOX_SIZES.map((s) => boxInnerCm(s));
  assert.deepEqual([...inner].sort((a, b) => a - b), inner);
  assert.ok(new Set(inner).size === inner.length);
  // Derived from the folded length of the longest belt each box takes.
  for (const size of BOX_SIZES) assert.equal(boxInnerCm(size), Math.round((beltCmOfSize(BOX_TAKES[size]) / FOLD_LAYERS + 5) * 10) / 10);
  assert.ok(boxDims(6, "kiri").length < 60 && boxDims(2, "kiri").length > 30, "a believable length");
});

test("every belt that fits a box lies inside it: along, across and in height", () => {
  for (const type of ["kiri", "silver"] as const) {
    for (const size of SIZES) {
      const s = scene(size, type, "open");
      if (!s.fits) continue;
      assert.ok(s.belt !== undefined && s.box !== undefined, `${type} ${size}`);
      const d = s.box.d;
      const { points } = foldPath(s.belt);
      const hw = s.belt.w / 2;
      const floor = s.box.y - d.wall * (type === "kiri" ? 1 : 0.6);
      const rim = s.box.y - d.baseH;
      for (const p of points) {
        assert.ok(Math.abs(p.p[0]) <= d.inner / 2 + 1e-6, `${type} ${size}: x ${p.p[0]} beyond ${d.inner / 2}`);
        assert.ok(Math.abs(p.p[2] - s.belt.z) + hw <= d.baseW / 2 - d.wall + 1e-6, `${type} ${size}: z ${p.p[2]}`);
        assert.ok(p.p[1] + s.belt.t / 2 <= floor + 1e-6 && p.p[1] - s.belt.t / 2 >= rim, `${type} ${size}: y ${p.p[1]}`);
      }
    }
  }
});

test("the belt in a box is not wider than the box's room, and the largest belt of each box just fits its length", () => {
  for (const type of ["kiri", "silver"] as const) {
    for (const box of BOX_SIZES) {
      const d = boxDims(box, type);
      const takes = Math.min(BOX_TAKES[box], BOX_MAX_BELT[type]);
      const s = scene(takes, type, "open", { widthCm: 9 });
      assert.ok((s.belt?.w ?? 0) <= boxBeltRoom(d) + 1e-9);
      const { points } = foldPath({ ...(s.belt as NonNullable<typeof s.belt>), w: 4.5 });
      const xs = points.map((p) => p.p[0]);
      const span = Math.max(...xs) - Math.min(...xs);
      assert.ok(span <= d.inner + 1e-6 && span > d.inner - 5, `${type} box ${box}: bundle ${span.toFixed(1)} in ${d.inner}`);
    }
  }
});

test("the folded belt keeps the belt's own length, doubled back seven times, the bottom end showing", () => {
  for (const size of [2, 4, 6, 8]) {
    const f = sceneOf({ beltSize: size, widthCm: 4.5, thickCm: 0.49, belt: true, band: false }).belt!;
    const path = foldPath(f);
    assert.ok(Math.abs(path.length - beltCmOfSize(size)) / beltCmOfSize(size) < 0.02, `${size}: ${path.length}`);
    assert.equal(f.n, FOLD_LAYERS);
    const ys = new Set(path.points.map((p) => Math.round(p.p[1] * 1000)));
    assert.ok(ys.size >= FOLD_LAYERS, "seven layers at seven heights");
    // The first layer's free end (B) sticks out beyond the folds on its side.
    const first = path.points[0]!.p[0];
    const farFolds = Math.max(...path.points.filter((p) => p.u > path.length * 0.15).map((p) => p.p[0]));
    assert.ok(first > farFolds + 0.3, `${size}: end ${first.toFixed(2)} fold ${farFolds.toFixed(2)}`);
  }
});

test("the top layer's face looks up and the belt's face alternates with the fold", () => {
  const f = sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.49, belt: true, band: false }).belt!;
  const { points } = foldPath(f);
  const top = Math.min(...points.map((p) => p.p[1]));
  const onTop = points.filter((p) => Math.abs(p.p[1] - top) < 1e-9);
  for (const p of onTop) assert.deepEqual(p.out, [0, -1, 0]);
});

/** The picture's own x and y axes as they lie in space on a cell: their cross product must point the way the cell faces, or its picture reads backwards. */
function handed(c: Cell): number {
  const [t0x, t0y, t1x, t1y, t2x, t2y] = c.tex as [number, number, number, number, number, number];
  const e1 = [c.p[3]! - c.p[0]!, c.p[4]! - c.p[1]!, c.p[5]! - c.p[2]!];
  const e2 = [c.p[6]! - c.p[0]!, c.p[7]! - c.p[1]!, c.p[8]! - c.p[2]!];
  const a = t1x - t0x;
  const b = t2x - t0x;
  const cc = t1y - t0y;
  const d = t2y - t0y;
  const det = a * d - b * cc;
  // P(t) = P0 + Px * dx + Py * dy, solved from the two edges.
  const px = e1.map((v, i) => (v * d - e2[i]! * cc) / det);
  const py = e1.map((v, i) => (e2[i]! * a - v * b) / det);
  const n = [px[1]! * py[2]! - px[2]! * py[1]!, px[2]! * py[0]! - px[0]! * py[2]!, px[0]! * py[1]! - px[1]! * py[0]!];
  return n[0]! * c.n[0] + n[1]! * c.n[1] + n[2]! * c.n[2];
}

test("no picture is mirrored: on every cell of every box, state and belt, the picture's axes cross outward", () => {
  const cases: SolidDesc[] = [];
  for (const type of ["kiri", "silver"] as const) for (const state of ["closed", "open", "empty"] as const) cases.push(scene(4, type, state));
  cases.push(sceneOf({ beltSize: 3, widthCm: 4.2, thickCm: 0.49, belt: true, band: true }));
  for (const desc of cases) {
    const cells = solidCells({ ...desc, rot: BASE_TURN });
    assert.ok(cells.length > 100);
    cells.forEach((c, i) => assert.ok(handed(c) > 0, `a mirrored cell ${i} at tex ${c.tex.slice(0, 2).map((v) => v.toFixed(1))} (${desc.box?.type ?? "belt"} ${desc.box?.state ?? ""})`));
  }
});

test("a closed box is a solid block: every cell faces away from its middle", () => {
  for (const type of ["kiri", "silver"] as const) {
    const s = scene(4, type, "closed");
    const cells = solidCells(s);
    const d = s.box!.d;
    const mid = [0, (s.box!.y - d.h / 2) * UNITS_PER_CM, 0];
    for (const c of cells) {
      const cx = (c.p[0]! + c.p[3]! + c.p[6]!) / 3;
      const cy = (c.p[1]! + c.p[4]! + c.p[7]!) / 3;
      const cz = (c.p[2]! + c.p[5]! + c.p[8]!) / 3;
      const out = (cx - mid[0]!) * c.n[0] + (cy - mid[1]!) * c.n[1] + (cz - mid[2]!) * c.n[2];
      assert.ok(out > -0.5, `${type}: a cell faces inward (${out.toFixed(2)})`);
    }
  }
});

test("the lid's words sit on the middle of its width and wholly on the lid, whatever the text", () => {
  for (const type of ["kiri", "silver"] as const) {
    for (const size of BOX_SIZES) {
      const d = boxDims(size, type);
      const L = lidLength(d) * UNITS_PER_CM;
      const W = d.w * UNITS_PER_CM;
      for (const text of ["御帯", "御", "御帯黒帯", "X", "ABCDEF", "一二三四五六七"]) {
        const lay = lidTextLayout(L, W, text);
        assert.equal(lay.y, W / 2, "centred across the lid");
        assert.ok(lay.chars.length >= 1 && lay.chars.length <= 6);
        for (const ch of lay.chars) {
          assert.ok(ch.x - lay.size / 2 >= -1e-6 && ch.x + lay.size / 2 <= L + 1e-6, `${type} ${size} ${text}: a letter off the lid`);
        }
        assert.ok(lay.size <= W * 0.5, "a letter narrower than half the lid");
      }
    }
  }
  // 御帯 by default, one under the other, the first nearest the lid's top end (the right edge of its picture).
  const lay = lidTextLayout(100, 18, "御帯");
  assert.deepEqual(lay.chars.map((c) => c.c), ["御", "帯"]);
  assert.ok(lay.chars[0]!.x > lay.chars[1]!.x);
});

test("the regions of the picture are on it and apart, so a cell never picks up its neighbour's cloth", () => {
  for (const type of ["kiri", "silver"] as const) {
    for (const size of BOX_SIZES) {
      const desc = scene(size, type, "open", { band: true });
      const r = Object.values(regionsOf(desc));
      for (const a of r) assert.ok(a.x >= -40 && a.x + a.w <= 240 && a.y >= 64 && a.y + a.h <= 300, `${type} ${size}: region off the picture ${JSON.stringify(a)}`);
      for (let i = 0; i < r.length; i++) {
        for (let j = i + 1; j < r.length; j++) {
          const [a, b] = [r[i]!, r[j]!];
          assert.ok(a.y + a.h + 2 <= b.y || b.y + b.h + 2 <= a.y || a.x + a.w + 2 <= b.x || b.x + b.w + 2 <= a.x, "regions touch");
        }
      }
    }
  }
});

test("the folded belt and the box draw as SVG in every state, with their words, and the options change the drawing", () => {
  const folded = renderJudogi({ mode: "folded", belt: "red-white", beltSize: 4 });
  assert.ok(folded.includes("data-piece="));
  assert.notEqual(renderJudogi({ mode: "folded", belt: "black" }), folded);
  assert.notEqual(renderJudogi({ mode: "folded", belt: "red-white", beltSize: 4, band: true }), folded);
  const states = (["closed", "open", "empty"] as const).map((boxState) => renderJudogi({ mode: "box", boxState, belt: "black", beltSize: 3 }));
  assert.equal(new Set(states).size, 3);
  // (A failed match would print a drawing a quarter of a megabyte long, so the test asks yes or no.)
  for (const svg of states) assert.ok(/御<\/text>/.test(svg) && /帯<\/text>/.test(svg), "the lid's words are in the drawing");
  assert.ok(/黒<\/text>/.test(renderJudogi({ mode: "box", boxText: "黒帯" })));
  assert.notEqual(renderJudogi({ mode: "box", boxType: "silver" }), states[0]);
  assert.notEqual(renderJudogi({ mode: "box", boxWood: "honey" }), renderJudogi({ mode: "box", boxWood: "light" }));
  // The same options always draw the same.
  assert.equal(renderJudogi({ mode: "box", boxState: "open" }), renderJudogi({ mode: "box", boxState: "open" }));
  // Every view draws (the flat ones are the same scene, standing still).
  for (const view of ["front", "back", "flat", "flat-back"] as const) assert.ok(renderJudogi({ mode: "box", view }).startsWith("<svg"));
});

test("the check says when a belt does not fit a box", () => {
  const ok = judogiCheck({ mode: "box", beltSize: 4 });
  assert.ok(ok.notes.some((n) => n.id === "belt-box-fit" && n.met));
  const no = judogiCheck({ mode: "box", beltSize: 7 });
  assert.ok(no.notes.some((n) => n.id === "belt-box-fit" && !n.met));
  assert.equal(no.ok, false);
  // A silver box takes size 6.5, a wooden one does not.
  assert.ok(judogiCheck({ mode: "box", beltSize: 6.5, boxType: "silver" }).notes.some((n) => n.id === "belt-box-fit" && n.met));
  assert.ok(judogiCheck({ mode: "box", beltSize: 6.5 }).notes.some((n) => n.id === "belt-box-fit" && !n.met));
  // Other modes do not carry the note.
  assert.ok(!judogiCheck({ mode: "belt" }).notes.some((n) => n.id === "belt-box-fit"));
});
