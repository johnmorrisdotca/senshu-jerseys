// The country's letters on the shoulder: placed in the shoulder stripe, held to the IJF's 25 by 5 cm (C1.5, page 8), stitched or printed flat, and drawn at the turns.
import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, judogiFrame, renderJudogi, type JudogiOptions } from "../src/judogi.ts";
import { layoutMarks, markNotes, readMarks, type MarkLayout } from "../src/judogiMarks.ts";
import { CM, fitsArea } from "../src/judogiPlaces.ts";
import { readNation } from "../src/judogiNation.ts";
import { readStyle } from "../src/judogiStripes.ts";
import { strapWidth } from "../src/judogiStrap.ts";
import { wellFormed } from "./helpers.ts";

const layoutOf = (o: JudogiOptions): MarkLayout => {
  const spec = readMarks(o);
  assert.ok(spec !== undefined);
  return layoutMarks(spec, strapWidth("black", undefined), readStyle(undefined));
};

test("the code is 2 to 4 letters in capitals, and anything else is left out", () => {
  const read = (code: unknown): string | undefined => readNation({ code }, () => "block")?.code;
  assert.equal(read("can"), "CAN");
  assert.equal(read(" usa "), "USA");
  assert.equal(read("JP"), "JP");
  assert.equal(read("Canada"), undefined);
  assert.equal(read("C"), undefined);
  assert.equal(read("C4N"), undefined);
  assert.equal(read(""), undefined);
  assert.equal(read(7), undefined);
  assert.equal(readMarks({ nation: { code: "<svg>" } }), undefined);
  assert.equal(readMarks({ nation: "CAN" }), undefined);
});

test("the letters go on the wearer's shoulder, both when asked, and run down the sleeve", () => {
  const one = layoutOf({ nation: { code: "CAN" } });
  assert.deepEqual(one.placed.map((p) => p.item.id), ["nation:shoulder-left"]);
  assert.equal(one.placed[0]?.face, "jacket-back");
  const both = layoutOf({ nation: { code: "CAN", place: "shoulders", style: "print" } });
  assert.deepEqual(both.placed.map((p) => p.item.id).sort(), ["nation:shoulder-left", "nation:shoulder-right"]);
  for (const p of both.placed) {
    const turn = ((p.box.rot % 360) + 360) % 360;
    assert.ok(Math.abs(turn - 270) < 25, `${p.item.id} reads up the sleeve (turned ${turn})`);
  }
  const down = layoutOf({ nation: { code: "CAN", reading: "down" } });
  assert.ok(Math.abs((down.placed[0]?.box.rot ?? 0) - 90) < 25, "reading down turns it the other way");
});

test("the box stays inside the shoulder's area and inside the stripe's 25 by 5 cm, thread or print, with or without a band", () => {
  for (const style of ["embroidery", "print"] as const) {
    for (const band of [undefined, "#0b3d91"]) {
      for (const [heightCm, lengthCm] of [[undefined, undefined], [9, 60], [2, 8]] as const) {
        const l = layoutOf({ nation: { code: "WWWW", place: "shoulders", style, ...(band === undefined ? {} : { band }), ...(heightCm === undefined ? {} : { heightCm, lengthCm }) } });
        assert.equal(l.skipped.length, 0, `${style} ${band} ${heightCm}`);
        for (const p of l.placed) {
          assert.ok(fitsArea(l.areas[p.item.area]!, p.box), `${style} ${band} ${heightCm}: inside ${p.item.area}`);
          // The box's own sides (before it is turned), in centimetres: the long side along the sleeve.
          const long = Math.max(p.box.w, p.box.h) / CM;
          const short = Math.min(p.box.w, p.box.h) / CM;
          assert.ok(long <= 25 + 1e-6 && short <= 5 + 1e-6, `${style} ${band} ${heightCm}: ${long.toFixed(1)} by ${short.toFixed(1)} cm`);
        }
      }
    }
  }
});

test("the check holds the letters to the stripe: met inside 25 by 5 cm, not met beyond it, and the AJJF names no such place", () => {
  const note = (o: JudogiOptions): { met: boolean; fact: string } | undefined => judogiCheck(o).notes.find((f) => f.id === "nation");
  const ok = note({ nation: { code: "CAN", name: "Canada" } });
  assert.equal(ok?.met, true);
  assert.match(ok?.fact ?? "", /IJF Judogi Rules, 09 03 2022, C1\.5 page 8/);
  assert.match(ok?.fact ?? "", /25 cm by 5 cm/);
  assert.match(ok?.fact ?? "", /Canada/);
  assert.equal(note({ nation: { code: "CAN", heightCm: 6 } })?.met, false);
  assert.equal(note({ nation: { code: "CAN", lengthCm: 30 } })?.met, false);
  assert.equal(note({ nation: { code: "CAN", style: "print", band: "#fff", heightCm: 5, lengthCm: 25 } })?.met, true);
  const ajjf = note({ nation: { code: "CAN" }, rules: "ajjf" });
  assert.equal(ajjf?.met, false);
  assert.match(ajjf?.fact ?? "", /not a place/);
  assert.equal(note({}), undefined);
  const spec = readMarks({ nation: { code: "CAN" } });
  assert.ok(spec !== undefined && markNotes(spec).some((n) => n.id === "nation"));
});

test("a drawing never exceeds the stripe even when more is asked for", () => {
  const huge = layoutOf({ nation: { code: "CAN", heightCm: 20, lengthCm: 80, style: "print", band: "#123456" } }).placed[0]!;
  assert.ok(Math.max(huge.box.w, huge.box.h) <= 25 * CM + 1e-6);
  assert.ok(Math.min(huge.box.w, huge.box.h) <= 5 * CM + 1e-6);
});

test("it takes its shoulder from an embroidered text asked for at the same place, and leaves the other shoulder's alone", () => {
  const l = layoutOf({ nation: { code: "CAN" }, embroidery: [{ place: "shoulder-left", text: "TANAKA" }, { place: "shoulder-right", text: "JUDO" }] });
  assert.deepEqual(l.placed.map((p) => p.item.id).sort(), ["embroidery:shoulder-right", "nation:shoulder-left"]);
  assert.equal(l.skipped.length, 0);
});

test("a printed strip is flat: ink and a ground, no thread, no raised edge or shadow, nothing standing off the cloth", () => {
  const print = renderJudogi({ mode: "jacket", view: "back", belt: "black", nation: { code: "USA", style: "print", ink: "navy", band: "#f5f5f5" } });
  assert.match(print, /data-nation="USA" data-print="flat"/);
  assert.ok(!/data-thick=/.test(print) && !print.includes("stroke-dasharray=\"0.1"), "no patch thickness and no stitch rows");
  const flat = print.slice(print.indexOf('data-print="flat"'));
  const strip = flat.slice(0, flat.indexOf("</g></g>") + 8);
  assert.ok(!/<pattern|filter=|fill-opacity="0\.3"|stroke-opacity/.test(strip), strip.slice(0, 300));
  assert.ok(strip.includes('fill="#f5f5f5"') && strip.includes('stroke="#142348"') || strip.includes('stroke="#14234b"'), "the ground and the ink are the colours asked for");
  const thread = renderJudogi({ mode: "jacket", view: "back", belt: "black", nation: { code: "USA", thread: "navy" } });
  assert.ok(!thread.includes('data-print="flat"') && /<pattern/.test(thread), "thread is the satin look");
});

test("the ink and the thread follow the cloth when none is given: dark on white, light on blue", () => {
  const ink = (colour: "white" | "blue"): string => /data-print="flat"[\s\S]*?stroke="(#[0-9a-f]{6})"/.exec(renderJudogi({ mode: "jacket", view: "back", colour, nation: { code: "USA", style: "print" } }))?.[1] ?? "";
  assert.equal(ink("white"), "#18181c");
  assert.equal(ink("blue"), "#f8f7f4");
  assert.equal(/data-print="flat"[\s\S]*?stroke="(#[0-9a-f]{6})"/.exec(renderJudogi({ mode: "jacket", view: "back", nation: { code: "USA", style: "print", ink: "#ff0000" } }))?.[1], "#ff0000");
});

test("the name is carried as the strip's title and never drawn as letters", () => {
  const svg = renderJudogi({ mode: "jacket", view: "back", nation: { code: "CAN", name: "Canada <b>", style: "print" } });
  assert.ok(svg.includes("<title>Canada &lt;b&gt;</title>"));
  assert.ok(!svg.includes("<b>"));
});

test("every view and turn of a jacket with the letters is well-formed, including the side views on the deeper jacket", () => {
  const sets: JudogiOptions[] = [
    { nation: { code: "CAN", place: "shoulders", thread: "red" } },
    { nation: { code: "USA", place: "shoulders", style: "print" } },
    { colour: "blue", nation: { code: "JPN", style: "print", band: "#ffffff", ink: "#1f3a8a", font: "gothic" } },
  ];
  for (const o of sets) {
    for (const view of ["front", "back"] as const) assert.equal(wellFormed(renderJudogi({ mode: "suit", belt: "black", view, ...o })), null, `${JSON.stringify(o)} ${view}`);
    for (const yaw of [0, 60, 75, 90, 105, 120, 180, 240, 255, 270, 285, 300]) {
      const svg = judogiFrame({ mode: "suit", belt: "black", yaw, ...o });
      assert.equal(wellFormed(svg), null, `${JSON.stringify(o)} yaw ${yaw}`);
      assert.ok(svg.includes(`data-nation`) || /<pattern/.test(svg), `the letters are drawn at yaw ${yaw}`);
    }
  }
});
