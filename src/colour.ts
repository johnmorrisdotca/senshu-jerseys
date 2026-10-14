// Colours: read from outside (only `#rgb`, `#rrggbb` and `rgb()` are taken, anything else is ignored), mixed, and compared for contrast.
// Nothing here returns a string that was not made from three numbers, so a colour can be written into an attribute without escaping.

export type Rgb = readonly [number, number, number];

const clamp = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));

/** A colour read from a string, or `undefined` when it is not `#rgb`, `#rrggbb` or `rgb(r, g, b)`. */
export function readColour(value: unknown): Rgb | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim().toLowerCase();
  if (text.length > 40) return undefined;
  let m = /^#([0-9a-f]{3})$/.exec(text);
  if (m !== null) return [...(m[1] as string)].map((c) => parseInt(c + c, 16)) as unknown as Rgb;
  m = /^#([0-9a-f]{6})$/.exec(text);
  if (m !== null) {
    const n = parseInt(m[1] as string, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  m = /^rgb\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*\)$/.exec(text);
  if (m !== null) return [clamp(Number(m[1])), clamp(Number(m[2])), clamp(Number(m[3]))];
  return undefined;
}

/** `#rrggbb`. */
export const hexOf = (c: Rgb): string => `#${c.map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;

const channel = (v: number): number => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

/** Relative luminance, 0 (black) to 1 (white). */
export const lum = (c: Rgb): number => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);

/** The WCAG contrast ratio of two colours, 1 to 21. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** A colour moved toward black (`amount` below 0) or toward white (above 0): -1 is black, 1 is white. */
export function shade(c: Rgb, amount: number): Rgb {
  const a = Math.max(-1, Math.min(1, amount));
  const target = a < 0 ? 0 : 255;
  const t = Math.abs(a);
  return [clamp(c[0] + (target - c[0]) * t), clamp(c[1] + (target - c[1]) * t), clamp(c[2] + (target - c[2]) * t)];
}

/** `a` moved `t` of the way to `b`. */
export const blend = (a: Rgb, b: Rgb, t: number): Rgb => [clamp(a[0] + (b[0] - a[0]) * t), clamp(a[1] + (b[1] - a[1]) * t), clamp(a[2] + (b[2] - a[2]) * t)];

export const WHITE: Rgb = [255, 255, 255];
export const BLACK: Rgb = [17, 17, 17];

/** The least contrast `ink` has against any of `grounds`. */
export const worst = (ink: Rgb, grounds: readonly Rgb[]): number => Math.min(...grounds.map((g) => contrast(ink, g)));

/**
 * The first of `candidates` that reads at `need` to 1 on every ground, else the one that reads best, else (nothing given) black or white.
 */
export function inkOn(grounds: readonly Rgb[], candidates: readonly (Rgb | undefined)[], need = 4.5): Rgb {
  const list = candidates.filter((c): c is Rgb => c !== undefined);
  for (const c of list) if (worst(c, grounds) >= need) return c;
  const pool = [...list, WHITE, BLACK];
  return pool.reduce((best, c) => (worst(c, grounds) > worst(best, grounds) ? c : best));
}

/** Text from outside made safe for markup. */
export const esc = (text: unknown): string => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Control characters and the marks that reorder text, kept out of anything that is drawn.
// eslint-disable-next-line no-control-regex
const CONTROL = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]", "g");

/** Free text from outside: control characters out, runs of space folded, cut to `max` characters, or `undefined` when nothing is left. */
export function clean(text: unknown, max = 40): string | undefined {
  if (typeof text !== "string" && typeof text !== "number") return undefined;

  const out = String(text).replace(CONTROL, "").replace(/\s+/g, " ").trim();
  return out === "" ? undefined : [...out].slice(0, max).join("");
}

/** A short hash of a string, for ids that are the same for the same drawing and (almost always) differ between drawings. */
export function hashOf(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
