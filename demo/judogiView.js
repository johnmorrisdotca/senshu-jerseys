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

/**
 * Runs `paint` for a view that changes often: at most about 60 times a second (a screen that asks more is answered once a frame's time), never while the tab is hidden or the view is
 * out of sight, and once, when it is back, if it was asked meanwhile. `ask(true)` (a key, a button, the end of a gesture) is never held back. A trailing timer, not an animation frame: the view controls already run the one frame loop. Returns the function to ask with.
 */
export function paced(view, paint, gap = 16) {
  let onScreen = true;
  let stale = false;
  let at = -Infinity;
  let timer = 0;
  const run = () => {
    timer = 0;
    if (document.hidden || !onScreen) {
      stale = true;
      return;
    }
    stale = false;
    at = globalThis.performance.now();
    paint();
  };
  const ask = (now = false) => {
    if (document.hidden || !onScreen) {
      stale = true;
      return;
    }
    const wait = at + gap - globalThis.performance.now();
    if (now || wait <= 0) {
      globalThis.clearTimeout(timer);
      run();
    } else if (timer === 0) timer = globalThis.setTimeout(run, wait);
  };
  if (typeof IntersectionObserver === "function") {
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting !== false;
      if (onScreen && stale) ask();
    }).observe(view);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && stale) ask();
  });
  return ask;
}

/** Wraps an async `build` so that only one runs at a time: asked again meanwhile, it runs once more when the one in hand is done (the newest choice wins, and the graphics card is never asked for two drawings at once). */
export function oneAtATime(build) {
  let busy = false;
  let again = false;
  return async function run() {
    if (busy) {
      again = true;
      return;
    }
    busy = true;
    try {
      do {
        again = false;
        await build();
      } while (again);
    } finally {
      busy = false;
    }
  };
}
