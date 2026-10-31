import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi } from "../src/judogi.ts";
import { depthOrder } from "../src/pieceVolume.ts";
import { BACK_Y, END_FACE_Y, FACE_Y, strapCells, strapFace, type StrapDesc } from "../src/judogiStrap.ts";
import { placeCell, turn } from "../src/volume.ts";

// A belt alone, as the designer draws it. Its knot is two lengths of strap that cross one another and the turns, so the cells' middles
// cannot order them: where two cells lie over each other on the screen, the nearer must be drawn last. This counts the pairs, among every
// cell that is seen, drawn in the wrong order by more than a centimetre of depth (the slivers and saw-teeth of the underlayer that
// showed through the knot at any turn or tip off straight on).
const RING: StrapDesc = { y: 28, sag: 3, w: 12.5, t: 1.3, a: 66, b: 30, full: 2, side: 0, worn: false };
const rad = (d: number): number => (d * Math.PI) / 180;

function wrongPairs(order: (placed: ReturnType<typeof placeCell>[]) => number[], yaw: number, tilt: number): number {
  const cells = strapCells(RING);
  const pitch = 14 + tilt;
  const [cy, sy, cp, sp] = [Math.cos(rad(yaw)), Math.sin(rad(yaw)), Math.cos(rad(pitch)), Math.sin(rad(pitch))];
  const placed = cells.map((c) => placeCell(c, yaw, pitch));
  const rank = new Map(order(placed).map((i, r) => [i, r]));
  const seen = placed.map((q, i) => (q.visible ? i : -1)).filter((i) => i >= 0);
  const tri = new Map(seen.map((i) => [i, [0, 1, 2].map((k) => turn(cells[i]!.p[3 * k]!, cells[i]!.p[3 * k + 1]!, cells[i]!.p[3 * k + 2]!, cy, sy, cp, sp))]));
  const at = (t: number[][], x: number, y: number): number[] | undefined => {
    const [a, b, c] = t as [number[], number[], number[]];
    const d = (b[1]! - c[1]!) * (a[0]! - c[0]!) + (c[0]! - b[0]!) * (a[1]! - c[1]!);
    const l1 = ((b[1]! - c[1]!) * (x - c[0]!) + (c[0]! - b[0]!) * (y - c[1]!)) / d;
    const l2 = ((c[1]! - a[1]!) * (x - c[0]!) + (a[0]! - c[0]!) * (y - c[1]!)) / d;
    return [l1, l2, 1 - l1 - l2].every((l) => l > 1e-6) ? [l1 * a[2]! + l2 * b[2]! + (1 - l1 - l2) * c[2]!] : undefined;
  };
  const middle = (t: number[][]): [number, number] => [(t[0]![0]! + t[1]![0]! + t[2]![0]!) / 3, (t[0]![1]! + t[1]![1]! + t[2]![1]!) / 3];
  let wrong = 0;
  for (let x = 0; x < seen.length; x++) {
    for (let y = x + 1; y < seen.length; y++) {
      const [i, j] = [seen[x]!, seen[y]!];
      const [ti, tj] = [tri.get(i)!, tri.get(j)!];
      for (const p of [middle(ti), middle(tj)]) {
        const zi = at(ti, p[0], p[1])?.[0];
        const zj = at(tj, p[0], p[1])?.[0];
        if (zi === undefined || zj === undefined || Math.abs(zi - zj) <= 1) continue;
        if ((rank.get(i)! < rank.get(j)!) !== zi < zj) wrong++;
        break;
      }
    }
  }
  return wrong;
}

test("the knot's cells are drawn nearer last wherever they lie over one another, at straight and at turned and tipped views", () => {
  const sorted = (placed: ReturnType<typeof placeCell>[]): number[] => placed.map((_, i) => i).sort((i, j) => placed[i]!.depth - placed[j]!.depth);
  let before = 0;
  let after = 0;
  let worstAfter = 0;
  for (const [yaw, tilt] of [[0, 0], [2, 30], [7, 9], [-5, 12], [20, 20], [-40, 0], [45, -20], [150, 5]] as const) {
    const a = wrongPairs(depthOrder, yaw, tilt);
    before += wrongPairs(sorted, yaw, tilt);
    after += a;
    worstAfter = Math.max(worstAfter, a);
  }
  // Ordering by the middles alone gets dozens of pairs wrong (33 here); by the overlaps, a few where cells truly pass through one another
  // (the graphics-card painter tests nearness at each point, and settles those).
  assert.ok(before > 20, `the middles alone were expected to fail here (${before})`);
  assert.ok(after * 3 < before, `overlap ordering is not much better: ${after} wrong against ${before}`);
  assert.ok(worstAfter <= 6, `a view has ${worstAfter} pairs in the wrong order`);
});

test("what is sewn on a belt's hanging end shows on its outer face only, at 0, 90, 180 and 270 degrees", () => {
  const cells = strapCells(RING);
  // The two hanging ends are the cells whose drawing runs along the strip from where the marks start (END_X, 58 and up); the turns and the knot use less.
  const ends = cells.map((c, i) => ({ c, i })).filter(({ c }) => Math.min(...c.tex.filter((_, k) => k % 2 === 0)) >= 57);
  assert.ok(ends.length > 0);
  const rowsOf = (yaw: number): { face: number; reverse: number } => {
    let face = 0;
    let reverse = 0;
    for (const { c } of ends) {
      if (!placeCell(c, yaw, 14).visible) continue;
      const y = Math.min(...c.tex.filter((_, k) => k % 2 === 1));
      // The reverse samples the plain strip; the outer face its end's own strip (END_FACE_Y), which carries what is sewn on it.
      if (y >= BACK_Y - 1 && y < BACK_Y + RING.w + 2) reverse++;
      else if (y < FACE_Y + RING.w + 2 || END_FACE_Y.some((r) => y >= r - 1 && y < r + RING.w + 2)) face++;
    }
    return { face, reverse };
  };
  // Seen from the front, the ends show their outer face, which carries the marks; from behind, the reverse, which is plain cloth.
  assert.ok(rowsOf(0).face > 0 && rowsOf(0).reverse === 0, "front: marks side only");
  assert.ok(rowsOf(180).reverse > 0 && rowsOf(180).face === 0, "back: plain side only");
  // Side on, an end shows only its edges (and a sliver of whichever face is a little toward the viewer): never the reverse and the marks together.
  for (const yaw of [90, 270]) {
    const r = rowsOf(yaw);
    assert.ok(r.face === 0 || r.reverse === 0, `${yaw}: ${JSON.stringify(r)}`);
  }
  // The strip the reverse faces sample has the cloth and the rows but none of the marks.
  const marked = strapFace({ fill: "#123456", edge: "#000", stitch: "#222", defs: "", ends: { left: { defs: "", body: '<text id="mark">M</text>' } } }, RING.w);
  assert.equal(marked.body.match(/id="mark"/g)?.length, 1);
  // A tied belt's strap has a strip of its own for each end, which carries that end's marks again (and only that end's).
  const tied = strapFace({ fill: "#123456", edge: "#000", stitch: "#222", defs: "", ends: { left: { defs: "", body: '<text id="mark">M</text>' } } }, RING.w, undefined, true);
  assert.equal(tied.body.match(/id="mark"/g)?.length, 2);
  assert.ok(marked.body.indexOf(`y="${BACK_Y - 1.5}"`) >= 0, "a plain strip for the reverse");
});

test("a jacket's front marks are drawn on its front face only and its back patch on its back face only", () => {
  const svg = renderJudogi({
    mode: "jacket", belt: "none",
    embroidery: [{ place: "jacket-chest", text: "CHEST", thread: "#ff00aa" }],
    backPatch: { style: "ijf", name: "A. NAME", code: "CAN", line: "CLUB", colour: "#00aaff" },
  });
  const f = svg.search(/<g id="[^"]*F" data-face/);
  const b = svg.search(/<g id="[^"]*B" data-face/);
  assert.ok(f >= 0 && b > f, "both faces are there");
  const group = (side: "F" | "B"): string => (side === "F" ? svg.slice(f, b) : svg.slice(b, svg.indexOf("</defs>", b)));
  const front = group("F");
  const back = group("B");
  assert.ok(/ff00aa/i.test(front) && !/00aaff/i.test(front), "front: the chest embroidery, no back patch");
  assert.ok(/00aaff/i.test(back) && !/ff00aa/i.test(back), "back: the patch, no chest embroidery");
});
