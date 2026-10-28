// The judogi's cells on the graphics card (WebGL 2), for judogiCanvas: every cell of a piece in one draw, each shaded as it is drawn.
// A 2D canvas copies a face's picture once per cell, and Safari pays a fixed price for each copy (a few hundred a frame: some fifteen
// frames a second); one draw of a piece's triangles costs about nothing. The cells, the order and the shade are the SVG's
// (pieceVolume.ts). Each cell's shade multiplies its cloth as it is drawn, not in a layer of its own: a cell is opaque cloth, so where two
// grown cells overlap the later one simply covers the earlier, and no shade is doubled.
import { depthOrder, FACE_BOX, halfOrder, isBand, layerOf, shadeOf, type Smooth } from "./pieceVolume.ts";
import { groupOrder, nearSleeve, placeCell, type Cell, type Placed, type VolumeDesc } from "./volume.ts";

/** A piece as both painters take it: its cells and their shade, the pictures of its two faces, and where it sits in the drawing. */
export interface PaintPiece {
  desc: VolumeDesc;
  cells: Cell[];
  smooth: (Smooth | undefined)[];
  front: CanvasImageSource;
  back: CanvasImageSource;
  dx: number;
  dy: number;
}

/** The cells of a piece that show at a turn, as the SVG draws them: layer by layer from the back, each layer in the cells' own order (a strap's, farthest first). */
export function drawOrder(p: PaintPiece, yaw: number, placed: readonly Placed[]): number[][] {
  if (isBand(p.desc)) return [depthOrder(placed).filter((i) => placed[i]!.visible)];
  const visible = placed.map((q) => q.visible);
  const byLayer = new Map<string, number[]>();
  p.cells.forEach((c, i) => {
    if (!visible[i]) return;
    const key = layerOf(p.desc, c);
    const list = byLayer.get(key);
    if (list === undefined) byLayer.set(key, [i]);
    else list.push(i);
  });
  const out: number[][] = [];
  for (const g of groupOrder(yaw, p.desc.hang === true)) {
    const keys = p.desc.lobes !== undefined && (g === 0 || g === 3) ? halfOrder(yaw).map((h) => `${g}${h}`) : [`${g}`];
    for (const key of keys) {
      const list = byLayer.get(key);
      if (list !== undefined) out.push(list);
    }
  }
  return out;
}

/**
 * What is drawn at a turn, in order: each piece's cells, list by list (`drawOrder`). A piece with others worn on it (`VolumeDesc.worn`: a
 * jacket's collar and belt) is drawn up to its near sleeve, then those pieces, then its near sleeve, so the sleeve hangs over the belt.
 */
export function paintOrder(pieces: readonly PaintPiece[], yaw: number, tilt = 0): { n: number; placed: Placed[]; lists: number[][] }[] {
  const plans = pieces.map((p) => {
    const placed = p.cells.map((c) => placeCell(c, yaw, p.desc.pitch + tilt));
    return { placed, lists: drawOrder(p, yaw, placed) };
  });
  const out: { n: number; placed: Placed[]; lists: number[][] }[] = [];
  for (let n = 0; n < pieces.length; n++) {
    const p = pieces[n]!;
    const plan = plans[n]!;
    const m = p.desc.worn ?? 0;
    if (m <= 0 || p.desc.hang === true || p.desc.sl.length === 0) {
      out.push({ n, ...plan });
      continue;
    }
    const near = nearSleeve(yaw) === -1 ? 1 : 2;
    const isNear = (list: number[]): boolean => p.cells[list[0]!]!.g === near;
    out.push({ n, placed: plan.placed, lists: plan.lists.filter((l) => !isNear(l)) });
    for (let k = 1; k <= m && n + k < pieces.length; k++) out.push({ n: n + k, ...plans[n + k]! });
    out.push({ n, placed: plan.placed, lists: plan.lists.filter(isNear) });
    n += m;
  }
  return out;
}

/** The numbers of a placed cell's map ("matrix(a b c d e f)"), from the drawing of its face to the drawing of the judogi. */
export function matrixOf(s: string): [number, number, number, number, number, number] {
  const v = s.slice(7, -1).split(" ").map(Number);
  return [v[0] ?? 1, v[1] ?? 0, v[2] ?? 0, v[3] ?? 1, v[4] ?? 0, v[5] ?? 0];
}

const VERTEX = `#version 300 es
in vec2 at;
in vec2 uv;
in float shade;
in float nearz;
uniform vec2 size;
uniform float deep;
out vec2 vUv;
out float vShade;
void main() {
  vUv = uv;
  vShade = shade;
  gl_Position = vec4(at.x / size.x * 2.0 - 1.0, 1.0 - at.y / size.y * 2.0, deep > 0.5 ? clamp(-nearz / 400.0, -0.99, 0.99) : 0.0, 1.0);
}`;

// The pictures are premultiplied, so multiplying the whole colour by the grey darkens the cloth and keeps its edge.
const FRAGMENT = `#version 300 es
precision mediump float;
in vec2 vUv;
in float vShade;
uniform sampler2D face;
uniform highp float deep;
out vec4 colour;
void main() {
  vec4 c = texture(face, vUv);
  // Where cloth is judged by how near it is (a strap), a see-through edge must not hide what is behind it.
  if (deep > 0.5 && c.a < 0.4) discard;
  colour = vec4(c.rgb * (1.0 - vShade), c.a);
}`;

/** How far each cell is grown at its corners, in units of its face (quadPath grows the SVG's by as much). */
const GROW = 0.9;

/** Floats a corner takes: where it is on the canvas, where on the faces' picture, and its shade. */
const STRIDE = 6;

/** A painter for `canvas`: turn(yaw) draws every piece at that turn. Undefined when the browser has no WebGL 2 or it fails to start. */
export function glPainter(canvas: HTMLCanvasElement, pieces: readonly PaintPiece[], place: (p: PaintPiece) => [number, number, number]): { kind: string; paint(yaw: number, tilt?: number): void; dispose(): void } | undefined {
  const gl = canvas.getContext("webgl2", { antialias: true, premultipliedAlpha: true, alpha: true });
  if (gl === null) return undefined;
  const program = link(gl);
  if (program === undefined) return undefined;
  const buffer = gl.createBuffer();
  // Each piece's two faces side by side in one picture, so a piece is one draw with its cells in order.
  const atlases = pieces.map((p) => atlasOf(gl, p));
  if (atlases.some((t) => t === null)) return undefined;
  const loc = { at: gl.getAttribLocation(program, "at"), uv: gl.getAttribLocation(program, "uv"), shade: gl.getAttribLocation(program, "shade"), nearz: gl.getAttribLocation(program, "nearz"), size: gl.getUniformLocation(program, "size"), deep: gl.getUniformLocation(program, "deep") };
  const [fx, fy, fw, fh] = FACE_BOX;
  const scene = pieces.some((q) => (q.desc.worn ?? 0) > 0);
  let data = new Float32Array(0);
  const paint = (yaw: number, tilt = 0): void => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(program);
    gl.uniform2f(loc.size, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    for (const [at, size, offset] of [[loc.at, 2, 0], [loc.uv, 2, 2], [loc.shade, 1, 4], [loc.nearz, 1, 5]] as const) {
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
    }
    for (const job of paintOrder(pieces, yaw, tilt)) {
      const n = job.n;
      const p = pieces[n]!;
      const [u, ox, oy] = place(p);
      const placed = job.placed;
      const order = job.lists.flat();
      // A strap or a collar is judged by how near each part of it is at each point, not by the order of its cells alone (a knot's cells cross
      // one another); the order still breaks ties. Nothing else in the picture is tested against it.
      // A folded belt or a box (solid) is drawn in its settled order alone: its cells are large and flat, and a depth test between thin cloth and the wall beside it only flickers.
      // A garment with things worn on it (a jacket with its collar and belt) is one scene: every piece is judged by nearness against all the others, so the belt, the sleeve and the body
      // cover each other as they stand and not as their groups are ordered (the pieces' depths are made comparable with the offset each lies at in the drawing).
      const deep = p.desc.solid === undefined && (scene || isBand(p.desc));
      gl.uniform1f(loc.deep, deep ? 1 : 0);
      if (deep) {
        if (!scene) gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
      } else gl.disable(gl.DEPTH_TEST);
      const sinP = Math.sin(((p.desc.pitch + tilt) * Math.PI) / 180);
      const need = order.length * 3 * STRIDE;
      if (data.length < need) data = new Float32Array(need);
      // Each quadrilateral's shade at its two side edges, worked out once for its two triangles.
      const edges = new Map<Smooth, [number, number]>();
      let w = 0;
      for (const i of order) {
        const bias = 0;
        const c = p.cells[i]!;
        const [a, b, cc, d, e, f] = matrixOf(placed[i]!.matrix);
        const sm = p.smooth[i];
        let s: [number, number, number];
        if (sm === undefined) {
          const flat = shadeOf(c.n, yaw, p.desc.pitch + tilt, c.inside === true);
          s = [flat, flat, flat];
        } else {
          let pair = edges.get(sm);
          if (pair === undefined) {
            pair = [shadeOf(sm.n0, yaw, p.desc.pitch + tilt), shadeOf(sm.n1, yaw, p.desc.pitch + tilt)];
            edges.set(sm, pair);
          }
          // A quadrilateral's first triangle is its top left, top right and bottom left corners, the second its top right, bottom right
          // and bottom left: the left corners take the left edge's shade, the right ones the right edge's.
          const second = p.smooth[i - 1] === sm;
          s = second ? [pair[1], pair[1], pair[0]] : [pair[0], pair[1], pair[0]];
        }
        const half = c.back ? 0.5 : 0;
        // Grown a little from its middle, as the SVG's are (quadPath): where rows of different lengths meet, corners do not always
        // coincide, and a hairline between two cells would show the page through the cloth.
        const mx = (c.tex[0]! + c.tex[2]! + c.tex[4]!) / 3;
        const my = (c.tex[1]! + c.tex[3]! + c.tex[5]!) / 3;
        // How near each corner is, and the plane of the three: a grown corner is as near as the cell's own plane puts it there, so a large flat cell
        // (a box's wall) does not tilt at its fringe and fight the thin cloth just behind it for the depth.
        const tri = placed[i]!.tri;
        const t = c.tex;
        const det = (t[2]! - t[0]!) * (t[5]! - t[1]!) - (t[4]! - t[0]!) * (t[3]! - t[1]!);
        for (let q = 0; q < 3; q++) {
          const gx = c.tex[2 * q]! - mx;
          const gy = c.tex[2 * q + 1]! - my;
          const grow = GROW / (Math.hypot(gx, gy) || 1);
          const tx = c.tex[2 * q]! + gx * grow;
          const ty = c.tex[2 * q + 1]! + gy * grow;
          data[w++] = u * (a * tx + cc * ty + e) + ox;
          data[w++] = u * (b * tx + d * ty + f) + oy;
          data[w++] = ((tx - fx) / fw) * 0.5 + half;
          data[w++] = (ty - fy) / fh;
          data[w++] = s[q]!;
          let near = tri?.[3 * q + 2] ?? 0;
          if (tri !== undefined && Math.abs(det) > 1e-9) {
            const l1 = ((tx - t[0]!) * (t[5]! - t[1]!) - (t[4]! - t[0]!) * (ty - t[1]!)) / det;
            const l2 = ((t[2]! - t[0]!) * (ty - t[1]!) - (tx - t[0]!) * (t[3]! - t[1]!)) / det;
            near = tri[2]! + l1 * (tri[5]! - tri[2]!) + l2 * (tri[8]! - tri[2]!);
          }
          // The depth turns with the pitch about each piece's own origin, so a piece lying lower in the drawing is brought to the same footing as the others.
          data[w++] = near + bias - (scene ? p.dy * sinP : 0);
        }
      }
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, w), gl.STREAM_DRAW);
      gl.bindTexture(gl.TEXTURE_2D, atlases[n]!);
      gl.drawArrays(gl.TRIANGLES, 0, w / STRIDE);
    }
  };
  const dispose = (): void => {
    for (const t of atlases) gl.deleteTexture(t);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
  return { kind: "webgl", paint, dispose };
}

function link(gl: WebGL2RenderingContext): WebGLProgram | undefined {
  const program = gl.createProgram();
  for (const [kind, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
    const shader = gl.createShader(kind);
    if (shader === null) return undefined;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : undefined;
}

/** A piece's front and back pictures side by side on the graphics card, with smaller copies for when it is drawn small. */
function atlasOf(gl: WebGL2RenderingContext, p: PaintPiece): WebGLTexture | null {
  const w = sizeOf(p.front, "width");
  const h = sizeOf(p.front, "height");
  const both = document.createElement("canvas");
  both.width = 2 * w;
  both.height = h;
  const g = both.getContext("2d");
  if (g === null) return null;
  g.drawImage(p.front, 0, 0, w, h);
  g.drawImage(p.back, w, 0, w, h);
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, both);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function sizeOf(source: CanvasImageSource, side: "width" | "height"): number {
  const v = (source as { width?: unknown; height?: unknown })[side];
  return typeof v === "number" ? v : Number((v as { baseVal?: { value: number } } | undefined)?.baseVal?.value ?? 0);
}
