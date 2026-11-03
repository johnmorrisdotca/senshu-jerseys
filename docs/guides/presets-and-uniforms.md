---
title: Presets, whole uniforms and lineups
section: how-to
order: 7
description: Draw a team's colours from a league's presets, put the pants, socks and helmet with the jersey, and set kits and lineups side by side.
---

A jersey you design is a handful of options. A jersey of a real team in a real year is a preset: the colours, the stripes, the collar and the yoke of one era, read into the same options. This guide loads a league, draws from a preset, completes the look with the rest of the uniform, and sets two kits or a team side by side.

## Load a league, use a preset

Presets are one module per league (`nhl`, `mlb`, `nba`, `nfl`, `cfl`, `soccer` and the others in [the list](../presets.md)), so a page takes only the league it names. `usePresets` loads a league once; `presetOptions` turns an id into options; the options go to `renderJersey` with a number and a name of yours.

```js
import { presetOptions, renderJersey, usePresets } from "@johnmorrisdotca/senshu-jerseys";
import { MLB } from "@johnmorrisdotca/senshu-jerseys/presets/mlb";

usePresets(MLB);
const options = presetOptions("mlb:yankees-1929-home");
const svg = renderJersey({ ...options, number: 3, name: "Ruth", view: "both" });

console.log(options.pattern); // pinstripes
console.log(svg.startsWith("<svg")); // true
console.log(MLB.some((p) => p.team === "Houston Astros")); // true
```

A preset is colours and stripes only. It never draws a crest, a logo, a monogram, a wordmark or a sponsor's mark, and that holds for defunct teams too. The chest stays empty or takes a `crest` of your own. In the element, `preset="mlb:yankees-1929-home"` does the same once the league is loaded.

## Find what is loaded

```js
import { loadedPresets, presetOf, usePresets } from "@johnmorrisdotca/senshu-jerseys";
import { NHL } from "@johnmorrisdotca/senshu-jerseys/presets/nhl";

usePresets(NHL);
const loaded = loadedPresets();
console.log(loaded.length > 100, presetOf(loaded[0].id)?.id === loaded[0].id);
```

`decode` reads a preset's one-line spec, `defineLeague` makes a league of your own from the same lines, and `PRESETS` and `LEAGUES` in the `presets` entry are every league at once, for a tool that lists them. The colours are facts taken from the uniform sections of Wikipedia articles, Wikidata and the clubs' published colour codes; where a source gave only colour names the layout is the plainest one that fits, and a row that could not be confirmed is marked `unsure`.

## The whole uniform

`kit: true` draws the pants or shorts, the socks and the helmet (or the cap) under the jersey, from `pants`, `pantsTrim`, `pantsBands`, `socks`, `socksTrim`, `socksBands` and `helmet`. A preset holds them where they are known. `renderKit` is the same call by name. Bands are read in pairs: a width in drawing units and a colour, `0` the garment's own colour, `1` its trim, `2` the second trim.

```js
import { renderJersey, renderKit } from "@johnmorrisdotca/senshu-jerseys";

const set = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], pants: "#192168", pantsBands: [4, 2, 3, 1], socks: "#af1e2d", socksBands: [20, 0, 5, 1, 3, 2, 5, 1], helmet: "#192168" };
console.log(renderJersey({ ...set, kit: true }) === renderKit(set)); // true
```

## Two kits, and whether they clash

`kitMatchup` sets two kits face to face, away then home, each with a name under it. `kitClash` says whether two kits are too alike to tell apart on a screen (it compares the body colours by their contrast, so a red and a red a shade apart clash).

```js
import { kitClash, kitMatchup } from "@johnmorrisdotca/senshu-jerseys";

const away = { cut: "soccer", colors: ["#1f3a8a", "#ffffff"], label: "Japan" };
const home = { cut: "soccer", colors: ["#d52b1e", "#ffffff"], label: "Canada" };
console.log(kitMatchup({ away, home }).includes("Japan vs Canada")); // true
console.log(kitClash(away, home)); // false
console.log(kitClash({ colors: ["#c8102e"] }, { colors: ["#c8102f"] })); // true
```

## A lineup

`jerseyLineup` sets a team's shirts in rows, as a formation (`4-4-2`) or in rows you give (`rows: [5, 6]`). Neighbouring shirts tuck under each other by default, like shirts hung on a rail; `overlap` is a fraction of a shirt's width, from 0 to 0.4, and 0 leaves them apart.

```js
import { jerseyLineup } from "@johnmorrisdotca/senshu-jerseys";

const players = Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `Player ${i + 1}` }));
const team = jerseyLineup(players, { formation: "4-4-2", jersey: { cut: "soccer", colors: ["#c8102e", "#ffffff"] } });
const apart = jerseyLineup(players, { rows: [5, 6], overlap: 0 });
const tucked = jerseyLineup(players, { rows: [5, 6], overlap: 0.25 });
console.log(team.includes("Lineup, 4-4-2"), apart.includes("<filter"), tucked.includes("<filter")); // true false true
```

## Officials

The referees, linesmen and umpires of hockey, basketball, football, soccer, baseball, rugby and lacrosse are presets too (`ref:nhl-modern-referee`, `ref:soccer-yellow`, `ref:mlb-umpire-navy`), built from options of their own: armbands, a chest pocket, a plain badge spot and the zip and long-point collars. [Officials](../officials.md) lists them with their sources.

## Next

- Put the jersey in a page, or turn it: [Getting started](getting-started.md), [turning](../turning.md).
- Why a preset has no crest, and how drawings stay the same everywhere: [How it works](how-it-works.md) and [Architecture](architecture.md).
