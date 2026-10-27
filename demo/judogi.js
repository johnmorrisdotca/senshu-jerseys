// Judogi designer: one options object in the address, a preview that turns in place (by the angle slider, by hovering, or on its own),
// export to SVG or PNG. A choice redraws the judogi at the angle it was at, so the camera stays where it was.
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, PATCH_COLOURS, PATCH_COLOUR_LABELS, PATCH_STYLES, ZEKKEN_INKS, ZEKKEN_INK_LABELS,
  judogiCheck, judogiFrame,
} from "./dist/index.js";
import { judogiCanvas, judogiTurn } from "./dist/turn-entry.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const lang = () => window.senshuLanguage?.lang ?? "en";
const say = (key) => WORDS[lang()][key] ?? WORDS.en[key] ?? key;
/** Degrees a second when it turns on its own: slow enough to look at the cloth. */
const SPEED = 30;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  colour: JUDOGI_COLOURS.includes(params.get("colour")) ? params.get("colour") : "white",
  belt: JUDOGI_BELTS.includes(params.get("belt")) ? params.get("belt") : "white",
  mode: JUDOGI_MODES.includes(params.get("mode")) ? params.get("mode") : "pieces",
  view: JUDOGI_VIEWS.includes(params.get("view")) ? params.get("view") : "front",
  size: JUDOGI_SIZES.includes(params.get("size")) ? params.get("size") : "170",
  yaw: Number.parseInt(params.get("yaw") ?? "0", 10) || 0,
  // The back patch: its style, the words on it and its colours. Every one is in the address.
  patch: PATCH_STYLES.includes(params.get("patch")) ? params.get("patch") : "none",
  pname: (params.get("pname") ?? "").slice(0, 24),
  pcode: (params.get("pcode") ?? "").slice(0, 3),
  pline: (params.get("pline") ?? "").slice(0, 28),
  pcolour: PATCH_COLOURS.includes(params.get("pcolour")) ? params.get("pcolour") : "blue",
  pink: ZEKKEN_INKS.includes(params.get("pink")) ? params.get("pink") : "black",
  psew: params.get("psew") === "lines" ? "lines" : "x",
};

const turning = { on: false, byHover: false, last: 0, frame: 0 };

/** The options the package takes, made from the page's state. A word left empty is the package's own default. */
function options() {
  const o = { colour: state.colour, belt: state.belt, mode: state.mode, view: state.view, size: state.size, language: lang() === "ja" ? "ja" : "en", yaw: state.yaw, width: 360 };
  if (state.patch !== "none") {
    o.backPatch = { style: state.patch, ...(state.pname === "" ? {} : { name: state.pname }), ...(state.pline === "" ? {} : { line: state.pline }) };
    if (state.patch === "ijf") Object.assign(o.backPatch, { colour: state.pcolour, sewing: state.psew, ...(state.pcode === "" ? {} : { code: state.pcode }) });
    else o.backPatch.ink = state.pink;
  }
  return o;
}

const DEFAULTS = { yaw: 0, patch: "none", pname: "", pcode: "", pline: "", pcolour: "blue", pink: "black", psew: "x" };

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (String(v) === "" || (k === "yaw" && (Number(v) === 0 || turning.on))) continue;
    if (k in DEFAULTS && String(v) === String(DEFAULTS[k])) continue;
    q.set(k, String(v));
  }
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

const flat = () => state.view === "flat" || state.view === "flat-back";
const wrap = (a) => ((((Math.round(a) + 180) % 360) + 360) % 360) - 180;

let drawing = 0;
/** The judogi on the stage as a canvas that turns it, or undefined while the stage shows an SVG (a flat view). */
let painted;

/** The whole drawing, at the current angle: made off the page and painted on a canvas, then shown. A newer choice wins. */
async function draw() {
  const o = options();
  const mine = ++drawing;
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame(o);
  const svg = holder.firstElementChild;
  const canvas = svg === null || flat() ? undefined : await judogiCanvas(svg);
  if (mine !== drawing) {
    canvas?.dispose();
    return;
  }
  painted?.dispose();
  painted = canvas;
  if (canvas === undefined) $("judo-stage").replaceChildren(...holder.childNodes);
  else $("judo-stage").replaceChildren(canvas.canvas);
  $("judo-check").textContent = checkText(judogiCheck(o));
  for (const id of ["judo-yaw", "judo-play", "judo-front"]) $(id).disabled = flat();
  if (flat()) stop();
  showAngle();
}

/** What the size check found, in the page's language: the facts themselves are English, so the Japanese page says only whether the size meets them. */
function checkText(check) {
  const head = `${say("judoOk")}: ${check.heightCm} cm.`;
  if (lang() === "ja") return check.ok ? head : "";
  // Each fact carries its own source: the IJF's rules for the garment, and the rules a patch follows.
  return check.ok ? `${head} ${check.notes.map((n) => n.fact).join(" ")}` : check.notes.filter((n) => !n.met).map((n) => n.fact).join(" ");
}

function showAngle() {
  $("judo-yaw-out").textContent = `${wrap(state.yaw)}°`;
  $("judo-yaw").value = String(wrap(state.yaw));
}

/** Move the drawing already on the stage to the current angle, without drawing it again. */
function turnTo(yaw) {
  state.yaw = yaw;
  const shown = state.yaw + (state.view === "back" ? 180 : 0);
  const svg = $("judo-stage").querySelector("svg");
  if (painted !== undefined) painted.turn(shown);
  else if (svg !== null && !flat()) judogiTurn(svg, shown);
  showAngle();
}

function tick(now) {
  if (!turning.on) return;
  const dt = turning.last === 0 ? 0 : Math.min(0.1, (now - turning.last) / 1000);
  turning.last = now;
  turnTo(state.yaw + SPEED * dt);
  turning.frame = requestAnimationFrame(tick);
}

function play(byHover = false) {
  if (turning.on || flat()) return;
  turning.on = true;
  turning.byHover = byHover;
  turning.last = 0;
  turning.frame = requestAnimationFrame(tick);
  syncPlay();
}

function stop() {
  if (!turning.on) return;
  turning.on = false;
  globalThis.cancelAnimationFrame(turning.frame);
  syncPlay();
  syncUrl();
}

function syncPlay() {
  $("judo-play").setAttribute("aria-pressed", String(turning.on));
  $("judo-play").textContent = turning.on ? say("pause") : say("play");
}

function select(id, values, labels) {
  const el = document.createElement("select");
  el.id = id;
  el.className = "fam-field";
  el.dataset.testid = id;
  for (const value of values) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = labels(value);
    if (state[id.replace("judo-", "")] === value) opt.selected = true;
    el.append(opt);
  }
  return el;
}

/** A line of text, with the package's own default shown where nothing is typed. */
function text(id, max, placeholder) {
  const el = document.createElement("input");
  el.id = id;
  el.type = "text";
  el.className = "fam-field";
  el.dataset.testid = id;
  el.maxLength = max;
  el.autocomplete = "off";
  el.spellcheck = false;
  el.placeholder = placeholder;
  el.value = state[id.replace("judo-", "")];
  return el;
}

/** A belt's name in the page's language only. */
function beltLabel(id) {
  if (id === "none") return say("judoBeltNone");
  const pair = JUDOGI_BELT_LABELS[id];
  return lang() === "ja" ? pair.ja : pair.en;
}

const pair = (labels) => (v) => (lang() === "ja" ? labels[v].ja : labels[v].en);

/** The controls, in groups. A field that does not apply to the choices made is not shown. */
function rows() {
  const ijf = state.patch === "ijf";
  const zekken = state.patch === "zekken";
  return [
    ["judo-colour", say("judoColour"), select("judo-colour", JUDOGI_COLOURS, (v) => say(v === "blue" ? "judoBlue" : "judoWhite"))],
    ["judo-belt", say("judoBelt"), select("judo-belt", JUDOGI_BELTS, beltLabel)],
    ["judo-mode", say("judoMode"), select("judo-mode", JUDOGI_MODES, (v) => say(`judoMode_${v}`))],
    ["judo-view", say("judoView"), select("judo-view", JUDOGI_VIEWS, (v) => say(`judoView_${v}`))],
    ["judo-size", say("judoSize"), select("judo-size", JUDOGI_SIZES, (v) => v)],
    ["judo-patch", say("judoPatch"), select("judo-patch", PATCH_STYLES, (v) => say(`judoPatch_${v}`)), true],
    ...(ijf || zekken ? [["judo-pname", say(zekken ? "judoPatchSurname" : "judoPatchName"), text("judo-pname", 24, zekken ? "山田" : "A. ATHLETE")]] : []),
    ...(ijf ? [["judo-pcode", say("judoPatchCode"), text("judo-pcode", 3, "SJF")]] : []),
    ...(ijf || zekken ? [["judo-pline", say(zekken ? "judoPatchAffiliation" : "judoPatchLine"), text("judo-pline", 28, "")]] : []),
    ...(ijf ? [["judo-pcolour", say("judoPatchColour"), select("judo-pcolour", PATCH_COLOURS, pair(PATCH_COLOUR_LABELS))]] : []),
    ...(ijf ? [["judo-psew", say("judoPatchSewing"), select("judo-psew", ["x", "lines"], (v) => say(`judoPatchSewing_${v}`))]] : []),
    ...(zekken ? [["judo-pink", say("judoPatchInk"), select("judo-pink", ZEKKEN_INKS, pair(ZEKKEN_INK_LABELS))]] : []),
  ];
}

let typing = 0;
function controls() {
  const box = $("judo-controls");
  box.replaceChildren();
  for (const [id, label, input, rebuild] of rows()) {
    const row = document.createElement("label");
    row.htmlFor = id;
    const span = document.createElement("span");
    span.textContent = label;
    row.append(span, input);
    box.append(row);
    const change = () => {
      state[id.replace("judo-", "")] = input.value;
      syncUrl();
      // A choice that changes which fields apply builds them again; typing keeps the field it is in.
      if (rebuild) controls();
      draw();
    };
    if (input.type === "text") {
      input.addEventListener("input", () => {
        globalThis.clearTimeout(typing);
        typing = globalThis.setTimeout(change, 250);
      });
    } else input.addEventListener("change", change);
  }
}

function download(name, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function exportSvg() {
  download("senshu-judogi.svg", new Blob([judogiFrame(options())], { type: "image/svg+xml" }));
}

function exportPng() {
  const blob = new Blob([judogiFrame(options())], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new globalThis.Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth * 2);
    canvas.height = Math.max(1, img.naturalHeight * 2);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((png) => { if (png) download("senshu-judogi.png", png); URL.revokeObjectURL(url); }, "image/png");
  };
  img.src = url;
}

controls();
$("judo-yaw").addEventListener("input", () => {
  stop();
  turnTo(Number($("judo-yaw").value));
  syncUrl();
});
$("judo-front").addEventListener("click", () => { stop(); turnTo(0); syncUrl(); });
$("judo-play").addEventListener("click", () => (turning.on ? stop() : play()));
// Still until a mouse comes over it: then it turns, and stops when the mouse leaves, unless it was set turning with the button.
$("judo-stage").addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" && !reduced.matches) play(true);
});
$("judo-stage").addEventListener("pointerleave", () => {
  if (turning.byHover) stop();
});
$("judo-svg").addEventListener("click", exportSvg);
$("judo-png").addEventListener("click", exportPng);
window.addEventListener("senshu-language", () => { controls(); draw(); syncPlay(); });
draw();
syncPlay();
