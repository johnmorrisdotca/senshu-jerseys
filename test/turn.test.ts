import assert from "node:assert/strict";
import { test } from "node:test";

import { JERSEY_WIDTH } from "../src/jersey.ts";
import { SENSHU_ATTRIBUTES } from "../src/element-entry.ts";
import { applyTurn, bindTurn, jerseyFrame, normalYaw, turnDirection, turnState } from "../src/turn-entry.ts";
import { wellFormed } from "./helpers.ts";

const YAWS = [-720, -270, -180, -135, -90, -45, 0, 30, 45, 89.9, 90, 90.1, 135, 180, 270, 360, 1000];

test("every angle draws a finite, well-formed frame, in every look", () => {
  for (const look of ["cloth", "flat", "line"] as const) {
    for (const yaw of YAWS) {
      const svg = jerseyFrame({ cut: "hockey", number: 9, name: "Gray", look, yaw, colors: ["#af1e2d", "#fff", "#192168"] });
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${look} ${yaw}`);
      assert.equal(wellFormed(svg), null, `${look} ${yaw}`);
    }
  }
});

test("the front shows from -90 to 90, the back from 90 to 270, and at 90 degrees neither: the edge", () => {
  const s = (yaw: number) => turnState(yaw);
  assert.equal(s(0).front.visible, true);
  assert.equal(s(0).back.visible, false);
  assert.equal(s(60).front.visible, true);
  assert.equal(s(-60).front.visible, true);
  assert.equal(s(120).front.visible, false);
  assert.equal(s(120).back.visible, true);
  assert.equal(s(180).back.visible, true);
  assert.equal(s(-120).back.visible, true);
  assert.equal(s(315).front.visible, true, "315 is -45 round: the front is coming round");
  assert.equal(s(90).front.visible, false);
  assert.equal(s(90).back.visible, false);
  assert.equal(s(-90).front.visible, false);
});

test("a positive yaw takes the front to the right and the back to the left, so a drag to the right (a positive yaw) turns the jersey with the hand", () => {
  const middle = (matrix: string): number => {
    const [a, , , , e] = (/matrix\(([^)]+)\)/.exec(matrix)?.[1] ?? "").split(" ").map(Number) as [number, number, number, number, number];
    return a * (JERSEY_WIDTH / 2) + e;
  };
  for (const yaw of [20, 45, 70]) {
    assert.ok(middle(turnState(yaw).front.matrix) > JERSEY_WIDTH / 2, `${yaw}: the front is right of the middle`);
    assert.ok(middle(turnState(-yaw).front.matrix) < JERSEY_WIDTH / 2, `-${yaw}: and left of it for a turn the other way`);
    assert.ok(middle(turnState(180 - yaw).back.matrix) < JERSEY_WIDTH / 2, `${180 - yaw}: the back that comes round is left of the middle`);
  }
});

test("the front foreshortens by the cosine, and at the edge the cloth's thickness is what shows", () => {
  const m = (matrix: string): number[] => (/matrix\(([^)]+)\)/.exec(matrix)?.[1] ?? "").split(" ").map(Number);
  assert.equal(m(turnState(0).front.matrix)[0], 1);
  assert.ok(Math.abs((m(turnState(60).front.matrix)[0] as number) - 0.5) < 0.01);
  assert.ok(Math.abs(m(turnState(90).front.matrix)[0] as number) < 0.001);
  // The slices of the edge are the outline at depths through the cloth: at 90 degrees they sit side by side across the thickness.
  const edge = turnState(90, 14).slices.map((x) => m(x)[4] as number);
  assert.ok(Math.max(...edge) - Math.min(...edge) > 13 && Math.max(...edge) - Math.min(...edge) < 15);
  const flat = turnState(0, 14).slices.map((x) => m(x)[4] as number);
  assert.ok(Math.max(...flat) - Math.min(...flat) < 0.01, "face on, the slices lie one on another");
  // A back face is the mirror image: at 180 degrees its scale is 1.
  assert.equal(m(turnState(180).back.matrix)[0], 1);
});

test("a face darkens as it turns away", () => {
  assert.equal(turnState(0).front.shade, 0);
  assert.ok(turnState(60).front.shade > 0.15);
  assert.ok(turnState(89).front.shade > turnState(60).front.shade);
  assert.ok(turnState(89).front.shade <= 0.42);
});

test("angles are taken round, and anything that is not a number is the front", () => {
  assert.equal(normalYaw(190), -170);
  assert.equal(normalYaw(-190), 170);
  assert.equal(normalYaw(360), 0);
  assert.equal(normalYaw(Number.NaN), 0);
  assert.equal(normalYaw("90"), 0);
  assert.equal(normalYaw(Infinity), 0);
  assert.equal(jerseyFrame({ yaw: Number.NaN }), jerseyFrame({ yaw: 0 }));
});

test("the front frame holds the front's markup and the back frame the back's: the name and number are on the back face", () => {
  const svg = jerseyFrame({ cut: "soccer", number: 10, name: "Gray", yaw: 180 });
  const back = svg.slice(svg.indexOf('data-turn="back"'));
  const front = svg.slice(svg.indexOf('data-turn="front"'), svg.indexOf('data-turn="back"'));
  assert.ok(back.length > 100 && front.length > 100);
  // The back is drawn with a name and a number (strokes of letters); the front, with neither, has none.
  assert.ok(back.includes("stroke-miterlimit"));
  assert.ok(!front.includes("stroke-miterlimit"));
  assert.match(svg, /data-yaw="-?180"/);
});

test("applyTurn moves the transforms of a frame that is already there, as the container does each tick", () => {
  const calls: [string, string][] = [];
  const node = (name: string) => ({ setAttribute: (k: string, v: string) => calls.push([name + k, v]), removeAttribute: (k: string) => calls.push([name + k, ""]) });
  const slices = [node("s0"), node("s1"), node("s2"), node("s3"), node("s4"), node("s5")];
  const nodes: Record<string, ReturnType<typeof node>> = { '[data-turn="front"]': node("f"), '[data-turn="back"]': node("b"), '[data-turn="front-shade"]': node("fs"), '[data-turn="back-shade"]': node("bs") };
  const svg = {
    hasAttribute: () => false,
    setAttribute: (k: string, v: string) => calls.push(["svg" + k, v]),
    querySelectorAll: () => ({ forEach: (f: (n: unknown, i: number) => void) => slices.forEach((n, i) => f(n, i)) }),
    querySelector: (q: string) => nodes[q] ?? null,
  };
  assert.equal(applyTurn(svg as unknown as Element, 200), -160);
  assert.ok(calls.some(([k, v]) => k === "bdisplay" || (k === "btransform" && v.startsWith("matrix("))));
  assert.ok(calls.some(([k, v]) => k === "fdisplay" && v === "none"));
  assert.ok(calls.some(([k]) => k === "svgdata-yaw"));
});

// A container and a window with just what bindTurn uses, and a clock that only moves when the test says so.
function fakeStage() {
  let now = 0;
  let next: ((time: number) => void) | null = null;
  const win = {
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback: (time: number) => void) => { next = callback; return 1; },
    cancelAnimationFrame: () => { next = null; },
    performance: { now: () => now },
  };
  const doc = { defaultView: win, hidden: false, addEventListener() {}, removeEventListener() {} };
  const container = { ownerDocument: doc, innerHTML: "", style: {}, clientWidth: 300, querySelector: () => null, setAttribute() {}, addEventListener() {}, removeEventListener() {}, replaceChildren() {} };
  return { container: container as unknown as HTMLElement, frame(ms: number) { now += ms; const callback = next; next = null; callback?.(now); } };
}

test("the automatic turn goes counterclockwise by default and clockwise when asked, at the same speed, and the direction can change while it turns", () => {
  assert.equal(turnDirection("clockwise"), "clockwise");
  for (const other of ["counterclockwise", "anticlockwise", "CLOCKWISE", "", undefined, null, 1, {}]) assert.equal(turnDirection(other), "counterclockwise", String(other));
  assert.ok((SENSHU_ATTRIBUTES as readonly string[]).includes("direction"));
  for (const [direction, sign] of [[undefined, 1], ["counterclockwise", 1], ["clockwise", -1]] as const) {
    const seen: number[] = [];
    const stage = fakeStage();
    const handle = bindTurn(stage.container, { cut: "hockey" }, { autoPlay: true, speed: 40, ...(direction === undefined ? {} : { direction }), onChange: (yaw) => seen.push(yaw) });
    assert.equal(handle.direction(), direction ?? "counterclockwise");
    stage.frame(50);
    stage.frame(50);
    // 40 degrees a second for a twentieth of a second is two degrees, twice.
    assert.deepEqual(seen, [sign * 2, sign * 4], String(direction));
    handle.setDirection(sign === 1 ? "clockwise" : "counterclockwise");
    stage.frame(50);
    assert.equal(seen.at(-1), sign * 2, "it goes back the way it came, from where it was");
    assert.equal(handle.playing(), true, "changing the direction does not stop it");
    handle.destroy();
  }
});

test("the direction does not change what a drag or setYaw does", () => {
  const stage = fakeStage();
  const handle = bindTurn(stage.container, { cut: "hockey" }, { direction: "clockwise" });
  handle.setYaw(30);
  assert.equal(handle.yaw(), 30);
  handle.setYaw(-170);
  handle.setYaw(190);
  assert.equal(handle.yaw(), -170);
  handle.destroy();
});
