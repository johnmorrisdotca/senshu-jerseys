---
title: TypeScript and Node
section: how-to
order: 6
description: Types for every option, and drawing jerseys and judogi on a server with no DOM.
---

## TypeScript

The package ships its own types. Every option is a typed object, and a value that is not allowed is an error:

```ts
import { jerseyToParams, renderJersey, type JerseyOptions } from "@johnmorrisdotca/senshu-jerseys";
import type { SenshuJersey } from "@johnmorrisdotca/senshu-jerseys/element";
import { bindTurn, type TurnHandle } from "@johnmorrisdotca/senshu-jerseys/turn";

const options: JerseyOptions = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9 };
const svg: string = renderJersey(options);
console.log(svg.startsWith("<svg"), String(jerseyToParams(options)));

export function turn(box: HTMLElement): TurnHandle {
  return bindTurn(box, options, { autoPlay: true });
}

export function recolour(jersey: SenshuJersey): void {
  jersey.setAttribute("colors", "#192168,#ffffff");
}

// @ts-expect-error "polo" is not a cut
renderJersey({ cut: "polo" });
```

The element's class is `SenshuJersey` (from `@johnmorrisdotca/senshu-jerseys/element`, which registers nothing) and the turning functions are in `@johnmorrisdotca/senshu-jerseys/turn`.

## Node and servers

The drawing functions are pure: no clock, no random number, no DOM and no browser globals. Node 22 or later draws the same SVG a browser does:

```mjs
import { renderJersey, renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const jersey = renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both" });
const judogi = renderJudogi({ mode: "suit", belt: "black" });
const page = `<!doctype html><title>Jerseys</title>${jersey}${judogi}`;
console.log(jersey.startsWith("<svg"), judogi.startsWith("<svg"), page.length > 1000);
```

Write the string to a file, return it from a handler, or put it in an e-mail as an `img` with a `data:` address (`embedCode(options, "data")`). Importing the element in Node does not fail, but it draws nothing: use the functions.
