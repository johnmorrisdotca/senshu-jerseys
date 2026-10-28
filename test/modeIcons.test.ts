import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { JUDOGI_MODES } from "../src/judogi.ts";

test("the designer's Display tiles each have a picture made from the package's own drawing, and none is missing", () => {
  const source = readFileSync(new URL("../demo/judogiIcons.js", import.meta.url), "utf8");
  for (const mode of JUDOGI_MODES) {
    const found = new RegExp(`\\b${mode}: "data:image/webp;base64,([A-Za-z0-9+/=]+)"`).exec(source);
    assert.ok(found !== null, `${mode} has no picture: run pnpm mode-icons`);
    const bytes = Buffer.from(found[1] as string, "base64");
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    assert.ok(bytes.length > 1000 && bytes.length < 20000, `${mode}: ${bytes.length} bytes`);
  }
  assert.match(source, /MODE_ICON_SIZE = \[64, 56\]/);
});
