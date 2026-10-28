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

test("belt widths are the ones makers make, per grade colour", async () => {
  const { beltWidthsFor, beltDefaultWidthCm, beltWidthIsReal, beltStitchLinesFor, BELT_MODELS, BELT_SIZES, KOHAKU, MAKER_EMBROIDERY } = await import("../src/index.ts");
  assert.deepEqual(beltWidthsFor("red-white"), [4.5]);
  assert.deepEqual(beltWidthsFor("red"), [4.5]);
  assert.deepEqual(beltWidthsFor("green"), [4.2]);
  assert.deepEqual(beltWidthsFor("white"), [4.2, 4.5]);
  assert.deepEqual(beltWidthsFor("black"), [4.2, 4.5, 4.7]);
  assert.deepEqual(beltWidthsFor("none"), []);
  for (const belt of ["white", "yellow", "orange", "green", "blue", "brown", "black", "red-white", "red"]) assert.ok(beltWidthIsReal(belt, beltDefaultWidthCm(belt)), belt);
  assert.ok(!beltWidthIsReal("red-white", 4) && !beltWidthIsReal("red-white", 5) && !beltWidthIsReal("black", 5));
  // Kohaku: 13 lines (cotton) or 16 (silk), never other; the silk and cotton belts both 4.5 cm.
  assert.deepEqual(beltStitchLinesFor("red-white"), [13, 16]);
  assert.deepEqual(beltStitchLinesFor("green"), [10]);
  assert.ok(BELT_MODELS.every((m) => m.widthCm >= 4 && m.widthCm <= 5 && [8, 10, 13, 14, 15, 16].includes(m.stitchLines)));
  // Sizes step 10 cm from 235 (size 2) to 355, with size 1 at 215; women's are 5 cm shorter.
  assert.equal(BELT_SIZES.length, 14);
  assert.ok(BELT_SIZES.every((s, i) => s.cm === (i === 0 ? 215 : 235 + (i - 1) * 10) && s.womenCm === s.cm - 5 && s.waistCm[0] < s.waistCm[1]));
  assert.deepEqual([KOHAKU.sectionCm.min, KOHAKU.sectionCm.max, KOHAKU.bothEndsRed], [12, 18, true]);
  assert.equal(MAKER_EMBROIDERY.maxLengthCm, 20);
});

test("integrated embroidery is flatter than applied, on any garment, and the default is applied", async () => {
  const { renderJudogi } = await import("../src/index.ts");
  const draw = (stitching?: "applied" | "integrated", font?: "block" | "gothic") => renderJudogi({ mode: "belt", belt: "red-white", embroidery: [{ place: "belt-end-left", text: "KAI", thread: "gold", font, ...(stitching ? { stitching } : {}) }] });
  const norm = (s: string): string => s.replace(/jg[0-9a-z]+/g, "jg");
  for (const font of ["block", "gothic"] as const) {
    assert.equal(norm(draw("applied", font)), norm(draw(undefined, font)));
    assert.notEqual(norm(draw("integrated", font)), norm(draw("applied", font)));
    // Compared with the drawing's own id taken out: a longer hash in the id of one is thousands of characters, which is no drawing.
    assert.ok(norm(draw("integrated", font)).length < norm(draw("applied", font)).length, "no side wall, no light line");
  }
  for (const belt of ["white", "black", "red-white"] as const) assert.match(renderJudogi({ mode: "belt", belt, embroidery: [{ place: "belt-end-right", text: "X", stitching: "integrated" }] }), /<svg /);
});

test("thickness grades and the tags near a belt's end", async () => {
  const { beltThicknessesFor, BELT_TAG_NEEDS } = await import("../src/index.ts");
  assert.deepEqual(beltThicknessesFor("red-white"), ["standard", "thick"]);
  assert.deepEqual(beltThicknessesFor("green"), ["standard"]);
  assert.deepEqual(beltThicknessesFor("black"), ["standard", "thick", "extra-thick"]);
  assert.equal(BELT_TAG_NEEDS["white-tag"], "size-tag");
});

test("the size tag's default line is the three kanji for made in Japan", async () => {
  const { BELT_SIZE_TAG_LINE } = await import("../src/index.ts");
  assert.equal([...BELT_SIZE_TAG_LINE].length, 3);
});
