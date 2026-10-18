// The letters and numerals, drawn here as strokes: each glyph is a centre line in a box 90 units tall, and the stroke's width makes it bold. Block shapes with square
// ends and mitred corners, as an athletic jersey's tackle-twill letters are. No font file and no system font is used, so a number looks the same everywhere.
// A character with no glyph here (a Japanese name, say) is the caller of `layout`'s to draw as text.

/** A glyph: the width of its box and its centre line as a path of absolute `M L C` commands. `""` is a space. */
export interface Glyph {
  w: number;
  d: string;
}

const LETTERS: Readonly<Record<string, Glyph>> = {
  "0": { w: 48, d: "M24 0C8 0 0 14 0 45C0 76 8 90 24 90C40 90 48 76 48 45C48 14 40 0 24 0Z" },
  "1": { w: 28, d: "M0 24L28 0L28 90" },
  "2": { w: 48, d: "M0 22C0 8 10 0 24 0C38 0 48 8 48 24C48 38 40 46 28 56L0 90L48 90" },
  "3": { w: 48, d: "M2 0L46 0L24 34C40 34 48 46 48 62C48 80 38 90 24 90C10 90 2 82 0 68" },
  "4": { w: 50, d: "M36 90L36 0L0 62L50 62" },
  "5": { w: 48, d: "M46 0L6 0L2 40C10 34 18 32 26 32C40 32 48 46 48 62C48 80 38 90 24 90C10 90 2 82 0 70" },
  "6": { w: 48, d: "M44 6C38 2 32 0 24 0C8 0 0 16 0 46C0 76 8 90 24 90C40 90 48 78 48 62C48 46 40 36 24 36C12 36 2 44 0 56" },
  "7": { w: 48, d: "M0 0L48 0L16 90" },
  "8": { w: 46, d: "M23 0C10 0 4 8 4 20C4 32 12 40 23 43C36 46 46 52 46 66C46 82 38 90 23 90C8 90 0 82 0 66C0 52 10 46 23 43C34 40 42 32 42 20C42 8 36 0 23 0Z" },
  "9": { w: 48, d: "M4 84C10 88 16 90 24 90C40 90 48 74 48 44C48 14 40 0 24 0C8 0 0 12 0 28C0 44 8 54 24 54C36 54 46 46 48 34" },
  A: { w: 50, d: "M0 90L25 0L50 90M10 60L40 60" },
  B: { w: 46, d: "M0 90L0 0L26 0C40 0 44 10 44 21C44 34 36 42 26 43L0 43M26 43C40 44 46 52 46 66C46 82 40 90 26 90L0 90" },
  C: { w: 46, d: "M46 24C44 8 36 0 24 0C8 0 0 14 0 45C0 76 8 90 24 90C36 90 44 82 46 66" },
  D: { w: 46, d: "M0 0L0 90L20 90C40 90 46 76 46 45C46 14 40 0 20 0Z" },
  E: { w: 42, d: "M42 0L0 0L0 90L42 90M0 44L34 44" },
  F: { w: 40, d: "M40 0L0 0L0 90M0 44L32 44" },
  G: { w: 46, d: "M46 24C44 8 36 0 24 0C8 0 0 14 0 45C0 76 8 90 24 90C40 90 46 78 46 58L46 50L26 50" },
  H: { w: 46, d: "M0 0L0 90M46 0L46 90M0 44L46 44" },
  I: { w: 0, d: "M0 0L0 90" },
  J: { w: 38, d: "M38 0L38 64C38 82 30 90 20 90C8 90 0 82 0 66" },
  K: { w: 46, d: "M0 0L0 90M46 0L2 50M14 36L46 90" },
  L: { w: 38, d: "M0 0L0 90L38 90" },
  M: { w: 58, d: "M0 90L0 0L29 62L58 0L58 90" },
  N: { w: 46, d: "M0 90L0 0L46 90L46 0" },
  O: { w: 48, d: "M24 0C8 0 0 14 0 45C0 76 8 90 24 90C40 90 48 76 48 45C48 14 40 0 24 0Z" },
  P: { w: 46, d: "M0 90L0 0L28 0C42 0 46 10 46 24C46 38 40 48 26 48L0 48" },
  Q: { w: 48, d: "M24 0C8 0 0 14 0 45C0 76 8 90 24 90C40 90 48 76 48 45C48 14 40 0 24 0ZM30 66L50 90" },
  R: { w: 46, d: "M0 90L0 0L28 0C42 0 46 10 46 22C46 36 40 46 26 47L0 47M24 47L46 90" },
  S: { w: 46, d: "M44 22C42 8 34 0 22 0C8 0 2 10 2 22C2 36 12 40 24 45C36 50 46 56 46 68C46 82 38 90 24 90C10 90 2 82 0 66" },
  T: { w: 46, d: "M0 0L46 0M23 0L23 90" },
  U: { w: 46, d: "M0 0L0 62C0 82 8 90 23 90C38 90 46 82 46 62L46 0" },
  V: { w: 48, d: "M0 0L24 90L48 0" },
  W: { w: 60, d: "M0 0L15 90L30 28L45 90L60 0" },
  X: { w: 48, d: "M0 0L48 90M48 0L0 90" },
  Y: { w: 48, d: "M0 0L24 46L48 0M24 46L24 90" },
  Z: { w: 46, d: "M0 0L46 0L0 90L46 90" },
  "-": { w: 24, d: "M0 45L24 45" },
  ".": { w: 0, d: "M0 90L0 90" },
  ",": { w: 0, d: "M0 82L0 90" },
  "'": { w: 0, d: "M0 0L0 12" },
  "/": { w: 26, d: "M0 90L26 0" },
  ":": { w: 0, d: "M0 24L0 24M0 66L0 66" },
  "&": { w: 52, d: "M52 90L10 34C2 22 6 0 24 0C42 0 44 20 36 30L8 60C-2 76 6 90 24 90C34 90 44 80 50 60" },
  " ": { w: 22, d: "" },
};

/** Stroke widths, in glyph units, for the three weights. */
export const WEIGHTS = { regular: 11, bold: 17, black: 24 } as const;
export type Weight = keyof typeof WEIGHTS;

/** The glyph of a character (a lower-case letter is its capital, an accented one its plain one), or `undefined`. */
export function glyphOf(char: string): Glyph | undefined {
  const plain = char.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  return Object.prototype.hasOwnProperty.call(LETTERS, plain) ? LETTERS[plain] : undefined;
}

/** True when every character of `text` has a glyph. */
export const drawable = (text: string): boolean => [...text].every((c) => glyphOf(c) !== undefined);
