// A jersey, front or back: its silhouette from the cut's measures, what the cut carries (collar, sleeves, stripes, panels), its pattern, the cloth's folds and edge, and the
// number, name and crest. Every drawing is a pure function of its options; every id in it comes from a hash of them, so two drawings on one page never share one by accident.
import { CUTS, type CollarId, type CutSpec } from "./cuts.ts";
import { BLACK, WHITE, blend, contrast, hashOf, hexOf, inkOn, lum, shade, type Rgb } from "./colour.ts";
import { crestDocument, crestImage, type EmblemRenderer } from "./emblems.ts";
import { resolve, type Bands, type JerseyOptions, type Resolved } from "./options.ts";
import { cubic, lerp, n2, poly, quad, rounded, type Pt } from "./path.ts";
import { drawRun, layout } from "./text.ts";

export const JERSEY_WIDTH = 200;
export const JERSEY_HEIGHT = 232;

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

const NECK_W: Record<CollarId, number> = { crew: 21, v: 22, "lace-up": 22, polo: 21, round: 25, wishbone: 24, band: 20 };
const FRONT_DEPTH: Record<CollarId, number> = { crew: 17, v: 36, "lace-up": 40, polo: 14, round: 26, wishbone: 40, band: 10 };
const BACK_DEPTH: Record<CollarId, number> = { crew: 7, v: 9, "lace-up": 7, polo: 6, round: 11, wishbone: 12, band: 5 };
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

function shapeOf(r: Resolved): Shape {
  const spec = CUTS[r.cut];
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
  return { spec, outline, torso: rounded(tpts), sleeves, nw, tank, ay };
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
export function inkFor(r: Resolved, grounds: readonly Rgb[]): { fill: Rgb; outline: Rgb | undefined } {
  const fill = inkOn(grounds, [r.fill, r.trim, r.trim2, WHITE, BLACK]);
  const mixed = grounds.length > 1;
  let outline: Rgb | undefined;
  if (mixed) outline = inkOn([fill], [r.outline, r.trim2, BLACK, WHITE]);
  else if (r.outline !== undefined) outline = r.outline;
  else if (r.trim2Given && contrast(r.trim2, fill) > 1.5 && contrast(r.trim2, grounds[0] as Rgb) > 1.3) outline = r.trim2;
  // A given outline that is the ink itself is no outline.
  if (outline !== undefined && contrast(outline, fill) < 1.15) outline = undefined;
  return { fill, outline };
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
  edge: string;
  width: number;
  height: number;
}

/** One view of the jersey. `uid` makes the ids unique to this drawing. */
export function jerseyView(r: Resolved, view: "front" | "back", uid: string, emblems?: EmblemRenderer): View {
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
          if (s.side === 1) layer += `<path d="${s.poly}" fill="${trimHex}"/>`;
        } else if (pat === "quarters" && s.side === -1) layer += `<path d="${s.poly}" fill="${trimHex}"/>`;
        if (layer !== "") {
          if (key === "L") sleevePattern.L = `<g clip-path="url(#${id})">${layer}</g>`;
          else sleevePattern.R = `<g clip-path="url(#${id})">${layer}</g>`;
        }
      }
    }
    if (torsoPattern !== "") addIn(`<g clip-path="url(#${idt})">${torsoPattern}</g>`);
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
    if (bands !== "") addIn(`<g clip-path="url(#${idc})">${bands}</g>`);
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
  const bandW = collar === "polo" ? 5.5 : collar === "band" ? 5 : sh.tank ? 4 : 4.6;
  if (line) add(`<path d="${neckEdge}" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="miter"/>`);
  else {
    add(`<path d="${neckEdge}" fill="none" stroke="${collarC}" stroke-width="${bandW}" stroke-linejoin="miter" stroke-linecap="butt"/>`);
    if (r.trim2Given && collarIdx !== 2) add(`<path d="${neckEdge}" fill="none" stroke="${trim2Hex}" stroke-width="1.2" transform="translate(0 ${bandW / 2 + 0.6})" stroke-linejoin="miter" opacity=".9"/>`);
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
      const leafEdge = hexOf(shade(collarIdx === 0 ? r.body : collarIdx === 1 ? r.trim : r.trim2, lum(collarIdx === 0 ? r.body : collarIdx === 1 ? r.trim : r.trim2) > 0.3 ? -0.35 : 0.35));
      add(`<path d="${leaf(-1)}${leaf(1)}" fill="${collarC}" stroke="${leafEdge}" stroke-width=".9" stroke-linejoin="round"/>`);
      add(`<path d="M100 ${ny + 14}V${ny + 42}" stroke="${seam}" stroke-width="1" fill="none"/><circle cx="100" cy="${ny + 26}" r="1.7" fill="${hexOf(shade(r.body, 0.5))}"/>`);
    } else if (collar === "band" && r.closure === "button" && r.cut === "baseball") {
      let buttons = "";
      for (let k = 0; k < 6; k++) buttons += `<circle cx="100" cy="${n2(ny + 24 + k * 26)}" r="2.1" fill="${hexOf(shade(r.body, lum(r.body) > 0.5 ? -0.45 : 0.55))}" stroke="${seam}" stroke-width=".5"/>`;
      add(`<path d="M${n2(100 - 4.5)} ${ny + 12}V${spec.hy}M${n2(100 + 4.5)} ${ny + 12}V${spec.hy}" stroke="${seam}" stroke-width=".8" fill="none" stroke-opacity=".8"/>${buttons}`);
    }
  }

  // ---- The edge, self-toned. ----
  add(useO(`fill="none" stroke="${edge}" stroke-width="${line ? 7 : 1.7}" stroke-linejoin="round"`));

  // ---- Line style: a few strokes for the bands, so that a small one still reads. ----
  if (line) {
    let marks = "";
    if (L !== undefined && R !== undefined) {
      for (const s of [L, R]) {
        const a = outerAt(s, 1 - 10 / s.l);
        const b = innerAt(s, 1 - 10 / s.l);
        if (r.sleeveBands.length > 0) marks += `M${n2(a[0])} ${n2(a[1])}L${n2(b[0])} ${n2(b[1])}`;
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
  const sleeveNum = r.number !== undefined && r.sleeveNumbers;
  const grounds = (where: "number" | "name" | "chest"): Rgb[] => (patternBehind(r, view, where) && !line ? [r.body, r.trim] : [r.body]);
  const tint = hexOf(r.body);
  let marks = "";
  const markRun = (text: string, spot: { x: number; y: number; w: number; h: number }, weight: "bold" | "black", where: "number" | "name" | "chest", arch?: number, tracking?: number): string => {
    const run = layout(text, spot.x, spot.y, { height: spot.h, maxWidth: spot.w, weight, arch, tracking });
    if (line) return drawRun(run, "currentColor", undefined, undefined);
    const { fill, outline } = inkFor(r, grounds(where));
    const width = outline === undefined ? 0 : Math.max(1.1, run.sw * 0.14);
    return drawRun(run, hexOf(fill), outline === undefined ? undefined : { colour: hexOf(outline), width }, cloth && weight === "black" && run.sw > 7 ? hexOf(shade(fill, lum(fill) > 0.4 ? -0.5 : 0.5)) : undefined);
  };
  if (view === "front") {
    const crestSvg = r.crest === undefined ? undefined : crestDocument(r.crest, emblems, tint, trimHex);
    if (crestSvg !== undefined) {
      const c = spec.crest;
      marks += crestImage(crestSvg, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
    }
    if (r.frontText !== undefined) marks += markRun(r.frontText, spec.text, "bold", "chest", r.cut === "basketball" ? 140 : undefined, 0.5);
    if (r.frontNumber !== undefined) marks += markRun(r.frontNumber, crestSvg !== undefined && r.cut === "basketball" ? { ...spec.number.front, y: spec.number.front.y + 8, h: spec.number.front.h - 14 } : spec.number.front, "black", "chest");
  } else {
    if (r.name !== undefined) marks += markRun(r.name, spec.name, "bold", "name", r.nameArch === "arched" ? 110 : undefined, 0.45);
    if (r.number !== undefined) marks += markRun(r.number, spec.number.back, "black", "number");
  }
  if (r.patch !== "") {
    const p = spec.patch;
    const patchFill = r.trim;
    const letterInk = inkOn([patchFill], [r.body, r.trim2, BLACK, WHITE]);
    if (line) marks += `<circle cx="${p.x}" cy="${p.y}" r="${p.w / 2}" fill="none" stroke="currentColor" stroke-width="4"/>`;
    else {
      marks += `<circle cx="${p.x}" cy="${p.y}" r="${p.w / 2}" fill="${trimHex}" stroke="${hexOf(shade(r.trim, -0.4))}" stroke-width="1"/>`;
      marks += drawRun(layout(r.patch, p.x, p.y, { height: p.w * 0.58, weight: "bold" }), hexOf(letterInk), undefined, undefined);
    }
  }
  if (sleeveNum && L !== undefined && R !== undefined && r.number !== undefined) {
    for (const s of [L, R]) {
      const a = outerAt(s, spec.tv.t);
      const b = innerAt(s, spec.tv.t);
      const m = lerp(a, b, 0.5);
      const phi = s.side === -1 ? 90 - s.a : -(90 - s.a);
      const run = layout(r.number, 0, 0, { height: spec.tv.h, maxWidth: Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.8, weight: "black" });
      const g = line ? drawRun(run, "currentColor", undefined, undefined) : (() => {
        const { fill, outline } = inkFor(r, [r.body]);
        return drawRun(run, hexOf(fill), outline === undefined ? undefined : { colour: hexOf(outline), width: Math.max(0.9, run.sw * 0.14) }, undefined);
      })();
      marks += `<g transform="translate(${n2(m[0])} ${n2(m[1])}) rotate(${n2(phi)})">${g}</g>`;
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
  return { defs, body: out, outline: sh.outline, outlineId: ido, edge: edge, width: JERSEY_WIDTH, height: JERSEY_HEIGHT };
}

/** A string id prefix for a drawing: the same options always give the same one. */
export const uidOf = (r: Resolved, extra = ""): string => `sj${hashOf(JSON.stringify(r) + extra)}`;

/** The options as a drawing's accessible name, in the language asked for. */
export function jerseyTitle(r: Resolved): string {
  return r.title ?? "Jersey";
}

export { resolve };
export type { JerseyOptions };
