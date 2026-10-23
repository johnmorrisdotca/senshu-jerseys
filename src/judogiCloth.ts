// The judogi as cloth: a jacket and trousers drawn to be wrapped by the jersey volume pipeline (volume.ts).
// Original geometry. No maker, federation or sponsor mark. The lapel, vents, belt width and hem lengths
// follow the facts cited in judogiCheck; the pictures in that document are not copied.

import { hexOf, lum, shade, type Rgb } from "./colour.ts";
import { n2 } from "./path.ts";
import type { VolumeDesc } from "./volume.ts";

export interface GiInk {
  uid: string;
  cloth: Rgb;
  /** Belt fill (a colour or a pattern url) and its edge. Empty when no belt is drawn. */
  beltFill: string;
  beltEdge: string;
}

export interface Face {
  defs: string;
  body: string;
  /** Clip of the cloth, so the volume shade stays on the garment. */
  clip: string;
}

const PITCH = 9;

/** Jacket rows, half-width and half-depth. Each sleeve starts on the shoulder and the armpit, then hangs. Center x is 100. */
const JY = [20, 38, 62, 90, 128, 168, 210];
const JA = [18, 52, 46, 40, 36, 38, 42];
const JB = [10, 22, 28, 26, 24, 22, 20];
const SLEEVES: VolumeDesc["sl"] = [
  { s: -1, q: [48, 38, 22, 162, 60, 90, 55, 169] },
  { s: 1, q: [152, 38, 178, 162, 140, 90, 145, 169] },
];

/** Trousers: the hip comes down over the top of two straight legs, so the legs are not a separate piece. */
const PY = [14, 32, 70, 112];
const PA = [34, 42, 50, 48];
const PB = [12, 16, 22, 18];
const LEGS: VolumeDesc["sl"] = [
  { s: -1, q: [52, 112, 42, 258, 94, 112, 84, 258] },
  { s: 1, q: [148, 112, 158, 258, 106, 112, 116, 258] },
];

/** The belt as a short band with the knot's tails under it. */
const BY = [16, 34, 42, 88];
const BA = [74, 74, 16, 14];
const BB = [14, 14, 5, 4];

export function jacketDesc(depth = 1): VolumeDesc {
  return desc(JY, JA, JB, SLEEVES, depth);
}

export function pantsDesc(depth = 1): VolumeDesc {
  return desc(PY, PA, PB, LEGS, depth);
}

export function beltDesc(depth = 1): VolumeDesc {
  return desc(BY, BA, BB, [], depth);
}

function desc(y: number[], a: number[], b: number[], sl: VolumeDesc["sl"], depth: number): VolumeDesc {
  const k = Math.max(0.35, Math.min(1.6, depth));
  return {
    y, a, b: b.map((v) => Math.round(v * k * 10) / 10), sl, sd: [],
    nt: 10, nf: 5, nh: 6, pitch: PITCH,
  };
}

interface Tone {
  fill: string;
  seam: string;
  stitch: string;
  inside: string;
  cord: string;
  fold: number;
  hi: number;
}

function tone(cloth: Rgb): Tone {
  const light = lum(cloth) > 0.4;
  return {
    fill: hexOf(cloth),
    seam: hexOf(shade(cloth, light ? -0.32 : 0.28)),
    stitch: hexOf(shade(cloth, light ? -0.2 : 0.18)),
    inside: hexOf(shade(cloth, light ? -0.72 : -0.35)),
    cord: hexOf(shade(cloth, light ? -0.38 : 0.42)),
    fold: light ? 0.07 : 0.14,
    hi: light ? 0.14 : 0.08,
  };
}

function gradients(uid: string, t: Tone): string {
  const o = (v: number): string => String(Math.round(v * 100) / 100);
  return `<linearGradient id="${uid}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${o(t.hi)}"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o(t.fold * 1.6)}"/></linearGradient>` +
    `<linearGradient id="${uid}h" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0"><stop offset="0" stop-color="#000" stop-opacity="${o(t.fold * 2)}"/><stop offset=".22" stop-color="#000" stop-opacity="${o(t.fold * 0.3)}"/><stop offset=".5" stop-color="#fff" stop-opacity="${o(t.hi * 0.4)}"/><stop offset=".78" stop-color="#000" stop-opacity="${o(t.fold * 0.3)}"/><stop offset="1" stop-color="#000" stop-opacity="${o(t.fold * 2)}"/></linearGradient>` +
    `<pattern id="${uid}rice" width="11" height="11" patternUnits="userSpaceOnUse"><path d="M5.5 0.8 L10 5.5 L5.5 10.2 L1 5.5 Z" fill="none" stroke="${t.seam}" stroke-width="0.4" stroke-opacity="0.45"/></pattern>`;
}

function wash(uid: string, clip: string): string {
  return `<g clip-path="url(#${clip})"><rect x="0" y="0" width="200" height="280" fill="url(#${uid}v)"/><rect x="0" y="0" width="200" height="280" fill="url(#${uid}h)"/></g>`;
}

function fold(d: string, w: number, o: number): string {
  return `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${n2(o)}" stroke-width="${w}" stroke-linecap="round"/>`;
}

function lite(d: string, w: number, o: number): string {
  return `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${n2(o)}" stroke-width="${w}" stroke-linecap="round"/>`;
}

/** Outer path of the jacket: torso, then the two hanging sleeves, meeting the body at the shoulder and the armpit. */
function jacketClip(): string {
  return "M82 20 L48 38 L54 62 L60 90 L64 128 L62 168 L58 210 L142 210 L138 168 L136 128 L140 90 L146 62 L152 38 L118 20 Q100 34 82 20 Z" +
    "M48 38 L22 162 L55 169 L60 90 Z" +
    "M152 38 L178 162 L145 169 L140 90 Z";
}

function pantsClip(): string {
  // The hip block runs past the leg tops, and the legs start inside it, so the wrapped cloth has no hole at the join.
  return "M44 8 H156 V124 H44 Z" +
    "M34 96 H92 V268 H34 Z" +
    "M108 96 H166 V268 H108 Z";
}

/** Front or back of the jacket, in the 200-wide box the volume mesh samples. */
export function jacketFace(ink: GiInk, face: "front" | "back", withBelt: boolean): Face {
  const t = tone(ink.cloth);
  const uid = ink.uid;
  const clip = jacketClip();
  const id = `${uid}k`;
  let body = `<path d="${clip}" fill="${t.fill}"/>`;
  body += wash(uid, id);
  body += jacketFolds(t, face);
  body += face === "front" ? lapel(t) : backSeam(t);
  body += skirtWeave(uid, t);
  body += vents(t);
  body += cuffs(t);
  if (withBelt && ink.beltFill !== "") body += rankBelt(ink, face);
  const defs = gradients(uid, t) + `<clipPath id="${id}"><path d="${clip}"/></clipPath>`;
  return { defs, body, clip };
}

function jacketFolds(t: Tone, face: "front" | "back"): string {
  const o = t.fold;
  let d = "";
  for (const s of [-1, 1]) {
    const x = (u: number): number => 100 + s * u;
    d += fold(`M${n2(x(40))} 78 Q${n2(x(30))} 120 ${n2(x(28))} 168`, 5, o);
    d += lite(`M${n2(x(36))} 82 Q${n2(x(26))} 124 ${n2(x(24))} 164`, 2.2, t.hi);
    d += fold(`M${n2(x(36))} 40 Q${n2(x(44))} 90 ${n2(x(48))} 150`, 3.5, o * 0.7);
  }
  if (face === "front") d += fold("M78 150 Q100 162 122 150", 4, o * 0.8);
  d += fold("M62 196 Q100 204 138 196", 3.5, o * 0.7);
  return d;
}

/** Left over right: the overlap is an edge from the neck to the hip, with one row of stitching beside it. */
function lapel(t: Tone): string {
  return `<path d="M108 40 C100 78 90 122 76 178" fill="none" stroke="${t.seam}" stroke-width="1.5"/>` +
    `<path d="M116 44 C108 82 98 126 86 180" fill="none" stroke="${t.stitch}" stroke-width="0.7"/>` +
    `<path d="M82 22 Q100 12 118 22 Q110 32 100 30 Q90 32 82 22 Z" fill="${t.fill}" stroke="${t.seam}" stroke-width="0.8"/>` +
    `<path d="M92 24 Q100 30 108 24 Q100 27 92 24 Z" fill="${t.inside}"/>`;
}

function backSeam(t: Tone): string {
  return `<path d="M84 22 Q100 16 116 22 Q108 32 100 30 Q92 32 84 22 Z" fill="${t.fill}" stroke="${t.seam}" stroke-width="0.9"/>` +
    `<path d="M92 24 Q100 28 108 24 Q100 26 92 24 Z" fill="${t.inside}"/>` +
    `<path d="M100 30 V200" fill="none" stroke="${t.stitch}" stroke-width="0.8" stroke-dasharray="2.2 1.8"/>` +
    `<path d="M62 44 H138" fill="none" stroke="${t.stitch}" stroke-width="0.7" stroke-dasharray="2 2"/>`;
}

/** Diamond weave on the skirt only, light enough to read as cloth and not as a print. */
function skirtWeave(uid: string, t: Tone): string {
  return `<g clip-path="url(#${uid}k)"><rect x="54" y="128" width="92" height="84" fill="url(#${uid}rice)" opacity="0.28"/></g>` +
    `<path d="M62 130 H138" fill="none" stroke="${t.stitch}" stroke-width="0.6" stroke-dasharray="2 2" stroke-opacity="0.7"/>`;
}

function vents(t: Tone): string {
  return `<path d="M70 190 V208 M130 190 V208" fill="none" stroke="${t.seam}" stroke-width="1.1"/>` +
    `<path d="M62 202 H138" fill="none" stroke="${t.stitch}" stroke-width="0.7" stroke-dasharray="2 1.6"/>`;
}

function cuffs(t: Tone): string {
  return `<path d="M24 154 H52 M148 154 H176" fill="none" stroke="${t.stitch}" stroke-width="0.7" stroke-dasharray="2 1.6"/>`;
}

function rankBelt(ink: GiInk, face: "front" | "back"): string {
  const fill = ink.beltFill;
  const edge = ink.beltEdge;
  let d = `<path d="M48 146 H152 V162 H48 Z" fill="${fill}" stroke="${edge}" stroke-width="0.8"/>`;
  if (face === "back") return d;
  d += `<path d="M90 146 H110 V164 H90 Z" fill="${fill}" stroke="${edge}" stroke-width="0.7"/>`;
  d += `<path d="M93 164 H100 L96 200 H90 Z" fill="${fill}" stroke="${edge}" stroke-width="0.5"/>`;
  d += `<path d="M100 164 H107 L110 200 H104 Z" fill="${fill}" stroke="${edge}" stroke-width="0.5"/>`;
  return d;
}

/** Front or back of the trousers. Straight legs, square hems, loops, a bow, stitch-only knee panels. */
export function pantsFace(ink: GiInk, face: "front" | "back"): Face {
  const t = tone(ink.cloth);
  const uid = ink.uid;
  const clip = pantsClip();
  const id = `${uid}k`;
  let body = `<path d="${clip}" fill="${t.fill}"/>`;
  body += wash(uid, id);
  body += pantsFolds(t);
  body += waist(t, face);
  if (face === "front") body += bow(t);
  body += knees(t);
  body += hems(t);
  const defs = gradients(uid, t) + `<clipPath id="${id}"><path d="${clip}"/></clipPath>`;
  return { defs, body, clip };
}

function pantsFolds(t: Tone): string {
  const o = t.fold;
  let d = "";
  for (const s of [-1, 1]) {
    const x = (u: number): number => 100 + s * u;
    d += fold(`M${n2(x(28))} 100 Q${n2(x(34))} 170 ${n2(x(36))} 240`, 4.5, o);
    d += lite(`M${n2(x(24))} 104 Q${n2(x(30))} 174 ${n2(x(32))} 236`, 2, t.hi);
    d += `<path d="M${n2(x(8))} 96 V250" fill="none" stroke="${t.stitch}" stroke-width="0.7" stroke-dasharray="2.2 1.8"/>`;
  }
  return d;
}

function waist(t: Tone, face: "front" | "back"): string {
  let d = `<path d="M62 14 H138 V32 H62 Z" fill="${t.fill}" stroke="${t.seam}" stroke-width="0.8"/>`;
  d += `<path d="M64 30 H136" fill="none" stroke="${t.stitch}" stroke-width="0.7"/>`;
  for (const x of [70, 86, 114, 130]) {
    d += `<path d="M${x - 3} 15 H${x + 3} V31 H${x - 3} Z" fill="${t.fill}" stroke="${t.seam}" stroke-width="0.7"/>`;
  }
  if (face === "back") d += `<path d="M100 32 V92" fill="none" stroke="${t.stitch}" stroke-width="0.7" stroke-dasharray="2 1.8"/>`;
  return d;
}

/** A drawstring tied in a bow: two loops and two tails. */
function bow(t: Tone): string {
  const c = t.cord;
  return `<path d="M70 24 H90 M110 24 H130" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="M96 26 C88 16 74 18 78 28 C74 38 90 36 96 28" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<path d="M104 26 C112 16 126 18 122 28 C126 38 110 36 104 28" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<path d="M98 28 C92 44 86 58 80 74" fill="none" stroke="${c}" stroke-width="1.45" stroke-linecap="round"/>` +
    `<path d="M102 28 C108 44 114 58 120 74" fill="none" stroke="${c}" stroke-width="1.45" stroke-linecap="round"/>`;
}

/** Knee panels are a second layer of the same cloth: two rows of stitching, no second colour. */
function knees(t: Tone): string {
  const panel = (x: number): string =>
    `<path d="M${x} 158 H${x + 24} V198 H${x} Z M${x + 3} 162 H${x + 21} V194 H${x + 3} Z" fill="none" stroke="${t.stitch}" stroke-width="0.8"/>`;
  return panel(54) + panel(122);
}

function hems(t: Tone): string {
  return `<path d="M42 248 H80 M120 248 H158" fill="none" stroke="${t.stitch}" stroke-width="0.8" stroke-dasharray="2 1.6"/>`;
}

/** The rank belt on its own: a band, a square knot of two loops, and straight tails. */
export function beltFace(ink: GiInk, face: "front" | "back"): Face {
  const uid = ink.uid;
  const fill = ink.beltFill;
  const edge = ink.beltEdge;
  const clip = "M26 16 H174 V36 H116 V88 H100 V42 H84 V88 H74 V36 H26 Z";
  let body = `<path d="M26 18 H174 V36 H26 Z" fill="${fill}" stroke="${edge}" stroke-width="0.9"/>`;
  if (face === "front") {
    body += `<path d="M92 24 C82 14 68 18 76 28 C68 38 84 42 94 30 Z" fill="${fill}" stroke="${edge}" stroke-width="0.7"/>`;
    body += `<path d="M108 24 C118 14 132 18 124 28 C132 38 116 42 106 30 Z" fill="${fill}" stroke="${edge}" stroke-width="0.7"/>`;
    body += `<path d="M90 18 H110 V36 H90 Z" fill="${fill}" stroke="${edge}" stroke-width="0.6"/>`;
    body += `<path d="M94 36 L86 86 H98 L100 36 Z" fill="${fill}" stroke="${edge}" stroke-width="0.6"/>`;
    body += `<path d="M106 36 L114 86 H102 L100 36 Z" fill="${fill}" stroke="${edge}" stroke-width="0.6"/>`;
  }
  const defs = `<clipPath id="${uid}k"><path d="${clip}"/></clipPath>`;
  return { defs, body, clip };
}

/** The same cloth, not wrapped: a flat lay. */
export function flatFaces(jacket: Face, pants: Face, belt: Face | undefined): { defs: string; body: string } {
  const beltG = belt === undefined ? "" : `<g transform="translate(-30 214)">${belt.body}</g>`;
  return {
    defs: jacket.defs + pants.defs + (belt?.defs ?? ""),
    body: `${jacket.body}<g transform="translate(210 0)">${pants.body}</g>${beltG}`,
  };
}
