// The cuts: each is a table of measures in a drawing 200 units wide (the middle of the shirt is x = 100) and what its sport's shirt carries: the sleeves it can have, the collars
// and where the number, the name, a crest and the patches go. A measure called `u` is a distance from the middle; `y` is down from the top.

export const CUT_IDS = ["hockey", "baseball", "basketball", "football", "soccer", "rugby", "handball"] as const;
export type CutId = (typeof CUT_IDS)[number];

/** The fit of a cut: `mens` is the straight, boxy shirt cut for pads; `womens` the tailored one, with a shorter body, narrower shoulders and sleeves, and a waist that tapers in and flares out again to the hem. */
export const FIT_IDS = ["mens", "womens"] as const;
export type FitId = (typeof FIT_IDS)[number];

export const SLEEVE_IDS = ["long", "elbow", "short", "none"] as const;
export type SleeveId = (typeof SLEEVE_IDS)[number];

/** `zip` is a stand collar over a zipper (the hockey official's), and `point` a polo's long-pointed leaves over a placket (the dress collar of an umpire's or a referee's shirt). */
export const COLLAR_IDS = ["crew", "v", "lace-up", "polo", "round", "wishbone", "band", "zip", "point"] as const;
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
    sleeve: "long", collars: ["lace-up", "v", "crew", "polo", "zip", "point"], collar: "lace-up", sleeveStripes: 2, hemStripes: 1,
    number: { front: spot(100, 128, 36, 40), back: spot(100, 134, 56, 66) }, name: spot(100, 76, 86, 14), text: spot(100, 108, 76, 16), crest: spot(100, 126, 66, 66), patch: spot(134, 78, 22, 22),
    tv: { t: 0.34, h: 21 },
  },
  baseball: {
    id: "baseball", reach: 7.2, ny: 24, su: 58, sy: 36, au: 49, ay: 84, wu: 47, hu: 51, hy: 206, drop: 0,
    sleeves: { long: { a: 66, l: 106, cw: 34 }, elbow: { a: 54, l: 70, cw: 38 }, short: { a: 48, l: 46, cw: 40 } },
    sleeve: "elbow", collars: ["band", "v", "crew", "polo", "point"], collar: "band", sleeveStripes: 0, hemStripes: 0,
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
    sleeve: "short", collars: ["v", "crew", "round", "polo", "point", "zip"], collar: "v", sleeveStripes: 2, hemStripes: 0,
    number: { front: spot(100, 118, 66, 70), back: spot(100, 128, 70, 76) }, name: spot(100, 76, 88, 14), text: spot(100, 98, 80, 16), crest: spot(132, 80, 28, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.5, h: 14 },
  },
  soccer: {
    id: "soccer", reach: 8.4, ny: 24, su: 60, sy: 36, au: 49, ay: 84, wu: 46, hu: 50, hy: 204, drop: 2,
    sleeves: { short: { a: 46, l: 58, cw: 40 }, elbow: { a: 58, l: 80, cw: 38 }, long: { a: 72, l: 108, cw: 32 } },
    sleeve: "short", collars: ["polo", "v", "crew", "point", "zip"], collar: "polo", sleeveStripes: 0, hemStripes: 0,
    number: { front: spot(100, 128, 34, 38), back: spot(100, 128, 54, 62) }, name: spot(100, 78, 84, 13), text: spot(100, 108, 76, 16), crest: spot(128, 78, 26, 28), patch: spot(66, 80, 22, 22),
    tv: { t: 0.45, h: 15 },
  },
  rugby: {
    id: "rugby", reach: 11.2, ny: 24, su: 64, sy: 38, au: 52, ay: 86, wu: 50, hu: 54, hy: 204, drop: 2,
    sleeves: { long: { a: 70, l: 106, cw: 36 }, elbow: { a: 58, l: 78, cw: 40 }, short: { a: 46, l: 56, cw: 44 } },
    sleeve: "long", collars: ["polo", "v", "crew", "point", "zip"], collar: "polo", sleeveStripes: 0, hemStripes: 0,
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

const r1 = (n: number): number => Math.round(n * 10) / 10;

/**
 * The cut as a woman's shirt: the same table, narrowed. The shoulders and the chest are narrower, the body is shorter, the waist comes in by about a fifth and the hem flares back out a little (a curved hem
 * where the men's is level, but a hockey sweater's is kept level), and the sleeves are narrower and a little shorter. The places for the number, the name and the badges follow: they move with the body
 * and shrink with it, never past it. `fit: "mens"` is the table as it stands.
 */
function womensOf(m: CutSpec): CutSpec {
  const su = m.su - Math.max(4, Math.round(m.su * 0.08));
  const au = m.au - 3;
  const hy = m.hy - Math.round((m.hy - m.ay) * 0.11);
  const wu = au - (m.tank === undefined ? 10 : 8);
  const hu = wu + (m.tank === undefined ? 9 : 8);
  const kx = au / m.au;
  const ky = (hy - m.ny) / (m.hy - m.ny);
  const spotOf = (s: Spot, tall: boolean): Spot => {
    const y = r1(m.ny + (s.y - m.ny) * ky);
    const w = r1(s.w * kx * (m.tank !== undefined && !tall ? 0.92 : 1));
    const h = tall ? r1(s.h * ky) : s.h;
    // A place off the middle keeps inside the body where it is lowest, at the waist.
    const room = (y + h / 2 > m.ay ? wu : m.tank !== undefined ? au - 10 : au) - 2.5 - w / 2;
    const dx = Math.sign(s.x - 100) * Math.min(Math.abs(s.x - 100) * kx, Math.max(0, room));
    return { x: r1(100 + dx), y, w, h };
  };
  const sleeves: CutSpec["sleeves"] = {};
  for (const id of SLEEVE_IDS) {
    const sp = m.sleeves[id];
    if (sp !== undefined) sleeves[id] = { a: sp.a, l: r1(sp.l * (id === "short" ? 0.88 : 0.96)), cw: Math.max(24, sp.cw - 4) };
  }
  const w: CutSpec = {
    ...m, su, au, hy, wu, hu, drop: m.id === "hockey" ? m.drop : m.drop + 2, sleeves,
    number: { front: spotOf(m.number.front, true), back: spotOf(m.number.back, true) }, name: spotOf(m.name, false), text: spotOf(m.text, false), crest: spotOf(m.crest, true), patch: spotOf(m.patch, true),
    tv: { t: m.tv.t, h: r1(m.tv.h * 0.9) },
  };
  if (m.tank !== undefined) w.tank = { su: m.tank.su - 4, sy: m.tank.sy, bulge: m.tank.bulge };
  return w;
}

const WOMENS = Object.fromEntries(CUT_IDS.map((id) => [id, womensOf(CUTS[id])])) as Readonly<Record<CutId, CutSpec>>;

/** The table of a cut in a fit: `CUTS[cut]` for `mens`, the tailored one for `womens`. */
export const cutSpec = (cut: CutId, fit: FitId = "mens"): CutSpec => (fit === "womens" ? WOMENS[cut] : CUTS[cut]);
