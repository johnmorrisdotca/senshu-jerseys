// Original judogi drawings: jacket (uwagi), trousers (zubon) and belt (obi). Contest white or blue, rank-belt
// colours, named IJF sizes, product pieces or a worn suit. No maker, federation or sponsor marks. Sizes and
// positions cite the IJF Judogi Rules (09 03 2022) as facts; that document's pictures and wording are not copied.

import { hashOf, hexOf, shade, type Rgb } from "./colour.ts";
import { beltDesc, beltFace, flatFaces, jacketDesc, jacketFace, pantsDesc, pantsFace, type Face, type GiInk } from "./judogiCloth.ts";
import { wrapSvg } from "./svg.ts";
import { volumeMarkup, type VolumeDesc } from "./volume.ts";

export const JUDOGI_COLOURS = ["white", "blue"] as const;
export type JudogiColour = (typeof JUDOGI_COLOURS)[number];

export const JUDOGI_BELTS = ["none", "white", "yellow", "orange", "green", "blue", "brown", "black", "red-white", "red"] as const;
export type JudogiBelt = (typeof JUDOGI_BELTS)[number];

export const JUDOGI_MODES = ["pieces", "suit", "jacket", "pants", "belt"] as const;
export type JudogiMode = (typeof JUDOGI_MODES)[number];

export const JUDOGI_VIEWS = ["front", "back", "flat"] as const;
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
}

export interface JudogiCheck {
  ok: boolean;
  size: JudogiSize;
  heightCm: number;
  notes: { id: string; met: boolean; fact: string }[];
}

const WHITE_GI: Rgb = [236, 234, 228];
const BLUE_GI: Rgb = [27, 58, 122];
const BELT_RGB: Record<Exclude<JudogiBelt, "none" | "red-white">, Rgb> = {
  white: [247, 244, 236],
  yellow: [230, 194, 0],
  orange: [224, 112, 32],
  green: [45, 122, 58],
  blue: [42, 90, 160],
  brown: [107, 58, 31],
  black: [26, 26, 26],
  red: [176, 16, 32],
};

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
  const notes = [
    { id: "jacket-cover", met: jacket >= h * 0.38 && jacket <= h * 0.48, fact: "Jacket reaches mid-thigh and covers the buttocks (IJF Judogi Rules, 09 03 2022)." },
    { id: "sleeve-wrist", met: sleeve >= h * 0.28 && sleeve <= h * 0.36, fact: "Sleeves cover the arm and leave about 5 cm to the wrist (IJF Judogi Rules, 09 03 2022)." },
    { id: "lapel", met: true, fact: "Lapel width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "wrap", met: true, fact: "Jacket wraps left over right (IJF Judogi Rules, 09 03 2022)." },
    { id: "trouser-ankle", met: trouser >= h * 0.52 && trouser <= h * 0.64, fact: "Trousers cover the shin and leave about 5 cm to the ankle (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-width", met: true, fact: "Belt width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-ends", met: beltHang >= 20 && beltHang <= 30, fact: "Belt hanging ends are 20–30 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "contest-colour", met: true, fact: "Contest judogi is white or blue (IJF Judogi Rules, 09 03 2022)." },
  ];
  return { ok: notes.every((n) => n.met), size, heightCm: h, notes };
}

/** A judogi as SVG. Front and back are a garment with volume; flat is the cloth laid out. The library does not read the clock. */
export function renderJudogi(options?: JudogiOptions): string {
  const o = read(options);
  const drawn = compose(o);
  return wrapSvg({
    id: o.uid, x: drawn.x, y: drawn.y, w: drawn.w, h: drawn.h, width: o.width,
    title: o.title, description: o.description, defs: drawn.defs, body: drawn.body, yaw: o.view === "flat" ? undefined : drawn.yaw,
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
  const uid = `jg${hashOf(JSON.stringify([colour, belt, size, mode, view, language, Math.round(yaw), thickness]))}`;
  const title = o.title?.trim() || defaultTitle(language, colour, mode, view);
  return {
    colour, belt, size, mode, view, language, title, width, yaw, thickness, cloth, uid,
    description: language === "ja"
      ? "柔道着。上衣、ズボン、帯。メーカーや連盟のマークは描いていません。"
      : "A judogi: jacket, trousers and belt. No maker or federation marks.",
  };
}

function defaultTitle(language: "en" | "ja", colour: JudogiColour, mode: JudogiMode, view: JudogiView): string {
  if (language === "ja") {
    const c = colour === "blue" ? "青" : "白";
    const m = { pieces: "上衣とズボン", suit: "着用", jacket: "上衣", pants: "ズボン", belt: "帯" }[mode];
    const v = { front: "前", back: "後ろ", flat: "平置き" }[view];
    return `${c}の柔道着、${m}、${v}`;
  }
  const c = colour === "blue" ? "Blue" : "White";
  const m = { pieces: "jacket and trousers", suit: "suit", jacket: "jacket", pants: "trousers", belt: "belt" }[mode];
  return `${c} judogi, ${m}, ${view}`;
}

interface BeltPaint { fill: string; edge: string; defs: string }

function beltPaint(o: Ready): BeltPaint {
  if (o.belt === "none") return { fill: "", edge: "", defs: "" };
  if (o.belt === "red-white") {
    const id = `${o.uid}kohaku`;
    return {
      fill: `url(#${id})`,
      edge: hexOf(shade(BELT_RGB.red, -0.35)),
      defs: `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="${hexOf(BELT_RGB.white)}"/><rect width="5" height="10" fill="${hexOf(BELT_RGB.red)}"/></pattern>`,
    };
  }
  const rgb = BELT_RGB[o.belt];
  return { fill: hexOf(rgb), edge: hexOf(shade(rgb, -0.35)), defs: "" };
}

function inkOf(o: Ready, part: string, paint: BeltPaint): GiInk {
  return { uid: `${o.uid}${part}`, cloth: o.cloth, beltFill: paint.fill, beltEdge: paint.edge };
}

/** Front and back cloth wrapped on the jersey volume mesh. A back view starts half a turn round. */
function compose(o: Ready): Sheet {
  if (o.view === "flat") return flatSheet(o);
  const yaw = normalYaw(o.yaw + (o.view === "back" ? 180 : 0));
  const depth = Math.max(0.2, o.thickness / 12);
  const paint = beltPaint(o);
  const worn = o.mode === "suit";
  if (o.mode === "belt") {
    const ink = inkOf(o, "b", paint);
    const belt = volumeOf(`${o.uid}b`, beltDesc(depth), beltFace(ink, "front"), beltFace(ink, "back"), yaw);
    return box(paint.defs + belt.defs, belt.body, -8, -8, 216, 108, yaw);
  }
  const jacket = o.mode === "pants" ? undefined : volumeOf(`${o.uid}j`, jacketDesc(depth), jacketFace(inkOf(o, "j", paint), "front", worn), jacketFace(inkOf(o, "j", paint), "back", worn), yaw);
  const pants = o.mode === "jacket" ? undefined : volumeOf(`${o.uid}p`, pantsDesc(depth), pantsFace(inkOf(o, "p", paint), "front"), pantsFace(inkOf(o, "p", paint), "back"), yaw);
  if (jacket && !pants) return box(paint.defs + jacket.defs, jacket.body, -20, -16, 240, 236, yaw);
  if (pants && !jacket) return box(paint.defs + pants.defs, pants.body, -16, -8, 232, 272, yaw);
  if (worn && jacket && pants) return box(paint.defs + pants.defs + jacket.defs, `<g transform="translate(0 128)">${pants.body}</g>${jacket.body}`, -20, -16, 240, 412, yaw);
  return box(paint.defs + (jacket?.defs ?? "") + (pants?.defs ?? ""), `${jacket?.body ?? ""}<g transform="translate(228 6)">${pants?.body ?? ""}</g>`, -20, -16, 470, 286, yaw);
}

function flatSheet(o: Ready): Sheet {
  const paint = beltPaint(o);
  const inkJ = inkOf(o, "j", paint);
  const inkP = inkOf(o, "p", paint);
  if (o.mode === "jacket") {
    const j = jacketFace(inkJ, "front", false);
    return box(j.defs, j.body, 0, 0, 200, 220, 0);
  }
  if (o.mode === "pants") {
    const p = pantsFace(inkP, "front");
    return box(p.defs, p.body, 0, 0, 200, 270, 0);
  }
  if (o.mode === "belt") {
    const b = beltFace(inkOf(o, "b", paint), "front");
    return box(paint.defs + b.defs, b.body, 0, 0, 200, 100, 0);
  }
  const worn = o.mode === "suit";
  const j = jacketFace(inkJ, "front", worn && o.belt !== "none");
  const p = pantsFace(inkP, "front");
  if (worn) return box(paint.defs + j.defs + p.defs, `<g transform="translate(0 124)">${p.body}</g>${j.body}`, -8, -8, 216, 400, 0);
  const laid = o.belt === "none" ? undefined : beltFace(inkOf(o, "b", paint), "front");
  const flat = flatFaces(j, p, laid);
  return box(paint.defs + flat.defs, flat.body, -8, -8, 430, laid ? 320 : 276, 0);
}

function volumeOf(uid: string, desc: VolumeDesc, front: Face, back: Face, yaw: number): { defs: string; body: string } {
  const mk = volumeMarkup(desc, uid, `${uid}F`, `${uid}B`, `${uid}Fc`, `${uid}Bc`, yaw, true);
  const defs = `${front.defs}${back.defs}<clipPath id="${uid}Fc"><path d="${front.clip}"/></clipPath><clipPath id="${uid}Bc"><path d="${back.clip}"/></clipPath><g id="${uid}F">${front.body}</g><g id="${uid}B">${back.body}</g>${mk.defs}`;
  return { defs, body: mk.body };
}

function box(defs: string, body: string, x: number, y: number, w: number, h: number, yaw: number): Sheet {
  return { defs, body, x, y, w, h, yaw };
}

function normalYaw(yaw: unknown): number {
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return 0;
  const t = ((((yaw + 180) % 360) + 360) % 360) - 180;
  return Object.is(t, -0) ? 0 : t;
}

