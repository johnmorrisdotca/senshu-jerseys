// Turning a judogi already drawn by renderJudogi or judogiFrame: every piece in it moves to the new angle in place, with no new markup.
// A page that turns it often wants judogiCanvas instead: an SVG this detailed turns slowly in Safari. Part of the turning entry, not the
// pure one: it changes a document.
import { applyPiece } from "./pieceVolume.ts";
import { normalYaw } from "./turn.ts";

/**
 * Turn the judogi drawn in `svg` to `yaw` degrees (0 is the front, 180 the back; a back view was drawn half a turn round already, so
 * pass the angle it should now show). Every piece, the jacket, the trousers or the belt, turns about its own middle. Returns the angle
 * it was set to (`tilt` looks that many degrees further from above, or below when negative), or NaN when `svg` holds no turning judogi (a flat view, or not a judogi).
 *
 * @param svg - a judogi drawing from `judogiFrame`, on the page
 * @param yaw - the angle in degrees, 0 the front and 180 the back
 * @param tilt - how far to tip it forward, in degrees
 * @returns the angle it was set to, taken into -180 up to 180
 * @example
 * ```ts no-run
 * import { judogiFrame } from "@johnmorrisdotca/senshu-jerseys";
 * import { judogiTurn } from "@johnmorrisdotca/senshu-jerseys/turn";
 *
 * const host = document.createElement("div");
 * host.innerHTML = judogiFrame({ mode: "suit", view: "front" });
 * const svg = host.querySelector("svg");
 * if (svg) console.log(judogiTurn(svg, 90, 0));
 * ```
 */
export function judogiTurn(svg: Element, yaw: number, tilt = 0): number {
  const a = normalYaw(yaw);
  let any = false;
  svg.querySelectorAll("[data-piece]").forEach((piece) => {
    any = applyPiece(piece, a, Number.isFinite(tilt) ? Math.max(-45, Math.min(45, tilt)) : 0) || any;
  });
  if (!any) return Number.NaN;
  svg.setAttribute("data-yaw", String(a));
  return a;
}
