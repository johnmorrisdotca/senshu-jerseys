// The bundled kana: outlines for a pen hand with no font to load, set as one path the way `fontToPath` sets a font's.
import assert from "node:assert/strict";
import { test } from "node:test";

import { renderJudogi } from "../src/index.ts";
import { BRUSH_KANA_CHARS, BRUSH_KANA_FONT, brushKana } from "../src/brushKana-entry.ts";
import { wellFormed } from "./helpers.ts";

test("every hiragana and katakana, the long mark and the arts' kanji have an outline", () => {
  for (let c = 0x3041; c <= 0x3096; c++) assert.ok(BRUSH_KANA_CHARS.includes(String.fromCodePoint(c)), String.fromCodePoint(c));
  for (let c = 0x30a1; c <= 0x30fa; c++) assert.ok(BRUSH_KANA_CHARS.includes(String.fromCodePoint(c)), String.fromCodePoint(c));
  for (const ch of "ー柔道空手術跆拳合気剣武一二三四五六七八九十") assert.ok(BRUSH_KANA_CHARS.includes(ch), ch);
  assert.match(BRUSH_KANA_FONT, /OFL|Open Font License/);
});

test("text across is one path with its top left at 0 0, wider with every letter, and what it lacks is named", () => {
  const one = brushKana("あ");
  const three = brushKana("あいう");
  assert.ok(one.d.startsWith("M") && one.d.includes("Q") && one.d.endsWith("Z"));
  assert.ok(one.width > 40 && one.width <= 100 && one.height > 40 && one.height <= 100, `${one.width} x ${one.height}`);
  assert.ok(three.width > 2.5 * one.width && three.width < 3.5 * 104, String(three.width));
  const numbers = [...three.d.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
  assert.ok(Math.min(...numbers) >= 0, "nothing lies left of or above the box");
  assert.deepEqual(brushKana("あxい 柔").missing, ["x"]);
  assert.deepEqual(brushKana("abc"), { d: "", width: 0, height: 0, missing: ["a", "b", "c"] });
  assert.deepEqual(brushKana(""), { d: "", width: 0, height: 0, missing: [] });
});

test("text down stands each character upright in a column, and spacing moves them apart", () => {
  const column = brushKana("柔道", { direction: "down" });
  const row = brushKana("柔道");
  assert.ok(column.height > 1.8 * 90 && column.width < row.width, `${column.width} x ${column.height}`);
  const tight = brushKana("あい", { spacing: 0 });
  const loose = brushKana("あい", { spacing: 0.5 });
  assert.ok(loose.width > tight.width + 40);
  assert.ok(brushKana("あ".repeat(100)).d.length < brushKana("あ".repeat(64)).d.length + 5, "at most 64 characters");
});

test("an outline from the bundle is stitched as thread on a judogi, with no font and no error", () => {
  const word = brushKana("じゅうどう");
  const svg = renderJudogi({ mode: "suit", view: "flat", embroidery: [{ place: "jacket-chest", path: word, thread: "red" }] });
  assert.equal(wellFormed(svg), null);
  assert.ok(svg.includes(word.d.slice(0, 20)));
});
