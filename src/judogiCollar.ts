// The jacket's collar as a band of its own, for the turning view: a judogi's collar is a separate, thick piece (IJF Judogi Rules: up to
// 1 cm thick), stitched in rows, that stands up round the back of the neck and lies down the front, the top lapel over the under one.
// Drawn on the jacket's faces it is flat, and turned it shows no edge. Here it is a strap laid on the jacket's body: a face, a back and two
// edges, each cell a part of one straight length of stitched band (`strapFace`), so its rows follow it wherever it goes. It is worn on the
// jacket like the belt: drawn after the jacket's body, the parts behind the body hidden, and before the sleeve in front.

import { bodyPoint, type Cell, type VolumeDesc } from "./volume.ts";
import { EDGE1_Y, EDGE_H, FACE_Y, quad, through } from "./judogiStrap.ts";

type Vec = [number, number, number];

/** A collar on a jacket, as numbers that ride in the drawing. */
export interface CollarDesc {
  /** The jacket's body it lies on: its rows, half widths and half depths, and the exponent of its cross-section. */
  y: number[];
  a: number[];
  b: number[];
  full: number;
  /** The body's side wall, as a part of its half depth. */
  side: number;
  /** The middle line of the top lapel on the front's drawing from its foot up to the neck, and of the under lapel from the neck down to where it goes under the other, as x, y pairs. */
  top: number[];
  under: number[];
  /** The band's width and its thickness at the neck. */
  w: number;
  t: number;
  /** The height of the band's middle at the back of the neck. */
  neck: number;
}

/** How far the band stands off the jacket's cloth: none, it is sewn on the neck's rim and lies on the body. */
const GAP = 0;
/** Between which heights of the drawing the lapels thin, from the full thickness of the collar to the hem's. */
const THIN_FROM = 60;
const THIN_TO = 100;
const THIN = 0.5;
/** Round the back of the neck the band leans in to the neck at its top, as a collar stands. */
const LEAN = 0.7;
/** About how far apart its middles are along it. */
const STEP = 3;
/** Where its drawing starts along the face strip, and the length after which it starts again (its rows are the same all along). */
const X0 = -30;
const REPEAT = 200;
/** The first stretch of the top lapel from its foot, the lapel's hem, has a part of the strip to itself, so a name stitched there does not repeat further round the collar. */
export const HEM_RUN = 80;
export const HEM_X = 160;

const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const add = (p: Vec, q: Vec, k = 1): Vec => [p[0] + q[0] * k, p[1] + q[1] * k, p[2] + q[2] * k];
const dot = (u: Vec, v: Vec): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross = (u: Vec, v: Vec): Vec => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** A middle of the band: where it lies on the jacket, the way its face looks, its thickness, how far it is lifted, and the way the jacket faces under it (to hide it behind the body). */
interface Mid {
  p: Vec;
  out: Vec;
  t: number;
  lift: number;
  under?: Vec;
}

/** Points along a line through `pts`, about `step` apart. */
function along(pts: readonly [number, number][], step: number): [number, number][] {
  const dense = through(pts.map((p): Vec => [p[0], p[1], 0]), 12);
  const out: [number, number][] = [[dense[0]![0], dense[0]![1]]];
  let run = 0;
  for (let i = 1; i < dense.length; i++) {
    run += Math.hypot(dense[i]![0] - dense[i - 1]![0], dense[i]![1] - dense[i - 1]![1]);
    if (run >= step || i === dense.length - 1) {
      out.push([dense[i]![0], dense[i]![1]]);
      run = 0;
    }
  }
  return out;
}

const pairs = (v: readonly number[]): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < v.length; i += 2) out.push([v[i]!, v[i + 1]!]);
  return out;
};

/** Every cell of the collar: the top lapel from its foot up, round the back of the neck, and the under lapel down. */
export function collarCells(d: CollarDesc): Cell[] {
  const body = { y: d.y, a: d.a, b: d.b, full: d.full, side: d.side, nt: 0, nf: 0, nh: 0, sl: [], sd: [], pitch: 0, piece: true } as VolumeDesc;
  const rowOf = (v: readonly number[], y: number): number => {
    let j = 0;
    while (j + 2 < d.y.length && d.y[j + 1]! < y) j++;
    const r = Math.max(0, Math.min(1, (y - d.y[j]!) / (d.y[j + 1]! - d.y[j]! || 1)));
    return v[j]! + (v[j + 1]! - v[j]!) * r;
  };
  const thick = (y: number): number => d.t * (1 - (1 - THIN) * Math.max(0, Math.min(1, (y - THIN_FROM) / (THIN_TO - THIN_FROM))));
  // A point of the front's drawing on the body, and the way the body faces there.
  const onBody = (x: number, y: number): { p: Vec; n: Vec } => {
    const dx = sub(bodyPoint(body, x + 0.8, y), bodyPoint(body, x - 0.8, y));
    const dy = sub(bodyPoint(body, x, y + 0.8), bodyPoint(body, x, y - 0.8));
    const n = unit(cross(dx, dy));
    return { p: bodyPoint(body, x, y), n: n[2] < 0 ? [-n[0], -n[1], -n[2]] : n };
  };
  const top = along(pairs(d.top), STEP);
  const under = along(pairs(d.under), STEP);
  const mids: Mid[] = [];
  // The top lapel lies on the under one only where they cross, just above where the under one ends, so it is lifted by that one's thickness there.
  const underFoot = under[under.length - 1]![1];
  for (const [x, y] of top) {
    const { p, n } = onBody(x, y);
    const over = Math.max(0, Math.min(1, (y - (underFoot - 22)) / 10)) * Math.max(0, Math.min(1, (underFoot + 10 - y) / 6));
    mids.push({ p, out: n, t: thick(y), lift: GAP + over * (thick(y) + GAP), under: n });
  }
  // Round the neck: the body's cross-section there, from the top lapel's end round the side, the back and the other side to the under lapel's.
  const ringFrom = onBody(top[top.length - 1]![0], top[top.length - 1]![1]).p;
  const ringTo = onBody(under[0]![0], under[0]![1]).p;
  const ring = neckRing(d, rowOf, ringFrom, ringTo);
  mids.push(...ring.slice(1, -1));
  for (const [x, y] of under) {
    const { p, n } = onBody(x, y);
    mids.push({ p, out: n, t: thick(y), lift: GAP, under: n });
  }
  // The ways it looks are evened out where the lapels meet the ring, so the band turns over the shoulder without a crease.
  for (let pass = 0; pass < 3; pass++) {
    const outs = mids.map((m, k) => unit(add(add(m.out, mids[Math.max(0, k - 1)]!.out), mids[Math.min(mids.length - 1, k + 1)]!.out)));
    mids.forEach((m, k) => (m.out = outs[k]!));
  }
  const centres = mids.map((m) => add(m.p, m.out, m.lift + m.t / 2));
  for (let pass = 0; pass < 2; pass++) {
    const next = centres.map((c, k) => (k === 0 || k === centres.length - 1 ? c : add(add(c, centres[k - 1]!), centres[k + 1]!).map((v) => v / 3) as Vec));
    next.forEach((c, k) => (centres[k] = c));
  }
  // Its width runs square to its line and to the way it looks.
  const across: Vec[] = [];
  centres.forEach((_, k) => {
    const tan = unit(sub(centres[Math.min(centres.length - 1, k + 1)]!, centres[Math.max(0, k - 1)]!));
    let a = unit(cross(mids[k]!.out, tan));
    const prev = across[k - 1];
    if (prev !== undefined && dot(a, prev) < 0) a = [-a[0], -a[1], -a[2]];
    across.push(a);
  });
  return band(centres, across, mids, d.w);
}

/** The band round the back of the neck: on the body's cross-section, scaled to each height, from `from` (front, picture's right) round the back to `to`. */
function neckRing(d: CollarDesc, rowOf: (v: readonly number[], y: number) => number, from: Vec, to: Vec): Mid[] {
  const a0 = rowOf(d.a, d.neck);
  const b0 = rowOf(d.b, d.neck);
  const n = d.full;
  // The cross-section at the neck, all the way round from the front middle toward the picture's right, with its side walls.
  const sec: [number, number][] = [];
  const depth = (s: number): number => Math.max(d.side * b0, b0 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(s), n)), 1 / n));
  for (let i = 0; i <= 60; i++) sec.push([a0 * (i / 60), depth(i / 60)]);
  for (let i = 1; i <= 8; i++) sec.push([a0, d.side * b0 * (1 - (2 * i) / 8)]);
  for (let i = 59; i >= -60; i--) sec.push([a0 * (i / 60), -depth(i / 60)]);
  for (let i = 1; i <= 8; i++) sec.push([-a0, -d.side * b0 * (1 - (2 * i) / 8)]);
  for (let i = -59; i <= 0; i++) sec.push([a0 * (i / 60), depth(i / 60)]);
  const len: number[] = [0];
  for (let i = 1; i < sec.length; i++) len.push(len[i - 1]! + Math.hypot(sec[i]![0] - sec[i - 1]![0], sec[i]![1] - sec[i - 1]![1]));
  const total = len[len.length - 1]!;
  // Where the two lapels' ends lie round it, as a length from the front middle.
  const lengthAt = (x: number, second: boolean): number => {
    const s = Math.max(-1, Math.min(1, x / a0));
    let best = 0;
    let gap = Infinity;
    sec.forEach((p, i) => {
      if ((second ? len[i]! < total / 2 : len[i]! > total / 2) || p[1] < 0) return;
      const g = Math.abs(p[0] - s * a0);
      if (g < gap) {
        gap = g;
        best = len[i]!;
      }
    });
    return best;
  };
  const yFrom = from[1];
  const yTo = to[1];
  const l0 = lengthAt(from[0] * (a0 / rowOf(d.a, yFrom)), false);
  const l1 = lengthAt(to[0] * (a0 / rowOf(d.a, yTo)), true);
  const steps = Math.max(8, Math.round((l1 - l0) / STEP));
  const out: Mid[] = [];
  for (let k = 0; k <= steps; k++) {
    const want = l0 + ((l1 - l0) * k) / steps;
    let i = 1;
    while (i < sec.length - 1 && len[i]! < want) i++;
    const r = (want - len[i - 1]!) / (len[i]! - len[i - 1]! || 1);
    const x = sec[i - 1]![0] + (sec[i]![0] - sec[i - 1]![0]) * r;
    const z = sec[i - 1]![1] + (sec[i]![1] - sec[i - 1]![1]) * r;
    // Its height: at the lapels' ends at the front, down to `neck` at the back.
    const front = Math.max(0, z / b0);
    const y = d.neck + ((k < steps / 2 ? yFrom : yTo) - d.neck) * front * front;
    const ka = rowOf(d.a, y) / a0;
    const kb = rowOf(d.b, y) / b0;
    const p0 = sec[Math.max(0, i - 2)]!;
    const p1 = sec[Math.min(sec.length - 1, i + 1)]!;
    let nx = (p1[1] - p0[1]) * kb;
    let nz = -(p1[0] - p0[0]) * ka;
    if (nx * x + nz * z < 0) {
      nx = -nx;
      nz = -nz;
    }
    const out0 = unit([nx, 0, nz]);
    out.push({ p: [x * ka, y, z * kb], out: unit([out0[0], -LEAN * (1 - front), out0[2]]), t: d.t, lift: GAP });
  }
  return out;
}

/** The band along its middles: its face, its back, its two edges and its two cut ends, its drawing running along the face strip. */
function band(c: readonly Vec[], across: readonly Vec[], mids: readonly Mid[], w: number): Cell[] {
  const cells: Cell[] = [];
  const at = (k: number, side: number, face: number): Vec => add(add(c[k]!, across[k]!, side * (w / 2)), mids[k]!.out, face * (mids[k]!.t / 2));
  let run = 0;
  for (let k = 0; k + 1 < c.length; k++) {
    const step = Math.hypot(...sub(c[k + 1]!, c[k]!));
    const x0 = run < HEM_RUN ? HEM_X + run : X0 + (run % REPEAT);
    const x1 = x0 + step;
    run += step;
    const o = unit(add(mids[k]!.out, mids[k + 1]!.out));
    const a = unit(add(across[k]!, across[k + 1]!));
    const u0 = mids[k]!.under;
    const u1 = mids[k + 1]!.under;
    // On the front it is hidden where the jacket under it faces away, as a belt worn on it is.
    const also = u0 !== undefined && u1 !== undefined ? unit(add(u0, u1)) : undefined;
    const face: [number, number][] = [[x0, FACE_Y], [x1, FACE_Y], [x0, FACE_Y + w], [x1, FACE_Y + w]];
    const edge: [number, number][] = [[x0, EDGE1_Y], [x1, EDGE1_Y], [x0, EDGE1_Y + EDGE_H], [x1, EDGE1_Y + EDGE_H]];
    cells.push(...quad([at(k, -1, 1), at(k + 1, -1, 1), at(k, 1, 1), at(k + 1, 1, 1)], face, o, also));
    cells.push(...quad([at(k, -1, -1), at(k + 1, -1, -1), at(k, 1, -1), at(k + 1, 1, -1)], face, [-o[0], -o[1], -o[2]], also));
    cells.push(...quad([at(k, -1, 1), at(k + 1, -1, 1), at(k, -1, -1), at(k + 1, -1, -1)], edge, [-a[0], -a[1], -a[2]], also));
    cells.push(...quad([at(k, 1, 1), at(k + 1, 1, 1), at(k, 1, -1), at(k + 1, 1, -1)], edge, a, also));
  }
  for (const [k, toward] of [[0, 1], [c.length - 1, c.length - 2]] as const) {
    const out = sub(c[k]!, c[toward]!);
    const u = mids[k]!.under;
    cells.push(...quad([at(k, -1, 1), at(k, 1, 1), at(k, -1, -1), at(k, 1, -1)], [[X0, EDGE1_Y], [X0 + w, EDGE1_Y], [X0, EDGE1_Y + EDGE_H], [X0 + w, EDGE1_Y + EDGE_H]], out, u));
  }
  return cells;
}

/** A collar's piece description: no rows or sleeves of its own, only the band, seen from `pitch` degrees above. */
export function collarPiece(c: CollarDesc, pitch: number): VolumeDesc {
  return { y: [], a: [], b: [], nt: 0, nf: 0, nh: 0, sl: [], sd: [], pitch, piece: true, collar: c };
}
