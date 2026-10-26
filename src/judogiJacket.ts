// The judogi jacket (uwagi): a boxy body to mid-thigh with side vents, wide sleeves hanging from a dropped shoulder, and the thick
// stitched collar that runs round the back of the neck and down the front, the wearer's left side crossing over the right (IJF Judogi
// Rules, 09 03 2022: left over right, lapel 4-5 cm). Drawn as two faces in the 200-wide box that volume.ts wraps over the body: at
// 2.63 units to the centimetre for a 170 cm size, the jacket is 78 cm long and the lapel 4.7 cm wide. The upper body carries a fine
// grain weave and the skirt below the waist seam quilted diamonds, as product photographs of contest judogi show. Original drawing.

import { atY, band, fold, lightDefs, offset, pieceDesc, seam, smooth, stitch, toneOf, weaves, type Face, type GiInk, type Tone } from "./judogiCloth.ts";
import { beltOnJacket } from "./judogiBelt.ts";
import { n2, poly, type Pt } from "./path.ts";
import type { VolumeDesc } from "./volume.ts";

/** The rows of the body: the top of the collar behind the neck, the neck, the round of the shoulder, the shoulder point, the chest, the armpit, the waist seam, the hips and the hem. */
const Y = [6, 14, 22, 33, 58, 86, 140, 205];
/** The drawing's half width at each row: the shoulder slopes down from the neck and rounds over into the sleeve. */
const H = [22, 25, 46, 60, 59, 56.6, 55, 57];
/** The half depth of the body at each row: a judogi is thick cloth on a broad chest, so it stays deep to the hem. */
const D = [13, 16, 19, 23, 28, 29, 27.5, 27];
const WAIST = 114;
const HEM = Y[Y.length - 1] as number;
/** The body's half width at the waist seam. */
const WAIST_HALF = 55.6;

/**
 * A sleeve on the picture's left (the wearer's right): the shoulder point S, the outer cuff P, the armpit A, the inner cuff Q. The other is
 * its mirror. A heavy sleeve hangs close to the body, its cuff at about three quarters of the jacket's length; its inner edge stays just
 * outside the body's, so on the drawing neither covers the other.
 */
const S: Pt = [40, 33];
const P: Pt = [10, 160];
const A: Pt = [42.6, 82];
const Q: Pt = [40, 167];
const mirror = (p: Pt): Pt => [200 - p[0], p[1]];

/** The lapel on top (the wearer's left, so the picture's right of the neck), by its free edge from the collar to the hem. */
const TOP_EDGE: Pt[] = [[110, 9], [106, 30], [100, 50], [92, 78], [84, 110], [78, 150], [74, 205]];
/** The lapel underneath (the wearer's right), by its free edge, from the collar until it passes under the other. */
const UNDER_EDGE: Pt[] = [[90, 9], [94, 30], [99, 46], [104, 60], [110, 76]];
/** The lapel band's width on the drawing: 4.7 cm at this scale, which with its roll and its shadow reads as the 4-5 cm band of the rules. */
const LAPEL = 14.5;

export function jacketDesc(depth = 1): VolumeDesc {
  const sl: VolumeDesc["sl"] = [
    { s: -1, q: [S[0], S[1], P[0], P[1], A[0], A[1], Q[0], Q[1]] },
    { s: 1, q: [...mirror(S), ...mirror(P), ...mirror(A), ...mirror(Q)] },
  ];
  return pieceDesc(Y, H.map((h) => h + 1.2), D, sl, depth, 9, 4, 6);
}

/** The outline of the body (no sleeves), clockwise from the collar's top left. */
function bodyOutline(): Pt[] {
  const left: Pt[] = Y.map((y, j) => [100 - (H[j] as number), y]);
  const right: Pt[] = [...left].reverse().map(mirror);
  return [...left, ...right];
}

function sleeveOutline(side: -1 | 1): Pt[] {
  const pts: Pt[] = [S, P, Q, A];
  return side === -1 ? pts : pts.map(mirror);
}

/** A point `f` of the way down a sleeve, `u` of the way across from its outer edge to its inner. */
function onSleeve(side: -1 | 1, f: number, u: number): Pt {
  const [s, p, q, a] = sleeveOutline(side) as [Pt, Pt, Pt, Pt];
  const o: Pt = [s[0] + (p[0] - s[0]) * f, s[1] + (p[1] - s[1]) * f];
  const i: Pt = [a[0] + (q[0] - a[0]) * f, a[1] + (q[1] - a[1]) * f];
  return [o[0] + (i[0] - o[0]) * u, o[1] + (i[1] - o[1]) * u];
}

function sleeveLine(side: -1 | 1, f: number): string {
  return smooth([onSleeve(side, f, 0), onSleeve(side, f, 0.5), onSleeve(side, f, 1)]);
}

/** A sleeve: its cloth, the soft folds of a heavy sleeve hanging, the armhole seam and the hemmed cuff. */
function sleeve(uid: string, t: Tone, side: -1 | 1, back: boolean): string {
  const out = poly(sleeveOutline(side));
  const along = (u: number, f0: number, f1: number): string => smooth([onSleeve(side, f0, u), onSleeve(side, (f0 + f1) / 2, u + 0.04 * side), onSleeve(side, f1, u)]);
  const shadowSide = side === -1 ? 0.12 : 0.88;
  const innerSide = side === -1 ? 0.9 : 0.1;
  return `<path d="${out}" fill="${t.fill}"/><path d="${out}" fill="url(#${uid}S)"/>` +
    // The sleeve is rounder than the drawing: darker at its under side, lighter along its top.
    fold(along(shadowSide, 0.08, 0.95), 9, t.light ? 0.16 : 0.3) +
    fold(along(innerSide, 0.04, 0.9), 8, t.light ? 0.2 : 0.32) +
    fold(along(0.42, 0.14, 0.86), 9, 0.14, true) +
    fold(along(0.7, 0.3, 0.82), 6, t.light ? 0.08 : 0.16) +
    // The soft break above the elbow, where the heavy sleeve folds a little as it hangs.
    fold(smooth([onSleeve(side, 0.44, 0.5), onSleeve(side, 0.48, 0.78), onSleeve(side, 0.51, 1)]), 6, t.light ? 0.12 : 0.22) +
    seam(smooth([onSleeve(side, 0.015, 0), onSleeve(side, 0.012, 0.5), onSleeve(side, 0.015, 1)]), t, 0.5) +
    (back ? "" : stitch(along(0.985, 0.04, 0.88), t, 0.35, 0.55)) +
    // The cuff: a wide hem, turned and stitched twice.
    fold(sleeveLine(side, 0.905), 2.4, t.light ? 0.14 : 0.24) +
    seam(sleeveLine(side, 0.9), t, 0.55) +
    stitch(sleeveLine(side, 0.935), t) +
    stitch(sleeveLine(side, 0.965), t) +
    fold(sleeveLine(side, 0.995), 1.6, t.light ? 0.12 : 0.22);
}

/** The region left of a line that runs down the drawing, as a clip: everything from the left edge to the line. */
function leftOf(pts: readonly Pt[]): string {
  const first = pts[0] as Pt;
  const last = pts[pts.length - 1] as Pt;
  return poly([[-60, first[1] - 40], [first[0], first[1] - 40], ...pts, [last[0], last[1] + 40], [-60, last[1] + 40]]);
}

/** The cloth of the body: the grain above the waist seam, the quilting below, and the waist seam itself. */
function bodyCloth(uid: string, t: Tone, outline: string): string {
  return `<path d="${outline}" fill="${t.fill}"/>` +
    `<g clip-path="url(#${uid}body)"><rect x="0" y="0" width="200" height="${WAIST}" fill="url(#${uid}G)"/>` +
    `<rect x="0" y="${WAIST}" width="200" height="${HEM - WAIST + 4}" fill="url(#${uid}Q)"/></g>` +
    seam(`M${100 - WAIST_HALF} ${WAIST}Q100 ${WAIST + 2.5} ${100 + WAIST_HALF} ${WAIST}`, t, 0.35) +
    stitch(`M${100 - WAIST_HALF} ${WAIST + 2}Q100 ${WAIST + 4.5} ${100 + WAIST_HALF} ${WAIST + 2}`, t, 0.36, 0.4);
}

/** The shadow a heavy sleeve throws on the body beside it, under the arm and down the side, where the two hang close. */
function sleeveShadows(t: Tone): string {
  let s = "";
  for (const side of [-1, 1] as const) {
    const x = (v: number): number => 100 + side * v;
    s += fold(smooth([[x(55), 84], [x(53.5), 120], [x(53), 168]]), 8, t.light ? 0.2 : 0.32);
  }
  return s;
}

/** The side vents, the hem and the shoulder seams, on either face. */
function edges(t: Tone): string {
  let s = "";
  for (const side of [-1, 1] as const) {
    // The vent sits a little in from the side seam, so the side wall of the volume shows plain cloth and the slit from the front.
    const x = (y: number, inset: number): number => 100 + side * (56 + ((y - 172) / 33) - inset);
    s += `<path d="M${n2(x(182, 4.2))} 182L${n2(x(HEM, 4))} ${HEM}" stroke="${t.deep}" stroke-width="1" stroke-opacity="0.7"/>`;
    s += `<rect x="${n2(x(182, 4.2) - 2.2)}" y="180.6" width="4.4" height="1.5" rx="0.6" fill="${t.seam}" fill-opacity="0.75"/>`;
    s += fold(`M${n2(x(184, 5.6))} 184L${n2(x(HEM - 1, 5.4))} ${HEM - 1}`, 2.4, t.light ? 0.2 : 0.3);
    const neck: Pt = [100 + side * 25, 14];
    const tip: Pt = [100 + side * 60, 33];
    s += seam(`M${n2(neck[0])} ${neck[1] + 0.8}L${n2(tip[0] - side * 1)} ${tip[1] + 0.6}`, t, 0.45);
  }
  const hem = H[H.length - 1] as number;
  s += seam(`M${100 - hem} ${HEM - 7}L${100 + hem} ${HEM - 7}`, t, 0.55);
  s += stitch(`M${100 - hem} ${HEM - 4.6}L${100 + hem} ${HEM - 4.6}`, t);
  s += stitch(`M${100 - hem} ${HEM - 2.2}L${100 + hem} ${HEM - 2.2}`, t);
  return s;
}

/** A lapel band between its free edge and the line where it is sewn to the jacket: its cloth, its ridge in the light and its rows of stitching. */
function lapelBand(uid: string, t: Tone, edge: readonly Pt[], sign: 1 | -1, shadeTo: number): string {
  const sewn = offset(edge, -sign * LAPEL);
  const shape = band(edge, sewn);
  let s = `<path d="${shape}" fill="${t.fill}"/><path d="${shape}" fill="url(#${uid}S)"/>`;
  // Thick cloth folded over itself: a light ridge just in from the free edge, a darker roll where it meets the jacket.
  s += fold(smooth(offset(edge, -sign * 2.4)), 2.6, t.light ? 0.5 : 0.2, true);
  s += fold(smooth(offset(edge, -sign * (LAPEL - 2))), 3.4, shadeTo);
  for (const k of [1.6, 3.5, 5.4, 7.3, 9.2, 11]) s += stitch(smooth(offset(edge, -sign * k)), t, 0.36, 0.6);
  s += `<path d="${smooth(edge)}" fill="none" stroke="${t.seam}" stroke-width="0.6" stroke-opacity="0.55"/>`;
  s += seam(smooth(sewn), t, 0.6);
  return s;
}

/** The front: under panel, the opening at the neck with the inside of the collar behind it, the lapel underneath, then the one on top. */
function front(uid: string, ink: GiInk, t: Tone): string {
  const outline = poly(bodyOutline());
  const cross = atY(TOP_EDGE, 48);
  let s = sleeve(uid, t, -1, false) + sleeve(uid, t, 1, false) + bodyCloth(uid, t, outline);
  // The opening: the inside of the back and of the collar, seen between the two lapels above where they cross.
  const opening = poly([[UNDER_EDGE[0]![0] - 2, 6], ...UNDER_EDGE.slice(0, 3), cross, ...TOP_EDGE.slice(0, 2).reverse(), [TOP_EDGE[0]![0] + 2, 6]]);
  s += `<path d="${opening}" fill="${t.inside}"/>`;
  s += `<path d="M77 6Q100 3.5 123 6L121 16Q100 21 79 16Z" fill="${t.shadow}"/>`;
  for (const k of [8.2, 10.4, 12.6, 14.8]) s += stitch(`M80 ${k}Q100 ${k + 3.5} 120 ${k}`, t, 0.38, 0.55);
  s += fold(`M84 18Q100 24 116 18`, 5, t.light ? 0.3 : 0.4);
  s += fold(smooth([[96, 24], [100, 38], [101, 46]]), 6, t.light ? 0.28 : 0.38);
  // The lapel underneath, as far as the top one lets it show, with the top one's shadow on it.
  s += `<g clip-path="url(#${uid}under)">${lapelBand(uid, t, UNDER_EDGE, -1, t.light ? 0.16 : 0.26)}</g>`;
  // The top panel's free edge throws a shadow on the panel under it, down to the hem.
  s += `<g clip-path="url(#${uid}under)">${fold(smooth(offset(TOP_EDGE.slice(2), 2.2)), 5, t.light ? 0.26 : 0.36)}</g>`;
  // Soft folds of the skirt and of the body hanging from the shoulders.
  s += fold(smooth([[66, 124], [64, 160], [63, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[132, 122], [135, 160], [137, 200]]), 7, t.light ? 0.1 : 0.18);
  s += fold(smooth([[150, 126], [151, 165], [151, 200]]), 3, t.light ? 0.08 : 0.14);
  // The cloth drags from under each arm down toward the knot of the lapels.
  s += fold(smooth([[52, 88], [62, 100], [74, 112]]), 10, t.light ? 0.07 : 0.14);
  s += fold(smooth([[148, 88], [136, 101], [122, 112]]), 10, t.light ? 0.07 : 0.14);
  s += fold(smooth([[128, 40], [124, 70], [126, 104]]), 9, t.light ? 0.2 : 0.1, true);
  s += sleeveShadows(t);
  s += edges(t);
  s += lapelBand(uid, t, TOP_EDGE, 1, t.light ? 0.2 : 0.3);
  s += `<path d="${outline}" fill="url(#${uid}V)"/>`;
  if (ink.belt !== undefined) s += beltOnJacket(ink.belt, t, "front", WAIST);
  return s;
}

/** The back: the collar standing round the neck, the broad upper back, the waist seam, the skirt and the sleeves. */
function back(uid: string, ink: GiInk, t: Tone): string {
  const outline = poly(bodyOutline());
  let s = sleeve(uid, t, -1, true) + sleeve(uid, t, 1, true) + bodyCloth(uid, t, outline);
  // The collar from behind: the same stitched band, standing up round the neck and sewn on along a curve across the shoulders.
  const top: Pt[] = [[77, 6], [100, 4], [123, 6]];
  const foot: Pt[] = [[75, 16], [100, 19.5], [125, 16]];
  const shape = band(top, foot);
  s += `<path d="${shape}" fill="${t.fill}"/><path d="${shape}" fill="url(#${uid}S)"/>`;
  for (const k of [0.18, 0.34, 0.5, 0.66, 0.82]) s += stitch(smooth(top.map((p, i) => [p[0] + (foot[i]![0] - p[0]) * k, p[1] + (foot[i]![1] - p[1]) * k] as Pt)), t, 0.4, 0.85);
  s += fold(smooth(foot.map((p) => [p[0], p[1] + 1.6] as Pt)), 3.2, t.light ? 0.22 : 0.32);
  s += seam(smooth(foot), t, 0.6);
  s += fold(smooth([[100, 24], [100, 70], [100, 110]]), 10, 0.14, true);
  s += fold(smooth([[60, 120], [58, 160], [58, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[140, 120], [142, 160], [142, 200]]), 6, t.light ? 0.1 : 0.18);
  s += fold(smooth([[54, 88], [64, 100], [76, 112]]), 10, t.light ? 0.06 : 0.12);
  s += fold(smooth([[146, 88], [136, 100], [124, 112]]), 10, t.light ? 0.06 : 0.12);
  s += sleeveShadows(t);
  s += edges(t);
  s += `<path d="${outline}" fill="url(#${uid}V)"/>`;
  if (ink.belt !== undefined) s += beltOnJacket(ink.belt, t, "back", WAIST);
  return s;
}

/** The jacket's front or back, in the 200-wide box the volume samples. */
export function jacketFace(ink: GiInk, face: "front" | "back"): Face {
  const t = toneOf(ink.cloth);
  const uid = `${ink.uid}${face === "front" ? "f" : "b"}`;
  const outline = poly(bodyOutline());
  const clip = [outline, poly(sleeveOutline(-1)), poly(sleeveOutline(1))];
  const defs = weaves(uid, t) + lightDefs(uid, t) +
    `<clipPath id="${uid}body"><path d="${outline}"/></clipPath>` +
    `<clipPath id="${uid}under"><path d="${leftOf(TOP_EDGE)}"/></clipPath>`;
  return { defs, body: face === "front" ? front(uid, ink, t) : back(uid, ink, t), clip };
}
