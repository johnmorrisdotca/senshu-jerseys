// Where marks may go, and how several marks share one area without touching. Every mark (embroidery, a maker's logo, the national emblem, the approval
// label) belongs to an area of one face of a garment: a rectangle or polygon in that face's own drawing units, already inset from seams, edges, the vent,
// the belt, the drawstring and the knee panel. Marks are laid out in a fixed order; each tries its preferred spot, then a smaller size, then the nearest
// free spot in its area, keeping a gap to every mark already placed and to the fixed things on the face (the belt's band, the drawstring, the neck label,
// a tip or bars on a belt end). A mark that cannot be placed at 60 per cent of its size is left out and reported (`judogiCheck`), so the earlier marks
// are never moved or overdrawn. Original geometry; the numbers come from the garment drawings (judogiJacket.ts, judogiPants.ts, judogiBelt.ts).

import { sleeveRegion } from "./judogiJacket.ts";
import { hipsOf, onLeg } from "./judogiPants.ts";
import { END_LENGTH, type ReadStyle } from "./judogiStripes.ts";
import type { Pt } from "./path.ts";

/** Drawing units to the centimetre, as the garments are drawn. */
export const CM = 2.63;

/** The clear gap kept between two marks, between a mark and the edge of its area's cloth, and the margin kept from a seam: 1 cm. */
export const MARK_GAP = 1 * CM;
export const EDGE_MARGIN = 1 * CM;

export type FaceId = "jacket-front" | "jacket-back" | "pants-front" | "belt-left" | "belt-right";

/** A mark's box: its middle, its size before it is turned and the angle it is turned by, in degrees clockwise on the screen. */
export interface Obb {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}

export interface Area {
  id: string;
  face: FaceId;
  /** The allowed region, convex or a simple quadrilateral. A mark's four corners must lie inside it, `margin` away from its edge. */
  poly: Pt[];
  margin: number;
}

/** Something already on the face that marks keep clear of. */
export interface Obstacle {
  id: string;
  face: FaceId;
  box: Obb;
}

export const corners = (b: Obb): Pt[] => {
  const c = Math.cos((b.rot * Math.PI) / 180);
  const s = Math.sin((b.rot * Math.PI) / 180);
  return ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).map(([i, j]) => [b.x + (i * b.w * c) / 2 - (j * b.h * s) / 2, b.y + (i * b.w * s) / 2 + (j * b.h * c) / 2] as Pt);
};

/** The box's smallest axis-aligned box, as `[x0, y0, x1, y1]`. */
export function bounds(b: Obb): [number, number, number, number] {
  const p = corners(b);
  return [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[1])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[1]))];
}

const EPS = 1e-6;

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Whether `p` is inside `poly` and at least `margin` from its edge. */
export function insideWithMargin(poly: readonly Pt[], p: Pt, margin: number): boolean {
  let inside = false;
  let near = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Pt;
    const b = poly[j] as Pt;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    near = Math.min(near, distToSegment(p, a, b));
  }
  return inside && near >= margin - EPS;
}

export const fitsArea = (a: Area, b: Obb): boolean => corners(b).every((p) => insideWithMargin(a.poly, p, a.margin));

/** Whether two boxes come closer than `gap` (touching or overlapping when `gap` is 0). */
export function boxesClash(a: Obb, b: Obb, gap: number): boolean {
  const pa = corners(a);
  const pb = corners(b);
  for (const poly of [pa, pb]) {
    for (let i = 0; i < 2; i++) {
      const p = poly[i] as Pt;
      const q = poly[i + 1] as Pt;
      const nx = q[1] - p[1];
      const ny = p[0] - q[0];
      const l = Math.hypot(nx, ny) || 1;
      const proj = (pts: Pt[]): [number, number] => {
        const v = pts.map((r) => (r[0] * nx + r[1] * ny) / l);
        return [Math.min(...v), Math.max(...v)];
      };
      const [a0, a1] = proj(pa);
      const [b0, b1] = proj(pb);
      if (a1 + gap <= b0 + EPS || b1 + gap <= a0 + EPS) return false;
    }
  }
  return true;
}

export type MarkKind = "emblem" | "logo" | "embroidery" | "label" | "brand";

/** A mark to place. `w` and `h` are its size at full scale before turning; `pref` is where it would like to be. */
export interface Item {
  /** A stable name: `<kind>:<place>`. */
  id: string;
  kind: MarkKind;
  place: string;
  area: string;
  w: number;
  h: number;
  rot: number;
  pref: Pt;
  /** The smallest share of its size it may be drawn at (1 for a mark that must not shrink). */
  minScale: number;
  /** Size at a share of full size, for marks whose width and height do not scale together (a line of text keeps its letters' shape, so its box is asked again). */
  size?: (scale: number) => { w: number; h: number };
}

export interface Placed<T extends Item = Item> {
  item: T;
  face: FaceId;
  scale: number;
  box: Obb;
}

export interface Skipped<T extends Item = Item> {
  item: T;
  reason: string;
}

const SCALES = [1, 0.92, 0.84, 0.76, 0.68, 0.6];

/** The first spot for an item: its preferred one if it is free at some size, else the free spot nearest to it at the largest size that has one. */
function find(item: Item, area: Area, taken: Obb[]): { scale: number; box: Obb } | undefined {
  const free = (b: Obb): boolean => fitsArea(area, b) && taken.every((t) => !boxesClash(b, t, MARK_GAP));
  const xs = area.poly.map((p) => p[0]);
  const ys = area.poly.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  for (const scale of SCALES) {
    if (scale < item.minScale - EPS) break;
    const { w, h } = item.size === undefined ? { w: item.w * scale, h: item.h * scale } : item.size(scale);
    const at = (x: number, y: number): Obb => ({ x, y, w, h, rot: item.rot });
    const first = at(item.pref[0], item.pref[1]);
    if (free(first)) return { scale, box: first };
    let best: Obb | undefined;
    let bestD = Infinity;
    for (let y = y0; y <= y1 + EPS; y += 1) {
      for (let x = x0; x <= x1 + EPS; x += 1) {
        const d = Math.hypot(x - item.pref[0], y - item.pref[1]);
        if (d >= bestD) continue;
        const b = at(x, y);
        if (free(b)) {
          best = b;
          bestD = d;
        }
      }
    }
    if (best !== undefined) return { scale, box: best };
  }
  return undefined;
}

/** Lays the items out in the order given on the faces' areas, keeping clear of each other and of the obstacles. */
export function pack<T extends Item>(items: readonly T[], areas: Readonly<Record<string, Area>>, obstacles: readonly Obstacle[]): { placed: Placed<T>[]; skipped: Skipped<T>[] } {
  const placed: Placed<T>[] = [];
  const skipped: Skipped<T>[] = [];
  for (const item of items) {
    const area = areas[item.area];
    if (area === undefined) {
      skipped.push({ item, reason: "no such area" });
      continue;
    }
    const taken = [...obstacles.filter((o) => o.face === area.face).map((o) => o.box), ...placed.filter((p) => p.face === area.face).map((p) => p.box)];
    const spot = find(item, area, taken);
    if (spot === undefined) skipped.push({ item, reason: "no room left in its area" });
    else placed.push({ item, face: area.face, scale: spot.scale, box: spot.box });
  }
  return { placed, skipped };
}

const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const mirrorX = (p: Pt): Pt => [200 - p[0], p[1]];

/**
 * Every area marks may take. `half` is half the belt's width in drawing units; `lapel` the lapel's middle line spot (where the name along the lapel stands,
 * turned by `lean`). Left and right are the wearer's, as the places' names are; on a front the wearer's left is the picture's right.
 */
export function areasFor(half: number, lapel: { x: number; y: number; rot: number }): Record<string, Area> {
  const out: Record<string, Area> = {};
  const add = (id: string, face: FaceId, poly: Pt[], margin = 0): void => {
    out[id] = { id, face, poly, margin };
  };
  // Jacket front. The hem's corner: right of where the belt's hanging end can reach (its far edge is at about 128), left of the side vent (its slit at 146 from y 182), above the hem's stitching (198).
  add("hem-left", "jacket-front", rect(130, 131, 143.2, 195.3));
  // The chest: right of the top lapel's free edge and its band (at y 46 to 117), left of the armhole, above the belt's band (111).
  add("chest", "jacket-front", rect(117.5, 34, 144.5, 106));
  // The lapel hem: along the middle of the top lapel's band (14.5 wide), clear of its edges by a margin and between the belt and the hem's stitching.
  const c = Math.cos((lapel.rot * Math.PI) / 180);
  const s = Math.sin((lapel.rot * Math.PI) / 180);
  const along = (u: number, v: number): Pt => [lapel.x + u * c - v * s, lapel.y + u * s + v * c];
  add("lapel-hem", "jacket-front", [along(-29, -5.3), along(29, -5.3), along(29, 5.3), along(-29, 5.3)]);
  for (const side of [-1, 1] as const) {
    // A sleeve, as drawn, held a margin in from its seams and cuff. On the front the picture's left sleeve is the wearer's right; from behind it is the wearer's left.
    add(`sleeve-${side === -1 ? "right" : "left"}`, "jacket-front", sleeveRegion(side), EDGE_MARGIN);
    add(`shoulder-${side === -1 ? "left" : "right"}`, "jacket-back", sleeveRegion(side), EDGE_MARGIN);
  }
  // The trousers' front. The hip zone beside the waistband: from under the waistband's gathers to the hip's edge when the trousers are worn gathered (it is the narrower), clear of the drawstring's cord and knots (the picture's 93 to 111).
  const hip = hipsOf(true)[1] as number;
  for (const side of ["left", "right"] as const) {
    const mir = side === "right";
    const fix = (p: Pt[]): Pt[] => (mir ? p.map(mirrorX) : p);
    add(`waist-${side}`, "pants-front", fix(rect(113.5, 23, 100 + hip - EDGE_MARGIN, 75)));
    const sd = side === "left" ? 1 : -1;
    // The upper front of the leg: from just under the crotch's seam to above the knee panel, a margin in from the leg's two seams.
    add(`thigh-${side}`, "pants-front", [onLeg(sd, 0.045, 0.14), onLeg(sd, 0.045, 0.86), onLeg(sd, 0.17, 0.86), onLeg(sd, 0.17, 0.14)]);
    // The lower leg: between the knee panel and the turned hem.
    add(`leg-${side}`, "pants-front", [onLeg(sd, 0.66, 0.1), onLeg(sd, 0.66, 0.9), onLeg(sd, 0.92, 0.9), onLeg(sd, 0.92, 0.1)]);
  }
  // A hanging belt end, in its own frame: along it from the knot to the cut end, across it from the middle. The knot's cloth covers the first 9 units.
  for (const [i, face] of (["belt-left", "belt-right"] as const).entries()) {
    const room = Math.max(1, half - 1.6);
    add(face, face, rect(9, -room, (END_LENGTH[i] as number) - 3, room));
  }
  return out;
}

/** What is already on each face that marks keep clear of: the belt's band across the jacket, the neck label and size tag, the drawstring, and a belt end's tip and bars. */
export function obstaclesFor(half: number, style: ReadStyle | undefined, neck: boolean): Obstacle[] {
  const out: Obstacle[] = [
    // A belt's band tied on the jacket: 111.5 to about 127 at the front.
    { id: "belt-band", face: "jacket-front", box: { x: 100, y: 119.5, w: 160, h: 17, rot: 0 } },
    // The drawstring's bow and its two hanging ends with their knots.
    { id: "drawstring", face: "pants-front", box: { x: 100, y: 25, w: 28, h: 42, rot: 0 } },
  ];
  if (neck) {
    out.push({ id: "neck-label", face: "jacket-front", box: { x: 100, y: 25, w: 11, h: 11 / 1.4, rot: 0 } }, { id: "size-tag", face: "jacket-front", box: { x: 100, y: 33.6, w: 4.6, h: 4.6 * 0.62, rot: 0 } });
  }
  if (style !== undefined) {
    for (const [i, face] of (["belt-left", "belt-right"] as const).entries()) {
      const l = END_LENGTH[i] as number;
      const block = (x0: number, x1: number, id: string): void => {
        out.push({ id, face, box: { x: (x0 + x1) / 2, y: 0, w: x1 - x0, h: 2 * half, rot: 0 } });
      };
      const tip = style.tip;
      if (tip !== undefined && tip.ends[i]) block(Math.max(0, l - tip.fromEndCm * CM - tip.lengthCm * CM), l - tip.fromEndCm * CM, "belt-tip");
      for (const [k, b] of style.bars.entries()) {
        if (!b.ends[i]) continue;
        const w = b.widthCm * CM;
        for (let j = 0; j < b.count; j++) {
          const x1 = l - b.fromEndCm * CM - j * (w + b.gapCm * CM);
          if (x1 - w >= 0) block(x1 - w, x1, `belt-bar-${k}-${j}`);
        }
      }
    }
  }
  return out;
}
