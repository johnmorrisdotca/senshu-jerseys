// The judogi's proportions, pinned to what John's reference photographs measure (the method and every number are in the comments of
// src/judogiJacket.ts and src/judogiPants.ts: landmarks marked on each photograph, divided by that photograph's own jacket height L or
// trouser length, then the median taken). A figure here is a photograph median with the tolerance it earns: 5 per cent where the photographs
// agree, 8 where they split into the form's and the man's.

import assert from "node:assert/strict";
import { test } from "node:test";
import { beltRound, jacketDesc } from "../src/judogiJacket.ts";
import { pantsDesc } from "../src/judogiPants.ts";

/** The photograph median, the tolerance as a part of it. */
function near(label: string, got: number, median: number, tol = 0.05): void {
  assert.ok(Math.abs(got / median - 1) <= tol, `${label}: ${got.toFixed(3)} against the photographs' median ${median.toFixed(3)} (within ${tol * 100}%)`);
}

/** The jacket's rows interpolated: the width across the cloth at `y`, in drawing units (the volume's 1.2 of padding taken off). */
function across(tied: boolean, y: number): number {
  const d = jacketDesc(1, tied);
  let j = 0;
  while (j + 2 < d.y.length && (d.y[j + 1] as number) < y) j++;
  const r = Math.max(0, Math.min(1, (y - (d.y[j] as number)) / ((d.y[j + 1] as number) - (d.y[j] as number) || 1)));
  return 2 * ((d.a[j] as number) + ((d.a[j + 1] as number) - (d.a[j] as number)) * r - 1.2);
}

const body = jacketDesc(1, true);
const TOP = body.y[0] as number;
/** L: the jacket's height, the top of the collar to the hem. */
const L = (body.y[body.y.length - 1] as number) - TOP;
const [Sx, Sy, Px, Py, Ax, , Qx] = (body.sl[0] as { q: number[] }).q as [number, number, number, number, number, number, number, number];

test("the shoulders are as wide as the photographs' (photos 06, 02, 04, 01, 30, 31: median .617 of L)", () => {
  near("shoulder point to shoulder point / L", (200 - 2 * Sx) / L, 0.617);
  near("collar top to the shoulder point / L", (Sy - TOP) / L, 0.143, 0.08);
});

test("the chest between the armpits is the photographs' (photos 06, 02, 01: median .438 of L), not a bodybuilder's", () => {
  near("armpit to armpit / L", (200 - 2 * Ax) / L, 0.438);
  // The wide cut that read as a bodybuilder had the body .74 of L across at the shoulders; the photographs' widest jacket is .70 across the sleeve points.
  assert.ok(across(true, 86) / L < 0.6, "the body behind the sleeves stays under .6 of L");
});

test("the belted waist and the hem are the photographs' (waist: 06, 02, 04, 01 median .459 of L; hem: six photographs, median .533)", () => {
  near("waist / L", across(true, 127) / L, 0.459);
  near("belted hem / L", across(true, 205) / L, 0.533);
  near("loose hem / L", across(false, 205) / L, 0.533);
  assert.ok(across(true, 205) > across(true, 127) * 1.15, "the skirt flares out below the belt (hem at least 15 per cent wider than the waist)");
});

test("the belt sits at the photographs' height on the jacket (belt centre / L: .568 to .752, median .672 for the form and the man together)", () => {
  near("belt centre / L", (beltRound().y + 6 - TOP) / L, 0.672, 0.1);
});

test("the sleeves hang at the photographs' angle (photos 30, 31, 05, 07: median 14 degrees from the body)", () => {
  const angle = (Math.atan((Sx - Px) / (Py - Sy)) * 180) / Math.PI;
  near("sleeve angle", angle, 14, 0.05);
  near("cuff width / L", (Qx - Px) / L, 0.17, 0.1);
});

test("the neck's opening stays about 17 cm across", () => {
  assert.ok(across(true, 6) / 2.63 <= 18, `${(across(true, 6) / 2.63).toFixed(1)} cm`);
});

test("the trousers are the flat photographs' (photos 30, 31): waistband .34, both legs at the hem .405, crotch .407 of the length", () => {
  const pd = pantsDesc(1, false);
  const q = (pd.sl[0] as { q: number[] }).q;
  const [Ppx, Ppy] = [q[2] as number, q[3] as number];
  const len = Ppy - (pd.y[0] as number);
  near("waistband / length", (2 * ((pd.a[0] as number) - 1.2)) / len, 0.34, 0.06);
  near("both legs at the hem / length", (200 - 2 * Ppx) / len, 0.405, 0.05);
  const crotch = (pd.y[pd.y.length - 1] as number) - (pd.y[0] as number);
  near("crotch down / length", crotch / len, 0.407, 0.08);
});
