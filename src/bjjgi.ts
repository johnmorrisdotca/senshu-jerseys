// The Brazilian jiu-jitsu gi (bjjgi), a variant of the judogi drawing (judogi.ts): the same volumes, belt and trousers, a jacket cut shorter and fitted, a pearl-weave cloth, a thick
// stitched collar, knees reinforced, loops on the trousers' waistband, and patches (bjjPatch.ts) sewn in named zones that turn with the cloth.
//
// Sources, read 2026-10-30. The IBJJF's "Uniform Manual for Manufactures", Section A (Kimonos: Juvenile, Adult and Master), edition EN-07 (the file the IBJJF's uniform page,
// ibjjf.com/uniform, links as in force after the 2024 Gi World Championships; read in full, 15 pages):
//   - 2.1: the jacket must go to the athlete's thighs, and the sleeves come to no more than 2 cm from the wrist with the arm extended straight, parallel to the ground; the collar is
//     1 to 1.3 cm thick and 4.5 to 5 cm wide; the space of the sleeve over its whole length is at least 7 cm. 2.2: the trousers reach no more than 2 cm above the ankle bone and are at
//     least 7 cm wide (loose) from the knee down. The belt is 4 to 5 cm wide with a tip 20 to 30 cm.
//   - 3: double reinforcement is allowed on the jacket's shoulders, underarms and skirt cut (not on the forearm); the sleeve ends' and the skirt's hem reinforcement is at most 2.5 cm;
//     the trousers may be doubled over the knee from 10 cm above the cuff up to the crotch, their hem reinforcement at most 2.5 cm and their waistband's at most 5 cm.
//   - 6: "Patches or embroidery may only be present at authorized locations. The patches must be properly sewn." Its diagram marks the locations: on the jacket's front both upper arms, a
//     shoulder piece each side of the collar, a long strip along the left lapel and a smaller one on the right chest, and a strip across the skirt; on its back a large square under the
//     collar and a strip across the skirt; on the trousers a thigh piece and a piece below the knee on each leg, front and back, "the patch must be 15 cm distance from the edge of the
//     parts" (the cuff), and a spot for the maker's label on each cuff. Embroidery follows the same locations; none on the collar, inside or out.
//   - 8.1: the jacket and trousers are white, royal blue (navy is not allowed) or black, one colour. 1.1 and 1.2: the jacket is made of embossed braided fabric (380 to 650 g/m2, the
//     pearl weave drawn here), the trousers of twill or rip-stop (220 to 300 g/m2), and "solid details in colors other than the color of the kimono will not be allowed".
// The manual prints no patch size, only the 15 cm. The sizes here are the package's own reading of the diagram's proportions at a 170 cm wearer (each zone's `legal` size, in
// centimetres) and are said so wherever they are checked. The IBJJF Rules Book's Article 13 (the same locations; read only as Wikipedia, "Brazilian jiu-jitsu gi", cites it) was not read.
// Thick stitched patches: 3 to 4 mm (John's spec, 2026-10-30). The art on a patch is generic; no academy, team, brand or federation mark is drawn. Original drawing.

import { hexOf, type Rgb } from "./colour.ts";
import type { GiCut } from "./giCut.ts";
import { onSleeve, SLEEVE_ANGLE, chestSpan, BELT_BOTTOM, BACK_COLLAR_FOOT } from "./judogiJacket.ts";
import { CM } from "./judogiPatch.ts";
import { onLeg, hipsOf, PANTS_HEM, PANTS_HEM_CM } from "./judogiPants.ts";
import { fold, smooth, stitch, toneOf, type Mark } from "./judogiCloth.ts";
import { corners, type Obb } from "./judogiPlaces.ts";
import { drawBjjPatch, readBjjPatch, type BjjPatch, type PatchShape, type ReadBjjPatch } from "./bjjPatch.ts";
import { n2, poly, type Pt } from "./path.ts";

/** How far above the ankle bone the jiu-jitsu trousers stop unless asked otherwise: the IBJJF's 2 cm (`hemAboveAnkleCm` overrides it). */
export const BJJ_HEM_CM: number = PANTS_HEM_CM.ibjjf;

export const BJJ_COLOURS = ["white", "blue", "black"] as const;
export type BjjColour = (typeof BJJ_COLOURS)[number];

/** The cloths, as the IBJJF's manual shows them (8.1): white, royal blue (PMS royal blue, not navy) and black. */
export const BJJ_CLOTH: Record<BjjColour, Rgb> = { white: [248, 247, 243], blue: [30, 78, 146], black: [30, 31, 35] };

export const BJJ_PRESETS = ["none", "ibjjf", "covered"] as const;
export type BjjPreset = (typeof BJJ_PRESETS)[number];

/** The faces a patch is sewn on. */
export type BjjFace = "jacket-front" | "jacket-back" | "pants-front" | "pants-back";

/** A named place on the gi for a patch, in centimetres at a 170 cm wearer (the drawing's 2.63 units to the centimetre). */
export interface BjjZone {
  id: string;
  face: BjjFace;
  /** The most room the zone has: a patch is never drawn bigger than this. */
  room: { w: number; h: number };
  /** The size of the IBJJF's authorized location (`legal`), when the manual has one there; `undefined` where it has none (a patch there is not allowed in competition). */
  legal?: { w: number; h: number };
  /** The shape a patch takes there when none is asked for. */
  shape: PatchShape;
}

const z = (id: string, face: BjjFace, room: [number, number], legal: [number, number] | undefined, shape: PatchShape = "rectangle"): BjjZone => ({ id, face, room: { w: room[0], h: room[1] }, ...(legal === undefined ? {} : { legal: { w: legal[0], h: legal[1] } }), shape });

/**
 * Every zone, left and right the wearer's. The first of each pair of sizes is across, the second along the cloth (an arm's length, a leg's length, the width of a back).
 * The IBJJF's authorized locations (manual, section 6): upper arm, shoulder, left lapel, right chest, skirt front, upper back, skirt back, thigh and shin on the front of each
 * leg, thigh and calf on its back. The rest (forearm, back of the arm, back of the shoulder, lower back, hip, knee, the skirt's other side) are the "covered" look's.
 */
export const BJJ_ZONES: readonly BjjZone[] = [
  z("upper-arm-left", "jacket-front", [8, 17], [5, 17]), z("upper-arm-right", "jacket-front", [8, 17], [5, 17]),
  z("forearm-left", "jacket-front", [7, 13], undefined), z("forearm-right", "jacket-front", [7, 13], undefined),
  z("shoulder-left", "jacket-front", [6, 6], [6, 6]), z("shoulder-right", "jacket-front", [6, 6], [6, 6]),
  z("lapel-left", "jacket-front", [6.4, 24], [6.4, 24], "rounded"), z("lapel-right", "jacket-front", [9, 12], [9, 12], "shield"),
  z("skirt-front", "jacket-front", [11, 6], [11, 6]), z("skirt-front-right", "jacket-front", [9, 6], undefined),
  z("upper-back", "jacket-back", [24, 22], [24, 22], "rounded"), z("lower-back", "jacket-back", [18, 8], undefined),
  z("skirt-back", "jacket-back", [24, 6], [24, 6]),
  z("shoulder-back-left", "jacket-back", [6, 5], undefined), z("shoulder-back-right", "jacket-back", [6, 5], undefined),
  z("arm-back-left", "jacket-back", [7, 14], undefined), z("arm-back-right", "jacket-back", [7, 14], undefined),
  z("hip-left", "pants-front", [8, 8], undefined), z("hip-right", "pants-front", [8, 8], undefined),
  z("thigh-left", "pants-front", [10, 16], [10, 16]), z("thigh-right", "pants-front", [10, 16], [10, 16]),
  z("knee-left", "pants-front", [9, 12], undefined, "rounded"), z("knee-right", "pants-front", [9, 12], undefined, "rounded"),
  z("shin-left", "pants-front", [10, 12], [10, 12]), z("shin-right", "pants-front", [10, 12], [10, 12]),
  z("thigh-back-left", "pants-back", [9, 15], [9, 15]), z("thigh-back-right", "pants-back", [9, 15], [9, 15]),
  z("calf-back-left", "pants-back", [9, 16], [9, 16]), z("calf-back-right", "pants-back", [9, 16], [9, 16]),
];
export const BJJ_ZONE_IDS: readonly string[] = BJJ_ZONES.map((q) => q.id);

/** The pants' hem and the least distance a patch keeps from it: 15 cm (manual, section 6). */
export const HEM_CLEAR_CM = 15;

/** The IBJJF's measures of the collar, in centimetres (manual, 2.1): thickness 1 to 1.3, width 4.5 to 5. */
export const COLLAR_CM = { thick: [1, 1.3], width: [4.5, 5] } as const;

/** The jiu-jitsu jacket's cut (giCut.ts): shorter and fitted, a thick wide lapel stitched in rows, tapered sleeves, a pearl-weave cloth. */
export const BJJ_CUT: GiCut = {
  sleeve: 1, hem: 187, lapel: 12.8, collar: 3.4, plain: true, soft: 0.9, cuff: 0.8, vent: 8 * CM, fit: 0.92, skirtDepth: 3.5, weave: "pearl", lapelRows: 7,
};

export interface JudogiBjj {
  /** The gi's colour: `white`, `blue` (royal) or `black`. By default the judogi's own `colour` (white or blue). */
  colour?: BjjColour;
  /** The patches: `none` (the default), `ibjjf` (only the IBJJF's authorized locations, within their sizes), `covered` (patches everywhere), or a list of patches. */
  patches?: BjjPreset | BjjPatch[];
}

export interface ReadBjj {
  colour: BjjColour;
  cloth: Rgb;
  gi: GiCut;
  preset: BjjPreset | "custom";
  patches: ReadBjjPatch[];
}

const THICK_CUT: GiCut = BJJ_CUT;

/** The gi's options from outside, made safe; `undefined` when the garment is not a jiu-jitsu gi. */
export function readBjj(raw: unknown, base: "white" | "blue" = "white"): ReadBjj | undefined {
  if (raw !== true && (raw === null || typeof raw !== "object")) return undefined;
  const o = raw === true ? {} : (raw as JudogiBjj);
  const colour: BjjColour = (BJJ_COLOURS as readonly string[]).includes(o.colour as string) ? (o.colour as BjjColour) : base;
  const asked = o.patches;
  const preset: BjjPreset | "custom" = Array.isArray(asked) ? "custom" : (BJJ_PRESETS as readonly string[]).includes(asked as string) ? (asked as BjjPreset) : "none";
  const list = Array.isArray(asked) ? asked.slice(0, 40) : preset === "none" ? [] : presetPatches(preset as "ibjjf" | "covered", colour);
  const seen = new Set<string>();
  const patches: ReadBjjPatch[] = [];
  for (const p of list) {
    const r = readBjjPatch(p, BJJ_ZONE_IDS);
    // One patch to a zone: the later one is left out.
    if (r === undefined || seen.has(r.zone)) continue;
    seen.add(r.zone);
    patches.push(r);
  }
  return { colour, cloth: BJJ_CLOTH[colour], gi: THICK_CUT, preset, patches };
}

// ---- The presets ----

/** How a patch looks: the cloth, the edge thread and the lettering's thread, as thread names. */
interface Look {
  colour: string;
  border: string;
  ink: string;
}

const NAVY: Look = { colour: "navy", border: "gold", ink: "white" };
const RED: Look = { colour: "red", border: "white", ink: "white" };
const GOLD: Look = { colour: "gold", border: "black", ink: "black" };
const WHITE: Look = { colour: "white", border: "navy", ink: "navy" };

/** The colours a team's patches take on each gi: strong against the cloth, never the cloth's own. */
const PALETTES: Record<BjjColour, { a: Look; b: Look; c: Look }> = {
  white: { a: NAVY, b: RED, c: GOLD },
  blue: { a: WHITE, b: RED, c: GOLD },
  black: { a: RED, b: WHITE, c: GOLD },
};

/**
 * The patches a preset sews. `ibjjf`: a patch in each authorized location (manual, section 6) at a size inside the location's own. `covered`: every zone, the zones' full room, shapes and
 * colours alternating, the way a competition team's gi is covered. The words are generic ("TEAM", "ACADEMY") and the art neutral.
 */
export function presetPatches(preset: "ibjjf" | "covered", colour: BjjColour): BjjPatch[] {
  const k = PALETTES[colour];
  const p = (zone: string, look: Look, rest: Partial<BjjPatch> = {}): BjjPatch => ({ zone, ...look, ...rest });
  const [a, b, c] = [k.a, k.b, k.c];
  const legal: BjjPatch[] = [
    p("upper-back", a, { shape: "rounded", text: "ACADEMY", art: "rings", widthCm: 24, heightCm: 22, edge: "satin" }),
    p("skirt-back", b, { text: "ACADEMY", widthCm: 22, heightCm: 5.5 }),
    p("upper-arm-left", b, { text: "TEAM", widthCm: 5, heightCm: 16 }), p("upper-arm-right", b, { text: "TEAM", widthCm: 5, heightCm: 16 }),
    p("shoulder-left", c, { shape: "circle", art: "star", widthCm: 6, heightCm: 6 }), p("shoulder-right", c, { shape: "circle", art: "star", widthCm: 6, heightCm: 6 }),
    p("lapel-left", a, { shape: "rounded", text: "JIU-JITSU", widthCm: 6.4, heightCm: 22, edge: "satin" }),
    p("lapel-right", c, { shape: "shield", art: "chevrons", widthCm: 8.5, heightCm: 11 }),
    p("skirt-front", b, { text: "TEAM", widthCm: 11, heightCm: 5.5 }),
    p("thigh-left", a, { shape: "rounded", text: "TEAM", art: "bolt", widthCm: 9, heightCm: 15.5 }), p("thigh-right", a, { shape: "rounded", text: "TEAM", art: "bolt", widthCm: 9, heightCm: 15.5 }),
    p("shin-left", b, { art: "diamond", widthCm: 9, heightCm: 11 }), p("shin-right", b, { art: "diamond", widthCm: 9, heightCm: 11 }),
    p("thigh-back-left", c, { art: "wave", widthCm: 8, heightCm: 14 }), p("thigh-back-right", c, { art: "wave", widthCm: 8, heightCm: 14 }),
    p("calf-back-left", a, { text: "BJJ", widthCm: 8, heightCm: 14 }), p("calf-back-right", a, { text: "BJJ", widthCm: 8, heightCm: 14 }),
  ];
  if (preset === "ibjjf") return legal;
  // Everywhere: every zone takes its full room, and the zones the rules leave out are filled too.
  const full = legal.map((q): BjjPatch => {
    const zn = zoneOf(q.zone);
    return { ...q, widthCm: zn.room.w, heightCm: zn.room.h };
  });
  const extra: BjjPatch[] = [
    p("forearm-left", c, { shape: "rounded", art: "chevrons", edge: "satin" }), p("forearm-right", c, { shape: "rounded", art: "chevrons", edge: "satin" }),
    p("lower-back", c, { text: "TEAM", art: "star", edge: "satin" }),
    p("skirt-front-right", a, { shape: "shield", art: "star" }),
    p("shoulder-back-left", b, { shape: "circle", art: "diamond" }), p("shoulder-back-right", b, { shape: "circle", art: "diamond" }),
    p("arm-back-left", a, { text: "BJJ", edge: "satin" }), p("arm-back-right", a, { text: "BJJ", edge: "satin" }),
    p("hip-left", b, { shape: "circle", art: "chevrons" }), p("hip-right", b, { shape: "circle", art: "chevrons" }),
    p("knee-left", c, { shape: "shield", art: "rings", edge: "satin" }), p("knee-right", c, { shape: "shield", art: "rings", edge: "satin" }),
  ];
  return [...full, ...extra];
}

// ---- Where a zone is on its face ----

/** A patch's middle on its face's drawing and the turn that follows the cloth's slope, in the drawing's units and degrees clockwise. */
export interface ZoneAt {
  x: number;
  y: number;
  rot: number;
}

const SIDES = { left: 1, right: -1 } as const;

/** Where each zone's middle is on its face (the faces the volume samples), for this cut. Left and right are the wearer's. */
export function zoneAt(id: string, gi: GiCut = BJJ_CUT): ZoneAt {
  const left = id.endsWith("-left");
  const wear = left ? SIDES.left : SIDES.right;
  // On a front the wearer's left is the picture's right; on a back, the picture's left; on trousers' back, as on the jacket's.
  const front = zoneOf(id).face === "jacket-front" || zoneOf(id).face === "pants-front";
  const sd: -1 | 1 = front ? (wear as -1 | 1) : ((-wear) as -1 | 1);
  const tilt = (s: -1 | 1): number => (s === -1 ? SLEEVE_ANGLE : -SLEEVE_ANGLE);
  const arm = (f: number): ZoneAt => {
    const [x, y] = onSleeve(sd, f, 0.5, gi.sleeve, gi.cuff);
    return { x, y, rot: tilt(sd) };
  };
  switch (id) {
    case "upper-arm-left": case "upper-arm-right": return arm(0.27);
    case "forearm-left": case "forearm-right": return arm(0.72);
    case "arm-back-left": case "arm-back-right": return arm(0.27);
    case "shoulder-back-left": case "shoulder-back-right": {
      const [x, y] = onSleeve(sd, 0.14, 0.62, gi.sleeve, gi.cuff);
      return { x, y: y + 2, rot: sd === -1 ? -14 : 14 };
    }
    case "shoulder-left": case "shoulder-right": {
      // Between the neck's end and the shoulder's point, a hand under the seam that joins them.
      const x = 100 + sd * 44;
      return { x, y: 34, rot: sd * 29 };
    }
    case "lapel-left": {
      // Beside the top lapel's band, a centimetre and a half from it, leaning with it.
      const y = 86;
      return { x: chestSpan(y, gi)[0] + 3.2 * CM + 4.6 + 4, y, rot: 14.9 };
    }
    case "lapel-right": return { x: 76, y: 78, rot: 14.9 };
    case "skirt-front": return { x: 123, y: BELT_BOTTOM + 11, rot: 0 };
    case "skirt-front-right": return { x: 70, y: BELT_BOTTOM + 11, rot: 0 };
    case "upper-back": return { x: 100, y: BACK_COLLAR_FOOT + 4.5 + (22 * CM) / 2, rot: 0 };
    case "lower-back": return { x: 100, y: 111, rot: 0 };
    case "skirt-back": return { x: 100, y: BELT_BOTTOM + 9, rot: 0 };
    case "hip-left": case "hip-right": return { x: 100 + sd * 30, y: 62, rot: 0 };
    case "thigh-left": case "thigh-right": return { x: leg(sd, 0.2)[0], y: 128, rot: 0 };
    case "knee-left": case "knee-right": return { x: leg(sd, 0.38)[0], y: 168, rot: 0 };
    case "shin-left": case "shin-right": return { x: leg(sd, 0.8)[0], y: 207, rot: 0 };
    case "thigh-back-left": case "thigh-back-right": return { x: leg(sd, 0.2)[0], y: 128, rot: 0 };
    case "calf-back-left": case "calf-back-right": return { x: leg(sd, 0.8)[0], y: 204, rot: 0 };
    default: return { x: 100, y: 100, rot: 0 };
  }
}

/** A point down a leg of the trousers, `f` of the way from the crotch to the hem, in the middle of its width. */
const leg = (side: -1 | 1, f: number): Pt => onLeg(side, f, 0.5);

const zoneOf = (id: string): BjjZone => BJJ_ZONES.find((q) => q.id === id) ?? (BJJ_ZONES[0] as BjjZone);

export interface Placement {
  patch: ReadBjjPatch;
  zone: BjjZone;
  /** The patch's size in centimetres. */
  wCm: number;
  hCm: number;
  at: ZoneAt;
}

/** Where every patch goes: its size (the zone's `legal` size or room when none is asked, never more than the room) and its middle. */
export function placements(b: ReadBjj): Placement[] {
  return b.patches.map((patch) => {
    const zone = zoneOf(patch.zone);
    const base = zone.legal ?? zone.room;
    const wCm = Math.min(zone.room.w, patch.widthCm ?? base.w);
    const hCm = Math.min(zone.room.h, patch.heightCm ?? base.h);
    return { patch, zone, wCm, hCm, at: zoneAt(zone.id, b.gi) };
  });
}

/** The four corners of a placed patch on its face's drawing. */
export function patchBox(p: Placement): Obb {
  return { x: p.at.x, y: p.at.y, w: p.wCm * CM, h: p.hCm * CM, rot: p.at.rot };
}

/** The lowest a patch on the trousers may reach: 15 cm up from the hem. */
export const PANTS_PATCH_LIMIT = PANTS_HEM - HEM_CLEAR_CM * CM;

// ---- What the manual says of this gi, as checks ----

const MANUAL = "IBJJF Uniform Manual for Manufactures, Section A, edition EN-07 (in force after the 2024 Gi World Championships)";

/** What the IBJJF's manual says of this gi, as checks: each is met or not, and the fact is cited. */
export function bjjNotes(b: ReadBjj, heightCm: number): { id: string; met: boolean; fact: string }[] {
  const jacketCm = Math.round(((b.gi.hem - 4) / CM) * (heightCm / 170));
  const thick = b.gi.collar / CM;
  const wide = b.gi.lapel / CM;
  const cuffCm = (Math.hypot(33, 12) * (b.gi.cuff ?? 1)) / CM;
  const notes = [
    { id: "bjj-colour", met: true, fact: `The jacket and trousers are white, royal blue or black, all one colour; navy blue is not allowed (${MANUAL}, 8.1). This one is ${b.colour}.` },
    { id: "bjj-jacket", met: jacketCm >= heightCm * 0.38, fact: `The jacket must go to the athlete's thighs, its sleeves coming to no more than 2 cm from the wrist with the arm straight out (${MANUAL}, 2.1); drawn ${jacketCm} cm long for ${heightCm} cm.` },
    { id: "bjj-collar", met: thick >= COLLAR_CM.thick[0] && thick <= COLLAR_CM.thick[1] && wide >= COLLAR_CM.width[0] && wide <= COLLAR_CM.width[1], fact: `The collar is 1 to 1.3 cm thick and 4.5 to 5 cm wide (${MANUAL}, 2.1); drawn ${thick.toFixed(1)} cm thick and ${wide.toFixed(1)} cm wide.` },
    { id: "bjj-sleeve-space", met: cuffCm >= 3.5, fact: `The sleeve's space over its whole length is at least 7 cm (${MANUAL}, 2.1); drawn ${(cuffCm * 2).toFixed(1)} cm round at the cuff, narrower than the judogi's.` },
    { id: "bjj-fabric", met: true, fact: `The jacket is embossed braided fabric (the pearl weave), 380 to 650 g/m2, and the trousers twill or rip-stop, 220 to 300 g/m2; no solid detail in a colour other than the gi's (${MANUAL}, 1.1 and 1.2).` },
    { id: "bjj-reinforcement", met: true, fact: `The trousers may be doubled over the knee from 10 cm above the cuff up to the crotch; the hem's reinforcement is at most 2.5 cm and the waistband's at most 5 cm (${MANUAL}, 3.2).` },
  ];
  for (const p of placements(b)) {
    const legal = p.zone.legal;
    const sized = legal !== undefined && p.wCm <= legal.w + 0.01 && p.hCm <= legal.h + 0.01;
    const pants = p.zone.face === "pants-front" || p.zone.face === "pants-back";
    const bottom = pants ? p.at.y + (p.hCm * CM) / 2 : 0;
    const clear = !pants || bottom <= PANTS_PATCH_LIMIT + 0.05;
    const where = legal === undefined ? "is not an authorized location" : sized ? "is an authorized location, and the patch is inside its size" : `is an authorized location of ${legal.w} by ${legal.h} cm (the package's reading of the diagram), and the patch is ${p.wCm} by ${p.hCm} cm`;
    notes.push({ id: `bjj-patch-${p.zone.id}`, met: legal !== undefined && sized && clear, fact: `Patches only at authorized locations, properly sewn, and 15 cm from the trousers' cuff (${MANUAL}, 6): the ${p.zone.id.replace(/-/g, " ")} ${where}${pants ? `; it ends ${Math.round((PANTS_HEM - bottom) / CM)} cm above the cuff` : ""}.` });
  }
  return notes;
}

// ---- What is sewn on the faces ----

const join = (a: Mark | undefined, m: Mark): Mark => (a === undefined ? m : { defs: a.defs + m.defs, body: a.body + m.body });

/**
 * The trousers' reinforced knees: a panel doubled over the front of each leg from above the knee down to 10 cm above the cuff (the manual's 3.2 allows it up to the crotch),
 * stitched round twice and across in a lattice, over the plain cloth (the judogi's own knee panel is left out of this gi's trousers). `uid` is the trousers' front face's.
 */
export function bjjKnees(uid: string, cloth: Rgb): Mark {
  const t = toneOf(cloth);
  let body = "";
  let defs = "";
  const bottom = (PANTS_HEM - 10 * CM - 92) / (PANTS_HEM - 92);
  for (const side of [-1, 1] as const) {
    const edge = [onLeg(side, 0.2, 0.035), onLeg(side, 0.2, 0.965), onLeg(side, bottom, 0.965), onLeg(side, bottom, 0.035)];
    const d = poly(edge);
    const clip = `${uid}bk${side < 0 ? "l" : "r"}`;
    defs += `<clipPath id="${clip}"><path d="${d}"/></clipPath>`;
    const inner = [onLeg(side, 0.222, 0.075), onLeg(side, 0.222, 0.925), onLeg(side, bottom - 0.022, 0.925), onLeg(side, bottom - 0.022, 0.075)];
    let lattice = "";
    for (let k = -40; k <= 40; k++) {
      const x = 100 + side * 26 + k * 4.2;
      lattice += `M${n2(x)} 100L${n2(x + 150)} 250M${n2(x)} 100L${n2(x - 150)} 250`;
    }
    body += `<g clip-path="url(#${clip})"><path d="${d}" fill="#fff" fill-opacity="${t.light ? 0.16 : 0.05}"/>` +
      `<path d="${lattice}" stroke="${t.seam}" stroke-width="0.35" stroke-opacity="${t.light ? 0.3 : 0.2}" fill="none"/>` +
      `<path d="${lattice}" stroke="${t.hi}" stroke-width="0.3" stroke-opacity="${t.light ? 0.5 : 0.22}" fill="none" transform="translate(0.35 0.2)"/>` +
      fold(smooth([onLeg(side, bottom, 0.04), onLeg(side, bottom, 0.5), onLeg(side, bottom, 0.96)]), 2.6, t.light ? 0.18 : 0.3) + `</g>` +
      `<path d="${d}" fill="none" stroke="${t.seam}" stroke-width="0.7" stroke-opacity="0.6"/>` +
      stitch(`${poly(inner)}`, t, 0.4, 0.75) + stitch(`${poly(edge.map((p, i) => [p[0] + (inner[i]![0] - p[0]) * 0.45, p[1] + (inner[i]![1] - p[1]) * 0.45] as Pt))}`, t, 0.4, 0.75);
  }
  return { defs, body };
}

/**
 * Loops on the trousers' waistband: short tabs of the gi's cloth sewn over the band from its top to its foot, each held at both ends by a bar-tack, the cord running under them, in
 * the places clear of the drawstring's eyelets. `half` is the waistband's half width.
 */
export function waistLoops(cloth: Rgb, half: number, face: "front" | "back"): string {
  const t = toneOf(cloth);
  const xs = face === "front" ? [-0.74, -0.47, 0.47, 0.74] : [-0.8, -0.5, -0.17, 0.17, 0.5, 0.8];
  let s = "";
  for (const k of xs) {
    const x = 100 + k * half;
    const [y0, y1, w] = [4.6, 18.2, 3.6];
    s += `<rect x="${n2(x - w / 2 + 0.7)}" y="${n2(y0 + 0.9)}" width="${w}" height="${n2(y1 - y0)}" rx="0.8" fill="#1a2230" fill-opacity="0.2"/>` +
      `<rect x="${n2(x - w / 2)}" y="${y0}" width="${w}" height="${n2(y1 - y0)}" rx="0.8" fill="${t.fill}" stroke="${t.seam}" stroke-width="0.5" stroke-opacity="0.7"/>` +
      `<rect x="${n2(x - w / 2 + 0.5)}" y="${n2(y0 + 0.5)}" width="${n2(w * 0.28)}" height="${n2(y1 - y0 - 1)}" fill="#fff" fill-opacity="${t.light ? 0.5 : 0.14}"/>` +
      `<path d="M${n2(x - w / 2 + 0.5)} ${n2(y0 + 1.5)}H${n2(x + w / 2 - 0.5)}M${n2(x - w / 2 + 0.5)} ${n2(y1 - 1.5)}H${n2(x + w / 2 - 0.5)}M${n2(x - w / 2 + 0.6)} ${n2(y0 + 0.9)}L${n2(x + w / 2 - 0.6)} ${n2(y0 + 2.1)}M${n2(x + w / 2 - 0.6)} ${n2(y0 + 0.9)}L${n2(x - w / 2 + 0.6)} ${n2(y0 + 2.1)}M${n2(x - w / 2 + 0.6)} ${n2(y1 - 2.1)}L${n2(x + w / 2 - 0.6)} ${n2(y1 - 0.9)}M${n2(x + w / 2 - 0.6)} ${n2(y1 - 2.1)}L${n2(x - w / 2 + 0.6)} ${n2(y1 - 0.9)}" stroke="${t.seam}" stroke-width="0.34" stroke-opacity="0.9" fill="none"/>`;
  }
  return s;
}

/** The marks the jiu-jitsu gi carries of its own: its patches on each face, the trousers' reinforced knees and their waistband loops. */
export function bjjMarks(uid: string, b: ReadBjj, worn = false, knees = true): { jacketFront?: Mark; jacketBack?: Mark; pantsFront: Mark; pantsBack: Mark } {
  const out: { jacketFront?: Mark; jacketBack?: Mark; pantsFront: Mark; pantsBack: Mark } = { pantsFront: knees ? bjjKnees(`${uid}k`, b.cloth) : { defs: "", body: "" }, pantsBack: { defs: "", body: "" } };
  const half = (hipsOf(worn)[0] as number) + 0;
  out.pantsFront = join(out.pantsFront, { defs: "", body: waistLoops(b.cloth, half, "front") });
  out.pantsBack = join(out.pantsBack, { defs: "", body: waistLoops(b.cloth, half, "back") });
  for (const [i, p] of placements(b).entries()) {
    // Worn, the trousers' hips are under the jacket's skirt: a patch there would only show through at its edges.
    if (worn && p.zone.id.startsWith("hip-")) continue;
    const m = drawBjjPatch(`${uid}${i}`, p.patch, p.patch.shape ?? p.zone.shape, { x: p.at.x, y: p.at.y, w: p.wCm * CM, h: p.hCm * CM, rot: p.at.rot });
    if (p.zone.face === "jacket-front") out.jacketFront = join(out.jacketFront, m);
    else if (p.zone.face === "jacket-back") out.jacketBack = join(out.jacketBack, m);
    else if (p.zone.face === "pants-front") out.pantsFront = join(out.pantsFront, m);
    else out.pantsBack = join(out.pantsBack, m);
  }
  return out;
}

/** A gi colour as `#rrggbb`, for the demo's swatches. */
export const bjjHex = (c: BjjColour): string => hexOf(BJJ_CLOTH[c]);

/** The four corners of a placed patch, for tests. */
export const patchCorners = (p: Placement): Pt[] => corners(patchBox(p));
