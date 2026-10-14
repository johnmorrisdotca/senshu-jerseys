// Measures where a finished drawing puts ink, from the drawing itself (never from the constants it was made from): every path, circle, ellipse, rect and line is flattened, run through the transforms
// that sit above it, grown by half its stroke, cut by the clip path of a group and widened by the offsets of a filter that only shifts a copy (the rim of a flipped sheet). The result is the box of the
// ink in the drawing's own user units, to set against its `viewBox`. Text is left out (an engraving or a letter is cut into the face it sits on), and so are the grain and shading filters, which only
// change what is inside the outline they are clipped to.

/** A box as its corners. */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

type Matrix = readonly [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const RAD = Math.PI / 180;

interface Node {
  tag: string;
  attrs: Record<string, string>;
  children: Node[];
}

/** The document as a tree of tags with their attributes; the text between tags is dropped. */
function parse(svg: string): Node {
  const root: Node = { tag: "#root", attrs: {}, children: [] };
  const stack: Node[] = [root];
  const tag = /<(\/?)([A-Za-z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  for (let m = tag.exec(svg); m !== null; m = tag.exec(svg)) {
    const top = stack[stack.length - 1] as Node;
    if (m[1] === "/") {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const attrs: Record<string, string> = {};
    for (const a of (m[3] as string).matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1] as string] = a[2] as string;
    const node: Node = { tag: m[2] as string, attrs, children: [] };
    top.children.push(node);
    if (m[4] !== "/") stack.push(node);
  }
  return root;
}

const num = (text: string | undefined, fallback = 0): number => {
  const v = text === undefined ? NaN : parseFloat(text);
  return Number.isFinite(v) ? v : fallback;
};

const mul = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1],
  a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4],
  a[1] * b[4] + a[3] * b[5] + a[5],
];

/** A `transform` attribute as one matrix. */
function transformOf(text: string | undefined): Matrix {
  let m = IDENTITY;
  if (text === undefined) return m;
  for (const t of text.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = (t[2] as string).split(/[\s,]+/).filter((s) => s !== "").map(Number);
    const a = v[0] ?? 0;
    let n: Matrix = IDENTITY;
    switch (t[1]) {
      case "translate": n = [1, 0, 0, 1, a, v[1] ?? 0]; break;
      case "scale": n = [a, 0, 0, v[1] ?? a, 0, 0]; break;
      case "rotate": {
        const c = Math.cos(a * RAD), s = Math.sin(a * RAD), cx = v[1] ?? 0, cy = v[2] ?? 0;
        n = [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
        break;
      }
      case "matrix": n = [v[0] ?? 1, v[1] ?? 0, v[2] ?? 0, v[3] ?? 1, v[4] ?? 0, v[5] ?? 0]; break;
      case "skewX": n = [1, 0, Math.tan(a * RAD), 1, 0, 0]; break;
      case "skewY": n = [1, Math.tan(a * RAD), 0, 1, 0, 0]; break;
    }
    m = mul(m, n);
  }
  return m;
}

type P = readonly [number, number];

/** The points of an elliptical arc between two points, as the SVG rules choose its centre. */
function arcPoints(x0: number, y0: number, rxIn: number, ryIn: number, deg: number, large: boolean, sweep: boolean, x1: number, y1: number): P[] {
  if (x0 === x1 && y0 === y1) return [];
  let rx = Math.abs(rxIn), ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) return [[x1, y1]];
  const phi = deg * RAD, cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x0 - x1) / 2, dy = (y0 - y1) / 2;
  const xp = cp * dx + sp * dy, yp = -sp * dx + cp * dy;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num2 = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num2 / den));
  const cxp = (k * rx * yp) / ry, cyp = (-k * ry * xp) / rx;
  const cx = cp * cxp - sp * cyp + (x0 + x1) / 2, cy = sp * cxp + cp * cyp + (y0 + y1) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number): number => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t0 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!sweep && dt > 0) dt -= 2 * Math.PI;
  if (sweep && dt < 0) dt += 2 * Math.PI;
  const steps = Math.max(8, Math.ceil(Math.abs(dt) / (Math.PI / 24)));
  const out: P[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = t0 + (dt * i) / steps;
    out.push([cx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, cy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp]);
  }
  out[out.length - 1] = [x1, y1];
  return out;
}

/** The points a path passes through, curves sampled finely enough that the box of the points is the box of the curve to a hundredth of a unit. */
export function pathPoints(d: string): P[] {
  const out: P[] = [];
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  let i = 0;
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let cmd = "";
  let lastC: P | undefined;
  let lastQ: P | undefined;
  const next = (): number => Number(tokens[i++]);
  const more = (): boolean => i < tokens.length && !/^[A-Za-z]$/.test(tokens[i] as string);
  const push = (x: number, y: number): void => {
    out.push([x, y]);
    cx = x;
    cy = y;
  };
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i] as string)) cmd = tokens[i++] as string;
    else if (cmd === "M") cmd = "L";
    else if (cmd === "m") cmd = "l";
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    const c = cmd.toUpperCase();
    let prevC: P | undefined;
    let prevQ: P | undefined;
    if (c === "Z") {
      push(sx, sy);
    } else if (c === "M") {
      const x = next() + ox, y = next() + oy;
      push(x, y);
      sx = x;
      sy = y;
    } else if (c === "L") push(next() + ox, next() + oy);
    else if (c === "H") push(next() + ox, cy);
    else if (c === "V") push(cx, next() + oy);
    else if (c === "C" || c === "S") {
      const x0 = cx, y0 = cy;
      let x1: number, y1: number;
      if (c === "C") {
        x1 = next() + ox;
        y1 = next() + oy;
      } else {
        x1 = lastC === undefined ? cx : 2 * cx - lastC[0];
        y1 = lastC === undefined ? cy : 2 * cy - lastC[1];
      }
      const x2 = next() + ox, y2 = next() + oy, x3 = next() + ox, y3 = next() + oy;
      for (let k = 1; k <= 24; k++) {
        const t = k / 24, u = 1 - t;
        out.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
      }
      cx = x3;
      cy = y3;
      prevC = [x2, y2];
    } else if (c === "Q" || c === "T") {
      const x0 = cx, y0 = cy;
      let x1: number, y1: number;
      if (c === "Q") {
        x1 = next() + ox;
        y1 = next() + oy;
      } else {
        x1 = lastQ === undefined ? cx : 2 * cx - lastQ[0];
        y1 = lastQ === undefined ? cy : 2 * cy - lastQ[1];
      }
      const x2 = next() + ox, y2 = next() + oy;
      for (let k = 1; k <= 24; k++) {
        const t = k / 24, u = 1 - t;
        out.push([u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2]);
      }
      cx = x2;
      cy = y2;
      prevQ = [x1, y1];
    } else if (c === "A") {
      const rx = next(), ry = next(), rot = next(), large = next() !== 0, sweep = next() !== 0, x = next() + ox, y = next() + oy;
      const pts = arcPoints(cx, cy, rx, ry, rot, large, sweep, x, y);
      out.push(...(pts.length === 0 ? [[x, y] as P] : pts));
      cx = x;
      cy = y;
    } else {
      i++;
    }
    lastC = prevC;
    lastQ = prevQ;
    if (c !== "Z" && !more() && i >= tokens.length) break;
  }
  return out;
}

const ellipsePoints = (cx: number, cy: number, rx: number, ry: number): P[] => Array.from({ length: 72 }, (_, k) => [cx + rx * Math.cos((k * 2 * Math.PI) / 72), cy + ry * Math.sin((k * 2 * Math.PI) / 72)] as P);

interface Inherited {
  stroke: string;
  strokeWidth: number;
  fill: string;
}

const empty = (): Box => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
const isEmpty = (b: Box): boolean => b.x0 > b.x1 || b.y0 > b.y1;
const grow = (b: Box, x: number, y: number): void => {
  if (x < b.x0) b.x0 = x;
  if (x > b.x1) b.x1 = x;
  if (y < b.y0) b.y0 = y;
  if (y > b.y1) b.y1 = y;
};
const merge = (a: Box, b: Box): void => {
  if (isEmpty(b)) return;
  grow(a, b.x0, b.y0);
  grow(a, b.x1, b.y1);
};
const cut = (a: Box, b: Box): Box => ({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });

/** The ink of a drawing: the box of everything painted, in the user units of the outer `<svg>`. `undefined` when nothing is painted. */
export function inkBox(svg: string): Box | undefined {
  const root = parse(svg);
  const byId = new Map<string, Node>();
  const index = (n: Node): void => {
    if (n.attrs["id"] !== undefined) byId.set(n.attrs["id"], n);
    n.children.forEach(index);
  };
  index(root);
  const outer = root.children[0] as Node;

  const ref = (value: string | undefined): Node | undefined => {
    const id = /#([^)"\s]+)/.exec(value ?? "")?.[1];
    return id === undefined ? undefined : byId.get(id);
  };

  /** The box of a node's own shape in its own coordinates, plus the points. */
  const shapePoints = (n: Node): P[] | undefined => {
    const a = n.attrs;
    switch (n.tag) {
      case "path": return pathPoints(a["d"] ?? "");
      case "circle": return ellipsePoints(num(a["cx"]), num(a["cy"]), num(a["r"]), num(a["r"]));
      case "ellipse": return ellipsePoints(num(a["cx"]), num(a["cy"]), num(a["rx"]), num(a["ry"]));
      case "rect": return [[num(a["x"]), num(a["y"])], [num(a["x"]) + num(a["width"]), num(a["y"])], [num(a["x"]) + num(a["width"]), num(a["y"]) + num(a["height"])], [num(a["x"]), num(a["y"]) + num(a["height"])]];
      case "line": return [[num(a["x1"]), num(a["y1"])], [num(a["x2"]), num(a["y2"])]];
      case "polygon":
      case "polyline": {
        const v = (a["points"] ?? "").split(/[\s,]+/).filter((s) => s !== "").map(Number);
        const pts: P[] = [];
        for (let k = 0; k + 1 < v.length; k += 2) pts.push([v[k] as number, v[k + 1] as number]);
        return pts;
      }
      default: return undefined;
    }
  };

  const walk = (n: Node, m: Matrix, inh: Inherited): Box => {
    const out = empty();
    const a = n.attrs;
    if (["defs", "title", "desc", "style", "clipPath", "filter", "symbol", "mask", "pattern", "linearGradient", "radialGradient", "text"].includes(n.tag)) return out;
    if (a["display"] === "none" || a["visibility"] === "hidden" || num(a["opacity"], 1) === 0) return out;
    const here: Inherited = { stroke: a["stroke"] ?? inh.stroke, strokeWidth: a["stroke-width"] === undefined ? inh.strokeWidth : num(a["stroke-width"], 1), fill: a["fill"] ?? inh.fill };
    const mm = a["transform"] === undefined ? m : mul(m, transformOf(a["transform"]));
    const own = shapePoints(n);
    if (own !== undefined && own.length > 0) {
      const stroked = here.stroke !== "none" && here.strokeWidth > 0;
      const filled = here.fill !== "none";
      if (stroked || filled) {
        const hw = stroked ? here.strokeWidth / 2 : 0;
        // The stroke's brush is a disc; under the transform it is an ellipse whose half extents are the half width times the lengths of the matrix's rows.
        const ex = hw * Math.hypot(mm[0], mm[2]);
        const ey = hw * Math.hypot(mm[1], mm[3]);
        for (const [x, y] of own) {
          const tx = mm[0] * x + mm[2] * y + mm[4];
          const ty = mm[1] * x + mm[3] * y + mm[5];
          grow(out, tx - ex, ty - ey);
          grow(out, tx + ex, ty + ey);
        }
      }
    } else if (n.tag === "use") {
      const target = ref(a["href"] ?? a["xlink:href"]);
      if (target !== undefined) {
        const sub = walk({ ...target, attrs: { ...target.attrs, id: "" } }, mul(mm, [1, 0, 0, 1, num(a["x"]), num(a["y"])]), here);
        merge(out, sub);
      }
    }
    for (const child of n.children) merge(out, walk(child, mm, here));
    if (isEmpty(out)) return out;

    // A clip path cuts the group to the outline it names (the clip is in the group's own user space, so the group's transform applies to it).
    const clip = ref(a["clip-path"]);
    let result = out;
    if (clip !== undefined && clip.tag === "clipPath") {
      const c = empty();
      for (const child of clip.children) merge(c, walk(child, mm, { stroke: "none", strokeWidth: 0, fill: "#000" }));
      result = cut(out, c);
      if (isEmpty(result)) return empty();
    }
    // A filter that only shifts a copy of the shape (the rim of a turned sheet) adds the shifted copies, in the user space of the element that carries the filter.
    const filter = ref(a["filter"]);
    if (filter !== undefined && filter.tag === "filter") {
      const widened = { ...result };
      for (const f of filter.children) {
        if (f.tag !== "feOffset") continue;
        const dx = num(f.attrs["dx"]), dy = num(f.attrs["dy"]);
        const sx = mm[0] * dx + mm[2] * dy, sy = mm[1] * dx + mm[3] * dy;
        grow(widened, result.x0 + sx, result.y0 + sy);
        grow(widened, result.x1 + sx, result.y1 + sy);
      }
      result = widened;
      const fa = filter.attrs;
      if (fa["filterUnits"] === "userSpaceOnUse" && fa["x"] !== undefined) {
        const x = num(fa["x"]), y = num(fa["y"]), w = num(fa["width"]), h = num(fa["height"]);
        const r = empty();
        for (const [px, py] of [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as const) grow(r, m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]);
        result = cut(result, r);
        if (isEmpty(result)) return empty();
      }
    }
    return result;
  };

  const box = empty();
  for (const child of outer.children) merge(box, walk(child, IDENTITY, { stroke: "none", strokeWidth: 1, fill: "#000" }));
  return isEmpty(box) ? undefined : box;
}

/** The `viewBox` of the outer `<svg>` of a drawing, as a box. */
export function viewBoxOf(svg: string): Box {
  const v = (/^<svg[^>]*?\sviewBox="([^"]*)"/.exec(svg)?.[1] ?? "0 0 64 64").split(/\s+/).map(Number) as [number, number, number, number];
  return { x0: v[0], y0: v[1], x1: v[0] + v[2], y1: v[1] + v[3] };
}

/** How far the ink goes past the view box, as a fraction of the box's longer side: 0 when it all fits. */
export function overflowOf(svg: string): number {
  const ink = inkBox(svg);
  if (ink === undefined) return 0;
  const view = viewBoxOf(svg);
  const side = Math.max(view.x1 - view.x0, view.y1 - view.y0);
  return Math.max(0, view.x0 - ink.x0, view.y0 - ink.y0, ink.x1 - view.x1, ink.y1 - view.y1) / side;
}
