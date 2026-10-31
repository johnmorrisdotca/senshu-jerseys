// Embroidery, manufacturer logos and the national emblem, each in the places the rules name and no others, drawn as thread on the cloth's own faces so
// that they turn with the pieces. Places, sizes and the one-per-place rules cite the IJF Judogi Rules (09 03 2022: a name may stand at the bottom of the
// jacket, the top of the trousers and one end of the belt, its letters at most 4 cm high and 20 cm long, one text a place; one manufacturer's logo a
// garment, at most 30 cm2 on the jacket and the trousers and 9 cm2 on the belt, in the named spots; the national emblem on the left chest, at most
// 100 cm2; advertising spaces on the sleeves, 10 by 10 cm, and the shoulders, 25 by 5 cm) and the All Japan Judo Federation's marking rules as a
// retailer's chart states them (the left chest 24 by 18 cm and about 180 cm2, the upper arm 10 by 15 cm and about 80 cm2, a name or affiliation on a
// lapel hem, a belt end or the trousers' top at most about 20 cm long, a maker's mark 20 cm2). The rules' pictures and wording are not copied. The package
// ships neutral placeholders only: no maker's, federation's or nation's mark, with one exception, the Kodokan's emblem (`emblem.mark: "kodokan"`, drawn in
// judogiKodokan.ts; John's choice, its trademark status unchecked). Original drawing.

import { clean, esc, graphemes, hashOf, lum, type Rgb } from "./colour.ts";
import type { Mark } from "./judogiCloth.ts";
import { HEM_X } from "./judogiCollar.ts";
import { EMBLEM_ROOM, jacketSpots } from "./judogiJacket.ts";
import { kodokanEmblemSvg } from "./judogiKodokan.ts";
import { neckLabel, readBranding, sizeTag, sLogo, type ReadBranding } from "./judogiBrand.ts";
import { LABEL_ASPECT, labelMark, readLabel, type JudogiLabel, type ReadLabel } from "./judogiLabel.ts";
import { cloth, patchEdge, PATCH_MM } from "./judogiPatch.ts";
import { pantsSpots } from "./judogiPants.ts";
import type { EmbroideryStitching } from "./beltSpecs.ts";
import { readThread, satinDefs, satinRun, satinShape, satinStroke, type ThreadColour } from "./judogiThread.ts";
import { n2 } from "./path.ts";
import { layout } from "./text.ts";
import { areasFor, CM, obstaclesFor, pack, type Area, type Item, type Obstacle, type Placed, type Skipped } from "./judogiPlaces.ts";
import { END_LENGTH, type ReadStyle } from "./judogiStripes.ts";
import { onLeg } from "./judogiPants.ts";

export const EMBROIDERY_PLACES = [
  "jacket-hem", "jacket-chest", "sleeve-left", "sleeve-right", "shoulder-left", "shoulder-right",
  "belt-end-left", "belt-end-right", "pants-left", "pants-right", "pants-thigh-left", "pants-thigh-right",
] as const;
export type EmbroideryPlace = (typeof EMBROIDERY_PLACES)[number];

export const LOGO_PLACES = ["jacket-hem", "jacket-shoulder-left", "jacket-shoulder-right", "belt-end-left", "belt-end-right", "pants-waist-left", "pants-waist-right", "pants-thigh-left", "pants-thigh-right", "pants-leg-left", "pants-leg-right"] as const;
export type LogoPlace = (typeof LOGO_PLACES)[number];

export const EMBROIDERY_FONTS = ["block", "gothic", "kaisho", "gyosho", "cursive"] as const;
export type EmbroideryFontName = (typeof EMBROIDERY_FONTS)[number];
export interface EmbroideryFontFace {
  /** The family the text is set in. */
  family: string;
  /** Optional `@font-face` rules with `data:` sources, put inside the drawing so a saved SVG and the canvas painter both have the font. */
  css?: string;
}

export const MARK_RULES = ["ijf", "ajjf"] as const;
export type MarkRules = (typeof MARK_RULES)[number];

export type EmbroideryDirection = "across" | "down" | "along";

export interface JudogiEmbroidery {
  place: EmbroideryPlace;
  /** What is stitched, in Latin or Japanese. */
  text?: string;
  /** Or outlines a person made from a font: a filled path in its own units and its size, set as thread (`textPath`-style). Used when `text` is empty. */
  path?: { d: string; width: number; height: number };
  /** A thread preset or `#rrggbb`. */
  thread?: ThreadColour | string;
  /** `block` is the package's own strokes; the others are system fonts, or `{ family, css }` for one you pass. */
  font?: EmbroideryFontName | EmbroideryFontFace;
  weight?: "regular" | "bold" | "black";
  direction?: EmbroideryDirection;
  /** Letter height and the most the text may run to, in centimetres; each has the place's own value when not given. */
  heightCm?: number;
  lengthCm?: number;
  /** Thread the colour of the cloth (white on white, blue on blue), seen only by its sheen and relief, as a maker's tonal logo is. `thread` is then ignored. */
  tonal?: boolean;
  /** `applied` (the default) is sewn on afterwards: raised, and reversed on the other face; `integrated` is worked in as the belt or cloth is made: flatter, with nothing on the other face. Both work on every garment; a maker may offer one only on some. */
  stitching?: EmbroideryStitching;
}

export interface JudogiLogo {
  place: LogoPlace;
  /** Artwork as SVG text (or a `data:image/` address in `href`); without either, a neutral placeholder is drawn. */
  svg?: string;
  href?: string;
  thread?: ThreadColour | string;
  widthCm?: number;
  heightCm?: number;
  /** Thread the colour of the cloth, for the placeholder (artwork you give is drawn as it is). */
  tonal?: boolean;
}

export type { JudogiLabel };

export interface JudogiEmblem {
  /** The national emblem on the left chest: SVG text (a flag from Hata, say) or a `data:image/` address; a neutral placeholder without either. */
  svg?: string;
  href?: string;
  /** A ready-made mark the package draws itself: `"kodokan"`, the Kodokan's emblem (a white flower of sixteen petals round a red disc), when `svg` and `href` are not given. It is sewn on with no patch border unless `frame: "patch"` is asked for. */
  mark?: "kodokan";
  /**
   * How it is sewn on. `"patch"` (the default): the artwork fills the patch edge to edge with only a thin merrowed (overlock) edge, 1.7 mm of thread that takes the
   * colours of the artwork's own edge, as a flag patch is made; a placeholder, which has no flag, is a white patch with the star in it. `"bordered"`: a white patch with a
   * stitched border and a margin of cloth round the artwork. `"none"`: the artwork alone.
   */
  frame?: "patch" | "bordered" | "none";
  thread?: ThreadColour | string;
  widthCm?: number;
  heightCm?: number;
  /** Where it is sewn: the left `chest` (the default), the right chest (`chest-right`, where an ITF dobok's flag goes), or the outer upper arm just under the shoulder seam of the wearer's `sleeve-left` or `sleeve-right` (a flag patch on the shoulder), turned with the sleeve. */
  place?: "chest" | "chest-right" | "sleeve-left" | "sleeve-right";
  /** A word under the artwork, in thread: the country's name ("CANADA"), or with `style: "square"` a word in script ("Nippon"). Up to 16 characters. */
  caption?: string;
  /** `flag` (the default): the artwork alone, in a patch with a stitched border. `named`: the artwork with the caption under it (the default when a caption is given). `square`: a white woven square with the artwork above a caption in script, thread gold by default. */
  style?: "flag" | "named" | "square";
}

/** The system-font stacks. Open fonts named first are suggestions the page may load; the rest are what a computer has. */
export const FONT_STACKS: Record<Exclude<EmbroideryFontName, "block">, string> = {
  gothic: "'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic','Nanum Gothic',system-ui,sans-serif",
  kaisho: "'Yuji Syuku','Klee One','Klee','UD Digi Kyokasho NK-R','HGKyokashotai','Kaiti SC','Hiragino Mincho ProN','Yu Mincho','Apple SD Gothic Neo','Nanum Myeongjo','Noto Serif KR','Batang',serif",
  gyosho: "'Yuji Mai','Yuji Boku','Zen Kurenaido','Hiragino Mincho ProN','Yu Mincho','Apple SD Gothic Neo','Nanum Myeongjo','Noto Serif KR','Batang',serif",
  cursive: "'Snell Roundhand','Apple Chancery','Segoe Script','Brush Script MT',cursive",
};

interface Limit {
  len: number;
  h: number;
  area?: number;
}

interface PlaceFact {
  piece: "jacket" | "pants" | "belt";
  dir: EmbroideryDirection;
  /** The rules' limits (null: the rules do not name this place for a text) and the size drawn when none is asked for. */
  ijf: Limit | null;
  ajjf: Limit | null;
  len: number;
  h: number;
}

const PLACE_FACTS: Record<EmbroideryPlace, PlaceFact> = {
  "jacket-hem": { piece: "jacket", dir: "along", ijf: { len: 20, h: 4 }, ajjf: { len: 20, h: 4 }, len: 20, h: 3.5 },
  "jacket-chest": { piece: "jacket", dir: "down", ijf: null, ajjf: { len: 24, h: 18, area: 180 }, len: 24, h: 4.5 },
  "sleeve-left": { piece: "jacket", dir: "along", ijf: { len: 10, h: 10, area: 100 }, ajjf: { len: 15, h: 10, area: 80 }, len: 10, h: 3.5 },
  "sleeve-right": { piece: "jacket", dir: "along", ijf: { len: 10, h: 10, area: 100 }, ajjf: { len: 15, h: 10, area: 80 }, len: 10, h: 3.5 },
  "shoulder-left": { piece: "jacket", dir: "along", ijf: { len: 25, h: 5, area: 125 }, ajjf: null, len: 22, h: 3.5 },
  "shoulder-right": { piece: "jacket", dir: "along", ijf: { len: 25, h: 5, area: 125 }, ajjf: null, len: 22, h: 3.5 },
  "belt-end-left": { piece: "belt", dir: "along", ijf: { len: 20, h: 4 }, ajjf: { len: 20, h: 4 }, len: 20, h: 3 },
  "belt-end-right": { piece: "belt", dir: "along", ijf: { len: 20, h: 4 }, ajjf: { len: 20, h: 4 }, len: 20, h: 3 },
  "pants-left": { piece: "pants", dir: "along", ijf: { len: 20, h: 4 }, ajjf: { len: 20, h: 4 }, len: 20, h: 3.5 },
  "pants-right": { piece: "pants", dir: "along", ijf: { len: 20, h: 4 }, ajjf: { len: 20, h: 4 }, len: 20, h: 3.5 },
  // The upper front of the leg: a maker's tonal logo (KuSakura product photographs); neither rule names it for a text.
  "pants-thigh-left": { piece: "pants", dir: "across", ijf: null, ajjf: null, len: 14, h: 3.5 },
  "pants-thigh-right": { piece: "pants", dir: "across", ijf: null, ajjf: null, len: 14, h: 3.5 },
};

/** The most a manufacturer's logo may cover, in cm2, by the rules' named spots (the AJJF's maker mark is smaller than the IJF's on the jacket and trousers). */
const LOGO_AREA: Record<MarkRules, { jacket: number; pants: number; belt: number }> = {
  ijf: { jacket: 30, pants: 30, belt: 9 },
  ajjf: { jacket: 20, pants: 20, belt: 9 },
};
const EMBLEM_AREA = 100;
/** What the emblem is drawn at when no size is asked for: well inside the 100 cm2 limit (a sewn national emblem is a hand's width, not a chest plate), and no wider than the room between the lapel and the sleeve's head. */
const EMBLEM_DEFAULT_AREA = { image: 56, placeholder: 40 };
const EMBLEM_MAX = { w: 9.5, h: 7 };

const IJF = "IJF Judogi Rules, 09 03 2022";
const AJJF = "All Japan Judo Federation marking rules, as a retailer's chart states them";

export interface ReadEmbroidery {
  place: EmbroideryPlace;
  text: string;
  path: { d: string; width: number; height: number } | undefined;
  thread: { name: string; rgb: Rgb };
  font: EmbroideryFontName | EmbroideryFontFace;
  weight: "regular" | "bold" | "black";
  direction: EmbroideryDirection;
  heightCm: number;
  lengthCm: number;
  stitching: EmbroideryStitching;
  tonal: boolean;
}

export interface ReadLogo {
  place: LogoPlace;
  image: string | undefined;
  aspect: number;
  thread: { name: string; rgb: Rgb } | undefined;
  widthCm: number;
  heightCm: number;
  tonal: boolean;
  /** Put by the branding: the Senshu S unless artwork is given. */
  brand?: true;
}

export interface ReadEmblem {
  caption: string;
  style: "flag" | "named" | "square";
  place: "chest" | "chest-right" | "sleeve-left" | "sleeve-right";
  image: string | undefined;
  frame: "patch" | "bordered" | "none";
  /** The package's own round badge (the Kodokan's), not a flag. */
  badge: boolean;
  thread: { name: string; rgb: Rgb } | undefined;
  widthCm: number;
  heightCm: number;
}

export interface MarkSpec {
  rules: MarkRules;
  embroidery: ReadEmbroidery[];
  logos: ReadLogo[];
  emblem: ReadEmblem | undefined;
  label: ReadLabel | undefined;
  branding: ReadBranding | undefined;
  /** The neck label's own cloth and thread. */
  brandLabel: ReadLabel | undefined;
}

const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;

/** A font from outside: a preset, or `{ family, css }` with the family's name cleaned and the CSS only `@font-face` rules with data sources. */
function readFont(v: unknown): EmbroideryFontName | EmbroideryFontFace {
  if (typeof v === "string" && (EMBROIDERY_FONTS as readonly string[]).includes(v)) return v as EmbroideryFontName;
  if (v !== null && typeof v === "object") {
    const o = v as EmbroideryFontFace;
    const family = typeof o.family === "string" ? o.family.replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60) : "";
    if (family !== "") {
      const css = typeof o.css === "string" && o.css.length < 400_000 && /^\s*(@font-face\s*\{[^{}]*\}\s*)+$/.test(o.css) && !/url\(\s*(?!["']?data:)/i.test(o.css) && !/@import|expression|javascript:/i.test(o.css) ? o.css : undefined;
      return { family, ...(css === undefined ? {} : { css }) };
    }
  }
  return "block";
}

/** An image from outside: SVG text or a `data:image/` address, as the address an image element takes; `undefined` for neither. */
function readImage(svg: unknown, href: unknown): { src: string; aspect: number } | undefined {
  if (typeof svg === "string" && svg.length > 20 && svg.length < 400_000 && /<svg[\s>]/i.test(svg)) {
    const vb = /viewBox\s*=\s*["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)\s*["']/i.exec(svg);
    const aspect = vb === null ? 1 : Math.max(0.1, Math.min(10, Number(vb[1]) / Number(vb[2]) || 1));
    return { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, aspect };
  }
  if (typeof href === "string" && /^data:image\/(svg\+xml|png|jpeg|webp)[;,]/.test(href) && href.length < 800_000) return { src: href, aspect: 1 };
  return undefined;
}

/** The marks from outside, made safe. Only the places the rules name are taken, and only the first of each. */
export function readMarks(options: { embroidery?: unknown; logos?: unknown; emblem?: unknown; rules?: unknown; label?: unknown; branding?: unknown; size?: unknown }): MarkSpec | undefined {
  const rules: MarkRules = options.rules === "ajjf" ? "ajjf" : "ijf";
  const embroidery: ReadEmbroidery[] = [];
  const seen = new Set<string>();
  if (Array.isArray(options.embroidery)) {
    for (const raw of options.embroidery.slice(0, 20)) {
      if (raw === null || typeof raw !== "object") continue;
      const e = raw as JudogiEmbroidery;
      if (!(EMBROIDERY_PLACES as readonly string[]).includes(e.place) || seen.has(e.place)) continue;
      const text = clean(e.text, 24) ?? "";
      const p = e.path;
      const path = text === "" && p !== undefined && p !== null && typeof p.d === "string" && /^[MLHVCSQTAZmlhvcsqtaz0-9eE.,\s+-]+$/.test(p.d) && p.d.length < 60_000 && p.width > 0 && p.height > 0 ? { d: p.d, width: p.width, height: p.height } : undefined;
      if (text === "" && path === undefined) continue;
      const f = PLACE_FACTS[e.place];
      seen.add(e.place);
      embroidery.push({
        place: e.place,
        text,
        path,
        thread: readThread(e.thread, "navy"),
        font: readFont(e.font),
        weight: e.weight === "regular" || e.weight === "black" ? e.weight : "bold",
        direction: e.direction === "across" || e.direction === "down" || e.direction === "along" ? e.direction : f.dir,
        heightCm: num(e.heightCm, 0.5, 30, f.h),
        lengthCm: num(e.lengthCm, 1, 40, f.len),
        stitching: e.stitching === "integrated" ? "integrated" : "applied",
        tonal: e.tonal === true,
      });
    }
  }
  const logos: ReadLogo[] = [];
  const pieces = new Set<string>();
  if (Array.isArray(options.logos)) {
    for (const raw of options.logos.slice(0, 10)) {
      if (raw === null || typeof raw !== "object") continue;
      const l = raw as JudogiLogo;
      if (!(LOGO_PLACES as readonly string[]).includes(l.place)) continue;
      // One manufacturer's logo to a garment: the jacket's, the trousers' and the belt's.
      const piece = l.place.startsWith("pants") ? "pants" : l.place.startsWith("belt") ? "belt" : "jacket";
      if (pieces.has(piece)) continue;
      pieces.add(piece);
      const img = readImage(l.svg, l.href);
      const area = LOGO_AREA[rules][piece];
      const aspect = img?.aspect ?? 1;
      const h0 = Math.sqrt((area * 0.97) / aspect);
      logos.push({
        place: l.place,
        image: img?.src,
        aspect,
        thread: l.thread === undefined ? undefined : readThread(l.thread, "navy"),
        widthCm: num(l.widthCm, 0.5, 40, Math.round(h0 * aspect * 10) / 10),
        heightCm: num(l.heightCm, 0.5, 40, Math.round(h0 * 10) / 10),
        tonal: l.tonal === true,
      });
    }
  }
  // The branding's S goes wherever a maker's logo may, one to a garment, where the person has not put a logo of their own.
  const branding = readBranding(options.branding, typeof options.size === "string" ? options.size : "170");
  if (branding !== undefined && branding.logos) {
    const img = readImage(branding.logo?.svg, branding.logo?.href);
    const spot: Record<"jacket" | "pants" | "belt", LogoPlace> = {
      jacket: branding.spots.jacket === "hem" ? "jacket-hem" : (`jacket-${branding.spots.jacket}` as LogoPlace),
      pants: `pants-${branding.spots.pants === "leg-left" || branding.spots.pants === "leg-right" ? branding.spots.pants.replace("leg-", "leg-") : branding.spots.pants}` as LogoPlace,
      belt: branding.spots.belt === "right" ? "belt-end-right" : "belt-end-left",
    };
    for (const piece of ["jacket", "pants", "belt"] as const) {
      if (pieces.has(piece)) continue;
      pieces.add(piece);
      const aspect = img?.aspect ?? 1;
      const h0 = Math.sqrt((LOGO_AREA[rules][piece] * 0.97) / aspect);
      logos.push({
        place: spot[piece], image: img?.src, aspect, thread: branding.thread === undefined ? undefined : readThread(branding.thread, "gold"),
        widthCm: Math.round(h0 * aspect * 10) / 10, heightCm: Math.round(h0 * 10) / 10, tonal: false, brand: true,
      });
    }
  }
  let emblem: ReadEmblem | undefined;
  if (options.emblem !== null && typeof options.emblem === "object" && options.emblem !== undefined) {
    const e = options.emblem as JudogiEmblem;
    const mark = e.mark === "kodokan" ? "kodokan" : undefined;
    const img = readImage(e.svg, e.href) ?? (mark === "kodokan" ? readImage(kodokanEmblemSvg(), undefined) : undefined);
    const aspect = img?.aspect ?? 1;
    const area = img === undefined ? EMBLEM_DEFAULT_AREA.placeholder : EMBLEM_DEFAULT_AREA.image;
    const fit = Math.min(1, EMBLEM_MAX.w / (Math.sqrt(area * aspect)), EMBLEM_MAX.h / Math.sqrt(area / aspect));
    const h0 = Math.sqrt(area / aspect) * fit;
    const caption = clean(e.caption, 16) ?? "";
    emblem = {
      caption,
      style: e.style === "square" && caption !== "" ? "square" : caption !== "" ? "named" : "flag",
      place: e.place === "sleeve-left" || e.place === "sleeve-right" || e.place === "chest-right" ? e.place : "chest",
      image: img?.src,
      // The Kodokan's emblem is a round badge of its own, so it is sewn on without a patch border unless one is asked for.
      // The Kodokan's badge is round: a patch asked for round it is a bordered one, as a flag patch's edge to edge would show the corners of its box.
      badge: mark === "kodokan" && e.svg === undefined && e.href === undefined,
      frame: e.frame === "none" || (mark === "kodokan" && e.frame !== "patch" && e.frame !== "bordered" && e.svg === undefined && e.href === undefined) ? "none" : e.frame === "bordered" ? "bordered" : "patch",
      thread: e.thread === undefined ? undefined : readThread(e.thread, "navy"),
      widthCm: num(e.widthCm, 1, 40, Math.round(h0 * aspect * 10) / 10),
      heightCm: num(e.heightCm, 1, 40, Math.round(h0 * 10) / 10),
    };
  }
  // The approval label takes the brand's cloth and thread unless it is given its own.
  const inherit = (l: unknown): unknown => (l === true ? { colour: branding?.colour, thread: branding?.thread } : l !== null && typeof l === "object" ? { colour: branding?.colour, thread: branding?.thread, ...(l as object) } : l);
  const label = readLabel(inherit(options.label));
  const brandLabel = branding !== undefined && branding.neckLabel ? readLabel({ colour: branding.colour, thread: branding.thread }) : undefined;
  if (embroidery.length === 0 && logos.length === 0 && emblem === undefined && label === undefined && brandLabel === undefined) return undefined;
  return { rules, embroidery, logos, emblem, label, branding, brandLabel };
}

/** What the rules say of each mark asked for: met or not, with the source. A mark outside its limit is drawn at the limit, and reported here. */
export function markNotes(m: MarkSpec, skipped: readonly { item: Item; reason: string }[] = []): { id: string; met: boolean; fact: string }[] {
  const notes: { id: string; met: boolean; fact: string }[] = [];
  const src = m.rules === "ajjf" ? AJJF : IJF;
  for (const e of m.embroidery) {
    const f = PLACE_FACTS[e.place];
    const lim = f[m.rules];
    const listed = lim !== null;
    const within = listed && e.heightCm <= lim.h + 1e-6 && e.lengthCm <= lim.len + 1e-6;
    const fact = !listed
      ? `Text at the ${e.place.replace(/-/g, " ")} is not a place the ${m.rules === "ajjf" ? "All Japan Judo Federation" : "IJF"} rules name (${src}).`
      : `Text at the ${e.place.replace(/-/g, " ")} is at most ${lim.h} cm high and ${lim.len} cm long, one text to a place (${src}).`;
    notes.push({ id: `embroidery-${e.place}`, met: within, fact });
  }
  for (const l of m.logos) {
    const piece = l.place.startsWith("pants") ? "pants" : l.place.startsWith("belt") ? "belt" : "jacket";
    const max = LOGO_AREA[m.rules][piece];
    notes.push({ id: `logo-${piece}`, met: l.widthCm * l.heightCm <= max + 1e-6, fact: `One manufacturer's logo to a garment, at most ${max} cm2 on the ${piece} (${src}).` });
  }
  for (const l of m.logos) {
    if (l.place.startsWith("pants-thigh")) notes.push({ id: `logo-place-${l.place}`, met: false, fact: `A maker's logo on the upper front of the leg is a place makers sell (KuSakura product photographs); the ${m.rules === "ajjf" ? "All Japan Judo Federation" : "IJF"} rules do not name it (${src}).` });
  }
  for (const k of skipped) {
    notes.push({ id: `skipped-${k.item.id.replace(":", "-")}`, met: false, fact: `The ${k.item.kind === "brand" ? "brand's logo" : k.item.kind} at the ${k.item.place.replace(/-/g, " ")} is not drawn: ${k.reason}. The marks laid out first keep their places, and each mark keeps 1 cm clear of the next.` });
  }
  if (m.label !== undefined) {
    notes.push({ id: "label", met: true, fact: `The approval label goes on the bottom of the jacket on the front left near the reinforced edge, on the top front of the trousers close to the centre and at one of the two edges of the belt (${IJF}). This package's label is its own and certifies nothing.` });
  }
  if (m.emblem !== undefined) {
    notes.push({ id: "emblem", met: m.emblem.widthCm * m.emblem.heightCm <= EMBLEM_AREA + 1e-6, fact: `The national emblem is on the left chest, at most ${EMBLEM_AREA} cm2 (${IJF}).` });
  }
  return notes;
}

/** The place's own limits for what is drawn: the rules' where they name the place, else the place's own size. */
function limitOf(m: MarkSpec, place: EmbroideryPlace): { len: number; h: number } {
  const f = PLACE_FACTS[place];
  return f[m.rules] ?? { len: f.len, h: f.h };
}

/** What a mark's lettering needs once the drawing has its own ids and any font it carries. */
interface Out {
  defs: string;
  body: string;
}

const fontFamily = (f: EmbroideryFontName | EmbroideryFontFace): string => (typeof f === "string" ? (f === "block" ? FONT_STACKS.gothic : FONT_STACKS[f]) : `'${f.family}',${FONT_STACKS.gothic}`);

/** One embroidered text at a share `k` of its size: how big its box is, and how to draw it, centred on the origin and no larger than its place allows, in thread. */
function textPlan(m: MarkSpec, e: ReadEmbroidery, k: number): { w: number; h: number; render: (id: string, rgb: Rgb) => Out } {
  const lim = limitOf(m, e.place);
  const hU = Math.min(e.heightCm, lim.h) * CM * k;
  const sleeveAcross = (e.place === "sleeve-left" || e.place === "sleeve-right") && e.direction !== "along";
  const lU = Math.min(e.lengthCm, lim.len, sleeveAcross ? 7.5 : 99) * CM * k;
  const defsOf = (id: string, rgb: Rgb, unit = 1): string => satinDefs(`${id}S`, rgb, unit) + (typeof e.font === "object" && e.font.css !== undefined ? `<style>${e.font.css}</style>` : "");
  if (e.text === "") {
    const p = e.path as { d: string; width: number; height: number };
    const kk = +Math.min(hU / p.height, lU / p.width).toPrecision(4);
    return { w: p.width * kk, h: p.height * kk, render: (id, rgb) => ({ defs: defsOf(id, rgb, 1 / kk), body: satinShape(p.d, rgb, `${id}S`, `scale(${kk}) translate(${n2(-p.width / 2)} ${n2(-p.height / 2)})`, undefined, 1 / kk) }) };
  }
  const asText = e.font !== "block";
  const family = fontFamily(e.font);
  const weight = e.weight;
  const integrated = e.stitching === "integrated";
  if (e.direction === "down") {
    // A column: every character upright, one under the next, as a vertical Japanese line stands.
    const chars = graphemes(e.text).filter((c) => c !== " ");
    const step = Math.min(hU * 1.12, lU / Math.max(1, chars.length));
    const size = Math.min(hU, step / 1.05);
    const runs = chars.map((c, i) => layout(c, 0, (i - (chars.length - 1) / 2) * step, { height: size, maxWidth: size * 1.3, weight, asText }));
    const sw = Math.max(0, ...runs.map((r) => r.sw));
    return {
      w: Math.max(size, ...runs.map((r) => r.width)) + sw,
      h: (chars.length - 1) * step + size + sw,
      render: (id, rgb) => ({ defs: defsOf(id, rgb), body: runs.map((run) => satinRun(run, rgb, `${id}S`, family, undefined, e.text, integrated)).join("") }),
    };
  }
  const run = layout(e.text, 0, 0, { height: hU, maxWidth: lU, weight, asText });
  return { w: run.width + run.sw, h: run.height + run.sw, render: (id, rgb) => ({ defs: defsOf(id, rgb), body: satinRun(run, rgb, `${id}S`, family, undefined, undefined, integrated) }) };
}

/** A neutral placeholder logo: a diamond with a smaller one inside it, in thread. Nobody's mark. */
function placeholderLogo(rgb: Rgb, w: number, h: number): string {
  const r = Math.min(w, h) / 2 - 0.9;
  const sw = Math.max(0.9, r * 0.24);
  const diamond = (k: number): string => `M0 ${n2(-r * k)}L${n2(r * k)} 0L0 ${n2(r * k)}L${n2(-r * k)} 0Z`;
  return satinStroke(diamond(1), sw, rgb) + satinStroke(diamond(0.42), sw * 0.8, rgb);
}

/** A neutral placeholder emblem: a five-pointed star in a ring. */
function placeholderEmblem(rgb: Rgb, w: number, h: number): string {
  const r = Math.min(w, h) / 2 - 1.8;
  const ring = `M${n2(-r)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(2 * r)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-2 * r)} 0`;
  const R = r * 0.62;
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    return `${n2(R * Math.cos(a))} ${n2(R * Math.sin(a) + r * 0.04)}`;
  });
  return satinStroke(ring, Math.max(0.8, r * 0.12), rgb) + satinStroke(`M${pts.join("L")}Z`, Math.max(0.7, r * 0.1), rgb);
}

/** The width of a flag patch's merrowed edge: 1.7 mm (0.45 of a unit). */
export const MERROW = 0.45;

/**
 * A flag patch's edge, as sewn: the flag itself fills the patch to its edge, and round it runs the overlock stitching, 1.7 mm of thread across, in the colours of the
 * flag's own edge (the flag's picture again, a little larger, shows through a ring cut round the patch), darker where the thread is dense, and ribbed across.
 * `under` goes beneath the flag (the patch's hair of shadow on the cloth), `over` on top of it (the edge).
 */
function flagPatch(id: string, w: number, h: number, src: string): { defs: string; under: string; over: string } {
  const e = MERROW;
  const sx = (w + 2 * e) / w;
  const sy = (h + 2 * e) / h;
  const box = (g: number): string => `M${n2(-w / 2 + g)} ${n2(-h / 2 + g)}H${n2(w / 2 - g)}V${n2(h / 2 - g)}H${n2(-w / 2 + g)}Z`;
  const defs = `<clipPath id="${id}E"><path clip-rule="evenodd" d="${box(0)}${box(e)}"/></clipPath>`;
  const shadow = patchEdge(-w / 2, -h / 2, w, h, PATCH_MM.default, [230, 231, 228]);
  const ring = `<g clip-path="url(#${id}E)"><g transform="scale(${sx.toFixed(4)} ${sy.toFixed(4)})">${imageIn(src, w, h)}</g>` +
    `<path d="${box(0)}${box(e)}" fill-rule="evenodd" fill="#1a2230" fill-opacity="0.2"/>` +
    // The ribbing of the overlock: short stitches across the edge, and a lit hair along the outside.
    `<path d="${box(e / 2)}" fill="none" stroke="#10141c" stroke-opacity="0.38" stroke-width="${n2(e)}" stroke-dasharray="0.18 0.26"/>` +
    `<path d="${box(0.12)}" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="0.14"/></g>`;
  return { defs, under: shadow, over: ring };
}

/** A person's artwork in a box, drawn as an image so nothing in it can touch the page. */
const imageIn = (src: string, w: number, h: number): string =>
  `<image href="${esc(src)}" x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" preserveAspectRatio="xMidYMid meet"/>`;

const pieceOf = (place: string): "jacket" | "pants" | "belt" => (place.startsWith("pants") ? "pants" : place.startsWith("belt") ? "belt" : "jacket");

/** The logo's size at full scale: the size asked for and no larger than the rules' area. */
function logoSize(m: MarkSpec, l: ReadLogo): { w: number; h: number } {
  const area = LOGO_AREA[m.rules][pieceOf(l.place)] * CM * CM;
  const w = l.widthCm * CM;
  const h = l.heightCm * CM;
  if (w * h <= area) return { w, h };
  const k = Math.sqrt(area / (w * h));
  return { w: w * k, h: h * k };
}

/** The logo, centred on the origin, at a share `k` of its size. */
function logoOf(m: MarkSpec, l: ReadLogo, cloth: Rgb, id: string, k: number): Out {
  const piece = pieceOf(l.place);
  const full = logoSize(m, l);
  const w = full.w * k;
  const h = full.h * k;
  const rgb = l.tonal ? cloth : (l.thread?.rgb ?? (piece === "belt" ? readThread("gold", "gold").rgb : lum(cloth) > 0.4 ? readThread("navy", "navy").rgb : readThread("white", "white").rgb));
  if (l.image !== undefined) return { defs: "", body: imageIn(l.image, w, h) };
  if (l.brand === true) return sLogo(rgb, w, h, `${id}S`);
  return { defs: satinDefs(`${id}S`, rgb), body: placeholderLogo(rgb, w, h) };
}

/**
 * The emblem's box at full scale and where its parts lie in it, centred on the origin: the artwork (no larger than 100 cm2) and, with a caption, the word
 * under it (`named`) or a white square carrying both (`square`). The whole is held inside the room the chest has between the lapel and the sleeve's head
 * (or the sleeve's own width), so it never runs onto the sleeve or the lapel.
 */
function emblemBox(e: ReadEmblem): { w: number; h: number; art: { w: number; h: number; y: number }; cap?: { y: number; h: number; w: number } } {
  let aw = e.widthCm * CM;
  let ah = e.heightCm * CM;
  if (aw * ah > EMBLEM_AREA * CM * CM) {
    const k = Math.sqrt((EMBLEM_AREA * CM * CM) / (aw * ah));
    aw *= k;
    ah *= k;
  }
  let box: ReturnType<typeof emblemBox>;
  if (e.style === "named") {
    const capH = Math.min(ah * 0.26, 6.5);
    const gap = Math.min(ah * 0.14, 3);
    const h = ah + gap + capH;
    box = { w: aw, h, art: { w: aw, h: ah, y: -h / 2 + ah / 2 }, cap: { y: h / 2 - capH / 2, h: capH, w: aw * 0.94 } };
  } else if (e.style === "square") {
    const side = Math.max(aw * 1.3, (ah * 1.2) / 0.58);
    const fit = Math.min(1, ((side - 8) / aw), ((side * 0.58) / ah));
    box = { w: side, h: side, art: { w: aw * fit, h: ah * fit, y: -side / 2 + side * 0.08 + (ah * fit) / 2 }, cap: { y: side / 2 - side * 0.19, h: side * 0.17, w: side * 0.8 } };
  } else box = { w: aw, h: ah, art: { w: aw, h: ah, y: 0 } };
  const room = e.place === "chest" || e.place === "chest-right" ? Math.min(1, EMBLEM_ROOM.w / box.w, EMBLEM_ROOM.h / box.h) : Math.min(1, 22 / box.w, 22 / box.h);
  if (room === 1) return box;
  return { w: box.w * room, h: box.h * room, art: { w: box.art.w * room, h: box.art.h * room, y: box.art.y * room }, ...(box.cap === undefined ? {} : { cap: { y: box.cap.y * room, h: box.cap.h * room, w: box.cap.w * room } }) };
}

const emblemSize = (e: ReadEmblem): { w: number; h: number } => {
  const b = emblemBox(e);
  return { w: b.w, h: b.h };
};

/** The national emblem as a sewn patch with a stitched border (or a white square, or the artwork alone with its caption), centred on the origin, at a share `k` of its size. */
function emblemOf(e: ReadEmblem, clothRgb: Rgb, id: string, k: number): Out {
  const b = emblemBox(e);
  const w = b.w * k;
  const h = b.h * k;
  const aw = b.art.w * k;
  const ah = b.art.h * k;
  const ay = b.art.y * k;
  const script = e.style === "square";
  const rgb = e.thread?.rgb ?? (script ? readThread("gold", "gold").rgb : readThread("navy", "navy").rgb);
  const art = (inner: number): string => (e.image !== undefined ? `<g transform="translate(0 ${n2(ay)})">${imageIn(e.image, aw - inner, ah - inner)}</g>` : `<g transform="translate(0 ${n2(ay)})">${placeholderEmblem(rgb, aw, ah)}</g>`);
  const caption = (): string => {
    if (b.cap === undefined) return "";
    const run = layout(e.caption, 0, b.cap.y * k, { height: b.cap.h * k, maxWidth: b.cap.w * k, weight: "bold", tracking: script ? 0.2 : 0.6, asText: script });
    return satinRun(run, rgb, `${id}S`, script ? FONT_STACKS.cursive : FONT_STACKS.gothic, undefined, e.caption);
  };
  const thread = satinDefs(`${id}S`, rgb);
  const white: Rgb = e.image !== undefined || script ? [255, 255, 255] : lum(clothRgb) > 0.4 ? [252, 251, 248] : [236, 238, 242];
  if (script) {
    const patch = cloth(`${id}P`, -w / 2, -h / 2, w, h, [252, 251, 248], [120, 126, 140], { edge: "satin" });
    return { defs: patch.defs + thread, body: patch.under + art(0) + caption() + patch.over };
  }
  if (e.frame === "none") return { defs: thread, body: art(0) + caption() };
  // A flag patch: the flag edge to edge, with only a thin merrowed edge; a caption stands under it on the cloth.
  if (e.frame === "patch" && e.image !== undefined && !e.badge) {
    const flag = flagPatch(`${id}P`, aw, ah, e.image);
    return { defs: flag.defs + thread, body: `<g transform="translate(0 ${n2(ay)})">${flag.under}${imageIn(e.image, aw, ah)}${flag.over}</g>` + caption() };
  }
  // A patch with a stitched border round the artwork; a caption stands under it on the cloth.
  const patch = cloth(`${id}P`, -aw / 2, ay - ah / 2, aw, ah, white, [120, 126, 140], { edge: "satin" });
  return { defs: patch.defs + thread, body: patch.under + art(7 * k) + patch.over + caption() };
}

const at = (s: { x: number; y: number; rot?: number }, body: string): string => `<g transform="translate(${n2(s.x)} ${n2(s.y)})${s.rot ? ` rotate(${n2(s.rot)})` : ""}">${body}</g>`;

export interface MarkSet {
  jacket: { front?: Mark; back?: Mark; /** On the inside of the back panel, below the collar: the neck label and size tag, seen through the neck's opening. */ backInner?: Mark };
  /** What is stitched on the collar band's lapel hem, in the strip's own units: in the turning view the band hides the jacket's drawing there. */
  collar?: Mark;
  pants: { front?: Mark };
  /** The marks on the belt's two hanging ends, drawn in each end's own frame: along its length from the knot, across its width from the middle. */
  belt: { left?: Mark; right?: Mark };
  /** Where each mark went, and which were left out for want of room. */
  layout: MarkLayout;
}

/** A mark to place, with how to draw it at the share of its size it is given. */
export interface MarkItem extends Item {
  draw: (scale: number, id: string, cloth: Rgb) => Out;
  /** Which of the garment's faces (and which hanging belt end) it is sewn on. */
  target: "jacket-front" | "jacket-back" | "pants-front" | "belt-left" | "belt-right";
}

export interface MarkLayout {
  placed: Placed<MarkItem>[];
  skipped: Skipped<MarkItem>[];
  areas: Record<string, Area>;
  obstacles: Obstacle[];
}

const side = (place: string): 1 | -1 => (place.endsWith("left") ? 1 : -1);

/** Every mark of the spec as an item to place, in the order they claim room: the emblem, the logos, the embroidery, the label, then the branding's own S. */
function itemsOf(m: MarkSpec): MarkItem[] {
  const js = jacketSpots();
  const ps = pantsSpots();
  const items: MarkItem[] = [];
  if (m.emblem !== undefined) {
    const e = m.emblem;
    const { w, h } = emblemSize(e);
    const sw = e.place === "chest" || e.place === "chest-right" ? undefined : e.place.slice(7) as "left" | "right";
    const us = sw === undefined ? undefined : js.upperSleeve(sw);
    // The right chest is the left's mirror, on the panel that wraps over it.
    const chest: [number, number] = e.place === "chest-right" ? [200 - js.emblem.x, js.emblem.y] : [js.emblem.x, js.emblem.y];
    items.push({ id: "emblem", kind: "emblem", place: "emblem", area: sw === undefined ? (e.place === "chest-right" ? "chest-right" : "chest") : `sleeve-${sw}`, target: "jacket-front", w, h, rot: us?.rot ?? 0, pref: us === undefined ? chest : [us.x, us.y], minScale: 0.7, draw: (k, id, cloth) => emblemOf(e, cloth, id, k) });
  }
  const logoItem = (l: ReadLogo): MarkItem => {
    const { w, h } = logoSize(m, l);
    const place = l.place;
    const kind = l.brand === true ? "brand" : "logo";
    const common = { id: `${kind}:${place}`, kind, place, w, h, rot: 0, minScale: 0.6, draw: (k: number, id: string, cloth: Rgb): Out => logoOf(m, l, cloth, id, k) } as const;
    if (place === "jacket-hem") return { ...common, area: "hem-left", target: "jacket-front", pref: [136.6, 183] };
    if (place === "jacket-shoulder-left" || place === "jacket-shoulder-right") {
      // The outer upper arm under the shoulder seam, on the front, turned with the sleeve (never on the back, where an upright mark floated by the armhole).
      const w2 = place.endsWith("left") ? "left" : "right";
      const sp = js.upperSleeve(w2);
      return { ...common, rot: sp.rot, area: `sleeve-${w2}`, target: "jacket-front", pref: [sp.x, sp.y] };
    }
    if (place === "belt-end-left" || place === "belt-end-right") {
      const k = place.endsWith("left") ? "left" : "right";
      return { ...common, area: `belt-${k}`, target: `belt-${k}`, pref: [22, 0] };
    }
    const w2 = place.endsWith("left") ? "left" : "right";
    if (place.startsWith("pants-waist")) return { ...common, area: `waist-${w2}`, target: "pants-front", pref: [100 + side(place) * 21, 36] };
    if (place.startsWith("pants-thigh")) { const p = onLegAt(side(place), 0.105, 0.5); return { ...common, area: `thigh-${w2}`, target: "pants-front", pref: p }; }
    const leg = ps.leg(w2);
    return { ...common, area: `leg-${w2}`, target: "pants-front", pref: [leg.x, leg.y] };
  };
  for (const l of m.logos) items.push(logoItem(l));
  for (const e of m.embroidery) {
    const place = e.place;
    const w2 = place.endsWith("left") ? "left" : "right";
    const plan = (k: number): { w: number; h: number } => textPlan(m, e, k);
    const full = plan(1);
    const common = { id: `embroidery:${place}`, kind: "embroidery", place, w: full.w, h: full.h, size: plan, minScale: 0.5, draw: (k: number, id: string, cloth: Rgb): Out => textPlan(m, e, k).render(id, e.tonal ? cloth : e.thread.rgb) } as const;
    if (place === "jacket-hem") items.push({ ...common, area: "lapel-hem", target: "jacket-front", rot: e.direction === "down" ? js.lapelHem.rot - 90 : js.lapelHem.rot, pref: [js.lapelHem.x, js.lapelHem.y] });
    else if (place === "jacket-chest") items.push({ ...common, area: "chest", target: "jacket-front", rot: 0, pref: [js.chest.x, js.chest.y] });
    else if (place === "sleeve-left" || place === "sleeve-right") {
      const sp = js.sleeve(w2);
      items.push({ ...common, area: `sleeve-${w2}`, target: "jacket-front", rot: e.direction === "along" ? (sp.rot > 0 === (place === "sleeve-left") ? 75 : 105) : sp.rot, pref: [sp.x, sp.y] });
    } else if (place === "shoulder-left" || place === "shoulder-right") {
      const sp = js.shoulder(w2);
      items.push({ ...common, area: `shoulder-${w2}`, target: "jacket-back", rot: sp.rot, pref: [sp.x, sp.y] });
    } else if (place === "pants-left" || place === "pants-right") items.push({ ...common, area: `waist-${w2}`, target: "pants-front", rot: e.direction === "along" ? 90 : 0, pref: [100 + side(place) * 31, 49] });
    else if (place === "pants-thigh-left" || place === "pants-thigh-right") items.push({ ...common, area: `thigh-${w2}`, target: "pants-front", rot: e.direction === "along" ? 90 : 0, pref: onLegAt(side(place), 0.105, 0.5) });
    else items.push({ ...common, area: `belt-${w2}`, target: `belt-${w2}`, rot: 0, pref: [(END_LENGTH[w2 === "left" ? 0 : 1] as number) * 0.62, 0] });
  }
  if (m.label !== undefined) {
    const l = m.label;
    const label = (key: "jacket" | "pants" | "belt", w: number, area: string, target: MarkItem["target"], rot: number, pref: [number, number]): MarkItem => ({
      id: `label:${key}`, kind: "label", place: key, area, target, w, h: w / LABEL_ASPECT, rot, pref, minScale: 0.7, draw: (k, id) => labelMark(id, l, w * k),
    });
    // On the jacket at the bottom front on the wearer's left, on the trousers under the waistband near the middle, and on the belt's left end near the knot, turned to read across the belt.
    items.push(label("jacket", 12.5, "hem-left", "jacket-front", 0, [136.6, 152]), label("pants", 9, "waist-left", "pants-front", 0, [118.5, 30]), label("belt", 7.6, "belt-left", "belt-left", -90, [16, 0]));
  }
  const order = (i: MarkItem): number => ({ emblem: 0, logo: 1, embroidery: 2, label: 3, brand: 4 })[i.kind];
  return items.sort((a, b) => order(a) - order(b));
}

/** The offset between the wearer's left or right leg's own coordinates and the picture's. */
function onLegAt(sd: 1 | -1, f: number, u: number): [number, number] {
  const [x, y] = onLeg(sd, f, u);
  return [x, y];
}

/** Where every mark goes: each at its preferred spot, or moved (and made smaller down to 60 per cent) to the nearest free place in its area; left out when there is none. */
export function layoutMarks(m: MarkSpec, beltWidthU: number, style?: ReadStyle): MarkLayout {
  // The same marks are laid out again at every angle of a turn, so the answer is kept (it is a pure function of its inputs).
  const key = JSON.stringify([m, beltWidthU, style]);
  const kept = LAYOUTS.get(key);
  if (kept !== undefined) return kept;
  const made = layoutNow(m, beltWidthU, style);
  if (LAYOUTS.size >= 48) LAYOUTS.delete(LAYOUTS.keys().next().value as string);
  LAYOUTS.set(key, made);
  return made;
}

const LAYOUTS = new Map<string, MarkLayout>();

function layoutNow(m: MarkSpec, beltWidthU: number, style?: ReadStyle): MarkLayout {
  const js = jacketSpots();
  const areas = areasFor(beltWidthU / 2, js.lapelHem);
  const obstacles = obstaclesFor(beltWidthU / 2, style, m.branding !== undefined && m.brandLabel !== undefined);
  const { placed, skipped } = pack(itemsOf(m), areas, obstacles);
  return { placed, skipped, areas, obstacles };
}

/** The marks of one drawing, each on its face. `cloth` is the cloth's colour, which picks the thread of a placeholder. */
export function buildMarks(uid: string, m: MarkSpec, clothRgb: Rgb, beltWidthU: number, style?: ReadStyle): MarkSet {
  const layoutOfMarks = layoutMarks(m, beltWidthU, style);
  const set: MarkSet = { jacket: {}, pants: {}, belt: {}, layout: layoutOfMarks };
  const add = (target: Mark | undefined, o: Out, body: string): Mark => ({ defs: (target?.defs ?? "") + o.defs, body: (target?.body ?? "") + body });
  const js = jacketSpots();
  const id = (k: string): string => `${uid}${k}${hashOf(JSON.stringify(m))}`;
  layoutOfMarks.placed.forEach((p, i) => {
    const it = p.item;
    const o = it.draw(p.scale, id(`${it.kind[0]}${i}`), clothRgb);
    const body = at(p.box, o.body);
    switch (it.target) {
      case "jacket-front": set.jacket.front = add(set.jacket.front, o, body); break;
      case "jacket-back": set.jacket.back = add(set.jacket.back, o, body); break;
      case "pants-front": set.pants.front = add(set.pants.front, o, body); break;
      case "belt-left": set.belt.left = add(set.belt.left, o, body); break;
      case "belt-right": set.belt.right = add(set.belt.right, o, body); break;
    }
    // On the collar band itself the lapel's text runs up the strip from the hem, so it is turned half round to read downward.
    if (it.kind === "embroidery" && it.place === "jacket-hem") set.collar = add(set.collar, o, at({ x: HEM_X + js.lapelRun.run, y: js.lapelRun.w / 2, rot: 180 }, o.body));
  });
  if (m.branding !== undefined && m.brandLabel !== undefined) {
    // Inside the back of the neck, seen through the opening of the jacket below the collar: the neck label, and the size tag sewn under it.
    const nl = neckLabel(id("Bn"), m.branding, m.brandLabel, 11);
    const tag = sizeTag(id("Bt"), m.branding.sizeTag, m.brandLabel, 4.6);
    set.jacket.backInner = add(add(set.jacket.backInner, nl, at({ x: 100, y: 25 }, nl.body)), tag, at({ x: 100, y: 33.6 }, tag.body));
  }
  return set;
}
