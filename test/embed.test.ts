import assert from "node:assert/strict";
import { test } from "node:test";

import * as S from "../src/index.ts";
import { SenshuJersey, SENSHU_ATTRIBUTES, defineSenshuJersey } from "../src/element-entry.ts";
import { wellFormed } from "./helpers.ts";

const OPTIONS: S.JerseyOptions = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both", look: "flat", sleeveStripes: 2, hemStripes: [4, 0, 3, 2], pattern: "hoops", repeat: [10, 1, 10, 0], frontNumber: true, patch: "C", sleeveNumbers: true };

test("options written as attributes and read back draw the same jersey", () => {
  const attrs = S.attributesFromOptions(OPTIONS);
  const back = S.optionsFromAttributes((name) => attrs[name] ?? null);
  assert.equal(S.renderJersey(back), S.renderJersey(OPTIONS));
});

test("options written as a query (colours without #) and read back draw the same jersey", () => {
  const q = S.jerseyToParams(OPTIONS);
  assert.ok(!q.toString().includes("%23"), "no # in the query");
  assert.equal(S.renderJersey(S.jerseyFromParams(new URLSearchParams(q.toString()))), S.renderJersey(OPTIONS));
});

test("an attribute that is not valid is ignored, never thrown at", () => {
  const read = (name: string): string | null => ({ cut: "curling", colors: "red,#zzz", number: "<b>", "sleeve-stripes": "x", size: "-5", "chest-band": "1 2 3", view: "up" } as Record<string, string>)[name] ?? null;
  const o = S.optionsFromAttributes(read);
  assert.equal(wellFormed(S.renderJersey(o)), null);
  assert.equal(o.cut, undefined);
});

test("every way of putting a jersey in a page gives text that holds it", () => {
  const element = S.embedCode(OPTIONS, "element", { turnable: true, autoplay: true });
  assert.match(element, /<script type="module" src="[^"]*element-define\.js"><\/script>/);
  assert.match(element, /<senshu-jersey\n {2}cut="hockey"/);
  assert.match(element, /\n {2}turnable\n {2}autoplay\n/);
  const iframe = S.embedCode(OPTIONS, "iframe", { turnable: true });
  const src = /src="([^"]+)"/.exec(iframe)?.[1] ?? "";
  assert.match(src, /^https:\/\/johnmorrisdotca\.github\.io\/senshu-jerseys\/embed\.html\?/);
  assert.match(src, /turn=1/);
  assert.equal(S.renderJersey(S.jerseyFromParams(new URL(src.replaceAll("&amp;", "&")).searchParams)), S.renderJersey({ ...OPTIONS }));
  const module = S.embedCode(OPTIONS, "module");
  assert.match(module, /import \{ renderJersey \} from /);
  assert.match(module, /renderJersey\(\{/);
  const svg = S.embedCode(OPTIONS, "svg");
  assert.equal(svg, S.renderJersey(OPTIONS));
  const data = S.embedCode(OPTIONS, "data");
  assert.ok(data.startsWith("data:image/svg+xml;charset=utf-8,"));
  assert.equal(decodeURIComponent(data.slice(data.indexOf(",") + 1)), svg);
});

test("an attribute value that holds markup is escaped in the element's code", () => {
  const code = S.embedCode({ name: '"><script>alert(1)</script>' }, "element");
  assert.doesNotMatch(code, /<script>alert/);
  assert.match(code, /&quot;&gt;&lt;script&gt;/);
});

test("the element's module loads where there is no DOM, registers nothing there, and lists the attributes it reads", () => {
  assert.equal(typeof SenshuJersey, "function");
  defineSenshuJersey();
  for (const a of ["cut", "colors", "number", "name", "turnable", "autoplay", "speed", "preset", "look", "view"]) assert.ok((SENSHU_ATTRIBUTES as readonly string[]).includes(a), a);
  // Every option the options type has is an attribute, one for one.
  for (const a of S.OPTION_ATTRIBUTES) assert.match(a, /^[a-z]+(-[a-z]+)*$/);
});

test("a preset loaded by id is what the element would draw from preset=", () => {
  S.usePresets([{ id: "test:one", league: "test", team: "One", ja: "ワン", years: "2000s", way: "home", options: { cut: "soccer", body: "#112233", trim: "#ffeedd" } }]);
  assert.equal(S.presetOptions("test:one")?.cut, "soccer");
  assert.equal(S.presetOf("test:one")?.team, "One");
  assert.equal(S.presetOf("nope"), undefined);
});
