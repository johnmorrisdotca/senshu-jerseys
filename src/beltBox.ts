// A belt folded flat into a bundle, as a shop shows it, and the gift boxes a belt comes in: a long kiri (paulownia) wood box with a slide-on lid engraved
// 御帯 (o-obi, "belt", honorific), and a silver cardboard box with a white label strip. All of it is one piece of the turning view: a scene of small textured
// quadrilaterals (cells), the belt's own face strip wrapped on the folded belt (judogiStrap.ts's `strapFace`, so colour, kohaku panels, rows, marks and widths carry over),
// the boxes' faces on regions of the same picture (beltBoxFace.ts). The numbers here are centimetres until the very end, where a centimetre becomes `UNITS_PER_CM` units.
// Box sizes, the 7 x 7 cm kiri and the 5 cm silver widths are from KuSakura's gift-box pages (read 2026-10-28; see docs/judogi.md); the box length per size is derived here.

import { BELT_SIZES } from "./beltSpecs.ts";
import { END_LENGTH } from "./judogiStripes.ts";
import { BACK_Y, EDGE1_Y, EDGE_H, END_X, FACE_Y, quad, UNITS_PER_CM } from "./judogiStrap.ts";
import { APART, type Cell } from "./volume.ts";

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

/** How many layers a belt is doubled into in a box: fixed, so a box's length follows from the longest belt it holds. On its own a belt is folded in six, so that both its free ends lie at the same end of the bundle, the label end on top. */
export const FOLD_LAYERS = 8;
/** How many layers a belt on its own is doubled into: an even number, so that both free ends lie at the same end of the bundle, the label end on top. A shop folds a belt in half three times (8); a short one in six, a long one in ten. */
export const FOLDED_LAYERS = 8;
/** The layers of a belt `cm` long and `w` wide, folded flat: the bundle stays about seven belt widths long (six to ten layers, always even). */
export const foldedLayersFor = (cm: number, w: number): number => Math.max(6, Math.min(10, 2 * Math.round(cm / (15 * w))));
/** Room left at each end of the box, in centimetres. */
export const BOX_SLACK_CM = 2.5;

/** The length of a belt by its size number, men's and mixed, from the package's own size table (`BELT_SIZES`: size 2 is 235 cm and every half size 10 cm more, to size 8 at 355 cm); between two listed sizes, in proportion. */
export function beltCmOfSize(size: number): number {
  const list = BELT_SIZES;
  const exact = list.find((s) => s.size === size);
  if (exact !== undefined) return exact.cm;
  const first = list[0]!;
  const last = list[list.length - 1]!;
  if (size <= first.size) return first.cm;
  if (size >= last.size) return last.cm;
  const hi = list.findIndex((s) => s.size > size);
  const a = list[hi - 1]!;
  const b = list[hi]!;
  return Math.round(a.cm + ((b.cm - a.cm) * (size - a.size)) / (b.size - a.size));
}

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
  /** How tall it is inside, floor to rim: what the pressed bundle fills with the lid on. */
  innerH: number;
}

/** The belt a box is made to hold: its width and the thickness of one turn of it folded, both in centimetres. The default is a standard 4.5 cm belt. */
export interface BoxFit {
  w: number;
  t: number;
}
/** The room across the box, in total (centimetres), a belt needs beyond its own width: a little play, so it slides in. */
export const BOX_PLAY = 0.7;
/** How much a layer of the belt can be pressed (a share of its thickness) when the lid closes on the bundle, and the gap between two layers once it is shut (centimetres). */
export const SQUASH_MAX = 0.22;
export const GAP_CLOSED = 0.03;
/** How far a bundle springs up over the tray's rim when the lid is off, as a share of one layer's thickness (a stiff band does not lie flat): the standard belt stands about 4 mm proud. */
export const SPRING_PROUD = 0.6;
/** How much of its squash a layer takes back when the lid comes off (the rest stays pressed). */
export const SPRING_BACK = 0.7;
/** The default fit: a 4.5 cm belt of the standard thickness (0.49 cm), a little puffier folded. */
export const BOX_FIT: BoxFit = { w: 4.5, t: 0.49 * 1.3 };

/** The makers' outside sizes (centimetres): the wooden box is 7 x 7 for a standard belt (the lid slab 1 cm of the height), the silver one is 5 wide and a little over 5 high (its base 5.5 tall). */
const KIRI_OUTER = { w: 7, h: 7 };
const SILVER_BASE = { w: 5.2, h: 5.5 };

/** The least a box must be tall inside for the folded belt in it, its layers pressed as far as they go (`SQUASH_MAX`) with their gaps shut. */
const innerNeeded = (t: number): number => FOLD_LAYERS * t * (1 - SQUASH_MAX) + (FOLD_LAYERS - 1) * GAP_CLOSED;

/** The bundle with the lid shut: its layers pressed (`t` thick) and the gaps between them (`gap`) closed up so that together they are exactly as high as the box is inside. */
export interface ClosedBundle {
  t: number;
  gap: number;
  height: number;
}
export function closedBundle(innerH: number, fit: BoxFit = BOX_FIT): ClosedBundle {
  const n = FOLD_LAYERS;
  // The layers keep their thickness when the box is roomy enough for them with their gaps shut; otherwise they are pressed to fit.
  const t = Math.min(fit.t, (innerH - (n - 1) * GAP_CLOSED) / n);
  const gap = (innerH - n * t) / (n - 1);
  return { t, gap, height: n * t + (n - 1) * gap };
}

/** The bundle with the lid off: the layers take back most of their squash and the gaps open (more toward the ends of the bundle), so it stands `proud` over the tray's rim at its ends. */
export interface OpenBundle {
  t: number;
  gapMid: number;
  gapEnd: number;
  /** How far the top of the bundle stands over the rim at its ends, and in the middle (centimetres). */
  proud: number;
  proudMid: number;
}
export function openBundle(innerH: number, fit: BoxFit = BOX_FIT): OpenBundle {
  const n = FOLD_LAYERS;
  const c = closedBundle(innerH, fit);
  const proud = SPRING_PROUD * fit.t;
  // The layers take back their squash, but never so much that the bundle outgrows its spring (a thick belt is pressed hard and rises only so far).
  const t = Math.min(c.t + (fit.t - c.t) * SPRING_BACK, (innerH + proud - (n - 1) * c.gap) / n);
  const gapEnd = Math.max(c.gap, (innerH + proud - n * t) / (n - 1));
  const gapMid = c.gap + (gapEnd - c.gap) * 0.5;
  return { t, gapMid, gapEnd, proud: n * t + (n - 1) * gapEnd - innerH, proudMid: n * t + (n - 1) * gapMid - innerH };
}

/** How tall a box of this kind is inside, for the belt it holds: the maker's own size (7 x 7 outside for the wooden box) unless a thicker belt, pressed as far as it goes, needs more. */
export function boxInnerHeight(type: BoxType, fit: BoxFit = BOX_FIT): number {
  if (type === "kiri") return Math.max(KIRI_OUTER.h - 1 - 0.6, innerNeeded(fit.t));
  return Math.max(SILVER_BASE.h - 0.12, innerNeeded(fit.t));
}

/** How tall the folded belt in a box stands with the lid shut (centimetres): the box's inside height, to which the pressed layers fit exactly. */
export const bundleHeight = (fit: BoxFit = BOX_FIT, type: BoxType = "kiri"): number => closedBundle(boxInnerHeight(type, fit), fit).height;

/**
 * The figures of a box of `size` and `type` for the belt it holds (`fit`). Its length is the size's. Its outside is the maker's: the wooden box 7 x 7 cm with a 4.5 cm belt
 * (walls 6 mm, a 1 cm lid slab sliding on the tray, so 5.4 cm inside), the silver one 5 cm wide with a 5.5 cm base. A box grows only for a belt that needs more: wider than it
 * takes with a little play, or so thick that pressed as far as it goes it still does not fit. The lid closes on the belt and presses it (`closedBundle`).
 */
export function boxDims(size: BoxSize, type: BoxType, fit: BoxFit = BOX_FIT): BoxDims {
  const inner = boxInnerCm(size);
  const innerH = boxInnerHeight(type, fit);
  if (type === "kiri") {
    const wall = 0.6;
    const w = Math.max(KIRI_OUTER.w, fit.w + BOX_PLAY + 2 * wall + 0.4);
    const baseW = w - 0.4;
    const baseH = wall + innerH;
    return { type, w, h: baseH + 1, inner, length: inner + 1.2, wall, lid: 1, baseW, baseH, innerH };
  }
  const wall = 0.2;
  const baseW = Math.max(SILVER_BASE.w, fit.w + 2 * wall + 0.3);
  const baseH = wall * 0.6 + innerH;
  return { type, w: baseW + 0.3, h: baseH + 0.2, inner, length: inner + 0.4, wall, lid: 0.2, baseW, baseH, innerH };
}

/** The widest belt a box holds, in centimetres (the inside width less a hair of play). */
export const boxBeltRoom = (d: BoxDims): number => Math.round((d.baseW - 2 * d.wall - 0.1) * 10) / 10;

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
  /** Where the folds' small imperfections come from (a number made from the belt's options): the same belt is always folded the same way. */
  seed: number;
  /** How far the layers spring apart toward the ends of the bundle, 0 to 1 (the looseness's by default). */
  spring?: number;
  /** A belt in a box: the gap between two layers in the middle of the bundle and at its ends, in centimetres (instead of the looseness's). */
  gapMid?: number;
  gapEnd?: number;
  /** How loosely it lies, 0 to 1: 1 a coil with its layers fanned and its folds open, near 0 packed snug in a box (the wobbles scale with it). */
  loose: number;
  /** The length, in drawing units, after which a kohaku belt's red and white sections repeat (two sections), so the plain stretch of the strip wraps without a seam. */
  period: number;
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
export const lidLength = (d: BoxDims): number => (d.type === "kiri" ? d.length + 0.4 : d.length - 1.6);

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
  /** The layer the cells being made belong to (see `Cell.layer`), or none. */
  layer: number | undefined;
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
    const w = c.map((p) => this.wp(p)) as [Vec, Vec, Vec, Vec];
    // A picture must read the right way round from outside: where the picture's axes would cross inward (a fold's turning belt can do that), its rows are swapped.
    const ex = sub(w[1], w[0]);
    const ey = sub(w[2], w[0]);
    const tx = (tex[1] as [number, number])[0] - (tex[0] as [number, number])[0];
    const ty = (tex[2] as [number, number])[1] - (tex[0] as [number, number])[1];
    const n = cross(ex, ey);
    const wo = this.wn(out);
    const flip = (n[0] * wo[0] + n[1] * wo[1] + n[2] * wo[2]) * tx * ty < 0;
    const t = flip ? [tex[2], tex[3], tex[0], tex[1]] as [number, number][] : tex;
    const made = quad(w, t, wo);
    if (this.layer !== undefined) for (const c of made) c.layer = this.layer;
    this.cells.push(...made);
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
  // A belt in a box lies between what is inside the box (layer 0) and what stands round it (layer 2).
  if (s.box !== undefined) sink.layer = 1;
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
  k.layer = 2;
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
    k.layer = 0;
    // The floor, the four inner walls (each seen from inside), the tops of the walls.
    k.face([ix0, yi, iz0], [dx, 0, 0], [0, 0, dz], nx, Math.ceil(dz / 3), plain(dx, dz));
    k.face([ix0, yTop, iz0], [dx, 0, 0], [0, h, 0], nx, ny, plain(dx, h));
    k.face([ix1, yTop, iz1], [-dx, 0, 0], [0, h, 0], nx, ny, plain(dx, h));
    k.face([ix0, yTop, iz1], [0, 0, -dz], [0, h, 0], 2, ny, plain(dz, h));
    k.face([ix1, yTop, iz0], [0, 0, dz], [0, h, 0], 2, ny, plain(dz, h));
    k.layer = 2;
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
  const zc = closed ? b.z : b.lidZ;
  k.layer = closed ? 2 : APART;
  if (d.type === "kiri") {
    // The slab slides in the walls' grooves, sitting on the tray's rim a touch proud of it each way (so there is a step and a seam to see), or lies on the table beside the tray; the engraving shows on its top either way.
    const yb = closed ? yTop : b.y;
    k.place(closed ? (p) => p : spin(b.lidRot, [0, 0, zc]));
    k.cuboid([-L / 2, yb - d.lid, zc - d.w / 2], [L / 2, yb, zc + d.w / 2], {
      top: r.lidTop,
      front: r.lidLong,
      back: r.lidLong,
      left: r.lidEnd,
      right: r.lidEnd,
      bottom: closed ? part(r.inside, 0, 0, L / d.length, d.w / d.h) : part(r.inside, 0, 0, L / d.length, d.w / d.h),
    });
    return;
  }
  // The silver lid: a cap with a top, two sides and a closed end, white board inside, open at one end. Closed, it sits over the base with the base's end showing; open, it lies beside the base on the table.
  const w = d.w;
  const h = d.h;
  const wl = d.wall;
  const x0 = closed ? -d.length / 2 + 1.6 : -L / 2;
  const yb = closed ? b.y + (d.h - d.baseH) * 0.5 : b.y;
  const yt = yb - h;
  k.place(closed ? (p) => p : spin(b.lidRot, [0, 0, zc]));
  k.cuboid([x0, yt, zc - w / 2], [x0 + L, yb, zc + w / 2], { top: r.lidTop, front: r.lidLong, back: r.lidLong, right: r.lidEnd });
  // The open end: the board's thickness all round, and the white inside looking in.
  const iw = w - 2 * wl;
  const ih = h - wl;
  const inner = (len: number, other: number): Rect => part(r.inside, 0, 0, len / d.length, other / d.h);
  k.face([x0, yt, zc - w / 2], [0, 0, w], [0, wl, 0], 2, 1, r.rimEnd);
  k.face([x0, yt + wl, zc - w / 2], [0, 0, wl], [0, ih, 0], 1, 2, r.rimEnd);
  k.face([x0, yt + wl, zc + w / 2 - wl], [0, 0, wl], [0, ih, 0], 1, 2, r.rimEnd);
  if (closed) return;
  k.face([x0, yt + wl, zc + iw / 2], [L, 0, 0], [0, 0, -iw], Math.ceil(L / 3), 2, inner(L, iw));
  k.face([x0 + L, yt + wl, zc + w / 2 - wl], [-L, 0, 0], [0, ih, 0], Math.ceil(L / 3), 2, inner(L, ih));
  k.face([x0, yt + wl, zc - w / 2 + wl], [L, 0, 0], [0, ih, 0], Math.ceil(L / 3), 2, inner(L, ih));
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
  /** On a fold: where the layer before it ended (how far along the belt and where across the bundle), which its picture carries on from. */
  fold?: { u0: number; wx0: number };
}

/** Where the belt's plain stretch is laid on its strip. */
const X0 = -30;

/** A small deterministic random sequence (mulberry32): the folds are imperfect, but the same every time for the same belt. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The belt's path in the scene: its layers from the bottom one (free end B) up to the top one (free end A, face up), joined by folds, the belt's own length along it.
 * It is a stiff band, not a stack of planks: each layer bends along its length (the gap to the layer below opens and closes along the bundle, more toward the ends, and the lower
 * layers droop toward the near end), bows and sits a little skewed in plan, and the ends of the layers are not in line: the lower ones stand out further at the near end, so every
 * fold shows round and by itself. With an even number of layers both free ends are at the near end, the top one with the label, and the folds below it step down. Every
 * wobble comes from `f.seed`, so a belt is the same each time; a belt packed in a box (`f.loose` near 0) is tidy.
 */
export function foldPath(f: FoldDesc): { points: Along[]; length: number; extent: [number, number] } {
  const n = f.n;
  const rand = rng(f.seed);
  // A belt packed in a box (its gaps given) keeps its layers' heights; a loose one wavers.
  const lw = f.gapMid !== undefined ? 0 : Math.min(1, f.loose);
  const wob = (amp: number): number => (rand() - 0.5) * 2 * amp * f.loose;
  const pitch = f.t + LAYER_GAP;
  const even = n % 2 === 0;
  // Which end of each layer is at the near end: the top layer's tip when the number is even, the bottom one's tip when it is odd.
  const stepBack = even ? -0.8 * f.loose : 0;
  const level = (i: number): number => Math.ceil((n - 1 - i) / 2);
  const nearJit = Array.from({ length: n }, () => wob(0.45));
  const farJit = Array.from({ length: n }, () => wob(0.9));
  // How each layer's gap to the one below it varies along the bundle: a slow wave with its own length and phase (a stiff band is never evenly sprung).
  const wave = Array.from({ length: n }, () => ({ k: 0.7 + rand() * 1.1, ph: rand() * 2 * Math.PI, a: 0.7 * lw }));
  // The lower layers hang a little toward the near end; the bundle bows in plan, each layer by its own amount and skewed a touch.
  const droop = Array.from({ length: n }, (_, i) => (0.18 + 0.5 * rand()) * (1 - i / n) * lw);
  const fan = Array.from({ length: n }, (_, i) => (even && f.gapMid === undefined ? (n - 1 - i) * 0.3 * f.loose : 0));
  const bow = Array.from({ length: n }, () => wob(0.5));
  const off = Array.from({ length: n }, () => wob(0.2));
  const skew = Array.from({ length: n }, () => wob(0.045));
  const pitchOf = (i: number): number => 0.25 + 0.06 * i;
  const dirOf = (i: number): 1 | -1 => (i % 2 === 0 ? -1 : 1);
  // The top layer's face looks up; with an odd number of layers the face is on the right of the way the belt runs, with an even number on its left.
  const side = even ? -1 : 1;

  interface Built {
    pts: Along[];
    u: number;
    xs: number[];
    xe: number[];
    shift: number;
    L: number;
  }
  const build = (L: number): Built => {
    // Where each layer starts and ends along the bundle for a bundle `L` long.
    const xs: number[] = [];
    const xe: number[] = [];
    for (let i = 0; i < n; i++) {
      // A layer that runs toward -x starts at +x. In an even coil +x is the near end; in an odd one the free end of the top layer is at -x, so the near end is +x there too.
      const near = L / 2 - level(i) * stepBack + (nearJit[Math.floor((i + 1) / 2)] as number);
      const far = -L / 2 + (farJit[Math.floor(i / 2)] as number);
      xs.push(dirOf(i) === -1 ? near : far);
      xe.push(dirOf(i) === -1 ? far : near);
    }
    const all = [...xs, ...xe];
    const shift = f.x - (Math.min(...all) + Math.max(...all)) / 2;
    const tOf = (x: number): number => Math.max(0, Math.min(1, (x - shift + L / 2) / L));
    // A layer's height: the stack of the layers below it, each with its own gap (wavering along the bundle), the lower ones drooping toward the near end.
    const yAt = (i: number, x: number): number => {
      const t = tOf(x);
      let y = f.y - f.t / 2;
      for (let j = 0; j < i; j++) {
        const w = wave[j] as { k: number; ph: number; a: number };
        y -= f.t + Math.max(0.02, gapAt(f, t) * (1 + w.a * Math.sin(w.ph + w.k * 2 * Math.PI * t)));
      }
      return y + (droop[i] as number) * t * t * t;
    };
    const zOf = (i: number, x: number): number => {
      const t = tOf(x);
      // The whole bundle bows a little in plan, the more so the higher a layer lies.
      return f.z + (off[i] as number) + (fan[i] as number) * t * t + (bow[i] as number) * Math.sin(Math.PI * t) + pitchOf(i) * f.loose * Math.sin(Math.PI * t) + (skew[i] as number) * (x - f.x);
    };
    const pts: Along[] = [];
    let u = 0;
    const push = (p: Vec, d: Vec, out: Vec, k = 1, fold?: { u0: number; wx0: number }): void => {
      const last = pts[pts.length - 1];
      if (last !== undefined) u += Math.hypot(p[0] - last.p[0], p[1] - last.p[1], p[2] - last.p[2]);
      pts.push({ p, d, out, u, k, ...(fold === undefined ? {} : { fold }) });
    };
    for (let i = 0; i < n; i++) {
      const dir = dirOf(i);
      const a = (xs[i] as number) + shift;
      const b = (xe[i] as number) + shift;
      const nn = Math.max(3, Math.ceil(Math.abs(b - a) / 3));
      for (let j = 0; j <= nn; j++) {
        const x = lerp(a, b, j / nn);
        const y = yAt(i, x);
        // The layer's own line bends in plan and in height, so its direction is not quite along x.
        const x2 = lerp(a, b, Math.min(1, (j + 0.01) / nn));
        const dz = ((zOf(i, x2) - zOf(i, x)) / (x2 - x || 1e-6)) * dir;
        const dy = ((yAt(i, x2) - y) / (x2 - x || 1e-6)) * dir;
        const dl = Math.hypot(1, dz, dy);
        const d: Vec = [dir / dl, dy / dl, dz / dl];
        // The face looks up or down, square to the way the belt runs.
        const o = unit([-d[1] * d[0], 1 - d[1] * d[1], -d[1] * d[2]]);
        push([x, y, zOf(i, x)], d, scale(o, side * dir));
      }
      if (i < n - 1) {
        const left = i % 2 === 0;
        const yA = yAt(i, b);
        const yB = yAt(i + 1, b);
        const yc = (yA + yB) / 2;
        const ry = Math.max(0.01, (yA - yB) / 2);
        // A round loop, as tight as the cloth lets it be: about as far out as it is across.
        const rx = ry * 1.08 + 0.12;
        const m = f.loose >= 0.5 ? 16 : 6;
        const anchor = { u0: u, wx0: b };
        const z0 = zOf(i, b);
        const z1 = zOf(i + 1, b);
        for (let j = 1; j < m; j++) {
          const th = (Math.PI * j) / m;
          const sgn = left ? -1 : 1;
          const dx = sgn * Math.cos(th) * rx;
          const dy = -Math.sin(th) * ry;
          const dl = Math.hypot(dx, dy) || 1;
          // The face looks to the right of the way the belt runs (the same side all along it).
          push([b + sgn * Math.sin(th) * rx, yc + Math.cos(th) * ry, lerp(z0, z1, j / m)], [dx / dl, dy / dl, 0], [(-side * dy) / dl, (side * dx) / dl, 0], 1 - 0.3 * Math.sin(th) * Math.exp(-ry * 1.5), anchor);
        }
      }
    }
    return { pts, u, xs, xe, shift, L };
  };
  // The bundle's length that makes the path the belt's length (the path grows with it).
  let lo = f.cm / n - 8;
  let hi = f.cm / n + 8;
  for (let k = 0; k < 36; k++) {
    const mid = (lo + hi) / 2;
    if (build(mid).u < f.cm) lo = mid;
    else hi = mid;
  }
  const r = build((lo + hi) / 2);
  const all = [...r.xs, ...r.xe];
  const bulge = 1.2 * pitch;
  return { points: r.pts, length: r.u, extent: [Math.min(...all) + r.shift - bulge, Math.max(...all) + r.shift + bulge] };
}

/**
 * How the belt's picture is laid along it, by the belt's own length. Each free end lies on its own stretch of the strip, as long as the tied belt's hanging end (what is sewn on an end
 * is laid out for that length, so the marks sit where they would); the rest of the belt takes the plain stretch of the strip by the distance `u` from the first end, repeating every
 * `period`, so that a kohaku belt's red and white sections fall where they really do on the belt (from either end the first section is red) and a fold carries them round the turn.
 */
interface Laying {
  total: number;
  period: number;
  /** Cells round each rounded edge. */
  arc: number;
}

function layingOf(points: readonly Along[], period: number, loose: number): Laying {
  const last = points[points.length - 1] as Along;
  return { total: last.u, period, arc: loose >= 0.5 ? ARC_DEFAULT : 1 };
}

/** Where the plain stretch of the strip starts. */
const BULK0 = -40;

/** The picture's x at a place on the belt, not wrapped (the plain stretch is wrapped by the caller, a cell at a time). */
function texAt(l: Laying, u: number, mode: "A" | "B" | "bulk"): number {
  const [endA, endB] = END_LENGTH;
  if (mode === "B") return (END_X[1] as number) + endB - u * U;
  if (mode === "A") return (END_X[0] as number) + endA - (l.total - u) * U;
  return BULK0 + u * U;
}

const modeOf = (l: Laying, u: number): "A" | "B" | "bulk" => {
  const [endA, endB] = END_LENGTH;
  return u * U < endB ? "B" : (l.total - u) * U < endA ? "A" : "bulk";
};

function foldedCells(k: Sink, f: FoldDesc, r: Regions): void {
  const { points, length } = foldPath(f);
  const hw = f.w / 2;
  const lay = layingOf(points, f.period, f.loose);
  // Where a free end's marks end the picture changes: a step is cut there.
  const cuts = [END_LENGTH[1] / U, length - END_LENGTH[0] / U];
  // And where the plain stretch of the strip starts over again (a cell never runs across that).
  const per = f.period / U;
  for (let c = per; c < length; c += per) cuts.push(c);
  for (let i = 0; i + 1 < points.length; i++) {
    let a = points[i] as Along;
    const b = points[i + 1] as Along;
    for (const c of cuts.filter((q) => q > a.u + 1e-6 && q < b.u - 1e-6).sort((p, q) => p - q)) {
      const q = (c - a.u) / (b.u - a.u);
      const mid: Along = { p: [lerp(a.p[0], b.p[0], q), lerp(a.p[1], b.p[1], q), lerp(a.p[2], b.p[2], q)], d: a.d, out: a.out, u: c, k: a.k ?? 1, ...(a.fold === undefined ? {} : { fold: a.fold }) };
      step(k, a, mid, hw, f.t, lay);
      a = mid;
    }
    step(k, a, b, hw, f.t, lay);
  }
  const first = points[0] as Along;
  const last = points[points.length - 1] as Along;
  endCap(k, first, hw, f.t, -1);
  endCap(k, last, hw, f.t, 1);
  if (f.band > 0) bandCells(k, f, r);
}

/** How round the cloth is where it wraps round the belt's edge, in centimetres (a belt is a sheet folded on itself lengthwise: its edges are rounded). */
const ROUND_EDGE = 0.34;
/** Cells round each rounded edge. */
const ARC_DEFAULT = 3;

/** The corner of the belt at a sample: `side` -1 to 1 across it (an offset in centimetres), `face` through it (an offset in centimetres, scaled where the belt is thinned at a fold). */
const corner = (p: Along, across: Vec, side: number, face: number): Vec => add(p.p, add(scale(across, side), scale(p.out, face * (p.k ?? 1))));

/**
 * One step of the belt between two samples: its face and back, the four rounded edges where the cloth wraps round (their cells carry on the face's own picture, so the
 * stitch rows run up to the edge), and the two side walls of the folded cloth (the picture of an edge, with the lines of its plies).
 */
function step(k: Sink, a: Along, b: Along, hw: number, T: number, lay: Laying): void {
  const mode = modeOf(lay, (a.u + b.u) / 2);
  const t0 = texAt(lay, a.u + 1e-6, mode);
  const t1 = texAt(lay, b.u - 1e-6, mode);
  // The ends' own stretches are not wrapped; the rest of the belt is laid on the plain part of the strip, one period at a time.
  const wrap = mode === "bulk" ? lay.period * Math.floor(((t0 + t1) / 2 - BULK0) / lay.period) : 0;
  const x0 = t0 - wrap;
  const x1 = t1 - wrap;
  const dir: 1 | -1 = x1 >= x0 ? 1 : -1;
  // The belt's width runs along out x (the way the picture's x runs), so the picture of its face reads right from the outside.
  const across = (s: Along): Vec => unit(cross(s.out, scale(s.d, dir)));
  const A = across(a);
  const B = across(b);
  const w = hw * 2 * U;
  const r = Math.min(ROUND_EDGE, T * 0.45, hw * 0.2);
  const rw = (r / (2 * hw)) * w;
  const half = T / 2;
  const o = unit(add(a.out, b.out));
  const m = unit(add(A, B));
  const pa = (s: number, f: number): Vec => corner(a, A, s, f);
  const pb = (s: number, f: number): Vec => corner(b, B, s, f);
  const q = (cs: [Vec, Vec, Vec, Vec], ys: [number, number], out: Vec): void => {
    k.quad(cs, [[x0, ys[0]], [x1, ys[0]], [x0, ys[1]], [x1, ys[1]]], out);
  };
  // The broad faces, to where the cloth starts to round the edge. A stiff band is a little crowned across its width (its middle stands up from its edges), which gives the cloth its soft light.
  const hi = hw - r;
  const crown = lay.arc >= 2 ? Math.min(0.1, T * 0.14) : 0;
  const strips = crown > 0 ? 4 : 1;
  const hump = (s: number): number => crown * (1 - (s / hi) * (s / hi));
  for (let j = 0; j < strips; j++) {
    const s0 = -hi + (2 * hi * j) / strips;
    const s1 = -hi + (2 * hi * (j + 1)) / strips;
    const y0 = FACE_Y + rw + ((w - 2 * rw) * j) / strips;
    const y1 = FACE_Y + rw + ((w - 2 * rw) * (j + 1)) / strips;
    q([pa(s0, half + hump(s0)), pb(s0, half + hump(s0)), pa(s1, half + hump(s1)), pb(s1, half + hump(s1))], [y0, y1], o);
    // Each picture is laid so that its x and y cross outward: the back's sides and the left edge's rows run the other way round.
    const by0 = BACK_Y + rw + ((w - 2 * rw) * j) / strips;
    const by1 = BACK_Y + rw + ((w - 2 * rw) * (j + 1)) / strips;
    q([pa(-s0, -half - hump(s0)), pb(-s0, -half - hump(s0)), pa(-s1, -half - hump(s1)), pb(-s1, -half - hump(s1))], [by0, by1], scale(o, -1));
  }
  // The rounded edges: a quarter circle from the face's end to the wall's start, on the same picture so the stitching carries up to them.
  for (const face of [1, -1] as const) {
    for (const side of [-1, 1] as const) {
      for (let j = 0; j < lay.arc; j++) {
        const th0 = (Math.PI / 2) * (1 - j / lay.arc);
        const th1 = (Math.PI / 2) * (1 - (j + 1) / lay.arc);
        const at = (th: number): [number, number] => [side * (hi + r * Math.cos(th)), face * (half - r + r * Math.sin(th))];
        const [s0, f0] = at(th0);
        const [s1, f1] = at(th1);
        const mid = (th0 + th1) / 2;
        const nrm = unit(add(scale(m, side * Math.cos(mid)), scale(o, face * Math.sin(mid))));
        // The picture's y runs from the face's one side to its other (for the back the other way round); toward the wall it tends to the strip's border.
        const y = (th: number): number => {
          const t = (1 - th / (Math.PI / 2)) * rw;
          return face === 1 ? (side === -1 ? FACE_Y + rw - t : FACE_Y + w - rw + t) : (side === 1 ? BACK_Y + rw - t : BACK_Y + w - rw + t);
        };
        // Corners are given in the order that keeps the picture's axes crossing outward: the one with the smaller y first.
        const [ya, yb] = [y(th0), y(th1)];
        const pairs: [Vec, Vec, number][] = [[pa(s0, f0), pb(s0, f0), ya], [pa(s1, f1), pb(s1, f1), yb]];
        pairs.sort((u, v) => u[2] - v[2]);
        q([pairs[0]![0], pairs[0]![1], pairs[1]![0], pairs[1]![1]], [pairs[0]![2], pairs[1]![2]], nrm);
      }
    }
  }
  // The side walls: the folded cloth seen end on, its plies as lines. (Packed in a box, a belt's sides face the walls, which always hide them.)
  if (lay.arc < 2) return;
  const wall = half - r;
  const ey = (): [number, number] => [EDGE1_Y, EDGE1_Y + EDGE_H];
  k.quad([pa(-hw, -wall), pb(-hw, -wall), pa(-hw, wall), pb(-hw, wall)], [[x0, ey()[0]], [x1, ey()[0]], [x0, ey()[1]], [x1, ey()[1]]], scale(m, -1));
  k.quad([pa(hw, wall), pb(hw, wall), pa(hw, -wall), pb(hw, -wall)], [[x0, ey()[0]], [x1, ey()[0]], [x0, ey()[1]], [x1, ey()[1]]], m);
}

/** The cut end of the belt: a small face of its edge cloth, looking the way the belt would go on (`way` is +1 at the end, -1 at the start). */
function endCap(k: Sink, e: Along, hw: number, T: number, way: 1 | -1): void {
  const across = unit(cross(e.out, e.d));
  const w = hw * 2 * U;
  const tex: [number, number][] = [[X0, EDGE1_Y], [X0 + w, EDGE1_Y], [X0, EDGE1_Y + EDGE_H], [X0 + w, EDGE1_Y + EDGE_H]];
  const [l, r] = way === 1 ? [1, -1] : [-1, 1];
  k.quad([corner(e, across, l * hw, T / 2), corner(e, across, r * hw, T / 2), corner(e, across, l * hw, -T / 2), corner(e, across, r * hw, -T / 2)], tex, scale(e.d, way));
}

/** The shop's paper band round the middle of the bundle: four faces, the top carrying the picture (a mark and the size), the rest plain paper. It fits the bundle where it lies. */
function bandCells(k: Sink, f: FoldDesc, r: Regions): void {
  // The shop puts it a hand's breadth behind the label, toward the middle of the bundle's near end, not at its middle.
  const path = foldPath(f);
  const xc = path.extent[1] - 9;
  const x0 = xc - f.band / 2;
  const x1 = xc + f.band / 2;
  const near = path.points.filter((p) => p.fold === undefined && p.p[0] >= x0 - 0.5 && p.p[0] <= x1 + 0.5);
  const m = 0.3;
  const hw = f.w / 2;
  const yTop = Math.min(...near.map((p) => p.p[1])) - f.t / 2 - m * 0.4;
  const yBot = Math.max(...near.map((p) => p.p[1])) + f.t / 2 + m * 0.4;
  const z0 = Math.min(...near.map((p) => p.p[2])) - hw - m;
  const z1 = Math.max(...near.map((p) => p.p[2])) + hw + m;
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
  /** After what length (drawing units) a kohaku belt's two sections repeat. */
  period?: number;
  /** What the folds' imperfections come from. */
  seed?: number;
}

/** How much thicker a belt looks folded than stitched, and the gap between two layers, in centimetres. */
const PUFF = 1.3;
/** On its own, a folded belt springs loose and stands puffier still: each layer about a centimetre thick in the maker's photographs (a boxed belt is pressed by its lid and is 1.3). */
const PUFF_LOOSE = 1.6;
const LAYER_GAP = 0.04;

/** The gap between two layers of the bundle at a place `t` (0 to 1) along it: a stiff band lies close in the middle and springs open toward the ends, the more so the looser it is packed. */
export const gapAt = (f: Pick<FoldDesc, "t" | "loose" | "spring" | "gapMid" | "gapEnd">, t: number): number => {
  // The near end (t toward 1, where the free ends are) springs open further than the far end, where the folds are packed.
  const e = t >= 0.5 ? Math.pow(2 * t - 1, 1.9) : 0.55 * Math.pow(1 - 2 * t, 2.2);
  // A belt in a box has its gaps given (`openBundle`): from the middle's to the ends'.
  if (f.gapMid !== undefined && f.gapEnd !== undefined) return f.gapMid + (f.gapEnd - f.gapMid) * e;
  return LAYER_GAP + (f.spring ?? f.loose) * f.t * (0.05 + 0.26 * e);
};

/** How tall a bundle of `n` layers of thickness `t` stands (centimetres): the layers, and the most the gaps open to (at the ends of the bundle). */
export const stackHeight = (n: number, t: number, spring: number): number => n * t + (n - 1) * gapAt({ t, loose: spring }, 1);
/** The folded belt on its own lies the other way round (its free ends at the near end), turned by this many degrees. */
export const FOLDED_TURN = -126;

/** Degrees the folded belt and the boxes are turned by before the viewer's own turn: they lie at an angle, as in a shop's photograph. */
export const BASE_TURN = 62;

/** What the scene holds, as numbers. */
export function sceneOf(o: SceneOptions): SolidDesc & { fits: boolean; boxSize: BoxSize | undefined } {
  const type = o.box?.type ?? "kiri";
  const boxSize = o.box === undefined ? undefined : o.box.size ?? boxSizeFor(o.beltSize, type) ?? 6;
  const fits = o.box === undefined || (boxSizeFor(o.beltSize, type) !== undefined && (o.box.size === undefined || BOX_TAKES[o.box.size] >= o.beltSize));
  const cm = o.beltCm ?? beltCmOfSize(o.beltSize);
  // A folded belt is a little puffier than its stitched thickness says (the core is padded and the layers lie snug).
  const t0 = o.thickCm * PUFF;
  const period = o.period ?? 78.9;
  if (o.box === undefined || boxSize === undefined) {
    // On its own: six layers, so that both free ends lie at the same end of the bundle, the label end on top, and that end toward the viewer.
    const belt: FoldDesc = { cm, w: o.widthCm, t: o.thickCm * PUFF_LOOSE, n: foldedLayersFor(cm, o.widthCm), band: o.band ? 4 : 0, period, seed: o.seed ?? 1, loose: 1, x: 0, y: 0, z: 0 };
    belt.y = stackHeight(belt.n, belt.t, 1) / 2;
    return { rot: o.rot ?? FOLDED_TURN, belt, fits, boxSize };
  }
  const rot = o.rot ?? BASE_TURN;
  // A box fits the belt it holds: a belt is drawn no wider than the widest the designer allows.
  const wid = Math.min(o.widthCm, 6);
  const fit: BoxFit = { w: wid, t: t0 };
  const d = boxDims(boxSize, type, fit);
  // Lid off, the bundle has sprung back a little from the pressing of the lid (`openBundle`): it stands proud of the rim.
  const up = openBundle(d.innerH, fit);
  const belt: Omit<FoldDesc, "x" | "y" | "z"> = { cm, w: wid, t: up.t, n: FOLD_LAYERS, band: 0, period, seed: o.seed ?? 1, loose: 0.06, gapMid: up.gapMid, gapEnd: up.gapEnd };
  const open = o.box.state === "open";
  const lidBeside = o.box.state === "open";
  const gap = 3;
  const z = lidBeside ? -(d.w + gap) / 2 : 0;
  const scene: SolidDesc & { fits: boolean; boxSize: BoxSize | undefined } = {
    rot,
    box: { type, state: o.box.state, d, z, y: d.h / 2, lidZ: lidBeside ? (d.w + gap) / 2 : z, lidRot: type === "silver" ? 7 : 0 },
    fits,
    boxSize,
  };
  void open;
  const floor = d.wall * (type === "kiri" ? 1 : 0.6);
  if (o.belt && o.box.state === "open" && fits) scene.belt = { ...belt, x: 0, y: d.h / 2 - floor, z };
  return scene;
}

/**
 * What a view box must hold at any turn and any tip the designer allows: the scene's radius about the vertical axis through its middle, and how far up and down its drawing
 * can reach (drawing units, down positive), worked out from every cell of the scene, so a lid lying beside a box or a fan of layers is held whatever the state.
 */
export function solidBounds(s: SolidDesc): { radius: number; top: number; bottom: number } {
  let radius = 0;
  let minY = 0;
  let maxY = 0;
  for (const c of solidCells(s)) {
    for (let k = 0; k < 3; k++) {
      radius = Math.max(radius, Math.hypot(c.p[3 * k] as number, c.p[3 * k + 2] as number));
      minY = Math.min(minY, c.p[3 * k + 1] as number);
      maxY = Math.max(maxY, c.p[3 * k + 1] as number);
    }
  }
  // Seen from `pitch` degrees above, a point at height y and depth z lies at y cos + z sin: at worst a depth of the radius.
  let top = 0;
  let bottom = 0;
  for (let pitch = -SOLID_TIP; pitch <= SOLID_TIP + 1e-9; pitch += 5) {
    const cp = Math.cos((pitch * Math.PI) / 180);
    const sp = Math.abs(Math.sin((pitch * Math.PI) / 180));
    top = Math.min(top, minY * cp - radius * sp);
    bottom = Math.max(bottom, maxY * cp + radius * sp);
  }
  return { radius, top, bottom };
}

/** The pitches a solid is looked at from run to this many degrees above or below level: the camera's own 28 plus the designer's 30 of tilt and a margin, up to the 45 the canvas allows. */
const SOLID_TIP = 73;
