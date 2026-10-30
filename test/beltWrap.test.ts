import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi } from "../src/judogi.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { paintOrder, type PaintPiece } from "../src/judogiGl.ts";
import { ROUND } from "../src/judogiStrap.ts";
import { nearSleeve, turn, type Cell, type VolumeDesc } from "../src/volume.ts";

// The jacket with its belt as the designer draws it: the pieces' own descriptions are read back from the drawing.
const pieces = (): { jacket: VolumeDesc; strap: VolumeDesc } => {
  const svg = renderJudogi({ mode: "jacket", belt: "orange", yaw: 0, width: 360 });
  const all = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse(m[1]!.replace(/&quot;/g, '"')) as VolumeDesc);
  return { jacket: all.find((d) => d.strap === undefined && d.collar === undefined)!, strap: all.find((d) => d.strap !== undefined)! };
};

const rad = (d: number): number => (d * Math.PI) / 180;
type P2 = [number, number];
type Tri = [P2, P2, P2];

const project = (c: Cell, yaw: number, pitch: number): { tri: Tri; depth: number[] }[] => {
  const [cy, sy, cp, sp] = [Math.cos(rad(yaw)), Math.sin(rad(yaw)), Math.cos(rad(pitch)), Math.sin(rad(pitch))];
  const v = [0, 1, 2].map((k) => turn(c.p[3 * k]!, c.p[3 * k + 1]!, c.p[3 * k + 2]!, cy, sy, cp, sp));
  return [{ tri: v.map((q) => [q[0], q[1]]) as Tri, depth: v.map((q) => q[2]) }];
};

const side = (p: P2, a: P2, b: P2): number => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const inside = (p: P2, t: Tri): boolean => {
  const s = [side(p, t[0], t[1]), side(p, t[1], t[2]), side(p, t[2], t[0])];
  return s.every((v) => v >= 0) || s.every((v) => v <= 0);
};
const gap = (p: P2, a: P2, b: P2): number => {
  const l = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 || 1;
  const f = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l));
  return Math.hypot(p[0] - a[0] - f * (b[0] - a[0]), p[1] - a[1] - f * (b[1] - a[1]));
};
/** How far a point is from a triangle on the picture: nothing inside it. */
const away = (p: P2, t: Tri): number => (inside(p, t) ? 0 : Math.min(gap(p, t[0], t[1]), gap(p, t[1], t[2]), gap(p, t[2], t[0])));

const YAWS = [0, 60, 90, 105, 120, 240, 255, 270, 285];
const TILTS = [-20, 0, 15];

test("the belt's hanging ends lie on the skirt: from the side they stay within a belt's thickness of the body's outline", () => {
  const { jacket, strap } = pieces();
  const torso = pieceCells(jacket).filter((c) => (c.g === 0 || c.g === 3) && c.inside !== true);
  const s = strap.strap!;
  // Below the knot only the hanging ends are: every corner of a cell there.
  const tails = pieceCells(strap).slice(ROUND * 6).filter((c) => c.p.every((_, k) => k % 3 !== 1 || (c.p[k] as number) > s.y + s.sag + s.w + 8));
  assert.ok(tails.length > 20, "the hanging ends are found");
  const thick = s.t + 1.8 + 0.6;
  let worst = 0;
  for (const yaw of YAWS) {
    for (const tilt of TILTS) {
      const body = torso.flatMap((c) => project(c, yaw, jacket.pitch + tilt).map((q) => q.tri));
      for (const c of tails) {
        for (const q of project(c, yaw, jacket.pitch + tilt)) {
          for (const v of q.tri) {
            const d = Math.min(...body.map((t) => away(v, t)));
            worst = Math.max(worst, d);
            assert.ok(d <= thick, `yaw ${yaw}, tilt ${tilt}: a hanging end stands ${d.toFixed(1)} off the body's outline (a belt is ${thick.toFixed(1)} thick, with its gap)`);
          }
        }
      }
    }
  }
  assert.ok(worst > 0, "the check sees them reach the outline");
});

test("the knot stays against the belt's front: no part of it is more than a knot's thickness off the body's outline", () => {
  const { jacket, strap } = pieces();
  const torso = pieceCells(jacket).filter((c) => (c.g === 0 || c.g === 3) && c.inside !== true);
  const s = strap.strap!;
  const knot = pieceCells(strap).slice(ROUND * 6).filter((c) => c.p.every((_, k) => k % 3 !== 1 || (c.p[k] as number) <= s.y + s.sag + s.w + 8));
  assert.ok(knot.length > 20, "the knot is found");
  // Three layers of strap over the belt and its gap: about 3 cm out from the cloth.
  const room = 9.5;
  for (const yaw of YAWS) {
    for (const tilt of TILTS) {
      const body = torso.flatMap((c) => project(c, yaw, jacket.pitch + tilt).map((q) => q.tri));
      for (const c of knot) {
        for (const q of project(c, yaw, jacket.pitch + tilt)) {
          for (const v of q.tri) {
            const d = Math.min(...body.map((t) => away(v, t)));
            assert.ok(d <= room, `yaw ${yaw}, tilt ${tilt}: the knot stands ${d.toFixed(1)} off the body's outline`);
          }
        }
      }
    }
  }
});

test("the band is behind the near sleeve wherever they cover one another", () => {
  const { jacket, strap } = pieces();
  const ring = pieceCells(strap).slice(0, ROUND * 6);
  const cloth = pieceCells(jacket);
  let covered = 0;
  for (const yaw of [60, 90, 105, 120, 240, 255, 270, 285]) {
    const near = nearSleeve(yaw) === -1 ? 1 : 2;
    for (const tilt of TILTS) {
      const pitch = jacket.pitch + tilt;
      const sleeve = cloth.filter((c) => c.g === near && c.inside !== true).flatMap((c) => project(c, yaw, pitch));
      for (const c of ring) {
        const q = project(c, yaw, pitch)[0]!;
        const mid: P2 = [(q.tri[0][0] + q.tri[1][0] + q.tri[2][0]) / 3, (q.tri[0][1] + q.tri[1][1] + q.tri[2][1]) / 3];
        const mine = (q.depth[0]! + q.depth[1]! + q.depth[2]!) / 3;
        // Nearer is larger: the sleeve's nearest cloth over the band's middle must be nearer than the band there.
        const over = sleeve.filter((o) => inside(mid, o.tri));
        if (over.length === 0) continue;
        covered++;
        assert.ok(Math.max(...over.map((o) => (o.depth[0]! + o.depth[1]! + o.depth[2]!) / 3)) > mine - 1, `yaw ${yaw}, tilt ${tilt}: the band is nearer than the sleeve over it`);
      }
    }
  }
  assert.ok(covered > 50, "the sleeve covers the band at some turns");
});

test("the painter draws the near sleeve after the belt, at every turn the sleeve hangs over it", () => {
  const { jacket, strap } = pieces();
  const piece = (desc: VolumeDesc): PaintPiece => ({ desc, cells: pieceCells(desc), smooth: [], front: {} as CanvasImageSource, back: {} as CanvasImageSource, dx: 0, dy: 0 });
  const pieceList = [piece(jacket), piece(strap)];
  for (const yaw of [60, 90, 105, 120, 240, 255, 270, 285]) {
    const order = paintOrder(pieceList, yaw, -20);
    const belt = order.findIndex((j) => j.n === 1);
    const near = nearSleeve(yaw) === -1 ? 1 : 2;
    const sleeve = order.findIndex((j) => j.n === 0 && j.lists.some((l) => pieceList[0]!.cells[l[0]!]!.g === near));
    assert.ok(belt >= 0 && sleeve > belt, `yaw ${yaw}: the near sleeve is drawn after the belt`);
  }
});
