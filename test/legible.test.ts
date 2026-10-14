import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { optionsFromAttributes, attributesFromOptions } from "../src/attrs.ts";
import { CUTS } from "../src/cuts.ts";
import { decode } from "../src/presets/core.ts";
import { OFFICIALS } from "../src/presets/officials.ts";
import { PRESETS } from "../src/presets-entry.ts";
import { resolve } from "../src/options.ts";
import { layout } from "../src/text.ts";
import { readRun } from "./legible.ts";

const STRIPED = new Set(["stripes", "hoops", "pinstripes", "halves", "quarters"]);
const plain = (svg: string): string => svg.replace(/sj[a-z0-9]{4,8}/g, "sj");

/** The least contrast, against the ink, of anything drawn within a third of a stroke of the edge of the back's number and of its name. */
function backReading(o: S.JerseyOptions): { number: number; name: number } {
  const spec = CUTS[o.cut ?? "soccer"];
  const svg = S.renderJersey({ ...o, view: "back", number: 88, name: "Beaumont" });
  const n = spec.number.back;
  const m = spec.name;
  return {
    number: readRun(svg, "88", n.x, n.y, { height: n.h, maxWidth: n.w, weight: "black" }).worst,
    name: readRun(svg, "BEAUMONT", m.x, m.y, { height: m.h, maxWidth: m.w, weight: "bold", arch: o.nameArch === "straight" ? undefined : 110, tracking: 0.45 }).worst,
  };
}

test("the lettering on every striped or hooped preset keeps a clear edge: nothing the colour of the ink within a third of a stroke of a letter", () => {
  let n = 0;
  for (const p of PRESETS) {
    if (!STRIPED.has(String(p.options.pattern))) continue;
    n++;
    const { number, name } = backReading(p.options);
    assert.ok(number >= 4.5, `${p.id}: the number's edge reads at ${number.toFixed(1)}`);
    assert.ok(name >= 4.5, `${p.id}: the name's edge reads at ${name.toFixed(1)}`);
  }
  assert.ok(n > 100, `${n} striped presets measured`);
});

test("every striped official's back reads clearly, by a plate or by a wide outline, and the black-and-white shirts do not print the lettering bare on the stripes", () => {
  const striped = OFFICIALS.filter((p) => STRIPED.has(String(p.options.pattern)));
  assert.ok(striped.length >= 18, "the striped officials");
  for (const p of striped) {
    const { number, name } = backReading(p.options);
    assert.ok(number >= 4.5 && name >= 4.5, `${p.id}: ${number.toFixed(1)} and ${name.toFixed(1)}`);
  }
  // The shirts known to carry a patch have a plate; the rest have the wide outline.
  for (const id of ["ref:nfl", "ref:ncaa-football", "ref:nba-classic"]) assert.ok(OFFICIALS.find((p) => p.id === id)?.options.plate !== undefined, id);
  for (const id of ["ref:nhl-modern-referee", "ref:nhl-modern-linesman", "ref:cfl", "ref:highschool-football", "ref:ncaa-basketball-men", "ref:lacrosse-boys", "ref:lacrosse-girls"]) assert.equal(OFFICIALS.find((p) => p.id === id)?.options.plate, undefined, id);
});

test("striped team shirts read too: Newcastle's, Juventus's and Leicester's hoops had a black or white stripe at the edge of the number", () => {
  for (const id of ["soccer:newcastle-1950-1990-home", "soccer:juventus-1950-1990-home", "soccer:fluminense-1950-1995-home", "soccer:psg-1980-2000-home", "rugby:leicester-1950-2000-home", "rugby:bath-1950-2000-home"]) {
    const p = PRESETS.find((q) => q.id === id);
    assert.ok(p, id);
    const { number } = backReading(p.options);
    assert.ok(number >= 4.5, `${id}: ${number.toFixed(1)}`);
  }
});

test("the outline is wide only where stripes would swallow the lettering: a plain shirt keeps its thin one", () => {
  const spot = CUTS.football.number.back;
  const run = layout("27", spot.x, spot.y, { height: spot.h, maxWidth: spot.w, weight: "black" });
  // The outline is the first stroke drawn along the number's centre line, as wide as the letters plus twice the outline.
  const edge = (o: S.JerseyOptions): number => {
    const svg = S.renderJersey({ cut: "football", numberFill: "#101010", numberOutline: "#ffffff", ...o, view: "back", number: 27 });
    const m = new RegExp(`<path d="${run.d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*stroke-width="([\\d.]+)"`).exec(svg);
    assert.ok(m, "the outline is drawn");
    return (Number(m[1]) - run.sw) / 2 / run.sw;
  };
  assert.ok(edge({ colors: ["#ffffff", "#101010"], pattern: "stripes", repeat: [5, 0, 10, 1, 5, 0] }) >= 0.4, "wide over stripes");
  assert.ok(edge({ colors: ["#c8102e", "#ffffff"] }) <= 0.2, "thin on a plain shirt");
});

test("a plate is a patch behind the back's name and number: on the back only, never in the line look, in the colour asked or the lighter of body and trim", () => {
  const base = { cut: "football" as const, colors: ["#ffffff", "#101010"], pattern: "stripes" as const, repeat: [5, 0, 10, 1, 5, 0] };
  const plate = S.renderJersey({ ...base, plate: true, view: "back", number: 27, name: "Beaumont" });
  const bare = S.renderJersey({ ...base, view: "back", number: 27, name: "Beaumont" });
  assert.match(plate, /<path d="M[\d. ]+H[\d. ]+Q[^"]*Z" fill="#ffffff" stroke="#/);
  assert.doesNotMatch(bare, /<path d="M[\d. ]+H[\d. ]+Q[^"]*Z" fill="#ffffff" stroke="#/);
  assert.equal(plain(S.renderJersey({ ...base, plate: true, view: "front" })), plain(S.renderJersey({ ...base, view: "front" })));
  assert.equal(plain(S.renderJersey({ ...base, plate: true, view: "back" })), plain(S.renderJersey({ ...base, view: "back" })), "no number, no name: no plate");
  const black = S.renderJersey({ ...base, plate: "#101010", numberFill: "#ffffff", view: "back", number: 27 });
  assert.match(black, /fill="#101010" stroke="#/);
  assert.equal(plain(S.renderJersey({ ...base, plate: true, look: "line", view: "back", number: 27 })), plain(S.renderJersey({ ...base, look: "line", view: "back", number: 27 })));
  assert.deepEqual(resolve({ ...base, plate: true }).plate, [255, 255, 255]);
  assert.deepEqual(resolve({ colors: ["#101010", "#ffffff"], plate: true }).plate, [255, 255, 255]);
  assert.equal(resolve({ ...base, plate: "nonsense" }).plate, undefined);
  assert.equal(resolve({ ...base, plate: false }).plate, undefined);
  // The lettering on it reads: black on a white plate over black-and-white stripes.
  const { number, name } = backReading({ ...base, plate: true });
  assert.ok(number >= 4.5 && name >= 4.5);
});

test("the plate has a spec word, an attribute and a query word", () => {
  assert.equal(decode("fff 101010 bp=1").plate, true);
  assert.equal(decode("fff 101010 bp=101010 nf=fff").plate, "#101010");
  assert.equal(decode("fff 101010 bp=zz").plate, undefined);
  assert.equal(optionsFromAttributes((k) => (k === "plate" ? "true" : null)).plate, true);
  assert.equal(optionsFromAttributes((k) => (k === "plate" ? "101010" : null)).plate, "#101010");
  assert.equal(optionsFromAttributes((k) => (k === "plate" ? "nonsense" : null)).plate, undefined);
  assert.deepEqual(attributesFromOptions({ plate: true }), { plate: "true" });
  assert.deepEqual(attributesFromOptions({ plate: "#101010" }, false), { plate: "101010" });
  assert.ok((S.OPTION_ATTRIBUTES as readonly string[]).includes("plate"));
});
