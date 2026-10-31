// Stripes, two-colour belts, tips and tags for the belt. Real belts carry them in many ways: a stripe along the length (a white one on an
// orange belt, kids' belts in many clubs), two colours split lengthwise (the "half" belts of Judo Canada's white-yellow, yellow-orange and
// on, and of Denmark and Austria), a coloured tip block at one end with bars across it (the way jiu-jitsu and karate show degrees), and
// short bars or tags across a belt near an end (British Judo's Mon grades: a coloured belt with one to three tags; Australia's white bars
// at each end; Finland's red stripes). One flexible description covers them all, and `BELT_PRESETS` names the common real ones. Sources
// are in docs/judogi.md. Lengths are centimetres on a real belt (2.63 drawing units to the centimetre); nothing here draws a maker's mark.

import { BELT_RGB } from "./judogiBelt.ts";
import { hexOf, shade, type Rgb } from "./colour.ts";
import { satinStroke } from "./judogiThread.ts";
import type { BeltKnot } from "./beltTie.ts";

/** Drawing units to the centimetre (a belt 4 cm wide is 10.5 of them). */
const CM = 2.63;
/** How far each hanging end runs from where it leaves the knot to its cut end, in drawing units: the left (the picture's) and the right. */
export const END_LENGTH = [65.97, 60.52] as const;

/** The colours a stripe may be: the belt colours and a few more, or any `#rrggbb`. */
export const STRIPE_COLOURS = ["white", "yellow", "orange", "green", "blue", "brown", "black", "red", "grey", "purple", "gold", "silver"] as const;
export type StripeColour = (typeof STRIPE_COLOURS)[number];

const EXTRA_RGB: Record<string, Rgb> = { grey: [138, 140, 146], purple: [104, 52, 140], gold: [201, 160, 48], silver: [196, 199, 206] };

/** A stripe or bar colour as `#rrggbb`, or undefined if it is neither a name nor a hex colour. */
export function stripeHex(colour: unknown): string | undefined {
  if (typeof colour !== "string") return undefined;
  const c = colour.trim().toLowerCase();
  const rgb = BELT_RGB[c] ?? EXTRA_RGB[c];
  if (rgb !== undefined) return hexOf(rgb);
  return /^#[0-9a-f]{6}$/.test(c) ? c : undefined;
}

/** A stripe running the length of the belt. */
export interface BeltAlong {
  colour: string;
  /** Where across the belt: its `centre` (the default), the two `edges`, the `top` or `bottom` edge, or a number from 0 (the top edge) to 1 (the bottom). */
  at?: "centre" | "edges" | "top" | "bottom" | number;
  /** Its width in centimetres (1 by default), kept inside the belt. */
  widthCm?: number;
}

/** Bars across the belt, a number of them near a cut end. */
export interface BeltBars {
  colour: string;
  /** Which hanging ends carry them: `both` (the default), `left` or `right` as seen from the front. */
  ends?: "both" | "left" | "right";
  /** How many (1 by default, up to 6). */
  count?: number;
  /** Each bar's width along the belt, centimetres (0.8 by default), and the gap between bars (0.8). */
  widthCm?: number;
  gapCm?: number;
  /** From the cut end to the first bar, centimetres (1.5 by default). */
  fromEndCm?: number;
}

/** A block of one colour over the last part of an end, with bars across it if asked: a rank bar's tip. */
export interface BeltTipStyle {
  colour: string;
  /** Which ends (`both` by default) and how long a block, centimetres (6 by default). */
  ends?: "both" | "left" | "right";
  lengthCm?: number;
  /** How far the block starts from the cut end, centimetres (0 by default: a jiu-jitsu belt's black bar sits a few centimetres in). */
  fromEndCm?: number;
  /** Bars across the block, counted from its inner edge toward the cut end the way degrees are: `{ colour: "white", count: 3 }`. */
  bars?: { colour: string; count?: number; widthCm?: number; gapCm?: number };
}

/**
 * A degree in Roman numerals stitched across one end, as the ITF's black belts show it: "in gold coloured Roman Numerals, positioned transversally across one end of the
 * belt" (ITF Umpire Rules, Appendix 2, Approved Clothing, in force January 1st, 2015). The numerals read across the belt with their tops toward the knot, so they stand upright
 * on an end that hangs. Drawn as the package's own straight satin strokes (I, V and X need no font).
 */
export interface BeltNumeral {
  /** The degree, 1 to 10 (I to X). */
  value: number;
  /** The thread: gold by default, or any stripe colour. */
  colour?: string;
  /** Which hanging end, as seen from the front: `left` (the default: the end a folded belt shows on top) or `right`. */
  end?: "left" | "right";
  /** From the cut end to the numerals' nearer edge, centimetres (3 by default). */
  fromEndCm?: number;
}

/** Everything that can be drawn on a belt's cloth besides its colour and the embroidery. Every part is optional and they combine. */
export interface JudogiBeltStyle {
  /** The belt's own colour where it is none of the grade colours (a jiu-jitsu kid's grey, a purple belt): a colour name or `#rrggbb`, taking the place of `belt`'s. */
  base?: string;
  /** The belt's colour takes turns with this one in panels along its length, as a kohaku belt's red and white do (the coral belt of jiu-jitsu: red and black). */
  alternate?: string;
  /** A second colour: the belt is split lengthwise, `split` on the lower half and the belt's colour above it (a half grade). */
  split?: string;
  along?: BeltAlong[];
  bars?: BeltBars[];
  tip?: BeltTipStyle;
  numeral?: BeltNumeral;
}

/** One band along the belt, as parts of its width from the top edge. */
export interface Band {
  from: number;
  to: number;
  fill: string;
}

/** What a belt's style comes to once checked: only colours that exist, counts and lengths kept to what a belt can carry. */
export interface ReadStyle {
  base: string | undefined;
  alternate: string | undefined;
  split: string | undefined;
  along: { fill: string; from: number; to: number }[];
  bars: { fill: string; ends: [boolean, boolean]; count: number; widthCm: number; gapCm: number; fromEndCm: number }[];
  tip: { fill: string; ends: [boolean, boolean]; lengthCm: number; fromEndCm: number; bars: { fill: string; count: number; widthCm: number; gapCm: number } | undefined } | undefined;
  numeral?: { text: string; fill: string; end: 0 | 1; fromEndCm: number };
}

const num = (v: unknown, fallback: number, lo: number, hi: number): number => (typeof v === "number" && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback);
const endsOf = (v: unknown): [boolean, boolean] => (v === "left" ? [true, false] : v === "right" ? [false, true] : [true, true]);

/** The widths here are in centimetres on a belt about 4 to 5 cm wide, so a stripe is read as parts of that width. */
const BELT_CM = 4.5;

/** Check a style: drop what has no valid colour, keep counts and sizes to what fits. Undefined when nothing is left. */
export function readStyle(style: JudogiBeltStyle | undefined): ReadStyle | undefined {
  if (style === null || typeof style !== "object") return undefined;
  const split = stripeHex(style.split);
  const base = stripeHex(style.base);
  const alternate = stripeHex(style.alternate);
  const along: ReadStyle["along"] = [];
  for (const a of Array.isArray(style.along) ? style.along : []) {
    const fill = stripeHex(a?.colour);
    if (fill === undefined) continue;
    const w = num(a.widthCm, 1, 0.1, 2) / BELT_CM;
    const put = (centre: number): void => {
      const from = Math.max(0, Math.min(1 - w, centre - w / 2));
      along.push({ fill, from, to: from + w });
    };
    if (a.at === "edges") {
      along.push({ fill, from: 0, to: w }, { fill, from: 1 - w, to: 1 });
    } else if (a.at === "top") along.push({ fill, from: 0, to: w });
    else if (a.at === "bottom") along.push({ fill, from: 1 - w, to: 1 });
    else put(typeof a.at === "number" && Number.isFinite(a.at) ? Math.max(0, Math.min(1, a.at)) : 0.5);
  }
  const bars: ReadStyle["bars"] = [];
  for (const b of Array.isArray(style.bars) ? style.bars : []) {
    const fill = stripeHex(b?.colour);
    if (fill === undefined) continue;
    bars.push({ fill, ends: endsOf(b.ends), count: Math.round(num(b.count, 1, 1, 6)), widthCm: num(b.widthCm, 1, 0.2, 3), gapCm: num(b.gapCm, 0.8, 0.2, 3), fromEndCm: num(b.fromEndCm, 1.5, 0, 15) });
  }
  let tip: ReadStyle["tip"];
  const tipFill = stripeHex(style.tip?.colour);
  if (style.tip !== undefined && tipFill !== undefined) {
    const t = style.tip;
    const barFill = stripeHex(t.bars?.colour);
    tip = {
      fill: tipFill, ends: endsOf(t.ends), lengthCm: num(t.lengthCm, 6, 1, 20), fromEndCm: num(t.fromEndCm, 0, 0, 15),
      bars: barFill === undefined || t.bars === undefined ? undefined : { fill: barFill, count: Math.round(num(t.bars.count, 1, 1, 6)), widthCm: num(t.bars.widthCm, 0.8, 0.2, 2), gapCm: num(t.bars.gapCm, 0.7, 0.2, 2) },
    };
  }
  const n = style.numeral;
  const numeral = n === undefined || typeof n !== "object" || typeof n.value !== "number" || !Number.isFinite(n.value) ? undefined
    : { text: roman(Math.round(Math.max(1, Math.min(10, n.value)))), fill: stripeHex(n.colour ?? "gold") ?? (stripeHex("gold") as string), end: (n.end === "right" ? 1 : 0) as 0 | 1, fromEndCm: num(n.fromEndCm, 3, 0.5, 15) };
  if (base === undefined && alternate === undefined && split === undefined && along.length === 0 && bars.length === 0 && tip === undefined && numeral === undefined) return undefined;
  return { base, alternate, split, along, bars, tip, ...(numeral === undefined ? {} : { numeral }) };
}

/** A number 1 to 10 in Roman numerals. */
export function roman(v: number): string {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][v] ?? "I";
}

/** How wide each numeral is, as a part of its height, and the gap between two. */
const GLYPH_W: Record<string, number> = { I: 0.34, V: 0.66, X: 0.66 };
const GLYPH_GAP = 0.14;

/**
 * The numerals' box on an end, in the end's frame: from `x0` to `x1` along it (`x1` nearer the cut end), and their height along the belt. The row of numerals runs across
 * the belt and is kept inside it, a little in from each edge, so a long one (VIII) is drawn smaller.
 */
export function numeralBox(n: NonNullable<ReadStyle["numeral"]>, end: 0 | 1, half: number): { x0: number; x1: number; h: number } {
  const across = [...n.text].reduce((w, c) => w + (GLYPH_W[c] ?? 0.34), 0) + GLYPH_GAP * (n.text.length - 1);
  const h = Math.min(2.4 * CM, (2 * half * 0.78) / across);
  const x1 = END_LENGTH[end] - n.fromEndCm * CM;
  return { x0: x1 - h, x1, h };
}

/** The numerals in thread, across one end in its own frame: each glyph upright with its top toward the knot, read from the picture's left as the end hangs. */
function numeralMark(n: NonNullable<ReadStyle["numeral"]>, end: 0 | 1, half: number): string {
  const { x0, h } = numeralBox(n, end, half);
  const chars = [...n.text];
  const across = chars.reduce((w, c) => w + (GLYPH_W[c] ?? 0.34), 0) + GLYPH_GAP * (chars.length - 1);
  const sw = Math.max(0.45, h * 0.15);
  const serif = (GLYPH_W.I as number) * h;
  // A glyph's own upright frame (u to the right as read, v up) laid on the end: up is toward the knot (-x), and reading runs the way the end's -y does, the picture's
  // left to right on an end that hangs.
  const at = (u: number, v: number): string => `${n2s(x0 + h / 2 - v)} ${n2s(-u)}`;
  let u = -(across * h) / 2;
  let d = "";
  for (const c of chars) {
    const w = (GLYPH_W[c] ?? 0.34) * h;
    const m = u + w / 2;
    const top = h / 2 - sw / 2;
    if (c === "I") d += `M${at(m, -top)}L${at(m, top)}`;
    if (c === "V") d += `M${at(u + sw / 2, top)}L${at(m, -top)}L${at(u + w - sw / 2, top)}`;
    if (c === "X") d += `M${at(u + sw / 2, top)}L${at(u + w - sw / 2, -top)}M${at(u + w - sw / 2, top)}L${at(u + sw / 2, -top)}`;
    // Serifs: a short bar across the top and the foot of each stroke's ends, as a numeral is cut.
    const bar = (x: number, v: number): string => `M${at(x - serif / 2, v)}L${at(x + serif / 2, v)}`;
    if (c === "I") d += bar(m, top) + bar(m, -top);
    if (c === "V") d += bar(u + sw / 2, top) + bar(u + w - sw / 2, top);
    if (c === "X") d += bar(u + sw / 2, top) + bar(u + w - sw / 2, top) + bar(u + sw / 2, -top) + bar(u + w - sw / 2, -top);
    u += w + GLYPH_GAP * h;
  }
  return satinStroke(d, sw, rgbOf(n.fill));
}

const n2s = (v: number): string => String(Math.round(v * 100) / 100);

/** The bands along the whole belt, in the order they are laid: the split colour's half first, then each stripe over it. */
export function bandsOf(style: ReadStyle | undefined): Band[] {
  if (style === undefined) return [];
  return [...(style.split === undefined ? [] : [{ from: 0.5, to: 1, fill: style.split }]), ...style.along];
}

/**
 * What lies across one hanging end, drawn in the end's own frame (x along it from the knot to the cut end at `END_LENGTH[end]`, y across it
 * from its middle, `half` either side): the tip block with its bars, then the bars across, each with the faintest rows of stitching over it.
 */
export function endMark(style: ReadStyle | undefined, end: 0 | 1, half: number): string {
  if (style === undefined) return "";
  const l = END_LENGTH[end];
  let s = "";
  const block = (x0: number, x1: number, fill: string): string => {
    const edge = hexOf(shade(rgbOf(fill), -0.4));
    return `<rect x="${n(x0)}" y="${n(-half)}" width="${n(x1 - x0)}" height="${n(2 * half)}" fill="${fill}"/>` +
      `<path d="M${n(x0)} ${n(-half)}V${n(half)}M${n(x1)} ${n(-half)}V${n(half)}" stroke="${edge}" stroke-width="0.5" stroke-opacity="0.55"/>` +
      `<path d="M${n(x0)} ${n(-half + 0.3)}H${n(x1)}M${n(x0)} ${n(half - 0.3)}H${n(x1)}" stroke="#000" stroke-width="0.4" stroke-opacity="0.25"/>`;
  };
  const tip = style.tip;
  if (tip !== undefined && tip.ends[end]) {
    const x1 = l - tip.fromEndCm * CM;
    const x0 = Math.max(0, x1 - tip.lengthCm * CM);
    s += block(x0, x1, tip.fill);
    if (tip.bars !== undefined) {
      const w = tip.bars.widthCm * CM;
      const g = tip.bars.gapCm * CM;
      // Degrees are added from the inner edge of the block toward the end, the first one nearest the belt.
      for (let k = 0; k < tip.bars.count; k++) {
        const x = x0 + 0.9 * CM + k * (w + g);
        if (x + w > x1 - 0.3) break;
        s += block(x, x + w, tip.bars.fill);
      }
    }
  }
  if (style.numeral !== undefined && style.numeral.end === end) s += numeralMark(style.numeral, end, half);
  for (const b of style.bars) {
    if (!b.ends[end]) continue;
    const w = b.widthCm * CM;
    for (let k = 0; k < b.count; k++) {
      const x1 = l - b.fromEndCm * CM - k * (w + b.gapCm * CM);
      if (x1 - w < 0) break;
      s += block(x1 - w, x1, b.fill);
    }
  }
  return s;
}

const rgbOf = (hex: string): Rgb => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const n = (v: number): string => String(Math.round(v * 100) / 100);

/** A named, real-world arrangement: the belt it goes on and its style. `source` names the page in docs/judogi.md that backs it. */
export interface BeltPreset {
  id: string;
  label: string;
  belt: "white" | "yellow" | "orange" | "green" | "blue" | "brown" | "black" | "red";
  style: JudogiBeltStyle;
  /** The system it belongs to, and the number of the source in docs/judogi.md. */
  system: string;
  source: string;
  /** The art whose belt it is. */
  art: "judo" | "bjj" | "karate" | "taekwondo";
  /** How that art ties it, where not judo's (`beltKnot` and `beltTailCm` of `renderJudogi`): a karate belt's long ends, an ITF belt once round. */
  tie?: { knot: BeltKnot; tailCm: number };
}

const half = (belt: BeltPreset["belt"], split: string, label: string, system: string, source: string): BeltPreset => ({ id: `half-${belt}-${split}`, label, belt, style: { split }, system, source, art: "judo" });
const tags = (belt: BeltPreset["belt"], tag: string, count: number, mon: number): BeltPreset => ({
  id: `mon-${mon}`, label: `${mon}${mon === 1 ? "st" : mon === 2 ? "nd" : mon === 3 ? "rd" : "th"} Mon: ${belt} with ${count} ${tag} tag${count === 1 ? "" : "s"}`, belt,
  style: { bars: [{ colour: tag, count }] }, system: "British Judo Mon grades", source: "bja-mon", art: "judo",
});
/** A karate belt, worn long; a WT dobok's, twice round; an ITF one, once round (beltTie.ts). */
const KARATE_TIE = { knot: "hanging", tailCm: 50 } as const;
const WT_TIE = { knot: "hanging", tailCm: 38 } as const;
const ITF_TIE = { knot: "single", tailCm: 40 } as const;
const ord = (n: number): string => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const karateKyu = (bars: number): BeltPreset => ({
  id: `karate-brown-${bars}`, label: `Karate: brown, ${bars} black bar${bars === 1 ? "" : "s"} (${ord(4 - bars)} kyu)`, belt: "brown", style: { bars: [{ colour: "black", count: bars, ends: "left", widthCm: 0.8, gapCm: 0.6, fromEndCm: 4 }] },
  system: "Karate kyu and dan bars (a lead, style by style)", source: "chart-karate", art: "karate", tie: KARATE_TIE,
});
const karateDan = (n: number): BeltPreset => ({
  id: `karate-dan-${n}`, label: `Karate: black, ${n} gold bar${n === 1 ? "" : "s"} (${ord(n)} dan)`, belt: "black", style: { bars: [{ colour: "gold", count: n, ends: "left", widthCm: 0.6, gapCm: 0.5, fromEndCm: 4 }] },
  system: "Karate kyu and dan bars (a lead, style by style)", source: "chart-karate", art: "karate", tie: KARATE_TIE,
});
const itfDan = (n: number, junior = false): BeltPreset => ({
  id: `itf-${junior ? "junior" : "senior"}-${n}`, label: `ITF ${junior ? "junior" : "senior"} black belt, ${roman(n)} (${ord(n)} degree)`, belt: "black",
  style: { numeral: { value: n }, ...(junior ? { along: [{ colour: "white", widthCm: 1 }] } : {}) }, system: "ITF black belts (degree in gold Roman numerals)", source: "itf-app2", art: "taekwondo", tie: ITF_TIE,
});

/** The common real systems, by id. The designer fills its controls from one, and `renderJudogi({ belt, beltStyle })` takes the same pair. */
export const BELT_PRESETS: readonly BeltPreset[] = [
  // Judo Canada's half grades (6+, 5+, 4+, 3+, 2+): the next grade's colour beside the one held.
  half("white", "yellow", "White-yellow (6+)", "Judo Canada kyu", "judo-canada"),
  half("yellow", "orange", "Yellow-orange (5+)", "Judo Canada kyu", "judo-canada"),
  half("orange", "green", "Orange-green (4+)", "Judo Canada kyu", "judo-canada"),
  half("green", "blue", "Green-blue (3+)", "Judo Canada kyu", "judo-canada"),
  half("blue", "brown", "Blue-brown (2+)", "Judo Canada kyu", "judo-canada"),
  // British Judo's Mon grades: a coloured belt with one to three tags, red tags on yellow-and-up, yellow tags on red.
  tags("yellow", "red", 1, 4), tags("yellow", "red", 2, 5), tags("yellow", "red", 3, 6),
  tags("orange", "red", 1, 7), tags("orange", "red", 2, 8), tags("orange", "red", 3, 9),
  tags("green", "red", 1, 10), tags("green", "red", 2, 11), tags("green", "red", 3, 12),
  tags("blue", "red", 1, 13), tags("blue", "red", 2, 14), tags("blue", "red", 3, 15),
  tags("brown", "red", 1, 16), tags("brown", "red", 2, 17), tags("brown", "red", 3, 18),
  // Australia's junior bars (as Wikipedia reports them): white bars at each end, 3, 2 or 1 by age band.
  { id: "bars-white-3", label: "Three white bars at each end (under 10)", belt: "yellow", style: { bars: [{ colour: "white", count: 3 }] }, system: "Junior bars at each end", source: "wikipedia-rank-in-judo", art: "judo" },
  { id: "bars-white-2", label: "Two white bars at each end (10 to 13)", belt: "yellow", style: { bars: [{ colour: "white", count: 2 }] }, system: "Junior bars at each end", source: "wikipedia-rank-in-judo", art: "judo" },
  { id: "bars-white-1", label: "One white bar at each end (13 to 16)", belt: "yellow", style: { bars: [{ colour: "white", count: 1 }] }, system: "Junior bars at each end", source: "wikipedia-rank-in-judo", art: "judo" },
  // Finland's one to three red stripes on both ends of a junior belt (as Wikipedia reports it).
  { id: "stripes-red-2", label: "Two red stripes on both ends (junior)", belt: "white", style: { bars: [{ colour: "red", count: 2 }] }, system: "Junior stripes at both ends", source: "wikipedia-rank-in-judo", art: "judo" },
  // The AJJF-approved women's black belt (kuro-obi): black with one white line down the middle of its whole length, still sold in Japan.
  { id: "womens-black-white-line", label: "Women's black belt (white line)", belt: "black", style: { along: [{ colour: "white", widthCm: 1.2 }] }, system: "AJJF women's black belt (Japan)", source: "kusakura-jgrk", art: "judo" },
  // Brazilian jiu-jitsu kids: a centre stripe, and a coloured tip carrying degree stripes (optional, a school's choice).
  { id: "kids-centre-white", label: "Kids: colour belt with a white centre stripe", belt: "orange", style: { along: [{ colour: "white" }] }, system: "Jiu-jitsu kids' belts", source: "brazilianblackbelt-kids", art: "bjj" },
  { id: "kids-centre-black", label: "Kids: colour belt with a black centre stripe", belt: "green", style: { along: [{ colour: "black" }] }, system: "Jiu-jitsu kids' belts", source: "brazilianblackbelt-kids", art: "bjj" },
  { id: "kids-centre-black-yellow", label: "Kids: yellow belt with a black centre stripe", belt: "yellow", style: { along: [{ colour: "black" }] }, system: "Jiu-jitsu kids' belts", source: "brazilianblackbelt-kids", art: "bjj" },
  { id: "tip-black-degrees-3", label: "Black tip, three white degree stripes", belt: "blue", style: { tip: { colour: "black", lengthCm: 7, bars: { colour: "white", count: 3 } } }, system: "Degree stripes on a tip", source: "brazilianblackbelt-kids", art: "bjj" },
  { id: "tip-red-degrees-3", label: "Red tip, three white degree stripes", belt: "black", style: { tip: { colour: "red", lengthCm: 7, bars: { colour: "white", count: 3 } } }, system: "Degree stripes on a tip", source: "brazilianblackbelt-kids", art: "bjj" },
  // Karate, worn long: brown kyu belts with one to three black bars and black dan belts with gold bars across one end, as many charts and makers show them (a lead: the
  // styles differ, and none of their bodies' own pages was read).
  karateKyu(1), karateKyu(3), karateDan(1), karateDan(3), karateDan(5),
  // Taekwon-do. The ITF's colour belts carry a tip of the next colour at the end (ITF, Belt colour meanings); its black belts go once round and show the degree in gold Roman
  // numerals across one end, the junior one with a white stripe 1 cm wide down the middle of one face (ITF Umpire Rules, Appendix 2, 2015).
  { id: "itf-gup-blue-red", label: "ITF: blue, red tip (3rd gup)", belt: "blue", style: { tip: { colour: "red", lengthCm: 5 } }, system: "ITF colour belts with tips", source: "itf-belts", art: "taekwondo", tie: ITF_TIE },
  { id: "itf-gup-red-black", label: "ITF: red, black tip (1st gup)", belt: "red", style: { tip: { colour: "black", lengthCm: 5 } }, system: "ITF colour belts with tips", source: "itf-belts", art: "taekwondo", tie: ITF_TIE },
  itfDan(1), itfDan(4), itfDan(7), itfDan(2, true),
  // World Taekwondo and the Kukkiwon: the poom belt, black and red (WT's guidelines name it so); black on top, as it is worn (a lead), and a dan belt with gold bars (a lead).
  { id: "poom", label: "Poom belt: black over red, lengthwise", belt: "black", style: { split: "red" }, system: "Kukkiwon poom belt (junior black belt)", source: "wt-ident", art: "taekwondo", tie: WT_TIE },
  { id: "wt-dan-bars-3", label: "Taekwondo: black, three gold bars (3rd dan)", belt: "black", style: { bars: [{ colour: "gold", count: 3, ends: "left", widthCm: 0.6, gapCm: 0.5, fromEndCm: 4 }] }, system: "Taekwondo dan bars (a lead)", source: "chart-arts", art: "taekwondo", tie: WT_TIE },
];

/** The preset of an id, or undefined. */
export const beltPreset = (id: string): BeltPreset | undefined => BELT_PRESETS.find((p) => p.id === id);
