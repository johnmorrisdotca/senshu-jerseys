// Original judogi drawings: jacket (uwagi), trousers (zubon) and belt (obi). Contest white or blue, rank-belt
// colours, named IJF sizes, product pieces or a worn suit. No maker, federation or sponsor marks. Sizes and
// positions cite the IJF Judogi Rules (09 03 2022) as facts; that document's pictures and wording are not copied.

import { BELT_COVERS, BELT_STITCH_LINES, BELT_THICKNESSES, beltWidthIsReal, beltDefaultWidthCm, type BeltCover, type BeltStitchLines, type BeltThickness } from "./beltSpecs.ts";
import { BOX_STATES, BOX_TEXT_DEFAULT, BOX_TYPES, KIRI_WOODS, boxSizeFor, sceneOf, solidBounds, type BoxSize, type BoxState, type BoxType, type KiriWood } from "./beltBox.ts";
import { solidFace } from "./beltBoxFace.ts";
import { hashOf, type Rgb } from "./colour.ts";
import { beltFace, beltPaint } from "./judogiBelt.ts";
import { toneOf, type BeltPaint, type Face, type GiInk, type Mark } from "./judogiCloth.ts";
import { collarPiece } from "./judogiCollar.ts";
import { BACK_COLLAR_FOOT, beltRound, collarDesc, jacketDesc, jacketFace, LAPEL_BAND } from "./judogiJacket.ts";
import type { JudogiBranding } from "./judogiBrand.ts";
import { buildMarks, layoutMarks, markNotes, readMarks, type JudogiEmblem, type JudogiEmbroidery, type JudogiLabel, type JudogiLogo, type MarkRules, type MarkSet } from "./judogiMarks.ts";
import { backPatch, patchNotes, readPatch, type JudogiBackPatch, type PatchSpec } from "./judogiPatch.ts";
import { pantsDesc, pantsFace } from "./judogiPants.ts";
import { STRAP_T, UNITS_PER_CM, strapDesc, strapFace, strapWidth, type StrapDesc } from "./judogiStrap.ts";
import { endTagsMark, readEndTags, type JudogiEndTags, type ReadEndTags } from "./judogiEndTags.ts";
import { END_LENGTH, bandsOf, endMark, readStyle, type JudogiBeltStyle, type ReadStyle } from "./judogiStripes.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { FACE_BOX, pieceMarkup } from "./pieceVolume.ts";
import type { VolumeDesc } from "./volume.ts";

export const JUDOGI_COLOURS = ["white", "blue"] as const;
export type JudogiColour = (typeof JUDOGI_COLOURS)[number];

export const JUDOGI_BELTS = ["none", "white", "yellow", "orange", "green", "blue", "brown", "black", "red-white", "red"] as const;
export type JudogiBelt = (typeof JUDOGI_BELTS)[number];

export const JUDOGI_MODES = ["pieces", "suit", "jacket", "pants", "belt", "folded", "box"] as const;
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
  /** The belt's width in centimetres, 3 to 6 drawn (the IJF allows 4 to 5, and `judogiCheck` says when it is outside). By default the grade's own: 4 for the rank colours, 4.75 for black, 5 for red-white and red. */
  beltWidthCm?: number;
  /** The rows of stitching along the belt: 8, 10, 13, 14, 15 or 16 (the counts belts are made with; 10 by default). */
  beltStitchLines?: BeltStitchLines;
  /** How thick the belt is: `standard` (about 5 mm, the IJF's figure), `thick` or `extra-thick` (the cores of the heavier black and kohaku belts), seen at its edges and folds. */
  beltThickness?: BeltThickness;
  /** What covers the belt: plain `cotton` (the default), satin-woven `shusu` or `silk`, the last two with a sheen. */
  beltCover?: BeltCover;
  /** What most belts carry near one end: a woven maker's label with a size tag and a white tag under it, and grade lines (see `JudogiEndTags`); `true` for the usual three on the right end. */
  beltTags?: boolean | JudogiEndTags;
  /** Stripes, a second colour, a tip block, bars or tags on the belt, any number in any arrangement (`BELT_PRESETS` has the common real ones). Nothing by default. */
  beltStyle?: JudogiBeltStyle;
  /** The package's own woven "Approved Judogi" label on the jacket, the trousers and the belt: `true`, or a colour variant and thread. */
  label?: boolean | JudogiLabel;
  /** The Senshu branding: a woven neck label with a size tag, the brush kanji mark, and the S as the maker's logo, every part swappable. `true` for the defaults. */
  branding?: boolean | JudogiBranding;
  /** Whose limits the check holds marks to: the IJF's (default) or the All Japan Judo Federation's. */
  rules?: MarkRules;
  /** The belt's size number as the maker lists it (1 to 8, halves too), which sets the folded belt's length and the box that holds it. By default the one that goes with the judogi's size. */
  beltSize?: number;
  /** The gift box of mode `box`: `kiri` (wood, the default) or `silver` (cardboard); its state (`closed`, `open` with the lid beside it and the belt in it, `empty`); the words on the lid (御帯 by default); the wood's tone; a box size to use instead of the one the belt needs. */
  boxType?: BoxType;
  boxState?: BoxState;
  boxText?: string;
  boxWood?: KiriWood;
  boxSize?: BoxSize;
  /** The shop's paper band round the middle of a folded belt (mode `folded`). Off by default. */
  band?: boolean;
}

/** A belt size number for each judogi size, near enough for a default (a size 4 judogi takes about a size 4 belt; the height sizes go by the usual waist). */
const BELT_SIZE_FOR: Record<JudogiSize, number> = {
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "150": 2, "155": 2.5, "160": 3, "165": 3, "170": 3.5, "175": 4, "180": 4.5, "185": 5, "190": 5.5, "195": 6, "200": 6.5,
};

/** The belt size number a judogi size defaults to. */
export const beltSizeForJudogi = (size: JudogiSize): number => BELT_SIZE_FOR[size];

/** The belt width asked for, in centimetres, or undefined for the grade's own. */
const readBeltCm = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

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
  const beltCm = readBeltCm(options?.beltWidthCm);
  const marked = options === undefined ? undefined : readMarks(options);
  const notes = [
    { id: "jacket-cover", met: jacket >= h * 0.38 && jacket <= h * 0.48, fact: "Jacket reaches mid-thigh and covers the buttocks (IJF Judogi Rules, 09 03 2022)." },
    { id: "sleeve-wrist", met: sleeve >= h * 0.28 && sleeve <= h * 0.36, fact: "Sleeves cover the arm and leave about 5 cm to the wrist (IJF Judogi Rules, 09 03 2022)." },
    { id: "lapel", met: true, fact: "Lapel width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "wrap", met: true, fact: "Jacket wraps left over right (IJF Judogi Rules, 09 03 2022)." },
    { id: "trouser-ankle", met: trouser >= h * 0.52 && trouser <= h * 0.64, fact: "Trousers cover the shin and leave about 5 cm to the ankle (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-width", met: beltCm === undefined || options?.belt === undefined || options.belt === "none" || beltWidthIsReal(options.belt, beltCm), fact: "A belt is made in the width of its grade: 4.2 cm for white and the rank colours (4.5 cm for an IJF-style white), 4.2, 4.5 or 4.7 cm for black, 4.5 cm for red-white and red (KuSakura belt guide and catalogue, read 2026-10-27); the IJF Judogi Rules (09 03 2022) give a belt's thickness and the hang of its ends, and no width." },
    { id: "belt-ends", met: beltHang >= 20 && beltHang <= 30, fact: "Belt hanging ends are 20–30 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "contest-colour", met: true, fact: "Contest judogi is white or blue (IJF Judogi Rules, 09 03 2022)." },
    ...(options?.mode === "box" ? [boxFitNote(options)] : []),
    ...(patch === undefined ? [] : patchNotes(patch)),
    ...(marked === undefined ? [] : markNotes(marked, layoutMarks(marked, strapWidth(pick(JUDOGI_BELTS, options?.belt, "white"), beltCm), readStyle(options?.beltStyle)).skipped)),
  ];
  return { ok: notes.every((n) => n.met), size, heightCm: h, notes };
}

/** Whether the belt of this size goes in the box asked for: the maker's wooden box fits a belt of size 6 at most and the silver one 6.5. */
function boxFitNote(o: JudogiOptions): { id: string; met: boolean; fact: string } {
  const type = pick(BOX_TYPES, o.boxType, "kiri");
  const size = readBeltSize(o.beltSize) ?? BELT_SIZE_FOR[pick(JUDOGI_SIZES, o.size, "170")];
  return { id: "belt-box-fit", met: boxSizeFor(size, type) !== undefined, fact: `A ${type === "kiri" ? "wooden (kiri)" : "silver cardboard"} gift box holds a belt of size ${type === "kiri" ? 6 : 6.5} at most (KuSakura gift-box pages, read 2026-10-28); a longer belt does not go in a box.` };
}

/** The belt size asked for, or undefined: 1 to 8 in halves. */
const readBeltSize = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? Math.max(1, Math.min(8, Math.round(v * 2) / 2)) : undefined);

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
  /** The belt width asked for in centimetres, kept to what can be drawn. */
  beltCm: number | undefined;
  /** What is laid on the belt besides its colour, checked. */
  style: ReadStyle | undefined;
  /** The belt's rows of stitching, its thickness in drawing units and its cover. */
  beltRows: BeltStitchLines | undefined;
  beltT: number;
  beltCover: BeltCover;
  endTags: ReadEndTags | undefined;
  cloth: Rgb;
  uid: string;
  patch: PatchSpec | undefined;
  marks: MarkSet | undefined;
  beltSize: number;
  boxType: BoxType;
  boxState: BoxState;
  boxText: string;
  boxWood: KiriWood;
  boxSize: BoxSize | undefined;
  band: boolean;
  /** Whether each end of the belt carries an embroidery of its own (the label and logo then keep the places they have). */
  beltEmb: { left: boolean; right: boolean };
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
  const beltAsked = readBeltCm(o.beltWidthCm);
  const beltCm = beltAsked === undefined ? undefined : Math.max(3, Math.min(6, beltAsked));
  const style = readStyle(o.beltStyle);
  const beltRows = (BELT_STITCH_LINES as readonly unknown[]).includes(o.beltStitchLines) ? o.beltStitchLines : undefined;
  const beltThickness = pick(BELT_THICKNESSES, o.beltThickness, "standard");
  const beltCover = pick(BELT_COVERS, o.beltCover, "cotton");
  const endTags = readEndTags(o.beltTags, size);
  const patch = readPatch(o.backPatch);
  const spec = readMarks(o);
  const beltSize = readBeltSize(o.beltSize) ?? BELT_SIZE_FOR[size];
  const boxType = pick(BOX_TYPES, o.boxType, "kiri");
  const boxState = pick(BOX_STATES, o.boxState, "closed");
  const boxWood = pick(KIRI_WOODS, o.boxWood, "natural");
  const boxText = typeof o.boxText === "string" ? [...o.boxText.trim()].slice(0, 6).join("") : BOX_TEXT_DEFAULT;
  const boxSize = ([2, 3, 4, 5, 6] as const).find((s) => s === o.boxSize);
  const band = o.band === true;
  const solid = mode === "folded" || mode === "box" ? [beltSize, boxType, boxState, boxText, boxWood, boxSize, band] : undefined;
  const uid = `jg${hashOf(JSON.stringify([colour, belt, size, mode, view, language, Math.round(yaw), thickness, beltCm, style, beltRows, beltThickness, beltCover, patch, spec, solid]))}`;
  const marks = spec === undefined ? undefined : buildMarks(`${uid}k`, spec, cloth, strapWidth(belt, beltCm), style);
  const title = o.title?.trim() || defaultTitle(language, colour, mode, view);
  return {
    colour, belt, size, mode, view, language, title, width, yaw, thickness, beltCm, style, beltRows, beltT: BELT_T[beltThickness], beltCover, endTags, cloth, uid, patch, marks, beltSize, boxType, boxState, boxText, boxWood, boxSize, band,
    beltEmb: { left: (o.embroidery ?? []).some((e) => e?.place === "belt-end-left"), right: (o.embroidery ?? []).some((e) => e?.place === "belt-end-right") },
    description: language === "ja"
      ? "柔道着。上衣、ズボン、帯。メーカーや連盟のマークは描いていません。"
      : "A judogi: jacket, trousers and belt. No maker or federation marks.",
  };
}

function defaultTitle(language: "en" | "ja", colour: JudogiColour, mode: JudogiMode, view: JudogiView): string {
  if (language === "ja") {
    const c = colour === "blue" ? "青" : "白";
    const m = { pieces: "上衣とズボン", suit: "着用", jacket: "上衣", pants: "ズボン", belt: "帯", folded: "畳んだ帯", box: "帯の箱" }[mode];
    const v = { front: "前", back: "後ろ", flat: "平置き", "flat-back": "平置き（後ろ）" }[view];
    return `${c}の柔道着、${m}、${v}`;
  }
  const c = colour === "blue" ? "Blue" : "White";
  const m = { pieces: "jacket and trousers", suit: "suit", jacket: "jacket", pants: "trousers", belt: "belt", folded: "belt folded flat", box: "belt gift box" }[mode];
  return `${c} judogi, ${m}, ${view}`;
}

function inkOf(o: Ready, part: string, belt?: BeltPaint, marks?: GiInk["marks"]): GiInk {
  return { uid: `${o.uid}${part}`, cloth: o.cloth, ...(belt === undefined ? {} : { belt }), ...(marks === undefined ? {} : { marks }) };
}

/** The strap's thickness for each grade, in drawing units (2.63 to the centimetre): about 5, 6 and 7 mm. */
const BELT_T: Record<BeltThickness, number> = { standard: STRAP_T, thick: 1.6, "extra-thick": 1.85 };

const join = (a: Mark | undefined, b: Mark | undefined): Mark | undefined => (a === undefined ? b : b === undefined ? a : { defs: a.defs + b.defs, body: a.body + b.body });

/** What is sewn on the jacket's faces: the back patch and the marks on either face. */
function jacketMarks(o: Ready): GiInk["marks"] | undefined {
  const patch: Mark | undefined = o.patch === undefined ? undefined : backPatch(`${o.uid}j`, o.patch, BACK_COLLAR_FOOT);
  const front = o.marks?.jacket.front;
  const back = join(patch, o.marks?.jacket.back);
  const backInner = o.marks?.jacket.backInner;
  if (front === undefined && back === undefined && backInner === undefined) return undefined;
  return { ...(front === undefined ? {} : { front }), ...(back === undefined ? {} : { back }), ...(backInner === undefined ? {} : { backInner }) };
}

/** What is sewn on the trousers' front. */
function pantsMarks(o: Ready): GiInk["marks"] | undefined {
  const front = o.marks?.pants.front;
  return front === undefined ? undefined : { front };
}

/** A belt's paint with what is sewn on its ends, and the defs those marks need. */
function paintOf(o: Ready, belt: string): BeltPaint | undefined {
  // A kohaku belt's red and white sections are 12 to 18 cm, longer with the size of the belt (a longer belt for a taller wearer).
  const section = 12 + (6 * (HEIGHT_OF[o.size] - 150)) / 50;
  const base = beltPaint(o.uid, belt, section, o.style?.base, o.style?.alternate);
  if (base === undefined) return undefined;
  const bands = bandsOf(o.style);
  const half = strapWidth(belt, o.beltCm) / 2;
  const tagL = endTagsMark(o.endTags, 0, half, o.uid);
  const tagR = endTagsMark(o.endTags, 1, half, o.uid);
  const stripes = { left: endMark(o.style, 0, half) + tagL.body, right: endMark(o.style, 1, half) + tagR.body, half };
  const p: BeltPaint = {
    ...base,
    defs: base.defs + tagL.defs + tagR.defs,
    ...(bands.length === 0 ? {} : { bands }),
    ...(o.beltRows === undefined ? {} : { rows: o.beltRows }),
    ...(o.beltCover === "cotton" ? {} : { cover: o.beltCover }),
    ...(stripes.left === "" && stripes.right === "" ? {} : { stripeEnds: stripes }),
  };
  const { left, right } = o.marks?.belt ?? {};
  if (left === undefined && right === undefined) return p;
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
  if (o.mode === "folded" || o.mode === "box") return solidSheet(o, yaw);
  const depth = Math.max(0.2, o.thickness / 12);
  const paint = paintOf(o, o.belt);
  const defs = paint?.defs ?? "";
  const width = strapWidth(o.belt, o.beltCm);
  if (o.mode === "belt") {
    const p = paint ?? (paintOf(o, "white") as BeltPaint);
    // A tied ring seen a little from above: its far half shows its inside, its edges their thickness.
    const ring: StrapDesc = { y: 28, sag: 3, w: width, t: o.beltT, a: 66, b: Math.round(30 * Math.max(0.35, Math.min(1.6, depth)) * 10) / 10, full: 2, side: 0, worn: false };
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
  const strap = jacket === undefined || tied === undefined ? undefined : volumeOf(`${o.uid}s`, strapDesc({ ...beltRound(depth, width), sag: 2.5, w: width, t: o.beltT, worn: true }, body.pitch), strapFace(tied, width), NO_FACE, yaw);
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

/** The folded belt, or the belt's gift box (with the belt folded in it): one piece of cells, see beltBox.ts. */
function solidSheet(o: Ready, yaw: number): Sheet {
  const box = o.mode === "box";
  const plain = o.belt === "none" && box ? undefined : paintOf(o, o.belt === "none" ? "white" : o.belt);
  // Folded, a belt shows its label at the free end, as a shop shows it: what is sewn on a hanging end sits well up from its tip, so it is moved toward the tip until the tip-most of it is
  // a few centimetres from the cut (the label, with its size tag under it). Close up, the rows of stitching are dashed stitches (white thread on a kohaku) and the cloth shows its twill.
  const toTip = (m: Mark | undefined, end: 0 | 1): Mark | undefined => {
    if (m === undefined) return m;
    const placed = (o.marks?.layout.placed ?? []).filter((q) => q.item.target === (end === 0 ? "belt-left" : "belt-right"));
    const reach = Math.max(0, ...placed.map((q) => q.box.x + (Math.abs(Math.cos((q.box.rot * Math.PI) / 180)) * q.box.w + Math.abs(Math.sin((q.box.rot * Math.PI) / 180)) * q.box.h) / 2));
    const shift = Math.max(0, (END_LENGTH[end] as number) - 4.5 * UNITS_PER_CM - reach);
    return shift === 0 ? m : { ...m, body: `<g transform="translate(${n2(shift)} 0)">${m.body}</g>` };
  };
  const fine = plain === undefined ? undefined : { ...plain, rows: plain.rows ?? 15, fine: { thread: o.belt === "red-white" ? "#ffffff" : plain.stitch } };
  const paint: BeltPaint | undefined = fine?.ends === undefined ? fine : { ...fine, ends: { ...(fine.ends.left === undefined ? {} : { left: toTip(fine.ends.left, 0) as Mark }), ...(fine.ends.right === undefined ? {} : { right: toTip(fine.ends.right, 1) as Mark }) } };
  const sectionCm = Math.max(12, Math.min(18, 12 + (6 * (HEIGHT_OF[o.size] - 150)) / 50));
  const widthCm = o.beltCm ?? beltDefaultWidthCm(o.belt === "none" ? "white" : o.belt);
  const { fits, boxSize, ...desc } = sceneOf({
    beltSize: o.beltSize, widthCm, thickCm: o.beltT / UNITS_PER_CM, belt: paint !== undefined, band: !box && o.band, period: 2 * sectionCm * UNITS_PER_CM, seed: [...o.uid].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7),
    ...(box ? { box: { type: o.boxType, state: o.boxState, ...(o.boxSize === undefined ? {} : { size: o.boxSize }) } } : {}),
  });
  void fits;
  void boxSize;
  const look = { wood: o.boxWood, text: o.boxText, sizeLabel: String(o.beltSize) };
  const face = solidFace(desc, paint, look, o.uid);
  // The view box holds the scene turned any way and tipped by the whole range the designer allows, so nothing is ever cut off.
  const bound = solidBounds(desc);
  const vol: VolumeDesc = { y: [], a: [], b: [], nt: 0, nf: 0, nh: 0, sl: [], sd: [], pitch: SOLID_PITCH, piece: true, solid: desc };
  const v = volumeOf(`${o.uid}x`, vol, face, NO_FACE, yaw);
  const w = Math.ceil(2 * bound.radius + 12);
  const top = Math.floor(bound.top - 6);
  const h = Math.ceil(bound.bottom + 6 - top);
  return box_(`${paint?.defs ?? ""}${v.defs}`, v.body, [100 - w / 2, top, w, h], yaw);
}

/** How far the camera looks down on a folded belt or a box, in degrees. */
const SOLID_PITCH = 28;

/** Whether a view is the cloth laid out with no turn: its front, or its back. */
export const isFlat = (view: JudogiView): boolean => view === "flat" || view === "flat-back";

/** The pieces drawn flat, as their front faces (or their back faces) with no turn: the jacket, the trousers beside it, the belt under the jacket. */
function flatSheet(o: Ready): Sheet {
  const side = o.view === "flat-back" ? "back" : "front";
  // A folded belt and a box are objects, not cloth: their flat views are the same scene, standing still (from the front or the back).
  if (o.mode === "folded" || o.mode === "box") return solidSheet(o, side === "back" ? 180 : 0);
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
  const defs = `${front.defs}${back.defs}<clipPath id="${uid}Fc">${clip(front)}</clipPath><clipPath id="${uid}Bc">${clip(back)}</clipPath><g id="${uid}F" data-face="${FACE_BOX.join(" ")}">${front.body}${front.extra ?? ""}</g><g id="${uid}B" data-face="${FACE_BOX.join(" ")}">${back.body}${back.extra ?? ""}</g>${mk.defs}`;
  return { defs, body: mk.body, tail: mk.tail };
}

const box_ = (defs: string, body: string, b: readonly [number, number, number, number], yaw: number): Sheet => box(defs, body, b, yaw);

function box(defs: string, body: string, b: readonly [number, number, number, number], yaw: number): Sheet {
  return { defs, body, x: b[0], y: b[1], w: b[2], h: b[3], yaw };
}

function normalYaw(yaw: unknown): number {
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return 0;
  const t = ((((yaw + 180) % 360) + 360) % 360) - 180;
  return Object.is(t, -0) ? 0 : t;
}
