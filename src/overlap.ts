// Overlap: shirts in a row tucked under one another, like shirts hung on a rail. The option is a fraction of a shirt's width (the body's 200 units); each shirt is drawn after the one on
// its left, so its body covers the last one's sleeve, and it casts a soft shadow on it.
/** The most shirts may overlap: a fraction of a shirt's width. */
export const MAX_OVERLAP = 0.4;

/** What a lineup and a matchup tuck by when `overlap` is not given: sleeves just slip under the next body, and no number or collar is covered (looked at on a sheet of 0, 0.15, 0.25 and 0.35). */
export const DEFAULT_OVERLAP = 0.15;

/** An `overlap` option read as a fraction from 0 to `MAX_OVERLAP`; a value that is not a finite number is `fallback`. */
export function overlapOf(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(MAX_OVERLAP, value)) : fallback;
}

/** The shadow a shirt casts on the one under it (to its left), as a filter in the shirt's own units. */
export function shadowDefs(id: string): string {
  return `<filter id="${id}" x="-25%" y="-5%" width="130%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2"/><feOffset dx="-3" dy="1" result="s"/><feComponentTransfer in="s" result="t"><feFuncA type="linear" slope=".34"/></feComponentTransfer><feMerge><feMergeNode in="t"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/** The attribute that puts a shirt under the shadow's filter (the first shirt of a row has none). */
export function shadowAttr(id: string, drawn: number): string {
  return drawn > 0 ? ` filter="url(#${id})"` : "";
}

/** A shirt's distance to the next one, `pitch` apart with no overlap, closer by `overlap` of a shirt's width `w`. */
export function tuck(pitch: number, w: number, overlap: number): number {
  return Math.round((pitch - overlap * w) * 100) / 100;
}
