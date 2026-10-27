import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS,
  judogiCheck, judogiFrame, judogiHeightCm, renderJudogi,
} from "../src/judogi.ts";
import { beltFace, beltPaint } from "../src/judogiBelt.ts";
import { collarCells } from "../src/judogiCollar.ts";
import { paintOrder, type PaintPiece } from "../src/judogiGl.ts";
import { collarDesc, jacketDesc } from "../src/judogiJacket.ts";
import { pieceCells } from "../src/pieceVolume.ts";
import { strapCells, strapFace, strapWidth } from "../src/judogiStrap.ts";
import { placeCell, sleeveAt, type VolumeDesc } from "../src/volume.ts";
import { pantsDesc } from "../src/judogiPants.ts";
import { wellFormed } from "./helpers.ts";

test("lists are generic and the Japanese belt names stay short", () => {
  assert.deepEqual([...JUDOGI_COLOURS], ["white", "blue"]);
  assert.ok(JUDOGI_MODES.includes("pieces") && JUDOGI_MODES.includes("suit"));
  assert.ok(JUDOGI_VIEWS.includes("flat"));
  assert.ok(JUDOGI_SIZES.includes("170") && JUDOGI_SIZES.includes("3"));
  assert.equal(judogiHeightCm("3"), 170);
  assert.equal(judogiHeightCm("190"), 190);
  for (const belt of JUDOGI_BELTS) {
    if (belt === "none") continue;
    const { en, ja } = JUDOGI_BELT_LABELS[belt];
    assert.ok(en.length >= 3 && en.length <= 12, en);
    assert.ok([...ja].length >= 1 && [...ja].length <= 4, ja);
  }
  assert.ok(!JSON.stringify(JUDOGI_COLOURS).includes("adidas"));
});

test("every colour, mode and view draws well-formed SVG with a yearless title", () => {
  for (const colour of JUDOGI_COLOURS) {
    for (const mode of JUDOGI_MODES) {
      for (const view of JUDOGI_VIEWS) {
        const svg = renderJudogi({ colour, mode, view, belt: "black", size: "170", language: "en" });
        const err = wellFormed(svg);
        assert.equal(err, null, `${colour} ${mode} ${view}: ${err}`);
        assert.match(svg, /^<svg /);
        assert.match(svg, /role="img"/);
        assert.ok(!svg.includes("IJF") && !svg.includes("OFFICIAL"));
      }
    }
  }
});

test("Japanese titles sit on the drawing, and the clock is not read", () => {
  const a = renderJudogi({ colour: "blue", mode: "suit", belt: "white", language: "ja", size: "180" });
  const b = renderJudogi({ colour: "blue", mode: "suit", belt: "white", language: "ja", size: "180" });
  assert.equal(a, b);
  assert.ok(a.includes("柔道着") && a.includes("着用"));
});

test("the IJF size check passes every named size and cites the rules", () => {
  for (const size of JUDOGI_SIZES) {
    const check = judogiCheck({ size });
    assert.equal(check.ok, true, size);
    assert.ok(check.notes.length >= 6);
    assert.ok(check.notes.every((n) => n.fact.includes("IJF")));
  }
});

test("a turning frame is the jersey volume pipeline: each piece turns on its own, and the flat view does not", () => {
  const front = renderJudogi({ mode: "jacket", colour: "white", view: "front" });
  const edge = judogiFrame({ mode: "jacket", colour: "white", yaw: 90 });
  const back = judogiFrame({ mode: "jacket", colour: "white", view: "back" });
  const pieces = renderJudogi({ mode: "pieces" });
  const flat = renderJudogi({ mode: "pieces", view: "flat" });
  for (const svg of [front, edge, back, pieces, flat]) assert.equal(wellFormed(svg), null);
  assert.ok(edge.includes('data-yaw="90"'));
  assert.notEqual(front, edge);
  assert.notEqual(front, back);
  // Jacket, collar, belt and trousers are four pieces, each with its description to turn it in place, and both faces of each marked with the box a page paints it in.
  assert.equal(pieces.match(/data-piece="/g)?.length, 4);
  assert.equal(pieces.match(/data-face="/g)?.length, 8);
  assert.ok(!flat.includes("data-piece=") && !flat.includes('data-vol="'));
});

test("the trousers' legs are two tubes, hanging from a hip that parts into them", () => {
  const d = pantsDesc(1);
  assert.equal(d.sl.length, 2);
  assert.equal(d.hang, true);
  assert.equal(d.lobes?.[0], 0);
  assert.equal(d.lobes?.[d.lobes.length - 1], 1);
  // Each leg starts at the hip's last row, a little under it, and as wide as half of it.
  const bottom = d.y[d.y.length - 1] as number;
  for (const leg of d.sl) {
    const [sx, sy, , , ax, ay] = leg.q as [number, number, number, number, number, number];
    assert.ok(sy <= bottom && ay <= bottom && sy > bottom - 6, "a leg starts just under the hip");
    assert.ok(Math.abs(Math.abs(sx - ax) - ((d.a[d.a.length - 1] as number) - 1.2)) < 2, "a leg is half the hip wide");
  }
  // The sleeves of the jacket hang beside the body, not from it.
  const j = jacketDesc(1);
  assert.equal(j.sl.length, 2);
  assert.equal(j.hang, undefined);
});

test("a piece is shaded smoothly in opaque greys that multiply, never in half-transparent black", () => {
  const svg = judogiFrame({ mode: "jacket", yaw: 30 });
  assert.ok(svg.includes("mix-blend-mode:multiply"));
  assert.ok(svg.includes("<linearGradient") && svg.includes('stop-color="#'));
  // The jersey's shade, half-transparent black, would draw the grid as lines on white cloth.
  assert.ok(!/fill="#000" fill-opacity/.test(svg));
});

test("a belt is a solid strap: two turns 5 mm thick, a knot that stands off them, and ends with a back and two edges", () => {
  const alone = judogiFrame({ mode: "belt", belt: "black" });
  const worn = judogiFrame({ mode: "jacket", belt: "black" });
  assert.equal(wellFormed(alone), null);
  assert.equal(wellFormed(worn), null);
  const descOf = (svg: string): VolumeDesc[] => [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc);
  const ring = descOf(alone)[0]?.strap;
  const tied = descOf(worn).find((d) => d.strap !== undefined)?.strap;
  assert.ok(ring !== undefined && tied !== undefined);
  // IJF: 4-5 mm; a black belt 4.5-5 cm wide, a rank belt 4 cm (2.63 units to the centimetre).
  assert.ok(ring.t / 2.63 >= 0.4 && ring.t / 2.63 <= 0.5);
  assert.ok(ring.w / 2.63 >= 4.5 && ring.w / 2.63 <= 5);
  assert.ok(strapWidth("green") / 2.63 >= 3.9 && strapWidth("green") / 2.63 <= 4.1);
  const cells = strapCells(ring);
  // Seen from the front, the far half of a ring on its own shows its inside; worn, the jacket fills it and there is no inside.
  const inside = cells.filter((c) => c.n[2] > 0.5 && c.p[2]! < 0 && c.p[5]! < 0 && c.p[8]! < 0);
  assert.ok(inside.length > 0 && inside.every((c) => placeCell(c, 0, 14).visible));
  assert.equal(strapCells(tied).filter((c) => c.n[2] > 0.5 && c.p[2]! < 0).length, 0);
  // Turned side on, the hanging ends still show: their edges face the viewer, a strap's thickness wide.
  const sideOn = cells.filter((c) => Math.abs(c.n[0]) > 0.9 && c.p[1]! > ring.y + 30 && placeCell(c, 90, 14).visible);
  assert.ok(sideOn.length > 0);
  // The worn turns' edges behind the jacket stay hidden from the front.
  assert.ok(strapCells(tied).filter((c) => c.also !== undefined && c.p[2]! < -0.6 * tied.b).every((c) => !placeCell(c, 0, 8).visible));
  // The jacket under it carries only the belt's shadow, not a drawing of it: jacket, collar and belt are pieces of their own.
  assert.ok(worn.match(/data-piece="/g)?.length === 3);
});

test("a kohaku belt's panels run along the strap, on its ends as on its turns", () => {
  const p = beltPaint("u", "red-white");
  assert.ok(p !== undefined);
  // The strap's face is one straight length of belt, its panels a pattern along it.
  const face = strapFace(p, 12.5);
  assert.ok(face.body.includes(`fill="${p.fill}"`));
  // Down a hanging end, the strip's length runs with the end: a front cell's drawing goes along x as the end goes down.
  const ends = strapCells({ y: 28, sag: 3, w: 12.5, t: 1.3, a: 66, b: 30, full: 2, side: 0, worn: false }).filter((c) => c.p[1]! > 60 && c.n[2] > 0.9 && c.tex[1] === 0 && c.tex[3] === 0);
  assert.ok(ends.length > 0);
  for (const c of ends) {
    const down = Math.abs(c.p[4]! - c.p[1]!);
    const along = Math.abs(c.tex[2]! - c.tex[0]!);
    assert.ok(down > 3 && Math.abs(along - Math.hypot(c.p[3]! - c.p[0]!, c.p[4]! - c.p[1]!)) < 1.5);
  }
  // Laid flat, each hanging end is drawn along its own length and turned into place.
  assert.equal(beltFace(p, "front").body.match(/rotate\(/g)?.length, 2);
});

test("the collar is a thick band of its own, standing round the back of the neck and lying down the front", () => {
  const jd = jacketDesc(1, true);
  const c = collarDesc(jd);
  // IJF: up to 1 cm thick (2.63 units to the centimetre).
  assert.ok(c.t / 2.63 >= 0.7 && c.t / 2.63 <= 1);
  const cells = collarCells(c);
  assert.ok(cells.length > 200);
  // Behind the neck it stands up above the jacket's top row, and from behind it shows there.
  const neck = cells.filter((cl) => cl.p[2]! < -5 && cl.p[1]! < jd.y[0]!);
  assert.ok(neck.length > 0 && neck.some((cl) => placeCell(cl, 180, 8).visible));
  // Down the front it stands off the jacket, and from behind the body hides it.
  const lapel = cells.filter((cl) => cl.also !== undefined && cl.p[1]! > 60);
  assert.ok(lapel.length > 0 && lapel.every((cl) => !placeCell(cl, 180, 8).visible));
  // Turned side on, its edges show: it has a thickness, not a drawing of one.
  assert.ok(cells.some((cl) => Math.abs(cl.n[0]) > 0.8 && cl.p[1]! > 40 && placeCell(cl, 90, 8).visible));
});

test("a jacket's sleeve is a straight band, as wide under the arm as at the cuff, with a gap to the body below the armpit", () => {
  const jd = jacketDesc(1, true);
  const left = jd.sl[0]!;
  const [sx, sy, px, py] = left.q as [number, number, number, number];
  const width = (f: number): number => {
    const [o, i] = sleeveAt(left.q, left.c, f);
    return Math.hypot(i[0] - o[0], i[1] - o[1]);
  };
  // The outer edge runs straight from the shoulder point to the cuff.
  for (const f of [0.2, 0.5, 0.8]) {
    const [o] = sleeveAt(left.q, left.c, f);
    const t = (o[1] - sy) / (py - sy);
    assert.ok(Math.abs(o[0] - (sx + (px - sx) * t)) < 0.5, `straight at ${f}`);
  }
  const cuff = width(1);
  for (const f of [0.6, 0.8]) assert.ok(Math.abs(width(f) - cuff) / cuff < 0.15, `width at ${f}`);
  // Below the armpit the sleeve's inner edge stands off the body.
  const at = (y: number): number => {
    let j = 0;
    while (j + 2 < jd.y.length && jd.y[j + 1]! < y) j++;
    return jd.a[j]! + ((jd.a[j + 1]! - jd.a[j]!) * (y - jd.y[j]!)) / (jd.y[j + 1]! - jd.y[j]!);
  };
  for (const f of [0.7, 0.9]) {
    const [, i] = sleeveAt(left.q, left.c, f);
    assert.ok(100 - at(i[1]) - i[0] > 2, `gap at ${f}`);
  }
});

test("the pieces worn on the jacket go between its body and the sleeve nearest the eye", () => {
  const svg = judogiFrame({ mode: "jacket", belt: "black", yaw: 60 });
  assert.equal(wellFormed(svg), null);
  assert.ok(svg.indexOf("data-tail-of=") > svg.lastIndexOf("data-piece="));
  // The painters keep the same order: the jacket's body, its collar and belt, then its near sleeve.
  const descs = [...svg.matchAll(/data-piece="([^"]*)"/g)].map((m) => JSON.parse((m[1] as string).replace(/&quot;/g, '"')) as VolumeDesc);
  const pieces = descs.map((desc) => ({ desc, cells: pieceCells(desc) }) as unknown as PaintPiece);
  const jobs = paintOrder(pieces, 60);
  assert.deepEqual(jobs.map((j) => j.n), [0, 1, 2, 0]);
  const near = jobs[3]!.lists.flat().map((i) => pieces[0]!.cells[i]!.g);
  assert.ok(near.length > 0 && (near[0] === 1 || near[0] === 2) && near.every((g) => g === near[0]));
  assert.ok(jobs[0]!.lists.flat().every((i) => pieces[0]!.cells[i]!.g !== near[0]));
});

test("a back patch is drawn on the back of the jacket only, turns with it, and prints no federation mark", async () => {
  const { readPatch, PATCH_FACTS } = await import("../src/judogiPatch.ts");
  for (const style of ["ijf", "zekken"] as const) {
    const plain = renderJudogi({ mode: "jacket", view: "back", belt: "black" });
    const patched = renderJudogi({ mode: "jacket", view: "back", belt: "black", backPatch: { style, name: style === "ijf" ? "M. TANAKA" : "山田", code: "JPN", line: "CLUB" } });
    assert.equal(wellFormed(patched), null);
    assert.notEqual(plain, patched);
    assert.ok(!patched.includes("IJF") && !patched.includes("OFFICIAL"));
    // On the front the jacket is unchanged apart from ids.
    assert.equal(wellFormed(renderJudogi({ mode: "suit", view: "flat-back", backPatch: { style } })), null);
    assert.equal(wellFormed(judogiFrame({ mode: "pieces", yaw: 70, backPatch: { style } })), null);
  }
  assert.equal(readPatch({ style: "none" }), undefined);
  assert.equal(readPatch(undefined), undefined);
  // The rules' own places: 3 cm for the back number, 5 to 10 cm and a 30 to 35 by 25 to 30 cloth for the zekken.
  assert.equal(readPatch({ style: "ijf" })?.topCm, PATCH_FACTS.ijf.top);
  const z = readPatch({ style: "zekken" });
  assert.ok(z && z.widthCm >= 30 && z.widthCm <= 35 && z.heightCm >= 25 && z.heightCm <= 30 && z.topCm >= 5 && z.topCm <= 10);
});

test("the size check reports a patch against its rules, and a bad one fails", () => {
  const ok = judogiCheck({ backPatch: { style: "zekken" } });
  assert.equal(ok.ok, true);
  assert.ok(ok.notes.some((n) => n.id === "zekken-size"));
  const bad = judogiCheck({ backPatch: { style: "zekken", widthCm: 20, topCm: 15 } });
  assert.equal(bad.ok, false);
  assert.equal(judogiCheck({ backPatch: { style: "ijf", topCm: 6 } }).ok, false);
  assert.equal(judogiCheck().notes.every((n) => n.fact.includes("IJF")), true);
});

test("thread presets are the twenty-four named colours with the Japanese beside them", async () => {
  const { THREAD_COLOURS, THREAD_LABELS, THREAD_RGB } = await import("../src/judogiThread.ts");
  assert.equal(THREAD_COLOURS.length, 24);
  for (const id of THREAD_COLOURS) {
    assert.ok(THREAD_LABELS[id].en.length > 2 && [...THREAD_LABELS[id].ja].length >= 1, id);
    assert.equal(THREAD_RGB[id].length, 3);
  }
  assert.equal(new Set(THREAD_COLOURS.map((id) => THREAD_RGB[id].join())).size, 24);
});

test("embroidery, logos and the emblem are drawn only in the rules' places, one to a place, and are reported against the limits", () => {
  const base = { mode: "suit" as const, belt: "black" as const };
  const plain = renderJudogi(base);
  const marked = renderJudogi({
    ...base,
    embroidery: [{ place: "jacket-hem", text: "TANAKA", thread: "gold" }, { place: "belt-end-left", text: "JUDO" }, { place: "pants-left", text: "山田", font: "kaisho" }],
    logos: [{ place: "jacket-hem" }, { place: "pants-leg-left" }, { place: "belt-end-right" }],
    emblem: {},
  });
  assert.equal(wellFormed(marked), null);
  assert.notEqual(plain, marked);
  assert.ok(!marked.includes("IJF") && !marked.includes("OFFICIAL"));
  // A place the rules do not name is ignored, and so is a second text in one place, and a second logo on one garment.
  const odd = renderJudogi({ ...base, embroidery: [{ place: "knee" as never, text: "X" }] });
  assert.equal(odd, plain);
  const one = renderJudogi({ ...base, embroidery: [{ place: "jacket-hem", text: "AAA" }] });
  const two = renderJudogi({ ...base, embroidery: [{ place: "jacket-hem", text: "AAA" }, { place: "jacket-hem", text: "BBB" }] });
  const norm = (svg: string): string => svg.replace(/jg[0-9a-z]+/g, "jg");
  assert.equal(norm(one), norm(two));
  const logos = renderJudogi({ ...base, logos: [{ place: "jacket-hem" }, { place: "pants-leg-left" }] });
  const jacketOnly = renderJudogi({ ...base, logos: [{ place: "jacket-hem" }] });
  assert.notEqual(norm(logos), norm(jacketOnly));
  const logoTwice = renderJudogi({ ...base, logos: [{ place: "jacket-hem" }, { place: "jacket-hem", widthCm: 1, heightCm: 1 }] });
  assert.equal(norm(logoTwice), norm(jacketOnly));
  // Limits: a text over 4 cm or 20 cm, a logo over 30 cm2, an emblem over 100 cm2.
  assert.equal(judogiCheck({ embroidery: [{ place: "belt-end-left", text: "X", heightCm: 5 }] }).ok, false);
  assert.equal(judogiCheck({ embroidery: [{ place: "belt-end-left", text: "X", lengthCm: 25 }] }).ok, false);
  assert.equal(judogiCheck({ embroidery: [{ place: "belt-end-left", text: "X" }] }).ok, true);
  assert.equal(judogiCheck({ logos: [{ place: "jacket-hem", widthCm: 7, heightCm: 5 }] }).ok, false);
  assert.equal(judogiCheck({ logos: [{ place: "belt-end-left", widthCm: 4, heightCm: 3 }] }).ok, false);
  assert.equal(judogiCheck({ emblem: { widthCm: 12, heightCm: 10 } }).ok, false);
  assert.equal(judogiCheck({ emblem: {} }).ok, true);
  // The two rule sets differ: the left chest is an AJJF place for text, not an IJF one; the maker's mark is 20 cm2 there, 30 cm2 here.
  assert.equal(judogiCheck({ embroidery: [{ place: "jacket-chest", text: "X" }] }).ok, false);
  assert.equal(judogiCheck({ rules: "ajjf", embroidery: [{ place: "jacket-chest", text: "X" }] }).ok, true);
  assert.equal(judogiCheck({ logos: [{ place: "jacket-hem", widthCm: 5.5, heightCm: 5 }] }).ok, true);
  assert.equal(judogiCheck({ rules: "ajjf", logos: [{ place: "jacket-hem", widthCm: 5.5, heightCm: 5 }] }).ok, false);
});

test("an artwork is an image, a font's CSS must be data-only, and outlines are paths only", () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="red"/></svg>';
  const a = renderJudogi({ emblem: { svg } });
  assert.ok(a.includes("<image") && a.includes("data:image/svg+xml"));
  assert.ok(!a.includes("<rect width=\"30\""));
  const evil = renderJudogi({ emblem: { svg: "<svg viewBox='0 0 1 1'><script>alert(1)</script></svg>" } });
  assert.ok(!evil.includes("<script"));
  const bad = renderJudogi({ embroidery: [{ place: "jacket-hem", text: "A", font: { family: "X", css: "@font-face{src:url(https://example.com/f.woff2)}" } }] });
  assert.ok(!bad.includes("example.com") && !bad.includes("<style"));
  const good = renderJudogi({ embroidery: [{ place: "jacket-hem", text: "A", font: { family: "Yuji Syuku", css: "@font-face{font-family:'Yuji Syuku';src:url(data:font/woff2;base64,AAAA)}" } }] });
  assert.ok(good.includes("<style>") && good.includes("Yuji Syuku"));
  const path = renderJudogi({ embroidery: [{ place: "jacket-hem", path: { d: "M0 0L10 0L10 10Z", width: 10, height: 10 } }] });
  assert.equal(wellFormed(path), null);
  const nopath = renderJudogi({ embroidery: [{ place: "jacket-hem", path: { d: "M0 0<script>", width: 10, height: 10 } }] });
  assert.ok(!nopath.includes("<script"));
});
