import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi } from "../src/judogi.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { paintOrder, type PaintPiece } from "../src/judogiGl.ts";
import { ROUND } from "../src/judogiStrap.ts";
import { nearSleeve, placeCell, turn, type Cell, type VolumeDesc } from "../src/volume.ts";

// The jacket with its belt as the designer draws it: the pieces' own descriptions are read back from the drawing.
const pieces = (o: object = {}): { jacket: VolumeDesc; strap: VolumeDesc } => {
  const svg = renderJudogi({ mode: "jacket", belt: "orange", yaw: 0, width: 360, ...o });
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

/** Seen edge on, the knot's least width (about 1.8 cm: its two layers and the fold between them) and the most of its rows that may fall into separate strips. */
const MIN_WIDTH = 4.5;
const MAX_BROKEN = 0.25;
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

test("long ends lie on the skirt too, and below the hem hang straight down from it, on a karate gi and an ITF dobok and tied any way", () => {
  for (const o of [{ karate: true }, { dobok: { cut: "itf" } }, { beltKnot: "hanging", beltTailCm: 55 }, { beltKnot: "spread", beltTailCm: 40 }]) {
    const { jacket, strap } = pieces(o);
    const torso = pieceCells(jacket).filter((c) => (c.g === 0 || c.g === 3) && c.inside !== true);
    const s = strap.strap!;
    const hem = jacket.y.at(-1)!;
    const cells = pieceCells(strap).slice(ROUND * 6);
    const ys = (c: Cell): number[] => c.p.filter((_, k) => k % 3 === 1);
    const onSkirt = cells.filter((c) => ys(c).every((y) => y > s.y + s.sag + s.w + 8 && y < hem - 2));
    const below = cells.filter((c) => ys(c).every((y) => y > hem + 4));
    assert.ok(onSkirt.length > 20 && below.length > 10, `${JSON.stringify(o)}: the ends are found above and below the hem`);
    // An end's thickness and its gap, and under the knot the other end's, which the right one lies over where they touch.
    const thick = 2 * s.t + 1.8 + 0.6;
    for (const yaw of [0, 90, 270]) {
      const body = torso.flatMap((c) => project(c, yaw, jacket.pitch).map((q) => q.tri));
      for (const c of onSkirt) for (const q of project(c, yaw, jacket.pitch)) for (const v of q.tri) { const d = Math.min(...body.map((t) => away(v, t))); assert.ok(d <= thick, `${JSON.stringify(o)} yaw ${yaw}: an end stands ${d.toFixed(1)} off the skirt at y ${v[1].toFixed(1)}, hem ${hem}`); }
    }
    // Past the hem nothing holds an end against the body: it keeps the hem's depth, never sinking into the trousers' line or swinging out.
    const z = below.flatMap((c) => c.p.filter((_, k) => k % 3 === 2));
    assert.ok(Math.max(...z) - Math.min(...z) < s.t * 2 + 0.5, `${JSON.stringify(o)}: below the hem the ends hang at one depth`);
  }
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

/** The strap's cells that are the knot (not the hanging ends below it): none reaching more than `below` under the belt's lower edge. */
const knotOf = (strap: VolumeDesc, below = 1.5): Cell[] => {
  const s = strap.strap!;
  return pieceCells(strap).slice(ROUND * 6).filter((c) => c.p.every((_, k) => k % 3 !== 1 || (c.p[k] as number) <= s.y + s.sag + s.w + below));
};

/** The picture's rows the cells cover, as `[y, runs, covered width]`: each row's covered stretches joined where they come within `join` of one another. */
function rows(tris: Tri[], join: number): [number, number, number][] {
  const lo = Math.min(...tris.flatMap((t) => t.map((p) => p[1])));
  const hi = Math.max(...tris.flatMap((t) => t.map((p) => p[1])));
  const out: [number, number, number][] = [];
  for (let y = lo + 0.25; y < hi; y += 0.5) {
    const spans: [number, number][] = [];
    for (const t of tris) {
      const xs: number[] = [];
      for (let k = 0; k < 3; k++) {
        const [a, b] = [t[k]!, t[(k + 1) % 3]!];
        if ((a[1] - y) * (b[1] - y) < 0) xs.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
      }
      if (xs.length === 2) spans.push([Math.min(...xs), Math.max(...xs)]);
    }
    spans.sort((u, v) => u[0] - v[0]);
    let runs = 0;
    let width = 0;
    let end = -Infinity;
    for (const [a, b] of spans) {
      if (a > end + join) runs++;
      width += Math.max(0, b - Math.max(a, end));
      end = Math.max(end, b);
    }
    if (runs > 0) out.push([y, runs, width]);
  }
  return out;
}

test("seen edge on, the knot is a solid mass: one piece with a thickness, not a fan of thin ribbons", () => {
  const { jacket, strap } = pieces();
  const knot = knotOf(strap);
  for (const yaw of [75, 90, 270, 285]) {
    for (const tilt of TILTS) {
      const tris = knot.map((c) => placeCell(c, yaw, jacket.pitch + tilt)).filter((q) => q.visible && q.tri !== undefined).map((q): Tri => [[q.tri![0]!, q.tri![1]!], [q.tri![3]!, q.tri![4]!], [q.tri![6]!, q.tri![7]!]]);
      assert.ok(tris.length > 10, `yaw ${yaw}, tilt ${tilt}: the knot is seen`);
      const r = rows(tris, 0.7);
      const mean = r.reduce((a, q) => a + q[2], 0) / r.length;
      const broken = r.filter((q) => q[1] > 1).length / r.length;
      assert.ok(mean >= MIN_WIDTH, `yaw ${yaw}, tilt ${tilt}: the knot is ${mean.toFixed(1)} wide on average (at least ${MIN_WIDTH})`);
      assert.ok(broken <= MAX_BROKEN, `yaw ${yaw}, tilt ${tilt}: ${(100 * broken).toFixed(0)} % of its rows are in separate strips (at most ${100 * MAX_BROKEN} %)`);
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
