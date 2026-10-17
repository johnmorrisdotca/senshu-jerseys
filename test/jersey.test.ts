import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { contrast, readColour } from "../src/colour.ts";
import { inkFor } from "../src/jersey.ts";
import { layout } from "../src/text.ts";
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
  const one = S.renderJersey({ cut: "hockey", size: 100 });
  const two = S.renderJersey({ cut: "hockey", size: 100, view: "both" });
  assert.match(one, /width="100" height="116"/);
  assert.match(two, /width="212"/);
  // The default cut (soccer) has sleeves that reach past the body, so its box is a little wider: the shirt is the same scale and the height is the same (test/jerseybox.test.ts).
  assert.match(S.renderJersey({ size: 100 }), /width="108\.4" height="116"/);
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
    ...(["rectangle", "pennant", "shield"] as const).map((shape) => S.renderBanner({ shape, number: 9, name: "Beaumont", years: "1948-1963", sweater: true })),
    S.renderBanner({ look: "line" }),
    S.renderBanner({ kind: "hanging", number: 99, name: "Lindqvist", logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#fff"/></svg>` }),
    S.renderTitleBanner({ kind: "pennant", title: "Stanley Cup", subtitle: "Champions", years: [1984, 1985, 1987] }),
    S.renderTitleBanner({ kind: "garden", city: "Edmonton", club: "Oilers", title: "Stanley Cup", subtitle: "Champions", years: [1990] }),
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

test("a cuff is the sleeve's end in a contrasting colour, over the stripes, and is checked", () => {
  const plain = S.renderJersey({ cut: "hockey", colors: ["#ffffff", "#af1e2d"], sleeveStripes: 0 });
  const cuffed = S.renderJersey({ cut: "hockey", colors: ["#ffffff", "#af1e2d"], sleeveStripes: 0, cuffs: [14, 1] });
  assert.notEqual(plain, cuffed);
  assert.match(cuffed, /fill="#af1e2d"/);
  assert.equal(wellFormed(cuffed), null);
  assert.equal(S.renderJersey({ cut: "hockey", colors: ["#ffffff", "#af1e2d"], sleeveStripes: 0, cuffs: 14 }), cuffed);
  assert.equal(resolve({ cuffs: [14, 1] }).cuffs?.len, 14);
  // A length or a colour that is not allowed is no cuff; a tank has no sleeves to end.
  for (const bad of [0, 2, 500, -4, [10, 9], [10, 0], ["x"], "14", NaN]) assert.equal(resolve({ cuffs: bad as never }).cuffs, undefined, JSON.stringify(bad));
  assert.equal(resolve({ cut: "basketball", cuffs: 10 }).cuffs, undefined);
  // A second colour, and every cut and look draw one.
  for (const cut of S.CUT_IDS) for (const look of S.LOOK_IDS) {
    const svg = S.renderJersey({ cut, look, cuffs: [10, 2], colors: ["#1f3a8a", "#f4f0e4", "#c8102e"], view: "both" });
    assert.equal(wellFormed(svg), null, `${cut} ${look}`);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
  const line = (cuffs?: number) => S.renderJersey({ cut: "soccer", look: "line", sleeveStripes: 0, cuffs });
  assert.notEqual(line(10), line());
});

test("diagonal chest text steps letter by letter, up to the right or down to the right, and stays on the chest and escaped", () => {
  for (const cut of S.CUT_IDS) {
    const spec = S.CUTS[cut];
    for (const angle of ["diagonal-up", "diagonal-down"] as const) {
      const svg = S.renderJersey({ cut, frontText: "HOMETOWN", frontTextAngle: angle, view: "front" });
      assert.equal(wellFormed(svg), null);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
      assert.notEqual(svg, S.renderJersey({ cut, frontText: "HOMETOWN", frontTextAngle: "straight", view: "front" }), `${cut} ${angle}`);
    }
    const up = S.renderJersey({ cut, frontText: "MMMMMMMMMMMMMM", frontTextAngle: "diagonal-up", look: "line", view: "front" });
    const down = S.renderJersey({ cut, frontText: "MMMMMMMMMMMMMM", frontTextAngle: "diagonal-down", look: "line", view: "front" });
    // The same word in the mirror image: the run's paths fit between the sleeves and above the hem.
    for (const svg of [up, down]) {
      const d = [...svg.matchAll(/<path d="(M[^"]*)" fill="none" stroke-linejoin="miter"/g)].map((m) => m[1] as string).sort((a, b) => b.length - a.length)[0] as string;
      const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      const xs = nums.filter((_, i) => i % 2 === 0);
      const ys = nums.filter((_, i) => i % 2 === 1);
      assert.ok(Math.min(...xs) >= 100 - spec.wu && Math.max(...xs) <= 100 + spec.wu, `${cut}: x ${Math.min(...xs)} to ${Math.max(...xs)}`);
      assert.ok(Math.min(...ys) > spec.ay - 10 && Math.max(...ys) < spec.hy, `${cut}: y ${Math.min(...ys)} to ${Math.max(...ys)}`);
    }
    assert.notEqual(up, down);
  }
  // A system-text run (Japanese): the second letter is higher than the first rising up, lower going down.
  const rise = (slant: number) => layout("選手", 100, 100, { height: 20, slant }).chars.map((c) => c.y);
  assert.ok((rise(30)[1] as number) < (rise(30)[0] as number));
  assert.ok((rise(-30)[1] as number) > (rise(-30)[0] as number));
  assert.equal(rise(0)[1], rise(0)[0]);
  // The text is still cleaned and escaped.
  const hostile = S.renderJersey({ frontText: `<script>alert(1)</script>"`, frontTextAngle: "diagonal-up" });
  assert.doesNotMatch(hostile, /<script/);
  assert.equal(wellFormed(hostile), null);
  assert.equal(resolve({ frontTextAngle: "sideways" as never }).frontTextAngle, "straight");
  assert.equal(resolve({ cut: "basketball" }).frontTextAngle, "arch");
  assert.equal(resolve({ cut: "basketball", frontTextAngle: "straight" }).frontTextAngle, "straight");
});

test("the new options travel as attributes and as a query", () => {
  const options = { cut: "hockey", cuffs: [14, 2], frontText: "HOMETOWN", frontTextAngle: "diagonal-down" } as const;
  const attrs = S.attributesFromOptions(options);
  assert.equal(attrs.cuffs, "14 2");
  assert.equal(attrs["front-text-angle"], "diagonal-down");
  const back = S.optionsFromAttributes((name) => attrs[name] ?? null);
  assert.equal(S.renderJersey(back), S.renderJersey(options));
  assert.equal(S.jerseyFromParams(S.jerseyToParams(options)).frontTextAngle, "diagonal-down");
  assert.equal(S.optionsFromAttributes((n) => (n === "cuffs" ? "12" : null)).cuffs, 12);
  assert.ok(S.OPTION_ATTRIBUTES.includes("cuffs") && S.OPTION_ATTRIBUTES.includes("front-text-angle"));
  assert.deepEqual([...S.TEXT_ANGLE_IDS], ["straight", "arch", "diagonal-up", "diagonal-down"]);
});

test("a number may be red on royal blue when its white outline reads, and a patch is on the front only", () => {
  const blue = { cut: "hockey", colors: ["#0038a8", "#ffffff", "#ce1126", "#ce1126", "#ffffff"], number: 9, view: "back" } as const;
  const ink = inkFor(resolve(blue), [readColour("#0038a8") as never]);
  assert.equal(ink.fill.join(), readColour("#ce1126")?.join());
  assert.equal(ink.outline?.join(), readColour("#ffffff")?.join());
  // Without an outline that reads, the old rule holds: the fill is replaced by one that reads.
  const lone = inkFor(resolve({ colors: ["#0038a8", "#ffffff", "#ce1126", "#ce1126"] }), [readColour("#0038a8") as never]);
  assert.ok(contrast(lone.fill, readColour("#0038a8") as never) >= 4.5);
  const front = S.renderJersey({ cut: "hockey", patch: "A", view: "front" });
  const back = S.renderJersey({ cut: "hockey", patch: "A", view: "back" });
  assert.notEqual(front, S.renderJersey({ cut: "hockey", view: "front" }));
  const ids = (svg: string): string => svg.replace(/sj[0-9a-z]+/g, "X");
  // The back carries no patch: it is the same drawing as without one, apart from the ids.
  assert.equal(ids(back), ids(S.renderJersey({ cut: "hockey", view: "back" })));
});
