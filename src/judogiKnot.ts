// The worn belt's square knot, built of solid lengths of the strap: each has a face, a back, two edges with their bevels and its cut ends, so it has
// its own thickness from every side and not only from the front. The wrap lies across the belt's front and sinks into the turns at each side; the crossing end
// comes up over the belt's top edge and runs down over the wrap to the right-hand end. The two lie flat on one another, so the knot stands out of the
// cloth by the thickness of its layers and no more. Every cell samples the strap's own drawing (`strapFace`), so a kohaku belt's panels run along it.

import { BACK_Y, EDGE1_Y, EDGE_H, FACE_Y, X0, quad, through, type StrapDesc } from "./judogiStrap.ts";
import type { Cell } from "./volume.ts";

type Vec = [number, number, number];

const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (u: Vec, v: Vec): Vec => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const dot = (u: Vec, v: Vec): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const smooth = (u: number): number => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};

/** A length of strap along a line of middles `c`, `across` the way its width runs and `out` the way its face looks, with `x0` where it starts on the strap's drawing. */
interface Length {
  c: readonly Vec[];
  across: readonly Vec[];
  out: readonly Vec[];
  /** Half its width and half its thickness. */
  hw: number;
  ht: number;
  x0: number;
}

/** The four corners of a length's section, going round it: the face's left and the back's left, the back's right and the face's right. */
function section(l: Length, k: number): Vec[] {
  const p = l.c[k] as Vec;
  const a = l.across[k] as Vec;
  const o = l.out[k] as Vec;
  const at = (side: number, face: number): Vec => [p[0] + a[0] * side + o[0] * face, p[1] + a[1] * side + o[1] * face, p[2] + a[2] * side + o[2] * face];
  const { hw, ht } = l;
  return [at(-hw, ht), at(-hw, -ht), at(hw, -ht), at(hw, ht)];
}

/** The outward direction of each of the section's four faces (the one from corner `i` to the next), as (across, out) parts: the left side, the back, the right side, the face. */
const FACING: [number, number][] = [[-1, 0], [0, -1], [1, 0], [0, 1]];

/** A closed length of strap: every cell faces out of it, so it is solid from any side. */
function solid(l: Length, also?: Vec): Cell[] {
  const cells: Cell[] = [];
  const rings = l.c.map((_, k) => section(l, k));
  const w = 2 * l.hw;
  // Where each face lies on the strap's drawing, across it: the face and the back sample the whole width, the sides their edge strip.
  const tv: [number, number][] = [[EDGE1_Y, EDGE1_Y + EDGE_H], [BACK_Y, BACK_Y + w], [EDGE1_Y + EDGE_H, EDGE1_Y], [FACE_Y + w, FACE_Y]];
  let x = l.x0;
  for (let k = 0; k + 1 < l.c.length; k++) {
    const x1 = x + Math.hypot(...sub(l.c[k + 1] as Vec, l.c[k] as Vec));
    const a = unit([(l.across[k] as Vec)[0] + (l.across[k + 1] as Vec)[0], (l.across[k] as Vec)[1] + (l.across[k + 1] as Vec)[1], (l.across[k] as Vec)[2] + (l.across[k + 1] as Vec)[2]]);
    const o = unit([(l.out[k] as Vec)[0] + (l.out[k + 1] as Vec)[0], (l.out[k] as Vec)[1] + (l.out[k + 1] as Vec)[1], (l.out[k] as Vec)[2] + (l.out[k + 1] as Vec)[2]]);
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const [va, vb] = tv[i] as [number, number];
      const [fa, fo] = FACING[i] as [number, number];
      const out: Vec = [a[0] * fa + o[0] * fo, a[1] * fa + o[1] * fo, a[2] * fa + o[2] * fo];
      cells.push(...quad([(rings[k] as Vec[])[i] as Vec, (rings[k + 1] as Vec[])[i] as Vec, (rings[k] as Vec[])[j] as Vec, (rings[k + 1] as Vec[])[j] as Vec], [[x, va], [x1, va], [x, vb], [x1, vb]], out, also));
    }
    x = x1;
  }
  // The two cut ends.
  const cap = (k: number, toward: Vec): void => {
    const r = rings[k] as Vec[];
    const e: [number, number][] = [[X0, EDGE1_Y], [X0 + w, EDGE1_Y], [X0, EDGE1_Y + EDGE_H], [X0 + w, EDGE1_Y + EDGE_H]];
    cells.push(...quad([r[0] as Vec, r[3] as Vec, r[1] as Vec, r[2] as Vec], e, toward, also));
  };
  const last = l.c.length - 1;
  cap(0, unit(sub(l.c[0] as Vec, l.c[1] as Vec)));
  cap(last, unit(sub(l.c[last] as Vec, l.c[last - 1] as Vec)));
  return cells;
}

/**
 * The square knot. `cy` is the band's middle at the front, `z0` the front of its turns, and `zAt(x)` how far the turns' front
 * stands in or out at `x` across (the belt's round). `also` hides what the jacket covers.
 */
export function knotCells(s: StrapDesc, cy: number, z0: number, zAt: (x: number) => number, also?: Vec): Cell[] {
  const { t } = s;
  const top = cy - s.w / 2;
  const front = (x: number): number => z0 + zAt(x);
  // The wrap: across the front, lying on the turns and sinking into them at each side.
  const half = 12;
  const wrap: Vec[] = [];
  for (let k = 0; k <= 12; k++) {
    const x = -half - 1.4 + (k * (2 * half + 2.8)) / 12;
    const sink = smooth((Math.abs(x) - (half - 0.6)) / 1.6);
    wrap.push([x, cy + 0.5, front(x) + t / 2 + 0.02 + 0.6 * Math.max(0, 1 - (x / half) ** 2) - t * 1.5 * sink]);
  }
  const wrapOut = wrap.map((_, k): Vec => {
    const d = sub(wrap[Math.min(wrap.length - 1, k + 1)] as Vec, wrap[Math.max(0, k - 1)] as Vec);
    return unit(cross(d, [0, 1, 0]));
  });
  const cells = solid({ c: wrap, across: wrap.map((): Vec => [0, 1, 0]), out: wrapOut, hw: s.w / 2 - 0.25, ht: t / 2, x0: X0 + 20 }, also);
  // The crossing end: from the turns' top edge, over the wrap, down to the right-hand end.
  const on = (x: number): number => front(x) + t + t / 2 + 0.06 + 0.6 * Math.max(0, 1 - (x / half) ** 2);
  const line = through([
    [-7.4, top + 5.6, on(-7.4)],
    [-6.4, top + 5.2, on(-6.4)],
    [-4.6, top + 5.4, on(-4.6)],
    [-1, cy + 1.8, on(-1) + 0.4],
    [5, cy + s.w / 2 + 1.4, on(5) + 0.1],
    [7, cy + s.w / 2 + 5.5, front(7) + t * 1.05],
  ], 4);
  // Its width runs square to the diagonal it makes on the front, kept square to the line where the line turns over the top.
  const flat: Vec = unit([0.7, -0.71, 0]);
  const across: Vec[] = [];
  const out: Vec[] = [];
  line.forEach((p, k) => {
    const tan = unit(sub(line[Math.min(line.length - 1, k + 1)] as Vec, line[Math.max(0, k - 1)] as Vec));
    const d = dot(flat, tan);
    const a = unit([flat[0] - d * tan[0], flat[1] - d * tan[1], flat[2] - d * tan[2]]);
    let o = unit(cross(tan, a));
    // Over the fold the face turns from behind, through up, to the front: keep it turning one way.
    const prev = out[k - 1];
    if (prev === undefined ? o[2] < 0 && p[2] > z0 : dot(o, prev) < 0) o = [-o[0], -o[1], -o[2]];
    across.push(a);
    out.push(o);
  });
  if ((out[Math.floor(out.length / 2)] as Vec)[2] < 0) out.forEach((o, k) => (out[k] = [-o[0], -o[1], -o[2]]));
  return [...cells, ...solid({ c: line, across, out, hw: s.w / 2 - 0.25, ht: t / 2, x0: X0 }, also)];
}
