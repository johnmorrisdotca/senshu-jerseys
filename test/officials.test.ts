import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { OFFICIALS } from "../src/presets/officials.ts";
import { PRESETS, LEAGUES } from "../src/presets-entry.ts";
import { armbandsOf, resolve } from "../src/options.ts";
import { decode } from "../src/presets/core.ts";
import { wellFormed } from "./helpers.ts";

const by = (id: string) => OFFICIALS.find((p) => p.id === id);
const count = (svg: string, text: string): number => svg.split(text).length - 1;
// A drawing's ids come from a hash of its options, so two drawings are compared with them taken out.
const plain = (svg: string): string => svg.replace(/sj[a-z0-9]{4,8}/g, "sj");

test("the officials' presets include every look asked for, keyed ref:...", () => {
  for (const id of [
    "ref:nhl-modern-referee", "ref:nhl-modern-linesman", "ref:nhl-modern-referee-zip", "ref:nhl-modern-linesman-zip", "ref:nhl-1950s-candy",
    "ref:nba-classic", "ref:nba-modern", "ref:nfl", "ref:cfl", "ref:ncaa-football",
    "ref:soccer-black-classic", "ref:soccer-yellow", "ref:soccer-lime", "ref:soccer-coral", "ref:soccer-cyan",
    "ref:mlb-umpire-navy", "ref:rugby-union-yellow", "ref:lacrosse-boys",
  ]) assert.ok(by(id), id);
  assert.ok(OFFICIALS.length >= 30);
  const ids = new Set(OFFICIALS.map((p) => p.id));
  assert.equal(ids.size, OFFICIALS.length);
  assert.ok(LEAGUES.some((l) => l.id === "officials" && l.presets === OFFICIALS));
  assert.equal(PRESETS.filter((p) => p.league === "ref").length, OFFICIALS.length);
});

test("a referee and a linesman differ by their armbands only", () => {
  const referee = by("ref:nhl-modern-referee")?.options as Record<string, unknown>;
  const linesman = by("ref:nhl-modern-linesman")?.options as Record<string, unknown>;
  assert.deepEqual(referee.armbands, [2, 12, 30]);
  assert.equal(linesman.armbands, undefined);
  const rest = { ...referee };
  delete rest.armbands;
  assert.deepEqual(rest, linesman);
  assert.equal(referee.accent, "#f58220");
  assert.equal(referee.collar, "polo");
  assert.equal(by("ref:nhl-modern-referee-zip")?.options.collar, "zip");
  assert.equal(referee.pattern, "stripes");
});

test("the officials' presets decode: spec words for armbands, pocket, badge, protector, straight names and the new collars", () => {
  const o = decode("fff 111 f58220 ab=2.14.35 pk=1 bd=s pr=1 na=s co=z cc=3");
  assert.deepEqual(o.armbands, [2, 14, 35]);
  assert.equal(o.pocket, true);
  assert.equal(o.badge, "shield");
  assert.equal(o.protector, true);
  assert.equal(o.nameArch, "straight");
  assert.equal(o.collar, "zip");
  assert.equal(o.collarColor, 3);
  assert.equal(decode("fff 111 co=t").collar, "point");
  assert.equal(decode("fff 111 ab=2").armbands, 2);
  assert.equal(decode("fff 111 bd=zz").badge, undefined);
});

test("an official's preset is colours and shapes only: no crest, no mark, no name, and every one draws front and back", () => {
  for (const p of OFFICIALS) {
    const o = p.options as Record<string, unknown>;
    for (const forbidden of ["crest", "frontText", "frontNumber", "name", "number", "patch", "title", "description"]) assert.equal(o[forbidden], undefined, `${p.id} has ${forbidden}`);
    assert.match(p.id, /^ref:[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(p.ja, /[぀-ヿ㐀-鿿]/, p.id);
    const svg = S.renderJersey({ ...p.options, view: "both", number: 14, name: "Beaumont" });
    assert.equal(wellFormed(svg), null, p.id);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, p.id);
    assert.doesNotMatch(svg, /<image|<text|href="http/, p.id);
    assert.ok(JSON.stringify(p.options).length < 700, p.id);
  }
});

test("armbands draw a band on each upper arm in the colour asked, none without them, and the linesman has none", () => {
  const base = { cut: "hockey" as const, colors: ["#ffffff", "#101010", "#f58220"], sleeve: "long" as const, sleeveStripes: 0, hemStripes: 0 };
  const bare = S.renderJersey(base);
  const worn = S.renderJersey({ ...base, armbands: [2, 12, 30] });
  assert.equal(count(bare, 'fill="#f58220"'), 0);
  assert.equal(count(worn, 'fill="#f58220"'), 2);
  assert.notEqual(S.renderJersey({ ...base, armbands: [2, 12, 60] }), worn);
  assert.notEqual(S.renderJersey({ ...base, armbands: [1, 12, 30] }), worn);
  const referee = S.renderJersey({ ...by("ref:nhl-modern-referee")?.options });
  const linesman = S.renderJersey({ ...by("ref:nhl-modern-linesman")?.options });
  assert.equal(count(referee, 'fill="#f58220"'), 2);
  assert.equal(count(linesman, 'fill="#f58220"'), 0);
  assert.equal(count(S.renderJersey({ ...base, armbands: 2, sleeve: "none", cut: "basketball" }), 'fill="#f58220"'), 0);
  // The back and the line look carry them too; a bad value is no band.
  assert.equal(count(S.renderJersey({ ...base, armbands: [2, 12, 30], view: "back" }), 'fill="#f58220"'), 2);
  assert.ok(S.renderJersey({ ...base, armbands: [2, 12, 30], look: "line" }).length > S.renderJersey({ ...base, look: "line" }).length);
  assert.equal(armbandsOf([2, 99, 30]), undefined);
  assert.equal(armbandsOf([0, 12, 30]), undefined);
  assert.deepEqual(armbandsOf(2), { c: 2, w: 12, at: 30 });
  assert.equal(resolve({ armbands: "x" as unknown as number }).armbands, undefined);
});

test("a chest pocket and a badge spot draw on the front only, empty and plain, and a caller's crest takes the badge's place", () => {
  const base = { cut: "soccer" as const, colors: ["#f7e017", "#101010"] };
  const flat = S.renderJersey(base);
  const pocket = S.renderJersey({ ...base, pocket: true });
  const badge = S.renderJersey({ ...base, pocket: true, badge: "shield" });
  assert.ok(pocket.length > flat.length);
  assert.ok(badge.length > pocket.length);
  assert.equal(plain(S.renderJersey({ ...base, pocket: true, badge: "shield", view: "back" })), plain(S.renderJersey({ ...base, view: "back" })));
  const shapes = new Set(["round", "shield", "square"].map((b) => S.renderJersey({ ...base, badge: b as "round" })));
  assert.equal(shapes.size, 3);
  assert.doesNotMatch(badge, /<image/);
  const crest = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
  const withCrest = S.renderJersey({ ...base, pocket: true, badge: "round", crest });
  assert.match(withCrest, /<image|<svg/);
  const crestOnly = S.renderJersey({ ...base, crest });
  assert.notEqual(withCrest, crestOnly);
  assert.equal(plain(S.renderJersey({ ...base, badge: "nonsense" as "round" })), plain(flat));
});

test("a zip collar draws a zipper, a point collar its long points and buttons, on every cut that allows them", () => {
  const base = { colors: ["#ffffff", "#101010"] };
  for (const cut of ["hockey", "football", "soccer", "rugby"] as const) {
    const zip = S.renderJersey({ ...base, cut, collar: "zip" });
    const polo = S.renderJersey({ ...base, cut, collar: "polo" });
    const point = S.renderJersey({ ...base, cut, collar: "point" });
    assert.equal(wellFormed(zip), null, cut);
    assert.equal(wellFormed(point), null, cut);
    assert.notEqual(zip, polo, cut);
    assert.notEqual(point, polo, cut);
    assert.ok(zip.includes("stroke-width=\"3.4\""), `${cut} zip tape`);
    assert.ok(count(point, "<circle") >= 3, `${cut} placket buttons`);
  }
  assert.ok(S.COLLAR_IDS.includes("zip") && S.COLLAR_IDS.includes("point"));
  assert.equal(plain(S.renderJersey({ cut: "basketball", collar: "zip" })), plain(S.renderJersey({ cut: "basketball" })));
  assert.equal(S.renderJersey({ cut: "soccer", collar: "zip", view: "back" }).includes('stroke-width="3.4"'), false);
});

test("a collar can take the number's colour, so the NBA's red collar is a third colour", () => {
  const base = { cut: "soccer" as const, colors: ["#b9bec3", "#ffffff", "#111111", "#c8102e"] };
  assert.notEqual(S.renderJersey({ ...base, collarColor: 3 }), S.renderJersey({ ...base, collarColor: 1 }));
  assert.match(S.renderJersey({ ...base, collarColor: 3 }), /#c8102e/);
});

test("stripe widths follow each league's spacing: two inches for college, one for high school and lacrosse girls", () => {
  const width = (id: string): number => {
    const r = by(id)?.options.repeat as number[];
    return r[2] as number; // the centred trim stripe
  };
  const total = (id: string): number => (by(id)?.options.repeat as number[]).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  assert.ok(width("ref:ncaa-football") >= 9 && width("ref:ncaa-football") <= 11);
  assert.ok(width("ref:highschool-football") >= 4 && width("ref:highschool-football") <= 6);
  assert.ok(width("ref:ncaa-football") >= 2 * width("ref:highschool-football") - 1);
  assert.equal(width("ref:lacrosse-girls"), width("ref:highschool-football"));
  // The NFL's stripes are uneven (wider white than black); the others are even to within a unit.
  const nfl = by("ref:nfl")?.options.repeat as number[];
  assert.ok(total("ref:nfl") - (nfl[2] as number) > (nfl[2] as number));
  const college = by("ref:ncaa-football")?.options.repeat as number[];
  assert.ok(Math.abs(total("ref:ncaa-football") - (college[2] as number) - (college[2] as number)) <= 1);
  // The NBA's shirt is pin-striped, not bold.
  assert.equal(by("ref:nba-modern")?.options.pattern, "pinstripes");
  assert.ok(total("ref:nba-modern") <= 6);
  assert.equal(by("ref:nba-classic")?.options.pattern, "stripes");
});

test("a black number with a white edge is kept over black-and-white stripes, where one ink alone cannot read", () => {
  const svg = S.renderJersey({ ...by("ref:nhl-modern-referee")?.options, view: "back", number: 17 });
  assert.match(svg, /fill="#101010"/);
  assert.match(svg, /stroke="#ffffff"|stroke="#fff"/);
  const r = resolve({ colors: ["#ffffff", "#101010"], numberFill: "#101010", numberOutline: "#ffffff", pattern: "stripes" });
  const ink = S.contrast([16, 16, 16], [255, 255, 255]);
  assert.ok(ink > 4.5);
  assert.ok(r.fill !== undefined && r.outline !== undefined);
});

test("the officials' options travel through attributes and the query", () => {
  const o = by("ref:soccer-yellow")?.options ?? {};
  const attrs = S.attributesFromOptions({ ...o, armbands: [2, 12, 30], protector: true });
  assert.equal(attrs.armbands, "2 12 30");
  assert.equal(attrs.pocket, "true");
  assert.equal(attrs.badge, "shield");
  assert.equal(attrs.protector, "true");
  const back = S.optionsFromAttributes((n) => attrs[n] ?? null);
  assert.deepEqual(back.armbands, [2, 12, 30]);
  assert.equal(back.pocket, true);
  assert.equal(back.badge, "shield");
  assert.equal(S.jerseyFromParams(S.jerseyToParams({ ...o, armbands: 2 })).armbands, 2);
  for (const a of ["armbands", "pocket", "badge", "protector"]) assert.ok(S.OPTION_ATTRIBUTES.includes(a as never), a);
});

test("a chest protector draws over the front of a baseball shirt, and not on the back", () => {
  const base = { cut: "baseball" as const, colors: ["#14213d", "#c8102e"], collar: "polo" as const, sleeve: "short" as const };
  assert.ok(S.renderJersey({ ...base, protector: true }).length > S.renderJersey(base).length);
  assert.equal(plain(S.renderJersey({ ...base, protector: true, view: "back" })), plain(S.renderJersey({ ...base, view: "back" })));
});
