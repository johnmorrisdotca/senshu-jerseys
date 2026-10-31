// The nation's letters on the shoulder: the country code a national team's judogi carries down the top of the sleeve from the collar, as thread or as a flat
// printed strip. Its place is the shoulder stripe of the IJF Judogi Rules (09 03 2022, C1.5, page 8: on the shoulders a stripe of 25 cm by 5 cm, calculated from
// the lower part of the collar down the sleeve; picture 6 no. 2 marks it as reserved for the National Federation, and C1.4, page 7, says the national emblem
// may also appear in that publicity space). The rules name no letter size inside the stripe, so the stripe's own size is the limit. A printed strip is ink
// on the cloth with no thickness: a plain fill, an optional ground of its own, nothing standing off the weave. Plain letters only: no flag, no federation's
// mark. Original drawing.

import { clean, esc, hexOf, lum, type Rgb } from "./colour.ts";
import type { EmbroideryFontFace, EmbroideryFontName } from "./judogiMarks.ts";
import { readThread, type ThreadColour } from "./judogiThread.ts";
import { n2 } from "./path.ts";
import { langAttr, layout, type Run } from "./text.ts";

export const NATION_PLACES = ["shoulder-left", "shoulder-right", "shoulders"] as const;
export type NationPlace = (typeof NATION_PLACES)[number];

export const NATION_STYLES = ["embroidery", "print"] as const;
export type NationStyle = (typeof NATION_STYLES)[number];

export interface JudogiNation {
  /** The country's letters as the team uses them (`CAN`, `USA`, an IOC or ISO code): 2 to 4 letters, set in capitals. Anything else is left out. */
  code: string;
  /** The country's name, for the notes and the drawing's title ("Canada"). Not drawn. */
  name?: string;
  /** The shoulder it goes on, the wearer's: `shoulder-left` (the default), `shoulder-right` or `shoulders` for both. */
  place?: NationPlace;
  /** `embroidery` (the default): satin thread, raised. `print`: ink on the cloth, flat, a strip of its own. */
  style?: NationStyle;
  /** The thread of an embroidered code: a preset or `#rrggbb`. Black on a light cloth and white on a dark one when not given. */
  thread?: ThreadColour | string;
  /** The ink of a printed code: a thread preset or `#rrggbb`. Black on a light cloth (or on a light band) and white on a dark one when not given. */
  ink?: ThreadColour | string;
  /** A printed strip's own ground, a preset or `#rrggbb`; without it the letters are printed straight on the cloth. */
  band?: ThreadColour | string;
  /** `block` is the package's own strokes (the default); a system font or `{ family, css }` as for embroidery. */
  font?: EmbroideryFontName | EmbroideryFontFace;
  weight?: "regular" | "bold" | "black";
  /** How the letters read down the sleeve: `up` (from the cuff toward the collar, the default) or `down`. */
  reading?: "up" | "down";
  /** Letter height and the length the whole mark may run to (the band's length for a printed strip), in centimetres: 4.4 and 25 by default, held to the stripe's 5 and 25. */
  heightCm?: number;
  lengthCm?: number;
}

export interface ReadNation {
  code: string;
  name: string;
  places: ("shoulder-left" | "shoulder-right")[];
  style: NationStyle;
  thread: { name: string; rgb: Rgb } | undefined;
  ink: { name: string; rgb: Rgb } | undefined;
  band: { name: string; rgb: Rgb } | undefined;
  font: EmbroideryFontName | EmbroideryFontFace;
  weight: "regular" | "bold" | "black";
  reading: "up" | "down";
  heightCm: number;
  lengthCm: number;
}

/** The stripe the rules give the shoulder, in centimetres, and the size of letters drawn when none is asked for. */
export const NATION_STRIPE = { len: 25, h: 5 } as const;
export const NATION_DEFAULT = { h: 4.4, len: 25 } as const;
/** The room a printed strip's letters keep to the band's ends and sides, in centimetres. */
const BAND_PAD = { len: 1.6, h: 0.5 } as const;
/** The gap between letters, in units of the stroke: wider than text on a name, as a country's letters are set across a shoulder. */
export const NATION_TRACKING = 1.5;

const num = (v: unknown, min: number, max: number, fallback: number): number => (typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback);

/** The nation from outside, made safe; `undefined` when there is no code of 2 to 4 letters. `readFont` reads the font as embroidery does. */
export function readNation(value: unknown, readFont: (v: unknown) => EmbroideryFontName | EmbroideryFontFace): ReadNation | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const n = value as JudogiNation;
  const raw = clean(n.code, 8);
  if (raw === undefined || !/^\p{L}{2,4}$/u.test(raw)) return undefined;
  const place = n.place === "shoulder-right" || n.place === "shoulders" ? n.place : "shoulder-left";
  const style: NationStyle = n.style === "print" ? "print" : "embroidery";
  const colour = (v: unknown): { name: string; rgb: Rgb } | undefined => (v === undefined ? undefined : readThread(v, "black"));
  return {
    code: raw.toUpperCase(),
    name: clean(n.name, 40) ?? "",
    places: place === "shoulders" ? ["shoulder-left", "shoulder-right"] : [place],
    style,
    thread: colour(n.thread),
    ink: colour(n.ink),
    band: colour(n.band),
    font: readFont(n.font),
    weight: n.weight === "regular" || n.weight === "bold" ? n.weight : "black",
    reading: n.reading === "down" ? "down" : "up",
    heightCm: num(n.heightCm, 0.5, 30, NATION_DEFAULT.h),
    lengthCm: num(n.lengthCm, 2, 40, NATION_DEFAULT.len),
  };
}

/** Black ink on a light ground, white on a dark one. */
export const inkFor = (ground: Rgb): Rgb => (lum(ground) > 0.4 ? [24, 24, 28] : [248, 247, 244]);

export interface PrintPlan {
  /** The box of the whole mark (a printed band, or the letters alone), at full size. */
  w: number;
  h: number;
  run: Run;
}

/** The letters at a share `k` of their size, `unit` drawing units to the centimetre: no taller than the stripe is wide and no longer than it is long (inside the band's ends when it has one). */
export function nationRun(n: ReadNation, asText: boolean, unit: number, k: number): Run {
  const band = n.style === "print" && n.band !== undefined;
  const bandH = Math.min(NATION_STRIPE.h, n.heightCm + 2 * BAND_PAD.h);
  const height = (band ? Math.min(n.heightCm, bandH - 2 * BAND_PAD.h) : Math.min(n.heightCm, NATION_STRIPE.h)) * unit * k;
  const room = (Math.min(n.lengthCm, NATION_STRIPE.len) - (band ? 2 * BAND_PAD.len : 0)) * unit * k;
  return layout(n.code, 0, 0, { height, maxWidth: room, weight: n.weight, tracking: NATION_TRACKING, asText });
}

/** A printed strip at a share `k` of its size, centred on the origin: the band (when it has one) as long as asked and as wide as the stripe allows, the letters inside it. */
export function printPlan(n: ReadNation, asText: boolean, unit: number, k: number): PrintPlan {
  const run = nationRun(n, asText, unit, k);
  if (n.band === undefined) return { w: run.width, h: run.height, run };
  return { w: Math.min(n.lengthCm, NATION_STRIPE.len) * unit * k, h: Math.min(NATION_STRIPE.h, n.heightCm + 2 * BAND_PAD.h) * unit * k, run };
}

/** The strip's drawing: a flat ground and flat ink, one layer each, no edge, no shadow. */
export function printStrip(n: ReadNation, plan: PrintPlan, ground: Rgb, family: string, css: string): string {
  const ink = n.ink?.rgb ?? inkFor(n.band?.rgb ?? ground);
  const fill = hexOf(ink);
  const { run } = plan;
  let letters = "";
  if (run.kind === "glyph") {
    if (run.d !== "") letters = `<path d="${run.d}" fill="none" stroke="${fill}" stroke-width="${n2(run.sw)}" stroke-linejoin="miter" stroke-miterlimit="2.5" stroke-linecap="square"/>`;
  } else {
    const lang = langAttr(n.code);
    for (const ch of run.chars) letters += `<text transform="translate(${n2(ch.x)} ${n2(ch.y)}) rotate(${n2(ch.r)})" font-size="${n2(ch.size)}" text-anchor="middle" font-weight="${n.weight === "regular" ? 400 : 800}" font-family="${esc(family)}"${lang} fill="${fill}">${esc(ch.c)}</text>`;
  }
  const band = n.band === undefined ? "" : `<rect x="${n2(-plan.w / 2)}" y="${n2(-plan.h / 2)}" width="${n2(plan.w)}" height="${n2(plan.h)}" fill="${hexOf(n.band.rgb)}"/>`;
  const title = n.name === "" ? "" : `<title>${esc(n.name)}</title>`;
  return `<g data-nation="${esc(n.code)}" data-print="flat">${title}${css === "" ? "" : `<style>${css}</style>`}${band}<g opacity="0.96">${letters}</g></g>`;
}
