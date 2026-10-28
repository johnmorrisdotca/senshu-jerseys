import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, type JudogiOptions } from "../src/judogi.ts";
import { legOutline } from "../src/judogiPants.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import type { Cell, VolumeDesc } from "../src/volume.ts";

// A judogi hangs boxy and loose, and a judoka in one is stocky: the jacket's skirt is as wide as its chest, the shoulders are dropped and no wider than
// the chest, the body is deep from front to back (about two thirds of its width), the trousers are wide and each leg is round. These tests pin those ratios
// on the drawing's own volumes, measured two ways: the rows the desc gives (the width and depth the drawing is built to) and the cells that are placed in
// space (what is drawn), so that a change to the cells that makes the body thin again is caught. A judogi's drawing is one shape at every size (the size
// names the height, and sets the lengths `judogiCheck` reads), so the tests read the pieces out of the drawn SVG for a small, a middle and a large size.

const SIZES = ["150", "170", "200"] as const;

/** The volumes a drawn suit carries: the jacket (it has an inside) and the trousers (its body parts into two legs). */
function piecesOf(options: JudogiOptions): { jacket: VolumeDesc; pants: VolumeDesc } {
  const svg = judogiFrame({ mode: "suit", yaw: 60, ...options });
  const descs = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc);
  const jacket = descs.find((d) => d.inner !== undefined);
  const pants = descs.find((d) => d.lobes !== undefined);
  assert.ok(jacket !== undefined && pants !== undefined, "the suit has a jacket and trousers");
  return { jacket, pants };
}

/** A value of a row list at height `y`, between the rows. */
function rowAt(d: VolumeDesc, values: readonly number[], y: number): number {
  let j = 0;
  while (j + 2 < d.y.length && (d.y[j + 1] as number) < y) j++;
  const r = Math.max(0, Math.min(1, (y - (d.y[j] as number)) / ((d.y[j + 1] as number) - (d.y[j] as number) || 1)));
  return (values[j] as number) + ((values[j + 1] as number) - (values[j] as number)) * r;
}

/** The width (what the drawing is built to, its padding included) and the depth (front to back) of the body at height `y`. */
const widthAt = (d: VolumeDesc, y: number): number => 2 * rowAt(d, d.a, y);
const depthAt = (d: VolumeDesc, y: number): number => 2 * rowAt(d, d.b, y);

/** What the placed cells of the groups `g` cover across (x) and from front to back (z) within `win` of height `y`. */
function section(cells: readonly Cell[], groups: readonly number[], y: number, win = 4): { width: number; depth: number } {
  const xs: number[] = [];
  const zs: number[] = [];
  for (const c of cells) {
    if (!groups.includes(c.g) || c.inside === true) continue;
    for (let k = 0; k < 3; k++) {
      if (Math.abs((c.p[3 * k + 1] as number) - y) > win) continue;
      xs.push(c.p[3 * k] as number);
      zs.push(c.p[3 * k + 2] as number);
    }
  }
  assert.ok(xs.length > 0, `cells at height ${y}`);
  return { width: Math.max(...xs) - Math.min(...xs), depth: Math.max(...zs) - Math.min(...zs) };
}

/** The jacket's rows that name its parts, in the drawing's units (2.63 to the centimetre for a size 170). */
const SHOULDER = 36;
const CHEST = 86;
const WAIST = 114;
const HIPS = 170;
const HEM = 205;

for (const size of SIZES) {
  for (const belt of ["none", "orange"] as const) {
    test(`size ${size}, ${belt === "none" ? "loose" : "belted"}: the jacket is boxy: its skirt is as wide as its chest and its shoulders no wider`, () => {
      const { jacket } = piecesOf({ size, belt });
      const chest = widthAt(jacket, CHEST);
      assert.ok(widthAt(jacket, HIPS) / chest >= 0.98, `skirt ${(widthAt(jacket, HIPS) / chest).toFixed(2)} of the chest`);
      assert.ok(widthAt(jacket, HEM) / chest >= 0.98, `hem ${(widthAt(jacket, HEM) / chest).toFixed(2)} of the chest`);
      assert.ok(widthAt(jacket, HEM) / chest <= 1.25, "the hem flares a little, not a skirt");
      const shoulder = widthAt(jacket, SHOULDER) / chest;
      assert.ok(shoulder <= 1.1 && shoulder >= 0.9, `shoulders ${shoulder.toFixed(2)} of the chest: dropped and soft, neither square nor sloped away`);
      // No V: from the shoulder down to the hem the body never gets narrower than the belted waist's small pull-in.
      for (let y = 58; y <= HEM; y += 4) assert.ok(widthAt(jacket, y) / chest >= (belt === "none" ? 0.98 : 0.8), `row ${y} is ${(widthAt(jacket, y) / chest).toFixed(2)} of the chest`);
      if (belt !== "none") assert.ok(widthAt(jacket, WAIST) / chest >= 0.82, "the belt pulls the waist in only a little");
    });

    test(`size ${size}, ${belt === "none" ? "loose" : "belted"}: the jacket is deep from front to back, as a person in a loose gi is`, () => {
      const { jacket } = piecesOf({ size, belt });
      const cells = pieceCells(jacket);
      const rows = belt === "none" ? [CHEST, HIPS, HEM] : [CHEST, WAIST, HIPS, HEM];
      for (const y of rows) {
        const built = depthAt(jacket, y) / widthAt(jacket, y);
        assert.ok(built >= 0.55 && built <= 0.75, `row ${y}: depth ${built.toFixed(2)} of the width as built`);
        // The cells that are drawn: the front half and the back half of the body (a little over the middle where they meet, so a side wall's width is the cells' width).
        const drawn = section(cells, [0, 3], y);
        const r = drawn.depth / drawn.width;
        assert.ok(r >= 0.55 && r <= 0.75, `row ${y}: depth ${r.toFixed(2)} of the width as drawn`);
      }
    });
  }

  test(`size ${size}: the trousers are wide and loose, each leg round`, () => {
    const { jacket, pants } = piecesOf({ size });
    const skirt = widthAt(jacket, HIPS);
    // The two legs together are about as wide as the jacket's skirt: the widest the hip block gets, and the two legs' outer edges at the hem.
    const hips = Math.max(...pants.a.map((v) => 2 * v));
    assert.ok(hips / skirt >= 0.85 && hips / skirt <= 1.05, `the hips are ${(hips / skirt).toFixed(2)} of the skirt`);
    const left = legOutline(1);
    const hem = Math.max(...legOutline(1).concat(legOutline(-1)).map((p) => Math.abs(p[0] - 100))) * 2;
    assert.ok(hem / skirt >= 0.85 && hem / skirt <= 1.05, `the legs together are ${(hem / skirt).toFixed(2)} of the skirt at their widest`);
    // Each leg at the thigh is nearly half the hip width, and tapers only a little to the hem.
    const [top, topEnd, hemEnd, hemStart] = [left[0]!, left[3]!, left[2]!, left[1]!];
    const thigh = Math.abs(topEnd[0] - top[0]);
    assert.ok(thigh / hips >= 0.4 && thigh / hips <= 0.5, `a leg is ${(thigh / hips).toFixed(2)} of the hip width at the thigh`);
    const hemWidth = Math.abs(hemEnd[0] - hemStart[0]);
    assert.ok(hemWidth / thigh >= 0.75 && hemWidth / thigh <= 1.02, `the hem is ${(hemWidth / thigh).toFixed(2)} of the thigh`);
    // A leg is round: as deep as it is wide, as built and as drawn, at the thigh, the knee and the hem.
    const cells = pieceCells(pants);
    assert.ok((pants.tube as number) >= 0.8 && (pants.tube as number) <= 1.1, `the legs' depth is ${pants.tube} of their width as built`);
    for (const y of [130, 180, 230]) {
      const s = section(cells, [1], y, 24);
      assert.ok(s.depth / s.width >= 0.8 && s.depth / s.width <= 1.1, `leg at ${y}: depth ${(s.depth / s.width).toFixed(2)} of its width`);
    }
    // The hip block is deep too, as a person's hips are.
    const hipDepth = depthAt(pants, 50) / widthAt(pants, 50);
    assert.ok(hipDepth >= 0.5 && hipDepth <= 0.75, `the hips are ${hipDepth.toFixed(2)} as deep as wide`);
  });
}

test("the size does not change the drawing's proportions: it is one shape, scaled by the page", () => {
  const a = piecesOf({ size: "150" });
  const b = piecesOf({ size: "200" });
  assert.deepEqual(a.jacket.a, b.jacket.a);
  assert.deepEqual(a.jacket.b, b.jacket.b);
  assert.deepEqual(a.pants.a, b.pants.a);
});
