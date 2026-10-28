import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BASE_TURN, BOX_MAX_BELT, SPRING_PROUD, SQUASH_MAX, GAP_CLOSED, bundleHeight, closedBundle, openBundle, FOLDED_LAYERS, BOX_SIZES, BOX_TAKES, FOLD_LAYERS, beltCmOfSize, boxBeltRoom, boxDims, boxInnerCm, boxSizeFor, foldPath, foldedLayersFor, gapAt, lidLength, regionsOf, sceneOf, solidBounds, solidCells, stackHeight,
  type BoxState, type BoxType, type SolidDesc,
} from "../src/beltBox.ts";
import { BELT_SIZES } from "../src/beltSpecs.ts";
import { lidTextLayout } from "../src/beltBoxFace.ts";
import { judogiCheck, renderJudogi } from "../src/judogi.ts";
import { foldedPanels, kohakuSection } from "../src/judogiBelt.ts";
import { UNITS_PER_CM } from "../src/judogiStrap.ts";
import type { Cell } from "../src/volume.ts";

const SIZES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
const scene = (beltSize: number, type: BoxType, state: BoxState, extra: { widthCm?: number; band?: boolean } = {}): ReturnType<typeof sceneOf> =>
  sceneOf({ beltSize, widthCm: extra.widthCm ?? 4.5, thickCm: 0.49, belt: true, band: extra.band ?? false, box: { type, state }, rot: 0 });

test("a belt's length is the package's size table's: size 2 is 235 cm and 10 cm more each half size, in proportion between listed sizes", () => {
  for (const row of BELT_SIZES) assert.equal(beltCmOfSize(row.size), row.cm);
  assert.equal(beltCmOfSize(2), 235);
  assert.equal(beltCmOfSize(2.5), 245);
  assert.equal(beltCmOfSize(6), 315);
  assert.equal(beltCmOfSize(8), 355);
  assert.equal(beltCmOfSize(1.5), 225);
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

test("box dimensions: about 7 cm wide for a 4.5 cm belt (kiri) and 5.5 cm (silver), and the length grows with the size", () => {
  for (const size of BOX_SIZES) {
    const k = boxDims(size, "kiri");
    assert.ok(Math.abs(k.w - 7) <= 0.5, `kiri width ${k.w}`);
    const s = boxDims(size, "silver");
    assert.ok(Math.abs(s.baseW - 5) <= 0.8 && Math.abs(s.w - 5) <= 1, `silver width ${s.baseW}/${s.w}`);
    // The height is the folded belt's, not a fixed figure: the same box of a thicker belt is taller.
    assert.ok(boxDims(size, "kiri", { w: 4.5, t: 1.3 }).h > k.h + 0.5);
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
        assert.ok(p.p[1] + s.belt.t / 2 <= floor + 1e-6 && p.p[1] - s.belt.t / 2 >= rim - 0.8, `${type} ${size}: y ${p.p[1]}`);
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
      const room = boxBeltRoom(s.box!.d);
      assert.ok((s.belt?.w ?? 0) <= room + 1e-9, "a belt is never wider than its box's room");
      assert.ok(s.belt!.w <= 6 && room >= s.belt!.w, "the box is made for the belt, up to the widest belt drawn");
      const { points } = foldPath(s.belt as NonNullable<typeof s.belt>);
      const xs = points.map((p) => p.p[0]);
      const span = Math.max(...xs) - Math.min(...xs);
      assert.ok(span <= d.inner + 1e-6 && span > d.inner - 8, `${type} box ${box}: bundle ${span.toFixed(1)} in ${d.inner}`);
    }
  }
});

test("the folded belt keeps the belt's own length, doubled back an even number of times (6 to 10 layers), both ends at the near end", () => {
  assert.equal(FOLDED_LAYERS, 8);
  for (const size of [2, 4, 6, 8]) {
    const f = sceneOf({ beltSize: size, widthCm: 4.5, thickCm: 0.49, belt: true, band: false }).belt!;
    const path = foldPath(f);
    assert.ok(Math.abs(path.length - beltCmOfSize(size)) / beltCmOfSize(size) < 0.02, `${size}: ${path.length}`);
    assert.equal(f.n, foldedLayersFor(beltCmOfSize(size), 4.5));
    assert.ok(f.n % 2 === 0 && f.n >= 6 && f.n <= 10);
    const ys = new Set(path.points.map((p) => Math.round(p.p[1] * 1000)));
    assert.ok(ys.size >= f.n, "every layer at its own height");
    // The bundle stays about seven belt widths long, as a shop's folded belt does (not thirty).
    const xs = path.points.map((p) => p.p[0]);
    const ratio = (Math.max(...xs) - Math.min(...xs)) / 4.5;
    assert.ok(ratio > 5 && ratio < 10, `${size}: the bundle is ${ratio.toFixed(1)} belt widths long`);
    // Both free ends lie at the near end of the bundle, the top layer's the one furthest out there.
    const first = path.points[0]!.p[0];
    const lastX = path.points[path.points.length - 1]!.p[0];
    assert.ok(first > 0 && lastX > 0, "both free ends at the same end of the bundle");
    const nearMost = Math.max(...path.points.filter((p) => p.fold === undefined).map((p) => p.p[0]));
    assert.ok(nearMost - lastX < 0.7 * (f.n / 2) + 1, `${size}: the top layer's tip is at the near end (${lastX.toFixed(2)} of ${nearMost.toFixed(2)})`);
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
    // (A sliver of a rounded edge or of a cut step, less than a unit across or along, may twist: its picture is too small to be seen either way round.)
    cells.forEach((c, i) => assert.ok(handed(c) > 0 || Math.abs((c.tex[2]! - c.tex[0]!) * (c.tex[5]! - c.tex[1]!) - (c.tex[4]! - c.tex[0]!) * (c.tex[3]! - c.tex[1]!)) < 0.6 || Math.max(Math.abs(c.tex[2]! - c.tex[0]!), Math.abs(c.tex[4]! - c.tex[0]!)) < 1, `a mirrored cell ${i} at tex ${c.tex.slice(0, 2).map((v) => v.toFixed(1))} (${desc.box?.type ?? "belt"} ${desc.box?.state ?? ""})`));
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
      // (The lid's underside, where it stands proud of the tray, faces down from the upper half: the one face allowed to look at the block.)
      assert.ok(out > -0.5 || c.n[1] > 0.9, `${type}: a cell faces inward (${out.toFixed(2)})`);
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

test("a folded kohaku belt's sections are laid by the belt's real length: an odd number of them, 12 to 18 cm, red at both tips", () => {
  for (const cm of [235, 245, 265, 275, 295, 315, 355]) {
    for (const nominal of [12, 15, 18]) {
      const s = kohakuSection(cm, nominal);
      const k = cm / s;
      assert.ok(s >= 12 - 1e-9 && s <= 18 + 1e-9, `${cm} cm: section ${s.toFixed(2)}`);
      assert.ok(Math.abs(k - Math.round(k)) < 1e-9 && Math.round(k) % 2 === 1, `${cm} cm: ${k} sections`);
    }
  }
  // On the strip: from each cut end the first section is red (the first colour) and the next white, for the whole section, as far as the end's own stretch runs.
  const S = 16 * UNITS_PER_CM;
  const svg = foldedPanels("t", "#f00", "#fff", 16).defs;
  const rects = [...svg.matchAll(/<rect x="(-?[\d.]+)" width="([\d.]+)" height="80" fill="(#\w+)"/g)].map((m) => ({ x: Number(m[1]), w: Number(m[2]), fill: m[3] }));
  const colourAt = (x: number): string => rects.filter((r) => x >= r.x && x < r.x + r.w).pop()!.fill;
  for (const [tip, lo] of [[196, 130], [118.52, 58]] as const) {
    assert.equal(colourAt(tip - 0.5), "#f00", "red at the cut end");
    assert.equal(colourAt(tip - S + 0.5), "#f00", "red for the first section");
    assert.equal(colourAt(tip - S - 0.5), "#fff", "then white");
    if (tip - 2 * S >= lo) assert.equal(colourAt(tip - 2 * S - 0.5), "#f00", "then red again");
  }
  // The plain stretch is one period of two sections, red first.
  assert.equal(colourAt(-40 + 1), "#f00");
  assert.equal(colourAt(-40 + S + 1), "#fff");
});

test("the view box holds every state of every box and the folded belt at every turn and tip", () => {
  const cases: SolidDesc[] = [sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.49, belt: true, band: true, seed: 3 })];
  for (const type of ["kiri", "silver"] as const) for (const state of ["closed", "open", "empty"] as const) cases.push(sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.49, belt: true, band: false, seed: 3, box: { type, state } }));
  for (const desc of cases) {
    const b = solidBounds(desc);
    const cells = solidCells(desc);
    for (let yaw = 0; yaw < 360; yaw += 15) {
      for (const pitch of [-17, 5, 28, 51, 73]) {
        const cy = Math.cos((yaw * Math.PI) / 180);
        const sy = Math.sin((yaw * Math.PI) / 180);
        const cp = Math.cos((pitch * Math.PI) / 180);
        const sp = Math.sin((pitch * Math.PI) / 180);
        for (const c of cells) {
          for (let k = 0; k < 3; k++) {
            const x = c.p[3 * k]! * cy + c.p[3 * k + 2]! * sy;
            const z1 = -c.p[3 * k]! * sy + c.p[3 * k + 2]! * cy;
            const y = c.p[3 * k + 1]! * cp + z1 * sp;
            assert.ok(Math.abs(x) <= b.radius + 1e-6 && y >= b.top - 1e-6 && y <= b.bottom + 1e-6, `a corner out of the view box at turn ${yaw}, tip ${pitch}`);
          }
        }
      }
    }
  }
});

test("a stiff band springs: layers lie close in the middle of the bundle and open out toward its ends, never pressed flat", () => {
  const f = sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.61, belt: true, band: false }).belt!;
  assert.ok(gapAt(f, 0) > gapAt(f, 0.5) + 0.05 && gapAt(f, 1) > gapAt(f, 0.5) + 0.05, "gaps widest at the ends");
  assert.ok(gapAt(f, 0.5) > 0, "a gap even in the middle");
  const { points } = foldPath(f);
  const ys = points.map((p) => p.p[1]);
  const height = Math.max(...ys) - Math.min(...ys) + f.t;
  assert.ok(height > f.n * f.t + 0.5, `the stack is taller than its layers (${height.toFixed(2)} cm of ${(f.n * f.t).toFixed(2)})`);
  // (The gaps waver along the bundle and the lower layers droop, so it may stand a little over the even stack.)
  assert.ok(height <= stackHeight(f.n, f.t, f.loose) * 1.2, `${height.toFixed(2)} cm`);
  // A thicker belt gives a taller, thicker bundle: its own thickness drives it.
  const thick = sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.7, belt: true, band: false }).belt!;
  assert.ok(thick.t > f.t && stackHeight(thick.n, thick.t, 1) > stackHeight(f.n, f.t, 1));
});

test("a box keeps the maker's outside size: the wooden one 7 x 7 cm with a standard 4.5 cm belt, whatever the box's length", () => {
  for (const size of BOX_SIZES) {
    const d = boxDims(size, "kiri");
    assert.ok(Math.abs(d.w - 7) <= 0.05 && Math.abs(d.h - 7) <= 0.05, `kiri box ${size}: ${d.w.toFixed(2)} x ${d.h.toFixed(2)} cm`);
    // The same box for the thick grades of the same belt (a kohaku or a black one): the belt is pressed, the box is not made taller.
    for (const thickCm of [0.49, 0.61, 0.7]) {
      const t = boxDims(size, "kiri", { w: 4.5, t: thickCm * 1.3 });
      assert.ok(Math.abs(t.w - 7) <= 0.05 && t.h >= 7 - 0.05 && t.h <= 7.6, `kiri box ${size} thick ${thickCm}: ${t.w.toFixed(2)} x ${t.h.toFixed(2)} cm`);
    }
    const s = boxDims(size, "silver");
    assert.ok(Math.abs(s.baseW - 5) <= 0.35, `silver box ${size}: ${s.baseW.toFixed(2)} cm wide`);
  }
});

test("lid on, the bundle is pressed to the box's inside height to a millimetre; lid off, it springs back and stands proud of the rim by a few millimetres", () => {
  const widths = [3.5, 4.2, 4.5, 4.7, 5, 6];
  const thicks = [0.49, 0.61, 0.7];
  for (const type of ["kiri", "silver"] as const) {
    for (const size of [2, 3.5, 4, 5, 6]) {
      for (const widthCm of widths) {
        for (const thickCm of thicks) {
          const tag = `${type} size ${size} width ${widthCm} thick ${thickCm}`;
          const s = sceneOf({ beltSize: size, widthCm, thickCm, belt: true, band: false, box: { type, state: "open" }, rot: 0 });
          if (!s.fits) continue;
          const belt = s.belt!;
          const d = s.box!.d;
          const fit = { w: Math.min(widthCm, 6), t: thickCm * 1.3 };
          // Closed: the pressed bundle is exactly as high as the inside, with its layers no thinner than a squash of SQUASH_MAX and the gaps shut.
          const closed = closedBundle(d.innerH, fit);
          assert.ok(Math.abs(closed.height - d.innerH) <= 0.1, `${tag}: closed bundle ${closed.height.toFixed(3)} in ${d.innerH.toFixed(3)} cm`);
          assert.ok(closed.t >= fit.t * (1 - SQUASH_MAX) - 1e-9 && closed.t <= fit.t + 1e-9 && closed.gap >= GAP_CLOSED - 1e-9, `${tag}: pressed layers ${closed.t.toFixed(3)} of ${fit.t.toFixed(3)}`);
          assert.ok(Math.abs(bundleHeight(fit, type) - d.innerH) <= 0.1, `${tag}: bundleHeight`);
          // The box's own inside: floor to rim.
          const floor = s.box!.y - d.wall * (type === "kiri" ? 1 : 0.6);
          const rim = s.box!.y - d.baseH;
          assert.ok(Math.abs(floor - rim - d.innerH) <= 1e-9, `${tag}: inside height`);
          // Open: the belt stands on the floor and above the rim by a spring of a few millimetres that follows the belt's own thickness.
          const { points } = foldPath(belt);
          const top = Math.min(...points.map((p) => p.p[1] - belt.t / 2));
          const bottom = Math.max(...points.map((p) => p.p[1] + belt.t / 2));
          assert.ok(Math.abs(bottom - floor) <= 1e-6, `${tag}: on the floor`);
          const proud = rim - top;
          assert.ok(proud > 0.15 && proud <= 0.8, `${tag}: stands ${(proud * 10).toFixed(1)} mm proud of the rim`);
          assert.ok(Math.abs(proud - SPRING_PROUD * fit.t) <= 0.15, `${tag}: spring ${(proud * 10).toFixed(1)} mm for a layer of ${(fit.t * 10).toFixed(1)} mm`);
          // Every cell of the belt lies inside the tray along and across; in height, from the floor up to that spring.
          const cells = solidCells({ ...s, belt });
          const U = UNITS_PER_CM;
          for (const c of cells) {
            if (c.layer !== 1) continue;
            for (let k = 0; k < 3; k++) {
              const x = c.p[3 * k]! / U;
              const y = c.p[3 * k + 1]! / U;
              const z = c.p[3 * k + 2]! / U;
              assert.ok(Math.abs(x) <= d.inner / 2 + 1e-6, `${tag}: pokes out along (${x.toFixed(2)})`);
              assert.ok(y >= rim - proud - 0.1 && y <= floor + 1e-6, `${tag}: pokes out above or below (${y.toFixed(2)} of ${rim.toFixed(2)}..${floor.toFixed(2)})`);
              assert.ok(Math.abs(z - s.box!.z) <= d.baseW / 2 - d.wall + 1e-6, `${tag}: pokes out across (${z.toFixed(2)})`);
            }
          }
        }
      }
    }
  }
});

test("lid on, nothing pokes through: the open bundle is the pressed one sprung back by a modest, thickness-led amount", () => {
  for (const thickCm of [0.49, 0.61, 0.7]) {
    const fit = { w: 4.5, t: thickCm * 1.3 };
    const d = boxDims(4, "kiri", fit);
    const up = openBundle(d.innerH, fit);
    const closed = closedBundle(d.innerH, fit);
    assert.ok(up.t >= closed.t - 1e-9 && up.t <= fit.t + 1e-9, "layers take back some of the squash, never more");
    assert.ok(up.proud >= 0.25 && up.proud <= 0.7, `spring ${(up.proud * 10).toFixed(1)} mm`);
    assert.ok(up.proudMid > 0 && up.proudMid <= up.proud + 1e-9, "stands proud in the middle too, a little less than at the ends");
  }
  // A thicker belt springs further.
  assert.ok(openBundle(5.4, { w: 4.5, t: 0.9 }).proud > openBundle(5.4, { w: 4.5, t: 0.64 }).proud);
});
