// Judogi designer: one options object in the address, a preview that turns in place (by the angle slider, by hovering, or on its own),
// export to SVG or PNG. A choice redraws the judogi at the angle it was at, so the camera stays where it was.
import { JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, judogiCheck, judogiFrame } from "./dist/index.js";
import { judogiPrepare, judogiTurn } from "./dist/turn-entry.js";
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
};

const turning = { on: false, byHover: false, last: 0, frame: 0 };

function options() {
  return { colour: state.colour, belt: state.belt, mode: state.mode, view: state.view, size: state.size, language: lang() === "ja" ? "ja" : "en", yaw: state.yaw, width: 360 };
}

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) if (String(v) !== "" && !(k === "yaw" && (Number(v) === 0 || turning.on))) q.set(k, String(v));
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

const flat = () => state.view === "flat";
const wrap = (a) => ((((Math.round(a) + 180) % 360) + 360) % 360) - 180;

let drawing = 0;

/** The whole drawing, at the current angle: made off the page, its faces painted into pictures, then shown. A newer choice wins. */
async function draw() {
  const o = options();
  const mine = ++drawing;
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame(o);
  const svg = holder.firstElementChild;
  if (svg !== null) await judogiPrepare(svg);
  if (mine !== drawing) return;
  $("judo-stage").replaceChildren(...holder.childNodes);
  $("judo-check").textContent = checkText(judogiCheck(o));
  for (const id of ["judo-yaw", "judo-play", "judo-front"]) $(id).disabled = flat();
  if (flat()) stop();
  showAngle();
}

/** What the size check found, in the page's language: the facts themselves are English, so the Japanese page says only whether the size meets them. */
function checkText(check) {
  const source = "IJF Judogi Rules, 09 03 2022";
  const facts = (notes) => notes.map((n) => n.fact.replace(` (${source}).`, ".")).join(" ");
  const head = `${say("judoOk")}: ${check.heightCm} cm.`;
  if (lang() === "ja") return check.ok ? head : "";
  return check.ok ? `${head} ${facts(check.notes)} (${source})` : `${facts(check.notes.filter((n) => !n.met))} (${source})`;
}

function showAngle() {
  $("judo-yaw-out").textContent = `${wrap(state.yaw)}°`;
  $("judo-yaw").value = String(wrap(state.yaw));
}

/** Move the drawing already on the stage to the current angle, without drawing it again. */
function turnTo(yaw) {
  state.yaw = yaw;
  const svg = $("judo-stage").querySelector("svg");
  if (svg !== null && !flat()) judogiTurn(svg, state.yaw + (state.view === "back" ? 180 : 0));
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

/** A belt's name in the page's language only. */
function beltLabel(id) {
  if (id === "none") return say("judoBeltNone");
  const pair = JUDOGI_BELT_LABELS[id];
  return lang() === "ja" ? pair.ja : pair.en;
}

function controls() {
  const box = $("judo-controls");
  box.replaceChildren();
  const rows = [
    ["judo-colour", say("judoColour"), select("judo-colour", JUDOGI_COLOURS, (v) => say(v === "blue" ? "judoBlue" : "judoWhite"))],
    ["judo-belt", say("judoBelt"), select("judo-belt", JUDOGI_BELTS, beltLabel)],
    ["judo-mode", say("judoMode"), select("judo-mode", JUDOGI_MODES, (v) => say(`judoMode_${v}`))],
    ["judo-view", say("judoView"), select("judo-view", JUDOGI_VIEWS, (v) => say(`judoView_${v}`))],
    ["judo-size", say("judoSize"), select("judo-size", JUDOGI_SIZES, (v) => v)],
  ];
  for (const [id, label, input] of rows) {
    const row = document.createElement("label");
    row.htmlFor = id;
    const span = document.createElement("span");
    span.textContent = label;
    row.append(span, input);
    box.append(row);
    input.addEventListener("change", () => {
      state[id.replace("judo-", "")] = input.value;
      syncUrl();
      draw();
    });
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
