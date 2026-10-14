// `renderJersey`: the jersey as a document of SVG, front, back or both side by side.
import { esc } from "./colour.ts";
import { titleOf } from "./title.ts";
import { JERSEY_HEIGHT, JERSEY_WIDTH, jerseyBox, jerseyView, uidOf, type View } from "./jersey.ts";
import { resolve, type JerseyOptions, type Resolved } from "./options.ts";
import { renderKit } from "./uniform.ts";
import type { EmblemRenderer } from "./emblems.ts";
import { overlapOf, shadowAttr, shadowDefs, tuck } from "./overlap.ts";
import { n2 } from "./path.ts";

/** The options' own `emblems` renderer, for the drawing of one crest. */
export interface RenderExtras {
  emblems?: EmblemRenderer;
  /** In the `both` view, how far the back tucks under the front, as a fraction of a shirt's width, 0 to 0.4 (0 by default: side by side). The back is drawn over the front, with a soft shadow. */
  overlap?: number;
}

/** The drawing's views, each as its own markup. */
export function viewsOf(r: Resolved, emblems?: EmblemRenderer): { id: "front" | "back"; view: View; uid: string }[] {
  const ids: ("front" | "back")[] = r.view === "both" ? ["front", "back"] : [r.view];
  return ids.map((id) => {
    const uid = uidOf(r, id);
    return { id, view: jerseyView(r, id, uid, emblems), uid };
  });
}

/**
 * The jersey as an SVG document, in the box of its cut (`jerseyBox`): `size` is the width of the shirt's 200 units, so the document is `size` wide for a cut that fits them and a little wider for one whose sleeves
 * reach past, and a bit over twice that for both views. The box does not change with the sleeve, the look or a turn.
 */
export function renderJersey(options?: JerseyOptions & RenderExtras): string {
  const r = resolve(options);
  if (r.kit) return renderKit(options);
  const views = viewsOf(r, options?.emblems);
  const gap = 24;
  const n = views.length;
  const box = jerseyBox(r.cut);
  const overlap = n > 1 ? overlapOf(options?.overlap) : 0;
  const pitch = tuck(box.w + gap, JERSEY_WIDTH, overlap);
  const W = (n - 1) * pitch + box.w;
  const px = Math.round(r.size * (W / JERSEY_WIDTH) * 100) / 100;
  const h = Math.round(((r.size * JERSEY_HEIGHT) / JERSEY_WIDTH) * 100) / 100;
  const title = titleOf(r);
  const tid = `${views[0]?.uid ?? "sj"}T`;
  const sid = `${views[0]?.uid ?? "sj"}S`;
  const parts = views.map(({ view }, i) => `<g${i > 0 ? ` transform="translate(${n2(i * pitch)} 0)"` : ""}${shadowAttr(sid, overlap > 0 ? i : 0)}>${view.body}</g>`).join("");
  const desc = r.description === undefined ? "" : `<desc>${esc(r.description)}</desc>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(box.x)} 0 ${n2(W)} ${JERSEY_HEIGHT}" width="${px}" height="${h}" role="img" aria-labelledby="${tid}"><title id="${tid}">${esc(title)}</title>${desc}<defs>${views.map((v) => v.view.defs).join("")}${overlap > 0 ? shadowDefs(sid) : ""}</defs>${parts}</svg>`;
}
