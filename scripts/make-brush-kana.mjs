// Cuts a Japanese font (a .ttf with TrueType outlines, licensed to be embedded and passed on: the SIL OFL, say) into the glyphs `src/brushKanaData.ts` keeps, each as one path in an em box:
// `node scripts/make-brush-kana.mjs path/to/KleeOne-Regular.ttf`. Run it with Node 22 or later; it reads the font with the package's own `fontToPath` (no tool beyond Node). The font itself is not
// kept: only these outlines, a few kilobytes a hundred glyphs. The set: every hiragana and katakana, the long mark and the marks of punctuation, and the kanji of the arts' names and numerals.
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { fontToPath } from "../src/fontPath.ts";

const file = process.argv[2];
if (file === undefined) throw new Error("usage: node scripts/make-brush-kana.mjs font.ttf");
const bytes = new Uint8Array(readFileSync(file));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i));
const chars = [
  ...range(0x3041, 0x3096), ...range(0x30a1, 0x30fa), "ー", "ゝ", "ゞ", "ヽ", "ヾ", "゛", "゜", "、", "。", "・", "「", "」",
  ..."柔道空手術跆拳合気剣武心技体礼勝一二三四五六七八九十",
];
const rows = [];
let size = 0;
for (const ch of chars) {
  const p = fontToPath(bytes, ch, { box: "em", spacing: 0, precision: 0 });
  if (p.d === "") continue;
  rows.push(`  ${JSON.stringify(ch)}: [${p.width}, ${JSON.stringify(p.d)}],`);
  size += p.d.length;
}
const text = `// Glyph outlines cut from Klee One (SIL Open Font License 1.1, copyright 2020 The Klee Project Authors; see NOTICE.md) by scripts/make-brush-kana.mjs: each character's width in em-box units (the
// em is 100) and one path in that box, 100 high, the baseline 88 down, y down. Generated: do not edit by hand.
export const BRUSH_GLYPHS: Readonly<Record<string, readonly [number, string]>> = {
${rows.join("\n")}
};
`;
writeFileSync(new URL("../src/brushKanaData.ts", import.meta.url), text);
console.log(`${rows.length} glyphs, ${size} characters of path, ${text.length} bytes`);
