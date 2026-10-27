# Judogi

The jacket, the trousers and the belt as original SVG: contest white or blue, the rank belts, named sizes, laid out as separate pieces (as product photographs show them) or worn as a suit. Each piece is a garment with volume that turns, drawn by the same pipeline as the jerseys: the jacket's body is thick to the hem and narrow from the armpit to the belt, and its sleeves are straight bands set on along the armhole, as wide under the arm as at the cuff; the trousers' hips part into two legs, so they turn as two legs and not as one board. The designer keeps every choice in the address and saves SVG or PNG.

Look at the [designer](https://johnmorrisdotca.github.io/senshu-jerseys/judogi.html) (`?colour=white&mode=pieces&belt=black&size=170`).

<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/judogi-desk-dark.webp">
<img alt="Four judogi drawings: a white jacket with a black belt tied at the front, turned a little; its white trousers with the drawstring and the reinforced knees; a blue suit worn with a black belt, turned the other way; and the white jacket from the back with a brown belt." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/judogi-desk-light.webp" width="720">
</picture>

## What is drawn

- **Jacket (uwagi):** the collar standing round the back of the neck and running down the front as a band of six stitched rows, the wearer's left crossing over the right (turned, a band of its own 9 mm thick, with edges; the near sleeve hangs over it and over the belt); the inside of the neck in shadow; a fine grain weave on the upper body and quilted diamonds on the skirt below the waist seam; side vents; turned and stitched cuffs and hem.
- **Trousers (zubon):** a deep waistband gathered by a drawstring tied in a bow at the front; the hips going over into two legs; a second layer over each knee, stitched round; a turned hem with a break above the foot.
- **Belt (obi):** a strap 5 mm thick (IJF: 4–5 mm), 4 cm wide for the rank colours, 4.75 cm for black and 5 cm for a master's red or red-white, stitched in 10 rows, tied in two turns round the waist with a square knot and two ends hanging 20–30 cm. Turned, it is solid: its edges show their thickness, the square knot is the strap itself, wrapped and folded over and on its own the inside of the ring shows. Red-white is the panels of a kohaku belt, running along the belt.

No maker, federation or sponsor mark is drawn. Sizes and positions cite the [IJF Judogi Rules (09 03 2022)](https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf) as facts. That document's pictures and wording are not copied.

```js
import { renderJudogi, judogiFrame, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ colour: "white", mode: "pieces", belt: "white", size: "170" });
judogiFrame({ colour: "blue", mode: "jacket", yaw: 40 });
judogiCheck({ size: "180" });
```

`mode` is `pieces` (the jacket with its belt tied, and the trousers beside it), `suit`, `jacket`, `pants` or `belt`; `view` is `front`, `back` or `flat` (the pieces laid out with no volume, the belt beside them).

`judogiCheck` reports whether a named size meets the cited length facts (jacket to mid-thigh, sleeves leaving about 5 cm to the wrist, trousers leaving about 5 cm to the ankle, belt 4–5 cm wide with 20–30 cm hanging ends). Traditional sizes 1–7 map onto those heights.

## On a page

A judogi is detailed cloth, and every one of the few hundred cells a piece is made of draws its face again: as an SVG on a page, a pair of pieces takes about a second a frame to turn in Safari. `judogiCanvas` paints the SVG on a canvas instead: each face once into a picture, then every cell of a piece in one draw on the graphics card (WebGL 2), at the screen's full frame rate in Safari, Chrome and Firefox, phones included. Without WebGL 2 it paints on a 2D canvas, slower (about fifteen frames a second in Safari). Put the canvas on the page in place of the SVG, and call `dispose` when it leaves, since a browser keeps only so many canvases on the graphics card. The SVG the package returns, and so a saved file, keeps the drawing itself; `judogiTurn` turns that SVG in place where a canvas will not do.

```js no-run
import { judogiFrame } from "@johnmorrisdotca/senshu-jerseys";
import { judogiCanvas } from "@johnmorrisdotca/senshu-jerseys/turn";

const holder = document.createElement("div");
holder.innerHTML = judogiFrame({ mode: "pieces", belt: "black" });
const painted = await judogiCanvas(holder.firstElementChild);
document.querySelector("#stage").append(painted.canvas);
painted.turn(30);                  // and again for each angle
painted.dispose();                 // when it leaves the page
```

The shade is opaque greys that multiply onto the cloth (CSS `mix-blend-mode`), which every current browser draws; a white cloth would show the grid of a half-transparent shade as lines.

Later tickets add back patches, embroidery and labels onto the same options object.
