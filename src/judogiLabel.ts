// The package's own "Approved Judogi" label: a small woven label sewn on the jacket's bottom front corner, the trousers' front near the waist and one
// hanging end of the belt, the places where the IJF's approval label goes (IJF Judogi Rules, 09 03 2022: the bottom of the jacket on the front left,
// near or in the reinforced edge; the top front of the trousers, close to the centre; one of the two edges of the belt). The label is a tribute and
// nobody's: "APPROVED" across the top, "JUDOGI" across the bottom, and between them one white judogi drawn in a circle ringed by the words
// "SENSHU JERSEYS FEDERATION". The Senshu Jerseys Federation is made up, and the label certifies nothing. It does not copy the IJF's label (no coloured
// judogi in a ring, no red rectangular border, no serif lettering, no federation name): the colours, the lettering, the proportions and the drawing are
// this package's own. Woven look: a fine weave under satin thread, a woven border, a sheen and a slight curl of one corner. Original drawing.

import { blend, graphemes, hexOf, lum, readColour, type Rgb } from "./colour.ts";
import { n2 } from "./path.ts";
import { patchEdge } from "./judogiPatch.ts";
import { layout } from "./text.ts";
import { readThread, satinDefs, satinRun, satinStroke, type ThreadColour } from "./judogiThread.ts";

/** A woven label's thickness in millimetres: 2 to 4, 3 by default (a woven label is thinner than a sewn patch, `PATCH_MM`). */
export const LABEL_MM = { min: 2, max: 4, default: 3 } as const;
/** A label's thickness kept to `LABEL_MM`; the default when none is given. */
export const labelMm = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? Math.max(LABEL_MM.min, Math.min(LABEL_MM.max, v)) : LABEL_MM.default);

export const LABEL_COLOURS = ["navy", "forest", "black", "wine", "cream"] as const;
export type LabelColour = (typeof LABEL_COLOURS)[number];

export const LABEL_COLOUR_LABELS: Record<LabelColour, { en: string; ja: string }> = {
  navy: { en: "Navy", ja: "紺" },
  forest: { en: "Forest green", ja: "深緑" },
  black: { en: "Black", ja: "黒" },
  wine: { en: "Wine", ja: "えんじ" },
  cream: { en: "Cream", ja: "生成り" },
};

/** The cloth of each colour variant and the thread it is stitched in. */
const VARIANT: Record<LabelColour, { cloth: Rgb; thread: ThreadColour }> = {
  navy: { cloth: [18, 34, 66], thread: "gold" },
  forest: { cloth: [20, 56, 42], thread: "gold" },
  black: { cloth: [26, 26, 30], thread: "silver" },
  wine: { cloth: [74, 20, 36], thread: "gold" },
  cream: { cloth: [240, 235, 222], thread: "navy" },
};

export interface JudogiLabel {
  /** One of the five variants, or `#rrggbb` for the cloth. Navy by default. */
  colour?: LabelColour | string;
  /** The thread: a preset or `#rrggbb`; the variant's own by default. */
  thread?: ThreadColour | string;
  /** The thickness in millimetres, 2 to 4 (`LABEL_MM`; 3 by default): the cut edge stands off the garment and the sewn edge is stitched. */
  thicknessMm?: number;
}

export interface ReadLabel {
  cloth: Rgb;
  thread: Rgb;
  name: string;
  mm: number;
}

/** The label from outside: `true` (or an empty object) for the navy label on all three pieces; `undefined` for none. */
export function readLabel(raw: unknown): ReadLabel | undefined {
  if (raw === true) return readLabel({});
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as JudogiLabel;
  const named = (LABEL_COLOURS as readonly string[]).includes(o.colour as string) ? (o.colour as LabelColour) : undefined;
  const custom = named === undefined ? readColour(o.colour) : undefined;
  const v = VARIANT[named ?? "navy"];
  const cloth = custom ?? v.cloth;
  // A custom cloth takes a thread that reads on it.
  const fallback: ThreadColour = custom === undefined ? v.thread : lum(custom) > 0.4 ? "navy" : "gold";
  return { cloth, thread: readThread(o.thread, fallback).rgb, name: named ?? (custom === undefined ? "navy" : "custom"), mm: labelMm(o.thicknessMm) };
}

/** The label's proportions: 3.5 by 5 cm, upright. */
export const LABEL_ASPECT = 0.7;

/** One white judogi in a 100 by 100 box: the jacket with its crossed lapels and the belt tied at the front, no trousers. Original, simple and woven-looking. */
function judogiIcon(thread: Rgb, ground: Rgb, id: string, light: boolean): string {
  const jacket = "M39 18L23 26L9 63L22 69L30 50L30 86L70 86L70 50L78 69L91 63L77 26L61 18Z";
  const white = hexOf([246, 244, 238]);
  const line = hexOf(light ? thread : ground);
  let s = `<path d="${jacket}" fill="${white}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += `<path d="${jacket}" fill="url(#${id}S)"/>`;
  // The lapels: the wearer's left over the right, running from the neck down to the belt.
  s += `<path d="M39 18L58 62M61 18L44 62" fill="none" stroke="${line}" stroke-width="2.6" stroke-linecap="round"/>`;
  s += `<path d="M44 20L61 58" fill="none" stroke="${white}" stroke-width="1.2" stroke-linecap="round"/>`;
  // The sleeves' seams and the cuffs.
  s += `<path d="M30 50L24 27M70 50L76 27M10 60L21 65M90 60L79 65" fill="none" stroke="${line}" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.8"/>`;
  // The belt and its knot.
  s += satinStroke("M30 64L70 64", 6, thread);
  s += `<circle cx="50" cy="64" r="5.2" fill="${hexOf(thread)}" stroke="${line}" stroke-width="1.4"/>`;
  s += satinStroke("M47 68L44 82M53 68L57 82", 3.4, thread);
  return s;
}

/**
 * The label, centred on the origin and `w` units wide (`w / 0.7` high). `id` names its own patterns. Letters follow a circle clockwise over the top and
 * counter-clockwise under the bottom so that both read upright.
 */
/**
 * The woven base every label shares, centred on the origin, `w` by `h`: its shadow and cloth with the weave, then (to draw after the lettering) its woven border,
 * sheen and curled corner. `sewn` (a sewn-on label: the jacket's, the neck's, the size tag's) adds the cut edge's thickness under the cloth and a running stitch
 * just inside the edge; without it the cloth lies flat.
 */
export function woven(id: string, l: ReadLabel, w: number, h: number, sewn?: { mm: number }): { defs: string; under: string; over: string; thread: string } {
  const light = lum(l.cloth) > 0.4;
  const cloth = hexOf(l.cloth);
  const deep = hexOf(blend(l.cloth, [0, 0, 0], 0.5));
  const lit = hexOf(blend(l.cloth, [255, 255, 255], light ? 0.7 : 0.3));
  const thread = hexOf(l.thread);
  const side = Math.min(w, h);
  // The weave: threads across and along, one pair light and one dark, fine enough that some forty show across the label's short side.
  const t = side / 40;
  const defs = satinDefs(`${id}S`, l.thread) +
    `<pattern id="${id}W" width="${n2(t * 2)}" height="${n2(t * 2)}" patternUnits="userSpaceOnUse"><rect width="${n2(t)}" height="${n2(t)}" fill="${deep}" fill-opacity="${light ? 0.12 : 0.26}"/><rect x="${n2(t)}" y="${n2(t)}" width="${n2(t)}" height="${n2(t)}" fill="${deep}" fill-opacity="${light ? 0.12 : 0.26}"/><rect x="${n2(t)}" width="${n2(t)}" height="${n2(t)}" fill="${lit}" fill-opacity="${light ? 0.5 : 0.16}"/></pattern>` +
    // The twill: diagonal ribs across the cloth, a lit rib and a dark one in turn, the way a woven label's cloth reads close up.
    `<pattern id="${id}T" width="${n2(t * 1.5)}" height="${n2(t * 1.5)}" patternUnits="userSpaceOnUse" patternTransform="rotate(48)"><rect width="${n2(t * 1.5)}" height="${n2(t * 0.55)}" fill="${deep}" fill-opacity="${light ? 0.16 : 0.3}"/><rect y="${n2(t * 0.75)}" width="${n2(t * 1.5)}" height="${n2(t * 0.3)}" fill="${lit}" fill-opacity="${light ? 0.35 : 0.14}"/></pattern>` +
    `<linearGradient id="${id}G" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#101620" stop-opacity="0.22"/></linearGradient>` +
    `<clipPath id="${id}C"><rect x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" rx="${n2(side * 0.05)}"/></clipPath>`;
  const rect = (grow = 0, dx = 0, dy = 0): string => `x="${n2(-w / 2 - grow + dx)}" y="${n2(-h / 2 - grow + dy)}" width="${n2(w + grow * 2)}" height="${n2(h + grow * 2)}" rx="${n2(side * 0.05 + grow)}"`;
  let under = "";
  // A soft contact shadow all round, nearly level (a label is a thin cloth: it throws a hair of shadow, not a slab down one side).
  for (const [k, o] of [[side * 0.06, 0.03], [side * 0.036, 0.05], [side * 0.02, 0.07], [side * 0.008, 0.09]] as const) under += `<rect ${rect(k, side * 0.008, side * 0.016)} fill="#1a2230" fill-opacity="${o}"/>`;
  if (sewn !== undefined) under += patchEdge(-w / 2, -h / 2, w, h, sewn.mm, l.cloth);
  under += `<rect ${rect()} fill="${cloth}"/><g clip-path="url(#${id}C)"><rect ${rect()} fill="url(#${id}W)"/><rect ${rect()} fill="url(#${id}T)"/></g>`;
  // A woven border (two lines of thread with the cloth between them), inset from the edge.
  const edge = side * 0.075;
  let over = `<rect x="${n2(-w / 2 + edge)}" y="${n2(-h / 2 + edge)}" width="${n2(w - 2 * edge)}" height="${n2(h - 2 * edge)}" rx="${n2(side * 0.025)}" fill="none" stroke="${thread}" stroke-width="${n2(side * 0.022)}"/>`;
  over += `<rect x="${n2(-w / 2 + edge * 1.7)}" y="${n2(-h / 2 + edge * 1.7)}" width="${n2(w - 3.4 * edge)}" height="${n2(h - 3.4 * edge)}" rx="${n2(side * 0.015)}" fill="none" stroke="${thread}" stroke-width="${n2(side * 0.01)}" stroke-opacity="0.8"/>`;
  // The sheen across the weave, and a slight curl at the bottom right corner: a lit fold and its shadow.
  const c = side * 0.13;
  over += `<g clip-path="url(#${id}C)"><rect ${rect()} fill="url(#${id}G)"/>` +
    `<path d="M${n2(w / 2)} ${n2(h / 2 - c)}L${n2(w / 2 - c)} ${n2(h / 2)}L${n2(w / 2)} ${n2(h / 2)}Z" fill="#fff" fill-opacity="${light ? 0.2 : 0.1}"/>` +
    `<path d="M${n2(w / 2 - c)} ${n2(h / 2)}L${n2(w / 2)} ${n2(h / 2 - c)}" stroke="#101620" stroke-opacity="0.3" stroke-width="0.5"/></g>`;
  over += `<rect ${rect()} fill="none" stroke="${deep}" stroke-width="0.6" stroke-opacity="0.8"/>`;
  if (sewn !== undefined) {
    // The sewn-on edge: a running stitch a hair inside the cut edge, in the thread, with a shadow under each stitch.
    const s = side * 0.03;
    const box = `x="${n2(-w / 2 + s)}" y="${n2(-h / 2 + s)}" width="${n2(w - 2 * s)}" height="${n2(h - 2 * s)}" rx="0.5" fill="none"`;
    const dash = `stroke-dasharray="${n2(side * 0.07)} ${n2(side * 0.035)}" stroke-linecap="round"`;
    over += `<g data-edge="running"><rect ${box} stroke="#10141c" stroke-opacity="0.35" stroke-width="${n2(side * 0.016)}" transform="translate(${n2(side * 0.008)} ${n2(side * 0.012)})" ${dash}/>` +
      `<rect ${box} stroke="${thread}" stroke-width="${n2(side * 0.012)}" ${dash}/></g>`;
  }
  return { defs, under, over, thread };
}

/**
 * The approval label, centred on the origin and `w` units wide (`w / 0.7` high). `id` names its own patterns. Letters follow a circle clockwise over the top and
 * counter-clockwise under the bottom so that both read upright.
 */
export function labelMark(id: string, l: ReadLabel, w: number): { defs: string; body: string } {
  const h = w / LABEL_ASPECT;
  const light = lum(l.cloth) > 0.4;
  const base = woven(id, l, w, h, { mm: l.mm });
  const thread = base.thread;
  const font = "system-ui";
  let s = base.under;
  const word =(text: string, cy: number, hh: number): string => satinRun(layout(text, 0, cy, { height: hh, maxWidth: w * 0.74, weight: "black", tracking: 0.3 }), l.thread, `${id}S`, font);
  s += word("APPROVED", -h * 0.375, h * 0.065) + word("JUDOGI", h * 0.375, h * 0.065);
  // The circle: an outer ring, the ring of words, an inner ring and the judogi.
  const R = w * 0.385;
  const cy = 0;
  const ring = (r: number, sw: number): string => `<circle cx="0" cy="${cy}" r="${n2(r)}" fill="none" stroke="${thread}" stroke-width="${n2(sw)}"/>`;
  s += ring(R, w * 0.02) + ring(R * 0.62, w * 0.016);
  const rText = R * 0.81;
  const hh = R * 0.15;
  const arc = (text: string, top: boolean): string => {
    const chars = graphemes(text);
    const step = (hh / rText) * (180 / Math.PI);
    const span = (chars.length - 1) * step;
    let out = "";
    chars.forEach((c, i) => {
      if (c === " ") return;
      const a = -span / 2 + i * step;
      const px = rText * Math.sin((a * Math.PI) / 180);
      const py = (top ? -1 : 1) * rText * Math.cos((a * Math.PI) / 180) + cy;
      out += `<g transform="translate(${n2(px)} ${n2(py)}) rotate(${n2(top ? a : -a)})">${satinRun(layout(c, 0, 0, { height: hh, weight: "bold" }), l.thread, `${id}S`, font)}</g>`;
    });
    return out;
  };
  s += arc("SENSHU JERSEYS", true) + arc("FEDERATION", false);
  // The judogi, inside the inner ring.
  const k = (R * 0.62 * 2 * 0.86) / 100;
  s += `<g transform="translate(${n2(-50 * k)} ${n2(cy - 50 * k)}) scale(${n2(k)})">${judogiIcon(l.thread, l.cloth, id, light)}</g>`;
  return { defs: base.defs, body: s + base.over };
}
