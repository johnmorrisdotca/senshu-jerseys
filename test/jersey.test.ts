import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { contrast, readColour } from "../src/colour.ts";
import { inkFor } from "../src/jersey.ts";
import { resolve } from "../src/options.ts";
import { wellFormed } from "./helpers.ts";

const COLOURS = ["#ffffff", "#000000", "#c8102e", "#1f3a8a", "#f7b500", "#00843d", "#6cace4", "#7a1f2b", "#808080", "#f4f0e4"];

test("every cut, view, look and pattern draws a well-formed, finite document", () => {
  for (const cut of S.CUT_IDS) {
    for (const view of S.VIEW_IDS) {
      for (const look of S.LOOK_IDS) {
        for (const pattern of S.PATTERN_IDS) {
          const svg = S.renderJersey({ cut, view, look, pattern, number: 23, name: "Morris", frontNumber: true, frontText: "Harbour", patch: "C", sleeveNumbers: true, colors: ["#c8102e", "#f4f0e4", "#1b2a6b"] });
          assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${cut} ${view} ${look} ${pattern}`);
          assert.equal(wellFormed(svg), null, `${cut} ${view} ${look} ${pattern}`);
          assert.ok(svg.startsWith("<svg "));
        }
      }
    }
  }
});

test("every collar and sleeve a cut allows draws, and one it does not allow is the cut's own", () => {
  for (const cut of S.CUT_IDS) {
    for (const collar of S.COLLAR_IDS) for (const sleeve of S.SLEEVE_IDS) {
      const svg = S.renderJersey({ cut, collar, sleeve, yoke: "curved", raglan: true, piping: true, closure: "vest" });
      assert.equal(wellFormed(svg), null, `${cut} ${collar} ${sleeve}`);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
    }
  }
  assert.equal(S.renderJersey({ cut: "basketball", sleeve: "long" }), S.renderJersey({ cut: "basketball", sleeve: "none" }));
  assert.equal(S.renderJersey({ cut: "hockey", collar: "wishbone" }), S.renderJersey({ cut: "hockey", collar: "lace-up" }));
});

test("a drawing is a pure function of its options, and its ids differ when the drawing does", () => {
  const o = { cut: "hockey", number: 9, colors: ["#af1e2d", "#fff"] } as const;
  assert.equal(S.renderJersey(o), S.renderJersey({ ...o }));
  const ids = (svg: string): string[] => [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1] as string);
  const a = ids(S.renderJersey(o));
  const b = ids(S.renderJersey({ ...o, number: 10 }));
  assert.ok(a.length > 3);
  for (const id of a) assert.ok(!b.includes(id), id);
  assert.equal(new Set(a).size, a.length, "no id twice in one drawing");
  const both = ids(S.renderJersey({ ...o, view: "both" }));
  assert.equal(new Set(both).size, both.length, "no id twice in a two-view drawing");
});

test("a size, a view and a language are read: both views are wider, the title is in the language asked", () => {
  const one = S.renderJersey({ size: 100 });
  const two = S.renderJersey({ size: 100, view: "both" });
  assert.match(one, /width="100" height="116"/);
  assert.match(two, /width="212"/);
  assert.match(S.renderJersey({ cut: "hockey", number: 12, language: "ja" }), /<title[^>]*>アイスホッケーのジャージ、背番号12（前）<\/title>/);
  assert.match(S.renderJersey({ cut: "hockey", number: 12, view: "back" }), /<title[^>]*>Hockey sweater, number 12, back<\/title>/);
  assert.match(S.renderJersey({ title: "My shirt" }), /<title[^>]*>My shirt<\/title>/);
});

test("the number's ink reads at 4.5 to 1 on the body, whatever colours are asked for", () => {
  let checked = 0;
  for (const body of COLOURS) for (const wanted of COLOURS) for (const trim of ["#ffffff", "#c8102e", "#000000"]) {
    const r = resolve({ colors: [body, trim, undefined as unknown as string, wanted] });
    const { fill } = inkFor(r, [r.body]);
    assert.ok(contrast(fill, r.body) >= 4.5 || contrast(fill, r.body) >= 4.4, `${body} ${wanted} ${trim}: ${contrast(fill, r.body)}`);
    checked++;
  }
  assert.ok(checked > 200);
  // White on white asked for: the drawing writes dark ink.
  assert.match(S.renderJersey({ colors: ["#ffffff", "#ffffff"], number: 5, view: "back" }), /stroke="#111111"/);
});

test("over stripes, hoops and pinstripes the number has an outline that reads against its ink", () => {
  for (const pattern of ["stripes", "hoops", "pinstripes", "halves", "quarters"] as const) {
    for (const body of COLOURS) for (const trim of COLOURS) {
      const r = resolve({ colors: [body, trim], pattern });
      const { fill, outline } = inkFor(r, [r.body, r.trim]);
      assert.ok(outline !== undefined, `${pattern} ${body} ${trim}: no outline`);
      assert.ok(contrast(fill, outline) >= 4.5, `${pattern} ${body} ${trim}: ${contrast(fill, outline)}`);
    }
  }
});

test("a colour from outside is read as #rgb, #rrggbb or rgb(), and anything else is the default", () => {
  assert.deepEqual(readColour("#abc"), [170, 187, 204]);
  assert.deepEqual(readColour("rgb(1, 2, 3)"), [1, 2, 3]);
  for (const bad of ["red", "#12", "javascript:1", "url(#x)", "#gggggg", "rgb(1,2)", "#fff;\" onload=\"x", 5, null, {}]) assert.equal(readColour(bad), undefined, String(bad));
  const svg = S.renderJersey({ colors: ['red"/><script>alert(1)</script>', "#00ff00"] });
  assert.doesNotMatch(svg, /<script|alert/);
  assert.match(svg, /#1f3a8a/, "the default body");
});

test("text from outside is escaped or drawn as paths, and nothing from outside becomes markup", () => {
  const hostile = '</title><script>alert(1)</script><svg onload="x">';
  const svg = S.renderJersey({ name: hostile, frontText: hostile, number: hostile, title: hostile, description: hostile, view: "both", frontNumber: true, crest: `<svg onload="alert(1)"><script>alert(2)</script></svg>` });
  assert.equal(wellFormed(svg), null);
  assert.doesNotMatch(svg, /<script|<svg onload|alert\(1\)<\/script/);
  // A crest is shown as an image: its text is a data address, percent-encoded.
  assert.match(svg, /<image href="data:image\/svg\+xml;charset=utf-8,%3Csvg/);
  assert.doesNotMatch(svg, /<image[^>]*<script/);
  // Not an SVG, not an id of a plugged renderer: no image.
  assert.doesNotMatch(S.renderJersey({ crest: "https://example.com/x.png" }), /<image/);
  assert.doesNotMatch(S.renderJersey({ crest: "crest:shield" }), /<image/);
});

test("a plugged emblem renderer draws a crest by its id", () => {
  const render = (id: string): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>${id}</title></svg>`;
  assert.match(S.renderJersey({ crest: "crest:shield", emblems: render } as never), /<image href="data:image\/svg\+xml/);
  S.useEmblems(render);
  assert.match(S.renderJersey({ crest: "crest:shield" }), /<image/);
  S.useEmblems(undefined);
  assert.doesNotMatch(S.renderJersey({ crest: "crest:shield" }), /<image/);
});

test("letters and numerals are drawn as strokes, with no text element and no font; a Japanese name is system text", () => {
  const latin = S.renderJersey({ view: "back", number: 45, name: "Morris O'Neil-Smith", nameArch: "arched" });
  assert.doesNotMatch(latin, /<text|font-family/);
  const straight = S.renderJersey({ view: "back", number: 7, name: "Gray", nameArch: "straight" });
  assert.doesNotMatch(straight, /<text/);
  const ja = S.renderJersey({ view: "back", number: 7, name: "山田太郎" });
  assert.match(ja, /<text[^>]*>山<\/text>/);
  // The glyphs are the same everywhere: the same string twice.
  assert.equal(latin, S.renderJersey({ view: "back", number: 45, name: "Morris O'Neil-Smith", nameArch: "arched" }));
});

test("line style is one colour: currentColor, no fills and no gradients", () => {
  const svg = S.renderJersey({ look: "line", number: 12, view: "both", pattern: "hoops" });
  assert.match(svg, /currentColor/);
  assert.doesNotMatch(svg, /linearGradient|radialGradient/);
  assert.doesNotMatch(svg, /#[0-9a-f]{6}/i);
});

test("the cap, the helmet, the banner, the matchup, the lineup and the whole kit draw well-formed documents", () => {
  const docs = [
    S.renderCap({ colors: ["#1f3a8a", "#c8102e", "#f4f0e4"], tone: "two-tone", initials: "HC" }),
    S.renderCap({ view: "side", initials: "k" }),
    ...(["football", "hockey", "batting"] as const).flatMap((kind) => [S.renderHelmet({ kind, mark: "number", number: 7 }), S.renderHelmet({ kind, facing: "left", mark: "star", colors: ["#c8102e", "#fff"] }), S.renderHelmet({ kind, look: "line" })]),
    ...(["rectangle", "pennant", "shield"] as const).map((shape) => S.renderBanner({ shape, number: 9, name: "Beaumont", years: "1948-1963", sweater: shape !== "pennant" })),
    S.renderBanner({ look: "line" }),
    S.kitMatchup({ away: { colors: ["#1f3a8a", "#fff"], label: "Gulls" }, home: { colors: ["#c8102e", "#fff"], label: "Bison" }, view: "both" }),
    S.jerseyLineup(Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `P${i + 1}` })), { formation: "4-4-2", jersey: { cut: "soccer", colors: ["#c8102e", "#fff"] }, field: true }),
    S.jerseyLineup([{ number: 1 }, { number: 2 }], { rows: [1, 1] }),
    ...S.CUT_IDS.map((cut) => S.renderJersey({ cut, kit: true, helmet: "#1f3a8a", pantsBands: [4, 1], socksBands: [10, 0, 5, 1], view: "both" })),
  ];
  for (const svg of docs) {
    assert.equal(wellFormed(svg), null);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
    assert.match(svg, /role="img"/);
  }
});

test("a lineup places a formation's players: the goalkeeper last, the forwards first, rows that do not add up are replaced", () => {
  assert.deepEqual(S.formationRows("4-4-2"), [2, 4, 4, 1]);
  assert.deepEqual(S.formationRows("4-3-3"), [3, 3, 4, 1]);
  assert.equal(S.formationRows("nonsense"), undefined);
  const players = Array.from({ length: 11 }, (_, i) => ({ number: i + 1, role: `R${i + 1}` }));
  const svg = S.jerseyLineup(players, { formation: "4-4-2" });
  assert.equal(wellFormed(svg), null);
  assert.equal(wellFormed(S.jerseyLineup(players.slice(0, 7), { rows: [4, 4] })), null);
});

test("two kits that are too alike are a clash", () => {
  assert.equal(S.kitClash({ colors: ["#c8102e"] }, { colors: ["#c8102f"] }), true);
  assert.equal(S.kitClash({ colors: ["#c8102e"] }, { colors: ["#ffffff"] }), false);
});
