// Text to outlines: a TrueType font built here, byte by byte, with a triangle, a round shape of off-curve points only and a composite, read back as one path.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fontToPath, renderJudogi } from "../src/index.ts";
import { wellFormed } from "./helpers.ts";

type Glyph = { contours: { x: number; y: number; on: boolean }[][] } | { parts: { gid: number; dx: number; dy: number; scale?: number }[] };

class Bytes {
  b: number[] = [];
  u8(v: number): this { this.b.push(v & 255); return this; }
  u16(v: number): this { return this.u8(v >> 8).u8(v); }
  i16(v: number): this { return this.u16(v & 0xffff); }
  u32(v: number): this { return this.u16(v >>> 16).u16(v & 0xffff); }
  tag(t: string): this { for (const c of t) this.u8(c.charCodeAt(0)); return this; }
  pad(): this { while (this.b.length % 4) this.u8(0); return this; }
}

/** em 1000: gid 0 empty, 1 "A" a triangle, 2 "O" four off-curve points, 3 "É" the triangle moved 600 right and 0.5 as big. A space has an advance and no outline. */
function tinyFont(cmap: "4" | "12" = "4", short = false): Uint8Array {
  const glyphs: Glyph[] = [
    { contours: [] },
    { contours: [[{ x: 0, y: 0, on: true }, { x: 500, y: 0, on: true }, { x: 250, y: 700, on: true }]] },
    { contours: [[{ x: 0, y: 0, on: false }, { x: 1000, y: 0, on: false }, { x: 1000, y: 1000, on: false }, { x: 0, y: 1000, on: false }]] },
    { parts: [{ gid: 1, dx: 600, dy: 0, scale: 0.5 }] },
    { contours: [] },
  ];
  const codes: [number, number][] = [[0x20, 4], [0x41, 1], [0x4f, 2], [0xc9, 3]];
  const glyf = new Bytes();
  const offsets: number[] = [];
  for (const g of glyphs) {
    offsets.push(glyf.b.length);
    if ("parts" in g) {
      glyf.i16(-1).i16(0).i16(0).i16(0).i16(0);
      g.parts.forEach((p, i) => {
        const more = i < g.parts.length - 1 ? 0x20 : 0;
        glyf.u16(1 | 2 | (p.scale === undefined ? 0 : 8) | more).u16(p.gid).i16(p.dx).i16(p.dy);
        if (p.scale !== undefined) glyf.i16(Math.round(p.scale * 16384));
      });
    } else if (g.contours.length > 0) {
      glyf.i16(g.contours.length).i16(0).i16(0).i16(0).i16(0);
      let n = 0;
      for (const c of g.contours) { n += c.length; glyf.u16(n - 1); }
      glyf.u16(0);
      const pts = g.contours.flat();
      for (const p of pts) glyf.u8(p.on ? 1 : 0);
      let prev = 0;
      for (const p of pts) { glyf.i16(p.x - prev); prev = p.x; }
      prev = 0;
      for (const p of pts) { glyf.i16(p.y - prev); prev = p.y; }
    }
    while (glyf.b.length % 4) glyf.u8(0);
  }
  offsets.push(glyf.b.length);
  const loca = new Bytes();
  for (const o of offsets) {
    if (short) loca.u16(o / 2);
    else loca.u32(o);
  }
  const head = new Bytes().u32(0x00010000).u32(0).u32(0).u32(0x5f0f3cf5).u16(0).u16(1000);
  while (head.b.length < 50) head.u8(0);
  head.i16(short ? 0 : 1).i16(0);
  const maxp = new Bytes().u32(0x00010000).u16(glyphs.length);
  const hhea = new Bytes().u32(0x00010000).i16(900).i16(-200);
  while (hhea.b.length < 34) hhea.u8(0);
  hhea.u16(glyphs.length);
  const hmtx = new Bytes();
  for (let i = 0; i < glyphs.length; i++) hmtx.u16(i === 4 ? 300 : 600).i16(0);
  const sub = new Bytes();
  if (cmap === "12") {
    sub.u16(12).u16(0).u32(16 + codes.length * 12).u32(0).u32(codes.length);
    for (const [c, g] of [...codes].sort((a, b) => a[0] - b[0])) sub.u32(c).u32(c).u32(g);
  } else {
    const segs = [...codes].sort((a, b) => a[0] - b[0]);
    const n = segs.length + 1;
    sub.u16(4).u16(16 + n * 8).u16(0).u16(n * 2).u16(0).u16(0).u16(0);
    for (const [c] of segs) sub.u16(c);
    sub.u16(0xffff).u16(0);
    for (const [c] of segs) sub.u16(c);
    sub.u16(0xffff);
    for (const [c, g] of segs) sub.i16(g - c);
    sub.i16(1);
    for (let i = 0; i < n; i++) sub.u16(0);
  }
  const cm = new Bytes().u16(0).u16(1).u16(cmap === "12" ? 3 : 3).u16(cmap === "12" ? 10 : 1).u32(12);
  cm.b.push(...sub.b);
  const tables: [string, Bytes][] = [["cmap", cm], ["glyf", glyf], ["head", head], ["hhea", hhea], ["hmtx", hmtx], ["loca", loca], ["maxp", maxp]];
  const out = new Bytes().u32(0x00010000).u16(tables.length).u16(0).u16(0).u16(0);
  let at = 12 + tables.length * 16;
  for (const [t, d] of tables) { out.tag(t).u32(0).u32(at).u32(d.b.length); at += (d.b.length + 3) & ~3; }
  for (const [, d] of tables) { out.b.push(...d.b); out.pad(); }
  return Uint8Array.from(out.b);
}

const PATH_OK = /^[MLHVCSQTAZmlhvcsqtaz0-9eE.,\s+-]+$/;

test("a triangle is read, in a path of its own with its top left at 0 0 and the em at 100", () => {
  for (const cmap of ["4", "12"] as const) {
    for (const short of [false, true]) {
      const r = fontToPath(tinyFont(cmap, short), "A");
      assert.deepEqual([r.width, r.height, r.missing], [50, 70, []], `${cmap} ${short}`);
      assert.equal(r.d, "M0 70L50 70L25 0Z", `${cmap} ${short}`);
    }
  }
});

test("a shape of off-curve points alone is rounded through the middles of its sides, and its size is the curve's", () => {
  const r = fontToPath(tinyFont(), "O");
  assert.deepEqual([r.width, r.height], [100, 100]);
  assert.equal((r.d.match(/Q/g) ?? []).length, 4);
  assert.equal((r.d.match(/M/g) ?? []).length, 1);
  assert.equal(r.d.at(-1), "Z");
});

test("a composite glyph is its part moved and scaled", () => {
  const r = fontToPath(tinyFont(), "É");
  assert.deepEqual([r.width, r.height], [25, 35]);
  assert.equal(r.d, "M0 35L25 35L12.5 0Z");
  // Moved 600 units right of its own origin, which is one advance and the spacing (640) after the triangle's.
  assert.equal(fontToPath(tinyFont(), "AÉ").width, 149);
});

test("text across is set one advance after the next with the spacing between; a character the font lacks is left out and named", () => {
  const f = tinyFont();
  const a = fontToPath(f, "AA");
  // The second triangle starts one advance (600) and the default spacing (0.04 of the em) on: 64 units.
  assert.equal(a.width, 114);
  assert.equal(fontToPath(f, "AA", { spacing: 0 }).width, 110);
  assert.equal(fontToPath(f, "AA", { spacing: 5 }).width, 210);
  const m = fontToPath(f, "AZ💥A");
  assert.deepEqual(m.missing, ["Z", "💥"]);
  assert.equal(m.width, fontToPath(f, "AA").width);
  const s = fontToPath(f, "A A", { spacing: 0 });
  assert.equal(s.width, 140);
});

test("text down stands each character upright, one under the next, on a column's middle", () => {
  const r = fontToPath(tinyFont(), "AA", { direction: "down" });
  assert.equal(r.width, 50);
  assert.equal(r.height, 70 + 108);
  assert.equal(fontToPath(tinyFont(), "A A", { direction: "down" }).height, r.height);
});

test("nothing to draw gives an empty path, which an embroidery ignores", () => {
  for (const text of ["", " ", "Z", "💥"]) assert.deepEqual(fontToPath(tinyFont(), text).d, "", JSON.stringify(text));
  const none = renderJudogi({ embroidery: [{ place: "jacket-hem", path: fontToPath(tinyFont(), "Z") }] });
  assert.equal(none, renderJudogi({}));
});

test("precision, and a long path being shortened by itself", () => {
  const r3 = fontToPath(tinyFont(), "O", { precision: 3 });
  const r0 = fontToPath(tinyFont(), "O", { precision: 0 });
  assert.ok(r3.d.length >= r0.d.length);
  assert.ok(PATH_OK.test(r3.d) && PATH_OK.test(r0.d));
  const big = fontToPath(tinyFont(), "O".repeat(64), { precision: 3 });
  assert.ok(big.d.length < 59_001, `${big.d.length}`);
});

test("only text this reader can set is accepted, and what it cannot read is said plainly", () => {
  const f = tinyFont();
  const cff = Uint8Array.from(f);
  cff.set([0x4f, 0x54, 0x54, 0x4f]);
  assert.throws(() => fontToPath(cff, "A"), /CFF/);
  assert.throws(() => fontToPath(Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 0, 0, 0, 0, 0, 0, 0, 0, 0]), "A"), /WOFF/);
  assert.throws(() => fontToPath(new Uint8Array(4), "A"), /not a font/);
  assert.throws(() => fontToPath(Uint8Array.from("plain text, not a font at all"), "A"), /TrueType/);
  assert.throws(() => fontToPath(f.slice(0, 120), "A"), /fontToPath/);
  assert.throws(() => fontToPath(f.slice(0, f.length - 40), "AO"), /cut short|damaged/);
  // A view into a larger buffer and a bare ArrayBuffer read alike.
  const wide = new Uint8Array(f.length + 20);
  wide.set(f, 10);
  assert.equal(fontToPath(wide.subarray(10, 10 + f.length), "A").d, fontToPath(f.buffer.slice(0) as ArrayBuffer, "A").d);
});

test("an outline from a font is stitched as thread at the place's size, whatever units it came in", () => {
  const path = fontToPath(tinyFont(), "AO");
  const svg = renderJudogi({ mode: "suit", view: "flat", embroidery: [{ place: "jacket-chest", path, thread: "red" }] });
  assert.equal(wellFormed(svg), null);
  assert.ok(svg.includes(path.d.slice(0, 20)));
  // The thread's pattern, shadow and edge are the same size on the cloth as on a letter, not shrunk with the outline's own units.
  const scaleOf = (s: string): number => Number(/patternTransform="rotate\(38\) scale\(([\d.]+)\)"/.exec(s)?.[1]);
  const grown = fontToPath(tinyFont(), "AO");
  const huge = { ...grown, d: grown.d.replace(/-?\d+(\.\d+)?/g, (n) => String(Number(n) * 10)), width: grown.width * 10, height: grown.height * 10 };
  const a = scaleOf(svg);
  const b = scaleOf(renderJudogi({ mode: "suit", view: "flat", embroidery: [{ place: "jacket-chest", path: huge, thread: "red" }] }));
  assert.ok(a > 1, `${a}`);
  assert.ok(Math.abs(b / a - 10) < 0.2, `${a} ${b}`);
});
