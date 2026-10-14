import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { LEAGUES, PRESETS } from "../src/presets-entry.ts";
import { decode, defineLeague } from "../src/presets/core.ts";
import { readColour } from "../src/colour.ts";
import { wellFormed } from "./helpers.ts";

test("every preset has a unique id of the form league:team-years-way, a name in English and in Japanese, and years", () => {
  assert.ok(PRESETS.length >= 300, `${PRESETS.length} presets`);
  const seen = new Set<string>();
  for (const p of PRESETS) {
    assert.match(p.id, /^[a-z]+:[a-z0-9]+(?:-[a-z0-9]+)*$/, p.id);
    assert.ok(p.id.startsWith(`${p.league}:`), p.id);
    assert.ok(!seen.has(p.id), `${p.id} twice`);
    seen.add(p.id);
    assert.match(p.team, /\S/, p.id);
    assert.match(p.ja, /[぀-ヿ㐀-鿿]/, `${p.id}: ${p.ja} has no Japanese`);
    assert.match(p.years, /^\d{4}s?(?:-\d{0,4})?$/, `${p.id}: ${p.years}`);
    assert.match(p.way, /\S/, p.id);
  }
  assert.deepEqual(LEAGUES.flatMap((l) => l.presets).length, PRESETS.length);
});

test("a preset is colours and stripes only: no crest, no chest lettering, no name or number", () => {
  for (const p of PRESETS) {
    const o = p.options as Record<string, unknown>;
    for (const forbidden of ["crest", "frontText", "frontTextAngle", "frontNumber", "name", "number", "patch", "title", "description"]) assert.equal(o[forbidden], undefined, `${p.id} has ${forbidden}`);
    assert.ok(readColour(o.body) !== undefined, `${p.id}: body ${String(o.body)}`);
    assert.ok(readColour(o.trim) !== undefined, `${p.id}: trim ${String(o.trim)}`);
    if (o.accent !== undefined) assert.ok(readColour(o.accent) !== undefined, `${p.id}: accent`);
  }
});

test("every preset is small, and draws a well-formed jersey (front and back) and a kit", () => {
  let bytes = 0;
  for (const p of PRESETS) {
    const size = JSON.stringify(p.options).length;
    bytes += size;
    assert.ok(size < 700, `${p.id}: ${size} bytes of options`);
    const svg = S.renderJersey({ ...p.options, view: "both", number: 12, name: "Gray" });
    assert.equal(wellFormed(svg), null, p.id);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, p.id);
  }
  for (const p of PRESETS.filter((_, i) => i % 9 === 0)) {
    const svg = S.renderJersey({ ...p.options, kit: true });
    assert.equal(wellFormed(svg), null, p.id);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, p.id);
  }
  assert.ok(bytes / PRESETS.length < 400, `${Math.round(bytes / PRESETS.length)} bytes of options each`);
});

test("a spec is read into options: colours in order, then key=value words", () => {
  const o = decode("c8102e fff 192168 ffd100 000 c=h p=h r=8.1.8.2.8.0 ss=2 hs=4.0.3.2 co=l y=c sn=1 n=9 ps=0 pt=111 pb=4.1 sk=c8102e sb=10.0.5.1 he=192168");
  assert.equal(o.body, "#c8102e");
  assert.equal(o.trim, "#fff");
  assert.equal(o.accent, "#192168");
  assert.equal(o.numberFill, "#ffd100");
  assert.equal(o.numberOutline, "#000");
  assert.equal(o.cut, "hockey");
  assert.equal(o.pattern, "hoops");
  assert.deepEqual(o.repeat, [8, 1, 8, 2, 8, 0]);
  assert.equal(o.sleeveStripes, 2);
  assert.deepEqual(o.hemStripes, [4, 0, 3, 2]);
  assert.equal(o.collar, "lace-up");
  assert.equal(o.yoke, "curved");
  assert.equal(o.sleeveNumbers, true);
  assert.equal(o.stripeCount, 9);
  assert.equal(o.patternSleeves, false);
  assert.equal(o.pants, "#111");
  assert.deepEqual(o.pantsBands, [4, 1]);
  assert.deepEqual(o.socksBands, [10, 0, 5, 1]);
  assert.equal(o.helmet, "#192168");
  assert.deepEqual(decode("- 000"), { trim: "#000" });
  assert.deepEqual(decode("nonsense zz=1 p=zz"), { pattern: "solid" });
  const list = defineLeague("test", "soccer", { a: ["A", "エー"] }, [["a", "1990s", "home", "fff 000"]]);
  assert.equal(list[0]?.id, "test:a-1990s-home");
  assert.equal(list[0]?.options.cut, "soccer");
  assert.throws(() => defineLeague("test", "soccer", {}, [["x", "1990s", "home", ""]]));
});

test("the stripe count draws that many equal stripes across the torso, and a pattern can stay off the sleeves", () => {
  const stripes = (n: number): number => (S.renderJersey({ colors: ["#000000", "#ffffff"], pattern: "stripes", stripeCount: n, cut: "soccer" }).match(/<path d="M[\d.-]+ 0H[\d.-]+V232H/g) ?? []).length;
  assert.ok(stripes(9) > stripes(5));
  assert.notEqual(S.renderJersey({ pattern: "hoops", patternSleeves: false }), S.renderJersey({ pattern: "hoops" }));
});

test("the current Canadiens, Rangers, Kraken, Flames and Stars jerseys carry their cuffs, elbow stripes and number colours", () => {
  const by = (id: string) => PRESETS.find((p) => p.id === id)?.options as Record<string, unknown>;
  const habs = by("nhl:montreal-1967-white");
  assert.deepEqual(habs.cuffs, [18, 1]);
  assert.equal(habs.yoke, "curved");
  const rangers = by("nhl:rangers-1997-blue");
  assert.equal(rangers.numberFill, "#ce1126");
  assert.equal(rangers.numberOutline, "#fff");
  assert.deepEqual((rangers.sleeveStripes as number[]).slice(0, 2), [24, 0]);
  const kraken = by("nhl:kraken-2021-home");
  assert.deepEqual(kraken.sleeveStripes, [20, 0, 3, 2, 14, 1, 3, 2]);
  assert.equal(kraken.accent, "#e9072b");
  const flames = by("nhl:flames-2020-home");
  assert.equal((flames.sleeveStripes as number[]).filter((_, i) => i % 2 === 1 && _ !== 0).length, 3);
  assert.ok(by("nhl:flames-2020-away"));
  const stars = by("nhl:stars-2013-home");
  assert.equal(stars.numberFill, "#fff");
  assert.equal(stars.numberOutline, "#000");
});

test("a spec reads the cuffs: a length alone, or a length and a colour", () => {
  assert.equal(decode("fff af1e2d cf=14").cuffs, 14);
  assert.deepEqual(decode("fff af1e2d cf=14.2").cuffs, [14, 2]);
});
