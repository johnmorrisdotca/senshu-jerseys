// How heavy the folded belt and the gift box are to draw. A browser pays for every cell (the turning view takes each one through the page's
// own work every frame, and a flat SVG draws the face again under each), so the cells are counted and held to a budget: the folded belt
// is cut finely only where the cloth bends, and a drawing that stands still carries only the cells that show.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sceneOf, solidCells, FOLDED_TURN } from "../src/beltBox.ts";
import { renderJudogi } from "../src/judogi.ts";
import { seenCells } from "../src/pieceVolume.ts";
import { placeCell, type Cell, type Placed } from "../src/volume.ts";

const count = (svg: string, attr: string): number => svg.split(`${attr}="`).length - 1;
const beltScene = (extra: { loose?: boolean } = {}): ReturnType<typeof sceneOf> => sceneOf({ beltSize: 4, widthCm: 4.5, thickCm: 0.49 * 1.3, belt: true, band: false, rot: FOLDED_TURN, ...(extra.loose === false ? { box: { type: "kiri", state: "open" } } : {}) });

test("a folded belt is about four thousand cells, not nine: the budget the turning view and the flat drawing are held to", () => {
  const cells = solidCells(beltScene());
  assert.ok(cells.length > 2500, `${cells.length} cells is too few to be round`);
  assert.ok(cells.length < 4500, `${cells.length} cells is more than a browser should draw`);
});

test("a boxed belt with its lid off is no heavier than it was", () => {
  const cells = solidCells(beltScene({ loose: false }));
  assert.ok(cells.length < 2600, `${cells.length} cells`);
});

test("a drawing that stands still carries only the cells that show; the same scene turning carries them all", () => {
  for (const o of [{ mode: "folded" as const, belt: "red-white" as const }, { mode: "box" as const, belt: "black" as const, boxState: "open" as const }]) {
    const flat = renderJudogi({ ...o, view: "flat" });
    const turning = renderJudogi({ ...o, view: "front", yaw: 0 });
    const drawn = count(flat, "data-vc");
    assert.ok(drawn > 50, `${o.mode}: the flat drawing is not empty`);
    assert.ok(drawn < count(turning, "data-vc") / 1.7, `${o.mode}: ${drawn} of ${count(turning, "data-vc")} cells, a still drawing leaves out the ones nobody sees`);
    assert.equal(count(flat, 'display="none"'), 0, `${o.mode}: nothing is drawn only to be hidden`);
    assert.ok(flat.length < 1_200_000, `${o.mode}: ${flat.length} bytes`);
  }
});

test("a folded belt's flat drawing is under a megabyte, front and back", () => {
  for (const view of ["flat", "flat-back"] as const) {
    const svg = renderJudogi({ mode: "folded", belt: "red-white", view });
    assert.ok(svg.length < 1_000_000, `${view}: ${svg.length} bytes`);
  }
});

test("the cells' own defs are in a group of their own, so a canvas can paint the faces without them", () => {
  const svg = renderJudogi({ mode: "folded", belt: "black", view: "front" });
  const defs = /<defs>([\s\S]*?)<\/defs>/.exec(svg)?.[1] ?? "";
  assert.equal(count(defs, "data-cells"), 1);
  const stripped = defs.replace(/<g data-cells[^>]*>[\s\S]*?<\/g>/g, "");
  assert.ok(stripped.length < defs.length / 4, `the faces' defs are ${stripped.length} of ${defs.length} bytes`);
  assert.ok(stripped.includes("data-face"), "the faces stay");
  assert.ok(!/id="jg\w*q\d+"/.test(stripped), "no cell's triangle is left in them");
});

const cellAt = (x: number, y: number, size: number): Placed => ({ visible: true, matrix: "", shade: 0, depth: 0, tri: [x, y, 0, x + size, y, 0, x, y + size, 0] });

test("seenCells: a cell wholly covered by a later one is left out, one that sticks out or comes later stays", () => {
  const placed = [cellAt(0, 0, 4), cellAt(-1, -1, 9), cellAt(20, 20, 3)];
  // Drawn in this order, the second covers the first.
  assert.deepEqual(seenCells(placed, [0, 1, 2]), [false, true, true]);
  // Drawn the other way round, the first lies on the second and both show.
  assert.deepEqual(seenCells(placed, [1, 0, 2]), [true, true, true]);
});

test("seenCells: a cell that is not facing the viewer is never in the picture", () => {
  const away: Placed = { visible: false, matrix: "", shade: 0, depth: 0 };
  assert.deepEqual(seenCells([away, cellAt(0, 0, 3)], [0, 1]), [false, true]);
});

test("seenCells agrees with placeCell: every cell it keeps faces the viewer", () => {
  const cells: Cell[] = solidCells(beltScene());
  const placed = cells.map((c) => placeCell(c, 0, 44));
  const shown = seenCells(placed, cells.map((_, i) => i));
  shown.forEach((s, i) => assert.ok(!s || placed[i]!.visible));
});

test("bare: a drawing for a canvas has each piece's description and one cell for each face's picture, and none of the thousands of cells", () => {
  for (const o of [{ mode: "folded" as const }, { mode: "box" as const, boxState: "open" as const }, { mode: "suit" as const, belt: "black" as const }, { mode: "pieces" as const }]) {
    const full = renderJudogi({ ...o, view: "front" });
    const bare = renderJudogi({ ...o, view: "front", bare: true });
    assert.equal(count(bare, "data-piece"), count(full, "data-piece"), `${o.mode}: every piece is there`);
    assert.ok(count(bare, "data-vc") >= count(bare, "data-piece") && count(bare, "data-vc") <= 2 * count(bare, "data-piece"), `${o.mode}: one cell a face for each piece`);
    assert.ok(bare.length < full.length / 4, `${o.mode}: ${bare.length} of ${full.length} bytes`);
    assert.ok(bare.includes("data-face"), `${o.mode}: the pictures of the faces are in the defs`);
    assert.equal(count(bare, "data-vh"), 0, `${o.mode}: no shades`);
  }
});

test("bare changes nothing else: the same pieces, the same faces, the same title", () => {
  const full = renderJudogi({ mode: "suit", belt: "red-white", view: "back", yaw: 20 });
  const bare = renderJudogi({ mode: "suit", belt: "red-white", view: "back", yaw: 20, bare: true });
  const pieces = (svg: string): string[] => [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => m[1] as string);
  assert.deepEqual(pieces(bare), pieces(full));
  // Everything in the defs but the cells' own group is the same: the faces' pictures and the paint.
  const faces = (svg: string): string => (/<defs>([\s\S]*?)<\/defs>/.exec(svg)?.[1] ?? "").replace(/<g data-cells[^>]*>[\s\S]*?<\/g>/g, "");
  assert.equal(faces(bare), faces(full));
  assert.equal(/<title[^>]*>([^<]*)</.exec(bare)?.[1], /<title[^>]*>([^<]*)</.exec(full)?.[1]);
});
