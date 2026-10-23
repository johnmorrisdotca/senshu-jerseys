// The wrapper every drawing shares: the root element, an accessible name and the defs.
import { esc } from "./colour.ts";
import { n2 } from "./path.ts";

/** An SVG document `width` pixels wide for a drawing `w` by `h` units, named for assistive technology. `x` and `y` move the view box; `yaw` records a turn. */
export function wrapSvg(o: { id: string; w: number; h: number; width: number; title: string; description?: string; defs?: string; body: string; x?: number; y?: number; yaw?: number }): string {
  const px = Math.round(o.width * 100) / 100;
  const ph = Math.round(((o.width * o.h) / o.w) * 100) / 100;
  const desc = o.description === undefined ? "" : `<desc>${esc(o.description)}</desc>`;
  const defs = o.defs === undefined || o.defs === "" ? "" : `<defs>${o.defs}</defs>`;
  const yaw = o.yaw === undefined ? "" : ` data-yaw="${n2(o.yaw)}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(o.x ?? 0)} ${n2(o.y ?? 0)} ${n2(o.w)} ${n2(o.h)}" width="${px}" height="${ph}" role="img" aria-labelledby="${o.id}T"${yaw}><title id="${o.id}T">${esc(o.title)}</title>${desc}${defs}${o.body}</svg>`;
}
