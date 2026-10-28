// Judogi designer: one options object in the address, a preview that turns in place (by a drag, the wheel, the angle slider, by hovering, or on its own), tips and zooms,
// export to SVG or PNG. A choice redraws the judogi at the angle it was at, so the camera stays where it was.
import {
  JUDOGI_BELT_RGB, JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, PATCH_COLOURS, PATCH_COLOUR_LABELS, PATCH_STYLES, ZEKKEN_INKS, ZEKKEN_INK_LABELS,
  BRAND_KANJI, BRAND_KANJI_LABELS, EMBROIDERY_FONTS, EMBROIDERY_PLACES, LABEL_COLOURS, LABEL_COLOUR_LABELS, LOGO_PLACES, MARK_RULES, THREAD_COLOURS, THREAD_LABELS, THREAD_RGB,
  beltWidthsFor, BELT_PRESETS, STRIPE_COLOURS, beltPreset, judogiCheck, judogiFrame,
} from "./dist/index.js";
import { judogiCanvas, judogiTurn } from "./dist/turn-entry.js";
import { checks, PICTURES, segmented, swatches, tiles, toggle } from "./judogiPick.js";
import { bindView, clamp, TILT_MAX, wrapYaw, ZOOM_MAX, ZOOM_MIN } from "./judogiView.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
/** The belt's width: its grade's own, or one of the widths that grade is made in (4.2, 4.5 or 4.7 cm; a maker's catalogue, see docs/judogi.md). */
const BELT_WIDTHS = ["auto", "4.2", "4.5", "4.7"];
const widthsFor = (belt) => ["auto", ...beltWidthsFor(belt).map(String)];
/** A stripe colour from the address, or none. */
function stripeColour(v) {
  return STRIPE_COLOURS.includes(v) ? v : "none";
}
/** The designer's stripe controls for a style: one of each kind (a split, a stripe along, a tip with degree bars, bars across). */
function stateOfStyle(style) {
  const first = style.tip?.ends ?? style.bars?.[0]?.ends ?? "both";
  return {
    ss: stripeColour(style.split), sc: stripeColour(style.along?.[0]?.colour),
    st: stripeColour(style.tip?.colour), stn: String(style.tip?.bars?.count ?? 0), stc: style.tip?.bars?.colour ?? "white",
    sb: stripeColour(style.bars?.[0]?.colour), sbn: String(style.bars?.[0]?.count ?? 1), se: first,
  };
}
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
  // How far the camera is tipped (degrees, up is positive) and zoomed (1 to 5): in the address, like the angle.
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
    // Thread the cloth's own colour (a tonal mark).
    [`e${n}n`, params.get(`e${n}n`) === "1" ? "1" : "0"],
  ])),
  logon: params.get("logon") === "1" ? "1" : "0",
  // The maker's logo places, none to many (the rules allow one to a garment): a comma list in the address.
  logo: (params.get("logo") ?? "").split(",").filter((p) => LOGO_PLACES.includes(p)).join(","),
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
  bw: BELT_WIDTHS.includes(params.get("bw")) ? params.get("bw") : "auto",
  // The belt's stripes: a second colour (split), a stripe along it (centre), a tip block with degree bars, bars across, and which ends carry the tip and bars.
  ss: stripeColour(params.get("ss")),
  sc: stripeColour(params.get("sc")),
  st: stripeColour(params.get("st")),
  stn: String(clamp(Number.parseInt(params.get("stn") ?? "0", 10) || 0, 0, 6)),
  stc: STRIPE_COLOURS.includes(params.get("stc")) ? params.get("stc") : "white",
  sb: stripeColour(params.get("sb")),
  sbn: String(clamp(Number.parseInt(params.get("sbn") ?? "1", 10) || 1, 1, 6)),
  se: ["both", "left", "right"].includes(params.get("se")) ? params.get("se") : "both",
};
// A named real-world arrangement in the address (`bp=half-yellow-orange`) fills the belt and its stripes, unless the address names them itself.
const named = beltPreset(params.get("bp") ?? "");
if (named !== undefined) {
  const filled = stateOfStyle(named.style);
  if (!params.has("belt")) state.belt = named.belt;
  for (const [k, v] of Object.entries(filled)) if (!params.has(k)) state[k] = v;
}

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

const logoList = () => state.logo.split(",").filter((p) => LOGO_PLACES.includes(p));

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
    place: state[`e${n}p`], text: state[`e${n}t`] || (state[`e${n}p`] === "jacket-chest" ? "柔道" : "SENSHU"), thread: state[`e${n}c`], font: state[`e${n}f`], ...(state[`e${n}n`] === "1" ? { tonal: true } : {}),
  }));
  if (embroidery.length > 0) o.embroidery = embroidery;
  if (logoList().length > 0) o.logos = logoList().map((place) => ({ place, ...(state.logon === "1" ? { tonal: true } : {}) }));
  if (state.emblem === "placeholder") o.emblem = {};
  else if (state.emblem === "flag" && flags.get(state.flag) !== undefined) o.emblem = { svg: flags.get(state.flag) };
  if (state.bw !== "auto" && widthsFor(state.belt).includes(state.bw)) o.beltWidthCm = Number(state.bw);
  const style = {};
  if (state.ss !== "none") style.split = state.ss;
  if (state.sc !== "none") style.along = [{ colour: state.sc }];
  if (state.st !== "none") style.tip = { colour: state.st, ends: state.se, ...(Number(state.stn) > 0 ? { bars: { colour: state.stc, count: Number(state.stn) } } : {}) };
  if (state.sb !== "none") style.bars = [{ colour: state.sb, count: Number(state.sbn), ends: state.se }];
  if (Object.keys(style).length > 0) o.beltStyle = style;
  if (state.label !== "none") o.label = { colour: state.label };
  if (state.brand === "1") {
    o.branding = { kanji: state.bk, colour: state.bc, ...(state.bn === "" ? {} : { name: state.bn }), ...(state.bl === "" ? {} : { line: state.bl }), ...(state.bt === "" ? {} : { sizeTag: state.bt }) };
  }
  if (embroidery.length > 0 || o.logos !== undefined || o.emblem !== undefined || o.label !== undefined || o.branding !== undefined) o.rules = state.rules;
  return o;
}

const DEFAULTS = { yaw: 0, tilt: 0, zoom: 1, patch: "none", pname: "", pcode: "", pline: "", pcolour: "blue", pink: "black", psew: "x", e1c: "navy", e1f: "block", e1n: "0", e2c: "gold", e2f: "block", e2n: "0", logon: "0", e1p: "none", e2p: "none", logo: "", emblem: "none", flag: "ca", rules: "ijf", label: "none", brand: "0", bk: "te", bn: "", bl: "", bt: "", bc: "navy", bw: "auto", ss: "none", sc: "none", st: "none", stn: "0", stc: "white", sb: "none", sbn: "1", se: "both" };

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) {
    if (String(v) === "" || (k === "yaw" && (Number(v) === 0 || turning.on))) continue;
    if (k in DEFAULTS && String(v) === String(DEFAULTS[k])) continue;
    q.set(k, String(v));
  }
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

/** The tip the package is given: the designer's Tilt is positive when the FRONT of the piece goes up (a drag up, the wheel up, Arrow Up, the slider toward its top), the package's is positive when the piece is seen more from above. */
const pitchOf = () => (state.tilt === 0 ? 0 : -state.tilt);
const flat = () => state.view === "flat" || state.view === "flat-back";
const wrap = wrapYaw;
/** Where the zoomed stage is moved to, in pixels from its middle (not in the address). */
const pan = { x: 0, y: 0 };
/** The picture quality the canvas was last made at: it is made again when a zoom settles somewhere that wants another. */
let madeAt = { ratio: 0, scale: 0 };
const quality = () => ({ ratio: clamp(globalThis.devicePixelRatio || 1, 1, 4), scale: state.zoom > 3.5 ? 8 : state.zoom > 1.8 ? 6 : state.zoom > 1.2 ? 5 : 4 });
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
  canvas?.turn(state.yaw + (state.view === "back" ? 180 : 0), pitchOf(), camera());
  if (canvas === undefined) $("judo-stage").replaceChildren(...holder.childNodes);
  else $("judo-stage").replaceChildren(canvas.canvas);
  $("judo-check").textContent = checkText(judogiCheck(o));
  // A flat layout is a drawing: its turn and tilt controls are taken away, with a line to say why, rather than greyed.
  $("judo-turnbar").hidden = flat();
  $("judo-tiltbar").hidden = flat();
  $("judo-flat-note").hidden = !flat();
  if (flat()) stop();
  showAngle();
  placeStage();
}

/** What the size check found, in the page's language: the facts themselves are English, so the Japanese page says only whether the size meets them. */
function checkText(check) {
  const head = `${say("judoOk")}: ${check.heightCm} cm.`;
  if (lang() === "ja") {
    // The facts are English; the one thing a Japanese page must say is that a mark was left out for want of room.
    const left = check.notes.filter((n) => !n.met && n.id.startsWith("skipped-")).length;
    return check.ok ? head : left > 0 ? say("judoSkipped") : "";
  }
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
    painted.turn(state.yaw + (state.view === "back" ? 180 : 0), pitchOf(), camera());
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
  if (painted !== undefined) painted.turn(shown, pitchOf(), camera());
  else if (svg !== null && !flat()) judogiTurn(svg, shown, pitchOf());
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

/** A list of places grouped by garment: `groups` is `[title, [value, ...]]`, and the first value ("none") stands alone above them. */
function groupedSelect(id, first, groups, labels) {
  const el = select(id, [first], labels);
  for (const [title, values] of groups) {
    const g = document.createElement("optgroup");
    g.label = title;
    for (const value of values) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = labels(value);
      if (state[id.replace("judo-", "")] === value) opt.selected = true;
      g.append(opt);
    }
    el.append(g);
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

/** The names of the stripe colours, in the page's language. */
const STRIPE_NAMES = Object.fromEntries(STRIPE_COLOURS.map((c) => [c, () => say(`judoColourName_${c}`)]));
const pair = (labels) => (v) => (lang() === "ja" ? labels[v].ja : labels[v].en);


const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const CLOTH_CSS = { white: "#f4f2ec", blue: "#27489e" };
const PATCH_CSS = { blue: "#1b3a8c", gold: "#c4981e", red: "#b61824", black: "#16181f", white: "#f6f4ee" };
const INK_CSS = { black: "#15181f", vermilion: "#c9361c" };
const LABEL_CSS = { navy: "#1d2b4f", forest: "#1f4d3a", black: "#181818", wine: "#6e1d2c", cream: "#efe6cf" };
const STRIPE_EXTRA = { grey: "#8a8c92", purple: "#68348c", gold: "#c9a030" };
const beltCss = (v) => (v === "red-white" ? "linear-gradient(90deg, #b21622 50%, #f4f2ea 50%)" : JUDOGI_BELT_RGB[v] === undefined ? STRIPE_EXTRA[v] : rgb(JUDOGI_BELT_RGB[v]));
/** Fill the belt and its stripe controls from a real system's arrangement. */
function applyPreset(id) {
  const p = beltPreset(id);
  if (p === undefined) return;
  Object.assign(state, { belt: p.belt, ...stateOfStyle(p.style) });
  syncUrl();
  controls();
  draw();
}

/** Which garments each display mode draws: a control is shown only where it changes what is on the stage. */
const GARMENTS = { pieces: ["jacket", "pants", "belt"], suit: ["jacket", "pants", "belt"], jacket: ["jacket", "belt"], pants: ["pants"], belt: ["belt"] };
const has = (garment) => GARMENTS[state.mode].includes(garment);
const garmentOf = (place) => (place.startsWith("pants") ? "pants" : place.startsWith("belt") ? "belt" : "jacket");

/** One control in the form: its section's heading key, its id, its label and the element. */
const field = (section, id, label, node) => ({ section, id, label, node });

/** The controls, in groups. A control that does not change what the current display mode draws is not shown (its value stays in the address). */
function rows() {
  const ijf = state.patch === "ijf";
  const zekken = state.patch === "zekken";
  const jacket = has("jacket");
  const set = (key, rebuild = false) => (value) => change(key, value, rebuild);
  const out = [];
  const G = "judoG_garment";
  out.push(field(G, "judo-mode", say("judoMode"), tiles({ id: "judo-mode", label: say("judoMode"), values: JUDOGI_MODES, current: state.mode, picture: (v) => PICTURES.mode[v], name: (v) => say(`judoMode_${v}`), onPick: set("mode", true), wide: true })));
  out.push(field(G, "judo-view", say("judoView"), segmented({ id: "judo-view", label: say("judoView"), values: JUDOGI_VIEWS, current: state.view, name: (v) => say(`judoView_${v}`), onPick: set("view") })));
  if (has("jacket") || has("pants")) out.push(field(G, "judo-colour", say("judoColour"), swatches({ id: "judo-colour", label: say("judoColour"), values: JUDOGI_COLOURS, current: state.colour, css: (v) => CLOTH_CSS[v], name: (v) => say(v === "blue" ? "judoBlue" : "judoWhite"), onPick: set("colour") })));
  if (has("belt")) out.push(field(G, "judo-belt", say("judoBelt"), swatches({ id: "judo-belt", label: say("judoBelt"), values: JUDOGI_BELTS, current: state.belt, css: beltCss, name: beltLabel, onPick: (v) => { if (!widthsFor(v).includes(state.bw)) state.bw = "auto"; set("belt", true)(v); } })));
  if (has("belt")) out.push(field(G, "judo-belt-width", say("judoBeltWidth"), segmented({ id: "judo-belt-width", label: say("judoBeltWidth"), values: widthsFor(state.belt), current: state.bw, name: (v) => (v === "auto" ? say("judoBeltWidth_auto") : `${v} cm`), onPick: set("bw") })));
  if (has("belt")) {
    const S = "judoG_stripes";
    const swatchOf = (key, values, rebuild = false) => swatches({ id: `judo-${key}`, label: say(`judoStripe_${key}`), values, current: state[key], css: beltCss, name: (v) => (v === "none" ? say("judoStripe_none") : STRIPE_NAMES[v]()), onPick: set(key, rebuild) });
    const preset = document.createElement("select");
    preset.id = "judo-preset";
    preset.className = "fam-field";
    preset.dataset.testid = "judo-preset";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = say("judoStripe_pick");
    preset.append(first);
    for (const sys of [...new Set(BELT_PRESETS.map((p) => p.system))]) {
      const group = document.createElement("optgroup");
      group.label = sys;
      for (const p of BELT_PRESETS.filter((q) => q.system === sys)) {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.label;
        group.append(opt);
      }
      preset.append(group);
    }
    out.push(field(S, "judo-preset", say("judoStripe_preset"), preset));
    out.push(field(S, "judo-ss", say("judoStripe_ss"), swatchOf("ss", ["none", ...STRIPE_COLOURS])));
    out.push(field(S, "judo-sc", say("judoStripe_sc"), swatchOf("sc", ["none", ...STRIPE_COLOURS])));
    out.push(field(S, "judo-st", say("judoStripe_st"), swatchOf("st", ["none", ...STRIPE_COLOURS], true)));
    if (state.st !== "none") {
      out.push(field(S, "judo-stn", say("judoStripe_stn"), segmented({ id: "judo-stn", label: say("judoStripe_stn"), values: ["0", "1", "2", "3", "4", "5", "6"], current: state.stn, name: (v) => v, onPick: set("stn", true) })));
      if (state.stn !== "0") out.push(field(S, "judo-stc", say("judoStripe_stc"), swatchOf("stc", STRIPE_COLOURS)));
    }
    out.push(field(S, "judo-sb", say("judoStripe_sb"), swatchOf("sb", ["none", ...STRIPE_COLOURS], true)));
    if (state.sb !== "none") out.push(field(S, "judo-sbn", say("judoStripe_sbn"), segmented({ id: "judo-sbn", label: say("judoStripe_sbn"), values: ["1", "2", "3", "4", "5", "6"], current: state.sbn, name: (v) => v, onPick: set("sbn") })));
    if (state.st !== "none" || state.sb !== "none") out.push(field(S, "judo-se", say("judoStripe_se"), segmented({ id: "judo-se", label: say("judoStripe_se"), values: ["both", "left", "right"], current: state.se, name: (v) => say(`judoStripe_se_${v}`), onPick: set("se") })));
  }
  out.push(field(G, "judo-size", say("judoSize"), select("judo-size", JUDOGI_SIZES, (v) => v)));

  if (jacket) {
    const P = "judoPatch";
    out.push(field(P, "judo-patch", say("judoPatch"), tiles({ id: "judo-patch", label: say("judoPatch"), values: PATCH_STYLES, current: state.patch, picture: (v) => PICTURES.patch[v], name: (v) => say(`judoPatch_${v}`), onPick: set("patch", true) })));
    if (ijf || zekken) out.push(field(P, "judo-pname", say(zekken ? "judoPatchSurname" : "judoPatchName"), text("judo-pname", 24, zekken ? "山田" : "A. ATHLETE")));
    if (ijf) out.push(field(P, "judo-pcode", say("judoPatchCode"), text("judo-pcode", 3, "SJF")));
    if (ijf || zekken) out.push(field(P, "judo-pline", say(zekken ? "judoPatchAffiliation" : "judoPatchLine"), text("judo-pline", 28, "")));
    if (ijf) out.push(field(P, "judo-pcolour", say("judoPatchColour"), swatches({ id: "judo-pcolour", label: say("judoPatchColour"), values: PATCH_COLOURS, current: state.pcolour, css: (v) => PATCH_CSS[v], name: pair(PATCH_COLOUR_LABELS), onPick: set("pcolour") })));
    if (ijf) out.push(field(P, "judo-psew", say("judoPatchSewing"), tiles({ id: "judo-psew", label: say("judoPatchSewing"), values: ["x", "lines"], current: state.psew, picture: (v) => PICTURES.sewing[v], name: (v) => say(`judoPatchSewing_${v}`), onPick: set("psew") })));
    if (zekken) out.push(field(P, "judo-pink", say("judoPatchInk"), swatches({ id: "judo-pink", label: say("judoPatchInk"), values: ZEKKEN_INKS, current: state.pink, css: (v) => INK_CSS[v], name: pair(ZEKKEN_INK_LABELS), onPick: set("pink") })));
  }

  // Embroidery: only the places of the garments on show.
  const places = EMBROIDERY_PLACES.filter((p) => has(garmentOf(p)));
  const E = "judoEmb";
  for (const n of [1, 2]) {
    const here = state[`e${n}p`];
    const shown = here !== "none" && places.includes(here);
    if (n === 2 && !(state.e1p !== "none" && places.includes(state.e1p))) continue;
    out.push(field(E, `judo-e${n}p`, `${say("judoEmb")} ${n}`, groupedSelect(`judo-e${n}p`, "none", ["jacket", "pants", "belt"].filter(has).map((g) => [say(`judoMode_${g}`), places.filter((p) => garmentOf(p) === g)]), (v) => say(`judoPlace_${v}`))));
    if (!shown) continue;
    out.push(field(E, `judo-e${n}t`, say("judoEmbText"), text(`judo-e${n}t`, 24, here === "jacket-chest" ? "柔道" : "SENSHU")));
    out.push(field(E, `judo-e${n}n`, say("judoTonal"), toggle({ id: `judo-e${n}n`, label: say("judoTonal"), on: state[`e${n}n`] === "1", words: { on: say("judoTonal_on"), off: say("judoTonal_off") }, onChange: (on) => change(`e${n}n`, on ? "1" : "0", true) })));
    if (state[`e${n}n`] !== "1") out.push(field(E, `judo-e${n}c`, say("judoThread"), swatches({ id: `judo-e${n}c`, label: say("judoThread"), values: THREAD_COLOURS, current: state[`e${n}c`], css: (v) => rgb(THREAD_RGB[v]), name: pair(THREAD_LABELS), onPick: set(`e${n}c`) })));
    out.push(field(E, `judo-e${n}f`, say("judoFont"), segmented({ id: `judo-e${n}f`, label: say("judoFont"), values: EMBROIDERY_FONTS, current: state[`e${n}f`], name: (v) => say(`judoFont_${v}`), onPick: set(`e${n}f`) })));
  }

  // Logos, the emblem and the label.
  const M = "judoG_marks";
  const logoGroups = ["jacket", "pants", "belt"].filter(has).map((g) => [say(`judoMode_${g}`), LOGO_PLACES.filter((p) => garmentOf(p) === g)]);
  const logoBox = document.createElement("div");
  logoBox.append(checks({ id: "judo-logo", label: say("judoLogo"), groups: logoGroups, chosen: logoList(), name: (v) => say(`judoLogo_${v}`), onChange: (list) => change("logo", list.join(",")) }));
  const note = document.createElement("p");
  note.className = "fam-fine judo-note";
  note.dataset.testid = "judo-logo-note";
  note.textContent = say("judoLogoNote");
  logoBox.append(note);
  logoBox.append(toggle({ id: "judo-logon", label: say("judoLogoTonal"), on: state.logon === "1", words: { on: say("judoLogoTonal_on"), off: say("judoLogoTonal_off") }, onChange: (on) => change("logon", on ? "1" : "0") }));
  out.push(field(M, "judo-logos", say("judoLogo"), logoBox));
  if (jacket) {
    out.push(field(M, "judo-emblem", say("judoEmblem"), tiles({ id: "judo-emblem", label: say("judoEmblem"), values: ["none", "placeholder", "flag"], current: state.emblem, picture: (v) => PICTURES.emblem[v], name: (v) => say(`judoEmblem_${v}`), onPick: set("emblem", true) })));
    if (state.emblem === "flag") out.push(field(M, "judo-flag", say("judoFlag"), text("judo-flag", 6, "ca")));
  }
  out.push(field(M, "judo-label", say("judoLabel"), swatches({ id: "judo-label", label: say("judoLabel"), values: ["none", ...LABEL_COLOURS], current: state.label, css: (v) => LABEL_CSS[v], name: (v) => (v === "none" ? say("judoLabel_none") : pair(LABEL_COLOUR_LABELS)(v)), onPick: set("label") })));

  // Branding: one switch, and what it carries.
  const B = "judoG_brand";
  const brandOn = state.brand === "1";
  out.push(field(B, "judo-brand", say("judoBrand"), toggle({ id: "judo-brand", label: say("judoBrand"), on: brandOn, words: { on: say("judoBrand_on"), off: say("judoBrand_off") }, onChange: (on) => change("brand", on ? "1" : "0", true) })));
  if (brandOn) {
    if (jacket) {
      out.push(field(B, "judo-bk", say("judoBrandKanji"), tiles({ id: "judo-bk", label: say("judoBrandKanji"), values: BRAND_KANJI, current: state.bk, picture: (v) => BRAND_KANJI_LABELS[v].char, name: (v) => say(`judoKanji_${v}`), onPick: set("bk") })));
      out.push(field(B, "judo-bn", say("judoBrandName"), text("judo-bn", 16, "SENSHU")));
      out.push(field(B, "judo-bl", say("judoBrandLine"), text("judo-bl", 20, "SINCE 2026")));
      out.push(field(B, "judo-bt", say("judoBrandTag"), text("judo-bt", 5, state.size)));
    }
    out.push(field(B, "judo-bc", say("judoBrandColour"), swatches({ id: "judo-bc", label: say("judoBrandColour"), values: LABEL_COLOURS, current: state.bc, css: (v) => LABEL_CSS[v], name: pair(LABEL_COLOUR_LABELS), onPick: set("bc") })));
  }

  const marked = (state.e1p !== "none" && places.includes(state.e1p)) || logoList().length > 0 || (jacket && state.emblem !== "none") || state.label !== "none" || brandOn;
  if (marked) out.push(field(B, "judo-rules", say("judoRules"), segmented({ id: "judo-rules", label: say("judoRules"), values: MARK_RULES, current: state.rules, name: (v) => say(`judoRules_${v}`), onPick: set("rules") })));
  return out;
}

/** A choice was made: keep it, put it in the address, build the form again where it changes which controls apply, and draw. */
function change(key, value, rebuild = false) {
  state[key] = value;
  syncUrl();
  if (rebuild) controls();
  draw();
}

let typing = 0;
function controls() {
  const box = $("judo-controls");
  // The control that has focus is found again after the form is built anew, so a keyboard or a screen reader keeps its place.
  const active = document.activeElement;
  const where = active !== null && box.contains(active) ? { id: active.closest("[data-testid]")?.dataset.testid, value: active.dataset.value } : undefined;
  box.replaceChildren();
  let section;
  for (const { section: s, id, label, node } of rows()) {
    if (s !== section) {
      section = s;
      const h = document.createElement("h3");
      h.textContent = say(s);
      box.append(h);
    }
    const row = document.createElement("div");
    row.className = "judo-field";
    if (node.tagName === "SELECT" || node.tagName === "INPUT") {
      const lab = document.createElement("label");
      lab.htmlFor = id;
      lab.className = "judo-line";
      const span = document.createElement("span");
      span.className = "judo-label";
      span.textContent = label;
      lab.append(span, node);
      row.append(lab);
      node.addEventListener(node.tagName === "INPUT" ? "input" : "change", () => {
        if (id === "judo-preset") return applyPreset(node.value);
        state[id.replace("judo-", "")] = node.value;
        syncUrl();
        if (node.tagName === "SELECT") {
          // Embroidery's place changes which controls apply.
          if (/^judo-e[12]p$/.test(id)) controls();
          draw();
        } else {
          globalThis.clearTimeout(typing);
          typing = globalThis.setTimeout(draw, 250);
        }
      });
    } else {
      const span = document.createElement("span");
      span.className = "judo-label";
      span.textContent = label;
      row.append(span, node);
    }
    box.append(row);
  }
  if (where?.id !== undefined) {
    const sel = `[data-testid="${where.id}"]${where.value === undefined ? "" : ` [data-value="${where.value}"]`}`;
    (box.querySelector(sel) ?? box.querySelector(`[data-testid="${where.id}"]`))?.focus({ preventScroll: true });
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
