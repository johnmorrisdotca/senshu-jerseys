// A TrueType font built byte by byte for the designer's tests: a triangle for "A" and a square for "O", em 1000. Not a real font, and nothing to ship.
export function tinyFont() {
  const bytes = [];
  const u8 = (v) => bytes.push(v & 255);
  const u16 = (v) => { u8(v >> 8); u8(v); };
  const u32 = (v) => { u16(v >>> 16); u16(v & 0xffff); };
  const table = (build) => {
    bytes.length = 0;
    build();
    while (bytes.length % 4) u8(0);
    return Uint8Array.from(bytes);
  };
  const shapes = [[], [[0, 0], [500, 0], [250, 700]], [[0, 0], [800, 0], [800, 800], [0, 800]]];
  const offsets = [];
  const glyf = table(() => {
    for (const pts of shapes) {
      offsets.push(bytes.length);
      if (pts.length > 0) {
        u16(1); u16(0); u16(0); u16(0); u16(0);
        u16(pts.length - 1); u16(0);
        for (let i = 0; i < pts.length; i++) u8(1);
        let prev = 0;
        for (const [x] of pts) { u16((x - prev) & 0xffff); prev = x; }
        prev = 0;
        for (const [, y] of pts) { u16((y - prev) & 0xffff); prev = y; }
      }
      while (bytes.length % 4) u8(0);
    }
    offsets.push(bytes.length);
  });
  const loca = table(() => offsets.forEach(u32));
  const head = table(() => { u32(0x00010000); u32(0); u32(0); u32(0x5f0f3cf5); u16(0); u16(1000); while (bytes.length < 50) u8(0); u16(1); u16(0); });
  const maxp = table(() => { u32(0x00010000); u16(shapes.length); });
  const hhea = table(() => { u32(0x00010000); u16(900); u16(0xff38); while (bytes.length < 34) u8(0); u16(shapes.length); });
  const hmtx = table(() => shapes.forEach(() => { u16(900); u16(0); }));
  const cmap = table(() => {
    const codes = [[0x41, 1], [0x4f, 2]];
    const n = codes.length + 1;
    u16(0); u16(1); u16(3); u16(1); u32(12);
    u16(4); u16(16 + n * 8); u16(0); u16(n * 2); u16(0); u16(0); u16(0);
    for (const [c] of codes) u16(c);
    u16(0xffff); u16(0);
    for (const [c] of codes) u16(c);
    u16(0xffff);
    for (const [c, g] of codes) u16((g - c) & 0xffff);
    u16(1);
    for (let i = 0; i < n; i++) u16(0);
  });
  const tables = [["cmap", cmap], ["glyf", glyf], ["head", head], ["hhea", hhea], ["hmtx", hmtx], ["loca", loca], ["maxp", maxp]];
  const out = [];
  const o8 = (v) => out.push(v & 255);
  const o16 = (v) => { o8(v >> 8); o8(v); };
  const o32 = (v) => { o16(v >>> 16); o16(v & 0xffff); };
  o32(0x00010000); o16(tables.length); o16(0); o16(0); o16(0);
  let at = 12 + tables.length * 16;
  for (const [tag, data] of tables) { for (const c of tag) o8(c.charCodeAt(0)); o32(0); o32(at); o32(data.length); at += data.length; }
  for (const [, data] of tables) out.push(...data);
  return Buffer.from(out);
}

/** A file that is not a usable TrueType font, with the first four bytes of the format it pretends to be (`wOFF`, `OTTO`). */
export const fakeFont = (tag) => Buffer.concat([Buffer.from(tag, "latin1"), Buffer.alloc(64)]);
