// The turning view's body: the shirt as a garment with volume, in plain SVG. The torso is a loft of ellipses (narrow at the neck, a chest's depth at the armpit) and each sleeve a tapered tube, and
// the flat front and back drawings are wrapped over them: each surface is cut into a grid of small cells, every cell a clipped copy of its face's drawing under an affine map worked out from where its
// corners lie in space after the turn. Only the maps, the visibility and the shade change from one angle to the next; the cells, their clips and the drawings do not. Pure and deterministic: no
// clock, no random number, no DOM except `applyVolume`, which moves a frame that is already drawn.
import { shapeOf } from "./jersey.ts";
import type { Resolved } from "./options.ts";
import { n2 } from "./path.ts";

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
  sl: { s: -1 | 1; q: number[] }[];
  /** How far the camera looks down, in degrees. */
  pitch: number;
}

/** A matrix's linear part is written to four decimals: it is multiplied by coordinates up to 200, so two would put a cell a unit off its neighbour. */
const n4 = (x: number): string => String(Math.round(x * 10000) / 10000 || 0);
const rad = (deg: number): number => (deg * Math.PI) / 180;
const PAD = 1.2;
const SLEEVE_DEPTH = 0.75;
/** The exponent of the torso's cross-section in depth: 2 is an ellipse, more is a fuller, squarer body that fills out to the sleeves. */
const FULL = 4;
const BODY_DEPTH = 0.6;

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
  const y = [ny - 6, ny, sy, (sy + ay) / 2, ay, ay + (spec.hy - ay) / 3, ay + (2 * (spec.hy - ay)) / 3, hem];
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
  return { y: y.map(r2), a: a.map(r2), b: b.map(r2), nt: 8, nf: 3, nh: 5, sl, pitch };
}

/** One cell: a triangle, where it is on its drawing, where its corners lie in space and the way the cloth faces there. Two make a quadrilateral of the grid, and a triangle's map is exact at its corners, so its neighbours meet it with no gap. */
export interface Cell {
  /** 0 the torso's front half, 3 its back half, 1 and 2 the sleeve on the picture's left and right. */
  g: 0 | 1 | 2 | 3;
  back: boolean;
  tex: number[];
  p: number[];
  n: [number, number, number];
}

/** The two triangles of a quadrilateral given as the corners tl, tr, bl, br (x, y of the drawing, and x, y, z of the space). */
function split(g: Cell["g"], back: boolean, tex: number[], p: number[], n: [number, number, number]): Cell[] {
  const pick = (ks: number[]): { tex: number[]; p: number[] } => ({ tex: ks.flatMap((k) => [tex[2 * k] as number, tex[2 * k + 1] as number]), p: ks.flatMap((k) => [p[3 * k] as number, p[3 * k + 1] as number, p[3 * k + 2] as number]) });
  return [pick([0, 1, 2]), pick([1, 3, 2])].map((t) => ({ g, back, tex: t.tex, p: t.p, n }));
}

const lerp2 = (p: readonly number[], q: readonly number[], t: number): [number, number] => [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t];

/** The way a cell of four corners faces: the cross product of its two sides, turned to point away from `(cx, cy, cz)`, the middle of the ring it lies on. */
function normalOf(p: readonly number[], cx: number, cy: number, cz: number): [number, number, number] {
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
          tex.push(100 + (d.a[jj] as number) * Math.sin(t), d.y[jj] as number);
          p.push(sg * (d.a[jj] as number) * Math.sin(t), d.y[jj] as number, sg * (d.b[jj] as number) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(Math.sin(t)), FULL)), 1 / FULL));
        }
        cells.push(...split(back ? 3 : 0, back, tex, p, normalOf(p, 0, (d.y[j]! + d.y[j + 1]!) / 2, 0)));
      }
    }
  }
  for (const [si, sleeve] of d.sl.entries()) {
    const g = (si + 1) as 1 | 2;
    const q = sleeve.q;
    const S = [q[0], q[1]] as const;
    const P = [q[2], q[3]] as const;
    const A = [q[4], q[5]] as const;
    const Q = [q[6], q[7]] as const;
    for (const back of [false, true]) {
      for (let k = 0; k < d.nf; k++) {
        for (let i = 0; i < d.nh; i++) {
          const tex: number[] = [];
          const p: number[] = [];
          const at = (f: number, th: number): void => {
            const o = lerp2(S, P, f);
            const inn = lerp2(A, Q, f);
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
            p.push(cx, cy, (back ? -1 : 1) * SLEEVE_DEPTH * rr * Math.cos(th));
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
          const o = lerp2(S, P, fc);
          const inn = lerp2(A, Q, fc);
          const n = normalOf(p, (o[0] + inn[0]) / 2 - 100, (o[1] + inn[1]) / 2, 0);
          cells.push(...split(g, back, tex, p, n));
        }
      }
    }
  }
  return cells;
}

/** A point turned by `yaw` about the vertical and tipped by `pitch`: the picture's x and y, and the way it faces the viewer. */
function turn(x: number, y: number, z: number, cy: number, sy: number, cp: number, sp: number): [number, number, number] {
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  return [x1, y * cp + z1 * sp, z1 * cp - y * sp];
}

/** Light from above, to the left and in front, as a unit vector (y is down). */
const LIGHT: readonly [number, number, number] = [-0.4, -0.5, 0.77];

export interface Placed {
  visible: boolean;
  matrix: string;
  /** The black laid over the cell, 0 to about 0.4. */
  shade: number;
  /** How near the cell's middle is to the viewer. */
  depth: number;
}

/** Where one cell goes at one turn. */
export function placeCell(c: Cell, yaw: number, pitch: number): Placed {
  const cy = Math.cos(rad(yaw));
  const sy = Math.sin(rad(yaw));
  const cp = Math.cos(rad(pitch));
  const sp = Math.sin(rad(pitch));
  const s: number[] = [];
  let z = 0;
  for (let k = 0; k < 3; k++) {
    const t = turn(c.p[3 * k] as number, c.p[3 * k + 1] as number, c.p[3 * k + 2] as number, cy, sy, cp, sp);
    s.push(t[0] + 100, t[1]);
    z += t[2];
  }
  const nn = turn(c.n[0], c.n[1], c.n[2], cy, sy, cp, sp);
  const facing = nn[2];
  if (facing <= 0.01) return { visible: false, matrix: "", shade: 0, depth: z / 3 };
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
  return { visible: true, matrix: `matrix(${n4(a)} ${n4(b)} ${n4(c2)} ${n4(d)} ${n2(e)} ${n2(f)})`, shade: Math.round(shade * 100) / 100, depth: z / 3 };
}

/** Which side's sleeve is nearer the viewer at this turn: -1 for the picture's left sleeve, 1 for the right, 0 when neither (face on or from behind). */
export function nearSleeve(yaw: number): -1 | 0 | 1 {
  const s = Math.sin(rad(yaw));
  return Math.abs(s) < 0.02 ? 0 : s > 0 ? -1 : 1;
}

/** The order the groups of cells are drawn in, farthest first: the sleeve that is behind the body, the half of the body that is behind, the half in front, the sleeve in front. */
export function groupOrder(yaw: number): number[] {
  const torso = Math.cos(rad(yaw)) >= 0 ? [3, 0] : [0, 3];
  return nearSleeve(yaw) === -1 ? [2, ...torso, 1] : [1, ...torso, 2];
}

/** The triangle of a cell, grown a little on every side so neighbouring cells overlap and no hairline shows between them. */
function quadPath(tex: readonly number[]): string {
  const cx = (tex[0]! + tex[2]! + tex[4]!) / 3;
  const cy = (tex[1]! + tex[3]! + tex[5]!) / 3;
  let d = "";
  for (let k = 0; k < 3; k++) {
    const x = tex[2 * k] as number;
    const y = tex[2 * k + 1] as number;
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const g = 0.55;
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
export function volumeMarkup(d: VolumeDesc, uid: string, frontId: string, backId: string, frontClip: string, backClip: string, yaw: number, shaded: boolean): VolumeMarkup {
  const cells = cellsOf(d);
  let defs = "";
  const groups: [string, string, string, string] = ["", "", "", ""];
  cells.forEach((c, i) => {
    defs += `<path id="${uid}q${i}" d="${quadPath(c.tex)}"/><clipPath id="${uid}k${i}"><use href="#${uid}q${i}"/></clipPath>`;
    const pl = placeCell(c, yaw, d.pitch);
    const shadeEl = shaded ? `<use href="#${uid}q${i}" fill="#000" fill-opacity="${pl.shade}" clip-path="url(#${c.back ? backClip : frontClip})" data-vs=""/>` : "";
    groups[c.g] += `<g data-vc="${i}"${pl.visible ? ` transform="${pl.matrix}"` : ' display="none"'} clip-path="url(#${uid}k${i})"><use href="#${c.back ? backId : frontId}"/>${shadeEl}</g>`;
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
