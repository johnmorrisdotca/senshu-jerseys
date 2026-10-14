// The family's background module, copied byte for byte into scripts/ for the README pictures and the demo's background menu (tooling only: the package ships none of it and still has no dependency). The file is held to its
// version and its sha256, so a copy that drifted from the one in taisen-brackets is found, and every preset is drawn the same way every time with ink that reads over it.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BACKGROUND_PRESETS, FAMILY_BACKGROUNDS_VERSION, backgroundSvg, contrastRatio, parseColor } from "../scripts/family-backgrounds.ts";

/** The sha256 of scripts/family-backgrounds.ts at FAMILY_BACKGROUNDS_VERSION: the same as in taisen-brackets' test/family-backgrounds.test.ts. */
const SHA256 = "23e1ce89ed072365813df6255414aa51b056fb582f4b253d041e78c4d16b57d0";
const VERSION = "1.0.0";
const rgb = (text: string) => parseColor(text)!;

test("family-backgrounds.ts is the file the family shares: its version and its sha256 are pinned", () => {
  assert.equal(FAMILY_BACKGROUNDS_VERSION, VERSION);
  const text = readFileSync(new URL("../scripts/family-backgrounds.ts", import.meta.url));
  assert.equal(createHash("sha256").update(text).digest("hex"), SHA256, "the file changed: it is never edited here; copy the new one from taisen-brackets and update VERSION and SHA256");
  assert.ok(!/^import\s.*from\s/m.test(text.toString("utf8")), "the module imports nothing");
});

test("the twenty-five presets are all there, and each draws a dark and a light picture with ink that reads over it", () => {
  assert.equal(BACKGROUND_PRESETS.length, 25);
  for (const name of BACKGROUND_PRESETS) {
    for (const theme of ["dark", "light"] as const) {
      const made = backgroundSvg(name, { width: 1400, height: 700, theme });
      assert.deepEqual(backgroundSvg(name, { width: 1400, height: 700, theme }), made, "the same options give the same markup");
      for (const ground of made.ink.dominant) assert.ok(contrastRatio(rgb(made.ink.text), rgb(ground)) >= 4.5, `${name} ${theme}: text on ${ground}`);
    }
  }
});

test("the demo's background menu lists the twenty-five presets, in the family's order", () => {
  const html = readFileSync(new URL("../demo/index.html", import.meta.url), "utf8");
  const select = /<select[^>]*id="background"[^>]*>(.*?)<\/select>/s.exec(html)?.[1] ?? "";
  assert.deepEqual([...select.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]), ["", ...BACKGROUND_PRESETS]);
});
