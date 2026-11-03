// Japanese letters as outlines with no font to load: every hiragana and katakana, the long mark, a few marks of punctuation and the kanji of the arts' names and numerals, in a pen hand
// (Klee One, a regular-script textbook face, SIL Open Font License 1.1: see NOTICE.md). `brushKana(text)` returns one path, the same shape `fontToPath` gives, for an embroidery's `path`.
// This is its own entry (`@johnmorrisdotca/senshu-jerseys/brush-kana`): the glyphs are about 200 kilobytes of text (60 gzipped) and no page that does not import it pays for them.
import type { FontPath } from "./fontPath.ts";
import { BRUSH_GLYPHS } from "./brushKanaData.ts";

/**
 * The direction and spacing of kana set by `brushKana`.
 *
 * @example
 * ```ts
 * import { brushKana, type BrushKanaOptions } from "@johnmorrisdotca/senshu-jerseys/brush-kana";
 *
 * const options: BrushKanaOptions = { direction: "down", spacing: 0.1 };
 * console.log(brushKana("さむ", options).height > 0);
 * ```
 */
export interface BrushKanaOptions {
  /** `across` (the default) sets the text on a line; `down` stands each character upright in a column, one under the next. */
  direction?: "across" | "down";
  /** Extra space between characters as a share of the em: 0.04 across and 0.08 down by default, from -0.2 to 1. */
  spacing?: number;
}

/**
 * The font the outlines come from, for a credit line.
 *
 * @example
 * ```ts
 * import { BRUSH_KANA_FONT } from "@johnmorrisdotca/senshu-jerseys/brush-kana";
 *
 * console.log(BRUSH_KANA_FONT);
 * ```
 */
export const BRUSH_KANA_FONT = "Klee One (SIL Open Font License 1.1)";

/**
 * The characters `brushKana` has outlines for, as one string.
 *
 * @example
 * ```ts
 * import { BRUSH_KANA_CHARS } from "@johnmorrisdotca/senshu-jerseys/brush-kana";
 *
 * console.log(BRUSH_KANA_CHARS);
 * ```
 */
export const BRUSH_KANA_CHARS: string = Object.keys(BRUSH_GLYPHS).join("");

const MAX_CHARS = 64;

/** A path's absolute commands (M, L, Q, Z), each point moved by (dx, dy), to whole units. */
function shift(d: string, dx: number, dy: number): string {
  dx = Math.round(dx);
  dy = Math.round(dy);
  return d.replace(/([MLQ])([^MLQZ]*)/g, (_, c: string, nums: string) => {
    const v = nums.split(" ").map(Number);
    return c + v.map((n, i) => n + (i % 2 === 0 ? dx : dy)).join(" ");
  });
}

/**
 * `text` in a pen hand, as one path for an embroidery's `path`: filled with the non-zero rule, y down, its top left at 0 0 in a box of `width` x `height` (the em is 100). Characters it has no outline
 * for (`BRUSH_KANA_CHARS` are the ones it has) are left out and listed in `missing`. At most 64 characters.
 *
 * @param text - hiragana or katakana
 * @param options - the direction the text runs (`across` or `down`) and the spacing
 * @returns one path with its width and height, and the characters it has no outline for
 * @example
 * ```ts
 * import { brushKana } from "@johnmorrisdotca/senshu-jerseys/brush-kana";
 *
 * const path = brushKana("せんしゅ");
 * console.log(path.missing.length, path.width > 0);
 * ```
 */
export function brushKana(text: string, options: BrushKanaOptions = {}): FontPath {
  const down = options.direction === "down";
  const spacing = Number.isFinite(options.spacing) ? Math.max(-0.2, Math.min(1, options.spacing as number)) : down ? 0.08 : 0.04;
  const missing: string[] = [];
  const parts: string[] = [];
  let pen = 0;
  let row = 0;
  for (const ch of Array.from(text.normalize("NFC")).slice(0, MAX_CHARS)) {
    const glyph = BRUSH_GLYPHS[ch];
    if (glyph === undefined) {
      if (!/\s/.test(ch)) missing.push(ch);
      continue;
    }
    parts.push(down ? shift(glyph[1], -glyph[0] / 2, row++ * 100 * (1 + spacing)) : shift(glyph[1], pen, 0));
    pen += glyph[0] + 100 * spacing;
  }
  if (parts.length === 0) return { d: "", width: 0, height: 0, missing };
  // The box the ink fills, from the numbers of the path (a curve's control point counts: the box is a hair large, never small).
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const joined = parts.join("");
  for (const m of joined.matchAll(/(-?\d+) (-?\d+)/g)) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { d: shift(joined, -x0, -y0), width: x1 - x0, height: y1 - y0, missing };
}
