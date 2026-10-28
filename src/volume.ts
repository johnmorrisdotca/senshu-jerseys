// The turning view's body: the shirt as a garment with volume, in plain SVG. The torso is a loft of ellipses (narrow at the neck, a chest's depth at the armpit) and each sleeve a tapered tube, and
// the flat front and back drawings are wrapped over them: each surface is cut into a grid of small cells, every cell a clipped copy of its face's drawing under an affine map worked out from where its
// corners lie in space after the turn. Only the maps, the visibility and the shade change from one angle to the next; the cells, their clips and the drawings do not. Pure and deterministic: no
// clock, no random number, no DOM except `applyVolume`, which moves a frame that is already drawn.
import { shapeOf, sleeveDraws } from "./jersey.ts";
import type { Resolved } from "./options.ts";
import { n2 } from "./path.ts";
import type { CollarDesc } from "./judogiCollar.ts";
import type { StrapDesc } from "./judogiStrap.ts";
import type { SolidDesc } from "./beltBox.ts";

/** How a shirt is cut into cells, and the size of the garment they are wrapped over. All of it is numbers, so it can ride in the drawing and `applyVolume` can work from it alone. */
export interface VolumeDesc {
  /** The rows of the torso: the y of each line, the half width of the drawing there (padded) and the half depth of the body there. */
  y: number[];
  a: number[];
  b: number[];
  /** Columns round the front (and again round the back) of the torso, and cells along and across a sleeve. */
  nt: number;
  nf: number;
  nh: number;
  /** Each sleeve: its side (-1 on the picture's left) and `[Sx, Sy, Px, Py, Ax, Ay, Qx, Qy]`, the shoulder and the cuff on the outer edge, then the armpit and the cuff on the inner. */
  sl: { s: -1 | 1; q: number[]; c?: number[] }[];
  /** The things on the sleeves, each on the sleeve `g` (1 on the picture's left, which is the wearer's right, 2 on the other): where its middle lies (`f` of the way down, `a` degrees round from the front), the room it takes round and down (half an angle in degrees, half a length as a part of the sleeve), its size on its own drawing and which way that drawing reads round the arm (`dir`). */
  sd: { g: 1 | 2; f: number; a: number; da: number; df: number; w: number; h: number; dir: 1 | -1 }[];
  /** How far the camera looks down, in degrees. */
  pitch: number;
  /** The exponent of the body's cross-section in depth (`FULL` when not given): a judogi's cloth hangs rounder than a jersey's body. */
  full?: number;
  /**
   * How deep the side wall is, as a part of `b` (`SIDE` when not given). Cloth that is flat down its sides is wider turned a little than face on (its corners
   * swing out), so a judogi's body keeps this small: the width then only narrows from the front to the side.
   */
  side?: number;
  /** A sleeveless cut: its side wall samples further in from the drawing's edge, past the outline's stroke. */
  tank?: true;
  /** A judogi piece (judogiCloth.ts, drawn by pieceVolume.ts) rather than a shirt: its second row is not sampled further in, since a piece's drawing has no rounded shoulder tip there (its first row is a collar). */
  piece?: true;
  /** The tubes hang below the body rather than from its sides (a pair of trousers' legs): both are drawn first, the near one over the far one, and the body over their tops. */
  hang?: true;
  /**
   * For each row, how far its cross-section has gone from the body's round to two rounds side by side, 0 to 1: the hips of a pair of
   * trousers parting into the legs. A row at 1 is the shape of the tops of two tubes of half its width, so legs that start there meet
   * the body with no edge.
   */
  lobes?: number[];
  /** How deep the tubes (sleeves, legs) are, as a part of their width (`SLEEVE_DEPTH` when not given): a judogi's legs and sleeves are rounder than a shirt's flat sleeves. */
  tube?: number;
  /**
   * A jacket's inside, as far down as this height of the drawing (judogiInner.ts): the back and front panels' inner faces, a rim round the neck and the walls between them, so
   * looking into the neck from any side shows cloth. Their drawing lies in the faces' picture below the jacket's own (`INNER_DY`).
   */
  inner?: number;
  /** A belt as a solid strap (judogiStrap.ts): its cells are the strap's own, drawn nearest last, and the rows above are empty. */
  strap?: StrapDesc;
  /** A folded belt and/or a gift box (beltBox.ts): a scene of cells drawn nearest last like a strap. */
  solid?: SolidDesc;
  /** A jacket's collar as a band of its own (judogiCollar.ts), drawn nearest last like a strap. */
  collar?: CollarDesc;
  /** How many of the pieces after this one are worn on it (a collar, a belt): they are drawn after its body and before its near sleeve. */
  worn?: number;
}

/** A matrix's linear part is written to four decimals: it is multiplied by coordinates up to 200, so two would put a cell a unit off its neighbour. */
const n4 = (x: number): string => String(Math.round(x * 10000) / 10000 || 0);
const rad = (deg: number): number => (deg * Math.PI) / 180;
const PAD = 1.2;
const SLEEVE_DEPTH = 0.75;
/** How far down the sleeve the cuff's lining samples, as a part of its length. */
/** The hem of a sleeve or a trouser leg is about 4 mm thick (1 unit), and the inside of the open end goes in about 5 cm (14 units). */
const HEM_THICK = 1;
const DEPTH_IN = 14;
/** How far up the sleeve (a part of its length) the inside of an open end samples its cloth from, so that no cell has a flat drawing. */
const TEX_UP = 0.04;
/** The exponent of the torso's cross-section in depth: 2 is an ellipse, more is a fuller, squarer body that fills out to the sleeves. */
const FULL = 4;
const BODY_DEPTH = 0.6;
/**
 * How much of the body's depth stays on the side of each half, as a part of `b`. Without this the
 * superellipse pinches to z = 0 at x = ±a and a three-quarter view looks through a hole between
 * the front and the back. A side panel then spans the rest, from +SIDE b to −SIDE b.
 */
const SIDE = 0.4;
/** The two halves of the side wall meet past z = 0 by this part of its depth, and sample the drawing a little inside its edge, so that two antialiased edges never meet on the seam and leave a hairline. */
const OVERLAP = 0.15;
const EDGE = 0.6;

/** The half width, on the drawing, a row samples: inside the outline's own edge, and further in at the shoulder tip, whose corner the drawing rounds off and leaves clear. */
export function texHalf(d: VolumeDesc, j: number): number {
  return (d.a[j] as number) - PAD - EDGE - (j === 1 && d.piece !== true ? 5 : 0);
}

/** Depth of the front (or back) half at parameter `t` (−90° the left, 90° the right): the superellipse, never thinner than the side wall. */
function depthAt(b: number, t: number, full = FULL, side = SIDE): number {
  const elliptical = b * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(Math.sin(t)), full)), 1 / full);
  return Math.max(side * b, elliptical);
}

/** How deep the side wall of row `j` is on each half: as deep as the half's own edge, so the two always meet; none where the row has become two rounds. */
export function wallOf(d: VolumeDesc, j: number): number {
  return zAt(d, j, Math.PI / 2);
}

/** Depth of row `j` of the body at parameter `t`: its round, or that round going over to two side by side (`VolumeDesc.lobes`). */
export function zAt(d: VolumeDesc, j: number, t: number): number {
  const b = d.b[j] as number;
  const round = depthAt(b, t, d.full, d.side);
  const w = d.lobes?.[j] ?? 0;
  if (w <= 0) return round;
  // Each half of the row is one tube's top: a circle across that half, as deep as a tube of that width (`SLEEVE_DEPTH`).
  const u = Math.abs(Math.sin(t));
  const lobe = (d.tube ?? SLEEVE_DEPTH) * ((d.a[j] as number) / 2) * Math.sqrt(Math.max(0, 1 - ((u - 0.5) / 0.5) ** 2));
  // The outer half keeps some of the side wall's depth, which shrinks away as the row becomes two rounds (a leg has no flat side); the inner half goes in to the cleft between the legs.
  const shaped = u >= 0.5 ? Math.max((d.side ?? SIDE) * b * (1 - w), lobe) : lobe;
  return round + (shaped - round) * w;
}

/** Where the point `(x, y)` of the front's drawing lies on the body, in space: as the cells wrap the drawing, the rows' values taken in proportion between rows. */
export function bodyPoint(d: VolumeDesc, x: number, y: number): [number, number, number] {
  let j = 0;
  while (j + 2 < d.y.length && (d.y[j + 1] as number) < y) j++;
  const y0 = d.y[j] as number;
  const y1 = d.y[j + 1] as number;
  const r = Math.max(0, Math.min(1, (y - y0) / (y1 - y0 || 1)));
  const mix = (u: number, v: number): number => u + (v - u) * r;
  const s = Math.max(-1, Math.min(1, (x - 100) / mix(texHalf(d, j), texHalf(d, j + 1))));
  const t = Math.asin(s);
  return [mix(d.a[j] as number, d.a[j + 1] as number) * s, y, mix(zAt(d, j, t), zAt(d, j + 1, t))];
}

/** The half width of a polyline of `[u, y]` at `y`. */
function widthAt(half: readonly (readonly [number, number])[], y: number): number {
  const first = half[0] as readonly [number, number];
  const last = half[half.length - 1] as readonly [number, number];
  if (y <= first[1]) return first[0];
  if (y >= last[1]) return last[0];
  for (let i = 1; i < half.length; i++) {
    const p = half[i - 1] as readonly [number, number];
    const q = half[i] as readonly [number, number];
    if (y <= q[1]) return q[1] === p[1] ? q[0] : p[0] + ((q[0] - p[0]) * (y - p[1])) / (q[1] - p[1]);
  }
  return last[0];
}

/** The cells of one shirt, from its resolved options. */
export function volumeDesc(r: Resolved, pitch = 8): VolumeDesc {
  const sh = shapeOf(r);
  const spec = sh.spec;
  const ny = spec.ny;
  const sy = sh.half[1]?.[1] ?? spec.sy;
  const ay = sh.ay;
  const hem = spec.hy + spec.drop + 3;
  // The rows follow the seam's own points, so a row's width is the drawing's and not a chord across a curve: a tank's armhole too.
  const seam = sh.half.slice(3);
  const below = [seam[1], seam[3], seam[5], seam[seam.length - 1]].filter((p): p is [number, number] => p !== undefined).map((p) => p[1]);
  const arm = sh.half.slice(2, sh.half.length - 8).filter((_, i) => i % 2 === 0).map((p) => p[1]);
  // A tank has no side seam in `seam` below its sleeves' armhole: its half outline is the armhole first, then the side from the armpit down, which gets a row at each of its own points a little apart.
  const side = sh.half.filter((p) => p[1] > ay + 6 && p[1] < hem - 6).map((p) => p[1]);
  const y = sh.tank ? [ny, sy, ...arm.filter((v) => v > sy + 2 && v < ay - 2), ay, ...side, hem] : [ny, sy, (sy + ay) / 2, ay, ...below, hem];
  const chest = BODY_DEPTH * spec.au;
  const neck = BODY_DEPTH * sh.nw;
  const a = y.map((v) => widthAt(sh.half, v) + PAD);
  const b = y.map((v) => {
    const raw = widthAt(sh.half, v);
    if (v >= ay) return BODY_DEPTH * raw;
    const s = Math.sqrt(Math.max(0, Math.min(1, (v - ny) / (ay - ny))));
    return neck + (chest - neck) * s * s * (3 - 2 * s);
  });
  const sl: VolumeDesc["sl"] = [];
  if (sh.sleeves !== undefined) {
    for (const g of [sh.sleeves.L, sh.sleeves.R]) {
      // The sleeve is lofted from its set-in shape (the shoulder to the armpit), a raglan's too: its shoulder is part of the body's loft.
      sl.push({ s: g.side, q: [g.S[0], g.S[1], g.P[0], g.P[1], g.A[0], g.A[1], g.Q[0], g.Q[1]].map((v) => Math.round(v * 100) / 100) });
    }
  }
  const r2 = (v: number): number => Math.round(v * 100) / 100;
  const sd: VolumeDesc["sd"] = [];
  for (const d of detailsOf(r, sl)) sd.push(d.at);
  return { y: y.map(r2), a: a.map(r2), b: b.map(r2), nt: 8, nf: 3, nh: 5, sl, sd, pitch, ...(sh.tank ? { tank: true as const } : {}) };
}

/** The drawings of what the sleeves carry, in the order of `VolumeDesc.sd`, each upright and centred on its own origin. */
export function volumeDetails(r: Resolved): string[] {
  return detailsOf(r, volumeDesc(r).sl).map((d) => d.svg);
}

function detailsOf(r: Resolved, sl: VolumeDesc["sl"]): { at: VolumeDesc["sd"][number]; svg: string }[] {
  const out: { at: VolumeDesc["sd"][number]; svg: string }[] = [];
  if (r.sleeveSides === undefined) return out;
  // The picture's left sleeve (the first) is the wearer's right.
  for (const [i, wearer] of [[0, "right"], [1, "left"]] as const) {
    const side = r.sleeveSides[wearer];
    const sleeve = sl[i];
    if (side === undefined || sleeve === undefined) continue;
    const q = sleeve.q;
    const mid = (t: number): number[] => [q[0]! + (q[2]! - q[0]!) * t, q[1]! + (q[3]! - q[1]!) * t, q[4]! + (q[6]! - q[4]!) * t, q[5]! + (q[7]! - q[5]!) * t];
    const width = (t: number): number => Math.hypot(mid(t)[0]! - mid(t)[2]!, mid(t)[1]! - mid(t)[3]!);
    const length = Math.hypot(q[2]! - q[0]!, q[3]! - q[1]!);
    for (const d of sleeveDraws(r, side, width)) {
      const df = (d.h / 2 + 1) / length;
      const f = Math.max(df + 0.01, Math.min(1 - df - 0.01, d.at / 100));
      const rc = width(f) / 2;
      const da = Math.min(80, ((d.w / 2 + 1) / rc) * (180 / Math.PI));
      const r3 = (v: number): number => Math.round(v * 1000) / 1000;
      out.push({ at: { g: (i + 1) as 1 | 2, f: r3(f), a: d.around, da: r3(da), df: r3(df), w: r3(d.w + 2), h: r3(d.h + 2), dir: i === 0 ? 1 : -1 }, svg: d.svg });
    }
  }
  return out;
}

/** The `Cell.layer` of a thing that lies apart from the rest of a scene (a box's lid beside it): drawn first when it is behind the rest, last when it is in front. */
export const APART = 9;

/** One cell: a triangle, where it is on its drawing, where its corners lie in space and the way the cloth faces there. Two make a quadrilateral of the grid, and a triangle's map is exact at its corners, so its neighbours meet it with no gap. */
export interface Cell {
  /** 0 the torso's front half, 3 its back half, 1 and 2 the sleeve on the picture's left and right. */
  g: 0 | 1 | 2 | 3;
  back: boolean;
  tex: number[];
  p: number[];
  n: [number, number, number];
  /** The drawing of a thing on a sleeve, by its place in `VolumeDesc.sd`; the cell is of that drawing and not of the front or the back. */
  src?: number;
  /** In a scene of several things (a box with a belt in it): what is drawn first, 0, 1, 2 (what lies inside, the belt, what stands round it), so a wall always covers what it holds; within a layer the cells are put in order by depth. */
  layer?: number;
  /** The cloth seen from inside (the inside of a sleeve or a leg at its open end): shaded darker. */
  inside?: true;
  /** A second way the cell must face the viewer to be seen: a belt's edge behind the jacket it is tied on faces the viewer, but is hidden. */
  also?: [number, number, number];
}

/** The two triangles of a quadrilateral given as the corners tl, tr, bl, br (x, y of the drawing, and x, y, z of the space). */
export function split(g: Cell["g"], back: boolean, tex: number[], p: number[], n: [number, number, number], src?: number): Cell[] {
  const pick = (ks: number[]): { tex: number[]; p: number[] } => ({ tex: ks.flatMap((k) => [tex[2 * k] as number, tex[2 * k + 1] as number]), p: ks.flatMap((k) => [p[3 * k] as number, p[3 * k + 1] as number, p[3 * k + 2] as number]) });
  return [pick([0, 1, 2]), pick([1, 3, 2])].map((t) => ({ g, back, tex: t.tex, p: t.p, n, ...(src === undefined ? {} : { src }) }));
}

const lerp2 = (p: readonly number[], q: readonly number[], t: number): [number, number] => [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t];

/**
 * Where a sleeve's outer and inner edges are, a part `f` of the way down it. Straight lines from the shoulder and the armpit to the cuff;
 * or, given `c` (two control points of its outer edge, which may lie on the straight line, and where the armhole starts over the
 * shoulder), a sleeve set on along an armhole: its outer
 * edge runs from the shoulder point to the cuff, even in length along it, and its inner edge stays level with it, down the armhole from
 * the shoulder point to the armpit and then down the arm to the cuff. So every cross-section runs across the sleeve, the head is a
 * round that grows from the shoulder point, and the sleeve does not fan out from the armpit (turned, a fan shows the page between
 * its sections).
 */
export function sleeveAt(q: readonly number[], c: readonly number[] | undefined, f: number): [[number, number], [number, number]] {
  const S = [q[0]!, q[1]!];
  const P = [q[2]!, q[3]!];
  const A = [q[4]!, q[5]!];
  const Q = [q[6]!, q[7]!];
  if (c === undefined) return [lerp2(S, P, f), lerp2(A, Q, f)];
  const o = capAt(S, c, P, f);
  const level = o[1] + f * (Q[1] - P[1]);
  // The armhole starts at `c`'s third point when it has one, over the shoulder, so the head's top closes over the body's shoulder.
  const H = c.length >= 6 ? [c[4]!, c[5]!] : S;
  if (level <= A[1]) return [o, lerp2(H, A, Math.max(0, (level - H[1]) / (A[1] - H[1] || 1)))];
  return [o, lerp2(A, Q, Math.min(1, (level - A[1]) / (Q[1] - A[1] || 1)))];
}

/** How far from the armpit's level down the arm a sleeve's head goes over to the round of the arm. */
const HEAD_FADE = 45;

/**
 * The least half depth of a sleeve set on along an armhole (`c`), at the height `y` of a cross-section: its head goes over the shoulder,
 * so down to the armpit it is about as deep as the body is at the armhole, and below it goes over to the arm's own round. A head as
 * round as its width would come to a point at the shoulder, as no sleeve does seen from the side.
 */
function headDepth(d: VolumeDesc, sleeve: VolumeDesc["sl"][number], y: number): number {
  if (sleeve.c === undefined) return 0;
  const armpit = sleeve.q[5]!;
  const fade = Math.max(0, Math.min(1, 1 - (y - armpit) / HEAD_FADE));
  if (fade <= 0) return 0;
  let j = 0;
  while (j + 2 < d.y.length && d.y[j + 1]! < y) j++;
  const r = Math.max(0, Math.min(1, (y - d.y[j]!) / (d.y[j + 1]! - d.y[j]! || 1)));
  return HEAD * (d.b[j]! + (d.b[j + 1]! - d.b[j]!) * r) * fade;
}

/** The larger of two depths with the corner between them rounded off (a power mean), so that a sleeve's head goes over to the round of the arm without a crease. */
const softMax = (a: number, b: number): number => (a ** 3 + b ** 3) ** (1 / 3);

/** A sleeve's head as a part of the body's half depth at the armhole. */
const HEAD = 0.42;

const CAP_STEPS = 64;
const capLengths = new Map<string, number[]>();

/** The point a part `f` of the way along the curve from `S` past the controls `c` to `P`, by length. */
function capAt(S: readonly number[], c: readonly number[], P: readonly number[], f: number): [number, number] {
  const at = (t: number): [number, number] => {
    const u = 1 - t;
    const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    return [w[0]! * S[0]! + w[1]! * c[0]! + w[2]! * c[2]! + w[3]! * P[0]!, w[0]! * S[1]! + w[1]! * c[1]! + w[2]! * c[3]! + w[3]! * P[1]!];
  };
  const key = [...S, ...c, ...P].join(",");
  let lengths = capLengths.get(key);
  if (lengths === undefined) {
    lengths = [0];
    let last = at(0);
    for (let i = 1; i <= CAP_STEPS; i++) {
      const p = at(i / CAP_STEPS);
      lengths.push(lengths[i - 1]! + Math.hypot(p[0] - last[0], p[1] - last[1]));
      last = p;
    }
    capLengths.set(key, lengths);
  }
  const want = Math.max(0, Math.min(1, f)) * lengths[CAP_STEPS]!;
  let i = 1;
  while (i < CAP_STEPS && lengths[i]! < want) i++;
  const r = (want - lengths[i - 1]!) / (lengths[i]! - lengths[i - 1]! || 1);
  return at((i - 1 + r) / CAP_STEPS);
}

/** The way a cell of four corners faces: the cross product of its two sides, turned to point away from `(cx, cy, cz)`, the middle of the ring it lies on. */
export function normalOf(p: readonly number[], cx: number, cy: number, cz: number): [number, number, number] {
  const sub = (i: number, j: number): number[] => [p[3 * i]! - p[3 * j]!, p[3 * i + 1]! - p[3 * j + 1]!, p[3 * i + 2]! - p[3 * j + 2]!];
  const du = sub(1, 0).map((v, k) => v + sub(3, 2)[k]!);
  const dv = sub(2, 0).map((v, k) => v + sub(3, 1)[k]!);
  let nx = du[1]! * dv[2]! - du[2]! * dv[1]!;
  let ny = du[2]! * dv[0]! - du[0]! * dv[2]!;
  let nz = du[0]! * dv[1]! - du[1]! * dv[0]!;
  const mx = (p[0]! + p[3]! + p[6]! + p[9]!) / 4 - cx;
  const my = (p[1]! + p[4]! + p[7]! + p[10]!) / 4 - cy;
  const mz = (p[2]! + p[5]! + p[8]! + p[11]!) / 4 - cz;
  if (nx * mx + ny * my + nz * mz < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

/** Which way round a cell's corners go on its drawing, as against round the garment: the sign that decides whether its map mirrors the drawing. */
function winding(c: Cell): number {
  const t = (c.tex[2]! - c.tex[0]!) * (c.tex[5]! - c.tex[1]!) - (c.tex[4]! - c.tex[0]!) * (c.tex[3]! - c.tex[1]!);
  const e = [1, 2].map((k) => [c.p[3 * k]! - c.p[0]!, c.p[3 * k + 1]! - c.p[1]!, c.p[3 * k + 2]! - c.p[2]!]) as [number[], number[]];
  const cross = [e[0][1]! * e[1][2]! - e[0][2]! * e[1][1]!, e[0][2]! * e[1][0]! - e[0][0]! * e[1][2]!, e[0][0]! * e[1][1]! - e[0][1]! * e[1][0]!];
  return Math.sign(t) * Math.sign(cross[0]! * c.n[0] + cross[1]! * c.n[1] + cross[2]! * c.n[2]);
}

/**
 * The middle a cell's outward side is judged from. A body is round about its own axis, but a row that has gone over to two lobes (trousers)
 * is round about the middle of each lobe, so a cell on the inner side of a lobe, by the cleft, faces sideways into it and not forward: judged
 * from the body's axis it came out facing the wrong way and showed its inside (a dark wedge between the legs).
 */
function lobeCentre(d: VolumeDesc, j: number, p: readonly number[]): number {
  if (d.lobes === undefined) return 0;
  const w = ((d.lobes[j] ?? 0) + (d.lobes[j + 1] ?? 0)) / 2;
  if (w <= 0) return 0;
  const x = (p[0]! + p[3]! + p[6]! + p[9]!) / 4;
  const a = ((d.a[j] as number) + (d.a[j + 1] as number)) / 2;
  return Math.sign(x) * (a / 2) * w;
}

/** Every cell of the garment. */
export function cellsOf(d: VolumeDesc): Cell[] {
  const cells: Cell[] = [];
  const tAt = (i: number, n: number): number => rad(-90 + (180 * i) / n);
  for (const back of [false, true]) {
    const sg = back ? -1 : 1;
    for (let j = 0; j + 1 < d.y.length; j++) {
      for (let i = 0; i < d.nt; i++) {
        const tex: number[] = [];
        const p: number[] = [];
        for (const [jj, ii] of [[j, i], [j, i + 1], [j + 1, i], [j + 1, i + 1]] as const) {
          const t = tAt(ii, d.nt);
          const halfW = texHalf(d, jj);
          tex.push(100 + halfW * Math.sin(t), d.y[jj] as number);
          p.push(sg * (d.a[jj] as number) * Math.sin(t), d.y[jj] as number, sg * zAt(d, jj, t));
        }
        cells.push(...split(back ? 3 : 0, back, tex, p, normalOf(p, lobeCentre(d, j, p), (d.y[j]! + d.y[j + 1]!) / 2, 0)));
      }
    }
  }
  // A wall at each side, from the front half's edge down to z = 0 and from there to the back.
  // The two halves no longer meet as a line: a side or three-quarter view is cloth, and a stripe
  // at the drawing's own edge wraps around it.
  for (let j = 0; j + 1 < d.y.length; j++) {
    const y0 = d.y[j] as number;
    const y1 = d.y[j + 1] as number;
    const cy = (y0 + y1) / 2;
    for (const left of [true, false]) {
      const s = left ? -1 : 1;
      const a0 = d.a[j] as number;
      const a1 = d.a[j + 1] as number;
      const z0 = wallOf(d, j);
      const z1 = wallOf(d, j + 1);
      const w0 = texHalf(d, j) + EDGE;
      const w1 = texHalf(d, j + 1) + EDGE;
      const inner = d.tank ? 4 : 2.2;
      const outer = d.tank ? 2.4 : EDGE;
      for (const back of [false, true]) {
        const sg = back ? -1 : 1;
        const tex: number[] = [];
        const p: number[] = [];
        for (const c of [
          { inset: inner, z: z0, x: s * a0, y: y0, w: w0 },
          { inset: outer, z: -OVERLAP * z0, x: s * a0, y: y0, w: w0 },
          { inset: inner, z: z1, x: s * a1, y: y1, w: w1 },
          { inset: outer, z: -OVERLAP * z1, x: s * a1, y: y1, w: w1 },
        ]) {
          tex.push(100 + (back ? -s : s) * (c.w - c.inset), c.y);
          p.push(c.x, c.y, sg * c.z);
        }
        cells.push(...split(back ? 3 : 0, back, tex, p, normalOf(p, 0, cy, 0)));
      }
    }
  }
  for (const [si, sleeve] of d.sl.entries()) {
    const g = (si + 1) as 1 | 2;
    const q = sleeve.q;
    const S = [q[0], q[1]] as const;
    const P = [q[2], q[3]] as const;
    const Q = [q[6], q[7]] as const;
    for (const back of [false, true]) {
      const tube = cells.length;
      for (let k = 0; k < d.nf; k++) {
        for (let i = 0; i < d.nh; i++) {
          const tex: number[] = [];
          const p: number[] = [];
          const at = (f: number, th: number): void => {
            const [o, inn] = sleeveAt(q, sleeve.c, f);
            const wx = inn[0] - o[0];
            const wy = inn[1] - o[1];
            const w = Math.hypot(wx, wy) || 1;
            const rr = w / 2;
            const u = 0.5 + 0.5 * Math.sin(th);
            const tx = o[0] + u * wx;
            const ty = o[1] + u * wy;
            tex.push(back ? 200 - tx : tx, ty);
            const cx = (o[0] + inn[0]) / 2 - 100 + (rr * Math.sin(th) * wx) / w;
            const cy = (o[1] + inn[1]) / 2 + (rr * Math.sin(th) * wy) / w;
            p.push(cx, cy, (back ? -1 : 1) * softMax((d.tube ?? SLEEVE_DEPTH) * rr, headDepth(d, sleeve, (o[1] + inn[1]) / 2)) * Math.cos(th));
          };
          const f0 = k / d.nf;
          const f1 = (k + 1) / d.nf;
          const t0 = tAt(i, d.nh);
          const t1 = tAt(i + 1, d.nh);
          at(f0, t0);
          at(f0, t1);
          at(f1, t0);
          at(f1, t1);
          const fc = (f0 + f1) / 2;
          const [o, inn] = sleeveAt(q, sleeve.c, fc);
          const n = normalOf(p, (o[0] + inn[0]) / 2 - 100, (o[1] + inn[1]) / 2, 0);
          cells.push(...split(g, back, tex, p, n));
        }
      }
      // The end of the tube is open: a rim as thick as the hem (a ring facing along the sleeve), then the inside of the tube going in (its cloth seen from within, darker),
      // and at the bottom of it a lining that closes it, so a side view never looks up an empty tube and a view into the cuff sees a hollow.
      const ringAt = (f: number, th: number, rs = 1): { tex: number[]; p: number[] } => {
        const [o, inn] = sleeveAt(q, sleeve.c, f);
        const wx = inn[0] - o[0];
        const wy = inn[1] - o[1];
        const w = Math.hypot(wx, wy) || 1;
        const u = 0.5 + 0.5 * Math.sin(th) * rs;
        const tx = o[0] + u * wx;
        const r = (w / 2) * Math.sin(th) * rs;
        return { tex: [back ? 200 - tx : tx, o[1] + u * wy], p: [(o[0] + inn[0]) / 2 - 100 + (r * wx) / w, (o[1] + inn[1]) / 2 + (r * wy) / w, (back ? -1 : 1) * (d.tube ?? SLEEVE_DEPTH) * (w / 2) * rs * Math.cos(th)] };
      };
      const ref = cells[tube] as Cell;
      const [oHem, iHem] = sleeveAt(q, sleeve.c, 1);
      const bore = Math.hypot(iHem[0] - oHem[0], iHem[1] - oHem[1]) || 1;
      // The hem is about 4 mm thick (1 unit), the inside goes in 14 units.
      const RS = Math.max(0.6, 1 - HEM_THICK / (bore / 2));
      const fIn = 1 - Math.min(0.9, DEPTH_IN / (Math.hypot(P[0] - S[0], P[1] - S[1]) || 1));
      const hem = ringAt(1, 0);
      const bottom = ringAt(fIn, 0, RS);
      let nx = P[1] - Q[1];
      let ny = Q[0] - P[0];
      if (nx * (P[0] - S[0]) + ny * (P[1] - S[1]) < 0) {
        nx = -nx;
        ny = -ny;
      }
      const nl = Math.hypot(nx, ny) || 1;
      const out: [number, number, number] = [nx / nl, ny / nl, 0];
      const inward: [number, number, number] = [-out[0], -out[1], 0];
      const keep = (cell: Cell): Cell => (winding(cell) === winding(ref) ? cell : { ...cell, tex: cell.tex.map((t, k) => (k % 2 === 0 ? 2 * (hem.tex[0] as number) - t : t)) });
      const inside: Cell[] = [];
      for (let i = 0; i < d.nh; i++) {
        const t0 = tAt(i, d.nh);
        const t1 = tAt(i + 1, d.nh);
        const o0 = ringAt(1, t0);
        const o1 = ringAt(1, t1);
        // The inside edge of the rim samples the cloth a little above the hem, so that a rim triangle has an area on the drawing.
        const e0 = { ...ringAt(1, t0, RS), tex: ringAt(1 - TEX_UP, t0, RS).tex };
        const e1 = { ...ringAt(1, t1, RS), tex: ringAt(1 - TEX_UP, t1, RS).tex };
        const b0 = ringAt(fIn, t0, RS);
        const b1 = ringAt(fIn, t1, RS);
        // The rim: between the outside and the inside edge of the hem, facing out along the sleeve.
        inside.push(keep({ g, back, tex: [...o0.tex, ...o1.tex, ...e0.tex], p: [...o0.p, ...o1.p, ...e0.p], n: out }), keep({ g, back, tex: [...o1.tex, ...e1.tex, ...e0.tex], p: [...o1.p, ...e1.p, ...e0.p], n: out }));
        // The inside of the tube: from the rim in to the bottom, its cloth facing the axis, in shade.
        const wall = normalOf([...e0.p, ...e1.p, ...b0.p, ...b1.p], (hem.p[0] as number), (hem.p[1] as number), 0);
        const toward: [number, number, number] = [-wall[0], -wall[1], -wall[2]];
        inside.push(
          { ...keep({ g, back, tex: [...e0.tex, ...e1.tex, ...b0.tex], p: [...e0.p, ...e1.p, ...b0.p], n: toward }), inside: true },
          { ...keep({ g, back, tex: [...e1.tex, ...b1.tex, ...b0.tex], p: [...e1.p, ...b1.p, ...b0.p], n: toward }), inside: true },
        );
        // The bottom: a lining closing the inside, a fan from the middle of the tube, facing the opening.
        inside.push({ ...keep({ g, back, tex: [...ringAt(fIn - TEX_UP, 0, RS).tex, ...b0.tex, ...b1.tex], p: [bottom.p[0] as number, bottom.p[1] as number, 0, ...b0.p, ...b1.p], n: out }), inside: true });
      }
      void inward;
      // The inside is drawn before the sleeve's outside, so the near wall of the sleeve covers the far inside where it should.
      cells.splice(tube, 0, ...inside);
    }
  }
  // What the sleeves carry: a small grid over the arm's surface, each cell of the thing's own drawing.
  d.sd.forEach((e, k) => {
    const q = (d.sl[e.g - 1] as VolumeDesc["sl"][number]).q;
    const S = [q[0], q[1]] as const;
    const P = [q[2], q[3]] as const;
    const A = [q[4], q[5]] as const;
    const Q = [q[6], q[7]] as const;
    const length = Math.hypot(P[0] - S[0], P[1] - S[1]);
    const ring = (f: number): { cx: number; cy: number; r: number; vx: number; vy: number } => {
      const o = lerp2(S, P, f);
      const inn = lerp2(A, Q, f);
      const w = Math.hypot(inn[0] - o[0], inn[1] - o[1]) || 1;
      return { cx: (o[0] + inn[0]) / 2 - 100, cy: (o[1] + inn[1]) / 2, r: w / 2, vx: (inn[0] - o[0]) / w, vy: (inn[1] - o[1]) / w };
    };
    const rc = ring(e.f).r;
    const nc = 4;
    const nr = 3;
    for (let k2 = 0; k2 < nr; k2++) {
      for (let i = 0; i < nc; i++) {
        const tex: number[] = [];
        const p: number[] = [];
        for (const [kk, ii] of [[k2, i], [k2, i + 1], [k2 + 1, i], [k2 + 1, i + 1]] as const) {
          const f = e.f - e.df + (2 * e.df * kk) / nr;
          const psi = e.a + e.da * (-1 + (2 * ii) / nc);
          const t = ring(f);
          tex.push(e.dir * rc * rad(psi - e.a), (f - e.f) * length);
          p.push(t.cx + t.r * Math.sin(rad(psi)) * t.vx, t.cy + t.r * Math.sin(rad(psi)) * t.vy, SLEEVE_DEPTH * t.r * Math.cos(rad(psi)));
        }
        const mid = ring(e.f);
        cells.push(...split(e.g, false, tex, p, normalOf(p, mid.cx, mid.cy, 0), k));
      }
    }
  });
  return cells;
}

/** A point turned by `yaw` about the vertical and tipped by `pitch`: the picture's x and y, and the way it faces the viewer. */
export function turn(x: number, y: number, z: number, cy: number, sy: number, cp: number, sp: number): [number, number, number] {
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  return [x1, y * cp + z1 * sp, z1 * cp - y * sp];
}

/** Light from above, to the left and in front, as a unit vector (y is down). */
export const LIGHT: readonly [number, number, number] = [-0.4, -0.5, 0.77];

export interface Placed {
  visible: boolean;
  matrix: string;
  /** The black laid over the cell, 0 to about 0.4. */
  shade: number;
  /** How near the cell's middle is to the viewer. */
  depth: number;
  /** The cell's `layer`, if it has one. */
  layer?: number;
  /** Where the cell's three corners are once turned: x, y and nearness for each, for ordering a band whose cells overlap. */
  tri?: number[];
}

/** How far past side on a cell's second way (`Cell.also`) may turn and still be seen: a knot just round the side still stands clear of the body. */
const ALSO = -0.08;

/**
 * Where one cell goes at one turn. `exact` ignores the cell's second way of facing (`Cell.also`): a painter that judges a cell against the body
 * behind it pixel by pixel (the graphics card's depth test) needs no whole-cell guess at what the body hides.
 */
export function placeCell(c: Cell, yaw: number, pitch: number, exact = false): Placed {
  const cy = Math.cos(rad(yaw));
  const sy = Math.sin(rad(yaw));
  const cp = Math.cos(rad(pitch));
  const sp = Math.sin(rad(pitch));
  const s: number[] = [];
  const tri: number[] = [];
  let z = 0;
  for (let k = 0; k < 3; k++) {
    const t = turn(c.p[3 * k] as number, c.p[3 * k + 1] as number, c.p[3 * k + 2] as number, cy, sy, cp, sp);
    s.push(t[0] + 100, t[1]);
    tri.push(t[0] + 100, t[1], t[2]);
    z += t[2];
  }
  const nn = turn(c.n[0], c.n[1], c.n[2], cy, sy, cp, sp);
  const facing = nn[2];
  if (facing <= 0.01 || (!exact && c.also !== undefined && turn(c.also[0], c.also[1], c.also[2], cy, sy, cp, sp)[2] < ALSO)) return { visible: false, matrix: "", shade: 0, depth: z / 3, ...(c.layer === undefined ? {} : { layer: c.layer }) };
  const T = c.tex;
  const t1x = T[2]! - T[0]!;
  const t1y = T[3]! - T[1]!;
  const t2x = T[4]! - T[0]!;
  const t2y = T[5]! - T[1]!;
  const det = t1x * t2y - t2x * t1y;
  if (Math.abs(det) < 1e-6) return { visible: false, matrix: "", shade: 0, depth: z / 3 };
  const s1x = s[2]! - s[0]!;
  const s1y = s[3]! - s[1]!;
  const s2x = s[4]! - s[0]!;
  const s2y = s[5]! - s[1]!;
  // M = [s1 s2] [t1 t2]^-1
  const a = (s1x * t2y - s2x * t1y) / det;
  const c2 = (-s1x * t2x + s2x * t1x) / det;
  const b = (s1y * t2y - s2y * t1y) / det;
  const d = (-s1y * t2x + s2y * t1x) / det;
  const e = s[0]! - (a * T[0]! + c2 * T[1]!);
  const f = s[1]! - (b * T[0]! + d * T[1]!);
  const lit = nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2];
  const shade = Math.max(0, Math.min(0.45, (1 - lit) * 0.24));
  return { visible: true, matrix: `matrix(${n4(a)} ${n4(b)} ${n4(c2)} ${n4(d)} ${n2(e)} ${n2(f)})`, shade: Math.round(shade * 100) / 100, depth: z / 3, tri, ...(c.layer === undefined ? {} : { layer: c.layer }) };
}

/** Which side's sleeve is nearer the viewer at this turn: -1 for the picture's left sleeve, 1 for the right, 0 when neither (face on or from behind). */
export function nearSleeve(yaw: number): -1 | 0 | 1 {
  const s = Math.sin(rad(yaw));
  return Math.abs(s) < 0.02 ? 0 : s > 0 ? -1 : 1;
}

/** The order the groups of cells are drawn in, farthest first: the sleeve that is behind the body, the half of the body that is behind, the half in front, the sleeve in front. Legs (`hang`) both come before the body. */
export function groupOrder(yaw: number, hang = false): number[] {
  const torso = Math.cos(rad(yaw)) >= 0 ? [3, 0] : [0, 3];
  const tubes = nearSleeve(yaw) === -1 ? [2, 1] : [1, 2];
  return hang ? [...tubes, ...torso] : [tubes[0] as number, ...torso, tubes[1] as number];
}

/** How far the cells of a folded belt or a box are grown at their corners (units of the picture): less than cloth's, which sticks out as spikes round a fold. */
export const SOLID_GROW = 0.25;

/** The triangle of a cell, grown a little on every side so neighbouring cells overlap and no hairline shows between them. */
export function quadPath(tex: readonly number[], g = 0.9): string {
  const cx = (tex[0]! + tex[2]! + tex[4]!) / 3;
  const cy = (tex[1]! + tex[3]! + tex[5]!) / 3;
  let d = "";
  for (let k = 0; k < 3; k++) {
    const x = tex[2 * k] as number;
    const y = tex[2 * k + 1] as number;
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    d += `${k === 0 ? "M" : "L"}${n2(x + (dx / len) * g)} ${n2(y + (dy / len) * g)}`;
  }
  return `${d}Z`;
}

export interface VolumeMarkup {
  defs: string;
  body: string;
}

/**
 * The markup of the garment at one turn: a clip and a shape for each cell in the defs, and the cells themselves in three groups (the sleeve that is behind the body, the body, the sleeve in front),
 * each cell a use of the front's drawing (`frontId`) or the back's (`backId`) under its map, with the shade as a second shape on top.
 */
export function volumeMarkup(d: VolumeDesc, uid: string, frontId: string, backId: string, frontClip: string, backClip: string, yaw: number, shaded: boolean, details: readonly string[] = []): VolumeMarkup {
  const cells = cellsOf(d);
  let defs = details.map((svg, k) => `<g id="${uid}D${k}">${svg}</g>`).join("");
  const groups: [string, string, string, string] = ["", "", "", ""];
  cells.forEach((c, i) => {
    defs += `<path id="${uid}q${i}" d="${quadPath(c.tex, d.solid === undefined ? undefined : SOLID_GROW)}"/><clipPath id="${uid}k${i}"><use href="#${uid}q${i}"/></clipPath>`;
    const pl = placeCell(c, yaw, d.pitch);
    const shadeEl = shaded && c.src === undefined ? `<use href="#${uid}q${i}" fill="#000" fill-opacity="${pl.shade}" clip-path="url(#${c.back ? backClip : frontClip})" data-vs=""/>` : "";
    groups[c.g] += `<g data-vc="${i}"${pl.visible ? ` transform="${pl.matrix}"` : ' display="none"'} clip-path="url(#${uid}k${i})"><use href="#${c.src !== undefined ? `${uid}D${c.src}` : c.back ? backId : frontId}"/>${shadeEl}</g>`;
  });
  const body = groupOrder(yaw).map((g) => `<g data-vol="${g}">${groups[g as 0 | 1 | 2 | 3]}</g>`).join("");
  return { defs, body };
}

interface Held {
  desc: VolumeDesc;
  cells: Cell[];
  nodes: Element[];
  shades: (Element | null)[];
  groups: Element[];
}
const held = new WeakMap<Element, Held>();

function holdOf(svg: Element): Held | undefined {
  const known = held.get(svg);
  if (known !== undefined) return known;
  const raw = svg.getAttribute("data-vol");
  if (raw === null) return undefined;
  let desc: VolumeDesc;
  try {
    desc = JSON.parse(raw) as VolumeDesc;
  } catch {
    return undefined;
  }
  // The cells are in their groups, so in the document's order they are not in the order of `cells`: each says which it is.
  const nodes: Element[] = [];
  svg.querySelectorAll("[data-vc]").forEach((n) => {
    nodes[Number(n.getAttribute("data-vc"))] = n;
  });
  const groups: Element[] = [];
  svg.querySelectorAll("[data-vol]").forEach((g) => {
    if (g !== svg) groups[Number(g.getAttribute("data-vol"))] = g;
  });
  const entry: Held = { desc, cells: cellsOf(desc), nodes, shades: nodes.map((n) => n.querySelector("[data-vs]")), groups };
  held.set(svg, entry);
  return entry;
}

/** Move a garment made by `volumeMarkup` to another turn: the maps, which cells show, the shade, and which sleeve is in front. Returns false when `svg` is not one. */
export function applyVolume(svg: Element, yaw: number): boolean {
  const h = holdOf(svg);
  if (h === undefined) return false;
  h.cells.forEach((c, i) => {
    const node = h.nodes[i];
    if (node === undefined) return;
    const pl = placeCell(c, yaw, h.desc.pitch);
    if (pl.visible) {
      node.setAttribute("transform", pl.matrix);
      node.removeAttribute("display");
      h.shades[i]?.setAttribute("fill-opacity", String(pl.shade));
    } else node.setAttribute("display", "none");
  });
  const parent = h.groups[0]?.parentNode;
  if (parent !== null && parent !== undefined) for (const g of groupOrder(yaw)) if (h.groups[g] !== undefined) parent.appendChild(h.groups[g] as Element);
  return true;
}
