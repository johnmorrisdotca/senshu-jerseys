import assert from "node:assert/strict";
import { test } from "node:test";

import { renderJersey } from "../src/render.ts";
import { HOCKEY_STYLES, STYLE_COUNTRIES, personalStyle } from "../src/presets/hockey-styles.ts";
import { PRESETS } from "../src/presets-entry.ts";
import { presetOptions, usePresets } from "../src/registry.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { wellFormed } from "./helpers.ts";

const COLOUR_KEYS = ["body", "trim", "accent", "numberFill", "numberOutline"];
const layoutOf = (o: object): string => JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k]) => !COLOUR_KEYS.includes(k))));

test("twelve countries, each at home and away, with names in English and in Japanese", () => {
  assert.equal(STYLE_COUNTRIES.length, 12);
  assert.deepEqual(STYLE_COUNTRIES.map((c) => c.id), ["canada", "usa", "sweden", "finland", "czechia", "slovakia", "switzerland", "germany", "latvia", "norway", "japan", "france"]);
  assert.equal(HOCKEY_STYLES.length, 24);
  for (const c of STYLE_COUNTRIES) {
    assert.match(c.ja, /[぀-ヿ㐀-鿿]/, c.id);
    for (const way of ["home", "away"]) {
      const p = HOCKEY_STYLES.find((s) => s.id === `style:${c.id}-2026-${way}`);
      assert.ok(p, `${c.id} ${way}`);
      assert.equal(p.team, c.en);
      assert.equal(p.ja, c.ja);
      assert.equal(p.options.cut, "hockey");
    }
  }
  assert.ok(PRESETS.filter((p) => p.league === "style").length === 24, "they are in the page's presets");
});

test("each country has a layout of its own, and the away is the home with the colours swapped", () => {
  const layouts = STYLE_COUNTRIES.map((c) => layoutOf(HOCKEY_STYLES.find((s) => s.id === `style:${c.id}-2026-home`)?.options ?? {}));
  assert.equal(new Set(layouts).size, 12, "twelve different layouts");
  for (const c of STYLE_COUNTRIES) {
    const home = HOCKEY_STYLES.find((s) => s.id === `style:${c.id}-2026-home`)?.options ?? {};
    const away = HOCKEY_STYLES.find((s) => s.id === `style:${c.id}-2026-away`)?.options ?? {};
    assert.equal(layoutOf(home), layoutOf(away), c.id);
    assert.equal(home.body, away.trim, `${c.id}: the body is the other's trim`);
    assert.equal(home.trim, away.body, c.id);
    assert.notEqual(home.body, home.trim, c.id);
  }
  // What differs: at least a yoke, a band, a sash, raglan sleeves, chevrons and halves among them; collars of more than three kinds.
  const kinds = new Set(HOCKEY_STYLES.map((p) => [p.options.pattern, p.options.raglan === true ? "raglan" : "", p.options.chestBand !== undefined ? "band" : ""].join("/")));
  assert.ok(kinds.size >= 9, `${kinds.size} kinds of layout`);
  assert.ok(new Set(HOCKEY_STYLES.map((p) => p.options.collar)).size >= 4);
});

test("no style carries a mark: only colours, stripes and shapes, and nothing a caller has not set", () => {
  for (const p of HOCKEY_STYLES) {
    const o = p.options as Record<string, unknown>;
    for (const forbidden of ["crest", "frontText", "frontNumber", "name", "number", "patch", "title", "description", "chestBadges", "sleeveLeft", "sleeveRight"]) assert.equal(o[forbidden], undefined, `${p.id} has ${forbidden}`);
  }
});

test("the styles are frozen, and personalStyle makes new options each time: name, number, palette, outline, stripes, collar and patch, without touching the style", () => {
  const home = HOCKEY_STYLES.find((p) => p.id === "style:japan-2026-home");
  assert.ok(home && Object.isFrozen(home) && Object.isFrozen(home.options));
  assert.throws(() => {
    (home.options as { body: string }).body = "#000";
  });
  const before = JSON.stringify(home.options);
  const mine = personalStyle("style:japan-2026-home", { name: "Tanaka", number: 19, colors: ["#fff", "#1b2a6b", "#bc002d", "#bc002d", "#fff"], numberOutline: "#000", sleeveStripes: 2, hemStripes: [4, 1], collar: "v", patch: "C" });
  assert.ok(mine);
  assert.equal(mine.name, "Tanaka");
  assert.equal(mine.collar, "v");
  assert.equal(mine.patch, "C");
  assert.equal(mine.body, undefined, "colors take the place of the style's own");
  assert.equal(mine.pattern, "sash", "the layout stays");
  assert.notEqual(mine, personalStyle("style:japan-2026-home", { name: "Tanaka" }));
  assert.equal(JSON.stringify(home.options), before, "the style is as it was");
  mine.name = "Other";
  assert.equal(personalStyle("style:japan-2026-home")?.name, undefined);
  assert.equal(personalStyle("style:atlantis-2026-home"), undefined);
  assert.equal(personalStyle("nhl:montreal-1950s-home"), undefined);
  // The lookup the page and the element use gives the same, and spreading it is how a caller personalises.
  usePresets(HOCKEY_STYLES);
  assert.equal(presetOptions("style:japan-2026-home"), home.options);
  const svg = renderJersey({ ...presetOptions("style:japan-2026-home"), name: "Tanaka", number: 19, patch: "C" });
  assert.match(svg, /Hockey|hockey/);
  assert.equal(wellFormed(svg), null);
});

test("every style draws in every view, and turns on the garment through every angle, front, back, sides and between", () => {
  for (const p of HOCKEY_STYLES) {
    for (const view of ["front", "back", "both"] as const) {
      const svg = renderJersey({ ...p.options, view, name: "Tanaka", number: 19, sleeveNumbers: true });
      assert.equal(wellFormed(svg), null, `${p.id} ${view}`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${p.id} ${view}`);
    }
    for (const yaw of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const svg = jerseyFrame({ ...p.options, name: "Tanaka", number: 19, volume: true, yaw });
      assert.equal(wellFormed(svg), null, `${p.id} ${yaw}`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${p.id} ${yaw}`);
    }
  }
});
