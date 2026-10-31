// The belt variants: how a belt is tied (the knot's style and how far the ends hang, beltTie.ts), each art's arrangements in `BELT_PRESETS` (karate's bars, the ITF's
// Roman numerals and tips, the poom belt), and the garments' own ties (a karate gi's long ends, a dobok's). Every preset draws worn, tied alone and folded, from every side.

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, renderJudogi, type JudogiOptions } from "../src/judogi.ts";
import { BELT_KNOTS, BELT_TAIL_CM, GARMENT_TIES, endLengths, readTie, tieEnds, tieReach } from "../src/beltTie.ts";
import { BELT_PRESETS, readStyle, roman, numeralBox } from "../src/judogiStripes.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { turn, type VolumeDesc } from "../src/volume.ts";

const pieces = (o: JudogiOptions): VolumeDesc[] => [...renderJudogi({ ...o, yaw: 0 }).matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse(m[1]!.replace(/&quot;/g, '"')) as VolumeDesc);
const strapOf = (o: JudogiOptions): VolumeDesc => pieces(o).find((d) => d.strap !== undefined)!;
const rad = (d: number): number => (d * Math.PI) / 180;

/** The garment a preset is shown on: its art's own. */
const garmentFor = (art: string): JudogiOptions => (art === "karate" ? { karate: true } : art === "taekwondo" ? { dobok: { cut: "itf", grade: "dan" } } : {});

test("a tie is read safely: the garment's own unless asked, the knot one of three, the ends 15 to 55 cm", () => {
  assert.deepEqual(readTie(undefined, undefined), { knot: "spread", tailCm: 25 });
  assert.deepEqual(readTie("hanging", 40), { knot: "hanging", tailCm: 40 });
  assert.deepEqual(readTie("knotted" as never, 400), { knot: "spread", tailCm: BELT_TAIL_CM.max });
  assert.deepEqual(readTie(undefined, 2, GARMENT_TIES.karate), { knot: "hanging", tailCm: BELT_TAIL_CM.min });
  assert.deepEqual(readTie(undefined, Number.NaN, GARMENT_TIES["dobok-itf"]), GARMENT_TIES["dobok-itf"]);
  assert.deepEqual([...BELT_KNOTS], ["spread", "hanging", "single"]);
});

test("the judogi's own tie draws exactly as before, and asking for it changes nothing", () => {
  const plain = renderJudogi({ mode: "suit", belt: "black" });
  assert.ok(!/&quot;knot&quot;/.test(plain));
  assert.equal(renderJudogi({ mode: "suit", belt: "black", beltKnot: "spread", beltTailCm: 25 }), plain);
  // The ends of the judogi's tie are the ones the strap always had.
  const [[l0, l1], [r0, r1]] = tieEnds(undefined, 0);
  assert.deepEqual([l0, r0], [[96, 6], [105, 5]]);
  assert.ok(Math.abs(l1[0] - 80) < 1e-9 && Math.abs(l1[1] - 70) < 1e-9 && Math.abs(r1[0] - 119) < 1e-9 && Math.abs(r1[1] - 63.88) < 1e-9);
});

test("the karate gi and the dobok wear their belts long by default; the competition cuts within the WKF's limits", () => {
  const tie = (o: JudogiOptions): [unknown, unknown] => {
    const s = strapOf({ mode: "suit", belt: "black", ...o }).strap!;
    return [s.knot, s.tail];
  };
  assert.deepEqual(tie({ karate: true }), ["hanging", 50]);
  assert.deepEqual(tie({ karate: { cut: "kumite" } }), ["hanging", 25]);
  assert.deepEqual(tie({ dobok: true }), ["hanging", 38]);
  assert.deepEqual(tie({ dobok: { cut: "itf" } }), ["single", 40]);
  assert.deepEqual(tie({ karate: true, beltKnot: "spread", beltTailCm: 30 }), ["spread", 30]);
  assert.deepEqual(tie({}), [undefined, undefined]);
  // The checks say what is drawn: a training gi's long belt is met, a kumite gi's 50 cm belt is past three-quarters of the thigh.
  const ends = (o: JudogiOptions): { met: boolean; fact: string } => judogiCheck(o).notes.find((n) => n.id === "karate-belt-ends")!;
  assert.ok(ends({ karate: true }).met && /drawn 50 cm/.test(ends({ karate: true }).fact));
  assert.ok(ends({ karate: { cut: "kumite" } }).met);
  assert.ok(!ends({ karate: { cut: "kumite" }, beltTailCm: 50 }).met);
  assert.ok(judogiCheck({ dobok: { cut: "itf" }, belt: "black" }).notes.find((n) => n.id === "dobok-itf-belt")!.met);
  assert.ok(!judogiCheck({ dobok: { cut: "itf" }, belt: "black", beltKnot: "hanging" }).notes.find((n) => n.id === "dobok-itf-belt")!.met);
  assert.ok(!judogiCheck({ beltTailCm: 45 }).notes.find((n) => n.id === "belt-ends")!.met);
});

test("the ends hang as far as asked: their lowest cells reach the tail's length below the knot", () => {
  for (const knot of BELT_KNOTS) {
    for (const tailCm of [15, 25, 40, 55]) {
      const d = strapOf({ mode: "suit", belt: "brown", beltKnot: knot, beltTailCm: tailCm });
      const s = d.strap!;
      const lowest = Math.max(...pieceCells(d).flatMap((c) => [c.p[1]!, c.p[4]!, c.p[7]!]));
      const knotY = s.y + s.sag + s.w / 2;
      const reach = tieReach({ knot, tailCm });
      assert.ok(Math.abs(lowest - (knotY + reach)) < s.w, `${knot} ${tailCm}: lowest ${lowest.toFixed(1)}, the ends reach ${(knotY + reach).toFixed(1)}`);
      const [l, r] = endLengths({ knot, tailCm });
      assert.ok(Math.abs(l / 2.63 - tailCm) < 0.2 && r < l);
    }
  }
});

test("hanging ends fall side by side and apart; spread ends part in a V", () => {
  const gapAtFoot = (knot: "spread" | "hanging" | "single", tailCm: number): number => {
    const [[, a], [, b]] = tieEnds({ knot, tailCm }, 0);
    return b[0] - a[0];
  };
  // Twelve units is a belt's width: two hanging ends 50 cm long leave at least a belt's width between them, and lean less than a spread V's.
  assert.ok(gapAtFoot("hanging", 50) > 24);
  assert.ok(gapAtFoot("hanging", 50) < gapAtFoot("spread", 50));
  for (const knot of ["hanging", "single"] as const) {
    for (const [from, to] of tieEnds({ knot, tailCm: 50 }, 0)) assert.ok(Math.abs(to[0] - from[0]) / (to[1] - from[1]) < 0.18, `${knot} leans less than ten degrees`);
  }
});

test("a belt tied once round is one layer thick, twice round two", () => {
  const depth = (knot: "hanging" | "single"): number => {
    const d = strapOf({ mode: "belt", belt: "black", beltKnot: knot });
    // The ring's front face away from the knot: the cells nearest the eye a third of the way to the side, within the band's height.
    const s = d.strap!;
    return Math.max(...pieceCells(d).filter((c) => Math.abs(c.p[0]! - s.a / 3) < 3 && c.p[1]! > s.y && c.p[1]! < s.y + s.w).map((c) => c.p[2]!));
  };
  const t = strapOf({ mode: "belt", belt: "black" }).strap!.t;
  assert.ok(Math.abs(depth("hanging") - depth("single") - t) < 0.2, `${depth("hanging")} ${depth("single")}`);
});

test("the ITF's degrees are gold Roman numerals across one end, kept inside the belt", () => {
  assert.deepEqual([1, 4, 7, 9, 10].map(roman), ["I", "IV", "VII", "IX", "X"]);
  const style = readStyle({ numeral: { value: 8 } })!;
  assert.deepEqual([style.numeral!.text, style.numeral!.fill, style.numeral!.end], ["VIII", "#c9a030", 0]);
  assert.equal(readStyle({ numeral: { value: 4, end: "right", colour: "white" } })!.numeral!.end, 1);
  assert.equal(readStyle({ numeral: { value: "4" as never } }), undefined);
  for (const v of [1, 4, 8, 10]) {
    const n = readStyle({ numeral: { value: v } })!.numeral!;
    const box = numeralBox(n, 0, 5.9);
    assert.ok(box.x1 > box.x0 && box.x0 > 9 && box.h <= 2.4 * 2.63 + 1e-9, `${n.text}`);
  }
  const svg = renderJudogi({ mode: "belt", belt: "black", beltStyle: { numeral: { value: 4 } } });
  assert.ok(svg.length > renderJudogi({ mode: "belt", belt: "black" }).length);
});

test("every art has its variants, each with a source and, where its art ties it so, its own tie", () => {
  const arts = new Set(BELT_PRESETS.map((p) => p.art));
  assert.deepEqual([...arts].sort(), ["bjj", "judo", "karate", "taekwondo"]);
  for (const p of BELT_PRESETS) {
    assert.ok(p.source.length > 0 && p.label.length > 0, p.id);
    if (p.art === "karate") assert.equal(p.tie?.knot, "hanging", p.id);
    if (p.id.startsWith("itf-")) assert.equal(p.tie?.knot, "single", p.id);
  }
  const ids = BELT_PRESETS.map((p) => p.id);
  for (const id of ["karate-brown-1", "karate-dan-3", "itf-senior-4", "itf-junior-2", "itf-gup-blue-red", "poom", "wt-dan-bars-3"]) assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every variant draws worn, tied alone and folded, and every cell turns to a number at every angle", () => {
  const bad = (svg: string): boolean => /NaN|undefined|Infinity/.test(svg);
  for (const p of BELT_PRESETS) {
    const base: JudogiOptions = { ...garmentFor(p.art), belt: p.belt, beltStyle: p.style, ...(p.tie === undefined ? {} : { beltKnot: p.tie.knot, beltTailCm: p.tie.tailCm }) };
    for (const mode of ["suit", "belt", "folded"] as const) {
      const svg = renderJudogi({ ...base, mode, bare: true });
      assert.ok(svg.startsWith("<svg") && !bad(svg), `${p.id} ${mode}`);
      const all = pieces({ ...base, mode, bare: true });
      assert.ok(all.length > 0, `${p.id} ${mode}: pieces`);
      for (const d of all.filter((x) => x.strap !== undefined || x.solid !== undefined)) {
        const cells = pieceCells(d);
        assert.ok(cells.length > 0);
        for (let yaw = 0; yaw < 360; yaw += 30) {
          for (const pitch of [-20, 0, 15]) {
            const [cy, sy, cp, sp] = [Math.cos(rad(yaw)), Math.sin(rad(yaw)), Math.cos(rad(pitch)), Math.sin(rad(pitch))];
            for (const c of cells) for (let k = 0; k < 3; k++) assert.ok(turn(c.p[3 * k]!, c.p[3 * k + 1]!, c.p[3 * k + 2]!, cy, sy, cp, sp).every(Number.isFinite), `${p.id} ${mode} ${yaw} ${pitch}`);
          }
        }
      }
    }
    // The flat views draw the same tie.
    for (const mode of ["suit", "belt"] as const) assert.ok(!bad(renderJudogi({ ...base, mode, view: "flat" })), `${p.id} flat ${mode}`);
  }
  // Each knot and the longest ends, on each garment, from every side as a full drawing.
  for (const knot of BELT_KNOTS) {
    for (const g of [{}, { karate: true }, { dobok: true }, { dobok: { cut: "itf" } }] as JudogiOptions[]) {
      for (let yaw = 0; yaw < 360; yaw += 45) assert.ok(!bad(renderJudogi({ ...g, mode: "suit", belt: "red-white", beltKnot: knot, beltTailCm: 55, yaw, bare: true })), `${knot} ${yaw}`);
    }
  }
});

test("the drawing's box holds the longest ends, worn on the jacket alone and tied alone", () => {
  const box = (o: JudogiOptions): number[] => (/viewBox="([^"]+)"/.exec(renderJudogi(o))![1] as string).split(" ").map(Number);
  for (const mode of ["jacket", "belt"] as const) {
    const short = box({ mode, belt: "black" });
    const long = box({ mode, belt: "black", beltKnot: "hanging", beltTailCm: 55 });
    assert.ok(long[3]! > short[3]!, mode);
    const d = strapOf({ mode, belt: "black", beltKnot: "hanging", beltTailCm: 55 });
    const lowest = Math.max(...pieceCells(d).flatMap((c) => [c.p[1]!, c.p[4]!, c.p[7]!]));
    assert.ok(lowest < long[1]! + long[3]!, `${mode}: the ends end at ${lowest.toFixed(1)}, inside the box to ${(long[1]! + long[3]!).toFixed(1)}`);
  }
});
