// Nothing is cut off. A jersey is drawn in a view box; a sleeve of a football, rugby, soccer or baseball shirt reaches past the 200 units of the body, and a turn (the cloth shifted by its thickness, the
// face swung about the middle) reaches further. Every drawing here, still or turned, in every cut, sleeve, look and view, fits the box it is drawn in, and the box is the same for all of them, so the
// drawing does not change size or jump as it turns. The ink is measured from the finished SVG (test/svgbox.ts: every path, circle and rect with its stroke, its transforms and its clips), never from
// the numbers the shirt was drawn from.
import assert from "node:assert/strict";
import { test } from "node:test";

import { CUT_IDS, CUTS, JERSEY_HEIGHT, JERSEY_WIDTH, jerseyLineup, kitMatchup, renderBanner, renderJersey, renderKit, type CutId, type JerseyOptions, type SleeveId } from "../src/index.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { type Box, inkBox, viewBoxOf } from "./svgbox.ts";

/** How far the ink may go past the box, in drawing units: a tenth of a unit, which is the rounding of the numbers. */
const MARGIN = 0.1;
const LOOKS = ["cloth", "flat", "line"] as const;
const THICKNESS = [0, 14, 40];
/** The turns: the whole circle in steps of 15 degrees, and every degree and a half round the front and the back, where the cloth's edge pushes a sleeve out most. */
const YAWS = [...new Set([...Array.from({ length: 24 }, (_, i) => -180 + i * 15), ...Array.from({ length: 27 }, (_, i) => -20 + i * 1.5), ...Array.from({ length: 27 }, (_, i) => 160 + i * 1.5)])];

const sleevesOf = (cut: CutId): SleeveId[] => {
  const own = Object.keys(CUTS[cut].sleeves) as SleeveId[];
  return own.length === 0 ? ["none"] : own;
};
const past = (ink: Box, view: Box): number => Math.max(0, view.x0 - ink.x0, view.y0 - ink.y0, ink.x1 - view.x1, ink.y1 - view.y1);
const boxText = (svg: string): string => /^<svg[^>]*?\sviewBox="([^"]*)"/.exec(svg)?.[1] as string;
const sizeText = (svg: string): string => /^<svg[^>]*?\swidth="([^"]*)"[^>]*?\sheight="([^"]*)"/.exec(svg)?.slice(1).join(" x ") as string;

/** Every shirt of a cut that has its own silhouette: each sleeve the cut has, plain and raglan (raglan has no sleeve to change on a tank). */
function shirts(cut: CutId): JerseyOptions[] {
  const out: JerseyOptions[] = [];
  for (const sleeve of sleevesOf(cut)) for (const raglan of sleeve === "none" ? [false] : [false, true]) out.push({ cut, sleeve, raglan, number: 23, name: "Morris", sleeveNumbers: sleeve !== "none", cuffs: sleeve === "none" ? undefined : [18, 1] });
  return out;
}

interface Survey {
  /** How far the still shirts go past the 200 units of the body, and the turned frames. */
  still: number;
  turned: number;
  /** The most any turned frame goes past its own box, and where. */
  over: number;
  at: string;
}
const surveys = new Map<CutId, Survey>();
/** Measures every turned frame of a cut once, for the tests that ask about it. */
function survey(id: CutId): Survey {
  const known = surveys.get(id);
  if (known !== undefined) return known;
  const out: Survey = { still: 0, turned: 0, over: 0, at: "" };
  for (const shirt of shirts(id)) {
    const name = `${shirt.sleeve}${shirt.raglan === true ? " raglan" : ""}`;
    for (const look of LOOKS) {
      const ink = inkBox(renderJersey({ ...shirt, look })) as Box;
      out.still = Math.max(out.still, -ink.x0, ink.x1 - JERSEY_WIDTH);
      if (look === "flat") continue;
      for (const thickness of THICKNESS) {
        for (const yaw of YAWS) {
          const svg = jerseyFrame({ ...shirt, look, yaw, thickness });
          const t = inkBox(svg) as Box;
          out.turned = Math.max(out.turned, -t.x0, t.x1 - JERSEY_WIDTH);
          const over = past(t, viewBoxOf(svg));
          if (over > out.over) {
            out.over = over;
            out.at = `${name} ${look} yaw ${yaw} thickness ${thickness}`;
          }
        }
      }
    }
  }
  surveys.set(id, out);
  return out;
}

test("the ink of a jersey is measured from its paths, so a sleeve past the body is found", () => {
  const svg = renderJersey({ cut: "football", sleeve: "elbow", look: "line" });
  const ink = inkBox(svg) as Box;
  assert.ok(ink.x1 > JERSEY_WIDTH + 12, `the elbow sleeve of a football shirt reaches ${ink.x1 - JERSEY_WIDTH} past the body`);
  assert.ok(ink.x0 < -12);
  assert.ok(ink.y0 >= 0 && ink.y1 <= JERSEY_HEIGHT, "and the shirt is inside the box in height");
});

test("no still jersey is cut off by its box, in any cut, sleeve, look or view", () => {
  const cut: string[] = [];
  for (const id of CUT_IDS) {
    for (const shirt of shirts(id)) {
      for (const look of LOOKS) {
        for (const view of ["front", "back", "both"] as const) {
          const svg = renderJersey({ ...shirt, look, view });
          const ink = inkBox(svg) as Box;
          const over = past(ink, viewBoxOf(svg));
          if (over > MARGIN) cut.push(`${id} ${shirt.sleeve}${shirt.raglan === true ? " raglan" : ""} ${look} ${view}: ${over.toFixed(2)} past ${boxText(svg)}`);
        }
      }
    }
  }
  assert.deepEqual(cut, []);
});

test("no turned frame is cut off by its box, at any angle or thickness of the cloth, in any cut, sleeve or look", () => {
  const cut: string[] = [];
  for (const id of CUT_IDS) {
    const { over, at } = survey(id);
    if (over > MARGIN) cut.push(`${id}: ${over.toFixed(2)} past the box at ${at}`);
  }
  assert.deepEqual(cut, []);
});

test("a cut has one box and one size: the still, both views and every frame of a turn share it", () => {
  for (const id of CUT_IDS) {
    const boxes = new Set<string>();
    const sizes = new Set<string>();
    const frames = new Set<string>();
    for (const shirt of shirts(id)) {
      for (const look of LOOKS) {
        for (const view of ["front", "back"] as const) {
          const svg = renderJersey({ ...shirt, look, view, size: 160 });
          boxes.add(boxText(svg));
          sizes.add(sizeText(svg));
        }
        for (const thickness of [0, 14, 40]) {
          for (const yaw of [-170, -90, -8, 0, 8, 45, 90, 180]) {
            const svg = jerseyFrame({ ...shirt, look, yaw, thickness, size: 160 });
            boxes.add(boxText(svg));
            frames.add(sizeText(svg));
          }
        }
      }
    }
    assert.equal(boxes.size, 1, `${id} changes its box: ${[...boxes].join(" | ")}`);
    assert.equal(sizes.size, 1, `${id} changes its size when still: ${[...sizes].join(" | ")}`);
    assert.deepEqual([...frames], [...sizes], `${id}: a turned frame is the size of the still`);
    // The box is centred on the shirt, whose middle is x = 100.
    const view = viewBoxOf(`<svg viewBox="${[...boxes][0]}">`);
    assert.ok(Math.abs(view.x0 + view.x1 - JERSEY_WIDTH) < 1e-6, `${id}: the box is centred on the middle of the shirt`);
    assert.equal(view.y1 - view.y0, JERSEY_HEIGHT);
  }
});

test("a shirt is drawn at one scale whatever its cut: size is the width of the body, the document is a little wider for a cut with sleeves out", () => {
  for (const id of CUT_IDS) {
    for (const svg of [renderJersey({ cut: id, size: 150 }), jerseyFrame({ cut: id, size: 150, yaw: 20 })]) {
      const view = viewBoxOf(svg);
      const width = Number(/\swidth="([^"]*)"/.exec(svg)?.[1]);
      assert.ok(Math.abs(width / (view.x1 - view.x0) - 150 / JERSEY_WIDTH) < 1e-3, `${id}: ${width} px for ${view.x1 - view.x0} units`);
    }
  }
  // The cuts whose shirts fit the body keep exactly the box they always had.
  for (const id of ["hockey", "basketball"] as const) assert.match(renderJersey({ cut: id }), /viewBox="0 0 200 232" width="200" height="232"/);
  assert.match(renderJersey({ cut: "football" }), /viewBox="-16\.9 0 233\.8 232" width="233\.8" height="232"/);
});

test("a box a cut declares is needed and is no bigger than the shirt needs, still or turned", () => {
  const needed: string[] = [];
  for (const id of CUT_IDS) {
    const { still, turned } = survey(id);
    const reach = CUTS[id].reach ?? 0;
    // It holds the ink (the other tests measure the box itself) ...
    assert.ok(turned <= reach + MARGIN, `${id}: the turn goes ${turned.toFixed(2)} past the body, the reach is ${reach}`);
    // ... a cut whose shirts fit the body has none ...
    if (turned <= MARGIN) assert.equal(reach, 0, `${id} needs no reach`);
    else {
      needed.push(id);
      // ... one that does not has one, and it is no roomier than the ink and a unit of margin.
      assert.ok(reach >= still, `${id}: the still goes ${still.toFixed(2)} past the body`);
      assert.ok(reach <= turned + 1.5, `${id}: a reach of ${reach} is roomier than the ${turned.toFixed(2)} the drawings need`);
    }
  }
  // The four cuts the audit found cut off at rest, and handball, whose thick elbow sleeve is cut off only as it turns.
  assert.deepEqual(needed, ["baseball", "football", "soccer", "rugby", "handball"]);
});

test("the sleeves of two shirts side by side do not touch, in the box of every cut", () => {
  for (const id of CUT_IDS) {
    for (const sleeve of sleevesOf(id)) {
      const single = renderJersey({ cut: id, sleeve, look: "line" });
      const one = inkBox(single) as Box;
      // The second shirt is one box and a gap further on; its left sleeve against the first one's right.
      const step = viewBoxOf(single).x1 - viewBoxOf(single).x0 + 24;
      assert.match(renderJersey({ cut: id, sleeve, look: "line", view: "both" }), new RegExp(`translate\\(${String(step).replace(".", "\\.")} 0\\)`));
      const gap = step + one.x0 - one.x1;
      assert.ok(gap >= 20, `${id} ${sleeve}: ${gap.toFixed(1)} units between the two shirts' sleeves`);
    }
  }
});

test("a whole uniform, a matchup, a lineup and a banner's sweater are not cut off by their boxes, in any cut", () => {
  const cut: string[] = [];
  const check = (what: string, svg: string): void => {
    const over = past(inkBox(svg) as Box, viewBoxOf(svg));
    if (over > MARGIN) cut.push(`${what}: ${over.toFixed(2)} past ${boxText(svg)}`);
  };
  for (const id of CUT_IDS) {
    for (const sleeve of sleevesOf(id)) {
      for (const look of ["cloth", "line"] as const) {
        for (const view of ["front", "both"] as const) {
          check(`kit ${id} ${sleeve} ${look} ${view}`, renderKit({ cut: id, sleeve, look, view, helmet: "#1b2a6b", number: 9 }));
          check(`kit ${id} ${sleeve} ${look} ${view} without a helmet`, renderKit({ cut: id, sleeve, look, view, number: 9 }));
          check(`matchup ${id} ${sleeve} ${look} ${view}`, kitMatchup({ away: { cut: id, sleeve, look, label: "Gulls" }, home: { cut: id, sleeve, look, label: "Bison" }, view }));
        }
        // A matchup of two different cuts is spaced for the wider.
        check(`matchup ${id} ${sleeve} against hockey ${look}`, kitMatchup({ away: { cut: id, sleeve, look }, home: { cut: "hockey", look }, view: "both" }));
        check(`lineup ${id} ${sleeve} ${look}`, jerseyLineup(Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `P${i + 1}` })), { formation: "4-4-2", jersey: { cut: id, sleeve, look }, field: true }));
        check(`lineup of 3 ${id} ${sleeve} ${look}`, jerseyLineup([{ number: 1 }, { number: 2 }, { number: 3 }], { rows: [3], jersey: { cut: id, sleeve, look }, labels: "none" }));
      }
    }
    check(`banner ${id}`, renderBanner({ sweater: { cut: id, sleeve: sleevesOf(id)[sleevesOf(id).length - 1] }, number: 9, name: "Beaumont" }));
  }
  assert.deepEqual(cut, []);
});
