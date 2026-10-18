import assert from "node:assert/strict";
import { test } from "node:test";
import { CUT_IDS, CUTS, cutSpec, FIT_IDS } from "../src/cuts.ts";
import { renderJersey } from "../src/index.ts";
import { optionsFromAttributes, attributesFromOptions } from "../src/attrs.ts";
import { resolve } from "../src/options.ts";
import { hashOf } from "../src/colour.ts";
import { shapeOf, uidOf } from "../src/jersey.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { cellsOf, placeCell, volumeDesc } from "../src/volume.ts";
import { nationalStyle } from "../src/presets/hockey-styles.ts";
import { wellFormed } from "./helpers.ts";

const COLORS = ["#1f3a8a", "#f4f0e4", "#c8102e"];

test("fit is mens or womens, mens is the default and what anything else means, and the cut's own table is untouched", () => {
  assert.deepEqual(FIT_IDS, ["mens", "womens"]);
  assert.equal(resolve({}).fit, "mens");
  assert.equal(resolve({ fit: "womens" }).fit, "womens");
  assert.equal(resolve({ fit: "<script>" as never }).fit, "mens");
  for (const cut of CUT_IDS) {
    assert.equal(cutSpec(cut), CUTS[cut]);
    assert.equal(cutSpec(cut, "mens"), CUTS[cut]);
    const o = { cut, colors: COLORS, number: 7, name: "Gray", pattern: "stripes" } as const;
    assert.equal(renderJersey({ ...o, fit: "mens" }), renderJersey(o), `${cut}: mens is the drawing without a fit`);
    assert.equal(renderJersey({ ...o, fit: "bogus" as never }), renderJersey(o), `${cut}: a bad fit is mens`);
    assert.equal(renderJersey({ ...o, fit: "womens" }), renderJersey({ ...o, fit: "womens" }), `${cut}: the same options draw the same string`);
    assert.notEqual(renderJersey({ ...o, fit: "womens" }), renderJersey(o), `${cut}: womens differs`);
  }
});

test("a men's drawing keeps the ids it had before the option existed, and a women's has its own", () => {
  const r = resolve({ cut: "hockey", number: 7 });
  const before = { ...r, fit: undefined };
  assert.equal(uidOf(r), `sj${hashOf(JSON.stringify(before))}`);
  assert.notEqual(uidOf(resolve({ cut: "hockey", number: 7, fit: "womens" })), uidOf(r));
});

test("a women's cut is shorter, narrower in the shoulders and sleeves, and tapers at the waist, on every cut", () => {
  for (const cut of CUT_IDS) {
    const m = cutSpec(cut);
    const w = cutSpec(cut, "womens");
    assert.ok(w.su < m.su && w.au < m.au && w.hy < m.hy, `${cut}: narrower and shorter`);
    assert.ok(w.wu < w.au - 6, `${cut}: the waist comes in under the chest`);
    assert.ok(w.hu > w.wu, `${cut}: the hem flares back out`);
    assert.ok(w.hu < m.hu, `${cut}: and is narrower than the men's`);
    for (const id of ["long", "elbow", "short"] as const) {
      const a = m.sleeves[id];
      const b = w.sleeves[id];
      assert.equal(a === undefined, b === undefined, `${cut} ${id}: the same sleeves`);
      if (a !== undefined && b !== undefined) assert.ok(b.cw < a.cw && b.l <= a.l, `${cut} ${id}: narrower, not longer`);
    }
    assert.deepEqual(w.collars, m.collars);
  }
});

/** The half-width of a shape's half outline at height y. */
function widthAt(half: readonly (readonly [number, number])[], y: number): number {
  for (let i = 1; i < half.length; i++) {
    const [u0, y0] = half[i - 1] as [number, number];
    const [u1, y1] = half[i] as [number, number];
    if (y >= Math.min(y0, y1) && y <= Math.max(y0, y1) && y1 !== y0) return u0 + ((u1 - u0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

test("every place on a women's cut (number, name, text, crest, badge) lies inside its body outline", () => {
  for (const cut of CUT_IDS) {
    const sh = shapeOf(resolve({ cut, fit: "womens" }));
    const w = sh.spec;
    const spots = [["front number", w.number.front], ["back number", w.number.back], ["name", w.name], ["text", w.text], ["crest", w.crest], ["patch", w.patch]] as const;
    for (const [what, s] of spots) {
      assert.ok(s.y - s.h / 2 >= w.ny && s.y + s.h / 2 <= w.hy, `${cut} ${what}: between the neck and the hem`);
      for (const y of [s.y - s.h / 2, s.y, s.y + s.h / 2]) {
        const room = widthAt(sh.half, y);
        assert.ok(Math.abs(s.x - 100) + s.w / 2 <= room + 0.5, `${cut} ${what} at ${y}: ${Math.abs(s.x - 100) + s.w / 2} wide of ${room}`);
      }
    }
  }
});

test("a women's jersey draws every pattern, stripe, mark and national layout inside its outline, in a drawing with no NaN", () => {
  for (const cut of CUT_IDS) {
    for (const pattern of ["stripes", "hoops", "halves", "sash", "pinstripes", "chest-band", "quarters"] as const) {
      const svg = renderJersey({ cut, fit: "womens", colors: COLORS, pattern, number: 12, name: "Gray", sleeveNumbers: true, view: "both", hemStripes: 2, chestBadges: [{ kind: "C" }] });
      assert.equal(wellFormed(svg), null, `${cut} ${pattern}`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${cut} ${pattern}`);
    }
  }
  for (const layout of ["quadrant", "diagonal", "centred", "arched", "serrated", "stepped", "wordmark", "flag"]) {
    const svg = renderJersey({ cut: "hockey", fit: "womens", colors: COLORS, national: `canada:${layout}`, number: 9, name: "Gray", view: "both" });
    assert.equal(wellFormed(svg), null, layout);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, layout);
  }
  const style = nationalStyle("canada", "diagonal", { name: "Gray", number: 9 });
  assert.equal(wellFormed(renderJersey({ ...style, fit: "womens" })), null);
});

const rad = (d: number): number => (d * Math.PI) / 180;
/** Where a point of space lands on the picture, worked out here from the same turn and tip. */
function project(p: readonly number[], k: number, yaw: number, pitch: number): [number, number] {
  const [x, y, z] = [p[3 * k] as number, p[3 * k + 1] as number, p[3 * k + 2] as number];
  const z1 = -x * Math.sin(rad(yaw)) + z * Math.cos(rad(yaw));
  return [x * Math.cos(rad(yaw)) + z * Math.sin(rad(yaw)), y * Math.cos(rad(pitch)) + z1 * Math.sin(rad(pitch))];
}
const inTri = (p: number[], t: number[][]): boolean => {
  const s = (a: number[], b: number[], c: number[]): number => (a[0]! - c[0]!) * (b[1]! - c[1]!) - (b[0]! - c[0]!) * (a[1]! - c[1]!);
  const d1 = s(p, t[0]!, t[1]!);
  const d2 = s(p, t[1]!, t[2]!);
  const d3 = s(p, t[2]!, t[0]!);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};

test("the women's volume is narrower and shorter, well formed at every 15 degrees, and its torso is closed cloth: nothing behind it shows through", () => {
  for (const cut of CUT_IDS) {
    const men = volumeDesc(resolve({ cut }));
    const desc = volumeDesc(resolve({ cut, fit: "womens" }));
    assert.ok(Math.max(...desc.a) < Math.max(...men.a), `${cut}: the women's body is narrower`);
    assert.ok((desc.y.at(-1) as number) < (men.y.at(-1) as number), `${cut}: and shorter`);
    const torso = cellsOf(desc).filter((c) => c.g === 0 || c.g === 3);
    const below = (desc.y[0] as number) + 12;
    for (let yaw = 0; yaw < 360; yaw += 15) {
      const svg = jerseyFrame({ cut, fit: "womens", colors: COLORS, number: 9, name: "Gray", sleeveNumbers: true, volume: true, yaw });
      assert.equal(wellFormed(svg), null, `${cut} ${yaw}`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${cut} ${yaw}`);
      const shown: number[][][] = [];
      const hidden: number[][][] = [];
      for (const c of torso) {
        const tri = [0, 1, 2].map((k) => project(c.p, k, yaw, desc.pitch));
        (placeCell(c, yaw, desc.pitch).visible ? shown : hidden).push(tri);
      }
      let holes = 0;
      for (let x = -110; x <= 110; x += 2) for (let y = below; y <= 240; y += 2) {
        const p = [x, y];
        if (hidden.some((t) => inTri(p, t)) && !shown.some((t) => inTri(p, t))) holes++;
      }
      // A rim of hidden cells at the very edge of the silhouette, a unit wide at most, is the allowance.
      assert.ok(holes <= 30, `${cut} at ${yaw}: ${holes} samples of the torso show through`);
    }
  }
});

test("the attribute and the query say the fit, and a bad one is ignored", () => {
  assert.equal(optionsFromAttributes((n) => (n === "fit" ? "womens" : null)).fit, "womens");
  assert.equal(optionsFromAttributes((n) => (n === "fit" ? "x" : null)).fit, undefined);
  assert.equal(attributesFromOptions({ fit: "womens" }).fit, "womens");
});
