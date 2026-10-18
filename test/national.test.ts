import assert from "node:assert/strict";
import { test } from "node:test";

import { CUT_IDS, CUTS } from "../src/cuts.ts";
import { renderJersey } from "../src/index.ts";
import { optionsFromAttributes, attributesFromOptions } from "../src/attrs.ts";
import { NATIONAL_COUNTRIES, NATIONAL_LAYOUTS, nationalOf, nationalPlan, type NationalArm } from "../src/national.ts";
import { resolve } from "../src/options.ts";
import { HOCKEY_STYLES, nationalStyle, personalStyle, STYLE_COUNTRIES } from "../src/presets/hockey-styles.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { shapeOf } from "../src/jersey.ts";
import { wellFormed } from "./helpers.ts";

const COLOURS = { body: "#d52b1e", trim: "#ffffff", trim2: "#111111" };
const armsOf = (cut: "hockey" | "soccer" | "football" | "rugby" | "handball" | "baseball"): NationalArm[] => {
  const s = shapeOf(resolve({ cut })).sleeves;
  return s === undefined ? [] : [s.L, s.R].map((g) => ({ S: g.S, P: g.P, A: g.A, Q: g.Q }));
};

test("the countries are the twelve of the style sheet, and the layouts eight", () => {
  assert.deepEqual([...NATIONAL_COUNTRIES], STYLE_COUNTRIES.map((c) => c.id));
  assert.equal(NATIONAL_LAYOUTS.length, 8);
});

test("a national layout is read from a string or an object, and anything else is nothing", () => {
  assert.deepEqual(nationalOf("canada:diagonal"), { country: "canada", layout: "diagonal", text: "CANADA" });
  assert.equal(nationalOf({ country: "japan", layout: "flag", text: "nippon" })?.text, "NIPPON");
  assert.equal(nationalOf("japan")?.layout, "centred", "a layout that is not one is centred");
  assert.equal(nationalOf("atlantis:flag"), undefined);
  for (const bad of [undefined, null, 7, [], {}, { country: "<script>" }, "", ":flag"]) assert.equal(nationalOf(bad), undefined);
  assert.equal(nationalOf({ country: "usa", layout: "flag", text: "x".repeat(300) })?.text.length, 14);
});

test("every country in every layout draws, deterministically, front and back, in every look, on a flat card and on the garment", () => {
  for (const country of NATIONAL_COUNTRIES) {
    for (const layout of NATIONAL_LAYOUTS) {
      const base = personalStyle(`style:${country}-2026-home`, { name: "Morris", number: 23, sleeveNumbers: true }) ?? {};
      for (const view of ["front", "back", "both"] as const) {
        for (const look of ["cloth", "flat", "line"] as const) {
          const o = { ...base, national: `${country}:${layout}`, view, look } as const;
          const svg = renderJersey(o);
          assert.equal(svg, renderJersey(o), `${country} ${layout} ${view} ${look}: the same options draw the same string`);
          assert.equal(wellFormed(svg), null, `${country} ${layout} ${view} ${look}`);
          assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${country} ${layout} ${view} ${look}`);
        }
      }
      for (const yaw of [0, 45, 90, 180, 270]) {
        const frame = jerseyFrame({ ...base, national: `${country}:${layout}`, volume: true, yaw });
        assert.equal(wellFormed(frame), null, `${country} ${layout} volume ${yaw}`);
        assert.doesNotMatch(frame, /NaN|undefined|Infinity/);
      }
    }
  }
});

test("a layout adds to the shirt and the back stays the back: only the full flag covers it", () => {
  for (const layout of NATIONAL_LAYOUTS) {
    const plain = renderJersey({ cut: "hockey", colors: ["#d52b1e", "#fff", "#111"], number: 23, name: "Morris", view: "back" });
    const withIt = renderJersey({ cut: "hockey", colors: ["#d52b1e", "#fff", "#111"], number: 23, name: "Morris", view: "back", national: `canada:${layout}` });
    if (layout === "flag") assert.notEqual(withIt, plain, "the flag runs round to the back");
    else if (layout === "wordmark") assert.notEqual(withIt, plain, "the wordmark's two chest lines run round the shirt");
    else assert.equal(withIt.replace(/sj[0-9a-z]+/g, "X"), plain.replace(/sj[0-9a-z]+/g, "X"), `${layout}: the back is as it was`);
    const front = renderJersey({ cut: "hockey", colors: ["#d52b1e", "#fff", "#111"], national: `canada:${layout}` });
    assert.notEqual(front, renderJersey({ cut: "hockey", colors: ["#d52b1e", "#fff", "#111"] }), `${layout} changes the front`);
  }
});

test("the marks stay on the chest: inside the shirt, below the collar, clear of the chest text, and the quadrant is one quarter of the front", () => {
  for (const cut of ["hockey", "soccer", "football", "rugby", "handball"] as const) {
    const spec = CUTS[cut];
    const arms = armsOf(cut);
    const shape = shapeOf(resolve({ cut }));
    const collarY = spec.ny + 40;
    for (const country of NATIONAL_COUNTRIES) {
      for (const layout of NATIONAL_LAYOUTS) {
        const plan = nationalPlan({ country, layout, text: "X" }, spec, "front", "u", arms, COLOURS);
        for (const m of plan.marks) {
          assert.ok(m.x1 - m.x0 > 0 && m.y1 - m.y0 > 0, `${cut} ${country} ${layout}`);
          const centre = (m.x0 + m.x1) / 2;
          const onArm = centre < 100 - spec.au || centre > 100 + spec.au;
          if (onArm) continue;
          assert.ok(m.y0 >= collarY - 2, `${cut} ${country} ${layout}: a mark at ${m.y0} is under the collar (${collarY})`);
          assert.ok(m.y1 <= spec.hy, `${cut} ${layout}: a mark runs below the hem`);
          assert.ok(m.x0 >= 100 - spec.au - 12 && m.x1 <= 100 + spec.au + 12, `${cut} ${layout}: a mark ${m.x0} to ${m.x1} is off the shirt`);
        }
        if (layout === "quadrant") {
          const m = plan.marks[0]!;
          assert.ok((m.x0 + m.x1) / 2 < 100 && (m.y0 + m.y1) / 2 > (shape.spec.ay + spec.hy) / 2 - 20, `${cut}: the quadrant mark is on the wearer's right, low`);
        }
        if (layout === "arched") {
          const chest = plan.marks[0]!;
          assert.ok(chest.y0 > spec.text.y + spec.text.h / 2, `${cut}: the arched words are above the mark`);
        }
        if (plan.slant !== undefined && plan.textBox !== undefined && plan.cut !== undefined) {
          const [A, B] = plan.cut;
          const side = (p: readonly [number, number]): number => (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]);
          // The text is on one side of the cut and the mark on the other.
          for (const p of plan.textBox) {
            assert.ok(side(p) < 1, `${cut} ${country}: the slanted words cross the cut`);
            assert.ok(p[1] >= collarY, `${cut} ${country}: the slanted words reach the collar`);
            assert.ok(p[0] >= 100 - spec.wu - 4, `${cut} ${country}: the slanted words leave the shirt`);
          }
        }
      }
    }
  }
});

test("the chest words of a national layout are set by the jersey's own lettering and a hostile word is only ever strokes", () => {
  const svg = renderJersey({ cut: "hockey", national: { country: "canada", layout: "wordmark", text: '<script>alert("x")</script>' } });
  assert.doesNotMatch(svg, /<script|alert/);
  assert.equal(resolve({ cut: "hockey", national: "canada:stepped" }).frontTextAngle, "diagonal-up");
  assert.equal(resolve({ cut: "hockey", national: "canada:arched" }).frontTextAngle, "arch");
  assert.equal(resolve({ cut: "hockey", national: "canada:wordmark" }).frontText, "CANADA");
  assert.equal(resolve({ cut: "hockey", national: "canada:wordmark", frontText: "own" }).frontText, "OWN", "a given word wins");
  assert.equal(resolve({ cut: "hockey", national: "canada:quadrant" }).frontText, undefined, "a mark alone sets no words");
  assert.deepEqual(resolve({ cut: "hockey", national: "canada:wordmark", chestBand: false as never }).chestBands, [], "a given chest band wins");
});

test("the attribute and the query say the layout both ways, and a style carries it", () => {
  const o = optionsFromAttributes((name) => (name === "national" ? "germany:flag" : null));
  assert.equal(o.national, "germany:flag");
  assert.equal(attributesFromOptions({ national: { country: "usa", layout: "arched" } }).national, "usa:arched");
  assert.equal(attributesFromOptions({ national: "usa:arched" }).national, "usa:arched");
  const mine = nationalStyle("japan", "diagonal", { away: true, name: "Tanaka", number: 19 });
  assert.deepEqual(mine?.national, { country: "japan", layout: "diagonal" });
  assert.equal(mine?.name, "Tanaka");
  assert.equal(nationalStyle("atlantis", "flag"), undefined);
  assert.equal(HOCKEY_STYLES.every((p) => p.options.national === undefined), true, "the shared presets are not changed");
  assert.equal(Object.isFrozen(HOCKEY_STYLES[0]?.options), true);
});

test("a layout is on every cut: a tank and a sleeved shirt alike", () => {
  for (const cut of CUT_IDS) {
    for (const layout of NATIONAL_LAYOUTS) {
      const svg = renderJersey({ cut, colors: ["#0a3161", "#fff", "#b31942"], number: 7, national: `usa:${layout}`, view: "both" });
      assert.equal(wellFormed(svg), null, `${cut} ${layout}`);
    }
  }
});
