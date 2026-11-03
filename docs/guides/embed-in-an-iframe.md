---
title: In an iframe
section: how-to
order: 5
description: Show a jersey in a page that cannot run script, with the embed page and an iframe.
---

Some places will not run a script: a CMS, a forum, a document. They can often show an `<iframe>`. The demo site has a page for that, `embed.html`, that draws what its address says and nothing else.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Senshu Jerseys in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/senshu-jerseys/embed.html?cut=hockey&colors=af1e2d,ffffff,192168&number=9&view=both"
      title="A hockey sweater, front and back"
      width="420"
      height="232"
      loading="lazy"
      style="border: 0"
    ></iframe>
  </body>
</html>
```

The page was opened with the iframe in a browser by the package's tests.

## What the address says

The query is the element's attributes. Colours may leave out the `#`.

| Query | Meaning |
| --- | --- |
| `cut`, `colors`, `number`, `name`, `pattern`, `collar` and the rest | The shirt, as for `renderJersey`. |
| `view` | `front`, `back` or `both`. |
| `turn=1` | The reader can turn it by hand. |
| `turn=auto` | It turns by itself. |
| `direction` | `clockwise` or `counterclockwise`. |
| `volume=1`, `yaw` | A garment with depth, and an angle to stop at. |

`embedCode(options, "iframe")` writes the snippet for a set of options.

## Size and colours

The page has a transparent background and draws in dark or light ink to suit the reader's colour scheme, so it sits on any page. Give the frame the shape of the picture: `width="420" height="232"` suits a jersey seen from the front. A frame that is too small scales the drawing down to fit.
