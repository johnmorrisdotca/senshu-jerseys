[日本語](hockey-styles.ja.md) · English

# National hockey styles

Twelve original national hockey jersey styles, each in a home and an away colourway: 24 presets that are richer than a colour label. Every country has its own layout (a yoke, a band, a sash, raglan sleeves, chevrons, halves, hoops, stripe sets) and its own collar, cuffs and number treatment, and every one is ready to be given a name, a number and colours of the caller's.

They are **not** any team's real jersey. Only the colours are the ones the countries are known by. No crest, coat of arms, federation, sponsor or maker's mark is drawn, and no commercial picture was copied; the layouts are drawn here. A badge, a flag or a crest is the caller's (or one of the [national layouts](./national.md), which draw each country's own simplified mark and flag), through `chestBadges` ([chest badges](./chest.md)) or `crest`.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";
import { HOCKEY_STYLES, STYLE_COUNTRIES, personalStyle } from "@johnmorrisdotca/senshu-jerseys/presets/hockey-styles";

console.log(STYLE_COUNTRIES.length, HOCKEY_STYLES.length); // 12 24

// A style as it is, or given a name, a number and colours of one's own: a new object each time.
const plain = personalStyle("style:japan-2026-home");
const mine = personalStyle("style:japan-2026-home", { name: "Tanaka", number: 19, colors: ["#ffffff", "#1b2a6b", "#bc002d", "#bc002d", "#ffffff"], collar: "v", patch: "C" });
console.log(plain?.name, mine?.name); // undefined Tanaka

// The shared preset is frozen: nobody's changes reach another page's drawing.
console.log(Object.isFrozen(HOCKEY_STYLES[0]?.options)); // true
console.log(renderJersey(mine ?? {}).length > 1000); // true
```

## The twelve

Ids are `style:<country>-2026-home` and `style:<country>-2026-away`. The away is the home with the colours swapped. The English and the Japanese names are `STYLE_COUNTRIES` (`id`, `en`, `ja`) and each preset's `team` and `ja`; the Japanese names are on [the Japanese page](./hockey-styles.ja.md).

| Country | Id of the country | What is its own |
| --- | --- | --- |
| Canada | `canada` | A curved yoke in the second colour, three sets of stripes on the sleeve, a V collar. |
| United States | `usa` | A band of three across the chest, cuffs in the third colour, a crew collar. |
| Sweden | `sweden` | Raglan sleeves in the second colour, piping, a line at the hem. |
| Finland | `finland` | Hoops across the body and the sleeves, a polo collar, cuffs. |
| Czechia | `czechia` | Chevrons of two colours down the chest, sleeves in the third colour. |
| Slovakia | `slovakia` | Narrow vertical sets of three stripes, a plate behind the back's lettering, a polo collar. |
| Switzerland | `switzerland` | Sleeves in the other colour, a hem of two lines, straight lettering. |
| Germany | `germany` | A band of black, red and gold across the chest, sleeve stripes of the same, straight lettering. |
| Latvia | `latvia` | One wide band across the chest, a crew collar, one sleeve stripe. |
| Norway | `norway` | A square yoke in the third colour, a lace-up collar with piping, stripes at the sleeve and the hem. |
| Japan | `japan` | A sash across the body edged in the third colour, cuffs. |
| France | `france` | The body in halves, the sleeves following, a V collar in the third colour, piping. |

## Personalising

`personalStyle(id, overrides)` returns the style's options with the overrides laid over them, as a new object; the style is not changed (the presets are frozen, so an attempt to change one throws in a module). The overrides it is made for are:

| Override | What it does |
| --- | --- |
| `name`, `number` | The back's lettering, and the sleeve numbers' digits. |
| `colors` (or `body`, `trim`, `accent`) | The palette: body, trim, second trim, number fill, number outline. `colors` replaces the style's own five. |
| `numberFill`, `numberOutline` | The number's fill and outline alone. |
| `sleeveStripes`, `hemStripes` | The striping: a count of 0 to 3 or a list of bands (see the README). |
| `collar`, `collarColor` | The collar, and which colour it is. |
| `patch`, `chestBadges` | A captain's or alternate's letter, a flag, a patch: [chest badges](./chest.md). |
| `sleeveNumbers`, `sleeveLeft`, `sleeveRight` | Sleeve numbers and patches: [sleeves](./sleeves.md). |
| `view`, `look`, `size`, `language`, `crest` | As for any jersey. |

Anything else of `JerseyOptions` works too. In a page, `<senshu-jersey preset="style:japan-2026-home" name="Tanaka" number="19">` is the same (load the preset with `usePresets(HOCKEY_STYLES)` first); the attributes win over the preset.

## Views

A style is a set of options like any other, so it is drawn in every view and every turn: `view: "front"`, `"back"` or `"both"`; flat, or, through `bindTurn` or `jerseyFrame` with `volume: true`, front, back, both sides and the angles between, with the yoke, band, sash, stripes and collar following the garment ([turning](./turning.md)). The demo's *National styles* section shows the twelve at once, home or away; tapping one puts it on the stage to be personalised. `node scripts/preset-sheet.mjs hockey-styles sheet.png` draws the contact sheet.
