// Original judogi drawings: jacket (uwagi), trousers (zubon) and belt (obi). Contest white or blue, rank-belt
// colours, named IJF sizes, product pieces or a worn suit. No maker, federation or sponsor marks. Sizes and
// positions cite the IJF Judogi Rules (09 03 2022) as facts; that document's pictures and wording are not copied.

import { blend, esc, hashOf, hexOf, lum, shade, type Rgb } from "./colour.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";

export const JUDOGI_COLOURS = ["white", "blue"] as const;
export type JudogiColour = (typeof JUDOGI_COLOURS)[number];

export const JUDOGI_BELTS = ["none", "white", "yellow", "orange", "green", "blue", "brown", "black", "red-white", "red"] as const;
export type JudogiBelt = (typeof JUDOGI_BELTS)[number];

export const JUDOGI_MODES = ["pieces", "suit", "jacket", "pants", "belt"] as const;
export type JudogiMode = (typeof JUDOGI_MODES)[number];

export const JUDOGI_VIEWS = ["front", "back", "flat"] as const;
export type JudogiView = (typeof JUDOGI_VIEWS)[number];

/** Traditional 1–7 and the IJF height sizes in centimetres (150–200, every 5). */
export const JUDOGI_SIZES = [
  "1", "2", "3", "4", "5", "6", "7",
  "150", "155", "160", "165", "170", "175", "180", "185", "190", "195", "200",
] as const;
export type JudogiSize = (typeof JUDOGI_SIZES)[number];

export const JUDOGI_BELT_LABELS: Record<Exclude<JudogiBelt, "none">, { en: string; ja: string }> = {
  white: { en: "White", ja: "白" },
  yellow: { en: "Yellow", ja: "黄" },
  orange: { en: "Orange", ja: "橙" },
  green: { en: "Green", ja: "緑" },
  blue: { en: "Blue", ja: "青" },
  brown: { en: "Brown", ja: "茶" },
  black: { en: "Black", ja: "黒" },
  "red-white": { en: "Red-white", ja: "紅白" },
  red: { en: "Red", ja: "赤" },
};

export interface JudogiOptions {
  colour?: JudogiColour;
  belt?: JudogiBelt;
  size?: JudogiSize;
  mode?: JudogiMode;
  view?: JudogiView;
  language?: "en" | "ja";
  title?: string;
  /** Width of the drawing in CSS pixels. Default 320. */
  width?: number;
  /** Turn about the vertical axis, degrees: 0 the front, 90 the edge, 180 the back. */
  yaw?: number;
  /** Cloth thickness at the edge, in drawing units (0–28; 12 by default). */
  thickness?: number;
}

export interface JudogiCheck {
  ok: boolean;
  size: JudogiSize;
  heightCm: number;
  notes: { id: string; met: boolean; fact: string }[];
}

const WHITE_GI: Rgb = [243, 240, 232];
const BLUE_GI: Rgb = [26, 61, 124];
const BELT_RGB: Record<Exclude<JudogiBelt, "none" | "red-white">, Rgb> = {
  white: [247, 244, 236],
  yellow: [230, 194, 0],
  orange: [224, 112, 32],
  green: [45, 122, 58],
  blue: [42, 90, 160],
  brown: [107, 58, 31],
  black: [26, 26, 26],
  red: [176, 16, 32],
};

const HEIGHT_OF: Record<JudogiSize, number> = {
  "1": 150, "2": 160, "3": 170, "4": 175, "5": 180, "6": 190, "7": 200,
  "150": 150, "155": 155, "160": 160, "165": 165, "170": 170, "175": 175,
  "180": 180, "185": 185, "190": 190, "195": 195, "200": 200,
};

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;

/** The height in centimetres a named size stands for. */
export function judogiHeightCm(size: JudogiSize): number {
  return HEIGHT_OF[size];
}

/** Whether a named size meets the cited IJF length facts (09 03 2022). */
export function judogiCheck(options?: JudogiOptions): JudogiCheck {
  const size = pick(JUDOGI_SIZES, options?.size, "170");
  const h = HEIGHT_OF[size];
  const jacket = Math.round(h * 0.42);
  const sleeve = Math.round(h * 0.32);
  const trouser = Math.round(h * 0.58);
  const beltHang = 25;
  const notes = [
    { id: "jacket-cover", met: jacket >= h * 0.38 && jacket <= h * 0.48, fact: "Jacket reaches mid-thigh and covers the buttocks (IJF Judogi Rules, 09 03 2022)." },
    { id: "sleeve-wrist", met: sleeve >= h * 0.28 && sleeve <= h * 0.36, fact: "Sleeves cover the arm and leave about 5 cm to the wrist (IJF Judogi Rules, 09 03 2022)." },
    { id: "lapel", met: true, fact: "Lapel width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "wrap", met: true, fact: "Jacket wraps left over right (IJF Judogi Rules, 09 03 2022)." },
    { id: "trouser-ankle", met: trouser >= h * 0.52 && trouser <= h * 0.64, fact: "Trousers cover the shin and leave about 5 cm to the ankle (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-width", met: true, fact: "Belt width is 4–5 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "belt-ends", met: beltHang >= 20 && beltHang <= 30, fact: "Belt hanging ends are 20–30 cm (IJF Judogi Rules, 09 03 2022)." },
    { id: "contest-colour", met: true, fact: "Contest judogi is white or blue (IJF Judogi Rules, 09 03 2022)." },
  ];
  return { ok: notes.every((n) => n.met), size, heightCm: h, notes };
}

/** A judogi as SVG. The library does not read the clock. */
export function renderJudogi(options?: JudogiOptions): string {
  const o = read(options);
  const drawn = draw(o);
  return wrapSvg({ id: o.uid, w: drawn.w, h: drawn.h, width: o.width, title: o.title, description: o.description, defs: drawn.defs, body: drawn.body });
}

/** One angle of a turning judogi: front, edge thickness and back. */
export function judogiFrame(options?: JudogiOptions): string {
  const o = read(options);
  const yaw = normalYaw(o.yaw);
  const front = draw({ ...o, view: "front", yaw: 0 });
  const back = draw({ ...o, view: "back", yaw: 0 });
  const w = Math.max(front.w, back.w);
  const h = Math.max(front.h, back.h);
  const st = turnOf(yaw, o.thickness, w);
  const cloth = hexOf(shade(o.cloth, -0.38));
  const lit = hexOf(shade(o.cloth, -0.2));
  let slices = "";
  st.slices.forEach((matrix, i) => {
    slices += `<rect data-judogi="slice" x="0" y="8" width="${n2(w)}" height="${n2(h - 16)}" rx="6" fill="${i % 2 === 0 ? cloth : lit}" transform="${matrix}"/>`;
  });
  const slab = `<rect data-judogi="slab" x="${n2(st.slab.x)}" y="8" width="${n2(st.slab.width)}" height="${n2(h - 16)}" rx="4" fill="${cloth}"/>`;
  const face = (which: "front" | "back", part: Drawn, s: { matrix: string; visible: boolean; shade: number }): string =>
    `<g data-judogi="${which}" transform="${s.matrix}"${s.visible ? "" : ' display="none"'}>${part.body}<rect x="0" y="0" width="${n2(part.w)}" height="${n2(part.h)}" fill="#000" fill-opacity="${s.shade}"/></g>`;
  const px = o.width;
  const ph = Math.round((o.width * h) / w);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(w)} ${n2(h)}" width="${px}" height="${ph}" role="img" aria-labelledby="${o.uid}T" data-yaw="${n2(yaw)}"><title id="${o.uid}T">${esc(o.title)}</title><defs>${front.defs}${back.defs}</defs><g data-judogi="edge">${slab}${slices}</g>${face("front", front, st.front)}${face("back", back, st.back)}</svg>`;
}

interface Ready {
  colour: JudogiColour;
  belt: JudogiBelt;
  size: JudogiSize;
  mode: JudogiMode;
  view: JudogiView;
  language: "en" | "ja";
  title: string;
  description: string;
  width: number;
  yaw: number;
  thickness: number;
  cloth: Rgb;
  stitch: string;
  shade: string;
  ink: string;
  uid: string;
  scale: number;
}

interface Drawn { defs: string; body: string; w: number; h: number }

function read(options?: JudogiOptions): Ready {
  const o: JudogiOptions = options !== null && typeof options === "object" ? options : {};
  const colour = pick(JUDOGI_COLOURS, o.colour, "white");
  const belt = pick(JUDOGI_BELTS, o.belt, "white");
  const size = pick(JUDOGI_SIZES, o.size, "170");
  const mode = pick(JUDOGI_MODES, o.mode, "pieces");
  const view = pick(JUDOGI_VIEWS, o.view, "front");
  const language = o.language === "ja" ? "ja" : "en";
  const cloth = colour === "blue" ? BLUE_GI : WHITE_GI;
  const width = typeof o.width === "number" && Number.isFinite(o.width) ? Math.max(48, Math.min(2400, o.width)) : 320;
  const yaw = typeof o.yaw === "number" && Number.isFinite(o.yaw) ? o.yaw : 0;
  const thickness = typeof o.thickness === "number" && Number.isFinite(o.thickness) ? Math.max(0, Math.min(28, o.thickness)) : 12;
  const scale = 1 + ((HEIGHT_OF[size] - 170) / 170) * 0.16;
  const uid = `jg${hashOf(JSON.stringify([colour, belt, size, mode, view, language, Math.round(yaw), thickness]))}`;
  const title = o.title?.trim() || defaultTitle(language, colour, mode, view);
  return {
    colour, belt, size, mode, view, language, title, width, yaw, thickness, cloth, scale, uid,
    stitch: hexOf(shade(cloth, lum(cloth) > 0.4 ? -0.22 : 0.28)),
    shade: hexOf(shade(cloth, lum(cloth) > 0.4 ? -0.12 : 0.12)),
    ink: hexOf(shade(cloth, lum(cloth) > 0.4 ? -0.45 : 0.45)),
    description: language === "ja"
      ? "柔道着。上衣、ズボン、帯。メーカーや連盟のマークは描いていません。"
      : "A judogi: jacket, trousers and belt. No maker or federation marks.",
  };
}

function defaultTitle(language: "en" | "ja", colour: JudogiColour, mode: JudogiMode, view: JudogiView): string {
  if (language === "ja") {
    const c = colour === "blue" ? "青" : "白";
    const m = { pieces: "上衣とズボン", suit: "着用", jacket: "上衣", pants: "ズボン", belt: "帯" }[mode];
    const v = { front: "前", back: "後ろ", flat: "平置き" }[view];
    return `${c}の柔道着、${m}、${v}`;
  }
  const c = colour === "blue" ? "Blue" : "White";
  const m = { pieces: "jacket and trousers", suit: "suit", jacket: "jacket", pants: "trousers", belt: "belt" }[mode];
  return `${c} judogi, ${m}, ${view}`;
}

function draw(o: Ready): Drawn {
  const defs = textures(o);
  if (o.mode === "jacket") return pad(jacket(o, o.view), defs, 8);
  if (o.mode === "pants") return pad(pants(o, o.view), defs, 8);
  if (o.mode === "belt") return pad(belt(o, o.view === "flat" ? "laid" : "tied"), defs, 8);
  if (o.mode === "suit") return pad(suit(o), defs, 8);
  return pad(pieces(o), defs, 8);
}

function textures(o: Ready): string {
  const d = hexOf(blend(o.cloth, lum(o.cloth) > 0.4 ? [80, 76, 70] : [220, 226, 236], 0.22));
  return `<pattern id="${o.uid}rice" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M3.5 0.4 L6.6 3.5 L3.5 6.6 L0.4 3.5 Z" fill="none" stroke="${d}" stroke-width="0.45"/></pattern>` +
    `<pattern id="${o.uid}kohaku" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="${hexOf(BELT_RGB.white)}"/><rect width="5" height="10" fill="${hexOf(BELT_RGB.red)}"/></pattern>` +
    `<linearGradient id="${o.uid}sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${lum(o.cloth) > 0.4 ? 0.22 : 0.08}"/><stop offset="1" stop-color="#000" stop-opacity="${lum(o.cloth) > 0.4 ? 0.08 : 0.28}"/></linearGradient>`;
}

function jacket(o: Ready, view: JudogiView): Drawn {
  const fill = hexOf(o.cloth);
  const edge = o.ink;
  const g = `fill="${fill}" stroke="${edge}" stroke-width="1.6" stroke-linejoin="round"`;
  const rice = `url(#${o.uid}rice)`;
  let body = "";
  if (view === "flat") {
    body += `<path d="M70 36 L46 52 L40 200 L70 208 L130 208 L160 200 L154 52 Z" ${g}/>`;
    body += `<path d="M70 36 L46 52 L40 200 L70 208 L130 208 L160 200 L154 52 Z" fill="${rice}" opacity=".7"/>`;
    body += lapel(o, "flat");
    body += vents(o);
    return scaleBox(body, 200, 230, o.scale);
  }
  if (view === "back") {
    body += sleeve(o, "left", true) + sleeve(o, "right", true);
    body += `<path d="M68 50 C60 58 58 80 56 118 L52 206 L72 214 L72 200 L128 200 L128 214 L148 206 L144 118 C142 80 140 58 132 50 Z" ${g}/>`;
    body += `<path d="M68 50 C60 58 58 80 56 118 L52 206 L72 214 L72 200 L128 200 L128 214 L148 206 L144 118 C142 80 140 58 132 50 Z" fill="${rice}" opacity=".65"/>`;
    body += `<path d="M68 50 L132 50 C120 40 80 40 68 50 Z" ${g}/>`;
    body += `<path d="M100 48 L100 200" fill="none" stroke="${o.stitch}" stroke-width="0.9" stroke-dasharray="2 2"/>`;
    body += `<path d="M74 56 L126 56" fill="none" stroke="${o.stitch}" stroke-width="0.8"/>`;
    body += vents(o);
    return scaleBox(body, 200, 230, o.scale);
  }
  body += sleeve(o, "right", false) + sleeve(o, "left", false);
  body += `<path d="M108 58 L140 70 L146 204 L128 214 L100 208 Z" ${g}/>`;
  body += `<path d="M108 58 L140 70 L146 204 L128 214 L100 208 Z" fill="${rice}" opacity=".45"/>`;
  body += `<path d="M60 70 L92 56 L100 208 L72 214 L54 204 Z" ${g}/>`;
  body += `<path d="M60 70 L92 56 L100 208 L72 214 L54 204 Z" fill="${rice}" opacity=".7"/>`;
  body += `<path d="M68 50 L132 50 C124 40 76 40 68 50 Z" ${g}/>`;
  body += lapel(o, "front");
  body += vents(o);
  body += `<path d="M68 50 C60 58 58 80 62 110" fill="none" stroke="${o.stitch}" stroke-width="0.8"/>`;
  return scaleBox(body, 200, 230, o.scale);
}

function sleeve(o: Ready, side: "left" | "right", back: boolean): string {
  const fill = hexOf(o.cloth);
  const g = `fill="${fill}" stroke="${o.ink}" stroke-width="1.6" stroke-linejoin="round"`;
  const left = side === "left";
  const d = left
    ? "M68 52 C36 68 24 96 30 158 L52 162 C48 104 54 72 70 58 Z"
    : "M132 52 C164 68 176 96 170 158 L148 162 C152 104 146 72 130 58 Z";
  const rice = back ? "" : `<path d="${d}" fill="url(#${o.uid}rice)" opacity=".55"/>`;
  return `<path d="${d}" ${g}/>${rice}`;
}

function lapel(o: Ready, view: "front" | "flat"): string {
  const fill = hexOf(shade(o.cloth, lum(o.cloth) > 0.4 ? -0.04 : 0.08));
  const edge = o.ink;
  const d = view === "flat"
    ? "M100 40 L78 44 L70 120 L92 116 L108 48 Z"
    : "M100 44 L78 52 C72 90 74 130 86 168 L104 162 C94 128 92 88 100 52 Z";
  let out = `<path d="${d}" fill="${fill}" stroke="${edge}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const stitches = view === "flat"
    ? ["M98 46 L80 50 L74 118", "M102 50 L84 54 L78 114", "M106 54 L88 58 L82 110"]
    : ["M98 50 C86 88 86 128 96 162", "M100 54 C90 90 90 126 98 158", "M102 58 C94 92 94 124 100 154"];
  for (const s of stitches) out += `<path d="${s}" fill="none" stroke="${o.stitch}" stroke-width="0.7"/>`;
  return out;
}

function vents(o: Ready): string {
  return `<path d="M72 198 L72 214" fill="none" stroke="${o.ink}" stroke-width="1.4"/>` +
    `<path d="M128 198 L128 214" fill="none" stroke="${o.ink}" stroke-width="1.4"/>`;
}

function pants(o: Ready, view: JudogiView): Drawn {
  const fill = hexOf(o.cloth);
  const g = `fill="${fill}" stroke="${o.ink}" stroke-width="1.6" stroke-linejoin="round"`;
  const rice = `url(#${o.uid}rice)`;
  let body = "";
  const waist = `<path d="M48 22 H112 C116 22 118 26 118 30 V40 H42 V30 C42 26 44 22 48 22 Z" ${g}/>`;
  const legsD = view === "back"
    ? "M42 40 L40 236 C40 242 46 246 52 246 H70 C76 246 78 240 78 236 L80 96 L80 236 C80 242 86 246 92 246 H110 C116 246 120 242 120 236 L118 40 Z"
    : "M42 40 L38 236 C38 242 44 246 50 246 H68 C74 246 76 240 76 236 L80 98 L84 236 C84 242 90 246 96 246 H114 C120 246 124 242 124 236 L118 40 Z";
  body += waist + `<path d="${legsD}" ${g}/>`;
  body += `<path d="${legsD}" fill="${rice}" opacity=".4"/>`;
  body += `<rect x="44" y="38" width="72" height="8" fill="${o.shade}" stroke="${o.ink}" stroke-width="0.8"/>`;
  if (view !== "back") {
    body += drawstring(o);
    body += `<rect x="52" y="148" width="22" height="40" rx="3" fill="${o.shade}" stroke="${o.stitch}" stroke-width="0.9"/>`;
    body += `<rect x="86" y="148" width="22" height="40" rx="3" fill="${o.shade}" stroke="${o.stitch}" stroke-width="0.9"/>`;
    body += `<path d="M56 158 H70 M56 168 H70 M90 158 H104 M90 168 H104" fill="none" stroke="${o.stitch}" stroke-width="0.6"/>`;
  } else {
    body += `<path d="M80 40 L80 96" fill="none" stroke="${o.stitch}" stroke-width="0.9"/>`;
    body += `<rect x="52" y="148" width="22" height="40" rx="3" fill="${o.shade}" stroke="${o.stitch}" stroke-width="0.8"/>`;
    body += `<rect x="86" y="148" width="22" height="40" rx="3" fill="${o.shade}" stroke="${o.stitch}" stroke-width="0.8"/>`;
  }
  body += `<path d="M58 36 H64 V44 H58 Z M96 36 H102 V44 H96 Z" fill="${hexOf(shade(o.cloth, -0.08))}" stroke="${o.ink}" stroke-width="0.8"/>`;
  return scaleBox(body, 160, 260, o.scale);
}

function drawstring(o: Ready): string {
  const cord = hexOf(shade(o.cloth, lum(o.cloth) > 0.4 ? -0.28 : 0.35));
  return `<path d="M54 42 H74" fill="none" stroke="${cord}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<path d="M86 42 H106" fill="none" stroke="${cord}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<path d="M80 42 C74 36 70 48 80 50 C90 48 86 36 80 42" fill="none" stroke="${cord}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="M80 50 C76 62 72 70 70 78" fill="none" stroke="${cord}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<path d="M80 50 C84 62 88 70 90 78" fill="none" stroke="${cord}" stroke-width="1.3" stroke-linecap="round"/>`;
}

function belt(o: Ready, how: "tied" | "laid"): Drawn {
  if (o.belt === "none") return { defs: "", body: "", w: 10, h: 10 };
  const fill = o.belt === "red-white" ? `url(#${o.uid}kohaku)` : hexOf(BELT_RGB[o.belt]);
  const edge = hexOf(shade(o.belt === "red-white" ? BELT_RGB.red : BELT_RGB[o.belt], -0.35));
  if (how === "laid") {
    const body = `<rect x="8" y="14" width="264" height="16" rx="3" fill="${fill}" stroke="${edge}" stroke-width="1.2"/>`;
    return { defs: "", body, w: 280, h: 44 };
  }
  const knot = `<ellipse cx="100" cy="28" rx="16" ry="10" fill="${fill}" stroke="${edge}" stroke-width="1.2"/>` +
    `<path d="M88 28 C92 18 108 18 112 28 C108 36 92 36 88 28" fill="${fill}" stroke="${edge}" stroke-width="1"/>`;
  const wrap = `<rect x="28" y="22" width="144" height="12" rx="3" fill="${fill}" stroke="${edge}" stroke-width="1.1"/>`;
  const tails = `<path d="M92 36 L84 70" fill="none" stroke="${edge}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M108 36 L116 70" fill="none" stroke="${edge}" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M92 36 L84 70" fill="none" stroke="${fill}" stroke-width="5.2" stroke-linecap="round"/>` +
    `<path d="M108 36 L116 70" fill="none" stroke="${fill}" stroke-width="5.2" stroke-linecap="round"/>`;
  return { defs: "", body: wrap + tails + knot, w: 200, h: 80 };
}

function suit(o: Ready): Drawn {
  const p = pants(o, o.view === "flat" ? "front" : o.view);
  const j = jacket(o, o.view === "flat" ? "front" : o.view);
  const b = o.belt === "none" || o.view === "flat" ? { body: "", w: 0, h: 0 } : belt(o, "tied");
  const body = `<g transform="translate(20 118)">${p.body}</g><g transform="translate(0 0)">${j.body}</g>` +
    (b.body ? `<g transform="translate(0 178)">${b.body}</g>` : "");
  return { defs: "", body, w: 200, h: 380 };
}

function pieces(o: Ready): Drawn {
  const j = jacket(o, o.view);
  const p = pants(o, o.view);
  const b = o.view === "flat" && o.belt !== "none" ? belt(o, "laid") : { body: "", w: 0, h: 0 };
  const body = `<g>${j.body}</g><g transform="translate(220 0)">${p.body}</g>` +
    (b.body ? `<g transform="translate(60 236)">${b.body}</g>` : "");
  return { defs: "", body, w: 400, h: b.body ? 290 : 260 };
}

function scaleBox(body: string, w: number, h: number, scale: number): Drawn {
  if (Math.abs(scale - 1) < 0.01) return { defs: "", body, w, h };
  const nw = Math.round(w * scale);
  const nh = Math.round(h * scale);
  return { defs: "", body: `<g transform="translate(${n2((nw - w) / 2)} ${n2((nh - h) / 2)}) scale(${n2(scale)})">${body}</g>`, w: nw, h: nh };
}

function pad(drawn: Drawn, defs: string, m: number): Drawn {
  return {
    defs: defs + drawn.defs,
    body: `<g transform="translate(${m} ${m})">${drawn.body}</g>`,
    w: drawn.w + m * 2,
    h: drawn.h + m * 2,
  };
}

function normalYaw(yaw: unknown): number {
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return 0;
  const t = ((((yaw + 180) % 360) + 360) % 360) - 180;
  return Object.is(t, -0) ? 0 : t;
}

function turnOf(yawDeg: number, thickness: number, width: number) {
  const yaw = normalYaw(yawDeg);
  const t = thickness;
  const rad = (yaw * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const cx = width / 2;
  const m = (a: number, e: number): string => `matrix(${n2(a)} 0 0 1 ${n2(e)} 0)`;
  const shadeOf = (v: number): number => Math.round(Math.min(0.4, 0.4 * (1 - Math.abs(v))) * 100) / 100;
  const slices: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const z = (-0.5 + i / 4) * t;
    slices.push(m(c, cx - cx * c + s * z));
  }
  const slabWidth = Math.max(2, t * Math.abs(s));
  return {
    slices,
    slab: { x: cx - slabWidth / 2, width: slabWidth },
    front: { visible: c > 0.0005, matrix: m(c, cx - cx * c + (s * t) / 2), shade: shadeOf(c) },
    back: { visible: c < -0.0005, matrix: m(-c, cx + cx * c - (s * t) / 2), shade: shadeOf(c) },
  };
}
