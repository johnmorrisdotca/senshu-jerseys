// National layouts: a country's own mark (a leaf, a star, a cross, a disc, a wedge, bars, a fleur) and its flag, drawn at the scale of the shirt in eight arrangements, for every country at once. Every mark is
// an original simplified shape of this package: no federation crest, no manufacturer's mark. The functions are pure: the same options give the same string, and the boxes a test holds the drawing to come from the
// same plan that draws it.
import { clean, type Rgb } from "./colour.ts";
import type { CutSpec } from "./cuts.ts";
import { n2, type Pt } from "./path.ts";

export const NATIONAL_LAYOUTS = ["quadrant", "diagonal", "centred", "arched", "serrated", "stepped", "wordmark", "flag"] as const;
export type NationalLayout = (typeof NATIONAL_LAYOUTS)[number];

/** The countries that have a mark and a flag, in the order the style sheet shows them. */
export const NATIONAL_COUNTRIES = ["canada", "usa", "sweden", "finland", "czechia", "slovakia", "switzerland", "germany", "latvia", "norway", "japan", "france"] as const;
export type NationalCountry = (typeof NATIONAL_COUNTRIES)[number];

/** What a caller may say: `"canada:diagonal"`, or the country and the layout, and the words to set (the country's own name by default). */
export type NationalOptions = string | { country?: string; layout?: string; text?: string };

/** The layout, read. */
export interface NationalR {
  country: NationalCountry;
  layout: NationalLayout;
  text: string;
}

/** The words set on the chest, by country. */
export const NATIONAL_NAMES: Readonly<Record<NationalCountry, string>> = {
  canada: "CANADA", usa: "USA", sweden: "SWEDEN", finland: "FINLAND", czechia: "CZECHIA", slovakia: "SLOVAKIA", switzerland: "SWITZERLAND", germany: "GERMANY", latvia: "LATVIA", norway: "NORWAY", japan: "JAPAN", france: "FRANCE",
};

/** A layout that sets the chest text itself, and how it runs. */
export const NATIONAL_TEXT: Readonly<Partial<Record<NationalLayout, "straight" | "arch" | "diagonal-up">>> = { stepped: "diagonal-up", wordmark: "straight", arched: "arch", flag: "straight" };

/** The national layout from outside, or `undefined` when the country is not one of ours. A layout that is not one is `centred`. */
export function nationalOf(v: unknown): NationalR | undefined {
  let country: unknown;
  let layout: unknown;
  let text: unknown;
  if (typeof v === "string") [country, layout] = v.trim().toLowerCase().split(":");
  else if (v !== null && typeof v === "object" && !Array.isArray(v)) ({ country, layout, text } = v as Record<string, unknown>);
  else return undefined;
  const c = (NATIONAL_COUNTRIES as readonly unknown[]).includes(country) ? (country as NationalCountry) : undefined;
  if (c === undefined) return undefined;
  const l = (NATIONAL_LAYOUTS as readonly unknown[]).includes(layout) ? (layout as NationalLayout) : "centred";
  return { country: c, layout: l, text: clean(text, 14)?.toUpperCase() ?? NATIONAL_NAMES[c] };
}

type Box = { x0: number; y0: number; x1: number; y1: number };

/** The mark of each country as a path in a box from -50 to 50 each way, y down. Plain fills; some are drawn as two shapes in one path. */
const MARKS: Readonly<Record<NationalCountry, string>> = {
  // A leaf with eleven points and a stem.
  canada: "M0 -50L8 -31L19 -35L16 -12L40 -22L34 -4L50 2L26 16L30 30L4 26L3 50H-3L-4 26L-30 30L-26 16L-50 2L-34 -4L-40 -22L-16 -12L-19 -35L-8 -31Z",
  // A star of five points.
  usa: "M0 -50L11.8 -16.2L47.6 -15.5L19 6.2L29.4 40.5L0 20L-29.4 40.5L-19 6.2L-47.6 -15.5L-11.8 -16.2Z",
  // The Nordic cross: the upright is nearer the hoist.
  sweden: "M-50 -11H50V11H-50ZM-32 -50H-10V50H-32Z",
  finland: "M-50 -11H50V11H-50ZM-32 -50H-10V50H-32Z",
  norway: "M-50 -11H50V11H-50ZM-32 -50H-10V50H-32Z",
  // A wedge from the hoist.
  czechia: "M-50 -50L12 0L-50 50Z",
  // A double cross.
  slovakia: "M-8 -50H8V-34H28V-20H8V-8H34V8H8V50H-8V8H-34V-8H-8V-20H-28V-34H-8Z",
  // A plain cross with four equal arms.
  switzerland: "M-12 -40H12V-12H40V12H12V40H-12V12H-40V-12H-12Z",
  // Three bars.
  germany: "M-50 -48H50V-18H-50ZM-50 -15H50V15H-50ZM-50 18H50V48H-50Z",
  // A band between two thin ones.
  latvia: "M-50 -40H50V-26H-50ZM-50 -10H50V10H-50ZM-50 26H50V40H-50Z",
  // The rising sun: a disc.
  japan: "M-40 0A40 40 0 1 0 40 0A40 40 0 1 0 -40 0Z",
  // A lily: a centre petal, two curling ones and a band.
  france: "M0 -50C16 -32 16 -10 0 10C-16 -10 -16 -32 0 -50ZM-6 -2C-30 -30 -50 -10 -44 8C-40 20 -22 20 -14 12C-18 4 -14 0 -6 -2ZM6 -2C30 -30 50 -10 44 8C40 20 22 20 14 12C18 4 14 0 6 -2ZM-26 20H26V30H-26ZM-10 30H10L14 50H-14Z",
};

/** A country's flag, drawn at the scale of the shirt: its colours as they are known. */
interface Flag {
  /** The colours the chest text has to read on. */
  grounds: readonly Rgb[];
}

const C = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const FLAGS: Readonly<Record<NationalCountry, Flag>> = {
  canada: { grounds: [C("#ffffff"), C("#d52b1e")] },
  usa: { grounds: [C("#0a3161")] },
  sweden: { grounds: [C("#006aa7"), C("#fecc00")] },
  finland: { grounds: [C("#ffffff"), C("#003580")] },
  czechia: { grounds: [C("#ffffff"), C("#11457e"), C("#d7141a")] },
  slovakia: { grounds: [C("#ffffff"), C("#0b4ea2")] },
  switzerland: { grounds: [C("#d52b1e"), C("#ffffff")] },
  germany: { grounds: [C("#111111"), C("#dd0000")] },
  latvia: { grounds: [C("#9e3039"), C("#ffffff")] },
  norway: { grounds: [C("#ba0c2f"), C("#ffffff"), C("#00205b")] },
  japan: { grounds: [C("#ffffff"), C("#bc002d")] },
  france: { grounds: [C("#0055a4"), C("#ffffff"), C("#ef4135")] },
};

/** The colours the chest text of a full flag has to read on. */
export const flagGrounds = (country: NationalCountry): readonly Rgb[] => FLAGS[country].grounds;

const rect = (x0: number, y0: number, x1: number, y1: number, fill: string): string => `<path d="M${n2(x0)} ${n2(y0)}H${n2(x1)}V${n2(y1)}H${n2(x0)}Z" fill="${fill}"/>`;

/** A mark at a place: centred on `(cx, cy)`, `size` across, turned by `deg`. */
export function markAt(country: NationalCountry, cx: number, cy: number, size: number, deg: number, fill: string, edge?: string): string {
  const k = size / 100;
  const ink = edge === undefined ? "" : ` stroke="${edge}" stroke-width="${n2(1.1 / k)}" stroke-linejoin="round"`;
  return `<path d="${MARKS[country]}" transform="translate(${n2(cx)} ${n2(cy)}) rotate(${n2(deg)}) scale(${n2(k)})" fill="${fill}"${ink}/>`;
}

/** The full flag over a box, and past its edges (the sleeves), as `defs` and `body`. */
function flagArt(country: NationalCountry, b: Box, uid: string): { defs: string; body: string } {
  const W = b.x1 - b.x0;
  const H = b.y1 - b.y0;
  const mid = (b.x0 + b.x1) / 2;
  const ym = (b.y0 + b.y1) / 2;
  const L = b.x0 - 60;
  const R = b.x1 + 60;
  const bar = (frac: number, edge: number, fill: string, vertical: boolean): string => (vertical ? rect(b.x0 + W * edge, b.y0, b.x0 + W * (edge + frac), b.y1, fill) : rect(L, b.y0 + H * edge, R, b.y0 + H * (edge + frac), fill));
  let defs = "";
  let body = "";
  switch (country) {
    case "usa": {
      // Thirteen stripes, and a blue field of stars over the top of the shirt and the shoulders.
      for (let i = 0; i < 13; i++) body += rect(L, b.y0 + (H * i) / 13, R, b.y0 + (H * (i + 1)) / 13, i % 2 === 0 ? "#b31942" : "#ffffff");
      const fy = b.y0 + H * 0.54;
      body += rect(L, b.y0, R, fy, "#0a3161");
      const star = "M0 -5L1.2 -1.6L4.8 -1.5L1.9 0.6L2.9 4L0 2L-2.9 4L-1.9 0.6L-4.8 -1.5L-1.2 -1.6Z";
      defs += `<pattern id="${uid}ns" patternUnits="userSpaceOnUse" x="${n2(mid - 14)}" y="${n2(b.y0 + 4)}" width="28" height="28"><g fill="#ffffff"><path d="${star}" transform="translate(14 7) scale(1.3)"/><path d="${star}" transform="translate(0 21) scale(1.3)"/><path d="${star}" transform="translate(28 21) scale(1.3)"/></g></pattern>`;
      body += `<path d="M${n2(L)} ${n2(b.y0)}H${n2(R)}V${n2(fy)}H${n2(L)}Z" fill="url(#${uid}ns)"/>`;
      break;
    }
    case "canada":
      body += bar(1, 0, "#d52b1e", true) + rect(L, b.y0, b.x0, b.y1, "#d52b1e") + rect(b.x1, b.y0, R, b.y1, "#d52b1e") + bar(0.5, 0.25, "#ffffff", true);
      body += markAt("canada", mid, ym, W * 0.8, 0, "#d52b1e");
      break;
    case "sweden":
      body += rect(L, b.y0, R, b.y1, "#006aa7") + rect(L, ym - 10, R, ym + 10, "#fecc00") + rect(b.x0 + W * 0.3 - 10, b.y0, b.x0 + W * 0.3 + 10, b.y1, "#fecc00");
      break;
    case "finland":
      body += rect(L, b.y0, R, b.y1, "#ffffff") + rect(L, ym - 10, R, ym + 10, "#003580") + rect(b.x0 + W * 0.3 - 10, b.y0, b.x0 + W * 0.3 + 10, b.y1, "#003580");
      break;
    case "norway":
      body += rect(L, b.y0, R, b.y1, "#ba0c2f") + rect(L, ym - 12, R, ym + 12, "#ffffff") + rect(b.x0 + W * 0.3 - 12, b.y0, b.x0 + W * 0.3 + 12, b.y1, "#ffffff");
      body += rect(L, ym - 6, R, ym + 6, "#00205b") + rect(b.x0 + W * 0.3 - 6, b.y0, b.x0 + W * 0.3 + 6, b.y1, "#00205b");
      break;
    case "switzerland":
      body += rect(L, b.y0, R, b.y1, "#d52b1e") + markAt("switzerland", mid, ym, W * 0.86, 0, "#ffffff");
      break;
    case "czechia":
      body += rect(L, b.y0, R, ym, "#ffffff") + rect(L, ym, R, b.y1, "#d7141a") + `<path d="M${n2(L)} ${n2(b.y0)}L${n2(mid + W * 0.06)} ${n2(ym)}L${n2(L)} ${n2(b.y1)}Z" fill="#11457e"/>`;
      break;
    case "slovakia":
      body += rect(L, b.y0, R, b.y0 + H / 3, "#ffffff") + rect(L, b.y0 + H / 3, R, b.y0 + (2 * H) / 3, "#0b4ea2") + rect(L, b.y0 + (2 * H) / 3, R, b.y1, "#ee1c25");
      body += `<path d="M${n2(mid - 21)} ${n2(ym - 24)}H${n2(mid + 21)}V${n2(ym + 6)}Q${n2(mid + 21)} ${n2(ym + 26)} ${n2(mid)} ${n2(ym + 30)}Q${n2(mid - 21)} ${n2(ym + 26)} ${n2(mid - 21)} ${n2(ym + 6)}Z" fill="#ee1c25" stroke="#ffffff" stroke-width="1.6"/>` + markAt("slovakia", mid, ym - 2, 34, 0, "#ffffff");
      break;
    case "germany":
      body += rect(L, b.y0, R, b.y0 + H / 3, "#111111") + rect(L, b.y0 + H / 3, R, b.y0 + (2 * H) / 3, "#dd0000") + rect(L, b.y0 + (2 * H) / 3, R, b.y1, "#ffce00");
      break;
    case "latvia":
      body += rect(L, b.y0, R, b.y1, "#9e3039") + rect(L, b.y0 + H * 0.4, R, b.y0 + H * 0.6, "#ffffff");
      break;
    case "japan":
      body += rect(L, b.y0, R, b.y1, "#ffffff") + markAt("japan", mid, ym, W * 0.8, 0, "#bc002d");
      break;
    case "france":
      body += rect(L, b.y0, R, b.y1, "#0055a4") + rect(b.x0 + W / 3, b.y0, b.x0 + (2 * W) / 3, b.y1, "#ffffff") + rect(b.x0 + (2 * W) / 3, b.y0, R, b.y1, "#ef4135") + rect(b.x0 + W / 3, b.y0, b.x0 + (2 * W) / 3, b.y1, "#ffffff");
      break;
  }
  return { defs, body };
}

/** The sleeve of a shirt as the four points the layouts need: the shoulder and the cuff on the outer edge, the armpit and the cuff on the inner. */
export interface NationalArm {
  S: Pt;
  P: Pt;
  A: Pt;
  Q: Pt;
}

/** A thing drawn, and the clip it is drawn in: the whole outline, the torso, or one of the sleeves (the picture's left is 0). */
export interface Layer {
  clip: "outline" | "torso" | "arm0" | "arm1" | "none";
  svg: string;
}

/** The plan of a layout: what it draws under the bands and over them, the chest text it asks of the jersey, and the boxes a test holds it to. */
export interface NationalPlan {
  defs: string;
  under: Layer[];
  over: Layer[];
  /** Chest words set along a slant of their own (the diagonal layout): the spot they fill and the angle in degrees (rising to the right is negative on the screen). */
  slant?: { text: string; x: number; y: number; w: number; h: number; deg: number };
  /** The boxes of the marks on the chest (and the corners of the slanted text), for tests. */
  marks: Box[];
  textBox?: Pt[];
  /** The line the diagonal layout cuts along: from the foot to the top. */
  cut?: [Pt, Pt];
}

export interface Colours {
  body: string;
  trim: string;
  trim2: string;
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const boxOf = (cx: number, cy: number, s: number): Box => ({ x0: cx - s / 2, y0: cy - s / 2, x1: cx + s / 2, y1: cy + s / 2 });

/** The mark turned to sit upright on a sleeve: its top toward the shoulder. */
const armAngle = (a: NationalArm): number => {
  const vx = a.S[0] - a.P[0];
  const vy = a.S[1] - a.P[1];
  return (Math.atan2(vx, -vy) * 180) / Math.PI;
};

const armMarks = (country: NationalCountry, arms: readonly NationalArm[], f: number, k: number, fill: string, edge: string | undefined, boxes: Box[]): Layer[] =>
  arms.map((a, i) => {
    const m = lerp(lerp(a.S, a.P, f), lerp(a.A, a.Q, f), 0.5);
    const w = Math.hypot(lerp(a.S, a.P, f)[0] - lerp(a.A, a.Q, f)[0], lerp(a.S, a.P, f)[1] - lerp(a.A, a.Q, f)[1]);
    boxes.push(boxOf(m[0], m[1], w * k));
    return { clip: (i === 0 ? "arm0" : "arm1") as Layer["clip"], svg: markAt(country, m[0], m[1], w * k, armAngle(a), fill, edge) };
  });

/**
 * What a national layout draws on one view of a shirt. `view` is the one being drawn; only the full flag also covers the back. `arms` are the sleeves' points (none for a tank) and `colours` the shirt's.
 */
export function nationalPlan(n: NationalR, spec: CutSpec, view: "front" | "back", uid: string, arms: readonly NationalArm[], colours: Colours): NationalPlan {
  const plan: NationalPlan = { defs: "", under: [], over: [], marks: [] };
  const { country, layout } = n;
  const trim = colours.trim;
  const edge = colours.trim2 === colours.trim ? colours.body : colours.trim2;
  const cx0 = 100 - spec.wu + 3;
  const cx1 = 100 + spec.wu - 3;
  const top = spec.ay + 8;
  const bottom = spec.hy - 22;
  if (layout === "flag") {
    const art = flagArt(country, { x0: 100 - spec.au, y0: spec.ny - 8, x1: 100 + spec.au, y1: spec.hy + spec.drop + 8 }, uid);
    plan.defs += art.defs;
    plan.under.push({ clip: "outline", svg: art.body });
    return plan;
  }
  if (view === "back") return plan;
  if (layout === "quadrant") {
    // The lower quarter of the front on the wearer's right (the picture's left).
    const box: Box = { x0: cx0 - 8, y0: top - 2, x1: 106, y1: bottom + 8 };
    const s = Math.min(box.x1 - box.x0, box.y1 - box.y0);
    const cx = (box.x0 + box.x1) / 2;
    const cy = (box.y0 + box.y1) / 2;
    plan.marks.push(boxOf(cx, cy, s));
    plan.over.push({ clip: "torso", svg: markAt(country, cx, cy, s, 0, trim, edge) });
  } else if (layout === "centred") {
    const s = Math.min(2 * (cx1 - 100) * 0.8, (bottom - top) * 0.92);
    const cy = (top + bottom) / 2 + 4;
    plan.marks.push(boxOf(100, cy, s));
    plan.over.push({ clip: "torso", svg: markAt(country, 100, cy, s, 0, trim, edge) });
    plan.over.push(...armMarks(country, arms, 0.58, 0.6, trim, edge, plan.marks));
  } else if (layout === "arched") {
    const s = Math.min(46, (bottom - top) * 0.5);
    const cy = spec.text.y + spec.text.h / 2 + 8 + s / 2 + 4;
    plan.marks.push(boxOf(100, cy, s));
    plan.over.push({ clip: "torso", svg: markAt(country, 100, cy, s, 0, trim, edge) });
    const hy = spec.hy - 36;
    for (const side of [-1, 1]) {
      const x = 100 + side * (spec.hu - 12);
      plan.marks.push(boxOf(x, hy, 22));
      plan.over.push({ clip: "torso", svg: markAt(country, x, hy, 22, 0, trim, edge) });
    }
    plan.over.push(...armMarks(country, arms, 0.7, 0.62, trim, edge, plan.marks));
  } else if (layout === "diagonal") {
    // The mark is cut along a slant and the name runs up the cut, beside it.
    const A: Pt = [cx0 + 14, bottom];
    const B: Pt = [100 + 18, top - 2];
    plan.cut = [A, B];
    const dx = B[0] - A[0];
    const dy = B[1] - A[1];
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const s = 74;
    const cy = (top + bottom) / 2 + 2;
    const cx = A[0] + ((bottom - cy) / (bottom - (top - 2))) * dx + 8;
    const half = `M${n2(A[0])} ${n2(A[1])}L${n2(B[0])} ${n2(B[1])}L${n2(cx1 + 30)} ${n2(top - 30)}L${n2(cx1 + 30)} ${n2(bottom + 30)}Z`;
    plan.defs += `<clipPath id="${uid}nd"><path d="${half}"/></clipPath>`;
    plan.over.push({ clip: "torso", svg: `<g clip-path="url(#${uid}nd)">${markAt(country, cx, cy, s, 0, trim, edge)}</g>` });
    plan.marks.push({ x0: Math.max(cx - s / 2, 0), y0: cy - s / 2, x1: cx + s / 2, y1: cy + s / 2 });
    const h = 19;
    const gap = h / 2 + 3;
    // The normal that points to the left and up of the cut: the name sits on that side, the mark on the other.
    const tx = (A[0] + B[0]) / 2 - Math.abs(uy) * gap;
    const ty = (A[1] + B[1]) / 2 - Math.abs(ux) * gap;
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    plan.slant = { text: n.text, x: tx, y: ty, w: len * 0.86, h, deg };
    const r = (deg * Math.PI) / 180;
    const hw = (len * 0.86) / 2;
    plan.textBox = ([[-hw, -h / 2], [hw, -h / 2], [hw, h / 2], [-hw, h / 2]] as const).map(([px, py]): Pt => [tx + px * Math.cos(r) - py * Math.sin(r), ty + px * Math.sin(r) + py * Math.cos(r)]);
  } else if (layout === "serrated") {
    // The upper body and the shoulders are the trim's, and the body colour comes up from the hem in the points of a leaf.
    const yb = top + 36;
    const pts: [number, number][] = [[-24, 0], [-14, 12], [-6, 4], [0, 34], [6, 4], [14, 12], [24, 0]].map(([dx, dh]) => [100 + (dx as number) * 1.6, yb - (dh as number)]);
    const row = pts.flatMap(([x, y], i) => (i === 0 ? [] : [[x, y] as [number, number]]));
    const left: Pt = [-30, yb + 4];
    const right: Pt = [230, yb + 4];
    let d = `M-30 -20H230V${n2(right[1])}`;
    for (const [x, y] of [...row].reverse()) d += `L${n2(x)} ${n2(y)}`;
    d += `L${n2(pts[0]![0])} ${n2(pts[0]![1])}L${n2(left[0])} ${n2(left[1])}Z`;
    plan.under.push({ clip: "torso", svg: `<path d="${d}" fill="${trim}"/>` });
    arms.forEach((a, i) => {
      // Across each sleeve a row of points: the trim above, toward the shoulder, and the sleeve's own below.
      const along = Math.hypot(a.P[0] - a.S[0], a.P[1] - a.S[1]);
      const ax = (a.P[0] - a.S[0]) / along;
      const ay = (a.P[1] - a.S[1]) / along;
      const o = lerp(a.S, a.P, 0.5);
      const inn = lerp(a.A, a.Q, 0.5);
      const toward = (t: number, back: number): Pt => {
        const p = lerp(o, inn, t);
        return [p[0] - ax * back, p[1] - ay * back];
      };
      const teeth = [-0.4, 0, 0.17, 0.33, 0.5, 0.67, 0.83, 1, 1.4].map((t, k) => toward(t, k % 2 === 0 || t < 0 || t > 1 ? 0 : 12));
      const s0 = lerp(a.S, a.A, -0.5);
      const s1 = lerp(a.S, a.A, 1.5);
      const sd = `M${n2(s0[0])} ${n2(s0[1])}L${n2(s1[0])} ${n2(s1[1])}${[...teeth].reverse().map((p) => `L${n2(p[0])} ${n2(p[1])}`).join("")}Z`;
      plan.under.push({ clip: i === 0 ? "arm0" : "arm1", svg: `<path d="${sd}" fill="${trim}"/>` });
    });
  }
  return plan;
}
