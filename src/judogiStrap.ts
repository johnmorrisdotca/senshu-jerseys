// The belt as a solid strap, for the turning view: two turns of a band 4.5 cm wide and 5 mm thick (IJF Judogi Rules: 4-5 mm) round the
// waist, with their outer face, their inner face, their top and bottom edges, a square knot that stands off the turns, and two hanging
// ends each with a front, a back and two edges. A belt drawn on the jacket's faces is a sticker: turned to the side its ends vanish to a
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
 * At 2.63 units to the centimetre: a rank belt 4 cm wide, a black (or kohaku) belt 4.75 cm, each 5 mm thick (IJF: 4-5 mm), stitched in
 * 10 rows (quality belts carry 8 to 15), the ends hanging 25 cm from the knot.
 */
export const STRAP_T = 1.3;
export const strapWidth = (belt: string): number => (belt === "black" || belt === "red-white" ? 12.5 : 10.5);
const ROWS = 10;
const HANG = 64;
/** Where the strips lie on the strap's drawing: the face, the edge of the two turns, the edge of one, and the knot. */
const FACE_Y = 0;
const EDGE2_Y = 26;
const EDGE1_Y = 36;
const EDGE_H = 4;
const KNOT_Y = 60;
/** Along a strip: where it starts on the drawing, and the length after which a kohaku belt's panels repeat. */
const X0 = -30;
const PERIOD = 80;
/** How far the knot stands off the turns, and how far the cloth gaps from the jacket. */
const KNOT_D = 4;
const GAP = 0.3;
/** Cells round the ring and down each end. */
const ROUND = 72;
const DOWN = 8;

const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (u: Vec, v: Vec): Vec => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** A quadrilateral tl, tr, bl, br as two cells, facing the way of `out` (which picks the sign of its normal); `also` must face the viewer too. */
function quad(corners: [Vec, Vec, Vec, Vec], tex: [number, number][], out: Vec, also?: Vec): Cell[] {
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
    if (!s.worn) cells.push(...quad([o(inner[k]!, y1), o(inner[i]!, y0), o(inner[k]!, y1 + s.w), o(inner[i]!, y0 + s.w)], [[x1, FACE_Y], [x0, FACE_Y], [x1, FACE_Y + s.w], [x0, FACE_Y + s.w]], inward));
  }
  const front: Vec | undefined = s.worn ? [0, 0, 1] : undefined;
  const cy = s.y + s.sag + s.w / 2;
  // The knot's top stays under the band's, so that from behind none of it shows over the far turns.
  cells.push(...knotCells(cy + 7.2 - s.w / 2, zFront, s.t, front));
  for (const [from, to] of endsOf(cy)) cells.push(...endCells(from, to, zFront + s.t, s, front));
  return cells;
}

/** The knot's face on the strap's drawing (tl, tr, bl, br), its middle at (100, KNOT_Y). */
const KNOT: [number, number][] = [[87, KNOT_Y - 5.5], [113, KNOT_Y - 6], [88, KNOT_Y + 10], [114, KNOT_Y + 9]];

/** The square knot: a block on the front of the turns, its face a little rounded, its four sides going back into the turns. */
function knotCells(cy: number, z0: number, t: number, also?: Vec): Cell[] {
  const cells: Cell[] = [];
  const n = 3;
  const lerp = (u: number, v: number): [number, number] => {
    const [tl, tr, bl, br] = KNOT;
    const top = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
    const foot = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    return [top[0]! + (foot[0]! - top[0]!) * v, top[1]! + (foot[1]! - top[1]!) * v];
  };
  const at = (u: number, v: number, z: number): Vec => {
    const [x, y] = lerp(u, v);
    return [x - 100, y - KNOT_Y + cy, z];
  };
  const bulge = (u: number, v: number): number => z0 + KNOT_D + 1.4 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const uv: [number, number][] = [[i / n, j / n], [(i + 1) / n, j / n], [i / n, (j + 1) / n], [(i + 1) / n, (j + 1) / n]];
      cells.push(...quad(uv.map(([u, v]) => at(u, v, bulge(u, v))) as [Vec, Vec, Vec, Vec], uv.map(([u, v]) => lerp(u, v)), [0, 0, 1], also));
    }
  }
  // The sides, round the face's edge: top, right, foot and left.
  const rim: [number, number][] = [];
  for (let i = 0; i < n; i++) rim.push([i / n, 0]);
  for (let j = 0; j < n; j++) rim.push([1, j / n]);
  for (let i = n; i > 0; i--) rim.push([i / n, 1]);
  for (let j = n; j > 0; j--) rim.push([0, j / n]);
  let along = 0;
  rim.forEach(([u, v], k) => {
    const [u1, v1] = rim[(k + 1) % rim.length] as [number, number];
    const a = at(u, v, bulge(u, v));
    const b = at(u1, v1, bulge(u1, v1));
    const step = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const x0 = X0 + along;
    along += step;
    const mid = at((u + u1) / 2, (v + v1) / 2, 0);
    const c = at(0.5, 0.5, 0);
    const out: Vec = [mid[0] - c[0], mid[1] - c[1], 0];
    cells.push(...quad([a, b, [a[0], a[1], z0 - t], [b[0], b[1], z0 - t]], [[x0, EDGE2_Y], [x0 + step, EDGE2_Y], [x0, EDGE2_Y + EDGE_H], [x0 + step, EDGE2_Y + EDGE_H]], out, also));
  });
  return cells;
}

/** The two hanging ends, each from under the knot to its cut end, on the picture's 200-wide drawing (the belt's middle at x 100). */
function endsOf(cy: number): [[number, number], [number, number]][] {
  return [[[96, cy + 6], [80, cy + 6 + HANG]], [[105, cy + 5], [119, cy + 5 + HANG * 0.92]]];
}

/** A hanging end: its front and back faces, its two long edges and its cut end, from under the knot (`z` deep) hanging a little away. */
function endCells(from: [number, number], to: [number, number], z: number, s: StrapDesc, also?: Vec): Cell[] {
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
    const x0 = X0 + f0 * l;
    const x1 = X0 + f1 * l;
    const [la, lb, ra, rb] = [side(-1, f0), side(-1, f1), side(1, f0), side(1, f1)];
    const face: [number, number][] = [[x0, FACE_Y], [x1, FACE_Y], [x0, FACE_Y + s.w], [x1, FACE_Y + s.w]];
    const edge: [number, number][] = [[x0, EDGE1_Y], [x1, EDGE1_Y], [x0, EDGE1_Y + EDGE_H], [x1, EDGE1_Y + EDGE_H]];
    const outL = sub(la, ra);
    cells.push(...quad([la, lb, ra, rb], face, [0, 0, 1], also));
    cells.push(...quad([back(la), back(lb), back(ra), back(rb)], face, [0, 0, -1], also));
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
 * The strap's drawing: a straight length of belt along its face strip (stitched rows, its edges a little darker), the edges of two
 * turns and of one below it, and the knot. Each strip runs on past its ends, so a cell that is grown at its edge still finds cloth.
 */
export function strapFace(p: BeltPaint, w: number): Face {
  const rows = (y0: number, h: number, n: number): string => {
    let s = "";
    for (let k = 1; k <= n; k++) s += `<path d="M-40 ${n2(y0 + (h * k) / (n + 1))}H240" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
    return s;
  };
  const strip = (y0: number, h: number): string => `<rect x="-40" y="${n2(y0 - 1.5)}" width="280" height="${n2(h + 3)}" fill="${p.fill}"/>`;
  const faceStrip = strip(FACE_Y, w) + rows(FACE_Y, w, ROWS) +
    `<path d="M-40 ${FACE_Y + 0.4}H240M-40 ${n2(FACE_Y + w - 0.4)}H240" stroke="${p.edge}" stroke-width="0.9" stroke-opacity="0.75"/>`;
  // An edge is the stitched rows seen end on: the cloth a little darker, and on the two turns the line where one lies on the other.
  const dark = `fill="${p.edge}" fill-opacity="0.3"`;
  const edges = strip(EDGE2_Y, EDGE_H) + `<rect x="-40" y="${EDGE2_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>` +
    `<path d="M-40 ${EDGE2_Y + EDGE_H / 2}H240" stroke="${p.edge}" stroke-width="0.6" stroke-opacity="0.8"/>` +
    strip(EDGE1_Y, EDGE_H) + `<rect x="-40" y="${EDGE1_Y - 1.5}" width="280" height="${EDGE_H + 3}" ${dark}/>`;
  // The knot: the turn of the belt it is tied over, and the end that comes down across it from the top left.
  const [tl, tr, bl, br] = KNOT;
  const pad = (q: [number, number], dx: number, dy: number): string => `${n2(q[0] + dx)} ${n2(q[1] + dy)}`;
  const block = `M${pad(tl, -1.5, -1.5)}L${pad(tr, 1.5, -1.5)}L${pad(br, 1.5, 1.5)}L${pad(bl, -1.5, 1.5)}Z`;
  let knot = `<path d="${block}" fill="${p.fill}"/>`;
  for (let k = 1; k <= ROWS; k++) {
    const f = k / (ROWS + 1);
    knot += `<path d="M${n2(tl[0] + (bl[0] - tl[0]) * f)} ${n2(tl[1] + (bl[1] - tl[1]) * f)}L${n2(tr[0] + (br[0] - tr[0]) * f)} ${n2(tr[1] + (br[1] - tr[1]) * f)}" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
  }
  // The crossing end: a band from the knot's top left to its foot right, with its edges and the shadow it throws.
  const c0: [number, number] = [93, KNOT_Y - 8];
  const c1: [number, number] = [108, KNOT_Y + 11];
  const cl = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
  const ux = ((c1[1] - c0[1]) / cl) * (w / 2);
  const uy = (-(c1[0] - c0[0]) / cl) * (w / 2);
  const crossBand = `M${n2(c0[0] - ux)} ${n2(c0[1] - uy)}L${n2(c1[0] - ux)} ${n2(c1[1] - uy)}L${n2(c1[0] + ux)} ${n2(c1[1] + uy)}L${n2(c0[0] + ux)} ${n2(c0[1] + uy)}Z`;
  knot += `<path d="M${n2(c0[0] + ux + 1.2)} ${n2(c0[1] + uy)}L${n2(c1[0] + ux + 1.2)} ${n2(c1[1] + uy)}" stroke="${p.edge}" stroke-opacity="0.5" stroke-width="2.4"/>`;
  knot += `<path d="${crossBand}" fill="${p.fill}"/>`;
  for (let k = 1; k <= ROWS; k++) {
    const f = -1 + (2 * k) / (ROWS + 1);
    knot += `<path d="M${n2(c0[0] + ux * f)} ${n2(c0[1] + uy * f)}L${n2(c1[0] + ux * f)} ${n2(c1[1] + uy * f)}" stroke="${p.stitch}" stroke-width="0.32" stroke-opacity="0.7"/>`;
  }
  knot += `<path d="${crossBand}" fill="none" stroke="${p.edge}" stroke-width="0.6" stroke-opacity="0.8"/>`;
  knot += `<path d="M${pad(tl, 0, 0)}L${pad(tr, 0, 0)}L${pad(br, 0, 0)}L${pad(bl, 0, 0)}Z" fill="none" stroke="${p.edge}" stroke-width="0.6" stroke-opacity="0.6"/>`;
  const clip = [
    `M-40 ${FACE_Y - 1.5}H240V${n2(FACE_Y + w + 1.5)}H-40Z`,
    `M-40 ${EDGE2_Y - 1.5}H240V${EDGE2_Y + EDGE_H + 1.5}H-40Z`,
    `M-40 ${EDGE1_Y - 1.5}H240V${EDGE1_Y + EDGE_H + 1.5}H-40Z`,
    block,
  ];
  // The paint's own defs (a kohaku belt's panels) are the caller's to add, once for the drawing.
  return { defs: "", body: faceStrip + edges + knot, clip };
}
