// `renderBanner`: a retired-number banner as it hangs from the rafters: a rectangle, a pennant or a shield in the team's colours, the number, the name, the years or the
// honour, and, if asked, a sweater of the team with the number on its back. `kind: "hanging"` is the other cut: last name, a big number and a caller-supplied logo, no years and
// no sweater, like a plate from the rafters. A championship banner, a pennant or a ring is not this; those are in dougu-sports. The package draws no team's mark: a hanging
// banner shows a logo only when the caller passes one (an SVG document, a data address, or an http(s) or root-relative image).
import { BLACK, WHITE, clean, contrast, esc, hashOf, hexOf, inkOn, lum, readColour, shade, type Rgb } from "./colour.ts";
import { jerseyView, uidOf } from "./jersey.ts";
import { TITLE_WORDS } from "./names.ts";
import { LANGUAGE_IDS, LOOK_IDS, resolve, type JerseyOptions, type LanguageId, type LookId } from "./options.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

export const BANNER_SHAPES = ["rectangle", "pennant", "shield"] as const;
export type BannerShape = (typeof BANNER_SHAPES)[number];
export const BANNER_KINDS = ["rafter", "hanging"] as const;
export type BannerKind = (typeof BANNER_KINDS)[number];

export interface BannerOptions {
  shape?: BannerShape;
  /** `"rafter"` (the default): a pennant from the rafters, with an optional sweater. `"hanging"`: last name, number and a caller-supplied logo, no years. */
  kind?: BannerKind;
  /** `[field, trim, trim2?, ink?]`. */
  colors?: readonly string[];
  number?: string | number;
  name?: string;
  /** The years played, or the honour: `"1948-1963"`, `"Retired 1972"`. Ignored when `kind` is `"hanging"`. */
  years?: string;
  /** A sweater filling the banner, number and name on its back: `true` for one in the banner's colours, or its own options. */
  sweater?: boolean | JerseyOptions;
  /**
   * A mark the caller already holds, for a hanging banner: an SVG document, a `data:image…` address, or an `http(s):` or root-relative image.
   * Anything else is ignored. The package never draws a team's own mark.
   */
  logo?: string;
  look?: LookId;
  size?: number;
  language?: LanguageId;
  title?: string;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** An image `href` from a caller-supplied logo, or `undefined` when the value is not a safe SVG, data address, or http(s)/root-relative URL. */
export function logoHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (text.length === 0 || text.length > 200_000) return undefined;
  if (/^(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(text)) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  }
  if (/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(text) && !/[\s"'<>]/.test(text.slice(0, 80))) {
    return text;
  }
  if (/^https?:\/\/[^\s"'<>\\]+$/i.test(text) && text.length <= 2000) return text;
  if (/^\/[^\s"'<>\\]*$/.test(text) && text.length <= 500) return text;
  return undefined;
}

const markAt = (text: string, cx: number, cy: number, h: number, w: number, weight: "bold" | "black", fill: string, outline?: { colour: string; width: number }, line?: boolean): string => {
  const run = layout(text, cx, cy, { height: h, maxWidth: w, weight, tracking: 0.4 });
  if (line) return drawRun(run, "currentColor", undefined, undefined);
  return drawRun(run, fill, outline, undefined);
};

export function renderBanner(options?: BannerOptions): string {
  const o: BannerOptions = options !== null && typeof options === "object" ? options : {};
  const kind = pick(BANNER_KINDS, o.kind, "rafter");
  const shape = pick(BANNER_SHAPES, o.shape, "rectangle");
  const list = Array.isArray(o.colors) ? o.colors : [];
  const field = readColour(list[0]) ?? ([31, 58, 138] as Rgb);
  const trim = readColour(list[1]) ?? ([244, 240, 228] as Rgb);
  const trim2 = readColour(list[2]) ?? trim;
  const given = readColour(list[3]);
  const num = clean(typeof o.number === "number" ? String(Math.trunc(Math.abs(o.number))) : o.number, 4)?.replace(/\D/g, "").slice(0, 2);
  const name = clean(o.name, 20)?.toUpperCase();
  const years = kind === "hanging" ? undefined : clean(o.years, 24)?.toUpperCase();
  const look = pick(LOOK_IDS, o.look, "cloth");
  const language = pick(LANGUAGE_IDS, o.language, "en");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const sweaterOpts: JerseyOptions | undefined =
    kind === "hanging"
      ? undefined
      : o.sweater === true
        ? { colors: [hexOf(trim), hexOf(field)], cut: "hockey" }
        : typeof o.sweater === "object" && o.sweater !== null
          ? o.sweater
          : undefined;
  const logo = kind === "hanging" ? logoHref(o.logo) : undefined;
  const uid = `sb${hashOf(JSON.stringify([kind, shape, field, trim, trim2, given, num, name, years, look, sweaterOpts, logo === undefined ? "" : hashOf(logo)]))}`;
  const line = look === "line";
  const cloth = look === "cloth";
  const hx = hexOf;
  const ink = given ?? inkOn([field], [trim, WHITE, BLACK]);
  const edge = line ? "currentColor" : hx(lum(field) > 0.1 ? shade(field, -0.42) : shade(field, 0.3));
  const W = 200;
  const H = 280;
  const words = TITLE_WORDS[language];
  const title =
    clean(o.title, 120) ??
    (language === "ja"
      ? `${words.banner}${num === undefined ? "" : `（${num}）`}${name === undefined ? "" : ` ${name}`}`
      : `${words.banner}${num === undefined ? "" : ` ${num}`}${name === undefined ? "" : `, ${name}`}`);

  if (kind === "hanging") {
    return wrapSvg({ id: uid, w: W, h: H, width: size, title, defs: hangingDefs(uid, cloth), body: hangingBody({ uid, field, trim, trim2, ink, edge, line, cloth, hx, num, name, logo }) });
  }

  let defs = "";
  let body = "";
  // The shape, its top edge at y = 30 under a rod.
  const OUT = {
    rectangle: "M30 30H170V236L100 224L30 236Z",
    pennant: "M30 30H170L100 262Z",
    shield: "M30 30H170V148C170 196 138 230 100 254C62 230 30 196 30 148Z",
  }[shape];
  const IN = {
    rectangle: "M38 38H162V224L100 214L38 224Z",
    pennant: "M44 38H156L100 240Z",
    shield: "M38 38H162V148C162 190 134 222 100 244C66 222 38 190 38 148Z",
  }[shape];
  defs += `<clipPath id="${uid}c"><path d="${OUT}"/></clipPath>`;
  // The cords and the rod.
  if (!line) body += `<path d="M44 30L100 6L156 30" fill="none" stroke="${hx(shade(field, -0.3))}" stroke-width="1.6" stroke-linejoin="round"/>`;
  else body += `<path d="M44 30L100 6L156 30" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`;
  body += line
    ? `<path d="M22 24H178V32H22Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="M22 24H178V32H22Z" fill="${hx(shade(trim, lum(trim) > 0.5 ? -0.25 : 0.2))}" stroke="${hx(shade(trim, -0.5))}" stroke-width="1.2" stroke-linejoin="round"/>`;
  body += line ? "" : `<path d="${OUT}" fill="${hx(field)}"/>`;
  if (!line) body += `<g clip-path="url(#${uid}c)"><path d="${OUT}" fill="none" stroke="${hx(trim)}" stroke-width="10"/><path d="${IN}" fill="none" stroke="${hx(trim2)}" stroke-width="1.6"/></g>`;
  else body += `<path d="${IN}" fill="none" stroke="currentColor" stroke-width="3.4"/>`;
  if (cloth) {
    defs += `<linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
    body += `<path d="${OUT}" fill="url(#${uid}g)"/>`;
  }
  body += `<path d="${OUT}" fill="none" stroke="${edge}" stroke-width="${line ? 6 : 1.6}" stroke-linejoin="round"/>`;
  // What is written on it. Every line sits inside the inner line (`IN`) with clear space round it, and the widest it may be is what the cloth leaves at its lower edge: the pennant and the shield narrow
  // as they go down, and the rectangle ends at the notch's apex (y = 214), so its lines are stacked above that. A longer name or run of years is made smaller, not longer. `test/banner.test.ts` measures it.
  const filled = sweaterOpts !== undefined;
  const zone = shape === "pennant"
    ? filled
      ? { nx: 100, ny: 78, nh: 50, nw: 54, namey: 117, nameh: 10, namew: 49, yy: 158, yh: 12, yw: 36 }
      : { nx: 100, ny: 78, nh: 50, nw: 54, namey: 117, nameh: 10, namew: 49, yy: 132, yh: 8, yw: 41 }
    : shape === "shield"
      ? filled
        ? { nx: 100, ny: 140, nh: 52, nw: 82, namey: 177, nameh: 13, namew: 80, yy: 198, yh: 14, yw: 72 }
        : { nx: 100, ny: 106, nh: 80, nw: 82, namey: 170, nameh: 14, namew: 88, yy: 192, yh: 10, yw: 66 }
      : filled
        ? { nx: 100, ny: 144, nh: 56, nw: 82, namey: 185, nameh: 13, namew: 104, yy: 194, yh: 16, yw: 100 }
        : { nx: 100, ny: 112, nh: 84, nw: 82, namey: 176, nameh: 14, namew: 104, yy: 197, yh: 10, yw: 90 };
  const outline = line || contrast(ink, field) >= 4.5 ? undefined : { colour: hx(inkOn([ink], [BLACK, WHITE], 3)), width: 1.4 };
  const write = (text: string, cx: number, cy: number, h: number, w: number, weight: "bold" | "black"): string =>
    markAt(text, cx, cy, h, w, weight, line ? "currentColor" : hx(ink), outline, line);

  if (filled) {
    const placed = placeSweater(shape);
    const r = resolve({
      ...sweaterOpts,
      view: "back",
      look: line ? "line" : "flat",
      ...(num !== undefined && num !== "" ? { number: num } : {}),
      ...(name !== undefined ? { name } : {}),
    });
    const view = jerseyView(r, "back", uidOf(r, "banner"));
    defs += view.defs;
    body += `<g clip-path="url(#${uid}c)"><g transform="translate(${n2(placed.x)} ${n2(placed.y)}) scale(${n2(placed.scale)})">${view.body}</g></g>`;
    if (years !== undefined) body += write(years, 100, zone.yy, zone.yh, zone.yw, "bold");
  } else {
    if (num !== undefined && num !== "") body += write(num, zone.nx, zone.ny, zone.nh, zone.nw, "black");
    if (name !== undefined) body += write(name, 100, zone.namey, zone.nameh, zone.namew, "bold");
    if (years !== undefined) body += write(years, 100, zone.yy, zone.yh, zone.yw, "bold");
  }
  return wrapSvg({ id: uid, w: W, h: H, width: size, title, defs, body });
}

/** Where a back-view sweater sits so it fills the cloth, leaving a band below for the years. */
function placeSweater(shape: BannerShape): { x: number; y: number; scale: number } {
  const scale = shape === "pennant" ? 0.48 : shape === "shield" ? 0.52 : 0.58;
  return { x: 100 - 100 * scale, y: shape === "pennant" ? 36 : 38, scale };
}

function hangingDefs(uid: string, cloth: boolean): string {
  const out = hangingOut();
  let defs = `<clipPath id="${uid}c"><path d="${out}"/></clipPath>`;
  if (cloth) {
    defs += `<linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`;
  }
  return defs;
}

const hangingOut = (): string => "M36 40H164V248H36Z";

function hangingBody(p: {
  uid: string;
  field: Rgb;
  trim: Rgb;
  trim2: Rgb;
  ink: Rgb;
  edge: string;
  line: boolean;
  cloth: boolean;
  hx: (c: Rgb) => string;
  num: string | undefined;
  name: string | undefined;
  logo: string | undefined;
}): string {
  const { uid, field, trim, trim2, ink, edge, line, cloth, hx, num, name, logo } = p;
  const out = hangingOut();
  let body = "";
  // A string through two holes, like a plate hung on a nail, not the rafter rod.
  const cord = line ? "currentColor" : hx(shade(trim, lum(trim) > 0.5 ? -0.35 : 0.25));
  body += `<path d="M78 40C78 14 122 14 122 40" fill="none" stroke="${cord}" stroke-width="${line ? 5 : 2.2}" stroke-linecap="round"/>`;
  if (!line) {
    body += `<circle cx="78" cy="40" r="3.2" fill="${hx(shade(trim, -0.2))}" stroke="${hx(shade(trim, -0.5))}" stroke-width="1"/>`;
    body += `<circle cx="122" cy="40" r="3.2" fill="${hx(shade(trim, -0.2))}" stroke="${hx(shade(trim, -0.5))}" stroke-width="1"/>`;
  }
  body += line ? "" : `<path d="${out}" fill="${hx(field)}"/>`;
  if (!line) body += `<g clip-path="url(#${uid}c)"><path d="${out}" fill="none" stroke="${hx(trim)}" stroke-width="10"/></g>`;
  else body += `<path d="${out}" fill="none" stroke="currentColor" stroke-width="5"/>`;
  if (cloth) body += `<path d="${out}" fill="url(#${uid}g)"/>`;
  body += `<path d="${out}" fill="none" stroke="${edge}" stroke-width="${line ? 6 : 1.6}" stroke-linejoin="round"/>`;
  // Hem stripes in the trim colours, like a real hanging banner.
  if (!line) {
    body += `<g clip-path="url(#${uid}c)">`;
    body += `<path d="M36 220H164V228H36Z" fill="${hx(trim)}"/>`;
    body += `<path d="M36 228H164V236H36Z" fill="${hx(trim2)}"/>`;
    body += `<path d="M36 236H164V248H36Z" fill="${hx(trim)}"/>`;
    body += `</g>`;
  }
  const nameFill = line ? "currentColor" : hx(contrast(trim, field) >= 4.5 ? trim : ink);
  const numRgb = contrast(trim2, field) >= 3 ? trim2 : ink;
  const numFill = line ? "currentColor" : hx(numRgb);
  const numOutline = line || contrast(numRgb, field) >= 4.5 ? undefined : { colour: hx(inkOn([numRgb], [BLACK, WHITE], 3)), width: 1.8 };
  const hasLogo = logo !== undefined;
  if (name !== undefined) body += markAt(name, 100, hasLogo ? 68 : 74, hasLogo ? 16 : 18, 104, "bold", nameFill, undefined, line);
  if (num !== undefined && num !== "") body += markAt(num, 100, hasLogo ? 122 : 140, hasLogo ? 56 : 78, 104, "black", numFill, numOutline, line);
  if (hasLogo) {
    const href = esc(logo);
    body += `<image href="${href}" x="70" y="162" width="60" height="48" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return body;
}
