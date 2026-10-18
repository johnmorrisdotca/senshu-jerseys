import assert from "node:assert/strict";
import { test } from "node:test";

import { attributesFromOptions, chestFromText, optionsFromAttributes } from "../src/attrs.ts";
import { CUT_IDS, CUTS } from "../src/cuts.ts";
import { chestLayout, shapeOf } from "../src/jersey.ts";
import { resolve } from "../src/options.ts";
import { renderJersey } from "../src/render.ts";
import { jerseyFrame } from "../src/turn-entry.ts";
import { cellsOf, placeCell, volumeDesc } from "../src/volume.ts";
import { wellFormed } from "./helpers.ts";

const BASE = { colors: ["#c8102e", "#ffffff", "#0a3161"], number: 19, name: "Morris" };
const layout = (o: object) => {
  const r = resolve({ ...BASE, ...o });
  return chestLayout(r, shapeOf(r), r.crest !== undefined);
};

test("the old patch is where it was, and a C asked for through chestBadges is in the same place", () => {
  for (const cut of CUT_IDS) {
    const spot = CUTS[cut].patch;
    assert.ok(renderJersey({ ...BASE, cut, patch: "C", patchStyle: "disc" }).includes(`cx="${spot.x}" cy="${spot.y}"`), `${cut}: the circle of old, when it is asked for`);
    assert.ok(!renderJersey({ ...BASE, cut, patch: "C" }).includes(`cx="${spot.x}" cy="${spot.y}"`), `${cut}: the letter alone is the default`);
    const next = layout({ cut, chestBadges: { kind: "C" } })[0];
    assert.equal(next?.x, spot.x, `${cut}: the cut's own side and place`);
    assert.equal(next?.y, spot.y);
    assert.equal(next?.clear, true);
  }
});

test("the chest badges are read, never thrown at: a kind, a side, a size, colours, and at most four of them", () => {
  const r = resolve({ ...BASE, cut: "hockey", chestBadges: [{ kind: "patch", side: "right", text: "ab1x", shape: "shield", size: 99, dx: -99, dy: 5, fill: "#fff", ink: "nope" }, { kind: "bogus" as never, side: "up" as never }, null as never, "x" as never, { kind: "flag", flag: { stripes: ["#f00", "#fff", "no", "#00f"], direction: "vertical", disc: "#f00" } }, { kind: "A" }, { kind: "A" }] });
  assert.equal(r.chest?.length, 4, "the objects are read, four of them");
  const [patch, bogus, flag] = r.chest ?? [];
  assert.deepEqual([patch?.kind, patch?.side, patch?.text, patch?.shape, patch?.size, patch?.dx, patch?.dy], ["patch", "right", "AB1", "shield", 40, -40, 5]);
  assert.deepEqual(patch?.fill, [255, 255, 255]);
  assert.equal(patch?.ink, undefined, "a colour that is not one is the default");
  assert.equal(bogus?.kind, "C", "a kind that is not one is the first");
  assert.equal(bogus?.side, undefined);
  assert.equal(flag?.flag?.stripes.length, 3, "the stripes that are colours");
  assert.equal(flag?.flag?.vertical, true);
  assert.equal(resolve({ ...BASE, chestBadges: [] as never }).chest, undefined);
  assert.equal(resolve({ ...BASE, chestBadges: 7 as never }).chest, undefined);
  assert.equal(resolve({ ...BASE, chestBadges: { kind: "flag", flag: { stripes: ["#fff"] } } }).chest?.[0]?.flag, undefined, "one colour is no flag");
});

test("a badge is on the wearer's left or right whatever the cut, the picture's right being the wearer's left", () => {
  for (const cut of CUT_IDS) {
    const left = layout({ cut, chestBadges: { kind: "C", side: "left" } })[0];
    const right = layout({ cut, chestBadges: { kind: "A", side: "right" } })[0];
    assert.ok((left?.x ?? 0) > 100 && (right?.x ?? 200) < 100, cut);
    assert.ok(Math.abs((left?.x ?? 0) - 100 - (100 - (right?.x ?? 0))) < 0.01, `${cut}: the same distance from the middle`);
  }
  assert.ok((layout({ cut: "hockey", chestBadges: { dx: 10 } })[0]?.x ?? 0) > 134, "an offset moves it across");
  assert.ok((layout({ cut: "hockey", chestBadges: { side: "right", dx: 10 } })[0]?.x ?? 0) > 66, "and the same offset moves a right one the same way");
});

test("no badge lands on the collar, the crest, the chest text or number, the pocket, the spot, the old patch or another badge", () => {
  const rects = (l: ReturnType<typeof layout>) => l.map((b) => [b.x - b.w / 2, b.y - b.h / 2, b.x + b.w / 2, b.y + b.h / 2] as const);
  const meet = (a: readonly number[], b: readonly number[]) => a[0]! < b[2]! && b[0]! < a[2]! && a[1]! < b[3]! && b[1]! < a[3]!;
  const crest = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle cx='5' cy='5' r='4'/></svg>";
  const box = (s: { x: number; y: number; w: number; h: number }) => [s.x - s.w / 2, s.y - s.h / 2, s.x + s.w / 2, s.y + s.h / 2] as const;
  for (const cut of CUT_IDS) {
    const spec = CUTS[cut];
    for (const extra of [{}, { frontText: "CANADA" }, { frontNumber: true }, { crest }, { pocket: true }, { badge: "round" }, { patch: "C" }, { frontText: "HOME", frontNumber: true, crest }]) {
      const l = layout({ cut, ...extra, chestBadges: [{ kind: "C" }, { kind: "A", side: "right" }, { kind: "flag", flag: { stripes: ["#f00", "#fff"] } }] });
      const r = rects(l);
      r.forEach((a, i) => r.slice(i + 1).forEach((b) => assert.ok(!meet(a, b), `${cut} ${JSON.stringify(Object.keys(extra))}: two badges meet`)));
      for (const [i, a] of r.entries()) {
        if (l[i]?.clear !== true) continue;
        if ("frontText" in extra && !("crest" in extra)) assert.ok(!meet(a, box(spec.text)), `${cut}: the chest text`);
        if ("frontNumber" in extra) assert.ok(!meet(a, box(spec.number.front)), `${cut}: the number`);
        if ("crest" in extra) assert.ok(!meet(a, box(spec.crest)), `${cut}: the crest`);
        if ("patch" in extra) assert.ok(!meet(a, box(spec.patch)), `${cut}: the old patch`);
      }
    }
  }
  // Nothing in the way: a badge with `nudge: false` stays exactly where it is put, over the collar if need be.
  assert.equal(layout({ cut: "hockey", frontText: "HOME", chestBadges: { dx: -30, nudge: false } })[0]?.y, CUTS.hockey.patch.y);
  assert.ok((layout({ cut: "hockey", frontText: "HOME", chestBadges: { dx: -30, dy: 24 } })[0]?.y ?? 0) > CUTS.hockey.patch.y + 24 - 1, "while by default it slides down off the text");
});

test("a badge is drawn flat and on the garment alike: front only, a flag from stripes, a plain patch, the caller's own art as an image", () => {
  const options = { ...BASE, cut: "hockey" as const, chestBadges: [{ kind: "C" as const }, { kind: "flag" as const, side: "right" as const, flag: { stripes: ["#d52b1e", "#fff", "#d52b1e"], direction: "vertical" as const } }, { kind: "patch" as const, text: "JPN", shape: "shield" as const, art: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'><rect width='4' height='4' fill='red'/></svg>" }] };
  const front = renderJersey({ ...options, view: "front" });
  const back = renderJersey({ ...options, view: "back" });
  assert.match(front, /<clipPath id="\w+b1">/, "the flag");
  assert.match(front, /<image href="data:image\/svg\+xml/, "the art");
  assert.doesNotMatch(back, /clipPath id="\w+b1"|<image href="data:image\/svg/, "no badge on the back");
  assert.equal(wellFormed(front), null);
  for (const look of ["flat", "line"] as const) assert.equal(wellFormed(renderJersey({ ...options, look })), null, look);
  assert.equal(wellFormed(renderJersey({ ...options, view: "both" })), null);
  assert.match(renderJersey({ ...options, look: "line" }), /currentColor/);
});

test("on the turning garment a badge stays on the chest: it shows from the front, goes with the chest as it turns away and is never on the back", () => {
  const options = { ...BASE, cut: "hockey" as const, chestBadges: { kind: "C" as const } };
  const svg = jerseyFrame({ ...options, volume: true, yaw: 0 });
  const front = /<g id="\w+F">([\s\S]*?)<g id="\w+B">/.exec(svg)?.[1] ?? "";
  const back = /<g id="\w+B">([\s\S]*?)<\/g><path id=/.exec(svg)?.[1] ?? "";
  assert.match(front, /translate\(134 78\)/);
  assert.doesNotMatch(back, /translate\(134 78\)/);
  // The cell of the front that holds the badge's place (the drawing's 134, 78): in sight face on, out of sight from behind and from the wearer's right, back in sight from the wearer's left.
  const desc = volumeDesc(resolve(options));
  const holds = (c: { tex: number[] }): boolean => {
    const xs = [c.tex[0]!, c.tex[2]!, c.tex[4]!];
    const ys = [c.tex[1]!, c.tex[3]!, c.tex[5]!];
    return Math.min(...xs) <= 134 && Math.max(...xs) >= 134 && Math.min(...ys) <= 78 && Math.max(...ys) >= 78;
  };
  const here = cellsOf(desc).find((c) => !c.back && c.g === 0 && c.src === undefined && holds(c));
  assert.ok(here, "a cell holds the badge");
  const seen = (yaw: number) => placeCell(here, yaw, desc.pitch).visible;
  assert.deepEqual([0, 30, 60].map(seen), [true, true, true]);
  assert.deepEqual([90, 135, 180, 225].map(seen), [false, false, false, false], "the chest turned away");
  assert.deepEqual([-30, -90].map(seen), [true, true], "the wearer's left breast comes round to the viewer's right");
  // No cell of the back shows the front's badge: the front's mesh is out of sight from behind (but a sliver of the top).
  const frontCells = cellsOf(desc).filter((c) => !c.back && c.g === 0);
  assert.ok(frontCells.filter((c) => placeCell(c, 180, desc.pitch).visible).length <= frontCells.length * 0.08);
});

test("the element's word: chest-badges says the same badges, and what the address says is what was drawn", () => {
  const text = "kind:C;side:left|kind:flag;side:right;flag:d52b1e+ffffff+d52b1e;flag-direction:vertical|kind:patch;text:JPN;shape:shield;fill:ffffff;dx:2;nudge:false";
  const read = optionsFromAttributes((name) => (name === "chest-badges" ? text : null));
  assert.equal(Array.isArray(read.chestBadges) ? read.chestBadges.length : 0, 3);
  assert.deepEqual(chestFromText("size:big;kind:A;bogus:1;fill:zzz|;;|side:right"), [{ kind: "A" }, { side: "right" }]);
  const q = attributesFromOptions(read, false);
  assert.ok(q["chest-badges"]?.includes("flag:d52b1e+ffffff+d52b1e") && q["chest-badges"].includes("nudge:false"));
  const again = optionsFromAttributes((name) => q[name] ?? null);
  assert.deepEqual(resolve({ ...BASE, ...again }).chest, resolve({ ...BASE, ...read }).chest);
});

test("what comes from outside cannot reach the markup", () => {
  const hostile = { kind: "patch" as const, text: '"><script>x</script>', fill: '"><b>', art: '<svg xmlns="http://www.w3.org/2000/svg" onload="x"><script>alert(1)</script></svg>', flag: { stripes: ['"><i>', "<u>"] } };
  for (const svg of [renderJersey({ ...BASE, cut: "hockey", chestBadges: [hostile, { ...hostile, kind: "flag" as const }] }), jerseyFrame({ ...BASE, cut: "hockey", volume: true, yaw: 20, chestBadges: [hostile, { ...hostile, kind: "flag" as const }] })]) {
    assert.doesNotMatch(svg, /<script|<b>|<i>|<u>/);
    assert.doesNotMatch(svg, /\sonload=/);
    assert.equal(wellFormed(svg), null);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
});

test("a captain's C and A are bare block letters with a thick outline, no disc, and the disc is a style to ask for", () => {
  for (const cut of CUT_IDS) {
    for (const kind of ["C", "A"] as const) {
      const letter = renderJersey({ ...BASE, cut, chestBadges: { kind } });
      const disc = renderJersey({ ...BASE, cut, chestBadges: { kind, style: "disc" } });
      assert.equal(wellFormed(letter), null);
      assert.ok(!/<path d="M[^"]*a[\d.]+ [\d.]+ 0 1 0 [^"]*" fill="#fff"/.test(letter), `${cut} ${kind}: no round patch`);
      assert.ok(disc.includes("a10 10 0 1 0") || disc.includes("0 1 0"), `${cut} ${kind}: the disc is still there when asked for`);
      assert.ok(letter.length !== disc.length);
    }
  }
  const svg = renderJersey({ ...BASE, cut: "hockey", colors: ["#111111", "#d4a017", "#ffffff"], chestBadges: { kind: "C" } });
  assert.match(svg, /stroke="#ffffff"[^>]*stroke-width="[\d.]+"\/><path[^>]*stroke="#d4a017"/, "a gold letter inside a white outline on a black jersey");
  assert.equal(resolve({ ...BASE, chestBadges: { kind: "C", style: "<x>" as never } }).chest?.[0]?.style, "letter", "anything else is the letter");
  assert.equal(resolve({ ...BASE, patch: "C", patchStyle: "bogus" as never }).patchStyle, undefined);
  assert.match(renderJersey({ ...BASE, cut: "hockey", patch: "C", patchStyle: "disc" }), /<circle/);
  assert.doesNotMatch(renderJersey({ ...BASE, cut: "hockey", patch: "C" }), /<circle cx="1[34]\d"/);
  assert.equal(chestFromText("kind:C;style:disc")[0]?.style, "disc");
  assert.equal(optionsFromAttributes((n) => (n === "patch-style" ? "disc" : null)).patchStyle, "disc");
  assert.match(renderJersey({ ...BASE, cut: "hockey", look: "line", chestBadges: { kind: "C" } }), /currentColor/);
  for (const yaw of [0, 60, 90]) assert.equal(wellFormed(jerseyFrame({ ...BASE, cut: "hockey", volume: true, chestBadges: { kind: "A", side: "right" }, yaw })), null);
});
