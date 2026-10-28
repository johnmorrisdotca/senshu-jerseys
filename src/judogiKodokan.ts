// The Kodokan's emblem, drawn here as plain vector from what it looks like: a white flower of sixteen rounded petals with a thin dark edge round a red disc,
// a notch between two petals at the top and at each side, the shape the Kodokan wears on its badge and Judo BC shows in its logo (a flower of sixteen lobes, a red disc a little under half its radius). Proportions
// were measured from those two pictures (docs/judogi.md, "The Kodokan emblem"); nothing is traced and no file of the Kodokan's or Judo BC's is used. The
// emblem is the Kodokan's mark: its trademark status has not been checked, and it is here at John's choice.

const PETALS = 16;
/** In a 100 by 100 picture: where a petal's edge meets its neighbour's, how far the small point between two petals stands out, how far a petal bulges from its chord, and the red disc's radius. */
const JOIN = 45.8;
const POINT = 48.6;
const BULGE = 2.1;
const DISC = 18.8;
/** The Kodokan's white, the dark of its edge and its red (Judo BC's logo red, measured by eye from the picture, a plain Japanese-flag red). */
const WHITE = "#fdfdfb";
const EDGE = "#1d1d1f";
const RED = "#df1f2c";

const n = (v: number): string => String(Math.round(v * 100) / 100);

/** The emblem as an SVG document, a 100 by 100 square with the flower in the middle. */
export function kodokanEmblemSvg(): string {
  const at = (angle: number, r: number): string => `${n(50 + r * Math.cos(angle))} ${n(50 + r * Math.sin(angle))}`;
  const step = (2 * Math.PI) / PETALS;
  // A petal runs between two small points; each point is a narrow spike standing out from where two petals meet.
  const spike = 0.03;
  const chord = 2 * JOIN * Math.sin((step - 2 * spike) / 2);
  const arc = (chord * chord) / (8 * BULGE) + BULGE / 2;
  let d = "";
  for (let i = 0; i < PETALS; i++) {
    const c = i * step - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${at(c - spike, JOIN)}L${at(c, POINT)}L${at(c + spike, JOIN)}A${n(arc)} ${n(arc)} 0 0 1 ${at(c + step - spike, JOIN)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}Z" fill="${WHITE}" stroke="${EDGE}" stroke-width="1.5" stroke-linejoin="miter" stroke-miterlimit="8"/><circle cx="50" cy="50" r="${DISC}" fill="${RED}"/></svg>`;
}
