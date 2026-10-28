// The judogi designer's words (demo/words.js): every place, colour and choice the package lists has a name in both languages, so no
// control ever shows the key it is looked up by (the shoulder logo places once did).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BRAND_KANJI, EMBROIDERY_FONTS, EMBROIDERY_PLACES, JUDOGI_MODES, JUDOGI_VIEWS, LOGO_PLACES, MARK_RULES, PATCH_STYLES,
} from "../src/index.ts";
// @ts-expect-error the demo's words are plain JavaScript
import { WORDS } from "../demo/words.js";

const words = WORDS as Record<"en" | "ja", Record<string, string>>;

test("every place, style, mode and font has a name in English and in Japanese", () => {
  const keys = [
    ...LOGO_PLACES.map((p) => `judoLogo_${p}`),
    ...EMBROIDERY_PLACES.map((p) => `judoPlace_${p}`),
    ...EMBROIDERY_FONTS.map((f) => `judoFont_${f}`),
    ...JUDOGI_MODES.map((m) => `judoMode_${m}`),
    ...JUDOGI_VIEWS.map((v) => `judoView_${v}`),
    ...PATCH_STYLES.map((s) => `judoPatch_${s}`),
    ...MARK_RULES.map((r) => `judoRules_${r}`),
    ...BRAND_KANJI.map((k) => `judoKanji_${k}`),
    "judoLogoNote", "judoG_garment", "judoG_marks", "judoG_brand", "judoTilt", "judoZoom", "judoZoomIn", "judoZoomOut", "judoZoomReset", "judoViewLabel",
  ];
  for (const lang of ["en", "ja"] as const) {
    for (const key of keys) {
      const word = words[lang][key];
      assert.ok(typeof word === "string" && word.length > 0, `${lang} ${key}`);
      assert.ok(!/^judo/.test(word), `${lang} ${key} reads as a key: ${word}`);
    }
  }
});

test("the two languages name the same things", () => {
  const judo = (lang: "en" | "ja"): string[] => Object.keys(words[lang]).filter((k) => k.startsWith("judo")).sort();
  assert.deepEqual(judo("ja"), judo("en"));
});
