// Original judogi drawings: jacket (uwagi), trousers (zubon) and belt (obi). Contest white or blue, rank-belt
// colours, named IJF sizes, product pieces or a worn suit. No maker, federation or sponsor marks. Sizes and
// positions cite the IJF Judogi Rules (09 03 2022) as facts; that document's pictures and wording are not copied.

import { hashOf, type Rgb } from "./colour.ts";
import { beltFace, beltPaint } from "./judogiBelt.ts";
import { toneOf, type BeltPaint, type Face, type GiInk, type Mark } from "./judogiCloth.ts";
import { collarPiece } from "./judogiCollar.ts";
import { BACK_COLLAR_FOOT, beltRound, collarDesc, jacketDesc, jacketFace, LAPEL_BAND } from "./judogiJacket.ts";
import { buildMarks, markNotes, readMarks, type JudogiEmblem, type JudogiEmbroidery, type JudogiLogo, type MarkRules, type MarkSet } from "./judogiMarks.ts";
import { backPatch, patchNotes, readPatch, type JudogiBackPatch, type PatchSpec } from "./judogiPatch.ts";
import { pantsDesc, pantsFace } from "./judogiPants.ts";
import { STRAP_T, strapDesc, strapFace, strapWidth, type StrapDesc } from "./judogiStrap.ts";
import { wrapSvg } from "./svg.ts";
import { FACE_BOX, pieceMarkup } from "./pieceVolume.ts";
import type { VolumeDesc } from "./volume.ts";

export const JUDOGI_COLOURS = ["white", "blue"] as const;
export type JudogiColour = (typeof JUDOGI_COLOURS)[number];

export const JUDOGI_BELTS = ["none", "white", "yellow", "orange", "green", "blue", "brown", "black", "red-white", "red"] as const;
export type JudogiBelt = (typeof JUDOGI_BELTS)[number];

export const JUDOGI_MODES = ["pieces", "suit", "jacket", "pants", "belt"] as const;
export type JudogiMode = (typeof JUDOGI_MODES)[number];

export const JUDOGI_VIEWS = ["front", "back", "flat", "flat-back"] as const;
export type JudogiView = (typeof JUDOGI_VIEWS)[number];

/** Traditional 1–7 and the IJF height sizes in centimetres (150–200, every 5). */
export const JUDOGI_SIZES = [
  "1", "2", "3", "4", "5", "6", "7",
  "150", "155", "160", "165", "170", "175", "180", "185", "190", "195", "200",
] as const;
export type JudogiSize = (typeof JUDOGI_SIZES)[number];

export const JUDOGI_BELT_LABELS: Record<Exclude<JudogiBelt, "none">, { en: string; ja: string }> = {
  white: { en: "White", ja: "白" },
  yellow: { en: "Yellow", ja: "黄" },
  orange: { en: "Orange", ja: "橙" },
  green: { en: "Green", ja: "緑" },
  blue: { en: "Blue", ja: "青" },
  brown: { en: "Brown", ja: "茶" },
  black: { en: "Black", ja: "黒" },
  "red-white": { en: "Red-white", ja: "紅白" },
  red: { en: "Red", ja: "赤" },
};

export interface JudogiOptions {
  colour?: JudogiColour;
  belt?: JudogiBelt;
  size?: JudogiSize;
  mode?: JudogiMode;
  view?: JudogiView;
  language?: "en" | "ja";
  title?: string;
  /** Width of the drawing in CSS pixels. Default 320. */
  width?: number;
  /** Turn about the vertical axis, degrees: 0 the front, 90 the edge, 180 the back. */
  yaw?: number;
  /** Cloth thickness at the edge, in drawing units (0–28; 12 by default). */
  thickness?: number;
  /** A patch sewn on the back of the jacket: the IJF-style back number or the Japanese zekken. None by default. */
  backPatch?: JudogiBackPatch;
  /** Names and words stitched in the places the rules name (the jacket's hem, its chest, sleeves and shoulders, a belt's ends, the trousers' top), in thread. */
  embroidery?: JudogiEmbroidery[];
  /** The manufacturer's logo: one to a garment, in the rules' spots. Without artwork, a neutral placeholder is drawn. */
  logos?: JudogiLogo[];
  /** The national emblem on the left chest: a flag (SVG text from Hata, say), your own artwork, or a neutral placeholder. */
  emblem?: JudogiEmblem;
  /** Whose limits the check holds marks to: the IJF's (default) or the All Japan Judo Federation's. */
  rules?: MarkRules;
}

export interface JudogiCheck {
  ok: boolean;
  size: JudogiSize;
  heightCm: number;
  notes: { id: string; met: boolean; fact: string }[];
}

/** Contest white is an off-white, never pure white; contest blue is a strong royal blue (as in contest photographs), not navy. */
const WHITE_GI: Rgb = [248, 247, 243];
const BLUE_GI: Rgb = [28, 74, 168];

const HEIGHT_OF: Record<JudogiSize, number> = {
  "1": 150, "2": 160, "3": 170, "4": 175, "5": 180, "6": 190, "7": 200,
  "150": 150, "155": 155, "160": 160, "165": 165, "170": 170, "175": 175,
  "180": 180, "185": 185, "190": 190, "195": 195, "200": 200,
};

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;

/** The height in centimetres a named size stands for. */
export function judogiHeightCm(size: JudogiSize): number {
  return HEIGHT_OF[size];
}

/** Whether a named size meets the cited IJF length facts (09 03 2022). */
export function judogiCheck(options?: JudogiOptions): JudogiCheck {
  const size = pick(JUDOGI_SIZES, options?.size, "170");
  const h = HEIGHT_OF[size];
  const jacket = Math.round(h * 0.42);
  const sleeve = Math.round(h * 0.32);
  const trouser = Math.round(h * 0.58);
  const beltHang = 25;
  const patch = readPatch(options?.backPatch);
  const marked = options === undefined ? undefined : readMarks(options);
  const notes = [
    { id: "jacket-cover", met: jacket >= h * 0.38 && jacket <= h * 0.48, fact: "Jacket reaches mid-thigh and covers the buttocks (IJF Judogi Rules, 09 03 2022)." },
    { id: "sleeve-wrist", met: sleeve >= h * 0.28 && sleeve <= h * 0.36, fact: "Sleeves cover the arm and leave about 5 cm to the wrist (IJF Judogi Rules, 09 03 2022)." },
    { id: "lapel", met: true, fact: "Lapel width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "wrap", met: true, fact: "Jacket wraps left over right (IJF Judogi Rules, 09 03 2022)." },
    { id: "trouser-ankle", met: trouser >= h * 0.52 && trouser <= h * 0.64, fact: "Trousers cover the shin and leave about 5 cm to the ankle (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-width", met: true, fact: "Belt width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-ends", met: beltHang >= 20 && beltHang <= 30, fact: "Belt hanging ends are 20–30 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "contest-colour", met: true, fact: "Contest judogi is white or blue (IJF Judogi Rules, 09 03 2022)." },
    ...(patch === undefined ? [] : patchNotes(patch)),
    ...(marked === undefined ? [] : markNotes(marked)),
  ];
  return { ok: notes.every((n) => n.met), size, heightCm: h, notes };
}

/** A judogi as SVG. Front and back are a garment with volume; flat is the cloth laid out. The library does not read the clock. */
export function renderJudogi(options?: JudogiOptions): string {
  const o = read(options);
  const drawn = compose(o);
  return wrapSvg({
    id: o.uid, x: drawn.x, y: drawn.y, w: drawn.w, h: drawn.h, width: o.width,
    title: o.title, description: o.description, defs: drawn.defs, body: drawn.body, yaw: isFlat(o.view) ? undefined : drawn.yaw,
  });
}

/** The same drawing as `renderJudogi`, including its turn. */
export function judogiFrame(options?: JudogiOptions): string {
  return renderJudogi(options);
}

interface Ready {
  colour: JudogiColour;
  belt: JudogiBelt;
  size: JudogiSize;
  mode: JudogiMode;
  view: JudogiView;
  language: "en" | "ja";
  title: string;
  description: string;
  width: number;
  yaw: number;
  thickness: number;
  cloth: Rgb;
  uid: string;
  patch: PatchSpec | undefined;
  marks: MarkSet | undefined;
}

interface Sheet {
  defs: string;
  body: string;
  x: number;
  y: number;
  w: number;
  h: number;
  yaw: number;
}

function read(options?: JudogiOptions): Ready {
  const o: JudogiOptions = options !== null && typeof options === "object" ? options : {};
  const colour = pick(JUDOGI_COLOURS, o.colour, "white");
  const belt = pick(JUDOGI_BELTS, o.belt, "white");
  const size = pick(JUDOGI_SIZES, o.size, "170");
  const mode = pick(JUDOGI_MODES, o.mode, "pieces");
  const view = pick(JUDOGI_VIEWS, o.view, "front");
  const language = o.language === "ja" ? "ja" : "en";
  const cloth = colour === "blue" ? BLUE_GI : WHITE_GI;
  const width = typeof o.width === "number" && Number.isFinite(o.width) ? Math.max(48, Math.min(2400, o.width)) : 320;
  const yaw = typeof o.yaw === "number" && Number.isFinite(o.yaw) ? o.yaw : 0;
  const thickness = typeof o.thickness === "number" && Number.isFinite(o.thickness) ? Math.max(0, Math.min(28, o.thickness)) : 12;
  const patch = readPatch(o.backPatch);
  const spec = readMarks(o);
  const uid = `jg${hashOf(JSON.stringify([colour, belt, size, mode, view, language, Math.round(yaw), thickness, patch, spec]))}`;
  const marks = spec === undefined ? undefined : buildMarks(`${uid}k`, spec, cloth, BELT_END);
  const title = o.title?.trim() || defaultTitle(language, colour, mode, view);
  return {
    colour, belt, size, mode, view, language, title, width, yaw, thickness, cloth, uid, patch, marks,
    description: language === "ja"
      ? "柔道着。上衣、ズボン、帯。メーカーや連盟のマークは描いていません。"
      : "A judogi: jacket, trousers and belt. No maker or federation marks.",
  };
}

function defaultTitle(language: "en" | "ja", colour: JudogiColour, mode: JudogiMode, view: JudogiView): string {
  if (language === "ja") {
    const c = colour === "blue" ? "青" : "白";
    const m = { pieces: "上衣とズボン", suit: "着用", jacket: "上衣", pants: "ズボン", belt: "帯" }[mode];
    const v = { front: "前", back: "後ろ", flat: "平置き", "flat-back": "平置き（後ろ）" }[view];
    return `${c}の柔道着、${m}、${v}`;
  }
  const c = colour === "blue" ? "Blue" : "White";
  const m = { pieces: "jacket and trousers", suit: "suit", jacket: "jacket", pants: "trousers", belt: "belt" }[mode];
  return `${c} judogi, ${m}, ${view}`;
}

function inkOf(o: Ready, part: string, belt?: BeltPaint, marks?: GiInk["marks"]): GiInk {
  return { uid: `${o.uid}${part}`, cloth: o.cloth, ...(belt === undefined ? {} : { belt }), ...(marks === undefined ? {} : { marks }) };
}

/** The length of a belt's hanging end the marks are laid out along, in drawing units (the ends hang 60 to 66 of them). */
const BELT_END = 60;

const join = (a: Mark | undefined, b: Mark | undefined): Mark | undefined => (a === undefined ? b : b === undefined ? a : { defs: a.defs + b.defs, body: a.body + b.body });

/** What is sewn on the jacket's faces: the back patch and the marks on either face. */
function jacketMarks(o: Ready): GiInk["marks"] | undefined {
  const patch: Mark | undefined = o.patch === undefined ? undefined : backPatch(`${o.uid}j`, o.patch, BACK_COLLAR_FOOT);
  const front = o.marks?.jacket.front;
  const back = join(patch, o.marks?.jacket.back);
  if (front === undefined && back === undefined) return undefined;
  return { ...(front === undefined ? {} : { front }), ...(back === undefined ? {} : { back }) };
}

/** What is sewn on the trousers' front. */
function pantsMarks(o: Ready): GiInk["marks"] | undefined {
  const front = o.marks?.pants.front;
  return front === undefined ? undefined : { front };
}

/** A belt's paint with what is sewn on its ends, and the defs those marks need. */
function paintOf(o: Ready, belt: string): BeltPaint | undefined {
  const p = beltPaint(o.uid, belt);
  const { left, right } = o.marks?.belt ?? {};
  if (p === undefined || (left === undefined && right === undefined)) return p;
  return { ...p, defs: p.defs + (left?.defs ?? "") + (right?.defs ?? ""), ends: { ...(left === undefined ? {} : { left }), ...(right === undefined ? {} : { right }) } };
}

/** Where each layout puts its pieces, at the jacket's scale: the view box, and the trousers' offset from the jacket. */
const JACKET_BOX = [-30, -2, 260, 216] as const;
const PANTS_BOX = [8, 0, 184, 270] as const;
const BELT_BOX = [16, 6, 168, 124] as const;
/** Product pictures show the trousers beside the jacket and a little lower; worn, their waistband sits under the belt. */
const PIECES_AT = [206, 28] as const;
const WORN_AT = 102;

/** Each piece wrapped on its own volume; a back view starts half a turn round. A belt is tied on the jacket (the flat view lays it out on its own instead). */
function compose(o: Ready): Sheet {
  if (isFlat(o.view)) return flatSheet(o);
  const yaw = normalYaw(o.yaw + (o.view === "back" ? 180 : 0));
  const depth = Math.max(0.2, o.thickness / 12);
  const paint = paintOf(o, o.belt);
  const defs = paint?.defs ?? "";
  const width = strapWidth(o.belt);
  if (o.mode === "belt") {
    const p = paint ?? (paintOf(o, "white") as BeltPaint);
    // A tied ring seen a little from above: its far half shows its inside, its edges their thickness.
    const ring: StrapDesc = { y: 28, sag: 3, w: width, t: STRAP_T, a: 66, b: Math.round(30 * Math.max(0.35, Math.min(1.6, depth)) * 10) / 10, full: 2, side: 0, worn: false };
    const belt = volumeOf(`${o.uid}b`, strapDesc(ring, 14), strapFace(p, width), NO_FACE, yaw);
    return box(p.defs + belt.defs, belt.body, BELT_BOX, yaw);
  }
  const tied = o.mode === "pants" ? undefined : paint;
  const ink = { ...inkOf(o, "j", tied, jacketMarks(o)), beltApart: true as const };
  const body = jacketDesc(depth, tied !== undefined);
  // The collar and a tied belt are pieces of their own worn on the jacket: drawn after its body and before the sleeve nearest the eye.
  const jacketVolume: VolumeDesc = { ...body, worn: tied === undefined ? 1 : 2 };
  const jacket = o.mode === "pants" ? undefined : volumeOf(`${o.uid}j`, jacketVolume, jacketFace(ink, "front"), jacketFace(ink, "back"), yaw);
  const tone = toneOf(o.cloth);
  const collar = jacket === undefined ? undefined : volumeOf(`${o.uid}c`, collarPiece(collarDesc(body), body.pitch), strapFace({ fill: tone.fill, edge: tone.seam, stitch: tone.stitch, defs: "", ...(o.marks?.collar === undefined ? {} : { strip: o.marks.collar }) }, LAPEL_BAND, 6), NO_FACE, yaw);
  // A tied belt is a strap of its own over the jacket, so it has thickness and its knot and ends stand off the cloth when it turns.
  const strap = jacket === undefined || tied === undefined ? undefined : volumeOf(`${o.uid}s`, strapDesc({ ...beltRound(depth, width), sag: 2.5, w: width, t: STRAP_T, worn: true }, body.pitch), strapFace(tied, width), NO_FACE, yaw);
  const belted = `${collar?.body ?? ""}${strap?.body ?? ""}${jacket?.tail ?? ""}`;
  const beltDefs = `${collar?.defs ?? ""}${strap?.defs ?? ""}`;
  // Worn, the trousers are gathered at the waist and sit inside the jacket; laid out, they keep their full width.
  const worn = o.mode === "suit";
  const pants = o.mode === "jacket" ? undefined : volumeOf(`${o.uid}p`, pantsDesc(depth, worn), pantsFace(inkOf(o, "p", undefined, pantsMarks(o)), "front", worn), pantsFace(inkOf(o, "p", undefined, pantsMarks(o)), "back", worn), yaw);
  if (jacket !== undefined && pants === undefined) return box(defs + jacket.defs + beltDefs, jacket.body + belted, JACKET_BOX, yaw);
  if (pants !== undefined && jacket === undefined) return box(pants.defs, pants.body, PANTS_BOX, yaw);
  if (jacket === undefined || pants === undefined) return box("", "", JACKET_BOX, yaw);
  if (o.mode === "suit") {
    const [x, y, w] = JACKET_BOX;
    return box(defs + pants.defs + jacket.defs + beltDefs, `<g transform="translate(0 ${WORN_AT})">${pants.body}</g>${jacket.body}${belted}`, [x, y, w, WORN_AT + PANTS_BOX[1] + PANTS_BOX[3] - y], yaw);
  }
  const [px, py] = PIECES_AT;
  return box(defs + jacket.defs + beltDefs + pants.defs, `${jacket.body}${belted}<g transform="translate(${px} ${py})">${pants.body}</g>`, [JACKET_BOX[0], JACKET_BOX[1], px + PANTS_BOX[0] + PANTS_BOX[2] - JACKET_BOX[0], py + PANTS_BOX[3] - JACKET_BOX[1]], yaw);
}

/** Whether a view is the cloth laid out with no turn: its front, or its back. */
export const isFlat = (view: JudogiView): boolean => view === "flat" || view === "flat-back";

/** The pieces drawn flat, as their front faces (or their back faces) with no turn: the jacket, the trousers beside it, the belt under the jacket. */
function flatSheet(o: Ready): Sheet {
  const side = o.view === "flat-back" ? "back" : "front";
  const paint = paintOf(o, o.belt);
  const defs = paint?.defs ?? "";
  const flat = (f: Face): string => `${f.defs}`;
  if (o.mode === "belt") {
    const p = paint ?? (paintOf(o, "white") as BeltPaint);
    const b = beltFace(p, side);
    return box(p.defs + flat(b), b.body, BELT_BOX, 0);
  }
  const tied = o.mode === "suit" || o.mode === "jacket" ? paint : undefined;
  const j = jacketFace(inkOf(o, "j", tied, jacketMarks(o)), side);
  const p = pantsFace(inkOf(o, "p", undefined, pantsMarks(o)), side, o.mode === "suit");
  if (o.mode === "jacket") return box(defs + flat(j), j.body, JACKET_BOX, 0);
  if (o.mode === "pants") return box(flat(p), p.body, PANTS_BOX, 0);
  if (o.mode === "suit") {
    const [x, y, w] = JACKET_BOX;
    return box(defs + flat(j) + flat(p), `<g transform="translate(0 ${WORN_AT})">${p.body}</g>${j.body}`, [x, y, w, WORN_AT + PANTS_BOX[1] + PANTS_BOX[3] - y], 0);
  }
  const [px, py] = PIECES_AT;
  const laid = paint === undefined ? "" : `<g transform="translate(0 ${JACKET_BOX[3] - 6})">${beltFace(paint, side).body}</g>`;
  const extra = paint === undefined ? 0 : BELT_BOX[3];
  return box(defs + flat(j) + flat(p), `${j.body}${laid}<g transform="translate(${px} ${py})">${p.body}</g>`, [JACKET_BOX[0], JACKET_BOX[1], px + PANTS_BOX[0] + PANTS_BOX[2] - JACKET_BOX[0], Math.max(py + PANTS_BOX[3], JACKET_BOX[3] + extra) - JACKET_BOX[1]], 0);
}

/** The back face of a strap, which draws every cell from its one face. */
const NO_FACE: Face = { defs: "", body: "", clip: [] };

function volumeOf(uid: string, desc: VolumeDesc, front: Face, back: Face, yaw: number): { defs: string; body: string; tail: string } {
  const mk = pieceMarkup(desc, uid, `${uid}F`, `${uid}B`, `${uid}Fc`, `${uid}Bc`, yaw);
  const clip = (f: Face): string => f.clip.map((d) => `<path d="${d}"/>`).join("");
  const defs = `${front.defs}${back.defs}<clipPath id="${uid}Fc">${clip(front)}</clipPath><clipPath id="${uid}Bc">${clip(back)}</clipPath><g id="${uid}F" data-face="${FACE_BOX.join(" ")}">${front.body}</g><g id="${uid}B" data-face="${FACE_BOX.join(" ")}">${back.body}</g>${mk.defs}`;
  return { defs, body: mk.body, tail: mk.tail };
}

function box(defs: string, body: string, b: readonly [number, number, number, number], yaw: number): Sheet {
  return { defs, body, x: b[0], y: b[1], w: b[2], h: b[3], yaw };
}

function normalYaw(yaw: unknown): number {
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return 0;
  const t = ((((yaw + 180) % 360) + 360) % 360) - 180;
  return Object.is(t, -0) ? 0 : t;
}
