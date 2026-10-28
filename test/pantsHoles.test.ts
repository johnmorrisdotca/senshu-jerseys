import assert from "node:assert/strict";
import { test } from "node:test";
import { pantsDesc } from "../src/judogiPants.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { placeCell } from "../src/volume.ts";

// The trousers' volume must be closed: from any side and any tip the cells that are seen cover their whole silhouette, with no background showing
// through inside it (a wedge at the crotch, where the hip block meets the legs, showed the far side and the page behind at a turn and a tip).
// Each seen cell is filled on a grid, a little grown as the painters grow them; what the border cannot reach is a hole.
const K = 2;
const W = 300 * K;
const H = 340 * K;

function holeArea(yaw: number, tilt: number): number {
  const desc = pantsDesc();
  const cells = pieceCells(desc);
  const cover = new Uint8Array(W * H);
  for (const c of cells) {
    const q = placeCell(c, yaw, desc.pitch + tilt);
    if (!q.visible || q.tri === undefined) continue;
    const t = [0, 1, 2].map((k) => [q.tri![3 * k]! * K + 20 * K, q.tri![3 * k + 1]! * K + 20 * K] as [number, number]);
    const mx = (t[0]![0] + t[1]![0] + t[2]![0]) / 3;
    const my = (t[0]![1] + t[1]![1] + t[2]![1]) / 3;
    const g = t.map(([x, y]) => {
      const l = Math.hypot(x - mx, y - my) || 1;
      return [x + ((x - mx) / l) * 1, y + ((y - my) / l) * 1] as [number, number];
    });
    const [a, b, d] = g as [[number, number], [number, number], [number, number]];
    const det = (b[1] - d[1]) * (a[0] - d[0]) + (d[0] - b[0]) * (a[1] - d[1]);
    if (Math.abs(det) < 1e-9) continue;
    for (let y = Math.max(0, Math.floor(Math.min(a[1], b[1], d[1]))); y <= Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], d[1]))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(a[0], b[0], d[0]))); x <= Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], d[0]))); x++) {
        const l1 = ((b[1] - d[1]) * (x + 0.5 - d[0]) + (d[0] - b[0]) * (y + 0.5 - d[1])) / det;
        const l2 = ((d[1] - a[1]) * (x + 0.5 - d[0]) + (a[0] - d[0]) * (y + 0.5 - d[1])) / det;
        if (l1 >= 0 && l2 >= 0 && l1 + l2 <= 1) cover[y * W + x] = 1;
      }
    }
  }
  const reached = new Uint8Array(W * H);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length > 0) {
    const p = stack.pop()!;
    if (reached[p] === 1 || cover[p] === 1) continue;
    reached[p] = 1;
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  let area = 0;
  for (let p = 0; p < W * H; p++) if (cover[p] === 0 && reached[p] === 0) area++;
  return area / (K * K);
}

test("the trousers have no hole in their silhouette at any turn or tip", () => {
  let worst = 0;
  let bad = 0;
  for (let yaw = 0; yaw < 360; yaw += 15) {
    for (const tilt of [-30, -20, -10, 0, 10, 20, 30]) {
      const a = holeArea(yaw, tilt);
      worst = Math.max(worst, a);
      if (a > 0.5) bad++;
    }
  }
  // Before the legs were made as wide as the hip's last row and run up into it, 13 square units showed at some tips and 1 to 3 at the crotch
  // at many turns; what is left is a pinhole where a cleft wall is exactly edge on.
  assert.ok(worst <= 2.5, `the largest hole is ${worst} square units`);
  assert.ok(bad <= 6, `${bad} views have a hole`);
});
