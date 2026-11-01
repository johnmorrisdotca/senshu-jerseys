import assert from "node:assert/strict";
import { test } from "node:test";
import { renderJudogi } from "../src/judogi.ts";
import { beltPaint } from "../src/judogiBelt.ts";
import { EDGE1_Y, EDGE_H, END_FACE_Y, FACE_Y, END_X, STRIP_MARGIN, strapCells, strapFace, strapWidth, type StrapDesc } from "../src/judogiStrap.ts";
import { END_LENGTH, bandsOf, endBlocks, endMark, readStyle, stripeHex, type JudogiBeltStyle } from "../src/judogiStripes.ts";
import { STRAP_GROW } from "../src/volume.ts";
import type { BeltPaint } from "../src/judogiCloth.ts";

// A cell is grown a little at its corners, so it overlaps its neighbours: at a hanging end's long edge that fringe lies on the strip's margin, beyond the cloth, and on its edge strip, which
// is one picture for the whole end. Whatever bar, tip or kohaku section the cloth has there, the fringe must show the same colour: a red cell leaking past a black bar made the edges of a striped
// tail ragged at 5x. The textures are what every painter (SVG, canvas, graphics card) samples, so they are checked here, cell by cell.
const STYLE: JudogiBeltStyle = { tip: { colour: "black", lengthCm: 6, bars: { colour: "white", count: 2 } }, bars: [{ colour: "black", count: 2, fromEndCm: 8 }] };
const W = strapWidth("red-white");
const HALF = W / 2;
const RING: StrapDesc = { y: 28, sag: 3, w: W, t: 1.3, a: 66, b: 30, full: 2, side: 0, worn: false };

function paintOf(): BeltPaint {
  const style = readStyle(STYLE);
  const p = beltPaint("t", "red-white", 15) as BeltPaint;
  return {
    ...p,
    stripeEnds: { left: endMark(style, 0, HALF), right: endMark(style, 1, HALF), half: HALF },
    stripeBlocks: { left: endBlocks(style, 0, HALF, STRIP_MARGIN), right: endBlocks(style, 1, HALF, STRIP_MARGIN) },
  };
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  fill: string;
}

/** The rectangles of a strip drawing in the order they are painted, each in the drawing's own units (groups' translate and scale applied); the shades laid over (a fill-opacity) are left out. */
function boxes(body: string): Box[] {
  const out: Box[] = [];
  const stack: [number, number, number, number][] = [[1, 1, 0, 0]];
  const tag = /<(\/?)(g|rect)\b([^>]*?)(\/?)>/g;
  for (let m = tag.exec(body); m; m = tag.exec(body)) {
    if (m[2] === "g") {
      if (m[1] === "/") {
        stack.pop();
        continue;
      }
      const [sx, sy, tx, ty] = stack[stack.length - 1]!;
      const t = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(m[3]!);
      const s = /scale\(([-\d.]+) ([-\d.]+)\)/.exec(m[3]!);
      const [ux, uy] = [Number(s?.[1] ?? 1), Number(s?.[2] ?? 1)];
      const [dx, dy] = [Number(t?.[1] ?? 0), Number(t?.[2] ?? 0)];
      stack.push([sx * ux, sy * uy, tx + sx * dx, ty + sy * dy]);
      if (m[4] === "/") stack.pop();
      continue;
    }
    if (m[1] === "/" || /fill-opacity/.test(m[3]!)) continue;
    const a = (name: string): number => Number(new RegExp(`\\b${name}="([-\\d.]+)"`).exec(m[3]!)?.[1] ?? 0);
    const fill = /\bfill="([^"]+)"/.exec(m[3]!)?.[1];
    if (fill === undefined) continue;
    const [sx, sy, tx, ty] = stack[stack.length - 1]!;
    const [xa, ya] = [tx + sx * a("x"), ty + sy * a("y")];
    const [xb, yb] = [tx + sx * (a("x") + a("width")), ty + sy * (a("y") + a("height"))];
    out.push({ x0: Math.min(xa, xb), x1: Math.max(xa, xb), y0: Math.min(ya, yb), y1: Math.max(ya, yb), fill });
  }
  return out;
}

/** The colour on the cloth at a point: the last rectangle that covers it. */
const colourAt = (all: readonly Box[], x: number, y: number): string | undefined => all.findLast((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1)?.fill;

/** Points all over a triangle, the corners and edges included. */
function sample(t: [number, number][], n = 10): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) {
    const [a, b] = [i / n, j / n];
    out.push([t[0]![0] * (1 - a - b) + t[1]![0] * a + t[2]![0] * b, t[0]![1] * (1 - a - b) + t[1]![1] * a + t[2]![1] * b]);
  }
  return out;
}

/** What a corner grown by `g` is: the cell's own triangle, each corner pushed out from its middle (volume.ts's quadPath). */
function grown(tex: readonly number[], g: number): [number, number][] {
  const cx = (tex[0]! + tex[2]! + tex[4]!) / 3;
  const cy = (tex[1]! + tex[3]! + tex[5]!) / 3;
  return [0, 1, 2].map((k) => {
    const [dx, dy] = [tex[2 * k]! - cx, tex[2 * k + 1]! - cy];
    const l = Math.hypot(dx, dy) || 1;
    return [tex[2 * k]! + (dx / l) * g, tex[2 * k + 1]! + (dy / l) * g];
  });
}

test("a cell's grown fringe shows the colour of the cloth it grows from: at a hanging end's edges no kohaku red leaks past a bar or a tip, at 5x and at any zoom", () => {
  const all = boxes(strapFace(paintOf(), W, undefined, true).body);
  // The ends' faces, one strip each, and the edge strip they share.
  const strips = [...END_FACE_Y.map((y) => ({ y0: y as number, y1: y + W })), { y0: EDGE1_Y, y1: EDGE1_Y + EDGE_H }];
  const cells = strapCells(RING);
  let checked = 0;
  let onBars = 0;
  for (const c of cells) {
    const mid = [(c.tex[0]! + c.tex[2]! + c.tex[4]!) / 3, (c.tex[1]! + c.tex[3]! + c.tex[5]!) / 3] as const;
    // The cut end of a hanging end lies on the edge strip's start, far from the ends' stretches.
    const strip = strips.find((s) => mid[1] > s.y0 - 1e-6 && mid[1] < s.y1 + 1e-6);
    if (strip === undefined || mid[0] < END_X[1] - 1e-6) continue;
    for (const [x, y] of sample(grown(c.tex, STRAP_GROW))) {
      const inside = Math.min(strip.y1, Math.max(strip.y0, y));
      const want = colourAt(all, x, inside);
      checked++;
      if (want !== undefined && !want.startsWith("url(")) onBars++;
      assert.equal(colourAt(all, x, y), want, `a fringe point at x ${x.toFixed(2)}, y ${y.toFixed(2)} of the strip at ${strip.y0} is ${colourAt(all, x, y)}, the cloth beside it ${want}`);
    }
  }
  assert.ok(checked > 1000 && onBars > 100, `the check reached the bars (${checked} points, ${onBars} on a colour block)`);
});

test("a bar or a tip is sewn round the edges too: the edge strip carries each end's blocks where the face does, and the face's blocks run out to the strip's margin", () => {
  const all = boxes(strapFace(paintOf(), W, undefined, true).body);
  const style = readStyle(STYLE);
  for (const end of [0, 1] as const) {
    const y = END_FACE_Y[end];
    const x0 = END_X[end];
    let blocks = 0;
    for (let d = 0; d <= END_LENGTH[end]; d += 0.25) {
      const face = colourAt(all, x0 + d, y + HALF);
      const edge = colourAt(all, x0 + d, EDGE1_Y + EDGE_H / 2);
      if (face !== undefined && !face.startsWith("url(")) blocks++;
      assert.equal(edge, face, `${d} units along end ${end}: the edge is ${edge}, the face ${face}`);
      // Over a block, the margin on both sides of the cloth is its colour too.
      assert.equal(colourAt(all, x0 + d, y - STRAP_GROW), face);
      assert.equal(colourAt(all, x0 + d, y + W + STRAP_GROW), face);
    }
    assert.ok(blocks > 20, "the end has blocks to check");
    assert.ok(style !== undefined);
  }
});

test("the plain blocks reach past the belt's width by the strip's margin, and the drawing the designer makes carries them", () => {
  const style = readStyle(STYLE);
  assert.equal(endBlocks(style, 0, HALF, 0).includes("<path"), false, "plain blocks are rectangles only");
  assert.ok(endBlocks(style, 0, HALF, STRIP_MARGIN).includes(`y="${Math.round(-(HALF + STRIP_MARGIN) * 100) / 100}"`));
  // The strip itself is as tall as the bled blocks: a block is told by its colour.
  const bled = `height="${Math.round((W + 2 * STRIP_MARGIN) * 100) / 100}" fill="#1e1e20"`;
  assert.ok(renderJudogi({ mode: "belt", belt: "red-white", beltStyle: STYLE, yaw: 30 }).includes(bled), "the strap's strip carries the bled blocks");
  assert.equal(renderJudogi({ mode: "belt", belt: "red-white", yaw: 30 }).includes(bled), false);
});

test("a stripe along the belt that reaches an edge runs out over the strip's margin, so a grown cell at that edge shows its colour and not the belt's", () => {
  const style = readStyle({ along: [{ colour: "white", at: "edges", widthCm: 1 }], split: "yellow" });
  const paint = { ...(beltPaint("t", "red-white", 15) as BeltPaint), bands: bandsOf(style) };
  const all = boxes(strapFace(paint, W, undefined, true).body);
  const white = stripeHex("white");
  for (const x of [0, 40, 100, 160]) {
    assert.equal(colourAt(all, x, FACE_Y - STRAP_GROW), white, "the top edge");
    assert.equal(colourAt(all, x, FACE_Y + W + STRAP_GROW), white, "the lower edge");
    assert.equal(colourAt(all, x, FACE_Y + W * 0.65), stripeHex("yellow"), "the split colour in the middle");
  }
});
