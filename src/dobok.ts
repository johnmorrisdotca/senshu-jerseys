// The taekwondo dobok, a variant of the judogi drawing (judogi.ts): the same volumes, cloth and belt, with a jacket of a lighter cloth cut one of two ways.
//
// - `wt`: the pullover top with a V-neck, as World Taekwondo's rules describe it: the V-neck collar 4 cm wide and 18 to 20 cm deep, the top long enough to cover the
//   buttocks with its hem more than 15 cm above the knee cap, slits 20 to 25 cm up each side, sleeves that cover the whole arm and end less than 3 cm from the wrist,
//   trousers that do not cover the ankle bone. The collar is black for a Dan holder (senior and junior) and black and red for a Poom holder (cadet); top and trousers are
//   off-white. The national flag, 10 by 7 cm, is centred 3.5 cm under the shoulder line of the right arm, and the NOC code is printed in black on the back, in a box 30 by
//   12 cm. (World Taekwondo Guidelines on World Taekwondo Logo, Manufacturer Identification (MI), Homologation Mark (CE) and Technical Requirements for WT-recognized
//   Products, as of March 1, 2022: Kyorugi Competition Uniform #1 to #3, Poomsae Competition Uniform #1 to #3, Dobok Uniform #1.) A colour belt's (kup) collar is the
//   cloth's own white: the guidelines name a colour only for Dan and Poom.
// - `itf`: the jacket that wraps left over right and ties at the side, as the International Taekwon-Do Federation's doboks are made, with a plain white lapel. The ITF
//   approves black-belt and colour-belt doboks as separate models (ITF Umpire Rules, Appendix 8, Approved Equipment, in force January 1st, 2015); a black belt's is the
//   one with a black band along the jacket's lower edge, as the makers of those approved models make it (the published rules list the models and do not describe the
//   band). The national flag, 3 by 5 cm, is on the right front of the shirt, level with the federation's logo opposite it; a country's name is printed on the back above
//   the belt in black letters 6 to 8 cm high (ITF Tournament Rules 2023, 17.3.6.1; ITF Umpire Rules, Appendix 2, Approved Clothing, in force January 1st, 2015).
//   Holders of the 4th, 5th and 6th Dan "are not allowed to wear their Doboks with black stripes on their sleeves of the shirt and trousers during competition"
//   (ITF Tournament Rules 2023, 17.3.1): so a dobok of those degrees has them, and `dan` 4 to 6 draws a black stripe down each sleeve and each trouser leg unless it is
//   `competition`. The rules give neither their width nor their place beyond "sleeves" and "trousers"; the stripe is 3 cm wide down the outer seam, as makers sew it. The rules
//   name no trim for any other degree, so none is drawn for them. An ITF black belt "must indicate the competitor's degree" (Appendix 2): `dan` also puts it in gold Roman numerals
//   across the black belt's end.
//
// Read 2026-10-30. Only the facts are used; none of the documents' pictures or wording. No federation's emblem, logo or approval mark is drawn: the back's lettering is
// the reader's own text (a generic word by default) and the flag's spot carries the judogi's neutral placeholder unless artwork is given. The trousers are the judogi's
// without the reinforced knee (karategi.ts). Original drawing.

import { graphemes, type Rgb } from "./colour.ts";
import type { CollarBand, GiCut } from "./giCut.ts";
import type { Mark } from "./judogiCloth.ts";
import { onSleeve, sleeveOutline } from "./judogiJacket.ts";
import { hemOf, hipOutline, hipsOf, onLeg } from "./judogiPants.ts";
import { n2, poly, type Pt } from "./path.ts";
import { drawRun, layout } from "./text.ts";

export const DOBOK_CUTS = ["wt", "itf"] as const;
export type DobokCut = (typeof DOBOK_CUTS)[number];

export const DOBOK_GRADES = ["kup", "poom", "dan"] as const;
export type DobokGrade = (typeof DOBOK_GRADES)[number];

export interface JudogiDobok {
  /** `wt` (the default): the pullover with a V-neck. `itf`: the jacket that wraps left over right and ties at the side. */
  cut?: DobokCut;
  /**
   * Whose dobok: `kup` (the default, a colour belt), `poom` (a junior black belt) or `dan` (a black belt). On the `wt` cut it sets the V-neck's colour: white, black and red,
   * black. On the `itf` cut a black belt's jacket (poom or dan: the ITF has no poom grade of its own) has a black band along its lower edge.
   */
  grade?: DobokGrade;
  /** Words printed in black across the back: up to 16 characters; empty or `false` for none. "TAEKWONDO" on the `wt` cut and "TAEKWON-DO" on the `itf` cut by default. */
  lettering?: string | false;
  /** An ITF black belt's degree, 1 to 9, on the `itf` cut with grade `dan`. 4, 5 and 6 sew the black stripes down the sleeves and trouser legs, and the belt takes the degree in Roman numerals unless the belt's own style names one. */
  dan?: number;
  /** In competition, 4th to 6th Dan doboks have no black stripes (ITF Tournament Rules 2023, 17.3.1): the stripes are left off. */
  competition?: boolean;
  /** The national flag's spot (the right upper arm on `wt`, the right chest on `itf`): `true` (the default) for the neutral placeholder there, `false` for none. To sew real artwork, give the judogi's `emblem` with that `place`. */
  flag?: boolean;
}

export interface ReadDobok {
  cut: DobokCut;
  grade: DobokGrade;
  gi: GiCut;
  lettering: string;
  flag: boolean;
  /** An ITF black belt's degree, 1 to 9. */
  dan: number | undefined;
  /** Whether the black stripes of the 4th to 6th Dan are sewn on the sleeves and trouser legs. */
  stripes: boolean;
}

/** The colours of the trim: a black that is a little warm in its shadows, and the red of a poom collar. */
const TRIM_BLACK = "#1b1c21";
const TRIM_RED = "#c8202e";
const black: CollarBand = { fill: TRIM_BLACK, edge: "#08090c", stitch: "#3a3d46" };

/** At 2.63 drawing units to the centimetre. */
const CM = 2.63;
/** The most characters the back carries. */
const LETTERING_MAX = 16;

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** The cut's numbers for the jacket's drawing (giCut.ts). */
function cutOf(cut: DobokCut, grade: DobokGrade): GiCut {
  if (cut === "itf") {
    return {
      sleeve: 1, hem: 208, lapel: 9, collar: 1.3, plain: true, soft: 0.5, cuff: 0.86, vent: 9 * CM,
      // A black belt's dobok: a band some 2.5 cm high along the lower edge.
      ...(grade === "kup" ? {} : { hemBand: { ...black, h: 2.5 * CM } }),
    };
  }
  // The V-neck collar is 4 cm wide (10.5 units); the slits run 20 cm up from the hem.
  const band: CollarBand | undefined = grade === "dan" ? black : grade === "poom" ? { ...black, bands: [{ from: 0, to: 0.5, fill: TRIM_RED }] } : undefined;
  return { sleeve: 1, hem: 212, lapel: 4 * CM, collar: 1.1, plain: true, soft: 0.5, neck: "v", cuff: 0.8, vent: 20 * CM, ...(band === undefined ? {} : { band }) };
}

/** The dobok's options from outside, made safe; `undefined` when the garment is not a dobok. */
export function readDobok(raw: unknown): ReadDobok | undefined {
  if (raw !== true && (raw === null || typeof raw !== "object")) return undefined;
  const o = raw === true ? {} : (raw as JudogiDobok);
  const cut = pick(DOBOK_CUTS, o.cut, "wt");
  const grade = pick(DOBOK_GRADES, o.grade, "kup");
  const typed = typeof o.lettering === "string" ? graphemes(o.lettering.trim()).slice(0, LETTERING_MAX).join("") : undefined;
  const lettering = o.lettering === false ? "" : typed ?? (cut === "itf" ? "TAEKWON-DO" : "TAEKWONDO");
  const dan = cut === "itf" && grade === "dan" && typeof o.dan === "number" && Number.isFinite(o.dan) ? Math.max(1, Math.min(9, Math.round(o.dan))) : undefined;
  const stripes = dan !== undefined && dan >= 4 && dan <= 6 && o.competition !== true;
  return { cut, grade, gi: cutOf(cut, grade), lettering, flag: o.flag !== false, dan, stripes };
}

/** Where the flag's placeholder goes on each cut, as the judogi's emblem is told, and its size in centimetres. */
export function dobokFlag(d: ReadDobok): { place: "sleeve-right" | "chest-right"; widthCm: number; heightCm: number } {
  return d.cut === "wt" ? { place: "sleeve-right", widthCm: 10, heightCm: 7 } : { place: "chest-right", widthCm: 5, heightCm: 3 };
}

/**
 * The lettering's box on the back's drawing: across the upper back on the `wt` cut (the poomsae top's NOC code is 12 cm under the collar, in a box 30 by 12 cm), and
 * lower, above the belt, on the `itf` cut. Its height is the most a letter may be (8 cm on the `itf` cut, the box's 12 cm less a margin on the `wt` cut) and its width the box's.
 */
export function letteringBox(d: ReadDobok): { x: number; y: number; w: number; h: number } {
  return d.cut === "wt" ? { x: 100, y: 19.5 + 12 * CM, w: 30 * CM, h: 6.5 * CM } : { x: 100, y: 92, w: 30 * CM, h: 7 * CM };
}

/** The ITF's black stripe: 3 cm wide down the outer seam, 2 cm in from the edge, at 2.63 drawing units to the centimetre. */
const STRIPE_W = 3 * CM;
const STRIPE_IN = 2 * CM;

/** A strip along an edge: the edge's points moved `from` and `to` in from it, toward the side the `inner` points are on. */
function strip(edge: readonly Pt[], inner: readonly Pt[], from: number, to: number): [Pt[], Pt[]] {
  const at = (k: number, d: number): Pt => {
    const a = edge[Math.max(0, k - 1)]!;
    const b = edge[Math.min(edge.length - 1, k + 1)]!;
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    let nx = -(b[1] - a[1]) / l;
    let ny = (b[0] - a[0]) / l;
    if (nx * (inner[k]![0] - edge[k]![0]) + ny * (inner[k]![1] - edge[k]![1]) < 0) [nx, ny] = [-nx, -ny];
    return [edge[k]![0] + nx * d, edge[k]![1] + ny * d];
  };
  return [edge.map((_, k) => at(k, from)), edge.map((_, k) => at(k, to))];
}

/** A black stripe between two lines, sewn on: its cloth, a soft light along it, and a row of stitching along each edge. */
function stripeDrawing(a: readonly Pt[], b: readonly Pt[]): string {
  const line = (pts: readonly Pt[]): string => pts.map((p, k) => `${k === 0 ? "M" : "L"}${n2(p[0])} ${n2(p[1])}`).join("");
  const mid = a.map((p, i) => [(p[0] + b[i]![0]) / 2, (p[1] + b[i]![1]) / 2] as Pt);
  const inset = (pts: readonly Pt[], toward: readonly Pt[]): string => line(pts.map((p, i) => [p[0] + (toward[i]![0] - p[0]) * 0.14, p[1] + (toward[i]![1] - p[1]) * 0.14] as Pt));
  const stitch = (d: string): string => `<path d="${d}" fill="none" stroke="${black.stitch}" stroke-width="0.32" stroke-dasharray="1.2 0.8" stroke-opacity="0.9"/>`;
  const edge = (d: string): string => `<path d="${d}" fill="none" stroke="${black.edge}" stroke-opacity="0.7" stroke-width="0.5"/>`;
  return `<path d="${poly([...a, ...[...b].reverse()])}" fill="${black.fill}"/>` +
    `<path d="${line(mid)}" fill="none" stroke="#fff" stroke-opacity="0.07" stroke-width="${n2(STRIPE_W * 0.3)}"/>` +
    edge(line(a)) + edge(line(b)) + stitch(inset(a, b)) + stitch(inset(b, a));
}

/** The stripe down each sleeve, from just under the armhole's seam to above the cuff's hem, clipped to the sleeve's own cloth. */
function sleeveStripes(d: ReadDobok, id: string): Mark {
  const { sleeve, cuff = 1 } = d.gi;
  let defs = "";
  let body = "";
  for (const side of [-1, 1] as const) {
    const fs = Array.from({ length: 17 }, (_, k) => 0.06 + (0.82 * k) / 16);
    const [a, b] = strip(fs.map((f) => onSleeve(side, f, 0, sleeve, cuff)), fs.map((f) => onSleeve(side, f, 1, sleeve, cuff)), STRIPE_IN, STRIPE_IN + STRIPE_W);
    const clip = `${id}${side === -1 ? "L" : "R"}`;
    defs += `<clipPath id="${clip}"><path d="${poly(sleeveOutline(side, sleeve, cuff))}"/></clipPath>`;
    body += `<g clip-path="url(#${clip})">${stripeDrawing(a, b)}</g>`;
  }
  return { defs, body };
}

/** The back's lettering, printed in black: bold strokes, with a hair of the cloth's shadow under each letter where the print sits on the weave; and a 4th to 6th Dan's sleeve stripes. */
export function dobokMarks(d: ReadDobok, cloth: { fill: string; seam: string }, uid = "dob"): { front?: Mark; back?: Mark } {
  const joined = (a: Mark | undefined, b: Mark | undefined): Mark | undefined => (a === undefined ? b : b === undefined ? a : { defs: a.defs + b.defs, body: a.body + b.body });
  const front = joined(d.cut === "itf" ? { defs: "", body: itfTies(cloth.fill, cloth.seam, ITF_TIES) } : undefined, d.stripes ? sleeveStripes(d, `${uid}Sf`) : undefined);
  const stripes = d.stripes ? sleeveStripes(d, `${uid}Sb`) : undefined;
  let lettering: Mark | undefined;
  if (d.lettering !== "") {
    const box = letteringBox(d);
    const run = layout(d.lettering, box.x, box.y, { height: box.h, maxWidth: box.w, weight: "black", tracking: 0.35 });
    lettering = { defs: "", body: `<g opacity="0.16" transform="translate(0.25 0.35)">${drawRun(run, "#1a2230", undefined, undefined)}</g>${drawRun(run, TRIM_BLACK, undefined, undefined)}` };
  }
  const back = joined(lettering, stripes);
  return { ...(front === undefined ? {} : { front }), ...(back === undefined ? {} : { back }) };
}

/** The stripe down the outer seam of each trouser leg: from under the waistband when the trousers lie flat (worn, the jacket's skirt hides the hips) to above the hem's break; `hemCm` is how far above the ankle bone the hem stops. */
export function dobokPantsMarks(d: ReadDobok, hemCm: number, worn = false): { front?: Mark; back?: Mark } {
  if (!d.stripes) return {};
  const hem = hemOf(hemCm);
  const hips = hipOutline(hipsOf(false));
  let body = "";
  for (const side of [-1, 1] as const) {
    const fs = Array.from({ length: 13 }, (_, k) => (0.9 * k) / 12);
    // The hip block's outer edge from the waistband down, as the flat trousers draw it (their rows 19, 50 and 80).
    const top: Pt[] = worn ? [] : [1, 2, 3].map((j) => (side === -1 ? hips[j]! : [200 - hips[j]![0], hips[j]![1]] as Pt));
    const edge = [...top, ...fs.map((f) => onLeg(side, f, 0, hem))];
    const inner = [...top.map((p): Pt => [100, p[1]]), ...fs.map((f) => onLeg(side, f, 1, hem))];
    const [a, b] = strip(edge, inner, STRIPE_IN / 2, STRIPE_IN / 2 + STRIPE_W);
    body += stripeDrawing(a, b);
  }
  const mark: Mark = { defs: "", body };
  return { front: mark, back: mark };
}

/** What the rules this cut follows say of it, as checks: each is met or not, and the fact is cited. */
export function dobokNotes(d: ReadDobok, colour: Rgb | "white"): { id: string; met: boolean; fact: string }[] {
  const white = colour === "white";
  if (d.cut === "wt") {
    const wt = "World Taekwondo Guidelines on WT Logo, MI, CE and Technical Requirements, as of March 1, 2022";
    const collar = d.grade === "dan" ? "black, for a Dan holder" : d.grade === "poom" ? "black and red, for a Poom holder" : "the cloth's own white, for a colour belt (the guidelines name a colour only for Dan and Poom)";
    return [
      { id: "dobok-v-neck", met: true, fact: `The top has a V-neck collar 4 cm wide, the neck 18 to 20 cm deep (${wt}, Kyorugi Competition Uniform #2).` },
      { id: "dobok-collar", met: true, fact: `The V-neck collar is black for senior and junior Dan holders and black and red for cadet Poom holders; here it is ${collar} (${wt}, Dobok Uniform #1).` },
      { id: "dobok-top", met: true, fact: `The top covers the buttocks, its hem more than 15 cm above the knee cap, with slits 20 to 25 cm up each side; the sleeves cover the whole arm and end less than 3 cm from the wrist (${wt}, Kyorugi Competition Uniform #2).` },
      { id: "dobok-trousers", met: true, fact: `The trousers do not cover the ankle bone (${wt}, Kyorugi Competition Uniform #3).` },
      { id: "dobok-colour", met: white, fact: `Top and trousers are off-white (${wt}, Kyorugi Competition Uniform #2); a poomsae top and trousers take the colours of the division instead.` },
      { id: "dobok-flag", met: true, fact: `The national flag, 10 by 7 cm, is centred 3.5 cm under the shoulder line of the right arm (${wt}, Dobok Uniform #1).` },
      { id: "dobok-back", met: graphemes(d.lettering).length <= LETTERING_MAX, fact: `The NOC code is printed in black on the back in a box 30 by 12 cm (${wt}, Dobok Uniform #1 and Poomsae Competition Uniform #3).` },
    ];
  }
  const rules = "ITF Tournament Rules 2023";
  const app2 = "ITF Umpire Rules, Appendix 2, Approved Clothing (in force January 1st, 2015)";
  return [
    { id: "dobok-itf-approved", met: true, fact: `Competitors wear ITF-approved doboks (${rules}, 17.3.1); black-belt and colour-belt doboks are approved as separate models (ITF Umpire Rules, Appendix 8, Approved Equipment, in force January 1st, 2015).` },
    { id: "dobok-itf-hem", met: true, fact: `A black belt's dobok has a black band along the jacket's lower edge, as the makers of the approved black-belt models make it; the published rules do not describe it. Here it is ${d.grade === "kup" ? "left off, for a colour belt" : "drawn, for a black belt"}.` },
    { id: "dobok-itf-stripes", met: true, fact: `A 4th, 5th or 6th Dan's dobok has black stripes on the sleeves of the shirt and on the trousers, and "during competition" those holders may not wear them (${rules}, 17.3.1); the rules give no width or place, none for any other degree, and here ${d.dan === undefined || d.dan < 4 || d.dan > 6 ? "none are drawn" : d.stripes ? `the stripes of the ${d.dan}th Dan are drawn, 3 cm wide down the outer seams (the package's reading)` : "the stripes are left off, for competition"}.` },
    { id: "dobok-itf-flag", met: true, fact: `The national flag, 3 by 5 cm, is on the right front of the shirt, level with the federation's logo opposite (${rules}, 17.3.6.1; ${app2}).` },
    { id: "dobok-itf-back", met: graphemes(d.lettering).length <= LETTERING_MAX, fact: `The country's name is printed on the back above the belt, in black letters 6 to 8 cm high (${app2}).` },
    { id: "dobok-colour", met: white, fact: `The dobok is white (${app2}).` },
  ];
}

/** Where the `itf` jacket's outer ties are on the front's drawing: from the top panel's free edge, a hand above the belt, to the side seam on the wearer's right. */
const ITF_TIES = { edge: [85.6, 103] as [number, number], side: [55, 106] as [number, number] };

/** The ties of the `itf` jacket: the top panel's corner tied at the wearer's right side, two short cloth ties knotted between the panel's edge and the side seam, their ends hanging. */
export function itfTies(cloth: string, seam: string, at: { edge: [number, number]; side: [number, number] }): string {
  const [ex, ey] = at.edge;
  const [sx, sy] = at.side;
  const kx = sx + (ex - sx) * 0.42;
  const ky = (ey + sy) / 2 + 1.2;
  const w = 2.4;
  const strip = (d: string, width: number): string =>
    `<path d="${d}" fill="none" stroke="${seam}" stroke-opacity="0.55" stroke-width="${n2(width + 0.9)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${cloth}" stroke-width="${n2(width)}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="${n2(width * 0.28)}" transform="translate(-0.2 -0.35)" stroke-linecap="round"/>`;
  const shadow = `<path d="M${n2(sx)} ${n2(sy + 1.4)}Q${n2(kx)} ${n2(ky + 2.6)} ${n2(ex)} ${n2(ey + 1.4)}" fill="none" stroke="#1a2230" stroke-opacity="0.12" stroke-width="3.4" stroke-linecap="round"/>`;
  const ends = strip(`M${n2(kx)} ${n2(ky)}Q${n2(kx - 2.2)} ${n2(ky + 6)} ${n2(kx - 3)} ${n2(ky + 12.5)}`, w * 0.9) + strip(`M${n2(kx)} ${n2(ky)}Q${n2(kx + 1.6)} ${n2(ky + 6.5)} ${n2(kx + 1.4)} ${n2(ky + 13.5)}`, w * 0.9);
  const across = strip(`M${n2(sx)} ${n2(sy)}Q${n2((sx + kx) / 2)} ${n2(ky + 0.6)} ${n2(kx)} ${n2(ky)}`, w) + strip(`M${n2(ex)} ${n2(ey)}Q${n2((ex + kx) / 2)} ${n2(ky + 0.6)} ${n2(kx)} ${n2(ky)}`, w);
  const knot = `<ellipse cx="${n2(kx)}" cy="${n2(ky)}" rx="2.3" ry="1.9" fill="${cloth}" stroke="${seam}" stroke-opacity="0.6" stroke-width="0.5"/><path d="M${n2(kx - 1.4)} ${n2(ky - 0.6)}Q${n2(kx)} ${n2(ky + 0.8)} ${n2(kx + 1.4)} ${n2(ky - 0.4)}" fill="none" stroke="${seam}" stroke-opacity="0.5" stroke-width="0.4"/>`;
  return shadow + ends + across + knot;
}
