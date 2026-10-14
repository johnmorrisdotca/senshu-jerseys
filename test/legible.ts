// Measures how clearly a number or a name on a finished drawing reads, from the drawing itself: the drawing's flat fills and plain strokes are painted onto a grid (painter's order, shading and
// anything see-through left out), the letters' own centre line gives the glyph's edge, and the least contrast between the ink and anything painted within `reach` of that edge is the answer.
// A black number on a black-and-white stripe with a hair of white round it has a black stripe touching its edge, and so a contrast of 1 there.
import { pathPoints } from "./svgbox.ts";
import { layout, type RunOptions } from "../src/text.ts";
import { contrast, readColour, type Rgb } from "../src/colour.ts";

type P = readonly [number, number];
const RES = 0.4;

interface Tag {
  tag: string;
  attrs: Record<string, string>;
}

function tags(svg: string): Tag[] {
  const out: Tag[] = [];
  for (const m of svg.matchAll(/<(path|use|rect|circle)\b((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g)) {
    const attrs: Record<string, string> = {};
    for (const a of (m[2] as string).matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1] as string] = a[2] as string;
    out.push({ tag: m[1] as string, attrs });
  }
  return out;
}

const inside = (pts: readonly P[], x: number, y: number): boolean => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i] as P;
    const [xj, yj] = pts[j] as P;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

export interface Reading {
  /** The ink of the letters, and the least contrast against it of anything within `reach` of a letter's edge (21 when nothing is painted there). */
  ink: Rgb;
  worst: number;
  /** The width of a stroke, in drawing units. */
  stroke: number;
}

/**
 * Paint `svg` around the run `text` laid out by `o` at `(x, y)`, and read the ring `reach` stroke widths wide outside the letters. A drawing with a letters' outline wider than the ring, or a plate
 * under them, reads clearly; one where a stripe of the ink's own colour comes up to the letter's edge does not.
 */
export function readRun(svg: string, text: string, x: number, y: number, o: RunOptions, reach = 0.3): Reading {
  const run = layout(text, x, y, o);
  const half = run.sw / 2;
  const ring = run.sw * reach;
  // The centre lines as segments.
  const segs: [P, P][] = [];
  for (const sub of run.d.split(/(?=M)/)) {
    const pts = pathPoints(sub);
    for (let i = 1; i < pts.length; i++) segs.push([pts[i - 1] as P, pts[i] as P]);
  }
  const x0 = Math.min(...segs.flatMap((s) => [s[0][0], s[1][0]])) - half - ring - 1;
  const x1 = Math.max(...segs.flatMap((s) => [s[0][0], s[1][0]])) + half + ring + 1;
  const y0 = Math.min(...segs.flatMap((s) => [s[0][1], s[1][1]])) - half - ring - 1;
  const y1 = Math.max(...segs.flatMap((s) => [s[0][1], s[1][1]])) + half + ring + 1;
  const W = Math.ceil((x1 - x0) / RES);
  const H = Math.ceil((y1 - y0) / RES);
  const dist = new Float32Array(W * H).fill(1e9);
  const reachPx = (half + ring) / RES + 1;
  for (const [a, b] of segs) {
    const [ax, ay, bx, by] = [a[0], a[1], b[0], b[1]];
    const px0 = Math.max(0, Math.floor((Math.min(ax, bx) - x0) / RES - reachPx));
    const px1 = Math.min(W - 1, Math.ceil((Math.max(ax, bx) - x0) / RES + reachPx));
    const py0 = Math.max(0, Math.floor((Math.min(ay, by) - y0) / RES - reachPx));
    const py1 = Math.min(H - 1, Math.ceil((Math.max(ay, by) - y0) / RES + reachPx));
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    for (let j = py0; j <= py1; j++) {
      for (let i = px0; i <= px1; i++) {
        const X = x0 + (i + 0.5) * RES;
        const Y = y0 + (j + 0.5) * RES;
        const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / len2));
        const d = Math.hypot(X - (ax + t * dx), Y - (ay + t * dy));
        if (d < (dist[j * W + i] as number)) dist[j * W + i] = d;
      }
    }
  }
  // The drawing, painted in order onto the grid: what colour is each pixel (or nothing).
  const paint: (Rgb | undefined)[] = new Array(W * H).fill(undefined);
  const ok = (a: Record<string, string>): boolean => a["fill-opacity"] === undefined && a["stroke-opacity"] === undefined && a.opacity === undefined && a["stroke-dasharray"] === undefined;
  for (const { tag, attrs } of tags(svg)) {
    if (!ok(attrs)) continue;
    const fill = readColour(attrs.fill);
    const stroke = readColour(attrs.stroke);
    if (tag === "use" && fill !== undefined) {
      paint.fill(fill);
    } else if (tag === "path" && attrs.d !== undefined) {
      const pts = pathPoints(attrs.d);
      if (pts.length < 2) continue;
      const bx0 = Math.min(...pts.map((p) => p[0]));
      const bx1 = Math.max(...pts.map((p) => p[0]));
      const by0 = Math.min(...pts.map((p) => p[1]));
      const by1 = Math.max(...pts.map((p) => p[1]));
      const sw = stroke !== undefined ? Number(attrs["stroke-width"] ?? 1) : 0;
      if (bx1 + sw < x0 || bx0 - sw > x1 || by1 + sw < y0 || by0 - sw > y1) continue;
      if (fill !== undefined) {
        for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (inside(pts, x0 + (i + 0.5) * RES, y0 + (j + 0.5) * RES)) paint[j * W + i] = fill;
      }
      if (stroke !== undefined && attrs.fill === "none" && sw > 0) {
        for (const sub of attrs.d.split(/(?=M)/)) {
          const sp = pathPoints(sub);
          for (let k = 1; k < sp.length; k++) {
            const [a, b] = [sp[k - 1] as P, sp[k] as P];
            const dx = b[0] - a[0];
            const dy = b[1] - a[1];
            const len2 = dx * dx + dy * dy;
            const r = sw / 2;
            const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - r - x0) / RES));
            const i1 = Math.min(W - 1, Math.ceil((Math.max(a[0], b[0]) + r - x0) / RES));
            const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - r - y0) / RES));
            const j1 = Math.min(H - 1, Math.ceil((Math.max(a[1], b[1]) + r - y0) / RES));
            for (let j = j0; j <= j1; j++) {
              for (let i = i0; i <= i1; i++) {
                const X = x0 + (i + 0.5) * RES;
                const Y = y0 + (j + 0.5) * RES;
                const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((X - a[0]) * dx + (Y - a[1]) * dy) / len2));
                if (Math.hypot(X - (a[0] + t * dx), Y - (a[1] + t * dy)) <= r) paint[j * W + i] = stroke;
              }
            }
          }
        }
      }
    }
  }
  // The ink: what is painted on the centre line.
  const first = segs[0] as [P, P];
  const ci = Math.floor((first[0][0] - x0) / RES);
  const cj = Math.floor((first[0][1] - y0) / RES);
  const ink = paint[cj * W + ci] ?? ([0, 0, 0] as Rgb);
  let worst = 21;
  for (let k = 0; k < W * H; k++) {
    const d = dist[k] as number;
    const c = paint[k];
    if (d > half + 0.1 && d <= half + ring && c !== undefined) { const cc = contrast(ink, c); if (cc < worst) { worst = cc; if (process.env.DBG) console.log("at", x0 + (k % W) * RES, y0 + Math.floor(k / W) * RES, d, c); } }
  }
  return { ink, worst, stroke: run.sw };
}
