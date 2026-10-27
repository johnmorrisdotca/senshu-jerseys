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

`mode` is `pieces` (the jacket with its belt tied, and the trousers beside it), `suit`, `jacket`, `pants` or `belt`; `view` is `front`, `back`, `flat` (the pieces laid out with no volume, the belt beside them) or `flat-back` (the same, from behind).

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


## Back patches

`backPatch` sews a patch on the back of the jacket. It lies on the cloth, curves with the body and turns with it; its edge is turned under and stitched, and the lettering takes the weave of the cloth. It shows on the jacket in `pieces`, `suit` and `jacket`, from behind (`view: "back"`, or `"flat-back"`).

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "jacket", view: "back", backPatch: { style: "ijf", name: "M. TANAKA", code: "JPN", line: "SENSHU JUDO CLUB", colour: "blue" } });
renderJudogi({ mode: "jacket", view: "back", backPatch: { style: "zekken", name: "山田", line: "千秋館", ink: "black" } });
```

**Back number (`style: "ijf"`).** A name band across the top (`name`, usually the initial and the surname), the nation's three letters large in the middle (`code`), and an optional bottom band for a club, dojo or sponsor (`line`). `colour` is the band: `blue` (the standard), `gold`, `red`, `black`, `white` or your own `#rrggbb`. It is 25 by 29 cm by default and `widthCm`, `heightCm` and `topCm` change that. The IJF Judogi Rules (09 03 2022) fix its place and its sewing, not its size: the top is fixed horizontally and centrally 3 cm below the collar, and the patch is stitched round its whole edge with its corners crossed into an X or with three straight equidistant lines (`sewing: "x"` or `"lines"`). The size is this package's own. The letters of the federation and the word that marks an official patch are never printed: the middle line is whatever code you give it.

**Zekken (`style: "zekken"`).** The domestic Japanese patch: white cloth, the surname large in the upper two thirds (`name`) and the affiliation small in the lower third (`line`), in black (`ink: "black"`) or vermilion (`ink: "vermilion"`). The All Japan Judo Federation's zekken rules, as a retailer's chart states them, give the cloth as 30 to 35 cm across and 25 to 30 cm tall (33 by 28 here), the lettering in gothic or regular brush script, black for men and vermilion for women, the patch sewn on 5 to 10 cm below the back collar (7.5 here) and stitched across its diagonals. Japanese lettering is drawn as text in the reader's own gothic font: the package has no Japanese font of its own.

Words in the demo: `ゼッケン` (zekken, the numbered patch), `苗字` (surname), `所属` (affiliation), `黒` (black), `朱` (vermilion).

`judogiCheck({ backPatch })` adds the patch's rules to the size check, each with its source, and fails when a patch is outside them (a zekken 20 cm wide, a back number 6 cm below the collar). Nothing is clamped: the drawing shows what you asked for, and the check tells you where it leaves the rules.
