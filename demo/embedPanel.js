// The tabs of the family's embed panel for a jersey. The package writes five ways itself (`embedCode`: the script and tag, an iframe, a module, the SVG and a data address); the framework tabs are the
// shared snippets for the element with the jersey's attributes. Free of imports, so the demo loads it as it is and a test runs it against the package: `api` is `{ embedSnippet, embedCode, attributesFromOptions }`.
export const PACKAGE = "@johnmorrisdotca/senshu-jerseys";

/** The panel's tabs: the family's seven, then the package's SVG and data address. */
export const KINDS = ["html", "module", "react", "vue", "angular", "svelte", "iframe", "svg", "data"];

/** The words for the tabs the family has no word for. */
export const LABELS = { data: "Data URI" };

/** The sizes the panel offers; 200 is the drawing's own width. */
export const SIZES = [160, 200, 320, 480];
export const DEFAULT_SIZE = 200;

const OWN = { html: "element", module: "module", iframe: "iframe", svg: "svg", data: "data" };

/** The package's name for a tab. The framework tabs are the element's, so they answer as `element`. */
export const packageKind = (kind) => OWN[kind] ?? "element";

/** Whether Turnable means something on this tab: where a tag or a frame is written. */
export const canTurn = (kind) => kind === "html" || kind === "iframe" || kind === "react" || kind === "vue" || kind === "angular" || kind === "svelte";

/**
 * The text of one tab.
 *
 * @param {{ embedSnippet: Function, embedCode: Function, attributesFromOptions: Function }} api The package's and the family's functions.
 * @param {string} kind The tab.
 * @param {object} options The jersey as it is set up.
 * @param {{ size?: number, turnable?: boolean, autoplay?: boolean, site?: string }} settings The panel's size, whether it turns, and where the demo is.
 */
export function panelCode(api, kind, options, settings = {}) {
  const sized = settings.size !== undefined && settings.size !== DEFAULT_SIZE && options.size === undefined ? { ...options, size: settings.size } : options;
  const own = OWN[kind];
  const turn = canTurn(kind) ? { turnable: settings.turnable === true, autoplay: settings.autoplay === true } : {};
  const site = settings.site === undefined ? {} : { site: settings.site };
  if (own !== undefined) return api.embedCode(sized, own, { ...turn, ...site });
  const attrs = Object.entries(api.attributesFromOptions(sized));
  if (turn.turnable) attrs.push(["turnable", ""]);
  if (turn.autoplay) attrs.push(["autoplay", ""]);
  return api.embedSnippet(kind, {
    package: PACKAGE,
    cdn: "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys",
    tag: "senshu-jersey",
    element: "define",
    entries: [],
    attrs,
    name: "jersey",
    iframe: { src: "", title: "Jersey", width: 200, height: 232 },
  });
}

/**
 * The drawing as the picture beside the code needs it: the panel scales a picture to its box from the size it is laid out at, so the drawing is given its `width` and `height` attributes as a size (set by script).
 *
 * @param {HTMLElement} holder An element holding the SVG text as markup.
 */
export function pictureOf(holder) {
  const svg = holder.querySelector("svg");
  if (svg !== null) {
    svg.style.width = `${svg.getAttribute("width") ?? "200"}px`;
    svg.style.height = `${svg.getAttribute("height") ?? "232"}px`;
  }
  return holder;
}
