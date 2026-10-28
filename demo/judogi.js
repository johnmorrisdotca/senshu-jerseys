// Judogi designer: one options object in the address, a preview that turns in place (by a drag, the wheel, the angle slider, by hovering, or on its own), tips and zooms,
// export to SVG or PNG. A choice redraws the judogi at the angle it was at, so the camera stays where it was.
import {
  JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, PATCH_COLOURS, PATCH_COLOUR_LABELS, PATCH_STYLES, ZEKKEN_INKS, ZEKKEN_INK_LABELS,
  BRAND_KANJI, BRAND_KANJI_LABELS, EMBROIDERY_FONTS, EMBROIDERY_PLACES, LABEL_COLOURS, LABEL_COLOUR_LABELS, LOGO_PLACES, MARK_RULES, THREAD_COLOURS, THREAD_LABELS,
  judogiCheck, judogiFrame,
} from "./dist/index.js";
import { judogiCanvas, judogiTurn } from "./dist/turn-entry.js";
import { bindView, clamp, TILT_MAX, wrapYaw, ZOOM_MAX, ZOOM_MIN } from "./judogiView.js";
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
  // How far the camera is tipped (degrees, up is positive) and zoomed (1 to 3): in the address, like the angle.
  tilt: clamp(Number.parseInt(params.get("tilt") ?? "0", 10) || 0, -TILT_MAX, TILT_MAX),
  zoom: clamp(Number.parseFloat(params.get("zoom") ?? "1") || 1, ZOOM_MIN, ZOOM_MAX),
  // The back patch: its style, the words on it and its colours. Every one is in the address.
  patch: PATCH_STYLES.includes(params.get("patch")) ? params.get("patch") : "none",
  pname: (params.get("pname") ?? "").slice(0, 24),
  pcode: (params.get("pcode") ?? "").slice(0, 3),
  pline: (params.get("pline") ?? "").slice(0, 28),
  pcolour: PATCH_COLOURS.includes(params.get("pcolour")) ? params.get("pcolour") : "blue",
  pink: ZEKKEN_INKS.includes(params.get("pink")) ? params.get("pink") : "black",
  psew: params.get("psew") === "lines" ? "lines" : "x",
  // Two lines of embroidery (a place, its words, thread and lettering), a maker's logo, the national emblem and the rules the check holds them to.
  ...Object.fromEntries([1, 2].flatMap((n) => [
    [`e${n}p`, EMBROIDERY_PLACES.includes(params.get(`e${n}p`)) ? params.get(`e${n}p`) : "none"],
    [`e${n}t`, (params.get(`e${n}t`) ?? "").slice(0, 24)],
    [`e${n}c`, THREAD_COLOURS.includes(params.get(`e${n}c`)) ? params.get(`e${n}c`) : n === 1 ? "navy" : "gold"],
    [`e${n}f`, EMBROIDERY_FONTS.includes(params.get(`e${n}f`)) ? params.get(`e${n}f`) : "block"],
  ])),
  logo: LOGO_PLACES.includes(params.get("logo")) ? params.get("logo") : "none",
  emblem: ["placeholder", "flag"].includes(params.get("emblem")) ? params.get("emblem") : "none",
  flag: (params.get("flag") ?? "ca").toLowerCase().replace(/[^a-z-]/g, "").slice(0, 6),
  rules: MARK_RULES.includes(params.get("rules")) ? params.get("rules") : "ijf",
  // The "Approved Judogi" label, on the jacket, the trousers and the belt at once.
  label: LABEL_COLOURS.includes(params.get("label")) ? params.get("label") : "none",
  // The Senshu branding: on or off, its brush mark, its words, the size on the tag and its colour.
  brand: params.get("brand") === "1" ? "1" : "0",
  bk: BRAND_KANJI.includes(params.get("bk")) ? params.get("bk") : "te",
  bn: (params.get("bn") ?? "").slice(0, 16),
  bl: (params.get("bl") ?? "").slice(0, 20),
  bt: (params.get("bt") ?? "").slice(0, 5),
  bc: LABEL_COLOURS.includes(params.get("bc")) ? params.get("bc") : "navy",
};

/** The flag's SVG, loaded from Hata (the package is not a dependency of this one: the demo asks for one flag when it is chosen). */
const flags = new Map();
async function loadFlag(code) {
  if (flags.has(code)) return flags.get(code);
  let svg;
  try {
    const mod = await import(`https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hata@1.7.2/dist/flags/${code}.js`);
    svg = mod.default;
  } catch {
    svg = undefined;
  }
  flags.set(code, svg);
  return svg;
}

const turning = { on: false, byHover: false, last: 0, frame: 0 };

/** The options the package takes, made from the page's state. A word left empty is the package's own default. */
function options() {
  const o = { colour: state.colour, belt: state.belt, mode: state.mode, view: state.view, size: state.size, language: lang() === "ja" ? "ja" : "en", yaw: state.yaw, width: 360 };
  if (state.patch !== "none") {
    o.backPatch = { style: state.patch, ...(state.pname === "" ? {} : { name: state.pname }), ...(state.pline === "" ? {} : { line: state.pline }) };
    if (state.patch === "ijf") Object.assign(o.backPatch, { colour: state.pcolour, sewing: state.psew, ...(state.pcode === "" ? {} : { code: state.pcode }) });
    else o.backPatch.ink = state.pink;
  }
  const embroidery = [1, 2].filter((n) => state[`e${n}p`] !== "none").map((n) => ({
    place: state[`e${n}p`], text: state[`e${n}t`] || (state[`e${n}p`] === "jacket-chest" ? "柔道" : "SENSHU"), thread: state[`e${n}c`], font: state[`e${n}f`],
  }));
  if (embroidery.length > 0) o.embroidery = embroidery;
  if (state.logo !== "none") o.logos = [{ place: state.logo }];
  if (state.emblem === "placeholder") o.emblem = {};
  else if (state.emblem === "flag" && flags.get(state.flag) !== undefined) o.emblem = { svg: flags.get(state.flag) };
  if (state.label !== "none") o.label = { colour: state.label };
  if (state.brand === "1") {
    o.branding = { kanji: state.bk, colour: state.bc, ...(state.bn === "" ? {} : { name: state.bn }), ...(state.bl === "" ? {} : { line: state.bl }), ...(state.bt === "" ? {} : { sizeTag: state.bt }) };
  }
  if (embroidery.length > 0 || o.logos !== undefined || o.emblem !== undefined || o.label !== undefined || o.branding !== undefined) o.rules = state.rules;
  return o;
}

const DEFAULTS = { yaw: 0, tilt: 0, zoom: 1, patch: "none", pname: "", pcode: "", pline: "", pcolour: "blue", pink: "black", psew: "x", e1c: "navy", e1f: "block", e2c: "gold", e2f: "block", e1p: "none", e2p: "none", logo: "none", emblem: "none", flag: "ca", rules: "ijf", label: "none", brand: "0", bk: "te", bn: "", bl: "", bt: "", bc: "navy" };

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
const wrap = wrapYaw;
/** Where the zoomed stage is moved to, in pixels from its middle (not in the address). */
const pan = { x: 0, y: 0 };
/** The picture quality the canvas was last made at: it is made again when a zoom settles somewhere that wants another. */
let madeAt = { ratio: 0, scale: 0 };
const quality = () => ({ ratio: clamp(globalThis.devicePixelRatio || 1, 1, 4), scale: state.zoom > 1.8 ? 6 : state.zoom > 1.2 ? 5 : 4 });
/** The zoom and pan the canvas paints with: it is made as wide as its view, so a zoomed drawing has the room, and the camera moves inside it. */
const camera = () => ({ zoom: state.zoom, panX: pan.x, panY: pan.y });
const boxWidth = () => Math.max(0, $("judo-stage").clientWidth - 20);

let drawing = 0;
/** The judogi on the stage as a canvas that turns it, or undefined while the stage shows an SVG (a flat view). */
let painted;

/** The whole drawing, at the current angle: made off the page and painted on a canvas, then shown. A newer choice wins. */
async function draw() {
  if (state.emblem === "flag") await loadFlag(state.flag);
  const o = options();
  const mine = ++drawing;
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame(o);
  const svg = holder.firstElementChild;
  const q = quality();
  const canvas = svg === null || flat() ? undefined : await judogiCanvas(svg, { pixelRatio: q.ratio, scale: q.scale, box: { width: boxWidth(), height: 0 } });
  if (mine !== drawing) {
    canvas?.dispose();
    return;
  }
  painted?.dispose();
  painted = canvas;
  madeAt = q;
  canvas?.turn(state.yaw + (state.view === "back" ? 180 : 0), state.tilt, camera());
  if (canvas === undefined) $("judo-stage").replaceChildren(...holder.childNodes);
  else $("judo-stage").replaceChildren(canvas.canvas);
  $("judo-check").textContent = checkText(judogiCheck(o));
  for (const id of ["judo-yaw", "judo-play", "judo-front", "judo-tilt"]) $(id).disabled = flat();
  if (flat()) stop();
  showAngle();
  placeStage();
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
  $("judo-tilt-out").textContent = `${state.tilt}°`;
  $("judo-tilt").value = String(state.tilt);
}

/** The stage's zoom and pan: a transform only, so a drag or a pinch costs no drawing. Pan is kept so that the picture still covers the view. */
function placeStage() {
  const box = $("judo-turntable").getBoundingClientRect();
  const room = (state.zoom - 1) / 2;
  pan.x = state.zoom === 1 ? 0 : clamp(pan.x, -box.width * room, box.width * room);
  pan.y = state.zoom === 1 ? 0 : clamp(pan.y, -box.height * room, box.height * room);
  // A canvas zooms inside itself (sharp, and the same cost at any zoom); a flat drawing is an SVG, scaled by a transform.
  if (painted !== undefined) {
    $("judo-stage").style.transform = "";
    painted.turn(state.yaw + (state.view === "back" ? 180 : 0), state.tilt, camera());
  } else $("judo-stage").style.transform = state.zoom === 1 ? "" : `translate(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px) scale(${state.zoom.toFixed(3)})`;
  $("judo-zoom-reset").textContent = `${Number(state.zoom.toFixed(1))}×`;
  $("judo-zoom-out").disabled = state.zoom <= ZOOM_MIN + 1e-6;
  $("judo-zoom-in").disabled = state.zoom >= ZOOM_MAX - 1e-6;
}

/** Move the drawing already on the stage to the current angle, without drawing it again. */
function turnTo(yaw, tilt = state.tilt) {
  state.yaw = yaw;
  state.tilt = tilt;
  const shown = state.yaw + (state.view === "back" ? 180 : 0);
  const svg = $("judo-stage").querySelector("svg");
  if (painted !== undefined) painted.turn(shown, state.tilt, camera());
  else if (svg !== null && !flat()) judogiTurn(svg, shown, state.tilt);
  showAngle();
}

let crisp = 0;
/** After a zoom settles, draw the canvas again at the quality that zoom wants (sharper in, lighter out), keeping the angle. */
function settleQuality() {
  globalThis.clearTimeout(crisp);
  crisp = globalThis.setTimeout(() => {
    const q = quality();
    if (!flat() && (q.ratio !== madeAt.ratio || q.scale !== madeAt.scale)) draw();
  }, 350);
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
    ...[1, 2].flatMap((n) => (n === 2 && state.e1p === "none" ? [] : [
      [`judo-e${n}p`, `${say("judoEmb")} ${n}`, select(`judo-e${n}p`, ["none", ...EMBROIDERY_PLACES], (v) => say(`judoPlace_${v}`)), true],
      ...(state[`e${n}p`] === "none" ? [] : [
        [`judo-e${n}t`, say("judoEmbText"), text(`judo-e${n}t`, 24, state[`e${n}p`] === "jacket-chest" ? "柔道" : "SENSHU")],
        [`judo-e${n}c`, say("judoThread"), select(`judo-e${n}c`, THREAD_COLOURS, pair(THREAD_LABELS))],
        [`judo-e${n}f`, say("judoFont"), select(`judo-e${n}f`, EMBROIDERY_FONTS, (v) => say(`judoFont_${v}`))],
      ]),
    ])),
    ["judo-brand", say("judoBrand"), select("judo-brand", ["0", "1"], (v) => say(v === "1" ? "judoBrand_on" : "judoBrand_off")), true],
    ...(state.brand === "1" ? [
      ["judo-bk", say("judoBrandKanji"), select("judo-bk", BRAND_KANJI, (v) => `${BRAND_KANJI_LABELS[v].char}  ${say(`judoKanji_${v}`)}`)],
      ["judo-bn", say("judoBrandName"), text("judo-bn", 16, "SENSHU")],
      ["judo-bl", say("judoBrandLine"), text("judo-bl", 20, "SINCE 2026")],
      ["judo-bt", say("judoBrandTag"), text("judo-bt", 5, state.size)],
      ["judo-bc", say("judoBrandColour"), select("judo-bc", LABEL_COLOURS, pair(LABEL_COLOUR_LABELS))],
    ] : []),
    ["judo-label", say("judoLabel"), select("judo-label", ["none", ...LABEL_COLOURS], (v) => (v === "none" ? say("judoLabel_none") : pair(LABEL_COLOUR_LABELS)(v)))],
    ["judo-logo", say("judoLogo"), select("judo-logo", ["none", ...LOGO_PLACES], (v) => say(`judoLogo_${v}`))],
    ["judo-emblem", say("judoEmblem"), select("judo-emblem", ["none", "placeholder", "flag"], (v) => say(`judoEmblem_${v}`)), true],
    ...(state.emblem === "flag" ? [["judo-flag", say("judoFlag"), text("judo-flag", 6, "ca")]] : []),
    ...(state.e1p !== "none" || state.logo !== "none" || state.emblem !== "none" || state.label !== "none" || state.brand === "1" ? [["judo-rules", say("judoRules"), select("judo-rules", MARK_RULES, (v) => say(`judoRules_${v}`))]] : []),
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
$("judo-play").addEventListener("click", () => (turning.on ? stop() : play()));
// Still until a mouse comes over it: then it turns, and stops when the mouse leaves, unless it was set turning with the button. Grabbing it (a drag, the wheel, a key) stops the turn for good.
$("judo-turntable").addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" && !reduced.matches && !grabbed) play(true);
});
$("judo-turntable").addEventListener("pointerleave", () => {
  if (turning.byHover) stop();
});
let grabbed = false;
const hands = bindView($("judo-turntable"), {
  get: () => ({ yaw: state.yaw, tilt: state.tilt, zoom: state.zoom, panX: pan.x, panY: pan.y, turnable: !flat() }),
  grab() {
    grabbed = true;
    turning.byHover = false;
    stop();
  },
  set(next, final) {
    if (next.zoom !== undefined) state.zoom = next.zoom;
    if (next.panX !== undefined) pan.x = next.panX;
    if (next.panY !== undefined) pan.y = next.panY;
    if (next.yaw !== undefined || next.tilt !== undefined) turnTo(next.yaw ?? state.yaw, next.tilt ?? state.tilt);
    placeStage();
    if (final) {
      syncUrl();
      settleQuality();
    }
  },
});
$("judo-tilt").addEventListener("input", () => {
  stop();
  turnTo(state.yaw, Number($("judo-tilt").value));
  syncUrl();
});
$("judo-zoom-in").addEventListener("click", () => hands.zoomBy(1.4));
$("judo-zoom-out").addEventListener("click", () => hands.zoomBy(1 / 1.4));
$("judo-zoom-reset").addEventListener("click", () => {
  pan.x = 0;
  pan.y = 0;
  state.zoom = 1;
  placeStage();
  syncUrl();
  settleQuality();
});
$("judo-front").addEventListener("click", () => {
  stop();
  turnTo(0, 0);
  syncUrl();
});
let resizing = 0;
window.addEventListener("resize", () => {
  placeStage();
  globalThis.clearTimeout(resizing);
  resizing = globalThis.setTimeout(() => { if (!flat() && Math.abs(boxWidth() - (painted?.canvas.clientWidth ?? 0)) > 8) draw(); }, 300);
});
$("judo-svg").addEventListener("click", exportSvg);
$("judo-png").addEventListener("click", exportPng);
window.addEventListener("senshu-language", () => { controls(); draw(); syncPlay(); });
draw();
syncPlay();
