---
title: With Vite or webpack
section: how-to
order: 3
description: Install the package and use the element or the drawing functions in a Vite or webpack project.
---

Install the package:

```sh
npm install @johnmorrisdotca/senshu-jerseys
```

The package has two kinds of entry. `@johnmorrisdotca/senshu-jerseys` is pure functions that return SVG strings. `@johnmorrisdotca/senshu-jerseys/define` registers the `<senshu-jersey>` element. Both are plain ES modules with no dependencies, so any bundler takes them as they are.

## Vite

Import `define` once and the tag works in your HTML. The drawing functions give the same kind of picture as a string.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys with Vite</title>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9"></senshu-jersey>
    <div id="plain"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

```ts no-run
import "@johnmorrisdotca/senshu-jerseys/define";
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// The element draws itself once it is registered; renderJersey gives the same kind of drawing as a string.
document.querySelector("#plain")!.innerHTML = renderJersey({ cut: "soccer", colors: ["#192168", "#ffffff"], pattern: "hoops", number: 10 });
```

## webpack

webpack 5 needs no loader for the package. The entry imports `define` and makes the tag by hand:

```js no-run
import "@johnmorrisdotca/senshu-jerseys/define";

const jersey = document.createElement("senshu-jersey");
jersey.setAttribute("cut", "hockey");
jersey.setAttribute("colors", "#af1e2d,#ffffff,#192168");
jersey.setAttribute("number", "9");
document.body.append(jersey);
```

The configuration is the smallest one that builds it:

```mjs no-run
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

## Importing less

Import the entry you use: the drawing functions are about 19 kB gzipped, turning is about 14 kB more (`@johnmorrisdotca/senshu-jerseys/turn`), and each league's presets are their own module (`@johnmorrisdotca/senshu-jerseys/presets/nhl`). A bundler leaves out what you do not import.
