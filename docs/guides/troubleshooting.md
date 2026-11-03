---
title: Troubleshooting and questions
section: troubleshooting
order: 11
description: Why nothing appears, and the errors people meet in frameworks and on servers.
---

## Nothing appears

- **A plain page with `import "@johnmorrisdotca/senshu-jerseys/define"` in a script tag.** A browser cannot resolve a package name. Use a CDN address ([plain HTML](html-and-cdn.md)), an import map, or a bundler ([bundlers](bundlers.md)).
- **The script is not a module.** Use `<script type="module">`.
- **The console says the tag is not defined.** The import has not run, or a framework removed an unknown tag before the element was registered: see [frameworks](frameworks.md).
- **The jersey is tiny or cut off.** The element is as wide as its `size` attribute; inside a flex or grid container give it a width.

## "HTMLElement is not defined", or a server render fails

The element was imported on a server. Import `/define` only in code that runs in a browser ([frameworks](frameworks.md)); on a server draw with `renderJersey()` ([TypeScript and Node](typescript-and-node.md)).

## Vue: "Maximum call stack size exceeded"

A component file called `SenshuJersey.vue` renders itself when its template says `<senshu-jersey>`. Rename the file.

## Vue says "Failed to resolve component: senshu-jersey"

Tell the compiler the tag is a custom element: `isCustomElement` in [frameworks](frameworks.md).

## A colour or a cut is ignored

A value that is not valid is left out, so the default is drawn. Check the spelling of `cut` and that each colour is `#rgb`, `#rrggbb` or `rgb(r, g, b)`.

## The iframe is blank

Check the address of `embed.html` and that your page allows frames from `johnmorrisdotca.github.io` (a `frame-src` policy).

## The package is large in my bundle

Import the entry point you use, not everything: the drawing functions are about 19 kB gzipped, and each league's presets are their own module.
