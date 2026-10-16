// The bundle-size test: esbuild bundles one named entry, and the result stays small. The pure entry takes no turn, no element and no preset; one league's presets take that league's rows and the renderer.
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { test } from "node:test";

import { build } from "esbuild";

const root = new URL("..", import.meta.url).pathname;

async function bundle(contents: string): Promise<{ text: string; bytes: number; gzip: number }> {
  const result = await build({ stdin: { contents, resolveDir: root, loader: "ts" }, bundle: true, minify: true, format: "esm", write: false, treeShaking: true, logLevel: "silent" });
  const text = result.outputFiles[0]?.text ?? "";
  return { text, bytes: Buffer.byteLength(text), gzip: gzipSync(text).length };
}

// Measured 2026-10-14 (esbuild 0.25, minified, gzipped). A limit has room for an edit and not for a regression.
// The jersey is the drawing of a shirt in seven cuts with its own letters, so it weighs about 17 kB (with the kit, which takes the cap and the helmet); a league of presets is about 5 kB for 180 teams.
const LIMITS = { jersey: 22 * 1024, cap: 5.5 * 1024, helmet: 6.3 * 1024, banner: 18 * 1024, turn: 22 * 1024, element: 30 * 1024, league: 7.5 * 1024, nhl: 7 * 1024, nhlAll: 12.5 * 1024 };

test("the jersey alone, bundled by itself, stays small and leaves the turn, the element and the presets out", async () => {
  const b = await bundle(`import { renderJersey } from "./src/index.ts"; console.log(renderJersey({ number: 9 }));`);
  assert.ok(b.gzip < LIMITS.jersey, `${b.gzip} bytes gzipped`);
  assert.ok(!b.text.includes("bindTurn") && !b.text.includes("customElements") && !b.text.includes("Montreal"), "something came along");
});

test("a cap, a helmet and a banner, each bundled by itself, stay small", async () => {
  const cap = await bundle(`import { renderCap } from "./src/index.ts"; console.log(renderCap({ initials: "HC" }));`);
  const helmet = await bundle(`import { renderHelmet } from "./src/index.ts"; console.log(renderHelmet({ kind: "hockey" }));`);
  const banner = await bundle(`import { renderBanner } from "./src/index.ts"; console.log(renderBanner({ number: 9 }));`);
  assert.ok(cap.gzip < LIMITS.cap, `cap ${cap.gzip}`);
  assert.ok(helmet.gzip < LIMITS.helmet, `helmet ${helmet.gzip}`);
  assert.ok(banner.gzip < LIMITS.banner, `banner ${banner.gzip}`);
  assert.ok(!cap.text.includes("lace-up") && !helmet.text.includes("lace-up"), "a jersey came along with a cap or a helmet");
});

test("the turn and the element, each bundled by itself, stay small", async () => {
  const turn = await bundle(`import { bindTurn } from "./src/turn-entry.ts"; console.log(bindTurn);`);
  const element = await bundle(`import { defineSenshuJersey } from "./src/element.ts"; defineSenshuJersey();`);
  assert.ok(turn.gzip < LIMITS.turn, `turn ${turn.gzip}`);
  assert.ok(element.gzip < LIMITS.element, `element ${element.gzip}`);
});

test("one league's presets are small: the data is a few bytes a preset, and a page takes only its league", async () => {
  const sizes: Record<string, number> = {};
  for (const [name, constant] of [["mlb", "MLB"], ["nba", "NBA"], ["nfl", "NFL"], ["soccer", "SOCCER"], ["nhl", "NHL"], ["nhl-classic", "NHL_CLASSIC"]] as const) {
    let b;
    try {
      b = await bundle(`import { ${constant} } from "./src/presets/${name}.ts"; console.log(${constant}.length);`);
    } catch {
      continue;
    }
    sizes[name] = b.gzip;
    const limit = name.startsWith("nhl") ? LIMITS.nhl : LIMITS.league;
    assert.ok(b.gzip < limit, `${name}: ${b.gzip} bytes gzipped`);
  }
  assert.ok(Object.keys(sizes).length >= 4);
  // The whole NHL, both modules and what they share, a few dozen bytes a preset (about 30 bytes gzipped for each of more than four hundred).
  const nhl = await bundle(`import { NHL } from "./src/presets/nhl.ts"; import { NHL_CLASSIC } from "./src/presets/nhl-classic.ts"; console.log(NHL.length + NHL_CLASSIC.length);`);
  assert.ok(nhl.gzip < LIMITS.nhlAll, `the whole NHL: ${nhl.gzip} bytes gzipped`);
  // Importing one league leaves the others' rows out.
  const mlb = await bundle(`import { MLB } from "./src/presets/mlb.ts"; console.log(MLB.length);`);
  assert.ok(!mlb.text.includes("Los Angeles Lakers"), "another league came along");
});
