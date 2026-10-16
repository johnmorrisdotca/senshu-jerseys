// The five things John's photos of the Canadiens, Rangers, Kraken, Flames and Stars asked for, held on the presets that carry them: contrasting cuffs and a yoke, diagonal chest text either way, stripe sets in three colours,
// a wide band at the elbow, and a patch at the shoulder (the caller's, since a preset never draws a mark).
import assert from "node:assert/strict";
import { test } from "node:test";

import { renderJersey } from "../src/render.ts";
import { NHL } from "../src/presets/nhl.ts";
import { wellFormed } from "./helpers.ts";

const by = (id: string) => {
  const p = NHL.find((x) => x.id === id);
  assert.ok(p, id);
  return p.options;
};

test("the Canadiens' white shirt has red cuffs over the stripes and a red yoke", () => {
  const o = by("nhl:montreal-1967-white");
  assert.deepEqual(o.cuffs, [18, 1]);
  assert.equal(o.yoke, "curved");
  const withCuffs = renderJersey({ ...o });
  assert.notEqual(withCuffs, renderJersey({ ...o, cuffs: undefined }), "the cuffs are drawn");
  assert.match(withCuffs, /stroke-opacity="\.5"/, "with the knit's seam where they start");
});

test("diagonal chest text runs either way, in the caller's letters, on a preset that has none of its own", () => {
  const o = by("nhl:rangers-1997-blue");
  assert.equal(o.frontText, undefined);
  const up = renderJersey({ ...o, frontText: "RANGERS", frontTextAngle: "diagonal-up" });
  const down = renderJersey({ ...o, frontText: "RANGERS", frontTextAngle: "diagonal-down" });
  const flat = renderJersey({ ...o, frontText: "RANGERS" });
  assert.equal(new Set([up, down, flat]).size, 3);
  assert.equal(wellFormed(up), null);
  assert.equal(wellFormed(down), null);
});

test("the Flames' stripe sets are in three colours, and the Kraken's elbow band is wide", () => {
  const flames = by("nhl:flames-2020-home");
  const sets = flames.sleeveStripes as readonly number[];
  assert.deepEqual([...new Set(sets.filter((_, i) => i % 2 === 1))].sort(), [0, 1, 2], "body, trim and second trim in one set");
  assert.deepEqual(flames.hemStripes, [4, 0, 4, 1, 3, 0, 8, 2, 3, 0, 4, 1]);
  const kraken = by("nhl:kraken-2021-home").sleeveStripes as readonly number[];
  assert.ok(Math.max(...kraken.filter((_, i) => i % 2 === 0)) >= 14, "a band of 14 or more units at the elbow");
});

test("a patch at the shoulder is the caller's, on either sleeve, and a preset never carries one", () => {
  const stars = by("nhl:stars-2013-away");
  assert.equal((stars as Record<string, unknown>).sleeveLeft, undefined);
  const patch = { patch: "shield" as const, patchText: "S", patchAt: 12, patchAround: -90 };
  const svg = renderJersey({ ...stars, number: 19, sleeveNumbers: true, sleeveLeft: patch, sleeveRight: patch });
  assert.equal((svg.match(/rotate\(/g) ?? []).length, 4, "two numbers and two patches");
  assert.equal(wellFormed(svg), null);
});
