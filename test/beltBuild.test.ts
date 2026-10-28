import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { judogiFrame, renderJudogi } from "../src/judogi.ts";
import { wellFormed } from "./helpers.ts";
import { beltPaint, END_CUTS, STRIP_CUTS } from "../src/judogiBelt.ts";
import { END_X, strapFace, type StrapDesc } from "../src/judogiStrap.ts";
import { END_LENGTH, readStyle, stripeHex } from "../src/judogiStripes.ts";
import { gradeBelt } from "../src/beltGrade.ts";
import { BELT_SYSTEMS, beltSystem } from "../src/beltSystems.ts";
import type { VolumeDesc } from "../src/volume.ts";

const RING: StrapDesc = { y: 28, sag: 3, w: 12.5, t: 1.3, a: 66, b: 30, full: 2, side: 0, worn: false };
const strapOf = (svg: string): NonNullable<VolumeDesc["strap"]> => {
  const d = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc).find((v) => v.strap !== undefined)?.strap;
  assert.ok(d !== undefined);
  return d;
};
const rowsIn = (svg: string): number => (svg.match(/stroke-width="0\.32" stroke-opacity="0\.7"/g) ?? []).length;

test("a belt's thickness is its grade's: about 5 mm by default, thicker for the heavier cores, in the strap and so at every edge and fold", () => {
  const t = (beltThickness?: "standard" | "thick" | "extra-thick"): number => strapOf(judogiFrame({ mode: "belt", belt: "black", ...(beltThickness === undefined ? {} : { beltThickness }) })).t;
  assert.ok(Math.abs(t() / 2.63 - 0.5) < 0.02, "5 mm by default");
  assert.equal(t("standard"), t());
  assert.ok(t("thick") > t("standard") && t("extra-thick") > t("thick"));
  assert.ok(t("extra-thick") / 2.63 < 0.8, "still a belt, not a rope");
  // Worn on the jacket too.
  const worn = (beltThickness?: "thick"): number => strapOf(judogiFrame({ mode: "jacket", belt: "black", ...(beltThickness === undefined ? {} : { beltThickness }) })).t;
  assert.ok(worn("thick") > worn());
  assert.equal(strapOf(judogiFrame({ mode: "belt", belt: "black", beltThickness: "nope" as "thick" })).t, t());
});

test("a belt has the rows of stitching asked for, the counts belts are made with, and 10 by default", () => {
  const rows = (beltStitchLines?: 8 | 10 | 13 | 14 | 15 | 16): number => rowsIn(renderJudogi({ mode: "belt", belt: "black", view: "flat", ...(beltStitchLines === undefined ? {} : { beltStitchLines }) }));
  assert.equal(rows(), rows(10));
  assert.ok(rows(16) > rows(13) && rows(13) > rows(10) && rows(10) > rows(8));
  // A count belts are not made with is ignored.
  assert.equal(rows(11 as 10), rows());
});

test("a satin or silk cover has a sheen and cotton has none, and every combination draws well-formed", () => {
  const sheen = (beltCover?: "cotton" | "shusu" | "silk"): number => (judogiFrame({ mode: "belt", belt: "black", ...(beltCover === undefined ? {} : { beltCover }) }).match(/fill-opacity="0\.3"/g) ?? []).length;
  assert.equal(sheen("cotton"), sheen());
  assert.ok(sheen("silk") > sheen("cotton"));
  for (const beltCover of ["cotton", "shusu", "silk"] as const) {
    for (const beltThickness of ["standard", "thick", "extra-thick"] as const) {
      for (const mode of ["belt", "jacket"] as const) {
        assert.equal(wellFormed(judogiFrame({ mode, belt: "red-white", beltCover, beltThickness, beltStitchLines: 16, yaw: 30 })), null);
      }
      assert.equal(wellFormed(renderJudogi({ mode: "pieces", view: "flat", belt: "black", beltCover, beltThickness })), null);
    }
  }
});

test("a kohaku belt's red and white sections are 12 to 18 cm, longer with the size, and both cut ends are well inside red", () => {
  const sectionsOf = (size: "150" | "170" | "200"): number => {
    const svg = renderJudogi({ mode: "belt", belt: "red-white", size, view: "flat" });
    const width = Number(/<pattern id="[^"]*kohaku" width="([\d.]+)"/.exec(svg)?.[1]);
    return width / 2 / 2.63;
  };
  const [a, b, c] = [sectionsOf("150"), sectionsOf("170"), sectionsOf("200")];
  assert.ok(Math.abs(a - 12) < 0.05 && Math.abs(c - 18) < 0.05 && b > a && b < c, `${a} ${b} ${c}`);
  for (const sectionCm of [12, 13.5, 15, 16.5, 18]) {
    const defs = beltPaint("u", "red-white", sectionCm)?.defs ?? "";
    const section = sectionCm * 2.63;
    for (const [id, cuts] of [["kohaku", END_CUTS], ["kohakus", STRIP_CUTS]] as const) {
      const pattern = new RegExp(`<pattern id="u${id}" width="([\\d.]+)"[^>]*translate\\((-?[\\d.]+) 0\\)`).exec(defs);
      assert.ok(pattern !== null, id);
      const phase = -Number(pattern[2]);
      for (const cut of cuts) {
        const x = (((cut + phase) % (2 * section)) + 2 * section) % (2 * section);
        assert.ok(x < section && Math.min(x, section - x) > section * 0.18, `${id} ${sectionCm} cm: a cut end is ${x.toFixed(1)} of a ${section.toFixed(1)} red section`);
      }
    }
  }
});

test("the cut ends the kohaku pattern is put to end in red are where the strap and the flat belt have them", () => {
  for (const k of [0, 1] as const) {
    assert.ok(Math.abs(STRIP_CUTS[k] - (END_X[k] + END_LENGTH[k])) < 0.6, `strip ${k}`);
    assert.ok(Math.abs(END_CUTS[k] - END_LENGTH[k]) < 0.1, `end ${k}`);
  }
});

test("text on a belt's two hanging ends reads down the end, top to bottom, on both ends, in the flat, the worn and the turning drawings", () => {
  const embroidery = [{ place: "belt-end-left" as const, text: "SENSHU", thread: "gold" }, { place: "belt-end-right" as const, text: "JOHN", thread: "white" }];
  for (const [mode, view] of [["belt", "flat"], ["jacket", "flat"], ["belt", "front"], ["jacket", "front"], ["pieces", "flat"]] as const) {
    const svg = renderJudogi({ mode, view, belt: "black", embroidery, label: true, logos: [{ place: "belt-end-left" }], yaw: 0 });
    // Each hanging end is drawn in a frame that runs down it from the knot (a turn of about 77 to 104 degrees); the marks in it are not turned again.
    const frames = [...svg.matchAll(/<g transform="translate\([-\d. ]+\) rotate\((-?[\d.]+)\)">/g)].map((m) => Number(m[1]));
    if (view === "flat") {
      const down = frames.filter((a) => a > 60 && a < 120);
      assert.ok(down.length >= 2, `${mode} ${view}: both ends are drawn down their length (${frames.join(",")})`);
      // Nothing inside a hanging end's frame is turned half a turn.
      assert.ok(![...svg.matchAll(/rotate\((-?[\d.]+)\)/g)].some((m) => Math.abs(Math.abs(Number(m[1])) - 180) < 1), `${mode} ${view}: a mark is turned upside down`);
    }
  }
  // On the turning strap the marks sit on the strip's own length with no turn at all: the strip runs down the end from the knot.
  const strip = strapFace({ fill: "#222", edge: "#000", stitch: "#444", defs: "", ends: { left: { defs: "", body: '<text id="L">SENSHU</text>' }, right: { defs: "", body: '<text id="R">JOHN</text>' } } }, RING.w);
  assert.ok(!/rotate\(/.test(strip.body.slice(strip.body.indexOf('id="L"') - 60, strip.body.indexOf('id="L"'))), "the left end's text is not turned");
  assert.ok(!/rotate\(/.test(strip.body.slice(strip.body.indexOf('id="R"') - 60, strip.body.indexOf('id="R"'))), "the right end's text is not turned");
});

test("every grade of every belt system draws as a belt: its colours, stripe, tip and tags carried over", () => {
  let n = 0;
  for (const system of BELT_SYSTEMS) {
    for (const grade of system.grades) {
      const { belt, beltStyle } = gradeBelt(grade);
      const read = readStyle(beltStyle);
      const svg = judogiFrame({ mode: "belt", belt, beltStyle, yaw: 20 });
      assert.equal(wellFormed(svg), null, `${system.id} ${grade.id}`);
      assert.equal(wellFormed(judogiFrame({ mode: "jacket", belt, beltStyle })), null);
      n++;
      // Two colours lengthwise are a second colour in the split; a stripe along is one along; a tip is a tip; tags are bars.
      if (grade.body.length === 2 && grade.split === "lengthwise") assert.equal(read?.split, stripeHex(grade.body[1]), `${grade.id} split`);
      if (grade.centreStripe !== undefined) assert.equal(read?.along.length, 1, `${grade.id} stripe`);
      if (grade.tip !== undefined) assert.ok(read?.tip !== undefined, `${grade.id} tip`);
      if (grade.tags?.form === "tag") assert.equal(read?.bars[0]?.count, grade.tags.count, `${grade.id} tags`);
      if (grade.body.length === 2 && grade.split === "alternating") assert.ok(belt === "red-white" || read?.alternate !== undefined, `${grade.id} panels`);
      // A colour the belt does not come in is its own base colour.
      if (grade.body.length === 1 && !(["white", "yellow", "orange", "green", "blue", "brown", "black", "red"] as string[]).includes(grade.body[0])) assert.equal(read?.base, stripeHex(grade.body[0]), `${grade.id} base`);
    }
  }
  assert.ok(n > 60, `${n} grades drawn`);
  // The jiu-jitsu coral belt: red and black in panels.
  const coral = beltSystem("bjj-ibjjf-adult")?.grades.find((g) => g.id === "red-black");
  assert.ok(coral !== undefined);
  const drawn = gradeBelt(coral);
  assert.equal(readStyle(drawn.beltStyle)?.alternate, stripeHex("black"));
  assert.match(judogiFrame({ mode: "belt", ...drawn }), /<pattern id="[^"]*alt" /);
});

test("every belt system has its picture, drawn from its data, and the page shows it", () => {
  const page = readFileSync(new URL("../docs/martial-arts.md", import.meta.url), "utf8");
  for (const system of BELT_SYSTEMS) {
    const file = new URL(`../docs/images/belts/${system.id}.webp`, import.meta.url);
    assert.ok(existsSync(file), `${system.id}: run pnpm belt-sheets`);
    const bytes = readFileSync(file);
    assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
    assert.ok(bytes.length > 3000 && bytes.length < 200000, `${system.id}: ${bytes.length} bytes`);
    assert.ok(page.includes(`](images/belts/${system.id}.webp)`), `${system.id} is on the page`);
  }
});
