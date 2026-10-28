// Embroidery, manufacturer logos and the national emblem, each in the places the rules name and no others, drawn as thread on the cloth's own faces so
// that they turn with the pieces. Places, sizes and the one-per-place rules cite the IJF Judogi Rules (09 03 2022: a name may stand at the bottom of the
// jacket, the top of the trousers and one end of the belt, its letters at most 4 cm high and 20 cm long, one text a place; one manufacturer's logo a
// garment, at most 30 cm2 on the jacket and the trousers and 9 cm2 on the belt, in the named spots; the national emblem on the left chest, at most
// 100 cm2; advertising spaces on the sleeves, 10 by 10 cm, and the shoulders, 25 by 5 cm) and the All Japan Judo Federation's marking rules as a
// retailer's chart states them (the left chest 24 by 18 cm and about 180 cm2, the upper arm 10 by 15 cm and about 80 cm2, a name or affiliation on a
// lapel hem, a belt end or the trousers' top at most about 20 cm long, a maker's mark 20 cm2). The rules' pictures and wording are not copied. The package
// ships neutral placeholders only: no maker's, federation's or nation's mark. Original drawing.

import { clean, esc, graphemes, hashOf, lum, type Rgb } from "./colour.ts";
import type { Mark } from "./judogiCloth.ts";
import { HEM_X } from "./judogiCollar.ts";
import { EMBLEM_ROOM, jacketSpots } from "./judogiJacket.ts";
import { neckLabel, readBranding, sizeTag, sLogo, type ReadBranding } from "./judogiBrand.ts";
import { labelMark, readLabel, type JudogiLabel, type ReadLabel } from "./judogiLabel.ts";
import { CM, cloth } from "./judogiPatch.ts";
import { pantsSpots } from "./judogiPants.ts";
import type { EmbroideryStitching } from "./beltSpecs.ts";
import { readThread, satinDefs, satinRun, satinShape, satinStroke, type ThreadColour } from "./judogiThread.ts";
import { n2 } from "./path.ts";
import { layout } from "./text.ts";

export const EMBROIDERY_PLACES = [
  "jacket-hem", "jacket-chest", "sleeve-left", "sleeve-right", "shoulder-left", "shoulder-right",
  "belt-end-left", "belt-end-right", "pants-left", "pants-right",
] as const;
export type EmbroideryPlace = (typeof EMBROIDERY_PLACES)[number];

export const LOGO_PLACES = ["jacket-hem", "jacket-shoulder-left", "jacket-shoulder-right", "belt-end-left", "belt-end-right", "pants-waist-left", "pants-waist-right", "pants-leg-left", "pants-leg-right"] as const;
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
}

export type { JudogiLabel };

export interface JudogiEmblem {
  /** The national emblem on the left chest: SVG text (a flag from Hata, say) or a `data:image/` address; a neutral placeholder without either. */
  svg?: string;
  href?: string;
  /** Sewn on as a patch with a stitched border (the default), or the artwork alone. */
  frame?: "patch" | "none";
  thread?: ThreadColour | string;
  widthCm?: number;
  heightCm?: number;
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
}

export interface ReadLogo {
  place: LogoPlace;
  image: string | undefined;
  aspect: number;
  thread: { name: string; rgb: Rgb } | undefined;
  widthCm: number;
  heightCm: number;
  /** Put by the branding: the Senshu S unless artwork is given. */
  brand?: true;
}

export interface ReadEmblem {
  image: string | undefined;
  frame: "patch" | "none";
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
        widthCm: Math.round(h0 * aspect * 10) / 10, heightCm: Math.round(h0 * 10) / 10, brand: true,
      });
    }
  }
  let emblem: ReadEmblem | undefined;
  if (options.emblem !== null && typeof options.emblem === "object" && options.emblem !== undefined) {
    const e = options.emblem as JudogiEmblem;
    const img = readImage(e.svg, e.href);
    const aspect = img?.aspect ?? 1;
    const area = img === undefined ? EMBLEM_DEFAULT_AREA.placeholder : EMBLEM_DEFAULT_AREA.image;
    const fit = Math.min(1, EMBLEM_MAX.w / (Math.sqrt(area * aspect)), EMBLEM_MAX.h / Math.sqrt(area / aspect));
    const h0 = Math.sqrt(area / aspect) * fit;
    emblem = {
      image: img?.src,
      frame: e.frame === "none" ? "none" : "patch",
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
export function markNotes(m: MarkSpec): { id: string; met: boolean; fact: string }[] {
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

/** One embroidered text, centred on the origin and no larger than its place allows, in thread. */
function textOf(m: MarkSpec, e: ReadEmbroidery, id: string): Out {
  const lim = limitOf(m, e.place);
  const hU = Math.min(e.heightCm, lim.h) * CM;
  const sleeveAcross = (e.place === "sleeve-left" || e.place === "sleeve-right") && e.direction !== "along";
  const lU = Math.min(e.lengthCm, lim.len, sleeveAcross ? 7.5 : 99) * CM;
  const rgb = e.thread.rgb;
  const defs = satinDefs(`${id}S`, rgb) + (typeof e.font === "object" && e.font.css !== undefined ? `<style>${e.font.css}</style>` : "");
  if (e.text === "") {
    const p = e.path as { d: string; width: number; height: number };
    const k = Math.min(hU / p.height, lU / p.width);
    return { defs, body: satinShape(p.d, rgb, `${id}S`, `scale(${n2(k)}) translate(${n2(-p.width / 2)} ${n2(-p.height / 2)})`) };
  }
  const asText = e.font !== "block";
  const family = fontFamily(e.font);
  const weight = e.weight;
  if (e.direction === "down") {
    // A column: every character upright, one under the next, as a vertical Japanese line stands.
    const chars = graphemes(e.text).filter((c) => c !== " ");
    const step = Math.min(hU * 1.12, lU / Math.max(1, chars.length));
    const size = Math.min(hU, step / 1.05);
    let body = "";
    chars.forEach((c, i) => {
      const run = layout(c, 0, (i - (chars.length - 1) / 2) * step, { height: size, maxWidth: size * 1.3, weight, asText });
      body += satinRun(run, rgb, `${id}S`, family, undefined, e.text, e.stitching === "integrated");
    });
    return { defs, body };
  }
  const run = layout(e.text, 0, 0, { height: hU, maxWidth: lU, weight, asText });
  return { defs, body: satinRun(run, rgb, `${id}S`, family, undefined, undefined, e.stitching === "integrated") };
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

/** A person's artwork in a box, drawn as an image so nothing in it can touch the page. */
const imageIn = (src: string, w: number, h: number): string =>
  `<image href="${esc(src)}" x="${n2(-w / 2)}" y="${n2(-h / 2)}" width="${n2(w)}" height="${n2(h)}" preserveAspectRatio="xMidYMid meet"/>`;

/** The logo, centred on the origin, at the size asked for and no larger than the rules' area. */
function logoOf(m: MarkSpec, l: ReadLogo, cloth: Rgb, id: string): Out {
  const piece = l.place.startsWith("pants") ? "pants" : l.place.startsWith("belt") ? "belt" : "jacket";
  const area = LOGO_AREA[m.rules][piece] * CM * CM;
  let w = l.widthCm * CM;
  let h = l.heightCm * CM;
  if (w * h > area) {
    const k = Math.sqrt(area / (w * h));
    w *= k;
    h *= k;
  }
  const rgb = l.thread?.rgb ?? (piece === "belt" ? readThread("gold", "gold").rgb : lum(cloth) > 0.4 ? readThread("navy", "navy").rgb : readThread("white", "white").rgb);
  if (l.image !== undefined) return { defs: "", body: imageIn(l.image, w, h) };
  if (l.brand === true) return sLogo(rgb, w, h, `${id}S`);
  return { defs: satinDefs(`${id}S`, rgb), body: placeholderLogo(rgb, w, h) };
}

/** The national emblem as a sewn patch with a stitched border, centred on the origin, no larger than 100 cm2. */
function emblemOf(e: ReadEmblem, clothRgb: Rgb, id: string): Out {
  let w = e.widthCm * CM;
  let h = e.heightCm * CM;
  if (w * h > EMBLEM_AREA * CM * CM) {
    const k = Math.sqrt((EMBLEM_AREA * CM * CM) / (w * h));
    w *= k;
    h *= k;
  }
  // And inside the room the chest has between the lapel and the sleeve's head, so it never runs onto the sleeve.
  const room = Math.min(1, EMBLEM_ROOM.w / w, EMBLEM_ROOM.h / h);
  w *= room;
  h *= room;
  const rgb = e.thread?.rgb ?? readThread("navy", "navy").rgb;
  if (e.frame === "none") return e.image !== undefined ? { defs: "", body: imageIn(e.image, w, h) } : { defs: satinDefs(`${id}S`, rgb), body: placeholderEmblem(rgb, w, h) };
  const patch = cloth(`${id}P`, -w / 2, -h / 2, w, h, e.image !== undefined ? [255, 255, 255] : lum(clothRgb) > 0.4 ? [252, 251, 248] : [236, 238, 242], [120, 126, 140]);
  const inner = e.image !== undefined ? imageIn(e.image, w - 7, h - 7) : placeholderEmblem(rgb, w, h);
  return { defs: patch.defs + satinDefs(`${id}S`, rgb), body: patch.under + inner + patch.over };
}

const at = (s: { x: number; y: number; rot?: number }, body: string): string => `<g transform="translate(${n2(s.x)} ${n2(s.y)})${s.rot ? ` rotate(${n2(s.rot)})` : ""}">${body}</g>`;

export interface MarkSet {
  jacket: { front?: Mark; back?: Mark };
  /** What is stitched on the collar band's lapel hem, in the strip's own units: in the turning view the band hides the jacket's drawing there. */
  collar?: Mark;
  pants: { front?: Mark };
  /** The marks on the belt's two hanging ends, drawn in each end's own frame: along its length from the knot, across its width from the middle. */
  belt: { left?: Mark; right?: Mark };
}

/** The marks of one drawing, each on its face. `cloth` is the cloth's colour, which picks the thread of a placeholder. */
export function buildMarks(uid: string, m: MarkSpec, clothRgb: Rgb, beltLen: number): MarkSet {
  const set: MarkSet = { jacket: {}, pants: {}, belt: {} };
  const add = (target: Mark | undefined, o: Out, body: string): Mark => ({ defs: (target?.defs ?? "") + o.defs, body: (target?.body ?? "") + body });
  const js = jacketSpots();
  const ps = pantsSpots();
  const id = (k: string): string => `${uid}${k}${hashOf(JSON.stringify(m))}`;
  m.embroidery.forEach((e, i) => {
    const o = textOf(m, e, id(`e${i}`));
    switch (e.place) {
      case "jacket-hem": {
        set.jacket.front = add(set.jacket.front, o, at(js.lapelHem, o.body));
        // On the band itself the text runs up the strip from the hem, so it is turned half round to read downward.
        set.collar = add(set.collar, o, at({ x: HEM_X + js.lapelRun.run, y: js.lapelRun.w / 2, rot: 180 }, o.body));
        break;
      }
      case "jacket-chest": set.jacket.front = add(set.jacket.front, o, at(js.chest, o.body)); break;
      case "sleeve-left": case "sleeve-right": {
        // Down the sleeve (its own direction), or across it; the sleeve is a band some 8 cm wide, so a line across is held to that.
        const sp = js.sleeve(e.place === "sleeve-left" ? "left" : "right");
        set.jacket.front = add(set.jacket.front, o, at(e.direction === "along" ? { ...sp, rot: sp.rot > 0 === (e.place === "sleeve-left") ? 75 : 105 } : sp, o.body));
        break;
      }
      case "shoulder-left": case "shoulder-right": set.jacket.back = add(set.jacket.back, o, at(js.shoulder(e.place === "shoulder-left" ? "left" : "right"), o.body)); break;
      case "pants-left": case "pants-right": {
        const s = ps.waist(e.place === "pants-left" ? "left" : "right");
        // Down the front beside the waistband (reading downward), as a name stands on the trousers' top in the rules' pictures.
        set.pants.front = add(set.pants.front, o, at({ x: s.x, y: s.y + 20, rot: e.direction === "along" ? 90 : 0 }, o.body));
        break;
      }
      case "belt-end-left": case "belt-end-right": {
        const key = e.place === "belt-end-left" ? "left" : "right";
        set.belt[key] = add(set.belt[key], o, at({ x: beltLen * 0.66, y: 0 }, o.body));
        break;
      }
    }
  });
  m.logos.forEach((l, i) => {
    const o = logoOf(m, l, clothRgb, id(`l${i}`));
    switch (l.place) {
      case "jacket-hem": set.jacket.front = add(set.jacket.front, o, at(js.hemLogo, o.body)); break;
      case "jacket-shoulder-left": case "jacket-shoulder-right": set.jacket.back = add(set.jacket.back, o, at({ ...js.shoulder(l.place === "jacket-shoulder-left" ? "left" : "right"), rot: 0 }, o.body)); break;
      case "pants-waist-left": case "pants-waist-right": {
        const s = ps.waist(l.place === "pants-waist-left" ? "left" : "right");
        set.pants.front = add(set.pants.front, o, at({ x: s.x + (l.place === "pants-waist-left" ? 6 : -6), y: s.y - 2 }, o.body));
        break;
      }
      case "pants-leg-left": case "pants-leg-right": set.pants.front = add(set.pants.front, o, at(ps.leg(l.place === "pants-leg-left" ? "left" : "right"), o.body)); break;
      case "belt-end-left": case "belt-end-right": {
        const key = l.place === "belt-end-left" ? "left" : "right";
        set.belt[key] = add(set.belt[key], o, at({ x: beltLen * (m.label !== undefined ? 0.52 : 0.3), y: 0 }, o.body));
        break;
      }
    }
  });
  if (m.branding !== undefined && m.brandLabel !== undefined) {
    // Inside the back of the neck, seen through the opening of the jacket below the collar: the neck label, and the size tag sewn under it.
    const nl = neckLabel(id("Bn"), m.branding, m.brandLabel, 11);
    const tag = sizeTag(id("Bt"), m.branding.sizeTag, m.brandLabel, 4.6);
    set.jacket.front = add(add(set.jacket.front, nl, at({ x: 100, y: 25 }, nl.body)), tag, at({ x: 100, y: 33.6 }, tag.body));
  }
  if (m.label !== undefined) {
    // On the jacket beside the maker's logo spot, on the trousers under the waistband near the middle, and on the belt's left end near the knot, upright.
    const put = (key: "jacket" | "pants" | "belt", w: number, spot: { x: number; y: number; rot?: number }): void => {
      const o = labelMark(id(`L${key}`), m.label as ReadLabel, w);
      if (key === "jacket") set.jacket.front = add(set.jacket.front, o, at(spot, o.body));
      else if (key === "pants") set.pants.front = add(set.pants.front, o, at(spot, o.body));
      else set.belt.left = add(set.belt.left, o, at(spot, o.body));
    };
    put("jacket", 12.5, { x: 119, y: 180 });
    put("pants", 9, { x: 121, y: 40 });
    put("belt", 7.6, { x: beltLen * 0.27, y: 0, rot: -90 });
  }
  if (m.emblem !== undefined) {
    const o = emblemOf(m.emblem, clothRgb, id("m"));
    set.jacket.front = add(set.jacket.front, o, at(js.emblem, o.body));
  }
  return set;
}
