// The jiu-jitsu gi: a variant of the judogi drawing with its own cut, its patches in named zones, and the IBJJF's Uniform Manual for Manufactures (section A, edition EN-07) as its
// check. The zones and the sizes of the "ibjjf" preset are held to the manual's authorized locations, and every patch is 3 to 4 mm thick with its edge stitched.

import assert from "node:assert/strict";
import { test } from "node:test";
import { judogiCheck, judogiFrame, renderJudogi } from "../src/judogi.ts";
import { GARMENT_TIES } from "../src/beltTie.ts";
import { BJJ_COLOURS, BJJ_CUT, BJJ_HEM_CM, BJJ_PRESETS, BJJ_ZONES, BJJ_ZONE_IDS, COLLAR_CM, HEM_CLEAR_CM, PANTS_PATCH_LIMIT, patchCorners, placements, presetPatches, readBjj, zoneAt } from "../src/bjjgi.ts";
import { PATCH_ARTS, PATCH_SHAPES, PATCH_TEXT_MAX, readBjjPatch } from "../src/bjjPatch.ts";
import { PATCH_MM, clothOutline } from "../src/judogiPatch.ts";
import { bodyOutline, jacketDesc, sleeveOutline } from "../src/judogiJacket.ts";
import { hipOutline, hipsOf, legOutline } from "../src/judogiPants.ts";
import { corners } from "../src/judogiPlaces.ts";
import type { Pt } from "../src/path.ts";
import { wellFormed } from "./helpers.ts";

const CM = 2.63;

const inside = (p: Pt, poly: readonly Pt[]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [a, b] = [poly[i] as Pt, poly[j] as Pt];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const onCloth = (p: Pt, polys: readonly (readonly Pt[])[]): boolean => polys.some((q) => inside(p, q));

/** The cloth each face has under a patch: the body and both sleeves of the jacket, the hips and both legs of the trousers. */
const cloth = (face: string): (readonly Pt[])[] => {
  const gi = BJJ_CUT;
  if (face.startsWith("jacket")) return [bodyOutline(true, gi), sleeveOutline(-1, gi.sleeve, gi.cuff), sleeveOutline(1, gi.sleeve, gi.cuff)];
  return [hipOutline(hipsOf(false)), legOutline(-1), legOutline(1)];
};


test("no bjj option is a judogi, unchanged, and a karate gi or a dobok asked for as well wins", () => {
  assert.equal(readBjj(undefined), undefined);
  assert.equal(readBjj(false), undefined);
  assert.equal(readBjj("bjj"), undefined);
  const plain = renderJudogi({ mode: "suit", belt: "black" });
  assert.ok(!/jiu-jitsu|data-bjj/i.test(plain));
  assert.equal(renderJudogi({ mode: "suit", belt: "black", bjj: false as never }), plain);
  assert.equal(renderJudogi({ mode: "suit", belt: "black", karate: true, bjj: true }), renderJudogi({ mode: "suit", belt: "black", karate: true }));
  assert.equal(renderJudogi({ mode: "suit", belt: "black", dobok: true, bjj: true }), renderJudogi({ mode: "suit", belt: "black", dobok: true }));
});

test("the cloths are white, royal blue and black; anything else is the judogi's own colour", () => {
  assert.deepEqual([...BJJ_COLOURS], ["white", "blue", "black"]);
  assert.equal(readBjj(true)!.colour, "white");
  assert.equal(readBjj(true, "blue")!.colour, "blue");
  assert.equal(readBjj({ colour: "black" })!.colour, "black");
  assert.equal(readBjj({ colour: "navy" as never })!.colour, "white");
  const drawn = new Set(BJJ_COLOURS.map((colour) => renderJudogi({ mode: "jacket", bjj: { colour } })));
  assert.equal(drawn.size, 3);
  // A judogi's own colour option carries over when the gi names none.
  const same = (svg: string): string => svg.replace(/jg[0-9a-z]+/g, "ID");
  assert.equal(same(renderJudogi({ mode: "jacket", colour: "blue", bjj: true })), same(renderJudogi({ mode: "jacket", bjj: { colour: "blue" } })));
  assert.match(renderJudogi({ bjj: { colour: "black" } }), /Black jiu-jitsu gi/);
  assert.match(renderJudogi({ bjj: true, language: "ja" }), /柔術着/);
});

test("the jacket is cut shorter and fitted, with a thick stitched collar inside the manual's measures", () => {
  const hem = (cut = BJJ_CUT): number => jacketDesc(1, true, cut).y.at(-1)!;
  assert.ok(hem() < 205);
  assert.ok(hem() / CM > 66, "it still goes to the thighs");
  const half = (tied: boolean, cut = BJJ_CUT): number => jacketDesc(1, tied, cut).a[8]!;
  assert.ok(half(true) < half(true, { ...BJJ_CUT, fit: undefined }), "fitted at the waist");
  assert.ok(BJJ_CUT.collar / CM >= COLLAR_CM.thick[0] && BJJ_CUT.collar / CM <= COLLAR_CM.thick[1]);
  assert.ok(BJJ_CUT.lapel / CM >= COLLAR_CM.width[0] && BJJ_CUT.lapel / CM <= COLLAR_CM.width[1]);
  assert.ok(BJJ_CUT.collar > 2.4, "thicker than the judogi's collar");
  assert.ok(judogiCheck({ bjj: true }).notes.find((n) => n.id === "bjj-collar")!.met);
  assert.ok(judogiCheck({ bjj: true }).notes.find((n) => n.id === "bjj-jacket")!.met);
});

test("the zones are named, each on one face, and the legal ones carry the manual's locations", () => {
  assert.equal(new Set(BJJ_ZONE_IDS).size, BJJ_ZONES.length);
  for (const name of ["shoulder-left", "upper-arm-right", "forearm-left", "lapel-left", "lapel-right", "upper-back", "lower-back", "skirt-front", "skirt-back", "thigh-left", "knee-right", "hip-left"]) {
    assert.ok(BJJ_ZONE_IDS.includes(name), name);
  }
  const legal = BJJ_ZONES.filter((z) => z.legal !== undefined).map((z) => z.id);
  for (const name of ["upper-arm-left", "upper-arm-right", "shoulder-left", "shoulder-right", "lapel-left", "lapel-right", "skirt-front", "upper-back", "skirt-back", "thigh-left", "thigh-right", "shin-left", "shin-right", "thigh-back-left", "calf-back-left"]) {
    assert.ok(legal.includes(name), `${name} is an authorized location`);
  }
  for (const name of ["forearm-left", "forearm-right", "lower-back", "knee-left", "knee-right", "hip-left", "hip-right", "arm-back-left"]) {
    assert.ok(!legal.includes(name), `${name} is not`);
  }
  for (const z of BJJ_ZONES) if (z.legal !== undefined) assert.ok(z.legal.w <= z.room.w && z.legal.h <= z.room.h, z.id);
});

test("every zone's patch, at the zone's full room, lies on its cloth and turns with it", () => {
  for (const z of BJJ_ZONES) {
    const at = zoneAt(z.id, BJJ_CUT);
    for (const p of corners({ x: at.x, y: at.y, w: z.room.w * CM, h: z.room.h * CM, rot: at.rot })) {
      assert.ok(onCloth(p, cloth(z.face)), `${z.id}: a corner at ${p[0].toFixed(1)}, ${p[1].toFixed(1)} is on the ${z.face}'s cloth`);
    }
  }
  // The sleeves' patches lean with the sleeve (a mirror image on the other side), the lapel's with the lapel.
  assert.equal(zoneAt("upper-arm-left").rot, -zoneAt("upper-arm-right").rot);
  assert.ok(Math.abs(zoneAt("upper-arm-left").rot) > 10);
  assert.ok(Math.abs(zoneAt("lapel-left").rot) > 10);
  assert.equal(zoneAt("upper-back").rot, 0);
});

test("the left and right of the zones are the wearer's: the picture's right on a front, its left on a back", () => {
  assert.ok(zoneAt("upper-arm-left").x > 100 && zoneAt("upper-arm-right").x < 100);
  assert.ok(zoneAt("thigh-left").x > 100 && zoneAt("thigh-right").x < 100);
  assert.ok(zoneAt("arm-back-left").x < 100 && zoneAt("arm-back-right").x > 100);
  assert.ok(zoneAt("thigh-back-left").x < 100 && zoneAt("thigh-back-right").x > 100);
  assert.ok(zoneAt("lapel-left").x > 100, "the top lapel's chest is the wearer's left");
});

test("the 'ibjjf' preset keeps to the authorized locations, inside their sizes and 15 cm from the cuff", () => {
  const b = readBjj({ patches: "ibjjf" })!;
  assert.ok(b.patches.length >= 12);
  for (const p of placements(b)) {
    assert.ok(p.zone.legal !== undefined, `${p.zone.id} is an authorized location`);
    assert.ok(p.wCm <= p.zone.legal!.w + 1e-9 && p.hCm <= p.zone.legal!.h + 1e-9, `${p.zone.id}: ${p.wCm} by ${p.hCm} cm within ${p.zone.legal!.w} by ${p.zone.legal!.h}`);
    if (p.zone.face.startsWith("pants")) {
      const bottom = Math.max(...patchCorners(p).map((c) => c[1]));
      assert.ok(bottom <= PANTS_PATCH_LIMIT + 0.05, `${p.zone.id} ends ${(bottom / CM).toFixed(1)} cm down, above the hem's 15 cm`);
    }
  }
  const check = judogiCheck({ bjj: { patches: "ibjjf" } });
  assert.ok(check.ok, JSON.stringify(check.notes.filter((n) => !n.met)));
  assert.equal(HEM_CLEAR_CM, 15);
  // Every colour of gi has the same places.
  for (const colour of BJJ_COLOURS) assert.deepEqual(presetPatches("ibjjf", colour).map((p) => p.zone), presetPatches("ibjjf", "white").map((p) => p.zone));
});

test("the 'covered' preset is on every zone, and the check says which are not the manual's", () => {
  const b = readBjj({ patches: "covered" })!;
  assert.equal(b.patches.length, BJJ_ZONES.length);
  assert.deepEqual(b.patches.map((p) => p.zone).sort(), [...BJJ_ZONE_IDS].sort());
  const check = judogiCheck({ bjj: { patches: "covered" } });
  assert.equal(check.ok, false);
  const failed = check.notes.filter((n) => !n.met).map((n) => n.id);
  assert.ok(failed.includes("bjj-patch-forearm-left") && failed.includes("bjj-patch-knee-right") && failed.includes("bjj-patch-hip-left"));
  assert.ok(!failed.includes("bjj-patch-upper-back") || BJJ_ZONES.find((z) => z.id === "upper-back")!.legal === undefined);
  assert.ok(check.notes.every((n) => /IBJJF|Wikipedia/.test(n.fact)));
  // A patch bigger than the authorized location is not allowed, even in an authorized place.
  const big = judogiCheck({ bjj: { patches: [{ zone: "upper-arm-left", widthCm: 8, heightCm: 17 }] } });
  assert.equal(big.notes.find((n) => n.id === "bjj-patch-upper-arm-left")!.met, false);
  const small = judogiCheck({ bjj: { patches: [{ zone: "upper-arm-left", widthCm: 4, heightCm: 12 }] } });
  assert.equal(small.notes.find((n) => n.id === "bjj-patch-upper-arm-left")!.met, true);
});

test("a patch is any of five shapes, with a size, a colour, a border and words or art, one to a zone", () => {
  assert.deepEqual([...PATCH_SHAPES], ["rectangle", "rounded", "circle", "shield", "custom"]);
  assert.ok(PATCH_ARTS.length >= 5);
  const some = readBjj({
    patches: [
      { zone: "upper-back", shape: "shield", colour: "#223344", border: "gold", text: "ACADEMY", art: "star", widthCm: 20, heightCm: 20 },
      { zone: "upper-back", shape: "circle" },
      { zone: "nowhere" },
      { zone: "skirt-back", text: "x".repeat(40) },
      "nothing" as never,
    ],
  })!;
  assert.equal(some.patches.length, 2, "one to a zone, none for an unknown zone");
  assert.equal(some.patches[0]!.shape, "shield");
  assert.equal(some.patches[1]!.text.length, PATCH_TEXT_MAX);
  assert.equal(readBjjPatch({ zone: "upper-back", art: "swoosh" as never }, BJJ_ZONE_IDS)!.art, undefined);
  assert.equal(readBjjPatch({ zone: "upper-back", art: false }, BJJ_ZONE_IDS)!.art, undefined);
  // The room is the most a patch gets.
  const p = placements(readBjj({ patches: [{ zone: "upper-arm-left", widthCm: 40, heightCm: 40 }] })!)[0]!;
  assert.deepEqual([p.wCm, p.hCm], [8, 17]);
  // Every shape draws its own outline, and a custom path is scaled into the patch.
  const shapes = new Set(PATCH_SHAPES.map((s) => clothOutline(s === "custom" ? { path: "M0 0L100 0L50 100Z" } : s, 40, 30)));
  assert.equal(shapes.size, PATCH_SHAPES.length);
  for (const outline of ["M0 0L100 0L100 100Z", "M10 10C40 0 60 0 90 10Q100 50 90 90L10 90Z"]) {
    const svg = renderJudogi({ mode: "jacket", bjj: { patches: [{ zone: "upper-back", shape: "custom", outline }] }, view: "flat-back" });
    assert.equal(wellFormed(svg), null);
    assert.match(svg, /data-bjj-patch="upper-back"/);
  }
  // A custom outline that is not a plain path is left out: the patch is rounded instead.
  assert.equal(readBjjPatch({ zone: "upper-back", shape: "custom", outline: "<script>" }, BJJ_ZONE_IDS)!.shape, "rounded");
  assert.equal(readBjjPatch({ zone: "upper-back", shape: "custom", outline: "M0 0L5 5A3 3 0 0 1 9 9" }, BJJ_ZONE_IDS)!.shape, "rounded");
});

test("every patch is 3 to 4 mm thick with its edge stitched, as John's spec has it", () => {
  const mm = (svg: string): number[] => [...svg.matchAll(/data-thick="([\d.]+)"/g)].map((m) => Number(m[1]));
  const thick = [...mm(renderJudogi({ mode: "pieces", belt: "black", bjj: { patches: "covered" }, view: "flat" })), ...mm(renderJudogi({ mode: "pieces", belt: "black", bjj: { patches: "covered" }, view: "flat-back" }))];
  assert.equal(thick.length, BJJ_ZONES.length, "every patch of the covered look, front and back");
  for (const t of thick) assert.ok(t >= PATCH_MM.min && t <= PATCH_MM.max, `${t} mm`);
  assert.ok(thick.every((t) => t === PATCH_MM.default));
  // Asked for, a thickness is kept to 3 to 4 mm, and the edge is a running or a satin stitch.
  const one = (extra: object, shape: string): string => renderJudogi({ mode: "jacket", view: "flat-back", bjj: { patches: [{ zone: "upper-back", shape, ...extra } as never] } });
  for (const shape of ["rectangle", "rounded", "circle", "shield"]) {
    assert.deepEqual(mm(one({ thicknessMm: 9 }, shape)), [4], shape);
    assert.deepEqual(mm(one({ thicknessMm: 0.5 }, shape)), [3], shape);
    assert.match(one({}, shape), /data-edge="running"/);
    assert.match(one({ edge: "satin" }, shape), /data-edge="satin"/);
  }
  assert.ok(one({ edge: "satin" }, "circle") !== one({ edge: "running" }, "circle"));
});

test("the art is generic: no brand, team or federation names anywhere in what is drawn", () => {
  const svg = renderJudogi({ mode: "suit", belt: "black", bjj: { patches: "covered" } });
  assert.ok(!/ibjjf|gracie|jiu-jitsu federation|adidas|nike|venum|tatami|fuji|hayabusa|atama/i.test(svg.replace(/JIU-JITSU/g, "")));
  for (const a of PATCH_ARTS) assert.ok(!/gracie|brand|logo|crest|team name/i.test(a));
});

test("the trousers have loops on the waistband, reinforced knees, and patches on the back of the legs", () => {
  const front = renderJudogi({ mode: "pants", view: "flat", bjj: true });
  const back = renderJudogi({ mode: "pants", view: "flat-back", bjj: true });
  assert.notEqual(front, renderJudogi({ mode: "pants", view: "flat" }));
  assert.notEqual(back, renderJudogi({ mode: "pants", view: "flat-back" }));
  // `knee: false` leaves this gi's long knee out too.
  assert.ok(renderJudogi({ mode: "pants", view: "flat", bjj: true, knee: false }).length < front.length);
  const legs = renderJudogi({ mode: "pants", view: "flat-back", bjj: { patches: "ibjjf" } });
  for (const id of ["thigh-back-left", "thigh-back-right", "calf-back-left", "calf-back-right"]) assert.match(legs, new RegExp(`data-bjj-patch="${id}"`));
  assert.match(renderJudogi({ mode: "pants", view: "flat", bjj: { patches: "ibjjf" } }), /data-bjj-patch="thigh-left"/);
  assert.ok(!/data-bjj-patch="thigh-left"/.test(renderJudogi({ mode: "pants", view: "flat-back", bjj: { patches: "ibjjf" } })));
});

test("the belt is tied the jiu-jitsu way unless asked, and any belt colour or style goes with it", () => {
  assert.deepEqual(GARMENT_TIES.bjj, { knot: "hanging", tailCm: 25 });
  const own = renderJudogi({ mode: "suit", belt: "blue", bjj: true });
  const told = renderJudogi({ mode: "suit", belt: "blue", bjj: true, beltKnot: "hanging", beltTailCm: 25 });
  assert.equal(own, told);
  assert.notEqual(own, renderJudogi({ mode: "suit", belt: "blue", bjj: true, beltKnot: "spread" }));
  assert.ok(judogiCheck({ bjj: true, beltTailCm: 22 }).notes.every((n) => !/belt-ends/.test(n.id)));
});

test("the check reports the manual's measures and a plain gi passes it", () => {
  const plain = judogiCheck({ bjj: true });
  assert.ok(plain.ok, JSON.stringify(plain.notes.filter((n) => !n.met)));
  assert.deepEqual(plain.notes.map((n) => n.id).slice(0, 6), ["bjj-colour", "bjj-jacket", "bjj-collar", "bjj-sleeve-space", "bjj-fabric", "bjj-reinforcement"]);
  assert.ok(plain.notes.every((n) => /IBJJF Uniform Manual/.test(n.fact)));
  assert.ok(!judogiCheck().notes.some((n) => n.id.startsWith("bjj")));
  assert.ok(judogiCheck({ bjj: { colour: "black", patches: "ibjjf" } }).ok);
});

test("every garment of the gi draws, in each mode and view and every 30 degrees, with nothing undefined or not a number in it", () => {
  for (const bjj of [true, { colour: "blue", patches: "ibjjf" }, { colour: "black", patches: "covered" }, { patches: "covered" }]) {
    for (const mode of ["suit", "jacket", "pants", "belt", "pieces"] as const) {
      for (const view of ["front", "back", "flat", "flat-back"] as const) {
        const svg = renderJudogi({ mode, view, belt: "brown", bjj: bjj as never });
        assert.equal(wellFormed(svg), null, `${mode} ${view}`);
        assert.ok(!/undefined|NaN|Infinity/.test(svg), `${mode} ${view}`);
      }
    }
    for (let yaw = 0; yaw < 360; yaw += 30) {
      const svg = judogiFrame({ mode: "suit", belt: "brown", bjj: bjj as never, yaw });
      assert.equal(wellFormed(svg), null, `yaw ${yaw}`);
      assert.ok(!/undefined|NaN|Infinity/.test(svg), `yaw ${yaw}`);
    }
  }
});

test("each colour and each preset draws its own garment, and the same options draw the same one", () => {
  const drawn = new Set<string>();
  for (const colour of BJJ_COLOURS) for (const patches of BJJ_PRESETS) drawn.add(renderJudogi({ mode: "suit", belt: "black", bjj: { colour, patches } }));
  assert.equal(drawn.size, 9);
  assert.equal(renderJudogi({ bjj: { patches: "covered" } }), renderJudogi({ bjj: { patches: "covered" } }));
  // The ids of one drawing never meet another's on a page.
  const ids = (s: string): string[] => [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!);
  const [a, b] = [ids(renderJudogi({ mode: "jacket", bjj: { patches: "ibjjf" } })), ids(renderJudogi({ mode: "jacket", bjj: { patches: "covered" } }))];
  assert.equal(a.filter((x) => b.includes(x)).length, 0);
  assert.equal(new Set(a).size, a.length, "no id twice in one drawing");
});

test("a drawing with patches weighs what it should", () => {
  const plain = renderJudogi({ mode: "suit", belt: "black", bjj: true }).length;
  const covered = renderJudogi({ mode: "suit", belt: "black", bjj: { patches: "covered" } }).length;
  assert.ok(covered > plain);
  assert.ok(covered - plain < 400_000, `the patches add ${covered - plain} bytes to a turning suit`);
  assert.ok(renderJudogi({ mode: "suit", belt: "black", view: "flat", bjj: { patches: "covered" } }).length < 400_000);
});

test("a jiu-jitsu gi's trousers stop 2 cm above the ankle bone unless a hem is asked for", () => {
  assert.equal(BJJ_HEM_CM, 2);
  const suit = (o: object) => renderJudogi({ mode: "suit", view: "front", bjj: true, ...o });
  assert.equal(suit({}), suit({ hemAboveAnkleCm: 2 }));
  assert.notEqual(suit({}), suit({ hemAboveAnkleCm: 5 }));
  assert.notEqual(suit({}), renderJudogi({ mode: "suit", view: "front" }), "a judo gi keeps its 5 cm");
  assert.equal(renderJudogi({ mode: "suit", view: "front" }), renderJudogi({ mode: "suit", view: "front", hemAboveAnkleCm: 5 }));
});
