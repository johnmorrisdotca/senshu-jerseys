// The judogi's pieces on the jersey volume (volume.ts): the same cells and maps, with the shade a piece of white cloth needs. A shirt's
// cells each carry a half-transparent black; where grown neighbours overlap two of those darken the cloth, and on a white judogi that
// draws the grid as lines. Here every cell's shade is an opaque grey, smooth from one side edge to the other, on the same grown triangle
// as its cloth, and all of a group's shades are one layer that multiplies onto its cloth: opaque shapes just cover one another, so
// nothing doubles and no rim of cloth is left unshaded. A body with lobes (trousers) is not convex, so its left and right halves are
// layers of their own, the nearer drawn last. Kept apart from volume.ts so that a jersey's bundle does not carry it.

import { collarCells } from "./judogiCollar.ts";
import { strapCells } from "./judogiStrap.ts";
import { n2 } from "./path.ts";
import { cellsOf, groupOrder, LIGHT, nearSleeve, placeCell, quadPath, turn, type Cell, type Placed, type VolumeDesc, type VolumeMarkup } from "./volume.ts";

/** Every cell of a piece: a belt's strap, a jacket's collar, or the garment's body and sleeves. */
export function pieceCells(d: VolumeDesc): Cell[] {
  if (d.strap !== undefined) return strapCells(d.strap);
  if (d.collar !== undefined) return collarCells(d.collar);
  return cellsOf(d);
}

/** A strap or a collar: a band whose cells are drawn farthest first (`depthOrder`), not in a body's fixed groups. */
export const isBand = (d: VolumeDesc): boolean => d.strap !== undefined || d.collar !== undefined;

/**
 * The order a strap's cells are drawn in at a turn, farthest first. A strap is not convex (the knot stands off the turns, the ends hang in
 * front of them, the far half of the ring shows its inside), so it cannot be drawn in fixed groups as a body can; its cells are small
 * enough that their middles order them.
 */
export function depthOrder(placed: readonly Placed[]): number[] {
  return placed.map((_, i) => i).sort((i, j) => placed[i]!.depth - placed[j]!.depth);
}

type Vec = [number, number, number];

/**
 * A quadrilateral's smooth shade: its number, the way the cloth faces along its two side edges (each the mean of the two
 * quadrilaterals that share it, so neighbours meet at the same value), and the line on its drawing the shade runs along.
 */
export interface Smooth {
  k: number;
  n0: Vec;
  n1: Vec;
  line: [number, number, number, number];
}

/**
 * The line a quadrilateral's shade runs along, on its drawing (corners tl, tr, bl, br): from the middle of its left edge, square to its
 * side edges, as far as its right edge. A gradient is level along lines square to it, so those lines then run along the cell's sides
 * and the shade meets the cells above and below at the same value. Running it straight from one edge's middle to the other's would
 * tilt it on a slanted row, and every row would meet the next with a step.
 */
function edgeLine(tex: readonly number[]): [number, number, number, number] {
  const lx = (tex[0]! + tex[4]!) / 2;
  const ly = (tex[1]! + tex[5]!) / 2;
  const rx = (tex[2]! + tex[6]!) / 2;
  const ry = (tex[3]! + tex[7]!) / 2;
  let ex = tex[4]! - tex[0]! + (tex[6]! - tex[2]!);
  let ey = tex[5]! - tex[1]! + (tex[7]! - tex[3]!);
  const el = Math.hypot(ex, ey) || 1;
  ex /= el;
  ey /= el;
  const along = (rx - lx) * ex + (ry - ly) * ey;
  return [lx, ly, rx - along * ex, ry - along * ey];
}

/**
 * The smooth shade of every cell that is half of a quadrilateral (volume.ts splits each into two triangles in turn, sharing one
 * normal), by cell. A cuff's lining is fans, not quadrilaterals, and keeps a flat shade.
 */
export function smoothOf(cells: readonly Cell[]): (Smooth | undefined)[] {
  const key = (p: readonly number[], i: number): string => `${Math.round(p[i]! * 50)},${Math.round(p[i + 1]! * 50)},${Math.round(p[i + 2]! * 50)}`;
  const quads: { i: number; corners: number[]; tex: number[]; n: Vec; left: string; right: string }[] = [];
  for (let i = 0; i + 1 < cells.length; i++) {
    const a = cells[i] as Cell;
    const b = cells[i + 1] as Cell;
    if (a.n !== b.n) continue;
    // The first triangle is tl, tr, bl and the second tr, br, bl.
    const corners = [...a.p.slice(0, 3), ...a.p.slice(3, 6), ...a.p.slice(6, 9), ...b.p.slice(3, 6)];
    const tex = [...a.tex.slice(0, 2), ...a.tex.slice(2, 4), ...a.tex.slice(4, 6), ...b.tex.slice(2, 4)];
    const edge = (u: number, v: number): string => [key(corners, 3 * u), key(corners, 3 * v)].sort().join("|");
    quads.push({ i, corners, tex, n: a.n, left: edge(0, 2), right: edge(1, 3) });
    i++;
  }
  const sums = new Map<string, Vec>();
  for (const q of quads) {
    for (const e of [q.left, q.right]) {
      const s = sums.get(e) ?? [0, 0, 0];
      sums.set(e, [s[0] + q.n[0], s[1] + q.n[1], s[2] + q.n[2]]);
    }
  }
  const unit = (v: Vec): Vec => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const out: (Smooth | undefined)[] = [];
  quads.forEach((q, k) => {
    const s: Smooth = { k, n0: unit(sums.get(q.left) as Vec), n1: unit(sums.get(q.right) as Vec), line: edgeLine(q.tex) };
    out[q.i] = s;
    out[q.i + 1] = s;
  });
  return out;
}

/**
 * The shade of cloth facing `n` at a turn, 0 to about 0.5. Cloth that faces the light keeps its own white, and cloth turned from it
 * falls off further than a shirt's colours would: a white judogi needs bright fronts and a deeper form shadow to read as round. The way
 * the cloth tilts up or down counts for a fifth (`TILT`): the shade is smooth across a row but steps from one row to the next, and rows differ
 * most in their tilt (a shoulder faces the light above).
 */
const TILT = 0.2;

export function shadeOf(n: Vec, yaw: number, pitch: number): number {
  const k = Math.hypot(n[0], n[1] * TILT, n[2]) || 1;
  const r = (d: number): number => (d * Math.PI) / 180;
  const w = turn(n[0] / k, (n[1] * TILT) / k, n[2] / k, Math.cos(r(yaw)), Math.sin(r(yaw)), Math.cos(r(pitch)), Math.sin(r(pitch)));
  const lit = w[0] * LIGHT[0] + w[1] * LIGHT[1] + w[2] * LIGHT[2];
  return Math.round(Math.max(0, Math.min(0.52, (0.84 - lit) * 0.36)) * 1000) / 1000;
}

/**
 * The box every piece's drawing lies inside, on its own 200-wide drawing. A face's group carries it (`data-face`), so that a browser can
 * paint the face once into a picture of that box (`judogiCanvas` does): every cell draws its face again, and a detailed drawing drawn
 * some hundreds of times a frame is slow where a picture is not.
 */
export const FACE_BOX = [-40, -20, 280, 320] as const;

/** A shade as the grey that multiplies the cloth by as much: 0 is white (no change), 0.5 a mid grey. */
export function greyOf(shade: number): string {
  const v = Math.round(255 * (1 - Math.max(0, Math.min(1, shade))));
  return `#${v.toString(16).padStart(2, "0").repeat(3)}`;
}

/** The order the left and right halves of a body with lobes are drawn in: the nearer one last. */
export function halfOrder(yaw: number): ("L" | "R")[] {
  return nearSleeve(yaw) === -1 ? ["R", "L"] : ["L", "R"];
}

/** Which layer a cell is drawn in: its group, and for a body with lobes the half of it the cell lies in. */
export function layerOf(d: VolumeDesc, c: Cell): string {
  if (d.lobes === undefined || (c.g !== 0 && c.g !== 3)) return `${c.g}`;
  return `${c.g}${c.p[0]! + c.p[3]! + c.p[6]! < 0 ? "L" : "R"}`;
}

/**
 * The markup of a piece at one turn, wrapped in a group that carries its description (`data-piece`), so `applyPiece` can move it later.
 * Each cell is a use of the front's drawing (`frontId`) or the back's (`backId`) under its map, clipped to its grown triangle; its
 * shade is a second use of that triangle, in the group's multiplying layer, clipped to the face's outline (`frontClip`, `backClip`).
 */
export function pieceMarkup(d: VolumeDesc, uid: string, frontId: string, backId: string, frontClip: string, backClip: string, yaw: number): VolumeMarkup & { tail: string } {
  const cells = pieceCells(d);
  const smooth = smoothOf(cells);
  let defs = "";
  const cloth = new Map<string, string>();
  const shades = new Map<string, string>();
  const add = (m: Map<string, string>, k: string, v: string): void => {
    m.set(k, (m.get(k) ?? "") + v);
  };
  const graded = new Set<number>();
  const order = isBand(d) ? depthOrder(cells.map((c) => placeCell(c, yaw, d.pitch))) : cells.map((_, i) => i);
  order.forEach((i) => {
    const c = cells[i] as Cell;
    const key = layerOf(d, c);
    defs += `<path id="${uid}q${i}" d="${quadPath(c.tex)}"/><clipPath id="${uid}k${i}"><use href="#${uid}q${i}"/></clipPath>`;
    const pl = placeCell(c, yaw, d.pitch);
    const at = pl.visible ? ` transform="${pl.matrix}"` : ' display="none"';
    let fill = `fill="${greyOf(shadeOf(c.n, yaw, d.pitch))}"`;
    const sm = smooth[i];
    if (sm !== undefined) {
      const k = sm.k;
      if (!graded.has(k)) {
        graded.add(k);
        const s0 = shadeOf(sm.n0, yaw, d.pitch);
        const s1 = shadeOf(sm.n1, yaw, d.pitch);
        const [x1, y1, x2, y2] = sm.line;
        defs += `<linearGradient id="${uid}h${k}" data-vg="${k}" gradientUnits="userSpaceOnUse" x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}"><stop offset="0" stop-color="${greyOf(s0)}"/><stop offset="1" stop-color="${greyOf(s1)}"/></linearGradient>`;
      }
      fill = `fill="url(#${uid}h${k})"`;
    }
    add(shades, key, `<g data-vh="${i}"${at} clip-path="url(#${c.back ? backClip : frontClip})"><use href="#${uid}q${i}" ${fill}/></g>`);
    add(cloth, key, `<g data-vc="${i}"${at} clip-path="url(#${uid}k${i})"><use href="#${c.back ? backId : frontId}"/></g>`);
  });
  const layer = (k: string): string => `${cloth.get(k) ?? ""}<g style="mix-blend-mode:multiply">${shades.get(k) ?? ""}</g>`;
  const inner = (g: number): string => (d.lobes !== undefined && (g === 0 || g === 3) ? halfOrder(yaw).map((h) => `<g data-half="${h}">${layer(`${g}${h}`)}</g>`).join("") : layer(`${g}`));
  const groups = groupOrder(yaw, d.hang === true);
  const group = (g: number): string => `<g data-vol="${g}">${inner(g)}</g>`;
  const piece = (inside: string, tail = ""): string => `<g data-piece="${JSON.stringify(d).replace(/"/g, "&quot;")}"${tail}>${inside}</g>`;
  if (!wornOn(d)) return { defs, body: piece(groups.map(group).join("")), tail: "" };
  // The near sleeve goes in a group of its own, which the caller puts after the pieces worn on this one.
  const near = groups[groups.length - 1] as number;
  return { defs, body: piece(groups.slice(0, -1).map(group).join(""), ` data-tail="${uid}T"`), tail: `<g data-tail-of="${uid}T">${group(near)}</g>` };
}

/** Whether other pieces are worn on this one, between its body and its near sleeve (`VolumeDesc.worn`). */
const wornOn = (d: VolumeDesc): boolean => (d.worn ?? 0) > 0 && d.hang !== true && d.sl.length > 0;

/** Where a piece's near sleeve is drawn: its own root, or the group after the pieces worn on it. */
function tailOf(root: Element): Element | undefined {
  const id = root.getAttribute("data-tail");
  if (id === null) return undefined;
  return root.parentElement?.querySelector(`:scope > [data-tail-of="${id}"]`) ?? undefined;
}

interface Held {
  desc: VolumeDesc;
  cells: Cell[];
  smooth: (Smooth | undefined)[];
  cloth: Element[];
  shade: Element[];
  /** The two stops of each quadrilateral's smooth shade. */
  stops: Element[][];
  groups: Element[];
  /** The group after the pieces worn on this one, which takes the near sleeve. */
  tail: Element | undefined;
}
const held = new WeakMap<Element, Held>();

function holdOf(root: Element): Held | undefined {
  const known = held.get(root);
  if (known !== undefined) return known;
  let desc: VolumeDesc;
  try {
    desc = JSON.parse(root.getAttribute("data-piece") ?? "") as VolumeDesc;
  } catch {
    return undefined;
  }
  const tail = tailOf(root);
  const index = (sel: string, attr: string): Element[] => {
    const out: Element[] = [];
    for (const r of tail === undefined ? [root] : [root, tail]) {
      r.querySelectorAll(sel).forEach((n) => {
        out[Number(n.getAttribute(attr))] = n;
      });
    }
    return out;
  };
  const stops: Element[][] = [];
  // The gradients are in the drawing's defs, outside the piece's group.
  (root.closest("svg") ?? root.ownerDocument).querySelectorAll("[data-vg]").forEach((n: Element) => {
    if (root.querySelector(`[fill="url(#${n.id})"]`) !== null || tailOf(root)?.querySelector(`[fill="url(#${n.id})"]`)) stops[Number(n.getAttribute("data-vg"))] = [...n.querySelectorAll("stop")];
  });
  const cells = pieceCells(desc);
  const entry: Held = { desc, cells, smooth: smoothOf(cells), cloth: index("[data-vc]", "data-vc"), shade: index("[data-vh]", "data-vh"), stops, groups: index(":scope > [data-vol]", "data-vol"), tail };
  held.set(root, entry);
  return entry;
}

/** Move one piece made by `pieceMarkup` to another turn: the maps, which cells show, the shade, and what is drawn in front. Returns false when `root` is not one. */
export function applyPiece(root: Element, yaw: number, tilt = 0): boolean {
  const h = holdOf(root);
  if (h === undefined) return false;
  const placed = h.cells.map((c) => placeCell(c, yaw, h.desc.pitch + tilt));
  h.cells.forEach((c, i) => {
    const pl = placed[i] as Placed;
    for (const n of [h.cloth[i], h.shade[i]]) {
      if (n === undefined) continue;
      if (pl.visible) {
        n.setAttribute("transform", pl.matrix);
        n.removeAttribute("display");
      } else n.setAttribute("display", "none");
    }
    if (!pl.visible) return;
    const sm = h.smooth[i];
    const stops = sm === undefined ? undefined : h.stops[sm.k];
    if (sm !== undefined && stops !== undefined) {
      stops[0]?.setAttribute("stop-color", greyOf(shadeOf(sm.n0, yaw, h.desc.pitch + tilt)));
      stops[1]?.setAttribute("stop-color", greyOf(shadeOf(sm.n1, yaw, h.desc.pitch + tilt)));
    } else h.shade[i]?.firstElementChild?.setAttribute("fill", greyOf(shadeOf(c.n, yaw, h.desc.pitch + tilt)));
  });
  if (isBand(h.desc)) {
    for (const i of depthOrder(placed)) {
      for (const n of [h.cloth[i], h.shade[i]]) n?.parentNode?.appendChild(n);
    }
  }
  const order = groupOrder(yaw, h.desc.hang === true);
  order.forEach((g, k) => {
    const el = h.groups[g];
    if (el !== undefined) (h.tail !== undefined && k === order.length - 1 ? h.tail : root).appendChild(el);
  });
  if (h.desc.lobes !== undefined) {
    for (const g of [h.groups[0], h.groups[3]]) {
      if (g === undefined) continue;
      for (const half of halfOrder(yaw)) {
        const el = g.querySelector(`:scope > [data-half="${half}"]`);
        if (el !== null) g.appendChild(el);
      }
    }
  }
  return true;
}
