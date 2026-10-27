// Embroidery thread: the named colours of a retailer's thread chart (as English names with the Japanese beside them) and the drawing of thread on
// cloth. A satin stitch is a row of parallel threads laid across a stroke, so a stroke is drawn as its base colour with fine dark gaps cut across
// it at a right angle to its length (a dashed stroke, whose dashes lie across the line), a sheen along it, and a shadow under it where the
// thread stands proud of the cloth. System text, which has no centre line, takes the same look from a fine diagonal pattern. Original drawing.

import { blend, esc, hexOf, readColour, type Rgb } from "./colour.ts";
import { n2 } from "./path.ts";
import type { Run } from "./text.ts";

export const THREAD_COLOURS = [
  "red", "gold-brown", "green", "black", "gold", "fluo-pink", "pink", "blue", "yellow-green", "white", "silver", "fluo-orange",
  "wine", "navy", "yellow", "purple", "grey", "fluo-yellow", "brown", "dark-navy", "indigo", "light-blue", "silver-grey", "fluo-green",
] as const;
export type ThreadColour = (typeof THREAD_COLOURS)[number];

/** The named presets: English name, Japanese name and the colour of the thread. */
export const THREAD_LABELS: Record<ThreadColour, { en: string; ja: string }> = {
  red: { en: "Red", ja: "赤" },
  "gold-brown": { en: "Gold-brown", ja: "金茶" },
  green: { en: "Green", ja: "緑" },
  black: { en: "Black", ja: "黒" },
  gold: { en: "Gold", ja: "ゴールド" },
  "fluo-pink": { en: "Fluo pink", ja: "蛍光ピンク" },
  pink: { en: "Pink", ja: "ピンク" },
  blue: { en: "Blue", ja: "青" },
  "yellow-green": { en: "Yellow-green", ja: "黄緑" },
  white: { en: "White", ja: "白" },
  silver: { en: "Silver", ja: "シルバー" },
  "fluo-orange": { en: "Fluo orange", ja: "蛍光オレンジ" },
  wine: { en: "Wine", ja: "えんじ" },
  navy: { en: "Navy", ja: "紺" },
  yellow: { en: "Yellow", ja: "黄" },
  purple: { en: "Purple", ja: "紫" },
  grey: { en: "Grey", ja: "グレー" },
  "fluo-yellow": { en: "Fluo yellow", ja: "蛍光イエロー" },
  brown: { en: "Brown", ja: "茶" },
  "dark-navy": { en: "Dark navy", ja: "濃紺" },
  indigo: { en: "Indigo", ja: "花紺" },
  "light-blue": { en: "Light blue", ja: "水色" },
  "silver-grey": { en: "Silver-grey", ja: "シルバーグレー" },
  "fluo-green": { en: "Fluo green", ja: "蛍光グリーン" },
};

export const THREAD_RGB: Record<ThreadColour, Rgb> = {
  red: [200, 16, 46],
  "gold-brown": [166, 116, 44],
  green: [31, 122, 61],
  black: [26, 26, 30],
  gold: [212, 165, 42],
  "fluo-pink": [255, 79, 163],
  pink: [244, 160, 184],
  blue: [31, 86, 196],
  "yellow-green": [155, 197, 61],
  white: [246, 244, 238],
  silver: [188, 192, 200],
  "fluo-orange": [255, 122, 26],
  wine: [122, 31, 51],
  navy: [20, 35, 75],
  yellow: [240, 207, 28],
  purple: [107, 58, 138],
  grey: [123, 127, 134],
  "fluo-yellow": [232, 242, 12],
  brown: [107, 66, 38],
  "dark-navy": [11, 19, 48],
  indigo: [31, 63, 143],
  "light-blue": [127, 196, 234],
  "silver-grey": [154, 160, 168],
  "fluo-green": [53, 224, 74],
};

/** A thread colour from outside: a preset name or `#rrggbb`; `fallback` when it is neither. */
export function readThread(value: unknown, fallback: ThreadColour): { name: string; rgb: Rgb } {
  if (typeof value === "string" && (THREAD_COLOURS as readonly string[]).includes(value)) return { name: value, rgb: THREAD_RGB[value as ThreadColour] };
  const custom = readColour(value);
  if (custom !== undefined) return { name: "custom", rgb: custom };
  return { name: fallback, rgb: THREAD_RGB[fallback] };
}

/** The colours a thread is drawn with: its body, the gap between stitches, the sheen and the shadow it throws. */
interface Thread {
  fill: string;
  gap: string;
  sheen: string;
  shadow: string;
}

function threadOf(rgb: Rgb): Thread {
  const dark = rgb[0] + rgb[1] + rgb[2] < 200;
  return {
    fill: hexOf(rgb),
    gap: hexOf(blend(rgb, [0, 0, 0], dark ? 0.55 : 0.42)),
    sheen: hexOf(blend(rgb, [255, 255, 255], dark ? 0.5 : 0.7)),
    shadow: "#1a2230",
  };
}

/** The fine diagonal pattern of satin on a shape with no centre line: threads side by side at an angle, a dark gap between each pair. */
export function satinDefs(id: string, rgb: Rgb): string {
  const t = threadOf(rgb);
  return `<pattern id="${id}" width="0.7" height="0.7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">` +
    `<rect width="0.7" height="0.2" fill="${t.gap}" fill-opacity="0.5"/><rect y="0.3" width="0.7" height="0.12" fill="${t.sheen}" fill-opacity="0.45"/></pattern>`;
}

/**
 * Stitched strokes along `d`: a shadow under, the thread, the fine gaps between its stitches (dashes laid across the line) and a sheen down its
 * middle. `sw` is the width of the stroke.
 */
export function satinStroke(d: string, sw: number, rgb: Rgb): string {
  const t = threadOf(rgb);
  const cap = 'fill="none" stroke-linejoin="round"';
  const unit = Math.max(0.5, Math.min(1.1, sw * 0.4));
  return `<path d="${d}" ${cap} stroke-linecap="round" stroke="${t.shadow}" stroke-opacity="0.34" stroke-width="${n2(sw + 0.9)}" transform="translate(0.35 0.5)"/>` +
    `<path d="${d}" ${cap} stroke-linecap="round" stroke="${t.fill}" stroke-width="${n2(sw)}"/>` +
    `<path d="${d}" ${cap} stroke="${t.gap}" stroke-opacity="0.55" stroke-width="${n2(sw * 0.98)}" stroke-dasharray="${n2(unit * 0.22)} ${n2(unit * 0.5)}"/>` +
    `<path d="${d}" ${cap} stroke-linecap="round" stroke="${t.sheen}" stroke-opacity="0.34" stroke-width="${n2(sw * 0.3)}" transform="translate(${n2(-sw * 0.12)} ${n2(-sw * 0.16)})"/>`;
}

/** A run of text as thread: the stroke glyphs as satin strokes, or system text with the satin pattern over it. `id` names the pattern the caller defined. */
export function satinRun(run: Run, rgb: Rgb, id: string, family: string, edge?: string): string {
  if (run.kind === "glyph") return run.d === "" ? "" : satinStroke(run.d, run.sw, rgb);
  const t = threadOf(rgb);
  let out = "";
  for (const ch of run.chars) {
    const at = (dx = 0, dy = 0): string => `transform="translate(${n2(ch.x + dx)} ${n2(ch.y + dy)}) rotate(${n2(ch.r)})" font-size="${n2(ch.size)}" text-anchor="middle" font-weight="700" font-family="${esc(family)}"`;
    out += `<text ${at(0.35, 0.5)} fill="${t.shadow}" fill-opacity="0.3" stroke="${t.shadow}" stroke-opacity="0.3" stroke-width="0.7">${esc(ch.c)}</text>`;
    out += `<text ${at()} fill="${t.fill}" stroke="${edge ?? t.gap}" stroke-opacity="0.55" stroke-width="0.25" stroke-linejoin="round">${esc(ch.c)}</text>`;
    out += `<text ${at()} fill="url(#${id})">${esc(ch.c)}</text>`;
  }
  return out;
}

/** A shape given as an outline path (an outline a person made from a font) filled with thread. */
export function satinShape(d: string, rgb: Rgb, id: string, transform: string): string {
  const t = threadOf(rgb);
  return `<g transform="${transform}"><path d="${d}" fill="${t.shadow}" fill-opacity="0.3" transform="translate(0.35 0.5)"/><path d="${d}" fill="${t.fill}" stroke="${t.gap}" stroke-opacity="0.5" stroke-width="0.25" stroke-linejoin="round"/><path d="${d}" fill="url(#${id})"/></g>`;
}
