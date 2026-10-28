import assert from "node:assert/strict";
import { test } from "node:test";
import { jacketDesc } from "../src/judogiJacket.ts";
import { pantsFace, pantsDesc } from "../src/judogiPants.ts";
import { pieceCells, shadeOf } from "../src/pieceVolume.ts";
import { placeCell } from "../src/volume.ts";
import { jacketFace } from "../src/judogiJacket.ts";
import { toneOf } from "../src/judogiCloth.ts";

// The open end of a sleeve or a trouser leg is an open tube: a rim as thick as the hem, the inside of the cloth going in and, darker than the outside, and a lining at the bottom of it.
for (const [name, desc] of [["a sleeve", jacketDesc(1)], ["a trouser leg", pantsDesc(1)]] as const) {
  test(`${name} ends in an open tube: a rim, an inside in shade, a bottom, and each is seen only from where it can be`, () => {
    const cells = pieceCells(desc);
    const inside = cells.filter((c) => c.inside === true);
    assert.ok(inside.length > 0, "the inside of the end is drawn");
    const seen = (yaw: number, tilt: number): { inside: number; rim: number } => {
      let i = 0;
      let r = 0;
      for (const c of cells) {
        const q = placeCell(c, yaw, desc.pitch + tilt);
        if (!q.visible) continue;
        if (c.inside === true) i++;
        else if (c.g > 0 && c.n[2] === 0) r++;
      }
      return { inside: i, rim: r };
    };
    // Along the sleeve's or leg's own axis from below (the tilt is the other way for a jacket's hanging sleeves: both are hung straight down).
    const below = seen(20, -30);
    assert.ok(below.rim > 0 && below.inside > 0, `from below ${JSON.stringify(below)}`);
    // The inside is in shade: the same normal, darker.
    assert.ok(shadeOf([0, 0, 1], 20, 0, true) > shadeOf([0, 0, 1], 20, 0, false) + 0.1);
  });
}

test("the cloth under every sleeve, leg and body runs past its outline, so a cell that samples up to the edge finds no see-through texel", () => {
  const ink = { uid: "u", cloth: [248, 247, 243] as [number, number, number] };
  for (const face of ["front", "back"] as const) {
    const jacket = jacketFace(ink, face).body;
    const pants = pantsFace(ink, face).body;
    const fill = toneOf(ink.cloth).fill;
    const bleeds = (body: string): number => (body.match(new RegExp(`fill="${fill}" stroke="${fill}" stroke-width="3"`, "g")) ?? []).length;
    assert.ok(bleeds(jacket) >= 3, `jacket ${face}: body and two sleeves bleed`);
    assert.ok(bleeds(pants) >= 3, `pants ${face}: hip block and two legs bleed`);
  }
});
