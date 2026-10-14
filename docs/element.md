# The element and the embed page

## `<senshu-jersey>`

Every option of `renderJersey` is an attribute. The drawing is in an open shadow root.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/senshu-jerseys@0/dist/element-define.js"></script>

<senshu-jersey cut="hockey" colors="#af1e2d,#ffffff,#192168" number="9" name="Beaumont" turnable autoplay speed="30"></senshu-jersey>
```

| Attribute | Meaning |
| --- | --- |
| `cut`, `colors`, `body`, `trim`, `accent`, `number-fill`, `number-outline` | The shirt and its colours (`colors` is a comma list). |
| `pattern`, `repeat`, `stripe-count`, `pattern-sleeves`, `collar`, `sleeve`, `yoke`, `closure`, `raglan`, `piping` | What it carries. |
| `sleeve-stripes`, `hem-stripes`, `arm-stripes`, `cuffs`, `chest-band`, `chest-y`, `collar-color`, `sleeve-color`, `panels` | Bands: a number, or a list of width and colour pairs (`cuffs` is a length, or a length and a colour). |
| `number`, `name`, `name-arch`, `front-text`, `front-text-angle` (`straight`, `arch`, `diagonal-up`, `diagonal-down`), `front-number`, `patch`, `sleeve-numbers`, `crest` | What is written on it. |
| `view`, `look`, `size`, `language`, `title`, `description` | How it is drawn. |
| `kit`, `pants`, `pants-trim`, `pants-bands`, `socks`, `socks-trim`, `socks-bands`, `helmet` | The whole uniform. |
| `preset` | The id of a preset loaded with `usePresets`. |
| `turnable` | The reader can turn it (drag, arrow keys, Home, Space). |
| `autoplay`, `speed`, `yaw` | Turn by itself (not under `prefers-reduced-motion`), how fast, and where from. |

Setting `options` as a property lays an object under the attributes. `play()`, `pause()` and `togglePlay()` start and stop the turn. The element cleans up when it is removed from the page.

```js
import { SENSHU_ATTRIBUTES, SENSHU_TAG } from "@johnmorrisdotca/senshu-jerseys/element";

console.log(SENSHU_TAG); // senshu-jersey
console.log(SENSHU_ATTRIBUTES.includes("turnable")); // true
```

`@johnmorrisdotca/senshu-jerseys/element` exports the class and `defineSenshuJersey(tag)`; importing it registers nothing. `@johnmorrisdotca/senshu-jerseys/define` registers `senshu-jersey`.

## `embed.html`

For a CMS that cannot run script: an `<iframe>` of the demo's `embed.html` that draws what its address says.

```html
<iframe src="https://johnmorrisdotca.github.io/senshu-jerseys/embed.html?cut=hockey&colors=af1e2d,ffffff,192168&number=9&view=both" title="Hockey sweater" style="width:100%;max-width:420px;aspect-ratio:420 / 232;border:0"></iframe>
```

The query is the element's attributes (colours may leave out the `#`). `turn=1` lets the reader turn it and `turn=auto` turns it by itself. `embedCode(options, kind)` writes the snippet for a set of options in any of five ways: `element`, `iframe`, `module`, `svg` and `data`.

```js
import { embedCode } from "@johnmorrisdotca/senshu-jerseys";

console.log(embedCode({ cut: "hockey", number: 9 }, "element").includes("<senshu-jersey")); // true
console.log(embedCode({ cut: "hockey", number: 9 }, "data").startsWith("data:image/svg+xml")); // true
```
