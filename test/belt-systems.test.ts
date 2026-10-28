import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BELT_SOURCES, BELT_SYSTEMS, beltSystem, beltSystemSources } from "../src/index.ts";

test("every system has unique grades, real sources read on a day, and sane measures", () => {
  assert.equal(new Set(BELT_SYSTEMS.map((s) => s.id)).size, BELT_SYSTEMS.length);
  for (const s of BELT_SYSTEMS) {
    assert.equal(new Set(s.grades.map((g) => g.id)).size, s.grades.length, `${s.id}: grade ids`);
    assert.ok(s.grades.length > 0 && s.sources.length > 0 && s.notes.length > 0);
    for (const id of s.sources) {
      const src = BELT_SOURCES[id];
      assert.ok(src, `${s.id}: unknown source ${id}`);
      assert.match(src.read, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(src.url, /^(https:\/\/|dropbox:\/)/);
    }
    assert.equal(beltSystemSources(s).length, s.sources.length);
    // Sourced means a governing body's own text was read, and a lead-only system cites no primary source.
    const kinds = beltSystemSources(s).map((x) => x.kind);
    if (s.status === "sourced") assert.ok(kinds.includes("primary"), s.id);
    if (s.status === "lead") assert.ok(!kinds.includes("primary") || s.id === "karate-kyu-dan", s.id);
    assert.ok(s.ends.widthCm.min <= s.ends.widthCm.usual && s.ends.widthCm.usual <= s.ends.widthCm.max, s.id);
    assert.ok(s.ends.hangCm.min <= s.ends.hangCm.usual && s.ends.hangCm.usual <= s.ends.hangCm.max, s.id);
    for (const g of s.grades) {
      assert.ok(g.body.length === 1 || g.split !== undefined, `${s.id}/${g.id}: two colours need a split`);
      assert.ok(g.split === undefined || g.body.length === 2, `${s.id}/${g.id}: a split needs two colours`);
    }
  }
});

test("the systems read from governing bodies have the grades those bodies list", () => {
  const ids = (id: string): string[] => (beltSystem(id)?.grades ?? []).map((g) => g.id);
  // BJA: 18 mon grades, three to a colour, tags 1 to 3.
  const mon = beltSystem("judo-bja-mon")!.grades;
  assert.equal(mon.length, 18);
  assert.deepEqual(mon.slice(0, 3).map((g) => [g.body[0], g.tags?.colour, g.tags?.count]), [["red", "yellow", 1], ["red", "yellow", 2], ["red", "yellow", 3]]);
  assert.deepEqual(mon.slice(15).map((g) => [g.body[0], g.tags?.colour, g.tags?.count]), [["brown", "red", 1], ["brown", "red", 2], ["brown", "red", 3]]);
  // IBJJF: white plus thirteen kids' belts of four colours, eight adult belts.
  assert.equal(ids("bjj-ibjjf-kids").length, 13);
  assert.equal(ids("bjj-ibjjf-adult").length, 8);
  const grey = beltSystem("bjj-ibjjf-kids")!.grades.filter((g) => g.body[0] === "grey");
  assert.deepEqual(grey.map((g) => g.centreStripe), ["white", undefined, "black"]);
  // Judo Canada: eleven kyu belts (six colours and five half grades), the half grades split lengthwise.
  const kyu = beltSystem("judo-ijf")!.grades.filter((g) => g.rankKind === "kyu");
  assert.equal(kyu.length, 11);
  assert.equal(kyu.filter((g) => g.split === "lengthwise").length, 5);
  assert.deepEqual(kyu.find((g) => g.id === "kyu-6-half")?.body, ["white", "yellow"]);
  // ITF: ten gup and black.
  assert.equal(ids("taekwondo-itf").length, 11);
  assert.deepEqual(beltSystem("taekwondo-itf")!.grades.find((g) => g.id === "gup-red-black")?.tags, { colour: "black", count: 1, form: "tip" });
});

test("docs/martial-arts.md is the page the data makes", () => {
  execFileSync("node", ["scripts/make-martial-arts-doc.mjs", "--check"], { stdio: "pipe" });
  const doc = readFileSync("docs/martial-arts.md", "utf8");
  for (const s of BELT_SYSTEMS) for (const src of beltSystemSources(s)) assert.ok(doc.includes(src.url), src.url);
});
