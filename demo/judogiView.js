// The judogi view's sizing: the canvas is as wide as its view and as tall as the drawing wants. The hands (drag, wheel, pinch, keys, the buttons) are the family's <kazoku-view-controls>.
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The page's own canvas size for `view` and a drawing `natH` tall: the whole of the view (a canvas that is the view lets a zoomed drawing reach every edge of it), as tall as the
 * drawing wants on a desk (at least 320) and held to a third of the screen on a phone, where the form must stay in reach. `fill` sets the stage to it; `undefined` frees the stage for an SVG.
 */
export function fillView(view, stage, natH) {
  if (natH === undefined) {
    delete stage.dataset.painted;
    stage.style.height = "";
    return undefined;
  }
  const box = viewSize(view, natH);
  stage.dataset.painted = "1";
  stage.style.height = `${box.height}px`;
  return box;
}

/** What `fillView` would make the canvas, without touching the page. */
export function viewSize(view, natH) {
  const wide = globalThis.matchMedia("(min-width: 900px)").matches;
  return { width: view.clientWidth, height: wide ? Math.max(320, Math.round(natH) + 20) : Math.max(180, Math.min(Math.round(natH) + 8, Math.round(globalThis.innerHeight * 0.34))) };
}
