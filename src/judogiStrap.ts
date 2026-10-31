// The belt as a solid strap, for the turning view: two turns of a band 4.5 cm wide and 5 mm thick (IJF Judogi Rules: 4-5 mm) round the
// waist, with their outer face, their inner face, their top and bottom edges, a square knot of two lengths of the same strap, and two
// hanging ends each with a front, a back and two edges. A belt drawn on the jacket's faces is a sticker: turned to the side its ends vanish to a
// line, and on its own the far half of the ring is never seen. Every cell samples one drawing, a straight length of belt laid out on its
// face (`strapFace`): the face strip, the edge strips and the knot. So the panels of a kohaku belt run along the strap wherever it goes.
// Kept apart from judogiBelt.ts so that the flat drawings do not carry it.

import type { BeltPaint, Face } from "./judogiCloth.ts";
import { beltDefaultWidthCm } from "./beltSpecs.ts";
import { n2 } from "./path.ts";
import { knotCells } from "./judogiKnot.ts";
import { END_LENGTH_25, endLengths, tieEnds, wrapsOf, type BeltKnot, type BeltTie } from "./beltTie.ts";
import type { Cell, VolumeDesc } from "./volume.ts";

type Vec = [number, number, number];

/** A strap round a body, as numbers that ride in the drawing. */
export interface StrapDesc {
  /** The top of the band at the back, and how much lower it sits at the front. */
  y: number;
  sag: number;
  /** The belt's width and the thickness of one turn of it. */
  w: number;
  t: number;
  /** What it is tied round: half width, half depth, the exponent of the cross-section and its least depth at the sides, as a part of `b`. */
  a: number;
  b: number;
  full: number;
  side: number;
  /** Tied on a jacket: no inside to show, and what lies behind the jacket is not drawn. */
  worn: boolean;
  /** Worn: the jacket's rows from the belt's top down to the hem, as `y, half width, half depth` in turn, so the hanging ends lie on the skirt. */
  skirt?: number[];
  /** How it is tied (beltTie.ts): the knot's style and how far the ends hang, in centimetres. The judogi's (`spread`, 25) when not given. */
  knot?: BeltKnot;
  tail?: number;
}

/** The tie a strap carries. */
const tieOf = (s: StrapDesc): BeltTie | undefined => (s.knot === undefined && s.tail === undefined ? undefined : { knot: s.knot ?? "spread", tailCm: s.tail ?? 25 });

/**
 * At 2.63 units to the centimetre: a rank belt 4 cm wide, a black belt 4.75 cm and a master's red or red-white belt 5 cm, each 5 mm
 * thick (IJF: 4-5 mm), stitched in 10 rows (quality belts carry 8 to 15), the ends hanging 25 cm from the knot.
 */
export const STRAP_T = 1.3;
/** Drawing units to the centimetre (the belt is 4 cm wide at 10.5 units). */
export const UNITS_PER_CM = 2.63;
/** A belt's width in drawing units: the width its grade is made in (4.2 cm for white and the rank colours, 4.5 for black, red-white and red: see beltSpecs.ts) or, when given, `cm` centimetres. */
export const strapWidth = (belt: string, cm?: number): number => (cm !== undefined ? cm * UNITS_PER_CM : beltDefaultWidthCm(belt) * UNITS_PER_CM);
const ROWS = 10;
/** Where the strips lie on the strap's drawing: the face, the edge of the two turns and the edge of one. */
export const FACE_Y = 0;
const EDGE2_Y = 26;
export const EDGE1_Y = 36;
/** The strip a strap's inner and reverse faces sample: the same cloth with nothing sewn on it (marks are sewn on the outer face only). */
export const BACK_Y = 46;
export const EDGE_H = 4;
/** Along a strip: where it starts on the drawing, and the length after which a kohaku belt's panels repeat. */
export const X0 = -30;
const PERIOD = 80;
/** How far the cloth gaps from the jacket. */
const GAP = 0.3;
/** Cells round the ring and down each end. */
export const ROUND = 72;
const DOWN = 8;
/** Where each hanging end's own stretch of the face strip starts, so a mark on one end does not repeat on the turns (which use the strip's first 60 units) or on the other end. */
export const END_X = [130, 58] as const;
/**
 * The strips a tied belt's two hanging ends sample, each a whole length of its own below the others (the picture's left end, then its right), so an end of any length
 * finds cloth: its cut end lies where it does on the face strip (`END_CUT`), and it runs back toward the knot as far as it is long. What is sewn on an end is drawn there too.
 */
export const END_FACE_Y = [66, 86] as const;
/** Where each end's cut end lies along the strips: the default end's stretch, so a kohaku belt's sections and the marks sewn near the end fall where they always have. */
const END_CUT = [END_X[0] + END_LENGTH_25[0], END_X[1] + END_LENGTH_25[1]] as const;

const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (u: Vec, v: Vec): Vec => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** A quadrilateral tl, tr, bl, br as two cells, facing the way of `out` (which picks the sign of its normal); `also` must face the viewer too. */
export function quad(corners: [Vec, Vec, Vec, Vec], tex: [number, number][], out: Vec, also?: Vec): Cell[] {
  const [tl, tr, bl, br] = corners;
  let n = unit(cross(sub(tr, tl), sub(bl, tl)));
  if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = [-n[0], -n[1], -n[2]];
  const pick = (ks: number[]): Cell => ({
    g: 0,
    back: false,
    tex: ks.flatMap((k) => tex[k] as [number, number]),
    p: ks.flatMap((k) => [tl, tr, bl, br][k] as Vec),
    n,
    ...(also === undefined ? {} : { also }),
  });
  return [pick([0, 1, 2]), pick([1, 3, 2])];
}

/** The round the strap lies on, as points `[x, z]` evenly spaced along it from the front middle, going toward the picture's right. */
function round(s: StrapDesc): [number, number][] {
  const dense: [number, number][] = [];
  const n = 720;
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    const u = Math.abs(Math.sin(t));
    const z = Math.max(s.side * s.b, s.b * Math.pow(Math.max(0, 1 - Math.pow(u, s.full)), 1 / s.full));
    dense.push([s.a * Math.sin(t), Math.sign(Math.cos(t)) * z || 0]);
  }
  // A side wall where the cross-section has one: its two corners, so the even spacing goes down it too.
  const at: number[] = [0];
  for (let i = 1; i < dense.length; i++) at.push((at[i - 1] as number) + Math.hypot(dense[i]![0] - dense[i - 1]![0], dense[i]![1] - dense[i - 1]![1]));
  const total = at[at.length - 1] as number;
  const out: [number, number][] = [];
  let j = 1;
  for (let i = 0; i < ROUND; i++) {
    const want = (total * i) / ROUND;
    while (j < dense.length - 1 && (at[j] as number) < want) j++;
    const f = ((want - at[j - 1]!) / (at[j]! - at[j - 1]! || 1));
    out.push([dense[j - 1]![0] + (dense[j]![0] - dense[j - 1]![0]) * f, dense[j - 1]![1] + (dense[j]![1] - dense[j - 1]![1]) * f]);
  }
  return out;
}

/** Every cell of the strap: the two turns, the knot and the two ends. */
export function strapCells(s: StrapDesc): Cell[] {
  const cells: Cell[] = [];
  const base = round(s);
  const normals = base.map((_, i) => {
    const p = base[(i + ROUND - 1) % ROUND]!;
    const q = base[(i + 1) % ROUND]!;
    let nx = q[1] - p[1];
    let nz = -(q[0] - p[0]);
    const m = base[i]!;
    if (nx * m[0] + nz * m[1] < 0) {
      nx = -nx;
      nz = -nz;
    }
    const l = Math.hypot(nx, nz) || 1;
    return [nx / l, nz / l] as [number, number];
  });
  const lift = s.worn ? GAP : 0;
  const tie = tieOf(s);
  // Two turns lie one on the other, or one alone (a belt tied once round).
  const wraps = wrapsOf(tie);
  const inner = base.map((p, i): [number, number] => [p[0] + normals[i]![0] * lift, p[1] + normals[i]![1] * lift]);
  const outer = base.map((p, i): [number, number] => [p[0] + normals[i]![0] * (lift + wraps * s.t), p[1] + normals[i]![1] * (lift + wraps * s.t)]);
  const zFront = outer[0]![1];
  // The band sags at the front, where the knot pulls it down.
  const topAt = (i: number): number => s.y + s.sag * Math.pow(Math.max(0, outer[i]![1] / zFront), 2);
  let along = 0;
  for (let i = 0; i < ROUND; i++) {
    const k = (i + 1) % ROUND;
    const step = Math.hypot(outer[k]![0] - outer[i]![0], outer[k]![1] - outer[i]![1]);
    const x0 = X0 + (along % PERIOD);
    const x1 = x0 + step;
    along += step;
    const y0 = topAt(i);
    const y1 = topAt(k);
    const o = (p: [number, number], y: number): Vec => [p[0], y, p[1]];
    const out: Vec = [normals[i]![0] + normals[k]![0], 0, normals[i]![1] + normals[k]![1]];
    const inward: Vec = [-out[0], 0, -out[2]];
    cells.push(...quad([o(outer[i]!, y0), o(outer[k]!, y1), o(outer[i]!, y0 + s.w), o(outer[k]!, y1 + s.w)], [[x0, FACE_Y], [x1, FACE_Y], [x0, FACE_Y + s.w], [x1, FACE_Y + s.w]], out));
    const ey = wraps === 2 ? EDGE2_Y : EDGE1_Y;
    const edge: [number, number][] = [[x0, ey], [x1, ey], [x0, ey + EDGE_H], [x1, ey + EDGE_H]];
    // Worn, the edges of the turns behind the jacket are hidden by it: they show only where the turns' outer face does.
    const hidden = s.worn ? unit(out) : undefined;
    cells.push(...quad([o(outer[i]!, y0), o(outer[k]!, y1), o(inner[i]!, y0), o(inner[k]!, y1)], edge, [0, -1, 0], hidden));
    cells.push(...quad([o(outer[i]!, y0 + s.w), o(outer[k]!, y1 + s.w), o(inner[i]!, y0 + s.w), o(inner[k]!, y1 + s.w)], edge, [0, 1, 0], hidden));
    if (!s.worn) cells.push(...quad([o(inner[k]!, y1), o(inner[i]!, y0), o(inner[k]!, y1 + s.w), o(inner[i]!, y0 + s.w)], [[x1, BACK_Y], [x0, BACK_Y], [x1, BACK_Y + s.w], [x0, BACK_Y + s.w]], inward));
  }
  const front: Vec | undefined = s.worn ? [0, 0, 1] : undefined;
  const cy = s.y + s.sag + s.w / 2;
  cells.push(...knotCells(s, cy, zFront, (x) => roundAt(s, s.a, s.b, x) - roundAt(s, s.a, s.b, 0), front));
  const lengths = endLengths(tie);
  tieEnds(tie, cy).forEach(([from, to], i) => {
    // The ends of a long belt hang side by side: the right one, which comes down over the knot, lies on the other where they touch under it.
    const over = i === 1 && tie !== undefined && tie.knot !== "spread" ? s.t : 0;
    cells.push(...endCells(from, to, zFront + s.t, s, front, (END_CUT[i] as number) - (lengths[i] as number), cy + s.w / 2, END_FACE_Y[i] as number, wraps, over));
  });
  return cells;
}

/** A smooth line through `pts` (Catmull-Rom), `n` middles to each span. */
export function through(pts: readonly Vec[], n: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)] as Vec;
    const p1 = pts[i] as Vec;
    const p2 = pts[i + 1] as Vec;
    const p3 = pts[Math.min(pts.length - 1, i + 2)] as Vec;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1, 2].map((d) => 0.5 * (2 * p1[d]! + (-p0[d]! + p2[d]!) * t + (2 * p0[d]! - 5 * p1[d]! + 4 * p2[d]! - p3[d]!) * t2 + (-p0[d]! + 3 * p1[d]! - 3 * p2[d]! + p3[d]!) * t3)) as Vec);
    }
  }
  out.push(pts[pts.length - 1] as Vec);
  return out;
}

/** The depth of a round of half width `a` and half depth `b` at `x` across it, as the body's volume draws it (never less than its side wall). */
export const roundAt = (s: StrapDesc, a: number, b: number, x: number): number => Math.max(s.side * b, b * Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(x) / a), s.full)), 1 / s.full));

/** The depth of the jacket's cloth below the belt at `y`, `x` across from its middle (the rows of `StrapDesc.skirt`). */
function skirtAt(s: StrapDesc, y: number, x: number): number {
  const r = s.skirt as number[];
  let k = 0;
  while (k + 3 < r.length - 3 && (r[k + 3] as number) < y) k += 3;
  const f = Math.max(0, Math.min(1, (y - (r[k] as number)) / ((r[k + 3] as number) - (r[k] as number) || 1)));
  const lerp = (o: number): number => (r[k + o] as number) + ((r[k + 3 + o] as number) - (r[k + o] as number)) * f;
  return roundAt(s, lerp(1), lerp(2), x);
}

/** How far down (units) a hanging end takes to go from lying on the belt's lower edge to lying on the skirt. */
const SETTLE = 12;
/** How far off the cloth a hanging end rests: over the lapel's band, which is a thickness of cloth (judogiCollar.ts) thick there. */
const REST = 1.8;

/** A hanging end: its front and back faces, its two long edges and its cut end, from under the knot (`z` deep). Worn, it lies on the belt, then on the skirt below it. */
function endCells(from: readonly [number, number], to: readonly [number, number], z: number, s: StrapDesc, also: Vec | undefined, xs: number, below: number, row: number, wraps: number, over: number): Cell[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (s.w / 2);
  const ny = (dx / l) * (s.w / 2);
  const bow = 2.5 * Math.sign(dx);
  // Each long side as three points, the middle bowed, and the point a part `f` of the way down it.
  const side = (k: -1 | 1, f: number): Vec => {
    const p0 = [from[0] + k * nx, from[1] + k * ny];
    const p1 = [(from[0] + to[0]) / 2 + k * nx + bow, (from[1] + to[1]) / 2 + k * ny];
    const p2 = [to[0] + k * nx, to[1] + k * ny];
    const w0 = (1 - f) * (1 - 2 * f);
    const w1 = 4 * f * (1 - f);
    const w2 = f * (2 * f - 1);
    const x = w0 * p0[0]! + w1 * p1[0]! + w2 * p2[0]! - 100;
    const y = w0 * p0[1]! + w1 * p1[1]! + w2 * p2[1]!;
    // Where it lies over the other end, under the knot: that end's thickness, going to nothing a few centimetres down.
    const on = over * Math.max(0, 1 - (f * l) / 26);
    if (s.skirt === undefined) return [x, y, z + 2.5 * f * f + on];
    // The back of the end rests on the belt where it hangs from it, and on the cloth below, a gap's width off it.
    const u = Math.max(0, Math.min(1, (y - below) / SETTLE));
    const e = u * u * (3 - 2 * u);
    const onBelt = roundAt(s, s.a, s.b, x) + GAP + wraps * s.t;
    // Past the hem nothing is under it: a long end hangs on at the depth it left the hem, where it crossed it.
    const hem = s.skirt[s.skirt.length - 3] as number;
    const free = y > hem && to[1] > from[1] ? [from[0] + ((to[0] - from[0]) * (hem - from[1])) / (to[1] - from[1]) - 100, hem] : [x, y];
    return [x, y, onBelt + (skirtAt(s, free[1] as number, free[0] as number) + REST - onBelt) * e + s.t + on];
  };
  const back = (p: Vec): Vec => [p[0], p[1], p[2] - s.t];
  const cells: Cell[] = [];
  for (let k = 0; k < DOWN; k++) {
    const f0 = k / DOWN;
    const f1 = (k + 1) / DOWN;
    const x0 = xs + f0 * l;
    const x1 = xs + f1 * l;
    const [la, lb, ra, rb] = [side(-1, f0), side(-1, f1), side(1, f0), side(1, f1)];
    const face: [number, number][] = [[x0, row], [x1, row], [x0, row + s.w], [x1, row + s.w]];
    const edge: [number, number][] = [[x0, EDGE1_Y], [x1, EDGE1_Y], [x0, EDGE1_Y + EDGE_H], [x1, EDGE1_Y + EDGE_H]];
    const outL = sub(la, ra);
    cells.push(...quad([la, lb, ra, rb], face, [0, 0, 1], also));
    const reverse: [number, number][] = [[x0, BACK_Y], [x1, BACK_Y], [x0, BACK_Y + s.w], [x1, BACK_Y + s.w]];
    cells.push(...quad([back(la), back(lb), back(ra), back(rb)], reverse, [0, 0, -1], also));
    cells.push(...quad([la, lb, back(la), back(lb)], edge, outL, also));
    cells.push(...quad([ra, rb, back(ra), back(rb)], edge, [-outL[0], -outL[1], -outL[2]], also));
  }
  const [lz, rz] = [side(-1, 1), side(1, 1)];
  const down = sub(lz, side(-1, 1 - 1 / DOWN));
  cells.push(...quad([lz, rz, back(lz), back(rz)], [[X0, EDGE1_Y], [X0 + s.w, EDGE1_Y], [X0, EDGE1_Y + EDGE_H], [X0 + s.w, EDGE1_Y + EDGE_H]], down, also));
  return cells;
}

/** A strap's piece description: no rows or sleeves of its own, only the strap, seen from `pitch` degrees above. */
export function strapDesc(s: StrapDesc, pitch: number): VolumeDesc {
  return { y: [], a: [], b: [], nt: 0, nf: 0, nh: 0, sl: [], sd: [], pitch, piece: true, strap: s };
}

/**
 * The strap's drawing: a straight length of belt along its face strip (stitched rows, its edges a little darker), and the edges of two
 * turns and of one below it. The knot is the strap itself, so it needs nothing of its own. Each strip runs on past its ends, so a cell
 * that is grown at its edge still finds cloth.
 */
export function strapFace(p: BeltPaint, w: number, n = p.rows ?? ROWS, ends = false): Face {
  const fine = p.fine !== undefined;
  const thread = p.fine?.thread ?? p.stitch;
  const rows = (y0: number, h: number, n: number): string => {
    let s = "";
    // Close up, a row is a line of separate stitches (a dash and a gap), the thread a little lighter than the cloth and a faint shadow beside it; far off, a plain fine line.
    for (let k = 1; k <= n; k++) {
      const y = n2(y0 + (h * k) / (n + 1));
      s += fine
        ? `<path d="M-40 ${y}H240" stroke="${thread}" stroke-width="0.15" stroke-opacity="0.9" stroke-dasharray="1.05 0.5" stroke-dashoffset="${n2((k * 0.97) % 1.55)}"/>`
        : `<path d="M-40 ${y}H240" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
    }
    return s;
  };
  // A fine diagonal twill over the cloth: ribs a lit one and a dark one in turn.
  const twill = (y0: number, h: number): string => (fine ? `<rect x="-40" y="${n2(y0)}" width="280" height="${n2(h)}" fill="url(#jgtwill)"/>` : "");
  const strip = (y0: number, h: number): string => `<rect x="-40" y="${n2(y0 - 1.5)}" width="280" height="${n2(h + 3)}" fill="${p.stripFill ?? p.fill}"/>`;
  const bands = (p.bands ?? []).map((b) => `<rect x="-40" y="${n2(b.from * w)}" width="280" height="${n2((b.to - b.from) * w)}" fill="${b.fill}"/>`).join("");
  // A satin or silk cover: a soft light along the strip's lit side and a fainter one near its other, over the rows.
  const sheen = (y0: number): string => p.cover === undefined || p.cover === "cotton" ? "" : `<rect x="-40" y="${n2(y0 + w * 0.06)}" width="280" height="${n2(w * 0.32)}" fill="#fff" fill-opacity="${p.cover === "silk" ? 0.3 : 0.2}"/><rect x="-40" y="${n2(y0 + w * 0.7)}" width="280" height="${n2(w * 0.16)}" fill="#fff" fill-opacity="${p.cover === "silk" ? 0.14 : 0.08}"/>`;
  const cloth = (y0: number, plain = false): string => strip(y0, w) + twill(y0, w) + (plain ? "" : bands.replace(/y="([\d.-]+)"/g, (_, y: string) => `y="${n2(Number(y) + y0)}"`)) + rows(y0, w, n) + sheen(y0) +
    `<path d="M-40 ${n2(y0 + 0.4)}H240M-40 ${n2(y0 + w - 0.4)}H240" stroke="${p.edge}" stroke-width="0.9" stroke-opacity="0.75"/>`;
  const faceStrip = cloth(FACE_Y);
  const backStrip = cloth(BACK_Y, false);
  // An edge is the stitched rows seen end on: the cloth a little darker, and on the two turns the line where one lies on the other.
  const dark = `fill="${p.edge}" fill-opacity="0.3"`;
  const edges = strip(EDGE2_Y, EDGE_H) + `<rect x="-40" y="${EDGE2_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>` +
    `<path d="M-40 ${EDGE2_Y + EDGE_H / 2}H240" stroke="${p.edge}" stroke-width="0.6" stroke-opacity="0.8"/>` +
    strip(EDGE1_Y, EDGE_H) + `<rect x="-40" y="${EDGE1_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>`;
  const clip = [
    ...(ends ? END_FACE_Y.map((y) => `M-40 ${y - 1.5}H240V${n2(y + w + 1.5)}H-40Z`) : []),
    `M-40 ${FACE_Y - 1.5}H240V${n2(FACE_Y + w + 1.5)}H-40Z`,
    `M-40 ${EDGE2_Y - 1.5}H240V${EDGE2_Y + EDGE_H + 1.5}H-40Z`,
    `M-40 ${EDGE1_Y - 1.5}H240V${EDGE1_Y + EDGE_H + 1.5}H-40Z`,
    `M-40 ${BACK_Y - 1.5}H240V${n2(BACK_Y + w + 1.5)}H-40Z`,
  ];
  // What is sewn on each hanging end lies on that end's own stretch of the strip, its frame's origin at the knot's end and its middle on the strip's.
  const sewn = (m: { body: string } | undefined, x: number, y = 0): string => (m === undefined ? "" : `<g transform="translate(${x} ${n2(y + w / 2)})">${m.body}</g>`);
  // A tied belt's ends, each on a strip of its own with only what is sewn on that end.
  const endStrips = ends ? [0, 1].map((i) => {
    const y = END_FACE_Y[i] as number;
    const x = END_X[i] as number;
    const stripe = i === 0 ? p.stripeEnds?.left : p.stripeEnds?.right;
    return cloth(y) + sewn({ body: stripe ?? "" }, x, y) + sewn(i === 0 ? p.ends?.left : p.ends?.right, x, y);
  }).join("") : "";
  // The paint's own defs (a kohaku belt's panels) are the caller's to add, once for the drawing.
  const twillDefs = fine ? `<pattern id="jgtwill" width="0.62" height="0.62" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="0.62" height="0.24" fill="#000" fill-opacity="0.09"/><rect y="0.31" width="0.62" height="0.14" fill="#fff" fill-opacity="0.07"/></pattern>` : "";
  return { defs: twillDefs + (p.strip?.defs ?? ""), body: endStrips + faceStrip + backStrip + sewn({ body: p.stripeEnds?.left ?? "" }, END_X[0]) + sewn({ body: p.stripeEnds?.right ?? "" }, END_X[1]) + sewn(p.ends?.left, END_X[0]) + sewn(p.ends?.right, END_X[1]) + (p.strip?.body ?? "") + edges, clip };
}
