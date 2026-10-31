// Text to outlines. Reads a TrueType font file you supply and returns the outlines of some text as ONE path, ready for the `path` of an embroidery
// (`{ place, path: fontToPath(bytes, "柔道") }`). The package ships no font (a Japanese face is megabytes); this lets you keep the font out of the
// page too: run it once, keep the few hundred bytes of path, and a saved SVG and the canvas painter need no font at all. Reads the glyf outlines of a
// .ttf: cmap (formats 4 and 12), head, hhea, hmtx, loca and glyf, with composite glyphs. No kerning, no ligatures, no hinting, no variations (a
// variable font gives its default look). A CFF font (.otf with PostScript outlines), WOFF and WOFF2 are refused with a message that says so. Original code.

export interface FontPathOptions {
  /** `across` (the default) sets the text on a line; `down` stands each character upright in a column, one under the next, as a vertical Japanese line stands. */
  direction?: "across" | "down";
  /** Extra space between characters as a share of the em: 0.04 across and 0.08 down by default, from -0.2 to 1. */
  spacing?: number;
  /** Decimal places kept in the path's numbers, 0 to 3 (1 by default; the em is 100 units, so 0.1 is a thousandth of the em). Lowered by itself if the path would be too long to use. */
  precision?: number;
}

export interface FontPath {
  /** The outlines, filled with the non-zero rule, y down, its top left at 0 0. Empty when nothing could be set. */
  d: string;
  /** The size of the outlines in the path's own units (the em is 100). */
  width: number;
  height: number;
  /** The characters the font has no glyph for, left out. */
  missing: string[];
}

const MAX_CHARS = 64;
const MAX_POINTS = 20_000;
/** The longest path an embroidery takes (see `readMarks`). */
const MAX_PATH = 59_000;

type Pt = { x: number; y: number; on: boolean };
type Contour = Pt[];
type Seg = { c: "M" | "L" | "Q" | "Z"; p: number[] };

const fail = (why: string): never => {
  throw new Error(`fontToPath: ${why}`);
};

class Font {
  readonly v: DataView;
  readonly tables = new Map<string, { o: number; n: number }>();
  readonly em: number;
  readonly long: boolean;
  readonly glyphs: number;
  readonly metrics: number;
  readonly lookup: (cp: number) => number;
  constructor(bytes: ArrayBuffer | ArrayBufferView) {
    const buf = bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    this.v = new DataView(buf as ArrayBuffer);
    if (this.v.byteLength < 12) fail("this is not a font file");
    const tag = this.tag(0);
    if (tag === "wOFF" || tag === "wOF2") fail("WOFF and WOFF2 are compressed: pass the .ttf file");
    if (tag === "OTTO") fail("this font has PostScript (CFF) outlines: pass a TrueType .ttf");
    if (tag === "ttcf") fail("a font collection (.ttc): pass one .ttf from it");
    if (this.v.getUint32(0) !== 0x00010000 && tag !== "true") fail("this is not a TrueType font file");
    const count = this.v.getUint16(4);
    for (let i = 0; i < count; i++) {
      const at = 12 + i * 16;
      this.tables.set(this.tag(at), { o: this.v.getUint32(at + 8), n: this.v.getUint32(at + 12) });
    }
    for (const t of ["head", "maxp", "cmap", "hhea", "hmtx", "loca", "glyf"]) if (!this.tables.has(t)) fail(`the font has no ${t} table (is it a TrueType font?)`);
    const head = this.at("head");
    this.em = this.v.getUint16(head + 18);
    if (this.em < 16) fail("the font's units per em is not usable");
    this.long = this.v.getInt16(head + 50) !== 0;
    this.glyphs = this.v.getUint16(this.at("maxp") + 4);
    this.metrics = Math.max(1, this.v.getUint16(this.at("hhea") + 34));
    this.lookup = this.cmap();
  }
  tag(o: number): string {
    return String.fromCharCode(this.v.getUint8(o), this.v.getUint8(o + 1), this.v.getUint8(o + 2), this.v.getUint8(o + 3));
  }
  at(t: string): number {
    const e = this.tables.get(t);
    return e === undefined ? fail(`no ${t} table`) : e.o;
  }
  /** The character map, from the best Unicode subtable the font has. */
  private cmap(): (cp: number) => number {
    const base = this.at("cmap");
    const v = this.v;
    const subtables: { platform: number; encoding: number; o: number; format: number }[] = [];
    const n = v.getUint16(base + 2);
    for (let i = 0; i < n; i++) {
      const rec = base + 4 + i * 8;
      const o = base + v.getUint32(rec + 4);
      subtables.push({ platform: v.getUint16(rec), encoding: v.getUint16(rec + 2), o, format: v.getUint16(o) });
    }
    const pick =
      subtables.find((s) => s.format === 12 && ((s.platform === 3 && s.encoding === 10) || s.platform === 0)) ??
      subtables.find((s) => s.format === 4 && ((s.platform === 3 && s.encoding === 1) || s.platform === 0));
    if (pick === undefined) return fail("the font has no Unicode character map I can read (formats 4 and 12)");
    const o = pick.o;
    if (pick.format === 12) {
      const groups = v.getUint32(o + 12);
      return (cp) => {
        let lo = 0;
        let hi = groups - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const g = o + 16 + mid * 12;
          if (cp < v.getUint32(g)) hi = mid - 1;
          else if (cp > v.getUint32(g + 4)) lo = mid + 1;
          else return v.getUint32(g + 8) + (cp - v.getUint32(g));
        }
        return 0;
      };
    }
    const segX2 = v.getUint16(o + 6);
    const seg = segX2 / 2;
    const ends = o + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const ranges = deltas + segX2;
    return (cp) => {
      if (cp > 0xffff) return 0;
      for (let i = 0; i < seg; i++) {
        if (cp > v.getUint16(ends + i * 2)) continue;
        if (cp < v.getUint16(starts + i * 2)) return 0;
        const ro = v.getUint16(ranges + i * 2);
        if (ro === 0) return (cp + v.getInt16(deltas + i * 2)) & 0xffff;
        const gid = v.getUint16(ranges + i * 2 + ro + (cp - v.getUint16(starts + i * 2)) * 2);
        return gid === 0 ? 0 : (gid + v.getInt16(deltas + i * 2)) & 0xffff;
      }
      return 0;
    };
  }
  advance(gid: number): number {
    const hmtx = this.at("hmtx");
    return this.v.getUint16(hmtx + Math.min(gid, this.metrics - 1) * 4);
  }
  /** The contours of a glyph in font units (y up), with its composite parts put together. */
  contours(gid: number, depth = 0, budget = { n: 0 }): Contour[] {
    if (gid >= this.glyphs || depth > 6) return [];
    const v = this.v;
    const loca = this.at("loca");
    const from = this.long ? v.getUint32(loca + gid * 4) : v.getUint16(loca + gid * 2) * 2;
    const to = this.long ? v.getUint32(loca + gid * 4 + 4) : v.getUint16(loca + gid * 2 + 2) * 2;
    if (to <= from) return [];
    const g = this.at("glyf") + from;
    const nc = v.getInt16(g);
    if (nc >= 0) return this.simple(g, nc, budget);
    const out: Contour[] = [];
    let p = g + 10;
    for (;;) {
      const flags = v.getUint16(p);
      const part = v.getUint16(p + 2);
      p += 4;
      let dx: number;
      let dy: number;
      if (flags & 1) {
        dx = v.getInt16(p);
        dy = v.getInt16(p + 2);
        p += 4;
      } else {
        dx = v.getInt8(p);
        dy = v.getInt8(p + 1);
        p += 2;
      }
      if (!(flags & 2)) {
        dx = 0;
        dy = 0;
      }
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      const f = (o: number): number => v.getInt16(o) / 16384;
      if (flags & 8) {
        a = d = f(p);
        p += 2;
      } else if (flags & 0x40) {
        a = f(p);
        d = f(p + 2);
        p += 4;
      } else if (flags & 0x80) {
        a = f(p);
        b = f(p + 2);
        c = f(p + 4);
        d = f(p + 6);
        p += 8;
      }
      for (const contour of this.contours(part, depth + 1, budget)) out.push(contour.map((q) => ({ x: a * q.x + c * q.y + dx, y: b * q.x + d * q.y + dy, on: q.on })));
      if (!(flags & 0x20)) break;
    }
    return out;
  }
  private simple(g: number, nc: number, budget: { n: number }): Contour[] {
    const v = this.v;
    if (nc === 0) return [];
    const ends: number[] = [];
    for (let i = 0; i < nc; i++) ends.push(v.getUint16(g + 10 + i * 2));
    const n = (ends[nc - 1] as number) + 1;
    budget.n += n;
    if (budget.n > MAX_POINTS) fail("a glyph has too many points");
    let p = g + 10 + nc * 2;
    p += 2 + v.getUint16(p);
    const flags: number[] = [];
    while (flags.length < n) {
      const fl = v.getUint8(p++);
      flags.push(fl);
      if (fl & 8) for (let r = v.getUint8(p++); r > 0 && flags.length < n; r--) flags.push(fl);
    }
    const coords = (short: number, same: number): number[] => {
      const out: number[] = [];
      let acc = 0;
      for (const fl of flags) {
        if (fl & short) {
          const dv = v.getUint8(p++);
          acc += fl & same ? dv : -dv;
        } else if (!(fl & same)) {
          acc += v.getInt16(p);
          p += 2;
        }
        out.push(acc);
      }
      return out;
    };
    const xs = coords(2, 16);
    const ys = coords(4, 32);
    const out: Contour[] = [];
    let at = 0;
    for (const end of ends) {
      const c: Contour = [];
      for (; at <= end; at++) c.push({ x: xs[at] as number, y: ys[at] as number, on: ((flags[at] as number) & 1) === 1 });
      out.push(c);
    }
    return out;
  }
}

/** A closed TrueType contour as moves, lines and quadratic curves (y up, in font units). */
function segments(contour: Contour, put: (c: Seg["c"], ...p: number[]) => void): void {
  const n = contour.length;
  if (n < 2) return;
  const first = contour[0] as Pt;
  const last = contour[n - 1] as Pt;
  let start: { x: number; y: number };
  let from: number;
  let to: number;
  if (first.on) {
    start = first;
    from = 1;
    to = n;
  } else if (last.on) {
    start = last;
    from = 0;
    to = n - 1;
  } else {
    start = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 };
    from = 0;
    to = n;
  }
  put("M", start.x, start.y);
  let ctl: Pt | undefined;
  for (let i = from; i < to; i++) {
    const q = contour[i] as Pt;
    if (q.on) {
      if (ctl !== undefined) put("Q", ctl.x, ctl.y, q.x, q.y);
      else put("L", q.x, q.y);
      ctl = undefined;
    } else {
      if (ctl !== undefined) put("Q", ctl.x, ctl.y, (ctl.x + q.x) / 2, (ctl.y + q.y) / 2);
      ctl = q;
    }
  }
  if (ctl !== undefined) put("Q", ctl.x, ctl.y, start.x, start.y);
  put("Z");
}

/**
 * The outlines of `text` set in `font` (the bytes of a .ttf), as one path for an embroidery's `path`, in a box of its own with its top left at 0 0.
 * Characters the font lacks are left out and listed in `missing`. At most 64 characters.
 */
export function fontToPath(font: ArrayBuffer | ArrayBufferView, text: string, options: FontPathOptions = {}): FontPath {
  let f: Font;
  try {
    f = new Font(font);
  } catch (e) {
    if (e instanceof RangeError) return fail("the font file is cut short or damaged");
    throw e;
  }
  const down = options.direction === "down";
  const spacing = Number.isFinite(options.spacing) ? Math.max(-0.2, Math.min(1, options.spacing as number)) : down ? 0.08 : 0.04;
  const s = 100 / f.em;
  const missing: string[] = [];
  const out: Seg[] = [];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const grow = (x: number, y: number): void => {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  };
  let pen = 0;
  try {
    const chars = Array.from(text.normalize("NFC")).slice(0, MAX_CHARS);
    let row = 0;
    for (const ch of chars) {
      const gid = f.lookup(ch.codePointAt(0) as number);
      const blank = /\s/.test(ch);
      if (gid === 0 && !blank) {
        missing.push(ch);
        continue;
      }
      if (blank && down) continue;
      const adv = gid === 0 ? f.em / 3 : f.advance(gid);
      const ox = down ? -adv / 2 : pen;
      const oy = down ? row++ * f.em * (1 + spacing) : 0;
      pen += adv + f.em * spacing;
      // Placed in the output's units, y down, as each point is read.
      const place = (px: number, py: number): [number, number] => [(px + ox) * s, (oy - py) * s];
      let cur: [number, number] = [0, 0];
      const put = (c: Seg["c"], ...p: number[]): void => {
        const q: number[] = [];
        for (let k = 0; k + 1 < p.length; k += 2) q.push(...place(p[k] as number, p[k + 1] as number));
        if (c === "Q") {
          // Where the curve bulges past its ends counts toward the size.
          for (const axis of [0, 1]) {
            const a = cur[axis] as number;
            const b = q[axis] as number;
            const e = q[2 + axis] as number;
            const den = a - 2 * b + e;
            const t = den === 0 ? -1 : (a - b) / den;
            if (t > 0 && t < 1) {
              const u = 1 - t;
              const px = u * u * cur[0] + 2 * u * t * q[0]! + t * t * q[2]!;
              const py = u * u * cur[1] + 2 * u * t * q[1]! + t * t * q[3]!;
              grow(px, py);
            }
          }
        }
        for (let k = 0; k + 1 < q.length; k += 2) if (c !== "Q" || k === 2) grow(q[k] as number, q[k + 1] as number);
        if (q.length >= 2) cur = [q[q.length - 2] as number, q[q.length - 1] as number];
        out.push({ c, p: q });
      };
      if (gid !== 0) for (const contour of f.contours(gid)) segments(contour, put);
    }
  } catch (e) {
    if (e instanceof RangeError) return fail("the font file is cut short or damaged");
    throw e;
  }
  if (out.length === 0 || !(x1 > x0) || !(y1 > y0)) return { d: "", width: 0, height: 0, missing };
  const round = (v: number, k: number): number => Math.round(v * k) / k || 0;
  let places = Number.isFinite(options.precision) ? Math.max(0, Math.min(3, Math.round(options.precision as number))) : 1;
  for (;;) {
    const k = 10 ** places;
    const d = out.map((sg) => sg.c + sg.p.map((v, i) => round(v - (i % 2 === 0 ? x0 : y0), k)).join(" ")).join("");
    if (d.length <= MAX_PATH || places === 0) return { d, width: round(x1 - x0, k), height: round(y1 - y0, k), missing };
    places--;
  }
}
