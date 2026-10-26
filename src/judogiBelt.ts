// The belt (obi): a thick band of many stitched rows, tied round the waist with a square knot at the front and two ends hanging
// 20-30 cm (IJF Judogi Rules, 09 03 2022: 4-5 cm wide, 4-5 mm thick). Drawn on the jacket's faces when it is worn, or on its own as a
// tied ring. Rank colours are presets; red-white is the panels of a kohaku belt. Original drawing.

import { blend, hexOf, shade, type Rgb } from "./colour.ts";
import { band, fold, smooth, toneOf, type BeltPaint, type Face, type Tone } from "./judogiCloth.ts";
import { n2, poly, type Pt } from "./path.ts";
import type { VolumeDesc } from "./volume.ts";

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

/** At 2.63 units to the centimetre: a 4.5 cm belt, ends hanging 25 cm from the knot. */
const WIDTH = 12;
const HANG = 64;

/** The paint of a belt colour, or of the red and white panels of a kohaku belt. */
export function beltPaint(uid: string, belt: string): BeltPaint | undefined {
  if (belt === "none") return undefined;
  if (belt === "red-white") {
    const id = `${uid}kohaku`;
    const red = BELT_RGB.red as Rgb;
    const white = BELT_RGB.white as Rgb;
    return {
      fill: `url(#${id})`,
      edge: hexOf(shade(red, -0.4)),
      stitch: hexOf(shade(red, -0.25)),
      // Panels about 15 cm long, red and white in turn along the belt.
      defs: `<pattern id="${id}" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="${hexOf(white)}"/><rect width="40" height="80" fill="${hexOf(red)}"/></pattern>`,
    };
  }
  const rgb = BELT_RGB[belt] ?? (BELT_RGB.white as Rgb);
  const dark = rgb[0] + rgb[1] + rgb[2] < 160;
  return {
    fill: hexOf(rgb),
    edge: hexOf(dark ? blend(rgb, [0, 0, 0], 0.5) : shade(rgb, -0.38)),
    stitch: hexOf(dark ? shade(rgb, 0.22) : shade(rgb, -0.24)),
    defs: "",
  };
}

/** Rows of stitching along a band between two edges. */
function rows(top: readonly Pt[], foot: readonly Pt[], p: BeltPaint, n = 7): string {
  let s = "";
  for (let k = 1; k <= n; k++) {
    const f = k / (n + 1);
    const line = top.map((q, i) => [q[0] + (foot[i]![0] - q[0]) * f, q[1] + (foot[i]![1] - q[1]) * f] as Pt);
    s += `<path d="${smooth(line)}" fill="none" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
  }
  return s;
}

/** A length of belt between two edges: cloth, rows, a lit top edge and a darker lower one. */
function length(top: readonly Pt[], foot: readonly Pt[], p: BeltPaint, n = 7): string {
  const shape = band(top, foot);
  return `<path d="${shape}" fill="${p.fill}"/>` + rows(top, foot, p, n) +
    `<path d="${smooth(top)}" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="0.9"/>` +
    `<path d="${smooth(foot)}" fill="none" stroke="${p.edge}" stroke-opacity="0.8" stroke-width="0.9"/>` +
    `<path d="${shape}" fill="none" stroke="${p.edge}" stroke-opacity="0.55" stroke-width="0.5"/>`;
}

/** Where the knot sits, and the two hanging ends from it, for a belt whose turns start at `y0` and sag `sag` at the middle. */
function knotAt(y0: number, sag: number): { cx: number; cy: number; ends: [Pt, Pt][] } {
  const cx = 100;
  const cy = y0 + sag + WIDTH / 2;
  return { cx, cy, ends: [[[cx - 4, cy + 6], [cx - 20, cy + 6 + HANG]], [[cx + 5, cy + 5], [cx + 19, cy + 5 + HANG * 0.92]]] };
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

/** A hanging end, with its rows running down it. */
function end(from: Pt, to: Pt, p: BeltPaint): string {
  const [left, right] = endSides(from, to);
  const a = left[2] as Pt;
  const b = right[2] as Pt;
  return length(left, right, p, 6) + `<path d="M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}" stroke="${p.edge}" stroke-width="1" stroke-opacity="0.7"/>`;
}

/** Where the belt lies round a body `half` wide: the top and foot of its turns, and at the front the knot's two parts and the ends. */
function beltShape(face: "front" | "back", waist: number, half: number): { top: Pt[]; foot: Pt[]; cx: number; cy: number; knot: Pt[]; down: [Pt[], Pt[]]; ends: [Pt, Pt][] } {
  const y0 = waist - 3;
  const sag = face === "front" ? 3 : 1.5;
  const top: Pt[] = [[100 - half, y0], [100, y0 + sag], [100 + half, y0]];
  const foot: Pt[] = top.map((q) => [q[0], q[1] + WIDTH] as Pt);
  const { cx, cy, ends } = knotAt(y0, sag);
  // The square knot: the end that comes up over the turns, and the end that goes across under it.
  const knot: Pt[] = [[cx - 12, cy - 6], [cx + 12, cy - 9], [cx + 14, cy + 7], [cx - 11, cy + 9]];
  const knotDown: Pt[] = [[cx - 9, cy - 9], [cx - 1, cy - 2], [cx + 7, cy + 9]];
  return { top, foot, cx, cy, knot, down: [knotDown, knotDown.map((q) => [q[0] + 11, q[1] - 4] as Pt)], ends };
}

/** The belt where it lies round a body `half` wide: its turns, and at the front the knot and its ends. Its paint's defs are the caller's to add. */
export function beltOnJacket(p: BeltPaint, t: Tone, face: "front" | "back", waist: number, half = 56, worn = true): string {
  const { top, foot, cx, cy, knot: k, down, ends: hang } = beltShape(face, waist, half);
  const shadow = fold(smooth(foot.map((q) => [q[0], q[1] + 2] as Pt)), 4, t.light ? 0.3 : 0.45);
  // Two turns of the belt lie one on the other: a faint line between them.
  const turn = length(top, foot, p) + `<path d="${smooth(top.map((q) => [q[0], q[1] + WIDTH / 2] as Pt))}" fill="none" stroke="${p.edge}" stroke-opacity="0.35" stroke-width="0.6"/>`;
  if (face === "back") return (worn ? shadow : "") + turn;
  // The square knot, with its shadow.
  const knot = `<path d="${poly(k)}" fill="${p.fill}" stroke="${p.edge}" stroke-width="0.6"/>` +
    rows([k[0] as Pt, k[1] as Pt], [k[3] as Pt, k[2] as Pt], p, 6) +
    fold(`M${cx - 12} ${cy + 10}L${cx + 14} ${cy + 8}`, 3, 0.35) +
    length(down[0], down[1], p, 5);
  const ends = hang.map(([from, to]) => end(from, to, p)).join("");
  const endShadow = fold(smooth([[cx - 6, cy + 14], [cx - 14, cy + 40], [cx - 20, cy + HANG]]), 6, t.light ? 0.16 : 0.26) +
    fold(smooth([[cx + 8, cy + 14], [cx + 14, cy + 40], [cx + 20, cy + HANG * 0.92]]), 6, t.light ? 0.16 : 0.26);
  // The shadows fall on the jacket; a belt on its own has nothing under it to take them.
  return (worn ? shadow + endShadow : "") + turn + ends + knot;
}

/**
 * The belt alone, tied: a ring seen a little from above, wrapped over a short body whose front carries the knot. The body goes on below
 * the ring so the hanging ends have cloth to lie on; nothing is drawn there but the ends, so the rest of it is not seen.
 */
const RY = [28, 40, 112];
const RA = [66, 66, 66];
const RD = [30, 30, 30];

export function beltDesc(depth = 1): VolumeDesc {
  const k = Math.max(0.35, Math.min(1.6, depth));
  return { y: RY, a: RA.map((a) => a + 1.2), b: RD.map((v) => Math.round(v * k * 10) / 10), sl: [], sd: [], nt: 14, nf: 1, nh: 1, pitch: 14, piece: true };
}

export function beltFace(p: BeltPaint, face: "front" | "back"): Face {
  const t = toneOf([244, 242, 234]);
  const waist = (RY[0] as number) + 3;
  // The shade stays on the belt itself, the very shapes it is drawn with: the turns, the knot and the two ends, not the empty body they
  // lie on (a looser outline leaves a grey halo round a belt on its own).
  const s = beltShape(face, waist, 66);
  const ring = band(s.top, s.foot);
  const clip = face === "front" ? [ring, poly(s.knot), band(...s.down), ...s.ends.map(([a, b]) => band(...endSides(a, b)))] : [ring];
  return { defs: p.defs, body: beltOnJacket(p, t, face, waist, 66, false), clip };
}
