// The demo's script: a jersey to try (every option, turned by a drag or by itself), the wall of every preset, the retired-number banners, a matchup and a lineup,
// caps and helmets, and the code that puts it in a page. Everything the controls say is in the address. The words are in words.js.
import { CUT_IDS, PATTERN_IDS, CUTS, attributesFromOptions, embedCode, jerseyLineup, kitClash, kitMatchup, optionsFromAttributes, renderBanner, renderCap, renderHelmet, renderJersey, usePresets } from "./dist/index.js";
import { bindTurn } from "./dist/turn-entry.js";
import { WORDS } from "./words.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const lang = () => window.senshuLanguage?.lang ?? "en";
const say = (key) => WORDS[lang()][key] ?? WORDS.en[key] ?? key;

// ----- The state: the jersey's options as attributes (the same words as <senshu-jersey>), and the page's own choices.
const DEFAULTS = { cut: "hockey", body: "#c8102e", trim: "#f4f0e4", accent: "#1b2a6b", number: "23", name: "Morris", "name-arch": "arched", view: "front", look: "cloth", pattern: "solid" };
const UI_DEFAULTS = { yaw: "0", wl: "all", we: "all", wq: "", os: "all", ma: "", mh: "", mv: "front", lt: "", lf: "4-4-2", ll: "name", lfield: "0", et: "element", etn: "0", preset: "", background: "" };
const BACKGROUNDS = [...document.querySelectorAll("#background option")].map((o) => o.value);
const attrs = { ...DEFAULTS };
const ui = { ...UI_DEFAULTS };
for (const [k, v] of params) {
  if (k === "background") ui.background = BACKGROUNDS.includes(v) ? v : "";
  else if (k in UI_DEFAULTS) ui[k] = v;
  else if (k in DEFAULTS || k.length > 1) {
    if (v === "") delete attrs[k];
    else attrs[k] = v;
  }
}
const options = () => optionsFromAttributes((name) => (name in attrs ? attrs[name] : null));
let presetsApi; // { PRESETS, LEAGUES, byId }

function syncUrl() {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(attrs)) if (DEFAULTS[k] !== v) q.set(k, v);
  for (const k of Object.keys(DEFAULTS)) if (!(k in attrs)) q.set(k, "");
  for (const [k, v] of Object.entries(ui)) if (UI_DEFAULTS[k] !== v) q.set(k, v);
  // Safari refuses more than a hundred of these in thirty seconds; the address is a convenience, so a refusal must not stop the drawing.
  try { history.replaceState(null, "", q.size === 0 ? location.pathname + location.hash : `?${q}${location.hash}`); } catch { /* the address stays */ }
}

// ----- Small builders.
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v !== undefined) n.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids) if (kid !== undefined && kid !== null) n.append(kid);
  return n;
};

const rows = [];
/** A row of a label and a control; `shown` says when the row is on the page. */
function row(label, build, shown = () => true) {
  const wrap = el("div", { class: "fam-row" }, el("span", { class: "fam-label" }));
  const control = build();
  wrap.append(control);
  const r = { wrap, label, shown, control };
  rows.push(r);
  return r;
}
const seg = (key, values, text, extra = {}) => {
  const box = el("div", { class: "fam-seg", role: "group", "data-key": key, "data-testid": `seg-${key}` });
  for (const v of values) box.append(el("button", { type: "button", "data-value": v, "aria-pressed": "false", text: text(v) }));
  box.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b === null || b.disabled) return;
    if (extra.onPick) extra.onPick(b.dataset.value);
    else setAttr(key, b.dataset.value === "auto" ? null : b.dataset.value);
  });
  return box;
};
const toggle = (key, text, testid) => el("button", { type: "button", class: "fam-button", "data-key": key, "data-testid": testid ?? `tog-${key}`, "aria-pressed": "false", text, onclick: () => setAttr(key, attrs[key] === "true" ? null : "true") });
const select = (key, values, text) => {
  const s = el("select", { class: "fam-field", "data-key": key, "data-testid": `sel-${key}` });
  for (const v of values) s.append(el("option", { value: v, text: text(v) }));
  s.addEventListener("change", () => setAttr(key, s.value === "auto" || s.value === "none" ? null : s.value));
  return s;
};
const colour = (key) => {
  const input = el("input", { type: "color", class: "swatch", "data-key": key, "data-testid": `col-${key}`, "aria-label": say(key === "number-fill" ? "numberFill" : key === "number-outline" ? "numberOutline" : key) });
  input.addEventListener("input", () => setAttr(key, input.value));
  const auto = el("button", { type: "button", class: "fam-button", "data-clear": key, text: say("clear"), onclick: () => setAttr(key, null) });
  return el("span", { class: "colour" }, input, auto);
};
const text = (key, props = {}) => {
  const i = el("input", { type: "text", class: "fam-field", "data-key": key, "data-testid": `in-${key}`, autocomplete: "off", ...props });
  i.addEventListener("input", () => {
    const v = props.inputmode === "numeric" ? i.value.replace(/\D/g, "").slice(0, 2) : i.value;
    if (props.inputmode === "numeric") i.value = v;
    setAttr(key, v === "" ? null : v);
  });
  return i;
};

const collarsFor = (cut) => ["auto", ...CUTS[cut].collars];
const sleevesFor = (cut) => (cut === "basketball" ? ["none"] : ["auto", ...["long", "elbow", "short"].filter((s) => CUTS[cut].sleeves[s] !== undefined), ...(cut === "baseball" ? ["none"] : [])]);

function setAttr(key, value) {
  if (value === null) delete attrs[key];
  else attrs[key] = value;
  if (key === "cut") {
    // A collar or a sleeve the new cut does not have is the cut's own.
    if (attrs.collar !== undefined && !CUTS[attrs.cut]?.collars.includes(attrs.collar)) delete attrs.collar;
    if (attrs.sleeve !== undefined && !sleevesFor(attrs.cut).includes(attrs.sleeve)) delete attrs.sleeve;
  }
  if (key !== "preset") ui.preset = key === "number" || key === "name" ? ui.preset : "";
  if (key === "view" && (value === "front" || value === "back")) ui.yaw = value === "back" ? "180" : "0";
  render();
}

// ----- The controls, built once for a language.
function buildControls() {
  rows.length = 0;
  const host = $("controls");
  host.replaceChildren();
  const group = (title) => host.append(title === undefined ? el("hr", { class: "sep" }) : el("h3", { text: title }));
  const add = (r) => host.append(r.wrap);

  const pr = row("preset", () => el("select", { class: "fam-field wide", id: "preset", "data-testid": "preset", "aria-label": say("preset") }));
  pr.control.append(el("option", { value: "", text: say("presetNone") }));
  pr.control.addEventListener("change", () => applyPreset(pr.control.value));
  add(pr);

  group();
  add(row("cut", () => seg("cut", CUT_IDS, (v) => say(`cutShort_${v}`))));
  add(row("view", () => seg("view", ["front", "back", "both"], (v) => say(`view_${v}`))));
  add(row("look", () => seg("look", ["cloth", "flat", "line"], (v) => say(`look_${v}`))));

  group(say("colours"));
  for (const [key, label] of [["body", "body"], ["trim", "trim"], ["accent", "accent"], ["number-fill", "numberFill"], ["number-outline", "numberOutline"]]) add(row(label, () => colour(key)));

  group();
  add(row("pattern", () => select("pattern", PATTERN_IDS, (v) => say(`pattern_${v}`))));
  add(row("collar", () => select("collar", ["auto", "crew", "v", "lace-up", "polo", "round", "wishbone", "band", "zip", "point"], (v) => (v === "auto" ? say("auto") : say(`collar_${v}`)))));
  add(row("sleeve", () => seg("sleeve", ["auto", "long", "elbow", "short", "none"], (v) => (v === "auto" ? say("auto") : say(`sleeve_${v}`)))));
  add(row("yoke", () => select("yoke", ["none", "curved", "square", "full-arm"], (v) => say(`yoke_${v}`))));
  add(row("closure", () => seg("closure", ["button", "pullover", "vest"], (v) => say(`closure_${v}`)), () => attrs.cut === "baseball"));
  add(row("raglan", () => toggle("raglan", say("on"))));
  add(row("piping", () => toggle("piping", say("on"))));
  add(row("sleeveStripes", () => seg("sleeve-stripes", ["auto", "0", "1", "2", "3"], (v) => (v === "auto" ? say("auto") : v))));
  add(row("hemStripes", () => seg("hem-stripes", ["auto", "0", "1", "2", "3"], (v) => (v === "auto" ? say("auto") : v))));
  add(row("chestBand", () => toggle("chest-band", say("on"))));
  add(row("cuffs", () => seg("cuffs", ["auto", "10", "18", "26"], (v) => (v === "auto" ? say("off") : v))));

  group();
  add(row("number", () => text("number", { inputmode: "numeric", maxlength: "2", placeholder: "23" })));
  add(row("nameField", () => text("name", { maxlength: "18", placeholder: "Morris" })));
  add(row("nameArch", () => seg("name-arch", ["arched", "straight"], (v) => say(`arch_${v}`))));
  add(row("frontText", () => text("front-text", { maxlength: "14" })));
  add(row("frontTextAngle", () => seg("front-text-angle", ["auto", "straight", "arch", "diagonal-up", "diagonal-down"], (v) => (v === "auto" ? say("auto") : say(`textAngle_${v}`)))));
  add(row("frontNumber", () => toggle("front-number", say("on"))));
  add(row("patch", () => seg("patch", ["none", "C", "A"], (v) => (v === "none" ? say("patch_none") : v)), () => true));
  add(row("sleeveNumbers", () => toggle("sleeve-numbers", say("on"))));
  add(row("crest", () => seg("crest", ["none", "ring", "star", "diamond"], (v) => say(`crest_${v}`), { onPick: (v) => setAttr("crest", v === "none" ? null : crestSvg(v)) })));
  add(row("armbands", () => toggle("armbands", say("on"))));
  add(row("pocket", () => toggle("pocket", say("on"))));
  add(row("badge", () => seg("badge", ["none", "round", "shield", "square"], (v) => say(`badge_${v}`), { onPick: (v) => setAttr("badge", v === "none" ? null : v) })));
  add(row("protector", () => toggle("protector", say("on"))));
  add(row("kit", () => toggle("kit", say("on"))));
  for (const r of rows) {
    r.wrap.firstChild.textContent = say(r.label);
    // The label is a word beside the control: the control says it too, for a screen reader.
    for (const c of r.wrap.querySelectorAll("select, input[type=text], .fam-seg")) if (!c.hasAttribute("aria-label")) c.setAttribute("aria-label", say(r.label));
    for (const c of r.wrap.querySelectorAll("button[data-key]:not([data-value])")) c.setAttribute("aria-label", say(r.label));
  }
  // The seg for the patch: "none" is no attribute.
  const patch = host.querySelector('[data-key="patch"]');
  patch.onclick = null;
  patch.replaceWith(patch.cloneNode(true));
  host.querySelector('[data-key="patch"]').addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b !== null) setAttr("patch", b.dataset.value === "none" ? null : b.dataset.value);
  });
  host.querySelectorAll("[data-clear]").forEach((b) => (b.textContent = say("clear")));
}

/** The made-up crests: a ring, a star, a diamond, in the shirt's own trim colours. */
function crestSvg(kind) {
  const trim = attrs.trim ?? DEFAULTS.trim;
  const accent = attrs.accent ?? DEFAULTS.accent;
  const shapes = {
    ring: `<circle cx="50" cy="50" r="38" fill="none" stroke="${trim}" stroke-width="12"/><circle cx="50" cy="50" r="14" fill="${accent}" stroke="${trim}" stroke-width="4"/>`,
    star: `<path d="M50 6L62 38L96 38L68 58L79 92L50 71L21 92L32 58L4 38L38 38Z" fill="${trim}" stroke="${accent}" stroke-width="5" stroke-linejoin="round"/>`,
    diamond: `<path d="M50 4L92 50L50 96L8 50Z" fill="${trim}" stroke="${accent}" stroke-width="6" stroke-linejoin="round"/><path d="M50 26L74 50L50 74L26 50Z" fill="${accent}"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shapes[kind]}</svg>`;
}

/** Make the controls say what the state says. */
function syncControls() {
  const o = options();
  const cut = o.cut ?? "soccer";
  for (const r of rows) {
    const hidden = !r.shown();
    r.wrap.hidden = hidden;
  }
  const hideFor = (label, hidden) => rows.find((r) => r.label === label)?.wrap.toggleAttribute("hidden", hidden);
  hideFor("sleeve", cut === "basketball");
  hideFor("sleeveNumbers", cut === "basketball");
  hideFor("cuffs", cut === "basketball");
  for (const box of document.querySelectorAll("#controls .fam-seg")) {
    const key = box.dataset.key;
    const current = key === "sleeve" || key === "sleeve-stripes" || key === "hem-stripes" || key === "front-text-angle" || key === "cuffs" ? (attrs[key] ?? "auto") : key === "patch" ? (attrs.patch ?? "none") : key === "badge" ? (attrs.badge ?? "none") : key === "crest" ? (attrs.crest === undefined ? "none" : ["ring", "star", "diamond"].find((k) => crestSvg(k) === attrs.crest) ?? "none") : (attrs[key] ?? DEFAULTS[key] ?? (key === "closure" ? "button" : ""));
    for (const b of box.children) {
      b.setAttribute("aria-pressed", String(b.dataset.value === current));
      if (key === "sleeve") b.hidden = b.dataset.value !== "auto" && !sleevesFor(cut).includes(b.dataset.value);
    }
  }
  for (const s of document.querySelectorAll("#controls select[data-key]")) {
    const key = s.dataset.key;
    const v = attrs[key] ?? (key === "pattern" ? "solid" : key === "yoke" ? "none" : "auto");
    if (key === "collar") for (const opt of s.options) opt.hidden = opt.value !== "auto" && !collarsFor(cut).includes(opt.value);
    s.value = v;
  }
  for (const b of document.querySelectorAll("#controls button[data-key]:not([data-value])")) b.setAttribute("aria-pressed", String(attrs[b.dataset.key] === "true"));
  for (const i of document.querySelectorAll('#controls input[type="color"]')) {
    const v = attrs[i.dataset.key];
    i.value = /^#[0-9a-f]{6}$/i.test(v ?? "") ? v : /^#[0-9a-f]{3}$/i.test(v ?? "") ? `#${[...v.slice(1)].map((c) => c + c).join("")}` : i.dataset.key === "number-fill" || i.dataset.key === "number-outline" ? "#888888" : "#888888";
    i.classList.toggle("unset", v === undefined);
  }
  for (const i of document.querySelectorAll("#controls input[type=text]")) {
    const key = i.dataset.key;
    if (document.activeElement !== i) i.value = attrs[key] ?? "";
  }
  if ($("preset") !== null) $("preset").value = ui.preset;
  $("background").value = ui.background;
}

// ----- The stage: the jersey, turned by a drag, the keys or the Auto-turn button.
let turn;
let backgrounds;
const dark = matchMedia("(prefers-color-scheme: dark)");
/**
 * The optional background behind the stage: one of the family's twenty-five, drawn in code (family-backgrounds.js, loaded only when one is chosen), in the dark or the light variant of the page's look,
 * and the stage's text takes the ink it returns. It is a picture behind the stage and nothing more: the jersey the package draws is the same string with or without it.
 */
async function paintBackground() {
  const stage = $("stage");
  const name = ui.background;
  if (name === "") {
    stage.style.backgroundImage = "";
    stage.style.color = "";
    return;
  }
  try {
    backgrounds ??= await import("./family-backgrounds.js");
  } catch {
    return;
  }
  // The choice may have changed while the module loaded.
  if (ui.background !== name) return;
  const forced = document.documentElement.dataset.theme;
  const theme = forced === "dark" || (forced !== "light" && dark.matches) ? "dark" : "light";
  const { defs, body, ink } = backgrounds.backgroundSvg(name, { width: 1200, height: 675, theme, id: "stage-bg" });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs><rect width="1200" height="675" fill="${ink.base}"/>${body}</svg>`;
  stage.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  stage.style.backgroundSize = "cover";
  stage.style.backgroundPosition = "center";
  stage.style.color = ink.text;
}
dark.addEventListener("change", () => { if (ui.background !== "") paintBackground(); });
new MutationObserver(() => { if (ui.background !== "") paintBackground(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
function stageOptions() {
  return { ...options(), size: 300, language: attrs.language ?? lang() };
}
function drawStage() {
  const stage = $("stage");
  const o = options();
  const canTurn = o.view !== "both" && o.kit !== true;
  $("turnbar").hidden = !canTurn;
  $("turn-note").hidden = canTurn || o.kit === true;
  if (!canTurn) {
    turn?.destroy();
    turn = undefined;
    stage.removeAttribute("tabindex");
    stage.removeAttribute("role");
    stage.removeAttribute("aria-label");
    stage.style.touchAction = "";
    stage.innerHTML = renderJersey(stageOptions());
    return;
  }
  const yaw = Number(ui.yaw) || 0;
  if (turn === undefined) {
    turn = bindTurn(stage, stageOptions(), { yaw, speed: 40, onChange: onYaw, onPlay: syncPlay });
  } else {
    turn.update({ ...stageOptions(), yaw: turn.yaw() });
  }
}
function onYaw(yaw) {
  ui.yaw = String(Math.round(yaw));
  $("yaw").value = ui.yaw;
  $("yaw-out").textContent = `${ui.yaw}°`;
  const facing = Math.abs(yaw) > 90 ? "back" : "front";
  if (attrs.view !== facing && attrs.view !== "both") {
    attrs.view = facing;
    for (const b of document.querySelectorAll('[data-key="view"] button')) b.setAttribute("aria-pressed", String(b.dataset.value === facing));
  }
  if (!playing()) syncUrl();
}
const playing = () => turn?.playing() === true;
function syncPlay() {
  const on = playing();
  $("play").setAttribute("aria-pressed", String(on));
  $("play").textContent = on ? say("pause") : say("play");
}

// ----- Presets.
function applyPreset(id) {
  const p = presetsApi?.byId.get(id);
  ui.preset = id;
  if (p === undefined) {
    ui.preset = "";
    render();
    return;
  }
  const keepNumber = attrs.number;
  const keepName = attrs.name;
  const keepView = attrs.view;
  for (const k of Object.keys(attrs)) delete attrs[k];
  Object.assign(attrs, { look: "cloth", "name-arch": "arched" }, attributesFromOptions(p.options));
  if (keepNumber !== undefined) attrs.number = keepNumber;
  if (keepName !== undefined) attrs.name = keepName;
  if (keepView !== undefined) attrs.view = keepView;
  delete attrs.colors;
  render();
}

// ----- The outputs under the stage.
const FIRST = ["Beaumont", "Larocque", "Fontaine", "Ashworth", "Kowalski", "Tanaka", "Delacroix", "Brennan", "Okafor", "Lindqvist", "Moreau"];
const RAFTERS = [
  { team: "Canada", ja: "カナダ代表", shape: "rectangle", colors: ["#d52b1e", "#ffffff", "#0b2a6a"], number: 9, name: "Beaumont", years: "1948-1963", cut: "hockey" },
  { team: "United States", ja: "アメリカ代表", shape: "pennant", colors: ["#0b2a6a", "#ffffff", "#c8102e"], number: 12, name: "Brennan", years: "Retired 1972", cut: "football" },
  { team: "Japan", ja: "日本代表", shape: "shield", colors: ["#1f3a8a", "#ffffff", "#bc002d"], number: 10, name: "Tanaka", years: "2001-2016", cut: "soccer" },
  { team: "United States", ja: "アメリカ代表", shape: "rectangle", colors: ["#0b2a6a", "#ffffff", "#c8102e"], number: 4, name: "Ashworth", years: "1931-1947", cut: "baseball" },
  { team: "Canada", ja: "カナダ代表", shape: "shield", colors: ["#d52b1e", "#ffffff", "#0b2a6a"], number: 33, name: "Fontaine", years: "1979-1996", cut: "basketball" },
  { team: "Japan", ja: "日本代表", shape: "pennant", colors: ["#bc002d", "#ffffff", "#1b2a6b"], number: 99, name: "Suzuki", years: "Retired 1999", cut: "hockey" },
  { team: "Japan", ja: "日本代表", shape: "rectangle", colors: ["#1b2a6b", "#ffffff", "#bc002d"], number: 1, name: "Sato", years: "1960-1974", cut: "baseball" },
  { team: "United States", ja: "アメリカ代表", shape: "shield", colors: ["#0b2a6a", "#ffffff", "#c8102e"], number: 7, name: "Hollis", years: "1966-1980", cut: "hockey" },
];
// A banner in a real team's colours, from a preset: the made-up player's number, name and years on it, the preset's own sweater above.
const PRESET_RAFTERS = [
  ["nhl:montreal-1917-1927-home", "rectangle", 9, "Beaumont", "1948-1963"],
  ["mlb:redsox-1930-1969-home", "shield", 9, "Larkin", "1939-1960"],
  ["nba:celtics-1950-1996-home", "rectangle", 6, "Kowalski", "1956-1969"],
  ["nba:lakers-1967-1977-home", "pennant", 33, "Brennan", "Retired 1989"],
  ["nfl:packers-1959-1979-home", "shield", 15, "Delacroix", "1956-1971"],
  ["cfl:argonauts-1950s-home", "rectangle", 77, "Tremblay", "1951-1962"],
];
function drawRafters() {
  const grid = $("rafters-grid");
  grid.replaceChildren();
  for (const [id, shape, number, name, years] of PRESET_RAFTERS) {
    const p = presetsApi?.byId.get(id);
    if (p === undefined) continue;
    const o = p.options;
    const colors = [o.body ?? "#1f3a8a", o.trim ?? "#f4f0e4", o.accent ?? o.trim ?? "#c8102e"];
    const fig = el("figure", { class: "banner" });
    fig.innerHTML = renderBanner({ shape, colors, number, name, years, sweater: shape === "pennant" ? false : { ...o, colors: undefined, body: colors[1], trim: colors[0], accent: colors[2], look: "flat" }, size: 150, language: lang() });
    fig.append(el("figcaption", { text: `${lang() === "ja" ? p.ja : p.team}, ${p.years}` }));
    grid.append(fig);
  }
  for (const r of RAFTERS) {
    const svg = renderBanner({ shape: r.shape, colors: r.colors, number: r.number, name: r.name, years: r.years, sweater: r.shape !== "pennant" ? { cut: r.cut, colors: [r.colors[1], r.colors[0], r.colors[2]], pattern: r.cut === "baseball" ? "pinstripes" : "solid" } : false, size: 150, language: lang() });
    const fig = el("figure", { class: "banner" });
    fig.innerHTML = svg;
    fig.append(el("figcaption", { text: lang() === "ja" ? r.ja : r.team }));
    grid.append(fig);
  }
}

function colorsOf(o) {
  return [o.body ?? DEFAULTS.body, o.trim ?? DEFAULTS.trim, o.accent ?? DEFAULTS.accent];
}
function drawCaps() {
  const o = options();
  const [body, trim, accent] = colorsOf(o);
  const host = $("caps-grid");
  host.innerHTML = [
    renderCap({ colors: [body, trim], initials: "CAN", size: 130, look: o.look }),
    renderCap({ colors: [body, accent, trim], tone: "two-tone", initials: "USA", size: 130, look: o.look }),
    renderCap({ colors: [trim, body], initials: "JPN", view: "side", size: 130, look: o.look }),
    renderHelmet({ kind: "football", colors: [body, trim], mark: "number", number: o.number ?? 12, size: 130, look: o.look }),
    renderHelmet({ kind: "hockey", colors: [body, trim], size: 130, look: o.look, facing: "left" }),
    renderHelmet({ kind: "batting", colors: [body, accent], mark: "ring", size: 130, look: o.look }),
  ].map((s) => `<div class="cap">${s}</div>`).join("");
}

// ----- Matchup and lineup.
const SEG = (box, values, labelOf, current, onPick) => {
  box.replaceChildren();
  for (const v of values) box.append(el("button", { type: "button", "data-value": v, "aria-pressed": String(v === current), text: labelOf(v), onclick: () => onPick(v) }));
};
const presetOptionsOf = (id, fallback) => presetsApi?.byId.get(id)?.options ?? fallback;
const teamName = (id, fallback) => presetsApi?.byId.get(id)?.team ?? fallback;
function drawBuilders() {
  const away = presetOptionsOf(ui.ma, { colors: ["#1f3a8a", "#f4f0e4"], cut: "soccer" });
  const home = presetOptionsOf(ui.mh, { colors: ["#c8102e", "#f4f0e4"], cut: "soccer" });
  const cut = home.cut ?? "soccer";
  const view = ui.mv;
  SEG($("m-view"), ["front", "back", "both"], (v) => say(`view_${v}`), view, (v) => { ui.mv = v; drawBuilders(); syncUrl(); });
  $("m-out").innerHTML = kitMatchup({ away: { ...away, cut, number: 7, name: "Away", label: teamName(ui.ma, say("away")) }, home: { ...home, cut, number: 9, name: "Home", label: teamName(ui.mh, say("home")) }, view, size: 460 });
  const clash = kitClash(away, home);
  $("m-clash").textContent = clash ? say("clash") : say("noClash");
  const base = presetOptionsOf(ui.lt, { colors: ["#c8102e", "#f4f0e4"] });
  SEG($("l-labels"), ["name", "number", "none"], (v) => say(`labels_${v}`), ui.ll, (v) => { ui.ll = v; drawBuilders(); syncUrl(); });
  $("l-field").setAttribute("aria-pressed", String(ui.lfield === "1"));
  const players = FIRST.map((name, i) => ({ number: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11][i], name }));
  $("l-out").innerHTML = jerseyLineup(players, { formation: ui.lf, jersey: { ...base, cut: "soccer" }, labels: ui.ll, field: ui.lfield === "1", size: 440 });
}

// ----- Put it in your page.
const TABS = ["element", "iframe", "module", "svg", "data"];
let fullCode = "";
function drawEmbed() {
  const tabs = $("embed-tabs");
  if (tabs.children.length === 0) {
    for (const t of TABS) tabs.append(el("button", { type: "button", role: "tab", "data-tab": t, "data-testid": `tab-${t}`, onclick: () => { ui.et = t; drawEmbed(); syncUrl(); } }));
  }
  for (const b of tabs.children) {
    b.textContent = say(`embed_${b.dataset.tab}`);
    b.setAttribute("aria-selected", String(b.dataset.tab === ui.et));
  }
  const turnable = ui.etn === "1";
  $("embed-turnable").setAttribute("aria-pressed", String(turnable));
  $("embed-turnable").hidden = ui.et !== "element" && ui.et !== "iframe";
  $("embed-note").textContent = say(`embed${ui.et[0].toUpperCase()}${ui.et.slice(1)}Note`);
  const o = options();
  // A crest drawn from a string is long: the code says the options without it.
  const shown = { ...o };
  fullCode = embedCode(shown, ui.et, { turnable });
  $("embed-code").textContent = fullCode.length > 1400 ? `${fullCode.slice(0, 1400)}…` : fullCode;
  $("embed-download").hidden = ui.et !== "svg";
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); } catch {
    const a = el("textarea", { readonly: true, style: "position:fixed;opacity:0" });
    a.value = t;
    document.body.append(a);
    a.select();
    document.execCommand("copy");
    a.remove();
  }
}

// ----- The wall.
let wallBuilt = false;
const PAGE = 96;
let wallLimit = PAGE;
const decade = (years) => {
  const m = /(\d{4})/.exec(years);
  if (m === null) return 0;
  return Math.floor(Number(m[1]) / 10) * 10;
};
const eraOf = (p) => (decade(p.years) < 1930 ? "before-1930" : String(decade(p.years)));
const eraName = (e) => (e === "before-1930" ? (lang() === "ja" ? "1930年より前" : "Before 1930") : lang() === "ja" ? `${e}年代` : `${e}s`);
const leagueName = (id) => say(`leagues_${id.replace(/-/g, "_")}`);
let observer;
function buildWall() {
  const { LEAGUES, PRESETS } = presetsApi;
  const bar = $("wallbar");
  bar.replaceChildren();
  const chips = el("div", { class: "chips", role: "group", "aria-label": say("league") });
  const chip = (id, label, n) => el("button", { type: "button", class: "fam-chip", "data-league": id, "aria-pressed": String(ui.wl === id), "data-testid": `chip-${id}`, text: `${label} ${n}`, onclick: () => { ui.wl = id; wallLimit = PAGE; filterWall(); syncUrl(); } });
  chips.append(chip("all", say("allLeagues"), PRESETS.length));
  for (const l of LEAGUES) chips.append(chip(l.id, leagueName(l.id), l.presets.length));
  const eras = [...new Set(PRESETS.map(eraOf))].sort((a, b) => (a === "before-1930" ? -1 : b === "before-1930" ? 1 : Number(a) - Number(b)));
  const eraSel = el("select", { class: "fam-field", id: "wall-era", "data-testid": "wall-era", "aria-label": say("era") }, el("option", { value: "all", text: `${say("era")}: ${say("allEras")}` }), ...eras.map((e) => el("option", { value: e, text: eraName(e) })));
  eraSel.value = ui.we;
  eraSel.addEventListener("change", () => { ui.we = eraSel.value; wallLimit = PAGE; filterWall(); syncUrl(); });
  const q = el("input", { type: "search", class: "fam-field", id: "wall-q", "data-testid": "wall-q", placeholder: say("searchHint"), "aria-label": say("search"), autocomplete: "off", value: ui.wq });
  q.addEventListener("input", () => { ui.wq = q.value; wallLimit = PAGE; filterWall(); syncUrl(); });
  bar.append(chips, el("div", { class: "fam-row" }, eraSel, q));
  const grid = $("wallgrid");
  grid.replaceChildren();
  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const li = e.target;
      observer.unobserve(li);
      const p = presetsApi.byId.get(li.dataset.id);
      if (p === undefined) continue;
      li.querySelector(".wsvg").innerHTML = renderJersey({ ...p.options, view: "front", size: 100, look: "cloth", title: `${p.team}, ${p.years}, ${p.way}` });
    }
  }, { rootMargin: "400px" });
  const frag = document.createDocumentFragment();
  for (const p of PRESETS) {
    const li = el("li", { "data-id": p.id, "data-league": p.league });
    const b = el("button", { type: "button", class: "wcard", "data-testid": "wcard", title: say("tryThis"), onclick: () => { applyPreset(p.id); location.hash = "#try"; $("try").scrollIntoView(); } },
      el("span", { class: "wsvg" }),
      el("span", { class: "wname", text: lang() === "ja" ? p.ja : p.team }),
      el("span", { class: "wyears", text: `${p.years} · ${p.way}` }));
    li.append(b);
    li.dataset.era = eraOf(p);
    li.dataset.search = `${p.team} ${p.ja} ${p.years} ${p.way} ${p.id}`.toLowerCase();
    frag.append(li);
  }
  grid.append(frag);
  wallBuilt = true;
  filterWall();
}
function filterWall() {
  if (!wallBuilt) return;
  const { PRESETS, LEAGUES } = presetsApi;
  const word = ui.wq.trim().toLowerCase();
  let matched = 0;
  let shown = 0;
  const idOf = new Map(LEAGUES.flatMap((l) => l.presets.map((p) => [p.id, l.id])));
  for (const li of $("wallgrid").children) {
    const ok = (ui.wl === "all" || idOf.get(li.dataset.id) === ui.wl) && (ui.we === "all" || li.dataset.era === ui.we) && (word === "" || li.dataset.search.includes(word));
    if (ok) matched++;
    const visible = ok && matched <= wallLimit;
    li.hidden = !visible;
    if (visible) {
      shown++;
      if (li.querySelector(".wsvg").childElementCount === 0) observer.observe(li);
    }
  }
  $("wall-count").textContent = say("wallCount").replace("{n}", String(matched)).replace("{total}", String(PRESETS.length));
  const more = $("wall-more");
  more.hidden = matched <= shown;
  more.textContent = say("wallMore").replace("{n}", String(Math.min(PAGE, matched - shown)));
  for (const b of $("wallbar").querySelectorAll("[data-league]")) b.setAttribute("aria-pressed", String(b.dataset.league === ui.wl));
}

// ----- Officials: the referees, linesmen and umpires, by sport.
const OFFICIAL_SPORTS = ["all", "hockey", "basketball", "football", "soccer", "baseball", "rugby-lacrosse"];
const sportOf = (id) => {
  const key = id.slice(4);
  if (/^(nhl|hockey|pwhl)/.test(key)) return "hockey";
  if (/^(nba|wnba|fiba|euroleague|nbl|ncaa-basketball)/.test(key)) return "basketball";
  if (/^(football|nfl|cfl|ncaa-football|highschool)/.test(key)) return "football";
  if (/^soccer/.test(key)) return "soccer";
  if (/^mlb/.test(key)) return "baseball";
  return "rugby-lacrosse";
};
const MADE_UP = ["Beaumont", "Okafor", "Lindqvist", "Tanaka", "Marchetti", "Hollis", "Duval", "Reyes"];
let officialsBuilt = false;
function buildOfficials() {
  const list = presetsApi.PRESETS.filter((p) => p.league === "ref");
  const chips = $("officials-sports");
  chips.replaceChildren();
  chips.setAttribute("aria-label", say("sports_all"));
  for (const sport of OFFICIAL_SPORTS) {
    const n = sport === "all" ? list.length : list.filter((p) => sportOf(p.id) === sport).length;
    chips.append(el("button", { type: "button", class: "fam-chip", "data-sport": sport, "aria-pressed": String(ui.os === sport), "data-testid": `osport-${sport}`, text: `${say(`sports_${sport.replace(/-/g, "_")}`)} ${n}`, onclick: () => { ui.os = sport; filterOfficials(); syncUrl(); } }));
  }
  const grid = $("officials-grid");
  grid.replaceChildren();
  list.forEach((p, i) => {
    const li = el("li", { "data-id": p.id, "data-sport": sportOf(p.id) });
    const svg = renderJersey({ ...p.options, view: "both", number: 4 + ((i * 11) % 90), name: MADE_UP[i % MADE_UP.length], size: 104, look: "cloth", title: `${p.team}, ${p.years}, ${p.way}` });
    const b = el("button", { type: "button", class: "wcard ocard", "data-testid": "ocard", title: say("tryThis"), onclick: () => { applyPreset(p.id); location.hash = "#try"; $("try").scrollIntoView(); } },
      el("span", { class: "osvg" }),
      el("span", { class: "wname", text: lang() === "ja" ? p.ja : p.team }),
      el("span", { class: "wyears", text: `${p.years} · ${p.way}` }));
    b.querySelector(".osvg").innerHTML = svg;
    li.append(b);
    grid.append(li);
  });
  officialsBuilt = true;
  filterOfficials();
}
function filterOfficials() {
  if (!officialsBuilt) return;
  let n = 0;
  for (const li of $("officials-grid").children) {
    const ok = ui.os === "all" || li.dataset.sport === ui.os;
    li.hidden = !ok;
    if (ok) n++;
  }
  $("officials-count").textContent = say("officialsCount").replace("{n}", String(n));
  for (const b of $("officials-sports").children) b.setAttribute("aria-pressed", String(b.dataset.sport === ui.os));
}

// ----- Presets arrive: the selects, the wall.
function fillPresetSelects() {
  const { LEAGUES } = presetsApi;
  const groups = () => LEAGUES.map((l) => {
    const g = el("optgroup", { label: leagueName(l.id) });
    for (const p of l.presets) g.append(el("option", { value: p.id, text: `${lang() === "ja" ? p.ja : p.team}, ${p.years}, ${p.way}` }));
    return g;
  });
  const fill = (id, first) => {
    const s = $(id);
    if (s === null) return;
    s.replaceChildren(el("option", { value: "", text: first }), ...groups());
  };
  fill("preset", say("presetNone"));
  fill("m-away", say("presetNone"));
  fill("m-home", say("presetNone"));
  fill("l-team", say("presetNone"));
  $("preset").value = ui.preset;
  $("m-away").value = ui.ma;
  $("m-home").value = ui.mh;
  $("l-team").value = ui.lt;
}

async function loadPresets() {
  try {
    const mod = await import("./dist/presets-entry.js");
    const byId = new Map(mod.PRESETS.map((p) => [p.id, p]));
    presetsApi = { PRESETS: mod.PRESETS, LEAGUES: mod.LEAGUES, byId };
    usePresets(mod.PRESETS);
  } catch {
    $("wall-count").textContent = "";
    return;
  }
  fillPresetSelects();
  drawRafters();
  if (ui.preset !== "" && presetsApi.byId.has(ui.preset) && Object.keys(attrs).length <= Object.keys(DEFAULTS).length + 1 && !params.has("body")) applyPreset(ui.preset);
  buildWall();
  buildOfficials();
  drawBuilders();
  syncControls();
}

// ----- Draw everything that depends on the jersey.
function render() {
  syncControls();
  drawStage();
  $("yaw").value = ui.yaw;
  $("yaw-out").textContent = `${ui.yaw}°`;
  syncPlay();
  drawCaps();
  drawEmbed();
  syncUrl();
}

// ----- Wire the page.
$("background").addEventListener("change", () => { ui.background = $("background").value; syncUrl(); paintBackground(); });
$("yaw").addEventListener("input", () => {
  turn?.pause();
  syncPlay();
  turn?.setYaw(Number($("yaw").value));
});
$("play").addEventListener("click", () => {
  turn?.togglePlay();
  syncPlay();
});
$("front").addEventListener("click", () => {
  turn?.pause();
  turn?.setYaw(0);
  syncPlay();
});
$("m-away").addEventListener("change", () => { ui.ma = $("m-away").value; drawBuilders(); syncUrl(); });
$("m-home").addEventListener("change", () => { ui.mh = $("m-home").value; drawBuilders(); syncUrl(); });
$("m-swap").addEventListener("click", () => { [ui.ma, ui.mh] = [ui.mh, ui.ma]; $("m-away").value = ui.ma; $("m-home").value = ui.mh; drawBuilders(); syncUrl(); });
$("l-team").addEventListener("change", () => { ui.lt = $("l-team").value; drawBuilders(); syncUrl(); });
$("l-field").addEventListener("click", () => { ui.lfield = ui.lfield === "1" ? "0" : "1"; drawBuilders(); syncUrl(); });
for (const f of ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2"]) $("l-form").append(el("option", { value: f, text: f }));
$("l-form").value = ui.lf;
$("l-form").addEventListener("change", () => { ui.lf = $("l-form").value; drawBuilders(); syncUrl(); });
$("wall-more").addEventListener("click", () => { wallLimit += PAGE; filterWall(); });
$("embed-turnable").addEventListener("click", () => { ui.etn = ui.etn === "1" ? "0" : "1"; drawEmbed(); syncUrl(); });
$("embed-copy").addEventListener("click", async () => {
  await copyText(fullCode);
  $("embed-status").textContent = say("copied");
  setTimeout(() => { $("embed-status").textContent = ""; }, 2400);
});
$("embed-download").addEventListener("click", () => {
  const blob = new Blob([embedCode(options(), "svg")], { type: "image/svg+xml" });
  const link = el("a", { href: URL.createObjectURL(blob), download: "senshu-jersey.svg" });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

function everything() {
  buildControls();
  render();
  drawRafters();
  drawBuilders();
  if (presetsApi !== undefined) {
    fillPresetSelects();
    buildWall();
    buildOfficials();
  }
}
window.addEventListener("senshu-language", everything);

buildControls();
render();
paintBackground();
drawRafters();
drawBuilders();
loadPresets();
