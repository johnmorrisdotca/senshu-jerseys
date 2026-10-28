// Turning a judogi already drawn by renderJudogi or judogiFrame: every piece in it moves to the new angle in place, with no new markup.
// A page that turns it often wants judogiCanvas instead: an SVG this detailed turns slowly in Safari. Part of the turning entry, not the
// pure one: it changes a document.
import { applyPiece } from "./pieceVolume.ts";
import { normalYaw } from "./turn.ts";

/**
 * Turn the judogi drawn in `svg` to `yaw` degrees (0 is the front, 180 the back; a back view was drawn half a turn round already, so
 * pass the angle it should now show). Every piece, the jacket, the trousers or the belt, turns about its own middle. Returns the angle
 * it was set to (`tilt` looks that many degrees further from above, or below when negative), or NaN when `svg` holds no turning judogi (a flat view, or not a judogi).
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
