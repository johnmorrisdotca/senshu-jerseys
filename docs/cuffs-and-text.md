# Cuffs, diagonal text and wide arm bands

[Back to the README](../README.md) · English

`cuffs` is the sleeve's end in a contrasting colour: a length in drawing units, or `[length, colour]` with the colour `1` the trim, `2` the second trim or `3` the number's fill. A seam shows where the knit starts, and it is drawn over the sleeve's stripes. `frontTextAngle` sets how the chest text runs: `"straight"`, `"arch"` (the basketball default), `"diagonal-up"` (each letter a step higher than the last, rising to the right) or `"diagonal-down"`. The letters are stepped along the slant, upright, and fitted to the chest of whichever cut it is. A wide band with thin edges at the elbow, and a set of three colours, need no new option: they are `sleeveStripes` and `hemStripes` lists, where the first pair is the gap from the cuff.

`sleeveStripes` and `hemStripes` also take `{ shrink: { count, from, to, colour?, gap? } }`: `count` bands (2 to 8) whose widths go evenly from `from` at the cuff or the hem to `to`, each followed by a gap of `gap` times its own width (1 by default), so the stripes and the space between them both thin out; `colour` is `1` (the default) or `2`. `sleeveTeeth: { at, colour, count, depth, direction }` is a sawtooth edge round each sleeve: the colour (`1` or `2`) fills from a row of `count` teeth `depth` units deep, `at` percent of the way down, to the cuff, and the teeth point to the `"shoulder"` (the default) or the `"cuff"`. `yoke: "pointed"` is a yoke that ends in a V. All are shapes made from numbers and colours, never a mark. See `hockey-patterns` in [presets](./docs/presets.md).

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// A white shirt with a pointed red yoke and five sleeve bands that thin out toward the cuff.
const thinning = renderJersey({ cut: "hockey", colors: ["#ffffff", "#c8102e", "#1b2a6b"], yoke: "pointed", sleeveStripes: { shrink: { count: 5, from: 9, to: 2 } }, hemStripes: { shrink: { count: 3, from: 7, to: 3 } } });
// Red sleeves under a black body with a row of white teeth where they change colour.
const teeth = renderJersey({ cut: "hockey", colors: ["#151515", "#c8102e", "#ffffff"], yoke: "curved", sleeveColor: 1, sleeveTeeth: { at: 58, colour: 2, count: 7, depth: 9 } });
console.log([thinning, teeth].every((svg) => svg.startsWith("<svg"))); // true
```


```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

// Red tips: a white shirt with a red yoke and red cuffs 18 units long.
const tips = renderJersey({ cut: "hockey", colors: ["#ffffff", "#af1e2d", "#192168"], pattern: "yoke", yoke: "curved", cuffs: [18, 1], sleeveStripes: 0 });
// The caller's own word on a slant, rising to the right, and falling to the right.
const up = renderJersey({ cut: "hockey", colors: ["#0038a8", "#ffffff", "#ce1126"], frontText: "HOMETOWN", frontTextAngle: "diagonal-up" });
const down = renderJersey({ cut: "hockey", colors: ["#0038a8", "#ffffff", "#ce1126"], frontText: "HOMETOWN", frontTextAngle: "diagonal-down" });
// A wide ice-blue band at the elbow with thin red edges (a gap of 20, an edge, the band, an edge), and the same at the hem.
const band = renderJersey({ cut: "hockey", colors: ["#001628", "#99d9d9", "#e9072b"], sleeveStripes: [20, 0, 3, 2, 14, 1, 3, 2], hemStripes: [3, 0, 3, 2, 8, 1, 3, 2] });
// A set of three: yellow, white and yellow, with the body showing between.
const set = renderJersey({ cut: "hockey", colors: ["#c8102e", "#f1be48", "#ffffff"], sleeveStripes: [20, 0, 4, 1, 3, 0, 8, 2, 3, 0, 4, 1] });

console.log(up !== down); // true
console.log([tips, band, set].every((svg) => svg.startsWith("<svg"))); // true
```

The upper-arm number is `sleeveNumbers: true`: it sits where the cut puts the number on a sleeve (hockey: a third of the way down the arm; the other cuts: near the middle of it), turned to the sleeve's slant. `"left"` or `"right"` (the wearer's) picks a side, and `sleeveLeft` and `sleeveRight` give each sleeve its own number, size, place, colours and a plain patch; on the turning garment (`volume: true`) they stay on the arm as it turns: see [sleeves](./docs/sleeves.md). A `patch` (`"C"` or `"A"`) is on the front only, on the cut's own side of the chest; `chestBadges` places captain's and alternate's letters, plain patches and flags, each on the wearer's left or right breast: see [chest badges](./docs/chest.md).
