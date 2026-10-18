// Twelve national hockey jersey styles of our own: each country's colours in a layout drawn here (a yoke, a band, a sash, raglan sleeves, chevrons, halves), home and away, ready to be given a name, a number, colours of the
// caller's. They are not any team's real jersey: no crest, coat of arms, wordmark, federation, sponsor or maker's mark is drawn (`nationalStyle` adds a country's own simplified mark and flag in a national layout), and the colours are the ones the countries' flags and teams are known by. The presets are frozen,
// so a page that holds one cannot change what another draws; `personalStyle` makes a fresh set of options from one.
import type { JerseyOptions } from "../options.ts";
import type { NationalLayout } from "../national.ts";
import { defineLeague, type Preset } from "./core.ts";

/** The twelve countries, in the order the style sheet shows them: id, English name, Japanese name. */
export const STYLE_COUNTRIES: readonly { id: string; en: string; ja: string }[] = [
  { id: "canada", en: "Canada", ja: "カナダ代表" },
  { id: "usa", en: "United States", ja: "アメリカ代表" },
  { id: "sweden", en: "Sweden", ja: "スウェーデン代表" },
  { id: "finland", en: "Finland", ja: "フィンランド代表" },
  { id: "czechia", en: "Czechia", ja: "チェコ代表" },
  { id: "slovakia", en: "Slovakia", ja: "スロバキア代表" },
  { id: "switzerland", en: "Switzerland", ja: "スイス代表" },
  { id: "germany", en: "Germany", ja: "ドイツ代表" },
  { id: "latvia", en: "Latvia", ja: "ラトビア代表" },
  { id: "norway", en: "Norway", ja: "ノルウェー代表" },
  { id: "japan", en: "Japan", ja: "日本代表" },
  { id: "france", en: "France", ja: "フランス代表" },
];

const teams = Object.fromEntries(STYLE_COUNTRIES.map((c) => [c.id, [c.en, c.ja] as const]));

const freeze = <T>(value: T): T => {
  if (value !== null && typeof value === "object") for (const v of Object.values(value)) freeze(v);
  return Object.freeze(value);
};

/** Each country's two uniforms, `home` and `away` (the colours swapped), as a spec (see `docs/presets.md`). The layout is the style: what is different from one country to the next is written beside it. */
export const HOCKEY_STYLES: Preset[] = defineLeague("style", "hockey", teams, [
  // Canada: a curved yoke in the second colour, three sets of sleeve stripes and a V collar.
  ["canada", "2026", "home", "d52b1e fff 111 fff 111 p=y y=c ss=10.0.5.1.2.2.5.1 hs=6.1.3.0.3.2 co=v cc=1 sn=1"],
  ["canada", "2026", "away", "fff d52b1e 111 d52b1e 111 p=y y=c ss=10.0.5.1.2.2.5.1 hs=6.1.3.0.3.2 co=v cc=1 sn=1"],
  // The United States: a band of three across the chest, cuffs in the third colour and a crew collar.
  ["usa", "2026", "home", "0a3161 fff b31942 fff b31942 cb=9.1.3.2.9.1 cy=88 cf=16.2 co=c cc=1 hs=5.2 sn=1"],
  ["usa", "2026", "away", "fff 0a3161 b31942 0a3161 b31942 cb=9.1.3.2.9.1 cy=88 cf=16.2 co=c cc=1 hs=5.2 sn=1"],
  // Sweden: raglan sleeves in the second colour, piping and a plain hem line.
  ["sweden", "2026", "home", "006aa7 fecc00 fff fecc00 004a75 rg=1 pi=1 ss=0 hs=6.1.3.0.3.1 co=c cc=1 sn=1"],
  ["sweden", "2026", "away", "fecc00 006aa7 fff 006aa7 fff rg=1 pi=1 ss=0 hs=6.1.3.0.3.1 co=c cc=1 sn=1"],
  // Finland: hoops across the body and the sleeves, a polo collar and cuffs.
  ["finland", "2026", "home", "fff 003580 - 003580 fff p=h r=12.0.12.1 ss=0 hs=0 co=p cc=1 cf=14.1 sn=1"],
  ["finland", "2026", "away", "003580 fff - fff 003580 p=h r=12.0.12.1 ss=0 hs=0 co=p cc=1 cf=14.1 sn=1"],
  // Czechia: chevrons of two colours down the chest, sleeves in the third colour.
  ["czechia", "2026", "home", "d7141a fff 11457e fff 11457e p=c sc=2 ss=0 hs=6.2.3.1 co=v cc=2 sn=1"],
  ["czechia", "2026", "away", "fff d7141a 11457e d7141a fff p=c sc=2 ss=0 hs=6.2.3.1 co=v cc=2 sn=1"],
  // Slovakia: narrow vertical sets of three stripes, a plate behind the back's lettering and a polo collar.
  ["slovakia", "2026", "home", "fff 0b4ea2 ee1c25 0b4ea2 fff p=s r=18.0.3.1.3.2.3.1 hs=6.2 co=p cc=2 bp=1 sn=1"],
  ["slovakia", "2026", "away", "0b4ea2 fff ee1c25 0b4ea2 fff p=s r=18.0.3.1.3.2.3.1 hs=6.2 co=p cc=2 bp=1 sn=1"],
  // Switzerland: sleeves in the other colour, a hem of two lines and straight lettering.
  ["switzerland", "2026", "home", "d52b1e fff - fff d52b1e sc=1 ss=0 hs=7.1.3.0.3.1 co=c cc=1 na=s sn=1"],
  ["switzerland", "2026", "away", "fff d52b1e - d52b1e fff sc=1 ss=0 hs=7.1.3.0.3.1 co=c cc=1 na=s sn=1"],
  // Germany: a band of black, red and gold across the chest, and sleeve stripes of the same.
  ["germany", "2026", "home", "fff 111 dd0000 ffce00 111 cb=6.1.2.0.6.2.2.0.6.3 cy=84 ss=6.1.3.2.6.3 hs=0 co=c cc=1 na=s sn=1"],
  ["germany", "2026", "away", "111 fff dd0000 ffce00 fff cb=6.1.2.0.6.2.2.0.6.3 cy=84 ss=6.1.3.2.6.3 hs=0 co=c cc=1 na=s sn=1"],
  // Latvia: one wide band across the chest, a crew collar and a single sleeve stripe.
  ["latvia", "2026", "home", "9e3039 fff - fff 9e3039 p=b cy=82 ss=14.1 hs=0 co=c cc=1 sn=1"],
  ["latvia", "2026", "away", "fff 9e3039 - 9e3039 fff p=b cy=82 ss=14.1 hs=0 co=c cc=1 sn=1"],
  // Norway: a square yoke in the third colour, a lace-up collar with piping and stripes at the sleeve and the hem.
  ["norway", "2026", "home", "ba0c2f fff 00205b fff 00205b p=y y=s pa=2 pi=1 ss=7.1.3.2.7.1 hs=5.2.3.1 co=l cc=2 sn=1"],
  ["norway", "2026", "away", "fff ba0c2f 00205b ba0c2f 00205b p=y y=s pa=2 pi=1 ss=7.1.3.2.7.1 hs=5.2.3.1 co=l cc=2 sn=1"],
  // Japan: a sash across the body, edged in the third colour, and cuffs.
  ["japan", "2026", "home", "fff bc002d 1b2a6b bc002d fff p=a ss=4.2.8.1.4.2 hs=0 co=c cc=1 cf=16.1 sn=1"],
  ["japan", "2026", "away", "bc002d fff 1b2a6b fff 1b2a6b p=a ss=4.2.8.1.4.2 hs=0 co=c cc=1 cf=16.1 sn=1"],
  // France: the body in halves, the sleeves following, a V collar in the third colour and piping.
  ["france", "2026", "home", "0055a4 fff ef4135 fff ef4135 p=2 pi=1 ss=3.1.3.2 hs=0 co=v cc=2 sn=1"],
  ["france", "2026", "away", "fff 0055a4 ef4135 0055a4 ef4135 p=2 pi=1 ss=3.1.3.2 hs=0 co=v cc=2 sn=1"],
]).map((p) => freeze(p));

/**
 * What a caller may set on a style: a name and a number, colours, the number's outline, the striping, the collar, a patch and chest badges. Anything of `JerseyOptions` is allowed; these are the ones the demo offers.
 */
export type StylePersonal = Pick<JerseyOptions, "name" | "number" | "colors" | "body" | "trim" | "accent" | "numberFill" | "numberOutline" | "sleeveStripes" | "hemStripes" | "collar" | "collarColor" | "patch" | "chestBadges" | "sleeveNumbers" | "sleeveLeft" | "sleeveRight" | "view" | "look" | "size" | "language" | "crest">;

/** The options of a style, with what the caller sets laid over them: a fresh object, so the style itself is never changed. `undefined` for an id that is not a style. Colours given as `colors` take the place of the style's three. */
export function personalStyle(id: string, who: StylePersonal = {}): JerseyOptions | undefined {
  const preset = HOCKEY_STYLES.find((p) => p.id === id);
  if (preset === undefined) return undefined;
  const base: Record<string, unknown> = { ...preset.options };
  if (who.colors !== undefined) for (const k of ["body", "trim", "accent", "numberFill", "numberOutline"]) delete base[k];
  return { ...base, ...who } as JerseyOptions;
}

/**
 * A national style in one of the eight national layouts (`NATIONAL_LAYOUTS`): the country's two colourways and stripes, its own mark and flag drawn at the scale of the shirt. `away` takes the away colours and `text` the words
 * set on the chest (the country's name by default); the rest is `personalStyle`'s. `undefined` for a country that is not one of the twelve.
 */
export function nationalStyle(country: string, layout: NationalLayout, who: StylePersonal & { away?: boolean; text?: string } = {}): JerseyOptions | undefined {
  const { away, text, ...rest } = who;
  const base = personalStyle(`style:${country}-2026-${away === true ? "away" : "home"}`, rest);
  return base === undefined ? undefined : { ...base, national: { country, layout, ...(text === undefined ? {} : { text }) } };
}
