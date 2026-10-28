// A belt folded flat into a bundle, as a shop shows it, and the gift boxes a belt comes in: a long kiri (paulownia) wood box with a slide-on lid engraved
// 御帯 (o-obi, "belt", honorific), and a silver cardboard box with a white label strip. All of it is one piece of the turning view: a scene of small textured
// quadrilaterals (cells), the belt's own face strip wrapped on the folded belt (judogiStrap.ts's `strapFace`, so colour, kohaku panels, rows, marks and widths carry over),
// the boxes' faces on regions of the same picture (beltBoxFace.ts). The numbers here are centimetres until the very end, where a centimetre becomes `UNITS_PER_CM` units.
// Box sizes, the 7 x 7 cm kiri and the 5 cm silver widths are from KuSakura's gift-box pages (read 2026-10-28; see docs/judogi.md); the box length per size is derived here.

import { BACK_Y, EDGE1_Y, EDGE_H, END_X, FACE_Y, quad, UNITS_PER_CM } from "./judogiStrap.ts";
import type { Cell } from "./volume.ts";

type Vec = [number, number, number];

export const BOX_TYPES = ["kiri", "silver"] as const;
export type BoxType = (typeof BOX_TYPES)[number];
/** `closed`: the lid on; `open`: the lid beside it (the silver one lying across it) and the belt in it; `empty`: the lid off and nothing in it. */
export const BOX_STATES = ["closed", "open", "empty"] as const;
export type BoxState = (typeof BOX_STATES)[number];
/** The tone of the wood: pale, natural kiri, and an aged honey. */
export const KIRI_WOODS = ["light", "natural", "honey"] as const;
export type KiriWood = (typeof KIRI_WOODS)[number];
/** The words on the lid: o-obi, "belt" (honorific). */
export const BOX_TEXT_DEFAULT = "御帯";
export const BOX_SIZES = [2, 3, 4, 5, 6] as const;
export type BoxSize = (typeof BOX_SIZES)[number];

/** How many layers the folded belt is doubled into: fixed, so a box's length follows from the longest belt it holds. */
export const FOLD_LAYERS = 7;
/** Room left at each end of the box, in centimetres. */
export const BOX_SLACK_CM = 2.5;

/** The length of a belt by its size number, as the maker's product pages list it: size 2 is 230 cm and every half size 10 cm more, to size 8 at 350 cm. */
export const beltCmOfSize = (size: number): number => Math.round(230 + (size - 2) * 20);

/** The largest belt each box size holds (the maker's box menu: box 2 takes belts up to 2.5, box 3 up to 3.5, box 4 up to 4.5, box 5 size 5, box 6 up to 6.5). */
export const BOX_TAKES: Record<BoxSize, number> = { 2: 2.5, 3: 3.5, 4: 4.5, 5: 5, 6: 6.5 };
/** The largest belt a box of each kind is sold for: the wooden box fits a belt of size 6 at most, the silver one 6.5. */
export const BOX_MAX_BELT: Record<BoxType, number> = { kiri: 6, silver: 6.5 };

/** The box size for a belt size, or undefined when no box of that kind holds it (a belt longer than the maker's boxes). */
export function boxSizeFor(beltSize: number, type: BoxType = "kiri"): BoxSize | undefined {
  if (!(beltSize > 0) || beltSize > BOX_MAX_BELT[type]) return undefined;
  return BOX_SIZES.find((s) => beltSize <= BOX_TAKES[s]);
}

/** The inside length of a box of this size: the folded length of the longest belt it takes, and a little room at each end. */
export const boxInnerCm = (size: BoxSize): number => Math.round((beltCmOfSize(BOX_TAKES[size]) / FOLD_LAYERS + 2 * BOX_SLACK_CM) * 10) / 10;

/** The figures of a box, in centimetres. */
export interface BoxDims {
  type: BoxType;
  /** Outer width and height of the closed box. */
  w: number;
  h: number;
  /** Inside length, outside length and wall thickness. */
  inner: number;
  length: number;
  wall: number;
  /** The lid: kiri a slab sliding in the walls' grooves, silver a cap over the base. */
  lid: number;
  /** The base's own outer width and height (the silver base is smaller than the closed box, the kiri tray is as wide). */
  baseW: number;
  baseH: number;
}

/** The figures of a box of `size` and `type`. Kiri: 7 cm wide and 7 cm high (the maker's page). Silver: 5 cm wide (the maker's page), about 4.6 cm high (read from the photograph). */
export function boxDims(size: BoxSize, type: BoxType): BoxDims {
  const inner = boxInnerCm(size);
  if (type === "kiri") return { type, w: 7, h: 7, inner, length: inner + 1.6, wall: 0.8, lid: 1, baseW: 7, baseH: 6 };
  return { type, w: 5.4, h: 4.6, inner, length: inner + 0.3, wall: 0.15, lid: 0.15, baseW: 5.1, baseH: 4.4 };
}

/** The widest belt a box holds, in centimetres (the inside width less a little play). */
export const boxBeltRoom = (d: BoxDims): number => Math.round((d.baseW - 2 * d.wall - 0.3) * 10) / 10;

/** The folded belt, in centimetres: the stack's lowest point `y` (down is positive), where its middle is, and what it is made of. */
export interface FoldDesc {
  /** The belt's whole length. */
  cm: number;
  /** Width, thickness of one turn, layers. */
  w: number;
  t: number;
  n: number;
  x: number;
  y: number;
  z: number;
  /** A paper band round the middle of the bundle (the shop's wrap), as its width along the bundle, or 0 for none. */
  band: number;
}

/** A box laid out in the scene: its figures, its state, and where the lid lies. */
export interface BoxScene {
  type: BoxType;
  state: BoxState;
  d: BoxDims;
  /** The tray's middle across, its bottom (down is positive `y`), where a lid that is off lies, and the turn of it about the vertical (degrees). */
  z: number;
  y: number;
  lidZ: number;
  lidRot: number;
}

/** What the solid piece draws: the box and/or the folded belt, and the base turn it is shown at (so that it lies at an angle, as in a photograph). */
export interface SolidDesc {
  /** Degrees about the vertical axis the whole scene is turned by before the viewer's own turn. */
  rot: number;
  belt?: FoldDesc;
  box?: BoxScene;
}

const U = UNITS_PER_CM;
/** Where the face picture's regions start, in its units: left edge and top (below the belt's own strips). */
const RX = -30;
const RY = 70;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The regions of the face picture the boxes and the band use, laid one below another. Sizes are in drawing units, one unit to 1/`UNITS_PER_CM` cm.
 * A face at the silhouette of a box has a region of exactly its own size: a cell is drawn a little grown at its corners, and where the picture ends the
 * grown part is clear, so the outline stays true and sprouts no spikes.
 */
export interface Regions {
  /** The lid's top, its two long sides and its end. */
  lidTop: Rect;
  lidLong: Rect;
  lidEnd: Rect;
  /** The tray or base: its long outer sides, its two ends (the silver base's first carries the product sticker), the tops of its walls. */
  baseLong: Rect;
  baseEnd: Rect;
  baseEnd2: Rect;
  rimLong: Rect;
  rimEnd: Rect;
  /** The inside of the tray and its floor, and of the lid. */
  inside: Rect;
  /** The paper band: its top, and a plain piece of its paper beside it. */
  band: Rect;
}

/** The length of the lid: the kiri slab is a little shorter than the tray, the silver cap a little shorter than the base so that the base's end shows. */
export const lidLength = (d: BoxDims): number => (d.type === "kiri" ? d.length - 0.4 : d.length - 1.6);

export function regionsOf(s: SolidDesc): Regions {
  const d = s.box?.d;
  const one = { u: 1 };
  void one;
  let y = RY;
  const take = (wcm: number, hcm: number): Rect => {
    const r = { x: RX, y, w: Math.max(1, wcm * U), h: Math.max(1, hcm * U) };
    y += r.h + 4;
    return r;
  };
  const kiri = d?.type === "kiri";
  const lidH = d === undefined ? 0 : kiri ? d.lid : d.h;
  return {
    lidTop: take(d === undefined ? 0 : lidLength(d), d?.w ?? 0),
    lidLong: take(d === undefined ? 0 : lidLength(d), lidH),
    lidEnd: take(d?.w ?? 0, lidH),
    baseLong: take(d?.length ?? 0, d?.baseH ?? 0),
    baseEnd: take(d?.baseW ?? 0, d?.baseH ?? 0),
    baseEnd2: take(d?.baseW ?? 0, d?.baseH ?? 0),
    rimLong: take(d?.length ?? 0, d?.wall ?? 0),
    rimEnd: take(d?.wall ?? 0, d === undefined ? 0 : d.baseW - 2 * d.wall),
    inside: take(d?.length ?? 0, d?.h ?? 0),
    band: take(s.belt === undefined ? 0 : s.belt.band * 2, s.belt === undefined ? 0 : s.belt.w + 0.8),
  };
}

// ---- cells ----

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (u: Vec, v: Vec): Vec => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const unit = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** A point turned about the vertical axis through `about` by `deg` degrees (the same sense as `turn` in volume.ts). */
function spin(deg: number, about: Vec = [0, 0, 0]): (p: Vec) => Vec {
  const c = Math.cos((deg * Math.PI) / 180);
  const s = Math.sin((deg * Math.PI) / 180);
  return (p) => {
    const x = p[0] - about[0];
    const z = p[2] - about[2];
    return [x * c + z * s + about[0], p[1], -x * s + z * c + about[2]];
  };
}

/** Collects cells, every point passed through a part's own placement and then the scene's base turn, and scaled to drawing units. */
class Sink {
  cells: Cell[] = [];
  private at: (p: Vec) => Vec = (p) => p;
  private readonly base: (p: Vec) => Vec;
  constructor(rot: number) {
    this.base = spin(rot);
  }
  place(at: (p: Vec) => Vec): void {
    this.at = at;
  }
  /** A point of the scene in drawing units. */
  wp(p: Vec): Vec {
    return scale(this.base(this.at(p)), U);
  }
  /** A direction of the scene as the drawing has it. */
  wn(n: Vec): Vec {
    const a = this.base(this.at([0, 0, 0]));
    const b = this.base(this.at(n));
    return unit(sub(b, a));
  }
  /** One cell between four points (tl, tr, bl, br) and the same four on the picture. */
  quad(c: [Vec, Vec, Vec, Vec], tex: [number, number][], out: Vec): void {
    this.cells.push(...quad(c.map((p) => this.wp(p)) as [Vec, Vec, Vec, Vec], tex, this.wn(out)));
  }
  /**
   * A rectangle seen from outside as a picture: `o` its top left, `u` the way the picture's x runs and `v` the way its y runs, so that u x v points out of the
   * surface (a picture read from outside is then never mirrored); cut into `nu` by `nv` cells, each showing its part of the region `r`.
   */
  face(o: Vec, u: Vec, v: Vec, nu: number, nv: number, r: Rect): void {
    const out = cross(u, v);
    for (let j = 0; j < nv; j++) {
      for (let i = 0; i < nu; i++) {
        const p = (a: number, b: number): Vec => add(o, add(scale(u, a / nu), scale(v, b / nv)));
        const t = (a: number, b: number): [number, number] => [r.x + (r.w * a) / nu, r.y + (r.h * b) / nv];
        this.quad([p(i, j), p(i + 1, j), p(i, j + 1), p(i + 1, j + 1)], [t(i, j), t(i + 1, j), t(i, j + 1), t(i + 1, j + 1)], out);
      }
    }
  }
  /** A box between the corners `lo` and `hi` (y down: `lo[1]` is its top), each face with its own region, or none to leave it out. */
  cuboid(lo: Vec, hi: Vec, r: Partial<Record<"top" | "bottom" | "front" | "back" | "left" | "right", Rect>>, per = 3): void {
    const [x0, y0, z0] = lo;
    const [x1, y1, z1] = hi;
    const L = x1 - x0;
    const H = y1 - y0;
    const W = z1 - z0;
    const nx = Math.max(1, Math.ceil(L / per));
    const nz = Math.max(1, Math.ceil(W / per));
    const ny = Math.max(1, Math.ceil(H / per));
    if (r.top) this.face([x0, y0, z0], [L, 0, 0], [0, 0, W], nx, nz, r.top);
    if (r.bottom) this.face([x0, y1, z1], [L, 0, 0], [0, 0, -W], nx, nz, r.bottom);
    if (r.front) this.face([x0, y0, z1], [L, 0, 0], [0, H, 0], nx, ny, r.front);
    if (r.back) this.face([x1, y0, z0], [-L, 0, 0], [0, H, 0], nx, ny, r.back);
    if (r.left) this.face([x0, y0, z0], [0, 0, W], [0, H, 0], nz, ny, r.left);
    if (r.right) this.face([x1, y0, z1], [0, 0, -W], [0, H, 0], nz, ny, r.right);
  }
}

/** A part of a region: `x` and `w` as parts of its width, `y` and `h` as parts of its height. */
const part = (r: Rect, x: number, y: number, w: number, h: number): Rect => ({ x: r.x + r.w * x, y: r.y + r.h * y, w: r.w * w, h: r.h * h });

/** Everything the solid piece shows, as cells. */
export function solidCells(s: SolidDesc): Cell[] {
  const sink = new Sink(s.rot);
  const reg = regionsOf(s);
  if (s.box !== undefined) boxCells(sink, s.box, reg);
  sink.place((p) => p);
  if (s.belt !== undefined) foldedCells(sink, s.belt, reg);
  return sink.cells;
}

// ---- the boxes ----

function boxCells(k: Sink, b: BoxScene, r: Regions): void {
  const d = b.d;
  const L = d.length;
  const x0 = -L / 2;
  const x1 = L / 2;
  const open = b.state !== "closed";
  const kiri = b.type === "kiri";
  const zLo = b.z - d.baseW / 2;
  const zHi = b.z + d.baseW / 2;
  const yBot = b.y;
  const yTop = yBot - d.baseH;
  k.place((p) => p);
  if (kiri) {
    k.cuboid([x0, yTop, zLo], [x1, yBot, zHi], { front: r.baseLong, back: r.baseLong, bottom: part(r.inside, 0, 0, 1, d.baseW / d.h), left: r.baseEnd, right: r.baseEnd2 });
  } else {
    // The silver base is white board, pushed into the lid when closed: only its end shows then.
    const stub = open ? L : 1.6;
    k.cuboid([x0, yTop, zLo], [x0 + stub, yBot, zHi], {
      top: open ? undefined : part(r.baseLong, 0, 0, stub / L, 1),
      front: part(r.baseLong, 0, 0, stub / L, 1),
      back: part(r.baseLong, 1 - stub / L, 0, stub / L, 1),
      bottom: part(r.inside, 0, 0, stub / L, d.baseW / d.h),
      left: r.baseEnd,
      right: open ? r.baseEnd2 : undefined,
    });
  }
  if (open) {
    const wl = d.wall;
    const yi = yBot - wl * (kiri ? 1 : 0.6);
    const ix0 = x0 + wl;
    const ix1 = x1 - wl;
    const iz0 = zLo + wl;
    const iz1 = zHi - wl;
    const h = yi - yTop;
    const dx = ix1 - ix0;
    const dz = iz1 - iz0;
    const nx = Math.ceil(dx / 3);
    const ny = Math.max(1, Math.ceil(h / 3));
    const plain = (w: number, hh: number): Rect => part(r.inside, 0, 0, w / L, hh / d.h);
    // The floor, the four inner walls (each seen from inside), the tops of the walls.
    k.face([ix0, yi, iz0], [dx, 0, 0], [0, 0, dz], nx, Math.ceil(dz / 3), plain(dx, dz));
    k.face([ix0, yTop, iz0], [dx, 0, 0], [0, h, 0], nx, ny, plain(dx, h));
    k.face([ix1, yTop, iz1], [-dx, 0, 0], [0, h, 0], nx, ny, plain(dx, h));
    k.face([ix0, yTop, iz1], [0, 0, -dz], [0, h, 0], 2, ny, plain(dz, h));
    k.face([ix1, yTop, iz0], [0, 0, dz], [0, h, 0], 2, ny, plain(dz, h));
    k.face([x0, yTop, zLo], [L, 0, 0], [0, 0, wl], Math.ceil(L / 6), 1, r.rimLong);
    k.face([x0, yTop, zHi - wl], [L, 0, 0], [0, 0, wl], Math.ceil(L / 6), 1, r.rimLong);
    k.face([x0, yTop, zLo + wl], [wl, 0, 0], [0, 0, d.baseW - 2 * wl], 1, 1, r.rimEnd);
    k.face([x1 - wl, yTop, zLo + wl], [wl, 0, 0], [0, 0, d.baseW - 2 * wl], 1, 1, r.rimEnd);
  }
  lidCells(k, b, r);
}

function lidCells(k: Sink, b: BoxScene, r: Regions): void {
  const d = b.d;
  if (b.state === "empty") return;
  const closed = b.state === "closed";
  const L = lidLength(d);
  const yTop = b.y - d.baseH;
  if (d.type === "kiri") {
    // The slab lies in the walls' grooves, or on the table beside the tray; the engraving shows on its top either way.
    const zc = closed ? b.z : b.lidZ;
    const yb = closed ? yTop + d.lid * 0.45 : b.y;
    k.place(closed ? (p) => p : spin(b.lidRot, [0, 0, zc]));
    k.cuboid([-L / 2, yb - d.lid, zc - d.w / 2], [L / 2, yb, zc + d.w / 2], {
      top: r.lidTop,
      front: r.lidLong,
      back: r.lidLong,
      left: r.lidEnd,
      right: r.lidEnd,
      bottom: closed ? undefined : part(r.inside, 0, 0, L / d.length, d.w / d.h),
    });
    return;
  }
  // The silver lid: a cap with a top, two sides and a closed end, white board inside. Closed, it sits over the base with the base's end showing; open, it lies across the base.
  const w = d.w;
  const h = d.h;
  const wl = d.wall;
  const zc = b.z;
  const x0 = closed ? -d.length / 2 + 1.6 : -L / 2;
  const yb = closed ? b.y + (d.h - d.baseH) * 0.5 : yTop - 0.05;
  const yt = yb - h;
  k.place(closed ? (p) => p : spin(b.lidRot, [0, 0, zc]));
  k.cuboid([x0, yt, zc - w / 2], [x0 + L, yb, zc + w / 2], { top: r.lidTop, front: r.lidLong, back: r.lidLong, right: r.lidEnd });
  // Looking into the open end: the board's inside.
  const iw = w - 2 * wl;
  const ih = h - wl;
  const inner = (len: number, other: number): Rect => part(r.inside, 0, 0, len / d.length, other / d.h);
  k.face([x0, yt + wl, zc - w / 2 + wl], [L, 0, 0], [0, 0, iw], Math.ceil(L / 3), 2, inner(L, iw));
  k.face([x0, yt + wl, zc + w / 2 - wl], [L, 0, 0], [0, ih, 0], Math.ceil(L / 3), 2, inner(L, ih));
  k.face([x0 + L, yt + wl, zc - w / 2 + wl], [-L, 0, 0], [0, ih, 0], Math.ceil(L / 3), 2, inner(L, ih));
}

// ---- the folded belt ----

/** One sample of the belt's path: a point, the direction the belt runs, the way its face looks, and how far along the belt it is (centimetres). */
export interface Along {
  p: Vec;
  d: Vec;
  out: Vec;
  u: number;
  /** How much of the belt's thickness it has here, 0 to 1: a tight fold is thinner at its turn, or its inside would turn inside out. */
  k?: number;
}

/** How long the hanging end's marks are laid out along, in drawing units (the same end the tied belt hangs). */
const END_LEN = 64;
/** Where the belt's plain stretch is laid on its strip, and after what length it repeats (a kohaku belt's panels). */
const X0 = -30;
const PERIOD = 80;

/**
 * The belt's path in the scene: its layers from the bottom one (free end B, on the right) up to the top one (free end A, on the left, face up), joined by folds,
 * the belt's own length along it. A belt is doubled back on itself `n` times; the bottom layer is a little longer so that its end shows beyond the stack.
 */
export function foldPath(f: FoldDesc): { points: Along[]; length: number; extent: [number, number] } {
  const n = f.n;
  const pitch = f.t + 0.03;
  const bulge = 1.15 * pitch;
  const arc = Math.PI * Math.sqrt((pitch * pitch / 4 + bulge * bulge) / 2);
  const total = f.cm - (n - 1) * arc;
  const base = total / n;
  const ext = Math.min(2.2, base / 6);
  const jit = [0, 0.35, -0.25, 0.4, -0.3, 0.2, -0.15, 0.3];
  const len = Array.from({ length: n }, (_, i) => (i === 0 ? base + ext : base - ext / (n - 1)) + (jit[i % jit.length] ?? 0));
  len[n - 1] = (len[n - 1] as number) - (len.reduce((a, c) => a + c, 0) - total);
  const xs: number[] = [];
  const xe: number[] = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    xs.push(x);
    x += (i % 2 === 0 ? -1 : 1) * (len[i] as number);
    xe.push(x);
  }
  const lo = Math.min(...xs, ...xe) - bulge;
  const hi = Math.max(...xs, ...xe) + bulge;
  const shift = f.x - (lo + hi) / 2;
  const yAt = (i: number): number => f.y - (i + 0.5) * pitch;
  const pts: Along[] = [];
  let u = 0;
  const push = (p: Vec, d: Vec, out: Vec, k = 1): void => {
    const last = pts[pts.length - 1];
    if (last !== undefined) u += Math.hypot(p[0] - last.p[0], p[1] - last.p[1], p[2] - last.p[2]);
    pts.push({ p, d, out, u, k });
  };
  for (let i = 0; i < n; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const a = (xs[i] as number) + shift;
    const b = (xe[i] as number) + shift;
    const y = yAt(i);
    const z = f.z + (((i * 37) % 5) - 2) * 0.02;
    const nn = Math.max(2, Math.ceil(Math.abs(b - a) / 2.4));
    for (let j = 0; j <= nn; j++) push([lerp(a, b, j / nn), y, z], [dir, 0, 0], [0, i % 2 === 0 ? -1 : 1, 0]);
    if (i < n - 1) {
      const left = i % 2 === 0;
      const yc = (yAt(i) + yAt(i + 1)) / 2;
      const zn = f.z + ((((i + 1) * 37) % 5) - 2) * 0.02;
      const m = 6;
      for (let j = 1; j < m; j++) {
        const th = (Math.PI * j) / m;
        const sgn = left ? -1 : 1;
        const dx = sgn * Math.cos(th) * bulge;
        const dy = -Math.sin(th) * (yAt(i) - yc);
        const dl = Math.hypot(dx, dy) || 1;
        // The face looks to the right of the way the belt runs (the same side all along it).
        push([b + sgn * Math.sin(th) * bulge, yc + Math.cos(th) * (yAt(i) - yc), lerp(z, zn, j / m)], [dx / dl, dy / dl, 0], [-dy / dl, dx / dl, 0], 1 - 0.5 * Math.sin(th));
      }
    }
  }
  return { points: pts, length: u, extent: [lo + shift, hi + shift] };
}

/** The strip's x for a place `u` centimetres along a belt `total` long, and which way x runs there (+1 with the belt, -1 against it). */
function stripX(u: number, total: number): { x: number; dir: 1 | -1 } {
  const uu = u * U;
  const tot = total * U;
  if (uu < END_LEN) return { x: (END_X[1] as number) + END_LEN - uu, dir: -1 };
  if (tot - uu < END_LEN) return { x: (END_X[0] as number) + (uu - (tot - END_LEN)), dir: 1 };
  if (u < total / 2) return { x: (END_X[1] as number) - ((uu - END_LEN) % PERIOD), dir: -1 };
  return { x: X0 + (uu % PERIOD), dir: 1 };
}

function foldedCells(k: Sink, f: FoldDesc, r: Regions): void {
  const { points, length } = foldPath(f);
  const hw = f.w / 2;
  // The strip's places where its look changes (where a free end's marks end, and the middle) fall between cells: a step is cut there.
  const cuts = [END_LEN / U, length - END_LEN / U, length / 2];
  for (let i = 0; i + 1 < points.length; i++) {
    let a = points[i] as Along;
    const b = points[i + 1] as Along;
    for (const c of cuts.filter((q) => q > a.u + 1e-6 && q < b.u - 1e-6).sort((p, q) => p - q)) {
      const q = (c - a.u) / (b.u - a.u);
      const mid: Along = { p: [lerp(a.p[0], b.p[0], q), lerp(a.p[1], b.p[1], q), lerp(a.p[2], b.p[2], q)], d: a.d, out: a.out, u: c, k: a.k ?? 1 };
      step(k, a, mid, hw, f.t, length);
      a = mid;
    }
    step(k, a, b, hw, f.t, length);
  }
  const first = points[0] as Along;
  const last = points[points.length - 1] as Along;
  endCap(k, first, hw, f.t, -1);
  endCap(k, last, hw, f.t, 1);
  if (f.band > 0) bandCells(k, f, r);
}

/** How far in from the belt's side its broad faces stop, in centimetres. */
const FACE_INSET = 0.2;

/** The corner of the belt at a sample: `side` -1 to 1 across it, `face` -1 (back) to 1 (face) through it. */
const corner = (p: Along, across: Vec, side: number, hw: number, face: number, T: number): Vec => add(p.p, add(scale(across, side * hw), scale(p.out, face * (T / 2) * (p.k ?? 1))));

/** One step of the belt between two samples: its face, its back, its two long edges, each on its part of the strip. */
function step(k: Sink, a: Along, b: Along, hw: number, T: number, total: number): void {
  const here = stripX((a.u + b.u) / 2, total);
  const start = stripX(a.u + 1e-6, total);
  const x0 = start.x;
  const x1 = x0 + here.dir * (b.u - a.u) * U;
  // The belt's width runs along out x (the way the strip's x runs), so the picture of its face reads right from the outside.
  const across = (s: Along): Vec => unit(cross(s.out, scale(s.d, here.dir)));
  const A = across(a);
  const B = across(b);
  const w = hw * 2 * U;
  const fy = (y0: number): [number, number][] => [[x0, y0], [x1, y0], [x0, y0 + w], [x1, y0 + w]];
  const ey = (y0: number): [number, number][] => [[x0, y0], [x1, y0], [x0, y0 + EDGE_H], [x1, y0 + EDGE_H]];
  const o = unit(add(a.out, b.out));
  const m = unit(add(A, B));
  // The two broad faces stop a hair short of the sides: a cell is drawn grown at its corners, and the grown part would otherwise hang over the edge below it.
  const hi = hw - FACE_INSET;
  k.quad([corner(a, A, -1, hi, 1, T), corner(b, B, -1, hi, 1, T), corner(a, A, 1, hi, 1, T), corner(b, B, 1, hi, 1, T)], fy(FACE_Y), o);
  // Each picture is laid so that its x and y cross outward: the back's sides and the left edge's rows run the other way round.
  k.quad([corner(a, A, 1, hi, -1, T), corner(b, B, 1, hi, -1, T), corner(a, A, -1, hi, -1, T), corner(b, B, -1, hi, -1, T)], fy(BACK_Y), scale(o, -1));
  k.quad([corner(a, A, -1, hw, -1, T), corner(b, B, -1, hw, -1, T), corner(a, A, -1, hw, 1, T), corner(b, B, -1, hw, 1, T)], ey(EDGE1_Y), scale(m, -1));
  k.quad([corner(a, A, 1, hw, 1, T), corner(b, B, 1, hw, 1, T), corner(a, A, 1, hw, -1, T), corner(b, B, 1, hw, -1, T)], ey(EDGE1_Y), m);
}

/** The cut end of the belt: a small face of its edge cloth, looking the way the belt would go on (`way` is +1 at the end, -1 at the start). */
function endCap(k: Sink, e: Along, hw: number, T: number, way: 1 | -1): void {
  const across = unit(cross(e.out, e.d));
  const w = hw * 2 * U;
  const tex: [number, number][] = [[X0, EDGE1_Y], [X0 + w, EDGE1_Y], [X0, EDGE1_Y + EDGE_H], [X0 + w, EDGE1_Y + EDGE_H]];
  const [l, r] = way === 1 ? [1, -1] : [-1, 1];
  k.quad([corner(e, across, l, hw, 1, T), corner(e, across, r, hw, 1, T), corner(e, across, l, hw, -1, T), corner(e, across, r, hw, -1, T)], tex, scale(e.d, way));
}

/** The width of the bundle's stack and the height it reaches, for the band that wraps it. */
export function bundleSize(f: FoldDesc): { height: number; width: number } {
  return { height: f.n * (f.t + 0.03), width: f.w };
}

/** The shop's paper band round the middle of the bundle: four faces, the top carrying the picture (a mark and the size), the rest plain paper. */
function bandCells(k: Sink, f: FoldDesc, r: Regions): void {
  const { height } = bundleSize(f);
  const m = 0.32;
  const hw = f.w / 2 + m;
  const x0 = f.x - f.band / 2;
  const yTop = f.y - height - m * 0.5;
  const yBot = f.y + m * 0.5;
  const z0 = f.z - hw;
  const z1 = f.z + hw;
  const pic = part(r.band, 0, 0, 0.5, 1);
  const plain = part(r.band, 0.52, 0, 0.4, 1);
  k.face([x0, yTop, z0], [f.band, 0, 0], [0, 0, z1 - z0], 2, 2, pic);
  k.face([x0, yBot, z1], [f.band, 0, 0], [0, 0, -(z1 - z0)], 2, 2, plain);
  k.face([x0, yTop, z1], [f.band, 0, 0], [0, yBot - yTop, 0], 2, 3, plain);
  k.face([x0 + f.band, yTop, z0], [-f.band, 0, 0], [0, yBot - yTop, 0], 2, 3, plain);
}

// ---- the scene ----

/** What a scene is built from. */
export interface SceneOptions {
  /** The belt's size number (as the maker's lists) and width in centimetres, its thickness of one turn in centimetres. */
  beltSize: number;
  beltCm?: number;
  widthCm: number;
  thickCm: number;
  /** Which box, in which state, or none. */
  box?: { type: BoxType; state: BoxState; size?: BoxSize };
  /** Whether the belt is drawn (in the box: only when it fits and the box is open). */
  belt: boolean;
  /** The shop's paper band round the folded belt (the folded view only). */
  band: boolean;
  /** The scene's base turn in degrees. */
  rot?: number;
}

/** Degrees the folded belt and the boxes are turned by before the viewer's own turn: they lie at an angle, as in a shop's photograph. */
export const BASE_TURN = 62;

/** What the scene holds, as numbers. */
export function sceneOf(o: SceneOptions): SolidDesc & { fits: boolean; boxSize: BoxSize | undefined } {
  const type = o.box?.type ?? "kiri";
  const boxSize = o.box === undefined ? undefined : o.box.size ?? boxSizeFor(o.beltSize, type) ?? 6;
  const fits = o.box === undefined || (boxSizeFor(o.beltSize, type) !== undefined && (o.box.size === undefined || BOX_TAKES[o.box.size] >= o.beltSize));
  const cm = o.beltCm ?? beltCmOfSize(o.beltSize);
  const rot = o.rot ?? BASE_TURN;
  const belt: Omit<FoldDesc, "x" | "y" | "z"> = { cm, w: o.widthCm, t: o.thickCm, n: FOLD_LAYERS, band: o.band ? 4 : 0 };
  if (o.box === undefined || boxSize === undefined) {
    const h = belt.n * (belt.t + 0.03);
    return { rot, belt: { ...belt, x: 0, y: h / 2, z: 0 }, fits, boxSize };
  }
  const d = boxDims(boxSize, type);
  const open = o.box.state === "open";
  const wid = Math.min(o.widthCm, boxBeltRoom(d));
  const lidBeside = type === "kiri" && o.box.state === "open";
  const gap = 3;
  const z = lidBeside ? -(d.w + gap) / 2 : 0;
  const scene: SolidDesc & { fits: boolean; boxSize: BoxSize | undefined } = {
    rot,
    box: { type, state: o.box.state, d, z, y: d.h / 2, lidZ: lidBeside ? (d.w + gap) / 2 : z, lidRot: type === "silver" ? 38 : 0 },
    fits,
    boxSize,
  };
  if (o.belt && open && fits) scene.belt = { ...belt, w: wid, x: 0, y: d.h / 2 - d.wall * (type === "kiri" ? 1 : 0.6), z, band: 0 };
  return scene;
}

/** The radius of the scene's drawing about the vertical axis through its middle, in drawing units, and its half height: what a view box must hold at any turn. */
export function sceneReach(s: SolidDesc): { radius: number; half: number } {
  let r = 0;
  let top = 0;
  let bottom = 0;
  const take = (x: number, z: number, y0: number, y1: number): void => {
    r = Math.max(r, Math.hypot(x, z));
    top = Math.min(top, y0);
    bottom = Math.max(bottom, y1);
  };
  if (s.box !== undefined) {
    const d = s.box.d;
    const open = s.box.state !== "closed";
    take(d.length / 2, Math.abs(s.box.z) + d.w / 2, s.box.y - d.h, s.box.y);
    if (open && s.box.type === "kiri") take(d.length / 2, Math.abs(s.box.lidZ) + d.w / 2, s.box.y - d.lid, s.box.y);
    if (open && s.box.type === "silver") take(d.length / 2, d.w, s.box.y - d.h, s.box.y);
  }
  if (s.belt !== undefined) {
    const { points } = foldPath(s.belt);
    for (const p of points) take(Math.abs(p.p[0]) + s.belt.w / 2, Math.abs(p.p[2]) + s.belt.w / 2, p.p[1] - s.belt.t, p.p[1] + s.belt.t);
  }
  return { radius: r * U, half: Math.max(-top, bottom) * U };
}
