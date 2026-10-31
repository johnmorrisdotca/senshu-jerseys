// How a belt is tied: how many times it goes round, how its two ends fall from the square knot, and how far they hang. Judo's belt goes round twice and its ends
// part from the knot in a V, 20 to 30 cm long (IJF Judogi Rules, 09 03 2022). The arts that wear the belt long let the ends hang down side by side: a karate gi's
// belt leaves at least 15 cm free each side of the knot and may reach three-quarters of the thigh in a WKF bout (WKF Kumite Competition Rules 2024, Article 2), and
// karateka wear it much longer than judoka in training (Wikipedia, "Karate gi"), the ends reaching about the knee in John's reference photograph. An ITF black belt is
// "of sufficient length to wrap only one time around the waist" (ITF Umpire Rules, Appendix 2, Approved Clothing, in force January 1st, 2015), so its ends hang long too.
// Only geometry is here: the strap (judogiStrap.ts) and the flat drawing (judogiBelt.ts) both lay their ends from it. Original drawing.

import type { Pt } from "./path.ts";

/** `spread`: tied twice round, the ends parting from the knot in a V (judo's). `hanging`: tied twice round, the ends hanging down side by side (a long karate or WT belt). `single`: once round, the ends hanging (the ITF's rule). */
export const BELT_KNOTS = ["spread", "hanging", "single"] as const;
export type BeltKnot = (typeof BELT_KNOTS)[number];

/** How far the ends hang from the knot, in centimetres: what can be drawn (the shortest the WKF allows to a little past the knee). */
export const BELT_TAIL_CM = { min: 15, max: 55 } as const;

/** The judogi's own: the IJF's 25 cm (20 to 30), in a V. */
export const JUDO_TIE = { knot: "spread", tailCm: 25 } as const satisfies BeltTie;

export interface BeltTie {
  knot: BeltKnot;
  tailCm: number;
}

/** At 2.63 drawing units to the centimetre: the length of each end (the picture's left and right) when it hangs 25 cm, from under the knot to its cut end. */
export const END_LENGTH_25 = [65.97, 60.52] as const;

/** Where each end leaves the knot on the 200-wide drawing (the belt's middle at x 100), as offsets from the knot's middle, and the way it falls for each knot. */
const FROM: readonly [Pt, Pt] = [[96, 6], [105, 5]];
const FALL: Record<BeltKnot, readonly [Pt, Pt]> = {
  spread: [[-16, 64], [14, 58.88]],
  hanging: [[-10, 64], [9, 64]],
  single: [[-9, 64], [8, 64]],
};

/** A tie from what was asked, or the garment's own where nothing (or nothing that can be drawn) was. */
export function readTie(knot: unknown, tailCm: unknown, own: BeltTie = JUDO_TIE): BeltTie {
  const k = typeof knot === "string" && (BELT_KNOTS as readonly string[]).includes(knot) ? (knot as BeltKnot) : own.knot;
  const t = typeof tailCm === "number" && Number.isFinite(tailCm) ? Math.max(BELT_TAIL_CM.min, Math.min(BELT_TAIL_CM.max, tailCm)) : own.tailCm;
  return { knot: k, tailCm: Math.round(t * 10) / 10 };
}

/** Whether a tie is the judogi's own (a drawing that carries nothing of it). */
export const isJudoTie = (t: BeltTie | undefined): boolean => t === undefined || (t.knot === JUDO_TIE.knot && t.tailCm === JUDO_TIE.tailCm);

/** How many times the belt goes round. */
export const wrapsOf = (t: BeltTie | undefined): 1 | 2 => (t?.knot === "single" ? 1 : 2);

/** The length of each hanging end in drawing units (the picture's left, then its right): the right one a little shorter, as a belt is never tied quite even. */
export function endLengths(t: BeltTie | undefined): [number, number] {
  const k = (t?.tailCm ?? 25) / 25;
  // Judo's V is the strap's own two ends, scaled; the others are the same lengths laid straighter.
  if ((t?.knot ?? "spread") === "spread") return [Math.hypot(...FALL.spread[0]) * k, Math.hypot(...FALL.spread[1]) * k];
  return [END_LENGTH_25[0] * k, END_LENGTH_25[1] * k];
}

/** The two hanging ends, each from under the knot to its cut end, for a knot whose middle is `cy` down: the picture's left end, then its right. */
export function tieEnds(t: BeltTie | undefined, cy: number): [Pt, Pt][] {
  const fall = FALL[t?.knot ?? "spread"];
  const lengths = endLengths(t);
  return [0, 1].map((i) => {
    const [fx, fy] = FROM[i] as Pt;
    const [dx, dy] = fall[i] as Pt;
    const k = (t?.knot ?? "spread") === "spread" ? (t?.tailCm ?? 25) / 25 : (lengths[i] as number) / Math.hypot(dx, dy);
    return [[fx, cy + fy], [fx + dx * k, cy + fy + dy * k]] as [Pt, Pt];
  });
}

/** How far below the knot's middle the lower of the two ends reaches. */
export function tieReach(t: BeltTie | undefined): number {
  return Math.max(...tieEnds(t, 0).map(([, to]) => to[1]));
}

/**
 * Each garment's own tie, as the belt is worn with it: the judogi's ends 25 cm in a V; the karate gi's hanging side by side to just above the knee, about 50 cm (John's
 * reference photograph; the WKF's least is 15 cm), and in the kumite and kata cuts 25 cm, inside the WKF's 15 cm to three-quarters of the thigh; the WT dobok's twice round and hanging about 38 cm; the ITF dobok's once round, its ends the longer for it, about 40 cm.
 * The lengths past the rules' least are the package's reading of the photographs, not a rule.
 */
export const GARMENT_TIES = {
  judogi: JUDO_TIE,
  bjj: { knot: "hanging", tailCm: 25 },
  karate: { knot: "hanging", tailCm: 50 },
  "karate-competition": { knot: "hanging", tailCm: 25 },
  "dobok-wt": { knot: "hanging", tailCm: 38 },
  "dobok-itf": { knot: "single", tailCm: 40 },
} as const satisfies Record<string, BeltTie>;
