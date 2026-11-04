// The tabs of the demo's embed panel for a jersey: the package's five ways are its own text, the framework tabs are valid for their framework and give the element the jersey's attributes, Turnable goes where a tag
// or a frame is written, and a size other than the drawing's own 200 goes into the code.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseTemplate } from "@angular/compiler";
import { build } from "esbuild";
import { compile } from "svelte/compiler";
import ts from "typescript";
import { compileScript, parse } from "vue/compiler-sfc";
import { embedSnippet } from "@johnmorrisdotca/kazoku-ui/embed-panel";
import { attributesFromOptions, embedCode, optionsFromAttributes, OPTION_ATTRIBUTES, renderJersey, type JerseyOptions } from "../src/index.ts";
import { canTurn, DEFAULT_SIZE, KINDS, LABELS, packageKind, panelCode, SIZES } from "../demo/embedPanel.js";

const api = { embedSnippet, embedCode, attributesFromOptions } as never;
const exportsOf = (JSON.parse(readFileSync("package.json", "utf8")) as { exports: Record<string, unknown> }).exports;
const HOCKEY: JerseyOptions = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both", look: "flat", pattern: "hoops" };
const SOCCER: JerseyOptions = { cut: "soccer", colors: ["#1f3a8a", "#f4f0e4"], number: 10, name: "Gray", view: "front" };
const syntax = (code: string, name: string): string[] => (ts.transpileModule(code, { reportDiagnostics: true, fileName: name, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
const tagAttrs = (code: string): string[] => {
  const tag = /<senshu-jersey\b([^>]*?)\/?>/s.exec(code);
  assert.ok(tag, code);
  return [...tag[1]!.matchAll(/\s([\w-]+)(?=[=\s]|$)/g)].map((one) => one[1]!);
};

test("the panel's tabs are the family's seven then the package's SVG and data URI, and 200 is a size", () => {
  assert.deepEqual(KINDS, ["html", "module", "react", "vue", "angular", "svelte", "iframe", "svg", "data"]);
  assert.deepEqual(LABELS, { data: "Data URI" });
  assert.ok(SIZES.includes(DEFAULT_SIZE));
  assert.deepEqual(KINDS.filter(canTurn), ["html", "react", "vue", "angular", "svelte", "iframe"]);
});

test("the package's five ways are its own text", () => {
  for (const options of [HOCKEY, SOCCER]) {
    for (const kind of ["html", "module", "iframe", "svg", "data"]) assert.equal(panelCode(api, kind, options), embedCode(options, packageKind(kind) as never), kind);
    assert.equal(panelCode(api, "svg", options), renderJersey(options));
  }
  assert.equal(panelCode(api, "html", HOCKEY, { turnable: true, autoplay: true }), embedCode(HOCKEY, "element", { turnable: true, autoplay: true }));
  assert.equal(panelCode(api, "iframe", HOCKEY, { turnable: true, site: "http://localhost/" }), embedCode(HOCKEY, "iframe", { turnable: true, site: "http://localhost/" }));
  assert.equal(panelCode(api, "svg", HOCKEY, { turnable: true }), renderJersey(HOCKEY), "Turnable changes nothing in a drawing");
});

test("a size that is not the drawing's own goes into the code and the drawing, and 200 is left out", () => {
  assert.doesNotMatch(panelCode(api, "html", HOCKEY, { size: 200 }), /size=/);
  assert.match(panelCode(api, "html", HOCKEY, { size: 320 }), /size="320"/);
  assert.match(panelCode(api, "react", HOCKEY, { size: 320 }), /size="320"/);
  assert.equal(panelCode(api, "svg", HOCKEY, { size: 320 }), renderJersey({ ...HOCKEY, size: 320 }));
  assert.notEqual(panelCode(api, "svg", HOCKEY, { size: 320 }), panelCode(api, "svg", HOCKEY));
});

test("the tag and every framework tab give the element the same attributes, all ones the element reads", () => {
  const read = new Set<string>(OPTION_ATTRIBUTES);
  for (const options of [HOCKEY, SOCCER]) {
    const want = [...Object.keys(attributesFromOptions(options)), "turnable", "autoplay"];
    for (const name of want.slice(0, -2)) assert.ok(read.has(name), name);
    for (const kind of ["html", "react", "vue", "angular", "svelte"]) assert.deepEqual(tagAttrs(panelCode(api, kind, options, { turnable: true, autoplay: true })), want, kind);
    for (const kind of ["html", "react", "vue", "angular", "svelte"]) assert.deepEqual(tagAttrs(panelCode(api, kind, options)), want.slice(0, -2), kind);
  }
});

test("the element comes from the package's define path, and the options read back draw the same jersey", () => {
  for (const kind of ["react", "vue", "angular", "svelte"]) {
    const paths = [...panelCode(api, kind, HOCKEY).matchAll(/@johnmorrisdotca\/senshu-jerseys\/([\w/-]+)/g)].map((one) => one[1]!);
    assert.deepEqual(paths, ["define"], kind);
    assert.ok("./define" in exportsOf);
  }
  const attrs = attributesFromOptions(HOCKEY);
  assert.equal(renderJersey(optionsFromAttributes((name: string) => attrs[name] ?? null)), renderJersey(HOCKEY));
});

test("the module, React and Angular code is valid, the Angular template parses and React builds", async () => {
  for (const options of [HOCKEY, SOCCER]) {
    for (const [kind, file] of [["module", "m.ts"], ["react", "r.tsx"], ["angular", "a.ts"]] as const) assert.deepEqual(syntax(panelCode(api, kind, options, { turnable: true }), file), [], kind);
    assert.deepEqual(parseTemplate(/template: `([^`]*)`/.exec(panelCode(api, "angular", options))![1]!, "jersey.component.ts").errors ?? [], []);
    const built = await build({ stdin: { contents: panelCode(api, "react", options, { turnable: true }), loader: "tsx", resolveDir: process.cwd() }, bundle: true, write: false, format: "esm", platform: "node", jsx: "automatic", external: ["@johnmorrisdotca/senshu-jerseys/*", "react", "react/*"], logLevel: "silent" });
    assert.ok(built.outputFiles[0]!.text.includes("senshu-jersey"));
  }
});

test("the Vue and Svelte components compile and name the element", () => {
  for (const options of [HOCKEY, SOCCER]) {
    const { descriptor, errors } = parse(panelCode(api, "vue", options));
    assert.deepEqual(errors, []);
    assert.match(compileScript(descriptor, { id: "jersey" }).content, /onMounted/);
    assert.match(compile(panelCode(api, "svelte", options), { filename: "Jersey.svelte", generate: "client" }).js.code, /senshu-jersey/);
  }
});
