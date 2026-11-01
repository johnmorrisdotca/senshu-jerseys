// The judogi view's own hands: a drag turns it (across the view is a half turn) and tips it (up and down) at 1x; zoomed in, a drag moves it unless the Turn button says it turns, the wheel and a trackpad turn it, a pinch, Ctrl or
// Command with the wheel, the buttons, and a double press zoom it from 1x to 5x, and Shift with a drag, the middle or right button, or two fingers move a zoomed view always. The arrow buttons of `bindMoves` move it too. Grabbing it stops the
// automatic turn. The same pattern as the kyogijo-stadiums 3D view: a plain wheel over the view leaves the page to scroll unless the view has focus, and Ctrl with the wheel
// (what a trackpad's pinch sends) is the zoom. The view only reports changes; the page draws.
export const TILT_MAX = 30;
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 5;
/** Degrees of turn across the view's whole width (a half turn), and of tilt across its height. */
const TURN_ACROSS = 180;
const TILT_ACROSS = 60;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const wrapYaw = (a) => ((((Math.round(a) + 180) % 360) + 360) % 360) - 180;

const FRACTION = 0.25;

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
 * The buttons that move a zoomed view and choose what a plain drag does there: `<prefix>-pan-left|right|up|down` move the piece a quarter of the view that way,
 * `<prefix>-hand-move` and `<prefix>-hand-turn` choose between a drag that moves it and one that turns it (`onDrag(value)`), `<prefix>-fit` and the rest are the page's own.
 */
export function bindMoves(prefix, view, hooks, onDrag) {
  const root = document.getElementById(`${prefix}-pan`);
  for (const [dir, dx, dy] of [["left", -1, 0], ["right", 1, 0], ["up", 0, -1], ["down", 0, 1]]) {
    document.getElementById(`${prefix}-pan-${dir}`).addEventListener("click", () => {
      const s = hooks.get();
      const r = view.getBoundingClientRect();
      hooks.grab();
      hooks.set({ panX: s.panX + dx * r.width * FRACTION, panY: s.panY + dy * r.height * FRACTION }, true);
    });
  }
  for (const value of ["move", "turn"]) document.getElementById(`${prefix}-hand-${value}`).addEventListener("click", () => onDrag(value));
  /** Show the buttons only while zoomed in (they do nothing at 1x), the chosen drag lit. */
  return (zoom, drag) => {
    root.hidden = zoom <= 1.05;
    for (const value of ["move", "turn"]) document.getElementById(`${prefix}-hand-${value}`).setAttribute("aria-pressed", String(drag === value));
  };
}

/**
 * Bind the hands to `view` (the element that clips and holds the stage, which the page transforms by `zoom` and `pan`).
 * `hooks.get()` gives `{ yaw, tilt, zoom, panX, panY, turnable, drag }` (`drag` is `"move"` or `"turn"`: what a plain drag does while zoomed in); `hooks.set(partial, final)` takes what changed; `hooks.grab()` is called when a hand takes hold.
 */
export function bindView(view, hooks) {
  const pointers = new Map();
  let gesture;
  let lastTap = 0;
  let lastTapAt = { x: 0, y: 0 };
  const rect = () => view.getBoundingClientRect();
  /** The middle of the piece as it is drawn now (client pixels): the middle of its silhouette's box on the canvas, else the view's own middle (a flat SVG). */
  const pieceMid = () => {
    const r = rect();
    const c = view.querySelector("canvas");
    const b = (c?.getAttribute("data-bounds") ?? "").split(" ").map(Number);
    const [w, h] = (c?.getAttribute("data-size") ?? "").split(" ").map(Number);
    if (c === null || b.length !== 4 || b.some((v) => !Number.isFinite(v)) || !(w > 0) || !(h > 0)) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const cr = c.getBoundingClientRect();
    return { x: cr.left + (((b[0] + b[2]) / 2) * cr.width) / w, y: cr.top + (((b[1] + b[3]) / 2) * cr.height) / h };
  };

  /** Zoom to `next` keeping the point under `(cx, cy)` (client pixels) where it is. */
  const zoomAt = (next, cx, cy, final = true) => {
    const s = hooks.get();
    const z = clamp(next, ZOOM_MIN, ZOOM_MAX);
    const r = rect();
    // The stage is drawn from the view's middle: a point's offset from it is scaled, then moved by the pan.
    const px = cx - (r.left + r.width / 2);
    const py = cy - (r.top + r.height / 2);
    const k = z / s.zoom;
    hooks.set({ zoom: z, panX: z === 1 ? 0 : px - (px - s.panX) * k, panY: z === 1 ? 0 : py - (py - s.panY) * k }, final);
  };

  const onDown = (e) => {
    if (e.pointerType === "mouse" && e.button > 2) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    hooks.grab();
    try {
      view.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer already gone */
    }
    const s = hooks.get();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      gesture = { kind: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: s.zoom, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, panX: s.panX, panY: s.panY };
    } else if (pointers.size === 1) {
      // At 1x a plain press and drag turns the piece; zoomed in it moves the view unless the Turn button is chosen. Shift, the middle or the right button always move a zoomed view. A flat layout cannot turn, so there a drag moves it.
      const pan = e.button === 1 || e.button === 2 || e.shiftKey || (s.zoom > 1.05 && (!s.turnable || s.drag !== "turn"));
      gesture = { kind: pan ? "pan" : "turn", x: e.clientX, y: e.clientY, yaw: s.yaw, tilt: s.tilt, panX: s.panX, panY: s.panY, moved: false };
    }
    view.dataset.grab = "1";
  };

  const onMove = (e) => {
    const p = pointers.get(e.pointerId);
    if (p === undefined || gesture === undefined) return;
    p.x = e.clientX;
    p.y = e.clientY;
    const s = hooks.get();
    if (gesture.kind === "pinch" && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const z = clamp(gesture.zoom * (dist / gesture.dist), ZOOM_MIN, ZOOM_MAX);
      const r = rect();
      const px = gesture.mx - (r.left + r.width / 2);
      const py = gesture.my - (r.top + r.height / 2);
      const k = z / gesture.zoom;
      // The two fingers' middle also drags the view.
      hooks.set({ zoom: z, panX: z === 1 ? 0 : px - (px - gesture.panX) * k + (mx - gesture.mx), panY: z === 1 ? 0 : py - (py - gesture.panY) * k + (my - gesture.my) }, false);
    } else if (gesture.kind === "pan") {
      if (s.zoom > 1) hooks.set({ panX: gesture.panX + (e.clientX - gesture.x), panY: gesture.panY + (e.clientY - gesture.y) }, false);
    } else if (gesture.kind === "turn") {
      const dx = e.clientX - gesture.x;
      const dy = e.clientY - gesture.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) gesture.moved = true;
      const r = rect();
      const next = { yaw: wrapYaw(gesture.yaw + (dx / (r.width || 360)) * TURN_ACROSS) };
      // Up and down tips it for a mouse; on a finger the browser keeps the vertical drag to scroll the page, and the Tilt slider tips it.
      if (e.pointerType !== "touch") next.tilt = Math.round(clamp(gesture.tilt - (dy / (r.height || 360)) * TILT_ACROSS, -TILT_MAX, TILT_MAX));
      hooks.set(s.turnable ? next : {}, false);
    }
  };

  const onUp = (e) => {
    if (!pointers.delete(e.pointerId)) return;
    const wasPinch = gesture?.kind === "pinch";
    const moved = gesture?.moved === true;
    if (pointers.size === 1) {
      // One finger left of a pinch carries on as a drag from where it is.
      const [rest] = [...pointers.values()];
      const s = hooks.get();
      gesture = { kind: "pan", x: rest.x, y: rest.y, yaw: s.yaw, tilt: s.tilt, panX: s.panX, panY: s.panY, moved: true };
    } else if (pointers.size === 0) {
      gesture = undefined;
      delete view.dataset.grab;
      hooks.set({}, true);
      // A double press (two quick taps or clicks, hardly moved): in to 2x where it was pressed, and again back to 1x.
      if (!wasPinch && !moved && e.type === "pointerup") {
        const now = e.timeStamp;
        if (now - lastTap < 350 && Math.hypot(e.clientX - lastTapAt.x, e.clientY - lastTapAt.y) < 24) {
          lastTap = 0;
          zoomAt(hooks.get().zoom > 1.05 ? 1 : 2, e.clientX, e.clientY);
        } else {
          lastTap = now;
          lastTapAt = { x: e.clientX, y: e.clientY };
        }
      }
    }
  };

  const onWheel = (e) => {
    const s = hooks.get();
    if (e.ctrlKey || e.metaKey) {
      // A trackpad's pinch arrives as Ctrl and the wheel; Command and the wheel does the same for a mouse.
      e.preventDefault();
      hooks.grab();
      zoomAt(s.zoom * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.01)), e.clientX, e.clientY);
      return;
    }
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const focused = view.ownerDocument.activeElement === view;
    // A sideways swipe turns it wherever the pointer is over it; an up and down wheel only when the view has focus, as the page's scroll comes first.
    if (!horizontal && !focused) return;
    e.preventDefault();
    if (!s.turnable) return;
    hooks.grab();
    if (horizontal || e.shiftKey) hooks.set({ yaw: wrapYaw(s.yaw + (e.deltaX || e.deltaY) * 0.3) }, true);
    // SPX-750: the wheel's direction is the one the designer first had and John accepted (SPX-750); a drag up lifts the front, and the wheel DOWN does, so the package's tilt goes negative on a wheel down (do not flip this sign with the drag's).
    else hooks.set({ tilt: Math.round(clamp(s.tilt + e.deltaY * 0.15, -TILT_MAX, TILT_MAX)) }, true);
  };

  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const s = hooks.get();
    const big = e.shiftKey ? 45 : 15;
    switch (e.key) {
      case "ArrowLeft": if (s.turnable) hooks.set({ yaw: wrapYaw(s.yaw - big) }, true); break;
      case "ArrowRight": if (s.turnable) hooks.set({ yaw: wrapYaw(s.yaw + big) }, true); break;
      // Arrow Up and the wheel up give the package a positive tilt (seen more from above), as before the drag was fixed (SPX-750).
      case "ArrowUp": if (s.turnable) hooks.set({ tilt: clamp(s.tilt - 5, -TILT_MAX, TILT_MAX) }, true); break;
      case "ArrowDown": if (s.turnable) hooks.set({ tilt: clamp(s.tilt + 5, -TILT_MAX, TILT_MAX) }, true); break;
      case "+": case "=": zoomAt(s.zoom * 1.25, pieceMid().x, pieceMid().y); break;
      case "-": case "_": zoomAt(s.zoom / 1.25, pieceMid().x, pieceMid().y); break;
      case "0": case "Home": if (s.turnable) hooks.set({ yaw: 0, tilt: 0, zoom: 1, panX: 0, panY: 0 }, true); else hooks.set({ zoom: 1, panX: 0, panY: 0 }, true); break;
      default: return;
    }
    hooks.grab();
    e.preventDefault();
  };

  view.addEventListener("pointerdown", onDown);
  view.addEventListener("pointermove", onMove);
  view.addEventListener("pointerup", onUp);
  view.addEventListener("pointercancel", onUp);
  view.addEventListener("wheel", onWheel, { passive: false });
  view.addEventListener("keydown", onKey);
  // A right press is a pan, not the browser's menu.
  view.addEventListener("contextmenu", (e) => e.preventDefault());
  return { zoomAt, zoomBy: (f) => { const m = pieceMid(); zoomAt(hooks.get().zoom * f, m.x, m.y); } };
}
