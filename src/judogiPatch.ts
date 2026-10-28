// Sewn cloth marks for the judogi: a patch is a piece of cloth with a turned edge, stitched down, that lies on the garment and turns
// with it. The back patch is the IJF-style back number (a dark name band across the top, the nation's three letters large in the middle, an
// optional band below for a club, dojo or sponsor) or the Japanese domestic zekken (a white cloth, the surname large in its upper two thirds,
// the affiliation small below). Sizes and places are facts of the IJF Judogi Rules (09 03 2022: the back number is fixed horizontally and
// centrally 3 cm below the collar, stitched round its whole edge and crossed into an X or with three straight equidistant lines) and of the
// All Japan Judo Federation's zekken rules as a retailer's chart states them (white cloth 30 to 35 cm across and 25 to 30 cm tall, the surname in the
// upper two thirds and the affiliation in the lower third, in gothic or regular brush script, black for men and vermilion for women, sewn on 5 to
// 10 cm below the back collar and stitched across its diagonals). The rules' pictures and wording are not copied; the lettering is the
// package's own strokes. No federation mark is drawn, and the letters of a federation (IJF) are never printed.

import { blend, clean, graphemes, hashOf, hexOf, lum, readColour, shade, type Rgb } from "./colour.ts";
import { layout, drawRun } from "./text.ts";
import { BELT_TOP } from "./judogiJacket.ts";
import { n2 } from "./path.ts";

/** The drawing's scale: units to the centimetre, for a 170 cm size (the jacket is 78 cm long and 200 units across its box). */
export const CM = 2.63;

export const PATCH_STYLES = ["none", "ijf", "zekken"] as const;
export type PatchStyle = (typeof PATCH_STYLES)[number];

/** Band colours of the IJF-style back number: blue is the standard, gold an Olympic champion's and red a world champion's (IJF Judogi Rules, C1.8). */
export const PATCH_COLOURS = ["blue", "gold", "red", "black", "white"] as const;
export type PatchColour = (typeof PATCH_COLOURS)[number];

/** Zekken ink: black (men) or vermilion (women), as the All Japan Judo Federation's rule has it. */
export const ZEKKEN_INKS = ["black", "vermilion"] as const;
export type ZekkenInk = (typeof ZEKKEN_INKS)[number];

export const PATCH_COLOUR_LABELS: Record<PatchColour, { en: string; ja: string }> = {
  blue: { en: "Blue", ja: "青" },
  gold: { en: "Gold", ja: "金" },
  red: { en: "Red", ja: "赤" },
  black: { en: "Black", ja: "黒" },
  white: { en: "White", ja: "白" },
};

export const ZEKKEN_INK_LABELS: Record<ZekkenInk, { en: string; ja: string }> = {
  black: { en: "Black", ja: "黒" },
  vermilion: { en: "Vermilion", ja: "朱色" },
};

/** The back patch as a person sets it: every word and colour is theirs. */
export interface JudogiBackPatch {
  style?: PatchStyle;
  /** IJF-style: the name band's text, usually "N. SURNAME". Zekken: the surname. */
  name?: string;
  /** IJF-style: the large letters in the middle, the nation's three-letter code by default of the person's choosing. Ignored by the zekken. */
  code?: string;
  /** IJF-style: the bottom band's text (a club, a dojo or a sponsor), empty for none. Zekken: the affiliation. */
  line?: string;
  /** IJF-style: the name band's colour, a preset or `#rrggbb`. */
  colour?: PatchColour | string;
  /** Zekken: black or vermilion letters. */
  ink?: ZekkenInk;
  /** How the stitching crosses the patch: an X (the default) or three straight lines (IJF-style only). */
  sewing?: "x" | "lines";
  /** The patch's size in centimetres, and how far its top is below the collar; each has the rules' value when not given. */
  widthCm?: number;
  heightCm?: number;
  topCm?: number;
}

export interface PatchSpec {
  style: Exclude<PatchStyle, "none">;
  name: string;
  code: string;
  line: string;
  band: Rgb;
  bandName: string;
  ink: ZekkenInk;
  sewing: "x" | "lines";
  widthCm: number;
  heightCm: number;
  topCm: number;
}

const BAND: Record<PatchColour, Rgb> = {
  blue: [27, 58, 140],
  gold: [196, 152, 30],
  red: [182, 24, 36],
  black: [28, 28, 32],
  white: [250, 249, 246],
};

/** The rules' own numbers, and the defaults this package draws with (the IJF's text fixes the place and the stitching, not the size). */
/** The lowest a patch's bottom edge may be drawn: 1.3 cm above the top edge of the belt tied at the waist, whatever the belt's width (it hangs down from that edge). */
export const PATCH_LIMIT = BELT_TOP - 1.3 * CM;

export const PATCH_FACTS = {
  ijf: { top: 3, widthCm: 25, heightCm: 29 },
  zekken: { top: 5, topMin: 5, topMax: 10, widthMin: 30, widthMax: 35, heightMin: 25, heightMax: 30, widthCm: 30, heightCm: 25 },
} as const;

const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;

/** A back patch from outside, made safe; `undefined` when there is none. */
export function readPatch(raw: unknown): PatchSpec | undefined {
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as JudogiBackPatch;
  if (o.style !== "ijf" && o.style !== "zekken") return undefined;
  const zek = o.style === "zekken";
  const f = PATCH_FACTS[o.style];
  const named = (PATCH_COLOURS as readonly string[]).includes(o.colour as string) ? (o.colour as PatchColour) : undefined;
  const custom = named === undefined ? readColour(o.colour) : undefined;
  const text = (v: unknown, max: number, fallback: string): string => (typeof v === "string" ? clean(v, max) ?? "" : fallback);
  return {
    style: o.style,
    name: text(o.name, 24, zek ? "山田" : "A. ATHLETE"),
    code: zek ? "" : text(o.code, 3, "SJF").toUpperCase(),
    line: text(o.line, 28, zek ? "" : ""),
    band: custom ?? BAND[named ?? "blue"],
    bandName: named ?? (custom === undefined ? "blue" : "custom"),
    ink: o.ink === "vermilion" ? "vermilion" : "black",
    sewing: o.sewing === "lines" && !zek ? "lines" : "x",
    widthCm: num(o.widthCm, 10, 40, f.widthCm),
    heightCm: num(o.heightCm, 8, 40, f.heightCm),
    topCm: num(o.topCm, 0, 20, f.top),
  };
}

/** What the rules say of a patch, as checks: each is met or not, and the fact is cited. */
export function patchNotes(p: PatchSpec): { id: string; met: boolean; fact: string }[] {
  if (p.style === "ijf") {
    return [
      { id: "backnumber-place", met: Math.abs(p.topCm - PATCH_FACTS.ijf.top) < 0.05, fact: "The back number's top is fixed horizontally and centrally 3 cm from the bottom of the collar (IJF Judogi Rules, 09 03 2022)." },
      { id: "backnumber-sewing", met: true, fact: "The back number is stitched round its whole edge, its lower and upper edges crossed into an X or with three straight equidistant lines (IJF Judogi Rules, 09 03 2022)." },
    ];
  }
  const z = PATCH_FACTS.zekken;
  return [
    { id: "zekken-size", met: p.widthCm >= z.widthMin && p.widthCm <= z.widthMax && p.heightCm >= z.heightMin && p.heightCm <= z.heightMax, fact: "The zekken is white cloth 30 to 35 cm across and 25 to 30 cm tall (All Japan Judo Federation zekken rules, as a retailer's chart states them)." },
    { id: "zekken-place", met: p.topCm >= z.topMin && p.topCm <= z.topMax, fact: "The zekken is sewn on 5 to 10 cm below the back collar and stitched across its diagonals (All Japan Judo Federation zekken rules, as a retailer's chart states them)." },
    { id: "zekken-letters", met: true, fact: "The surname fills the upper two thirds and the affiliation the lower third, in black for men and vermilion for women (All Japan Judo Federation zekken rules, as a retailer's chart states them)." },
  ];
}

/** The id of everything a patch's drawing needs, so two patches on one page never share one. */
const idOf = (uid: string, p: PatchSpec): string => `${uid}pt${hashOf(JSON.stringify(p))}`;

/**
 * A piece of cloth sewn down: its own cloth and weave, a turned edge, a soft shadow on the garment beside it, and the stitching along its
 * edge. `x, y, w, h` are its box in the drawing; `lines` are further straight stitches (an X's two strokes, or three verticals) drawn over it.
 */
export function cloth(id: string, x: number, y: number, w: number, h: number, base: Rgb, thread: Rgb): { defs: string; under: string; over: string } {
  const light = lum(base) > 0.4;
  const hi = hexOf(light ? blend(base, [255, 255, 255], 0.75) : shade(base, 0.22));
  const lo = hexOf(light ? blend(base, [70, 78, 96], 0.34) : blend(base, [0, 0, 0], 0.45));
  // The weave: a fine plain weave, a pair of dark threads and a pair of light ones, drawn small enough to read as cloth, not as a grid.
  const defs = `<pattern id="${id}W" width="1.1" height="1.1" patternUnits="userSpaceOnUse"><rect width="0.55" height="0.55" fill="${lo}" fill-opacity="${light ? 0.07 : 0.14}"/><rect x="0.55" y="0.55" width="0.55" height="0.55" fill="${lo}" fill-opacity="${light ? 0.07 : 0.14}"/><rect x="0.55" width="0.55" height="0.55" fill="${hi}" fill-opacity="${light ? 0.26 : 0.07}"/></pattern>` +
    `<linearGradient id="${id}G" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a2230" stop-opacity="0.12"/></linearGradient>` +
    `<clipPath id="${id}C"><rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" rx="1.1"/></clipPath>`;
  const rect = (dx: number, dy: number, grow = 0): string => `x="${n2(x + dx - grow)}" y="${n2(y + dy - grow)}" width="${n2(w + grow * 2)}" height="${n2(h + grow * 2)}" rx="${n2(1.1 + grow)}"`;
  const tc = hexOf(thread);
  const stitched = (d: string, wd = 0.6): string =>
    `<path d="${d}" fill="none" stroke="${hexOf(blend(thread, [0, 0, 0], 0.5))}" stroke-width="${n2(wd + 0.6)}" stroke-dasharray="1.7 1.1" stroke-opacity="0.4" transform="translate(0.3 0.4)" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${tc}" stroke-width="${n2(wd)}" stroke-dasharray="1.7 1.1" stroke-linecap="round"/>` +
    // Each stitch is a short length of thread with a lit upper edge, and the hole it goes into is a dot of shadow between two stitches.
    `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="${n2(wd * 0.28)}" stroke-dasharray="1.7 1.1" stroke-linecap="round" transform="translate(-0.1 -0.14)"/>` +
    `<path d="${d}" fill="none" stroke="${hexOf(blend(thread, [0, 0, 0], 0.6))}" stroke-opacity="0.55" stroke-width="${n2(wd * 0.5)}" stroke-dasharray="0.01 2.79" stroke-dashoffset="-1.7" stroke-linecap="round"/>`;
  const m = 3.1;
  let under = "";
  // A patch is 1 to 2 mm of cloth (0.4 of a unit): a hair of contact shadow under it, then its cut edge as a thin darker wall on the side away from the light
  // (it shows as the face turns and the cloth is seen slantwise), and a lift of a fraction of a unit, not a soft cushion.
  for (const [k, o] of [[0.9, 0.06], [0.5, 0.1]] as const) under += `<rect ${rect(0.35, 0.5, k)} fill="#1a2230" fill-opacity="${o}"/>`;
  under += `<rect ${rect(0.42, 0.5)} fill="${hexOf(blend(base, [40, 46, 60], light ? 0.42 : 0.5))}"/>`;
  under += `<rect ${rect(0, 0)} fill="${hexOf(base)}"/>`;
  const over = `<g clip-path="url(#${id}C)"><rect ${rect(0, 0)} fill="url(#${id}W)"/><rect ${rect(0, 0)} fill="url(#${id}G)"/>` +
    // The turned edge: a band of the hem folded under (a little darker, with its overlocking), then a lit line along the top and the left.
    `<rect ${rect(0.9, 0.9, -0.9)} fill="none" stroke="${lo}" stroke-width="1.8" stroke-opacity="0.32"/>` +
    `<rect ${rect(0.4, 0.4, -0.4)} fill="none" stroke="${lo}" stroke-width="0.8" stroke-opacity="0.7" stroke-dasharray="0.5 0.35"/></g>` +
    `<rect ${rect(0, 0)} fill="none" stroke="${lo}" stroke-width="0.9" stroke-opacity="0.8"/>` +
    `<path d="M${n2(x + 1.3)} ${n2(y + h - 1.4)}V${n2(y + 1.3)}H${n2(x + w - 1.4)}" fill="none" stroke="${hi}" stroke-width="0.6" stroke-opacity="0.9" transform="translate(0.2 0.2)"/>` +
    stitched(`M${n2(x + m)} ${n2(y + m)}H${n2(x + w - m)}V${n2(y + h - m)}H${n2(x + m)}Z`);
  return { defs, under, over };
}

/** A run of letters in a fill, centred on `(cx, cy)`, as the package's own strokes (or system text for characters it has no stroke for). */
export function letters(text: string, cx: number, cy: number, height: number, maxWidth: number, fill: string, weight: "regular" | "bold" | "black" = "bold"): string {
  if (text === "") return "";
  const o = { height, maxWidth, weight, tracking: 0.35 };
  // Shrunk to fit down to half the height it was meant to have; below that the end is cut and an ellipsis marks it, so a long name stays legible.
  const whole = layout(text, cx, cy, { ...o, maxWidth: undefined }).height;
  let run = layout(text, cx, cy, o);
  const parts = graphemes(text);
  for (let n = parts.length - 1; n >= 1 && run.height < whole * 0.5; n--) run = layout(`${parts.slice(0, n).join("").trimEnd()}…`, cx, cy, o);
  return drawRun(run, fill, undefined, undefined);
}

/** The back patch drawn on the jacket's back face (the 200-wide box), its top the right number of centimetres below the collar's foot. */
export function backPatch(uid: string, p: PatchSpec, collarFootY: number): { defs: string; body: string } {
  const id = idOf(uid, p);
  const w = p.widthCm * CM;
  const y = collarFootY + p.topCm * CM;
  // A patch never reaches the belt: it stops PATCH_CLEAR units above where a 5 cm belt's top edge is, whatever was asked for (`judogiCheck` still reports the size).
  const h = Math.min(p.heightCm * CM, Math.max(8, PATCH_LIMIT - y));
  const x = 100 - w / 2;
  if (p.style === "ijf") {
    const white: Rgb = [250, 249, 246];
    const base = cloth(id, x, y, w, h, white, [150, 156, 170]);
    const band = hexOf(p.band);
    const dark = p.bandName === "white" ? "#1c2230" : hexOf(blend(p.band, [8, 10, 20], 0.4));
    const onBand = lum(p.band) > 0.5 ? "#141a28" : "#fff";
    const nameH = h * 0.245;
    const codeH = h * 0.38;
    // The name band: a dark band across the top with the athlete's name in white, a hairline of lighter cloth under it where it is sewn on.
    const bandBox = `<clipPath id="${id}N"><rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(nameH)}" rx="1.1"/></clipPath>`;
    let s = base.under +
      `<g clip-path="url(#${id}N)"><rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(nameH)}" fill="${band}"/></g>` +
      `<path d="M${n2(x + 0.6)} ${n2(y + nameH)}H${n2(x + w - 0.6)}" stroke="${dark}" stroke-width="0.7" stroke-opacity="0.8"/>` +
      letters(p.name, 100, y + nameH * 0.5, nameH * 0.56, w - 9, onBand, "bold") +
      letters(p.code, 100, y + nameH + (h - nameH) * 0.4, codeH * 0.86, w - 10, dark, "black");
    // The bottom band: the club, dojo or sponsor, in a rule of its own.
    if (p.line !== "") {
      s += `<path d="M${n2(x + 4)} ${n2(y + h * 0.78)}H${n2(x + w - 4)}" stroke="${dark}" stroke-width="0.5" stroke-opacity="0.5"/>` +
        letters(p.line, 100, y + h * 0.89, h * 0.1, w - 12, "#2a3140", "bold");
    }
    // The stitching goes over the lettering as it does on the cloth: drawn last.
    return { defs: base.defs + bandBox, body: s + base.over + stitchOver(id, x, y, w, h, p.sewing) };
  }
  const white: Rgb = [252, 251, 248];
  const base = cloth(id, x, y, w, h, white, [120, 126, 140]);
  const ink = p.ink === "vermilion" ? "#c9361c" : "#15181f";
  const top = h * 0.66;
  const s = base.under +
    letters(p.name, 100, y + top * 0.52, Math.min(top * 0.62, w * 0.36), w - 16, ink, "black") +
    letters(p.line, 100, y + top + (h - top) * 0.5, (h - top) * 0.46, w - 16, ink, "bold");
  return { defs: base.defs, body: s + base.over + stitchOver(id, x, y, w, h, "x", [120, 126, 140]) };
}

/** The stitching of a patch drawn over its lettering: the diagonals or the three lines (the edge's own stitching is under it already). */
function stitchOver(id: string, x: number, y: number, w: number, h: number, sewing: "x" | "lines", thread: Rgb = [150, 156, 170]): string {
  const m = 2.6;
  const tc = hexOf(thread);
  const dk = hexOf(blend(thread, [0, 0, 0], 0.45));
  const d = sewing === "x"
    ? `M${n2(x + m)} ${n2(y + m)}L${n2(x + w - m)} ${n2(y + h - m)}M${n2(x + w - m)} ${n2(y + m)}L${n2(x + m)} ${n2(y + h - m)}`
    : [1, 2, 3].map((k) => `M${n2(x + m + ((w - 2 * m) * k) / 4)} ${n2(y + m)}V${n2(y + h - m)}`).join("");
  return `<g data-sewn="${id}"><path d="${d}" fill="none" stroke="${dk}" stroke-width="1.05" stroke-dasharray="1.7 1.1" stroke-opacity="0.3" transform="translate(0.25 0.35)" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${tc}" stroke-width="0.55" stroke-dasharray="1.7 1.1" stroke-linecap="round"/></g>`;
}
