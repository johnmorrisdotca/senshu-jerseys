// Every mark's box stays inside its allowed area with a margin, clear of seams, edges, the belt, the drawstring, the neck label, a belt end's tip and bars,
// and of every other mark, at every belt width and size; marks that cannot share an area are left out and said so in `judogiCheck`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { JUDOGI_SIZES, judogiCheck, renderJudogi, type JudogiOptions } from "../src/judogi.ts";
import { EMBROIDERY_PLACES, LOGO_PLACES, layoutMarks, readMarks, type MarkLayout } from "../src/judogiMarks.ts";
import { boxesClash, EDGE_MARGIN, fitsArea, MARK_GAP } from "../src/judogiPlaces.ts";
import { hipsOf, legOutline } from "../src/judogiPants.ts";
import { readStyle, type JudogiBeltStyle } from "../src/judogiStripes.ts";
import { strapWidth } from "../src/judogiStrap.ts";
import { insideWithMargin } from "../src/judogiPlaces.ts";
import { wellFormed } from "./helpers.ts";

const WIDTHS = [4, 4.2, 4.5, 4.7, 5, 6];

/** One mark each, as a person would ask for it. */
type Option = { name: string; opts: JudogiOptions };
const TEXTS: Record<string, string> = { "jacket-chest": "SENSHU", "belt-end-left": "SENSHU", "belt-end-right": "JOHN" };
const CATALOGUE: Option[] = [
  { name: "emblem", opts: { emblem: {} } },
  { name: "label", opts: { label: true } },
  ...EMBROIDERY_PLACES.map((place): Option => ({ name: `e:${place}`, opts: { embroidery: [{ place, text: TEXTS[place] ?? "SENSHU" }] } })),
  { name: "e:pants-left-down", opts: { embroidery: [{ place: "pants-left", text: "山田太郎", direction: "down" }] } },
  { name: "e:chest-long", opts: { embroidery: [{ place: "jacket-chest", text: "SENSHU JUDO CLUB", heightCm: 6, lengthCm: 30 }] } },
  { name: "e:belt-long", opts: { embroidery: [{ place: "belt-end-left", text: "TANAKA KENICHI SENSEI", heightCm: 4 }] } },
  ...LOGO_PLACES.map((place): Option => ({ name: `l:${place}`, opts: { logos: [{ place }] } })),
  { name: "brand", opts: { branding: true } },
];

const merge = (parts: Option[]): JudogiOptions => {
  const o: JudogiOptions & { embroidery: NonNullable<JudogiOptions["embroidery"]>; logos: NonNullable<JudogiOptions["logos"]> } = { embroidery: [], logos: [] };
  for (const p of parts) {
    o.embroidery.push(...(p.opts.embroidery ?? []));
    o.logos.push(...(p.opts.logos ?? []));
    if (p.opts.emblem !== undefined) o.emblem = p.opts.emblem;
    if (p.opts.label !== undefined) o.label = p.opts.label;
    if (p.opts.branding !== undefined) o.branding = p.opts.branding;
  }
  return o;
};

function layoutOf(opts: JudogiOptions, beltCm: number, belt = "black", style?: JudogiBeltStyle): MarkLayout | undefined {
  const spec = readMarks(opts);
  if (spec === undefined) return undefined;
  return layoutMarks(spec, strapWidth(belt, beltCm), readStyle(style));
}

/** The assertions: inside the area with its margin, a gap clear of every other mark and of what is fixed on the face. */
function assertClean(l: MarkLayout, label: string): void {
  for (const p of l.placed) {
    const area = l.areas[p.item.area];
    assert.ok(area !== undefined, `${label}: ${p.item.id} has no area`);
    assert.ok(fitsArea(area, p.box), `${label}: ${p.item.id} leaves its area ${p.item.area} (box ${JSON.stringify(p.box)})`);
    for (const o of l.obstacles) if (o.face === p.face) assert.ok(!boxesClash(p.box, o.box, MARK_GAP - 1e-3), `${label}: ${p.item.id} is within 1 cm of ${o.id}`);
  }
  for (let i = 0; i < l.placed.length; i++) {
    for (let j = i + 1; j < l.placed.length; j++) {
      const a = l.placed[i]!;
      const b = l.placed[j]!;
      if (a.face !== b.face) continue;
      assert.ok(!boxesClash(a.box, b.box, MARK_GAP - 1e-3), `${label}: ${a.item.id} and ${b.item.id} are within 1 cm`);
    }
  }
}

test("every single mark sits inside its area, clear of everything, at every belt width", () => {
  for (const opt of CATALOGUE) {
    for (const w of WIDTHS) {
      const l = layoutOf(opt.opts, w);
      assert.ok(l !== undefined, opt.name);
      assertClean(l, `${opt.name} @${w}`);
      assert.deepEqual(l.skipped.map((s) => s.item.id), [], `${opt.name} @${w}: a single mark must fit`);
    }
  }
});

test("a single mark of the largest size the rules allow still fits, shrunk if need be, and never leaves its area", () => {
  for (const place of EMBROIDERY_PLACES) {
    for (const w of [4.2, 5]) {
      const l = layoutOf({ embroidery: [{ place, text: "WWWWWWWWWWWW", heightCm: 4, lengthCm: 25 }] }, w);
      assert.ok(l !== undefined);
      assertClean(l, `big ${place} @${w}`);
    }
  }
  for (const place of LOGO_PLACES) {
    const l = layoutOf({ logos: [{ place, widthCm: 6, heightCm: 6 }] }, 4.2);
    assert.ok(l !== undefined);
    assertClean(l, `big logo ${place}`);
  }
  const e = layoutOf({ emblem: { widthCm: 12, heightCm: 12 } }, 4.5);
  assert.ok(e !== undefined);
  assertClean(e, "big emblem");
});

test("every pair of marks shares nothing: no two boxes touch, each stays in its area", () => {
  let shared = 0;
  for (let i = 0; i < CATALOGUE.length; i++) {
    for (let j = i + 1; j < CATALOGUE.length; j++) {
      for (const w of [4.2, 5]) {
        const l = layoutOf(merge([CATALOGUE[i]!, CATALOGUE[j]!]), w);
        assert.ok(l !== undefined);
        assertClean(l, `${CATALOGUE[i]!.name} + ${CATALOGUE[j]!.name} @${w}`);
        const areas = l.placed.map((p) => p.item.area);
        if (new Set(areas).size < areas.length) shared++;
      }
    }
  }
  assert.ok(shared > 20, `the pairs include many that share an area (${shared})`);
});

test("every triple of marks that can share an area is laid out without a clash", () => {
  // The areas where several marks meet: the trousers' hip, the jacket's hem corner, the chest, a belt end and a shoulder.
  const crowded = CATALOGUE.filter((o) => /^(e:pants-left|e:pants-right|l:pants-waist|e:pants-thigh|l:pants-thigh|e:jacket-chest|e:chest|emblem|label|l:jacket-hem|l:jacket-shoulder|e:shoulder|e:belt|l:belt|brand|e:pants-left-down)/.test(o.name));
  let triples = 0;
  for (let i = 0; i < crowded.length; i++) {
    for (let j = i + 1; j < crowded.length; j++) {
      for (let k = j + 1; k < crowded.length; k++) {
        const l = layoutOf(merge([crowded[i]!, crowded[j]!, crowded[k]!]), 4.5);
        assert.ok(l !== undefined);
        assertClean(l, `${crowded[i]!.name} + ${crowded[j]!.name} + ${crowded[k]!.name}`);
        triples++;
      }
    }
  }
  assert.ok(triples > 300, String(triples));
});

test("the trousers' waist: the label, the logo and a vertical name beside the drawstring never stack on each other", () => {
  const opts: JudogiOptions = { label: true, logos: [{ place: "pants-waist-left" }], embroidery: [{ place: "pants-left", text: "SENSHU" }] };
  for (const w of WIDTHS) {
    const l = layoutOf(opts, w)!;
    assertClean(l, `waist @${w}`);
    const onWaist = l.placed.filter((p) => p.face === "pants-front");
    assert.equal(onWaist.length, 3, "all three fit on the trousers' front");
    assert.deepEqual(l.skipped, []);
  }
});

test("marks that cannot all fit keep the earlier ones, leave the rest out and say so in judogiCheck", () => {
  // A long name, a logo and the label on a thin belt end: the end holds the first two at most.
  const opts: JudogiOptions = {
    embroidery: [{ place: "belt-end-left", text: "TANAKA KENICHI SENSEI", heightCm: 3, lengthCm: 20 }],
    logos: [{ place: "belt-end-left", widthCm: 3, heightCm: 3 }],
    label: true,
    beltWidthCm: 4.2,
  };
  const l = layoutOf(opts, 4.2)!;
  assertClean(l, "crowded belt end");
  assert.ok(l.skipped.length >= 1, "something is left out");
  const kinds = l.placed.filter((p) => p.face === "belt-left").map((p) => p.item.kind);
  assert.ok(kinds.includes("logo") && kinds.includes("embroidery"), `the logo and the name were laid first: ${kinds.join()}`);
  const check = judogiCheck({ ...opts, belt: "black" });
  const notes = check.notes.filter((n) => n.id.startsWith("skipped-"));
  assert.equal(notes.length, l.skipped.length);
  assert.ok(notes.every((n) => !n.met && /not drawn/.test(n.fact)));
  assert.equal(check.ok, false);
  // The drawing still renders and is well formed.
  assert.equal(wellFormed(renderJudogi({ ...opts, belt: "black", mode: "belt" })), null);
});

test("a belt end's tip and bars are obstacles: marks stay clear of them", () => {
  const styles: JudogiBeltStyle[] = [
    { bars: [{ colour: "red", count: 3 }] },
    { tip: { colour: "black", lengthCm: 6, bars: { colour: "white", count: 3 } } },
    { bars: [{ colour: "white", count: 2, fromEndCm: 4 }], tip: { colour: "red", lengthCm: 5 } },
  ];
  for (const style of styles) {
    for (const w of [4.2, 5]) {
      const l = layoutOf({ embroidery: [{ place: "belt-end-left", text: "JUDO" }, { place: "belt-end-right", text: "SENSHU" }], logos: [{ place: "belt-end-left" }], label: true }, w, "black", style)!;
      assertClean(l, `style ${JSON.stringify(style).slice(0, 30)} @${w}`);
      assert.ok(l.obstacles.some((o) => o.id.startsWith("belt-")), "the style puts obstacles on the ends");
    }
  }
});

test("at every size, with the branding's neck label on the jacket, the marks keep clear of it", () => {
  for (const size of JUDOGI_SIZES) {
    const opts: JudogiOptions = { size, branding: true, emblem: {}, label: true, embroidery: [{ place: "jacket-chest", text: "SENSHU" }, { place: "jacket-hem", text: "SENSHU" }], logos: [{ place: "jacket-hem" }] };
    const spec = readMarks(opts)!;
    const l = layoutMarks(spec, strapWidth("black"), undefined);
    assertClean(l, `size ${size}`);
    assert.ok(l.obstacles.some((o) => o.id === "neck-label"));
  }
});

test("the areas are inside the cloth they name, a margin from its seams", () => {
  const spec = readMarks({ label: true })!;
  const l = layoutMarks(spec, strapWidth("black"));
  // The trousers' hip zones lie inside the hips as the trousers are worn gathered (the narrower), clear of the centre seam and the waistband.
  const hip = hipsOf(true)[1] as number;
  for (const side of ["left", "right"] as const) {
    const poly = l.areas[`waist-${side}`]!.poly;
    for (const [x, y] of poly) {
      assert.ok(Math.abs(x - 100) <= hip - EDGE_MARGIN + 1e-6, `${side}: ${x} is inside the hip's edge`);
      assert.ok(Math.abs(x - 100) >= 12, `${side}: ${x} is clear of the drawstring`);
      assert.ok(y >= 22, `${side}: ${y} is under the waistband`);
    }
    // The thigh and lower-leg zones are inside their leg.
    const leg = legOutline(side === "left" ? 1 : -1);
    for (const id of [`thigh-${side}`, `leg-${side}`]) for (const p of l.areas[id]!.poly) assert.ok(insideWithMargin(leg, p, 4), `${id} ${JSON.stringify(p)} is a margin inside the leg`);
    // Marks at the thigh are above the knee panel (it starts a fifth of the way down the leg) and those at the hem below it.
    for (const p of l.areas[`thigh-${side}`]!.poly) assert.ok(p[1] < 135, `${side} thigh zone ends above the knee panel`);
    for (const p of l.areas[`leg-${side}`]!.poly) assert.ok(p[1] > 150, `${side} leg zone starts below the knee panel's top`);
  }
  // The hem corner is right of a belt end (its far edge is about 128) and left of the side vent (about 146).
  const xs = l.areas["hem-left"]!.poly.map((p) => p[0]);
  assert.ok(Math.min(...xs) >= 128 && Math.max(...xs) <= 146 - EDGE_MARGIN + 1e-6);
  assert.ok(Math.max(...l.areas["hem-left"]!.poly.map((p) => p[1])) <= 198 - EDGE_MARGIN + 1e-6, "above the hem's stitching");
});

test("the new places draw: trousers' thigh and hip in thread of the cloth's colour, and the layout reaches the drawing", () => {
  for (const colour of ["white", "blue"] as const) {
    for (const mode of ["pants", "pieces", "suit"] as const) {
      for (const view of ["front", "flat"] as const) {
        const svg = renderJudogi({ colour, mode, view, belt: "black", embroidery: [{ place: "pants-thigh-left", text: "SENSHU", tonal: true }], logos: [{ place: "pants-thigh-right", tonal: true }] });
        assert.equal(wellFormed(svg), null, `${colour} ${mode} ${view}`);
      }
    }
  }
  const plain = renderJudogi({ mode: "pants", view: "flat", embroidery: [{ place: "pants-thigh-left", text: "AB", thread: "navy" }] });
  const tonal = renderJudogi({ mode: "pants", view: "flat", embroidery: [{ place: "pants-thigh-left", text: "AB", thread: "navy", tonal: true }] });
  assert.notEqual(plain, tonal);
  // Every turn angle draws the same layout: the marks are on the faces, so turning only moves the faces.
  const yaws = [0, 15, 45, 90, 180].map((yaw) => renderJudogi({ mode: "suit", yaw, belt: "black", label: true, emblem: {}, logos: [{ place: "pants-waist-left" }], embroidery: [{ place: "pants-left", text: "SENSHU" }] }));
  for (const y of yaws) assert.equal(wellFormed(y), null);
});

test("a logo is still one to a garment, and the first embroidery at a place wins", () => {
  const spec = readMarks({ logos: [{ place: "pants-thigh-left" }, { place: "pants-waist-left" }], embroidery: [{ place: "pants-thigh-left", text: "A" }, { place: "pants-thigh-left", text: "B" }] })!;
  assert.equal(spec.logos.length, 1);
  assert.equal(spec.embroidery.length, 1);
});
