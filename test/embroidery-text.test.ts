// Edge cases of the text on a judogi (embroidery, patches, labels) and of the lettering under it: nothing crashes, the SVG stays well-formed,
// what cannot be set is taken out and what is left is whole characters.
import assert from "node:assert/strict";
import { test } from "node:test";
import { clean, graphemes, settable } from "../src/colour.ts";
import { renderJudogi, type JudogiEmbroidery } from "../src/index.ts";
import { BELT_TOP } from "../src/judogiJacket.ts";
import { PATCH_LIMIT } from "../src/judogiPatch.ts";
import { layout, langAttr } from "../src/text.ts";
import { wellFormed } from "./helpers.ts";

// The flat layout draws each mark once (a worn suit draws it on each face).
const base = { mode: "suit" as const, view: "flat" as const, belt: "black" as const };
const norm = (svg: string): string => svg.replace(/jg[0-9a-z]+/g, "jg");
const plain = norm(renderJudogi(base));
const draw = (e: Partial<JudogiEmbroidery> & { text: string }): string => renderJudogi({ ...base, embroidery: [{ place: "jacket-hem", ...e }] });
/** The characters set as text in the drawing, once each (a character is drawn three times: shadow, thread, pattern). */
const setText = (svg: string): string[] => [...svg.matchAll(/ fill="url\(#[^"]+\)">([^<]*)<\/text>/g)].map((m) => m[1] as string);

const DIRECTIONS = ["along", "across", "down"] as const;
const FONTS = ["block", "gothic", "kaisho", "gyosho", "cursive"] as const;

test("no text, in any font or direction, throws or draws NaN, undefined or broken XML", () => {
  const texts = ["", " ", "A", "AB", "x".repeat(300), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", "O'BRIEN-SMITH, J.", "<b>&\"'", "12345", "柔道", "한국어", "Kim 金 김", "Zoë Ñandú", "JUDO 🥋", "👨‍👩‍👧", "שלום", "مرحبا", "𠮷野家", "A\u0000B\u0008C￾D‏E", "\ud800x"];
  for (const text of texts) {
    for (const direction of DIRECTIONS) {
      for (const font of FONTS) {
        const svg = draw({ text, direction, font });
        assert.equal(wellFormed(svg), null, `${JSON.stringify(text)} ${direction} ${font}`);
        assert.ok(!/NaN|undefined|Infinity/.test(svg), `${JSON.stringify(text)} ${direction} ${font}`);
        // eslint-disable-next-line no-control-regex
        assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(svg), `no control or lone surrogate in ${JSON.stringify(text)}`);
      }
    }
  }
});

test("empty, blank and wholly unsettable text draws nothing", () => {
  for (const text of ["", "   ", "\n\t", "🥋", "🇨🇦", "👨‍👩‍👧🥋", "שלום", "\u0000​"]) assert.equal(norm(draw({ text })), plain, JSON.stringify(text));
  assert.equal(clean("🥋", 10), undefined);
});

test("very short and very long names stay inside the place's limits", () => {
  const one = layout("I", 0, 0, { height: 20, maxWidth: 100 });
  assert.ok(Number.isFinite(one.width) && one.width >= 0);
  const long = layout("W".repeat(60), 0, 0, { height: 20, maxWidth: 100 });
  assert.ok(long.width <= 100.001, `width ${long.width}`);
  const longHangul = layout("한".repeat(60), 0, 0, { height: 20, maxWidth: 100, asText: true });
  assert.ok(longHangul.width <= 100.001);
  // The text is cut to 24 characters, never in the middle of one (an astral character or an accented letter counts once).
  const cut = draw({ text: "𠮷".repeat(40), font: "gothic" });
  assert.equal(setText(cut).length, 24);
  const accents = draw({ text: "é".normalize("NFD").repeat(40), font: "gothic" });
  assert.equal(setText(accents).length, 24);
});

test("mixed scripts: Latin, kanji and Hangul keep their order, one character each", () => {
  const svg = draw({ text: "Kim 金 김", font: "gothic" });
  assert.deepEqual(setText(svg), ["K", "i", "m", "金", "김"]);
  // Block lettering falls back to system text for the whole line when one character has no stroke glyph.
  assert.deepEqual(setText(draw({ text: "Kim 金", font: "block" })), ["K", "i", "m", "金"]);
});

test("accents and diacritics: composed or not, one character; block lettering draws the plain letter", () => {
  const composed = draw({ text: "Zoë", font: "gothic" });
  const parts = draw({ text: "Zoë", font: "gothic" });
  assert.equal(composed, parts);
  assert.deepEqual(setText(composed), ["Z", "o", "ë"]);
  const block = draw({ text: "Zoë", font: "block" });
  assert.ok(!setText(block).length, "all three letters are strokes");
  assert.equal(draw({ text: "Zoë", font: "block" }), block);
});

test("punctuation, digits and spaces", () => {
  assert.deepEqual(setText(draw({ text: "J.  O'B-2", font: "gothic" })), ["J", ".", "O", "&#39;", "B", "-", "2"]);
  assert.notEqual(norm(draw({ text: "12345" })), plain);
  assert.equal(norm(draw({ text: "A  B" })), norm(draw({ text: "A B" })));
});

test("a column (direction down) stands one character under the next, in any script", () => {
  for (const text of ["柔道", "한국", "Ab 金"]) {
    const svg = draw({ text, direction: "down", font: "gothic" });
    const ys = [...svg.matchAll(/translate\(([-\d.]+) ([-\d.]+)\) rotate\(0\)[^>]*>([^<]*)<\/text>/g)].filter((m) => m[3] !== "").map((m) => [Number(m[2]), m[3]] as const);
    const chars = graphemes(text).filter((c) => c !== " ");
    const unique = [...new Map(ys.map(([y, c]) => [c, y])).entries()];
    assert.equal(unique.length, chars.length, text);
    const sorted = unique.map(([, y]) => y);
    assert.deepEqual([...sorted].sort((a, b) => a - b), sorted, "each below the one before");
  }
});

test("emoji, flags and right-to-left scripts are taken out, the rest stays", () => {
  assert.deepEqual(setText(draw({ text: "JUDO 🥋 שלום 🇨🇦!", font: "gothic" })), ["J", "U", "D", "O", "!"]);
  assert.equal(settable("©2026 ™"), "©2026 ™");
  assert.equal(settable("a‍b﻿c"), "abc");
  assert.equal(settable("\ud800"), "");
});

test("Hangul: composed, in a Korean font stack, tagged as Korean", () => {
  const nfd = "한국어".normalize("NFD");
  assert.equal(draw({ text: nfd, font: "gothic" }), draw({ text: "한국어", font: "gothic" }));
  const svg = draw({ text: "한국어", font: "gothic" });
  assert.deepEqual(setText(svg), ["한", "국", "어"]);
  assert.match(svg, /Apple SD Gothic Neo/);
  assert.match(svg, /Malgun Gothic/);
  assert.match(svg, /lang="ko" xml:lang="ko"/);
  // Han characters beside Hangul are set as Korean, beside kana as Japanese, and Latin has no language.
  assert.match(draw({ text: "金 김", font: "gothic" }), /lang="ko"/);
  assert.match(draw({ text: "金 かな", font: "gothic" }), /lang="ja"/);
  assert.doesNotMatch(draw({ text: "TANAKA", font: "gothic" }), /lang=/);
  assert.equal(langAttr("柔道"), "");
  // A column keeps the language of the whole text, not of the one character.
  assert.match(draw({ text: "金 김", direction: "down", font: "gothic" }), /lang="ko"/);
  // Korean is as wide as Japanese in the line: a syllable is one square.
  const hangul = layout("한국어", 0, 0, { height: 20, asText: true });
  const kanji = layout("柔道家", 0, 0, { height: 20, asText: true });
  assert.equal(hangul.width, kanji.width);
  // The script fonts fall back to Korean serifs too.
  assert.match(draw({ text: "한", font: "kaisho" }), /Nanum Myeongjo/);
});

test("a back patch, a label and the brand take the same text rules", () => {
  const patch = renderJudogi({ mode: "jacket", view: "back", backPatch: { style: "ijf", name: "Zoë 🥋 KIM", code: "KOR", line: "서울 도장" } });
  assert.equal(wellFormed(patch), null);
  assert.ok(!patch.includes("🥋"));
  const zekken = renderJudogi({ mode: "jacket", view: "back", backPatch: { style: "zekken", name: "김", line: "\u0000서울" } });
  assert.equal(wellFormed(zekken), null);
  const brand = renderJudogi({ ...base, branding: { name: "Kim 🥋", line: "서울" } as never });
  assert.equal(wellFormed(brand), null);
});

test("a patch's lettering fits its box: shrunk to half its height, then cut with an ellipsis", () => {
  const box = (svg: string): { x: number; y: number; w: number; h: number } => {
    const m = /<clipPath id="[^"]*pt[^"]*C"><rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/.exec(svg);
    assert.ok(m, "the patch's cloth box");
    return { x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]) };
  };
  const names = ["山田", "山田太郎一郎山田太郎一郎山田太郎一郎", "한국어 김민준 한국어 김민준", "A", "M. TANAKA-SMITH-JONES-WILLIAMS", "W".repeat(24), "é".normalize("NFD").repeat(24)];
  for (const style of ["zekken", "ijf"] as const) {
    for (const view of ["front", "back", "flat", "flat-back"] as const) {
      for (const size of ["1", "170", "190"] as const) {
        for (const name of names) {
          const svg = renderJudogi({ mode: "jacket", view, size, belt: "black", backPatch: { style, name, code: "JPN", line: name } });
          assert.equal(wellFormed(svg), null, `${style} ${view} ${size} ${name}`);
          assert.ok(!/NaN/.test(svg));
        }
      }
    }
  }
  // Every glyph of the back view's patch stays inside the cloth: the flat back is a plain 1:1 drawing, so the characters' centres can be read.
  for (const style of ["zekken", "ijf"] as const) {
    for (const name of names) {
      const svg = renderJudogi({ mode: "jacket", view: "flat-back", belt: "black", backPatch: { style, name, line: name } });
      const b = box(svg);
      for (const m of svg.matchAll(/translate\(([-\d.]+) ([-\d.]+)\) rotate\(0\)" font-size="([-\d.]+)"/g)) {
        const [x, y, size] = [Number(m[1]), Number(m[2]), Number(m[3])];
        if (x < b.x - 1 || x > b.x + b.w + 1 || y < b.y - 1 || y > b.y + b.h + size) continue; // another mark of the jacket
        assert.ok(x - size / 2 >= b.x + 2 && x + size / 2 <= b.x + b.w - 2, `${style} ${name}: a character leaves the cloth sideways`);
        assert.ok(y - size * 0.9 >= b.y + 1 && y + size * 0.15 <= b.y + b.h - 1, `${style} ${name}: a character leaves the cloth vertically`);
      }
    }
  }
  const cut = renderJudogi({ mode: "jacket", view: "flat-back", backPatch: { style: "zekken", name: "山田太郎一郎山田太郎一郎山田太郎一郎" } });
  assert.match(cut, />…<\/text>/);
});

test("a back patch never reaches the belt, at any size, view, belt or measure", () => {
  for (const style of ["zekken", "ijf"] as const) {
    for (const belt of ["none", "white", "black", "red-white"] as const) {
      for (const beltWidthCm of [3, 4.5, 6]) {
        for (const asked of [{}, { heightCm: 40, topCm: 20 }, { heightCm: 30, topCm: 10, widthCm: 35 }, { heightCm: 8, topCm: 0 }]) {
          const svg = renderJudogi({ mode: "jacket", view: "back", belt, beltWidthCm, backPatch: { style, ...asked } });
          const m = /<clipPath id="[^"]*pt[^"]*C"><rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/.exec(svg);
          assert.ok(m);
          const bottom = Number(m[2]) + Number(m[4]);
          assert.ok(bottom <= BELT_TOP - 3, `${style} ${belt} ${beltWidthCm} ${JSON.stringify(asked)}: bottom ${bottom} against the belt's top ${BELT_TOP}`);
        }
      }
    }
  }
  assert.ok(PATCH_LIMIT <= BELT_TOP - 3);
});
