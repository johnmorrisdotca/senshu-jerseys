// The belt (obi): a thick band of many stitched rows, tied round the waist with a square knot at the front and two ends hanging
// 20-30 cm (IJF Judogi Rules, 09 03 2022: 4-5 cm wide, 4-5 mm thick). Drawn on the jacket's faces when it is worn, or on its own as a
// tied ring. Rank colours are presets; red-white is the panels of a kohaku belt. Original drawing.

import { blend, hexOf, shade, type Rgb } from "./colour.ts";
import { band, fold, smooth, toneOf, type BeltPaint, type Face, type Tone } from "./judogiCloth.ts";
import { n2, poly, type Pt } from "./path.ts";
import { END_LENGTH_25, tieEnds, wrapsOf, type BeltTie } from "./beltTie.ts";

export const BELT_RGB: Record<string, Rgb> = {
  white: [244, 242, 234],
  yellow: [232, 196, 16],
  orange: [226, 114, 30],
  green: [44, 126, 60],
  blue: [38, 86, 168],
  brown: [104, 60, 34],
  black: [30, 30, 32],
  red: [178, 22, 34],
};

/** At 2.63 units to the centimetre: a 4.5 cm belt. */
const WIDTH = 12;

/** Where the cut ends fall on a strap's strip, and along a hanging end drawn on its own (`end()`): the left and the right. See `judogiStrap.ts` (`END_X`) and `END_LENGTH`. */
export const STRIP_CUTS = [196, 118.5] as const;
export const END_CUTS = [65.97, 60.52] as const;

/**
 * Where a kohaku belt's pattern starts, so that both cut ends fall well inside a red section (the belt is red at both ends, as official kata belts are):
 * the offset, in drawing units, that keeps the nearer cut farthest from a change of colour. A section is `section` long; red and white take turns.
 */
function kohakuPhase(section: number, cuts: readonly number[]): number {
  let best = 0;
  let bestGap = -1;
  const period = 2 * section;
  for (let phase = 0; phase < period; phase += 0.5) {
    const gap = Math.min(...cuts.map((c) => {
      const x = (((c + phase) % period) + period) % period;
      return x < section ? Math.min(x, section - x) : -1;
    }));
    if (gap > bestGap) {
      bestGap = gap;
      best = phase;
    }
  }
  return best;
}

/** The sections of two colours that take turns along a belt, `a` first and at both cut ends, each `section` long: its fill for the flat drawing and for a strap's strip. */
function panels(id: string, a: Rgb, b: Rgb, section: number): { fill: string; stripFill: string; defs: string; panels: { a: string; b: string } } {
  const pattern = (pid: string, phase: number): string => `<pattern id="${pid}" width="${n2(2 * section)}" height="80" patternUnits="userSpaceOnUse" patternTransform="translate(${n2(-phase)} 0)"><rect width="${n2(2 * section)}" height="80" fill="${hexOf(b)}"/><rect width="${n2(section)}" height="80" fill="${hexOf(a)}"/></pattern>`;
  return { fill: `url(#${id})`, stripFill: `url(#${id}s)`, defs: pattern(id, kohakuPhase(section, END_CUTS)) + pattern(`${id}s`, kohakuPhase(section, STRIP_CUTS)), panels: { a: hexOf(a), b: hexOf(b) } };
}

/**
 * The red and white sections of a belt that is folded, laid on the strip by the belt's real length: from the cut end of each hanging end the first section is the first colour
 * and they take turns every `sectionCm`, so a belt of an odd number of sections is that colour at both ends (`kohakuSection` finds the length). The strip is one picture of
 * 280 units: the stretch from -40 to 58 is the plain belt (laid by `bulkAt` in beltBox.ts, by the distance from the first end, repeating every two sections), the end stretches
 * 58 to 118.5 and 130 to 196 are each laid from their own cut end, so the sections come out at the same distance from the tips as on the belt.
 */
export function foldedPanels(id: string, a: string, b: string, sectionCm: number): { fill: string; defs: string } {
  const U = 2.63;
  const S = sectionCm * U;
  const P = 2 * S;
  const rect = (x0: number, x1: number, fill: string): string => (x1 > x0 ? `<rect x="${n2(x0)}" width="${n2(x1 - x0)}" height="80" fill="${fill}"/>` : "");
  let body = rect(-40, 240, b);
  // The plain stretch, -40 to 56 (a section is at most 18 cm, a period 95 units): the first colour for a section, then the other, repeating.
  for (let x = -40; x < 56; x += P) body += rect(x, Math.min(56, x + S), a);
  // An end stretch from `lo` to its cut end `tip`: the sections counted from the cut end toward smaller x, red (the first colour) at the end. A cell's corners are drawn a hair
  // beyond it, so the strip from `from` to `lo` carries on the colour the stretch starts with (a seam would show there otherwise), and the strip past the cut end is the first colour.
  const end = (from: number, lo: number, tip: number, to: number): string => {
    let t = rect(from, lo, Math.floor((tip - lo) / S) % 2 === 0 ? a : b) + rect(lo, tip, b);
    for (let d = 0; d < tip - lo; d += P) t += rect(Math.max(lo, tip - d - S), tip - d, a);
    return t + rect(tip, to, a);
  };
  body += end(56, 58, STRIP_CUTS[1], STRIP_CUTS[1]) + end(STRIP_CUTS[1], 130, STRIP_CUTS[0], 240);
  return { fill: `url(#${id}f)`, defs: `<pattern id="${id}f" x="-40" y="0" width="280" height="80" patternUnits="userSpaceOnUse"><g transform="translate(40 0)">${body}</g></pattern>` };
}

/** The length of one section of a folded belt `cm` long: the nearest odd number of sections of about `nominalCm` (12 to 18), so that it is the first colour at both ends. */
export function kohakuSection(cm: number, nominalCm: number): number {
  const nominal = Math.max(12, Math.min(18, nominalCm));
  let k = Math.max(1, 2 * Math.round((cm / nominal - 1) / 2) + 1);
  // Keep a section between 12 and 18 cm.
  while (cm / k > 18) k += 2;
  while (cm / k < 12 && k > 1) k -= 2;
  return cm / k;
}

const rgbOfHex = (hex: string): Rgb => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];

/**
 * The paint of a belt colour, or of the red and white sections of a kohaku belt (each `sectionCm` long, 12 to 18 cm by the size of the belt, red at both ends).
 * `base` is a colour of its own (`#rrggbb`) in place of the belt's, and `alternate` a second colour that takes turns with it in sections of the same length.
 */
export function beltPaint(uid: string, belt: string, sectionCm = 15, base?: string, alternate?: string): BeltPaint | undefined {
  if (belt === "none") return undefined;
  const section = Math.max(12, Math.min(18, sectionCm)) * 2.63;
  if (alternate !== undefined) {
    const a = base === undefined ? (BELT_RGB[belt] ?? (BELT_RGB.white as Rgb)) : rgbOfHex(base);
    const edge = rgbOfHex(alternate);
    const dark = a[0] + a[1] + a[2] < 160;
    return { ...panels(`${uid}alt`, a, edge, section), edge: hexOf(dark ? blend(a, [0, 0, 0], 0.5) : shade(a, -0.38)), stitch: hexOf(dark ? shade(a, 0.22) : shade(a, -0.24)) };
  }
  if (belt === "red-white") {
    const red = BELT_RGB.red as Rgb;
    const white = BELT_RGB.white as Rgb;
    return { ...panels(`${uid}kohaku`, red, white, section), edge: hexOf(shade(red, -0.4)), stitch: hexOf(shade(red, -0.25)) };
  }
  const rgb = base !== undefined ? rgbOfHex(base) : (BELT_RGB[belt] ?? (BELT_RGB.white as Rgb));
  const dark = rgb[0] + rgb[1] + rgb[2] < 160;
  return {
    fill: hexOf(rgb),
    edge: hexOf(dark ? blend(rgb, [0, 0, 0], 0.5) : shade(rgb, -0.38)),
    stitch: hexOf(dark ? shade(rgb, 0.22) : shade(rgb, -0.24)),
    defs: "",
  };
}

/** Rows of stitching along a band between two edges. */
function rows(top: readonly Pt[], foot: readonly Pt[], p: BeltPaint, n = 10): string {
  let s = "";
  for (let k = 1; k <= n; k++) {
    const f = k / (n + 1);
    const line = top.map((q, i) => [q[0] + (foot[i]![0] - q[0]) * f, q[1] + (foot[i]![1] - q[1]) * f] as Pt);
    s += `<path d="${smooth(line)}" fill="none" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
  }
  return s;
}

/** A length of belt between two edges: cloth, rows, a lit top edge and a darker lower one. */
function length(top: readonly Pt[], foot: readonly Pt[], p: BeltPaint, n = p.rows ?? 10): string {
  const shape = band(top, foot);
  // Colours along the belt (a half grade's second colour, a centre stripe): the part of the width between two lines, drawn over the cloth.
  const at = (f: number): Pt[] => top.map((q, i) => [q[0] + (foot[i]![0] - q[0]) * f, q[1] + (foot[i]![1] - q[1]) * f] as Pt);
  const bands = (p.bands ?? []).map((b) => `<path d="${band(at(b.from), at(b.to))}" fill="${b.fill}"/>`).join("");
  // A satin or silk cover catches the light in a soft band along each lit side of the belt.
  const sheen = p.cover === undefined || p.cover === "cotton" ? "" : `<path d="${band(at(0.06), at(0.38))}" fill="#fff" fill-opacity="${p.cover === "silk" ? 0.3 : 0.2}"/><path d="${band(at(0.7), at(0.86))}" fill="#fff" fill-opacity="${p.cover === "silk" ? 0.14 : 0.08}"/>`;
  return `<path d="${shape}" fill="${p.fill}"/>` + bands + rows(top, foot, p, n) + sheen +
    `<path d="${smooth(top)}" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="0.9"/>` +
    `<path d="${smooth(foot)}" fill="none" stroke="${p.edge}" stroke-opacity="0.8" stroke-width="0.9"/>` +
    `<path d="${shape}" fill="none" stroke="${p.edge}" stroke-opacity="0.55" stroke-width="0.5"/>`;
}

/** Where the knot sits, and the two hanging ends from it (as the belt is tied), for a belt whose turns start at `y0` and sag `sag` at the middle. */
function knotAt(y0: number, sag: number, tie: BeltTie | undefined): { cx: number; cy: number; ends: [Pt, Pt][] } {
  const cx = 100;
  const cy = y0 + sag + WIDTH / 2;
  return { cx, cy, ends: tieEnds(tie, cy) };
}

/** A hanging end's two long sides: a strip from the knot with a slight bow, cut square. */
function endSides(from: Pt, to: Pt): [Pt[], Pt[]] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (WIDTH / 2);
  const ny = (dx / l) * (WIDTH / 2);
  const bow = 2.5 * Math.sign(dx);
  const left: Pt[] = [[from[0] - nx, from[1] - ny], [(from[0] + to[0]) / 2 - nx + bow, (from[1] + to[1]) / 2 - ny], [to[0] - nx, to[1] - ny]];
  return [left, left.map((q) => [q[0] + 2 * nx, q[1] + 2 * ny] as Pt)];
}

/**
 * A hanging end, with its rows running down it. It is drawn in a frame along its own length and turned into place, so a pattern (a
 * kohaku belt's panels) runs along the end as it does along the turns, not across it.
 */
function end(from: Pt, to: Pt, p: BeltPaint, marks = "", stripes = "", half = WIDTH / 2, i: 0 | 1 = 0): string {
  // An end longer than the judogi's is drawn in a frame whose cut end lies where the judogi's does, so what is sewn near the end and a kohaku belt's sections fall as they do there.
  const extra = Math.hypot(to[0] - from[0], to[1] - from[1]) - (END_LENGTH_25[i] as number);
  const shift = Math.abs(extra) < 0.01 ? 0 : extra;
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const local = (q: readonly Pt[]): Pt[] => q.map((v) => [(v[0] - from[0]) * c + (v[1] - from[1]) * s - shift, -(v[0] - from[0]) * s + (v[1] - from[1]) * c] as Pt);
  const [left, right] = endSides(from, to).map(local) as [Pt[], Pt[]];
  const a = left[2] as Pt;
  const b = right[2] as Pt;
  return `<g transform="translate(${n2(from[0])} ${n2(from[1])}) rotate(${n2((angle * 180) / Math.PI)})${shift === 0 ? "" : ` translate(${n2(shift)} 0)`}">` + length(left, right, p) + (stripes === "" ? "" : `<g transform="scale(1 ${n2(WIDTH / 2 / half)})">${stripes}</g>`) + marks +
    `<path d="M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}" stroke="${p.edge}" stroke-width="1" stroke-opacity="0.7"/></g>`;
}

/** Where the belt lies round a body `half` wide: the top and foot of its turns, and at the front the knot's two parts and the ends. */
function beltShape(face: "front" | "back", waist: number, half: number, tie?: BeltTie): { top: Pt[]; foot: Pt[]; cx: number; cy: number; knot: Pt[]; down: [Pt[], Pt[]]; ends: [Pt, Pt][] } {
  const y0 = waist - 3;
  const sag = face === "front" ? 3 : 1.5;
  const top: Pt[] = [[100 - half, y0], [100, y0 + sag], [100 + half, y0]];
  const foot: Pt[] = top.map((q) => [q[0], q[1] + WIDTH] as Pt);
  const { cx, cy, ends } = knotAt(y0, sag, tie);
  // The square knot: the end that comes up over the turns, and the end that goes across under it.
  const knot: Pt[] = [[cx - 12, cy - 6], [cx + 12, cy - 9], [cx + 14, cy + 7], [cx - 11, cy + 9]];
  const knotDown: Pt[] = [[cx - 9, cy - 9], [cx - 1, cy - 2], [cx + 7, cy + 9]];
  return { top, foot, cx, cy, knot, down: [knotDown, knotDown.map((q) => [q[0] + 11, q[1] - 4] as Pt)], ends };
}

/** Only the shadows a belt throws on the jacket under it, where the belt itself is a strap of its own (judogiStrap.ts). */
export function beltShadow(t: Tone, face: "front" | "back", waist: number, half = 56, tie?: BeltTie): string {
  const { foot, ends, cx, cy } = beltShape(face, waist, half, tie);
  const shadow = fold(smooth(foot.map((q) => [q[0], q[1] + 2] as Pt)), 4, t.light ? 0.3 : 0.45);
  if (face === "back") return shadow;
  if (tie === undefined) {
    return shadow + fold(smooth([[cx - 6, cy + 14], [cx - 14, cy + 40], [cx - 20, cy + 64]]), 6, t.light ? 0.16 : 0.26) +
      fold(smooth([[cx + 8, cy + 14], [cx + 14, cy + 40], [cx + 20, cy + 58.88]]), 6, t.light ? 0.16 : 0.26);
  }
  // Each end's shadow on the cloth, falling a little outside it toward the picture's edge, as far down as the end hangs.
  return shadow + ends.map(([from, to], i) => {
    const out = i === 0 ? -1 : 1;
    const at = (f: number): Pt => [from[0] + (to[0] - from[0]) * f + out * (2 + 2 * f), from[1] + 8 + (to[1] - from[1] - 8) * f];
    return fold(smooth([at(0), at(0.45), at(1)]), 6, t.light ? 0.16 : 0.26);
  }).join("");
}

/** The belt where it lies round a body `half` wide: its turns, and at the front the knot and its ends. Its paint's defs are the caller's to add. */
export function beltOnJacket(p: BeltPaint, t: Tone, face: "front" | "back", waist: number, half = 56, worn = true): string {
  const { top, foot, cx, cy, knot: k, down, ends: hang } = beltShape(face, waist, half, p.tie);
  const shadow = worn ? beltShadow(t, face, waist, half, p.tie) : "";
  // Two turns of the belt lie one on the other: a faint line between them (none where it goes round once).
  const turn = length(top, foot, p) + (wrapsOf(p.tie) === 1 ? "" : `<path d="${smooth(top.map((q) => [q[0], q[1] + WIDTH / 2] as Pt))}" fill="none" stroke="${p.edge}" stroke-opacity="0.35" stroke-width="0.6"/>`);
  if (face === "back") return shadow + turn;
  // The square knot, with its shadow.
  const knot = `<path d="${poly(k)}" fill="${p.fill}" stroke="${p.edge}" stroke-width="0.6"/>` +
    rows([k[0] as Pt, k[1] as Pt], [k[3] as Pt, k[2] as Pt], p, Math.max(6, Math.round((p.rows ?? 10) * 0.8))) +
    fold(`M${cx - 12} ${cy + 10}L${cx + 14} ${cy + 8}`, 3, 0.35) +
    length(down[0], down[1], p, 8);
  const ends = hang.map(([from, to], i) => end(from, to, p, (i === 0 ? p.ends?.left : p.ends?.right)?.body ?? "", i === 0 ? p.stripeEnds?.left : p.stripeEnds?.right, p.stripeEnds?.half, i as 0 | 1)).join("");
  // The shadows fall on the jacket; a belt on its own has nothing under it to take them.
  return shadow + turn + ends + knot;
}

/** Where the flat drawing of the belt alone puts its turns. */
const RY0 = 28;

/** The belt alone, laid flat (the flat view): its turns, knot and ends as they are seen from the front. */
export function beltFace(p: BeltPaint, face: "front" | "back"): Face {
  const t = toneOf([244, 242, 234]);
  const waist = RY0 + 3;
  // The shade stays on the belt itself, the very shapes it is drawn with: the turns, the knot and the two ends, not the empty body they
  // lie on (a looser outline leaves a grey halo round a belt on its own).
  const s = beltShape(face, waist, 66, p.tie);
  const ring = band(s.top, s.foot);
  const clip = face === "front" ? [ring, poly(s.knot), band(...s.down), ...s.ends.map(([a, b]) => band(...endSides(a, b)))] : [ring];
  return { defs: p.defs, body: beltOnJacket(p, t, face, waist, 66, false), clip };
}
