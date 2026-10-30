// The Uniforms page: every garment side by side as picture tiles, each wearing the chosen belt, a row of belts (colours, then the real arrangements of stripes, bars and tips)
// folded as a shop shows them, and the chosen garment large and turnable. Garment, belt, display, angle, tilt and zoom are in the address.
import { BELT_PRESETS, JUDOGI_BELTS, JUDOGI_BELT_LABELS, beltPreset, judogiFrame } from "./dist/index.js";
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

const state = {
  garment: GARMENTS.some((g) => g.id === params.get("garment")) ? params.get("garment") : GARMENTS[0].id,
  belt: BELTS.includes(params.get("belt")) ? params.get("belt") : "black",
  show: params.get("show") in SHOWS ? params.get("show") : "worn",
  yaw: Number.parseInt(params.get("yaw") ?? "0", 10) || 0,
  tilt: clamp(Number.parseInt(params.get("tilt") ?? "0", 10) || 0, -TILT_MAX, TILT_MAX),
  zoom: clamp(Number.parseFloat(params.get("zoom") ?? "1") || 1, ZOOM_MIN, ZOOM_MAX),
};
const DEFAULTS = { garment: GARMENTS[0].id, belt: "black", show: "worn", yaw: 0, tilt: 0, zoom: 1 };

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) if (String(v) !== String(DEFAULTS[k]) && !(k === "yaw" && turning.on)) q.set(k, String(v));
  history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}`);
}

/** The package's options for a garment wearing a belt: a belt colour, or one of the real arrangements. */
function dressed(garment, belt, mode) {
  const preset = beltPreset(belt);
  return { ...garment.options, mode, belt: preset?.belt ?? belt, ...(preset === undefined ? {} : { beltStyle: preset.style }), language: lang() === "ja" ? "ja" : "en", size: "170", view: "front", yaw: 0 };
}
const garmentOf = (id) => GARMENTS.find((g) => g.id === id);
const beltName = (id) => {
  const preset = beltPreset(id);
  if (preset !== undefined) return preset.label;
  return lang() === "ja" ? JUDOGI_BELT_LABELS[id].ja : JUDOGI_BELT_LABELS[id].en;
};

// ---- Still pictures for the tiles: the package's own drawing painted once, cropped to the cloth and kept as an image. One at a time, so a phone is not asked for many canvases at once. ----
const pictures = new Map();
let queue = Promise.resolve();
async function shoot(options, width) {
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame({ ...options, bare: true, width });
  const svg = holder.firstElementChild;
  const made = svg === null ? undefined : await judogiCanvas(svg, { pixelRatio: 2, scale: 3 });
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
/** Put a tile's picture in when it is ready. `key` names the drawing, so one made before is not made again. */
function picture(tile, key, options, width) {
  const set = (url) => {
    const img = tile.querySelector("img");
    if (img === null || url === undefined) return;
    img.src = url;
    tile.dataset.ready = "1";
  };
  if (pictures.has(key)) return set(pictures.get(key));
  queue = queue.then(async () => {
    if (!pictures.has(key)) pictures.set(key, await shoot(options, width).catch(() => undefined));
    set(pictures.get(key));
  });
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
    picture(tile, `g:${g.id}:${state.belt}:${lang()}`, dressed(g, state.belt, "suit"), 220);
  }
  for (const tile of document.querySelectorAll(".uni-belts [data-value]")) {
    picture(tile, `b:${tile.dataset.value}`, dressed(garmentOf(state.garment), tile.dataset.value, "folded"), 220);
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
  section(say("uniformsBelts"), beltTiles("uni-belt", say("uniformsBelts"), COLOURS));
  section(say("uniformsBeltStyles"), beltTiles("uni-belt-style", say("uniformsBeltStyles"), BELT_PRESETS.map((p) => p.id)));
  paintTiles();
}

function change(key, value) {
  state[key] = value;
  syncUrl();
  if (key === "belt") {
    for (const tile of document.querySelectorAll("#uni-belt [data-value], #uni-belt-style [data-value]")) tile.setAttribute("aria-pressed", String(tile.dataset.value === value));
    for (const tile of $("uni-garment").querySelectorAll("[data-value]")) delete tile.dataset.ready;
    paintTiles();
  }
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
