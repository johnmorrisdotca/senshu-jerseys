// The options of a jersey, read from outside: every value is checked against the lists below, a colour is read as `#rgb`, `#rrggbb` or `rgb()`, and text is cleaned.
import { COLLAR_IDS, CUT_IDS, CUTS, type CollarId, type CutId, type SleeveId } from "./cuts.ts";
import { clean, readColour, type Rgb } from "./colour.ts";

export const PATTERN_IDS = ["solid", "stripes", "hoops", "halves", "quarters", "sash", "chevron", "pinstripes", "yoke", "chest-band"] as const;
export type PatternId = (typeof PATTERN_IDS)[number];
export const YOKE_IDS = ["none", "curved", "square", "full-arm"] as const;
export type YokeId = (typeof YOKE_IDS)[number];
export const CLOSURE_IDS = ["button", "pullover", "vest"] as const;
export type ClosureId = (typeof CLOSURE_IDS)[number];
export const VIEW_IDS = ["front", "back", "both"] as const;
export type ViewId = (typeof VIEW_IDS)[number];
export const LOOK_IDS = ["cloth", "flat", "line"] as const;
export type LookId = (typeof LOOK_IDS)[number];
export const ARCH_IDS = ["arched", "straight"] as const;
export type ArchId = (typeof ARCH_IDS)[number];
export const TEXT_ANGLE_IDS = ["straight", "arch", "diagonal-up", "diagonal-down"] as const;
export type TextAngleId = (typeof TEXT_ANGLE_IDS)[number];
export const PATCH_IDS = ["", "C", "A"] as const;
export type PatchId = (typeof PATCH_IDS)[number];
/** The plain shape of a badge spot: the licence patch an official wears on the chest, drawn empty. */
export const BADGE_IDS = ["round", "shield", "square"] as const;
export type BadgeId = (typeof BADGE_IDS)[number];
export const LANGUAGE_IDS = ["en", "ja"] as const;
export type LanguageId = (typeof LANGUAGE_IDS)[number];

/**
 * Bands as a flat list of numbers read in pairs: a width in drawing units and a colour (0 the body, 1 the trim, 2 the second trim), from the edge they start at inward.
 * `[6, 0, 5, 1, 2, 2, 5, 1]` is a gap of 6, a band of 5, a thin line of 2 and a band of 5.
 */
export type Bands = readonly number[];

export interface JerseyOptions {
  cut?: CutId;
  /** `[body, trim, trim2?, numberFill?, numberOutline?]`. */
  colors?: readonly string[];
  body?: string;
  trim?: string;
  accent?: string;
  numberFill?: string;
  numberOutline?: string;
  pattern?: PatternId;
  /** For `stripes` and `hoops`: the bands of one repeat (see `Bands`). */
  repeat?: Bands;
  /** For `stripes`: how many equal bands (2 to 24) run across the torso, the first the trim's, instead of a `repeat`. */
  stripeCount?: number;
  /** Bands down the length of each sleeve, centred on its middle (width and colour pairs): a stripe from the shoulder to the cuff. */
  armStripes?: Bands;
  /** Whether the pattern carries onto the sleeves (true by default); false leaves them the body's colour. */
  patternSleeves?: boolean;
  collar?: CollarId;
  sleeve?: SleeveId;
  yoke?: YokeId;
  closure?: ClosureId;
  raglan?: boolean;
  piping?: boolean;
  /** How many stripes round each sleeve (0 to 3), and round the hem (0 to 3), or a `Bands` list. */
  sleeveStripes?: number | Bands;
  hemStripes?: number | Bands;
  /** A band across the chest: `true` for the usual one, or a `Bands` list. */
  chestBand?: boolean | Bands;
  /** Where the chest band starts, down from the top. */
  chestY?: number;
  /**
   * Contrasting sleeve ends, the Canadiens' red tips: a length in drawing units (3 to 48) alone, or `[length, colour]` with the colour 1 (the default) the trim, 2 the second trim or 3 the
   * number's fill. A knit seam shows where the cuff starts. It is drawn over the sleeve's stripes, so the two can be used together.
   */
  cuffs?: number | readonly number[];
  /**
   * Bands round the upper arms, an official's armbands (the referee's orange): a colour index (1 the trim, 2 the second trim or 3 the number's fill) alone, or `[colour, width, at]` with the width in
   * drawing units (3 to 30, 12 by default) and `at` how far down the sleeve its middle lies, in percent (10 to 80, 30 by default). Drawn over the sleeve's stripes, under the sleeve number.
   */
  armbands?: number | readonly number[];
  /** A patch pocket on the wearer's left chest (the soccer referee's), with a stitched edge. */
  pocket?: boolean;
  /**
   * A badge spot on the left chest, on the pocket if there is one: a plain shape in the trim colour that stands for the licence patch and never for a mark. A `crest` takes its place when there is one.
   */
  badge?: BadgeId;
  /** An umpire's outside chest protector over the front: a padded shape in a dark shade of the body, with its straps. */
  protector?: boolean;
  /** The collar's colour: 1 the trim (the default), 0 the body, 2 the second trim, 3 the number's fill. */
  collarColor?: 0 | 1 | 2 | 3;
  /** The sleeves' colour apart from the pattern: 0 body, 1 trim, 2 trim2. */
  sleeveColor?: 0 | 1 | 2;
  /** The side panels of a tank, and the shoulder panels, in this colour index (1 or 2). */
  panels?: 0 | 1 | 2;
  number?: string | number;
  name?: string;
  nameArch?: ArchId;
  frontText?: string;
  /**
   * How the chest text runs: `straight`, on an `arch` (the basketball default), or stepped on a slant, letter by letter, rising to the right (`diagonal-up`, the Rangers way) or to the left
   * (`diagonal-down`). Straight is the default for every cut but basketball.
   */
  frontTextAngle?: TextAngleId;
  frontNumber?: boolean | string | number;
  patch?: PatchId;
  sleeveNumbers?: boolean;
  /** Any SVG document as text, or an emblem's id when a renderer is plugged in (`useEmblems`). */
  crest?: string;
  view?: ViewId;
  look?: LookId;
  /** The width of one jersey in pixels. */
  size?: number;
  language?: LanguageId;
  title?: string;
  description?: string;
  /** Also draw the pants or shorts, the socks and the helmet that go with it (see `renderKit`). */
  kit?: boolean;
  pants?: string;
  pantsTrim?: string;
  socks?: string;
  socksTrim?: string;
  helmet?: string;
  /** Bands round the pants' leg and round the socks, as `Bands` (a width and a colour index, from the bottom up). */
  pantsBands?: Bands;
  socksBands?: Bands;
}

/** The options after they are read: nothing here is a string from outside that has not been checked. */
export interface Resolved {
  cut: CutId;
  body: Rgb;
  trim: Rgb;
  trim2: Rgb;
  trim2Given: boolean;
  fill?: Rgb;
  outline?: Rgb;
  pattern: PatternId;
  repeat?: Bands;
  stripeCount?: number;
  armBands: Bands;
  patternSleeves: boolean;
  collar: CollarId;
  sleeve: SleeveId;
  yoke: YokeId;
  closure: ClosureId;
  raglan: boolean;
  piping: boolean;
  sleeveBands: Bands;
  hemBands: Bands;
  chestBands: Bands;
  cuffs?: { len: number; c: 1 | 2 | 3 };
  armbands?: { c: 1 | 2 | 3; w: number; at: number };
  pocket: boolean;
  badge?: BadgeId;
  protector: boolean;
  chestY?: number;
  collarColor: 0 | 1 | 2 | 3;
  sleeveColor?: 0 | 1 | 2;
  panels: 0 | 1 | 2;
  number?: string;
  name?: string;
  nameArch: ArchId;
  frontText?: string;
  frontTextAngle: TextAngleId;
  frontNumber?: string;
  patch: PatchId;
  sleeveNumbers: boolean;
  crest?: string;
  view: ViewId;
  look: LookId;
  size: number;
  language: LanguageId;
  title?: string;
  description?: string;
  kit: boolean;
  pants?: Rgb;
  pantsTrim?: Rgb;
  socks?: Rgb;
  socksTrim?: Rgb;
  helmet?: Rgb;
  pantsBands: Bands;
  socksBands: Bands;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);
const digits = (v: unknown, max: number): string | undefined => {
  const t = clean(typeof v === "number" ? String(Math.trunc(Math.abs(v))) : v, 12);
  const d = t?.replace(/\D/g, "").slice(0, max);
  return d === undefined || d === "" ? undefined : d;
};
const idx = (v: unknown, fallback: 0 | 1 | 2): 0 | 1 | 2 => (v === 0 || v === 1 || v === 2 ? v : fallback);
const idx3 = (v: unknown, fallback: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 => (v === 0 || v === 1 || v === 2 || v === 3 ? v : fallback);

/** Stripes as bands: the usual widths, edged by the second trim when there is one. */
export function stripesOf(count: number, edged: boolean): Bands {
  const n = Math.max(0, Math.min(3, Math.round(count)));
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (edged) out.push(i === 0 ? 8 : 4, 0, 2, 2, 5, 1, 2, 2);
    else out.push(i === 0 ? 8 : 5, 0, 5, 1);
  }
  return out;
}

/** A list of bands from outside: pairs of a width (1 to 80) and a colour index (0 to 3), at most 24 pairs. */
export function bandsOf(v: unknown): Bands | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: number[] = [];
  for (let i = 0; i + 1 < v.length && out.length < 48; i += 2) {
    const w = Number(v[i]);
    const c = Number(v[i + 1]);
    if (!Number.isFinite(w) || w <= 0 || w > 80 || !Number.isInteger(c) || c < 0 || c > 3) return undefined;
    out.push(Math.round(w * 10) / 10, c);
  }
  return out;
}

/** The cuffs from outside: a length alone, or a length and a colour index (1 to 3). */
export function cuffsOf(v: unknown): { len: number; c: 1 | 2 | 3 } | undefined {
  const [w, c = 1] = typeof v === "number" ? [v] : Array.isArray(v) ? v.map(Number) : [];
  if (typeof w !== "number" || !Number.isFinite(w) || w < 3 || w > 48 || !(c === 1 || c === 2 || c === 3)) return undefined;
  return { len: Math.round(w * 10) / 10, c };
}

/** The armbands from outside: a colour index (1 to 3) alone, or a colour, a width (3 to 30) and a place down the sleeve in percent (10 to 80). */
export function armbandsOf(v: unknown): { c: 1 | 2 | 3; w: number; at: number } | undefined {
  const [c, w = 12, at = 30] = typeof v === "number" ? [v] : Array.isArray(v) ? v.map(Number) : [];
  if (c === undefined || !(c === 1 || c === 2 || c === 3) || !Number.isFinite(w) || w < 3 || w > 30 || !Number.isFinite(at) || at < 10 || at > 80) return undefined;
  return { c, w: Math.round(w * 10) / 10, at: Math.round(at) };
}

/** Read the options: anything wrong is replaced by the default, never thrown. */
export function resolve(options: JerseyOptions | undefined): Resolved {
  const o: JerseyOptions = options !== null && typeof options === "object" ? options : {};
  const cut = pick(CUT_IDS, o.cut, "soccer");
  const spec = CUTS[cut];
  const list = Array.isArray(o.colors) ? o.colors : [];
  const body = readColour(list[0]) ?? readColour(o.body) ?? [31, 58, 138];
  const trim = readColour(list[1]) ?? readColour(o.trim) ?? [244, 240, 228];
  const second = readColour(list[2]) ?? readColour(o.accent);
  const closure = pick(CLOSURE_IDS, o.closure, "button");
  let sleeve = pick(["long", "elbow", "short", "none"] as const, o.sleeve, spec.sleeve);
  if (cut === "basketball") sleeve = "none";
  else if (cut === "baseball" && o.sleeve === undefined && closure === "vest") sleeve = "none";
  else if (sleeve !== "none" && spec.sleeves[sleeve] === undefined) sleeve = spec.sleeve;
  let collar = pick(COLLAR_IDS, o.collar, spec.collar);
  if (!spec.collars.includes(collar)) collar = spec.collar;
  if (cut === "baseball" && closure === "pullover" && collar === "band") collar = "crew";
  const edged = second !== undefined;
  const sleeveBands = typeof o.sleeveStripes === "number" ? stripesOf(o.sleeveStripes, edged) : (bandsOf(o.sleeveStripes) ?? stripesOf(sleeve === "none" ? 0 : spec.sleeveStripes, edged));
  const hemBands = typeof o.hemStripes === "number" ? stripesOf(o.hemStripes, edged) : (bandsOf(o.hemStripes) ?? stripesOf(spec.hemStripes, edged));
  const chestBands = o.chestBand === true ? [14, 1] : (bandsOf(o.chestBand) ?? []);
  const view = pick(VIEW_IDS, o.view, "front");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const reads = (v: unknown): Rgb | undefined => readColour(v);
  return {
    cut,
    body,
    trim,
    trim2: second ?? trim,
    trim2Given: second !== undefined,
    fill: readColour(list[3]) ?? readColour(o.numberFill),
    outline: readColour(list[4]) ?? readColour(o.numberOutline),
    pattern: pick(PATTERN_IDS, o.pattern, "solid"),
    repeat: bandsOf(o.repeat),
    stripeCount: typeof o.stripeCount === "number" && Number.isInteger(o.stripeCount) && o.stripeCount >= 2 && o.stripeCount <= 24 ? o.stripeCount : undefined,
    armBands: bandsOf(o.armStripes) ?? [],
    patternSleeves: o.patternSleeves !== false,
    collar,
    sleeve,
    yoke: pick(YOKE_IDS, o.yoke, "none"),
    closure,
    raglan: o.raglan === true,
    piping: o.piping === true,
    sleeveBands,
    hemBands,
    chestBands,
    cuffs: sleeve === "none" ? undefined : cuffsOf(o.cuffs),
    armbands: sleeve === "none" ? undefined : armbandsOf(o.armbands),
    pocket: o.pocket === true,
    badge: (BADGE_IDS as readonly unknown[]).includes(o.badge) ? (o.badge as BadgeId) : undefined,
    protector: o.protector === true,
    chestY: typeof o.chestY === "number" && Number.isFinite(o.chestY) ? Math.max(40, Math.min(190, o.chestY)) : undefined,
    collarColor: idx3(o.collarColor, 1),
    sleeveColor: o.sleeveColor === undefined ? undefined : idx(o.sleeveColor, 0),
    panels: idx(o.panels, 1),
    number: digits(o.number, 2),
    name: clean(o.name, 18)?.toUpperCase(),
    nameArch: pick(ARCH_IDS, o.nameArch, "arched"),
    frontText: clean(o.frontText, 14)?.toUpperCase(),
    frontTextAngle: pick(TEXT_ANGLE_IDS, o.frontTextAngle, cut === "basketball" ? "arch" : "straight"),
    frontNumber: o.frontNumber === true ? digits(o.number, 2) : o.frontNumber === false || o.frontNumber === undefined ? undefined : digits(o.frontNumber, 2),
    patch: pick(PATCH_IDS, o.patch, ""),
    sleeveNumbers: o.sleeveNumbers === true,
    crest: typeof o.crest === "string" && o.crest.length <= 200_000 ? o.crest : undefined,
    view,
    look: pick(LOOK_IDS, o.look, "cloth"),
    size,
    language: pick(LANGUAGE_IDS, o.language, "en"),
    title: clean(o.title, 120),
    description: clean(o.description, 240),
    kit: o.kit === true,
    pants: reads(o.pants),
    pantsTrim: reads(o.pantsTrim),
    socks: reads(o.socks),
    socksTrim: reads(o.socksTrim),
    helmet: reads(o.helmet),
    pantsBands: bandsOf(o.pantsBands) ?? [],
    socksBands: bandsOf(o.socksBands) ?? [],
  };
}
