// The writing on a banner stays on the cloth. The name and the years are measured from the finished drawing (test/svgbox.ts: the path of every letter with its stroke), never from the numbers the banner was
// laid out with: for every shape, with and without the sweater, in every look, with short, long and very wide names and years, every letter is inside the outline of the cloth, clear of its edge by more than the
// trim and the inner line take, and on the rectangle it ends above the notch's apex, not across it.
import assert from "node:assert/strict";
import { test } from "node:test";

import { BANNER_SHAPES, renderBanner, type BannerOptions, type BannerShape } from "../src/index.ts";
import { inkBox, pathPoints, type Box } from "./svgbox.ts";

type P = readonly [number, number];
/** The least distance between a letter and the outline of the cloth: past the trim (5) and the inner line (8 to 13), with some cloth showing. */
const CLEAR = 10;
/** The least distance between the letters and the apex of the rectangle's notch. */
const NOTCH_CLEAR = 12;

const NAMES = ["Beaumont", "Ashworth", "MONTGOMERY-WELLINGTON", "WWWWWWWWWWWWWWWWWWWW", "Ng", "田中選手"];
const YEARS = ["1948-1963", "Retired 1972", "1948-1963 / 1970-1979", "RETIRED 1999 AND 2001", "WWWWWWWWWWWWWWWWWWWWWWWW", "1931-1947", "1"];
const COLOURS = [["#1f3a8a", "#f4f0e4", "#c8102e"], ["#14181c", "#e8b900", "#f4f0e4"]];

/** The outline of the cloth: the path the banner clips to. */
function outline(svg: string): P[] {
  const d = /<clipPath id="[^"]*"><path d="([^"]*)"/.exec(svg)?.[1];
  assert.ok(d !== undefined, "the banner has no clip path");
  return pathPoints(d);
}

const tagsOf = (svg: string, tag: string): string[] => [...svg.matchAll(new RegExp(`<${tag}\\b[^>]*?(?:/>|>[^<]*</${tag}>)`, "g"))].map((m) => m[0].replace(/url\(#[^)]*\)/g, "url(#)"));

/** What a banner draws for `extra` and not for the same banner without it: the box of that writing's ink. */
function inkOf(options: BannerOptions, extra: Partial<BannerOptions>): Box {
  const base = renderBanner({ ...options, name: undefined, years: undefined, number: undefined });
  const full = renderBanner({ ...options, number: undefined, name: undefined, years: undefined, ...extra });
  const seen = new Map<string, number>();
  for (const t of tagsOf(base, "path")) seen.set(t, (seen.get(t) ?? 0) + 1);
  const added: string[] = [];
  for (const t of tagsOf(full, "path")) {
    const left = seen.get(t) ?? 0;
    if (left > 0) seen.set(t, left - 1);
    else added.push(t);
  }
  const glyphs = inkBox(`<svg viewBox="0 0 200 280">${added.join("")}</svg>`);
  // Characters set as system text (kanji) are not measured by the box tool: each one is its em square, at the foot the banner gave it.
  const boxes: Box[] = glyphs === undefined ? [] : [glyphs];
  for (const t of tagsOf(full, "text")) {
    const at = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(t);
    const size = Number(/font-size="([-\d.]+)"/.exec(t)?.[1]);
    if (at === null || !Number.isFinite(size)) continue;
    const x = Number(at[1]);
    const y = Number(at[2]);
    boxes.push({ x0: x - size / 2, x1: x + size / 2, y0: y - size * 0.85, y1: y + size * 0.15 });
  }
  assert.ok(boxes.length > 0, `nothing was drawn for ${JSON.stringify(extra)}`);
  return boxes.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
}

const inside = (poly: readonly P[], x: number, y: number): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i] as P;
    const [xj, yj] = poly[j] as P;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

const distance = (poly: readonly P[], x: number, y: number): number => {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j] as P;
    const [bx, by] = poly[i] as P;
    const len2 = (bx - ax) ** 2 + (by - ay) ** 2;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / len2));
    best = Math.min(best, Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))));
  }
  return best;
};

/** Points all round a box's edge, every unit or so. */
function round(b: Box): P[] {
  const out: P[] = [];
  for (let x = b.x0; x <= b.x1 + 0.5; x += 1) out.push([Math.min(x, b.x1), b.y0], [Math.min(x, b.x1), b.y1]);
  for (let y = b.y0; y <= b.y1 + 0.5; y += 1) out.push([b.x0, Math.min(y, b.y1)], [b.x1, Math.min(y, b.y1)]);
  return out;
}

/** The least distance from the box to the outline, or a negative number when any of it is outside. */
function room(poly: readonly P[], b: Box): number {
  let least = Infinity;
  for (const [x, y] of round(b)) least = Math.min(least, inside(poly, x, y) ? distance(poly, x, y) : -1);
  return least;
}

const cases = (shape: BannerShape): { label: string; options: BannerOptions }[] => {
  const out: { label: string; options: BannerOptions }[] = [];
  for (const sweater of shape === "pennant" ? [false] : [false, true])
    for (const look of ["cloth", "flat", "line"] as const)
      for (const colors of COLOURS) out.push({ label: `${shape}${sweater ? " with sweater" : ""}, ${look}, ${colors[0]}`, options: { shape, look, colors, sweater, number: 88 } });
  return out;
};

for (const shape of BANNER_SHAPES) {
  test(`on a ${shape} banner the name and the years stay on the cloth, clear of its edge${shape === "rectangle" ? " and above the notch" : ""}`, () => {
    for (const { label, options } of cases(shape)) {
      const poly = outline(renderBanner(options));
      // The notch's apex: the cloth's bottom edge at the middle, on the rectangle (the swallow-tail's V).
      const apex = shape === "rectangle" ? Math.min(...poly.filter(([x, y]) => Math.abs(x - 100) < 0.5 && y > 200).map(([, y]) => y)) : undefined;
      const numberInk = inkOf(options, { number: 88 });
      assert.ok(room(poly, numberInk) >= CLEAR, `${label}: the number is ${room(poly, numberInk).toFixed(1)} from the edge`);
      for (const name of NAMES)
        for (const years of YEARS) {
          const both = { name, years };
          for (const [what, ink] of [["name", inkOf(options, { name })], ["years", inkOf(options, { years })], ["both", inkOf(options, both)]] as const) {
            const r = room(poly, ink);
            assert.ok(r >= CLEAR, `${label}, ${name} / ${years}: the ${what} comes within ${r.toFixed(1)} of the edge (or leaves the cloth); it needs ${CLEAR}`);
            if (apex !== undefined) assert.ok(ink.y1 <= apex - NOTCH_CLEAR, `${label}, ${name} / ${years}: the ${what} ends at ${ink.y1.toFixed(1)}, ${(apex - ink.y1).toFixed(1)} above the notch's apex at ${apex}; it needs ${NOTCH_CLEAR}`);
          }
        }
    }
  });
}

test("the writing does not collide: the name stays above the years, and the number above the name", () => {
  for (const shape of BANNER_SHAPES)
    for (const { label, options } of cases(shape)) {
      for (const name of NAMES) {
        const years = "1948-1963";
        const n = inkOf(options, { number: 88 });
        const a = inkOf(options, { name });
        const y = inkOf(options, { years });
        assert.ok(n.y1 <= a.y0, `${label}, ${name}: the number (to ${n.y1.toFixed(1)}) runs into the name (from ${a.y0.toFixed(1)})`);
        assert.ok(a.y1 <= y.y0, `${label}, ${name}: the name (to ${a.y1.toFixed(1)}) runs into the years (from ${y.y0.toFixed(1)})`);
      }
    }
});
