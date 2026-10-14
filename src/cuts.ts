// The cuts: each is a table of measures in a drawing 200 units wide (the middle of the shirt is x = 100) and what its sport's shirt carries: the sleeves it can have, the collars
// and where the number, the name, a crest and the patches go. A measure called `u` is a distance from the middle; `y` is down from the top.

export const CUT_IDS = ["hockey", "baseball", "basketball", "football", "soccer", "rugby", "handball"] as const;
export type CutId = (typeof CUT_IDS)[number];

export const SLEEVE_IDS = ["long", "elbow", "short", "none"] as const;
export type SleeveId = (typeof SLEEVE_IDS)[number];

export const COLLAR_IDS = ["crew", "v", "lace-up", "polo", "round", "wishbone", "band"] as const;
export type CollarId = (typeof COLLAR_IDS)[number];

/** A sleeve: its direction (degrees below the level, outward), its length along the outer edge and its width at the cuff. */
export interface SleeveSpec {
  a: number;
  l: number;
  cw: number;
}

/** A place on the shirt: the centre, and the largest box (`w`, `h`) a thing placed there may fill. */
export interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CutSpec {
  id: CutId;
  /** The room the drawing needs beyond its 200 units on each side, so that no sleeve of the cut, still or turned, is cut off by the box: the drawing is made in `-reach 0 (200 + 2 reach) 232`. Measured by `scripts/jersey-boxes.mjs`; none (absent) for a cut that fits the body. */
  reach?: number;
  /** The top of the neck at the shoulder line, the shoulder tip, the armpit, the waist and the hem: `u` and `y` of each. */
  ny: number;
  su: number;
  sy: number;
  au: number;
  ay: number;
  wu: number;
  hu: number;
  hy: number;
  /** How far the hem's middle hangs below its sides. */
  drop: number;
  sleeves: Partial<Record<SleeveId, SleeveSpec>>;
  sleeve: SleeveId;
  collars: readonly CollarId[];
  collar: CollarId;
  /** A tank: the shoulder strap's outer `u` and the armhole's inward bulge. */
  tank?: { su: number; sy: number; bulge: number };
  /** What a cut carries unless it is told otherwise. */
  sleeveStripes: number;
  hemStripes: number;
  /** The spots, front and back. */
  number: { front: Spot; back: Spot };
  name: Spot;
  text: Spot;
  crest: Spot;
  patch: Spot;
  /** The number on a sleeve, how far along it (0 to 1) and how tall. */
  tv: { t: number; h: number };
}

const spot = (x: number, y: number, w: number, h: number): Spot => ({ x, y, w, h });

export const CUTS: Readonly<Record<CutId, CutSpec>> = {
  hockey: {
    id: "hockey", ny: 24, su: 62, sy: 37, au: 51, ay: 86, wu: 48, hu: 54, hy: 208, drop: 0,
    sleeves: { long: { a: 76, l: 120, cw: 31 }, elbow: { a: 68, l: 80, cw: 36 }, short: { a: 56, l: 50, cw: 40 } },
    sleeve: "long", collars: ["lace-up", "v", "crew"], collar: "lace-up", sleeveStripes: 2, hemStripes: 1,
    number: { front: spot(100, 128, 36, 40), back: spot(100, 134, 56, 66) }, name: spot(100, 76, 86, 14), text: spot(100, 108, 76, 16), crest: spot(100, 126, 66, 66), patch: spot(134, 78, 22, 22),
    tv: { t: 0.34, h: 21 },
  },
  baseball: {
    id: "baseball", reach: 7.2, ny: 24, su: 58, sy: 36, au: 49, ay: 84, wu: 47, hu: 51, hy: 206, drop: 0,
    sleeves: { long: { a: 66, l: 106, cw: 34 }, elbow: { a: 54, l: 70, cw: 38 }, short: { a: 48, l: 46, cw: 40 } },
    sleeve: "elbow", collars: ["band", "v", "crew"], collar: "band", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(128, 140, 28, 30), back: spot(100, 134, 52, 62) }, name: spot(100, 78, 86, 13), text: spot(100, 100, 76, 28), crest: spot(100, 108, 52, 52), patch: spot(134, 78, 22, 22),
    tv: { t: 0.4, h: 16 },
  },
  basketball: {
    id: "basketball", ny: 20, su: 44, sy: 30, au: 50, ay: 100, wu: 52, hu: 58, hy: 214, drop: 0,
    tank: { su: 44, sy: 30, bulge: 14 },
    sleeves: {}, sleeve: "none", collars: ["round", "v", "wishbone"], collar: "round", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(100, 150, 50, 58), back: spot(100, 140, 56, 68) }, name: spot(100, 82, 80, 14), text: spot(100, 98, 76, 16), crest: spot(100, 128, 40, 40), patch: spot(136, 90, 20, 20),
    tv: { t: 0.4, h: 16 },
  },
  football: {
    id: "football", reach: 16.9, ny: 24, su: 74, sy: 40, au: 60, ay: 90, wu: 58, hu: 60, hy: 198, drop: 0,
    sleeves: { short: { a: 50, l: 50, cw: 44 }, elbow: { a: 58, l: 70, cw: 42 }, long: { a: 72, l: 112, cw: 36 } },
    sleeve: "short", collars: ["v", "crew", "round"], collar: "v", sleeveStripes: 2, hemStripes: 0,
    number: { front: spot(100, 118, 66, 70), back: spot(100, 128, 70, 76) }, name: spot(100, 76, 88, 14), text: spot(100, 98, 80, 16), crest: spot(132, 80, 28, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.5, h: 14 },
  },
  soccer: {
    id: "soccer", reach: 8.4, ny: 24, su: 60, sy: 36, au: 49, ay: 84, wu: 46, hu: 50, hy: 204, drop: 2,
    sleeves: { short: { a: 46, l: 58, cw: 40 }, elbow: { a: 58, l: 80, cw: 38 }, long: { a: 72, l: 108, cw: 32 } },
    sleeve: "short", collars: ["polo", "v", "crew"], collar: "polo", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(100, 128, 34, 38), back: spot(100, 128, 54, 62) }, name: spot(100, 78, 84, 13), text: spot(100, 108, 76, 16), crest: spot(128, 78, 26, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.45, h: 15 },
  },
  rugby: {
    id: "rugby", reach: 11.2, ny: 24, su: 64, sy: 38, au: 52, ay: 86, wu: 50, hu: 54, hy: 204, drop: 2,
    sleeves: { long: { a: 70, l: 106, cw: 36 }, elbow: { a: 58, l: 78, cw: 40 }, short: { a: 46, l: 56, cw: 44 } },
    sleeve: "long", collars: ["polo", "v", "crew"], collar: "polo", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(100, 130, 34, 38), back: spot(100, 130, 56, 64) }, name: spot(100, 78, 84, 13), text: spot(100, 108, 76, 16), crest: spot(128, 80, 26, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.45, h: 15 },
  },
  handball: {
    id: "handball", reach: 2.2, ny: 24, su: 58, sy: 36, au: 48, ay: 82, wu: 44, hu: 48, hy: 196, drop: 2,
    sleeves: { short: { a: 46, l: 46, cw: 38 }, elbow: { a: 60, l: 76, cw: 36 }, long: { a: 74, l: 106, cw: 30 } },
    sleeve: "short", collars: ["crew", "v", "polo"], collar: "crew", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(100, 124, 32, 36), back: spot(100, 124, 54, 62) }, name: spot(100, 76, 80, 13), text: spot(100, 106, 72, 16), crest: spot(126, 78, 26, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.45, h: 14 },
  },
};
