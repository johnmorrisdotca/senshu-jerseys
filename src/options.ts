// The options of a jersey, read from outside: every value is checked against the lists below, a colour is read as `#rgb`, `#rrggbb` or `rgb()`, and text is cleaned.
import { COLLAR_IDS, CUT_IDS, CUTS, type CollarId, type CutId, type SleeveId } from "./cuts.ts";
import { clean, lum, readColour, type Rgb } from "./colour.ts";

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

/**
 * What one sleeve carries, in the wearer's own terms: `sleeveLeft` is the sleeve on the wearer's left arm (the picture's right in the front view and its left in the back view), `sleeveRight` the other.
 * A number or a patch is placed on the sleeve itself: in the turning view with volume it is drawn on the arm's surface and turns with it.
 */
export interface SleeveDetail {
  /** The digits on this sleeve (up to two): the jersey's number when absent and `sleeveNumbers` asks for one, none when `false`. */
  number?: string | number | false;
  /** The number's height in drawing units (6 to 32; the cut's own by default), how far down the sleeve its middle lies in percent (8 to 92; the cut's own) and, with volume, how far round the arm in degrees from the front (-150 to 60; -90, straight out, the middle of the arm seen from the side). */
  size?: number;
  at?: number;
  around?: number;
  /** The number's fill and outline colours; the cloth's own contrast by default. */
  fill?: string;
  outline?: string;
  /** A plain patch on the sleeve (never a mark): its shape, up to three letters on it, its size (6 to 30), place down the sleeve and round it (as for the number; off the number by default (the shoulder's 12 percent if there is none) and at -60 degrees) and its colours. */
  patch?: BadgeId | "";
  patchText?: string;
  patchSize?: number;
  patchAt?: number;
  patchAround?: number;
  patchFill?: string;
  patchOutline?: string;
}

export const CHEST_KINDS = ["C", "A", "patch", "flag"] as const;
export type ChestKind = (typeof CHEST_KINDS)[number];

/**
 * A badge on the chest, in the wearer's own terms (`"left"` is the wearer's left breast, the right of the picture): a captain's `C`, an alternate's `A`, a plain `patch` (a shape with up to three letters) or a `flag` (a rectangle).
 * What a flag or a patch shows is the caller's: stripes and colours of their own, or any SVG document, or an emblem id through `useEmblems` or `emblems`, as for `crest`. The package draws no flag and no mark of its own.
 */
export interface ChestBadge {
  kind?: ChestKind;
  /** The wearer's side: the one the cut puts its C on by default. */
  side?: "left" | "right";
  /** For a `patch`: up to three letters on it. */
  text?: string;
  /** For a `patch` (and the C and A): `round` (the C and A's own), `shield` or `square`. */
  shape?: BadgeId;
  /** For a `flag`: its bands as colours, 2 to 5, from the top (or the left); `direction` says which; a `canton` colour fills the top corner next to the hoist and a `disc` colour is a circle in the middle. */
  flag?: { stripes?: readonly string[]; direction?: "horizontal" | "vertical"; canton?: string; disc?: string };
  /** An SVG document, or an emblem id, to show in the badge's place instead of its drawing (a flag from a flag package, a federation's patch). */
  art?: string;
  /** The badge's height in drawing units (8 to 40; the C and A's 20 to 22, a patch 16, a flag 14, whose width is half as much again), and its offset from the place it takes, in units (-40 to 40). */
  size?: number;
  dx?: number;
  dy?: number;
  fill?: string;
  outline?: string;
  /** The ink of the letters. */
  ink?: string;
  /** False keeps a badge exactly where it is put, even over the collar or the lettering; by default it slides down clear of them. */
  nudge?: boolean;
}

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
  /**
   * A solid plate behind the back's name and number, for lettering that has to read over stripes: `true` takes the lighter of the body and the trim, or give it a colour. The ink on it is the number's
   * fill if that reads on the plate, else black or white.
   */
  plate?: boolean | string;
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
  /** Badges on the chest: a captain's letter, a flag, a patch, each on the wearer's left or right, in any number up to four. The `patch` option is the one C or A of old. */
  chestBadges?: ChestBadge | readonly ChestBadge[];
  /** The number on the sleeves: `true` or `"both"` for both, or `"left"` or `"right"` (the wearer's) for one. `sleeveLeft` and `sleeveRight` place each sleeve's number and patch. */
  sleeveNumbers?: boolean | "both" | "left" | "right";
  sleeveLeft?: SleeveDetail;
  sleeveRight?: SleeveDetail;
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

/** A chest badge, read. */
export interface ChestBadgeR {
  kind: ChestKind;
  side?: "left" | "right";
  text?: string;
  shape: BadgeId;
  flag?: { stripes: Rgb[]; vertical: boolean; canton?: Rgb; disc?: Rgb };
  art?: string;
  size: number;
  dx: number;
  dy: number;
  fill?: Rgb;
  outline?: Rgb;
  ink?: Rgb;
  nudge: boolean;
}

/** One sleeve's number and patch, read. */
export interface SleeveSide {
  number?: string;
  size: number;
  at: number;
  around: number;
  fill?: Rgb;
  outline?: Rgb;
  patch?: { shape: BadgeId; text?: string; size: number; at: number; around: number; fill?: Rgb; outline?: Rgb };
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
  plate?: Rgb;
  number?: string;
  name?: string;
  nameArch: ArchId;
  frontText?: string;
  frontTextAngle: TextAngleId;
  frontNumber?: string;
  patch: PatchId;
  chest?: ChestBadgeR[];
  /** The sleeves' numbers and patches by the wearer's side: absent for a side with none. */
  sleeveSides?: { left?: SleeveSide; right?: SleeveSide };
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

const within = (v: unknown, lo: number, hi: number): number | undefined => (typeof v === "number" && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v * 10) / 10)) : undefined);

/** One sleeve's detail from outside: `asked` says the sleeve is to carry the jersey's number. Anything wrong is the default. */
function sleeveSideOf(o: JerseyOptions, spec: (typeof CUTS)[CutId], length: number, asked: boolean, given: unknown): SleeveSide | undefined {
  const d: SleeveDetail = given !== null && typeof given === "object" && !Array.isArray(given) ? (given as SleeveDetail) : {};
  const number = d.number === false ? undefined : d.number !== undefined ? digits(d.number, 2) : asked ? digits(o.number, 2) : undefined;
  const shape = (BADGE_IDS as readonly unknown[]).includes(d.patch) ? (d.patch as BadgeId) : undefined;
  if (number === undefined && shape === undefined) return undefined;
  const side: SleeveSide = { size: within(d.size, 6, 32) ?? spec.tv.h, at: within(d.at, 8, 92) ?? Math.round(spec.tv.t * 100), around: within(d.around, -150, 60) ?? -90 };
  if (number !== undefined) side.number = number;
  const fill = readColour(d.fill);
  const outline = readColour(d.outline);
  if (fill !== undefined) side.fill = fill;
  if (outline !== undefined) side.outline = outline;
  if (shape !== undefined) {
    const text = clean(d.patchText, 6)?.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase().slice(0, 3);
    const size = within(d.patchSize, 6, 30) ?? 12;
    // Unless it is told a place, the patch goes where the number is not: above it if there is room between the shoulder and the number, else below it.
    let at = 12;
    if (number !== undefined && length > 0) {
      const gap = side.size / 2 + size / 2 + 1;
      const middle = (side.at / 100) * length;
      at = Math.round(((middle - gap - size / 2 >= 2 ? middle - gap : middle + gap) / length) * 100);
    }
    side.patch = { shape, size, at: within(d.patchAt, 8, 92) ?? Math.max(8, Math.min(92, at)), around: within(d.patchAround, -150, 60) ?? -60 };
    if (text !== undefined && text !== "") side.patch.text = text;
    const pf = readColour(d.patchFill);
    const po = readColour(d.patchOutline);
    if (pf !== undefined) side.patch.fill = pf;
    if (po !== undefined) side.patch.outline = po;
  }
  return side;
}

/** Both sleeves' details, by the wearer's side. */
function sleeveSidesOf(o: JerseyOptions, spec: (typeof CUTS)[CutId], sleeve: Exclude<SleeveId, "none">): Resolved["sleeveSides"] {
  const all = o.sleeveNumbers === true || o.sleeveNumbers === "both";
  const length = spec.sleeves[sleeve]?.l ?? 0;
  const left = sleeveSideOf(o, spec, length, all || o.sleeveNumbers === "left", o.sleeveLeft);
  const right = sleeveSideOf(o, spec, length, all || o.sleeveNumbers === "right", o.sleeveRight);
  if (left === undefined && right === undefined) return undefined;
  return { ...(left === undefined ? {} : { left }), ...(right === undefined ? {} : { right }) };
}

/** The chest badges from outside: each entry that is a badge, at most four; anything wrong in one is its default. */
function chestOf(o: JerseyOptions, spec: (typeof CUTS)[CutId]): ChestBadgeR[] | undefined {
  const list: unknown[] = Array.isArray(o.chestBadges) ? o.chestBadges : o.chestBadges !== undefined && o.chestBadges !== null ? [o.chestBadges] : [];
  const out: ChestBadgeR[] = [];
  for (const given of list.filter((g) => g !== null && typeof g === "object" && !Array.isArray(g)).slice(0, 4)) {
    const d = given as ChestBadge;
    const kind = pick(CHEST_KINDS, d.kind, "C");
    const flagIn = d.flag !== null && typeof d.flag === "object" ? d.flag : undefined;
    const stripes = Array.isArray(flagIn?.stripes) ? flagIn.stripes.map((c) => readColour(c)).filter((c): c is Rgb => c !== undefined).slice(0, 5) : [];
    const art = typeof d.art === "string" && d.art.length <= 200_000 && d.art.trim() !== "" ? d.art : undefined;
    const b: ChestBadgeR = {
      kind,
      shape: kind === "patch" ? pick(BADGE_IDS, d.shape, "round") : "round",
      size: within(d.size, 8, 40) ?? (kind === "flag" ? 14 : kind === "patch" ? 16 : spec.patch.w),
      dx: within(d.dx, -40, 40) ?? 0,
      dy: within(d.dy, -40, 40) ?? 0,
      nudge: d.nudge !== false,
    };
    if (d.side === "left" || d.side === "right") b.side = d.side;
    const text = clean(d.text, 6)?.replace(/[^\p{L}\p{N}]/gu, "").toUpperCase().slice(0, 3);
    if (kind === "patch" && text !== undefined && text !== "") b.text = text;
    if (kind === "flag" && stripes.length >= 2) {
      b.flag = { stripes, vertical: flagIn?.direction === "vertical" };
      const canton = readColour(flagIn?.canton);
      const disc = readColour(flagIn?.disc);
      if (canton !== undefined) b.flag.canton = canton;
      if (disc !== undefined) b.flag.disc = disc;
    }
    if ((kind === "flag" || kind === "patch") && art !== undefined) b.art = art;
    for (const [k, v] of [["fill", d.fill], ["outline", d.outline], ["ink", d.ink]] as const) {
      const c = readColour(v);
      if (c !== undefined) b[k] = c;
    }
    out.push(b);
  }
  return out.length === 0 ? undefined : out;
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
    plate: o.plate === true ? (lum(body) >= lum(trim) ? body : trim) : readColour(o.plate),
    number: digits(o.number, 2),
    name: clean(o.name, 18)?.toUpperCase(),
    nameArch: pick(ARCH_IDS, o.nameArch, "arched"),
    frontText: clean(o.frontText, 14)?.toUpperCase(),
    frontTextAngle: pick(TEXT_ANGLE_IDS, o.frontTextAngle, cut === "basketball" ? "arch" : "straight"),
    frontNumber: o.frontNumber === true ? digits(o.number, 2) : o.frontNumber === false || o.frontNumber === undefined ? undefined : digits(o.frontNumber, 2),
    patch: pick(PATCH_IDS, o.patch, ""),
    chest: chestOf(o, spec),
    sleeveSides: sleeve === "none" ? undefined : sleeveSidesOf(o, spec, sleeve),
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
