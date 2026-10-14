// The jersey's options as text: the attributes of `<senshu-jersey>` and the query of `embed.html` are the same words, read by one function and written by another.
import { readColour } from "./colour.ts";
import { CUT_IDS, type CutId } from "./cuts.ts";
import { bandsOf, type Bands, type JerseyOptions } from "./options.ts";

/** Every attribute that sets an option; the element watches these. */
export const OPTION_ATTRIBUTES = [
  "cut", "colors", "body", "trim", "accent", "number-fill", "number-outline", "pattern", "collar", "sleeve", "yoke", "closure", "raglan", "piping",
  "sleeve-stripes", "hem-stripes", "chest-band", "chest-y", "collar-color", "sleeve-color", "panels", "number", "name", "name-arch", "front-text", "front-number",
  "patch", "sleeve-numbers", "crest", "view", "look", "language", "size", "title", "description", "kit", "pants", "pants-trim", "socks", "socks-trim", "helmet",
  "repeat", "pants-bands", "socks-bands", "stripe-count", "pattern-sleeves", "arm-stripes",
] as const;

const bare = (v: string): string => (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(v) ? `#${v}` : v);
const flag = (v: string | null): boolean | undefined => (v === null ? undefined : v !== "false" && v !== "0");
const list = (v: string): number[] => v.split(/[\s,]+/).filter((s) => s !== "").map(Number);

/** The options `read` finds, a function from an attribute's name to its text or `null`. Nothing here is trusted: `renderJersey` checks every value again. */
export function optionsFromAttributes(read: (name: string) => string | null): JerseyOptions {
  const o: Record<string, unknown> = {};
  const text = (name: string, key = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())): void => {
    const v = read(name);
    if (v !== null && v !== "") o[key] = v;
  };
  const colour = (name: string, key: string): void => {
    const v = read(name);
    if (v !== null && readColour(bare(v)) !== undefined) o[key] = bare(v);
  };
  const cut = read("cut");
  if (cut !== null && (CUT_IDS as readonly string[]).includes(cut)) o.cut = cut as CutId;
  const colors = read("colors");
  if (colors !== null && colors.trim() !== "") o.colors = colors.split(",").map((c) => bare(c.trim())).slice(0, 5);
  for (const [name, key] of [["body", "body"], ["trim", "trim"], ["accent", "accent"], ["number-fill", "numberFill"], ["number-outline", "numberOutline"], ["pants", "pants"], ["pants-trim", "pantsTrim"], ["socks", "socks"], ["socks-trim", "socksTrim"], ["helmet", "helmet"]] as const) colour(name, key);
  for (const name of ["pattern", "collar", "sleeve", "yoke", "closure", "name", "name-arch", "front-text", "patch", "crest", "view", "look", "language", "title", "description"]) text(name);
  for (const name of ["raglan", "piping", "sleeve-numbers", "kit", "pattern-sleeves"]) {
    const f = flag(read(name));
    if (f !== undefined) o[name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = f;
  }
  const number = read("number");
  if (number !== null && number !== "") o.number = number;
  const front = read("front-number");
  if (front !== null) o.frontNumber = front === "" || front === "true" ? true : front === "false" ? false : front;
  for (const [name, key] of [["sleeve-stripes", "sleeveStripes"], ["hem-stripes", "hemStripes"]] as const) {
    const v = read(name);
    if (v === null || v.trim() === "") continue;
    const nums = list(v);
    o[key] = nums.length === 1 ? nums[0] : (bandsOf(nums) as Bands | undefined);
  }
  const chest = read("chest-band");
  if (chest !== null) {
    if (chest === "" || chest === "true") o.chestBand = true;
    else if (chest !== "false") o.chestBand = bandsOf(list(chest));
  }
  for (const [name, key] of [["repeat", "repeat"], ["arm-stripes", "armStripes"], ["pants-bands", "pantsBands"], ["socks-bands", "socksBands"]] as const) {
    const v = read(name);
    if (v !== null && v.trim() !== "") o[key] = bandsOf(list(v));
  }
  for (const [name, key] of [["chest-y", "chestY"], ["size", "size"], ["stripe-count", "stripeCount"]] as const) {
    const v = read(name);
    if (v !== null && /^\d+(?:\.\d+)?$/.test(v.trim())) o[key] = Number(v);
  }
  for (const [name, key] of [["collar-color", "collarColor"], ["sleeve-color", "sleeveColor"], ["panels", "panels"]] as const) {
    const v = read(name);
    if (v !== null && /^[012]$/.test(v.trim())) o[key] = Number(v);
  }
  return o as JerseyOptions;
}

const strip = (c: string): string => (/^#[0-9a-f]{3,6}$/i.test(c) ? c.slice(1) : c);

/** The attributes (and the query) that say these options: only what is set. The reverse of `optionsFromAttributes`. */
export function attributesFromOptions(o: JerseyOptions, hash = true): Record<string, string> {
  const out: Record<string, string> = {};
  const c = hash ? (v: string): string => v : strip;
  const set = (k: string, v: unknown): void => {
    if (v !== undefined && v !== null && v !== "" && v !== false) out[k] = v === true ? "true" : String(v);
  };
  set("cut", o.cut);
  if (Array.isArray(o.colors) && o.colors.length > 0) out.colors = o.colors.map(c).join(",");
  set("body", o.body === undefined ? undefined : c(o.body));
  set("trim", o.trim === undefined ? undefined : c(o.trim));
  set("accent", o.accent === undefined ? undefined : c(o.accent));
  set("number-fill", o.numberFill === undefined ? undefined : c(o.numberFill));
  set("number-outline", o.numberOutline === undefined ? undefined : c(o.numberOutline));
  for (const [k, v] of [["pattern", o.pattern], ["collar", o.collar], ["sleeve", o.sleeve], ["yoke", o.yoke], ["closure", o.closure], ["name", o.name], ["name-arch", o.nameArch], ["front-text", o.frontText], ["patch", o.patch], ["view", o.view], ["look", o.look], ["language", o.language], ["title", o.title]] as const) set(k, v);
  for (const [k, v] of [["raglan", o.raglan], ["piping", o.piping], ["sleeve-numbers", o.sleeveNumbers], ["kit", o.kit]] as const) set(k, v);
  if (o.patternSleeves === false) out["pattern-sleeves"] = "false";
  set("stripe-count", o.stripeCount);
  set("number", o.number);
  if (o.frontNumber === true) out["front-number"] = "true";
  else if (o.frontNumber !== undefined && o.frontNumber !== false) out["front-number"] = String(o.frontNumber);
  for (const [k, v] of [["sleeve-stripes", o.sleeveStripes], ["hem-stripes", o.hemStripes]] as const) if (v !== undefined) out[k] = Array.isArray(v) ? v.join(" ") : String(v);
  if (o.chestBand === true) out["chest-band"] = "true";
  else if (Array.isArray(o.chestBand)) out["chest-band"] = o.chestBand.join(" ");
  for (const [k, v] of [["repeat", o.repeat], ["arm-stripes", o.armStripes], ["pants-bands", o.pantsBands], ["socks-bands", o.socksBands]] as const) if (v !== undefined && v.length > 0) out[k] = v.join(" ");
  set("chest-y", o.chestY);
  set("collar-color", o.collarColor);
  set("sleeve-color", o.sleeveColor);
  set("panels", o.panels);
  set("size", o.size);
  set("crest", o.crest);
  for (const [k, v] of [["pants", o.pants], ["pants-trim", o.pantsTrim], ["socks", o.socks], ["socks-trim", o.socksTrim], ["helmet", o.helmet]] as const) set(k, v === undefined ? undefined : c(v));
  return out;
}

/** The options as a query string for `embed.html`: colours without their `#`. */
export function jerseyToParams(o: JerseyOptions, extra: Record<string, string> = {}): URLSearchParams {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(attributesFromOptions(o, false))) q.set(k, v);
  for (const [k, v] of Object.entries(extra)) q.set(k, v);
  return q;
}

/** The options a query string says. */
export function jerseyFromParams(q: URLSearchParams): JerseyOptions {
  return optionsFromAttributes((name) => q.get(name));
}
