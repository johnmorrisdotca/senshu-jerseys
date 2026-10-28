// A judogi drawn by renderJudogi or judogiFrame, painted on a canvas that turns it. In the SVG every cell draws its face again, and a
// browser that draws SVG on the processor (Safari) takes about a second a frame for a few hundred of them. On the canvas every cell of a
// piece is one draw on the graphics card (judogiGl.ts); without WebGL 2 each cell is the small part of a picture of its face that lies
// under it, on a 2D canvas. The same cells, maps, shades and order as the SVG (pieceVolume.ts): only the way they reach the screen
// differs. Part of the turning entry: it needs a document.
import { glPainter, matrixOf, paintOrder, type PaintPiece } from "./judogiGl.ts";
import { FACE_BOX, greyOf, pieceCells, shadeOf, smoothOf } from "./pieceVolume.ts";
import { normalYaw } from "./turn.ts";
import { quadPath, type Cell, type Placed, type VolumeDesc } from "./volume.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

/** A judogi on a canvas, and the way to turn it. */
export interface JudogiCanvas {
  /** The canvas, sized like the SVG it was made from: put it on the page in its place. */
  readonly canvas: HTMLCanvasElement;
  /**
   * Turn to `yaw` degrees and paint at once (0 is the front, 180 the back, as for `judogiTurn`), looking from `tilt` degrees further above (negative: below)
   * the camera the drawing was made for (0 by default). Returns the angle it was set to.
   */
  turn(yaw: number, tilt?: number, camera?: JudogiCamera): number;
  /** Let the graphics card go: call it when the canvas leaves the page (a browser keeps only so many canvases on the card). */
  dispose(): void;
}

/** Where the camera looks: a zoom (1 is the whole drawing in the canvas) and how far the drawing is moved from the middle, in CSS pixels. */
export interface JudogiCamera {
  zoom?: number;
  panX?: number;
  panY?: number;
}

/** What the canvas may be told: how many pixels a unit of a face's picture gets, and how many pixels a CSS pixel of the canvas gets. */
export interface JudogiCanvasOptions {
  /** Pixels per unit in the pictures of the faces, 1 to 6 (4 by default: crisp at the size a page shows a judogi). */
  scale?: number;
  /** Canvas pixels per CSS pixel (the screen's own density by default). */
  pixelRatio?: number;
  /** The canvas's size in CSS pixels where it should be larger than the SVG's (the drawing is set in its middle, whole): a zoomed view needs the room to show the drawing larger. */
  box?: { width: number; height: number };
  /** False paints on a 2D canvas even where WebGL 2 is there (slower; for a test or a browser whose graphics card misbehaves). */
  webgl?: boolean;
}

interface Piece extends PaintPiece {
  /** Each cell's grown triangle, in its face's units, and the box round it (the 2D canvas only). */
  paths: Path2D[];
  boxes: [number, number, number, number][];
}

/**
 * Paint the judogi drawn in `svg` (renderJudogi or judogiFrame markup, on the page or not) on a canvas that turns it quickly. Resolves
 * to undefined when `svg` holds no turning judogi (a flat view) or the browser cannot paint it; the SVG then stays as it is. The canvas
 * carries the SVG's title as its accessible name. Saving or printing still wants the SVG: the canvas is a picture of it.
 */
export async function judogiCanvas(svg: Element, options: JudogiCanvasOptions = {}): Promise<JudogiCanvas | undefined> {
  if (typeof document === "undefined") return undefined;
  const roots = [...svg.querySelectorAll("[data-piece]")];
  const defs = svg.querySelector("defs");
  const view = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  if (roots.length === 0 || defs === null || view.length !== 4 || view.some((v) => !Number.isFinite(v))) return undefined;
  const [vx, vy, vw, vh] = view as [number, number, number, number];
  const k = clamp(options.scale ?? 4, 1, 6, 4);
  const ratio = clamp(options.pixelRatio ?? (globalThis.devicePixelRatio || 1), 1, 4, 1);
  const natW = Number(svg.getAttribute("width")) || vw;
  const natH = Number(svg.getAttribute("height")) || (natW * vh) / vw;
  const cssW = Math.max(natW, options.box?.width ?? 0);
  const cssH = Math.max(natH, options.box?.height ?? 0);
  const faces = new Map<string, Promise<CanvasImageSource>>();
  const faceOf = (id: string): Promise<CanvasImageSource> => {
    const known = faces.get(id);
    if (known !== undefined) return known;
    const made = paintFace(defs.innerHTML, id, k);
    faces.set(id, made);
    return made;
  };
  let pieces: Piece[];
  try {
    pieces = await Promise.all(roots.map(async (root) => {
      const desc = JSON.parse(root.getAttribute("data-piece") ?? "") as VolumeDesc;
      const cells = pieceCells(desc);
      const ids = faceIds(root, cells);
      const [front, back] = await Promise.all([faceOf(ids.front), faceOf(ids.back)]);
      const [dx, dy] = offsetOf(root, svg);
      return { desc, cells, smooth: smoothOf(cells), paths: cells.map((c) => new Path2D(quadPath(c.tex))), boxes: cells.map((c) => boxOf(c.tex)), front, back, dx, dy };
    }));
  } catch {
    return undefined;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cssW * ratio));
  canvas.height = Math.max(1, Math.round(cssH * ratio));
  canvas.style.width = `${cssW}px`;
  canvas.setAttribute("role", "img");
  const title = svg.querySelector("title")?.textContent;
  if (title) canvas.setAttribute("aria-label", title);
  // The drawing sits whole in the middle of the canvas at its own size; a camera zooms it about that middle and moves it.
  const base = (natW / vw) * ratio;
  const cam = { zoom: 1, panX: 0, panY: 0 };
  const place = (p: PaintPiece): [number, number, number] => {
    const u = base * cam.zoom;
    return [u, canvas.width / 2 + cam.panX * ratio + u * (p.dx - (vx + vw / 2)), canvas.height / 2 + cam.panY * ratio + u * (p.dy - (vy + vh / 2))];
  };
  const painter = (options.webgl === false ? undefined : glPainter(canvas, pieces, place)) ?? flatPainter(canvas, pieces, place, k);
  if (painter === undefined) return undefined;
  canvas.setAttribute("data-painter", painter.kind);
  const turn = (yaw: number, tilt = 0, camera?: JudogiCamera): number => {
    if (camera !== undefined) {
      cam.zoom = clamp(camera.zoom ?? 1, 1, 8, 1);
      cam.panX = camera.panX ?? 0;
      cam.panY = camera.panY ?? 0;
    }
    const a = normalYaw(yaw);
    const t = Math.max(-45, Math.min(45, Number.isFinite(tilt) ? tilt : 0));
    painter.paint(a, t);
    canvas.setAttribute("data-yaw", String(a));
    canvas.setAttribute("data-tilt", String(t));
    return a;
  };
  turn(Number(svg.getAttribute("data-yaw")) || 0);
  return { canvas, turn, dispose: painter.dispose };
}

/** The 2D canvas's painter: each cell a clipped part of its face's picture, each layer's shades multiplied onto it. */
function flatPainter(canvas: HTMLCanvasElement, pieces: readonly Piece[], place: (p: PaintPiece) => [number, number, number], k: number): { kind: string; paint(yaw: number, tilt?: number): void; dispose(): void } | undefined {
  const ctx = canvas.getContext("2d");
  const layer = sheet(canvas.width, canvas.height);
  const shade = sheet(canvas.width, canvas.height);
  if (ctx === null || layer === null || shade === null) return undefined;
  const paint = (yaw: number, tilt = 0): void => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const job of paintOrder(pieces, yaw, tilt)) {
      const p = pieces[job.n]!;
      paintPiece(ctx, layer, shade, p, yaw, job.placed, job.lists, ...place(p), k, tilt);
    }
  };
  return { kind: "2d", paint, dispose: () => undefined };
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
  return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
}

/** A canvas the size of the main one and its context, to build one layer in before it goes onto the main one. */
function sheet(w: number, h: number): CanvasRenderingContext2D | null {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c.getContext("2d");
}

/** The ids of the front and back faces a piece's cells show, read from its markup. */
function faceIds(root: Element, cells: readonly Cell[]): { front: string; back: string } {
  const out: { front?: string; back?: string } = {};
  for (const n of root.querySelectorAll("[data-vc]")) {
    const c = cells[Number(n.getAttribute("data-vc"))];
    const id = n.querySelector("use")?.getAttribute("href")?.slice(1);
    if (c === undefined || !id) continue;
    if (c.back) out.back ??= id;
    else out.front ??= id;
    if (out.front !== undefined && out.back !== undefined) break;
  }
  if (out.front === undefined) throw new Error("a piece with no front face");
  return { front: out.front, back: out.back ?? out.front };
}

/** Where a piece sits in the drawing: the sum of the `translate`s round it (the layouts move pieces only by those). */
function offsetOf(root: Element, svg: Element): [number, number] {
  let x = 0;
  let y = 0;
  for (let n = root.parentElement; n !== null && n !== svg; n = n.parentElement) {
    const m = /translate\(\s*(-?[\d.]+)[\s,]*(-?[\d.]+)?\s*\)/.exec(n.getAttribute("transform") ?? "");
    if (m !== null) {
      x += Number(m[1]);
      y += Number(m[2] ?? 0);
    }
  }
  return [x, y];
}

/** The box round a cell's grown triangle (quadPath grows it by under a unit), in its face's units. */
function boxOf(tex: readonly number[]): [number, number, number, number] {
  const xs = [tex[0]!, tex[2]!, tex[4]!];
  const ys = [tex[1]!, tex[3]!, tex[5]!];
  const x = Math.min(...xs) - 1;
  const y = Math.min(...ys) - 1;
  return [x, y, Math.max(...xs) + 1 - x, Math.max(...ys) + 1 - y];
}

/** One face's drawing, alone on a page of its own with every def, painted once into a canvas at `k` pixels a unit. */
async function paintFace(allDefs: string, id: string, k: number): Promise<CanvasImageSource> {
  const [x, y, w, h] = FACE_BOX;
  const width = Math.round(w * k);
  const height = Math.round(h * k);
  const page = `<svg xmlns="${SVG_NS}" viewBox="${x} ${y} ${w} ${h}" width="${width}" height="${height}"><defs>${allDefs}</defs><use href="#${id}"/></svg>`;
  const source = URL.createObjectURL(new Blob([page], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = source;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const g = c.getContext("2d");
    if (g === null) throw new Error("no 2d context");
    g.drawImage(img, 0, 0, width, height);
    // A bitmap is ready for the graphics card: a canvas as the source is copied again on every draw in some browsers.
    return typeof createImageBitmap === "function" ? await createImageBitmap(c) : c;
  } finally {
    URL.revokeObjectURL(source);
  }
}

type Matrix = [number, number, number, number, number, number];

/**
 * One piece at a turn (or the part of it `paintOrder` gives), layer by layer in the SVG's order: each layer's cloth (every cell its face's picture under its map, clipped to its
 * grown triangle), then its shades as opaque greys on the same triangles, kept to where the layer has cloth and multiplied onto it.
 */
function paintPiece(ctx: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, shade: CanvasRenderingContext2D, p: Piece, yaw: number, placed: readonly Placed[], lists: readonly number[][], u: number, ox: number, oy: number, k: number, tilt: number): void {
  const [fx, fy, fw, fh] = FACE_BOX;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  for (const list of lists) {
    const maps = list.map((i): Matrix => {
      const [a, b, c, d, e, f] = matrixOf(placed[i]!.matrix);
      return [u * a, u * b, u * c, u * d, u * e + ox, u * f + oy];
    });
    // The layer's box on the canvas: clearing and copying only that keeps a frame's cost to the cloth on show, not the canvas's size.
    let x0 = W;
    let y0 = H;
    let x1 = 0;
    let y1 = 0;
    list.forEach((i, j) => {
      const t = p.cells[i]!.tex;
      const m = maps[j]!;
      for (let q = 0; q < 6; q += 2) {
        const x = m[0] * t[q]! + m[2] * t[q + 1]! + m[4];
        const y = m[1] * t[q]! + m[3] * t[q + 1]! + m[5];
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    });
    const pad = 2 * u + 2;
    const rx = Math.max(0, Math.floor(x0 - pad));
    const ry = Math.max(0, Math.floor(y0 - pad));
    const rw = Math.min(W, Math.ceil(x1 + pad)) - rx;
    const rh = Math.min(H, Math.ceil(y1 + pad)) - ry;
    if (rw <= 0 || rh <= 0) continue;
    for (const s of [layer, shade]) {
      s.setTransform(1, 0, 0, 1, 0, 0);
      s.clearRect(rx, ry, rw, rh);
    }
    list.forEach((i, j) => {
      const c = p.cells[i]!;
      const m = maps[j]!;
      layer.setTransform(...m);
      layer.save();
      layer.clip(p.paths[i]!);
      // Only the part of the picture under the cell, kept inside the picture (a source box outside it draws nothing in some browsers).
      const [bx, by, bw, bh] = p.boxes[i]!;
      const sx0 = Math.max(bx, fx);
      const sy0 = Math.max(by, fy);
      const sx1 = Math.min(bx + bw, fx + fw);
      const sy1 = Math.min(by + bh, fy + fh);
      if (sx1 > sx0 && sy1 > sy0) layer.drawImage(c.back ? p.back : p.front, (sx0 - fx) * k, (sy0 - fy) * k, (sx1 - sx0) * k, (sy1 - sy0) * k, sx0, sy0, sx1 - sx0, sy1 - sy0);
      layer.restore();
      shade.setTransform(...m);
      const sm = p.smooth[i];
      if (sm === undefined) shade.fillStyle = greyOf(shadeOf(c.n, yaw, p.desc.pitch + tilt));
      else {
        // A gradient is made in the space the transform sets: each triangle of a quadrilateral needs its own.
        const g = shade.createLinearGradient(...sm.line);
        g.addColorStop(0, greyOf(shadeOf(sm.n0, yaw, p.desc.pitch + tilt)));
        g.addColorStop(1, greyOf(shadeOf(sm.n1, yaw, p.desc.pitch + tilt)));
        shade.fillStyle = g;
      }
      shade.fill(p.paths[i]!);
    });
    shade.setTransform(1, 0, 0, 1, 0, 0);
    shade.globalCompositeOperation = "destination-in";
    shade.drawImage(layer.canvas, rx, ry, rw, rh, rx, ry, rw, rh);
    shade.globalCompositeOperation = "source-over";
    ctx.drawImage(layer.canvas, rx, ry, rw, rh, rx, ry, rw, rh);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(shade.canvas, rx, ry, rw, rh, rx, ry, rw, rh);
    ctx.globalCompositeOperation = "source-over";
  }
}
