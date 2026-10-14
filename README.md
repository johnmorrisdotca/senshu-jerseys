<h1 align="center">Senshu Jerseys <sub>選手</sub></h1>

<p align="center"><strong>Sports jerseys, sweaters and kits as SVG strings, front and back, with optional 2.5D turning.</strong><br>
Hockey, baseball, basketball, football, soccer, rugby and handball cuts in stripes, hoops, halves and pinstripes; caps, helmets and retired-number banners; numbers and names drawn as vectors, so they look the same everywhere; and nearly fifteen hundred presets of real teams' colours and stripes. Each one is a function that returns SVG. MIT, with no dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/senshu-jerseys/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/senshu-jerseys/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/senshu-jerseys/"><strong>Open the demo →</strong></a> · <a href="./docs/presets.md">Presets</a> · <a href="./docs/turning.md">Turning</a> · <a href="./docs/element.md">Element and embed</a> · <a href="./docs/references.md">References</a></p>

<p align="center">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/hero-desk-dark.png">
<img alt="Seven jerseys, one in each cut: a hockey sweater with a lace-up collar and sleeve stripes, a pinstriped baseball jersey, a basketball tank, a football jersey with sleeve stripes, a hooped soccer shirt, a rugby shirt and a handball shirt. Below them the backs, with a name and a number, and the same in one line." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/hero-desk-light.png" width="760">
</picture>
</p>

<table align="center">
<tr>
<td align="center" valign="top">
<img alt="A hockey sweater turned through seven angles: the front foreshortens to an edge, where the thickness of the cloth shows, and then the back appears with its name and number." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/turn-desk-light.png" width="470"><br><em>Turned: the front to an edge, then the back</em>
</td>
<td align="center" valign="top">
<img alt="Jerseys on a phone, light." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/phone-light.png" width="200"><br><em>On a phone</em>
</td>
</tr>
</table>

> **Status: preview.** Seven cuts, ten patterns, caps, helmets, banners, a matchup and a lineup, turning, a custom element, and presets of the colours and stripes of real teams. The presets are a first reading from public descriptions: see [Presets](#presets) before relying on one.

## In 30 seconds

```sh
npm install @johnmorrisdotca/senshu-jerseys
```

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const svg = renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both" });

console.log(svg.startsWith("<svg")); // true
console.log(svg.includes("Hockey sweater, number 9, front and back")); // true
```

Put the string in a page (`element.innerHTML = svg`), write it to a file, or send it from a server: it is plain SVG, with no script, no font and no network. Numbers and names are drawn as shapes, not typed as text, so the jersey looks the same on every device.

## Who it is for

- **Sports sites and apps** that show a roster, a lineup, a result or a retired number and want a shirt in the team's colours without a photograph or a licence.
- **Scoreboards, brackets and match pages** that want a kit for each side, and the two kits to be told apart.
- **Games and cards** that need a jersey with a number, front and back, that turns.
- **Pages that care about weight**: the drawing is about 17 kB gzipped, the turn about 14 kB more, and a league of presets about 5 kB; the package says `sideEffects` only for the element's registration.

## Features

- **Seven cuts**: hockey (lace-up, V or crew collar; curved, square or full-arm yoke; chest band, hem and sleeve stripes; upper-arm numbers; a C or A patch), baseball (button front, pullover or vest; pinstripes, piping, raglan sleeves; chest letters), basketball (a tank with a round, V or wishbone neck and side panels), football (wide shoulders, sleeve stripes, shoulder numbers), soccer, rugby and handball.
- **Ten patterns**: solid, stripes, hoops, halves, quarters, sash, chevron, pinstripes, yoke and chest band; stripes and hoops take any repeat of widths and colours.
- **Front, back, or both**, in three styles: `cloth` (soft folds, stitched numbers, a self-toned edge), `flat`, and `line` (one colour, legible at 16 pixels).
- **Numbers and names that read**: each gets an ink with 4.5 to 1 contrast against what is behind it, and an outline over stripes. The letters are drawn here, as block strokes: no font file and no system font. A Japanese name is set as system text.
- **Caps, helmets and banners**: a solid or two-tone cap with a contrast brim; football, hockey and batting helmets; retired-number banners as a rectangle, a pennant or a shield, with an optional small sweater.
- **A matchup and a lineup**: two kits side by side that say whether they clash; a formation of shirts, `4-4-2`, with names and numbers.
- **Whole uniforms**: the pants or shorts, the socks and the helmet that go with the jersey.
- **Presets**: nearly fifteen hundred eras of the NHL (more than four hundred, with its defunct teams), MLB, the NBA, the NFL, the CFL, soccer clubs and nations, rugby, and national hockey teams, as colours and stripes only.
- **Turning** (`./turn`): drag, arrow keys, Home and Space, or an automatic turn that waits for you.
- **A custom element** (`./element`) and an **embed page** for sites that cannot run script.
- English and Japanese labels. TypeScript types. No dependencies.

### What's in it

| Part | Entry | What it is |
| --- | --- | --- |
| Drawing | `@johnmorrisdotca/senshu-jerseys` | `renderJersey`, `renderCap`, `renderHelmet`, `renderBanner`, `kitMatchup`, `jerseyLineup`, and what they need. Pure: strings in, strings out. |
| Turning | `@johnmorrisdotca/senshu-jerseys/turn` | `jerseyFrame` (one angle) and `bindTurn` (a container that turns). |
| Element | `@johnmorrisdotca/senshu-jerseys/element`, `/define` | `<senshu-jersey>`, and the import that registers it. |
| Presets | `@johnmorrisdotca/senshu-jerseys/presets/<league>` | One module per league: `nhl`, `mlb`, `nba`, `nfl`, `cfl`, `soccer` and the others in [docs/presets.md](./docs/presets.md). |

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/senshu-jerseys
# or: pnpm add @johnmorrisdotca/senshu-jerseys
# or: yarn add @johnmorrisdotca/senshu-jerseys
```

Needs Node 22 or later on a server; in a browser, any current one.

### In a page

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys@0/dist/element-define.js"></script>

<senshu-jersey cut="soccer" colors="#c8102e,#ffffff" pattern="stripes" number="10" name="Gray" view="both"></senshu-jersey>
```

### On a server

```js
import { writeFileSync } from "node:fs";
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

writeFileSync(new URL("./shirt.svg", import.meta.url), renderJersey({ cut: "basketball", colors: ["#1f3a8a", "#f4f0e4"], number: 23, view: "back" }));
```

## Examples

### Draw a jersey

`cut` picks the shirt, `colors` is `[body, trim, second trim, number fill, number outline]` (or `body`, `trim` and `accent`), and `view` is `front`, `back` or `both`.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const front = renderJersey({ cut: "football", colors: ["#0b6e4f", "#f4f0e4", "#e8b900"], number: 12, sleeveNumbers: true, frontNumber: true });
const back = renderJersey({ cut: "football", colors: ["#0b6e4f", "#f4f0e4", "#e8b900"], number: 12, name: "Larocque", view: "back" });

console.log(front.includes("Football jersey, number 12, front")); // true
console.log(back.includes("Football jersey, number 12, back")); // true
```

### Patterns, collars and stripes

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// Barber-pole hoops: 9 units of trim, 9 of the second trim, 9 of the body.
const hoops = renderJersey({ cut: "hockey", colors: ["#c8102e", "#ffffff", "#14181c"], pattern: "hoops", repeat: [9, 1, 9, 2, 9, 0], collar: "crew", sleeveStripes: 0, hemStripes: 0 });
// Nine equal stripes, the sleeves plain.
const stripes = renderJersey({ cut: "soccer", colors: ["#6cace4", "#ffffff"], pattern: "stripes", stripeCount: 9, patternSleeves: false });
// A sash, and a yoke with the arms in the trim colour.
const sash = renderJersey({ cut: "soccer", colors: ["#ffffff", "#c8102e"], pattern: "sash" });
const yoke = renderJersey({ cut: "hockey", colors: ["#1f3a8a", "#f4f0e4"], yoke: "full-arm", collar: "v" });

console.log([hoops, stripes, sash, yoke].every((svg) => svg.startsWith("<svg"))); // true
```

Sleeve, hem and chest bands are lists of numbers read in pairs: a width in drawing units and a colour (`0` the body, `1` the trim, `2` the second trim, `3` the number's fill, the fourth colour), from the edge inward. `[4, 0, 3, 2, 6, 1, 3, 2]` is a gap of 4, a line of the second trim, a band of the trim, a line of the second trim.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const svg = renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], sleeveStripes: [4, 0, 3, 2, 6, 1, 3, 2], hemStripes: [4, 0, 3, 2, 6, 1, 3, 2], collar: "lace-up" });

console.log(svg.includes("<title")); // true
```

### Cuffs, diagonal text and wide arm bands

`cuffs` is the sleeve's end in a contrasting colour: a length in drawing units, or `[length, colour]` with the colour `1` the trim, `2` the second trim or `3` the number's fill. A seam shows where the knit starts, and it is drawn over the sleeve's stripes. `frontTextAngle` sets how the chest text runs: `"straight"`, `"arch"` (the basketball default), `"diagonal-up"` (each letter a step higher than the last, rising to the right) or `"diagonal-down"`. The letters are stepped along the slant, upright, and fitted to the chest of whichever cut it is. A wide band with thin edges at the elbow, and a set of three colours, need no new option: they are `sleeveStripes` and `hemStripes` lists, where the first pair is the gap from the cuff.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// Red tips: a white shirt with a red yoke and red cuffs 18 units long.
const tips = renderJersey({ cut: "hockey", colors: ["#ffffff", "#af1e2d", "#192168"], pattern: "yoke", yoke: "curved", cuffs: [18, 1], sleeveStripes: 0 });
// The caller's own word on a slant, rising to the right, and falling to the right.
const up = renderJersey({ cut: "hockey", colors: ["#0038a8", "#ffffff", "#ce1126"], frontText: "HOMETOWN", frontTextAngle: "diagonal-up" });
const down = renderJersey({ cut: "hockey", colors: ["#0038a8", "#ffffff", "#ce1126"], frontText: "HOMETOWN", frontTextAngle: "diagonal-down" });
// A wide ice-blue band at the elbow with thin red edges (a gap of 20, an edge, the band, an edge), and the same at the hem.
const band = renderJersey({ cut: "hockey", colors: ["#001628", "#99d9d9", "#e9072b"], sleeveStripes: [20, 0, 3, 2, 14, 1, 3, 2], hemStripes: [3, 0, 3, 2, 8, 1, 3, 2] });
// A set of three: yellow, white and yellow, with the body showing between.
const set = renderJersey({ cut: "hockey", colors: ["#c8102e", "#f1be48", "#ffffff"], sleeveStripes: [20, 0, 4, 1, 3, 0, 8, 2, 3, 0, 4, 1] });

console.log(up !== down); // true
console.log([tips, band, set].every((svg) => svg.startsWith("<svg"))); // true
```

The upper-arm number is `sleeveNumbers: true`: it sits where the cut puts the number on a sleeve (hockey: a third of the way down the arm; the other cuts: near the middle of it), turned to the sleeve's slant. A `patch` (`"C"` or `"A"`) is on the front only, on the wearer's left chest.

### Numbers and names that read

The number's colour is the one asked for if it reads on the shirt, and black or white if it does not. Over stripes it gets an outline. The letters are strokes, so there is no `<text>` for a Latin name.

```js
import { contrast, readColour, renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// White number asked for on a white shirt: the drawing writes dark ink.
const svg = renderJersey({ colors: ["#ffffff", "#ffffff"], number: 5, view: "back" });
console.log(svg.includes('stroke="#111111"')); // true
console.log(svg.includes("<text")); // false
console.log(contrast(readColour("#000000"), readColour("#ffffff"))); // 21
```

### Put your own crest on the chest

`crest` is any SVG document as text, shown as an image (so it runs no script and loads nothing), or an emblem's id if you plug in a renderer such as [Dougu Sports](https://github.com/johnmorrisdotca/dougu-sports) with `useEmblems`.

```js
import { renderJersey, useEmblems } from "@johnmorrisdotca/senshu-jerseys";

const crest = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f4f0e4"/></svg>`;
console.log(renderJersey({ cut: "soccer", crest }).includes("<image")); // true

// With dougu-sports: useEmblems(renderEmblem), then crest: "crest:shield".
useEmblems((id) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>${id}</title></svg>`);
console.log(renderJersey({ cut: "soccer", crest: "crest:shield" }).includes("<image")); // true
useEmblems(undefined);
```

### Presets: a team's colours and stripes

A preset holds a team's colours, stripe layout, yoke, collar and number colours for one era, and the matching pants, socks and helmet where they are known. It never draws a crest, a logo, a monogram, a wordmark or a sponsor's mark. Load a league, then use a preset by its id.

```js
import { renderJersey, usePresets, presetOptions } from "@johnmorrisdotca/senshu-jerseys";
import { MLB } from "@johnmorrisdotca/senshu-jerseys/presets/mlb";

usePresets(MLB);
const options = presetOptions("mlb:yankees-1929-home");
const svg = renderJersey({ ...options, number: 3, name: "Ruth", view: "both" });

console.log(options.pattern); // pinstripes
console.log(svg.startsWith("<svg")); // true
console.log(MLB.some((p) => p.team === "Houston Astros")); // true
```

### A whole uniform

`kit: true` draws the pants or shorts, the socks and the helmet (or the cap) under the jersey, from `pants`, `pantsTrim`, `pantsBands`, `socks`, `socksTrim`, `socksBands` and `helmet`. A preset holds them where they are known. `renderKit` is the same call by name.

```js
import { renderJersey, renderKit } from "@johnmorrisdotca/senshu-jerseys";

const set = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], pants: "#192168", pantsBands: [4, 2, 3, 1], socks: "#af1e2d", socksBands: [20, 0, 5, 1, 3, 2, 5, 1], helmet: "#192168" };
console.log(renderJersey({ ...set, kit: true }) === renderKit(set)); // true
```

### Caps, helmets and retired banners

```js
import { renderBanner, renderCap, renderHelmet } from "@johnmorrisdotca/senshu-jerseys";

const cap = renderCap({ colors: ["#c8102e", "#1b2a6b", "#f4f0e4"], tone: "two-tone", initials: "RS" });
const helmet = renderHelmet({ kind: "football", colors: ["#1f3a8a", "#f4f0e4"], mark: "number", number: 12, facing: "left" });
const banner = renderBanner({ shape: "shield", colors: ["#1f3a8a", "#f4f0e4", "#c8102e"], number: 9, name: "Beaumont", years: "1948-1963", sweater: true });

console.log(cap.includes("<title")); // true
console.log(helmet.includes("<title")); // true
console.log(banner.includes("Retired number banner 9")); // true
```

A caller's own letters go on a cap (up to three) and a banner. No helmet, cap or banner draws a team's mark. Championship banners, pennants and rings are in [Dougu Sports](https://github.com/johnmorrisdotca/dougu-sports).

### Two kits and a lineup

```js
import { jerseyLineup, kitClash, kitMatchup } from "@johnmorrisdotca/senshu-jerseys";

const away = { cut: "soccer", colors: ["#1f3a8a", "#ffffff"], label: "Gulls" };
const home = { cut: "soccer", colors: ["#c8102e", "#ffffff"], label: "Bison" };
console.log(kitMatchup({ away, home }).includes("Gulls vs Bison")); // true
console.log(kitClash(away, home)); // false
console.log(kitClash({ colors: ["#c8102e"] }, { colors: ["#c8102f"] })); // true

const players = Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `Player ${i + 1}` }));
console.log(jerseyLineup(players, { formation: "4-4-2", jersey: { cut: "soccer", colors: ["#c8102e", "#ffffff"] } }).includes("Lineup, 4-4-2")); // true
```

### Turn a jersey

`jerseyFrame` is the jersey at one angle: 0 is the front, 90 an edge where the cloth's thickness shows, 180 the back. `bindTurn` makes a container turn.

```js
import { jerseyFrame } from "@johnmorrisdotca/senshu-jerseys/turn";

const frames = [0, 45, 90, 135, 180].map((yaw) => jerseyFrame({ cut: "hockey", number: 9, name: "Gray", yaw }));
console.log(frames.length); // 5
console.log(frames[2].includes('data-yaw="90"')); // true
```

```js no-run
import { bindTurn } from "@johnmorrisdotca/senshu-jerseys/turn";

const turn = bindTurn(document.querySelector("#shirt"), { cut: "hockey", number: 9, name: "Gray" }, { autoPlay: false });
turn.play(); // or turn.pause(), turn.togglePlay(), turn.setYaw(180)
```

See [turning](./docs/turning.md) for the pointer, the keys and `prefers-reduced-motion`.

### Read and write options as text

The attributes of the element and the query of the embed page are the same words, read by one function and written by another.

```js
import { attributesFromOptions, embedCode, jerseyFromParams, jerseyToParams, optionsFromAttributes } from "@johnmorrisdotca/senshu-jerseys";

const options = { cut: "rugby", colors: ["#000000", "#ffffff"], number: 8 };
const attributes = attributesFromOptions(options);
console.log(attributes.cut); // rugby
console.log(optionsFromAttributes((name) => attributes[name] ?? null).number); // 8
console.log(jerseyToParams(options).toString().startsWith("cut=rugby")); // true
console.log(jerseyFromParams(new URLSearchParams("cut=rugby&number=8")).cut); // rugby
console.log(embedCode(options, "iframe").includes("embed.html?cut=rugby")); // true
```

## API

| Name | What it does |
| --- | --- |
| `renderJersey(options)`, `renderKit(options)` | A jersey (or the whole uniform) as SVG. |
| `titleOf(resolved)` | The accessible title a drawing gets, in `language`. |
| `renderCap`, `renderHelmet`, `renderBanner` | A cap, a helmet, a retired-number banner. |
| `kitMatchup`, `kitClash`, `jerseyLineup`, `formationRows` | Two kits face to face, whether they clash, a formation of shirts, and the rows a formation means. |
| `useEmblems` | Plug in an emblem renderer so that `crest` can be an id. |
| `usePresets`, `presetOf`, `presetOptions`, `loadedPresets`, `decode`, `defineLeague` | Load presets, find one, and read or write a preset's one-line spec. |
| `embedCode`, `EMBED_KINDS`, `SITE`, `CDN` | The text that puts a jersey in a page: element, iframe, module, SVG or data address. |
| `OPTION_ATTRIBUTES`, `attributesFromOptions`, `optionsFromAttributes`, `jerseyToParams`, `jerseyFromParams` | Options as attributes and as a query. |
| `CUT_IDS`, `CUTS`, `COLLAR_IDS`, `SLEEVE_IDS`, `PATTERN_IDS`, `TEXT_ANGLE_IDS`, `YOKE_IDS`, `CLOSURE_IDS`, `VIEW_IDS`, `LOOK_IDS`, `ARCH_IDS`, `PATCH_IDS`, `LANGUAGE_IDS` | The lists of what an option may be, and each cut's measures. |
| `CUT_NAMES`, `PATTERN_NAMES` | English and Japanese names. |
| `HELMET_KINDS`, `HELMET_MARKS`, `BANNER_SHAPES` | The helmets, their marks, and the banner shapes. |
| `contrast`, `readColour` | The contrast ratio of two colours, and a colour read from text. |
| `JERSEY_WIDTH`, `JERSEY_HEIGHT`, `VERSION` | The drawing's box, and the package's version. |

### Options

`cut`, `colors` or `body`, `trim`, `accent`, `numberFill`, `numberOutline`, `pattern`, `repeat`, `stripeCount`, `patternSleeves`, `collar`, `sleeve`, `yoke`, `closure`, `raglan`, `piping`, `armStripes`, `sleeveStripes`, `hemStripes`, `cuffs`, `chestBand`, `chestY`, `collarColor`, `sleeveColor`, `panels`, `number`, `name`, `nameArch`, `frontText`, `frontTextAngle`, `frontNumber`, `patch`, `sleeveNumbers`, `crest`, `view`, `look`, `size`, `language`, `title`, `description`, `kit`, `pants`, `pantsTrim`, `pantsBands`, `socks`, `socksTrim`, `socksBands` and `helmet`. A value that is not one of the allowed ones is replaced by the default; nothing throws. `size` is the width of one jersey in pixels (200 by default).

## Theming

The `cloth` and `flat` styles carry their own colours. The `line` style is drawn in `currentColor`, so it takes the text colour of the page and follows light and dark mode. The custom element's drawing sits in an open shadow root with a `part="box"`.

## Limits

Every limit here is held by a test.

- **A drawing is a pure function of its options.** The same options give the same string, with ids that are the same for the same drawing and differ between drawings, so several can share a page.
- **Every colour is checked.** Only `#rgb`, `#rrggbb` and `rgb()` are taken; anything else is the default.
- **Every text is escaped or drawn as strokes.** A crest is shown as an image, which runs no script and loads nothing.
- **No font is used** for a Latin number or name. A name with a character that has no glyph here (a Japanese name) is set as system text.
- **The drawing is about 17 kB gzipped; the turn about 14 kB more; a league of presets about 5 kB.**
- **A preset is colours and stripes only.** No crest, logo, monogram, wordmark or sponsor mark.

## Accessibility

Each drawing is `role="img"` with a `<title>` that says the cut, the number and the view, in English or Japanese (`language`). A turning container is a focusable group that says it turns, with the arrow keys, Home and Space; it starts still under `prefers-reduced-motion`, stops while a tab is hidden, and does nothing while nobody asks. Every control in the demo is 44 pixels or more.

## Browser and runtime support

Node 22 or later, and any current browser. The turn needs `requestAnimationFrame` and pointer events; the element needs custom elements and shadow DOM.

## Languages

The package's own words (cut and pattern names, accessible titles) are in English and Japanese; the demo is too. Corrections are welcome: [docs/references.md](./docs/references.md) lists where the facts come from.

## Presets

Nearly fifteen hundred uniforms of one team in one era, each written as a short line of colours and stripes and read into `renderJersey`'s options: [docs/presets.md](./docs/presets.md) lists every one with its id. They reproduce **colours and stripe patterns only, with no logos or crests**: no club crest, logo, monogram, wordmark or sponsor mark is drawn, and the chest stays empty or takes your own `crest`. That holds for defunct teams too, whose marks are still owned and sold today. Where a uniform's identity is mostly its chest mark, the preset still reads by its colours and stripes.

The colours and layouts are facts taken from the uniform sections of Wikipedia articles, Wikidata and the clubs' published colour codes, and recorded as data here; no picture is copied. Treat them as a first reading, not a proof: where a source gave only colour names the layout is the plainest one that fits, and a row that could not be confirmed is marked `unsure` in its source. Corrections with a source are welcome.

## Roadmap

- More eras, and the real count of stripes where a source gives it.
- Checked patterns and argyle.
- A cuff and a collar in a second colour for the tank cut.
- Kit view for turning.

## Architecture

`src/index.ts` is the pure entry. A jersey is drawn from a **cut** (a table of measures in a box 200 wide: the neck, shoulders, sleeves, armpits and hem), its silhouette is a rounded polygon mirrored about the middle, and what it carries (collar, bands, pattern, panels, folds) is laid over it inside clips. Letters are centre lines with a stroke. The turn is a pair of matrices on the front and the back and a few slices of the outline for the edge. [docs/turning.md](./docs/turning.md) says how.

## The name

Senshu (選手, せんしゅ) is Japanese for a player or an athlete: the person who wears the shirt.

## Where it comes from, and where it is used

Made for [itsutsu.com](https://itsutsu.com) and the sports pages of its sister sites, in the same style as [Kyogijo Stadiums](https://github.com/johnmorrisdotca/kyogijo-stadiums), which draws the field, and [Dougu Sports](https://github.com/johnmorrisdotca/dougu-sports), which draws the trophies and the gear.

### Used by

Nothing yet: it is not published. Kyogijo Stadiums can plug it in to draw the players on a field, the way it plugs in Dougu Sports.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Senshu Jerseys is one of twenty-eight packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).
- [Kyogijo Stadiums](https://github.com/johnmorrisdotca/kyogijo-stadiums) (競技場): sports fields, rinks, courts and ballparks drawn to scale as SVG, with each team and the score on them. [Demo](https://johnmorrisdotca.github.io/kyogijo-stadiums/).
- [Taisen Brackets](https://github.com/johnmorrisdotca/taisen-brackets) (対戦): a sport-agnostic tournament bracket, drawn as SVG, from a list of ties. [Demo](https://johnmorrisdotca.github.io/taisen-brackets/).
- [Dougu Sports](https://github.com/johnmorrisdotca/dougu-sports) (道具): sports emblems as SVG: trophies, medals, crests, and the ball and gear of every sport, with optional 3D turning. [Demo](https://johnmorrisdotca.github.io/dougu-sports/).
- [Senshu Jerseys](https://github.com/johnmorrisdotca/senshu-jerseys) (選手): sports jerseys, sweaters, kits, caps, helmets and retired-number banners as SVG, front and back, with optional 2.5D turning. [Demo](https://johnmorrisdotca.github.io/senshu-jerseys/).

**This package is Senshu Jerseys.** The demos of all twenty-eight share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install
pnpm check          # lint, types, tests, the build and the packed package
pnpm test:demo      # the demo, played in a real browser at a phone's width and a desk's
pnpm test:readme    # the README's and the docs' examples, run against the built package
pnpm dev            # the demo on http://127.0.0.1:7300/
pnpm sheets         # contact sheets of every cut, pattern, cap, helmet and banner
```

## Contributing

[CONTRIBUTING.md](./CONTRIBUTING.md) has the rules and the commands.

## Changes

[CHANGELOG.md](./CHANGELOG.md).

## Credits

Drawn for this package by John Morris. The team presets record facts from public sources: see [NOTICE.md](./NOTICE.md) and [docs/references.md](./docs/references.md).

## Licence

MIT. See [LICENSE](./LICENSE).
