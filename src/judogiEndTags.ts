// What most belts carry near one end besides embroidery: a woven maker's label (neutral art, never a maker's mark), right under it a small size tag (the size
// number and under it by default three tiny kanji, "made in Japan", which a wearer may change or take off), and under that a small white tag, blank or with
// the wearer's own text; and, a mark of grade, up to ten short bars (grade lines, about 1 cm each). The tags go together as the maker's do: a size tag needs the label
// above it, and the white tag needs the size tag. They are drawn in a hanging end's own frame (x down the end from the knot, y across it from the middle), under
// the embroidery.

import { BELT_SIZE_TAG_LINE } from "./beltSpecs.ts";
import { clean, hexOf, type Rgb } from "./colour.ts";
import { readLabel, woven, type LabelColour, type ReadLabel } from "./judogiLabel.ts";
import { sLogo } from "./judogiBrand.ts";
import { n2 } from "./path.ts";
import { layout } from "./text.ts";
import { satinDefs, satinRun } from "./judogiThread.ts";
import { END_LENGTH } from "./judogiStripes.ts";
import { readThread, type ThreadColour } from "./judogiThread.ts";

/** What a belt's end tags are asked for as. `true` is the usual three on the right end. */
export interface JudogiEndTags {
  /** Which hanging end (the picture's, from the front): `right` by default. */
  end?: "left" | "right";
  /** The woven maker's label (neutral art); false takes the size tag and the white tag off with it. */
  maker?: boolean;
  /** The size on the size tag (the size number), `false` for no size tag (and so no white tag). */
  size?: string | false;
  /** The line under the size, "日本製" by default; a text of your own, or `false` for none. */
  sizeLine?: string | false;
  /** The white tag under the size tag: `true` blank, or your own words; `false` for none. */
  white?: boolean | string;
  /** The label's cloth: one of the label variants (`navy`, `forest`, `black`, `wine`, `cream`) or `#rrggbb`. Black by default, navy on a folded belt. */
  makerColour?: LabelColour | string;
  /** The label's thread: a thread preset or `#rrggbb`; the variant's own by default (silver on a folded belt's navy label). */
  makerThread?: ThreadColour | string;
  /** The thread of the size on the size tag: a thread preset or `#rrggbb`; the label's thread by default (an orange numeral on a folded belt). */
  sizeThread?: ThreadColour | string;
  /** Grade lines: this many short bars (0 to 10) on the same end, in `gradeThread` thread (white by default). */
  gradeLines?: number;
  gradeThread?: ThreadColour | string;
}

export interface ReadEndTags {
  end: 0 | 1;
  maker: boolean;
  size: string | undefined;
  sizeLine: string;
  white: string | undefined;
  gradeLines: number;
  gradeThread: Rgb;
  /** The label and the size numeral as asked for (a folded belt's own defaults when none): the cloth, the thread and the numeral's thread. */
  look: { colour: unknown; thread: unknown; sizeThread: unknown; /** Folded: the lettering runs across the belt, as a shop's labels read, and the tags are the shop's size. */ across: boolean };
}

/** The tags from outside: undefined for none. `size` is the garment's own size number unless the tags give another. */
export function readEndTags(raw: unknown, garmentSize: string, folded = false): ReadEndTags | undefined {
  if (raw === true) return readEndTags({}, garmentSize, folded);
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as JudogiEndTags;
  const maker = o.maker !== false;
  const size = maker && o.size !== false ? (typeof o.size === "string" ? (clean(o.size, 5) ?? garmentSize) : garmentSize) : undefined;
  const sizeLine = o.sizeLine === false ? "" : typeof o.sizeLine === "string" ? (clean(o.sizeLine, 6) ?? "") : BELT_SIZE_TAG_LINE;
  // A folded belt shows what a shop's does at its tip: the maker's label and the size tag, with no white tag unless one is asked for.
  const white = size === undefined || o.white === false || (folded && o.white === undefined) ? undefined : typeof o.white === "string" ? (clean(o.white, 10) ?? "") : "";
  const count = typeof o.gradeLines === "number" && Number.isFinite(o.gradeLines) ? Math.max(0, Math.min(10, Math.round(o.gradeLines))) : 0;
  if (!maker && count === 0) return undefined;
  const look = folded ? { colour: o.makerColour ?? "navy", thread: o.makerThread ?? "silver", sizeThread: o.sizeThread ?? "#e0561b", across: true } : { colour: o.makerColour ?? "black", thread: o.makerThread, sizeThread: o.sizeThread, across: false };
  return { end: o.end === "left" ? 0 : 1, maker, size, sizeLine, white, gradeLines: count, gradeThread: readThread(o.gradeThread, "white").rgb, look };
}

const CM = 2.63;
const BLACK = (): ReadLabel => readLabel({ colour: "black" }) as ReadLabel;
const CREAM = (): ReadLabel => readLabel({ colour: "cream" }) as ReadLabel;

/**
 * The tags and grade lines of one end, in that end's frame. `half` is half the belt's width here. Returns its defs and its body (empty when this end carries none).
 * From the tip upward: a margin, the white tag, the size tag, the maker's label (each a little narrower than the belt), and above the lot the grade lines.
 */
export function endTagsMark(t: ReadEndTags | undefined, end: 0 | 1, half: number, uid: string, margin = 2.2): { defs: string; body: string } {
  if (t === undefined || t.end !== end) return { defs: "", body: "" };
  const l = END_LENGTH[end];
  const room = Math.max(4, 2 * half - 2.2);
  let defs = "";
  let body = "";
  let x = l - margin * CM;
  const across = t.look.across;
  const label = (): ReadLabel => readLabel({ colour: t.look.colour, ...(t.look.thread === undefined ? {} : { thread: t.look.thread }) }) as ReadLabel;
  // A tag is `along` long down the end and `across` the belt, kept inside the belt's width. Tied, its lettering runs down the end as embroidery does; folded, it runs across the
  // belt with the tops of the letters toward the belt's body, as a shop's labels read, so the tag is drawn upright in a box `across` wide and `along` high and turned into place.
  const put = (along: number, acr: number, draw: (id: string, w: number, h: number) => { defs: string; body: string }, id: string): void => {
    const k = Math.min(1, room / acr);
    const ww = along * k;
    const hh = acr * k;
    const out = across ? draw(id, hh, ww) : draw(id, ww, hh);
    defs += out.defs;
    body += across ? `<g transform="translate(${n2(x - ww / 2)} 0) rotate(-90)">${out.body}</g>` : `<g transform="translate(${n2(x - ww / 2)} 0)">${out.body}</g>`;
    x -= ww + (across ? 0.5 : 0.9);
  };
  if (t.maker) {
    // Drawn in order from the tip: the white tag, the size tag, the label.
    const white = t.white;
    if (white !== undefined) {
      put(across ? 3.4 : 4.9, across ? 4.9 : 3.4, (id, w, h) => {
        const base = woven(id, CREAM(), w, h);
        const text = white === "" ? "" : satinRun(layout(white, 0, 0, { height: h * 0.5, maxWidth: w * 0.8, weight: "regular", asText: true }), CREAM().thread, `${id}S`, "system-ui");
        return { defs: base.defs, body: base.under + text + base.over };
      }, `${uid}Tw`);
    }
    if (t.size !== undefined) {
      put(across ? 3.6 : 6.2, across ? 6.4 : 4.7, (id, w, h) => {
        const l = across ? { ...BLACK(), thread: readThread(t.look.sizeThread, "silver").rgb } : BLACK();
        const base = woven(id, l, w, h);
        // Folded: the numeral over the line (the line in the label's thread); tied: the numeral beside it.
        const size = layout(t.size as string, 0, t.sizeLine === "" ? 0 : -h * (across ? 0.12 : 0.16), { height: h * (t.sizeLine === "" ? 0.5 : across ? 0.46 : 0.36), maxWidth: w * 0.7, weight: "bold" });
        let s = base.under + satinRun(size, l.thread, `${id}S`, "system-ui");
        if (t.sizeLine !== "") s += satinRun(layout(t.sizeLine, 0, h * (across ? 0.3 : 0.27), { height: h * (across ? 0.17 : 0.18), maxWidth: w * 0.8, weight: "regular", asText: true }), across ? BLACK().thread : l.thread, across ? `${id}K` : `${id}S`, "'Hiragino Mincho ProN','Yu Mincho',serif");
        return { defs: base.defs + (across ? satinDefs(`${id}K`, BLACK().thread) : ""), body: s + base.over };
      }, `${uid}Ts`);
    }
    put(across ? 8.4 : 9.4, across ? 10.2 : 7.2, (id, w, h) => {
      const l = label();
      const base = woven(id, l, w, h);
      if (!across) {
        const mark = sLogo(l.thread, w * 0.5, h * 0.7, `${id}L`);
        return { defs: base.defs + mark.defs, body: base.under + mark.body + base.over };
      }
      // The Senshu S over the name and the fibre line (綿 100%: cotton 100 percent), as the maker's label reads: mark, name, content.
      const mark = sLogo(l.thread, h * 0.5, h * 0.5, `${id}L`);
      const name = satinRun(layout("SENSHU", 0, h * 0.2, { height: h * 0.15, maxWidth: w * 0.78, weight: "bold" }), l.thread, `${id}S`, "system-ui");
      const fibre = satinRun(layout("綿 100%", 0, h * 0.37, { height: h * 0.12, maxWidth: w * 0.6, weight: "regular", asText: true }), l.thread, `${id}S`, "'Hiragino Mincho ProN','Yu Mincho',serif");
      return { defs: base.defs + mark.defs, body: base.under + `<g transform="translate(0 ${n2(-h * 0.2)})">${mark.body}</g>` + name + fibre + base.over };
    }, `${uid}Tm`);
  }
  if (t.gradeLines > 0) {
    // Short bars across the belt, each about 1 cm, a hair apart, above the tags.
    const bw = Math.min(CM, room);
    const step = 0.66 + 0.5;
    const rgb = hexOf(t.gradeThread);
    x -= 1.2;
    for (let k = 0; k < t.gradeLines; k++) {
      body += `<rect x="${n2(x - 0.33 - k * step)}" y="${n2(-bw / 2)}" width="0.66" height="${n2(bw)}" fill="${rgb}" stroke="#000" stroke-opacity="0.35" stroke-width="0.12" rx="0.2"/>`;
    }
  }
  return { defs, body };
}
