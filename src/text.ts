// Text on a jersey: drawn from the glyphs (strokes) where every character has one, else set as system text, one character at a time, so that both can be arched.
import { esc } from "./colour.ts";
import { WEIGHTS, drawable, glyphOf, type Weight } from "./glyphs.ts";
import { mapPath, n2, placed } from "./path.ts";

export interface RunOptions {
  /** The height of the letters, in the drawing's units, outline not counted. */
  height: number;
  /** The widest the run may be; it is scaled down to fit. */
  maxWidth?: number;
  weight?: Weight;
  /** The gap between letters, in units of the stroke. */
  tracking?: number;
  /** The radius of an arch (the run follows a rainbow curve); 0 or missing is straight. */
  arch?: number;
}

/** One placed run: the path of the strokes (`d`) and their width (`sw`), or the system-text characters (`chars`). */
export interface Run {
  kind: "glyph" | "text";
  d: string;
  sw: number;
  width: number;
  height: number;
  chars: { c: string; x: number; y: number; r: number; size: number }[];
}

const FONT = "system-ui,-apple-system,'Segoe UI','Hiragino Sans','Noto Sans JP','Yu Gothic',sans-serif";
const wide = (c: string): boolean => /[ᄀ-ᇿ⺀-鿿가-힯＀-￯]/.test(c);

/**
 * Lay a run out about the point `(cx, cy)`: the middle of its letters, left to right, on a straight line or a rainbow arch. `d` is one path of centre lines for
 * a stroke of `sw`; draw it again with a wider stroke under it for an outline.
 */
export function layout(text: string, cx: number, cy: number, o: RunOptions): Run {
  const weight = WEIGHTS[o.weight ?? "bold"];
  const chars = [...text];
  const glyphMode = drawable(text);
  const track = (o.tracking ?? 0.55) * weight;
  // The natural size: height 90 + the stroke. Widths in glyph units.
  const adv = chars.map((c) => (glyphMode ? (glyphOf(c)?.w ?? 0) + weight : wide(c) ? 100 : 62));
  const gapOf = (i: number): number => (i < chars.length - 1 && chars[i] !== " " && chars[i + 1] !== " " ? track : 0);
  const natural = adv.reduce((s, a, i) => s + a + gapOf(i), 0) - (glyphMode ? 0 : 0);
  const naturalH = glyphMode ? 90 + weight : 100;
  let k = o.height / naturalH;
  if (o.maxWidth !== undefined && natural * k > o.maxWidth) k = o.maxWidth / natural;
  const width = natural * k;
  const height = naturalH * k;
  const R = o.arch !== undefined && o.arch > 0 ? o.arch : 0;
  let x = -width / 2;
  let d = "";
  const out: Run["chars"] = [];
  chars.forEach((c, i) => {
    const w = adv[i] as number;
    const mid = x + (w * k) / 2;
    // The point on the baseline the letter stands on, and how far the letter is turned.
    let px = cx + mid;
    let py = cy + height / 2;
    let rot = 0;
    if (R > 0) {
      const a = mid / R;
      px = cx + R * Math.sin(a);
      py = cy + height / 2 + R * (1 - Math.cos(a)) - R * (1 - Math.cos(0));
      rot = (a * 180) / Math.PI;
    }
    if (glyphMode) {
      const g = glyphOf(c);
      if (g !== undefined && g.d !== "") {
        // The glyph's own centre line, its box centred on x = 0 and its bottom on y = 0, then scaled, turned and put on the baseline.
        const place = placed(k, rot, px, py);
        d += mapPath(g.d, (gx, gy) => place(gx - g.w / 2, gy - 90 - weight / 2), k);
      }
    } else if (c !== " ") {
      out.push({ c, x: px, y: py - height / 2 + height * 0.05, r: rot, size: height * 0.9 });
    }
    x += (w + gapOf(i)) * k;
  });
  return { kind: glyphMode ? "glyph" : "text", d, sw: weight * k, width, height, chars: out };
}

/** The markup of a run in a fill, with an outline of `edge` beyond it where one is given (`outline` is the outline's width on each side) and a stitched line inside. */
export function drawRun(run: Run, fill: string, edge: { colour: string; width: number } | undefined, stitch: string | undefined): string {
  if (run.kind === "glyph") {
    if (run.d === "") return "";
    const strokes = 'fill="none" stroke-linejoin="miter" stroke-miterlimit="2.5" stroke-linecap="butt"';
    let out = "";
    if (edge !== undefined && edge.width > 0) out += `<path d="${run.d}" ${strokes} stroke="${edge.colour}" stroke-width="${n2(run.sw + edge.width * 2)}"/>`;
    out += `<path d="${run.d}" ${strokes} stroke="${fill}" stroke-width="${n2(run.sw)}"/>`;
    // Stitching: a dashed ring along each edge of the letter, made by a dashed wide stroke covered by a narrower solid one.
    if (stitch !== undefined && run.sw > 5) {
      out += `<path d="${run.d}" ${strokes} stroke="${stitch}" stroke-width="${n2(run.sw)}" stroke-dasharray="${n2(run.sw * 0.12)} ${n2(run.sw * 0.12)}" stroke-opacity=".55"/>`;
      out += `<path d="${run.d}" ${strokes} stroke="${fill}" stroke-width="${n2(run.sw * 0.82)}"/>`;
    }
    return out;
  }
  let out = "";
  for (const ch of run.chars) {
    const attrs = `transform="translate(${n2(ch.x)} ${n2(ch.y)}) rotate(${n2(ch.r)})" font-size="${n2(ch.size)}" text-anchor="middle" font-weight="800" font-family="${FONT}"`;
    const halo = edge !== undefined && edge.width > 0 ? ` stroke="${edge.colour}" stroke-width="${n2(edge.width * 2)}" stroke-linejoin="round" paint-order="stroke"` : "";
    out += `<text ${attrs} fill="${fill}"${halo}>${esc(ch.c)}</text>`;
  }
  return out;
}
