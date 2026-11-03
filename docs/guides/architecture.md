---
title: Architecture
section: explanation
order: 13
description: The pipeline from options to an SVG string, the rules that keep a jersey the same everywhere, and the checks that hold them.
---

This guide is the map for someone who wants to change the package or to know why it behaves as it does. [How it works](how-it-works.md) says what a jersey is; this one follows one call, `renderJersey(options)`, through the files, and names the rules the files keep.

## The pipeline

```text
options ──► options.ts ──► cuts.ts ──► jersey.ts ──► svg.ts ──► one string of SVG
 (any)      (checked,       (the cut's    (silhouette,   (the root, the
             cleaned)        measures)     pattern,       accessible
                                           parts, cloth,  name, the defs)
                                           text)            │
                                              ├─ glyphs.ts, text.ts: numbers and names as strokes
                                              ├─ colour.ts: colours read, mixed and compared for contrast
                                              └─ overlap.ts, kit.ts, uniform.ts: shirts in a row, a matchup, a whole uniform
```

- **`options.ts`** reads what comes from outside. Every value is checked against the lists of what it may be, a colour is read as `#rgb`, `#rrggbb` or `rgb()`, and text is cleaned. A value that is not allowed is replaced by the default: nothing throws.
- **`cuts.ts`** holds each cut as a table of measures in a drawing 200 units wide (the middle of the shirt is x = 100), and what its sport's shirt carries: the sleeves, the collars, and where the number, the name, a crest and the patches go.
- **`jersey.ts`** draws one side of a shirt: its silhouette, what the cut carries, its pattern, the cloth's folds and edge, and the number, name and crest.
- **`svg.ts`** wraps the drawing: the root element, an accessible name from `title.ts` in English or Japanese, and the shared defs. **`render.ts`** is `renderJersey`: front, back or both side by side.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// A value that is not allowed is replaced by the default, and nothing throws.
const odd = renderJersey({ cut: "polo", colors: ["not a colour"], number: 9 });
const plain = renderJersey({ number: 9 });
console.log(odd === plain, odd.startsWith("<svg"));
```

## Four rules

1. **A drawing is a pure function of its options.** No clock, no random number, no counter, no DOM. Every id in a drawing comes from a hash of the options, so two drawings on one page never share one by accident, and the same options give the same string on a server, in a test and in a browser.
2. **No font.** Latin numbers and names are drawn from `glyphs.ts` as block strokes with square ends and mitred corners, as a jersey's tackle-twill letters are, so a number looks the same everywhere. A character with no glyph (a Japanese name) is set as system text, one character at a time so that it can be arched; `brush-kana` is an entry of outlines for a hand of your own.
3. **Everything from outside is safe on the way in.** Colours are read from three numbers, so one can be written into an attribute without escaping. Text is escaped or drawn as strokes. A crest is shown as an image, which runs no script and loads nothing. An emblem comes from a renderer you pass, so the package bundles no art and has no dependency.
4. **Contrast is a rule, not a hope.** Each number and name gets an ink with 4.5 to 1 contrast against what is behind it, and an outline over stripes. A preset is colours and stripes only, with no crest, logo or wordmark.

```js
import { contrast, renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const options = { cut: "soccer", colors: ["#c8102e", "#ffffff"], number: 10, name: "Gray" };
console.log(renderJersey(options) === renderJersey(options));
console.log(contrast("#000000", "#ffffff") > 20);
```

## The entries

| Entry | What it holds |
| --- | --- |
| `@johnmorrisdotca/senshu-jerseys` | the drawings (`renderJersey`, `renderCap`, `renderHelmet`, `renderBanner`, `renderJudogi`, ...), the options as text, `embedCode`, the registry of presets |
| `/turn` | turning: `jerseyFrame`, `bindTurn`, `judogiCanvas`, `judogiTurn` |
| `/element`, `/define` | the `<senshu-jersey>` custom element, and the import that registers it |
| `/brush-kana` | Japanese letters as outlines in a pen hand |
| `/presets/<league>` | one league's presets, about 5 kB, taken only where imported |

Each stands apart: a page that draws a flat jersey loads none of the turning code, and one that names a league loads only that league.

## Turning is a second drawing of the same shirt

`turn.ts` makes the jersey a thin piece of cloth that turns about its vertical axis: the front foreshortens to an edge at 90 degrees, where the cloth's thickness shows, and the back shows from 90 to 270. A flat jersey turns by changing the transforms of a few parts, never by drawing again. With `volume: true`, `volume.ts` makes the shirt a garment with depth: the torso is a loft of ellipses, each sleeve a tapered tube, and the flat front and back drawings are wrapped over them in a grid of small cells. The judogi does the same on a canvas (`judogiCanvas`, one WebGL context for the whole page and a canvas held to 4096 pixels a side).

Nothing runs while nothing changes: no timer while the jersey is still, nothing while it is out of sight or the tab is hidden, and no more than about sixty frames a second.

## Data comes from a script, docs from the data

The presets are written as one short line of colours and stripes each and read by `decode` into the options of `renderJersey`; `docs/presets.md` is made from them by `pnpm presets:doc`, and `pnpm test:readme` runs it with `--check`, so a table cannot fall behind the code. Do not edit a made file; change its source and run the script.

## How it is kept true

| Check | What it holds |
| --- | --- |
| `pnpm check` | lint, types, the unit tests (the drawing's determinism, the contrast of every number, hostile input), the build and the packed package |
| `pnpm test:readme` | the made documents, then every example in the README, the docs and the guides, run against the built package |
| `pnpm test:usage` | every way of using the package that the guides show, built or run against the package as npm packs it |
| `pnpm test:demo` | the demo in a real browser at a phone's width and a desk's |
| `pnpm docs:check` | every export has a doc comment and a running example; every guide has its front matter and its links lead somewhere |

The family's shared files (`scripts/family-template.mjs`, `scripts/docs-site.mjs` and the rest) are copied byte for byte between packages; do not edit one here.
