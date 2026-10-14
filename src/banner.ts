// `renderBanner`: a retired-number banner as it hangs from the rafters: a rectangle, a pennant or a shield in the team's colours, the number, the name, the years or the
// honour, and, if asked, a small sweater of the team above the number. A championship banner, a pennant or a ring is not this; those are in dougu-sports.
import { BLACK, WHITE, clean, contrast, hashOf, hexOf, inkOn, lum, readColour, shade, type Rgb } from "./colour.ts";
import { jerseyView, uidOf } from "./jersey.ts";
import { TITLE_WORDS } from "./names.ts";
import { LANGUAGE_IDS, LOOK_IDS, resolve, type JerseyOptions, type LanguageId, type LookId } from "./options.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

export const BANNER_SHAPES = ["rectangle", "pennant", "shield"] as const;
export type BannerShape = (typeof BANNER_SHAPES)[number];

export interface BannerOptions {
  shape?: BannerShape;
  /** `[field, trim, trim2?, ink?]`. */
  colors?: readonly string[];
  number?: string | number;
  name?: string;
  /** The years played, or the honour: `"1948-1963"`, `"Retired 1972"`. */
  years?: string;
  /** A small sweater above the number: `true` for one in the banner's colours, or its own options. */
  sweater?: boolean | JerseyOptions;
  look?: LookId;
  size?: number;
  language?: LanguageId;
  title?: string;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

export function renderBanner(options?: BannerOptions): string {
  const o: BannerOptions = options !== null && typeof options === "object" ? options : {};
  const shape = pick(BANNER_SHAPES, o.shape, "rectangle");
  const list = Array.isArray(o.colors) ? o.colors : [];
  const field = readColour(list[0]) ?? ([31, 58, 138] as Rgb);
  const trim = readColour(list[1]) ?? ([244, 240, 228] as Rgb);
  const trim2 = readColour(list[2]) ?? trim;
  const given = readColour(list[3]);
  const num = clean(typeof o.number === "number" ? String(Math.trunc(Math.abs(o.number))) : o.number, 4)?.replace(/\D/g, "").slice(0, 2);
  const name = clean(o.name, 20)?.toUpperCase();
  const years = clean(o.years, 24)?.toUpperCase();
  const look = pick(LOOK_IDS, o.look, "cloth");
  const language = pick(LANGUAGE_IDS, o.language, "en");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const sweaterOpts: JerseyOptions | undefined = o.sweater === true ? { colors: [hexOf(trim), hexOf(field)], cut: "hockey" } : typeof o.sweater === "object" && o.sweater !== null ? o.sweater : undefined;
  const uid = `sb${hashOf(JSON.stringify([shape, field, trim, trim2, given, num, name, years, look, sweaterOpts]))}`;
  const line = look === "line";
  const cloth = look === "cloth";
  const hx = hexOf;
  const ink = given ?? inkOn([field], [trim, WHITE, BLACK]);
  const edge = line ? "currentColor" : hx(lum(field) > 0.1 ? shade(field, -0.42) : shade(field, 0.3));
  const W = 200;
  const H = 280;
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
  body += line ? `<path d="M22 24H178V32H22Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>` : `<path d="M22 24H178V32H22Z" fill="${hx(shade(trim, lum(trim) > 0.5 ? -0.25 : 0.2))}" stroke="${hx(shade(trim, -0.5))}" stroke-width="1.2" stroke-linejoin="round"/>`;
  body += line ? "" : `<path d="${OUT}" fill="${hx(field)}"/>`;
  if (!line) body += `<g clip-path="url(#${uid}c)"><path d="${OUT}" fill="none" stroke="${hx(trim)}" stroke-width="10"/><path d="${IN}" fill="none" stroke="${hx(trim2)}" stroke-width="1.6"/></g>`;
  else body += `<path d="${IN}" fill="none" stroke="currentColor" stroke-width="3.4"/>`;
  if (cloth) {
    defs += `<linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
    body += `<path d="${OUT}" fill="url(#${uid}g)"/>`;
  }
  body += `<path d="${OUT}" fill="none" stroke="${edge}" stroke-width="${line ? 6 : 1.6}" stroke-linejoin="round"/>`;
  // What is written on it.
  const zone = shape === "pennant" ? { nx: 100, ny: 92, nh: 56, nw: 60, namey: 150, nameh: 11, namew: 54, yy: 170, yh: 9, yw: 46 } : { nx: 100, ny: sweaterOpts === undefined ? 112 : 150, nh: sweaterOpts === undefined ? 84 : 66, nw: 82, namey: sweaterOpts === undefined ? 180 : 192, nameh: 14, namew: 104, yy: sweaterOpts === undefined ? 202 : 212, yh: 10, yw: 90 };
  const mark = (text: string, cx: number, cy: number, h: number, w: number, weight: "bold" | "black"): string => {
    const run = layout(text, cx, cy, { height: h, maxWidth: w, weight, tracking: 0.4 });
    if (line) return drawRun(run, "currentColor", undefined, undefined);
    const outline = contrast(ink, field) < 4.5 ? inkOn([ink], [BLACK, WHITE], 3) : undefined;
    return drawRun(run, hx(ink), outline === undefined ? undefined : { colour: hx(outline), width: 1.4 }, undefined);
  };
  if (sweaterOpts !== undefined && shape !== "pennant") {
    const r = resolve({ ...sweaterOpts, view: "front", look: line ? "line" : "flat" });
    const view = jerseyView(r, "front", uidOf(r, "banner"));
    defs += view.defs;
    body += `<g transform="translate(66 54) scale(.34)">${view.body}</g>`;
  }
  if (num !== undefined && num !== "") body += mark(num, zone.nx, zone.ny, zone.nh, zone.nw, "black");
  if (name !== undefined) body += mark(name, 100, zone.namey, zone.nameh, zone.namew, "bold");
  if (years !== undefined) body += mark(years, 100, zone.yy, zone.yh, zone.yw, "bold");
  const w = TITLE_WORDS[language];
  const title = clean(o.title, 120) ?? (language === "ja" ? `${w.banner}${num === undefined ? "" : `（${num}）`}${name === undefined ? "" : ` ${name}`}` : `${w.banner}${num === undefined ? "" : ` ${num}`}${name === undefined ? "" : `, ${name}`}`);
  void n2;
  return wrapSvg({ id: uid, w: W, h: H, width: size, title, defs, body });
}
