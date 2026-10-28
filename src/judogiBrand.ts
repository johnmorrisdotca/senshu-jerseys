// The Senshu branding: the brand's own marks and where they go on a judogi. The default brand is the package's own, made up: Senshu (選手, "athlete"),
// shown as the Latin name "SENSHU" on a woven neck label with a size tag below it, a bold brush kanji mark, and a stylised S wherever a maker's logo may go.
// The brush kanji are drawn here as tapered strokes (no font is used), so they look the same everywhere. Everything is swappable: the name, the kanji (one
// of the three drawn here, or any text of your own in a system font), the small line, the size, the colours and the logo (your own SVG in place of the S).
// A maker's logo is one to a garment, so the S is not added to a garment that has a logo of the person's own. Never a real maker's or federation's mark.
// Original drawing.

import { blend, clean, type Rgb } from "./colour.ts";
import { woven, type ReadLabel } from "./judogiLabel.ts";
import { satinDefs, satinRun, satinShape } from "./judogiThread.ts";
import { n2, type Pt } from "./path.ts";
import { layout } from "./text.ts";

/** The brush kanji drawn here, offered for the brand's mark: 手 (te, "hand", the hand of 選手, an athlete), 力 (chikara, "strength") and 心 (kokoro, "heart, spirit"). */
export const BRAND_KANJI = ["te", "chikara", "kokoro"] as const;
export type BrandKanji = (typeof BRAND_KANJI)[number];

export const BRAND_KANJI_LABELS: Record<BrandKanji, { char: string; en: string }> = {
  te: { char: "手", en: "Hand (as in 選手, an athlete)" },
  chikara: { char: "力", en: "Strength" },
  kokoro: { char: "心", en: "Heart, spirit" },
};

/** A brush stroke: points along its middle (a smooth curve through them) and its width at each, from where the brush lands to where it lifts. */
type Stroke = readonly [readonly Pt[], readonly number[]];

/** A smooth path through points (Catmull-Rom), sampled. */
function sample(pts: readonly Pt[], per = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)] as Pt;
    const p1 = pts[i] as Pt;
    const p2 = pts[i + 1] as Pt;
    const p3 = pts[Math.min(pts.length - 1, i + 2)] as Pt;
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d]! + (-p0[d]! + p2[d]!) * t + (2 * p0[d]! - 5 * p1[d]! + 4 * p2[d]! - p3[d]!) * t2 + (-p0[d]! + 3 * p1[d]! - 3 * p2[d]! + p3[d]!) * t3)) as unknown as Pt);
    }
  }
  out.push(pts[pts.length - 1] as Pt);
  return out;
}

/** A stroke as a filled outline: its middle sampled, its width interpolated between the given ones, offset to both sides, with the ends rounded. */
function brush([pts, widths]: Stroke): string {
  const mid = sample(pts);
  const n = mid.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  mid.forEach((p, i) => {
    const a = mid[Math.max(0, i - 1)] as Pt;
    const b = mid[Math.min(n - 1, i + 1)] as Pt;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const f = (i / (n - 1)) * (widths.length - 1);
    const j = Math.min(widths.length - 2, Math.floor(f));
    const w = (widths[j]! + (widths[j + 1]! - widths[j]!) * (f - j)) / 2;
    left.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
    right.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  const cap = (from: Pt, to: Pt, tip: Pt): string => `Q${n2(tip[0])} ${n2(tip[1])} ${n2(to[0])} ${n2(to[1])}`;
  const first = mid[0] as Pt;
  const last = mid[n - 1] as Pt;
  const lead = (a: Pt, b: Pt, k: number): Pt => {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const l = Math.hypot(dx, dy) || 1;
    return [a[0] + (dx / l) * k, a[1] + (dy / l) * k];
  };
  const w0 = (widths[0] as number) / 2;
  const w1 = (widths[widths.length - 1] as number) / 2;
  let d = `M${n2(left[0]![0])} ${n2(left[0]![1])}`;
  for (const p of left.slice(1)) d += `L${n2(p[0])} ${n2(p[1])}`;
  d += cap(left[n - 1] as Pt, right[n - 1] as Pt, lead(last, mid[n - 2] as Pt, w1 * 1.2));
  for (const p of [...right].reverse().slice(1)) d += `L${n2(p[0])} ${n2(p[1])}`;
  d += cap(right[0] as Pt, left[0] as Pt, lead(first, mid[1] as Pt, w0 * 1.1));
  return `${d}Z`;
}

/** The kanji as brush strokes in a 100 by 100 box: a stroke lands thick, swells and lifts to a point, as a brush does. */
const KANJI: Record<BrandKanji, readonly Stroke[]> = {
  // 手: the slanting stroke on top, two bars, and the stroke down the middle that hooks at its foot.
  te: [
    [[[70, 9], [54, 19], [38, 27], [22, 34]], [3, 9, 7, 2.6]],
    [[[16, 45], [40, 42.5], [62, 40], [84, 35]], [9, 8, 7, 3]],
    [[[8, 66], [36, 63], [64, 60.5], [92, 55]], [10, 9, 8, 3]],
    [[[55, 8], [54, 36], [53, 64], [50, 86], [43, 94], [33, 86]], [8, 10, 10, 9, 6, 2.4]],
  ],
  // 力: the bar that turns down into a hook, and the long falling stroke across it.
  chikara: [
    [[[12, 36], [42, 35], [68, 33], [80, 40], [80, 62], [72, 84], [60, 93], [48, 88]], [10, 9, 8, 10, 10, 8, 5, 2.6]],
    [[[57, 7], [55, 34], [47, 58], [32, 78], [13, 94]], [7, 11, 11, 7, 2.6]],
  ],
  // 心: a dot on the left, the bowl that swings up into a hook, a dot above and one on the right.
  kokoro: [
    [[[16, 46], [23, 58], [31, 71]], [10, 9, 2.8]],
    [[[37, 36], [41, 60], [54, 80], [72, 86], [88, 75], [92, 56], [88, 46]], [3.5, 9, 11, 11, 9, 5, 2.6]],
    [[[51, 12], [55, 27], [60, 43]], [10, 9, 3]],
    [[[82, 24], [77, 38], [70, 52]], [9, 8, 2.8]],
  ],
};

/** The kanji as one path in its 100 by 100 box. */
export const kanjiPath = (k: BrandKanji): string => KANJI[k].map(brush).join("");

/** The Senshu S: one brush stroke swinging down through an S, thick at its bends, in a 100 by 100 box. */
const S_STROKE: Stroke = [[[78, 22], [58, 9], [32, 13], [22, 31], [38, 46], [62, 54], [79, 68], [71, 87], [46, 92], [22, 80]], [4, 11, 16, 15, 12, 12, 16, 16, 11, 4]];
export const sPath = (): string => brush(S_STROKE);

/** The brand as a person sets it. */
export interface JudogiBranding {
  /** The name on the labels, in Latin letters: SENSHU by default. */
  name?: string;
  /** The brush mark in the middle of the neck label: `te` (手), `chikara` (力), `kokoro` (心), or any text of your own, set in a system font. `te` by default. */
  kanji?: BrandKanji | string;
  /** The small line under the mark: SINCE 2026 by default. */
  line?: string;
  /** The size on the tag under the neck label: the garment's own size by default; a size such as 3B is yours to write. */
  sizeTag?: string;
  /** The labels' cloth (a variant or `#rrggbb`) and thread. Navy cloth with gold thread by default; black reads like a maker's own label. */
  colour?: string;
  thread?: string;
  /** Artwork of your own for the maker's-logo spots in place of the S. */
  logo?: { svg?: string; href?: string };
  /** Where the logo goes: one spot to a garment, among the places the rules name. */
  spots?: { jacket?: "hem" | "shoulder-left" | "shoulder-right"; pants?: "waist-left" | "waist-right" | "leg-left" | "leg-right"; belt?: "left" | "right" };
  /** Turn off the neck label (with its size tag), or the logos. */
  neckLabel?: boolean;
  logos?: boolean;
}

export interface ReadBranding {
  name: string;
  kanji: BrandKanji | string;
  line: string;
  sizeTag: string;
  colour: string | undefined;
  thread: string | undefined;
  logo: { svg?: string; href?: string } | undefined;
  spots: { jacket: "hem" | "shoulder-left" | "shoulder-right"; pants: "waist-left" | "waist-right" | "leg-left" | "leg-right"; belt: "left" | "right" };
  neckLabel: boolean;
  logos: boolean;
}

const word = (v: unknown, max: number, fallback: string): string => {
  if (typeof v !== "string") return fallback;
  return clean(v, max) ?? "";
};

/** The branding from outside: `true` for the default Senshu brand; `undefined` for none. */
export function readBranding(raw: unknown, size: string): ReadBranding | undefined {
  if (raw === true) return readBranding({}, size);
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as JudogiBranding;
  const kanji = typeof o.kanji === "string" && o.kanji.trim() !== "" ? (BRAND_KANJI as readonly string[]).includes(o.kanji) ? (o.kanji as BrandKanji) : [...o.kanji.trim()].slice(0, 3).join("") : "te";
  const logo = o.logo !== null && typeof o.logo === "object" ? o.logo : undefined;
  const s = o.spots ?? {};
  return {
    name: word(o.name, 16, "SENSHU").toUpperCase() || "SENSHU",
    kanji,
    line: word(o.line, 20, "SINCE 2026").toUpperCase(),
    sizeTag: word(o.sizeTag, 5, size) || size,
    colour: typeof o.colour === "string" ? o.colour : undefined,
    thread: typeof o.thread === "string" ? o.thread : undefined,
    logo,
    spots: {
      jacket: s.jacket === "shoulder-left" || s.jacket === "shoulder-right" ? s.jacket : "hem",
      pants: s.pants === "waist-left" || s.pants === "waist-right" || s.pants === "leg-right" ? s.pants : "leg-left",
      belt: s.belt === "right" ? "right" : "left",
    },
    neckLabel: o.neckLabel !== false,
    logos: o.logos !== false,
  };
}

const FONT = "'Yuji Syuku','Klee One','Klee','Hiragino Mincho ProN','Yu Mincho',serif";

/**
 * The woven neck label, centred on the origin and `w` units wide (1.4 times as wide as it is high): the brand's name in spaced Latin letters, the
 * brush mark in a ring in the middle, and the small line under it, in thread on dark cloth.
 */
export function neckLabel(id: string, b: ReadBranding, l: ReadLabel, w: number): { defs: string; body: string } {
  const h = w / 1.4;
  const base = woven(id, l, w, h);
  let s = base.under;
  const font = "system-ui";
  s += satinRun(layout(b.name, 0, -h * 0.34, { height: h * 0.1, maxWidth: w * 0.6, weight: "bold", tracking: 1.1 }), l.thread, `${id}S`, font);
  const r = h * 0.3;
  s += `<circle cx="0" cy="${n2(h * 0.02)}" r="${n2(r)}" fill="none" stroke="${base.thread}" stroke-width="${n2(h * 0.018)}" stroke-opacity="0.9"/>`;
  const k = (r * 1.7) / 100;
  if ((BRAND_KANJI as readonly string[]).includes(b.kanji)) {
    s += satinShape(kanjiPath(b.kanji as BrandKanji), l.thread, `${id}S`, `translate(${n2(-50 * k)} ${n2(h * 0.02 - 50 * k)}) scale(${n2(k)})`);
  } else {
    s += satinRun(layout(b.kanji, 0, h * 0.02, { height: r * 1.3, maxWidth: r * 1.7, weight: "black", asText: true }), l.thread, `${id}S`, FONT);
  }
  // Two brush strokes either side of the ring, like wings.
  for (const sign of [-1, 1]) s += satinShape(brush([[[sign * w * 0.18, h * 0.12], [sign * w * 0.3, h * 0.04], [sign * w * 0.4, -h * 0.07]], [h * 0.012, h * 0.045, h * 0.012]]), l.thread, `${id}S`, "");
  if (b.line !== "") s += satinRun(layout(b.line, 0, h * 0.355, { height: h * 0.07, maxWidth: w * 0.5, weight: "regular", tracking: 0.9 }), l.thread, `${id}S`, font);
  return { defs: base.defs, body: s + base.over };
}

/** The size tag sewn under the neck label: a small dark tag with the size in thread, `w` units wide and about 0.6 as high. */
export function sizeTag(id: string, text: string, l: ReadLabel, w: number): { defs: string; body: string } {
  const h = w * 0.62;
  const base = woven(id, l, w, h);
  const body = base.under + satinRun(layout(text, 0, 0, { height: h * 0.46, maxWidth: w * 0.74, weight: "bold" }), l.thread, `${id}S`, "system-ui") + base.over;
  return { defs: base.defs, body };
}

/** The Senshu S as a maker's logo in thread, centred on the origin in a box `w` by `h`; `id` names the thread pattern it defines. */
export function sLogo(rgb: Rgb, w: number, h: number, id: string): { defs: string; body: string } {
  const k = Math.min(w, h) / 100;
  return { defs: satinDefs(id, rgb), body: satinShape(sPath(), rgb, id, `translate(${n2(-50 * k)} ${n2(-50 * k)}) scale(${n2(k)})`, blend(rgb, [255, 255, 255], 0.62)) };
}
