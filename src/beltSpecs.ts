// What a judo belt really is, from makers' published specifications: the widths each grade colour is made in, the stitch lines of each model, the lengths by
// size number, the red and white sections of a kohaku belt, and the embroidery a maker offers. Read from KuSakura's catalogue (a maker of Kodokan and IJF belts)
// and its belt guide on 2026-10-27; the IJF Judogi Rules (09 03 2022) give a belt's thickness and the hang of its ends but, in the text, no width. Used as
// specifications only: no maker's mark, name or label is drawn.

export const BELT_SPEC_SOURCES = {
  guide: { title: "KuSakura, How to choose your judo belt (sizing and belt types)", url: "https://www.kusakurashop.com/pages/how-to-choose-your-judo-belt", read: "2026-10-27" },
  jrwz: { title: "KuSakura, Kohaku Obi Kata Official Kata, red and white (JRWZ)", url: "https://www.kusakurashop.com/products/judo-belts-white-red-jrwz", read: "2026-10-27" },
  jrwk: { title: "KuSakura, Kohaku Obi Kata Official Kata, red and white (JRWK)", url: "https://www.kusakurashop.com/products/judo-belts-white-red-jrwk", read: "2026-10-27" },
  jgsrw: { title: "KuSakura, 'Japanese Silk' Kohaku Obi (JGSRW)", url: "https://www.kusakurashop.com/products/judo-belts-white-red-jgsrw", read: "2026-10-27" },
  jc: { title: "KuSakura, Classic Iroobi, colour belts (JC)", url: "https://www.kusakurashop.com/products/judo-belts-color-men-jc", read: "2026-10-27" },
  joib: { title: "KuSakura, IJF approved judo black belt (JOIB)", url: "https://www.kusakurashop.com/products/judo-belts-black-ijf-joib", read: "2026-10-27" },
  joxb: { title: "KuSakura, Deluxe IJF Kuroobi (JOXB)", url: "https://www.kusakurashop.com/products/judo-belts-black-ijf-joxb", read: "2026-10-27" },
  jgrk: { title: "KuSakura, Kodokan black belt for women (JGRK)", url: "https://www.kusakurashop.com/products/judo-kodokan-belts-black-jgrk", read: "2026-10-27" },
  embroidery: { title: "KuSakura, Services: belt embroidery (table on the product pages)", url: "https://www.kusakurashop.com/products/judo-belts-white-red-jrwz", read: "2026-10-27" },
  ijf: { title: "IJF Judogi Rules (09 03 2022)", url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf", read: "2026-10-27" },
} as const;

/** The belts the package draws, by name (as `JUDOGI_BELTS`, without `none`). */
export type BeltColourName = "white" | "yellow" | "orange" | "green" | "blue" | "brown" | "black" | "red-white" | "red";

/** How many lengthwise rows of top-stitching a belt has: the maker's options run from 8 to 16. */
export type BeltStitchLines = 8 | 10 | 13 | 14 | 15 | 16;
export const BELT_STITCH_LINES: readonly BeltStitchLines[] = [8, 10, 13, 14, 15, 16];

/** How a mark is put on the cloth: `applied` is sewn on afterwards and shows reversed on the other face; `integrated` is made in during the weaving or stitching of the belt, flatter, with nothing on the other face. */
export type EmbroideryStitching = "applied" | "integrated";
export const EMBROIDERY_STITCHINGS: readonly EmbroideryStitching[] = ["applied", "integrated"];

/** How thick a belt is: the maker's three grades (standard, thick, extra thick). No maker publishes millimetres; the IJF allows 4 to 5 mm. */
export type BeltThickness = "standard" | "thick" | "extra-thick";
export const BELT_THICKNESSES: readonly BeltThickness[] = ["standard", "thick", "extra-thick"];
/** The thickness a model's rigidity rating says: 1 to 3 standard, 4 thick, 5 extra thick (a silk kohaku is 4, so thick). */
export const beltThicknessOf = (rigidity: 1 | 2 | 3 | 4 | 5): BeltThickness => (rigidity >= 5 ? "extra-thick" : rigidity === 4 ? "thick" : "standard");

/** What covers the belt: plain cotton, shusu (satin-covered cotton, glossy, finer and flatter stitch rows) or silk. */
export type BeltCover = "cotton" | "shusu" | "silk";
export const BELT_COVERS: readonly BeltCover[] = ["cotton", "shusu", "silk"];

export interface BeltModel {
  /** The cover of the outer layer. */
  cover: BeltCover;
  /** The maker's code. */
  code: string;
  name: string;
  /** The grade colours it is made in. */
  belts: readonly BeltColourName[];
  widthCm: number;
  stitchLines: BeltStitchLines;
  /** 1 (soft) to 5 (extra thick), from the maker's own asterisks. */
  rigidity: 1 | 2 | 3 | 4 | 5;
  material: string;
  ijf: "approved" | "not-listed" | "no";
  /** What this maker will embroider: every belt in the package takes either; the limit is the maker's. */
  makerEmbroidery: readonly EmbroideryStitching[];
  /** A women's version with a white line down the middle (Japan, black belt and above). */
  womenLine: boolean;
  source: keyof typeof BELT_SPEC_SOURCES;
  note?: string;
}

const m = (cover: BeltCover, code: string, name: string, belts: BeltModel["belts"], widthCm: number, stitchLines: BeltStitchLines, rigidity: BeltModel["rigidity"], material: string, ijf: BeltModel["ijf"], makerEmbroidery: BeltModel["makerEmbroidery"], womenLine: boolean, source: BeltModel["source"], note?: string): BeltModel =>
  ({ cover, code, name, belts, widthCm, stitchLines, rigidity, material, ijf, makerEmbroidery, womenLine, source, ...(note === undefined ? {} : { note }) });

const COLOURED = ["yellow", "orange", "green", "blue", "brown"] as const;

/** The models of the maker's comparison table (belt guide). */
export const BELT_MODELS: readonly BeltModel[] = [
  m("cotton", "JWB", "Classic white belt", ["white"], 4.2, 8, 2, "white cotton, semi-rigid soft core", "no", ["applied"], false, "guide"),
  m("cotton", "JOWIB", "Deluxe white belt (follows the IJF rules)", ["white"], 4.5, 10, 2, "white cotton, felt-like core", "approved", ["applied"], false, "guide"),
  m("cotton", "JC", "Classic colour belt", [...COLOURED, "black"], 4.2, 10, 2, "coloured cotton, semi-rigid soft core", "no", ["applied"], true, "jc", "Yellow, orange, green, violet, brown, blue, light blue, black. Sizes S0 (205 cm) to 6."),
  m("shusu", "JE", "Classic shusu black belt", ["black"], 4.5, 15, 3, "black cotton, semi-rigid core", "no", ["applied", "integrated"], false, "guide"),
  m("shusu", "JOG", "Deluxe shusu black belt", ["black"], 4.5, 16, 4, "black cotton, semi-rigid thick core", "no", ["applied", "integrated"], true, "guide"),
  m("shusu", "JOGS", "Deluxe shusu black belt, extra thick", ["black"], 4.7, 14, 5, "black cotton, semi-rigid extra-thick core", "no", ["integrated"], false, "guide", "The comparison table says 4.7 cm and 14 rows; no product page of its own was read, so these two figures are to confirm. Choose a half size longer (bigger knot)."),
  m("silk", "JGS", "'Japanese silk' black belt", ["black"], 4.5, 16, 4, "black silk, semi-rigid thick cotton core", "no", ["applied", "integrated"], false, "guide"),
  m("cotton", "JOIB", "Classic IJF black belt", ["black"], 4.5, 10, 2, "black cotton, felt-like core", "approved", ["applied"], false, "joib", "4.5 cm and 10 rows, IJF logo on one end and the maker's on the other (page summary and John's photo; the page itself was seen only through a search result). More flexible, a smaller knot, less strength than the 13-row JOXB."),
  m("cotton", "JOXB", "Deluxe IJF black belt", ["black"], 4.5, 13, 3, "black cotton, felt-like core", "approved", ["applied"], true, "joxb", "Approved under the IJF rules of 2022; 13 rows for strength and a large knot."),
  m("cotton", "JOVB", "Deluxe taisho IJF black belt", ["black"], 4.5, 13, 3, "black cotton, felt-like core", "approved", ["applied", "integrated"], false, "guide"),
  m("cotton", "JRWZ", "Kohaku belt, official kata", ["red-white"], 4.5, 13, 3, "red and white cotton over a felted cotton core", "not-listed", ["applied", "integrated"], false, "jrwz"),
  m("cotton", "JRWK", "Kohaku belt, official kata (same belt, JRWK listing)", ["red-white"], 4.5, 13, 3, "red and white cotton over a felted cotton core", "not-listed", ["applied", "integrated"], false, "jrwk", "Rigidity said to be comparable to the JOXB."),
  m("silk", "JGSRW", "'Japanese silk' kohaku belt", ["red-white"], 4.5, 16, 4, "red and white silk over a semi-rigid thick cotton core", "no", ["applied", "integrated"], false, "jgsrw", "Sold as the official Kodokan belt; the comparison table marks IJF as no."),
  m("cotton", "JGSR", "'Japanese silk' red belt (aka obi)", ["red"], 4.5, 16, 4, "red cotton, semi-rigid thick core", "no", ["applied", "integrated"], false, "guide"),
  m("shusu", "JGK", "Kodokan black belt", ["black"], 4.5, 16, 4, "black shusu cotton, thicker core", "no", ["applied", "integrated"], false, "guide", "From John's photo of the maker's black belt list (4.5 cm, 16 rows, thicker core); not in the comparison table of the guide."),
  m("shusu", "JGRK", "Kodokan black belt for women", ["black"], 4.5, 16, 4, "black shusu cotton over a cotton core, white line down the middle", "no", ["applied", "integrated"], true, "jgrk", "Marketed as a Kodokan belt with the Kodokan mark on one side."),
];

/** The widths a belt colour is made in, narrowest first. */
export function beltWidthsFor(belt: string): number[] {
  return [...new Set(BELT_MODELS.filter((x) => (x.belts as readonly string[]).includes(belt)).map((x) => x.widthCm))].sort((a, b) => a - b);
}

/** The width a belt of this colour has when none is asked for: the common one of its models (4.2 cm for white and rank colours, 4.5 cm for black, red-white and red). */
export function beltDefaultWidthCm(belt: string): number {
  const rank = ["white", "yellow", "orange", "green", "blue", "brown"];
  return rank.includes(belt) ? 4.2 : 4.5;
}

/** The stitch-line counts a belt colour is made with, fewest first. */
export function beltStitchLinesFor(belt: string): BeltStitchLines[] {
  return [...new Set(BELT_MODELS.filter((x) => (x.belts as readonly string[]).includes(belt)).map((x) => x.stitchLines))].sort((a, b) => a - b);
}

/** Whether a belt of this colour is made in this width (within 0.5 mm). */
export const beltWidthIsReal = (belt: string, cm: number): boolean => beltWidthsFor(belt).some((w) => Math.abs(w - cm) < 0.05);

/** Belt lengths by size number: men's and mixed, women's (5 cm shorter, with a white line; Japan only), the waist or hips each fits, and how it is supplied. */
export interface BeltSize {
  size: number;
  /** Men's and mixed length in centimetres. */
  cm: number;
  womenCm: number;
  waistCm: [number, number];
  /** `ijf`: size 6.5 only in IJF models; `order`: made to order (about three weeks); the others come from stock. */
  note?: "ijf" | "order";
}

export const BELT_SIZES: readonly BeltSize[] = [
  { size: 1, cm: 215, womenCm: 210, waistCm: [55, 60] },
  { size: 2, cm: 235, womenCm: 230, waistCm: [60, 70] },
  { size: 2.5, cm: 245, womenCm: 240, waistCm: [70, 75] },
  { size: 3, cm: 255, womenCm: 250, waistCm: [75, 80] },
  { size: 3.5, cm: 265, womenCm: 260, waistCm: [80, 85] },
  { size: 4, cm: 275, womenCm: 270, waistCm: [85, 90] },
  { size: 4.5, cm: 285, womenCm: 280, waistCm: [90, 95] },
  { size: 5, cm: 295, womenCm: 290, waistCm: [95, 100] },
  { size: 5.5, cm: 305, womenCm: 300, waistCm: [100, 105] },
  { size: 6, cm: 315, womenCm: 310, waistCm: [105, 110] },
  { size: 6.5, cm: 325, womenCm: 320, waistCm: [110, 115], note: "ijf" },
  { size: 7, cm: 335, womenCm: 330, waistCm: [115, 120], note: "order" },
  { size: 7.5, cm: 345, womenCm: 340, waistCm: [120, 125], note: "order" },
  { size: 8, cm: 355, womenCm: 350, waistCm: [125, 135], note: "order" },
];

/** The rule of thumb on the guide: twice the waist (or hips) plus 90 to 100 cm, leaving 20 to 30 cm each end. Handmade lengths vary by 1 to 1.5 percent. */
export const beltLengthFor = (waistCm: number): number => 2 * waistCm + 95;

/** A kohaku (red-and-white) belt: red and white sections each 12 to 18 cm, longer with the size, spread evenly along the belt, both ends always red. */
export const KOHAKU = { sectionCm: { min: 12, max: 18 }, bothEndsRed: true, source: "jrwz" } as const;

/** The embroidery a maker offers: both ways of putting it on, the fonts, the colours, the longest run and grade lines. */
export const MAKER_EMBROIDERY = {
  /** `applied` shows reversed on the other face; `integrated` shows nothing there and is flatter. This package offers both on every belt; the maker's own limit is black belts and not its IJF models. */
  makerLimit: "integrated: black belts only (a kohaku and a red belt included on the models above), not the maker's IJF models; applied: any belt",
  fonts: ["Japanese regular script (kaishotai)", "Japanese semi-cursive script (gyoshotai)", "English block", "English cursive (horizontal; initials may stand upright)"],
  languages: ["Japanese", "English"],
  /** Korean and Chinese are not offered by this maker; the package sets Hangul all the same. */
  notOffered: ["Korean", "Chinese"],
  maxLengthCm: 20,
  letterCm: 3,
  /** Grade lines: short horizontal bars under the name and above a logo on the same end, at most 10, each about 1 cm wide. */
  gradeLines: { max: 10, widthCm: 1 },
  /** Two places on a belt: the end with the maker's logo, and the end with the IJF logo or a blank. */
  positions: 2,
  colours: ["golden brown (kincha)", "black", "dark blue", "blue", "light blue", "brown", "orange", "gold", "wine red", "purple", "yellow", "dark green", "light green", "grey", "silver", "white", "light pink (sakura)", "pink"],
  source: "embroidery",
} as const;

/** The thickness grades a belt colour is made in. */
export const beltThicknessesFor = (belt: string): BeltThickness[] =>
  BELT_THICKNESSES.filter((t) => BELT_MODELS.some((x) => (x.belts as readonly string[]).includes(belt) && beltThicknessOf(x.rigidity) === t));

/**
 * What most belts carry near one end, for the drawing (a hand-over note, not drawn here): a woven maker's label, right under it a small size tag (the size
 * number, and under it by default three tiny kanji, `BELT_SIZE_TAG_LINE`, which the user may change or remove), and under that a small white tag that almost every belt has: where the size tag shows, the white tag shows
 * too. What a real one carries is not known, so it is drawn blank (a fine woven texture), with optional text from the user, never wording made up here. The
 * label is neutral placeholder art in this package, never a maker's mark.
 */
export const BELT_END_TAGS = ["maker-label", "size-tag", "white-tag"] as const;
export type BeltEndTag = (typeof BELT_END_TAGS)[number];
/** The line under the number on a size tag by default: the three kanji for "made in Japan", in very small type; a user may change it or remove it. */
export const BELT_SIZE_TAG_LINE = "日本製";
/** A tag that needs another: the white tag goes with the size tag. */
export const BELT_TAG_NEEDS: Readonly<Record<BeltEndTag, BeltEndTag | undefined>> = { "maker-label": undefined, "size-tag": "maker-label", "white-tag": "size-tag" };

/** The covers a belt colour is made with. */
export const beltCoversFor = (belt: string): BeltCover[] => BELT_COVERS.filter((c) => BELT_MODELS.some((x) => x.cover === c && (x.belts as readonly string[]).includes(belt)));
