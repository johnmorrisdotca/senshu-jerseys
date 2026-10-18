import assert from "node:assert/strict";
import { test } from "node:test";

import { CUT_IDS, CUTS } from "../src/cuts.ts";
import { optionsFromAttributes, attributesFromOptions, detailFromText } from "../src/attrs.ts";
import { renderJersey } from "../src/render.ts";
import { resolve } from "../src/options.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { cellsOf, placeCell, volumeDesc, volumeDetails } from "../src/volume.ts";
import { wellFormed } from "./helpers.ts";

const BASE = { cut: "hockey" as const, colors: ["#c8102e", "#ffffff", "#0a3161"], number: 77, name: "Morris" };
const EIGHT = [0, 45, 90, 135, 180, 225, 270, 315];

/** Where the numbers are on a flat drawing: the `translate` of each group that carries one, by the x of the middle of the shirt. */
const marks = (svg: string): number[] => [...svg.matchAll(/<g transform="translate\(([\d.]+) ([\d.]+)\) rotate\(/g)].map((m) => Number(m[1]));

test("sleeveNumbers: true is both sleeves with the jersey's number, as before; the new words pick a side", () => {
  const sides = (sleeveNumbers: unknown) => resolve({ ...BASE, sleeveNumbers } as never).sleeveSides;
  assert.deepEqual(Object.keys(sides(true) ?? {}).sort(), ["left", "right"]);
  assert.deepEqual(Object.keys(sides("both") ?? {}).sort(), ["left", "right"]);
  assert.deepEqual(Object.keys(sides("left") ?? {}), ["left"]);
  assert.deepEqual(Object.keys(sides("right") ?? {}), ["right"]);
  for (const nothing of [false, undefined, "", "up", 3, null, {}]) assert.equal(sides(nothing), undefined, String(nothing));
  assert.equal(sides(true)?.left?.number, "77");
  assert.equal(resolve({ cut: "hockey", sleeveNumbers: true }).sleeveSides, undefined, "no number, none to draw");
  assert.equal(resolve({ ...BASE, sleeveNumbers: true, sleeve: "none" }).sleeveSides, undefined, "a tank has no sleeve");
});

test("each sleeve is placed on its own, with a size, a place, colours and a patch, and anything wrong is the default", () => {
  const r = resolve({ ...BASE, sleeveNumbers: true, sleeveLeft: { number: 66, size: 99, at: -4, around: 500, fill: "#ffd100", outline: "#f00", patch: "shield", patchText: "ab1x", patchFill: "nonsense" }, sleeveRight: { number: false, patch: "round" } });
  const left = r.sleeveSides?.left;
  assert.equal(left?.number, "66");
  assert.equal(left?.size, 32, "clamped to the largest");
  assert.equal(left?.at, 8, "clamped to the least");
  assert.equal(left?.around, 60);
  assert.deepEqual(left?.fill, [255, 209, 0]);
  assert.deepEqual(left?.outline, [255, 0, 0]);
  assert.equal(left?.patch?.shape, "shield");
  assert.equal(left?.patch?.text, "AB1");
  assert.equal(left?.patch?.fill, undefined, "a colour that is not one is the cloth's own");
  assert.equal(r.sleeveSides?.right?.number, undefined, "false: no number on this sleeve");
  assert.equal(r.sleeveSides?.right?.patch?.shape, "round");
  const plain = resolve({ ...BASE, sleeveLeft: { size: "big", at: NaN, around: "x", patch: "heart", number: "12345" } as never }).sleeveSides?.left;
  assert.equal(plain?.number, "12", "two digits at most");
  assert.equal(plain?.size, CUTS.hockey.tv.h);
  assert.equal(plain?.at, Math.round(CUTS.hockey.tv.t * 100));
  assert.equal(plain?.patch, undefined);
});

test("the wearer's left is the picture's right in the front view and its left in the back view", () => {
  const front = (side: "left" | "right") => marks(renderJersey({ ...BASE, sleeveNumbers: side, view: "front" }));
  const back = (side: "left" | "right") => marks(renderJersey({ ...BASE, sleeveNumbers: side, view: "back" }));
  assert.equal(front("left").length, 1);
  assert.ok((front("left")[0] as number) > 100 && (front("right")[0] as number) < 100, "front: left on the right of the picture");
  assert.ok((back("left")[0] as number) < 100 && (back("right")[0] as number) > 100, "back: left on the left of the picture");
  assert.equal(marks(renderJersey({ ...BASE, sleeveNumbers: true })).length, 2);
  assert.equal(marks(renderJersey({ ...BASE })).length, 0);
});

test("a flat shirt keeps what it had: the same number where the cut puts it, and a patch and a place are new words only", () => {
  const was = renderJersey({ ...BASE, sleeveNumbers: true });
  assert.equal(was, renderJersey({ ...BASE, sleeveNumbers: "both" }));
  assert.notEqual(was, renderJersey({ ...BASE, sleeveNumbers: true, sleeveLeft: { at: 70 } }));
  assert.match(renderJersey({ ...BASE, sleeveLeft: { patch: "square", patchText: "A" } }), /rotate\(/);
});

test("on the garment the numbers are not in the front and back drawings but on the arms, and each sleeve's own shows from its own side", () => {
  const svg = (o: object, yaw = 0) => jerseyFrame({ ...BASE, volume: true, yaw, ...o });
  const withNumbers = svg({ sleeveNumbers: true });
  const without = svg({});
  const body = (s: string): string => (/<g id="\w+F">[\s\S]*?<g id="\w+B">/.exec(s)?.[0] ?? "").replace(/sj\w+/g, "X");
  assert.equal(body(withNumbers), body(without), "the front's drawing has no sleeve number in it");
  assert.match(withNumbers, /id="\w+D0"/);
  assert.doesNotMatch(without, /id="\w+D0"/);

  const desc = volumeDesc(resolve({ ...BASE, sleeveNumbers: true }));
  const cells = cellsOf(desc);
  const shownBy = (yaw: number): Set<number> => new Set(cells.filter((c) => c.src !== undefined && placeCell(c, yaw, desc.pitch).visible).map((c) => c.g));
  assert.deepEqual([...shownBy(90)], [1], "90: the wearer's right arm, the picture's left");
  assert.deepEqual([...shownBy(270)], [2], "270: the wearer's left arm");
  assert.deepEqual([...shownBy(-90)], [2]);
  assert.deepEqual([...shownBy(45)], [1], "three-quarter: the near arm's, whose outer face turns toward the viewer");
  // From behind the arm's outer edge turns a sliver of the number toward the viewer, as it does on a real sleeve, and no more: the back number is the one that shows.
  const detailCells = cells.filter((c) => c.src !== undefined);
  assert.ok(detailCells.filter((c) => placeCell(c, 180, desc.pitch).visible).length <= detailCells.length * 0.55, "from behind only the edge of a sleeve number shows");
  assert.ok(detailCells.filter((c) => placeCell(c, 90, desc.pitch).visible).length >= detailCells.length * 0.4, "from the side, the near arm's whole number");
  // Round the back of the arm (-120) the number shows from behind and not from the front.
  const behind = volumeDesc(resolve({ ...BASE, sleeveNumbers: true, sleeveLeft: { around: -120 }, sleeveRight: { around: -120 } }));
  const bc = cellsOf(behind);
  const behindCells = bc.filter((c) => c.src !== undefined);
  assert.ok(behindCells.filter((c) => placeCell(c, 180, behind.pitch).visible).length >= behindCells.length * 0.6);
  assert.ok(behindCells.filter((c) => placeCell(c, 0, behind.pitch).visible).length <= behindCells.length * 0.3);
});

test("no digit is mirrored or upside down: every cell of the garment, drawing or number, is mapped with its drawing's sense and its top up", () => {
  for (const cut of CUT_IDS) {
    const r = resolve({ ...BASE, cut, sleeveNumbers: true, sleeveLeft: { patch: "shield", patchText: "C" }, sleeveRight: { patch: "round" } });
    const desc = volumeDesc(r);
    for (const yaw of [...EIGHT, 20, 160, 200, 340]) {
      for (const c of cellsOf(desc)) {
        const pl = placeCell(c, yaw, desc.pitch);
        if (!pl.visible) continue;
        const m = (/matrix\(([^)]+)\)/.exec(pl.matrix)?.[1] ?? "").split(" ").map(Number) as [number, number, number, number, number, number];
        const det = m[0] * m[3] - m[1] * m[2];
        assert.ok(det > -0.2, `${cut} ${yaw} ${c.g}${c.src === undefined ? "" : ` detail ${c.src}`}: a mirror (${det})`);
        if (c.src !== undefined) assert.ok(m[3] > -0.2, `${cut} ${yaw} detail ${c.src}: upside down`);
      }
    }
  }
});

test("the defaults do not collide: on every cut, sleeve and look the number and the patch lie on different parts of the arm", () => {
  for (const cut of CUT_IDS) {
    for (const sleeve of Object.keys(CUTS[cut].sleeves)) {
      const side = resolve({ cut, sleeve: sleeve as never, number: 23, sleeveNumbers: true, sleeveLeft: { patch: "round" } }).sleeveSides?.left;
      assert.ok(side?.number !== undefined && side.patch !== undefined, `${cut} ${sleeve}`);
      const spec = CUTS[cut].sleeves[sleeve as "long"] as { l: number };
      const half = (h: number): number => h / 2 / spec.l;
      const number = side.at / 100;
      const patch = side.patch.at / 100;
      assert.ok(Math.abs(number - patch) > half(side.size) + half(side.patch.size), `${cut} ${sleeve}: ${number} and ${patch} overlap`);
    }
  }
});

test("the element's words: sleeve-numbers takes both, left or right, and the sleeve-left and sleeve-right words say the rest", () => {
  const read = (m: Record<string, string>) => optionsFromAttributes((name) => m[name] ?? null);
  assert.equal(read({ "sleeve-numbers": "left" }).sleeveNumbers, "left");
  assert.equal(read({ "sleeve-numbers": "true" }).sleeveNumbers, true);
  assert.equal(read({ "sleeve-numbers": "false" }).sleeveNumbers, false);
  assert.deepEqual(read({ "sleeve-left": "number:77;size:20;at:30;around:-60;fill:ffd100;patch:shield;patch-text:C;bogus:1;size2:3" }).sleeveLeft, { number: "77", size: 20, at: 30, around: -60, fill: "#ffd100", patch: "shield", patchText: "C" });
  assert.deepEqual(detailFromText("size:big;at:12;fill:zzz;number:false"), { at: 12, number: false });
  const o = { ...BASE, sleeveNumbers: "right" as const, sleeveLeft: { number: 66, around: -80, fill: "#ffd100" }, sleeveRight: { patch: "round" as const, patchText: "A" } };
  const q = attributesFromOptions(o, false);
  assert.equal(q["sleeve-numbers"], "right");
  assert.equal(q["sleeve-left"], "number:66;around:-80;fill:ffd100");
  const back = read(Object.fromEntries(Object.entries(q)));
  assert.deepEqual(resolve(back).sleeveSides, resolve(o).sleeveSides, "what the address says is what was drawn");
});

test("what comes from outside cannot reach the markup", () => {
  const hostile = { number: '"><script>x</script>', fill: '"><b>', outline: "javascript:1", patch: "round", patchText: '"><i onload=1>', patchFill: "<u>" } as never;
  for (const svg of [renderJersey({ ...BASE, sleeveNumbers: true, sleeveLeft: hostile, sleeveRight: hostile }), jerseyFrame({ ...BASE, volume: true, yaw: 90, sleeveNumbers: true, sleeveLeft: hostile, sleeveRight: hostile })]) {
    assert.doesNotMatch(svg, /<script|<b>|<i |<u>|javascript:/);
    assert.equal(wellFormed(svg), null);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
  assert.deepEqual(volumeDetails(resolve({ ...BASE })), [], "nothing asked, nothing drawn");
});

test("seen straight from the side, a sleeve number is centred on the arm's outer face and stays on the arm as it turns", () => {
  for (const cut of ["hockey", "football", "baseball", "soccer"] as const) {
    const r = resolve({ cut, number: 23, sleeve: cut === "hockey" ? "long" : "short", sleeveNumbers: true } as never);
    const desc = volumeDesc(r);
    const cells = cellsOf(desc);
    for (const [yaw, g] of [[90, 1], [270, 2]] as const) {
      const mid = (list: typeof cells): number => {
        const xs = list.flatMap((c) => [0, 1, 2].map((k) => (c.p[3 * k] as number) * Math.cos((yaw * Math.PI) / 180) + (c.p[3 * k + 2] as number) * Math.sin((yaw * Math.PI) / 180)));
        return (Math.min(...xs) + Math.max(...xs)) / 2;
      };
      const arm = cells.filter((c) => c.g === g && c.src === undefined && placeCell(c, yaw, desc.pitch).visible);
      const num = cells.filter((c) => c.g === g && c.src !== undefined && placeCell(c, yaw, desc.pitch).visible);
      assert.ok(num.length > 0, `${cut} ${yaw}: the number shows`);
      assert.ok(Math.abs(mid(num) - mid(arm)) < 1.5, `${cut} ${yaw}: number at ${mid(num).toFixed(1)}, arm at ${mid(arm).toFixed(1)}`);
    }
  }
});
