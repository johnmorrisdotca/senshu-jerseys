// Still pictures of a drawing for picture tiles: the package's own drawing painted once on a canvas, cropped to the cloth and kept as an image. One at a time, so a phone is
// not asked for many canvases at once (they share one graphics context), and each only when its tile comes near the screen.
import { judogiFrame } from "./dist/index.js";
import { judogiCanvas } from "./dist/turn-entry.js";

const pictures = new Map();
let queue = Promise.resolve();
async function shoot(options, width, scale) {
  const holder = document.createElement("div");
  holder.innerHTML = judogiFrame({ ...options, bare: true, width });
  const svg = holder.firstElementChild;
  const made = svg === null ? undefined : await judogiCanvas(svg, { pixelRatio: 2, scale });
  if (made === undefined) return undefined;
  made.turn(0, 0);
  const { canvas } = made;
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  const g = copy.getContext("2d", { willReadFrequently: true });
  g.drawImage(canvas, 0, 0);
  made.dispose();
  const data = g.getImageData(0, 0, copy.width, copy.height).data;
  let x0 = copy.width, y0 = copy.height, x1 = 0, y1 = 0;
  for (let y = 0; y < copy.height; y++) for (let x = 0; x < copy.width; x++) if (data[(y * copy.width + x) * 4 + 3] > 24) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 <= x0 || y1 <= y0) return undefined;
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d").drawImage(copy, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}
/** Put a tile's picture in when it is ready, once the tile is near the screen (the others wait: a page of forty drawings is not drawn at once). `key` names the drawing, so one made before is not made again. */
const near = new IntersectionObserver((entries) => {
  for (const e of entries) {
    e.target.dataset.near = e.isIntersecting ? "1" : "";
    if (e.isIntersecting) e.target._make?.();
  }
}, { rootMargin: "300px" });
export function picture(tile, key, options, width, scale) {
  const set = (url) => {
    const img = tile.querySelector("img");
    if (img === null || url === undefined) return;
    img.src = url;
    tile.dataset.ready = "1";
  };
  tile._make = () => {
    tile._make = undefined;
    if (pictures.has(key)) return set(pictures.get(key));
    queue = queue.then(async () => {
      if (!pictures.has(key)) pictures.set(key, await shoot(options, width, scale).catch(() => undefined));
      set(pictures.get(key));
      await new Promise((done) => globalThis.setTimeout(done, 40));
    });
  };
  if (tile.dataset.near === "1") tile._make();
  else near.observe(tile);
}

