// A preset: a team's uniform of an era as colours and stripes, written as one short line of text and read into the options of `renderJersey`. A preset holds colours, stripe
// layouts, yokes, collars and number styles only: never a crest, a logo, a monogram, a wordmark or a sponsor's mark. The chest stays empty or takes the caller's own `crest`.
import type { CutId } from "../cuts.ts";
import { bandsOf, type JerseyOptions } from "../options.ts";

/** One preset, decoded. `id` is `league:team-years-way` (`nhl:montreal-1950s-home`). */
export interface Preset {
  id: string;
  league: string;
  team: string;
  /** The team's name in Japanese. */
  ja: string;
  /** The years the look was worn: `1950s` or `1947-1955`. */
  years: string;
  /** Which of the era's uniforms: `home`, `away`, `third`, `alt`, or a colour. */
  way: string;
  options: JerseyOptions;
}

/** `[team key, years, way, spec]`: the spec is described in `docs/presets.md`. */
export type Row = readonly [team: string, years: string, way: string, spec: string];
export type Teams = Readonly<Record<string, readonly [en: string, ja: string]>>;

const CUT_CODES: Record<string, CutId> = { h: "hockey", b: "baseball", k: "basketball", f: "football", s: "soccer", r: "rugby", d: "handball" };
const PATTERN_CODES = { s: "stripes", h: "hoops", "2": "halves", "4": "quarters", a: "sash", c: "chevron", p: "pinstripes", y: "yoke", b: "chest-band" } as const;
const YOKE_CODES = { c: "curved", s: "square", f: "full-arm" } as const;
const COLLAR_CODES = { l: "lace-up", v: "v", c: "crew", p: "polo", r: "round", w: "wishbone", b: "band" } as const;
const SLEEVE_CODES = { l: "long", e: "elbow", s: "short", n: "none" } as const;
const CLOSURE_CODES = { b: "button", p: "pullover", v: "vest" } as const;

const hex = (t: string): string | undefined => (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(t) ? `#${t}` : undefined);
const dotted = (t: string): number[] => t.split(".").map(Number);
const stripes = (t: string): number | readonly number[] | undefined => {
  const n = dotted(t);
  return n.length === 1 ? n[0] : bandsOf(n);
};

/** The options a spec says, on top of `base`. Unknown words are ignored. */
export function decode(spec: string, base: JerseyOptions = {}): JerseyOptions {
  const o: Record<string, unknown> = { ...base };
  const colours: (string | undefined)[] = [];
  for (const token of spec.trim().split(/\s+/)) {
    if (token === "") continue;
    const eq = token.indexOf("=");
    if (eq < 0) {
      colours.push(token === "-" ? undefined : hex(token));
      continue;
    }
    const k = token.slice(0, eq);
    const v = token.slice(eq + 1);
    switch (k) {
      case "c": o.cut = CUT_CODES[v] ?? o.cut; break;
      case "p": o.pattern = PATTERN_CODES[v as keyof typeof PATTERN_CODES] ?? "solid"; break;
      case "r": o.repeat = bandsOf(dotted(v)); break;
      case "n": o.stripeCount = Number(v); break;
      case "ps": o.patternSleeves = v !== "0"; break;
      case "ss": o.sleeveStripes = stripes(v); break;
      case "hs": o.hemStripes = stripes(v); break;
      case "cb": o.chestBand = v === "1" ? true : bandsOf(dotted(v)); break;
      case "cy": o.chestY = Number(v); break;
      case "y": o.yoke = YOKE_CODES[v as keyof typeof YOKE_CODES]; break;
      case "co": o.collar = COLLAR_CODES[v as keyof typeof COLLAR_CODES]; break;
      case "sl": o.sleeve = SLEEVE_CODES[v as keyof typeof SLEEVE_CODES]; break;
      case "cl": o.closure = CLOSURE_CODES[v as keyof typeof CLOSURE_CODES]; break;
      case "rg": o.raglan = v !== "0"; break;
      case "pi": o.piping = v !== "0"; break;
      case "sn": o.sleeveNumbers = v !== "0"; break;
      case "pa": o.panels = Number(v); break;
      case "cc": o.collarColor = Number(v); break;
      case "sc": o.sleeveColor = Number(v); break;
      case "nf": o.numberFill = hex(v); break;
      case "no": o.numberOutline = hex(v); break;
      case "pt": o.pants = hex(v); break;
      case "ptt": o.pantsTrim = hex(v); break;
      case "pb": o.pantsBands = bandsOf(dotted(v)); break;
      case "sk": o.socks = hex(v); break;
      case "skt": o.socksTrim = hex(v); break;
      case "sb": o.socksBands = bandsOf(dotted(v)); break;
      case "he": o.helmet = hex(v); break;
      default:
    }
  }
  const [body, trim, accent] = colours;
  if (body !== undefined) o.body = body;
  if (trim !== undefined) o.trim = trim;
  if (accent !== undefined) o.accent = accent;
  if (colours[3] !== undefined) o.numberFill = colours[3];
  if (colours[4] !== undefined) o.numberOutline = colours[4];
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o as JerseyOptions;
}

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A league's presets from its teams' names and its rows. */
export function defineLeague(league: string, cut: CutId, teams: Teams, rows: readonly Row[], base: JerseyOptions = {}): Preset[] {
  return rows.map(([key, years, way, spec]) => {
    const team = teams[key];
    if (team === undefined) throw new Error(`${league}: no team named ${key}`);
    return { id: `${league}:${slug(key)}-${slug(years)}-${slug(way)}`, league, team: team[0], ja: team[1], years, way, options: decode(spec, { ...base, cut }) };
  });
}
