import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi } from "../src/judogi.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { placeCell, type VolumeDesc } from "../src/volume.ts";

// The worn suit: the trousers sit inside the jacket's skirt. The graphics card judges every piece by nearness at each point, so a trouser cell nearer
// than the skirt's cloth at a point the skirt covers shows through it (the canvas and the SVG draw the trousers first and the jacket over them,
// so for them the skirt always covers). This puts both pieces on a depth buffer as the graphics card sees them and counts the points where a
// trouser cell is in front of the jacket's body or sleeves, side on and a little round.
const K = 2;
const W = 800;
const OFF = 100;
const rad = (d: number): number => (d * Math.PI) / 180;
const WORN_AT = 102;

const piecesOf = (o: object): { jacket: VolumeDesc; pants: VolumeDesc } => {
  const svg = renderJudogi({ mode: "suit", colour: "white", yaw: 0, width: 360, ...o });
  const all = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse(m[1]!.replace(/&quot;/g, '"')) as VolumeDesc);
  return { jacket: all.find((d) => d.strap === undefined && d.collar === undefined && d.hang === undefined)!, pants: all.find((d) => d.hang === true)! };
};

/** The nearest cloth of a piece at each point of the picture, as the graphics card's buffer holds it (larger is nearer). */
function depthBuffer(desc: VolumeDesc, yaw: number, dy: number): Float32Array {
  const z = new Float32Array(W * W).fill(-1e9);
  const sinP = Math.sin(rad(desc.pitch));
  for (const c of pieceCells(desc)) {
    const q = placeCell(c, yaw, desc.pitch, true);
    if (!q.visible || q.tri === undefined) continue;
    const t = [0, 1, 2].map((k) => [q.tri![3 * k]! * K + OFF, (q.tri![3 * k + 1]! + dy) * K + OFF, q.tri![3 * k + 2]! - dy * sinP] as [number, number, number]);
    const [a, b, d] = t as [[number, number, number], [number, number, number], [number, number, number]];
    const det = (b[1] - d[1]) * (a[0] - d[0]) + (d[0] - b[0]) * (a[1] - d[1]);
    if (Math.abs(det) < 1e-9) continue;
    for (let y = Math.max(0, Math.floor(Math.min(a[1], b[1], d[1]))); y <= Math.min(W - 1, Math.ceil(Math.max(a[1], b[1], d[1]))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(a[0], b[0], d[0]))); x <= Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], d[0]))); x++) {
        const l1 = ((b[1] - d[1]) * (x + 0.5 - d[0]) + (d[0] - b[0]) * (y + 0.5 - d[1])) / det;
        const l2 = ((d[1] - a[1]) * (x + 0.5 - d[0]) + (a[0] - d[0]) * (y + 0.5 - d[1])) / det;
        if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
        const near = l1 * a[2] + l2 * b[2] + (1 - l1 - l2) * d[2];
        if (near > z[y * W + x]!) z[y * W + x] = near;
      }
    }
  }
  return z;
}

const SUITS: [string, object][] = [
  ["a judogi with its belt tied", { belt: "white" }],
  ["a judogi with no belt", { belt: "none" }],
  ["a judogi in thick cloth", { belt: "white", thickness: 20 }],
  ["a karate gi", { belt: "black", karate: true }],
  ["a jiu-jitsu gi", { belt: "black", bjj: true }],
  ["a dobok", { belt: "black", dobok: true }],
  ["an ITF 5th Dan dobok", { belt: "black", dobok: { cut: "itf", grade: "dan", dan: 5 } }],
];

test("worn under the jacket, the trousers are never in front of its skirt, side on and a little round", () => {
  for (const [name, o] of SUITS) {
    const { jacket, pants } = piecesOf(o);
    for (const yaw of [60, 75, 90, 105, 120, 240, 255, 270, 285, 300]) {
      const jz = depthBuffer(jacket, yaw, 0);
      const pz = depthBuffer(pants, yaw, WORN_AT);
      let both = 0;
      let least = Infinity;
      for (let i = 0; i < W * W; i++) {
        if (jz[i]! < -1e8 || pz[i]! < -1e8) continue;
        both++;
        least = Math.min(least, jz[i]! - pz[i]!);
      }
      assert.ok(both > 2000, `${name} at ${yaw} degrees: the trousers lie under the jacket over ${both} points`);
      assert.ok(least >= 0.25, `${name} at ${yaw} degrees: a trouser cell is ${(0.25 - least).toFixed(2)} short of lying behind the skirt's cloth`);
    }
  }
});
