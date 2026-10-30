// The taekwondo dobok: a variant of the judogi drawing with its own options. The WT cut is a V-neck pullover whose collar takes the grade's colour, the ITF cut a jacket that
// wraps and ties with a black band along the hem for a black belt, both print lettering on the back and carry the flag's placeholder at their own spot, and the check reports
// World Taekwondo's or the ITF's facts (WT Guidelines as of March 1, 2022; ITF Tournament Rules 2023; ITF Umpire Rules, Appendices 2 and 8, 2015).

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, renderJudogi } from "../src/judogi.ts";
import { JUDO_CUT } from "../src/giCut.ts";
import { collarDesc, jacketDesc, jacketOpening, sleeveOutline, topEdge, underEdge } from "../src/judogiJacket.ts";
import { DOBOK_CUTS, DOBOK_GRADES, dobokFlag, dobokMarks, letteringBox, readDobok } from "../src/dobok.ts";
import { layoutMarks, readMarks } from "../src/judogiMarks.ts";

test("no dobok option is a judogi, unchanged", () => {
  assert.equal(readDobok(undefined), undefined);
  assert.equal(readDobok(false), undefined);
  assert.equal(readDobok("wt"), undefined);
  const plain = renderJudogi({ mode: "suit", belt: "black" });
  assert.ok(!/dobok/i.test(plain));
  assert.equal(renderJudogi({ mode: "suit", belt: "black", dobok: false as never }), plain);
});

test("the WT cut, a colour belt's, is the default; each option asked for is taken, anything else is the default", () => {
  const d = readDobok(true)!;
  assert.deepEqual([d.cut, d.grade, d.lettering, d.flag], ["wt", "kup", "TAEKWONDO", true]);
  assert.equal(readDobok({ cut: "itf" })!.lettering, "TAEKWON-DO");
  const odd = readDobok({ cut: "x" as never, grade: 3 as never, lettering: 7 as never })!;
  assert.deepEqual([odd.cut, odd.grade, odd.lettering], ["wt", "kup", "TAEKWONDO"]);
  assert.equal(readDobok({ lettering: false })!.lettering, "");
  assert.equal(readDobok({ lettering: "  KOREA  " })!.lettering, "KOREA");
  assert.equal(readDobok({ lettering: "A".repeat(40) })!.lettering.length, 16);
  assert.equal(readDobok({ flag: false })!.flag, false);
  assert.deepEqual([...DOBOK_CUTS], ["wt", "itf"]);
  assert.deepEqual([...DOBOK_GRADES], ["kup", "poom", "dan"]);
});

test("a karate gi asked for at the same time wins", () => {
  const both = renderJudogi({ mode: "jacket", karate: true, dobok: true });
  assert.equal(both, renderJudogi({ mode: "jacket", karate: true }));
});

test("the WT V-neck: 4 cm wide, its foot some 19 cm under the neck's point, the two edges meeting in the middle", () => {
  const cut = readDobok({ cut: "wt" })!.gi;
  assert.equal(cut.neck, "v");
  assert.ok(Math.abs(cut.lapel / 2.63 - 4) < 0.01);
  const top = topEdge(cut);
  const under = underEdge(cut);
  // Mirror images of each other about the middle.
  top.forEach((p, i) => assert.ok(Math.abs(200 - p[0] - under[i]![0]) < 1e-9 && p[1] === under[i]![1]));
  // They cross at the middle, 18 to 20 cm below the neck's point at the shoulder seam (14 units down the drawing).
  const foot = top.find((p) => p[0] === 100)!;
  const depthCm = (foot[1] - 14) / 2.63;
  assert.ok(depthCm >= 18 && depthCm <= 20, `V depth ${depthCm.toFixed(1)} cm`);
  // The opening is cut a little inside the bands and comes to a point under the V's foot.
  const open = jacketOpening(cut);
  assert.ok(open.some((p) => p[0] === 100 && p[1] > foot[1]));
  assert.notDeepEqual(open, jacketOpening(JUDO_CUT));
  // The collar band in the turning view follows both edges down to the V.
  const c = collarDesc(jacketDesc(1, true, cut), cut);
  assert.ok(c.top.length > 4 && c.under.length > 4);
  assert.ok(Math.max(...c.under.filter((_, k) => k % 2 === 1)) > 55);
});

test("the WT collar takes the grade's colour: the cloth's white, black, or black and red", () => {
  assert.equal(readDobok({ grade: "kup" })!.gi.band, undefined);
  const dan = readDobok({ grade: "dan" })!.gi.band!;
  assert.match(dan.fill, /^#1/);
  assert.equal(dan.bands, undefined);
  const poom = readDobok({ grade: "poom" })!.gi.band!;
  assert.equal(poom.bands?.length, 1);
  assert.match(poom.bands![0]!.fill, /^#c8/);
  const svg = renderJudogi({ mode: "jacket", view: "flat", dobok: { grade: "poom" } });
  assert.ok(svg.includes(poom.fill) && svg.includes(poom.bands![0]!.fill));
  assert.ok(!renderJudogi({ mode: "jacket", view: "flat", dobok: { grade: "kup" } }).includes(dan.fill.toLowerCase() + '"/>'));
});

test("the WT sleeve narrows to the wrist; the ITF one less; the judogi's stays straight", () => {
  const width = (cuff: number): number => {
    const o = sleeveOutline(-1, 1, cuff);
    const cuffOut = o[24]!;
    const cuffIn = o[25]!;
    return Math.hypot(cuffIn[0] - cuffOut[0], cuffIn[1] - cuffOut[1]);
  };
  const wt = readDobok({ cut: "wt" })!.gi.cuff!;
  const itf = readDobok({ cut: "itf" })!.gi.cuff!;
  assert.ok(width(wt) < width(itf) && width(itf) < width(1));
  assert.deepEqual(sleeveOutline(-1, 1, 1), sleeveOutline(-1, 1));
});

test("the ITF jacket wraps as the judogi's does, and a black belt's has a black band along its hem", () => {
  const kup = readDobok({ cut: "itf" })!.gi;
  assert.equal(kup.neck, undefined);
  assert.equal(kup.hemBand, undefined);
  for (const grade of ["poom", "dan"] as const) {
    const band = readDobok({ cut: "itf", grade })!.gi.hemBand!;
    assert.ok(Math.abs(band.h / 2.63 - 2.5) < 0.01);
  }
  const svg = renderJudogi({ mode: "jacket", view: "flat-back", dobok: { cut: "itf", grade: "dan" } });
  assert.ok(svg.includes(readDobok({ cut: "itf", grade: "dan" })!.gi.hemBand!.fill));
  // The ties: on the front only.
  const d = readDobok({ cut: "itf" })!;
  const marks = dobokMarks(d, { fill: "#fff", seam: "#888" });
  assert.ok(marks.front !== undefined && /ellipse/.test(marks.front.body));
  assert.equal(dobokMarks(readDobok({ cut: "wt" })!, { fill: "#fff", seam: "#888" }).front, undefined);
});

test("the back is lettered in black inside the rules' box, and none is drawn when it is turned off", () => {
  for (const cut of DOBOK_CUTS) {
    const d = readDobok({ cut })!;
    const box = letteringBox(d);
    assert.ok(box.w / 2.63 <= 30.01, "30 cm wide at most");
    assert.ok(box.h / 2.63 <= 8.01, "8 cm high at most");
    assert.ok(dobokMarks(d, { fill: "#fff", seam: "#888" }).back!.body.includes("#1b1c21"));
  }
  // ITF: above the belt, which ties at 124.5 units down the back.
  const itf = letteringBox(readDobok({ cut: "itf" })!);
  assert.ok(itf.y + itf.h / 2 < 124.5);
  assert.equal(dobokMarks(readDobok({ lettering: false })!, { fill: "#fff", seam: "#888" }).back, undefined);
});

test("the flag's placeholder goes to each cut's own spot, and artwork given as the emblem takes its place", () => {
  assert.deepEqual(dobokFlag(readDobok({ cut: "wt" })!), { place: "sleeve-right", widthCm: 10, heightCm: 7 });
  assert.deepEqual(dobokFlag(readDobok({ cut: "itf" })!), { place: "chest-right", widthCm: 5, heightCm: 3 });
  // The right chest is on the picture's left, mirrored from the left chest, and is laid out with no mark skipped.
  const spec = readMarks({ emblem: { place: "chest-right", widthCm: 5, heightCm: 3 } })!;
  const laid = layoutMarks(spec, 12);
  assert.equal(laid.skipped.length, 0);
  assert.ok(laid.placed[0]!.box.x < 100);
  assert.ok(renderJudogi({ mode: "jacket", dobok: { flag: false } }).length < renderJudogi({ mode: "jacket", dobok: true }).length);
});

test("the check reports World Taekwondo's facts for the WT cut and the ITF's for the ITF cut", () => {
  const wt = judogiCheck({ dobok: { grade: "dan" } });
  assert.ok(wt.ok);
  const ids = wt.notes.map((n) => n.id);
  for (const id of ["dobok-v-neck", "dobok-collar", "dobok-top", "dobok-trousers", "dobok-flag", "dobok-back"]) assert.ok(ids.includes(id), id);
  assert.ok(wt.notes.every((n) => /World Taekwondo/.test(n.fact) || n.id === "dobok-colour"));
  assert.ok(!judogiCheck({ dobok: true, colour: "blue" }).ok);
  const itf = judogiCheck({ dobok: { cut: "itf", grade: "dan" } });
  assert.ok(itf.ok);
  assert.ok(itf.notes.some((n) => n.id === "dobok-itf-hem" && /drawn, for a black belt/.test(n.fact)));
  assert.ok(itf.notes.some((n) => /17\.3\.1/.test(n.fact)));
  assert.ok(!itf.notes.some((n) => /IJF/.test(n.fact)));
});

test("the title and description name the dobok, in English and Japanese", () => {
  const svg = renderJudogi({ mode: "suit", dobok: true });
  assert.match(svg, /White dobok, suit, front/);
  assert.match(svg, /A taekwondo dobok/);
  assert.match(renderJudogi({ mode: "suit", dobok: true, language: "ja" }), /テコンドーの道着/);
});

test("every cut and grade draws in every layout and view", () => {
  for (const cut of DOBOK_CUTS) {
    for (const grade of DOBOK_GRADES) {
      for (const mode of ["pieces", "suit", "jacket", "pants"] as const) {
        for (const view of ["front", "back", "flat", "flat-back"] as const) {
          const svg = renderJudogi({ mode, view, belt: "black", dobok: { cut, grade }, yaw: 30 });
          assert.ok(svg.startsWith("<svg") && !svg.includes("NaN"), `${cut} ${grade} ${mode} ${view}`);
        }
      }
    }
  }
});
