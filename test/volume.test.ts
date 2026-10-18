import assert from "node:assert/strict";
import { test } from "node:test";

import { CUT_IDS } from "../src/cuts.ts";
import { JERSEY_HEIGHT, jerseyBox } from "../src/jersey.ts";
import { resolve } from "../src/options.ts";
import { applyTurn, jerseyFrame } from "../src/turn-entry.ts";
import { cellsOf, nearSleeve, placeCell, volumeDesc } from "../src/volume.ts";
import { wellFormed } from "./helpers.ts";

const COLORS = ["#af1e2d", "#fff", "#192168"];
const EIGHT = [0, 45, 90, 135, 180, 225, 270, 315];

const attr = (svg: string, name: string): string => new RegExp(`${name}="([^"]*)"`).exec(svg)?.[1] ?? "";
/** The cells of a frame, in order: the `display` or the `transform` each carries. */
const cellsIn = (svg: string): string[] => {
  const out: string[] = [];
  for (const m of svg.matchAll(/<g data-vc="(\d+)"([^>]*) clip-path/g)) out[Number(m[1])] = m[2] as string;
  return out;
};
const groupsIn = (svg: string): string[] => [...svg.matchAll(/<g data-vol="(\d)"/g)].map((m) => m[1] as string);
const rad = (d: number): number => (d * Math.PI) / 180;

/** Where a point of space lands on the picture, worked out here on its own from the same turn and tip. */
function project(p: readonly number[], k: number, yaw: number, pitch: number): [number, number] {
  const [x, y, z] = [p[3 * k] as number, p[3 * k + 1] as number, p[3 * k + 2] as number];
  const z1 = -x * Math.sin(rad(yaw)) + z * Math.cos(rad(yaw));
  return [100 + x * Math.cos(rad(yaw)) + z * Math.sin(rad(yaw)), y * Math.cos(rad(pitch)) + z1 * Math.sin(rad(pitch))];
}

test("the flat turn is the default and draws no cells; the volume is opt-in", () => {
  const flat = jerseyFrame({ cut: "hockey", number: 9, yaw: 30 });
  assert.ok(!flat.includes("data-vol") && flat.includes('data-turn="slab"'));
  const vol = jerseyFrame({ cut: "hockey", number: 9, yaw: 30, volume: true });
  assert.ok(vol.includes("data-vol") && !vol.includes('data-turn="slab"'));
  assert.equal(jerseyFrame({ cut: "hockey", number: 9, yaw: 30, volume: "yes" as unknown as boolean }), flat, "only true turns it on");
});

test("every angle, in every cut and look, draws a finite, well-formed garment", () => {
  for (const cut of CUT_IDS) {
    for (const look of ["cloth", "flat", "line"] as const) {
      for (const yaw of [...EIGHT, -30, 90.5, 720, 1000]) {
        const svg = jerseyFrame({ cut, look, number: 23, name: "Gray", colors: COLORS, sleeveNumbers: true, volume: true, yaw });
        assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${cut} ${look} ${yaw}`);
        assert.equal(wellFormed(svg), null, `${cut} ${look} ${yaw}`);
      }
    }
  }
});

test("the same options draw the same garment, and a different angle only changes the cells", () => {
  const a = jerseyFrame({ cut: "soccer", number: 10, colors: COLORS, volume: true, yaw: 45 });
  assert.equal(a, jerseyFrame({ cut: "soccer", number: 10, colors: COLORS, volume: true, yaw: 45 }));
  const b = jerseyFrame({ cut: "soccer", number: 10, colors: COLORS, volume: true, yaw: 200 });
  const strip = (s: string): string => s.replace(/ data-yaw="[^"]*"/, "").replace(/<g data-vol="0">[\s\S]*$/, "").replace(/<g data-vol="\d">[\s\S]*$/, "");
  assert.equal(strip(a), strip(b), "the defs, the two drawings and the clips do not depend on the angle");
});

test("the regression angles: the front and the back come round, and each shows only the cloth that faces the viewer", () => {
  const desc = volumeDesc(resolve({ cut: "hockey" }));
  const cells = cellsOf(desc);
  const shown = (yaw: number): { front: number; back: number } => {
    let front = 0;
    let back = 0;
    for (const c of cells) {
      if ((c.g !== 0 && c.g !== 3) || !placeCell(c, yaw, desc.pitch).visible) continue;
      if (c.back) back++;
      else front++;
    }
    return { front, back };
  };
  const per = desc.nt * (desc.y.length - 1) * 2;
  // Side-wall triangles on one half: pitch can tip a few of them toward the camera.
  const wall = (desc.y.length - 1) * 2 * 2;
  // The camera looks down a little, so the top of the far shoulders shows over the near ones: a few cells, and drawn behind.
  assert.ok(shown(0).front >= per && shown(0).front <= per + wall, "face on: the whole front");
  assert.ok(shown(0).back <= per * 0.08 + wall, "face on: next to none of the back");
  assert.ok(shown(180).back >= per && shown(180).back <= per + wall, "from behind: the whole back");
  assert.ok(shown(180).front <= per * 0.08 + wall, "from behind: next to none of the front");
  for (const yaw of [90, 270]) {
    const s = shown(yaw);
    assert.ok(s.front > per / 3 && s.front < (2 * per) / 3 && s.back > per / 3 && s.back < (2 * per) / 3, `${yaw}: half of each, the side of the body`);
  }
  for (const yaw of [45, 135, 225, 315]) {
    const s = shown(yaw);
    assert.ok(s.front > 0 && s.back > 0, `${yaw}: both faces turn through the three-quarter`);
    assert.ok(s.front + s.back > per * 0.45 && s.front + s.back <= per * 2, `${yaw}: about half the surface, side walls included`);
  }
  // Whatever the angle, no cell that faces away shows: its matrix is empty and the markup hides it.
  for (const yaw of EIGHT) {
    const hidden = cells.filter((c) => !placeCell(c, yaw, desc.pitch).visible).length;
    assert.equal(cellsIn(jerseyFrame({ cut: "hockey", volume: true, yaw })).filter((c) => c.includes('display="none"')).length, hidden, `${yaw}`);
  }
});

test("a side view is closed cloth, not a hole between the front and the back", () => {
  for (const cut of CUT_IDS) {
    const desc = volumeDesc(resolve({ cut }));
    const torso = cellsOf(desc).filter((c) => c.g === 0 || c.g === 3);
    let zMin = Infinity;
    let zMax = -Infinity;
    let nearSide = 0;
    const chest = Math.max(...desc.b);
    for (const c of torso) {
      if (!placeCell(c, 90, desc.pitch).visible) continue;
      for (let k = 0; k < 3; k++) {
        const z = c.p[3 * k + 2] as number;
        zMin = Math.min(zMin, z);
        zMax = Math.max(zMax, z);
      }
      const mx = (c.p[0]! + c.p[3]! + c.p[6]!) / 3;
      if (mx < -chest * 0.4) nearSide++;
    }
    assert.ok(zMax - zMin > chest, `${cut}: depth ${zMax - zMin} at yaw 90, want > ${chest}`);
    assert.ok(nearSide > 4, `${cut}: the near side has cells, not a line`);
  }
});

test("the turn is the same either way round: a shirt turned by -yaw is the mirror of one turned by yaw, cell for cell", () => {
  const desc = volumeDesc(resolve({ cut: "hockey" }));
  for (const yaw of [20, 45, 90, 135]) {
    const mine = cellsOf(desc).filter((c) => placeCell(c, yaw, desc.pitch).visible).length;
    const other = cellsOf(desc).filter((c) => placeCell(c, -yaw, desc.pitch).visible).length;
    assert.equal(mine, other, `${yaw}`);
  }
});

test("a cell's matrix puts each of its corners where the point lies in space after the turn, within a tenth of a unit", () => {
  for (const cut of CUT_IDS) {
    const desc = volumeDesc(resolve({ cut, sleeve: undefined }));
    const cells = cellsOf(desc);
    for (const yaw of EIGHT) {
      for (const c of cells) {
        const pl = placeCell(c, yaw, desc.pitch);
        if (!pl.visible) continue;
        const m = (/matrix\(([^)]+)\)/.exec(pl.matrix)?.[1] ?? "").split(" ").map(Number) as [number, number, number, number, number, number];
        for (let k = 0; k < 3; k++) {
          const x = c.tex[2 * k] as number;
          const y = c.tex[2 * k + 1] as number;
          const [sx, sy] = project(c.p, k, yaw, desc.pitch);
          const err = Math.hypot(m[0] * x + m[2] * y + m[4] - sx, m[1] * x + m[3] * y + m[5] - sy);
          assert.ok(err < 0.1, `${cut} ${yaw}: ${err}`);
        }
      }
    }
  }
});

test("the garment stays inside its cut's box at every angle, with its sleeves", () => {
  for (const cut of CUT_IDS) {
    for (const sleeve of ["long", "elbow", "short", undefined] as const) {
      const desc = volumeDesc(resolve({ cut, sleeve }));
      const box = jerseyBox(cut);
      for (let yaw = 0; yaw < 360; yaw += 5) {
        for (const c of cellsOf(desc)) {
          if (!placeCell(c, yaw, desc.pitch).visible) continue;
          for (let k = 0; k < 3; k++) {
            const [sx, sy] = project(c.p, k, yaw, desc.pitch);
            assert.ok(sx >= box.x - 0.5 && sx <= box.x + box.w + 0.5 && sy >= -0.5 && sy <= JERSEY_HEIGHT + 0.5, `${cut} ${sleeve} ${yaw}: ${sx}, ${sy}`);
          }
        }
      }
    }
  }
});

test("the sleeve nearer the viewer is drawn last, so it covers the body and the far one hides behind it", () => {
  assert.deepEqual(groupsIn(jerseyFrame({ cut: "hockey", volume: true, yaw: 45 })), ["2", "3", "0", "1"]);
  assert.deepEqual(groupsIn(jerseyFrame({ cut: "hockey", volume: true, yaw: -45 })), ["1", "3", "0", "2"]);
  assert.deepEqual(groupsIn(jerseyFrame({ cut: "hockey", volume: true, yaw: 150 })), ["2", "0", "3", "1"], "from behind the back half is the near one");
  assert.equal(nearSleeve(45), -1);
  assert.equal(nearSleeve(-45), 1);
  assert.equal(nearSleeve(0), 0);
  assert.equal(nearSleeve(180), 0);
});

test("applyTurn moves a garment that is already there to the same state a new one is drawn in", () => {
  // A small stand-in for the nodes of the frame: the attributes the volume reads and writes.
  class Node {
    attrs = new Map<string, string>();
    kids: Node[] = [];
    parentNode: Node | null = null;
    tag: string;
    constructor(tag: string) {
      this.tag = tag;
    }
    getAttribute(k: string): string | null { return this.attrs.get(k) ?? null; }
    setAttribute(k: string, v: string): void { this.attrs.set(k, v); }
    removeAttribute(k: string): void { this.attrs.delete(k); }
    appendChild(n: Node): void { n.parentNode?.kids.splice(n.parentNode.kids.indexOf(n), 1); n.parentNode = this; this.kids.push(n); }
    hasAttribute(k: string): boolean { return this.attrs.has(k); }
    querySelector(q: string): Node | null { return this.all(q)[0] ?? null; }
    querySelectorAll(q: string): Node[] { return this.all(q); }
    all(q: string): Node[] {
      const key = /\[([\w-]+)\]/.exec(q)?.[1] ?? "";
      const found: Node[] = [];
      const walk = (n: Node): void => { for (const k of n.kids) { if (k.attrs.has(key)) found.push(k); walk(k); } };
      walk(this);
      return found;
    }
  }
  const options = { cut: "hockey" as const, colors: COLORS, number: 9, volume: true };
  const from = jerseyFrame({ ...options, yaw: 20 });
  const svg = new Node("svg");
  svg.setAttribute("data-vol", attr(from, "data-vol").replace(/&quot;/g, '"'));
  for (const g of [0, 1, 2, 3]) {
    const group = new Node("g");
    group.setAttribute("data-vol", String(g));
    svg.appendChild(group);
  }
  // One cell node per cell, in the groups that hold them, each with a shade child.
  const cellsList = cellsOf(JSON.parse(attr(from, "data-vol").replace(/&quot;/g, '"')));
  const groups = svg.kids;
  const nodes = cellsList.map((c) => {
    const n = new Node("g");
    n.setAttribute("data-vc", String(cellsList.indexOf(c)));
    const shade = new Node("use");
    shade.setAttribute("data-vs", "");
    n.appendChild(shade);
    groups[c.g]?.appendChild(n);
    return n;
  });
  assert.equal(applyTurn(svg as unknown as Element, 200), -160);
  assert.equal(svg.getAttribute("data-yaw"), "-160");
  const fresh = jerseyFrame({ ...options, yaw: 200 });
  const wanted = cellsIn(fresh);
  assert.equal(wanted.length, nodes.length);
  nodes.forEach((n, i) => {
    const want = wanted[i] as string;
    if (want.includes('display="none"')) assert.equal(n.getAttribute("display"), "none", `cell ${i} hidden`);
    else assert.equal(` transform="${n.getAttribute("transform")}"`, want, `cell ${i} placed`);
  });
  assert.deepEqual(svg.kids.map((g) => g.getAttribute("data-vol")), groupsIn(fresh), "and the sleeve in front is in front");
});

test("what comes from outside cannot reach the markup: the pitch is a number between 0 and 20, anything else is the default", () => {
  const base = jerseyFrame({ cut: "hockey", volume: true, yaw: 30 });
  for (const pitch of [NaN, Infinity, "8", "<script>", null, undefined, {}, []] as unknown[]) {
    const svg = jerseyFrame({ cut: "hockey", volume: true, yaw: 30, pitch } as never);
    assert.equal(svg, base, String(pitch));
    assert.doesNotMatch(svg, /<script/);
  }
  assert.match(jerseyFrame({ cut: "hockey", volume: true, pitch: 99 }), /&quot;pitch&quot;:20/);
  assert.match(jerseyFrame({ cut: "hockey", volume: true, pitch: -5 }), /&quot;pitch&quot;:0/);
  const hostile = jerseyFrame({ cut: "hockey", volume: true, name: '"><script>alert(1)</script>', crest: '<svg onload="x"/>', colors: ['"><b>', "red"], yaw: 10 });
  assert.doesNotMatch(hostile, /<script|<b>|\sonload=/);
  assert.equal(wellFormed(hostile), null);
});

test("the garment weighs what it should: a frame is a few tens of kilobytes, whatever the angle", () => {
  for (const yaw of [0, 90, 180]) {
    const svg = jerseyFrame({ cut: "hockey", number: 9, name: "Gray", colors: COLORS, volume: true, yaw });
    assert.ok(svg.length < 220_000, `${yaw}: ${svg.length} bytes`);
  }
});

test("every 15 degrees the torso is closed below the neck: whatever lies behind a hidden cell is covered by a shown one", () => {
  const inTri = (p: number[], t: number[][]): boolean => {
    const s = (a: number[], b: number[], c: number[]): number => (a[0]! - c[0]!) * (b[1]! - c[1]!) - (b[0]! - c[0]!) * (a[1]! - c[1]!);
    const d1 = s(p, t[0]!, t[1]!);
    const d2 = s(p, t[1]!, t[2]!);
    const d3 = s(p, t[2]!, t[0]!);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  for (const cut of ["hockey", "football", "basketball"] as const) {
    const desc = volumeDesc(resolve({ cut }));
    const torso = cellsOf(desc).filter((c) => c.g === 0 || c.g === 3);
    // The neck is an opening; the rows below it are cloth.
    const below = (desc.y[0] as number) + 12;
    for (let yaw = 0; yaw < 360; yaw += 15) {
      const shown: number[][][] = [];
      const hidden: number[][][] = [];
      for (const c of torso) {
        const tri = [0, 1, 2].map((k) => project(c.p, k, yaw, desc.pitch).map((v, i) => (i === 0 ? v - 100 : v)));
        (placeCell(c, yaw, desc.pitch).visible ? shown : hidden).push(tri);
      }
      let holes = 0;
      for (let x = -110; x <= 110; x += 2) for (let y = below; y <= 240; y += 2) {
        const p = [x, y];
        if (hidden.some((t) => inTri(p, t)) && !shown.some((t) => inTri(p, t))) holes++;
      }
      assert.ok(holes <= 6, `${cut} at ${yaw}: ${holes} samples of the torso show through`);
    }
  }
});

test("the cells sample the drawing inside its edge, so a seam never meets a clear or antialiased rim", () => {
  const desc = volumeDesc(resolve({ cut: "hockey" }));
  for (const c of cellsOf(desc)) {
    if (c.g !== 0 && c.g !== 3) continue;
    for (let k = 0; k < 3; k++) {
      const x = c.tex[2 * k] as number;
      const row = desc.y.findIndex((y) => Math.abs(y - (c.tex[2 * k + 1] as number)) < 1e-6);
      if (row < 0) continue;
      assert.ok(Math.abs(x - 100) <= (desc.a[row] as number) - 1.2 - 0.5, `row ${row}: ${x} is on or past the outline`);
    }
  }
});
