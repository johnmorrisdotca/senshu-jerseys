// The taekwondo dobok: a variant of the judogi drawing with its own options. The WT cut is a V-neck pullover whose collar takes the grade's colour, the ITF cut a jacket that
// wraps and ties with a black band along the hem for a black belt, both print lettering on the back and carry the flag's placeholder at their own spot, and the check reports
// World Taekwondo's or the ITF's facts (WT Guidelines as of March 1, 2022; ITF Tournament Rules 2023; ITF Umpire Rules, Appendices 2 and 8, 2015).

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, renderJudogi } from "../src/judogi.ts";
import { JUDO_CUT } from "../src/giCut.ts";
import { collarDesc, jacketDesc, jacketOpening, sleeveOutline, topEdge, underEdge } from "../src/judogiJacket.ts";
import { hipOutline, hipsOf, legOutline, hemOf } from "../src/judogiPants.ts";
import { insideWithMargin } from "../src/judogiPlaces.ts";
import type { Pt } from "../src/path.ts";
import { DOBOK_CUTS, DOBOK_GRADES, dobokFlag, dobokMarks, dobokPantsMarks, letteringBox, readDobok } from "../src/dobok.ts";
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
  // The drawing's ids are a hash whose length varies, and every cell repeats them: compare with the ids taken out.
  const bare = (o: object): string => renderJudogi({ mode: "jacket", ...o }).replace(/jg[0-9a-z]+/g, "ID");
  assert.ok(bare({ dobok: { flag: false } }).length < bare({ dobok: true }).length);
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

// The poom collar, checked against World Taekwondo's own drawing of the cadet's Poomsae Competition Uniform #2 (2022 Guidelines of Identifications): the collar band is
// split along its length in two equal halves, red along the neck's edge and black on the outside, all the way down both bands to the V.
test("the poom collar: red along the neck's edge, black outside it, in equal halves", () => {
  const poom = readDobok({ grade: "poom" })!.gi.band!;
  assert.equal(poom.bands!.length, 1);
  assert.deepEqual([poom.bands![0]!.from, poom.bands![0]!.to], [0, 0.5]);
  // Drawn: the red band's points lie nearer the neck's middle (x = 100) than the black band's, on both sides of the V.
  const svg = renderJudogi({ mode: "jacket", view: "flat", dobok: { grade: "poom" } });
  const nearness = (fill: string): number[] => [...svg.matchAll(new RegExp(`<path d="([^"]*)" fill="${fill}"/>`, "g"))].map((m) => {
    const xs = [...m[1]!.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)].map((q) => Math.abs(Number(q[1]) - 100));
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  });
  const red = nearness(poom.bands![0]!.fill);
  const black = nearness(poom.fill);
  assert.equal(red.length, 2);
  assert.ok(black.length >= 2);
  assert.ok(Math.max(...red) < Math.min(...black.slice(0, 2)) + 1e-9, `red ${red}, black ${black}`);
});

const GOLD_NUMERAL = /#c9a030/i;
const stripePolys = (body: string): Pt[][] => [...body.matchAll(/<path d="(M[^"]*Z)" fill="#1b1c21"\/>/g)].map((m) => [...m[1]!.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)].map((q) => [Number(q[1]), Number(q[2])] as Pt));

test("an ITF 4th to 6th Dan dobok has black stripes down both sleeves and both trouser legs, inside the cloth, 3 cm wide", () => {
  for (const dan of [4, 5, 6]) {
    const d = readDobok({ cut: "itf", grade: "dan", dan })!;
    assert.equal(d.stripes, true);
    const front = stripePolys(dobokMarks(d, { fill: "#fff", seam: "#888" }).front!.body);
    const back = stripePolys(dobokMarks(d, { fill: "#fff", seam: "#888" }).back!.body);
    assert.equal(front.length, 2);
    assert.equal(back.length, 2);
    for (const [k, side] of ([-1, 1] as const).entries()) {
      const outline = sleeveOutline(side, d.gi.sleeve, d.gi.cuff);
      // Below the armhole's seam every point of the stripe is in the sleeve, a centimetre from its edge.
      const lower = front[k]!.filter((p) => p[1] > 110);
      assert.ok(lower.length > 8);
      for (const p of lower) assert.ok(insideWithMargin(outline, p, 2.6 * 0.5), `sleeve ${side} ${p}`);
      // 3 cm wide, taken across at the middle of the stripe.
      const half = front[k]!.length / 2;
      const [a, b] = [front[k]![Math.floor(half / 2)]!, front[k]![front[k]!.length - 1 - Math.floor(half / 2)]!];
      assert.ok(Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) / 2.63 - 3) < 0.35, "3 cm wide");
    }
    for (const worn of [false, true]) {
      const legs = stripePolys(dobokPantsMarks(d, 5, worn).front!.body);
      assert.equal(legs.length, 2);
      const hem = hemOf(5);
      for (const [k, side] of ([-1, 1] as const).entries()) {
        const cloth = [hipOutline(hipsOf(worn)), legOutline(side, hem)];
        for (const p of legs[k]!) assert.ok(cloth.some((poly) => insideWithMargin(poly, p, 0)), `leg ${side} ${worn} ${p}`);
        assert.ok(Math.max(...legs[k]!.map((p) => p[1])) < hem - 8, "stops above the hem's break");
      }
    }
    const svg = renderJudogi({ mode: "pieces", view: "flat", belt: "black", dobok: { cut: "itf", grade: "dan", dan } });
    assert.ok((svg.match(/fill="#1b1c21"\/>/g) ?? []).length >= 4);
  }
});

test("no stripes below the 4th Dan or above the 6th, on the WT cut, for a colour belt, or in competition: the rules name them for those three degrees only", () => {
  const plain = (o: object): string => renderJudogi({ mode: "pieces", view: "flat", belt: "black", dobok: { cut: "itf", grade: "dan", ...o } });
  const stripy = (svg: string): number => (svg.match(/<clipPath id="[^"]*S[fb][LR]"/g) ?? []).length;
  assert.ok(stripy(plain({ dan: 5 })) >= 2);
  for (const o of [{ dan: 3 }, { dan: 7 }, { dan: 9 }, {}, { dan: 5, competition: true }]) assert.equal(stripy(plain(o)), 0, JSON.stringify(o));
  assert.equal(readDobok({ cut: "wt", grade: "dan", dan: 5 })!.stripes, false);
  assert.equal(readDobok({ cut: "itf", grade: "kup", dan: 5 })!.stripes, false);
  assert.equal(readDobok({ cut: "itf", grade: "dan", dan: 5, competition: true })!.stripes, false);
  assert.deepEqual(dobokPantsMarks(readDobok({ cut: "itf", grade: "dan", dan: 7 })!, 5), {});
  // The degree is a whole number from 1 to 9; anything else is none.
  assert.equal(readDobok({ cut: "itf", grade: "dan", dan: 4.4 })!.dan, 4);
  assert.equal(readDobok({ cut: "itf", grade: "dan", dan: 40 })!.dan, 9);
  assert.equal(readDobok({ cut: "itf", grade: "dan", dan: "5" as never })!.dan, undefined);
});

test("an ITF black belt takes the dobok's degree in gold Roman numerals unless the belt's own style names one", () => {
  const belt = (o: object, extra: object = {}): string => renderJudogi({ mode: "belt", belt: "black", dobok: { cut: "itf", grade: "dan", ...o }, ...extra });
  const none = belt({});
  const four = belt({ dan: 4 });
  assert.notEqual(four, none);
  assert.ok(GOLD_NUMERAL.test(four) || /#[cd][0-9a-f]{5}/i.test(four));
  assert.notEqual(belt({ dan: 4 }), belt({ dan: 6 }));
  // The belt's own numeral wins; a colour belt and a WT dobok are not given one.
  assert.equal(belt({ dan: 4 }, { beltStyle: { numeral: { value: 2 } } }).replace(/jg[0-9a-z]+/g, "ID"), belt({ dan: 2 }).replace(/jg[0-9a-z]+/g, "ID"));
  assert.equal(renderJudogi({ mode: "belt", belt: "brown", dobok: { cut: "itf", grade: "dan", dan: 4 } }).replace(/jg[0-9a-z]+/g, "ID"), renderJudogi({ mode: "belt", belt: "brown", dobok: { cut: "itf", grade: "dan" } }).replace(/jg[0-9a-z]+/g, "ID"));
  assert.equal(renderJudogi({ mode: "belt", belt: "black", dobok: { cut: "wt", grade: "dan", dan: 4 } }).replace(/jg[0-9a-z]+/g, "ID"), renderJudogi({ mode: "belt", belt: "black", dobok: { cut: "wt", grade: "dan" } }).replace(/jg[0-9a-z]+/g, "ID"));
});

test("the check says what is drawn of the 4th to 6th Dan's stripes, and cites the rule", () => {
  const note = (o: object) => judogiCheck({ dobok: { cut: "itf", grade: "dan", ...o } }).notes.find((n) => n.id === "dobok-itf-stripes")!;
  assert.match(note({ dan: 5 }).fact, /17\.3\.1/);
  assert.match(note({ dan: 5 }).fact, /5th Dan are drawn/);
  assert.match(note({ dan: 5, competition: true }).fact, /left off, for competition/);
  assert.match(note({ dan: 2 }).fact, /none are drawn/);
  assert.ok(judogiCheck({ dobok: { cut: "itf", grade: "dan", dan: 5 }, belt: "black" }).ok);
});
