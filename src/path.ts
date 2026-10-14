// Small path helpers: numbers written short, a path moved, scaled and turned, and a polygon with rounded corners.

/** A number written to two decimals, with no trailing zeros and no `-0`. */
export function n2(x: number): string {
  if (!Number.isFinite(x)) return "0";
  const s = (Math.round(x * 100) / 100).toString();
  return s === "-0" ? "0" : s;
}

export type Pt = readonly [number, number];

/** A path of absolute commands (`M L C Q A Z`) with each point moved by `f`; arcs keep their radii scaled by `scale` (a turn or a uniform scale only). */
export function mapPath(d: string, f: (x: number, y: number) => Pt, scale = 1, flip = false): string {
  const tokens = d.match(/[MLCQAZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let out = "";
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++] as string;
    out += cmd;
    if (cmd === "Z") continue;
    const count = cmd === "M" || cmd === "L" ? 1 : cmd === "Q" ? 2 : cmd === "C" ? 3 : 1;
    for (let k = 0; k < count; k++) {
      if (cmd === "A") {
        const [rx, ry, rot, large, sweep] = [Number(tokens[i]), Number(tokens[i + 1]), Number(tokens[i + 2]), tokens[i + 3], tokens[i + 4]];
        const p = f(Number(tokens[i + 5]), Number(tokens[i + 6]));
        out += `${n2(rx * scale)} ${n2(ry * scale)} ${n2(rot)} ${large} ${flip ? (sweep === "1" ? "0" : "1") : sweep} ${n2(p[0])} ${n2(p[1])}`;
        i += 7;
      } else {
        const p = f(Number(tokens[i]), Number(tokens[i + 1]));
        out += `${n2(p[0])} ${n2(p[1])}${k < count - 1 ? " " : ""}`;
        i += 2;
      }
    }
  }
  return out;
}

/** The point `(x, y)` scaled by `k`, turned by `deg` degrees (clockwise on the screen) and moved by `(dx, dy)`. */
export function placed(k: number, deg: number, dx: number, dy: number): (x: number, y: number) => Pt {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return (x, y) => [dx + k * (x * c - y * s), dy + k * (x * s + y * c)];
}

/** A closed polygon through `points` (`[x, y, r]`, `r` the radius its corner is rounded by, 0 for a sharp one), as a path. */
export function rounded(points: readonly (readonly [number, number, number?])[], closed = true): string {
  const n = points.length;
  let d = "";
  const at = (i: number): readonly [number, number, number?] => points[((i % n) + n) % n] as readonly [number, number, number?];
  for (let i = 0; i < n; i++) {
    const [x, y, r = 0] = at(i);
    if (!closed && (i === 0 || i === n - 1)) {
      d += `${i === 0 ? "M" : "L"}${n2(x)} ${n2(y)}`;
      continue;
    }
    const [px, py] = at(i - 1);
    const [nx, ny] = at(i + 1);
    const l1 = Math.hypot(px - x, py - y);
    const l2 = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (rr <= 0.01) {
      d += `${i === 0 ? "M" : "L"}${n2(x)} ${n2(y)}`;
    } else {
      const ax = x + ((px - x) / l1) * rr;
      const ay = y + ((py - y) / l1) * rr;
      const bx = x + ((nx - x) / l2) * rr;
      const by = y + ((ny - y) / l2) * rr;
      d += `${i === 0 ? "M" : "L"}${n2(ax)} ${n2(ay)}Q${n2(x)} ${n2(y)} ${n2(bx)} ${n2(by)}`;
    }
  }
  return closed ? `${d}Z` : d;
}

/** Points along a quadratic curve, `from` and `to` left out (they are the caller's own), `steps` of them. */
export function quad(a: Pt, c: Pt, b: Pt, steps = 8): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** Points along a cubic curve, ends left out. */
export function cubic(a: Pt, c1: Pt, c2: Pt, b: Pt, steps = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]);
  }
  return out;
}

/** The point `t` of the way from `a` to `b`. */
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** A polygon (no rounding) as a path. */
export const poly = (pts: readonly Pt[]): string => `M${pts.map((p) => `${n2(p[0])} ${n2(p[1])}`).join("L")}Z`;
