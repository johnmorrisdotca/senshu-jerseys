// The jersey's options as text: the attributes of `<senshu-jersey>` and the query of `embed.html` are the same words, read by one function and written by another.
import { readColour } from "./colour.ts";
import { CUT_IDS, type CutId } from "./cuts.ts";
import { bandsOf, type Bands, type ChestBadge, type JerseyOptions, type SleeveDetail } from "./options.ts";

/** Every attribute that sets an option; the element watches these. */
export const OPTION_ATTRIBUTES = [
  "cut", "fit", "colors", "body", "trim", "accent", "number-fill", "number-outline", "pattern", "collar", "sleeve", "yoke", "closure", "raglan", "piping",
  "sleeve-stripes", "hem-stripes", "chest-band", "chest-y", "collar-color", "sleeve-color", "panels", "number", "name", "name-arch", "front-text", "front-number",
  "patch", "chest-badges", "sleeve-numbers", "sleeve-left", "sleeve-right", "crest", "view", "look", "language", "size", "title", "description", "kit", "pants", "pants-trim", "socks", "socks-trim", "helmet",
  "repeat", "pants-bands", "socks-bands", "stripe-count", "pattern-sleeves", "arm-stripes", "cuffs", "front-text-angle", "armbands", "pocket", "badge", "protector", "plate", "national",
] as const;

const bare = (v: string): string => (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(v) ? `#${v}` : v);
const flag = (v: string | null): boolean | undefined => (v === null ? undefined : v !== "false" && v !== "0");
const DETAIL_KEYS = ["number", "size", "at", "around", "fill", "outline", "patch", "patchText", "patchSize", "patchAt", "patchAround", "patchFill", "patchOutline"] as const;
const NUMERIC = new Set(["size", "at", "around", "patchSize", "patchAt", "patchAround"]);
const COLOURS = new Set(["fill", "outline", "patchFill", "patchOutline"]);
const kebab = (k: string): string => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** A sleeve's detail from text such as `number:77;size:20;at:30;fill:ffd100` (a colour with or without its `#`). A key that is not one of the detail's, or a value that is not a number where one is wanted, is left out. */
export function detailFromText(text: string): SleeveDetail {
  const d: Record<string, unknown> = {};
  for (const part of text.split(";")) {
    const at = part.indexOf(":");
    if (at < 0) continue;
    const key = part.slice(0, at).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const value = part.slice(at + 1).trim();
    if (!(DETAIL_KEYS as readonly string[]).includes(key) || value === "") continue;
    if (key === "number" && value === "false") d[key] = false;
    else if (NUMERIC.has(key)) {
      if (/^-?\d+(?:\.\d+)?$/.test(value)) d[key] = Number(value);
    } else if (COLOURS.has(key)) {
      if (readColour(bare(value)) !== undefined) d[key] = bare(value);
    } else d[key] = value;
  }
  return d as SleeveDetail;
}

/** A sleeve's detail as text, the reverse of `detailFromText`. */
export function detailToText(d: SleeveDetail, hash = true): string {
  const parts: string[] = [];
  for (const key of DETAIL_KEYS) {
    const v = d[key];
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${kebab(key)}:${COLOURS.has(key) && !hash && typeof v === "string" ? strip(v) : String(v)}`);
  }
  return parts.join(";");
}

const CHEST_NUMERIC = new Set(["size", "dx", "dy"]);
const CHEST_COLOURS = new Set(["fill", "outline", "ink"]);
const CHEST_TEXT = ["kind", "side", "text", "shape", "art"] as const;

/**
 * The chest badges from text: badges separated by `|`, each `key:value` pairs separated by `;`: `kind:C;side:left|kind:flag;side:right;flag:d52b1e+fff+d52b1e;flag-direction:vertical`. The keys are the badge's (`kind`, `side`,
 * `text`, `shape`, `size`, `dx`, `dy`, `fill`, `outline`, `ink`, `nudge`, `art`) and, for a flag, `flag` (its colours joined by `+`), `flag-direction`, `flag-canton` and `flag-disc`. A colour is with or without its `#`.
 */
export function chestFromText(text: string): ChestBadge[] {
  const out: ChestBadge[] = [];
  for (const entry of text.split("|").slice(0, 4)) {
    const d: Record<string, unknown> = {};
    const flag: Record<string, unknown> = {};
    for (const part of entry.split(";")) {
      const at = part.indexOf(":");
      if (at < 0) continue;
      const key = part.slice(0, at).trim();
      const value = part.slice(at + 1).trim();
      if (value === "") continue;
      if (key === "flag") flag.stripes = value.split("+").map(bare);
      else if (key === "flag-direction") flag.direction = value;
      else if (key === "flag-canton" || key === "flag-disc") flag[key.slice(5)] = bare(value);
      else if ((CHEST_TEXT as readonly string[]).includes(key)) d[key] = value;
      else if (CHEST_NUMERIC.has(key)) {
        if (/^-?\d+(?:\.\d+)?$/.test(value)) d[key] = Number(value);
      } else if (CHEST_COLOURS.has(key)) {
        if (readColour(bare(value)) !== undefined) d[key] = bare(value);
      } else if (key === "nudge") d.nudge = value !== "false" && value !== "0";
    }
    if (Object.keys(flag).length > 0) d.flag = flag;
    if (Object.keys(d).length > 0) out.push(d as ChestBadge);
  }
  return out;
}

/** The chest badges as text, the reverse of `chestFromText`. */
export function chestToText(badges: ChestBadge | readonly ChestBadge[], hash = true): string {
  const list = Array.isArray(badges) ? badges : [badges];
  return list
    .filter((b) => b !== null && typeof b === "object")
    .slice(0, 4)
    .map((b) => {
      const parts: string[] = [];
      for (const key of [...CHEST_TEXT, "size", "dx", "dy", "fill", "outline", "ink", "nudge"] as const) {
        const v = b[key as keyof ChestBadge];
        if (v === undefined || v === null || v === "") continue;
        parts.push(`${key}:${CHEST_COLOURS.has(key) && !hash && typeof v === "string" ? strip(v) : String(v)}`);
      }
      const f = b.flag;
      if (f !== undefined && f !== null && typeof f === "object") {
        if (Array.isArray(f.stripes)) parts.push(`flag:${(f.stripes as readonly string[]).map((c: string) => (hash ? c : strip(c))).join("+")}`);
        if (f.direction !== undefined) parts.push(`flag-direction:${f.direction}`);
        if (f.canton !== undefined) parts.push(`flag-canton:${hash ? f.canton : strip(f.canton)}`);
        if (f.disc !== undefined) parts.push(`flag-disc:${hash ? f.disc : strip(f.disc)}`);
      }
      return parts.join(";");
    })
    .filter((t) => t !== "")
    .join("|");
}

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
  const fit = read("fit");
  if (fit === "mens" || fit === "womens") o.fit = fit;
  const colors = read("colors");
  if (colors !== null && colors.trim() !== "") o.colors = colors.split(",").map((c) => bare(c.trim())).slice(0, 5);
  for (const [name, key] of [["body", "body"], ["trim", "trim"], ["accent", "accent"], ["number-fill", "numberFill"], ["number-outline", "numberOutline"], ["pants", "pants"], ["pants-trim", "pantsTrim"], ["socks", "socks"], ["socks-trim", "socksTrim"], ["helmet", "helmet"]] as const) colour(name, key);
  for (const name of ["pattern", "collar", "sleeve", "yoke", "closure", "name", "name-arch", "front-text", "front-text-angle", "patch", "crest", "view", "look", "language", "title", "description", "badge", "national"]) text(name);
  for (const name of ["raglan", "piping", "kit", "pattern-sleeves", "pocket", "protector"]) {
    const f = flag(read(name));
    if (f !== undefined) o[name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = f;
  }
  const chestText = read("chest-badges");
  if (chestText !== null && chestText.trim() !== "") o.chestBadges = chestFromText(chestText);
  const sn = read("sleeve-numbers");
  if (sn !== null) o.sleeveNumbers = sn === "both" || sn === "left" || sn === "right" ? sn : flag(sn);
  for (const [name, key] of [["sleeve-left", "sleeveLeft"], ["sleeve-right", "sleeveRight"]] as const) {
    const v = read(name);
    if (v !== null && v.trim() !== "") o[key] = detailFromText(v);
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
  const cuffs = read("cuffs");
  if (cuffs !== null && cuffs.trim() !== "") {
    const nums = list(cuffs);
    o.cuffs = nums.length === 1 ? nums[0] : nums;
  }
  const arm = read("armbands");
  if (arm !== null && arm.trim() !== "") {
    const nums = list(arm);
    o.armbands = arm.trim() === "true" ? 2 : nums.length === 1 ? nums[0] : nums;
  }
  const plate = read("plate");
  if (plate !== null) {
    if (plate === "" || plate === "true") o.plate = true;
    else if (readColour(bare(plate)) !== undefined) o.plate = bare(plate);
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
    if (v !== null && (key === "collarColor" ? /^[0123]$/ : /^[012]$/).test(v.trim())) o[key] = Number(v);
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
  for (const [k, v] of [["fit", o.fit], ["pattern", o.pattern], ["collar", o.collar], ["sleeve", o.sleeve], ["yoke", o.yoke], ["closure", o.closure], ["name", o.name], ["name-arch", o.nameArch], ["front-text", o.frontText], ["front-text-angle", o.frontTextAngle], ["patch", o.patch], ["badge", o.badge], ["view", o.view], ["look", o.look], ["language", o.language], ["title", o.title]] as const) set(k, v);
  for (const [k, v] of [["raglan", o.raglan], ["piping", o.piping], ["sleeve-numbers", o.sleeveNumbers], ["kit", o.kit], ["pocket", o.pocket], ["protector", o.protector]] as const) set(k, v);
  if (o.patternSleeves === false) out["pattern-sleeves"] = "false";
  if (o.chestBadges !== undefined && o.chestBadges !== null) set("chest-badges", chestToText(o.chestBadges, hash));
  for (const [k, v] of [["sleeve-left", o.sleeveLeft], ["sleeve-right", o.sleeveRight]] as const) if (v !== undefined && v !== null && typeof v === "object") set(k, detailToText(v, hash));
  set("stripe-count", o.stripeCount);
  set("number", o.number);
  if (o.frontNumber === true) out["front-number"] = "true";
  else if (o.frontNumber !== undefined && o.frontNumber !== false) out["front-number"] = String(o.frontNumber);
  for (const [k, v] of [["sleeve-stripes", o.sleeveStripes], ["hem-stripes", o.hemStripes]] as const) if (v !== undefined) out[k] = Array.isArray(v) ? v.join(" ") : String(v);
  if (o.cuffs !== undefined) out.cuffs = Array.isArray(o.cuffs) ? o.cuffs.join(" ") : String(o.cuffs);
  if (o.armbands !== undefined) out.armbands = Array.isArray(o.armbands) ? o.armbands.join(" ") : String(o.armbands);
  if (o.plate === true) out.plate = "true";
  else if (typeof o.plate === "string") out.plate = c(o.plate);
  if (o.chestBand === true) out["chest-band"] = "true";
  else if (Array.isArray(o.chestBand)) out["chest-band"] = o.chestBand.join(" ");
  for (const [k, v] of [["repeat", o.repeat], ["arm-stripes", o.armStripes], ["pants-bands", o.pantsBands], ["socks-bands", o.socksBands]] as const) if (v !== undefined && v.length > 0) out[k] = v.join(" ");
  set("chest-y", o.chestY);
  set("collar-color", o.collarColor);
  set("sleeve-color", o.sleeveColor);
  set("panels", o.panels);
  set("size", o.size);
  set("crest", o.crest);
  if (typeof o.national === "string") set("national", o.national);
  else if (o.national !== undefined && o.national !== null && typeof o.national === "object" && typeof o.national.country === "string") set("national", `${o.national.country}:${o.national.layout ?? "centred"}${o.national.direction === "up" || o.national.direction === "down" ? `:${o.national.direction}` : ""}`);
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
