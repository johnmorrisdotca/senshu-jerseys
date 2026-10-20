# Hockey patterns: shrinking bands and sawtooth sleeves

[Back to the README](../README.md) · English

Four original hockey sweaters, two layouts in a home and an away colourway, that show what the sleeve and yoke options of 0.8.0 draw. They are plain colours and stripes: nothing in them is a team's crest, logo or sponsor, and no team's real sweater is copied.

<p align="center">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/patterns-desk-dark.webp">
<img alt="Four hockey sweaters on ice, the front above and the back below. A white sweater with a pointed red yoke and red sleeve bands that thin out toward the cuff, and the same in navy and white; a black sweater with a curved red yoke, red and white sleeves whose red ends in a row of teeth, and the same in white and black." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/patterns-desk-light.webp" width="760">
</picture>
</p>

- **Shrinking bands** (`hockey:shrinking-bands-2026-home` and `-away`): a pointed yoke that ends in a V, five sleeve bands whose widths go from 9 at the cuff to 2 higher up, and three hem bands that thin out the same way. They are `yoke: "pointed"` and `{ shrink: { count, from, to, colour?, gap? } }` on `sleeveStripes` and `hemStripes`.
- **Sawtooth sleeves** (`hockey:sawtooth-sleeves-2026-home` and `-away`): a curved yoke, and on each sleeve a row of teeth where two sleeve colours meet, `sleeveTeeth: { at, colour, count, depth, direction? }`.

## Draw one

```js
import { renderJersey, presetOptions, usePresets } from "@johnmorrisdotca/senshu-jerseys";
import { HOCKEY_PATTERNS } from "@johnmorrisdotca/senshu-jerseys/presets/hockey-patterns";

usePresets(HOCKEY_PATTERNS);
console.log(HOCKEY_PATTERNS.length); // 4

// The preset's options, with a name and a number of one's own.
const front = renderJersey({ ...presetOptions("hockey:sawtooth-sleeves-2026-home"), name: "Tanaka", number: 19 });
const back = renderJersey({ ...presetOptions("hockey:shrinking-bands-2026-away"), name: "Okafor", number: 17, view: "back" });
console.log(front.includes("<svg"), back.includes("<svg")); // true true
```

The options behind each preset are in [the sleeves page](./sleeves.md) and [the README](../README.md#cuffs-diagonal-text-and-wide-arm-bands), so the same bands and teeth can go on any colours, and every preset is listed with its colours in [the presets](./presets.md).
