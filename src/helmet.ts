// `renderHelmet`: a football helmet (shell, facemask, stripe and a mark or number on the side), a hockey helmet or a batting helmet, in side profile, in a team's colour.
import { BLACK, WHITE, clean, hashOf, hexOf, inkOn, lum, readColour, shade, type Rgb } from "./colour.ts";
import { TITLE_WORDS } from "./names.ts";
import { LANGUAGE_IDS, LOOK_IDS, type LanguageId, type LookId } from "./options.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

export const HELMET_KINDS = ["football", "hockey", "batting"] as const;
export type HelmetKind = (typeof HELMET_KINDS)[number];
export const HELMET_MARKS = ["none", "number", "ring", "star", "bar"] as const;
export type HelmetMark = (typeof HELMET_MARKS)[number];

export interface HelmetOptions {
  kind?: HelmetKind;
  /** `[shell, stripe?, facemask?, mark?]`: the shell, the stripe over its crown, the facemask or the cage, and the side mark. */
  colors?: readonly string[];
  /** The side mark: a number, a ring, a star or a bar; the caller's own crest is a `crest` on the jersey, never drawn here. */
  mark?: HelmetMark;
  number?: string | number;
  facing?: "left" | "right";
  look?: LookId;
  size?: number;
  language?: LanguageId;
  title?: string;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** The parts of a helmet drawing: its defs, its body in a box 200 by 170, and its title. */
export function helmetParts(options?: HelmetOptions): { id: string; defs: string; body: string; title: string; size: number; w: number; h: number } {
  const o: HelmetOptions = options !== null && typeof options === "object" ? options : {};
  const kind = pick(HELMET_KINDS, o.kind, "football");
  const list = Array.isArray(o.colors) ? o.colors : [];
  const shell = readColour(list[0]) ?? ([31, 58, 138] as Rgb);
  const stripe = readColour(list[1]);
  const mask = readColour(list[2]) ?? (kind === "football" ? ([226, 226, 226] as Rgb) : ([40, 44, 50] as Rgb));
  const markC = readColour(list[3]) ?? ([244, 240, 228] as Rgb);
  const mark = pick(HELMET_MARKS, o.mark, "none");
  const num = clean(typeof o.number === "number" ? String(Math.trunc(Math.abs(o.number))) : o.number, 4)?.replace(/\D/g, "").slice(0, 2);
  const facing = o.facing === "left" ? "left" : "right";
  const look = pick(LOOK_IDS, o.look, "cloth");
  const language = pick(LANGUAGE_IDS, o.language, "en");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const uid = `sh${hashOf(JSON.stringify([kind, shell, stripe, mask, markC, mark, num, facing, look]))}`;
  const line = look === "line";
  const cloth = look === "cloth";
  const hx = hexOf;
  const edgeOf = (c: Rgb): string => (line ? "currentColor" : hx(lum(c) > 0.1 ? shade(c, -0.42) : shade(c, 0.3)));
  const fill = (c: Rgb): string => (line ? 'fill="none"' : `fill="${hx(c)}"`);
  const sw = line ? 7 : 1.6;
  let defs = "";
  let g = "";
  let text = "";
  // Shell outlines, facing right, and the places of the ear and of the side mark.
  const SHELL = {
    football: "M40 114C30 70 52 30 104 24C148 20 176 44 180 84L182 112L166 120L148 128C138 142 120 150 96 148C66 146 46 132 40 114Z",
    hockey: "M44 108C38 64 62 30 108 28C150 26 176 52 176 92L176 112L152 114L148 130L116 136C84 136 50 130 44 108Z",
    batting: "M40 118C34 64 62 28 112 28C150 28 170 52 172 84L174 104C184 106 194 110 198 118C184 124 164 124 150 120L128 120L50 126Z",
  }[kind];
  const EAR = { football: [108, 100, 11], hockey: [98, 96, 14], batting: [112, 98, 17] }[kind];
  defs += `<clipPath id="${uid}s"><path d="${SHELL}"/></clipPath>`;
  g += `<path d="${SHELL}" ${fill(shell)}/>`;
  if (stripe !== undefined && !line) {
    const path = kind === "football" ? "M44 52C80 14 150 14 178 62" : kind === "hockey" ? "M48 56C84 20 152 22 174 70" : "M48 60C86 26 150 26 172 72";
    const w = kind === "football" ? 13 : 11;
    g += `<g clip-path="url(#${uid}s)"><path d="${path}" fill="none" stroke="${hx(stripe)}" stroke-width="${w}"/>${kind === "football" ? `<path d="${path}" fill="none" stroke="${hx(shade(stripe, -0.4))}" stroke-width="1" transform="translate(0 7)" opacity=".6"/>` : ""}</g>`;
  }
  if (cloth) {
    defs += `<radialGradient id="${uid}g" cx=".38" cy=".22" r=".95"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".4" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient>`;
    g += `<path d="${SHELL}" fill="url(#${uid}g)"/>`;
  }
  // The mark on the side, behind the ear.
  const [mx, my] = kind === "football" ? [78, 84] : kind === "hockey" ? [76, 78] : [84, 74];
  const ink = inkOn([shell], [markC, WHITE, BLACK]);
  if (mark === "ring" && !line) g += `<circle cx="${mx}" cy="${my}" r="17" fill="none" stroke="${hx(markC)}" stroke-width="6"/>`;
  else if (mark === "bar" && !line) g += `<g clip-path="url(#${uid}s)"><path d="M56 ${my - 8}H120V${my + 8}H56Z" fill="${hx(markC)}"/></g>`;
  else if (mark === "star" && !line) {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const rr = i % 2 === 0 ? 20 : 8.4;
      d += `${i === 0 ? "M" : "L"}${n2(mx + rr * Math.cos(a))} ${n2(my + rr * Math.sin(a))}`;
    }
    g += `<path d="${d}Z" fill="${hx(markC)}" stroke="${edgeOf(markC)}" stroke-width=".8" stroke-linejoin="round"/>`;
  }
  // The ear hole, the vents or the flap.
  if (kind === "football") {
    g += line ? `<circle cx="${EAR[0]}" cy="${EAR[1]}" r="${EAR[2]}" fill="none" stroke="currentColor" stroke-width="5"/>` : `<circle cx="${EAR[0]}" cy="${EAR[1]}" r="${EAR[2]}" fill="${hx(shade(shell, -0.65))}" stroke="${edgeOf(shell)}" stroke-width="1.2"/>`;
  } else if (kind === "hockey") {
    g += `<rect x="${EAR[0] - 14}" y="${EAR[1] - 14}" width="28" height="30" rx="8" ${line ? 'fill="none" stroke="currentColor" stroke-width="5"' : `fill="${hx(shade(shell, -0.28))}" stroke="${edgeOf(shell)}" stroke-width="1.2"`}/>`;
    if (!line) g += `<path d="M82 48H130M86 40H122M92 33H114" stroke="${hx(shade(shell, -0.5))}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    if (!line) g += `<path d="M98 112C100 124 104 130 112 134" fill="none" stroke="${hx(shade(shell, -0.5))}" stroke-width="2.4" stroke-linecap="round"/>`;
  } else {
    g += `<path d="M80 92C80 80 100 76 118 80C130 84 134 100 130 114C124 126 100 128 86 118C80 112 80 100 80 92Z" ${line ? 'fill="none" stroke="currentColor" stroke-width="5"' : `fill="${hx(shade(shell, -0.22))}" stroke="${edgeOf(shell)}" stroke-width="1.2"`}/>`;
    if (!line) g += `<circle cx="${EAR[0]}" cy="${EAR[1]}" r="3" fill="${hx(shade(shell, -0.6))}"/>`;
  }
  g += `<path d="${SHELL}" fill="none" stroke="${edgeOf(shell)}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  // The facemask or the cage.
  if (kind === "football") {
    const m = hx(mask);
    const stroke = line ? "currentColor" : m;
    const w = line ? 6 : 4.4;
    g += `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M172 84C196 88 200 116 190 134L170 150L128 150" stroke="${line ? "currentColor" : edgeOf(mask)}" stroke-width="${w + 2}"/><path d="M182 86C196 90 200 116 190 134M180 106H198M176 124H196M186 88V138" stroke="${stroke}" stroke-width="${w - 1.4}"/><path d="M172 84C196 88 200 116 190 134L170 150L128 150" stroke="${stroke}" stroke-width="${w}"/></g>`;
  } else if (kind === "hockey") {
    const m = hx(mask);
    g += line ? "" : `<path d="M160 96C178 98 188 108 190 124L186 136" fill="none" stroke="${m}" stroke-width="3.2" stroke-linecap="round"/><path d="M170 92V132M180 94V132M166 108H188M164 122H186" stroke="${m}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>`;
    if (line) g += `<path d="M160 96C178 98 188 108 190 124L186 136" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (mark === "number" && num !== undefined && num !== "") {
    const run = layout(num, mx, my, { height: 30, maxWidth: 40, weight: "black" });
    text = line ? drawRun(run, "currentColor", undefined, undefined) : drawRun(run, hx(ink), lum(ink) > 0.5 ? { colour: hx(shade(shell, -0.5)), width: 1.1 } : undefined, undefined);
  }
  // Text is never mirrored: for a helmet facing left the shell is flipped and the text is drawn again at the mirrored place.
  const final = facing === "left" ? `<g transform="translate(200 0) scale(-1 1)">${g}</g>${text === "" ? "" : `<g transform="translate(${200 - 2 * mx} 0)">${text}</g>`}` : g + text;
  const w = TITLE_WORDS[language];
  const kindName = { football: ["football", "アメリカンフットボール"], hockey: ["hockey", "アイスホッケー"], batting: ["batting", "打者用"] }[kind];
  const title = clean(o.title, 120) ?? (language === "ja" ? `${kindName[1]}の${w.helmet}` : `${kindName[0][0]?.toUpperCase()}${kindName[0].slice(1)} ${w.helmet.toLowerCase()}`);
  return { id: uid, defs, body: final, title, size, w: 200, h: 170 };
}

export function renderHelmet(options?: HelmetOptions): string {
  const p = helmetParts(options);
  return wrapSvg({ id: p.id, w: p.w, h: p.h, width: p.size, title: p.title, defs: p.defs, body: p.body });
}
