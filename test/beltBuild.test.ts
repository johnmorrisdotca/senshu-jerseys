import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { wellFormed } from "./helpers.ts";
import type { VolumeDesc } from "../src/volume.ts";

const strapOf = (svg: string): NonNullable<VolumeDesc["strap"]> => {
  const d = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc).find((v) => v.strap !== undefined)?.strap;
  assert.ok(d !== undefined);
  return d;
};
const rowsIn = (svg: string): number => (svg.match(/stroke-width="0\.32" stroke-opacity="0\.7"/g) ?? []).length;

test("a belt's thickness is its grade's: about 5 mm by default, thicker for the heavier cores, in the strap and so at every edge and fold", () => {
  const t = (beltThickness?: "standard" | "thick" | "extra-thick"): number => strapOf(judogiFrame({ mode: "belt", belt: "black", ...(beltThickness === undefined ? {} : { beltThickness }) })).t;
  assert.ok(Math.abs(t() / 2.63 - 0.5) < 0.02, "5 mm by default");
  assert.equal(t("standard"), t());
  assert.ok(t("thick") > t("standard") && t("extra-thick") > t("thick"));
  assert.ok(t("extra-thick") / 2.63 < 0.8, "still a belt, not a rope");
  // Worn on the jacket too.
  const worn = (beltThickness?: "thick"): number => strapOf(judogiFrame({ mode: "jacket", belt: "black", ...(beltThickness === undefined ? {} : { beltThickness }) })).t;
  assert.ok(worn("thick") > worn());
  assert.equal(strapOf(judogiFrame({ mode: "belt", belt: "black", beltThickness: "nope" as "thick" })).t, t());
});

test("a belt has the rows of stitching asked for, the counts belts are made with, and 10 by default", () => {
  const rows = (beltStitchLines?: 8 | 10 | 13 | 14 | 15 | 16): number => rowsIn(renderJudogi({ mode: "belt", belt: "black", view: "flat", ...(beltStitchLines === undefined ? {} : { beltStitchLines }) }));
  assert.equal(rows(), rows(10));
  assert.ok(rows(16) > rows(13) && rows(13) > rows(10) && rows(10) > rows(8));
  // A count belts are not made with is ignored.
  assert.equal(rows(11 as 10), rows());
});

test("a satin or silk cover has a sheen and cotton has none, and every combination draws well-formed", () => {
  const sheen = (beltCover?: "cotton" | "shusu" | "silk"): number => (judogiFrame({ mode: "belt", belt: "black", ...(beltCover === undefined ? {} : { beltCover }) }).match(/fill-opacity="0\.3"/g) ?? []).length;
  assert.equal(sheen("cotton"), sheen());
  assert.ok(sheen("silk") > sheen("cotton"));
  for (const beltCover of ["cotton", "shusu", "silk"] as const) {
    for (const beltThickness of ["standard", "thick", "extra-thick"] as const) {
      for (const mode of ["belt", "jacket"] as const) {
        assert.equal(wellFormed(judogiFrame({ mode, belt: "red-white", beltCover, beltThickness, beltStitchLines: 16, yaw: 30 })), null);
      }
      assert.equal(wellFormed(renderJudogi({ mode: "pieces", view: "flat", belt: "black", beltCover, beltThickness })), null);
    }
  }
});
