import assert from "node:assert/strict";
import { test } from "node:test";
import { collarDesc, jacketDesc, jacketOpening } from "../src/judogiJacket.ts";
import { collarPiece } from "../src/judogiCollar.ts";
import { INNER_DY } from "../src/judogiInner.ts";
import { buildMarks, readMarks } from "../src/judogiMarks.ts";
import { depthOrder, pieceCells } from "../src/pieceVolume.ts";
import { bodyPoint, placeCell, turn, type Cell, type Placed } from "../src/volume.ts";

// The jacket is solid cloth from any side: the outer shells, the inner faces of the upper body and the collar leave no background showing inside the
// neck's opening, the neck label is on the inside of the back panel and so is seen only from the front through the opening, and a collar's near parts
// are drawn over its far parts. The cells are filled on a grid, a little grown as the painters grow them.
const K = 2;
const W = 330 * K;
const H = 330 * K;
const body = jacketDesc(1, false);
const collar = collarPiece(collarDesc(body), body.pitch);
const bodyCells = pieceCells(body);
const collarCells = pieceCells(collar);

const inPoly = (x: number, y: number, poly: readonly (readonly [number, number])[]): boolean => {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i] as [number, number];
    const [xj, yj] = poly[j] as [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
};

/** A cell that has cloth: the front's cells inside the V cut between the lapels sample a drawing with nothing in it. */
const hasCloth = (c: Cell): boolean => {
  if (c.back || c.g !== 0 || c.tex[1]! >= INNER_DY - 12) return true;
  const mx = (c.tex[0]! + c.tex[2]! + c.tex[4]!) / 3;
  const my = (c.tex[1]! + c.tex[3]! + c.tex[5]!) / 3;
  return !inPoly(mx, my, jacketOpening());
};

const grown = (q: Placed, by = 1): [number, number, number][] => {
  const t = [0, 1, 2].map((k) => [q.tri![3 * k]! * K + 40 * K, q.tri![3 * k + 1]! * K + 20 * K, q.tri![3 * k + 2]!] as [number, number, number]);
  const mx = (t[0]![0] + t[1]![0] + t[2]![0]) / 3;
  const my = (t[0]![1] + t[1]![1] + t[2]![1]) / 3;
  return t.map(([x, y, z]) => {
    const l = Math.hypot(x - mx, y - my) || 1;
    return [x + ((x - mx) / l) * by, y + ((y - my) / l) * by, z] as [number, number, number];
  });
};

/** Calls `hit(pixel, nearness)` for each pixel a triangle covers. */
function fill(g: [number, number, number][], hit: (p: number, z: number) => void): void {
  const [a, b, d] = g as [[number, number, number], [number, number, number], [number, number, number]];
  const det = (b[1] - d[1]) * (a[0] - d[0]) + (d[0] - b[0]) * (a[1] - d[1]);
  if (Math.abs(det) < 1e-9) return;
  for (let y = Math.max(0, Math.floor(Math.min(a[1], b[1], d[1]))); y <= Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], d[1]))); y++) {
    for (let x = Math.max(0, Math.floor(Math.min(a[0], b[0], d[0]))); x <= Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], d[0]))); x++) {
      const l1 = ((b[1] - d[1]) * (x + 0.5 - d[0]) + (d[0] - b[0]) * (y + 0.5 - d[1])) / det;
      const l2 = ((d[1] - a[1]) * (x + 0.5 - d[0]) + (a[0] - d[0]) * (y + 0.5 - d[1])) / det;
      if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) hit(y * W + x, l1 * a[2] + l2 * b[2] + (1 - l1 - l2) * d[2]);
    }
  }
}

/** The corners of the convex hull of points. */
function hull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]): [number, number][] => {
    const out: [number, number][] = [];
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, q) <= 0) out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...half(p), ...half([...p].reverse())];
}

/** Whether a point (in grid pixels) lies inside the polygon. */
const inside = (x: number, y: number, poly: [number, number][]): boolean => inPoly(x, y, poly);

interface Seen {
  cover: Uint8Array;
  /** The pixels inside the neck's outer outline that no cell covers. */
  holes: number;
  neck: number;
}

/** The jacket seen at a turn: the pixels covered by its cloth and the collar, and how many pixels inside the neck's opening nothing covers (bar the V's own cut, which is open to the room beyond). */
function seen(yaw: number, tilt: number): Seen {
  const cover = new Uint8Array(W * H);
  const mark = (cells: Cell[], desc: typeof body): void => {
    for (const c of cells) {
      if (!hasCloth(c)) continue;
      const q = placeCell(c, yaw, desc.pitch + tilt);
      if (q.visible && q.tri !== undefined) fill(grown(q), (p) => (cover[p] = 1));
    }
  };
  mark(bodyCells, body);
  mark(collarCells, collar);
  const cy = Math.cos((yaw * Math.PI) / 180);
  const sy = Math.sin((yaw * Math.PI) / 180);
  const cp = Math.cos(((body.pitch + tilt) * Math.PI) / 180);
  const sp = Math.sin(((body.pitch + tilt) * Math.PI) / 180);
  const screen = (x: number, y: number, z: number): [number, number] => {
    const t = turn(x, y, z, cy, sy, cp, sp);
    return [(t[0] + 100) * K + 40 * K, t[1] * K + 20 * K];
  };
  // The neck's opening: the top edge of the body, all the way round.
  const pts: [number, number][] = [];
  for (const c of bodyCells) for (let k = 0; k < 3; k++) if (c.p[3 * k + 1] === body.y[0]) pts.push(screen(c.p[3 * k]!, c.p[3 * k + 1]!, c.p[3 * k + 2]!));
  const outline = hull(pts);
  // The V between the lapels is cut through the cloth: through it the room shows, beyond the jacket.
  const v = jacketOpening().flatMap((p, i, all) => {
    const q = all[(i + 1) % all.length]!;
    return [0, 0.25, 0.5, 0.75].map((f) => bodyPoint(body, p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f));
  }).map(([x, y, z]) => screen(x, y, z));
  const vx = v.reduce((a, p) => a + p[0], 0) / v.length;
  const vy = v.reduce((a, p) => a + p[1], 0) / v.length;
  const cut = v.map(([x, y]): [number, number] => [x + (x - vx) * 0.15, y + (y - vy) * 0.15]);
  let holes = 0;
  let neck = 0;
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H || !inside(x + 0.5, y + 0.5, outline)) continue;
      neck++;
      const open = cover[y * W + x] === 0 && !inside(x + 0.5, y + 0.5, cut);
      if (open) holes++;
    }
  }
  return { cover, holes, neck };
}

test("no background shows inside the neck's opening at any turn or tip", () => {
  let worst = 0;
  let where = "";
  for (let yaw = 0; yaw < 360; yaw += 15) {
    // From above (the neck is looked into) the opening shows cloth; from below, over the back collar's top, a line of sight leaves for the sky.
    for (const tilt of [0, 15, 30]) {
      const s = seen(yaw, tilt);
      const hole = s.holes / (K * K);
      if (hole > worst) {
        worst = hole;
        where = `yaw ${yaw}, tilt ${tilt}`;
      }
    }
  }
  assert.ok(worst <= 1, `${worst.toFixed(1)} square units of background inside the neck at ${where}`);
});

test("the neck label and the size tag are on the inside of the back panel, below the collar, and are seen only from the front, through the opening", () => {
  const cloth: [number, number, number] = [248, 247, 243];
  const marks = buildMarks("t", readMarks({ branding: true })!, cloth, 12);
  const without = buildMarks("t", readMarks({ branding: { neckLabel: false } })!, cloth, 12);
  assert.ok(marks.jacket.backInner !== undefined && without.jacket.backInner === undefined, "the label is a mark of the inner face");
  assert.equal(marks.jacket.front?.body.length, without.jacket.front?.body.length, "none of it is on the front's drawing (it used to sit on a flat card there)");
  assert.equal(marks.jacket.back?.body.length, without.jacket.back?.body.length, "nor on the outside of the back");
  // The inner face of the back panel: back cells whose drawing is the inner one.
  // The cells under the label, at the middle of the back panel.
  const innerBack = bodyCells.filter((c) => c.back && c.tex[1]! >= INNER_DY && c.g === 3 && Math.abs((c.p[0]! + c.p[3]! + c.p[6]!) / 3) < 12);
  assert.ok(innerBack.length > 8, "the back panel has inner cells");
  const count = (yaw: number, tilt: number): number => innerBack.filter((c) => placeCell(c, yaw, body.pitch + tilt).visible).length;
  for (const tilt of [-30, 0, 30]) {
    for (let yaw = 120; yaw <= 240; yaw += 15) if (tilt >= 0) assert.equal(count(yaw, tilt), 0, `the inside of the back is hidden from behind (yaw ${yaw}, tilt ${tilt})`);
    for (let yaw = -45; yaw <= 45; yaw += 15) assert.ok(count(yaw, tilt) > 8, `the inside of the back is seen from the front (yaw ${yaw}, tilt ${tilt})`);
  }
});

test("the collar is seated on the neck's rim, with no gap to the cloth under it", () => {
  // At the back of the neck the band's inner face lies on the body's outer surface: no standoff between them.
  const back = collarCells.filter((c) => c.p[1]! < 16 && c.p[2]! < -5);
  assert.ok(back.length > 10);
  const bodyZ = (y: number): number => {
    let j = 0;
    while (j + 2 < body.y.length && (body.y[j + 1] as number) < y) j++;
    const r = Math.max(0, Math.min(1, (y - (body.y[j] as number)) / ((body.y[j + 1] as number) - (body.y[j] as number) || 1)));
    return (body.b[j] as number) + ((body.b[j + 1] as number) - (body.b[j] as number)) * r;
  };
  // The band's innermost point at the middle of the back is within 1.5 units of the body's surface (its own thickness aside).
  const mid = back.filter((c) => Math.abs(c.p[0]!) < 3);
  const nearest = Math.min(...mid.flatMap((c) => [0, 1, 2].map((k) => Math.abs(Math.abs(c.p[3 * k + 2]!) - bodyZ(Math.max(6, c.p[3 * k + 1]!))))));
  assert.ok(nearest < 1.5, `the band is ${nearest.toFixed(2)} units off the cloth`);
});

test("a collar's near cells are drawn after the far ones it overlaps, at every turn and tip", () => {
  let worst = 0;
  let where = "";
  for (let yaw = 0; yaw < 360; yaw += 30) {
    for (const tilt of [-30, 0, 30]) {
      const placed = collarCells.map((c) => placeCell(c, yaw, collar.pitch + tilt));
      const order = depthOrder(placed);
      // Paint in order into a grid keeping the nearness last painted, and compare with the nearest cell that covers each pixel.
      const last = new Float32Array(W * H).fill(-1e9);
      const best = new Float32Array(W * H).fill(-1e9);
      let covered = 0;
      for (const i of order) {
        const q = placed[i] as Placed;
        if (!q.visible || q.tri === undefined) continue;
        // The cells as they are (the painters grow each a little, and a grown edge over a neighbour's is no mistake of order).
        fill(grown(q, 0), (p, z) => {
          last[p] = z;
          if (z > best[p]!) best[p] = z;
        });
      }
      // The painted one hides the nearer one only where it is clearly farther than the nearest (the grown edges of neighbours differ by under a unit).
      let wrong = 0;
      for (let p = 0; p < W * H; p++) {
        if (best[p]! <= -1e8) continue;
        covered++;
        if (best[p]! - last[p]! > 1.5) wrong++;
      }
      const frac = covered === 0 ? 0 : (100 * wrong) / covered;
      if (frac > worst) {
        worst = frac;
        where = `yaw ${yaw}, tilt ${tilt}`;
      }
    }
  }
  assert.ok(worst < 0.6, `${worst.toFixed(2)} per cent of the collar's pixels show a far cell over a near one at ${where}`);
});

/**
 * The jacket seen at a turn, alone: how many pixels inside its silhouette (the union of every cell, whichever way it faces) no visible cell covers. The V
 * between the lapels is cut through the cloth and is left out; looking up into the open bottom, or down through the neck, a line of sight must end on cloth.
 */
function bareInside(yaw: number, tilt: number): { bare: number; area: number } {
  const cy = Math.cos((yaw * Math.PI) / 180);
  const sy = Math.sin((yaw * Math.PI) / 180);
  const cp = Math.cos(((body.pitch + tilt) * Math.PI) / 180);
  const sp = Math.sin(((body.pitch + tilt) * Math.PI) / 180);
  const screen = (x: number, y: number, z: number): [number, number] => {
    const t = turn(x, y, z, cy, sy, cp, sp);
    return [(t[0] + 100) * K + 40 * K, t[1] * K + 20 * K];
  };
  const sil = new Uint8Array(W * H);
  const cover = new Uint8Array(W * H);
  for (const cells of [bodyCells, collarCells]) {
    for (const c of cells) {
      const g = [0, 1, 2].map((k) => {
        const [x, y] = screen(c.p[3 * k]!, c.p[3 * k + 1]!, c.p[3 * k + 2]!);
        return [x, y, 0] as [number, number, number];
      });
      fill(g, (p) => (sil[p] = 1));
    }
    for (const c of cells) {
      if (!hasCloth(c)) continue;
      const q = placeCell(c, yaw, (cells === bodyCells ? body : collar).pitch + tilt);
      if (q.visible && q.tri !== undefined) fill(grown(q, 1.5), (p) => (cover[p] = 1));
    }
  }
  const v = jacketOpening().flatMap((p, i, all) => {
    const q = all[(i + 1) % all.length]!;
    return [0, 0.25, 0.5, 0.75].map((f) => bodyPoint(body, p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f));
  }).map(([x, y, z]) => screen(x, y, z));
  const vx = v.reduce((a, p) => a + p[0], 0) / v.length;
  const vy = v.reduce((a, p) => a + p[1], 0) / v.length;
  const cut = v.map(([x, y]): [number, number] => [x + (x - vx) * 0.15, y + (y - vy) * 0.15]);
  let bare = 0;
  let area = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (sil[y * W + x] === 0) continue;
      area++;
      // A sliver along the silhouette's own edge is a grazing cell, not a hole: only pixels well inside count.
      const E = 5;
      if (x < E || y < E || x >= W - E || y >= H - E || sil[y * W + x - E] === 0 || sil[y * W + x + E] === 0 || sil[(y - E) * W + x] === 0 || sil[(y + E) * W + x] === 0) continue;
      if (cover[y * W + x] === 0 && !inside(x + 0.5, y + 0.5, cut)) bare++;
    }
  }
  return { bare: bare / (K * K), area: area / (K * K) };
}

test("tipped to look up into the open bottom, the jacket alone shows its inside, and no background, at every turn", () => {
  let worst = 0;
  let where = "";
  for (let yaw = 0; yaw < 360; yaw += 20) {
    for (const tilt of [-15, -26, -35]) {
      const { bare } = bareInside(yaw, tilt);
      if (bare > worst) {
        worst = bare;
        where = `yaw ${yaw}, tilt ${tilt}`;
      }
    }
  }
  assert.ok(worst <= 25, `${worst.toFixed(1)} square units of background inside the jacket's silhouette at ${where}`);
});

test("the open bottom has a hem rim and the inner faces and walls run down to it", () => {
  const rimmed = bodyCells.filter((c) => c.tex[1]! >= INNER_DY + 88 && c.p[1]! >= (body.y[body.y.length - 1] as number) - 0.01 && c.p[4]! >= (body.y[body.y.length - 1] as number) - 0.01);
  assert.ok(rimmed.length >= 12, `${rimmed.length} cells in the hem's rim`);
  const lowest = Math.max(...bodyCells.filter((c) => c.tex[1]! >= INNER_DY).flatMap((c) => [c.p[1]!, c.p[4]!, c.p[7]!]));
  assert.equal(lowest, body.y[body.y.length - 1], "the inner faces reach the hem");
});
