// The jiu-jitsu gi's patches: a piece of cloth sewn on, in any of five shapes (a rectangle, a rounded one, a circle, a shield or a custom outline), with its cut edge standing off the
// gi by 3 to 4 mm, a turned edge, an edge stitch (a running stitch or a satin border), and lettering or generic placeholder art in thread. Every shape is cut by `shapedCloth` of judogiPatch.ts
// (the package's one patch: its thickness, its edge and its weave are set there). The art is neutral: stars, chevrons, rings, a wave, a diamond and a bolt; no club, team, brand or sponsor mark is ever drawn. Original drawing.

import { blend, lum, shade, type Rgb } from "./colour.ts";
import { clothOutline, clothPath, PATCH_EDGES, patchMm, shapedCloth, type PatchEdge } from "./judogiPatch.ts";
import type { Mark } from "./judogiCloth.ts";
import { readThread, satinDefs, satinRun, satinShape, satinStroke, type ThreadColour } from "./judogiThread.ts";
import { n2 } from "./path.ts";
import { layout } from "./text.ts";

export const PATCH_SHAPES = ["rectangle", "rounded", "circle", "shield", "custom"] as const;
export type PatchShape = (typeof PATCH_SHAPES)[number];

/** The generic placeholder art a patch may carry: nobody's badge. */
export const PATCH_ARTS = ["star", "chevrons", "rings", "wave", "diamond", "bolt"] as const;
export type PatchArt = (typeof PATCH_ARTS)[number];

/** The most characters a patch's lettering has. */
export const PATCH_TEXT_MAX = 14;

/** What a person asks of one patch: every field but the zone is optional. */
export interface BjjPatch {
  /** Where it is sewn: one of `BJJ_ZONES`. */
  zone: string;
  shape?: PatchShape;
  /** The outline of a `custom` shape: a path of absolute commands (`M L C Q Z`) in a 100 by 100 box, drawn stretched to the patch's size. */
  outline?: string;
  /** Its size in centimetres: the zone's own when not given, and never more than the zone has room for. */
  widthCm?: number;
  heightCm?: number;
  /** The cloth's colour and the edge's thread, a thread preset or `#rrggbb`. `border: false` stitches the edge in the cloth's own colour. */
  colour?: ThreadColour | string;
  border?: ThreadColour | string | false;
  /** Lettering in thread, up to `PATCH_TEXT_MAX` characters; empty or `false` for none. */
  text?: string | false;
  /** Placeholder art in thread; `false` for none. */
  art?: PatchArt | false;
  /** The thread of the lettering and the art, a preset or `#rrggbb`. */
  ink?: ThreadColour | string;
  /** The thickness in millimetres, 3 to 4, and the edge stitch (`running` or `satin`). */
  thicknessMm?: number;
  edge?: PatchEdge;
}

export interface ReadBjjPatch {
  zone: string;
  shape: PatchShape | undefined;
  outline: string;
  widthCm: number | undefined;
  heightCm: number | undefined;
  colour: Rgb;
  border: Rgb;
  ink: Rgb;
  text: string;
  art: PatchArt | undefined;
  mm: number;
  edge: PatchEdge;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);
const cm = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.min(60, Math.max(1.5, v)) : undefined);

/** A patch from outside, made safe. `undefined` when it names no zone. */
export function readBjjPatch(raw: unknown, zones: readonly string[]): ReadBjjPatch | undefined {
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as BjjPatch;
  if (typeof o.zone !== "string" || !zones.includes(o.zone)) return undefined;
  const colour = readThread(o.colour, "navy").rgb;
  const border = o.border === false ? shade(colour, lum(colour) > 0.4 ? -0.35 : 0.3) : readThread(o.border, lum(colour) > 0.4 ? "navy" : "white").rgb;
  const outline = clothPath(o.outline);
  const text = o.text === false ? "" : typeof o.text === "string" ? [...o.text.trim()].slice(0, PATCH_TEXT_MAX).join("") : "";
  return {
    zone: o.zone,
    shape: o.shape === "custom" && outline === "" ? "rounded" : (PATCH_SHAPES as readonly string[]).includes(o.shape as string) ? o.shape : undefined,
    outline,
    widthCm: cm(o.widthCm),
    heightCm: cm(o.heightCm),
    colour, border,
    ink: readThread(o.ink, lum(colour) > 0.4 ? "navy" : "white").rgb,
    text,
    art: o.art === false ? undefined : (PATCH_ARTS as readonly string[]).includes(o.art as string) ? (o.art as PatchArt) : undefined,
    mm: patchMm(o.thicknessMm),
    edge: pick(PATCH_EDGES, o.edge, "running"),
  };
}

/** A five-pointed star as a closed path, `r` the radius to its points. */
const starPath = (r: number): string => `M${Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const rr = i % 2 === 0 ? r : r * 0.42;
  return `${n2(rr * Math.cos(a))} ${n2(rr * Math.sin(a))}`;
}).join("L")}Z`;

/**
 * The placeholder art, `r` its radius, drawn in thread at the origin: a filled shape or strokes, each with the satin's own look. `id` is the satin pattern's.
 */
function artOf(kind: PatchArt, r: number, ink: Rgb, id: string): string {
  const fill = (d: string): string => satinShape(d, ink, id, "translate(0 0)");
  const sw = Math.max(0.9, r * 0.17);
  if (kind === "star") return fill(starPath(r));
  if (kind === "bolt") return fill(`M${n2(r * 0.15)} ${n2(-r)}L${n2(-r * 0.55)} ${n2(r * 0.12)}L${n2(-r * 0.05)} ${n2(r * 0.12)}L${n2(-r * 0.2)} ${n2(r)}L${n2(r * 0.6)} ${n2(-r * 0.2)}L${n2(r * 0.1)} ${n2(-r * 0.2)}Z`);
  if (kind === "diamond") return fill(`M0 ${n2(-r)}L${n2(r * 0.72)} 0L0 ${n2(r)}L${n2(-r * 0.72)} 0Z`) + satinStroke(`M0 ${n2(-r * 0.46)}L${n2(r * 0.34)} 0L0 ${n2(r * 0.46)}L${n2(-r * 0.34)} 0Z`, sw * 0.7, blend(ink, [128, 128, 128], 0.5));
  if (kind === "rings") return satinStroke(clothOutline("circle", r * 2, r * 2), sw, ink) + satinStroke(clothOutline("circle", r * 1.1, r * 1.1), sw, ink) + fill(clothOutline("circle", r * 0.34, r * 0.34));
  if (kind === "wave") return [-0.5, 0, 0.5].map((k) => satinStroke(`M${n2(-r)} ${n2(r * k)}Q${n2(-r * 0.5)} ${n2(r * k - r * 0.34)} 0 ${n2(r * k)}T${n2(r)} ${n2(r * k)}`, sw, ink)).join("");
  return [-0.5, 0.05, 0.6].map((k) => satinStroke(`M${n2(-r * 0.9)} ${n2(r * k + r * 0.34)}L0 ${n2(r * k - r * 0.34)}L${n2(r * 0.9)} ${n2(r * k + r * 0.34)}`, sw, ink)).join("");
}

/** The lettering and the art on a patch `w` by `h` (centred on the origin): the art above and the words under it, or either alone; a long strip reads along its length. */
function content(id: string, p: ReadBjjPatch, w: number, h: number): { defs: string; body: string } {
  if (p.text === "" && p.art === undefined) return { defs: "", body: "" };
  const strip = h > w * 2;
  const [cw, ch] = strip ? [h, w] : [w, h];
  const m = 2.2;
  const hasArt = p.art !== undefined;
  const hasText = p.text !== "";
  const wide = cw > ch * 1.7;
  let body = "";
  // The art takes the end of a wide patch (or the top of a roomy one); the words are centred in what is left, kept a stitch's width in from the edge.
  const r = hasArt ? (hasText ? (wide ? ch * 0.34 : Math.min(cw, ch) * 0.26) : Math.min(cw, ch) * 0.36) : 0;
  if (hasArt) {
    const at = hasText ? (wide ? [-cw / 2 + m + r, 0] : [0, -ch * 0.2]) : [0, 0];
    body += `<g transform="translate(${n2(at[0] as number)} ${n2(at[1] as number)})">${artOf(p.art as PatchArt, r, p.ink, `${id}A`)}</g>`;
  }
  if (hasText) {
    const side = hasArt && wide;
    const left = side ? -cw / 2 + m + 2 * r + m : -cw / 2 + m;
    const right = cw / 2 - m - 1.4;
    const height = hasArt && !wide ? ch * 0.22 : ch * (hasArt ? 0.4 : 0.5);
    const run = layout(p.text, 0, 0, { height: Math.min(height, ch - 2 * m), maxWidth: right - left - 1.6, weight: "black", tracking: 0.35 });
    const y = hasArt && !wide ? ch * 0.3 : 0;
    body += `<g transform="translate(${n2((left + right) / 2)} ${n2(y)})">${satinRun(run, p.ink, `${id}T`, "system-ui,sans-serif", undefined, p.text)}</g>`;
  }
  const defs = satinDefs(`${id}A`, p.ink) + satinDefs(`${id}T`, p.ink);
  return { defs, body: strip ? `<g transform="rotate(90)">${body}</g>` : body };
}

/**
 * One patch sewn on the gi, in a frame whose middle is `(x, y)`: `w` by `h` drawing units, turned `rot` degrees clockwise. `uid` is the page-unique id of the patch's own defs.
 * The patch is a `Mark`: its defs and its drawing, for the face it is sewn on.
 */
export function drawBjjPatch(uid: string, p: ReadBjjPatch, shape: PatchShape, at: { x: number; y: number; w: number; h: number; rot: number }): Mark {
  const { w, h } = at;
  const made = shapedCloth(uid, shape === "custom" ? { path: p.outline } : shape, -w / 2, -h / 2, w, h, p.colour, p.border, { mm: p.mm, edge: p.edge });
  const inner = content(uid, p, w, h);
  return {
    defs: made.defs + inner.defs,
    body: `<g data-bjj-patch="${p.zone}" transform="translate(${n2(at.x)} ${n2(at.y)}) rotate(${n2(at.rot)})">${made.under}${inner.body}${made.over}</g>`,
  };
}

/** The colours the demo and the presets draw patches in, as thread names. */
export const PATCH_PALETTE = ["navy", "red", "gold", "black", "white", "green", "purple", "wine"] as const satisfies readonly ThreadColour[];
