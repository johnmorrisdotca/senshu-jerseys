// The belt as a solid strap, for the turning view: two turns of a band 4.5 cm wide and 5 mm thick (IJF Judogi Rules: 4-5 mm) round the
// waist, with their outer face, their inner face, their top and bottom edges, a square knot of two lengths of the same strap, and two
// hanging ends each with a front, a back and two edges. A belt drawn on the jacket's faces is a sticker: turned to the side its ends vanish to a
// line, and on its own the far half of the ring is never seen. Every cell samples one drawing, a straight length of belt laid out on its
// face (`strapFace`): the face strip, the edge strips and the knot. So the panels of a kohaku belt run along the strap wherever it goes.
// Kept apart from judogiBelt.ts so that the flat drawings do not carry it.

import type { BeltPaint, Face } from "./judogiCloth.ts";
import { n2 } from "./path.ts";
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
}

/**
 * At 2.63 units to the centimetre: a rank belt 4 cm wide, a black belt 4.75 cm and a master's red or red-white belt 5 cm, each 5 mm
 * thick (IJF: 4-5 mm), stitched in 10 rows (quality belts carry 8 to 15), the ends hanging 25 cm from the knot.
 */
export const STRAP_T = 1.3;
/** Drawing units to the centimetre (the belt is 4 cm wide at 10.5 units). */
export const UNITS_PER_CM = 2.63;
/** A belt's width in drawing units: its grade's own (a rank belt 4 cm, black 4.75, red-white and red 5: the IJF allows 4 to 5) or, when given, `cm` centimetres. */
export const strapWidth = (belt: string, cm?: number): number => (cm !== undefined ? cm * UNITS_PER_CM : belt === "red-white" || belt === "red" ? 13.2 : belt === "black" ? 12.5 : 10.5);
const ROWS = 10;
const HANG = 64;
/** Where the strips lie on the strap's drawing: the face, the edge of the two turns and the edge of one. */
export const FACE_Y = 0;
const EDGE2_Y = 26;
export const EDGE1_Y = 36;
/** The strip a strap's inner and reverse faces sample: the same cloth with nothing sewn on it (marks are sewn on the outer face only). */
export const BACK_Y = 46;
export const EDGE_H = 4;
/** Along a strip: where it starts on the drawing, and the length after which a kohaku belt's panels repeat. */
const X0 = -30;
const PERIOD = 80;
/** How far the cloth gaps from the jacket. */
const GAP = 0.3;
/** Cells round the ring and down each end. */
const ROUND = 72;
const DOWN = 8;
/** Where each hanging end's own stretch of the face strip starts, so a mark on one end does not repeat on the turns (which use the strip's first 60 units) or on the other end. */
export const END_X = [130, 58] as const;

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
  const inner = base.map((p, i): [number, number] => [p[0] + normals[i]![0] * lift, p[1] + normals[i]![1] * lift]);
  const outer = base.map((p, i): [number, number] => [p[0] + normals[i]![0] * (lift + 2 * s.t), p[1] + normals[i]![1] * (lift + 2 * s.t)]);
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
    const edge: [number, number][] = [[x0, EDGE2_Y], [x1, EDGE2_Y], [x0, EDGE2_Y + EDGE_H], [x1, EDGE2_Y + EDGE_H]];
    // Worn, the edges of the turns behind the jacket are hidden by it: they show only where the turns' outer face does.
    const hidden = s.worn ? unit(out) : undefined;
    cells.push(...quad([o(outer[i]!, y0), o(outer[k]!, y1), o(inner[i]!, y0), o(inner[k]!, y1)], edge, [0, -1, 0], hidden));
    cells.push(...quad([o(outer[i]!, y0 + s.w), o(outer[k]!, y1 + s.w), o(inner[i]!, y0 + s.w), o(inner[k]!, y1 + s.w)], edge, [0, 1, 0], hidden));
    if (!s.worn) cells.push(...quad([o(inner[k]!, y1), o(inner[i]!, y0), o(inner[k]!, y1 + s.w), o(inner[i]!, y0 + s.w)], [[x1, BACK_Y], [x0, BACK_Y], [x1, BACK_Y + s.w], [x0, BACK_Y + s.w]], inward));
  }
  const front: Vec | undefined = s.worn ? [0, 0, 1] : undefined;
  const cy = s.y + s.sag + s.w / 2;
  cells.push(...knotCells(s, cy, zFront, front));
  endsOf(cy).forEach(([from, to], i) => cells.push(...endCells(from, to, zFront + s.t, s, front, END_X[i] as number)));
  return cells;
}

/**
 * A length of strap along a line of middles `c`: its face, its back and its two edges, `across` the way its width runs at each middle
 * and `out` the way its face looks. Its drawing runs along the face strip from `x0`, so its rows and a kohaku belt's panels follow it.
 */
function ribbon(c: readonly Vec[], across: readonly Vec[], out: readonly Vec[], s: StrapDesc, x0: number, also?: Vec): Cell[] {
  const cells: Cell[] = [];
  const at = (k: number, side: number, face: number): Vec => {
    const p = c[k] as Vec;
    const a = across[k] as Vec;
    const o = out[k] as Vec;
    return [p[0] + a[0] * side * (s.w / 2) + o[0] * face * (s.t / 2), p[1] + a[1] * side * (s.w / 2) + o[1] * face * (s.t / 2), p[2] + a[2] * side * (s.w / 2) + o[2] * face * (s.t / 2)];
  };
  let x = x0;
  for (let k = 0; k + 1 < c.length; k++) {
    const step = Math.hypot(...sub(c[k + 1] as Vec, c[k] as Vec));
    const x1 = x + step;
    const o = unit([out[k]![0] + out[k + 1]![0], out[k]![1] + out[k + 1]![1], out[k]![2] + out[k + 1]![2]]);
    const a = unit([across[k]![0] + across[k + 1]![0], across[k]![1] + across[k + 1]![1], across[k]![2] + across[k + 1]![2]]);
    const face: [number, number][] = [[x, FACE_Y], [x1, FACE_Y], [x, FACE_Y + s.w], [x1, FACE_Y + s.w]];
    const edge: [number, number][] = [[x, EDGE1_Y], [x1, EDGE1_Y], [x, EDGE1_Y + EDGE_H], [x1, EDGE1_Y + EDGE_H]];
    cells.push(...quad([at(k, -1, 1), at(k + 1, -1, 1), at(k, 1, 1), at(k + 1, 1, 1)], face, o, also));
    const reverse: [number, number][] = [[x, BACK_Y], [x1, BACK_Y], [x, BACK_Y + s.w], [x1, BACK_Y + s.w]];
    cells.push(...quad([at(k, -1, -1), at(k + 1, -1, -1), at(k, 1, -1), at(k + 1, 1, -1)], reverse, [-o[0], -o[1], -o[2]], also));
    cells.push(...quad([at(k, -1, 1), at(k + 1, -1, 1), at(k, -1, -1), at(k + 1, -1, -1)], edge, [-a[0], -a[1], -a[2]], also));
    cells.push(...quad([at(k, 1, 1), at(k + 1, 1, 1), at(k, 1, -1), at(k + 1, 1, -1)], edge, a, also));
    x = x1;
  }
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

/**
 * The square knot, as a belt is tied: two lengths of the strap itself, not a block. One wraps across the front of the turns and rolls back
 * into them at each side; the other comes up from behind the turns, folds over their top edge and runs down across the first to the
 * right-hand end. `cy` is the band's middle at the front and `z0` the front of its turns.
 */
function knotCells(s: StrapDesc, cy: number, z0: number, also?: Vec): Cell[] {
  const t = s.t;
  const top = cy - s.w / 2;
  // The wrap: across the front, standing off the turns by its own thickness and a little fuller in the middle, rolling back at its sides.
  const wrap: Vec[] = [];
  const half = 15;
  for (let k = 0; k <= 10; k++) {
    const u = -1 + k / 5;
    const x = u * (half + 1.6);
    const roll = Math.max(0, Math.abs(x) - half) / 1.6;
    const z = z0 + t / 2 + (1.4 * Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(x) / half) ** 2)) + 0.3) * (1 - roll) - 1.2 * t * roll;
    wrap.push([x, cy + 1.5, z]);
  }
  const wrapOut = wrap.map((p, k): Vec => {
    const q = wrap[Math.min(wrap.length - 1, k + 1)] as Vec;
    const r = wrap[Math.max(0, k - 1)] as Vec;
    return unit([-(q[2] - r[2]), 0, q[0] - r[0]]);
  });
  const cells = ribbon(wrap, wrap.map((): Vec => [0, 1, 0]), wrapOut, s, X0 + 20, also);
  // The crossing end: from behind the turns, over their top edge (the round hump a tied knot shows at its top left), down across the wrap.
  const front = z0 + t + 2.4;
  const line = through([
    [-11, top + 3, z0 - 1.5 * t],
    [-10, top - 1.6, z0 + 0.2],
    [-7, top + 1.4, front + 0.6],
    [0, cy + 2, front + 1.1],
    [6, cy + s.w / 2 + 2, front],
    [7, cy + s.w / 2 + 6, z0 + t + 1],
  ], 4);
  // Its width runs square to the diagonal it makes on the front, kept square to the line where the line turns over the top.
  const flat: Vec = unit([0.7, -0.71, 0]);
  const across: Vec[] = [];
  const out: Vec[] = [];
  line.forEach((p, k) => {
    const tan = unit(sub(line[Math.min(line.length - 1, k + 1)] as Vec, line[Math.max(0, k - 1)] as Vec));
    const d = flat[0] * tan[0] + flat[1] * tan[1] + flat[2] * tan[2];
    const a = unit([flat[0] - d * tan[0], flat[1] - d * tan[1], flat[2] - d * tan[2]]);
    let o = unit(cross(tan, a));
    // Over the fold the face turns from behind, through up, to the front: keep it turning one way.
    const prev = out[k - 1];
    if (prev === undefined ? o[2] < 0 && p[2] > z0 : o[0] * prev[0] + o[1] * prev[1] + o[2] * prev[2] < 0) o = [-o[0], -o[1], -o[2]];
    across.push(a);
    out.push(o);
  });
  if ((out[Math.floor(out.length / 2)] as Vec)[2] < 0) out.forEach((o, k) => (out[k] = [-o[0], -o[1], -o[2]]));
  return [...cells, ...ribbon(line, across, out, s, X0, also)];
}

/** The two hanging ends, each from under the knot to its cut end, on the picture's 200-wide drawing (the belt's middle at x 100). */
function endsOf(cy: number): [[number, number], [number, number]][] {
  return [[[96, cy + 6], [80, cy + 6 + HANG]], [[105, cy + 5], [119, cy + 5 + HANG * 0.92]]];
}

/** A hanging end: its front and back faces, its two long edges and its cut end, from under the knot (`z` deep) hanging a little away. */
function endCells(from: [number, number], to: [number, number], z: number, s: StrapDesc, also: Vec | undefined, xs: number): Cell[] {
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
    return [w0 * p0[0]! + w1 * p1[0]! + w2 * p2[0]! - 100, w0 * p0[1]! + w1 * p1[1]! + w2 * p2[1]!, z + 2.5 * f * f];
  };
  const back = (p: Vec): Vec => [p[0], p[1], p[2] - s.t];
  const cells: Cell[] = [];
  for (let k = 0; k < DOWN; k++) {
    const f0 = k / DOWN;
    const f1 = (k + 1) / DOWN;
    const x0 = xs + f0 * l;
    const x1 = xs + f1 * l;
    const [la, lb, ra, rb] = [side(-1, f0), side(-1, f1), side(1, f0), side(1, f1)];
    const face: [number, number][] = [[x0, FACE_Y], [x1, FACE_Y], [x0, FACE_Y + s.w], [x1, FACE_Y + s.w]];
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
export function strapFace(p: BeltPaint, w: number, n = ROWS): Face {
  const rows = (y0: number, h: number, n: number): string => {
    let s = "";
    for (let k = 1; k <= n; k++) s += `<path d="M-40 ${n2(y0 + (h * k) / (n + 1))}H240" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
    return s;
  };
  const strip = (y0: number, h: number): string => `<rect x="-40" y="${n2(y0 - 1.5)}" width="280" height="${n2(h + 3)}" fill="${p.fill}"/>`;
  const cloth = (y0: number): string => strip(y0, w) + rows(y0, w, n) +
    `<path d="M-40 ${n2(y0 + 0.4)}H240M-40 ${n2(y0 + w - 0.4)}H240" stroke="${p.edge}" stroke-width="0.9" stroke-opacity="0.75"/>`;
  const faceStrip = cloth(FACE_Y);
  const backStrip = cloth(BACK_Y);
  // An edge is the stitched rows seen end on: the cloth a little darker, and on the two turns the line where one lies on the other.
  const dark = `fill="${p.edge}" fill-opacity="0.3"`;
  const edges = strip(EDGE2_Y, EDGE_H) + `<rect x="-40" y="${EDGE2_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>` +
    `<path d="M-40 ${EDGE2_Y + EDGE_H / 2}H240" stroke="${p.edge}" stroke-width="0.6" stroke-opacity="0.8"/>` +
    strip(EDGE1_Y, EDGE_H) + `<rect x="-40" y="${EDGE1_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>`;
  const clip = [
    `M-40 ${FACE_Y - 1.5}H240V${n2(FACE_Y + w + 1.5)}H-40Z`,
    `M-40 ${EDGE2_Y - 1.5}H240V${EDGE2_Y + EDGE_H + 1.5}H-40Z`,
    `M-40 ${EDGE1_Y - 1.5}H240V${EDGE1_Y + EDGE_H + 1.5}H-40Z`,
    `M-40 ${BACK_Y - 1.5}H240V${n2(BACK_Y + w + 1.5)}H-40Z`,
  ];
  // What is sewn on each hanging end lies on that end's own stretch of the strip, its frame's origin at the knot's end and its middle on the strip's.
  const sewn = (m: { body: string } | undefined, x: number): string => (m === undefined ? "" : `<g transform="translate(${x} ${n2(w / 2)})">${m.body}</g>`);
  // The paint's own defs (a kohaku belt's panels) are the caller's to add, once for the drawing.
  return { defs: p.strip?.defs ?? "", body: faceStrip + backStrip + sewn(p.ends?.left, END_X[0]) + sewn(p.ends?.right, END_X[1]) + (p.strip?.body ?? "") + edges, clip };
}
