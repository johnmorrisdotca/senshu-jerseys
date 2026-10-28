// What every piece of the judogi is made of: the cloth's tones, its weaves (the fine grain of the jacket's body, the quilted diamonds of its
// skirt, the twill of the trousers), stitch rows and soft folds, and the volume each piece is wrapped over. The pieces themselves are in
// judogiJacket.ts, judogiPants.ts and judogiBelt.ts. Original drawing; no maker, federation or sponsor mark.

import { blend, hexOf, lum, shade, type Rgb } from "./colour.ts";
import { n2, type Pt } from "./path.ts";
import type { VolumeDesc } from "./volume.ts";

/** A belt's paint: a colour or a pattern, its darker edge and its stitch rows. */
export interface BeltPaint {
  fill: string;
  edge: string;
  stitch: string;
  defs: string;
  /** What is sewn on the belt's two hanging ends, each drawn in its end's own frame: along the end from the knot, across it from its middle. */
  ends?: { left?: Mark; right?: Mark };
  /** Tip blocks, bars and tags across each hanging end, drawn in the end's own frame for a belt `half` wide either side of its middle (the flat drawing squeezes them to its own width). */
  stripeEnds?: { left: string; right: string; half: number };
  /** Colours laid along the whole belt, as parts of its width from the top edge (a half grade's second colour, a centre stripe). */
  bands?: { from: number; to: number; fill: string }[];
  /** Marks laid straight on a strap's face strip, in the strip's own units (the collar's lapel hem). */
  strip?: Mark;
}

/** Marks sewn or woven on one face of a piece (patches, labels, embroidery): their defs and their drawing, in the face's own box. */
export interface Mark {
  defs: string;
  body: string;
}

export interface GiInk {
  uid: string;
  cloth: Rgb;
  /** What is sewn on each face of the piece, drawn over its cloth and under the light that falls on it. */
  marks?: { front?: Mark; back?: Mark };
  /** The belt tied on the jacket, when one is. */
  belt?: BeltPaint;
  /** The belt is a strap of its own over the jacket (the turning view, judogiStrap.ts): the jacket's faces carry only its shadows. */
  beltApart?: true;
}

/**
 * One side of a piece: its drawing in the 200-wide box the volume samples, and the outlines that keep the volume's shade on the cloth.
 * The outlines are kept apart (a clip of several shapes is their union): drawn as one path, a mirrored sleeve winds the other way, and
 * where it overlaps the body the two would cancel and leave a hole with no shade.
 */
export interface Face {
  defs: string;
  body: string;
  clip: string[];
}

/** The cloth's own colours, from its base colour. A white judogi is never pure white, and its shadows are a cool grey rather than black. */
export interface Tone {
  fill: string;
  /** Cloth in shadow: under a lapel, inside the neck, in a fold. */
  shadow: string;
  /** The inside of the jacket, seen through the neck. */
  inside: string;
  deep: string;
  /** A sewn seam's line and a stitch row's dashes. */
  seam: string;
  stitch: string;
  /** The raised side of a quilted ridge. */
  hi: string;
  light: boolean;
}

export function toneOf(cloth: Rgb): Tone {
  const light = lum(cloth) > 0.4;
  const cool: Rgb = light ? [92, 100, 116] : [6, 10, 24];
  return {
    fill: hexOf(cloth),
    shadow: hexOf(blend(cloth, cool, light ? 0.22 : 0.3)),
    inside: hexOf(blend(cloth, cool, light ? 0.62 : 0.6)),
    deep: hexOf(blend(cloth, cool, light ? 0.74 : 0.75)),
    seam: hexOf(blend(cloth, cool, light ? 0.42 : 0.5)),
    stitch: hexOf(light ? blend(cloth, cool, 0.34) : shade(cloth, 0.32)),
    hi: hexOf(light ? blend(cloth, [255, 255, 255], 0.7) : shade(cloth, 0.2)),
    light,
  };
}

/**
 * The weaves, each a pattern in the drawing's own units so it bends with the cloth when the drawing is wrapped:
 * `G` the jacket's upper body (a rice-grain double weave, small offset grains), `Q` the skirt's quilting (diamonds of stitched ridges),
 * `S` the sleeves (a plainer weave), `T` the trousers (a fine diagonal twill).
 */
export function weaves(uid: string, t: Tone): string {
  // On a dark cloth the same light lines stand out far more, so they are kept faint.
  const o = t.light ? 1 : 0.45;
  const grain = `<pattern id="${uid}G" width="3.2" height="2.6" patternUnits="userSpaceOnUse">` +
    `<ellipse cx="0.8" cy="0.65" rx="0.62" ry="0.42" fill="${t.seam}" fill-opacity="${n2(0.2 * o)}"/>` +
    `<ellipse cx="2.4" cy="1.95" rx="0.62" ry="0.42" fill="${t.seam}" fill-opacity="${n2(0.2 * o)}"/>` +
    `<ellipse cx="0.7" cy="0.5" rx="0.4" ry="0.24" fill="${t.hi}" fill-opacity="${n2(0.55 * o)}"/>` +
    `<ellipse cx="2.3" cy="1.8" rx="0.4" ry="0.24" fill="${t.hi}" fill-opacity="${n2(0.55 * o)}"/></pattern>`;
  // A quilted diamond: the stitched ridge is a dark line with a light line beside it, so the cloth between reads as puffed.
  const q = 11;
  const quilt = `<pattern id="${uid}Q" width="${q}" height="${q * 1.3}" patternUnits="userSpaceOnUse">` +
    `<path d="M0 0L${q} ${q * 1.3}M${q} 0L0 ${q * 1.3}" stroke="${t.hi}" stroke-width="0.9" stroke-opacity="${n2(0.55 * o)}" transform="translate(0.45 0.3)"/>` +
    `<path d="M0 0L${q} ${q * 1.3}M${q} 0L0 ${q * 1.3}" stroke="${t.seam}" stroke-width="0.45" stroke-opacity="${n2(0.3 * o)}"/>` +
    `<ellipse cx="${q / 2}" cy="${q * 0.65}" rx="${q * 0.28}" ry="${q * 0.36}" fill="${t.hi}" fill-opacity="${n2(0.25 * o)}"/>` +
    `<ellipse cx="0" cy="0" rx="${q * 0.28}" ry="${q * 0.36}" fill="${t.hi}" fill-opacity="${n2(0.25 * o)}"/>` +
    `<ellipse cx="${q}" cy="${q * 1.3}" rx="${q * 0.28}" ry="${q * 0.36}" fill="${t.hi}" fill-opacity="${n2(0.25 * o)}"/></pattern>`;
  const sleeve = `<pattern id="${uid}S" width="2.4" height="2.4" patternUnits="userSpaceOnUse">` +
    `<rect width="1.2" height="1.2" fill="${t.seam}" fill-opacity="${n2(0.07 * o)}"/><rect x="1.2" y="1.2" width="1.2" height="1.2" fill="${t.seam}" fill-opacity="${n2(0.07 * o)}"/></pattern>`;
  const twill = `<pattern id="${uid}T" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">` +
    `<rect width="2.2" height="0.8" fill="${t.seam}" fill-opacity="${n2(0.09 * o)}"/></pattern>`;
  return grain + quilt + sleeve + twill;
}

/** A row of stitches along a path: short dashes, a hair darker than the cloth. */
export function stitch(d: string, t: Tone, w = 0.42, o = 0.85): string {
  return `<path d="${d}" fill="none" stroke="${t.stitch}" stroke-width="${n2(w)}" stroke-dasharray="1.5 0.9" stroke-opacity="${n2(o)}" stroke-linecap="round"/>`;
}

/** A sewn seam: a fine dark line, with the cloth turned up beside it caught by the light. */
export function seam(d: string, t: Tone, o = 0.6): string {
  return `<path d="${d}" fill="none" stroke="${t.hi}" stroke-width="0.9" stroke-opacity="${n2(o * 0.8)}" transform="translate(0.5 0.4)"/>` +
    `<path d="${d}" fill="none" stroke="${t.seam}" stroke-width="0.55" stroke-opacity="${n2(o)}"/>`;
}

/**
 * A soft fold: a stroke of shadow (or of light) whose edge fades, made of a few strokes of falling width and rising opacity rather than a
 * blur. Every cell of the volume draws the whole face again, so a filter would be worked out hundreds of times a frame.
 */
export function fold(d: string, w: number, o: number, light = false): string {
  const ink = light ? "#fff" : "#1a2230";
  // Four strokes, widest first, so the shadow is deepest along the fold and fades out to nothing at its edge with no hard core.
  return [1, 0.72, 0.46, 0.22]
    .map((k) => `<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${n2(o / 4)}" stroke-width="${n2(w * k)}" stroke-linecap="round"/>`)
    .join("");
}

/** The gradient that gives a piece its light: a little brighter high on the body, a little darker at the hem. */
export function lightDefs(uid: string, t: Tone): string {
  const k = t.light ? 1 : 1.4;
  return `<linearGradient id="${uid}V" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${n2(0.16 / k)}"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a2230" stop-opacity="${n2(0.08 * k)}"/></linearGradient>`;
}

/** A smooth path through points (Catmull-Rom as cubic Béziers), open. */
export function smooth(pts: readonly Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M${n2(pts[0]![0])} ${n2(pts[0]![1])}`;
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d;
}

/** A polyline offset sideways by `d` (positive to the right of the way it runs, on a y-down drawing). */
export function offset(pts: readonly Pt[], d: number): Pt[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [p[0] - (dy / l) * d, p[1] + (dx / l) * d] as Pt;
  });
}

/** A closed band between two polylines that run the same way. */
export function band(a: readonly Pt[], b: readonly Pt[]): string {
  return `${smooth(a)}L${n2(b[b.length - 1]![0])} ${n2(b[b.length - 1]![1])}${smooth([...b].reverse()).replace(/^M[^C]*/, "")}Z`;
}

/** The point on a polyline at height `y` (the first crossing), for pieces that meet a line partway. */
export function atY(pts: readonly Pt[], y: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]!;
    const q = pts[i]!;
    if ((y - p[1]) * (y - q[1]) <= 0 && q[1] !== p[1]) {
      const t = (y - p[1]) / (q[1] - p[1]);
      return [p[0] + (q[0] - p[0]) * t, y];
    }
  }
  return pts[pts.length - 1]!;
}

/**
 * The rows no further apart than `ROW` units: each row's cells take one shade from top to bottom, so on white cloth a few tall rows show
 * as bands with an edge between them (the trousers' hips did). Rows put in between follow the given ones in a straight line, as the
 * cells did, so the shape does not change.
 */
const ROW = 8;
function refine(y: readonly number[], cols: readonly (readonly number[])[]): [number[], number[][]] {
  const ys: number[] = [y[0] as number];
  const out = cols.map((c) => [c[0] as number]);
  for (let j = 1; j < y.length; j++) {
    const y0 = y[j - 1] as number;
    const y1 = y[j] as number;
    const n = Math.max(1, Math.ceil((y1 - y0) / ROW));
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      ys.push(Math.round((y0 + (y1 - y0) * f) * 100) / 100);
      cols.forEach((c, i) => out[i]!.push(Math.round(((c[j - 1] as number) + ((c[j] as number) - (c[j - 1] as number)) * f) * 1000) / 1000));
    }
  }
  return [ys, out];
}

/** A piece's volume: rows of the body (y, half width, half depth) and its tubes, in the format of volume.ts. `depth` scales how deep the body is. */
export function pieceDesc(y: number[], a: number[], b: number[], sl: VolumeDesc["sl"], depth: number, nt = 12, nf = 6, nh = 7, lobes?: number[]): VolumeDesc {
  const k = Math.max(0.35, Math.min(1.6, depth));
  const [ys, [ra, rb, rl]] = refine(y, [a, b.map((v) => Math.round(v * k * 10) / 10), lobes ?? y.map(() => 0)]) as [number[], number[][]];
  return { y: ys, a: ra as number[], b: rb as number[], sl, sd: [], nt, nf, nh, pitch: 8, piece: true, ...(lobes === undefined ? {} : { hang: true as const, lobes: rl as number[] }) };
}
