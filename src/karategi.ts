// The karate gi (karategi), a variant of the judogi drawing: the same jacket, trousers and belt on the same volumes, cut and cloth changed. A karate gi's cloth is lighter
// and plainer (one fine weave, no quilted skirt, no waist seam, a single hem, softer folds), its lapel narrower, its sleeves cut to the wrist, to mid-forearm or to the
// elbow, its belt ends longer. Kanji are stitched down the wearer's left chest beside the lapel, and a round patch sits on the left sleeve and the left leg (neutral
// placeholder art, no style's or federation's badge).
//
// Sources, read 2026-10-30. The World Karate Federation's Kumite Competition Rules (valid from 1.1.2024, Article 2, 2.2.1) and its Karate Competition Rules (effective from
// 1.1.2020, Article 2, Competitors) give the same measures for a competition gi: the jacket, tightened with the belt, covers the hips and is no longer than three-quarters of the
// thigh; the sleeves are no longer than the bend of the wrist and no shorter than halfway down the forearm, never rolled up; the trousers cover at least two thirds of the shin and
// do not reach below the anklebone; the belt is about five centimetres wide, long enough to leave fifteen centimetres free each side of the knot and no longer than three-quarters of
// the thigh; the gi is white without stripes, piping or personal embroidery, the national emblem or flag on the left breast at most 12 by 8 cm and only the maker's original labels;
// in kumite the belt is red or blue by the draw and an official event's gi carries embroidered brands on the shoulders in that colour. Wikipedia's "Karate gi" names three cuts
// (Japanese, with shorter sleeves and trousers and a longer lapel; European, with longer ones and a shorter lapel; Kata, the rarest, with the shortest sleeves) and the usual cloth
// (12 to 16 oz cotton canvas, a lighter summer-shirt cloth in cheap suits) and says karateka wear the obi much longer than judoka. Which cut a style wears (Shotokan, Kyokushin
// and others) is a matter of custom, not of a published rule: the sleeve, cut and belt options let a person choose it, and no style's name is used. The kumite and kata cuts
// here are drawn from the competition rules' limits above and from makers' descriptions of a lighter kumite cloth and a crisper kata one, which are not a standard.
// Original drawing; no federation, brand, team or sponsor mark.

import { graphemes, hexOf, type Rgb } from "./colour.ts";
import type { GiCut } from "./giCut.ts";
import { chestSpan, onSleeve } from "./judogiJacket.ts";
import { corners } from "./judogiPlaces.ts";
import { FONT_STACKS } from "./judogiMarks.ts";
import { patchMm, PATCH_MM } from "./judogiPatch.ts";
import { onLeg } from "./judogiPants.ts";
import { readThread, satinDefs, satinRun, satinStroke, type ThreadColour } from "./judogiThread.ts";
import { fold, smooth, toneOf, type Mark } from "./judogiCloth.ts";
import { n2, poly, type Pt } from "./path.ts";
import { layout } from "./text.ts";

export const KARATE_SLEEVES = ["full", "three-quarter", "short"] as const;
export type KarateSleeve = (typeof KARATE_SLEEVES)[number];

export const KARATE_CUTS = ["training", "kumite", "kata"] as const;
export type KarateCut = (typeof KARATE_CUTS)[number];

/** How far down the full sleeve each length goes: to the bend of the wrist; halfway down the forearm, the shortest the WKF allows; the elbow. */
export const KARATE_SLEEVE_SHARE: Record<KarateSleeve, number> = { full: 1, "three-quarter": 0.76, short: 0.52 };

/**
 * What each cut changes, in the drawing's units (2.63 to the centimetre): the jacket's hem (a kumite jacket just covers the hips, a kata one hangs nearer three-quarters of the
 * thigh), how soft its folds are (a lighter cloth hangs in softer ones), and how long the belt's ends are by default.
 */
const CUTS: Record<KarateCut, { hem: number; soft: number; tailCm: number }> = {
  training: { hem: 200, soft: 0.6, tailCm: 50 },
  kumite: { hem: 193, soft: 0.42, tailCm: 20 },
  kata: { hem: 211, soft: 0.85, tailCm: 20 },
};

/** The belt's free ends: at least the 15 cm the WKF names, and as far as the usual 25 cm drawing can be stretched. */
export const KARATE_TAIL_CM = { min: 15, max: 70 } as const;

/** What is stitched down the lapel when none is asked for: "karate" in two characters. */
export const KARATE_TEXT = "空手";
/** The most characters, one over the next: four fit between the lapel and the sleeve's head. */
const TEXT_MAX = 4;
/** The height of the chest the column may use, in the drawing's units: from under the collar to above the belt. */
const TEXT_ROOM = 66;

export interface JudogiKarate {
  /** How far down the arm the sleeve goes: `full` (to the wrist), `three-quarter` (halfway down the forearm) or `short` (the elbow). Full by default. */
  sleeve?: KarateSleeve;
  /** `training` (the default), `kumite` (a lighter cloth and a short jacket) or `kata` (a crisper cloth and a longer jacket). The two competition cuts carry no text or patches unless they are asked for. */
  cut?: KarateCut;
  /** The characters stitched down the wearer's left chest beside the lapel, one over the next (up to four); empty or `false` for none. "空手" (karate) by default on the training cut. */
  text?: string | false;
  /** The thread of the text, a preset or `#rrggbb`: navy by default. */
  thread?: ThreadColour | string;
  /** The round patches on the wearer's left sleeve and left leg: `true` for both, `false` for none, or an object that leaves one out with `sleeve: false` or `leg: false`; the training cut has both by default. */
  patches?: boolean | { sleeve?: boolean; leg?: boolean; colour?: ThreadColour | string };
  /** How far the belt's ends hang from the knot, in centimetres, 15 to 70: 50 on the training cut, 20 on the competition cuts. */
  tailCm?: number;
}

export interface ReadKarate {
  sleeve: KarateSleeve;
  cut: KarateCut;
  gi: GiCut;
  text: string;
  thread: { name: string; rgb: Rgb };
  sleevePatch: boolean;
  legPatch: boolean;
  patchColour: { name: string; rgb: Rgb };
  tailCm: number;
  /** Whether the text, the patches or the belt's length were asked for rather than being the cut's own. */
  asked: { text: boolean; patches: boolean };
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** The karate gi's options from outside, made safe; `undefined` when the garment is a judogi. */
export function readKarate(raw: unknown): ReadKarate | undefined {
  if (raw !== true && (raw === null || typeof raw !== "object")) return undefined;
  const o = raw === true ? {} : (raw as JudogiKarate);
  const sleeve = pick(KARATE_SLEEVES, o.sleeve, "full");
  const cut = pick(KARATE_CUTS, o.cut, "training");
  const c = CUTS[cut];
  const training = cut === "training";
  const typed = typeof o.text === "string" ? graphemes(o.text.trim()).filter((g) => g !== " ").slice(0, TEXT_MAX).join("") : undefined;
  const text = o.text === false ? "" : typed !== undefined ? typed : training ? KARATE_TEXT : "";
  const p = o.patches;
  const set = p !== null && typeof p === "object" ? p : undefined;
  const sleevePatch = p === true || (set !== undefined ? set.sleeve !== false : p === undefined && training);
  const legPatch = p === true || (set !== undefined ? set.leg !== false : p === undefined && training);
  const tail = typeof o.tailCm === "number" && Number.isFinite(o.tailCm) ? Math.max(KARATE_TAIL_CM.min, Math.min(KARATE_TAIL_CM.max, o.tailCm)) : c.tailCm;
  return {
    sleeve, cut,
    gi: { sleeve: KARATE_SLEEVE_SHARE[sleeve], hem: c.hem, lapel: 9.2, collar: 1.6, plain: true, soft: c.soft },
    text,
    thread: readThread(o.thread, "navy"),
    sleevePatch, legPatch,
    patchColour: readThread(set?.colour, "red"),
    tailCm: tail,
    asked: { text: o.text !== undefined, patches: p !== undefined },
  };
}

/** The belt's ends as a multiple of the usual 25 cm. */
export const karateTail = (k: ReadKarate): number => (k.tailCm === 25 ? 1 : k.tailCm / 25);

/** What the competition rules say of this gi, as checks: each is met or not, and the fact is cited. */
export function karateNotes(k: ReadKarate, heightCm: number, colour: "white" | "blue"): { id: string; met: boolean; fact: string }[] {
  const wkf = "WKF Kumite Competition Rules (valid from 1.1.2024) Article 2, and Karate Competition Rules (effective from 1.1.2020) Article 2";
  const competition = k.cut !== "training";
  const thigh = Math.round(heightCm * 0.245 * 0.75);
  return [
    { id: "karate-jacket", met: true, fact: `The jacket, tightened with the belt, covers the hips and is no longer than three-quarters of the thigh (${wkf}).` },
    { id: "karate-sleeve", met: k.sleeve !== "short", fact: `The sleeves are no longer than the bend of the wrist and no shorter than halfway down the forearm, and are not rolled up (${wkf}); the short sleeve ends at the elbow, outside that range.` },
    { id: "karate-trouser", met: true, fact: `The trousers cover at least two thirds of the shin and do not reach below the anklebone (${wkf}).` },
    { id: "karate-belt-ends", met: k.tailCm >= 15 && (!competition || k.tailCm <= thigh), fact: `The belt leaves at least 15 cm free on each side of the knot and is no longer than three-quarters of the thigh, about ${thigh} cm at this height (${wkf}); a karateka's belt in training is often much longer (Wikipedia, Karate gi).` },
    { id: "karate-plain", met: !competition || (colour === "white" && k.text === "" && !k.sleevePatch && !k.legPatch), fact: `A competition gi is white, without stripes, piping or personal embroidery; only the national emblem or flag on the left breast and the maker's original labels may show (${wkf}).` },
  ];
}

/** Where the karate gi's own marks go on the jacket's and the trousers' front drawings: the text's box (turned with the lapel), and the middle and radius of each round patch. */
export function karateSpots(k: ReadKarate): { text?: { x: number; y: number; w: number; h: number; rot: number; size: number; step: number }; sleeve?: { x: number; y: number; r: number }; leg?: { x: number; y: number; r: number } } {
  const out: ReturnType<typeof karateSpots> = {};
  const chars = graphemes(k.text);
  if (chars.length > 0) {
    // A column beside the lapel's band, a centimetre from it, each character upright and the column leaning with the lapel; four characters are made smaller to fit the chest's height.
    const size = Math.min(7.5 * 2.63, TEXT_ROOM / (1 + 1.08 * (chars.length - 1)));
    const step = size * 1.08;
    const top = 40;
    const h = (chars.length - 1) * step + size;
    const box = { x: 0, y: top + h / 2, w: size, h, rot: 7 };
    // Moved right until every corner is a centimetre clear of the band's edge, which runs down and to the left under the column.
    const shift = Math.max(...corners(box).map(([cx, cy]) => chestSpan(cy, k.gi)[0] + 2.63 - cx));
    out.text = { ...box, x: shift, size, step };
  }
  if (k.sleevePatch) {
    const [x, y] = onSleeve(1, Math.min(0.62, 0.3 / k.gi.sleeve), 0.5, k.gi.sleeve);
    out.sleeve = { x, y, r: 4.2 * 2.63 };
  }
  if (k.legPatch) {
    const [x, y] = onLeg(1, 0.17, 0.42);
    out.leg = { x, y, r: 3.8 * 2.63 };
  }
  return out;
}

/** The marks the karate gi carries of its own: on the jacket's front and the trousers' front. */
export function karateMarks(uid: string, k: ReadKarate, cloth: Rgb, pantsUid: string): { jacket?: Mark; pants?: Mark } {
  const out: { jacket?: Mark; pants?: Mark } = { pants: plainKnees(pantsUid, cloth) };
  const join = (a: Mark | undefined, b: Mark): Mark => (a === undefined ? b : { defs: a.defs + b.defs, body: a.body + b.body });
  const at = karateSpots(k);
  if (at.text !== undefined) out.jacket = join(out.jacket, lapelText(`${uid}t`, k, at.text));
  if (at.sleeve !== undefined) out.jacket = join(out.jacket, roundPatch(`${uid}s`, at.sleeve.x, at.sleeve.y, at.sleeve.r, k.patchColour.rgb));
  if (at.leg !== undefined) out.pants = join(out.pants, roundPatch(`${uid}l`, at.leg.x, at.leg.y, at.leg.r, k.patchColour.rgb));
  return out;
}

/**
 * A karate gi's trousers have no reinforced knee: the judogi's knee panel is covered with the leg's own twill and the legs' long folds are drawn again across it (the judogi's
 * trousers, judogiPants.ts, carry the panel, so the karate gi draws over it). `uid` is the trousers' front face's, whose twill pattern the cover uses.
 */
function plainKnees(uid: string, cloth: Rgb): Mark {
  const t = toneOf(cloth);
  const f0 = 0.205;
  const f1 = 0.605;
  let body = "";
  for (const side of [-1, 1] as const) {
    const cover = poly([onLeg(side, f0, 0.045), onLeg(side, f0, 0.955), onLeg(side, f1, 0.955), onLeg(side, f1, 0.045)]);
    body += `<path d="${cover}" fill="${t.fill}"/><path d="${cover}" fill="url(#${uid}T)"/>`;
    // The long folds as the trousers draw them down the leg: where each lies across the leg, and how far it sways at the middle of the leg.
    const run = (u: number, sway: number, w: number, o: number, light = false): string => {
      const at = (f: number): Pt => onLeg(side, f, u + sway * (f < 0.5 ? 0.5 + ((f - 0.1) / 0.4) * 0.5 : 1 - (f - 0.5) / 0.48));
      return fold(smooth([f0, (f0 * 2 + f1) / 3, (f0 + f1 * 2) / 3, f1].map(at)), w, o, light);
    };
    body += run(0.04, 0, 7, t.light ? 0.14 : 0.26) + run(0.93, 0, 5, t.light ? 0.12 : 0.22) + run(0.44, 0.03, 9, 0.16, true) + run(0.7, -0.02, 6, t.light ? 0.07 : 0.14) + run(0.26, 0.02, 6, t.light ? 0.06 : 0.12);
  }
  return { defs: "", body };
}

/** The characters down the chest beside the lapel, in thread: the same column the embroidery's `down` direction sets, each character upright, one under the next. */
function lapelText(id: string, k: ReadKarate, at: NonNullable<ReturnType<typeof karateSpots>["text"]>): Mark {
  const chars = graphemes(k.text);
  const rgb = k.thread.rgb;
  const runs = chars.map((c, i) => layout(c, 0, (i - (chars.length - 1) / 2) * at.step, { height: at.size, maxWidth: at.size * 1.3, weight: "bold", asText: true }));
  const column = runs.map((run) => satinRun(run, rgb, `${id}S`, FONT_STACKS.gyosho, undefined, k.text)).join("");
  return { defs: satinDefs(`${id}S`, rgb), body: `<g transform="translate(${n2(at.x)} ${n2(at.y)}) rotate(${at.rot})">${column}</g>` };
}

/**
 * A round patch sewn on: its cut edge standing off the cloth by its thickness, a woven disc with a turned edge, a satin ring and, inside it, a plain eight-point star:
 * nobody's badge. `r` is its radius in the drawing's units, centred on `(x, y)`.
 */
function roundPatch(id: string, x: number, y: number, r: number, ring: Rgb): Mark {
  const mm = patchMm(undefined);
  const t = (mm * 2.63) / 10;
  const base: Rgb = [250, 248, 243];
  const lo = "#6b7384";
  const wall = "#9aa1b2";
  const deep = "#555d70";
  const circle = (dx: number, dy: number, rr: number, fill: string, o = 1): string => `<circle cx="${n2(x + dx)}" cy="${n2(y + dy)}" r="${n2(rr)}" fill="${fill}" fill-opacity="${o}"/>`;
  let under = circle(t * 0.5, t * 0.9, r + t * 1.6, "#1a2230", 0.05) + circle(t * 0.5, t * 0.9, r + t * 0.9, "#1a2230", 0.09);
  for (let i = 4; i >= 1; i--) under += circle((t * 0.5 * i) / 4, (t * 0.9 * i) / 4, r, i / 4 > 0.5 ? deep : wall);
  under += `<g data-thick="${mm.toFixed(1)}" data-min="${PATCH_MM.min}">${circle(0, 0, r, hexOf(base))}</g>`;
  const inner = r - 1.6;
  const star = Array.from({ length: 16 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 8;
    const rr = i % 2 === 0 ? inner * 0.62 : inner * 0.26;
    return `${n2(x + rr * Math.cos(a))} ${n2(y + rr * Math.sin(a))}`;
  });
  const ringPath = `M${n2(x - r + 1.1)} ${n2(y)}a${n2(r - 1.1)} ${n2(r - 1.1)} 0 1 0 ${n2(2 * r - 2.2)} 0a${n2(r - 1.1)} ${n2(r - 1.1)} 0 1 0 ${n2(-(2 * r - 2.2))} 0`;
  const inRing = `M${n2(x - inner * 0.8)} ${n2(y)}a${n2(inner * 0.8)} ${n2(inner * 0.8)} 0 1 0 ${n2(inner * 1.6)} 0a${n2(inner * 0.8)} ${n2(inner * 0.8)} 0 1 0 ${n2(-inner * 1.6)} 0`;
  const weave = `<pattern id="${id}W" width="1.1" height="1.1" patternUnits="userSpaceOnUse"><rect width="0.55" height="0.55" fill="${lo}" fill-opacity="0.07"/><rect x="0.55" y="0.55" width="0.55" height="0.55" fill="${lo}" fill-opacity="0.07"/></pattern>`;
  const face = circle(0, 0, r, `url(#${id}W)`) +
    `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(r - 0.5)}" fill="none" stroke="${lo}" stroke-width="0.9" stroke-opacity="0.32"/>` +
    satinStroke(ringPath, Math.max(1.6, r * 0.24), ring) +
    satinStroke(inRing, 0.7, ring) +
    satinStroke(`M${star.join("L")}Z`, 0.9, ring) +
    `<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(r)}" fill="none" stroke="${lo}" stroke-width="0.8" stroke-opacity="0.75"/>`;
  return { defs: weave + satinDefs(`${id}S`, ring), body: under + face };
}
