---
title: In a plain HTML page, from a CDN
section: how-to
order: 2
description: Add a jersey to any page with one script tag from jsDelivr or unpkg.
---

A page with no build step loads the package from a CDN. Both pages below were opened in a browser by the package's tests, with the CDN's answer standing in for the real one, and the files they name are in the published package.

## From jsDelivr

jsDelivr serves each file of the package as it is. The package has no dependencies, so the one file `dist/element-define.js` is the whole element:

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

The script registers `<senshu-jersey>`. With no version in the address you get the latest; pin one for a page that must not change under you, as in `@johnmorrisdotca/senshu-jerseys@0.38.0/dist/element-define.js`.

## From unpkg

unpkg serves the same file at its own address:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/senshu-jerseys/dist/element-define.js"></script>
  </head>
  <body>
    <senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" name="Beaumont"></senshu-jersey>
  </body>
</html>
```

## Choosing a CDN version

A CDN address without a version follows the latest release, and this package is 0.x, where a minor version may change things ([upgrading](upgrading.md)). Write an exact version in anything you publish.

## Content-Security-Policy

A page with a strict policy needs the CDN's host in `script-src`. The element sets no inline script. It writes a `style` element inside its own shadow root, so a policy that forbids inline styles needs `style-src 'unsafe-inline'` or a nonce for it.
