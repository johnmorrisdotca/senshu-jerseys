// Judogi designer: one options object in the address, a preview that turns in place (by a drag, the wheel, the angle slider, by hovering, or on its own), tips and zooms,
// export to SVG or PNG. A choice redraws the judogi at the angle it was at, so the camera stays where it was.
import {
  JUDOGI_BELT_RGB, JUDOGI_BELTS, JUDOGI_BELT_LABELS, JUDOGI_COLOURS, JUDOGI_MODES, JUDOGI_SIZES, JUDOGI_VIEWS, PATCH_COLOURS, PATCH_COLOUR_LABELS, PATCH_STYLES, ZEKKEN_INKS, ZEKKEN_INK_LABELS,
  BRAND_KANJI, BRAND_KANJI_LABELS, EMBROIDERY_FONTS, EMBROIDERY_PLACES, LABEL_COLOURS, LABEL_COLOUR_LABELS, LOGO_PLACES, MARK_RULES, THREAD_COLOURS, THREAD_LABELS, THREAD_RGB,
  beltWidthsFor, beltStitchLinesFor, beltThicknessesFor, beltCoversFor, BELT_PRESETS, STRIPE_COLOURS, beltPreset, judogiCheck, judogiFrame,
  BELT_SIZES, BOX_STATES, BOX_TYPES, KIRI_WOODS, beltSizeForJudogi, boxSizeFor, KARATE_CUTS, KARATE_SLEEVES, DOBOK_CUTS, DOBOK_GRADES, NATION_PLACES, NATION_STYLES, fontToPath,
} from "./dist/index.js";
import { judogiCanvas, judogiTurn } from "./dist/turn-entry.js";
import { checks, PICTURES, segmented, swatches, tiles, toggle } from "./judogiPick.js";
import { clamp, fillView, viewSize } from "./judogiView.js";
import { createAddressState } from "./kazoku-ui/address-state/index.js";
import { saveImage } from "./kazoku-ui/save-image/index.js";
import "./kazoku-ui/view-controls/define.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const bar = $("judo-bar");
const params = new URLSearchParams(location.search);
/** The belt's width: its grade's own, or one of the widths that grade is made in (4.2, 4.5 or 4.7 cm; a maker's catalogue, see docs/judogi.md). */
const BELT_WIDTHS = ["auto", "4.2", "4.5", "4.7"];
/** The rows of stitching, thicknesses and covers a belt of this colour is made with, each with "auto" (the package's own) first. */
const rowsFor = (belt) => ["auto", ...beltStitchLinesFor(belt).map(String)];
const thicknessFor = (belt) => ["auto", ...beltThicknessesFor(belt)];
const coverFor = (belt) => ["auto", ...beltCoversFor(belt)];
const widthsFor = (belt) => ["auto", ...beltWidthsFor(belt).map(String)];
const HEMS = ["2", "5", "10"];
/** An ITF black belt's degree: none, or 1 to 9 (the ITF's black stripes on the sleeves and trousers are for the 4th to 6th). */
const DOBOK_DEGREES = ["none", ...Array.from({ length: 9 }, (_, i) => String(i + 1))];
/** The country's letters as typed, kept to letters and capitals; the package takes 2 to 4. */
const nationCode = (value) => value.replace(/[^\p{L}]/gu, "").toUpperCase().slice(0, 4);
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
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  colour: JUDOGI_COLOURS.includes(params.get("colour")) ? params.get("colour") : "white",
  belt: JUDOGI_BELTS.includes(params.get("belt")) ? params.get("belt") : "white",
  mode: JUDOGI_MODES.includes(params.get("mode")) ? params.get("mode") : "pieces",
  view: JUDOGI_VIEWS.includes(params.get("view")) ? params.get("view") : "front",
  size: JUDOGI_SIZES.includes(params.get("size")) ? params.get("size") : "170",
  // The camera (angle, tip, zoom, what a drag does) is the view controls': read from them, kept in the address by them.
  yaw: bar.state.yaw,
  tilt: bar.state.tilt,
  zoom: bar.state.zoom,
  drag: bar.state.drag,
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
    // The name of the font file the lines were set in and the way they run: never the font itself, which stays in this browser and is picked again after a reload.
    [`e${n}file`, (params.get(`e${n}file`) ?? "").slice(0, 80)],
    [`e${n}dir`, params.get(`e${n}dir`) === "down" ? "down" : "across"],
  ])),
  // The country's letters on the shoulder: the code (2 to 4 letters), thread or print, the shoulder, the colour of the letters and of a printed band.
  nc: (params.get("nc") ?? "").slice(0, 4),
  ns: NATION_STYLES.includes(params.get("ns")) ? params.get("ns") : "embroidery",
  np: NATION_PLACES.includes(params.get("np")) ? params.get("np") : "shoulder-left",
  ni: THREAD_COLOURS.includes(params.get("ni")) ? params.get("ni") : "none",
  nb: THREAD_COLOURS.includes(params.get("nb")) ? params.get("nb") : "none",
  // How far above the ankle bone the trousers stop: 2 cm (the IBJJF's), 5 (the IJF's) or 10.
  hem: HEMS.includes(params.get("hem")) ? params.get("hem") : "5",
  logon: params.get("logon") === "1" ? "1" : "0",
  // The maker's logo places, none to many (the rules allow one to a garment): a comma list in the address.
  logo: (params.get("logo") ?? "").split(",").filter((p) => LOGO_PLACES.includes(p)).join(","),
  emblem: ["placeholder", "flag", "kodokan"].includes(params.get("emblem")) ? params.get("emblem") : "none",
  // How the emblem is made (a flag patch, with the country's name under it, or a white square with a word in script), the words, and where it is sewn.
  ems: ["flag", "named", "square"].includes(params.get("ems")) ? params.get("ems") : "flag",
  emc: (params.get("emc") ?? "").slice(0, 16),
  emp: ["chest", "sleeve-left", "sleeve-right"].includes(params.get("emp")) ? params.get("emp") : "chest",
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
  // The belt's rows of stitching, thickness and cover, as a belt of its colour is made (checked against the colour where they are used).
  sl: params.get("sl") ?? "auto",
  th: params.get("th") ?? "auto",
  cv: params.get("cv") ?? "auto",
  // The belt's end tags (a maker's label, a size tag, a white tag) on or off, the end they are on, and the number of grade lines.
  tg: params.get("tg") === "1" ? "1" : "0",
  te: params.get("te") === "left" ? "left" : "right",
  gl: String(clamp(Number.parseInt(params.get("gl") ?? "0", 10) || 0, 0, 10)),
  // The belt's stripes: a second colour (split), a stripe along it (centre), a tip block with degree bars, bars across, and which ends carry the tip and bars.
  ss: stripeColour(params.get("ss")),
  sc: stripeColour(params.get("sc")),
  st: stripeColour(params.get("st")),
  stn: String(clamp(Number.parseInt(params.get("stn") ?? "0", 10) || 0, 0, 6)),
  stc: STRIPE_COLOURS.includes(params.get("stc")) ? params.get("stc") : "white",
  sb: stripeColour(params.get("sb")),
  sbn: String(clamp(Number.parseInt(params.get("sbn") ?? "1", 10) || 1, 1, 6)),
  se: ["both", "left", "right"].includes(params.get("se")) ? params.get("se") : "both",
  // The folded belt and the belt's gift box: the belt's size ("auto" goes with the judogi's), the box (kiri or silver), its state, the words on its lid, the wood's tone, a box size of its own and the shop's paper band.
  bsz: BELT_SIZES.some((s) => String(s.size) === params.get("bsz")) ? params.get("bsz") : "auto",
  bxt: BOX_TYPES.includes(params.get("bxt")) ? params.get("bxt") : "kiri",
  bxs: BOX_STATES.includes(params.get("bxs")) ? params.get("bxs") : "closed",
  bxx: (params.get("bxx") ?? "").slice(0, 6),
  bxw: KIRI_WOODS.includes(params.get("bxw")) ? params.get("bxw") : "natural",
  bxz: ["2", "3", "4", "5", "6"].includes(params.get("bxz")) ? params.get("bxz") : "auto",
  bnd: params.get("bnd") === "1" ? "1" : "0",
  // The karate gi: on or off, how far down the arm the sleeve goes, the cut, the characters down the chest ("" is the cut's own) and which round patches.
  kg: params.get("kg") === "1" ? "1" : "0",
  ks: KARATE_SLEEVES.includes(params.get("ks")) ? params.get("ks") : "full",
  kc: KARATE_CUTS.includes(params.get("kc")) ? params.get("kc") : "training",
  kt: (params.get("kt") ?? "").slice(0, 4),
  kp: ["both", "sleeve", "leg", "none"].includes(params.get("kp")) ? params.get("kp") : "auto",
  // The taekwondo dobok (instead of the karate gi): on or off, the cut, the grade whose collar and trim it takes, an ITF black belt's degree and whether it is worn in competition.
  dg: params.get("dg") === "1" && params.get("kg") !== "1" ? "1" : "0",
  dc: DOBOK_CUTS.includes(params.get("dc")) ? params.get("dc") : "wt",
  dgr: DOBOK_GRADES.includes(params.get("dgr")) ? params.get("dgr") : "kup",
  dd: DOBOK_DEGREES.includes(params.get("dd")) ? params.get("dd") : "none",
  dk: params.get("dk") === "1" ? "1" : "0",
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

/** The font files picked for the two embroidery lines (they stay in this browser), what fontToPath said of each, and why the last file was refused. */
const fonts = {};
const fontInfo = { 1: {}, 2: {} };
const fontError = { 1: "", 2: "" };

/** A line's words as outlines of the font file picked for it, or undefined when there is no file (or no usable outline): the line then says why and the package's own lettering is used. */
function fontPath(n, words) {
  const info = (fontInfo[n] = {});
  if (fonts[n] === undefined) return undefined;
  try {
    const p = fontToPath(fonts[n].bytes, words, { direction: state[`e${n}dir`] });
    if (p.missing.length > 0) info.missing = [...new Set(p.missing)].join(" ");
    if (p.d === "") info.none = true;
    return p.d === "" ? undefined : { d: p.d, width: p.width, height: p.height };
  } catch (error) {
    info.error = error.message;
    return undefined;
  }
}

/** The line under each font picker: a refused file, a file to pick again after a reload, characters the font lacks. */
function showFontNotes() {
  for (const n of [1, 2]) {
    const note = document.querySelector(`[data-testid="judo-e${n}ff-note"]`);
    if (note === null) continue;
    const bad = fontError[n] || fontInfo[n].error || "";
    note.dataset.error = bad === "" ? "" : "1";
    if (bad !== "") note.textContent = bad;
    else if (fonts[n] === undefined && state[`e${n}file`] !== "") note.textContent = `${say("judoFontAgain")}: ${state[`e${n}file`]}`;
    else if (fontInfo[n].none) note.textContent = say("judoFontNone");
    else if (fontInfo[n].missing) note.textContent = `${say("judoFontMissing")}: ${fontInfo[n].missing}`;
    else note.textContent = "";
  }
}

/** A short fingerprint of the drawing the package returned, on the stage, so that a test can tell the drawing changed. */
function fingerprint(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const logoList = () => state.logo.split(",").filter((p) => LOGO_PLACES.includes(p));

/** The turn the pointer's arrival started, and whether a hand has taken hold since (a grab stops the turn for good). */
let byHover = false;
let grabbed = false;

/** The options the package takes, made from the page's state. A word left empty is the package's own default. */
function options() {
  const o = { colour: state.colour, belt: state.belt, mode: state.mode, view: state.view, size: state.size, language: lang() === "ja" ? "ja" : "en", yaw: state.yaw, width: 360 };
  if (state.patch !== "none") {
    o.backPatch = { style: state.patch, ...(state.pname === "" ? {} : { name: state.pname }), ...(state.pline === "" ? {} : { line: state.pline }) };
    if (state.patch === "ijf") Object.assign(o.backPatch, { colour: state.pcolour, sewing: state.psew, ...(state.pcode === "" ? {} : { code: state.pcode }) });
    else o.backPatch.ink = state.pink;
  }
  const embroidery = [1, 2].filter((n) => state[`e${n}p`] !== "none").map((n) => {
    const words = state[`e${n}t`] || (state[`e${n}p`] === "jacket-chest" ? "柔道" : "SENSHU");
    const path = fontPath(n, words);
    return { place: state[`e${n}p`], ...(path === undefined ? { text: words, font: state[`e${n}f`] } : { path }), thread: state[`e${n}c`], ...(state[`e${n}n`] === "1" ? { tonal: true } : {}) };
  });
  if (embroidery.length > 0) o.embroidery = embroidery;
  if (logoList().length > 0) o.logos = logoList().map((place) => ({ place, ...(state.logon === "1" ? { tonal: true } : {}) }));
  if (state.emblem === "placeholder") o.emblem = {};
  else if (state.emblem === "kodokan") o.emblem = { mark: "kodokan" };
  else if (state.emblem === "flag" && flags.get(state.flag) !== undefined) o.emblem = { svg: flags.get(state.flag) };
  if (o.emblem !== undefined) {
    o.emblem.place = state.emp;
    if (state.ems !== "flag") {
      o.emblem.caption = state.emc || (state.ems === "square" ? "Nippon" : state.emblem === "kodokan" ? "KODOKAN" : state.flag.toUpperCase().slice(0, 16) || "CANADA");
      o.emblem.style = state.ems;
    }
  }
  if (state.bw !== "auto" && widthsFor(state.belt).includes(state.bw)) o.beltWidthCm = Number(state.bw);
  if (state.sl !== "auto" && rowsFor(state.belt).includes(state.sl)) o.beltStitchLines = Number(state.sl);
  if (state.th !== "auto" && thicknessFor(state.belt).includes(state.th)) o.beltThickness = state.th;
  if (state.cv !== "auto" && coverFor(state.belt).includes(state.cv)) o.beltCover = state.cv;
  if (state.tg === "1" || Number(state.gl) > 0) o.beltTags = { end: state.te, maker: state.tg === "1", gradeLines: Number(state.gl) };
  const style = {};
  if (state.ss !== "none") style.split = state.ss;
  if (state.sc !== "none") style.along = [{ colour: state.sc }];
  if (state.st !== "none") style.tip = { colour: state.st, ends: state.se, ...(Number(state.stn) > 0 ? { bars: { colour: state.stc, count: Number(state.stn) } } : {}) };
  if (state.sb !== "none") style.bars = [{ colour: state.sb, count: Number(state.sbn), ends: state.se }];
  if (Object.keys(style).length > 0) o.beltStyle = style;
  if (state.kg === "1") {
    o.karate = { sleeve: state.ks, cut: state.kc };
    if (state.kt !== "") o.karate.text = state.kt;
    if (state.kp === "both" || state.kp === "none") o.karate.patches = state.kp === "both";
    else if (state.kp !== "auto") o.karate.patches = { [state.kp === "sleeve" ? "leg" : "sleeve"]: false };
  }
  if (state.dg === "1" && state.kg !== "1") {
    o.dobok = { cut: state.dc, grade: state.dgr };
    if (state.dc === "itf" && state.dgr === "dan" && state.dd !== "none") {
      o.dobok.dan = Number(state.dd);
      if (state.dk === "1") o.dobok.competition = true;
    }
  }
  if (nationCode(state.nc).length >= 2) {
    o.nation = { code: nationCode(state.nc), style: state.ns, place: state.np };
    if (state.ni !== "none") o.nation[state.ns === "print" ? "ink" : "thread"] = state.ni;
    if (state.ns === "print" && state.nb !== "none") o.nation.band = state.nb;
  }
  if (state.hem !== "5") o.hemAboveAnkleCm = Number(state.hem);
  if (state.label !== "none") o.label = { colour: state.label };
  if (state.brand === "1") {
    o.branding = { kanji: state.bk, colour: state.bc, ...(state.bn === "" ? {} : { name: state.bn }), ...(state.bl === "" ? {} : { line: state.bl }), ...(state.bt === "" ? {} : { sizeTag: state.bt }) };
  }
  if (solid()) {
    if (state.bsz !== "auto") o.beltSize = Number(state.bsz);
    if (state.mode === "box") {
      Object.assign(o, { boxType: state.bxt, boxState: state.bxs, boxWood: state.bxw });
      if (state.bxx !== "") o.boxText = state.bxx;
      if (state.bxz !== "auto") o.boxSize = Number(state.bxz);
    } else if (state.bnd === "1") o.band = true;
  }
  if (embroidery.length > 0 || o.logos !== undefined || o.emblem !== undefined || o.nation !== undefined || o.label !== undefined || o.branding !== undefined) o.rules = state.rules;
  return o;
}

const DEFAULTS = { yaw: 0, tilt: 0, zoom: 1, drag: "move", patch: "none", pname: "", pcode: "", pline: "", pcolour: "blue", pink: "black", psew: "x", e1c: "navy", e1f: "block", e1n: "0", e1dir: "across", e2c: "gold", e2f: "block", e2n: "0", e2dir: "across", ns: "embroidery", np: "shoulder-left", ni: "none", nb: "none", hem: "5", logon: "0", e1p: "none", e2p: "none", logo: "", emblem: "none", ems: "flag", emc: "", emp: "chest", flag: "ca", rules: "ijf", label: "none", brand: "0", bk: "te", bn: "", bl: "", bt: "", bc: "navy", bw: "auto", sl: "auto", th: "auto", cv: "auto", bsz: "auto", bxt: "kiri", bxs: "closed", bxx: "", bxw: "natural", bxz: "auto", bnd: "0", kg: "0", ks: "full", kc: "training", kt: "", kp: "auto", dg: "0", dc: "wt", dgr: "kup", dd: "none", dk: "0", ss: "none", sc: "none", st: "none", stn: "0", stc: "white", sb: "none", sbn: "1", se: "both" };

const CAMERA = ["yaw", "tilt", "zoom", "drag"];

// The camera's keys are the view controls' to write; the rest are kept here.
const address = createAddressState({ defaults: DEFAULTS, delay: 0 });

function syncUrl() {
  address.setMany(Object.fromEntries(Object.entries(state).filter(([k]) => !CAMERA.includes(k)).map(([k, v]) => [k, String(v) === "" ? null : v])));
}

/** The tip the package is given: the designer's Tilt is positive when the FRONT of the piece goes up (a drag up, the wheel up, Arrow Up, the slider toward its top), the package's is positive when the piece is seen more from above. */
const pitchOf = () => (state.tilt === 0 ? 0 : -state.tilt);
const flat = () => state.view === "flat" || state.view === "flat-back";
/** A folded belt or a box laid flat is the same scene standing still: drawn like the turning views (on the canvas, at the front or the back), not as an SVG of every cell, which a browser takes seconds to paint. */
const stillSolid = () => flat() && solid();
/** The angle and the tip the canvas is painted at. */
const shownYaw = () => (stillSolid() ? (state.view === "flat-back" ? 180 : 0) : state.yaw + (state.view === "back" ? 180 : 0));
const shownTilt = () => (stillSolid() ? 0 : pitchOf());
/** Where the zoomed stage is moved to, in pixels from its middle (not in the address). */
const pan = { x: 0, y: 0 };
/** The picture quality the canvas was last made at: it is made again when a zoom settles somewhere that wants another. */
let madeAt = { ratio: 0, scale: 0 };
const quality = () => ({ ratio: clamp(globalThis.devicePixelRatio || 1, 1, 4), scale: state.zoom > 3.5 ? 8 : state.zoom > 1.8 ? 6 : state.zoom > 1.2 ? 5 : 4 });
/** The zoom and pan the canvas paints with: it is made as wide as its view, so a zoomed drawing has the room, and the camera moves inside it. */
const camera = () => ({ zoom: state.zoom, panX: pan.x, panY: pan.y });
let natH = 0;

let drawing = 0;
/** The judogi on the stage as a canvas that turns it, or undefined while the stage shows an SVG (a flat view). */
let painted;

/** The whole drawing, at the current angle: made off the page and painted on a canvas, then shown. A newer choice wins. */
async function draw() {
  if (state.emblem === "flag") await loadFlag(state.flag);
  const o = options();
  showFontNotes();
  if (stillSolid()) Object.assign(o, { view: state.view === "flat-back" ? "back" : "front", yaw: 0 });
  const mine = ++drawing;
  const holder = document.createElement("div");
  // A canvas reads only each piece's description and the pictures of its faces, so it is given the drawing without its cells (tens of thousands of elements to make and parse); where it cannot be made the whole drawing is shown instead.
  const onCanvas = !flat() || stillSolid();
  holder.innerHTML = judogiFrame(onCanvas ? { ...o, bare: true } : o);
  let svg = holder.firstElementChild;
  const q = quality();
  natH = svg === null ? 0 : Number(svg.getAttribute("height")) || 0;
  const box = svg === null || !onCanvas ? undefined : fillView($("judo-turntable"), $("judo-stage"), natH);
  let canvas = box === undefined ? undefined : await judogiCanvas(svg, { pixelRatio: q.ratio, scale: q.scale, box, fill: true });
  if (canvas === undefined) fillView($("judo-turntable"), $("judo-stage"), undefined);
  if (canvas === undefined && onCanvas) {
    holder.innerHTML = judogiFrame(o);
    svg = holder.firstElementChild;
  }
  if (mine !== drawing) {
    canvas?.dispose();
    return;
  }
  $("judo-stage").dataset.frame = fingerprint(holder.innerHTML);
  painted?.dispose();
  painted = canvas;
  madeAt = q;
  canvas?.turn(shownYaw(), shownTilt(), camera());
  if (canvas === undefined) $("judo-stage").replaceChildren(...holder.childNodes);
  else $("judo-stage").replaceChildren(canvas.canvas);
  $("judo-check").textContent = checkText(judogiCheck(o));
  // A flat layout is a drawing: the view controls take away its turn and tilt, and a line says why, rather than greyed.
  bar.toggleAttribute("flat", flat());
  $("judo-flat-note").hidden = !flat();
  if (flat()) bar.pause();
  placeStage();
}

/** What the size check found, in the page's language: the facts themselves are English, so the Japanese page says only whether the size meets them. */
function checkText(check) {
  const head = `${say(state.kg === "1" ? "judoOkKarate" : state.dg === "1" ? "judoOkDobok" : "judoOk")}: ${check.heightCm} cm.`;
  if (lang() === "ja") {
    // The facts are English; the one thing a Japanese page must say is that a mark was left out for want of room.
    const left = check.notes.filter((n) => !n.met && n.id.startsWith("skipped-")).length;
    return check.ok ? head : left > 0 ? say("judoSkipped") : "";
  }
  // Each fact carries its own source: the IJF's rules for the garment, and the rules a patch follows.
  return check.ok ? `${head} ${check.notes.map((n) => n.fact).join(" ")}` : check.notes.filter((n) => !n.met).map((n) => n.fact).join(" ");
}

/** The stage's zoom and pan: a transform only, so a drag or a pinch costs no drawing. Pan is kept so that the picture still covers the view. */
/** The middle of the piece's silhouette at Fit, in CSS pixels from the view's middle: the point the + and - buttons and keys zoom about. */
function pieceAnchor() {
  const c = painted?.canvas;
  const b = (c?.getAttribute("data-bounds") ?? "").split(" ").map(Number);
  const [w, h] = (c?.getAttribute("data-size") ?? "").split(" ").map(Number);
  if (c === undefined || b.length !== 4 || b.some((v) => !Number.isFinite(v)) || !(w > 0) || !(h > 0)) return undefined;
  const r = $("judo-turntable").getBoundingClientRect();
  const cr = c.getBoundingClientRect();
  return { x: (cr.left + (((b[0] + b[2]) / 2) * cr.width) / w - (r.left + r.width / 2) - pan.x) / state.zoom, y: (cr.top + (((b[1] + b[3]) / 2) * cr.height) / h - (r.top + r.height / 2) - pan.y) / state.zoom };
}

function placeStage() {
  // A canvas zooms inside itself (sharp, and the same cost at any zoom); a flat drawing is an SVG, scaled by a transform.
  if (painted !== undefined) {
    $("judo-stage").style.transform = "";
    painted.turn(shownYaw(), shownTilt(), camera());
    bar.anchor = pieceAnchor();
  } else {
    bar.anchor = undefined;
    $("judo-stage").style.transform = state.zoom === 1 ? "" : `translate(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px) scale(${state.zoom.toFixed(3)})`;
    const svg = $("judo-stage").querySelector("svg");
    if (svg !== null && !flat()) judogiTurn(svg, state.yaw + (state.view === "back" ? 180 : 0), pitchOf());
  }
}

let crisp = 0;
/** After a zoom settles, draw the canvas again at the quality that zoom wants (sharper in, lighter out), keeping the angle. */
function settleQuality() {
  globalThis.clearTimeout(crisp);
  crisp = globalThis.setTimeout(() => {
    const q = quality();
    if ((!flat() || stillSolid()) && (q.ratio !== madeAt.ratio || q.scale !== madeAt.scale)) draw();
  }, 350);
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
const GARMENTS = { pieces: ["jacket", "pants", "belt"], suit: ["jacket", "pants", "belt"], jacket: ["jacket", "belt"], pants: ["pants"], belt: ["belt"], folded: ["belt"], box: ["belt"] };
/** The folded belt and the gift box are objects of their own: no cloth colour, patches or neck label apply. */
const solid = () => state.mode === "folded" || state.mode === "box";
const has = (garment) => GARMENTS[state.mode].includes(garment);
const garmentOf = (place) => (place.startsWith("pants") ? "pants" : place.startsWith("belt") ? "belt" : "jacket");

/** The picker for a line's font: a .ttf file read in this browser (nothing is sent anywhere), its name, a way to drop it, and the line that says what happened to it. */
function fontPicker(n) {
  const box = document.createElement("div");
  box.className = "judo-fontbox";
  const pick = document.createElement("label");
  pick.className = "fam-button judo-filebtn";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ttf,font/ttf";
  input.id = `judo-e${n}ff`;
  input.dataset.testid = `judo-e${n}ff`;
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (file === undefined) return;
    try {
      const bytes = await file.arrayBuffer();
      fontToPath(bytes, "A");
      fonts[n] = { bytes };
      fontError[n] = "";
      state[`e${n}file`] = file.name.slice(0, 80);
    } catch (error) {
      fontError[n] = error.message;
    }
    syncUrl();
    controls();
    draw();
  });
  pick.append(input, document.createElement("span"));
  pick.lastChild.textContent = say("judoFontFile_pick");
  box.append(pick);
  if (state[`e${n}file`] !== "") {
    const name = document.createElement("span");
    name.className = "judo-filename";
    name.dataset.testid = `judo-e${n}ff-name`;
    name.textContent = state[`e${n}file`];
    const drop = document.createElement("button");
    drop.type = "button";
    drop.className = "fam-button";
    drop.dataset.testid = `judo-e${n}ff-remove`;
    drop.textContent = say("judoFontFile_remove");
    drop.addEventListener("click", () => {
      delete fonts[n];
      fontError[n] = "";
      state[`e${n}file`] = "";
      syncUrl();
      controls();
      draw();
    });
    box.append(name, drop);
  }
  const note = document.createElement("p");
  note.className = "fam-fine judo-note judo-fontnote";
  note.dataset.testid = `judo-e${n}ff-note`;
  note.setAttribute("role", "status");
  const local = document.createElement("p");
  local.className = "fam-fine judo-note";
  local.textContent = say("judoFontFile_local");
  box.append(note, local);
  return box;
}

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
  if (has("belt")) out.push(field(G, "judo-belt", say("judoBelt"), swatches({ id: "judo-belt", label: say("judoBelt"), values: JUDOGI_BELTS, current: state.belt, css: beltCss, name: beltLabel, onPick: (v) => { if (!widthsFor(v).includes(state.bw)) state.bw = "auto"; if (!rowsFor(v).includes(state.sl)) state.sl = "auto"; if (!thicknessFor(v).includes(state.th)) state.th = "auto"; if (!coverFor(v).includes(state.cv)) state.cv = "auto"; set("belt", true)(v); } })));
  if (has("belt") && state.belt !== "none") {
    const auto = (key) => say(`judoBelt_${key}_auto`);
    const more = (id, key, values, name) => out.push(field(G, `judo-${id}`, say(`judoBelt_${key}`), segmented({ id: `judo-${id}`, label: say(`judoBelt_${key}`), values, current: state[id === "belt-rows" ? "sl" : id === "belt-thickness" ? "th" : "cv"], name: (v) => (v === "auto" ? auto(key) : name(v)), onPick: set(id === "belt-rows" ? "sl" : id === "belt-thickness" ? "th" : "cv") })));
    if (rowsFor(state.belt).length > 2) more("belt-rows", "rows", rowsFor(state.belt), (v) => v);
    if (thicknessFor(state.belt).length > 2) more("belt-thickness", "thickness", thicknessFor(state.belt), (v) => say(`judoBelt_thickness_${v}`));
    out.push(field(G, "judo-tg", say("judoBelt_tags"), toggle({ id: "judo-tg", label: say("judoBelt_tags"), on: state.tg === "1", words: { on: say("judoBelt_tags_on"), off: say("judoBelt_tags_off") }, onChange: (on) => change("tg", on ? "1" : "0", true) })));
    if (state.tg === "1" || Number(state.gl) > 0) out.push(field(G, "judo-te", say("judoBelt_tagEnd"), segmented({ id: "judo-te", label: say("judoBelt_tagEnd"), values: ["left", "right"], current: state.te, name: (v) => say(`judoBelt_tagEnd_${v}`), onPick: set("te") })));
    out.push(field(G, "judo-gl", say("judoBelt_gradeLines"), segmented({ id: "judo-gl", label: say("judoBelt_gradeLines"), values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], current: state.gl, name: (v) => v, onPick: set("gl", true) })));
    if (coverFor(state.belt).length > 2) more("belt-cover", "cover", coverFor(state.belt), (v) => say(`judoBelt_cover_${v}`));
  }
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
  if (solid()) out.push(field(G, "judo-bsz", say("judoBeltSize"), select("judo-bsz", ["auto", ...BELT_SIZES.map((s) => String(s.size))], (v) => (v === "auto" ? say("judoBeltSize_auto") : v))));
  else out.push(field(G, "judo-size", say("judoSize"), select("judo-size", JUDOGI_SIZES, (v) => v)));
  if (has("pants")) out.push(field(G, "judo-hem", say("judoHem"), tiles({ id: "judo-hem", label: say("judoHem"), values: HEMS, current: state.hem, picture: (v) => PICTURES.hem[v], name: (v) => say(`judoHem_${v}`), onPick: set("hem") })));
  if (state.mode === "folded") out.push(field(G, "judo-bnd", say("judoBand"), toggle({ id: "judo-bnd", label: say("judoBand"), on: state.bnd === "1", words: { on: say("judoBand_on"), off: say("judoBand_off") }, onChange: (on) => change("bnd", on ? "1" : "0") })));
  if (state.mode === "box") {
    const X = "judoG_box";
    out.push(field(X, "judo-bxt", say("judoBoxType"), segmented({ id: "judo-bxt", label: say("judoBoxType"), values: BOX_TYPES, current: state.bxt, name: (v) => say(`judoBoxType_${v}`), onPick: set("bxt", true) })));
    out.push(field(X, "judo-bxs", say("judoBoxState"), segmented({ id: "judo-bxs", label: say("judoBoxState"), values: BOX_STATES, current: state.bxs, name: (v) => say(`judoBoxState_${v}`), onPick: set("bxs") })));
    out.push(field(X, "judo-bxx", say("judoBoxText"), text("judo-bxx", 6, "御帯")));
    if (state.bxt === "kiri") out.push(field(X, "judo-bxw", say("judoBoxWood"), segmented({ id: "judo-bxw", label: say("judoBoxWood"), values: KIRI_WOODS, current: state.bxw, name: (v) => say(`judoBoxWood_${v}`), onPick: set("bxw") })));
    out.push(field(X, "judo-bxz", say("judoBoxSize"), select("judo-bxz", ["auto", "2", "3", "4", "5", "6"], (v) => (v === "auto" ? say("judoBoxSize_auto") : v))));
    const size = state.bsz === "auto" ? beltSizeForJudogi(state.size) : Number(state.bsz);
    if (boxSizeFor(size, state.bxt) === undefined) {
      const note = document.createElement("p");
      note.className = "fam-fine judo-note";
      note.dataset.testid = "judo-box-nofit";
      note.textContent = say("judoBoxNoFit");
      out.push(field(X, "judo-box-nofit", "", note));
    }
  }

  if (has("jacket") || has("pants")) {
    const K = "judoKarate";
    out.push(field(K, "judo-kg", say("judoKarate"), toggle({ id: "judo-kg", label: say("judoKarate"), on: state.kg === "1", words: { on: say("judoKarate_on"), off: say("judoKarate_off") }, onChange: (on) => { if (on) state.dg = "0"; change("kg", on ? "1" : "0", true); } })));
    if (state.kg === "1") {
      out.push(field(K, "judo-ks", say("judoKarateSleeve"), segmented({ id: "judo-ks", label: say("judoKarateSleeve"), values: KARATE_SLEEVES, current: state.ks, name: (v) => say(`judoKarateSleeve_${v}`), onPick: set("ks") })));
      out.push(field(K, "judo-kc", say("judoKarateCut"), segmented({ id: "judo-kc", label: say("judoKarateCut"), values: KARATE_CUTS, current: state.kc, name: (v) => say(`judoKarateCut_${v}`), onPick: set("kc") })));
      out.push(field(K, "judo-kt", say("judoKarateText"), text("judo-kt", 4, "空手")));
      out.push(field(K, "judo-kp", say("judoKaratePatches"), segmented({ id: "judo-kp", label: say("judoKaratePatches"), values: ["auto", "both", "sleeve", "leg", "none"], current: state.kp, name: (v) => say(`judoKaratePatches_${v}`), onPick: set("kp") })));
    }
    const D = "judoDobok";
    out.push(field(D, "judo-dg", say("judoDobok"), toggle({ id: "judo-dg", label: say("judoDobok"), on: state.dg === "1", words: { on: say("judoDobok_on"), off: say("judoDobok_off") }, onChange: (on) => { if (on) state.kg = "0"; change("dg", on ? "1" : "0", true); } })));
    if (state.dg === "1") {
      out.push(field(D, "judo-dc", say("judoDobokCut"), tiles({ id: "judo-dc", label: say("judoDobokCut"), values: DOBOK_CUTS, current: state.dc, picture: (v) => PICTURES.dobokCut[v], name: (v) => say(`judoDobokCut_${v}`), onPick: set("dc", true) })));
      out.push(field(D, "judo-dgr", say("judoDobokGrade"), tiles({ id: "judo-dgr", label: say("judoDobokGrade"), values: DOBOK_GRADES, current: state.dgr, picture: (v) => PICTURES.dobokGrade[v], name: (v) => say(`judoDobokGrade_${v}`), onPick: set("dgr", true) })));
      if (state.dc === "itf" && state.dgr === "dan") {
        out.push(field(D, "judo-dd", say("judoDobokDegree"), segmented({ id: "judo-dd", label: say("judoDobokDegree"), values: DOBOK_DEGREES, current: state.dd, name: (v) => (v === "none" ? say("judoDobokDegree_none") : v), onPick: set("dd", true) })));
        if (["4", "5", "6"].includes(state.dd)) out.push(field(D, "judo-dk", say("judoDobokComp"), toggle({ id: "judo-dk", label: say("judoDobokComp"), on: state.dk === "1", words: { on: say("judoDobokComp_on"), off: say("judoDobokComp_off") }, onChange: (on) => change("dk", on ? "1" : "0") })));
      }
    }
  }

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
    if (fonts[n] === undefined) out.push(field(E, `judo-e${n}f`, say("judoFont"), segmented({ id: `judo-e${n}f`, label: say("judoFont"), values: EMBROIDERY_FONTS, current: state[`e${n}f`], name: (v) => say(`judoFont_${v}`), onPick: set(`e${n}f`) })));
    out.push(field(E, `judo-e${n}ff`, say("judoFontFile"), fontPicker(n)));
    if (state[`e${n}file`] !== "") out.push(field(E, `judo-e${n}dir`, say("judoFontDir"), segmented({ id: `judo-e${n}dir`, label: say("judoFontDir"), values: ["across", "down"], current: state[`e${n}dir`], name: (v) => say(`judoFontDir_${v}`), onPick: set(`e${n}dir`) })));
  }

  // The country's letters on the shoulder: the jacket's.
  if (jacket) {
    const N = "judoG_nation";
    out.push(field(N, "judo-nc", say("judoNation"), text("judo-nc", 4, "CAN")));
    if (nationCode(state.nc).length >= 2) {
      out.push(field(N, "judo-ns", say("judoNationStyle"), tiles({ id: "judo-ns", label: say("judoNationStyle"), values: NATION_STYLES, current: state.ns, picture: (v) => PICTURES.nationStyle[v], name: (v) => say(`judoNationStyle_${v}`), onPick: set("ns", true) })));
      out.push(field(N, "judo-np", say("judoNationPlace"), tiles({ id: "judo-np", label: say("judoNationPlace"), values: NATION_PLACES, current: state.np, picture: (v) => PICTURES.nationPlace[v], name: (v) => say(`judoNationPlace_${v}`), onPick: set("np") })));
      out.push(field(N, "judo-ni", say("judoNationInk"), swatches({ id: "judo-ni", label: say("judoNationInk"), values: ["none", ...THREAD_COLOURS], current: state.ni, css: (v) => rgb(THREAD_RGB[v]), name: (v) => (v === "none" ? say("judoNationInk_auto") : pair(THREAD_LABELS)(v)), onPick: set("ni") })));
      if (state.ns === "print") out.push(field(N, "judo-nb", say("judoNationBand"), swatches({ id: "judo-nb", label: say("judoNationBand"), values: ["none", ...THREAD_COLOURS], current: state.nb, css: (v) => rgb(THREAD_RGB[v]), name: (v) => (v === "none" ? say("judoNationBand_none") : pair(THREAD_LABELS)(v)), onPick: set("nb") })));
    }
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
    out.push(field(M, "judo-emblem", say("judoEmblem"), tiles({ id: "judo-emblem", label: say("judoEmblem"), values: ["none", "placeholder", "flag", "kodokan"], current: state.emblem, picture: (v) => PICTURES.emblem[v], name: (v) => say(`judoEmblem_${v}`), onPick: set("emblem", true) })));
    if (state.emblem === "flag") out.push(field(M, "judo-flag", say("judoFlag"), text("judo-flag", 6, "ca")));
    if (state.emblem !== "none") {
      out.push(field(M, "judo-ems", say("judoEmStyle"), tiles({ id: "judo-ems", label: say("judoEmStyle"), values: ["flag", "named", "square"], current: state.ems, picture: (v) => PICTURES.emStyle[v], name: (v) => say(`judoEmStyle_${v}`), onPick: set("ems", true) })));
      if (state.ems !== "flag") out.push(field(M, "judo-emc", say("judoEmCaption"), text("judo-emc", 16, state.ems === "square" ? "Nippon" : state.emblem === "kodokan" ? "KODOKAN" : "CANADA")));
      out.push(field(M, "judo-emp", say("judoEmPlace"), tiles({ id: "judo-emp", label: say("judoEmPlace"), values: ["chest", "sleeve-left", "sleeve-right"], current: state.emp, picture: (v) => PICTURES.emPlace[v], name: (v) => say(`judoEmPlace_${v}`), onPick: set("emp") })));
    }
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

  const marked = (state.e1p !== "none" && places.includes(state.e1p)) || logoList().length > 0 || (jacket && nationCode(state.nc).length >= 2) || (jacket && state.emblem !== "none") || state.label !== "none" || brandOn;
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
        const nationWas = nationCode(state.nc).length >= 2;
        state[id.replace("judo-", "")] = node.value;
        syncUrl();
        // The country's other choices appear once the code has two letters: the form is built again with the caret where it was.
        if (id === "judo-nc" && nationWas !== nationCode(state.nc).length >= 2) {
          controls();
          const again = $("judo-nc");
          again.focus();
          again.setSelectionRange(again.value.length, again.value.length);
        }
        if (node.tagName === "SELECT") {
          // Embroidery's place changes which controls apply.
          if (/^judo-e[12]p$/.test(id) || id === "judo-bsz") controls();
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

/** The drawing as an SVG element of its own (not on the page), which the shared save-image part writes out. */
const exportable = () => new globalThis.DOMParser().parseFromString(judogiFrame(options()), "image/svg+xml").documentElement;
const exportAs = (format) => saveImage(exportable(), { format, name: "senshu-judogi", inlineStyles: false });

controls();
const view = $("judo-turntable");
// Still until a mouse comes over it: then it turns, and stops when the mouse leaves, unless it was set turning with the button. Grabbing it (a press, the wheel, a key) stops the turn for good.
view.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse" && !reduced.matches && !grabbed && !bar.state.turning) {
    bar.play();
    byHover = true;
  }
});
view.addEventListener("pointerleave", () => {
  if (byHover) bar.pause();
});
view.addEventListener("pointerdown", () => { grabbed = true; });
bar.addEventListener("kazoku-viewchange", ({ detail }) => {
  const { yaw, tilt, zoom, panX, panY, drag, reason, final } = detail;
  Object.assign(state, { yaw, tilt, zoom, drag });
  pan.x = panX;
  pan.y = panY;
  if (reason === "play" || reason === "pause") byHover = false;
  if (reason === "wheel" || reason === "key") grabbed = true;
  placeStage();
  if (final) {
    syncUrl();
    settleQuality();
  }
});
let resizing = 0;
window.addEventListener("resize", () => {
  bar.set({}, false);
  globalThis.clearTimeout(resizing);
  resizing = globalThis.setTimeout(() => { if ((!flat() || stillSolid()) && painted !== undefined && (Math.abs(viewSize($("judo-turntable"), natH).width - painted.canvas.clientWidth) > 8 || Math.abs(viewSize($("judo-turntable"), natH).height - painted.canvas.clientHeight) > 8)) draw(); }, 300);
});
$("judo-svg").addEventListener("click", () => exportAs("svg"));
$("judo-png").addEventListener("click", () => exportAs("png"));
const speak = () => bar.setAttribute("lang", lang() === "ja" ? "ja" : "en");
window.addEventListener("senshu-language", () => { speak(); controls(); draw(); });
speak();
draw();
