// Judogi designer: one options object in the address, a turning preview, export to SVG or PNG.
import { JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, judogiCheck, judogiFrame, renderJudogi } from "./dist/index.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const lang = () => window.senshuLanguage?.lang ?? "en";
const say = (key) => WORDS[lang()][key] ?? WORDS.en[key] ?? key;

const state = {
  colour: JUDOGI_COLOURS.includes(params.get("colour")) ? params.get("colour") : "white",
  belt: JUDOGI_BELTS.includes(params.get("belt")) ? params.get("belt") : "white",
  mode: JUDOGI_MODES.includes(params.get("mode")) ? params.get("mode") : "pieces",
  view: JUDOGI_VIEWS.includes(params.get("view")) ? params.get("view") : "front",
  size: JUDOGI_SIZES.includes(params.get("size")) ? params.get("size") : "170",
  yaw: Number.parseInt(params.get("yaw") ?? "0", 10) || 0,
};

function options() {
  return { colour: state.colour, belt: state.belt, mode: state.mode, view: state.view, size: state.size, language: lang() === "ja" ? "ja" : "en", yaw: state.yaw, width: 360 };
}

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) if (String(v) !== "" && !(k === "yaw" && Number(v) === 0)) q.set(k, String(v));
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

function draw() {
  const o = options();
  $("judo-stage").innerHTML = state.yaw === 0 && state.view !== "flat" ? renderJudogi(o) : judogiFrame(o);
  const check = judogiCheck(o);
  $("judo-check").textContent = check.ok
    ? `${say("judoOk")} (${check.size}, ${check.heightCm} cm). ${check.notes.map((n) => n.fact).join(" ")}`
    : check.notes.filter((n) => !n.met).map((n) => n.fact).join(" ");
  $("judo-yaw-out").textContent = `${state.yaw}°`;
  $("judo-yaw").value = String(state.yaw);
}

function select(id, values, labels) {
  const el = document.createElement("select");
  el.id = id;
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

function beltLabel(id) {
  if (id === "none") return say("judoBeltNone");
  const pair = JUDOGI_BELT_LABELS[id];
  return lang() === "ja" ? `${pair.ja} / ${pair.en}` : `${pair.en} / ${pair.ja}`;
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
    const wrap = document.createElement("label");
    wrap.htmlFor = id;
    const span = document.createElement("span");
    span.textContent = label;
    wrap.append(span, input);
    box.append(wrap);
    input.addEventListener("change", () => {
      const key = id.replace("judo-", "");
      state[key] = input.value;
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
  const svg = state.yaw === 0 ? renderJudogi(options()) : judogiFrame(options());
  download(`senshu-judogi.svg`, new Blob([svg], { type: "image/svg+xml" }));
}

function exportPng() {
  const svg = state.yaw === 0 ? renderJudogi(options()) : judogiFrame(options());
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new globalThis.Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth);
    canvas.height = Math.max(1, img.naturalHeight);
    canvas.getContext("2d").drawImage(img, 0, 0);
    canvas.toBlob((png) => { if (png) download("senshu-judogi.png", png); URL.revokeObjectURL(url); }, "image/png");
  };
  img.src = url;
}

controls();
$("judo-yaw").addEventListener("input", () => {
  state.yaw = Number($("judo-yaw").value);
  syncUrl();
  draw();
});
$("judo-front").addEventListener("click", () => { state.yaw = 0; syncUrl(); draw(); });
$("judo-svg").addEventListener("click", exportSvg);
$("judo-png").addEventListener("click", exportPng);
window.addEventListener("senshu-language", () => { controls(); draw(); });
draw();
