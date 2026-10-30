// The karate gi: a variant of the judogi drawing with its own options. The sleeve is cut to the wrist, mid-forearm or the elbow, the cut sets the jacket's hem, the competition cuts
// carry nothing unasked, the belt's ends hang as far as asked, and the check reports the WKF's measures (WKF Kumite Competition Rules 2024 and Karate Competition Rules 2020, Article 2).

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, renderJudogi } from "../src/judogi.ts";
import { JUDO_CUT } from "../src/giCut.ts";
import { jacketDesc, chestSpan, sleeveOutline } from "../src/judogiJacket.ts";
import { legOutline } from "../src/judogiPants.ts";
import { corners } from "../src/judogiPlaces.ts";
import { KARATE_SLEEVES, KARATE_SLEEVE_SHARE, KARATE_TAIL_CM, karateSpots, karateTail, readKarate } from "../src/karategi.ts";
import type { Pt } from "../src/path.ts";

const inside = (p: Pt, poly: readonly Pt[]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i] as Pt, poly[j] as Pt];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const circle = (x: number, y: number, r: number): Pt[] => Array.from({ length: 16 }, (_, i) => [x + r * Math.cos((i * Math.PI) / 8), y + r * Math.sin((i * Math.PI) / 8)] as Pt);

test("no karate option is a judogi, unchanged", () => {
  assert.equal(readKarate(undefined), undefined);
  assert.equal(readKarate(false), undefined);
  assert.equal(readKarate("karate"), undefined);
  const plain = renderJudogi({ mode: "suit", belt: "black" });
  assert.ok(!/karate/i.test(plain));
  assert.equal(renderJudogi({ mode: "suit", belt: "black", karate: false as never }), plain);
});

test("the training cut is the default: full sleeve, the text and both patches, long belt ends", () => {
  const k = readKarate(true)!;
  assert.deepEqual([k.sleeve, k.cut, k.text, k.sleevePatch, k.legPatch, k.tailCm], ["full", "training", "空手", true, true, 50]);
  const kumite = readKarate({ cut: "kumite" })!;
  assert.deepEqual([kumite.text, kumite.sleevePatch, kumite.legPatch, kumite.tailCm], ["", false, false, 20]);
  const kata = readKarate({ cut: "kata" })!;
  assert.deepEqual([kata.text, kata.sleevePatch, kata.legPatch, kata.tailCm], ["", false, false, 20]);
});

test("each thing asked for is taken, anything else is the default", () => {
  const k = readKarate({ sleeve: "short", cut: "kata", text: "極真 空手道 x", thread: "red", patches: { leg: false, colour: "navy" }, tailCm: 30 })!;
  assert.deepEqual([k.sleeve, k.cut, k.text, k.thread.name, k.sleevePatch, k.legPatch, k.patchColour.name, k.tailCm], ["short", "kata", "極真空手", "red", true, false, "navy", 30]);
  const odd = readKarate({ sleeve: "long" as never, cut: "x" as never, text: 5 as never, tailCm: Number.NaN })!;
  assert.deepEqual([odd.sleeve, odd.cut, odd.text, odd.tailCm], ["full", "training", "空手", 50]);
  assert.equal(readKarate({ text: false })!.text, "");
  assert.equal(readKarate({ cut: "kumite", text: "空手" })!.text, "空手");
  assert.equal(readKarate({ patches: false })!.sleevePatch, false);
  assert.equal(readKarate({ cut: "kumite", patches: true })!.legPatch, true);
});

test("the belt's ends are 15 to 70 cm, and a multiple of the usual 25 cm", () => {
  assert.equal(readKarate({ tailCm: 3 })!.tailCm, KARATE_TAIL_CM.min);
  assert.equal(readKarate({ tailCm: 400 })!.tailCm, KARATE_TAIL_CM.max);
  assert.equal(karateTail(readKarate({ tailCm: 25 })!), 1);
  assert.equal(karateTail(readKarate({ tailCm: 50 })!), 2);
});

test("a sleeve is cut shorter and shorter, the cuff keeping its width", () => {
  const cuff = (sleeve: (typeof KARATE_SLEEVES)[number]): { y: number; width: number } => {
    const q = jacketDesc(1, false, readKarate({ sleeve })!.gi).sl[0]!.q;
    return { y: q[3]!, width: Math.hypot(q[6]! - q[2]!, q[7]! - q[3]!) };
  };
  const [full, three, short] = KARATE_SLEEVES.map(cuff) as [ReturnType<typeof cuff>, ReturnType<typeof cuff>, ReturnType<typeof cuff>];
  assert.ok(full.y > three.y && three.y > short.y, `${full.y} ${three.y} ${short.y}`);
  assert.ok(Math.abs(full.width - three.width) < 1e-6 && Math.abs(full.width - short.width) < 1e-6);
  assert.deepEqual(KARATE_SLEEVES.map((s) => KARATE_SLEEVE_SHARE[s]), [1, 0.76, 0.52]);
  assert.deepEqual(jacketDesc(1, false, JUDO_CUT).sl[0]!.q, jacketDesc(1, false).sl[0]!.q);
  // Each length draws a different jacket.
  const drawn = new Set(KARATE_SLEEVES.map((sleeve) => renderJudogi({ mode: "jacket", karate: { sleeve } })));
  assert.equal(drawn.size, 3);
});

test("the sleeve is the WKF's: to the bend of the wrist at most and halfway down the forearm at least, and the elbow is outside it", () => {
  const met = (sleeve: (typeof KARATE_SLEEVES)[number]): boolean => judogiCheck({ karate: { sleeve } }).notes.find((n) => n.id === "karate-sleeve")!.met;
  assert.deepEqual(KARATE_SLEEVES.map(met), [true, true, false]);
  const fact = judogiCheck({ karate: true }).notes.find((n) => n.id === "karate-sleeve")!.fact;
  assert.match(fact, /bend of the wrist/);
  assert.match(fact, /halfway down the forearm/);
});

test("the cut sets the jacket's hem: a kumite jacket just covers the hips, a kata jacket hangs longer", () => {
  const hem = (cut: "training" | "kumite" | "kata"): number => jacketDesc(1, true, readKarate({ cut })!.gi).y.at(-1)!;
  assert.ok(hem("kumite") < hem("training") && hem("training") < hem("kata") && hem("kata") <= 214);
  assert.equal(jacketDesc(1, true).y.at(-1), 205);
});

test("a karate gi's cloth is plain: no quilted skirt, no waist seam, a narrower lapel, softer folds", () => {
  const gi = renderJudogi({ mode: "jacket", karate: { cut: "kumite" } });
  const judo = renderJudogi({ mode: "jacket" });
  assert.ok(gi.length < judo.length);
  assert.ok(readKarate(true)!.gi.lapel < JUDO_CUT.lapel && readKarate(true)!.gi.lapel / 2.63 <= 4);
  assert.ok(readKarate({ cut: "kumite" })!.gi.soft < readKarate({ cut: "kata" })!.gi.soft);
  assert.ok(readKarate(true)!.gi.plain && !JUDO_CUT.plain);
});

test("the text, the patches and the belt are drawn only when the cut has them or they are asked for", () => {
  const draw = (karate: object | boolean): string => renderJudogi({ mode: "suit", belt: "black", karate: karate as never });
  assert.match(draw(true), /空/);
  assert.match(draw(true), /data-thick/);
  assert.ok(!/空/.test(draw({ cut: "kumite" })));
  assert.ok(!/data-thick/.test(draw({ cut: "kumite" })));
  assert.match(draw({ cut: "kumite", text: "組手" }), /組/);
  assert.match(draw({ cut: "kumite", patches: true }), /data-thick/);
  assert.match(draw({ text: "極真" }), /極/);
  assert.match(renderJudogi({ karate: true }), /karate gi/i);
  assert.match(renderJudogi({ karate: true, language: "ja" }), /空手着/);
});

test("the text lies on the chest, beside the lapel and under the collar, and the patches lie on the sleeve and on the leg", () => {
  for (const sleeve of KARATE_SLEEVES) {
    for (const cut of ["training", "kumite", "kata"] as const) {
      const k = readKarate({ sleeve, cut, text: "空手道", patches: true })!;
      const at = karateSpots(k);
      const t = at.text!;
      for (const [x, y] of corners({ x: t.x, y: t.y, w: t.w, h: t.h, rot: t.rot })) {
        const [l, r] = chestSpan(y, k.gi);
        assert.ok(x > l && x < r, `${sleeve} ${cut}: a corner at ${x.toFixed(1)}, ${y.toFixed(1)} is on the chest (${l.toFixed(1)} to ${r.toFixed(1)})`);
      }
      const s = at.sleeve!;
      for (const p of circle(s.x, s.y, s.r)) assert.ok(inside(p, sleeveOutline(1, k.gi.sleeve)), `${sleeve}: the sleeve patch is on the sleeve`);
      const l = at.leg!;
      for (const p of circle(l.x, l.y, l.r)) assert.ok(inside(p, legOutline(1)), "the leg patch is on the leg");
    }
  }
});

test("the belt's ends hang as far as asked, in the flat drawing and in the turning view's description", () => {
  const ends = (tailCm: number): number => {
    const svg = renderJudogi({ mode: "suit", belt: "black", karate: { tailCm }, bare: true });
    const [, , , h] = /viewBox="([-\d. ]+)"/.exec(svg)![1]!.split(" ").map(Number);
    return h!;
  };
  assert.ok(ends(50) >= ends(25));
  const flat = (tailCm: number): string => renderJudogi({ mode: "jacket", view: "flat", belt: "black", karate: { tailCm } });
  assert.notEqual(flat(25), flat(60));
  const height = (svg: string): number => Number(/viewBox="[-\d. ]+ ([\d.]+)"/.exec(svg)![1]);
  assert.ok(height(flat(60)) > height(flat(25)), "a jacket with long ends has a taller box so they are not cut off");
});

test("the check reports the competition's measures, and a competition gi carries nothing personal", () => {
  const check = (karate: object): ReturnType<typeof judogiCheck> => judogiCheck({ karate: karate as never });
  const training = check({});
  assert.ok(training.ok, JSON.stringify(training.notes.filter((n) => !n.met)));
  assert.deepEqual(training.notes.map((n) => n.id), ["karate-jacket", "karate-sleeve", "karate-trouser", "karate-belt-ends", "karate-plain"]);
  assert.ok(training.notes.every((n) => /WKF|Wikipedia/.test(n.fact)));
  assert.ok(check({ cut: "kumite" }).ok);
  assert.ok(check({ cut: "kata" }).ok);
  assert.equal(check({ cut: "kumite", text: "空手" }).ok, false);
  assert.equal(check({ cut: "kata", patches: true }).ok, false);
  assert.equal(check({ cut: "kumite", tailCm: 70 }).notes.find((n) => n.id === "karate-belt-ends")!.met, false);
  assert.equal(check({ tailCm: 70 }).notes.find((n) => n.id === "karate-belt-ends")!.met, true);
  // The judogi's own check is untouched.
  assert.ok(judogiCheck().notes.some((n) => n.id === "jacket-cover"));
  assert.ok(!judogiCheck().notes.some((n) => n.id.startsWith("karate")));
});

test("every garment of the karate gi draws, every 30 degrees, with nothing undefined or not a number in it", () => {
  for (const karate of [true, { sleeve: "three-quarter" }, { sleeve: "short", tailCm: 70 }, { cut: "kumite" }, { cut: "kata", text: "形" }]) {
    for (const mode of ["suit", "jacket", "pants", "belt", "pieces"] as const) {
      for (let yaw = 0; yaw < 360; yaw += 90) {
        const svg = renderJudogi({ mode, belt: "brown", karate: karate as never, yaw, bare: true });
        assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"), `${mode} ${yaw}`);
        assert.ok(!/NaN|undefined|Infinity/.test(svg), `${JSON.stringify(karate)} ${mode} ${yaw}`);
      }
    }
    for (const view of ["flat", "flat-back"] as const) assert.ok(!/NaN|undefined/.test(renderJudogi({ mode: "pieces", view, karate: karate as never })));
  }
});
