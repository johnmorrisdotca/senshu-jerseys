// The trousers' hem height: how far above the outer ankle bone the hem stops (the IJF's limit is 5 cm, the IBJJF's 2 cm), at the turns the other judogi tests cover.

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, judogiFrame, renderJudogi } from "../src/judogi.ts";
import { PANTS_HEM, PANTS_HEM_CM, pantsFace, pantsHemCm } from "../src/judogiPants.ts";
import { CM } from "../src/judogiPatch.ts";
import { wellFormed } from "./helpers.ts";

const ink = { uid: "k", cloth: [250, 250, 250] as [number, number, number] };
const PANEL = /<path d="([^"]+)" fill="#fff" fill-opacity="[\d.]+"\/>/;

/** The lowest point the leg's outline reaches, in the drawing's units. */
const lowest = (hem?: number): number => {
  const leg = pantsFace(ink, "front", false, true, hem).clip[1] as string;
  return Math.max(...[...leg.matchAll(/[ML]?(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2])));
};

test("the hem's height is a number of centimetres, 2 to 10, 5 by default (the IJF's limit), and anything else is brought to it", () => {
  assert.deepEqual(PANTS_HEM_CM, { min: 2, max: 10, default: 5, ijf: 5, ibjjf: 2 });
  assert.equal(pantsHemCm(undefined), 5);
  assert.equal(pantsHemCm("3"), 5);
  assert.equal(pantsHemCm(NaN), 5);
  assert.equal(pantsHemCm(0), 2);
  assert.equal(pantsHemCm(40), 10);
  assert.equal(pantsHemCm(3.5), 3.5);
});

test("the default is the drawing as it always was: 5 cm, the hem at the same height, byte for byte", () => {
  assert.equal(lowest(), PANTS_HEM);
  assert.equal(lowest(5), PANTS_HEM);
  for (const view of ["front", "back", "flat", "flat-back"] as const) assert.equal(renderJudogi({ mode: "suit", view, hemAboveAnkleCm: 5 }), renderJudogi({ mode: "suit", view }), view);
  for (const yaw of [0, 30, 70, 150]) assert.equal(judogiFrame({ mode: "pants", yaw, hemAboveAnkleCm: 5 }), judogiFrame({ mode: "pants", yaw }), `yaw ${yaw}`);
});

test("each centimetre of hem is a centimetre of the drawing, and 2 cm stays inside the box the trousers are drawn in", () => {
  for (const cm of [2, 3, 5, 7.5, 10]) assert.ok(Math.abs(lowest(cm) - (PANTS_HEM - (cm - 5) * CM)) < 0.01, `${cm} cm`);
  assert.ok(lowest(2) < 270, "inside the 270 units of the trousers' box");
  assert.ok(lowest(2) > lowest(5) && lowest(5) > lowest(10));
});

test("a different hem changes the legs and not the knee: the knee panel stays at the same height", () => {
  const panel = (cm: number): number[] => [...(PANEL.exec(pantsFace(ink, "front", false, true, cm).body)![1] as string).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));
  const [a, b] = [panel(2), panel(10)];
  assert.equal(a.length, b.length);
  a.forEach((y, i) => assert.ok(Math.abs(y - (b[i] as number)) < 0.01, `corner ${i}: ${y} against ${b[i]}`));
  assert.notEqual(pantsFace(ink, "back", false, true, 2).body, pantsFace(ink, "back").body);
});

test("the hem is drawn at the turns the judogi tests cover, in every mode, well formed and in the same box", () => {
  const box = (svg: string): string => /viewBox="([^"]+)"/.exec(svg)![1]!;
  for (const mode of ["pants", "suit", "pieces"] as const) {
    for (const yaw of [0, 30, 70, 150]) {
      const base = judogiFrame({ mode, yaw });
      for (const cm of [2, 10]) {
        const svg = judogiFrame({ mode, yaw, hemAboveAnkleCm: cm });
        assert.equal(wellFormed(svg), null, `${mode} ${cm} cm yaw ${yaw}`);
        assert.notEqual(svg, base, `${mode} ${cm} cm yaw ${yaw} differs`);
        assert.equal(box(svg), box(base), `${mode} ${cm} cm yaw ${yaw}: the same box`);
      }
    }
  }
  for (const view of ["front", "back", "flat", "flat-back"] as const) assert.equal(wellFormed(renderJudogi({ mode: "suit", view, hemAboveAnkleCm: 2 })), null, view);
});

test("two hems on one page do not share ids", () => {
  const id = (s: string): string => /id="(jg[0-9a-z]+)/.exec(s)![1]!;
  assert.notEqual(id(renderJudogi({ mode: "pants", hemAboveAnkleCm: 2 })), id(renderJudogi({ mode: "pants" })));
});

test("the check holds a chosen hem to its rule: the IJF's 5 cm, the IBJJF's 2 cm", () => {
  const note = (o: Parameters<typeof judogiCheck>[0]) => judogiCheck(o).notes.find((n) => n.id === "trouser-hem");
  assert.equal(note({}), undefined, "no note when no hem is asked for");
  assert.equal(note({ hemAboveAnkleCm: 5 })?.met, true);
  assert.equal(note({ hemAboveAnkleCm: 2 })?.met, true);
  assert.equal(note({ hemAboveAnkleCm: 7 })?.met, false);
  assert.match(note({ hemAboveAnkleCm: 7 })!.fact, /IJF/);
  assert.equal(note({ bjj: true, hemAboveAnkleCm: 2 })?.met, true);
  assert.equal(note({ bjj: true, hemAboveAnkleCm: 5 })?.met, false);
  assert.match(note({ bjj: true, hemAboveAnkleCm: 5 })!.fact, /IBJJF/);
});
