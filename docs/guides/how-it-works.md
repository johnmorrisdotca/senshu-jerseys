---
title: How it works
section: explanation
order: 10
description: How a jersey is drawn as SVG, why it is a pure function, and how turning stays light.
---

## A jersey is a function

`renderJersey(options)` returns an SVG document as a string. It is a pure function of its options: the same options give the same string, with no clock, no random number and no network. That is what lets a server draw it, a test compare it, and a page cache it.

The numbers and names are drawn as paths by the package itself, as block strokes, so they look the same everywhere: there is no font file and no system font to differ. Japanese names use the hands the package ships.

## Colour and contrast

Each number and name gets an ink with 4.5 to 1 contrast against what is behind it, and an outline over stripes. A preset is colours and stripes only: no crest, logo or wordmark.

## Turning without a heavy loop

Turning is its own entry, `@johnmorrisdotca/senshu-jerseys/turn`. A flat jersey turns by changing the transforms of a few parts, never by drawing again. A garment with volume is drawn once and its cells are moved. Nothing runs while nothing changes: no timer while the jersey is still, nothing while it is out of sight or the tab is hidden, and no more than about sixty frames a second. A judogi shown on a canvas shares one WebGL context for the whole page and is held to 4096 pixels a side and 6 million in all.

## Small

The drawing is about 19 kB gzipped and the turn about 14 kB more. A league of presets is about 5 kB, and a page loads only the leagues it names. The package has no runtime dependencies.
