// The judogi jacket (uwagi): a body to mid-thigh with side vents, taken in hard at the waist when a belt is tied, sloping shoulders
// with straight sleeves set on at their points, as wide under the arm as at the cuff, and the thick stitched collar that runs round the back of the neck and down the front, the wearer's
// left side crossing over the right (IJF Judogi Rules, 09 03 2022: left over right, lapel 4-5 cm). Drawn as two faces in the 200-wide box
// that volume.ts wraps over the body: at 2.63 units to the centimetre for a 170 cm size, the jacket is 78 cm long and the lapel 4.7 cm
// wide. The upper body carries a fine grain weave and the skirt below the waist seam quilted diamonds, as product photographs of contest
// judogi show. Original drawing.

import { atY, band, fold, lightDefs, offset, pieceDesc, seam, smooth, stitch, toneOf, weaves, type Face, type GiInk, type Tone } from "./judogiCloth.ts";
import { beltOnJacket, beltShadow } from "./judogiBelt.ts";
import { n2, poly, type Pt } from "./path.ts";
import type { CollarDesc } from "./judogiCollar.ts";
import { INNER_DY, RIM_FROM, RIM_TO } from "./judogiInner.ts";
import { JUDO_CUT, type GiCut } from "./giCut.ts";
import { sleeveAt, type VolumeDesc } from "./volume.ts";

/**
 * The rows of the body: the top of the collar behind the neck, the neck, the slope of the shoulder, the shoulder point, the armhole, the
 * armpit, above the belt, the waist, below the belt, the waist seam, the skirt and the hem.
 *
 * **The proportions are measured from John's reference photographs**, not chosen (L is the jacket's height, the top of the collar to the
 * hem, 199 units here; the 2.63 units to the centimetre of a size 170 make that 76 cm). Landmarks were marked on each photograph, in pixels, and
 * divided by that photograph's own L, so the picture's size and distance drop out; the render is then laid over each photograph at the same
 * height and its outline compared with the photograph's (IoU 0.93 on the white form turned a little, 0.87 on the standing man, 0.79 to 0.83
 * on the flat jackets whose sleeves are posed).
 *
 *   photograph       06    02    04    01    30    31 |  median  this drawing
 *   shoulder/L      .647  .657  .703  .588  .562  .554 |  .617    .638 (the sleeve points, 127 units)
 *   shoulder drop/L .166  .176  .150  .101  .131  .136 |  .143    .151 (collar top to the shoulder point)
 *   chest/L         .416  .446   -    .438   -     -   |  .438    .432 (armpit to armpit, 86 units)
 *   waist/L, belted .385  .441  .476  .490   -     -   |  .459    .447 (89 units at the belt)
 *   hem/L           .555  .545  .542  .523  .474  .444 |  .533    .548 (belted, 109 units; 108 loose)
 *   belt/L, centre  .568  .718  .736  .752 (.625 .626: 05, 07) |  .672    .625 (the form's belts sit high, a man's at the hip)
 *   sleeve angle from the body, degrees: 15.4 (30), 8.5 (31), 16.9 (05), 12.6 (07) | 14.0    14.0
 *   jacket / whole suit height, collar top to trouser hem: .533 (06), .609 (02), .552 (01), .503 (05), .504 (07) | .533    .556
 *
 * Where the photographs disagree: the two flat product pictures (30, 31) are narrower in the hem and shoulders than the worn ones, and a
 * photograph of a man has the belt 20 per cent lower on the jacket than one of a form (the belt height is between the two); trousers are
 * 1.10 to 1.14 of the jacket's height flat (30, 31; 1.29 here) and about 1.3 from the belt down on a form (06, 05, 07; 1.17 here). No photograph shows the body's depth (the
 * three-quarter views fit the same outline from 0.8 to 1.3 times the depth), so the depths below are the ones the drawing already had.
 * The neck and the lapels keep their own widths (the first three rows).
 */
const Y = [6, 12, 18, 26, 36, 58, 86, 110, 127, 139, 149, 172, 205];
/** The drawing's half width at each row, hanging loose. */
const LOOSE = [22, 30, 40, 54, 63.5, 61.5, 53, 47, 45, 45.5, 47, 50, 54];
/** Belted: the belt holds the waist to some 34 cm across (the man's 01, 02, 04 are .44 to .49 of L, the form's 06 .385), the skirt flaring out below it. */
const TIED = [22, 30, 40, 54, 63.5, 61.5, 53, 47, 44.5, 45, 46.5, 50.5, 54.5];
/**
 * The half depth of the body at each row, as a person's: some 24 cm deep at the chest with the thick cloth over it, against 34 cm
 * across, about 21 cm at a belted waist, and the skirt as deep as the hips under it.
 */
const LOOSE_D = [14, 18, 22, 26, 29, 31, 32, 32, 31, 31, 31, 31.5, 32];
const TIED_D = [14, 18, 22, 26, 29, 31, 32, 30, 27.5, 28, 29.5, 31, 32];
const WAIST = 127;
/** The top edge of a tied belt at the back, in the jacket's units: a back patch is kept above it. */
export const BELT_TOP = WAIST - 2.5;
/** Where the collar's foot crosses the middle of the back: a back patch is measured from here. */
export const BACK_COLLAR_FOOT = 19.5;
const HEM = Y[Y.length - 1] as number;
/** The rows of a cut: the judogi's, with the hem where the cut puts it. */
const rowsOf = (cut: GiCut): number[] => (cut.hem === HEM ? Y : [...Y.slice(0, -1), cut.hem]);
/** The same fold as `fold`, a cut's share of it: a lighter cloth hangs in softer folds. */
const softly = (cut: GiCut) => (d: string, w: number, o: number, light = false): string => fold(d, w, o * cut.soft, light);

/** The half widths of the body, tied with a belt or hanging loose. */
const halves = (tied: boolean): number[] => (tied ? TIED : LOOSE);
/** The body's half width at `y`, between its rows. */
const halfAt = (tied: boolean, y: number, cut: GiCut = JUDO_CUT): number => rowAt(halves(tied), y, rowsOf(cut));

/**
 * Where a belt tied on the jacket lies: the top of its band at the back, and the round under it, the widest of the rows it covers so no
 * cloth shows through it (its depth as the volume's: the rows' half depth by `depth`, the cross-section's exponent, the side wall's 0.4).
 */
export function beltRound(depth = 1, width = 12): { y: number; a: number; b: number; full: number; side: number } {
  const k = Math.max(0.35, Math.min(1.6, depth));
  const top = BELT_TOP;
  const foot = top + 2.5 + width;
  return { y: top, a: Math.max(halfAt(true, top), halfAt(true, foot)) + 1.2, b: Math.max(rowAt(TIED_D, top), rowAt(TIED_D, foot)) * k, full: FULL, side: SIDE };
}

/** A value given at each row, at `y` between them. */
function rowAt(h: readonly number[], y: number, ys: readonly number[] = Y): number {
  for (let j = 1; j < ys.length; j++) {
    const y0 = ys[j - 1] as number;
    const y1 = ys[j] as number;
    if (y <= y1) return (h[j - 1] as number) + (((h[j] as number) - (h[j - 1] as number)) * (Math.max(y, y0) - y0)) / (y1 - y0);
  }
  return h[h.length - 1] as number;
}

/**
 * A sleeve on the picture's left (the wearer's right): the shoulder point S, the outer cuff P, the armpit A and the inner cuff Q. The
 * other is its mirror. A judogi's sleeve is a straight band, set on at the shoulder point and as wide from under the arm to the cuff,
 * angled a little out from the body (some 14 degrees in the photograph), its cuff some 12 cm above the hem. Its outer edge is given
 * as a straight curve (`CAP`), so the volume keeps its inner edge level with the outer: the sleeve's head is a band down the armhole,
 * not a tube that narrows to a point at the shoulder.
 */
const SPREAD = 0;
const S: Pt = [36.5 - SPREAD, 36];
const P: Pt = [5 - SPREAD, 162];
const A: Pt = [57 - SPREAD, 104];
const Q: Pt = [38.5 - SPREAD, 174];
/** The outer edge as a straight curve, then where the armhole starts, a little in over the shoulder from its point. */
const CAP = [S[0] + (P[0] - S[0]) / 3, S[1] + (P[1] - S[1]) / 3, S[0] + (2 * (P[0] - S[0])) / 3, S[1] + (2 * (P[1] - S[1])) / 3, S[0] + 8, S[1] - 5];
const mirror = (p: Pt): Pt => [200 - p[0], p[1]];
const SLEEVE_Q = [S[0], S[1], P[0], P[1], A[0], A[1], Q[0], Q[1]];
/** About how far down the sleeve, by length along its outer edge, its head comes down to the armpit's level. */
const ARM = 0.5;

/**
 * A sleeve cut short: the same sleeve, ending a share `len` of the way down the full one (mid-forearm at 0.76, the elbow at 0.52), the cuff keeping its width and slant.
 * The outer edge stops at `len` of its length; the inner edge starts at the armpit as before and ends the cuff's width away from it.
 */
function sleeveGeo(len: number): { q: number[]; c: number[] } {
  if (len >= 1) return { q: SLEEVE_Q, c: CAP };
  const p: Pt = [S[0] + (P[0] - S[0]) * len, S[1] + (P[1] - S[1]) * len];
  // The cuff is square to the arm: as wide as the full sleeve's, across the line from shoulder to wrist.
  const [dx, dy] = [P[0] - S[0], P[1] - S[1]];
  const along = Math.hypot(dx, dy);
  const wide = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const q: Pt = [p[0] + (dy / along) * wide, p[1] - (dx / along) * wide];
  return { q: [S[0], S[1], p[0], p[1], A[0], A[1], q[0], q[1]], c: [S[0] + (p[0] - S[0]) / 3, S[1] + (p[1] - S[1]) / 3, S[0] + (2 * (p[0] - S[0])) / 3, S[1] + (2 * (p[1] - S[1])) / 3, S[0] + 8, S[1] - 5] };
}

/** The lapel on top (the wearer's left, so the picture's right of the neck), by its free edge from the collar to the hem. */
const TOP_EDGE: Pt[] = [[110, 9], [106, 30], [100, 50], [92, 78], [84, 110], [78, 150], [74, 205]];
/** The lapel underneath (the wearer's right), by its free edge, from the collar until it passes under the other. */
const UNDER_EDGE: Pt[] = [[90, 9], [94, 30], [99, 46], [104, 60], [110, 76]];
/** The lapel band's width on the drawing: 4.7 cm at this scale, which with its roll and its shadow reads as the 4-5 cm band of the rules. */
const LAPEL = 12.6;
/** The collar's band in the turning view, a little inside the drawn lapel so none of the drawing shows past its edges. */
export const LAPEL_BAND = LAPEL - 1;

export function jacketDesc(depth = 1, tied = false, cut: GiCut = JUDO_CUT): VolumeDesc {
  const g = sleeveGeo(cut.sleeve);
  const p: Pt = [g.q[2] as number, g.q[3] as number];
  const q: Pt = [g.q[6] as number, g.q[7] as number];
  const sl: VolumeDesc["sl"] = [
    { s: -1, q: g.q, c: g.c },
    { s: 1, q: [...mirror(S), ...mirror(p), ...mirror(A), ...mirror(q)], c: g.c.map((v, k) => (k % 2 === 0 ? 200 - v : v)) },
  ];
  // The sleeves are round over the arms, a little flatter than deep.
  return { ...pieceDesc(rowsOf(cut), halves(tied).map((h) => h + 1.2), tied ? TIED_D : LOOSE_D, sl, depth, 9, 20, 8), full: FULL, side: SIDE, tube: 0.85, inner: cut.hem };
}

/**
 * The collar as a band of its own over the jacket `jd` (judogiCollar.ts): the middle lines of the two lapels drawn on the front, the top
 * one from the hem up and the under one down to where it goes under the top one, its width a little inside the drawn lapel's and its
 * thickness 9 mm at the neck (IJF: up to 1 cm), and its middle at the back a little below the top of the collar there.
 */
export function collarDesc(jd: VolumeDesc, cut: GiCut = JUDO_CUT): CollarDesc {
  const top = offset(TOP_EDGE, -cut.lapel / 2).reverse();
  const under = offset(UNDER_EDGE, cut.lapel / 2);
  // The under lapel ends where its middle line meets the top one's, under the middle of the top lapel.
  const topAt = (y: number): number => atY([...top].reverse(), y)[0];
  let end = under.length - 1;
  for (let k = 1; k < under.length; k++) {
    if (under[k]![0] >= topAt(under[k]![1])) {
      const [x0, y0] = under[k - 1]!;
      const [x1, y1] = under[k]!;
      const d0 = topAt(y0) - x0;
      const d1 = topAt(y1) - x1;
      const r = d0 / (d0 - d1 || 1);
      under.splice(k, under.length - k, [x0 + (x1 - x0) * r, y0 + (y1 - y0) * r]);
      end = k;
      break;
    }
  }
  return { y: jd.y, a: jd.a, b: jd.b, full: FULL, side: SIDE, top: top.flat(), under: under.slice(0, end + 1).flat(), w: cut.lapel - 1, t: cut.collar, neck: 8.5 };
}

/** The jacket's cross-section: rounder than a jersey's square body, as cloth hangs. */
const FULL = 2.2;
/** The side wall's depth as a part of the body's: small, so that turning the jacket a little never makes its silhouette wider than it is face on (volume.ts, `side`). */
const SIDE = 0.1;

/** The outline of the body (no sleeves), clockwise from the collar's top left. */
export function bodyOutline(tied: boolean, cut: GiCut = JUDO_CUT): Pt[] {
  const h = halves(tied);
  const left: Pt[] = rowsOf(cut).map((y, j) => [100 - (h[j] as number), y]);
  const right: Pt[] = [...left].reverse().map(mirror);
  return [...left, ...right];
}

/** A sleeve's outline: down its outer edge from the shoulder to the cuff, across the cuff and up its inner edge to the armpit. */
export function sleeveOutline(side: -1 | 1, len = 1): Pt[] {
  const g = sleeveGeo(len);
  const pts: Pt[] = [];
  for (let k = 0; k <= 24; k++) pts.push(sleeveAt(g.q, g.c, k / 24)[0]);
  pts.push([g.q[6]!, g.q[7]!], A, [CAP[4]!, CAP[5]!]);
  return side === -1 ? pts : pts.map(mirror);
}

/** A point `f` of the way down a sleeve, `u` of the way across from its outer edge to its inner. */
export function onSleeve(side: -1 | 1, f: number, u: number, len = 1): Pt {
  const g = sleeveGeo(len);
  const [o, i] = sleeveAt(g.q, g.c, f);
  const p: Pt = [o[0] + (i[0] - o[0]) * u, o[1] + (i[1] - o[1]) * u];
  return side === -1 ? p : mirror(p);
}

function sleeveLine(side: -1 | 1, f: number, len = 1): string {
  return smooth([onSleeve(side, f, 0, len), onSleeve(side, f, 0.5, len), onSleeve(side, f, 1, len)]);
}

/** A sleeve: its cloth, the soft folds of a heavy sleeve hanging, the armhole seam and the hemmed cuff. */
function sleeve(uid: string, t: Tone, side: -1 | 1, back: boolean, cut: GiCut): string {
  const fold = softly(cut);
  const len = cut.sleeve;
  const out = poly(sleeveOutline(side, len));
  const on = (f: number, u: number): Pt => onSleeve(side, f, u, len);
  const line = (f: number): string => sleeveLine(side, f, len);
  // The folds run down the arm below the head, where the sleeve is a tube: `f` of the way from the armpit's level to the cuff (the armpit is higher on a sleeve cut short).
  const head = Math.min(0.9, ARM / len);
  const arm = (f: number): number => head + (1 - head) * f;
  const along = (u: number, f0: number, f1: number): string => smooth([on(arm(f0), u), on(arm((f0 + f1) / 2), u + 0.04 * side), on(arm(f1), u)]);
  const shadowSide = side === -1 ? 0.12 : 0.88;
  const innerSide = side === -1 ? 0.9 : 0.1;
  // The cuff of a judogi is a wide hem stitched three times; a lighter gi's is a plain turned hem with two rows.
  const hem = cut.plain
    ? fold(line(0.93), 2, t.light ? 0.14 : 0.24) + seam(line(0.92), t, 0.5) + stitch(line(0.955), t) + stitch(line(0.978), t) + fold(line(0.997), 1.4, t.light ? 0.12 : 0.22)
    : fold(line(0.905), 2.4, t.light ? 0.14 : 0.24) + seam(line(0.9), t, 0.55) + stitch(line(0.935), t) + stitch(line(0.965), t) + fold(line(0.995), 1.6, t.light ? 0.12 : 0.22);
  // The cloth runs a little past the outline (a stroke of its own colour), so that the cells along a sleeve's edge and seam, which sample right up to it, find no see-through texels.
  return `<path d="${out}" fill="${t.fill}" stroke="${t.fill}" stroke-width="3" stroke-linejoin="round"/><path d="${out}" fill="url(#${uid}S)"/>` +
    // The sleeve is rounder than the drawing: a little darker along its edges, lighter along its top.
    fold(along(shadowSide, 0.08, 0.95), 7, t.light ? 0.08 : 0.2) +
    fold(along(innerSide, 0.04, 0.9), 6, t.light ? 0.1 : 0.22) +
    fold(along(0.42, 0.14, 0.86), 9, 0.1, true) +
    seam(smooth([on(0.015, 0), on(0.012, 0.5), on(0.015, 1)]), t, 0.5) +
    (back ? "" : stitch(along(0.985, 0.04, 0.88), t, 0.35, 0.55)) +
    hem;
}

/** The region left of a line that runs down the drawing, as a clip: everything from the left edge to the line. */
function leftOf(pts: readonly Pt[]): string {
  const first = pts[0] as Pt;
  const last = pts[pts.length - 1] as Pt;
  return poly([[-60, first[1] - 40], [first[0], first[1] - 40], ...pts, [last[0], last[1] + 40], [-60, last[1] + 40]]);
}

/** The cloth of the body: the grain above the waist seam, the quilting below, and the waist seam itself. */
function bodyCloth(uid: string, t: Tone, outline: string, tied: boolean, cut: GiCut): string {
  const w = halfAt(tied, WAIST, cut);
  return `<path d="${outline}" fill="${t.fill}" stroke="${t.fill}" stroke-width="3" stroke-linejoin="round"/>` +
    `<g clip-path="url(#${uid}body)"><rect x="0" y="0" width="200" height="${WAIST}" fill="url(#${uid}G)"/>` +
    `<rect x="0" y="${WAIST}" width="200" height="${cut.hem - WAIST + 4}" fill="url(#${uid}Q)"/></g>` +
    // A karate gi's jacket is one piece of cloth to the hem: no waist seam, no quilted skirt below it.
    (cut.plain ? "" : seam(`M${n2(100 - w)} ${WAIST}Q100 ${WAIST + 2.5} ${n2(100 + w)} ${WAIST}`, t, 0.35) +
    stitch(`M${n2(100 - w)} ${WAIST + 2}Q100 ${WAIST + 4.5} ${n2(100 + w)} ${WAIST + 2}`, t, 0.36, 0.4));
}

/** The side vents, the hem and the shoulder seams, on either face. */
function edges(t: Tone, tied: boolean, cut: GiCut): string {
  const fold = softly(cut);
  const hem = cut.hem;
  const vent = hem - (HEM - 182);
  let s = "";
  for (const side of [-1, 1] as const) {
    // The vent sits a little in from the side seam, so the side wall of the volume shows plain cloth and the slit from the front.
    const x = (y: number, inset: number): number => 100 + side * (halfAt(tied, y, cut) - inset);
    s += `<path d="M${n2(x(vent, 4.2))} ${vent}L${n2(x(hem, 4))} ${hem}" stroke="${t.deep}" stroke-width="1" stroke-opacity="0.7"/>`;
    s += `<rect x="${n2(x(vent, 4.2) - 2.2)}" y="${n2(vent - 1.4)}" width="4.4" height="1.5" rx="0.6" fill="${t.seam}" fill-opacity="0.75"/>`;
    s += fold(`M${n2(x(vent + 2, 5.6))} ${vent + 2}L${n2(x(hem - 1, 5.4))} ${hem - 1}`, 2.4, t.light ? 0.2 : 0.3);
    const neck: Pt = [100 + side * 25, 14];
    const tip: Pt = [100 + side * (halfAt(tied, 36, cut) - 0.5), 36];
    s += seam(`M${n2(neck[0])} ${neck[1] + 0.8}L${n2(tip[0] - side * 1)} ${tip[1] + 0.6}`, t, 0.45);
  }
  const wide = halfAt(tied, hem, cut);
  if (cut.plain) {
    s += seam(`M${100 - wide} ${hem - 5}L${100 + wide} ${hem - 5}`, t, 0.5);
    s += stitch(`M${100 - wide} ${hem - 3}L${100 + wide} ${hem - 3}`, t);
    return s;
  }
  s += seam(`M${100 - wide} ${hem - 7}L${100 + wide} ${hem - 7}`, t, 0.55);
  s += stitch(`M${100 - wide} ${hem - 4.6}L${100 + wide} ${hem - 4.6}`, t);
  s += stitch(`M${100 - wide} ${hem - 2.2}L${100 + wide} ${hem - 2.2}`, t);
  return s;
}

/** A lapel band between its free edge and the line where it is sewn to the jacket: its cloth, its ridge in the light and its rows of stitching. */
function lapelBand(uid: string, t: Tone, edge: readonly Pt[], sign: 1 | -1, shadeTo: number, cut: GiCut): string {
  const fold = softly(cut);
  const lapel = cut.lapel;
  const sewn = offset(edge, -sign * lapel);
  const shape = band(edge, sewn);
  let s = `<path d="${shape}" fill="${t.fill}"/><path d="${shape}" fill="url(#${uid}S)"/>`;
  // Thick cloth folded over itself: a light ridge just in from the free edge, a darker roll where it meets the jacket.
  s += fold(smooth(offset(edge, -sign * 2.4)), 2.6, t.light ? 0.5 : 0.2, true);
  s += fold(smooth(offset(edge, -sign * (lapel - 2))), 3.4, shadeTo);
  for (const k of lapel === LAPEL ? [1.6, 3.5, 5.4, 7.3, 9.2, 11] : [1.5, 3.4, 5.3, 7.2]) s += stitch(smooth(offset(edge, -sign * k)), t, 0.36, 0.6);
  s += `<path d="${smooth(edge)}" fill="none" stroke="${t.seam}" stroke-width="0.6" stroke-opacity="0.55"/>`;
  s += seam(smooth(sewn), t, 0.6);
  return s;
}

/**
 * The V between the two lapels' free edges, from the neck down to where they cross, as the front panel's own cut: the cloth is not there, so the
 * turning view shows what is behind it (the inside of the back, judogiInner.ts). It runs 2 units under each lapel's band so no seam shows.
 */
export function jacketOpening(): Pt[] {
  const cross = atY(TOP_EDGE, 48);
  return [[UNDER_EDGE[0]![0] - 2, 6], ...UNDER_EDGE.slice(0, 3), cross, ...TOP_EDGE.slice(0, 2).reverse(), [TOP_EDGE[0]![0] + 2, 6]];
}

/** The outline of a face's body: the front's has the V cut out of its top edge. */
function faceOutline(tied: boolean, face: "front" | "back", cut: GiCut): Pt[] {
  return face === "front" ? [...bodyOutline(tied, cut), ...[...jacketOpening()].reverse()] : bodyOutline(tied, cut);
}

/** The front: the under panel with the V cut at the neck, the lapel underneath, then the one on top. */
function front(uid: string, ink: GiInk, t: Tone, cut: GiCut): string {
  const fold = softly(cut);
  const tied = ink.belt !== undefined;
  const outline = poly(faceOutline(tied, "front", cut));
  let s = sleeve(uid, t, -1, false, cut) + sleeve(uid, t, 1, false, cut) + bodyCloth(uid, t, outline, tied, cut);
  // The lapel underneath, as far as the top one lets it show, with the top one's shadow on it.
  s += `<g clip-path="url(#${uid}under)">${lapelBand(uid, t, UNDER_EDGE, -1, t.light ? 0.16 : 0.26, cut)}</g>`;
  // The top panel's free edge throws a shadow on the panel under it, down to the hem.
  s += `<g clip-path="url(#${uid}under)">${fold(smooth(offset(TOP_EDGE.slice(2), 2.2)), 5, t.light ? 0.26 : 0.36)}</g>`;
  // Soft folds of the skirt and of the body hanging from the shoulders.
  s += fold(smooth([[66, 124], [64, 160], [63, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[132, 122], [135, 160], [137, 200]]), 7, t.light ? 0.1 : 0.18);
  s += fold(smooth([[139, 130], [143, 165], [146, 200]]), 3, t.light ? 0.08 : 0.14);
  // The cloth drags from under each arm down toward the knot of the lapels.
  s += fold(smooth([[58, 90], [66, 102], [76, 113]]), 10, t.light ? 0.07 : 0.14);
  s += fold(smooth([[142, 90], [134, 102], [124, 113]]), 10, t.light ? 0.07 : 0.14);
  s += fold(smooth([[128, 40], [124, 70], [126, 104]]), 9, t.light ? 0.2 : 0.1, true);
  s += edges(t, tied, cut);
  s += lapelBand(uid, t, TOP_EDGE, 1, t.light ? 0.2 : 0.3, cut);
  s += ink.marks?.front?.body ?? "";
  s += `<path d="${outline}" fill="url(#${uid}V)"/>`;
  if (ink.belt !== undefined) s += ink.beltApart ? beltShadow(t, "front", WAIST, halfAt(true, WAIST) + 1, ink.belt.tail) : beltOnJacket(ink.belt, t, "front", WAIST, halfAt(true, WAIST) + 1);
  return s;
}

/** The back: the collar standing round the neck, the broad upper back, the waist seam, the skirt and the sleeves. */
function back(uid: string, ink: GiInk, t: Tone, cut: GiCut): string {
  const fold = softly(cut);
  const tied = ink.belt !== undefined;
  const outline = poly(bodyOutline(tied, cut));
  let s = sleeve(uid, t, -1, true, cut) + sleeve(uid, t, 1, true, cut) + bodyCloth(uid, t, outline, tied, cut);
  // The collar from behind: the same stitched band, standing up round the neck and sewn on along a curve across the shoulders (a narrower band on a lighter gi).
  const top: Pt[] = [[77, 6], [100, 4], [123, 6]];
  const wide = (cut.lapel - 1) / (LAPEL - 1);
  const foot: Pt[] = ([[75, 16], [100, 19.5], [125, 16]] as Pt[]).map((p, i) => [p[0], (top[i] as Pt)[1] + (p[1] - (top[i] as Pt)[1]) * wide] as Pt);
  const shape = band(top, foot);
  s += `<path d="${shape}" fill="${t.fill}"/><path d="${shape}" fill="url(#${uid}S)"/>`;
  for (const k of [0.18, 0.34, 0.5, 0.66, 0.82]) s += stitch(smooth(top.map((p, i) => [p[0] + (foot[i]![0] - p[0]) * k, p[1] + (foot[i]![1] - p[1]) * k] as Pt)), t, 0.4, 0.85);
  s += fold(smooth(foot.map((p) => [p[0], p[1] + 1.6] as Pt)), 3.2, t.light ? 0.22 : 0.32);
  s += seam(smooth(foot), t, 0.6);
  s += fold(smooth([[100, 24], [100, 70], [100, 110]]), 10, 0.14, true);
  s += fold(smooth([[64, 124], [62, 160], [60, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[136, 124], [138, 160], [140, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[58, 90], [66, 102], [77, 113]]), 10, t.light ? 0.06 : 0.12);
  s += fold(smooth([[142, 90], [134, 102], [123, 113]]), 10, t.light ? 0.06 : 0.12);
  s += edges(t, tied, cut);
  s += ink.marks?.back?.body ?? "";
  s += `<path d="${outline}" fill="url(#${uid}V)"/>`;
  if (ink.belt !== undefined) s += ink.beltApart ? beltShadow(t, "back", WAIST, halfAt(true, WAIST) + 1) : beltOnJacket(ink.belt, t, "back", WAIST, halfAt(true, WAIST) + 1);
  return s;
}

/**
 * The inside of the jacket's upper body, as the turning view's inner faces sample it (judogiInner.ts): below the face's own drawing by `INNER_DY`, each row of
 * the body at its own height there. The same cloth and weave, darker where it is turned from the light and in the collar's shadow at the neck, the collar's
 * seam on the back panel, and the rim's strip above. The neck label and its size tag are sewn on the back panel just under the collar.
 */
function inside(uid: string, ink: GiInk, t: Tone, face: "front" | "back"): string {
  const x0 = 14;
  const w = 172;
  const flip = (p: Pt): Pt => [200 - p[0], p[1]];
  // The front's V is cut through the cloth whichever side is seen: the inner faces are cut where the outer are, in the drawing turned over as the inner cells sample it.
  // (The V runs up past the top of the cloth, so a cell grown a little over its edge finds nothing there.)
  const cut = face === "front" ? poly(jacketOpening().map((p): Pt => flip(p[1] <= 6 ? [p[0], -4] : p))) : "";
  const cloth = `<path fill-rule="evenodd" d="M${x0} ${RIM_TO + 1}h${w}v96h${-w}Z${cut}" fill="${t.fill}"/><path fill-rule="evenodd" d="M${x0} ${RIM_TO + 1}h${w}v96h${-w}Z${cut}" fill="url(#${uid}G)"/>` +
    `<path fill-rule="evenodd" d="M${x0} ${RIM_TO + 1}h${w}v96h${-w}Z${cut}" fill="${t.shadow}" fill-opacity="0.6"/>`;
  // The rim: the cut edge of the neck's cloth, a plain strip with its turned hem (the front's has the V's gap in it).
  const rimBox = (x: number, wd: number): string => `<rect x="${x}" y="${RIM_FROM - 1}" width="${wd}" height="${RIM_TO - RIM_FROM + 2}" fill="${t.fill}"/><path d="M${x} ${(RIM_FROM + RIM_TO) / 2}h${wd}" stroke="${t.seam}" stroke-width="0.5" stroke-opacity="0.6"/>`;
  const rim = face === "front" ? rimBox(x0, 100 - 12 - x0) + rimBox(112, x0 + w - 112) : rimBox(x0, w);
  // Under the collar the cloth is in its shadow, and deeper still where the neck goes in.
  const shadow = fold(`M${x0 + 6} 8L${x0 + w - 6} 8`, 16, t.light ? 0.4 : 0.5) + fold(`M${x0 + 20} 14L${x0 + w - 20} 14`, 10, t.light ? 0.25 : 0.35);
  const sewn = face === "back" ? seam(smooth([[75, 16], [100, 19.5], [125, 16]]), t, 0.6) + stitch(smooth([[76, 17.8], [100, 21.3], [124, 17.8]]), t, 0.4, 0.7) : "";
  const marks = face === "back" ? ink.marks?.backInner?.body ?? "" : "";
  const shape = `M${x0} ${RIM_TO + 1}h${w}v96h${-w}Z${cut}`;
  return `<g transform="translate(0 ${INNER_DY})">${cloth}<clipPath id="${uid}I"><path clip-rule="evenodd" d="${shape}"/></clipPath><g clip-path="url(#${uid}I)">${shadow}${sewn}${marks}</g>${rim}</g>`;
}

/** The jacket's front or back, in the 200-wide box the volume samples. */
export function jacketFace(ink: GiInk, face: "front" | "back", cut: GiCut = JUDO_CUT): Face {
  const t = toneOf(ink.cloth);
  const tied = ink.belt !== undefined;
  const uid = `${ink.uid}${face === "front" ? "f" : "b"}`;
  const outline = poly(faceOutline(tied, face, cut));
  const room = `M14 ${INNER_DY + RIM_FROM - 1}H186V${INNER_DY + 96}H14Z`;
  const clip = [outline, poly(sleeveOutline(-1, cut.sleeve)), poly(sleeveOutline(1, cut.sleeve)), room];
  const defs = weaves(uid, t, cut.plain) + lightDefs(uid, t) +
    `<clipPath id="${uid}body"><path d="${outline}"/></clipPath>` +
    `<clipPath id="${uid}under"><path d="${leftOf(TOP_EDGE)}"/></clipPath>` +
    (ink.marks?.[face]?.defs ?? "") + (face === "back" ? ink.marks?.backInner?.defs ?? "" : "");
  return { defs, body: face === "front" ? front(uid, ink, t, cut) : back(uid, ink, t, cut), clip, extra: inside(uid, ink, t, face) };
}

/** The bottom of a tied belt's band at the front: a mark on the jacket's front stays below it (the band is 15.5 units from its top). */
export const BELT_BOTTOM = BELT_TOP + 15.5;

/** How far a sleeve leans from the body, in degrees: a mark on a sleeve is turned with it. */
export const SLEEVE_ANGLE = (Math.atan((S[0] - P[0]) / (P[1] - S[1])) * 180) / Math.PI;

/**
 * The chest of the front on the wearer's left (the picture's right), between the top lapel's collar band and the sleeve's seam, at height `y`: from the band's
 * right edge to the sleeve's inner edge (the armhole's seam, from the sleeve's head down to the armpit). Marks on the chest (the national emblem, IJF: at most
 * 100 cm2 on the left chest) are put inside it, so none runs onto the lapel or the sleeve, whatever shape the body is cut to.
 */
export function chestSpan(y: number, cut: GiCut = JUDO_CUT): [number, number] {
  const band = offset(TOP_EDGE, -cut.lapel);
  const left = atY(band, y)[0];
  const [hx, hy] = [200 - CAP[4]!, CAP[5]!];
  const [ax, ay] = mirror(A);
  const right = hx + ((ax - hx) * (Math.max(hy, Math.min(ay, y)) - hy)) / (ay - hy);
  return [left, right];
}

/** The chest's rows: below the collar's foot and the sleeve's head, above the belt's band. */
export const CHEST_TOP = 34;
export const CHEST_BOTTOM = BELT_TOP - 14;

/** The emblem's middle on the front's drawing, centred between the lapel's band and the sleeve's seam, and the room it has there (`EMBLEM_ROOM` units wide). */
export const EMBLEM_AT: Pt = [(chestSpan(66)[0] + chestSpan(66)[1]) / 2, 66];
export const EMBLEM_ROOM = { w: 27, h: 30 };

/** The jacket's sleeve outline on the front's drawing, the picture's left (`side` -1) or right: the cloth that the sleeve's cells show, which a mark on the chest must stay out of. */
export const sleeveRegion = (side: -1 | 1): Pt[] => sleeveOutline(side);

/** A place on a face: where a mark's middle goes, and the angle its line of text runs at, in degrees (clockwise on the screen). */
export interface Spot {
  x: number;
  y: number;
  rot: number;
}

/**
 * The places the rules name, on the jacket's faces. `left` and `right` are the wearer's: on the front the wearer's left is the picture's right,
 * and from behind it is the picture's left. The chest is a hand's breadth under the shoulder on the wearer's left (IJF: the national emblem,
 * 100 cm2); the hem logo is at the bottom front on the wearer's left, near the reinforced edge; the lapel's hem is the lower end of the top lapel,
 * where a name is stitched along the band; the upper arm is a quarter of a metre down the sleeve from the collar; the shoulder strip
 * (IJF's publicity zone, 25 by 5 cm) runs down the sleeve's top from the collar.
 */
export function jacketSpots(cut: GiCut = JUDO_CUT): {
  chest: Spot;
  /** The national emblem's middle: on the wearer's left chest above where the lapels cross, clear of the lapel band and of the sleeve's head. */
  emblem: Spot;
  hemLogo: Spot;
  lapelHem: Spot;
  /** How far along the collar band, from the top lapel's foot at the hem, the lapel hem's spot lies, and the band's width. */
  lapelRun: { run: number; w: number };
  sleeve: (wearer: "left" | "right") => Spot;
  /** The outer upper arm just under the shoulder seam, on the front, turned with the sleeve's slope: where makers put their logo (and a flag patch). */
  upperSleeve: (wearer: "left" | "right") => Spot;
  shoulder: (wearer: "left" | "right") => Spot;
} {
  const middle = offset(TOP_EDGE, -cut.lapel / 2);
  const [lx, ly] = atY(middle, 168);
  const up = atY(middle, 140);
  const down = atY(middle, 196);
  const lean = (Math.atan2(down[1] - up[1], down[0] - up[0]) * 180) / Math.PI;
  const side = (w: "left" | "right", back: boolean): -1 | 1 => ((w === "left") !== back ? 1 : -1);
  return {
    chest: { x: (chestSpan(72)[0] + chestSpan(72)[1]) / 2, y: 72, rot: 0 },
    emblem: { x: EMBLEM_AT[0], y: EMBLEM_AT[1], rot: 0 },
    hemLogo: { x: 138, y: 187, rot: 0 },
    lapelHem: { x: lx, y: ly, rot: lean },
    lapelRun: { run: runFromHem(middle, ly), w: cut.lapel - 1 },
    sleeve: (w) => {
      const sd = side(w, false);
      const [x, y] = onSleeve(sd, 0.4, 0.5, cut.sleeve);
      return { x, y, rot: sd === -1 ? SLEEVE_ANGLE : -SLEEVE_ANGLE };
    },
    upperSleeve: (w) => {
      const sd = side(w, false);
      const [x, y] = onSleeve(sd, 0.18, 0.5, cut.sleeve);
      return { x, y, rot: sd === -1 ? SLEEVE_ANGLE : -SLEEVE_ANGLE };
    },
    shoulder: (w) => {
      const sd = side(w, true);
      const [x, y] = onSleeve(sd, 0.17, 0.16, cut.sleeve);
      return { x, y, rot: sd === -1 ? 90 + SLEEVE_ANGLE : 90 - SLEEVE_ANGLE };
    },
  };
}

/** The length along a polyline that runs from the collar down to the hem, measured up from its last point, to height `y`. */
function runFromHem(pts: readonly Pt[], y: number): number {
  let run = 0;
  for (let i = pts.length - 1; i > 0; i--) {
    const p = pts[i]!;
    const q = pts[i - 1]!;
    if (y >= q[1]) return run + (Math.hypot(p[0] - q[0], p[1] - q[1]) * (p[1] - y)) / (p[1] - q[1] || 1);
    run += Math.hypot(p[0] - q[0], p[1] - q[1]);
  }
  return run;
}
