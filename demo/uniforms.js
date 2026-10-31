// The Uniforms page: every garment side by side as picture tiles, each wearing the chosen belt, rows of belts (colours, then each art's real arrangements of stripes, bars,
// tips and numerals) tied as they are worn or folded as a shop shows them, how the belt is tied, and the chosen garment large and turnable. Garment, belt, tie, display,
// trouser hem, angle, tilt and zoom are in the address.
import { BELT_KNOTS, BELT_PRESETS, JUDOGI_BELTS, JUDOGI_BELT_LABELS, beltPreset, judogiFrame } from "./dist/index.js";
import { judogiCanvas, judogiTurn } from "./dist/turn-entry.js";
import { segmented, tiles } from "./judogiPick.js";
import { bindView, clamp, TILT_MAX, wrapYaw, ZOOM_MAX, ZOOM_MIN } from "./judogiView.js";
import { GARMENTS } from "./uniformsList.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const lang = () => window.senshuLanguage?.lang ?? "en";
const say = (key) => WORDS[lang()][key] ?? WORDS.en[key] ?? key;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const SPEED = 30;

const COLOURS = JUDOGI_BELTS.filter((b) => b !== "none");
const BELTS = [...COLOURS, ...BELT_PRESETS.map((p) => p.id)];
const SHOWS = { worn: "suit", belt: "belt", folded: "folded" };
const ARTS = ["judo", "bjj", "karate", "taekwondo"];
const KNOTS = ["auto", ...BELT_KNOTS];
const TAILS = ["auto", "25", "35", "45", "55"];
const HEMS = ["auto", "2", "5", "10"];

const state = {
  garment: GARMENTS.some((g) => g.id === params.get("garment")) ? params.get("garment") : GARMENTS[0].id,
  belt: BELTS.includes(params.get("belt")) ? params.get("belt") : "black",
  show: params.get("show") in SHOWS ? params.get("show") : "worn",
  knot: KNOTS.includes(params.get("knot")) ? params.get("knot") : "auto",
  tail: TAILS.includes(params.get("tail")) ? params.get("tail") : "auto",
  hem: HEMS.includes(params.get("hem")) ? params.get("hem") : "auto",
  yaw: Number.parseInt(params.get("yaw") ?? "0", 10) || 0,
  tilt: clamp(Number.parseInt(params.get("tilt") ?? "0", 10) || 0, -TILT_MAX, TILT_MAX),
  zoom: clamp(Number.parseFloat(params.get("zoom") ?? "1") || 1, ZOOM_MIN, ZOOM_MAX),
};
const DEFAULTS = { garment: GARMENTS[0].id, belt: "black", show: "worn", knot: "auto", tail: "auto", hem: "auto", yaw: 0, tilt: 0, zoom: 1 };

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) if (String(v) !== String(DEFAULTS[k]) && !(k === "yaw" && turning.on)) q.set(k, String(v));
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

/**
 * The package's options for a garment wearing a belt: a belt colour, or one of the real arrangements. The belt is tied as asked, else as its art ties it (a karate
 * preset's long ends), else as the garment's own (left to the package).
 */
function dressed(garment, belt, mode) {
  const preset = beltPreset(belt);
  const knot = state.knot !== "auto" ? state.knot : preset?.tie?.knot;
  const tail = state.tail !== "auto" ? Number(state.tail) : preset?.tie?.tailCm;
  return {
    ...garment.options, mode, belt: preset?.belt ?? belt, ...(preset === undefined ? {} : { beltStyle: preset.style }),
    ...(knot === undefined ? {} : { beltKnot: knot }), ...(tail === undefined ? {} : { beltTailCm: tail }), ...(state.hem === "auto" ? {} : { hemAboveAnkleCm: Number(state.hem) }),
    language: lang() === "ja" ? "ja" : "en", size: "170", view: "front", yaw: 0,
  };
}
/** How the belt row draws its belts: tied as worn, or folded when the folded belt is on show. */
const beltRowMode = () => (state.show === "folded" ? "folded" : "belt");
const garmentOf = (id) => GARMENTS.find((g) => g.id === id);
const beltName = (id) => {
  const preset = beltPreset(id);
  if (preset !== undefined) return preset.label;
  return lang() === "ja" ? JUDOGI_BELT_LABELS[id].ja : JUDOGI_BELT_LABELS[id].en;
};

// ---- Still pictures for the tiles: the package's own drawing painted once, cropped to the cloth and kept as an image. One at a time, so a phone is not asked for many canvases at once. ----
const pictures = new Map();
let queue = Promise.resolve();
async function shoot(options, width, scale) {
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame({ ...options, bare: true, width });
  const svg = holder.firstElementChild;
  const made = svg === null ? undefined : await judogiCanvas(svg, { pixelRatio: 2, scale });
  if (made === undefined) return undefined;
  made.turn(0, 0);
  const { canvas } = made;
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  const g = copy.getContext("2d", { willReadFrequently: true });
  g.drawImage(canvas, 0, 0);
  made.dispose();
  const data = g.getImageData(0, 0, copy.width, copy.height).data;
  let x0 = copy.width, y0 = copy.height, x1 = 0, y1 = 0;
  for (let y = 0; y < copy.height; y++) for (let x = 0; x < copy.width; x++) if (data[(y * copy.width + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 <= x0 || y1 <= y0) return undefined;
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d").drawImage(copy, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}
/** Put a tile's picture in when it is ready, once the tile is near the screen (the others wait: a page of forty drawings is not drawn at once). `key` names the drawing, so one made before is not made again. */
const near = new IntersectionObserver((entries) => {
  for (const e of entries) {
    e.target.dataset.near = e.isIntersecting ? "1" : "";
    if (e.isIntersecting) e.target._make?.();
  }
}, { rootMargin: "300px" });
function picture(tile, key, options, width, scale) {
  const set = (url) => {
    const img = tile.querySelector("img");
    if (img === null || url === undefined) return;
    img.src = url;
    tile.dataset.ready = "1";
  };
  tile._make = () => {
    tile._make = undefined;
    if (pictures.has(key)) return set(pictures.get(key));
    queue = queue.then(async () => {
      if (!pictures.has(key)) pictures.set(key, await shoot(options, width, scale).catch(() => undefined));
      set(pictures.get(key));
      await new Promise((done) => globalThis.setTimeout(done, 40));
    });
  };
  if (tile.dataset.near === "1") tile._make();
  else near.observe(tile);
}

function garmentTiles() {
  const box = tiles({
    id: "uni-garment", label: say("uniformsGarment"), values: GARMENTS.map((g) => g.id), current: state.garment,
    picture: () => '<img alt="" width="1" height="1" decoding="async">', name: (id) => say(`uniformsG_${id}`),
    onPick: (id) => change("garment", id),
  });
  box.classList.add("uni-tiles", "uni-garments");
  return box;
}
function beltTiles(id, label, values) {
  const box = tiles({
    id, label, values, current: state.belt, picture: () => '<img alt="" width="1" height="1" decoding="async">', name: beltName,
    onPick: (v) => change("belt", v),
  });
  box.classList.add("uni-tiles", "uni-belts");
  for (const tile of box.querySelectorAll("[data-value]")) tile.title = beltName(tile.dataset.value);
  return box;
}

function paintTiles() {
  for (const tile of $("uni-garment").querySelectorAll("[data-value]")) {
    const g = garmentOf(tile.dataset.value);
    picture(tile, `g:${g.id}:${state.belt}:${state.knot}:${state.tail}:${state.hem}:${lang()}`, dressed(g, state.belt, "suit"), 220, 3);
  }
  const mode = beltRowMode();
  for (const tile of document.querySelectorAll(".uni-belts [data-value]")) {
    const o = dressed(garmentOf(state.garment), tile.dataset.value, mode);
    // A belt alone is the same whatever the garment, but its tie is the garment's own unless asked: the key names what changes the drawing.
    const key = `b:${mode}:${tile.dataset.value}:${mode === "folded" ? "" : JSON.stringify([o.karate, o.dobok, o.beltKnot, o.beltTailCm])}`;
    if (tile.dataset.key !== key) delete tile.dataset.ready;
    tile.dataset.key = key;
    picture(tile, key, o, 220, 2);
  }
}

function controls() {
  const box = $("uni-controls");
  box.replaceChildren();
  const section = (title, node) => {
    const h = document.createElement("h3");
    h.textContent = title;
    box.append(h, node);
  };
  section(say("uniformsGarment"), garmentTiles());
  section(say("uniformsShow"), segmented({ id: "uni-show", label: say("uniformsShow"), values: Object.keys(SHOWS), current: state.show, name: (v) => say(`uniformsShow_${v}`), onPick: (v) => change("show", v) }));
  section(say("uniformsKnot"), segmented({ id: "uni-knot", label: say("uniformsKnot"), values: KNOTS, current: state.knot, name: (v) => say(`uniformsKnot_${v}`), onPick: (v) => change("knot", v) }));
  section(say("uniformsTail"), segmented({ id: "uni-tail", label: say("uniformsTail"), values: TAILS, current: state.tail, name: (v) => (v === "auto" ? say("uniformsKnot_auto") : `${v} cm`), onPick: (v) => change("tail", v) }));
  section(say("uniformsHem"), segmented({ id: "uni-hem", label: say("uniformsHem"), values: HEMS, current: state.hem, name: (v) => (v === "auto" ? say("uniformsKnot_auto") : `${v} cm`), onPick: (v) => change("hem", v) }));
  section(say("uniformsBelts"), beltTiles("uni-belt", say("uniformsBelts"), COLOURS));
  for (const art of ARTS) {
    const label = `${say("uniformsBeltStyles")}: ${say(`uniformsArt_${art}`)}`;
    section(label, beltTiles(`uni-belt-${art}`, label, BELT_PRESETS.filter((p) => p.art === art).map((p) => p.id)));
  }
  paintTiles();
}

function change(key, value) {
  state[key] = value;
  syncUrl();
  if (key === "belt") for (const tile of document.querySelectorAll(".uni-belts [data-value]")) tile.setAttribute("aria-pressed", String(tile.dataset.value === value));
  if (key === "belt" || key === "knot" || key === "tail" || key === "hem") for (const tile of $("uni-garment").querySelectorAll("[data-value]")) delete tile.dataset.ready;
  // The garment tiles wear the belt as it is tied; the belt row redraws when its tie or its display changes (a key that is the same keeps its picture).
  if (key === "belt" || key === "knot" || key === "tail" || key === "hem" || key === "show" || key === "garment") paintTiles();
  draw();
}

// ---- The large view ----
const turning = { on: false, byHover: false, last: 0, frame: 0 };
const pan = { x: 0, y: 0 };
let painted;
let drawing = 0;
let madeAt = { ratio: 0, scale: 0 };
const quality = () => ({ ratio: clamp(globalThis.devicePixelRatio || 1, 1, 4), scale: state.zoom > 3.5 ? 8 : state.zoom > 1.8 ? 6 : state.zoom > 1.2 ? 5 : 4 });
const camera = () => ({ zoom: state.zoom, panX: pan.x, panY: pan.y });
const boxWidth = () => Math.max(0, $("uni-stage").clientWidth - 20);
const pitch = () => (state.tilt === 0 ? 0 : -state.tilt);

async function draw() {
  const mine = ++drawing;
  const o = { ...dressed(garmentOf(state.garment), state.belt, SHOWS[state.show]), yaw: state.yaw, width: 360 };
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame({ ...o, bare: true });
  let svg = holder.firstElementChild;
  const q = quality();
  const canvas = svg === null ? undefined : await judogiCanvas(svg, { pixelRatio: q.ratio, scale: q.scale, box: { width: boxWidth(), height: 0 } });
  if (canvas === undefined) {
    holder.innerHTML = judogiFrame(o);
    svg = holder.firstElementChild;
  }
  if (mine !== drawing) {
    canvas?.dispose();
    return;
  }
  painted?.dispose();
  painted = canvas;
  madeAt = q;
  canvas?.turn(state.yaw, pitch(), camera());
  if (canvas === undefined) $("uni-stage").replaceChildren(...holder.childNodes);
  else {
    canvas.canvas.dataset.yaw = String(state.yaw);
    $("uni-stage").replaceChildren(canvas.canvas);
  }
  showAngle();
  placeStage();
}

function showAngle() {
  $("uni-yaw-out").textContent = `${wrapYaw(state.yaw)}°`;
  $("uni-yaw").value = String(wrapYaw(state.yaw));
  $("uni-tilt-out").textContent = `${state.tilt}°`;
  $("uni-tilt").value = String(state.tilt);
}

function placeStage() {
  const box = $("uni-turntable").getBoundingClientRect();
  const room = (state.zoom - 1) / 2;
  pan.x = state.zoom === 1 ? 0 : clamp(pan.x, -box.width * room, box.width * room);
  pan.y = state.zoom === 1 ? 0 : clamp(pan.y, -box.height * room, box.height * room);
  if (painted !== undefined) {
    $("uni-stage").style.transform = "";
    painted.turn(state.yaw, pitch(), camera());
  } else $("uni-stage").style.transform = state.zoom === 1 ? "" : `translate(${pan.x.toFixed(1)}px, ${pan.y.toFixed(1)}px) scale(${state.zoom.toFixed(3)})`;
  $("uni-zoom-reset").textContent = `${Number(state.zoom.toFixed(1))}×`;
  $("uni-turntable").style.touchAction = state.zoom > 1.05 ? "none" : "";
  $("uni-zoom-out").disabled = state.zoom <= ZOOM_MIN + 1e-6;
  $("uni-zoom-in").disabled = state.zoom >= ZOOM_MAX - 1e-6;
}

function turnTo(yaw, tilt = state.tilt) {
  state.yaw = yaw;
  state.tilt = tilt;
  const svg = $("uni-stage").querySelector("svg");
  if (painted !== undefined) {
    painted.turn(yaw, pitch(), camera());
    painted.canvas.dataset.yaw = String(Math.round(yaw));
  } else if (svg !== null) judogiTurn(svg, yaw, pitch());
  showAngle();
}

let crisp = 0;
function settleQuality() {
  globalThis.clearTimeout(crisp);
  crisp = globalThis.setTimeout(() => {
    const q = quality();
    if (q.ratio !== madeAt.ratio || q.scale !== madeAt.scale) draw();
  }, 350);
}

function tick(now) {
  if (!turning.on) return;
  const dt = turning.last === 0 ? 0 : Math.min(0.1, (now - turning.last) / 1000);
  turning.last = now;
  turnTo(state.yaw + SPEED * dt);
  turning.frame = requestAnimationFrame(tick);
}
function syncPlay() {
  $("uni-play").setAttribute("aria-pressed", String(turning.on));
  $("uni-play").textContent = turning.on ? say("pause") : say("play");
}
function play(byHover = false) {
  if (turning.on) return;
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

let grabbed = false;
const hands = bindView($("uni-turntable"), {
  get: () => ({ yaw: state.yaw, tilt: state.tilt, zoom: state.zoom, panX: pan.x, panY: pan.y, turnable: true }),
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
$("uni-yaw").addEventListener("input", () => { stop(); turnTo(Number($("uni-yaw").value)); syncUrl(); });
$("uni-tilt").addEventListener("input", () => { stop(); turnTo(state.yaw, Number($("uni-tilt").value)); syncUrl(); });
$("uni-play").addEventListener("click", () => (turning.on ? stop() : play()));
$("uni-front").addEventListener("click", () => { stop(); turnTo(0, 0); syncUrl(); });
$("uni-turntable").addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !reduced.matches && !grabbed) play(true); });
$("uni-turntable").addEventListener("pointerleave", () => { if (turning.byHover) stop(); });
$("uni-zoom-in").addEventListener("click", () => hands.zoomBy(1.4));
$("uni-zoom-out").addEventListener("click", () => hands.zoomBy(1 / 1.4));
const fit = () => {
  pan.x = 0;
  pan.y = 0;
  state.zoom = 1;
  placeStage();
  syncUrl();
  settleQuality();
};
$("uni-fit").addEventListener("click", fit);
$("uni-zoom-reset").addEventListener("click", fit);
let resizing = 0;
window.addEventListener("resize", () => {
  placeStage();
  globalThis.clearTimeout(resizing);
  resizing = globalThis.setTimeout(() => { if (Math.abs(boxWidth() - (painted?.canvas.clientWidth ?? 0)) > 8) draw(); }, 300);
});
window.addEventListener("senshu-language", () => { controls(); draw(); syncPlay(); });

controls();
draw();
syncPlay();
