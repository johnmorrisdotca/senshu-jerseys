// Turning a judogi already drawn by renderJudogi or judogiFrame: every piece in it moves to the new angle in place, with no new markup;
// and preparing one for a page, so it shows and turns quickly. Part of the turning entry, not the pure one: it changes a document.
import { applyPiece } from "./pieceVolume.ts";
import { normalYaw } from "./turn.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Turn the judogi drawn in `svg` to `yaw` degrees (0 is the front, 180 the back; a back view was drawn half a turn round already, so
 * pass the angle it should now show). Every piece, the jacket, the trousers or the belt, turns about its own middle. Returns the angle
 * it was set to, or NaN when `svg` holds no turning judogi (a flat view, or not a judogi).
 */
export function judogiTurn(svg: Element, yaw: number): number {
  const a = normalYaw(yaw);
  let any = false;
  svg.querySelectorAll("[data-piece]").forEach((piece) => {
    any = applyPiece(piece, a) || any;
  });
  if (!any) return Number.NaN;
  svg.setAttribute("data-yaw", String(a));
  return a;
}

/**
 * Make a judogi quick to show and to turn in a browser: each face's drawing is painted once into a picture, and its cells show the
 * picture. Each of the few hundred cells of a piece draws its face again, and a detailed face (the weave, the quilting, every row of
 * stitching) drawn that often takes about a second a frame, where a picture takes a few milliseconds. Call it before the drawing goes on
 * the page, so the slow drawing is never painted. `scale` is how many pixels a unit of the drawing gets in the picture (4 by default,
 * crisp on a high-density screen at the size a page shows a judogi). The markup the package returns, and so a saved SVG, keeps the
 * drawing itself. Resolves to false when `svg` holds nothing to prepare (a flat view) or the browser could not paint it.
 */
export async function judogiPrepare(svg: Element, scale = 4): Promise<boolean> {
  const tiles = [...svg.querySelectorAll("g[data-face]")];
  const defs = svg.querySelector("defs");
  if (tiles.length === 0 || defs === null || typeof document === "undefined") return false;
  const k = Math.max(1, Math.min(6, Number.isFinite(scale) ? scale : 4));
  const all = defs.innerHTML;
  try {
    await Promise.all(tiles.map(async (tile) => {
      const [x, y, w, h] = (tile.getAttribute("data-face") ?? "").split(" ").map(Number) as [number, number, number, number];
      const face = tile.id;
      const width = Math.round(w * k);
      const height = Math.round(h * k);
      // The face alone, on a page of its own: every def comes along, so its weaves, gradients and clips are there, and only the face is drawn.
      const page = `<svg xmlns="${SVG_NS}" viewBox="${x} ${y} ${w} ${h}" width="${width}" height="${height}"><defs>${all}</defs><use href="#${face}"/></svg>`;
      const source = URL.createObjectURL(new Blob([page], { type: "image/svg+xml" }));
      try {
        const img = new Image();
        img.src = source;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        // A data address rather than an object one: it goes when the drawing goes, with nothing left to free.
        const png = canvas.toDataURL("image/png");
        const picture = document.createElementNS(SVG_NS, "image");
        for (const [a, v] of [["x", x], ["y", y], ["width", w], ["height", h]] as const) picture.setAttribute(a, String(v));
        picture.setAttribute("preserveAspectRatio", "none");
        picture.setAttribute("href", png);
        tile.replaceChildren(picture);
      } finally {
        URL.revokeObjectURL(source);
      }
    }));
  } catch {
    return false;
  }
  return true;
}
