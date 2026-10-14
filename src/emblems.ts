// Where a crest comes from when it is not given as SVG: a renderer the page plugs in, so that this package bundles no art and keeps zero dependencies. The renderer is
// `renderEmblem` of @johnmorrisdotca/dougu-sports/emblems (or any function with its shape); `useEmblems(renderEmblem)` plugs it in for the page, and `emblems: renderEmblem`
// (an option of `renderJersey`, `renderCap`, `renderHelmet` and `renderBanner`) for one drawing.

/** The styles an emblem is drawn in. */
export type EmblemStyleName = "metal" | "line" | "color";

/** What a jersey asks of a renderer: a subset of dougu-sports' `EmblemOptions`. */
export interface EmblemDrawOptions {
  style?: EmblemStyleName;
  tint?: string;
  accent?: string;
  initials?: string;
  theme?: "inherit" | "auto" | "light" | "dark";
  size?: number;
}

/** A function that draws an emblem from its id as a document of SVG, and throws for an id it does not know. */
export type EmblemRenderer = (id: string, options?: EmblemDrawOptions) => string;

let plugged: EmblemRenderer | undefined;

/**
 * Plug a renderer of ready-made emblems in, for every drawing on the page: after this `crest: "crest:shield"` draws that crest. Call it once, at start-up.
 * Without one an id is not a crest and is left out. `useEmblems(undefined)` unplugs it.
 * @example
 * ```ts no-run
 * import { useEmblems } from "@johnmorrisdotca/senshu-jerseys";
 * import { renderEmblem } from "@johnmorrisdotca/dougu-sports/emblems";
 * useEmblems(renderEmblem);
 * ```
 */
export function useEmblems(render: EmblemRenderer | undefined): void {
  plugged = typeof render === "function" ? render : undefined;
}

/** The look of an id: lower-case words, `group:name`, optionally a style. */
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)?(?:\/(?:metal|line|color))?$/;

/** The SVG document a value stands for: itself when it is an SVG document, or the plugged renderer's drawing of it when it is an id. `undefined` otherwise. */
export function crestDocument(value: unknown, render?: EmblemRenderer, tint?: string, accent?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (/^(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(text)) return text;
  const draw = render ?? plugged;
  if (draw === undefined || text.length > 60 || !ID.test(text)) return undefined;
  try {
    const svg: unknown = draw(text, { style: "color", theme: "light", ...(tint === undefined ? {} : { tint }), ...(accent === undefined ? {} : { accent }) });
    return typeof svg === "string" && /^\s*(?:<\?xml|<svg)\b/i.test(svg) ? svg : undefined;
  } catch {
    return undefined;
  }
}

/** An `<image>` that shows a crest. An SVG shown as an image runs no script and loads nothing, whatever it holds. */
export function crestImage(svg: string, x: number, y: number, w: number, h: number): string {
  return `<image href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" x="${Math.round(x * 100) / 100}" y="${Math.round(y * 100) / 100}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
}
