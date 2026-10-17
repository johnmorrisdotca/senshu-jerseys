// `renderTitleBanner`: a championship pennant or a garden flag in the caller's colours. The honour, the city, the club name and the years
// are letters the caller passes; a logo is shown only when the caller passes one (an SVG document, a data address, or an http(s) or
// root-relative image). The package draws no team's mark, no league shield and no wordmark art. Trophies and rings stay in dougu-sports.
import { BLACK, WHITE, clean, contrast, esc, hashOf, hexOf, inkOn, lum, readColour, shade, type Rgb } from "./colour.ts";
import { logoHref } from "./banner.ts";
import { TITLE_WORDS } from "./names.ts";
import { LANGUAGE_IDS, LOOK_IDS, type LanguageId, type LookId } from "./options.ts";
import { n2 } from "./path.ts";
import { wrapSvg } from "./svg.ts";
import { drawRun, layout } from "./text.ts";

export const TITLE_BANNER_KINDS = ["pennant", "garden"] as const;
export type TitleBannerKind = (typeof TITLE_BANNER_KINDS)[number];

export interface TitleBannerOptions {
  /** `"pennant"` (the default): hangs from a rod with gold knobs. `"garden"`: a vertical flag from a pole, with a stars bar. */
  kind?: TitleBannerKind;
  /** `[field, accent, ink?]`. Navy and orange in the Oilers example. */
  colors?: readonly string[];
  /** City line on a garden flag (`EDMONTON`). Ignored on a pennant. */
  city?: string;
  /** Club line on a garden flag (`OILERS`). Ignored on a pennant. */
  club?: string;
  /** First honour line (`STANLEY CUP`). */
  title?: string;
  /** Second honour line (`CHAMPIONS`). */
  subtitle?: string;
  /** The honour as one string when `title` is not given: `"STANLEY CUP CHAMPIONS"` splits before the last word. */
  honour?: string;
  /** Championship years, as numbers, strings, or one string (`"1984 1985 1987"`). Drawn on two lines when there are more than three. */
  years?: readonly (string | number)[] | string;
  /**
   * A mark the caller already holds: an SVG document, a `data:image…` address, or an `http(s):` or root-relative image.
   * Anything else is ignored. The package never draws a team's own mark.
   */
  logo?: string;
  look?: LookId;
  size?: number;
  language?: LanguageId;
}

const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** Split championship years into one or two lines of space-separated years. */
export function yearLines(years: TitleBannerOptions["years"]): string[] {
  const raw = Array.isArray(years) ? years.map((y) => String(y)) : typeof years === "string" ? years.split(/[\s,;/]+/) : [];
  const list = raw.map((y) => y.replace(/\D/g, "").slice(0, 4)).filter((y) => y.length === 4);
  if (list.length === 0) return [];
  if (list.length <= 3) return [list.join(" ")];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid).join(" "), list.slice(mid).join(" ")];
}

function honourOf(o: TitleBannerOptions): { title?: string; subtitle?: string } {
  const title = clean(o.title, 40)?.toUpperCase();
  const subtitle = clean(o.subtitle, 24)?.toUpperCase();
  if (title !== undefined) return { title, subtitle };
  const honour = clean(o.honour, 48)?.toUpperCase();
  if (honour === undefined) return {};
  const i = honour.lastIndexOf(" ");
  if (i > 0) return { title: honour.slice(0, i), subtitle: honour.slice(i + 1) };
  return { title: honour };
}

const markAt = (text: string, cx: number, cy: number, h: number, w: number, weight: "bold" | "black", fill: string, outline?: { colour: string; width: number }, line?: boolean): string => {
  const run = layout(text, cx, cy, { height: h, maxWidth: w, weight, tracking: 0.35 });
  if (line) return drawRun(run, "currentColor", undefined, undefined);
  return drawRun(run, fill, outline, undefined);
};

/** A five-point star centred at `(cx, cy)`, outer radius `r`. Generic decoration; not a league mark. */
function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    pts.push(`${n2(cx + r * Math.cos(a))} ${n2(cy + r * Math.sin(a))}`);
    pts.push(`${n2(cx + r * 0.38 * Math.cos(b))} ${n2(cy + r * 0.38 * Math.sin(b))}`);
  }
  return `M${pts[0]}L${pts.slice(1).join("L")}Z`;
}

const gold: Rgb = [212, 175, 55];
const rod: Rgb = [28, 28, 28];

export function renderTitleBanner(options?: TitleBannerOptions): string {
  const o: TitleBannerOptions = options !== null && typeof options === "object" ? options : {};
  const kind = pick(TITLE_BANNER_KINDS, o.kind, "pennant");
  const list = Array.isArray(o.colors) ? o.colors : [];
  const field = readColour(list[0]) ?? ([4, 30, 66] as Rgb);
  const accent = readColour(list[1]) ?? ([255, 76, 0] as Rgb);
  const given = readColour(list[2]);
  const look = pick(LOOK_IDS, o.look, "cloth");
  const language = pick(LANGUAGE_IDS, o.language, "en");
  const size = typeof o.size === "number" && Number.isFinite(o.size) ? Math.max(8, Math.min(4000, o.size)) : 200;
  const logo = logoHref(o.logo);
  const city = clean(o.city, 24)?.toUpperCase();
  const club = clean(o.club, 24)?.toUpperCase();
  const { title, subtitle } = honourOf(o);
  const years = yearLines(o.years);
  const line = look === "line";
  const cloth = look === "cloth";
  const hx = hexOf;
  const ink = given ?? inkOn([field], [WHITE, accent, BLACK]);
  const light = lum(accent) > 0.55 ? accent : WHITE;
  const uid = `tb${hashOf(JSON.stringify([kind, field, accent, given, city, club, title, subtitle, years, look, logo === undefined ? "" : hashOf(logo)]))}`;
  const words = TITLE_WORDS[language];
  const honourBits = [city, club, title, subtitle, ...years].filter((s): s is string => s !== undefined && s !== "").join(language === "ja" ? " " : ", ");
  const named = honourBits ? `${words.titleBanner}${language === "ja" ? " " : ", "}${honourBits}` : words.titleBanner;

  if (kind === "garden") {
    return wrapSvg({
      id: uid,
      w: 200,
      h: 340,
      width: size,
      title: named,
      defs: gardenDefs(uid, cloth),
      body: gardenBody({ uid, field, accent, light, line, cloth, hx, city, club, title, subtitle, years, logo }),
    });
  }
  return wrapSvg({
    id: uid,
    w: 200,
    h: 300,
    width: size,
    title: named,
    defs: pennantDefs(uid, cloth),
    body: pennantBody({ uid, field, accent, ink, light, line, cloth, hx, title, subtitle, years, logo }),
  });
}

const pennantOut = (): string => "M44 44H156V198L100 262L44 198Z";

function pennantDefs(uid: string, cloth: boolean): string {
  let defs = `<clipPath id="${uid}c"><path d="${pennantOut()}"/></clipPath>`;
  if (cloth) {
    defs += `<linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
  }
  return defs;
}

function pennantBody(p: {
  uid: string;
  field: Rgb;
  accent: Rgb;
  ink: Rgb;
  light: Rgb;
  line: boolean;
  cloth: boolean;
  hx: (c: Rgb) => string;
  title: string | undefined;
  subtitle: string | undefined;
  years: string[];
  logo: string | undefined;
}): string {
  const { uid, field, accent, ink, light, line, cloth, hx, title, subtitle, years, logo } = p;
  const out = pennantOut();
  let body = "";
  // Black rod with gold knobs; two cords to the cloth.
  if (!line) {
    body += `<path d="M32 16H168V26H32Z" fill="${hx(rod)}"/>`;
    body += `<circle cx="32" cy="21" r="7" fill="${hx(gold)}" stroke="${hx(shade(gold, -0.35))}" stroke-width="1"/>`;
    body += `<circle cx="168" cy="21" r="7" fill="${hx(gold)}" stroke="${hx(shade(gold, -0.35))}" stroke-width="1"/>`;
    body += `<path d="M44 44L32 21M156 44L168 21" fill="none" stroke="${hx(rod)}" stroke-width="2.2" stroke-linecap="round"/>`;
    body += `<path d="${out}" fill="${hx(field)}"/>`;
    body += `<g clip-path="url(#${uid}c)"><path d="${out}" fill="none" stroke="${hx(accent)}" stroke-width="14"/><path d="${out}" fill="none" stroke="${hx(light)}" stroke-width="4"/></g>`;
    if (cloth) body += `<path d="${out}" fill="url(#${uid}g)"/>`;
    body += `<path d="${out}" fill="none" stroke="${hx(shade(field, -0.4))}" stroke-width="1.6" stroke-linejoin="round"/>`;
  } else {
    body += `<path d="M32 16H168V26H32Z" fill="none" stroke="currentColor" stroke-width="5"/>`;
    body += `<path d="${out}" fill="none" stroke="currentColor" stroke-width="5"/>`;
  }
  const fill = line ? "currentColor" : hx(light);
  const yearFill = line ? "currentColor" : hx(contrast(light, field) >= 4.5 ? light : ink);
  const hasLogo = logo !== undefined;
  let y = hasLogo ? 58 : 88;
  if (hasLogo) {
    body += `<image href="${esc(logo)}" x="68" y="52" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>`;
    y = 128;
  }
  if (title !== undefined) {
    body += markAt(title, 100, y, 16, 92, "black", fill, undefined, line);
    y += 22;
  }
  if (subtitle !== undefined) {
    body += markAt(subtitle, 100, y, 12, 88, "bold", fill, undefined, line);
    y += 20;
  }
  for (const row of years) {
    body += markAt(row, 100, y, 11, 90, "bold", yearFill, undefined, line);
    y += 16;
  }
  return body;
}

const gardenOut = (): string => "M28 28H164V308H28Z";

function gardenDefs(uid: string, cloth: boolean): string {
  let defs = `<clipPath id="${uid}c"><path d="${gardenOut()}"/></clipPath>`;
  if (cloth) {
    defs += `<linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`;
  }
  return defs;
}

function gardenBody(p: {
  uid: string;
  field: Rgb;
  accent: Rgb;
  light: Rgb;
  line: boolean;
  cloth: boolean;
  hx: (c: Rgb) => string;
  city: string | undefined;
  club: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  years: string[];
  logo: string | undefined;
}): string {
  const { uid, field, accent, light, line, cloth, hx, city, club, title, subtitle, years, logo } = p;
  const out = gardenOut();
  let body = "";
  // Pole and hook on the right, garden-flag style.
  if (!line) {
    body += `<path d="M170 12C170 12 188 18 188 36" fill="none" stroke="${hx(rod)}" stroke-width="5" stroke-linecap="round"/>`;
    body += `<path d="M186 36H190V328H186Z" fill="${hx(rod)}"/>`;
    body += `<path d="${out}" fill="${hx(field)}"/>`;
  } else {
    body += `<path d="M186 12V328" fill="none" stroke="currentColor" stroke-width="5"/>`;
    body += `<path d="${out}" fill="none" stroke="currentColor" stroke-width="5"/>`;
  }
  const lightFill = line ? "currentColor" : hx(light);
  const accentInk = line ? "currentColor" : hx(inkOn([accent], [field, WHITE, BLACK]));
  if (!line) {
    // Stars bar, city/club block, logo block, honour block, years, hem. Generic stars; no league shield.
    body += `<g clip-path="url(#${uid}c)">`;
    body += `<path d="M28 28H164V56H28Z" fill="${hx(field)}"/>`;
    body += `<path d="M28 56H164V128H28Z" fill="${hx(accent)}"/>`;
    body += `<path d="M28 128H164V196H28Z" fill="${hx(field)}"/>`;
    body += `<path d="M28 196H164V248H28Z" fill="${hx(accent)}"/>`;
    body += `<path d="M28 248H164V292H28Z" fill="${hx(field)}"/>`;
    body += `<path d="M28 292H164V308H28Z" fill="${hx(accent)}"/>`;
    body += `</g>`;
    if (cloth) body += `<path d="${out}" fill="url(#${uid}g)"/>`;
    body += `<path d="${out}" fill="none" stroke="${hx(shade(field, -0.35))}" stroke-width="1.6"/>`;
  }
  const starFill = line ? "currentColor" : hx(light);
  for (let i = 0; i < 7; i++) {
    body += `<path d="${starPath(46 + i * 16, 42, 5.2)}" fill="${starFill}"/>`;
  }
  if (city !== undefined) body += markAt(city, 96, 72, 10, 112, "bold", accentInk, undefined, line);
  if (club !== undefined) body += markAt(club, 96, 100, 22, 118, "black", accentInk, undefined, line);
  if (logo !== undefined) {
    body += `<image href="${esc(logo)}" x="64" y="136" width="64" height="52" preserveAspectRatio="xMidYMid meet"/>`;
  }
  if (title !== undefined) body += markAt(title, 96, 210, 12, 112, "black", accentInk, undefined, line);
  if (subtitle !== undefined) body += markAt(subtitle, 96, 230, 11, 112, "bold", accentInk, undefined, line);
  let yy = 262;
  for (const row of years) {
    body += markAt(row, 96, yy, 11, 112, "bold", lightFill, undefined, line);
    yy += 15;
  }
  return body;
}
