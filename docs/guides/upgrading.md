---
title: Upgrading
section: upgrading
order: 12
description: What changed between versions and what to do about it. The package is 0.x: read this before a minor version.
---

The package is at 0.x, so a minor version (0.36 to 0.37) may change behaviour. Each release's notes are in the [changelog](../../CHANGELOG.md); this page lists what needs your action.

## To 0.37: speed buttons

New: `bindTurn`'s handle has `speed()` and `setSpeed(degreesASecond)`, to change how fast it turns by itself while it turns. Nothing you have breaks. The demo takes kazoku-ui 0.14: Auto-turn's speeds are the family's buttons, 0.5×, 1× and 2× (Slow, Medium and Fast are gone), kept in the address as `pace` (`?pace=2`) and not `speed`; the jersey's own Reverse button stays.

## To 0.36: Centre in the demo

Nothing in the package changed. The demo's designer and Uniforms page take kazoku-ui 0.12: a Centre button, a pan that cannot lose the piece, and a zoom slider with marks.

## To 0.35: the documentation site

Nothing in the package changed. New: the documentation site, a guide for each way of using the package, and doc comments with an example on every export.

## To 0.34: kana outlines

New entry point `@johnmorrisdotca/senshu-jerseys/brush-kana` (`brushKana`) and `box: "em"` for `fontToPath`. Nothing you have breaks.

## To 0.33.3: a limit on the canvas

`judogiCanvas` holds its canvas to 4096 pixels a side and 6 million in all, and all canvases share one WebGL context. A box wider than that is drawn smaller; nothing in your code changes.

## Before 0.33

See the changelog: each entry says what was added or changed, and a change that needs your action is marked.
