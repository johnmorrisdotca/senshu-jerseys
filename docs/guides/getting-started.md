---
title: Getting started
section: tutorial
order: 1
description: Put a jersey on a page with one script tag, change its colours and number, and let the reader turn it, in about five minutes.
---

This guide puts a hockey sweater on a page, changes its colours and number, and lets the reader turn it. You need a text editor and a browser. Nothing is installed: the page loads the package from a CDN.

## 1. A page with a jersey

Save this as `jersey.html` and open it. The `<senshu-jersey>` tag is the jersey; the script above it is what makes the tag work.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys/dist/element-define.js"></script>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" name="Beaumont"></senshu-jersey>
  </body>
</html>
```

The jersey is an SVG, drawn in the browser from the tag's attributes. `cut` picks the shirt (`hockey`, `baseball`, `basketball`, `football`, `soccer`, `rugby` or `handball`). `colors` is a list of colours: the body, then the trim, then a second trim. `number` and `name` are written on the back.

## 2. Change it

Every option of `renderJersey` is an attribute of the tag. Try `view="both"` to see the front and the back, `pattern="stripes"` or `pattern="hoops"`, and `collar="lace-up"`. The list is in [the element](entry:element).

## 3. Let the reader turn it

Add `turnable` and the reader can drag the jersey round, or press the left and right arrow keys; Home faces the front and Space starts and stops it. Add `autoplay` and it turns by itself (not for a reader who prefers reduced motion). `volume` draws the shirt as a garment with thickness, so the side view has a body.

```html
<senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" turnable autoplay volume></senshu-jersey>
```

## 4. Where next

- Use it from a bundler or a framework: [bundlers](bundlers.md) and [frameworks](frameworks.md).
- Show it in someone else's page without a script of your own: [embed in an iframe](embed-in-an-iframe.md).
- Draw it on a server, or with types: [TypeScript and Node](typescript-and-node.md).
- The reference for every function: [the main entry](entry:main).
- Something does not appear: [troubleshooting](troubleshooting.md).
