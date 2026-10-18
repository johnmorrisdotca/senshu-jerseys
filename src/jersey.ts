// A jersey, front or back: its silhouette from the cut's measures, what the cut carries (collar, sleeves, stripes, panels), its pattern, the cloth's folds and edge, and the
// number, name and crest. Every drawing is a pure function of its options; every id in it comes from a hash of them, so two drawings on one page never share one by accident.
import { CUTS, cutSpec, type CollarId, type CutId, type CutSpec } from "./cuts.ts";
import { BLACK, WHITE, blend, contrast, hashOf, hexOf, inkOn, lum, shade, worst, type Rgb } from "./colour.ts";
import { crestDocument, crestImage, type EmblemRenderer } from "./emblems.ts";
import { resolve, type Bands, type ChestBadgeR, type JerseyOptions, type Resolved, type SleeveSide } from "./options.ts";
import { cubic, lerp, n2, poly, quad, rounded, type Pt } from "./path.ts";
import { flagGrounds, nationalPlan, type Layer, type NationalArm } from "./national.ts";
import { drawRun, layout } from "./text.ts";

export const JERSEY_WIDTH = 200;
export const JERSEY_HEIGHT = 232;

/** The box a cut is drawn in, from y = 0 down `JERSEY_HEIGHT`: the 200 by 232 body with `reach` units more on each side, where the cut's sleeves go (still, and at every turn, thick cloth included). */
export interface JerseyBox {
  /** The left edge in the body's own units: minus the reach. The middle of the shirt is x = 100 whatever the box. */
  x: number;
  /** The width: 200 plus the reach on both sides. The box is `JERSEY_HEIGHT` tall from y = 0. */
  w: number;
}

/**
 * The view box of a cut. A sleeve of a football, rugby, soccer or baseball shirt, and a turn of any of them, reaches past the 200 units of the body, so these cuts have a wider box (`CUTS[cut].reach` on each
 * side); a hockey, basketball and handball shirt almost never need more, so theirs is the body itself. It is one box per cut, whatever the sleeve, look or angle, so that a drawing does not change size.
 */
export function jerseyBox(cut: CutId): JerseyBox {
  const reach = CUTS[cut].reach ?? 0;
  return { x: -reach, w: JERSEY_WIDTH + 2 * reach };
}
/** The slant of diagonal chest text, in degrees. */
const DIAGONAL = 28;

type P3 = [number, number, number?];

/** The facts about a drawing's shape, worked out once: the outline, the torso and the sleeves as paths, and the measures the rest of the drawing hangs on. */
interface Shape {
  spec: CutSpec;
  outline: string;
  torso: string;
  sleeves: { L: SleeveGeo; R: SleeveGeo } | undefined;
  nw: number;
  tank: boolean;
  /** The armpit and hem measures actually used (a vest's differ from a sleeved shirt's). */
  ay: number;
  /** The torso's half-outline as `[u, y]`, down from the neck to the hem, whatever the sleeve (a raglan's torso as a set-in one's): what the turning view's body is lofted from. */
  half: [number, number][];
}

interface SleeveGeo {
  side: 1 | -1;
  S: Pt;
  P: Pt;
  Q: Pt;
  A: Pt;
  NL: Pt;
  /** The sleeve's angle below the level. */
  a: number;
  l: number;
  poly: string;
}

const NECK_W: Record<CollarId, number> = { crew: 21, v: 22, "lace-up": 22, polo: 21, round: 25, wishbone: 24, band: 20, zip: 20, point: 21 };
const FRONT_DEPTH: Record<CollarId, number> = { crew: 17, v: 36, "lace-up": 40, polo: 14, round: 26, wishbone: 40, band: 10, zip: 16, point: 15 };
const BACK_DEPTH: Record<CollarId, number> = { crew: 7, v: 9, "lace-up": 7, polo: 6, round: 11, wishbone: 12, band: 5, zip: 5, point: 6 };
const BACK_RISE = 4;

function sleeveGeo(spec: CutSpec, id: "long" | "elbow" | "short", side: 1 | -1, nw: number, raglan: boolean): SleeveGeo | undefined {
  const sp = spec.sleeves[id];
  if (sp === undefined) return undefined;
  const rad = (sp.a * Math.PI) / 180;
  const S: Pt = [spec.su, spec.sy];
  const P: Pt = [S[0] + sp.l * Math.cos(rad), S[1] + sp.l * Math.sin(rad)];
  const Q: Pt = [P[0] - sp.cw * Math.sin(rad), P[1] + sp.cw * Math.cos(rad)];
  const A: Pt = [spec.au, spec.ay];
  const NL: Pt = [nw, spec.ny];
  const abs = (p: Pt): Pt => [100 + side * p[0], p[1]];
  const pts: Pt[] = raglan ? [NL, S, P, Q, A] : [S, P, Q, A];
  return { side, S: abs(S), P: abs(P), Q: abs(Q), A: abs(A), NL: abs(NL), a: sp.a, l: sp.l, poly: poly(pts.map(abs)) };
}

/** The point `f` of the way down a sleeve (0 at the shoulder, 1 at the cuff) on its outer edge, and on its inner edge. */
const outerAt = (s: SleeveGeo, f: number): Pt => lerp(s.S, s.P, f);
const innerAt = (s: SleeveGeo, f: number): Pt => lerp(s.A, s.Q, f);

export function shapeOf(r: Resolved): Shape {
  const spec = cutSpec(r.cut, r.fit);
  const tank = r.sleeve === "none";
  const nw = NECK_W[r.collar] + (tank && r.collar !== "round" ? 2 : 0);
  const ay = tank && spec.tank === undefined ? spec.ay + 12 : spec.ay;
  const ny = spec.ny;
  const left: P3[] = [];
  let sleeves: Shape["sleeves"];
  const backTop = (): Pt[] => quad([100 + nw, ny], [100, ny - 2 * BACK_RISE], [100 - nw, ny], 8);
  left.push([nw, ny, 2.5]);
  const tankSpec = spec.tank ?? { su: 46, sy: ny + 6, bulge: 14 };
  if (tank) {
    const su = tankSpec.su;
    left.push([su, tankSpec.sy, 4]);
    for (const p of cubic([su, tankSpec.sy], [su - tankSpec.bulge, tankSpec.sy + 26], [spec.au - tankSpec.bulge * 0.9, ay - 30], [spec.au, ay])) left.push([p[0], p[1], 0]);
    left.push([spec.au, ay, 3]);
  } else {
    const L = sleeveGeo(spec, r.sleeve as "long" | "elbow" | "short", -1, nw, false);
    const R = sleeveGeo(spec, r.sleeve as "long" | "elbow" | "short", 1, nw, false);
    if (L === undefined || R === undefined) throw new Error("a sleeve the cut does not have");
    const raglanL = sleeveGeo(spec, r.sleeve as "long" | "elbow" | "short", -1, nw, r.raglan);
    const raglanR = sleeveGeo(spec, r.sleeve as "long" | "elbow" | "short", 1, nw, r.raglan);
    sleeves = { L: raglanL ?? L, R: raglanR ?? R };
    // From the left sleeve's own measures, back in half-space.
    const u = (p: Pt): [number, number] => [100 - p[0], p[1]];
    left.push([...u(L.S), 6] as P3, [...u(L.P), 1.5] as P3, [...u(L.Q), 1.5] as P3, [...u(L.A), 4] as P3);
  }
  // The side, down to the hem, and the hem across.
  const aU = spec.au;
  const mid: Pt = [spec.wu, (ay + spec.hy) / 2];
  const ctrl: Pt = [2 * mid[0] - (aU + spec.hu) / 2, mid[1]];
  for (const p of quad([aU, ay], ctrl, [spec.hu, spec.hy], 7)) left.push([p[0], p[1], 0]);
  left.push([spec.hu, spec.hy, 5]);
  // The whole outline: down the left, along the hem, up the right, along the back of the neck.
  const hem = quad([100 - spec.hu, spec.hy], [100, spec.hy + 2 * spec.drop], [100 + spec.hu, spec.hy], 10);
  const pts: P3[] = [];
  for (const [uu, y, rr] of left) pts.push([100 - uu, y, rr]);
  for (const p of hem) pts.push([p[0], p[1], 0]);
  for (const [uu, y, rr] of [...left].reverse()) pts.push([100 + uu, y, rr]);
  for (const p of backTop()) pts.push([p[0], p[1], 0]);
  const outline = rounded(pts);
  // The torso: the same without the sleeves.
  const t: P3[] = [[nw, ny, 2.5]];
  if (tank) t.push(...left.slice(1, left.length - 8));
  else if (r.raglan) t.push([spec.au, ay, 3]);
  else t.push([spec.su, spec.sy, 6], [spec.au, ay, 3]);
  const sidePts: P3[] = [];
  for (const p of quad([aU, ay], ctrl, [spec.hu, spec.hy], 7)) sidePts.push([p[0], p[1], 0]);
  sidePts.push([spec.hu, spec.hy, 5]);
  const tl: P3[] = tank ? [...left] : [...t, ...sidePts];
  const tpts: P3[] = [];
  for (const [uu, y, rr] of tl) tpts.push([100 - uu, y, rr]);
  for (const p of hem) tpts.push([p[0], p[1], 0]);
  for (const [uu, y, rr] of [...tl].reverse()) tpts.push([100 + uu, y, rr]);
  for (const p of backTop()) tpts.push([p[0], p[1], 0]);
  const half: [number, number][] = tank ? left.map((p): [number, number] => [p[0], p[1]]) : [[nw, ny], [spec.su, spec.sy], [spec.au, ay], ...sidePts.map((p): [number, number] => [p[0], p[1]])];
  return { spec, outline, torso: rounded(tpts), sleeves, nw, tank, ay, half };
}

/** The bands of a repeat, covering `from` to `to` along one axis: rectangles for the bands that are not the body's colour, by colour index. */
function repeatBands(seq: Bands, from: number, to: number, centred: number | undefined): Record<number, [number, number][]> {
  const out: Record<number, [number, number][]> = { 1: [], 2: [], 3: [] };
  const total = seq.reduce((s, v, i) => (i % 2 === 0 ? s + v : s), 0);
  if (total <= 0) return out;
  let start = centred === undefined ? from : centred - total / 2 - Math.ceil((centred - from) / total) * total;
  let guard = 0;
  while (start < to && guard++ < 400) {
    let at = start;
    for (let i = 0; i + 1 < seq.length; i += 2) {
      const w = seq[i] as number;
      const c = seq[i + 1] as number;
      if (c !== 0 && at + w > from && at < to) (out[c] as [number, number][]).push([at, at + w]);
      at += w;
    }
    start += total;
  }
  return out;
}

/** The ink for the number and the name, and the outline (or none), given what is behind them. */
export function inkFor(r: Resolved, grounds: readonly Rgb[]): { fill: Rgb; outline: Rgb | undefined; heavy: boolean } {
  const mixed = grounds.length > 1;
  const ink = ink2(r, grounds, mixed);
  // Over stripes the outline is what makes the lettering stand out when the fill alone is lost on one of the colours: a hair of white round a black number leaves a black stripe touching its edge,
  // so there the outline is wide (`HEAVY` of a stroke on each side) and the fill and the outline are told apart from the stripes by it.
  return { ...ink, heavy: mixed && ink.outline !== undefined && worst(ink.fill, grounds) < 4.5 };
}

/** The fill and the outline `inkFor` chooses. */
function ink2(r: Resolved, grounds: readonly Rgb[], mixed: boolean): { fill: Rgb; outline: Rgb | undefined } {
  // Tackle-twill: a fill that does not read on the cloth on its own (red numbers on royal blue) is kept when the outline asked for reads on the cloth and the fill reads on the outline.
  if (!mixed && r.fill !== undefined && r.outline !== undefined && worst(r.fill, grounds) < 4.5 && worst(r.outline, grounds) >= 4.5 && contrast(r.fill, r.outline) >= 3) return { fill: r.fill, outline: r.outline };
  // Over stripes of two colours no single ink reads on both, but a fill and an outline that are given can: a black number with a white edge reads on the white stripes by its fill and on the black by its edge.
  if (mixed && r.fill !== undefined && r.outline !== undefined && contrast(r.fill, r.outline) >= 4.5 && grounds.every((g) => Math.max(contrast(r.fill as Rgb, g), contrast(r.outline as Rgb, g)) >= 4.5)) return { fill: r.fill, outline: r.outline };
  const fill = inkOn(grounds, [r.fill, r.trim, r.trim2, WHITE, BLACK]);
  let outline: Rgb | undefined;
  if (mixed) outline = inkOn([fill], [r.outline, r.trim2, BLACK, WHITE]);
  else if (r.outline !== undefined) outline = r.outline;
  else if (r.trim2Given && contrast(r.trim2, fill) > 1.5 && contrast(r.trim2, grounds[0] as Rgb) > 1.3) outline = r.trim2;
  // A given outline that is the ink itself is no outline.
  if (outline !== undefined && contrast(outline, fill) < 1.15) outline = undefined;
  return { fill, outline };
}

/** The colours a pattern lays behind lettering: the body and the trim, and the second trim or the number's fill where a `repeat` uses them. */
function patternGrounds(r: Resolved): Rgb[] {
  const out: Rgb[] = [r.body, r.trim];
  const rep = r.pattern === "stripes" || r.pattern === "hoops" ? r.repeat : undefined;
  for (let i = 0; rep !== undefined && i + 1 < rep.length; i += 2) {
    const c = rep[i + 1];
    if (c === 2) out.push(r.trim2);
    else if (c === 3 && r.fill !== undefined) out.push(r.fill);
  }
  return out;
}

/** The width of the outline on lettering that has to stand out from stripes, as a part of a stroke, on each side. */
const HEAVY = 0.45;

/**
 * The plate behind the back's name and number: one rounded patch as wide as the widest line and as tall as both, with a margin of over half a stroke round the lettering, so that no stripe comes
 * near the edge of a letter. A thin darker edge keeps it from vanishing on a stripe of its own colour.
 */
function plateOf(r: Resolved, spec: CutSpec, colour: string): string {
  const lines: { top: number; bottom: number; width: number; sw: number }[] = [];
  if (r.name !== undefined) {
    const s = spec.name;
    const arch = r.nameArch === "arched" ? 110 : 0;
    const run = layout(r.name, s.x, s.y, { height: s.h, maxWidth: s.w, weight: "bold", arch, tracking: 0.45 });
    const sag = arch > 0 ? arch * (1 - Math.cos(Math.min(run.width / 2 / arch, 1.2))) : 0;
    lines.push({ top: s.y - run.height / 2, bottom: s.y + run.height / 2 + sag, width: run.width, sw: run.sw });
  }
  if (r.number !== undefined) {
    const s = spec.number.back;
    const run = layout(r.number, s.x, s.y, { height: s.h, maxWidth: s.w, weight: "black" });
    lines.push({ top: s.y - run.height / 2, bottom: s.y + run.height / 2, width: run.width, sw: run.sw });
  }
  const pad = Math.max(...lines.map((l) => l.sw)) * 0.6;
  const x0 = 100 - Math.max(...lines.map((l) => l.width)) / 2 - pad;
  const x1 = 200 - x0;
  const y0 = Math.min(...lines.map((l) => l.top)) - pad;
  const y1 = Math.max(...lines.map((l) => l.bottom)) + pad;
  const c = 3;
  const d = `M${n2(x0 + c)} ${n2(y0)}H${n2(x1 - c)}Q${n2(x1)} ${n2(y0)} ${n2(x1)} ${n2(y0 + c)}V${n2(y1 - c)}Q${n2(x1)} ${n2(y1)} ${n2(x1 - c)} ${n2(y1)}H${n2(x0 + c)}Q${n2(x0)} ${n2(y1)} ${n2(x0)} ${n2(y1 - c)}V${n2(y0 + c)}Q${n2(x0)} ${n2(y0)} ${n2(x0 + c)} ${n2(y0)}Z`;
  const rgb = r.plate as Rgb;
  return `<path d="${d}" fill="${colour}" stroke="${hexOf(shade(rgb, lum(rgb) > 0.4 ? -0.55 : 0.55))}" stroke-width="1" stroke-linejoin="round"/>`;
}

/** True when part of the pattern lies behind the spot on the view: its colour is then also a ground for the ink. */
function patternBehind(r: Resolved, view: "front" | "back", where: "number" | "name" | "chest"): boolean {
  switch (r.pattern) {
    case "stripes":
    case "hoops":
    case "halves":
    case "quarters":
    case "pinstripes":
      return true;
    case "sash":
    case "chevron":
      return view === "front";
    case "chest-band":
      return view === "front" && where !== "name";
    default:
      return r.chestBands.length > 0 && view === "front" && where !== "name";
  }
}

export interface View {
  defs: string;
  body: string;
  outline: string;
  /** The id of the outline in the defs, to draw it again with `<use>`. */
  outlineId: string;
  /** The id of the clip of the outline, in the defs. */
  clipId: string;
  edge: string;
  width: number;
  height: number;
}

/**
 * How a view is made for the turning garment (`volume.ts`), which wraps it round a body: `mirror` draws the back's pattern as seen from behind, `rim` leaves out the line round the outline (a seam would be stretched
 * down the side), and `details` the numbers and patches on the sleeves, which the garment places on the arms itself.
 */
export interface ViewHow {
  mirror?: boolean;
  rim?: boolean;
  details?: boolean;
}

/** One view of the jersey. `uid` makes the ids unique to this drawing. */
export function jerseyView(r: Resolved, view: "front" | "back", uid: string, emblems?: EmblemRenderer, how: ViewHow = {}): View {
  const { mirror = false, rim = true, details = true } = how;
  const sh = shapeOf(r);
  const spec = sh.spec;
  const line = r.look === "line";
  const cloth = r.look === "cloth";
  const body = hexOf(r.body);
  const trimHex = hexOf(r.trim);
  const trim2Hex = hexOf(r.trim2);
  const fill3 = r.fill === undefined ? trimHex : hexOf(r.fill);
  const colourOf = (c: number): string => (c === 0 ? body : c === 1 ? trimHex : c === 2 ? trim2Hex : fill3);
  const edgeRgb = lum(r.body) > 0.1 ? shade(r.body, -0.42) : shade(r.body, 0.3);
  const edge = line ? "currentColor" : hexOf(edgeRgb);
  const seamRgb = lum(r.body) > 0.1 ? shade(r.body, -0.3) : shade(r.body, 0.22);
  const seam = hexOf(seamRgb);
  const idc = `${uid}c`;
  const idt = `${uid}t`;
  const idl = `${uid}l`;
  const idr = `${uid}r`;
  const ny = spec.ny;
  const nw = sh.nw;
  const collar = r.collar;
  const L = sh.sleeves?.L;
  const R = sh.sleeves?.R;
  const ido = `${uid}o`;
  const useO = (attrs: string): string => `<use href="#${ido}" ${attrs}/>`;
  let defs = `<path id="${ido}" d="${sh.outline}"/><clipPath id="${idc}"><use href="#${ido}"/></clipPath><clipPath id="${idt}"><path d="${sh.torso}"/></clipPath>`;
  if (L !== undefined && R !== undefined) defs += `<clipPath id="${idl}"><path d="${L.poly}"/></clipPath><clipPath id="${idr}"><path d="${R.poly}"/></clipPath>`;

  // ---- The neck. ----
  const fd = FRONT_DEPTH[collar] + (sh.tank && collar === "v" ? -4 : 0);
  const bd = BACK_DEPTH[collar];
  const NLp: Pt = [100 - nw, ny];
  const NRp: Pt = [100 + nw, ny];
  const frontCurve = (): string => {
    if (collar === "v" || collar === "lace-up") return `M${n2(NLp[0])} ${n2(NLp[1])}L100 ${n2(ny + fd)}L${n2(NRp[0])} ${n2(NRp[1])}`;
    if (collar === "wishbone") return `M${n2(NLp[0])} ${n2(NLp[1])}L${n2(95)} ${n2(ny + fd - 5)}Q100 ${n2(ny + fd + 3)} 105 ${n2(ny + fd - 5)}L${n2(NRp[0])} ${n2(NRp[1])}`;
    return `M${n2(NLp[0])} ${n2(NLp[1])}Q100 ${n2(ny + 2 * fd)} ${n2(NRp[0])} ${n2(NRp[1])}`;
  };
  const backCurve = `M${n2(NLp[0])} ${n2(NLp[1])}Q100 ${n2(ny + 2 * bd)} ${n2(NRp[0])} ${n2(NRp[1])}`;
  const neckEdge = view === "front" ? frontCurve() : backCurve;
  const topArc = `Q100 ${n2(ny - 2 * BACK_RISE)} ${n2(NLp[0])} ${n2(NLp[1])}Z`;
  const hole = `${neckEdge}${topArc}`;
  const insideC = hexOf(shade(r.body, lum(r.body) > 0.08 ? -0.55 : 0.12));
  const collarIdx = r.collarColor;
  const collarRgb = collarIdx === 0 ? r.body : collarIdx === 1 ? r.trim : collarIdx === 2 ? r.trim2 : (r.fill ?? r.trim);
  const collarC = line ? "currentColor" : colourOf(collarIdx);

  // ---- Drawing. ----
  let out = "";
  const add = (s: string): void => {
    out += s;
  };

  // The cloth: body colour (raglan sleeves, a sleeve colour, panels and the pattern are laid over it).
  if (!line) add(useO(`fill="${body}"`));

  // Everything inside the silhouette.
  let inner = "";
  const addIn = (s: string): void => {
    inner += s;
  };
  const sleeveColourIdx = r.sleeveColor ?? (r.raglan ? 1 : r.yoke === "full-arm" ? 1 : 0);

  // ---- Pattern: the torso, then the sleeves (a pattern turns with the sleeve's axis). ----
  const pat = r.pattern;
  const seqDefault: Bands = pat === "pinstripes" ? [] : [14, 1, 14, 0];
  const seq = r.repeat ?? seqDefault;
  const stripeRect = (a: number, b: number, vertical: boolean, c: number): string => (vertical ? `<path d="M${n2(a)} 0H${n2(b)}V${JERSEY_HEIGHT}H${n2(a)}Z" fill="${colourOf(c)}"/>` : `<path d="M0 ${n2(a)}H${JERSEY_WIDTH}V${n2(b)}H0Z" fill="${colourOf(c)}"/>`);
  const patternLayer = (vertical: boolean, centred: number | undefined, from: number, to: number): string => {
    let s = "";
    const bands = repeatBands(seq, from, to, centred);
    for (const c of [1, 2, 3]) for (const [a, b] of bands[c] as [number, number][]) s += stripeRect(a, b, vertical, c);
    return s;
  };
  const patternInk = (colour: number): string => colourOf(colour);
  if (!line) {
    let torsoPattern = "";
    const sleevePattern: { L: string; R: string } = { L: "", R: "" };
    if (pat === "stripes" && r.stripeCount !== undefined) {
      const w = (2 * spec.au) / r.stripeCount;
      const period = 2 * w;
      let x = 100 - spec.au - Math.ceil(120 / period) * period;
      while (x < 330) {
        torsoPattern += stripeRect(x, x + w, true, 1);
        x += period;
      }
    } else if (pat === "stripes") {
      torsoPattern = patternLayer(true, 100, -120, 320);
    } else if (pat === "hoops") {
      torsoPattern = patternLayer(false, undefined, ny - 8 - (seq.reduce((s, v, i) => (i % 2 === 0 ? s + v : s), 0) || 28), JERSEY_HEIGHT + 20).replace(/^/, "");
    } else if (pat === "halves") {
      torsoPattern = `<path d="M100 0H210V240H100Z" fill="${trimHex}"/>`;
    } else if (pat === "quarters") {
      const ys = Math.round((spec.ay + spec.hy) / 2 - 6);
      torsoPattern = `<path d="M0 0H100V${ys}H0Z" fill="${trimHex}"/><path d="M100 ${ys}H210V240H100Z" fill="${trimHex}"/>`;
    } else if (pat === "sash" && view === "front") {
      torsoPattern = `<path d="M${n2(100 - spec.su + 4)} ${n2(spec.sy - 4)}L${n2(100 - spec.su + 34)} ${n2(spec.sy - 4)}L${n2(100 + spec.hu + 10)} ${n2(spec.hy + 6)}L${n2(100 + spec.hu - 24)} ${n2(spec.hy + 6)}Z" fill="${trimHex}"/>`;
      if (r.trim2Given) torsoPattern += `<path d="M${n2(100 - spec.su + 34)} ${n2(spec.sy - 4)}L${n2(100 + spec.hu + 10)} ${n2(spec.hy + 6)}M${n2(100 - spec.su + 4)} ${n2(spec.sy - 4)}L${n2(100 + spec.hu - 24)} ${n2(spec.hy + 6)}" stroke="${trim2Hex}" stroke-width="2.4" fill="none"/>`;
    } else if (pat === "chevron" && view === "front") {
      const y0 = Math.round(r.chestY ?? spec.ay - 6);
      const seqc: Bands = r.repeat ?? [14, 1, 12, 0, 14, r.trim2Given ? 2 : 1];
      let y = y0;
      for (let i = 0; i + 1 < seqc.length; i += 2) {
        const w = seqc[i] as number;
        const c = seqc[i + 1] as number;
        if (c !== 0) torsoPattern += `<path d="M${n2(100 - spec.su - 6)} ${n2(y)}L100 ${n2(y + 44)}L${n2(100 + spec.su + 6)} ${n2(y)}V${n2(y + w)}L100 ${n2(y + 44 + w)}L${n2(100 - spec.su - 6)} ${n2(y + w)}Z" fill="${colourOf(c)}"/>`;
        y += w;
      }
    } else if (pat === "pinstripes") {
      const w = 0.9;
      const gap = r.repeat === undefined ? 8 : Math.max(3, r.repeat.reduce((a, v, i) => (i % 2 === 0 ? a + v : a), 0));
      let d = "";
      for (let x = 100 - gap * Math.ceil(120 / gap); x <= 100 + gap * Math.ceil(120 / gap); x += gap) d += `M${n2(x)} 0V${JERSEY_HEIGHT}`;
      torsoPattern = `<path d="${d}" stroke="${patternInk(1)}" stroke-width="${w}" fill="none" stroke-opacity=".9"/>`;
    } else if (pat === "yoke") {
      // The yoke is drawn below with the others.
    }
    if (pat === "chest-band") {
      // handled with the chest bands below
    }
    // Sleeves: colour, then the pattern turned to the sleeve's axis.
    if (L !== undefined && R !== undefined) {
      for (const [s, id, key] of [[L, idl, "L"], [R, idr, "R"]] as const) {
        let layer = "";
        if (sleeveColourIdx !== 0) layer += `<path d="${s.poly}" fill="${colourOf(sleeveColourIdx)}"/>`;
        // The sleeve's own frame: origin at the shoulder, +y along the axis.
        const phi = s.side === -1 ? 90 - s.a : -(90 - s.a);
        let local = "";
        if (!r.patternSleeves) local = "";
        else if (pat === "stripes" && r.stripeCount !== undefined) {
          const w = (2 * spec.au) / r.stripeCount;
          for (let x = -w / 2 - Math.ceil(100 / (2 * w)) * 2 * w; x < 140; x += 2 * w) local += stripeRect(x, x + w, true, 1);
        } else if (pat === "stripes") local = patternLayer(true, 0, -140, 140);
        else if (pat === "pinstripes") {
          let d = "";
          const gap = r.repeat === undefined ? 8 : Math.max(3, r.repeat.reduce((a, v, i) => (i % 2 === 0 ? a + v : a), 0));
          for (let x = -gap * Math.ceil(60 / gap); x <= gap * Math.ceil(60 / gap); x += gap) d += `M${x} -10V140`;
          local = `<path d="${d}" stroke="${patternInk(1)}" stroke-width="0.9" fill="none" stroke-opacity=".9"/>`;
        } else if (pat === "hoops" && r.patternSleeves) {
          const total = seq.reduce((sum, v, i) => (i % 2 === 0 ? sum + v : sum), 0) || 28;
          const bands = repeatBands(seq, -total, 160, undefined);
          for (const c of [1, 2, 3]) for (const [a, b] of bands[c] as [number, number][]) local += `<path d="M-90 ${n2(a)}H90V${n2(b)}H-90Z" fill="${colourOf(c)}"/>`;
        }
        if (r.armBands.length > 0) {
          const total = r.armBands.reduce((a, v, i) => (i % 2 === 0 ? a + v : a), 0);
          let at = -total / 2;
          for (let i = 0; i + 1 < r.armBands.length; i += 2) {
            const w = r.armBands[i] as number;
            const c = r.armBands[i + 1] as number;
            if (c !== 0) local += `<path d="M${n2(at)} -4H${n2(at + w)}V150H${n2(at)}Z" fill="${colourOf(c)}"/>`;
            at += w;
          }
        }
        if (local !== "") layer += `<g transform="translate(${n2(s.S[0])} ${n2(s.S[1])}) rotate(${n2(phi)})">${local}</g>`;
        if (!r.patternSleeves) {
          // The sleeves keep the body's colour.
        } else if (pat === "halves") {
          // The sleeve takes its half's colour: the wearer's right half (the picture's left) is the body's, the other the trim's.
          if (s.side * (mirror ? -1 : 1) === 1) layer += `<path d="${s.poly}" fill="${trimHex}"/>`;
        } else if (pat === "quarters" && s.side * (mirror ? -1 : 1) === -1) layer += `<path d="${s.poly}" fill="${trimHex}"/>`;
        if (layer !== "") {
          if (key === "L") sleevePattern.L = `<g clip-path="url(#${id})">${layer}</g>`;
          else sleevePattern.R = `<g clip-path="url(#${id})">${layer}</g>`;
        }
      }
    }
    if (torsoPattern !== "") addIn(`<g clip-path="url(#${idt})">${mirror ? `<g transform="matrix(-1 0 0 1 200 0)">${torsoPattern}</g>` : torsoPattern}</g>`);
    addIn(sleevePattern.L + sleevePattern.R);
  }

  // ---- Yoke and shoulder panels. ----
  if (!line && (r.yoke !== "none" || pat === "yoke")) {
    const kind = r.yoke === "none" ? "curved" : r.yoke;
    const ay = sh.ay;
    let region = "";
    if (kind === "square") region = `M-10 -10H210V${n2(ay - 6)}H-10Z`;
    else {
      const yc = ny + 36;
      const ye = ay - 14;
      region = `M-10 -10H210V${n2(ye)}L${n2(100 + spec.su + 10)} ${n2(ye)}Q100 ${n2(2 * yc - ye)} ${n2(100 - spec.su - 10)} ${n2(ye)}L-10 ${n2(ye)}Z`;
    }
    const yokeC = r.panels === 2 ? trim2Hex : trimHex;
    addIn(`<path d="${region}" fill="${yokeC}"/>`);
    if (r.trim2Given && kind !== "square") addIn(`<path d="M${n2(100 - spec.su - 10)} ${n2(sh.ay - 14)}Q100 ${n2(2 * (ny + 36) - (sh.ay - 14))} ${n2(100 + spec.su + 10)} ${n2(sh.ay - 14)}" stroke="${trim2Hex}" stroke-width="2.6" fill="none"/>`);
  }

  // ---- A national layout: the country's mark and flag, under the bands (fills) and over them (marks). ----
  let nat: ReturnType<typeof nationalPlan> | undefined;
  const clipFor = (l: Layer): string => (l.clip === "outline" ? idc : l.clip === "torso" ? idt : l.clip === "arm0" ? idl : idr);
  if (r.national !== undefined && !line) {
    const arms: NationalArm[] = L !== undefined && R !== undefined ? [L, R].map((s) => ({ S: s.S, P: s.P, A: s.A, Q: s.Q })) : [];
    nat = nationalPlan(r.national, spec, view, uid, arms, { body, trim: trimHex, trim2: trim2Hex });
    defs += nat.defs;
    for (const l of nat.under) addIn(`<g clip-path="url(#${clipFor(l)})">${mirror && l.clip === "outline" ? `<g transform="matrix(-1 0 0 1 200 0)">${l.svg}</g>` : l.svg}</g>`);
  }

  // ---- Side panels of a tank, and the shoulder: bands down each side. ----
  if (!line && sh.tank && r.panels !== 0) {
    const pc = r.panels === 2 ? trim2Hex : trimHex;
    const panel = (side: 1 | -1): string => `<path d="M${n2(100 + side * (spec.au - 2))} ${spec.ay - 10}L${n2(100 + side * (spec.hu + 6))} ${spec.hy + 6}L${n2(100 + side * (spec.hu - 7))} ${spec.hy + 6}Q${n2(100 + side * (spec.wu - 8))} ${n2((spec.ay + spec.hy) / 2)} ${n2(100 + side * (spec.au - 11))} ${spec.ay - 10}Z"/>`;
    // Panels only when asked through `panels` with a pattern-less tank: a trim-coloured strip.
    if (r.pattern === "solid" || r.pattern === "yoke") addIn(`<g fill="${pc}">${panel(-1)}${panel(1)}</g>`);
  }

  // ---- Chest bands and hem bands: horizontal bands across the torso. ----
  const hemBand = (d0: number, d1: number, c: number): string => {
    // Offsets d0 to d1 up from the hem, curved the way the hem is.
    const yb = (d: number, mid: number): number => spec.hy - d + mid;
    return `<path d="M-10 ${n2(yb(d1, 0))}Q100 ${n2(yb(d1, 2 * spec.drop))} 210 ${n2(yb(d1, 0))}V${n2(yb(d0, 0))}Q100 ${n2(yb(d0, 2 * spec.drop))} -10 ${n2(yb(d0, 0))}Z" fill="${colourOf(c)}"/>`;
  };
  let torsoBands = "";
  {
    let at = -3;
    for (let i = 0; i + 1 < r.hemBands.length; i += 2) {
      const w = r.hemBands[i] as number;
      const c = r.hemBands[i + 1] as number;
      if (c !== 0) torsoBands += hemBand(at, at + w, c);
      at += w;
    }
    const cy0 = r.chestY ?? Math.round(spec.ay + 4);
    at = cy0;
    for (let i = 0; i + 1 < r.chestBands.length; i += 2) {
      const w = r.chestBands[i] as number;
      const c = r.chestBands[i + 1] as number;
      if (c !== 0) torsoBands += `<path d="M-10 ${n2(at)}H210V${n2(at + w)}H-10Z" fill="${colourOf(c)}"/>`;
      at += w;
    }
    if (pat === "chest-band") {
      const y0 = r.chestY ?? Math.round(spec.ay + 4);
      torsoBands += `<path d="M-10 ${n2(y0)}H210V${n2(y0 + 20)}H-10Z" fill="${trimHex}"/>`;
      if (r.trim2Given) torsoBands += `<path d="M-10 ${n2(y0 + 20)}H210M-10 ${n2(y0)}H210" stroke="${trim2Hex}" stroke-width="3" fill="none"/>`;
    }
  }
  if (!line && torsoBands !== "") addIn(`<g clip-path="url(#${idt})">${torsoBands}</g>`);

  // ---- Sleeve bands (stripes round the sleeve, at the cuff). ----
  const cuffBand = (s: SleeveGeo, d0: number, d1: number, c: number): string => {
    const f0 = 1 - d1 / s.l;
    const f1 = 1 - d0 / s.l;
    return `<path d="${poly([outerAt(s, f0), outerAt(s, f1), innerAt(s, f1), innerAt(s, f0)])}" fill="${colourOf(c)}"/>`;
  };
  if (L !== undefined && R !== undefined && !line) {
    let bands = "";
    for (const s of [L, R]) {
      let at = -2;
      for (let i = 0; i + 1 < r.sleeveBands.length; i += 2) {
        const w = r.sleeveBands[i] as number;
        const c = r.sleeveBands[i + 1] as number;
        if (c !== 0) bands += cuffBand(s, at, at + w, c);
        at += w;
      }
    }
    // Cuffs: the sleeve's end in a contrasting colour, over the stripes, with the knit's seam where it starts.
    if (r.cuffs !== undefined) {
      const seamInk = `stroke="${hexOf(blend(r.body, BLACK, 0.5))}" stroke-opacity=".5" stroke-width="1" fill="none"`;
      for (const s of [L, R]) {
        const len = Math.min(r.cuffs.len, s.l * 0.6);
        bands += cuffBand(s, -2, len, r.cuffs.c);
        if (cloth) {
          const a = outerAt(s, 1 - len / s.l);
          const b = innerAt(s, 1 - len / s.l);
          bands += `<path d="M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}" ${seamInk}/>`;
        }
      }
    }
    if (bands !== "") addIn(`<g clip-path="url(#${idc})">${bands}</g>`);
    // Armbands: a band round each upper arm, square to the sleeve's axis, over the stripes.
    if (r.armbands !== undefined) {
      const ab = r.armbands;
      const edgeInk = `stroke="${hexOf(blend(r.body, BLACK, 0.5))}" stroke-opacity=".4" stroke-width=".8" fill="none"`;
      for (const [s, id] of [[L, idl], [R, idr]] as const) {
        const phi = s.side === -1 ? 90 - s.a : -(90 - s.a);
        const y0 = (ab.at / 100) * s.l - ab.w / 2;
        addIn(`<g clip-path="url(#${id})"><g transform="translate(${n2(s.S[0])} ${n2(s.S[1])}) rotate(${n2(phi)})"><path d="M-90 ${n2(y0)}H90V${n2(y0 + ab.w)}H-90Z" fill="${colourOf(ab.c)}"/>${cloth ? `<path d="M-90 ${n2(y0)}H90M-90 ${n2(y0 + ab.w)}H90" ${edgeInk}/>` : ""}</g></g>`);
      }
    }
  }

  // ---- An umpire's chest protector, over the front. ----
  if (r.protector && view === "front" && !line) {
    const pad = hexOf(blend(r.body, [92, 98, 106], 0.8));
    const padEdge = hexOf(blend(r.body, BLACK, 0.7));
    const ridge = hexOf(blend(r.body, [150, 156, 164], 0.6));
    const top = spec.ny + 8;
    const bot = spec.ay + 70;
    let d = `<path d="M${n2(100 - 40)} ${n2(top)}Q100 ${n2(top + 16)} ${n2(100 + 40)} ${n2(top)}L${n2(100 + 52)} ${n2(spec.ay + 6)}L${n2(100 + 44)} ${n2(bot - 14)}Q100 ${n2(bot + 12)} ${n2(100 - 44)} ${n2(bot - 14)}L${n2(100 - 52)} ${n2(spec.ay + 6)}Z" fill="${pad}" stroke="${padEdge}" stroke-width="1.3" stroke-linejoin="round"/>`;
    for (const y of [spec.ay + 22, spec.ay + 40]) d += `<path d="M${n2(100 - 46)} ${n2(y)}Q100 ${n2(y + 8)} ${n2(100 + 46)} ${n2(y)}" stroke="${ridge}" stroke-width="2" fill="none" stroke-opacity=".7"/>`;
    for (const sd of [-1, 1]) d += `<path d="M${n2(100 + sd * 40)} ${n2(top)}L${n2(100 + sd * 50)} ${n2(spec.sy - 2)}" stroke="${padEdge}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M${n2(100 + sd * 40)} ${n2(top)}L${n2(100 + sd * 50)} ${n2(spec.sy - 2)}" stroke="${pad}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    addIn(d);
  }

  // ---- The cloth: shading, folds, and the stitched hems. ----
  if (cloth) {
    addIn(
      useO(`fill="url(#${uid}v)"`) + useO(`fill="url(#${uid}h)"`) +
        (L !== undefined && R !== undefined ? `<path d="${L.poly}" fill="#000" fill-opacity="${lum(r.body) > 0.4 ? 0.05 : 0.1}"/><path d="${R.poly}" fill="#000" fill-opacity="${lum(r.body) > 0.4 ? 0.05 : 0.1}"/>` : ""),
    );
    const fk = lum(r.body) > 0.4 ? 0.55 : 1;
    const fold = (d: string, w: number, o: number): string => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${Math.round(o * fk * 100) / 100}" stroke-width="${w}" stroke-linecap="round"/>`;
    const lite = (d: string, w: number, o: number): string => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
    const ay = sh.ay;
    let folds = "";
    for (const sd of [-1, 1] as const) {
      const x = (u: number): number => 100 + sd * u;
      const d1 = `M${n2(x(spec.au - 2))} ${n2(ay + 4)}Q${n2(x(spec.au - 22))} ${n2(ay + 40)} ${n2(x(spec.au - 20))} ${n2(ay + 84)}`;
      const d2 = `M${n2(x(spec.wu - 4))} ${n2(spec.hy - 70)}Q${n2(x(spec.wu - 22))} ${n2(spec.hy - 40)} ${n2(x(spec.wu - 26))} ${n2(spec.hy - 14)}`;
      folds += fold(d1, 5, 0.09) + lite(`M${n2(x(spec.au - 6))} ${n2(ay + 8)}Q${n2(x(spec.au - 26))} ${n2(ay + 40)} ${n2(x(spec.au - 24))} ${n2(ay + 80)}`, 2.4, 0.1);
      folds += fold(d2, 4, 0.07);
    }
    folds += fold(`M${n2(100 - 28)} ${n2(spec.hy - 26)}Q100 ${n2(spec.hy - 14)} ${n2(100 + 28)} ${n2(spec.hy - 26)}`, 4, 0.06);
    if (L !== undefined && R !== undefined) {
      for (const s of [L, R]) {
        const f = 0.58;
        const a = outerAt(s, f);
        const b = innerAt(s, f);
        const m = lerp(a, b, 0.5);
        folds += fold(`M${n2(a[0])} ${n2(a[1])}Q${n2(m[0] + s.side * 4)} ${n2(m[1] + 3)} ${n2(b[0])} ${n2(b[1])}`, 4, 0.08);
        const g = 0.15;
        const a2 = outerAt(s, g);
        const b2 = innerAt(s, g);
        folds += lite(`M${n2(a2[0])} ${n2(a2[1] + 3)}L${n2(lerp(a2, b2, 0.55)[0])} ${n2(lerp(a2, b2, 0.55)[1] + 3)}`, 2.4, 0.12);
      }
    }
    addIn(folds);
    // Hem stitching, the hem and each cuff.
    const stitch = `stroke="${hexOf(blend(r.body, BLACK, 0.5))}" stroke-opacity=".38" stroke-width=".9" stroke-dasharray="2.2 1.8" fill="none"`;
    let stitches = `<path d="M${n2(100 - spec.hu + 4)} ${n2(spec.hy - 4.5)}Q100 ${n2(spec.hy - 4.5 + 2 * spec.drop)} ${n2(100 + spec.hu - 4)} ${n2(spec.hy - 4.5)}" ${stitch}/>`;
    if (L !== undefined && R !== undefined)
      for (const s of [L, R]) {
        const a = outerAt(s, 1 - 4.5 / s.l);
        const b = innerAt(s, 1 - 4.5 / s.l);
        stitches += `<path d="M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}" ${stitch}/>`;
      }
    addIn(stitches);
  }
  if (!line) add(`<g clip-path="url(#${idc})">${inner}</g>`);

  // ---- Seams. ----
  let seams = "";
  if (L !== undefined && R !== undefined) {
    for (const s of [L, R]) {
      const from = r.raglan ? s.NL : s.S;
      seams += `M${n2(from[0])} ${n2(from[1])}L${n2(s.A[0])} ${n2(s.A[1])}`;
    }
  }
  if (r.piping && !line) {
    const pipe = `<path d="${seams}" stroke="${trimHex}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (seams !== "") add(pipe);
  } else if (seams !== "") add(`<path d="${seams}" stroke="${line ? "currentColor" : seam}" stroke-width="${line ? 5 : 1}" fill="none"${line ? "" : ' stroke-opacity=".7"'}/>`);

  // ---- The neck: the inside, then the band. ----
  add(`<path d="${hole}" ${line ? 'fill="none"' : `fill="${insideC}"`}/>`);
  const bandW = collar === "polo" || collar === "point" ? 5.5 : collar === "zip" ? 6.2 : collar === "band" ? 5 : sh.tank ? 4 : 4.6;
  if (line) add(`<path d="${neckEdge}" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="miter"/>`);
  else {
    add(`<path d="${neckEdge}" fill="none" stroke="${collarC}" stroke-width="${bandW}" stroke-linejoin="miter" stroke-linecap="butt"/>`);
    if (r.trim2Given && collarIdx !== 2 && r.armbands === undefined) add(`<path d="${neckEdge}" fill="none" stroke="${trim2Hex}" stroke-width="1.2" transform="translate(0 ${bandW / 2 + 0.6})" stroke-linejoin="miter" opacity=".9"/>`);
  }
  if (view === "front" && !line) {
    if (collar === "lace-up") {
      let lace = "";
      for (let k = 0; k < 4; k++) {
        const y = ny + 12 + k * 7;
        const hw = Math.max(2, nw * (1 - (y - ny) / fd) - 2.5);
        lace += `M${n2(100 - hw)} ${n2(y)}L${n2(100 + hw)} ${n2(y + 4)}M${n2(100 + hw)} ${n2(y)}L${n2(100 - hw)} ${n2(y + 4)}`;
      }
      add(`<path d="${lace}" stroke="${trimHex}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`);
    } else if (collar === "polo") {
      const leaf = (sd: 1 | -1): string => `M${n2(100 + sd * (nw + 2))} ${n2(ny + 1)}L${n2(100 + sd * (nw + 7))} ${n2(ny + 12)}L${n2(100 + sd * 4)} ${n2(ny + 25)}L${n2(100 + sd * 1.5)} ${n2(ny + 8)}L${n2(100 + sd * (nw - 3))} ${n2(ny + 2)}Z`;
      const leafRgb = collarRgb;
      const leafEdge = hexOf(shade(leafRgb, lum(leafRgb) > 0.3 ? -0.35 : 0.35));
      add(`<path d="${leaf(-1)}${leaf(1)}" fill="${collarC}" stroke="${leafEdge}" stroke-width=".9" stroke-linejoin="round"/>`);
      add(`<path d="M100 ${ny + 14}V${ny + 42}" stroke="${seam}" stroke-width="1" fill="none"/><circle cx="100" cy="${ny + 26}" r="1.7" fill="${hexOf(shade(r.body, 0.5))}"/>`);
    } else if (collar === "point") {
      // A dress collar: long points that lie out over the chest, a placket and three buttons.
      const leaf = (sd: 1 | -1): string => `M${n2(100 + sd * (nw + 2))} ${n2(ny + 1)}L${n2(100 + sd * (nw + 11))} ${n2(ny + 25)}L${n2(100 + sd * 3.5)} ${n2(ny + 15)}L${n2(100 + sd * 1.5)} ${n2(ny + 8)}L${n2(100 + sd * (nw - 3))} ${n2(ny + 2)}Z`;
      const leafRgb = collarRgb;
      const leafEdge = hexOf(shade(leafRgb, lum(leafRgb) > 0.3 ? -0.35 : 0.35));
      add(`<path d="${leaf(-1)}${leaf(1)}" fill="${collarC}" stroke="${leafEdge}" stroke-width=".9" stroke-linejoin="round"/>`);
      let buttons = "";
      for (let k = 0; k < 3; k++) buttons += `<circle cx="100" cy="${n2(ny + 24 + k * 13)}" r="1.5" fill="${hexOf(shade(r.body, lum(r.body) > 0.5 ? -0.45 : 0.55))}"/>`;
      add(`<path d="M100 ${ny + 15}V${ny + 56}" stroke="${seam}" stroke-width="1" fill="none"/>${buttons}`);
    } else if (collar === "zip") {
      // A stand collar over a zipper: the tape, its teeth, the slider and its pull.
      const zipRgb = lum(collarRgb) > 0.3 ? shade(collarRgb, -0.5) : shade(collarRgb, 0.55);
      const teeth = hexOf(zipRgb);
      const y1 = ny + 46;
      let t = "";
      for (let y = ny + 8; y < y1; y += 3.2) t += `M98.4 ${n2(y)}h3.2`;
      add(`<path d="M100 ${ny + 4}V${y1}" stroke="${seam}" stroke-width="3.4" fill="none" stroke-opacity=".55"/><path d="${t}" stroke="${teeth}" stroke-width="1.1" fill="none"/>`);
      add(`<rect x="97.8" y="${ny + 3}" width="4.4" height="6.4" rx="1.2" fill="${teeth}"/><path d="M100 ${ny + 9}v6.5" stroke="${teeth}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`);
    } else if (collar === "band" && r.closure === "button" && r.cut === "baseball") {
      let buttons = "";
      for (let k = 0; k < 6; k++) buttons += `<circle cx="100" cy="${n2(ny + 24 + k * 26)}" r="2.1" fill="${hexOf(shade(r.body, lum(r.body) > 0.5 ? -0.45 : 0.55))}" stroke="${seam}" stroke-width=".5"/>`;
      add(`<path d="M${n2(100 - 4.5)} ${ny + 12}V${spec.hy}M${n2(100 + 4.5)} ${ny + 12}V${spec.hy}" stroke="${seam}" stroke-width=".8" fill="none" stroke-opacity=".8"/>${buttons}`);
    }
  }

  // ---- The edge, self-toned. ----
  // The turning view's garment wraps this drawing round its body, where a line round the outline would be a seam stretched down the side: it leaves it out (`rim` false).
  if (rim) add(useO(`fill="none" stroke="${edge}" stroke-width="${line ? 7 : 1.7}" stroke-linejoin="round"`));

  // ---- Line style: a few strokes for the bands, so that a small one still reads. ----
  if (line) {
    let marks = "";
    if (L !== undefined && R !== undefined) {
      for (const s of [L, R]) {
        const a = outerAt(s, 1 - 10 / s.l);
        const b = innerAt(s, 1 - 10 / s.l);
        if (r.sleeveBands.length > 0 || r.cuffs !== undefined) marks += `M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}`;
        if (r.armbands !== undefined) {
          const c = outerAt(s, r.armbands.at / 100);
          const d = innerAt(s, r.armbands.at / 100);
          marks += `M${n2(c[0])} ${n2(c[1])}L${n2(d[0])} ${n2(d[1])}`;
        }
      }
    }
    if (r.hemBands.length > 0) marks += `M${n2(100 - spec.hu + 3)} ${spec.hy - 14}H${n2(100 + spec.hu - 3)}`;
    if (marks !== "") add(`<path d="${marks}" stroke="currentColor" stroke-width="5" fill="none"/>`);
    if (pat !== "solid" && pat !== "yoke") {
      // The pattern as a few light lines, kept out from under the number.
      let hints = "";
      if (pat === "hoops" || pat === "chest-band") for (const y of [ny + 40, ny + 62, ny + 84]) hints += `M${n2(100 - spec.wu + 6)} ${y}H${n2(100 + spec.wu - 6)}`;
      else if (pat === "stripes" || pat === "pinstripes") for (const dx of [-36, -18, 18, 36]) hints += `M${100 + dx} ${ny + 34}V${spec.hy - 18}`;
      else if (pat === "halves") hints += `M100 ${ny + 28}V${spec.hy - 6}`;
      else if (pat === "sash") hints += `M${100 - 36} ${ny + 18}L${100 + 36} ${spec.hy - 6}`;
      else if (pat === "chevron") hints += `M${100 - 44} ${spec.ay}L100 ${spec.ay + 40}L${100 + 44} ${spec.ay}`;
      else if (pat === "quarters") hints += `M100 ${ny + 28}V${spec.hy - 6}M${100 - 44} ${Math.round((spec.ay + spec.hy) / 2)}H${100 + 44}`;
      const knock = view === "back" ? spec.number.back : spec.number.front;
      add(`<clipPath id="${uid}k"><path clip-rule="evenodd" d="M0 0H200V232H0Z M${n2(knock.x - knock.w / 2 - 4)} ${n2(knock.y - knock.h / 2 - 4)}h${n2(knock.w + 8)}v${n2(knock.h + 8)}h-${n2(knock.w + 8)}Z"/></clipPath><path d="${hints}" stroke="currentColor" stroke-width="3.4" stroke-opacity=".55" fill="none" clip-path="url(#${uid}k)"/>`);
    }
  }

  // ---- Crest, patch, text and numbers. ----
  // A plate behind the back's lettering is its ground; else the cloth, and the pattern's other colour when the pattern runs behind it.
  const plated = r.plate !== undefined && view === "back" && !line && (r.name !== undefined || r.number !== undefined);
  const flagged = r.national?.layout === "flag" && !line ? flagGrounds(r.national.country) : undefined;
  const grounds = (where: "number" | "name" | "chest"): Rgb[] => (flagged !== undefined ? [...flagged] : plated && where !== "chest" ? [r.plate as Rgb] : patternBehind(r, view, where) && !line ? patternGrounds(r) : [r.body]);
  const tint = hexOf(r.body);
  let marks = "";
  const markRun = (text: string, spot: { x: number; y: number; w: number; h: number }, weight: "bold" | "black", where: "number" | "name" | "chest", arch?: number, tracking?: number, slant?: number, maxHeight?: number): string => {
    const run = layout(text, spot.x, spot.y, { height: spot.h, maxWidth: spot.w, weight, arch, tracking, slant, maxHeight });
    if (line) return drawRun(run, "currentColor", undefined, undefined);
    const { fill, outline, heavy } = inkFor(r, grounds(where));
    const width = outline === undefined ? 0 : Math.max(1.1, run.sw * (heavy ? HEAVY : 0.14));
    return drawRun(run, hexOf(fill), outline === undefined ? undefined : { colour: hexOf(outline), width }, cloth && weight === "black" && run.sw > 7 ? hexOf(shade(fill, lum(fill) > 0.4 ? -0.5 : 0.5)) : undefined);
  };
  if (nat !== undefined) for (const l of nat.over) marks += `<g clip-path="url(#${clipFor(l)})">${l.svg}</g>`;
  if (nat?.slant !== undefined) marks += `<g transform="rotate(${n2(nat.slant.deg)} ${n2(nat.slant.x)} ${n2(nat.slant.y)})">${markRun(nat.slant.text, nat.slant, "bold", "chest", undefined, 0.5)}</g>`;
  if (view === "front") {
    const crestSvg = r.crest === undefined ? undefined : crestDocument(r.crest, emblems, tint, trimHex);
    // The left chest: a pocket, and a badge spot on it (empty and plain, or the caller's crest).
    const hasBadge = r.badge !== undefined;
    const px = 100 + Math.round(spec.au * 0.56);
    const py = spec.ay + 6;
    if (r.pocket) {
      const pw = 30;
      const ph = 34;
      const x0 = px - pw / 2;
      const y0 = py - ph / 2;
      const d = `M${n2(x0)} ${n2(y0)}H${n2(x0 + pw)}V${n2(y0 + ph - 7)}Q${n2(x0 + pw)} ${n2(y0 + ph)} ${n2(x0 + pw - 7)} ${n2(y0 + ph)}H${n2(x0 + 7)}Q${n2(x0)} ${n2(y0 + ph)} ${n2(x0)} ${n2(y0 + ph - 7)}Z`;
      if (line) marks += `<path d="${d}" fill="none" stroke="currentColor" stroke-width="3"/>`;
      else {
        marks += `<path d="${d}" fill="${hexOf(shade(r.body, lum(r.body) > 0.4 ? -0.07 : 0.1))}" fill-opacity=".85" stroke="${seam}" stroke-width="1.1" stroke-linejoin="round"/>`;
        if (cloth) marks += `<path d="M${n2(x0 + 2.5)} ${n2(y0 + 3.5)}H${n2(x0 + pw - 2.5)}" stroke="${seam}" stroke-width=".8" stroke-dasharray="2 1.6" fill="none" stroke-opacity=".7"/>`;
      }
    }
    if (hasBadge) {
      const bx = px;
      const by = py - (r.pocket ? 4 : 6);
      const bs = 15;
      if (crestSvg !== undefined) marks += crestImage(crestSvg, bx - bs / 2 - 2, by - bs / 2 - 2, bs + 4, bs + 4);
      else {
        const shape =
          r.badge === "shield"
            ? `M${n2(bx - bs / 2)} ${n2(by - bs / 2)}H${n2(bx + bs / 2)}V${n2(by + 1)}Q${n2(bx + bs / 2)} ${n2(by + bs / 2 + 1)} ${n2(bx)} ${n2(by + bs / 2 + 3)}Q${n2(bx - bs / 2)} ${n2(by + bs / 2 + 1)} ${n2(bx - bs / 2)} ${n2(by + 1)}Z`
            : r.badge === "square"
              ? `M${n2(bx - bs / 2)} ${n2(by - bs / 2)}H${n2(bx + bs / 2)}V${n2(by + bs / 2)}H${n2(bx - bs / 2)}Z`
              : `M${n2(bx - bs / 2)} ${n2(by)}a${bs / 2} ${bs / 2} 0 1 0 ${bs} 0a${bs / 2} ${bs / 2} 0 1 0 -${bs} 0Z`;
        // Plain: a patch a shade off the cloth with a darker edge, so it reads as a blank spot and not as a button.
        const patchRgb = lum(r.body) > 0.5 ? shade(r.body, -0.16) : shade(r.body, 0.28);
        marks += line ? `<path d="${shape}" fill="none" stroke="currentColor" stroke-width="3"/>` : `<path d="${shape}" fill="${hexOf(patchRgb)}" stroke="${hexOf(shade(patchRgb, lum(patchRgb) > 0.4 ? -0.45 : 0.45))}" stroke-width="1" stroke-linejoin="round"/>`;
      }
    }
    if (crestSvg !== undefined && !hasBadge) {
      const c = spec.crest;
      marks += crestImage(crestSvg, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
    }
    if (r.frontText !== undefined) {
      if (r.frontTextAngle === "diagonal-up" || r.frontTextAngle === "diagonal-down") {
        // Stepped on a slant across the chest: upright letters, each a step higher (or lower) than the last, fitted to the width of the chest and the height below the collar.
        const cy = spec.ay + (spec.hy - spec.ay) * 0.36;
        const box = { x: 100, y: cy, w: 2 * (Math.min(spec.wu, spec.au) - (sh.tank ? 16 : 12)), h: 26 };
        marks += markRun(r.frontText, box, "bold", "chest", undefined, 0.5, r.frontTextAngle === "diagonal-up" ? DIAGONAL : -DIAGONAL, (spec.hy - spec.ay) * 0.55);
      } else marks += markRun(r.frontText, spec.text, "bold", "chest", r.frontTextAngle === "arch" ? 140 : undefined, 0.5);
    }
    if (r.frontNumber !== undefined) marks += markRun(r.frontNumber, crestSvg !== undefined && r.cut === "basketball" ? { ...spec.number.front, y: spec.number.front.y + 8, h: spec.number.front.h - 14 } : spec.number.front, "black", "chest");
  } else {
    if (plated) marks += plateOf(r, spec, hexOf(r.plate as Rgb));
    if (r.name !== undefined) marks += markRun(r.name, spec.name, "bold", "name", r.nameArch === "arched" ? 110 : undefined, 0.45);
    if (r.number !== undefined) marks += markRun(r.number, spec.number.back, "black", "number");
  }
  if (r.patch !== "" && view === "front") {
    const p = spec.patch;
    const patchFill = r.trim;
    const letterInk = inkOn([patchFill], [r.body, r.trim2, BLACK, WHITE]);
    if (line) marks += `<circle cx="${p.x}" cy="${p.y}" r="${p.w / 2}" fill="none" stroke="currentColor" stroke-width="4"/>`;
    else {
      marks += `<circle cx="${p.x}" cy="${p.y}" r="${p.w / 2}" fill="${trimHex}" stroke="${hexOf(shade(r.trim, -0.4))}" stroke-width="1"/>`;
      marks += drawRun(layout(r.patch, p.x, p.y, { height: p.w * 0.58, weight: "bold" }), hexOf(letterInk), undefined, undefined);
    }
  }
  if (r.chest !== undefined && view === "front") marks += chestBadgeMarks(r, sh, uid, emblems, r.crest === undefined ? undefined : crestDocument(r.crest, emblems, tint, trimHex));
  if (details && r.sleeveSides !== undefined && L !== undefined && R !== undefined) {
    for (const s of [L, R]) {
      // The picture's left sleeve is the wearer's right in the front view and the wearer's left in the back view.
      const side = r.sleeveSides[(view === "front") === (s.side === -1) ? "right" : "left"];
      if (side === undefined) continue;
      const phi = s.side === -1 ? 90 - s.a : -(90 - s.a);
      for (const d of sleeveDraws(r, side, (t) => Math.hypot(outerAt(s, t)[0] - innerAt(s, t)[0], outerAt(s, t)[1] - innerAt(s, t)[1]))) {
        const m = lerp(outerAt(s, d.at / 100), innerAt(s, d.at / 100), 0.5);
        marks += `<g transform="translate(${n2(m[0])} ${n2(m[1])}) rotate(${n2(phi)})">${d.svg}</g>`;
      }
    }
  }
  add(marks);

  // ---- The defs that need the colours. ----
  if (cloth) {
    // A light shirt takes less shade, or it reads as dirty.
    const k = lum(r.body) > 0.4 ? 0.5 : 1;
    const o = (v: number): string => String(Math.round(v * k * 100) / 100);
    defs += `<linearGradient id="${uid}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${o(0.16)}"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o(0.2)}"/></linearGradient>`;
    defs += `<linearGradient id="${uid}h" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0"><stop offset="0" stop-color="#000" stop-opacity="${o(0.22)}"/><stop offset=".2" stop-color="#000" stop-opacity="${o(0.02)}"/><stop offset=".5" stop-color="#fff" stop-opacity="${o(0.06)}"/><stop offset=".8" stop-color="#000" stop-opacity="${o(0.02)}"/><stop offset="1" stop-color="#000" stop-opacity="${o(0.22)}"/></linearGradient>`;
  }
  return { defs, body: out, outline: sh.outline, outlineId: ido, clipId: idc, edge: edge, width: JERSEY_WIDTH, height: JERSEY_HEIGHT };
}



type Rect = readonly [number, number, number, number];
const hits = (a: Rect, b: Rect): boolean => a[0] < b[2] + 1 && b[0] < a[2] + 1 && a[1] < b[3] + 1 && b[1] < a[3] + 1;

/** Where the chest badges go: each badge, its middle and its size, after the nudging. `clear` is false for one that found no room and stays where it was put. */
export function chestLayout(r: Resolved, sh: Shape, hasCrest: boolean): { b: ChestBadgeR; x: number; y: number; w: number; h: number; clear: boolean }[] {
  const spec = sh.spec;
  const fd = FRONT_DEPTH[r.collar] + (sh.tank && r.collar === "v" ? -4 : 0);
  const taken: Rect[] = [[100 - sh.nw - 6, spec.ny - 10, 100 + sh.nw + 6, spec.ny + fd + 2]];
  // The leaves of a polo or a dress collar lie out over the chest.
  if (r.collar === "polo" || r.collar === "point" || r.collar === "zip") taken.push([100 - sh.nw - 12, spec.ny, 100 + sh.nw + 12, spec.ny + 28]);
  const box = (s: { x: number; y: number; w: number; h: number }): Rect => [s.x - s.w / 2, s.y - s.h / 2, s.x + s.w / 2, s.y + s.h / 2];
  const hasSpot = r.badge !== undefined;
  if (hasCrest && !hasSpot) taken.push(box(spec.crest));
  const px = 100 + Math.round(spec.au * 0.56);
  const py = spec.ay + 6;
  if (r.pocket) taken.push([px - 15, py - 17, px + 15, py + 17]);
  else if (hasSpot) taken.push([px - 10, py - 12, px + 10, py + 10]);
  if (r.frontText !== undefined) {
    if (r.frontTextAngle === "diagonal-up" || r.frontTextAngle === "diagonal-down") {
      const cy = spec.ay + (spec.hy - spec.ay) * 0.36;
      taken.push([100 - (Math.min(spec.wu, spec.au) - 12), cy - 24, 100 + (Math.min(spec.wu, spec.au) - 12), cy + 24]);
    } else taken.push(box(spec.text));
  }
  if (r.frontNumber !== undefined) taken.push(box(spec.number.front));
  if (r.patch !== "") taken.push(box(spec.patch));
  const own = spec.patch.x > 100 ? "left" : "right";
  const u = Math.abs(spec.patch.x - 100);
  const limit = spec.hy - 12;
  const out: { b: ChestBadgeR; x: number; y: number; w: number; h: number; clear: boolean }[] = [];
  for (const b of r.chest ?? []) {
    const side = b.side ?? own;
    const w = b.kind === "flag" ? b.size * 1.5 : b.size;
    const h = b.size;
    // Down from its place on its own side until it is clear, else down the other side; if there is no room at all it stays where it was put.
    const at = (sd: "left" | "right"): number => 100 + (sd === "left" ? 1 : -1) * u + b.dx * (sd === side ? 1 : -1);
    const free = (px2: number, py2: number): boolean => !taken.some((t) => hits([px2 - w / 2, py2 - h / 2, px2 + w / 2, py2 + h / 2], t));
    let x = at(side);
    let y = spec.patch.y + b.dy;
    let clear = free(x, y);
    if (b.nudge && !clear) {
      for (const sd of [side, side === "left" ? "right" : "left"] as const) {
        for (let py2 = spec.patch.y + b.dy + 3; py2 + h / 2 + 3 <= limit && !clear; py2 += 3) {
          if (free(at(sd), py2)) {
            x = at(sd);
            y = py2;
            clear = true;
          }
        }
        if (clear) break;
      }
    }
    taken.push([x - w / 2, y - h / 2, x + w / 2, y + h / 2]);
    out.push({ b, x, y, w, h, clear });
  }
  return out;
}

/**
 * The chest badges of the front: each in the place the cut puts its captain's letter (the wearer's side given, or the cut's own), moved by its offset, and then, unless it says `nudge: false`, slid down until it clears what
 * else is on the chest: the neck opening and the collar, the crest or the badge spot and the pocket, the chest text and number, the old `patch`, and the badges placed before it. Layering, from the cloth outwards: the pattern
 * and bands, the crest, the badges, the lettering. What is drawn is a plain shape, the colours and letters or the flag's stripes of the caller's, or the caller's own art; the package has no flag and no mark.
 */
function chestBadgeMarks(r: Resolved, sh: Shape, uid: string, emblems: EmblemRenderer | undefined, crestSvg: string | undefined): string {
  const line = r.look === "line";
  const trimHex = hexOf(r.trim);
  let out = "";
  chestLayout(r, sh, crestSvg !== undefined).forEach(({ b, x, y, w, h }, i) => {
    const fillRgb = b.fill ?? r.trim;
    const edgeRgb = b.outline ?? shade(fillRgb, lum(fillRgb) > 0.4 ? -0.4 : 0.4);
    const ink = b.ink ?? inkOn([fillRgb], [r.body, r.trim2, BLACK, WHITE]);
    let g = "";
    const art = b.art === undefined ? undefined : crestDocument(b.art, emblems, hexOf(r.body), trimHex);
    if (b.kind === "flag") {
      const clip = `${uid}b${i}`;
      const rect = `M${n2(-w / 2)} ${n2(-h / 2)}H${n2(w / 2)}V${n2(h / 2)}H${n2(-w / 2)}Z`;
      if (line) g = `<path d="${rect}" fill="none" stroke="currentColor" stroke-width="3"/>`;
      else if (art !== undefined) g = crestImage(art, -w / 2, -h / 2, w, h) + `<path d="${rect}" fill="none" stroke="${hexOf(edgeRgb)}" stroke-width=".8"/>`;
      else {
        let body = "";
        const f = b.flag;
        if (f === undefined) body = `<path d="${rect}" fill="${hexOf(fillRgb)}"/>`;
        else {
          const n = f.stripes.length;
          f.stripes.forEach((c, k) => {
            body += f.vertical ? `<path d="M${n2(-w / 2 + (w * k) / n)} ${n2(-h / 2)}h${n2(w / n + 0.2)}v${n2(h)}h${n2(-w / n - 0.2)}Z" fill="${hexOf(c)}"/>` : `<path d="M${n2(-w / 2)} ${n2(-h / 2 + (h * k) / n)}h${n2(w)}v${n2(h / n + 0.2)}h${n2(-w)}Z" fill="${hexOf(c)}"/>`;
          });
          if (f.canton !== undefined) body += `<path d="M${n2(-w / 2)} ${n2(-h / 2)}h${n2(w * 0.4)}v${n2(h * 0.55)}h${n2(-w * 0.4)}Z" fill="${hexOf(f.canton)}"/>`;
          if (f.disc !== undefined) body += `<circle r="${n2(h * 0.28)}" fill="${hexOf(f.disc)}"/>`;
        }
        g = `<clipPath id="${clip}"><path d="${rect}"/></clipPath><g clip-path="url(#${clip})">${body}</g><path d="${rect}" fill="none" stroke="${hexOf(edgeRgb)}" stroke-width=".8"/>`;
      }
    } else {
      const shape = b.kind === "patch" ? b.shape : "round";
      const body = shapePath(shape, b.size);
      if (line) g = `<path d="${body}" fill="none" stroke="currentColor" stroke-width="${b.kind === "patch" ? 3 : 4}"/>`;
      else if (art !== undefined) g = `<path d="${body}" fill="${hexOf(fillRgb)}" stroke="${hexOf(edgeRgb)}" stroke-width="1" stroke-linejoin="round"/>` + crestImage(art, -b.size * 0.4, -b.size * 0.4, b.size * 0.8, b.size * 0.8);
      else {
        g = `<path d="${body}" fill="${hexOf(fillRgb)}" stroke="${hexOf(edgeRgb)}" stroke-width="1" stroke-linejoin="round"/>`;
        const letters = b.kind === "patch" ? b.text : b.kind;
        if (letters !== undefined) g += drawRun(layout(letters, 0, 0, { height: b.size * 0.58, maxWidth: b.size * 0.8, weight: "bold" }), hexOf(ink), undefined, undefined);
      }
    }
    out += `<g transform="translate(${n2(x)} ${n2(y)})">${g}</g>`;
  });
  return out;
}

/** One thing on a sleeve, drawn upright and centred on the origin: `at` is how far down the sleeve it lies in percent, `around` how far round the arm in degrees, `w` and `h` the room it takes. */
export interface SleeveDraw {
  kind: "number" | "patch";
  svg: string;
  w: number;
  h: number;
  at: number;
  around: number;
}

/** A badge's plain shape, centred on the origin, `s` across: a circle, a shield or a square. */
function shapePath(shape: "round" | "shield" | "square", s: number): string {
  const h = s / 2;
  if (shape === "shield") return `M${n2(-h)} ${n2(-h)}H${n2(h)}V${n2(s * 0.05)}Q${n2(h)} ${n2(s * 0.55)} 0 ${n2(s * 0.65)}Q${n2(-h)} ${n2(s * 0.55)} ${n2(-h)} ${n2(s * 0.05)}Z`;
  if (shape === "square") return `M${n2(-h)} ${n2(-h)}H${n2(h)}V${n2(h)}H${n2(-h)}Z`;
  return `M${n2(-h)} 0a${n2(h)} ${n2(h)} 0 1 0 ${n2(s)} 0a${n2(h)} ${n2(h)} 0 1 0 ${n2(-s)} 0Z`;
}

/**
 * The number and the patch one sleeve carries, as drawings of their own. The number is the cut's own height and place unless it is told others, lettered in the ink that reads on the sleeve's cloth; the patch is a plain
 * shape (the licence patch's, never a mark) with up to three letters. `width(t)` is the sleeve's width a fraction `t` of the way down it, which a number must fit.
 */
export function sleeveDraws(r: Resolved, side: SleeveSide, width: (t: number) => number): SleeveDraw[] {
  const out: SleeveDraw[] = [];
  const line = r.look === "line";
  if (side.number !== undefined) {
    const run = layout(side.number, 0, 0, { height: side.size, maxWidth: width(side.at / 100) * 0.8, weight: "black" });
    let svg: string;
    if (line) svg = drawRun(run, "currentColor", undefined, undefined);
    else {
      const grounds: Rgb[] = r.patternSleeves && r.sleeveColor === undefined && patternBehind(r, "front", "number") ? patternGrounds(r) : [r.body];
      const base = inkFor({ ...r, ...(side.fill === undefined ? {} : { fill: side.fill }), ...(side.outline === undefined ? {} : { outline: side.outline }) }, grounds);
      const outline = side.outline ?? base.outline;
      const fill = side.fill ?? base.fill;
      svg = drawRun(run, hexOf(fill), outline === undefined || contrast(outline, fill) < 1.15 ? undefined : { colour: hexOf(outline), width: Math.max(0.9, run.sw * (base.heavy ? HEAVY : 0.14)) }, undefined);
    }
    out.push({ kind: "number", svg, w: run.width + run.sw, h: run.height + run.sw, at: side.at, around: side.around });
  }
  if (side.patch !== undefined) {
    const p = side.patch;
    const s2 = p.size;
    const body = shapePath(p.shape, s2);
    let svg: string;
    if (line) svg = `<path d="${body}" fill="none" stroke="currentColor" stroke-width="3"/>`;
    else {
      const fillRgb = p.fill ?? r.trim;
      const edge = p.outline ?? shade(fillRgb, lum(fillRgb) > 0.4 ? -0.45 : 0.45);
      svg = `<path d="${body}" fill="${hexOf(fillRgb)}" stroke="${hexOf(edge)}" stroke-width="1" stroke-linejoin="round"/>`;
      if (p.text !== undefined) svg += drawRun(layout(p.text, 0, 0, { height: s2 * 0.5, maxWidth: s2 * 0.8, weight: "bold" }), hexOf(inkOn([fillRgb], [r.body, r.trim2, BLACK, WHITE])), undefined, undefined);
    }
    out.push({ kind: "patch", svg, w: s2 + 2, h: s2 + 2, at: p.at, around: p.around });
  }
  return out;
}

/** A string id prefix for a drawing: the same options always give the same one. */
/** What a drawing's ids are hashed from: the options as resolved, the men's fit left out so that its drawings keep the ids they had. */
export const keyOf = (r: Resolved): string => JSON.stringify({ ...r, fit: r.fit === "mens" ? undefined : r.fit });
export const uidOf = (r: Resolved, extra = ""): string => `sj${hashOf(keyOf(r) + extra)}`;

/** The options as a drawing's accessible name, in the language asked for. */
export function jerseyTitle(r: Resolved): string {
  return r.title ?? "Jersey";
}

export { resolve };
export type { JerseyOptions };
