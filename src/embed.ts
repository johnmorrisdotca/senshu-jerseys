// `embedCode`: the text to put a jersey in a page, in each of the four ways: the custom element, an iframe of `embed.html`, a JavaScript module, and the SVG itself or a data address.
import { attributesFromOptions, jerseyToParams } from "./attrs.ts";
import { esc } from "./colour.ts";
import { jerseyBox } from "./jersey.ts";
import { resolve, type JerseyOptions } from "./options.ts";
import { renderJersey } from "./render.ts";

/**
 * The kinds of embed `embedCode` writes.
 *
 * @example
 * ```ts
 * import { EMBED_KINDS } from "@johnmorrisdotca/senshu-jerseys";
 *
 * console.log(EMBED_KINDS.length, EMBED_KINDS[0]);
 * ```
 */
export const EMBED_KINDS = ["element", "iframe", "module", "svg", "data"] as const;
/**
 * The kind of embed.
 *
 * @example
 * ```ts
 * import { EMBED_KINDS, type EmbedKind } from "@johnmorrisdotca/senshu-jerseys";
 *
 * const first: EmbedKind | undefined = EMBED_KINDS[0];
 * console.log(first);
 * ```
 */
export type EmbedKind = (typeof EMBED_KINDS)[number];

/**
 * Where an embed points: the site and the CDN, and whether it can be turned or turns by itself.
 *
 * @example
 * ```ts
 * import { embedCode, type EmbedSettings } from "@johnmorrisdotca/senshu-jerseys";
 *
 * const settings: EmbedSettings = { turnable: true, autoplay: true };
 * console.log(embedCode({ cut: "hockey" }, "iframe", settings));
 * ```
 */
export interface EmbedSettings {
  /** The address of the published demo, where `embed.html` is. */
  site?: string;
  /** The CDN or package path the element is loaded from. */
  cdn?: string;
  /** Add `turnable` (and `autoplay`) to the element. */
  turnable?: boolean;
  autoplay?: boolean;
}

/**
 * The address of the demo site, which hosts the embed page.
 *
 * @example
 * ```ts
 * import { SITE } from "@johnmorrisdotca/senshu-jerseys";
 *
 * console.log(SITE);
 * ```
 */
export const SITE = "https://johnmorrisdotca.github.io/senshu-jerseys/";
/**
 * The CDN address the embed code loads the package from.
 *
 * @example
 * ```ts
 * import { CDN } from "@johnmorrisdotca/senshu-jerseys";
 *
 * console.log(CDN);
 * ```
 */
export const CDN = "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys@0";

const attr = (k: string, v: string): string => `${k}="${esc(v)}"`;

/**
 * The text of one embed for a set of options. The `module` one imports the package; the `data` one is a `data:image/svg+xml` address for an `<img>`.
 *
 * @param o - the jersey options
 * @param kind - `element`, `iframe`, `module`, `svg` or `data`
 * @param s - the site and CDN to name, and whether it can be turned or turns by itself
 * @returns the text to paste into a page
 * @example
 * ```ts
 * import { embedCode } from "@johnmorrisdotca/senshu-jerseys";
 *
 * console.log(embedCode({ cut: "hockey", colors: ["#af1e2d", "#ffffff"], number: 9 }, "iframe", {}));
 * ```
 */
export function embedCode(o: JerseyOptions, kind: EmbedKind = "element", s: EmbedSettings = {}): string {
  const site = s.site ?? SITE;
  const cdn = s.cdn ?? CDN;
  if (kind === "svg") return renderJersey(o);
  if (kind === "data") return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderJersey(o))}`;
  if (kind === "iframe") {
    const q = jerseyToParams(o, s.turnable === true ? { turn: s.autoplay === true ? "auto" : "1" } : {}).toString();
    const both = o.view === "both";
    // The frame is the shape of the cut's box: the body's 200 units and the room its sleeves need (none for most cuts), once for one view and twice for both.
    const room = Math.round((jerseyBox(resolve(o).cut).w - 200) * (both ? 2 : 1) * 10) / 10;
    const width = (both ? 420 : 200) + room;
    return `<iframe\n  ${attr("src", `${site}embed.html?${q}`)}\n  title="Jersey"\n  loading="lazy"\n  style="width:100%;max-width:${both ? width : width + 20}px;aspect-ratio:${width} / 232;border:0"\n></iframe>`;
  }
  if (kind === "module") {
    const body = JSON.stringify(o, null, 2);
    return `import { renderJersey } from "${cdn}/+esm";\n// or, from npm: import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";\n\ndocument.querySelector("#shirt").innerHTML = renderJersey(${body});`;
  }
  const attrs = Object.entries(attributesFromOptions(o)).map(([k, v]) => attr(k, v));
  if (s.turnable === true) attrs.push("turnable");
  if (s.autoplay === true) attrs.push("autoplay");
  return `<script type="module" src="${cdn}/dist/element-define.js"></script>\n\n<senshu-jersey${attrs.length === 0 ? "" : `\n  ${attrs.join("\n  ")}`}\n></senshu-jersey>`;
}
