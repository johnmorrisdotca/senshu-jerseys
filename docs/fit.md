# Men's and women's cuts

Every cut has two fits. `fit: "mens"` is the default and draws exactly what the package always drew: straight and boxy, roomy over pads. `fit: "womens"` is the tailored shirt.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const mens = renderJersey({ cut: "hockey", colors: ["#1f3a8a", "#f4f0e4", "#c8102e"], pattern: "stripes", number: 19 });
const womens = renderJersey({ cut: "hockey", colors: ["#1f3a8a", "#f4f0e4", "#c8102e"], pattern: "stripes", number: 19, fit: "womens" });
```

In HTML it is the `fit` attribute (`<senshu-jersey cut="soccer" fit="womens">`), in a page's address `?fit=womens`, and a title says it ("Women's Soccer shirt"). A preset is only colours and stripes, so any preset can be worn in either fit: `{ ...presetOptions("..."), fit: "womens" }`.

## What changes

| | Men's | Women's |
|---|---|---|
| Body | full length | about a tenth shorter |
| Shoulders | as the pads need | 8 percent narrower (at least 4 units) |
| Chest | straight | 3 units narrower each side |
| Waist | nearly as wide as the chest | tapers in 10 units under the chest (8 on a tank) |
| Hem | straight down | flares back out a little, and a curved hem where the men's is level (a hockey sweater's stays level) |
| Sleeves | as cut | 4 units narrower at the cuff, a little shorter (a short sleeve about an eighth) |

The same table is used for every sport (`cutSpec(cut, fit)` returns it; `CUTS` stays the men's), so each of the seven cuts has both, with its own sleeves and collars.

## Everything follows the outline

The patterns (stripes, hoops, halves, sash, quarters, pinstripes), hem and sleeve stripes, yokes, the name, the number, a sleeve number, chest badges, the crest and every national layout are drawn from the women's outline, not clipped from the men's. The places for the number, the name and the badges move up with the shorter body and shrink with the narrower one, never past the waist. In the turning view (`volume: true`) the body is lofted from the same outline, so a side view shows the waist and the flared hem, and the cloth stays closed at every angle.

`test/fit.test.ts` holds this: the men's drawing is the same with or without the option, a bad value is the men's, the same options draw the same string, every place lies inside the outline, every pattern and layout draws, and the torso shows no hole every 15 degrees.
