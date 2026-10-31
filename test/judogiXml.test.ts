import assert from "node:assert/strict";
import { test } from "node:test";
import { BJJ_COLOURS, BJJ_PRESETS } from "../src/bjjgi.ts";
import { DOBOK_CUTS, DOBOK_GRADES } from "../src/dobok.ts";
import { JUDOGI_MODES, JUDOGI_VIEWS, judogiFrame, renderJudogi, type JudogiOptions } from "../src/judogi.ts";
import { KARATE_CUTS, KARATE_SLEEVES } from "../src/karategi.ts";

/** A strict XML check: one root, tags nest, every attribute quoted and named once on its tag, entities known. Returns the first fault or null. */
function strictXml(xml: string): string | null {
  const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[A-Za-z_][\w:.-]*\s*=\s*(?:"[^"<]*"|'[^'<]*'))*)\s*(\/?)>/g;
  const stack: string[] = [];
  let last = 0;
  let roots = 0;
  for (let m = tag.exec(xml); m; m = tag.exec(xml)) {
    const text = xml.slice(last, m.index);
    if (/[<>]/.test(text.replace(/<\?[\s\S]*?\?>/g, ""))) return `stray < or > near ${JSON.stringify(text.slice(0, 50))}`;
    if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(text + m[3])) return `unknown entity near ${JSON.stringify(m[0].slice(0, 60))}`;
    last = m.index + m[0].length;
    const names = [...m[3]!.matchAll(/\s([A-Za-z_][\w:.-]*)\s*=/g)].map((a) => a[1]!);
    const twice = names.find((n, i) => names.indexOf(n) !== i);
    if (twice !== undefined) return `<${m[2]}> repeats ${twice}: ${m[0].slice(0, 120)}`;
    if (m[1]) {
      const open = stack.pop();
      if (open !== m[2]) return `</${m[2]}> closes <${open}>`;
    } else {
      if (stack.length === 0) roots++;
      if (!m[4]) stack.push(m[2]!);
    }
  }
  if (/[<>]/.test(xml.slice(last))) return "stray < or > at the end";
  if (stack.length) return `unclosed <${stack.at(-1)}>`;
  return roots === 1 ? null : `${roots} roots`;
}

const MARKS: JudogiOptions = {
  belt: "black",
  embroidery: [{ place: "jacket-hem", text: "TANAKA", thread: "gold" }, { place: "belt-end-left", text: "JUDO" }, { place: "pants-left", text: "山田", font: "kaisho" }],
  logos: [{ place: "jacket-hem" }, { place: "pants-leg-left" }, { place: "belt-end-right" }],
  emblem: {},
  label: true,
  branding: true,
  backPatch: { style: "ijf", name: "M. TANAKA", code: "JPN" },
};

const SETS: [string, JudogiOptions][] = [
  ["plain", {}],
  ["blue black belt", { colour: "blue", belt: "black" }],
  ["marks", MARKS],
  ["no knee", { knee: false }],
  ["short hem", { hemAboveAnkleCm: 10 }],
  ["long hem", { hemAboveAnkleCm: 2, belt: "black" }],
  ["bjj long hem", { belt: "black", bjj: { patches: "ibjjf" }, hemAboveAnkleCm: 2 }],
  ...KARATE_CUTS.flatMap((cut) => KARATE_SLEEVES.map((sleeve): [string, JudogiOptions] => [`karate ${cut} ${sleeve}`, { belt: "black", karate: { cut, sleeve } }])),
  ...DOBOK_CUTS.flatMap((cut) => DOBOK_GRADES.map((grade): [string, JudogiOptions] => [`dobok ${cut} ${grade}`, { belt: "black", dobok: { cut, grade } }])),
  ...BJJ_COLOURS.flatMap((colour) => BJJ_PRESETS.map((patches): [string, JudogiOptions] => [`bjj ${colour} ${patches}`, { belt: "black", bjj: { colour, patches } }])),
  ["bjj no knee", { belt: "black", bjj: { patches: "covered" }, knee: false }],
];

test("the checker itself catches a repeated attribute", () => {
  assert.equal(strictXml(`<svg><path d="M0 0" stroke-linecap="round" stroke-linecap="butt"/></svg>`)?.includes("repeats stroke-linecap"), true);
  assert.equal(strictXml(`<svg><path d="M0 0" stroke-linecap="round"/></svg>`), null);
});

test("every judogi, karate gi, dobok and jiu-jitsu gi drawing is strict XML with no repeated attribute", () => {
  for (const [name, o] of SETS) {
    for (const mode of name === "plain" ? JUDOGI_MODES : (["suit", "pants"] as const)) {
      for (const view of JUDOGI_VIEWS) assert.equal(strictXml(renderJudogi({ ...o, mode, view })), null, `${name} ${mode} ${view}`);
      for (const yaw of name === "plain" ? [0, 35, 90, 150, 180] : [35, 150]) assert.equal(strictXml(judogiFrame({ ...o, mode, yaw })), null, `${name} ${mode} yaw ${yaw}`);
    }
  }
});

test("the drawstring cord paints each path with one line cap", () => {
  for (const yaw of [0, 60]) {
    const svg = judogiFrame({ mode: "pants", yaw });
    assert.ok(svg.includes(`stroke-dasharray="0.45 0.7"`), "the braid ticks are drawn");
    for (const m of svg.matchAll(/<path\b[^>]*>/g)) assert.ok((m[0].match(/ stroke-linecap=/g) ?? []).length <= 1, m[0].slice(0, 120));
  }
});
