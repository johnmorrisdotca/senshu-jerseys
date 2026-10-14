// `renderCap`: a team cap, front or side: a solid crown or a two-tone one with a contrasting front panel, a brim in its own colour, and one to three letters.
import { BLACK, WHITE, clean, hashOf, hexOf, inkOn, lum, readColour, shade, type Rgb } from "./colour.ts";
import { TITLE_WORDS } from "./names.ts";
import { LANGUAGE_IDS, LOOK_IDS, type LanguageId, type LookId } from "./options.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

export interface CapOptions {
  /** `[crown, brim?, front panel?, button?]`; the brim is the crown's by default. */
  colors?: readonly string[];
  /** `solid` is one colour; `two-tone` gives the front panel its own. */
  tone?: "solid" | "two-tone";
  /** One to three letters on the front. */
  initials?: string;
  view?: "front" | "side";
  look?: LookId;
  size?: number;
  language?: LanguageId;
  title?: string;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** The parts of a cap drawing: its defs, its body in a box 200 by 170, and its title. */
export function capParts(options?: CapOptions): { id: string; defs: string; body: string; title: string; size: number; w: number; h: number } {
  const o: CapOptions = options !== null && typeof options === "object" ? options : {};
  const list = Array.isArray(o.colors) ? o.colors : [];
  const crown = readColour(list[0]) ?? ([31, 58, 138] as Rgb);
  const brim = readColour(list[1]) ?? crown;
  const two = o.tone === "two-tone";
  const front = two ? (readColour(list[2]) ?? ([244, 240, 228] as Rgb)) : crown;
  const button = readColour(list[3]) ?? (two ? front : crown);
  const initials = clean(o.initials, 6)?.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase().slice(0, 3);
  const view = o.view === "side" ? "side" : "front";
  const look = pick(LOOK_IDS, o.look, "cloth");
  const language = pick(LANGUAGE_IDS, o.language, "en");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const uid = `sc${hashOf(JSON.stringify([crown, brim, front, button, initials, view, look]))}`;
  const line = look === "line";
  const cloth = look === "cloth";
  const hx = hexOf;
  const edgeOf = (c: Rgb): string => (line ? "currentColor" : hx(lum(c) > 0.1 ? shade(c, -0.42) : shade(c, 0.3)));
  const fill = (c: Rgb): string => (line ? 'fill="none"' : `fill="${hx(c)}"`);
  const sw = line ? 7 : 1.6;
  let body = "";
  let defs = "";
  const W = 200;
  const H = 170;
  const letters = (cx: number, cy: number, h: number, maxW: number, ground: Rgb): string => {
    if (initials === undefined || initials === "") return "";
    const run = layout(initials, cx, cy, { height: h, maxWidth: maxW, weight: "black", tracking: 0.35 });
    if (line) return drawRun(run, "currentColor", undefined, undefined);
    const ink = inkOn([ground], [front === ground ? undefined : front, crown, WHITE, BLACK]);
    const outline = inkOn([ink], [BLACK, WHITE], 3);
    return drawRun(run, hx(ink), lum(ground) > 0.25 && lum(ink) > 0.5 ? { colour: hx(outline), width: 1.2 } : undefined, undefined);
  };
  if (view === "front") {
    const dome = "M24 112C24 52 58 20 100 20C142 20 176 52 176 112Z";
    const panel = "M100 20C86 38 70 74 66 112H134C130 74 114 38 100 20Z";
    defs += `<clipPath id="${uid}d"><path d="${dome}"/></clipPath>`;
    body += `<path d="${dome}" ${fill(crown)}/>`;
    if (two && !line) body += `<g clip-path="url(#${uid}d)"><path d="${panel}" fill="${hx(front)}"/></g>`;
    if (cloth) {
      defs += `<radialGradient id="${uid}g" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>`;
      body += `<path d="${dome}" fill="url(#${uid}g)"/>`;
    }
    const seams = `M100 20C86 38 70 74 66 112M100 20C114 38 130 74 134 112M100 20C60 40 40 78 36 112M100 20C140 40 160 78 164 112`;
    body += `<path d="${seams}" fill="none" stroke="${line ? "currentColor" : hx(shade(crown, lum(crown) > 0.1 ? -0.35 : 0.3))}" stroke-width="${line ? 0 : 0.9}" stroke-opacity=".7"/>`;
    body += `<path d="${dome}" fill="none" stroke="${edgeOf(crown)}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    body += `<circle cx="100" cy="20" r="${line ? 0 : 5}" fill="${hx(button)}" stroke="${edgeOf(button)}" stroke-width="1.2"/>`;
    // The brim, seen from the front: a flat curve below the crown.
    const brimPath = "M18 112C40 148 160 148 182 112C160 124 40 124 18 112Z";
    body += `<path d="${brimPath}" ${fill(brim)} stroke="${edgeOf(brim)}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    if (cloth) body += `<path d="M30 124C60 140 140 140 170 124" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="5" stroke-linecap="round"/>`;
    body += letters(100, 74, 40, 56, two ? front : crown);
  } else {
    // Side, facing right: the dome, a seam, the button and the brim jutting out.
    const dome = "M26 110C26 54 56 24 98 24C132 24 150 46 154 76L160 110Z";
    body += `<path d="${dome}" ${fill(crown)}/>`;
    defs += `<clipPath id="${uid}d"><path d="${dome}"/></clipPath>`;
    if (two && !line) body += `<g clip-path="url(#${uid}d)"><path d="M98 24C128 28 152 56 156 112H112C112 70 108 44 98 24Z" fill="${hx(front)}"/></g>`;
    if (cloth) {
      defs += `<radialGradient id="${uid}g" cx=".35" cy=".25" r=".95"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>`;
      body += `<path d="${dome}" fill="url(#${uid}g)"/>`;
    }
    body += `<path d="M98 24C108 44 112 70 112 110M98 24C70 36 54 70 52 110" fill="none" stroke="${line ? "currentColor" : hx(shade(crown, lum(crown) > 0.1 ? -0.35 : 0.3))}" stroke-width="${line ? 0 : 0.9}" stroke-opacity=".7"/>`;
    body += `<path d="${dome}" fill="none" stroke="${edgeOf(crown)}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    body += `<circle cx="98" cy="24" r="${line ? 0 : 4.5}" fill="${hx(button)}" stroke="${edgeOf(button)}" stroke-width="1.2"/>`;
    body += `<path d="M22 110L160 110C176 106 190 110 196 120C176 126 150 124 130 120L22 120Z" ${fill(brim)} stroke="${edgeOf(brim)}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    if (cloth) body += `<path d="M30 118H184" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="3"/>`;
    body += letters(134, 74, 28, 40, two ? front : crown);
  }
  const w = TITLE_WORDS[language];
  const title = clean(o.title, 120) ?? (language === "ja" ? `${w.cap}${initials === undefined ? "" : `（${initials}）`}` : `${w.cap}${initials === undefined ? "" : ` ${initials}`}`);
  return { id: uid, defs, body, title, size, w: W, h: H };
}

export function renderCap(options?: CapOptions): string {
  const p = capParts(options);
  return wrapSvg({ id: p.id, w: p.w, h: p.h, width: p.size, title: p.title, defs: p.defs, body: p.body });
}
