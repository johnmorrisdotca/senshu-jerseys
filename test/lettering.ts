// Measures the lettering of a finished cap or helmet against its outline, from the drawing itself: every drawn letter stroke is a run of discs (a point of the centre line, grown by half the widest
// stroke or outline, through every transform above it), a system-text character is its em box, and the outline is the shape the drawing clips its colour to (the crown, the shell). The answer is the
// least room between any letter and that outline: negative when a letter crosses it.
import { IDENTITY, mul, parse, pathPoints, transformOf, type Matrix, type Node } from "./svgbox.ts";

type P = readonly [number, number];

const apply = (m: Matrix, p: P): P => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const scaleOf = (m: Matrix): number => Math.max(Math.hypot(m[0], m[1]), Math.hypot(m[2], m[3]));

function insidePolygon(pts: readonly P[], [x, y]: P): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i] as P;
    const [xj, yj] = pts[j] as P;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function edgeDistance(pts: readonly P[], [x, y]: P): number {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1] as P;
    const [bx, by] = pts[i] as P;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}

/** The room a point's disc of radius `r` has inside the polygon: how far its edge is from the outline (negative: it crosses it or lies outside). */
const room = (outline: readonly P[], p: P, r: number): number => (insidePolygon(outline, p) ? 1 : -1) * edgeDistance(outline, p) - r;

/** The discs and boxes of the lettering of a drawing, as the points to test with the radius each carries. */
export function letterDiscs(svg: string): { at: P; r: number }[] {
  const out: { at: P; r: number }[] = [];
  const walk = (n: Node, m: Matrix, inDefs: boolean): void => {
    const here = mul(m, transformOf(n.attrs["transform"]));
    if (n.tag === "defs" || n.tag === "clipPath") return;
    if (n.tag === "path" && n.attrs["stroke-linecap"] === "butt" && n.attrs["fill"] === "none" && !inDefs) {
      // A glyph stroke (the only butt-capped strokes there are); the widest of its strokes, the outline, is what to keep clear.
      const r = (Number(n.attrs["stroke-width"] ?? 0) / 2) * scaleOf(here);
      const pts = pathPoints(n.attrs["d"] ?? "");
      for (const sub of (n.attrs["d"] ?? "").split(/(?=M)/)) {
        const q = pathPoints(sub);
        // The sampled curve, and the points between: a long straight stroke is tested along its length too.
        for (let i = 0; i < q.length; i++) {
          out.push({ at: apply(here, q[i] as P), r });
          const nx = q[i + 1];
          if (nx !== undefined) for (let k = 1; k < 8; k++) out.push({ at: apply(here, [(q[i] as P)[0] + ((nx[0] - (q[i] as P)[0]) * k) / 8, (q[i] as P)[1] + ((nx[1] - (q[i] as P)[1]) * k) / 8]), r });
        }
      }
      void pts;
    } else if (n.tag === "text") {
      // A system-text character: the em box (half an em each way across; from 0.88 em above the baseline to 0.12 below), plus its halo.
      const size = Number(n.attrs["font-size"] ?? 0);
      const halo = Number(n.attrs["stroke-width"] ?? 0) / 2;
      const own = transformOf(n.attrs["transform"]);
      const whole = mul(m, own);
      for (const [x, y] of [[-0.5, -0.88], [0.5, -0.88], [-0.5, 0.12], [0.5, 0.12], [0, -0.88], [0, 0.12], [-0.5, -0.38], [0.5, -0.38]] as const) out.push({ at: apply(whole, [x * size, y * size]), r: halo * scaleOf(whole) });
    }
    for (const c of n.children) walk(c, here, inDefs);
  };
  const root = parse(svg);
  walk(root.children[0] as Node, IDENTITY, false);
  return out;
}

/** The outline of a drawing's colour: the first clip path of its defs whose id ends in `suffix` (`d` the cap's crown, `s` the helmet's shell), as a polygon; `mirror` flips it as a helmet facing left is. */
export function outlineOf(svg: string, suffix: string, mirror = false): P[] {
  const m = new RegExp(`<clipPath id="[^"]*${suffix}"><path d="([^"]+)"`).exec(svg);
  if (m === null) throw new Error(`no clip path ending ${suffix}`);
  const pts = pathPoints(m[1] as string);
  return mirror ? pts.map(([x, y]) => [200 - x, y] as P) : pts;
}

/** The least room any letter has inside the outline, in drawing units; `Infinity` when nothing is lettered. */
export function leastRoom(svg: string, outline: readonly P[]): number {
  let least = Infinity;
  for (const { at, r } of letterDiscs(svg)) least = Math.min(least, room(outline, at, r));
  return least;
}

/**
 * The seam of a two-tone side view's front panel, as the left side of a polygon that runs on to the right (the crown's own edge is `outlineOf`'s): the panel is drawn as its top, its edge down to the
 * foot, a straight run left along the foot (`H`) and the seam back up to the top, so the seam is what follows that run.
 */
export function seamOf(svg: string): P[] {
  const m = /<g clip-path="url\(#[^")]*d\)"><path d="([^"]+H[^"]+)" fill="#/.exec(svg);
  if (m === null) throw new Error("no front panel");
  const pts = pathPoints(m[1] as string);
  const at = pts.findIndex((p, i) => i > 0 && p[1] === (pts[i - 1] as P)[1]);
  const seam = pts.slice(at);
  return [...seam, [400, (seam[seam.length - 1] as P)[1]], [400, (seam[0] as P)[1]]];
}
