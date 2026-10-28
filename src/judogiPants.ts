// The judogi trousers (zubon): a deep waistband gathered by a drawstring tied at the front, a full hip block down to a low crotch (nearly
// two fifths of the length, as product photographs show), and two wide legs that part a little toward the hem, with reinforced knees, ending about 5 cm above the
// ankle (IJF Judogi Rules, 09 03 2022). The hip block is the volume's body and each leg one of its tubes, so the legs turn as two legs and
// not as one board. Drawn at the jacket's scale (2.63 units to the centimetre, 97 cm long for a 170 cm size). Original drawing.

import { fold, lightDefs, pieceDesc, seam, smooth, stitch, toneOf, weaves, type Face, type GiInk, type Tone } from "./judogiCloth.ts";
import { n2, poly, type Pt } from "./path.ts";
import type { VolumeDesc } from "./volume.ts";

/**
 * The rows of the hip block: the top of the waistband, its foot, the hips, and down to the crotch, where the legs begin. Below the hips
 * its cross-section goes over from one round to two (`LOBES`), so at the crotch it is the shape of the tops of the two legs and the
 * cloth runs on into them with no edge.
 */
const Y = [6, 19, 50, 80, 104];
/** The last rows are as wide as the legs' tops once the volume's padding is added, so the block has no ledge over them. */
const H = [50, 51, 53, 51, 50.2];
/**
 * Worn under the jacket, the drawstring gathers the waist to the body and the hips sit inside the jacket's skirt, as on a person: laid
 * out flat, the trousers keep their full width.
 */
const H_WORN = [39, 40.5, 45, 49, 50.2];
export const hipsOf = (worn: boolean): readonly number[] => (worn ? H_WORN : H);
/** Half depths: a person's hips, some 24 cm deep with the cloth, going over to the two legs. */
const D = [26, 28, 30, 28, 24];
/** The hips go over to the two legs gradually from the waistband down, as trousers do: the front softens between the legs, and the side wall tapers away over the whole hip rather than ending in a notch. */
const LOBES = [0, 0.1, 0.3, 0.6, 1];
const HEM = 262;

/** A leg on the picture's left: the outer top S, the outer hem P, the inner top at the crotch A, the inner hem Q. The other is its mirror. */
/** The legs start a little above the crotch, under the hip block, so the two never meet edge to edge and leave a hairline. */
const S: Pt = [48.6, 92];
const P: Pt = [45, HEM];
const A: Pt = [100, 92];
const Q: Pt = [92.5, HEM];
const mirror = (p: Pt): Pt => [200 - p[0], p[1]];

export function pantsDesc(depth = 1, worn = false): VolumeDesc {
  const sl: VolumeDesc["sl"] = [
    { s: -1, q: [S[0], S[1], P[0], P[1], A[0], A[1], Q[0], Q[1]] },
    { s: 1, q: [...mirror(S), ...mirror(P), ...mirror(A), ...mirror(Q)] },
  ];
  // The legs are round, as deep as they are wide, over a person's thighs.
  return { ...pieceDesc(Y, hipsOf(worn).map((h) => h + 1.2), D, sl, depth, 10, 4, 6, LOBES), full: 2.6, tube: 0.95 };
}

function hipOutline(h: readonly number[]): Pt[] {
  const left: Pt[] = Y.map((y, j) => [100 - (h[j] as number), y]);
  return [...left, ...[...left].reverse().map(mirror)];
}

export function legOutline(side: -1 | 1): Pt[] {
  const pts: Pt[] = [S, P, Q, A];
  return side === -1 ? pts : pts.map(mirror);
}

export function onLeg(side: -1 | 1, f: number, u: number): Pt {
  const [s, p, q, a] = legOutline(side) as [Pt, Pt, Pt, Pt];
  const o: Pt = [s[0] + (p[0] - s[0]) * f, s[1] + (p[1] - s[1]) * f];
  const i: Pt = [a[0] + (q[0] - a[0]) * f, a[1] + (q[1] - a[1]) * f];
  return [o[0] + (i[0] - o[0]) * u, o[1] + (i[1] - o[1]) * u];
}

const across = (side: -1 | 1, f: number, u0 = 0, u1 = 1): string => smooth([onLeg(side, f, u0), onLeg(side, f, (u0 + u1) / 2), onLeg(side, f, u1)]);
const down = (side: -1 | 1, u: number, f0: number, f1: number, sway = 0): string => smooth([onLeg(side, f0, u), onLeg(side, (f0 + f1) / 2, u + sway), onLeg(side, f1, u)]);

/**
 * A line down one side of the trousers, `u` of the way from the outer edge to the middle, from the waistband to the hem: across the hip
 * block first, then down the leg. The long folds follow these, so the shading runs on from the hips into the legs as the cloth does.
 */
function fall(hips: readonly number[], side: -1 | 1, u: number, sway = 0): string {
  const hipAt = (y: number): Pt => {
    let h = hips[0] as number;
    for (let j = 1; j < Y.length; j++) if (y >= (Y[j - 1] as number)) h = (hips[j - 1] as number) + (((hips[j] as number) - (hips[j - 1] as number)) * (Math.min(y, Y[j] as number) - (Y[j - 1] as number))) / ((Y[j] as number) - (Y[j - 1] as number));
    const outer = 100 + side * (h + 1.2);
    return [outer + (100 - outer) * u, y];
  };
  return smooth([hipAt(20), hipAt(56), onLeg(side, 0.1, u + sway / 2), onLeg(side, 0.5, u + sway), onLeg(side, 0.98, u)]);
}

/** The long folds of one side, waistband to hem: shadow along the outer edge and the inside leg, the light down the front, and two softer folds. */
function longFolds(h: readonly number[], t: Tone, side: -1 | 1): string {
  const outer = 0.04;
  return fold(fall(h, side, outer), 7, t.light ? 0.14 : 0.26) +
    fold(fall(h, side, 0.93), 5, t.light ? 0.12 : 0.22) +
    fold(fall(h, side, 0.44, 0.03), 9, 0.16, true) +
    fold(fall(h, side, 0.7, -0.02), 6, t.light ? 0.07 : 0.14) +
    fold(fall(h, side, 0.26, 0.02), 6, t.light ? 0.06 : 0.12);
}

/** A leg: twill cloth, its seams, the knee panel (front only) and the turned hem with a break where it would meet the foot. */
function leg(uid: string, t: Tone, side: -1 | 1, front: boolean): string {
  const out = poly(legOutline(side));
  let s = `<path d="${out}" fill="${t.fill}"/><path d="${out}" fill="url(#${uid}T)"/>`;
  s += seam(down(side, side === -1 ? 0.012 : 0.988, 0, 1), t, 0.3);
  s += seam(down(side, side === -1 ? 0.988 : 0.012, 0.02, 1), t, 0.28);
  if (front) {
    // The knee: a second layer from above the knee to below it, stitched round twice, standing a little proud of the leg.
    const k0 = 0.22;
    const k1 = 0.58;
    const panel = poly([onLeg(side, k0, 0.06), onLeg(side, k0, 0.94), onLeg(side, k1, 0.94), onLeg(side, k1, 0.06)]);
    s += `<path d="${panel}" fill="#fff" fill-opacity="${t.light ? 0.18 : 0.06}"/>`;
    s += fold(across(side, k1 + 0.006, 0.06, 0.94), 2.6, t.light ? 0.16 : 0.28);
    s += fold(across(side, k0 - 0.004, 0.06, 0.94), 1.6, 0.4, true);
    s += `<path d="${panel}" fill="none" stroke="${t.seam}" stroke-width="0.6" stroke-opacity="0.6"/>`;
    s += stitch(`${across(side, k0 + 0.012, 0.09, 0.91)}`, t, 0.38, 0.7) + stitch(`${across(side, k1 - 0.012, 0.09, 0.91)}`, t, 0.38, 0.7);
    s += stitch(down(side, 0.09, k0 + 0.012, k1 - 0.012), t, 0.38, 0.7) + stitch(down(side, 0.91, k0 + 0.012, k1 - 0.012), t, 0.38, 0.7);
  }
  // The break above the foot, and the turned hem.
  s += fold(smooth([onLeg(side, 0.885, 0.12), onLeg(side, 0.9, 0.45), onLeg(side, 0.892, 0.8)]), 9, t.light ? 0.08 : 0.16);
  s += fold(across(side, 0.965), 2.2, t.light ? 0.14 : 0.24);
  s += seam(across(side, 0.968), t, 0.55);
  s += stitch(across(side, 0.982), t);
  s += fold(across(side, 0.997), 1.4, t.light ? 0.12 : 0.22);
  return s;
}

/** The waistband: a deep turned channel round the top, gathered into small folds under it by the drawstring. */
function waistband(h: readonly number[], t: Tone): string {
  const [y0, y1] = [Y[0] as number, Y[1] as number];
  let s = seam(`M${100 - (h[1] as number)} ${y1}L${100 + (h[1] as number)} ${y1}`, t, 0.7);
  s += stitch(`M${100 - (h[0] as number)} ${y0 + 2.2}L${100 + (h[0] as number)} ${y0 + 2.2}`, t);
  s += stitch(`M${100 - (h[1] as number)} ${y1 - 2.2}L${100 + (h[1] as number)} ${y1 - 2.2}`, t);
  s += fold(`M${100 - (h[0] as number)} ${y0 + 1}L${100 + (h[0] as number)} ${y0 + 1}`, 2, 0.4, true);
  // Gathers under the band: soft, uneven, longer at the sides where the drawstring pulls the most cloth in.
  for (const [x, len] of [[58, 17], [68, 12], [78, 9], [87, 6], [113, 6], [122, 9], [132, 13], [142, 16]] as const) {
    // Placed for the full width, drawn in with a gathered waist.
    const gx = 100 + ((x - 100) * (h[1] as number)) / (H[1] as number);
    const lean = (gx - 100) * 0.05;
    s += fold(smooth([[gx, y1 + 1], [gx + lean, y1 + len / 2], [gx + lean * 1.6, y1 + len]]), 4, t.light ? 0.08 : 0.16);
    s += fold(smooth([[gx + 4, y1 + 1], [gx + 4 + lean, y1 + len * 0.6]]), 3, 0.12, true);
  }
  return s;
}

/**
 * A round cord along `d`, `w` units thick: the contact shadow it throws on the cloth (down and to the right, as the light falls), a dark
 * edge, the cord's own colour, the shade on its far side, the light along its near side, and the twist of its strands as fine ticks across
 * it. Painted as strokes, so it turns with the cloth it lies on.
 */
function cord(d: string, w: number, base: string, edge: string, light: boolean): string {
  const s = (width: number, stroke: string, extra = ""): string => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${n2(width)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const dx = n2(w * 0.2);
  const dy = n2(w * 0.26);
  return s(w + 1.5, "#1a2230", ` stroke-opacity="0.1" transform="translate(${n2(w * 0.5)} ${n2(w * 0.7)})"`) +
    s(w + 0.8, "#1a2230", ` stroke-opacity="0.2" transform="translate(${n2(w * 0.3)} ${n2(w * 0.4)})"`) +
    s(w + 0.7, edge, ' stroke-opacity="0.55"') +
    s(w, base) +
    s(w * 0.55, light ? "#b4bccb" : "#05070d", ` stroke-opacity="${light ? 0.3 : 0.4}" transform="translate(${dx} ${dy})"`) +
    s(w * 0.9, edge, ` stroke-opacity="${light ? 0.3 : 0.34}" stroke-linecap="butt" stroke-dasharray="0.35 0.95"`) +
    s(w * 0.26, "#fff", ` stroke-opacity="${light ? 0.95 : 0.5}" transform="translate(${n2(-w * 0.2)} ${n2(-w * 0.26)})"`);
}

/** A knot or a bead of cord: a rounded lump with its wraps, shade and light, `rx` by `ry` units. */
function lump(cx: number, cy: number, rx: number, ry: number, base: string, edge: string, light: boolean): string {
  return `<ellipse cx="${n2(cx + 0.5)}" cy="${n2(cy + 0.9)}" rx="${n2(rx + 0.6)}" ry="${n2(ry + 0.6)}" fill="#1a2230" fill-opacity="0.2"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${base}" stroke="${edge}" stroke-width="0.6"/>` +
    `<ellipse cx="${n2(cx + rx * 0.22)}" cy="${n2(cy + ry * 0.3)}" rx="${n2(rx * 0.7)}" ry="${n2(ry * 0.65)}" fill="${light ? "#8f98aa" : "#05070d"}" fill-opacity="${light ? 0.3 : 0.38}"/>` +
    `<path d="M${n2(cx - rx * 0.55)} ${n2(cy - ry * 0.2)}Q${cx} ${n2(cy + ry * 0.5)} ${n2(cx + rx * 0.6)} ${n2(cy - ry * 0.5)}M${n2(cx - rx * 0.4)} ${n2(cy + ry * 0.35)}Q${cx} ${n2(cy + ry * 0.9)} ${n2(cx + rx * 0.5)} ${n2(cy + ry * 0.2)}" fill="none" stroke="${edge}" stroke-width="0.35" stroke-opacity="0.7"/>` +
    `<ellipse cx="${n2(cx - rx * 0.3)}" cy="${n2(cy - ry * 0.4)}" rx="${n2(rx * 0.3)}" ry="${n2(ry * 0.18)}" fill="#fff" fill-opacity="${light ? 0.9 : 0.45}"/>`;
}

/**
 * The drawstring: a round cord (some 5 mm across) out of the waistband through two eyelets, tied in a bow at the front with two loops, a
 * knot between them and two ends that hang down over the trousers with a small knot at each tip. The cord has thickness (shadow, shading
 * across it, a light along it, the twist of its strands) and lies on the cloth, so it turns with the trousers.
 */
function drawstring(t: Tone): string {
  const base = t.light ? "#f7f4ec" : t.fill;
  const edge = t.seam;
  const light = t.light;
  const c = (d: string, w = 2.4): string => cord(d, w, base, edge, light);
  let s = "";
  for (const x of [88, 112]) s += `<ellipse cx="${x}" cy="12.5" rx="2.6" ry="1.9" fill="${t.deep}" fill-opacity="0.85"/><ellipse cx="${x}" cy="12.5" rx="2.6" ry="1.9" fill="none" stroke="${edge}" stroke-width="0.5" stroke-opacity="0.8"/>`;
  s += c("M88 12.6Q93 15.4 98 14.8", 2.3) + c("M112 12.6Q107 15.4 102 14.8", 2.3);
  // The ends first, so the knot and the loops lie over where they start; each hangs in a long soft curve and ends in a small knot.
  const endL = "M99.2 16.2C96.4 23 96.6 31 93 41";
  const endR = "M100.9 16.2C103.8 23 102.4 30 108.6 40";
  s += c(endL, 2.1) + c(endR, 2.1);
  s += lump(93, 42, 2.3, 2.1, base, edge, light) + lump(108.7, 41, 2.3, 2.1, base, edge, light);
  // The bow: two loops drooping a little, each a cord with thickness, crossing at the knot.
  s += c("M99 15.2C93.5 10.6 86 12.4 87.4 17.8C88.6 22 95 20.2 99.4 15.8", 2.2) + c("M101 15.2C106.5 10.6 114 12.4 112.6 17.8C111.4 22 105 20.2 100.6 15.8", 2.2);
  s += lump(100, 15.6, 2.7, 2.3, base, edge, light);
  return s;
}

/** The long folds of both sides, drawn over the hip block and the legs together. */
function hipSides(h: readonly number[], t: Tone): string {
  return longFolds(h, t, -1) + longFolds(h, t, 1);
}

function front(uid: string, t: Tone, h: readonly number[], marks = ""): string {
  const hip = poly(hipOutline(h));
  let s = leg(uid, t, -1, true) + leg(uid, t, 1, true);
  s += `<path d="${hip}" fill="${t.fill}"/><path d="${hip}" fill="url(#${uid}T)"/>` + hipSides(h, t);
  s += waistband(h, t);
  s += seam("M100 19C100.5 48 100 78 100 106", t, 0.55);
  s += fold(smooth([[100, 48], [100, 80], [100, 104]]), 6, t.light ? 0.09 : 0.18);
  s += marks;
  s += `<g clip-path="url(#${uid}all)"><rect x="0" y="0" width="200" height="${HEM}" fill="url(#${uid}V)"/></g>`;
  s += drawstring(t);
  return s;
}

function back(uid: string, t: Tone, h: readonly number[], marks = ""): string {
  const hip = poly(hipOutline(h));
  let s = leg(uid, t, -1, false) + leg(uid, t, 1, false);
  s += `<path d="${hip}" fill="${t.fill}"/><path d="${hip}" fill="url(#${uid}T)"/>` + hipSides(h, t);
  s += waistband(h, t);
  s += seam("M100 19C100 48 100.5 78 100 106", t, 0.6);
  // The seat: a soft curve of light over each side, and the cloth drawn in under it.
  s += fold(smooth([[64, 30], [76, 26], [92, 32]]), 10, 0.12, true) + fold(smooth([[136, 30], [124, 26], [108, 32]]), 10, 0.12, true);
  s += fold(smooth([[68, 90], [83, 97], [97, 101]]), 7, t.light ? 0.07 : 0.14) + fold(smooth([[132, 90], [117, 97], [103, 101]]), 7, t.light ? 0.07 : 0.14);
  s += marks;
  s += `<g clip-path="url(#${uid}all)"><rect x="0" y="0" width="200" height="${HEM}" fill="url(#${uid}V)"/></g>`;
  return s;
}

/** The trousers' front or back, in the 200-wide box the volume samples. */
export function pantsFace(ink: GiInk, face: "front" | "back", worn = false): Face {
  const t = toneOf(ink.cloth);
  const uid = `${ink.uid}${face === "front" ? "f" : "b"}`;
  const h = hipsOf(worn);
  const clip = [poly(hipOutline(h)), poly(legOutline(-1)), poly(legOutline(1))];
  const all = `<clipPath id="${uid}all">${clip.map((d) => `<path d="${d}"/>`).join("")}</clipPath>`;
  const mark = ink.marks?.[face];
  return { defs: weaves(uid, t) + lightDefs(uid, t) + all + (mark?.defs ?? ""), body: face === "front" ? front(uid, t, h, mark?.body) : back(uid, t, h, mark?.body), clip };
}

export const PANTS_HEM = HEM;

/** The places the rules name on the trousers' front, `left` and `right` the wearer's (the picture's right and left): under the waistband at each side, and on each leg near the hem. */
export function pantsSpots(): { waist: (w: "left" | "right") => { x: number; y: number }; leg: (w: "left" | "right") => { x: number; y: number } } {
  const side = (w: "left" | "right"): -1 | 1 => (w === "left" ? 1 : -1);
  return {
    waist: (w) => ({ x: 100 + side(w) * 30, y: 34 }),
    leg: (w) => {
      const [x, y] = onLeg(side(w), (236 - S[1]) / (HEM - S[1]), 0.28);
      return { x, y };
    },
  };
}
