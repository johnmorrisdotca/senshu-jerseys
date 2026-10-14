// Turning: the jersey as a thin piece of cloth that turns about its vertical axis. The front foreshortens as it turns, to an edge at 90 degrees where the cloth's thickness
// shows (at the shoulders and the hem and down the sides), and the back, with its name and number, shows from 90 to 270 degrees. 2.5D: flat drawings on a turning plane,
// each a string of SVG. `jerseyFrame` is one angle; `bindTurn` is the pointer, the keys and the automatic turn, in a container.
import { hexOf, shade } from "./colour.ts";
import { JERSEY_HEIGHT, JERSEY_WIDTH, jerseyView, uidOf } from "./jersey.ts";
import { resolve, type JerseyOptions } from "./options.ts";
import { titleOf } from "./title.ts";
import type { EmblemRenderer } from "./emblems.ts";
import { esc } from "./colour.ts";
import { n2 } from "./path.ts";

export interface TurnOptions extends JerseyOptions {
  /** The turn about the vertical axis in degrees: 0 the front, 90 the edge, 180 the back. Any number; it is taken round. */
  yaw?: number;
  /** How thick the cloth shows at the edge, in drawing units (0 to 40; 14 by default). */
  thickness?: number;
  emblems?: EmblemRenderer;
}

const SLICES = 6;

/** A turn taken into -180 up to 180; anything that is not a number is 0. */
export function normalYaw(yaw: unknown): number {
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return 0;
  const t = ((((yaw + 180) % 360) + 360) % 360) - 180;
  return Object.is(t, -0) ? 0 : t;
}

/** What one angle looks like: which face shows, each face's matrix, how dark the foreshortened face is, and the matrix of each slice of the edge. */
export interface TurnState {
  yaw: number;
  front: { visible: boolean; matrix: string; shade: number };
  back: { visible: boolean; matrix: string; shade: number };
  slices: string[];
}

export function turnState(yawDeg: unknown, thickness = 14): TurnState {
  const yaw = normalYaw(yawDeg);
  const t = Math.max(0, Math.min(40, Number.isFinite(thickness) ? thickness : 14));
  const rad = (yaw * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const cx = JERSEY_WIDTH / 2;
  const m = (a: number, e: number): string => `matrix(${n2(a)} 0 0 1 ${n2(e)} 0)`;
  const shadeOf = (v: number): number => Math.round(Math.min(0.42, 0.42 * (1 - Math.abs(v))) * 100) / 100;
  const slices: string[] = [];
  for (let i = 0; i < SLICES; i++) {
    const z = (-0.5 + i / (SLICES - 1)) * t;
    slices.push(m(c, cx - cx * c + s * z));
  }
  return {
    yaw,
    front: { visible: c > 0.0005, matrix: m(c, cx - cx * c + (s * t) / 2), shade: shadeOf(c) },
    back: { visible: c < -0.0005, matrix: m(-c, cx + cx * c - (s * t) / 2), shade: shadeOf(c) },
    slices,
  };
}

/** The jersey at one angle as an SVG document. */
export function jerseyFrame(options?: TurnOptions): string {
  const o: TurnOptions = options !== null && typeof options === "object" ? options : {};
  const base = { ...o, view: "front" as const };
  const rf = resolve(base);
  const rb = resolve({ ...o, view: "back" });
  const front = jerseyView(rf, "front", uidOf(rf, "tf"), o.emblems);
  const back = jerseyView(rb, "back", uidOf(rb, "tb"), o.emblems);
  const st = turnState(o.yaw, o.thickness);
  const edge = hexOf(shade(rf.body, -0.38));
  const edgeLit = hexOf(shade(rf.body, -0.22));
  const line = rf.look === "line";
  let slices = "";
  st.slices.forEach((matrix, i) => {
    slices += `<use href="#${front.outlineId}" data-turn="slice" fill="${line ? "none" : i % 2 === 0 ? edge : edgeLit}" ${line ? 'stroke="currentColor" stroke-width="3" ' : ""}transform="${matrix}"/>`;
  });
  const face = (which: "front" | "back", v: typeof front, s: TurnState["front"]): string =>
    `<g data-turn="${which}" transform="${s.matrix}"${s.visible ? "" : ' display="none"'}>${v.body}<use href="#${v.outlineId}" data-turn="${which}-shade" fill="#000" fill-opacity="${s.shade}" stroke="none"/></g>`;
  const w = rf.size;
  const h = Math.round(((w * JERSEY_HEIGHT) / JERSEY_WIDTH) * 100) / 100;
  const id = uidOf(rf, "turn");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${JERSEY_WIDTH} ${JERSEY_HEIGHT}" width="${w}" height="${h}" role="img" aria-labelledby="${id}T" data-yaw="${n2(st.yaw)}"><title id="${id}T">${esc(titleOf(rf))}</title><defs>${front.defs}${back.defs}</defs><g data-turn="edge">${slices}</g>${face("front", front, st.front)}${face("back", back, st.back)}</svg>`;
}

/** Move an SVG made by `jerseyFrame` to an angle without redrawing it: only the transforms change. */
export function applyTurn(svg: Element, yawDeg: unknown, thickness = 14): number {
  const st = turnState(yawDeg, thickness);
  svg.setAttribute("data-yaw", n2(st.yaw));
  const slices = svg.querySelectorAll('[data-turn="slice"]');
  slices.forEach((el, i) => el.setAttribute("transform", st.slices[i] ?? ""));
  for (const which of ["front", "back"] as const) {
    const g = svg.querySelector(`[data-turn="${which}"]`);
    const s = st[which];
    if (g === null) continue;
    g.setAttribute("transform", s.matrix);
    if (s.visible) g.removeAttribute("display");
    else g.setAttribute("display", "none");
    svg.querySelector(`[data-turn="${which}-shade"]`)?.setAttribute("fill-opacity", String(s.shade));
  }
  return st.yaw;
}

export interface TurnSettings {
  /** The angle to start at. */
  yaw?: number;
  /** Begin turning by itself (not under `prefers-reduced-motion`, unless `force`). */
  autoPlay?: boolean;
  /** Degrees a second while it turns by itself (40 by default). */
  speed?: number;
  /** Turn by itself even where the reader prefers reduced motion. */
  force?: boolean;
  /** Called with the angle after each change. */
  onChange?: (yaw: number) => void;
  /** Called with whether it is turning by itself, each time that changes (a key, a button or a call). */
  onPlay?: (playing: boolean) => void;
}

export interface TurnHandle {
  yaw(): number;
  setYaw(yaw: number): void;
  playing(): boolean;
  play(): void;
  pause(): void;
  togglePlay(): void;
  /** Draw again with new options, keeping the angle. */
  update(options: TurnOptions): void;
  destroy(): void;
}

/**
 * A jersey you can turn, in a container: drag it, press the left and right arrows (15 degrees; Shift for 45), Home to face the front, Space to start and stop it, or turn it by
 * itself. It does nothing while nobody has asked: no timer runs while it is still, it stops when the tab is hidden, and it starts still under `prefers-reduced-motion`.
 */
export function bindTurn(container: HTMLElement, options?: TurnOptions, settings: TurnSettings = {}): TurnHandle {
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  let opts: TurnOptions = { ...options };
  let yaw = normalYaw(settings.yaw ?? opts.yaw ?? 0);
  const speed = typeof settings.speed === "number" && Number.isFinite(settings.speed) ? settings.speed : 40;
  let svg: Element | null = null;
  let alive = true;
  let want = false;
  let frame = 0;
  let last = 0;
  let dragging = false;
  let from = { x: 0, yaw: 0 };
  const reduced = (): boolean => win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  const draw = (): void => {
    container.innerHTML = jerseyFrame({ ...opts, yaw });
    svg = container.querySelector("svg");
  };
  const show = (next: number): void => {
    yaw = normalYaw(next);
    if (svg !== null) applyTurn(svg, yaw, opts.thickness);
    settings.onChange?.(yaw);
  };
  const running = (): boolean => frame !== 0;
  const stopLoop = (): void => {
    if (frame !== 0) win?.cancelAnimationFrame(frame);
    frame = 0;
  };
  const tick = (now: number): void => {
    frame = 0;
    if (!alive || !want || dragging || doc.hidden) return;
    // The time since the last frame, clamped, so that a tab that was away does not jump.
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    show(yaw + speed * dt);
    frame = win?.requestAnimationFrame(tick) ?? 0;
  };
  const start = (): void => {
    if (!alive || !want || dragging || doc.hidden || running() || win === null) return;
    last = win.performance.now();
    frame = win.requestAnimationFrame(tick);
  };

  draw();
  container.setAttribute("tabindex", "0");
  container.setAttribute("role", "group");
  container.setAttribute("aria-roledescription", "turntable");
  container.setAttribute("aria-label", titleOf(resolve(opts)));
  container.style.touchAction = "pan-y";
  container.style.cursor = "grab";
  container.style.userSelect = "none";

  const onDown = (e: PointerEvent): void => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    from = { x: e.clientX, yaw };
    stopLoop();
    try {
      container.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer that is already gone */
    }
    container.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const width = container.clientWidth || JERSEY_WIDTH;
    // A drag across the container's width is a half turn.
    show(from.yaw + ((e.clientX - from.x) / width) * 180);
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    container.style.cursor = "grab";
    start();
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const big = e.shiftKey ? 45 : 15;
    switch (e.key) {
      case "ArrowLeft": show(yaw - big); break;
      case "ArrowRight": show(yaw + big); break;
      case "Home": show(0); break;
      case " ":
      case "Spacebar": handle.togglePlay(); break;
      default: return;
    }
    e.preventDefault();
  };
  const onVisible = (): void => {
    if (doc.hidden) stopLoop();
    else start();
  };
  container.addEventListener("pointerdown", onDown);
  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerup", onUp);
  container.addEventListener("pointercancel", onUp);
  container.addEventListener("keydown", onKey);
  doc.addEventListener("visibilitychange", onVisible);

  const handle: TurnHandle = {
    yaw: () => yaw,
    setYaw: (next) => show(next),
    playing: () => want,
    play() {
      const was = want;
      want = true;
      start();
      if (!was) settings.onPlay?.(true);
    },
    pause() {
      const was = want;
      want = false;
      stopLoop();
      if (was) settings.onPlay?.(false);
    },
    togglePlay() {
      if (want) handle.pause();
      else handle.play();
    },
    update(next) {
      if (!alive) return;
      opts = { ...next };
      draw();
      container.setAttribute("aria-label", titleOf(resolve(opts)));
    },
    destroy() {
      if (!alive) return;
      alive = false;
      want = false;
      stopLoop();
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      container.removeEventListener("keydown", onKey);
      doc.removeEventListener("visibilitychange", onVisible);
      container.replaceChildren();
    },
  };
  if (settings.autoPlay === true && (settings.force === true || !reduced())) handle.play();
  return handle;
}
