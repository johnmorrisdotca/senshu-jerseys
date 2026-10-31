# Judogi

The jacket, the trousers and the belt as original SVG: contest white or blue, the rank belts, named sizes, laid out as separate pieces (as product photographs show them) or worn as a suit. Each piece is a garment with volume that turns, drawn by the same pipeline as the jerseys: the jacket's body is thick to the hem and narrow from the armpit to the belt, and its sleeves are straight bands set on along the armhole, as wide under the arm as at the cuff; the trousers' hips part into two legs, so they turn as two legs and not as one board. The designer keeps every choice in the address and saves SVG or PNG.

Look at the [designer](https://johnmorrisdotca.github.io/senshu-jerseys/judogi.html) (`?colour=white&mode=pieces&belt=black&size=170`).

**Hands in the designer.** A press and drag turns the piece at every zoom (across the view is a half turn; a drag up lifts the front) and the Tilt slider tips it; the wheel (when the view has focus), the arrow keys and a sideways swipe turn it too. To move a zoomed view, Shift and drag, drag with the middle or right button, or use two fingers (a pinch zooms about the fingers). Fit puts zoom and position back.

<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/judogi-desk-dark.webp">
<img alt="Four judogi drawings: a white jacket with a black belt tied at the front, turned a little; its white trousers with the drawstring and the reinforced knees; a blue suit worn with a black belt, turned the other way; and the white jacket from the back with a brown belt." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/judogi-desk-light.webp" width="720">
</picture>

## What is drawn

- **Jacket (uwagi):** the collar standing round the back of the neck and running down the front as a band of six stitched rows, the wearer's left crossing over the right (turned, a band of its own 9 mm thick, with edges; the near sleeve hangs over it and over the belt); turned, the inside of the jacket is cloth too: the upper body has an inner face (the weave darker, in the collar's shadow) and a rim at the neck, so the opening shows the inside of the back with the neck label sewn on it, never the page, and the proportions are measured from real photographs of judogi (about 47 cm across the body under the shoulders for a size 170, shoulders .64 and the belted waist .45 of the jacket's height, the neck and collar at their own width); a fine grain weave on the upper body and quilted diamonds on the skirt below the waist seam; side vents; turned and stitched cuffs and hem.
- **Trousers (zubon):** a deep waistband gathered by a flat braided drawstring, 1 cm wide, tied in a bow at the front; the hips going over into two legs; a second layer over each knee, stitched round; a turned hem with a break above the foot.
- **Belt (obi):** a strap 5 mm thick (IJF: 4–5 mm), 4.2 cm wide for white and the rank colours, 4.5 cm for black, red-white and red, stitched in 10 rows, tied in two turns round the waist with a square knot and two ends hanging 20–30 cm. Turned, it is solid: its edges show their thickness, the square knot is the strap itself, wrapped and folded over and on its own the inside of the ring shows. Red-white is the panels of a kohaku belt, running along the belt. `beltWidthCm` sets the width in centimetres (3 to 6 drawn); `judogiCheck` reports a width the grade is not made in (see below). Without it the grade's own width is drawn: 4.2 cm for white and the rank colours, 4.5 for black, red-white and red. It applies to the worn and the belt-alone drawings; the flat layout keeps one width.

No maker, federation or sponsor mark is drawn. Sizes and positions cite the [IJF Judogi Rules (09 03 2022)](https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf) as facts. That document's pictures and wording are not copied.

```js
import { renderJudogi, judogiFrame, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ colour: "white", mode: "pieces", belt: "white", size: "170" });
judogiFrame({ colour: "blue", mode: "jacket", yaw: 40 });
judogiCheck({ size: "180" });
```

`mode` is `pieces` (the jacket with its belt tied, and the trousers beside it), `suit`, `jacket`, `pants` or `belt`; `view` is `front`, `back`, `flat` (the pieces laid out with no volume, the belt beside them) or `flat-back` (the same, from behind).

`knee` is `true` by default: the trousers carry the reinforced knee, a second layer over each knee stitched round. `knee: false` leaves the panel out and draws the plain leg (`renderJudogi({ mode: "pants", knee: false })`); the back, the jacket and the belt do not change.

`hemAboveAnkleCm` is how far above the outer ankle bone the trousers' hem stops, in centimetres, a number from 2 to 10 (anything else is brought into range): 5 by default, and the drawing is then exactly what it was before the option. It is a number and not presets because the two rules it serves are two numbers, and a maker's cut is any between: `PANTS_HEM_CM` holds `{ min: 2, max: 10, default: 5, ijf: 5, ibjjf: 2 }`. Each centimetre moves the hem by a centimetre of the drawing (2.63 units at the 170 cm size) and the drawing keeps its box, so 2 cm, the longest it holds, is the longest it will draw; the knee panel stays where the knee is. `renderJudogi({ mode: "pants", hemAboveAnkleCm: 2 })`. `pantsFace` takes it as its fifth argument. Asked for, `judogiCheck` adds `trouser-hem` and holds it to the rule of the gi it is for (5 cm or less on a judogi, 2 cm or less on a jiu-jitsu gi); left out, it adds nothing. Marks are placed by the default leg, and the jiu-jitsu gi's long knee by the default hem, so on a hem far from 5 cm they sit a few units off the leg's new proportions.

**The rules.** The IJF's: "The distance between the bottom of the trousers and the exterior malleolus (ankle bone) must be less or equal to 5 cm" (IJF Judogi Rules, control picture 13; read 2026-10-31 in the 2018 edition published by Judo Victoria, https://judovictoria.com.au/wp-content/uploads/2018/09/IJF-JUDOGI-RULES-2018-r.pdf, and a retailer's page quoting the 2022 rules' "no more than 5 cm above the external ankle bones", https://kusakurashop.com/pages/international-judo-federation-regulation; the 09 03 2022 document this page cites elsewhere was not re-read for this figure). The IBJJF's: "GI pants should reach no more than 2 cm above the tibial malleolus (ankle bone)" (IBJJF uniform rules, https://ibjjf.com/uniform, read 2026-10-31; the page says the new rules apply after the 2024 Gi World Championships). Both are limits on how high the hem may stop, so a longer trouser always meets them.

`judogiCheck` reports whether a named size meets the cited length facts (jacket to mid-thigh, sleeves leaving about 5 cm to the wrist, trousers leaving about 5 cm to the ankle, belt 4–5 cm wide with 20–30 cm hanging ends). Traditional sizes 1–7 map onto those heights.

## How deep the body is

Turned to its side, a gi is as deep front to back as a person is, not a slab. The US Army's ANSUR II survey (Gordon and others, 2012; 4,082 men and 1,986 women; public working data) gives, for men, a chest 254 mm deep by 289 mm across (0.88), a waist 238 by 326 (0.73) and buttocks 246 deep by hips 346 across (0.71); the shoulders (biacromial breadth 416 mm) are 0.61 of that chest depth. The cloth hangs wider than the body but not deeper, so the jacket is about 0.70 of its width deep from the chest to the hem (0.5 to 0.55 across the shoulders), 29 cm at the chest, and the trousers' hips 1.2 times what judogiPants.ts draws. The same body serves the judogi, the karate gi, the dobok and the jiu-jitsu gi.

## Belt specifications

A belt is made in a few real widths, and the designer offers only those for the chosen belt. They are read from KuSakura's published catalogue and belt guide (read 2026-10-27), used as specifications only: no maker's mark or name is drawn.

| Belt | Widths made (cm) | Stitch lines | Source |
|---|---|---|---|
| White | 4.2 (classic), 4.5 (IJF-style) | 8, 10 | [belt guide](https://www.kusakurashop.com/pages/how-to-choose-your-judo-belt) |
| Yellow, orange, green, blue, brown | 4.2 | 10 | [colour belt page](https://www.kusakurashop.com/products/judo-belts-color-men-jc) |
| Black | 4.2 (entry level), 4.5, 4.7 (extra thick; to confirm) | 10, 13, 14, 15, 16 | [IJF black belt, 13 rows](https://www.kusakurashop.com/products/judo-belts-black-ijf-joxb), [IJF black belt, 10 rows](https://www.kusakurashop.com/products/judo-belts-black-ijf-joib), [belt guide](https://www.kusakurashop.com/pages/how-to-choose-your-judo-belt) |
| Red and white (kohaku) | 4.5 | 13 (cotton), 16 (silk) | [cotton](https://www.kusakurashop.com/products/judo-belts-white-red-jrwz), [kata](https://www.kusakurashop.com/products/judo-belts-white-red-jrwk), [silk](https://www.kusakurashop.com/products/judo-belts-white-red-jgsrw) |
| Red | 4.5 | 16 | [belt guide](https://www.kusakurashop.com/pages/how-to-choose-your-judo-belt) |

- **No 5.0 cm judo belt was found**, so none is offered: the widest is 4.7 cm (one extra-thick shusu black belt, to confirm), then 4.5, then 4.2. A 4 cm width appears only on karate and taekwondo belts in a retailer's list (two-tone karate belts of 4 cm and ITF colour belts of 40 mm, [Budoland](https://www.budoland.com/en/martial-arts/judo/judo-belts), read 2026-10-27), not on a judo belt, and an IJF-recommended maker gives "about 4 to 4.5 cm", so 4 cm is not offered either. The one extra-thick black belt (JOGS) is offered by KuSakura with integrated embroidery only; that is the maker's limit, not this package's.
- **The IJF Judogi Rules (09 03 2022) give a belt's thickness (4 to 5 mm) and the hang of its ends from the knot (20 to 30 cm), and no width in their text**: the earlier "4 to 5 cm" here was not theirs. The Kodokan's own pages could not be read (its site's certificate does not match its address when read), so no Kodokan figure is cited; the maker's guide gives the Kodokan colours, 13 and under in Japan white, yellow, orange, green, violet, brown, and adults white then brown for kyu, black 1st to 5th dan, red and white 6th to 8th, red 9th and 10th, and says two-colour middle grades do not exist in Japan.
- **Length by size number**, men's and mixed: size 1 is 215 cm, size 2 is 235 cm, then 10 cm for each half size to size 8 at 355 cm (waist 55 to 60 cm at size 1, 125 to 135 cm at size 8); women's belts, with a white line down the middle and required from black belt in Japan only, are 5 cm shorter. Size 6.5 is made only in IJF models and 7 to 8 to order. The rule of thumb is twice the waist (or hips) plus 90 to 100 cm, which leaves 20 to 30 cm each end. Handmade lengths vary by 1 to 1.5 percent. `BELT_SIZES`, `beltLengthFor`.
- **Kohaku belt:** the red and white sections are each 12 to 18 cm, longer with the size, spread evenly, and both ends are always red (`KOHAKU`).
- **Cover:** cotton, shusu (satin-covered cotton: the glossy deluxe black belts and the women's black belt with the white line) or silk (the silk black and kohaku belts), recorded per model (`BELT_COVERS`, `beltCoversFor`); the satin sheen and finer, flatter stitch rows are for the belt drawing to take up.
- **Thickness** comes in three grades by the maker's own rating, standard, thick (the silk and shusu belts) and extra thick (`BELT_THICKNESSES`); no maker gives millimetres.
- **Embroidery** is `stitching: "applied"` (the default: sewn on afterwards, raised, reversed on the other face) or `"integrated"` (made in as the belt is made: flatter, nothing on the other face). Both work on every garment and belt here; KuSakura offers integrated on black, kohaku and red belts only and not on its IJF models, the limit of one maker. The maker's embroidery is Japanese in regular or semi-cursive script, English block or cursive, 18 thread colours listed on its pages (its text says 20), at most 20 cm long with the letter size adapted, about 3 cm letters, two places on a belt, and up to ten grade lines of about 1 cm under the name (`MAKER_EMBROIDERY`). It does not embroider Korean or Chinese; this package sets Hangul all the same.
- **Tags near an end** (`BELT_END_TAGS`): a woven maker's label, a size tag under it showing the size number with three tiny kanji under it by default (`BELT_SIZE_TAG_LINE`, which means made in Japan; the user may change or remove the line), and a small white tag under that, which almost every belt has and which is drawn blank with optional text of the user's own: where the size tag shows, the white tag shows.

## On a page

A judogi is detailed cloth, and every one of the few hundred cells a piece is made of draws its face again: as an SVG on a page, a pair of pieces takes about a second a frame to turn in Safari. `judogiCanvas` paints the SVG on a canvas instead: each face once into a picture, then every cell of a piece in one draw on the graphics card (WebGL 2), at the screen's full frame rate in Safari, Chrome and Firefox, phones included. Without WebGL 2 it paints on a 2D canvas, slower (about fifteen frames a second in Safari). A canvas reads only each piece's description and the pictures of its faces, so make the SVG it is given with `bare: true` (`judogiFrame({ ...options, bare: true })`): the same drawing with none of its cells, a small part of the markup, to be put through `judogiCanvas` and not shown or saved; where the canvas cannot be made (it resolves to `undefined`), draw the SVG again without `bare`. Put the canvas on the page in place of the SVG, and call `dispose` when it leaves, since a browser keeps only so many canvases on the graphics card. The SVG the package returns, and so a saved file, keeps the drawing itself; `judogiTurn` turns that SVG in place where a canvas will not do.

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

**Zekken (`style: "zekken"`).** The domestic Japanese patch: white cloth, the surname large in the upper two thirds (`name`) and the affiliation small in the lower third (`line`), in black (`ink: "black"`) or vermilion (`ink: "vermilion"`). The rule is read from the judo event requirements of Tochigi Prefecture's 2022 National Sports Festival ([PDF](https://www.pref.tochigi.lg.jp/tochigikokutai2022/hp/2019/wp-content/uploads/2022/06/710f38a4f609edf78deef82d1e3aeeeb.pdf), section `ゼッケン`, read 2026-10-27), which follows the All Japan Judo Federation's: the surname in the upper two thirds and the prefecture in the lower third, in regular script, bold gothic or mincho, black for men and dark red for women, sewn on 5 to 10 cm below the back collar, 25 to 30 cm tall and 30 to 35 cm across, stitched along its edge and diagonals. Here it is the smallest the rule allows, 30 by 25 cm and 5 cm below the collar, which at the jacket's 2.63 units to the centimetre leaves it clear of the belt: whatever size and place are asked for, the drawing stops a centimetre and a third above the belt's top edge (`judogiCheck` still reports a size outside the rule). Lettering is shrunk to fit the cloth down to half its size, and a longer text is cut and ends in an ellipsis. Japanese lettering is drawn as text in the reader's own gothic font: the package has no Japanese font of its own.

Words in the demo: `ゼッケン` (zekken, the numbered patch), `苗字` (surname), `所属` (affiliation), `黒` (black), `朱色` (vermilion).

**Thickness and edge.** A patch is an embroidered or woven patch on its backing, stitched on: 3.5 mm thick by default, kept to 3 to 4 mm (`thicknessMm`; `PATCH_MM` holds the range), and its cut edge stands off the cloth in shade, a little lifted, as the garment turns. Its edge is stitched a stitch line in from the edge (`edge: "running"`, the default) or with a dense satin border (`edge: "satin"`). The 3 to 4 mm range is this package's own spec (2026-10-30), not a rule's figure.

`judogiCheck({ backPatch })` adds the patch's rules to the size check, each with its source, and fails when a patch is outside them (a zekken 20 cm wide, a back number 6 cm below the collar). Nothing is clamped: the drawing shows what you asked for, and the check tells you where it leaves the rules.

## Belt stripes, halves, tips and tags

Belts are not all one colour. Clubs and federations mark a grade, an age or a degree by splitting a belt's colours, running a stripe down it, or putting bars or a tip block at an end, and the arrangements differ from country to country, so the package takes one flexible description, `beltStyle`, and names the common real ones as `BELT_PRESETS`. Every part is optional and they combine.

```js
import { BELT_PRESETS, beltPreset, renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// Judo Canada's yellow-orange half belt: orange on the lower half, yellow above it.
renderJudogi({ mode: "belt", belt: "yellow", beltStyle: { split: "orange" } });
// A white stripe down the middle of an orange belt.
renderJudogi({ mode: "belt", belt: "orange", beltStyle: { along: [{ colour: "white" }] } });
// A blue belt with a black tip at each end carrying three white degree stripes.
renderJudogi({ mode: "belt", belt: "blue", beltStyle: { tip: { colour: "black", lengthCm: 7, bars: { colour: "white", count: 3 } } } });
// Three red tags on a green belt, the British Judo way of showing 12th Mon.
const mon = beltPreset("mon-12");
renderJudogi({ mode: "jacket", belt: mon?.belt, beltStyle: mon?.style });
```

- **`split`**: a second colour; the belt is split lengthwise, the belt's own colour on the upper half and this one on the lower.
- **`along`**: stripes running the whole length. Each has a `colour`, an `at` (`centre`, `edges`, `top`, `bottom` or a number from 0 at the top edge to 1 at the bottom) and a `widthCm` (1 by default).
- **`bars`**: bars across the belt near a cut end: `colour`, `count` (1 to 6), `ends` (`both`, `left` or `right`, as seen from the front), `widthCm` (1), `gapCm` (0.8) and `fromEndCm` (1.5). One bar is a tag, a few are a count of grades or degrees.
- **`tip`**: a block of one colour over the end of the belt (`colour`, `lengthCm` 6, `ends`), with its own `bars: { colour, count, widthCm, gapCm }` across it, counted from its inner edge the way degrees are added.
- **`numeral`**: a degree in Roman numerals stitched across one end, as the ITF's black belts show it: `{ value: 4 }` (1 to 10, I to X), `colour` (`gold` by default), `end` (`left`, the default and the end a folded belt shows on top, or `right`) and `fromEndCm` (3). The numerals read across the belt with their tops toward the knot, so they stand upright on an end that hangs; a long one (VIII) is drawn smaller to stay inside the belt. They are the package's own straight satin strokes (I, V and X need no font).

Colours are the belt colours (`white` to `red`) or `grey`, `purple`, `gold` or any `#rrggbb` (`STRIPE_COLOURS`). It all rides on the belt's own cloth, so it turns with it, in every view, and it combines with embroidery, the label, the brand and a maker's logo. A style with no colour that exists draws nothing and the belt is drawn as before. The designer's "Stripes, tips and tags" group has a control for each part and a list of the real systems (`bp=<preset id>` in the address chooses one; `ss`, `sc`, `st`, `stn`, `stc`, `sb`, `sbn` and `se` hold the rest).

**The presets, and where they come from.** Only a page a person read is a source here; the rest are marked as leads.

| Preset ids | System | Source |
|---|---|---|
| `half-white-yellow`, `half-yellow-orange`, `half-orange-green`, `half-green-blue`, `half-blue-brown` | Judo Canada's kyu list: White, White-Yellow (6+), Yellow, Yellow-Orange (5+), Orange, Orange-Green (4+), Green, Green-Blue (3+), Blue, Blue-Brown (2+), Brown | [Judo Canada, Grading](https://judocanada.org/grading/) (read) |
| `mon-4` to `mon-18` | British Judo's 18 Mon grades: a coloured belt with one to three tags, red tags on yellow, orange, green, blue and brown | [British Judo, Mon Grade Promotion Syllabus, Dec 2024](https://britishjudo.org.uk/wp-content/uploads/2024/12/Mon-Grade-Promotion-Syllabus-Dec-2024.pdf) (read, its table of Mon grades) |
| `womens-black-white-line` | The women's black belt of the AJJF-approved kind (Kodokan women's belt): black with one white line down the middle of its whole length, sold in Japan | [KuSakura, Kodokan black belt for women (JGRK)](https://www.kusakurashop.com/products/judo-kodokan-belts-black-jgrk) (a retailer: read for what is sold, not a federation's rules; the line's width, about a quarter of the belt, is taken from its product picture) |
| `kids-centre-white`, `kids-centre-black`, `kids-centre-black-yellow` | Jiu-jitsu kids' two-colour belts (a centre stripe) | [Brazilian Black Belt, Kids belt system](https://brazilianblackbelt.com/2011/07/jiu-jitsu-kids-belt-system-from-2012-on-bjj) (read: two-colour belts, optional stripes) and [IBJJF, Graduation system](https://ibjjf.com/graduation-system) (read: it names three kids' graduation systems of degrees and stripes) |
| `tip-black-degrees-3`, `tip-red-degrees-3` | Degree stripes on a coloured tip | the same two pages; the tip's look is from John's reference photographs (jiu-jitsu and karate retailers' belts), not a federation page |
| `karate-brown-1`, `karate-brown-3`, `karate-dan-1`, `karate-dan-3`, `karate-dan-5` | Karate: brown kyu belts with one to three black bars, black dan belts with one, three or five gold bars across one end, worn long (their `tie`: hanging, 50 cm) | John's reference chart (Dropbox, belt-stripes: "Karate belt ranking system", nine kyu to brown with 1 to 3 bars, dan belts black with 1 to 7 bars) (**a lead**: the styles differ, and no style body's own page was read; the bars' gold is the common maker's colour, the chart draws them pale) |
| `itf-gup-blue-red`, `itf-gup-red-black` | Taekwon-do, ITF colour belts: a tip of the next colour at the end (3rd gup blue with a red tip, 1st gup red with a black tip), tied once round | [ITF, Belt colour meanings](https://www.itftaekwondo.com/belt-colour-meanings/) (read 2026-10-27 for the colours; the page refused a fetch on 2026-10-30) |
| `itf-senior-1`, `itf-senior-4`, `itf-senior-7`, `itf-junior-2` | Taekwon-do, ITF black belts: "of sufficient length to wrap only one time around the waist", at most 5 cm wide, the degree "in gold coloured Roman Numerals, positioned transversally across one end of the belt"; the junior black belt (under 18) has "a one (1) cm wide, white stripe running lengthwise through the center of the belt", on one face only | [ITF Umpire Rules, Appendix 2, Approved Clothing (in force January 1st, 2015)](https://itftkd.sport/wp-content/uploads/2014/10/2015-Appendix-2-ITF-Approved-Clothing-Jan-20.pdf) (read 2026-10-30, a primary source; the white stripe is drawn on both faces here) |
| `poom` | World Taekwondo and the Kukkiwon: the poom belt, the junior black belt, black and red split along its length, the black on top | [World Taekwondo, 2022 Guidelines of Identifications](https://www.worldtaekwondo.org/att_file_up/partners_suppliers/2022/2022_WT_Guidelines_of_Identifications.pdf) (read 2026-10-30: "Black and Red (Poom Belt)" for cadets and juniors; it does not say which colour is on top: black on top is what clubs and makers say, **a lead**) |
| `wt-dan-bars-3` | Taekwondo: a black dan belt with gold bars across one end, as many clubs and makers sell it | John's reference chart (Dropbox, belt-stripes) (**a lead**: neither World Taekwondo nor the Kukkiwon publishes marks for a dan belt) |
| `bars-white-1` to `bars-white-3`, `stripes-red-2` | Junior bars at each end (Australia: 3, 2 or 1 white bars by age) and one to three red stripes on both ends (Finland) | [Wikipedia, Rank in judo](https://en.wikipedia.org/wiki/Rank_in_judo) (read, **a secondary source: a lead, not confirmed from either federation**) |

Not confirmed: Judo Australia's and Finland's own pages (the Judo Australia policy PDF would not load), and any Kodokan junior belt (the Kodokan's page was not found, and Wikipedia says nothing of one). IBJJF's own graduation PDF would not load either, so the adult rank bars (a red bar on a black belt, coral belts) and karate's and taekwondo's stripes are not claimed here. Wikipedia also reports sub-rank tabs as "a small piece of fabric on the end of the belt" (Austria, Brazil's ends in the next colour, Denmark's half belts); those are what `bars` and `split` draw.

## How the belt is tied: the knot and the ends

How a belt is tied is a choice of its own, `beltKnot`, and so is how far its ends hang, `beltTailCm` (15 to 55 cm, `BELT_TAIL_CM`). By default each garment ties its belt as it is worn with it (`GARMENT_TIES`); a preset of an art that ties it its own way carries a `tie` the demo applies.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// A karate gi: its belt hangs side by side to just above the knee by default.
renderJudogi({ mode: "suit", belt: "black", karate: true });
// The same belt on a judogi, tied the karate way, 45 cm.
renderJudogi({ mode: "suit", belt: "black", beltKnot: "hanging", beltTailCm: 45 });
// An ITF black belt, once round, its fourth degree in gold Roman numerals.
renderJudogi({ mode: "suit", belt: "black", dobok: { cut: "itf", grade: "dan" }, beltStyle: { numeral: { value: 4 } } });
```

| `beltKnot` | How it is tied | Whose |
|---|---|---|
| `spread` | twice round, a square knot, the two ends parting from it in a V | the judogi's (25 cm, the IJF's 20 to 30) |
| `hanging` | twice round, a square knot, the two ends hanging down side by side, the one that comes over the knot lying on the other where they touch | the karate gi's (50 cm on the training cut, 25 on the kumite and kata cuts) and the WT dobok's (38 cm) |
| `single` | once round, a square knot, the ends hanging (one layer of belt round the body: thinner at its edge) | the ITF dobok's (40 cm) |

**Where it comes from.** The IJF Judogi Rules (09 03 2022) give a judo belt's ends as 20 to 30 cm from the central knot. The WKF's competition rules (Kumite Competition Rules 2024, Article 2) say a karate belt leaves at least 15 cm free each side of the knot and is no longer than three-quarters of the thigh; Wikipedia's "Karate gi" says karateka wear the belt much longer than judoka, and John's reference photograph of a karate gi shows the ends hanging to just above the knee, about 50 cm on a 170 cm figure: the training cut's default. The ITF's Approved Clothing (Umpire Rules, Appendix 2, in force January 1st, 2015) says a black belt is "of sufficient length to wrap only one time around the waist": the ITF dobok's belt goes once round, so the same belt leaves longer ends. World Taekwondo's guidelines and the Kukkiwon's published pages read say nothing of how a belt is tied; twice round with long ends is what the references show (a lead). The lengths past the rules' least (50, 38 and 40 cm) are the package's reading of photographs, not a rule, and `judogiCheck` says what is drawn: the IJF's 20 to 30 cm (and `spread`) on a judogi, the WKF's limits on a competition karate gi, the ITF's once round and 5 cm on an ITF dobok.

**How it is drawn.** The ends are the strap's own (judogiStrap.ts, beltTie.ts): each a length with a face, a back, two edges and a cut end, laid from under the knot along its fall. On a jacket they rest on the belt, then on the skirt below it, and past the hem, where nothing is under them, hang straight on at the depth they left it. Each end samples a strip of its own of the belt's drawing, its cut end where the judogi's falls, so a tip, bars, numerals, tags or a name sewn near the end and a kohaku belt's red sections at the ends sit as they always did, and a longer end only reaches further toward the knot. The drawing's box grows to hold long ends (the jacket alone, the belt alone). The folded belt and the box are not changed by the tie.

## The folded belt and the gift boxes

<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/belt-box.webp">
<img alt="Six drawings on a plain ground. Top row: a red and white belt folded flat into a bundle of eight layers with a white paper band round its middle and its marks on the top end; a long pale wooden box, closed, with two characters engraved in gold-brown down its lid; the same box open, the red and white belt folded inside it and the lid lying beside it. Bottom row: the wooden box empty with its lid off; a silver cardboard box with a white label strip, a small red round seal and two black characters on its lid, and a white end with a sticker; the silver box open, a black belt folded in its white base and the silver lid lying across it." src="https://raw.githubusercontent.com/johnmorrisdotca/senshu-jerseys/main/docs/images/belt-box.webp" width="720">
</picture>

A belt is sold folded flat, and as a gift in a long box. Both turn and tip like the other views (drag, wheel, Angle, Tilt, zoom), lie at an angle to begin with, as in a shop's photograph, and take everything the belt takes: its colour or the red and white sections of a kohaku belt, `beltStyle`, the width, the marks and embroidery on its ends, the label and the branding.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// A belt folded into a bundle, the label end on top; `band: true` is the shop's white paper band round it.
renderJudogi({ mode: "folded", belt: "red-white", beltSize: 4, band: true, branding: true });
// The wooden (kiri) box, closed; open with the lid beside it and the belt in it; empty with the lid off.
renderJudogi({ mode: "box", beltSize: 4, boxState: "closed" });
renderJudogi({ mode: "box", belt: "black", beltSize: 4, boxState: "open", boxWood: "honey" });
// The silver cardboard box, with other words on its lid.
renderJudogi({ mode: "box", boxType: "silver", boxState: "open", boxText: "黒帯" });
```

- **The folded belt (`mode: "folded"`)** is a stiff band doubled back on itself an even number of times (eight for a size 4, `FOLDED_LAYERS`; six to ten by the belt's length, `foldedLayersFor`, so the bundle stays about seven belt widths long), seen from above and to the side so that the top layer's whole face shows with its stitch rows. A belt of this kind never lies flat: each layer has the belt's own thickness (a kohaku or a black belt is drawn in its thick grade unless `beltThickness` says otherwise) with rounded, a little crowned edges and is puffier than the stitched 5 mm (about 1.6 times, a centimetre a layer); the layers lie close in the middle of the bundle and spring apart toward its ends (more at the near end), so the stack is taller than its layers, and every fold is a thick round, tight U-bend, not a crease. Each layer bends along its length, bows and skews a little, and the layers are uneven (the same way for the same belt), the lower ones standing out further at the near end and drooping, and both free ends are at the near end of the bundle: the end that carries the marks is the top layer's, with its label right at the tip as a shop shows it, and the other is the bottom layer's, which sticks out a little. (In a box the belt is folded in eight too, `FOLD_LAYERS`, so that a box's length follows from the longest belt it takes.) With `beltTags` the label and the size tag sit on the top layer's tip, the size tag showing the belt's own size number. A kohaku belt's red and white sections are laid by the belt's real length: about 16 cm each, an odd number of them (`kohakuSection`), so it is red at both ends, the top layer red from the tip for the first section and then white, and a fold carries the colours round it. Folded, `beltTags` shows the maker's label and size tag as a shop's belt does at the tip: a navy label with the Senshu S above the name `SENSHU` and `綿100%` (cotton 100 percent), then the size tag in black with an orange numeral and the line `日本製` (made in Japan), lettered across the belt, and no white tag unless `white` is asked for; `makerColour`, `makerThread` and `sizeThread` change the colours. The rows of stitching are fine dashes, 16 rows by default (`beltRows`). The belt's length is its size's (`beltSize`, 1 to 8 in halves; by default the one that goes with the judogi's `size`), from the men's and mixed lengths of `BELT_SIZES` (`beltCmOfSize`): 235 cm at size 2 and 10 cm more for each half size to 355 cm at size 8. (The maker's women's black belt page lists 230 cm at size 2, 5 cm less; `beltLengthFor` turns a waist into a length and is not a size table.) `band: true` puts a white paper band round the middle, with the package's own red S and the size on it (never a maker's mark).
- **The wooden box (`boxType: "kiri"`)** is kiri (paulownia), 7 x 7 cm outside with a standard 4.5 cm belt (the maker's gift-box page), its length following the belt size. The walls are 6 mm and the slide-on lid slab 1 cm, so it is 5.4 cm high inside. With the lid on, the lid presses the springy bundle down: the layers are squeezed (by up to a fifth of their thickness) and the gaps between them closed until the bundle is exactly as high as the inside (`closedBundle`), so nothing pokes through. With the lid off the bundle springs back and stands proud of the tray's rim by a few millimetres that follow the belt's thickness (`openBundle`: about 4 mm for a standard belt), as in the maker's photograph. The belt fits across with a little play; a wider belt widens the box, and a belt so thick that pressed as far as it goes it still does not fit gives a taller one. The slide-on lid carries `御帯` (o-obi, "belt", honorific) engraved, a shallow cut with a gold-brown burn, down its middle; `boxText` changes the words (up to six letters, centred on the lid's width), `boxWood` the tone of the wood (`light`, `natural`, `honey`).
- **The silver cardboard box (`boxType: "silver"`)** is a white base with a silver lid (aluminium-faced paper with a fine sparkle and a faint embossed pattern), about 5 cm wide (a 5.5 cm tall base) and pressed down on the bundle the same way, the open belt standing a little proud of the base. The lid carries a white label strip with a neutral round red seal (a generic stamp, not the maker's mark) at its top end and `御帯` in black below it; the base is white board with a small white product sticker on its end. Open, the lid lies across the base.
- **States (`boxState`):** `closed`; `open`, with the lid beside the wooden box (across the silver one) and the belt folded inside; `empty`, the lid off and nothing in it.
- **Which box (`boxSizeFor`):** the box size follows from the belt size by the maker's menu: box 2 holds belts up to size 2.5, box 3 sizes 3 and 3.5, box 4 sizes 4 and 4.5, box 5 size 5, box 6 sizes 5.5, 6 and 6.5. `boxSize` chooses another. **The wooden box holds a belt of size 6 at most and the silver one 6.5** (the maker's product pages, read 2026-10-28): a longer belt does not fit any box, so the box is drawn empty, `judogiCheck` says so (`belt-box-fit`) and the designer shows a line saying why.
- **The box's length** is not published, so it is derived: the longest belt each box takes (by those lengths), folded in eight, plus 2.5 cm of room at each end. That is 35.6 cm inside for box 2, 38.1 cm for box 3, 40.6 cm for box 4, 41.9 cm for box 5 and 45.6 cm for box 6, and 1.2 cm more outside for the wooden box (walls 6 mm; `boxDims`). The width and the height are the maker's (7 x 7 cm for the wooden box with a standard belt): `boxDims(size, type, { w, t })` takes the belt's width and the thickness of one folded layer and keeps them unless the belt needs more, and the tests check, for several belt widths, thicknesses and sizes in both boxes, that the pressed bundle is as high as the inside to a millimetre, that the open bundle stands a few millimetres over the rim and that every belt that fits a box lies wholly inside it across and along.

In the designer the two are Display choices ("Folded belt", "Belt box"), with the address keys `mode=folded` and `mode=box`, `bsz` (belt size), `bnd=1` (paper band), `bxt` (`kiri`, `silver`), `bxs` (`closed`, `open`, `empty`), `bxx` (the words), `bxw` (wood), `bxz` (box size). A flat view of either is the same scene standing still.

## Embroidery, logos and the national emblem

All three are drawn on the cloth's faces, so they turn with the pieces, and only in the places the rules name.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({
  mode: "suit", belt: "black",
  embroidery: [
    { place: "jacket-hem", text: "TANAKA", thread: "gold" },
    { place: "belt-end-left", text: "JUDO", thread: "red" },
    { place: "jacket-chest", text: "柔道", font: "kaisho", direction: "down", thread: "red" },
  ],
  logos: [{ place: "pants-leg-left" }],
  emblem: {},
  rules: "ajjf",
});
```

**Embroidery** is stitched thread: a satin stitch, drawn as fine stitches laid across each stroke with a shadow under it and a sheen along it. `place` is `jacket-hem` (the top lapel's lower end, the text running down the band), `jacket-chest`, `sleeve-left`, `sleeve-right`, `shoulder-left`, `shoulder-right` (down the sleeve's top, seen from behind), `belt-end-left`, `belt-end-right` (as seen from the front), `pants-left`, `pants-right` (the hip, just under the waistband, beside the drawstring: KuSakura's "pants embroidery, left and right side") or `pants-thigh-left`, `pants-thigh-right` (the upper front of the leg, above the knee panel). `tonal: true` stitches in thread the colour of the cloth (white on white, blue on blue), seen only by its sheen and relief, as a maker's tonal logo is; `thread` is then ignored. One text to a place; the first wins, and so does any later place the rules do not name. `text` is Latin or Japanese; `direction` is `along` (the piece's own line), `across` or `down` (upright characters in a column); `heightCm` and `lengthCm` size it, and the drawing is held to the limits of the place.

**Thread colours** are twenty-four presets, by English name with the Japanese beside them: red `赤`, gold-brown `金茶`, green `緑`, black `黒`, gold `ゴールド`, fluo pink `蛍光ピンク`, pink `ピンク`, blue `青`, yellow-green `黄緑`, white `白`, silver `シルバー`, fluo orange `蛍光オレンジ`, wine `えんじ`, navy `紺`, yellow `黄`, purple `紫`, grey `グレー`, fluo yellow `蛍光イエロー`, brown `茶`, dark navy `濃紺`, indigo `花紺`, light blue `水色`, silver-grey `シルバーグレー` and fluo green `蛍光グリーン`. `thread` takes any of these or your own `#rrggbb`. They are `THREAD_COLOURS`, with `THREAD_LABELS` for the names and `THREAD_RGB` for the colours.

**Lettering.** `font: "block"` (the default) is the package's own stroke letters, with no font file; the rest set system text and are the page's to supply:

| `font` | Is | Open families worth loading (each SIL OFL 1.1; check the licence before you ship one) |
|---|---|---|
| `gothic` | gothic, `ゴシック体` | Noto Sans JP |
| `kaisho` | regular brush script, `楷書体` | Yuji Syuku, Klee One |
| `gyosho` | semi-cursive script, `行書体` | Yuji Mai, Yuji Boku, Zen Kurenaido |
| `cursive` | Latin script | the system's own |

The package ships no Japanese font: a Japanese face is megabytes. A drawing saved as SVG, and the canvas painter (`judogiCanvas`, which draws the SVG as an image), can use only the fonts the computer has or the SVG carries, so pass the font with the text: `font: { family: "Yuji Syuku", css: "@font-face{font-family:'Yuji Syuku';src:url(data:font/woff2;base64,...)}" }`. The CSS must be `@font-face` rules with `data:` sources only (anything else is dropped). To keep it small, take a subset of just the characters you use: Google Fonts serves one when its address ends `&text=山田`, and `pyftsubset` makes one from a font file. Or skip fonts altogether and pass outlines: `{ place, path: { d: "M...Z", width, height } }` is set as thread, scaled to the place, with the same satin rows whatever units the outline is in.

**Text to outlines: `fontToPath`.** `fontToPath(bytes, text, { direction, spacing, precision })` reads a TrueType file (the `.ttf` bytes as an `ArrayBuffer` or a typed array, however you got them: `fetch`, `readFileSync`) and returns the outlines of `text` as one path, `{ d, width, height, missing }`, for an embroidery's `path`. Run it once, keep the result (measured with Yuji Syuku and Klee One: four kanji about 10 kB of path, `TANAKA` 6 to 9 kB, at the default precision; `precision: 0` takes about a third off), and the page needs no font and no `@font-face`: a saved SVG and the canvas painter draw it as it is. It is about 2.7 kB gzipped, with no dependency, and is left out of a bundle that does not import it.

```js
import { fontToPath, renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

const brush = new Uint8Array(await (await fetch("/fonts/YujiSyuku-Regular.ttf")).arrayBuffer());
renderJudogi({
  mode: "suit",
  embroidery: [{ place: "jacket-chest", path: fontToPath(brush, "柔道", { direction: "down" }), thread: "red" }],
});
```

- `direction: "down"` stands each character upright in a column, as a vertical Japanese line stands (no rotated punctuation); `"across"` (the default) sets a line. `spacing` is extra space between characters as a share of the em (0.04 across, 0.08 down by default). `precision` is the decimals kept (1; the em is 100 units, so that is a thousandth of the em); a path that would pass the 59,000 characters an embroidery takes is rounded more coarsely by itself.
- A character the font lacks is left out and listed in `missing`; nothing is substituted. No kerning, ligatures, hinting or font variations (a variable font gives its default look).
- It reads TrueType outlines (`glyf`) with composite glyphs, and Unicode character maps of formats 4 and 12. A CFF font (an `.otf` with PostScript outlines), WOFF and WOFF2 and `.ttc` collections are refused with a message that says so: take the `.ttf`. A damaged file throws `fontToPath: ...`, it never returns a half path.
- The fonts to try, all SIL OFL 1.1 and all `.ttf` in [google/fonts](https://github.com/google/fonts/tree/main/ofl): Yuji Syuku (`楷書体` kaisho, a brush face), Yuji Mai and Yuji Boku (`行書体` gyosho, a semi-cursive one), Klee One and Zen Kurenaido (a pen). Tried on 2026-10-31 with Yuji Syuku, Yuji Mai and Klee One. Credit the font you use as its licence asks (Yuji: Copyright 2021 The Yuji Project Authors); the package carries none of them. A Japanese face is 8 MB or so, so run `fontToPath` where the file is, never ship it to the page.
- Latin in a script or cursive hand needs a font of that hand: the package's own `block` letters are plain strokes.

**Manufacturer's logo** (`logos`): one logo to a garment, in the spots the rules name: `jacket-hem` (bottom front, wearer's left), `jacket-shoulder-left`, `jacket-shoulder-right` (the outer upper arm just under the shoulder seam, on the front, turned with the sleeve's slope, as makers sew theirs: never on the back), `belt-end-left`, `belt-end-right`, `pants-waist-left`, `pants-waist-right` (just under the waistband, off centre beside the fly and the drawstring), `pants-thigh-left`, `pants-thigh-right` (the upper front of the leg, a hand lower) and `pants-leg-left`, `pants-leg-right` (near the hem). `tonal: true` draws a placeholder in thread the colour of the cloth. Give `svg` (SVG text) or `href` (a `data:image/` address) for your own artwork; without either a neutral placeholder is drawn, and the package ships nothing else. Artwork is drawn as an image, so nothing in it can run.

**Where marks go, and when they share.** Every mark belongs to an area of one face of a garment (the hem's corner on the jacket's front, the chest, the lapel's hem, a sleeve, the back of a sleeve for the shoulder strip, the trousers' hip beside the drawstring, the upper thigh, the lower leg, a hanging belt end), held a centimetre in from the seams, the vent, the hem's stitching, the belt's band, the drawstring, the neck label, the knee panel and a belt end's tip and bars. Marks are laid out in a fixed order (the emblem, the maker's logos, the embroidery, the Approved label, then the branding's own S), each at its usual spot if that is free: a mark that would touch another, or leave its area, is made smaller (down to 60 per cent, 50 for a line of text, 70 for the emblem and the label) and moved to the nearest free spot in its area, always keeping 1 cm clear of the next. A mark that cannot be placed at that size is not drawn, and `judogiCheck` lists it (`skipped-<mark>`, `met: false`: "is not drawn: no room left in its area"), so the earlier marks are never moved or overdrawn. The designer shows the same note. `test/mark-places.test.ts` lays out every mark alone, every pair and every triple that can meet, at every belt width, and holds each box inside its area and clear of everything else.

**Checked against the IJF text (read 2026-10-28, IJF Judogi Rules 09 03 2022, 16 pages).** The national emblem is on the left-hand side at chest level, at most 100 cm2, one only (C1.4, page 7; also page 5 item 5). One manufacturer's logo per garment, at most 30 cm2 on the jacket and trousers and 9 cm2 on the belt (C1.3, page 6): on the jacket at the bottom front left near or in the reinforced edge, or at the bottom edge, or inside the 25 by 5 cm publicity zone on the shoulders; on the trousers at the top (front or outside, within 20 cm of the waist string) or at the bottom on a leg (front or outside, within 20 cm of the hem); on one edge of the belt. The back number's top is fixed horizontally and centrally 3 cm from the bottom of the collar, stitched round its edge and crossed into an X or with three straight lines (C1.8, page 10). `judogiCheck` reports each of these (`emblem`, `logo-<garment>`, `backnumber-place`, `backnumber-sewing`). A summary that circulated gave the back number as 39 by 38 cm (35 by 34 cm for lighter categories): the text and Picture 8 of that PDF give no size at all, so the package keeps its own 25 by 29 cm and does not claim a figure it could not read; its other figures (emblem on the left chest at most 100 cm2, logo 30 cm2, the 3 cm drop) agree with the PDF. The trousers' upper thigh is not one of the six trouser places the PDF's Picture 4 shows (it may fall within 20 cm of the waist string on a short rise), and the check says so.

**National emblem** (`emblem`): the left chest (or, with `place: "sleeve-left"` / `"sleeve-right"`, a flag patch on the outer upper arm, turned with the sleeve). `caption` puts the country's name in thread under the artwork (`style: "named"`, the default with a caption), and `style: "square"` draws a white woven square with the artwork above a word in script (`caption: "Nippon"`, thread gold by default), as team patches are made; a flag is sewn on as a flag patch is made: the flag edge to edge, with only a thin merrowed (overlock) edge of 1.7 mm that takes the colours of the flag's own edge (`frame: "bordered"` for a white patch with a stitched border and a margin of cloth round the artwork, `frame: "none"` for the artwork alone). The emblem is centred on the chest between the top lapel's collar band and the sleeve's seam, whatever shape the body is cut to. Pass a flag as SVG text: [Hata](https://github.com/johnmorrisdotca/hata) gives one by country code, and by region (a Canadian province, say), as `import ca from "@johnmorrisdotca/hata/flags/ca"`; this package does not depend on it. Without artwork, a placeholder star in a ring.

**The Kodokan emblem** (`emblem: { mark: "kodokan" }`, address key `emblem=kodokan` in the designer, where it is a tile of the emblem picker): the emblem of the Kodokan, the judo institute in Tokyo that Judo BC and many clubs show on their jackets, drawn by the package: a white flower of sixteen rounded petals with a small point where two petals meet and a thin dark edge, round a red disc (the disc's width is 0.4 of the flower's), in the left chest, `sleeve-left` or `sleeve-right`, like any emblem. It is a round badge of its own, so it is sewn on with no patch border (`frame: "bordered"` asks for one), at 7.5 cm across by default and never over the emblem's 100 cm2. `caption` and `style` work as for a flag; artwork you give as `svg` or `href` is used instead of the mark. It is drawn as a vector in `src/judogiKodokan.ts` from how the emblem looks, not traced from any file. **Where it comes from:** the shape and proportions were read from two pictures, the Judo BC logo on judobc.ca (the flower's sixteen lobes and the red disc's size) and a photograph of the Kodokan's pin on Wikimedia Commons (the file "Diploma for judo 9th dan", public domain), and the red was matched by eye to Judo BC's. The Kodokan's mark is the Kodokan's: its **trademark status has not been checked**, and it is here by the maintainer's choice, outside the "no real mark" line the rest of the package keeps; whoever uses it should ask the Kodokan or their federation whether they may.

**Limits.** The rules are held in `judogiCheck({ rules })`, `"ijf"` (the default) or `"ajjf"`, and each mark is reported with its source; the drawing never exceeds them (a logo over its area is drawn scaled down, a text over its length is set shorter), and the check says what you asked for.

| Place | IJF Judogi Rules (09 03 2022) | All Japan Judo Federation, as a retailer's chart states it |
|---|---|---|
| Name on the jacket's hem, the trousers' top, a belt end | 4 cm high, 20 cm long, one text to a place | about 20 cm long |
| Left chest | the national emblem only, 100 cm2 | a text 24 cm by 18 cm, about 180 cm2 |
| Sleeve | advertising, 10 cm by 10 cm | 10 cm by 15 cm, about 80 cm2 |
| Shoulder | advertising stripe, 25 cm by 5 cm | not named |
| Maker's logo | 30 cm2 on the jacket and trousers, 9 cm2 on the belt, one to a garment | 20 cm2 on the jacket and trousers |

The package's own sizes are inside both. The small print of the retailer's chart is hard to read: check a figure against the federation's current rules before you rely on it. Wooden name-plate engraving is not drawn.

## The Approved Judogi label

`label: true` (or `{ colour, thread }`) sews the package's own woven label on all three pieces: at the jacket's bottom front on the wearer's left beside the maker's logo spot, on the front of the trousers just under the waistband near the middle, and on the belt's left hanging end, upright, near the knot, with the rest of the end left for embroidery. These are the places the IJF Judogi Rules (09 03 2022) give for its approval label.

**Thickness and edge.** A woven label is 3 mm thick by default, kept to 2 to 4 mm (`thicknessMm`; `LABEL_MM` holds the range). Its cut edge stands off the garment and shows when the piece turns, and it is sewn on with a running stitch just inside its edge. The neck label and its size tag take the same thickness. A belt's end tags are drawn flat, as before.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "pieces", belt: "black", label: { colour: "navy" } });
```

The label is a tribute and is nobody's: "APPROVED" across the top, "JUDOGI" across the bottom and, between them, one white judogi in a circle ringed by the words "SENSHU JERSEYS FEDERATION". The Senshu Jerseys Federation is made up, and **the label certifies nothing**. It is not the IJF's label and does not copy it: the colours, lettering, proportions and drawing are this package's own, with no coloured judogi in a ring, no red rectangular border, no serif lettering and no federation name. It is drawn as woven cloth: a fine weave, satin thread, a woven border, a sheen and a curl at one corner. `colour` is `navy` (the default), `forest` (`深緑`, deep green), `black`, `wine` (`えんじ`) or `cream` (`生成り`, unbleached), or `#rrggbb` for the cloth; `thread` is a thread preset or `#rrggbb`. They are `LABEL_COLOURS`. A label takes no size: it is 3.5 cm by 5 cm on the jacket and 2.6 cm by 3.7 cm on the trousers and the belt.

## Branding

`branding: true` puts the package's own made-up brand, Senshu (`選手`, "athlete"), everywhere a brand goes:

- **A woven neck label** sewn on the inside of the back panel just under the collar (its own place, `jacket-back-inner`), seen only from the front, through the opening of the jacket: dark cloth, the name in spaced Latin letters across the top, a bold brush mark in a ring in the middle with a brush stroke either side, and a small line under it (`SINCE 2026` by default), sewn on with satin thread, a woven border and a slight curl.
- **A size tag** sewn under it, with the size you chose for the garment (`3`, `170`) or your own text (`3B`).
- **The S as the maker's logo**, a stylised S in one brush stroke, at the spots the rules name for a manufacturer's logo, one to a garment: the jacket's bottom front (or a shoulder: `spots.jacket: "shoulder-left"`), a trouser leg (or a waist) and a belt end. A logo you give in `logos` keeps its garment.
- The approval label (`label`) takes the brand's cloth and thread.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "pieces", belt: "black", size: "3", branding: true });
renderJudogi({ mode: "jacket", branding: { name: "KAZE", kanji: "chikara", line: "MODEL 7", sizeTag: "3B", colour: "black", thread: "silver", logo: { svg: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>' } } });
```

**The brush mark** is drawn here as tapered strokes (no font): `te` `手` (hand, as in `選手`, an athlete; the default), `chikara` `力` (strength) or `kokoro` `心` (heart, spirit). Give `kanji` any other text and it is set in a system font instead (the same `font` rules as embroidery apply: the font has to be on the computer or in the drawing). **Swapping:** `name`, `line` and `sizeTag` are your words; `colour` is a cloth variant (`navy`, `forest`, `black`, `wine`, `cream`) or `#rrggbb` and `thread` a thread preset or `#rrggbb`; `logo` is your artwork (SVG text or a `data:image/` address) in place of the S; `neckLabel: false` and `logos: false` turn a part off. Nothing here is a real maker's or federation's mark, and the package ships no other brand.

## The karate gi

`karate` turns the judogi into a karate gi (karategi) on the same jacket, trousers and belt volumes: `renderJudogi({ mode: "suit", belt: "black", karate: true })`. Open it in the [designer](https://johnmorrisdotca.github.io/senshu-jerseys/judogi.html?kg=1&ks=three-quarter&mode=suit&belt=black) (the Karate gi switch) or as a [tile on the Uniforms page](https://johnmorrisdotca.github.io/senshu-jerseys/uniforms.html?garment=karate-three-quarter&belt=black), which has a tile for each sleeve and for the kumite and kata cuts. The belt is the judogi's: every colour, stripe and width works, and `judogiCheck` reports the karate gi's own measures in place of the IJF's.

```js
import { renderJudogi, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "suit", belt: "black", karate: { sleeve: "three-quarter" } });
renderJudogi({ mode: "suit", belt: "red", karate: { cut: "kumite" } });
renderJudogi({ mode: "jacket", belt: "brown", karate: { text: "極真", thread: "dark-navy", patches: { leg: false } } });
judogiCheck({ karate: { cut: "kata", sleeve: "short" } });
```

| Option | Values | What it does |
| --- | --- | --- |
| `sleeve` | `full` (the default), `three-quarter`, `short` | How far down the arm the sleeve goes: to the bend of the wrist, halfway down the forearm (the shortest the WKF allows), or just above the elbow (`KARATE_SLEEVE_SHARE`: 1, 0.88 and 0.68 of the sleeve drawn from where it leaves the body, whose elbow falls at about 0.76). The cuff keeps its width and is square to the arm. |
| `cut` | `training` (the default), `kumite`, `kata` | The jacket's hem and the cloth's softness (below), and what the gi carries unasked. |
| `text` | up to four characters, or `false` | Stitched down the wearer's left chest beside the lapel, one character over the next, each upright, the column leaning with the lapel and made smaller to fit when it has four. Laid heavy, as a brush's strokes are on a gi: each character's satin is the glyph grown all round by about a fifteenth of its height, so even a thin face reads as a bold stroke (no font is shipped). `空手` (karate) on the training cut, none on the competition cuts. |
| `thread` | a thread preset or `#rrggbb` | The text's thread: navy by default. |
| `patches` | `true`, `false`, or `{ sleeve, leg, colour }` | A round patch 9 cm across (`SLEEVE_PATCH_CM`, `LEG_PATCH_CM`, as karate gis' sleeve badges are, 9 to 10 cm) on the wearer's left upper arm and left thigh (each can be left out with `false`), in a ring of the given thread (red by default). Neutral placeholder art: a ring, an inner ring and an eight-point star. The training cut has both; the competition cuts have none. |

**What differs from the judogi.** The cloth is lighter and plainer: one fine plain weave instead of the rice-grain upper body and the quilted skirt, no waist seam, a single hem and a hem on the sleeve with two rows instead of three, folds drawn softer (the training cut at 0.6 of the judogi's, kumite 0.42, kata 0.85). The lapel and collar are narrower (3.5 cm and 6 mm against 4.7 cm and 9 mm), and the jacket has no quilting. The trousers have no reinforced knee: the judogi's panel is covered with the leg exactly as it is drawn round it (its cloth, twill and the trousers' own long folds, clipped to the cover), so no edge of the panel shows. The belt is the judogi's, its ends 25 cm.

**The cuts.** What the rules fix is the same for a kumite and a kata gi: the jacket, tightened with the belt, covers the hips and is no longer than three-quarters of the thigh; the sleeves are no longer than the bend of the wrist and no shorter than halfway down the forearm, and are never rolled up; the trousers cover at least two thirds of the shin and do not reach below the anklebone; the belt is about 5 cm wide and leaves at least 15 cm free each side of the knot, no longer than three-quarters of the thigh; the gi is white, with no stripes, piping or personal embroidery, only the national emblem or flag on the left breast (at most 12 by 8 cm) and the maker's original labels; in kumite the belt is red or blue by the draw (the `red` and `blue` belts) and an official event's gi carries embroidered brands on the shoulders in that colour (not drawn). Beyond those limits the cuts here are the package's reading of how makers describe them, not a standard: `kumite` is the lightest cloth with the jacket just covering the hips (hem 193 units against the judogi's 205, about 4.5 cm shorter), `kata` a crisper cloth with the jacket hanging longer (211, about 2.3 cm longer), `training` in between (200). A training gi may carry whatever its wearer likes, which is why it alone has the kanji and the patches by default; `judogiCheck` marks a competition cut that is given text or patches as not met.

**Styles.** Wikipedia says the styles of karate have slightly different uniforms on one basic design, differing in the lengths of the sleeves, the legs and the jacket's skirt. The Shotokan and Kyokushin styles are commonly seen in a gi like the training cut here (a kanji down the chest, round patches, a belt worn long), but which sleeve, cut and belt a style wears is custom, not a published rule: the options let you choose, and no style's name, badge or trademark is used. The round patch is neutral art, never a style's or federation's emblem.

**The belt** is worn long: its ends hang side by side to just above the knee, 50 cm, on the training cut, and 25 cm on the kumite and kata cuts, inside the WKF's limits (`beltKnot`, `beltTailCm`: see "How the belt is tied"). The `karate-*` presets are the bars of the kyu and dan belts many styles use (a lead).

**Not done here.** The shoulder brands of an official kumite gi and the kata cut's shorter sleeve in Wikipedia's account are not drawn.

**Sources, read 2026-10-30.** [WKF Kumite Competition Rules, valid from 1.1.2024](https://karateliitto.fi/app/uploads/2024/02/WKF_Kumite_Competition_Rules_2024.pdf), Article 2, 2.2.1 (the kumite attire); [WKF Karate Competition Rules, effective from 1.1.2020](https://archive.teamusa.com/usa-karate/officials-and-coaches/-/media/wkf_competition%20rules_2020_en.pdf), Article 2, Competitors (the kata attire, the same measures); [Wikipedia, Karate gi](https://en.wikipedia.org/wiki/Karate_gi) (the Japanese, European and Kata cuts, the cloth weights, karateka wearing the belt longer than judoka). The rules' wording and pictures are not copied; the drawing is original and shows no federation, brand, team or sponsor mark.

## The taekwondo dobok

`dobok` turns the judogi into a taekwondo dobok on the same jacket, trousers and belt volumes: `renderJudogi({ mode: "suit", belt: "black", dobok: { cut: "wt", grade: "dan" } })`. Open it as a [tile on the Uniforms page](https://johnmorrisdotca.github.io/senshu-jerseys/uniforms.html?garment=dobok-wt-dan&belt=black), which has five: the V-neck with a colour belt's, a poom's and a dan's collar, and the ITF wrap plain and with a black belt's hem. The belt is the judogi's, tied long (once round on the ITF cut), and `judogiCheck` reports World Taekwondo's or the ITF's facts in place of the IJF's.

```js
import { renderJudogi, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "suit", belt: "black", dobok: { cut: "wt", grade: "dan" } });
renderJudogi({ mode: "suit", belt: "red-white", dobok: { cut: "wt", grade: "poom", lettering: "KOREA" } });
renderJudogi({ mode: "jacket", belt: "black", dobok: { cut: "itf", grade: "dan", flag: false } });
judogiCheck({ dobok: { cut: "itf", grade: "dan" } });
```

| Option | Values | What it does |
| --- | --- | --- |
| `cut` | `wt` (the default), `itf` | `wt`: the pullover top with a V-neck, as World Taekwondo describes it. `itf`: the jacket that wraps left over right and ties at the side, as the International Taekwon-Do Federation's doboks are made. |
| `grade` | `kup` (the default), `poom`, `dan` | A colour belt's, a junior black belt's or a black belt's dobok. On `wt` it sets the V-neck: the cloth's own white, black and red, or black. On `itf` a black belt's jacket (`poom` or `dan`: the ITF has no poom grade of its own) has a black band 2.5 cm high along its hem, front and back. |
| `lettering` | up to 16 characters, or `false` | Printed in black across the back: across the upper back on `wt`, above the belt on `itf`, no wider than 30 cm and no taller than the rules' letters. "TAEKWONDO" on `wt` and "TAEKWON-DO" on `itf` by default, a generic word in the package's own letters: put your country's code or name here. |
| `flag` | `true` (the default), `false` | The national flag's spot of each cut, with the judogi's neutral placeholder patch: the right upper arm under the shoulder seam on `wt` (10 by 7 cm), the right chest on `itf` (5 by 3 cm). To sew a real flag, give the judogi's `emblem` with that `place` (`sleeve-right` or `chest-right`) and the artwork, from Hata say. |

**The WT cut.** The V-neck collar is 4 cm wide (10.5 units) and its foot about 18.6 cm under the neck's point at the shoulder seam, inside the 18 to 20 cm the guidelines give; its two bands cross at the V, the one on the wearer's left over the other's end, and run round the back of the neck as one band, which in the turning view is a strap of its own with its edges and its back, lying lower and flatter than a judogi's standing collar. A black or black-and-red collar is a lighter band with two rows of matching top-stitching. The top is long enough to cover the buttocks (hem at 212 units against the judogi's 205), with side slits 20 cm up from the hem (the guidelines give 20 to 25 cm for the competition top), and the sleeves narrow from the armpit to the wrist (the cuff 0.8 of the judogi's straight sleeve). The cloth is the karate gi's plain weave with soft folds. **Where the colours lie on a poom collar** is not described in the guidelines, which say only "black and red": here the red half runs along the neck's edge and the black half outside it, as makers' poom doboks are commonly shown. That is the package's reading, not a rule, and is the one thing to check against a real poom dobok.

**The ITF cut.** The jacket wraps left over right as the judogi does, its lapel narrower and plain white (9 units, about 3.4 cm), its sleeves narrowing a little to the wrist, and the top panel's corner is held by two short cloth ties knotted at the wearer's right side, a hand above the belt. A black belt's jacket has the black band along its hem; the ITF approves black-belt and colour-belt doboks as separate models, and the band is how the makers of the approved black-belt models make them (the published rules list the models and do not describe the band). Holders of the 4th to 6th Dan may not compete in doboks with black stripes on the sleeves and trousers: those stripes are not drawn.

**The trousers** are the judogi's without the reinforced knee, as the karate gi's are; World Taekwondo says only that they do not cover the ankle bone.

**The belt.** The WT dobok's belt goes twice round with its ends hanging 38 cm, the ITF dobok's once round, as the ITF's Approved Clothing says a black belt is made, with its ends hanging 40 cm (see "How the belt is tied"). The ITF's degrees in gold Roman numerals, its junior black belt's white stripe, its tipped colour belts and the poom belt are presets (`itf-*`, `poom`).

**Not done here.** The poomsae divisions' own colours (World Taekwondo's poomsae tops and trousers by age, the masters' gold top); the ITF's instructor stripes; the WT approval mark and any federation's emblem, which are never drawn. The marks on the jacket (the judogi's emblem and logos) are laid out on the judogi's chest and sleeves, so on the V-neck an emblem on the left chest keeps clear of the judogi's lapel line, not of the V.

**Sources, read 2026-10-30.** [World Taekwondo Guidelines on World Taekwondo Logo, Manufacturer Identification (MI), Homologation Mark (CE) and Technical Requirements for WT-recognized Products, as of March 1, 2022](https://www.worldtaekwondo.org/att_file_up/partners_suppliers/2022/2022_WT_Guidelines_of_Identifications.pdf): Kyorugi Competition Uniform #2 (off-white top and trousers, the V-neck collar black, 4 cm wide and 18 to 20 cm deep, slits 20 to 25 cm, the top covering the buttocks and more than 15 cm above the knee cap, sleeves ending less than 3 cm from the wrist) and #3 (trousers not covering the ankle bone), Poomsae Competition Uniform #2 (Dan and Poom by division) and #3 (the NOC code on the back, 30 by 12 cm, 12 cm under the collar), Dobok Uniform #1 (the V-neck collar black for senior and junior Dan, black and red for cadet Poom; the flag, 10 by 7 cm, centred 3.5 cm under the shoulder line of the right arm). [ITF Tournament Rules 2023](https://itf-tkd.org/wp-content/uploads/2025/05/itf-tournament-rules-2023-copy.pdf), 17.3.1 (ITF-approved doboks; no black stripes on the sleeves and trousers for the 4th to 6th Dan in competition) and 17.3.6 (the flag, 3 by 5 cm, on the right front of the shirt, level with the ITF logo). [ITF Umpire Rules, Appendix 2, Approved Clothing](https://itftkd.sport/wp-content/uploads/2020/03/ITF-Umpire-Rules-Appendix-2-ITF-Approved-Clothing-Feb-3-2017.pdf), in force January 1st, 2015 (the flag on the right chest opposite the crest; the country's name printed on the back above the belt, black letters 6 to 8 cm high) and [Appendix 8, Approved Equipment](https://itftkd.sport/wp-content/uploads/2014/10/2015-Appendix-8-ITF-Approved-Equipment-Jan-20.pdf) (black-belt and colour-belt doboks approved as separate models). Only facts are used; none of the documents' wording or pictures. The drawing is original and shows no federation's, maker's or sponsor's mark: the lettering is your text and the flag's spot a neutral placeholder.

## The jiu-jitsu gi

`bjj` turns the judogi into a Brazilian jiu-jitsu gi on the same jacket, trousers and belt volumes: `renderJudogi({ mode: "suit", belt: "blue", bjj: { colour: "black", patches: "ibjjf" } })`. Open it as a [tile on the Uniforms page](https://johnmorrisdotca.github.io/senshu-jerseys/uniforms.html?garment=bjj-blue-covered&belt=blue), which has nine: plain, with the IBJJF-legal patches, and covered in patches, each in white, royal blue and black.

```js
import { renderJudogi, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "suit", belt: "blue", bjj: true });
renderJudogi({ mode: "suit", belt: "blue", bjj: { colour: "black", patches: "ibjjf" } });
renderJudogi({ mode: "suit", belt: "brown", bjj: { colour: "blue", patches: "covered" } });
renderJudogi({
  mode: "jacket", view: "flat-back", belt: "black",
  bjj: { patches: [{ zone: "upper-back", shape: "shield", colour: "wine", border: "gold", text: "ACADEMY", art: "star", widthCm: 22, heightCm: 22, edge: "satin" }] },
});
judogiCheck({ bjj: { patches: "covered" } }); // not ok: the forearm, the knee and the hip are not authorized locations
```

| Option | Values | What it does |
| --- | --- | --- |
| `colour` | `white`, `blue`, `black` | The gi's one colour. The manual allows white, royal blue and black, and says navy blue is not allowed, so there is no navy. Without it the judogi's own `colour` (white or blue) is taken. |
| `patches` | `none` (the default), `ibjjf`, `covered`, or a list of patches | `ibjjf` sews a patch in each authorized location, inside its size. `covered` sews one in every zone, the zones' full room, the way a team's gi is covered. A list is your own: any number from none to one in every zone. |
| `knee` | `true` (the default), `false` | The trousers' long reinforced knee, from above the knee to 10 cm above the cuff. `false` leaves it out (the same option as on the judogi). |

**A patch** is `{ zone, shape, outline, widthCm, heightCm, colour, border, text, art, ink, thicknessMm, edge }`. `zone` is one of `BJJ_ZONES` (below) and the only thing a patch must have; one patch to a zone, and a later one in the same zone is left out. `shape` is `rectangle`, `rounded`, `circle`, `shield` or `custom`, the last with an `outline`: a path of absolute commands `M L C Q Z` in a 100 by 100 box, stretched to the patch's size (anything else in it, an arc included, is refused and the patch is rounded). The size is in centimetres and never more than the zone has room for. `colour` is the cloth and `border` the edge's thread (a thread preset or `#rrggbb`; `false` stitches the edge in the cloth's own colour); `text` is up to 14 characters in the package's own letters, set along a long strip's length; `art` is generic placeholder art in thread, `star`, `chevrons`, `rings`, `wave`, `diamond` or `bolt`, and `ink` is the thread of both. No club's, team's, brand's or federation's mark is drawn, and there is no way to ask for one.

**Cloth of any shape.** `shapedCloth(id, shape, x, y, w, h, base, thread, build?)` (exported) is `cloth` cut to a shape, for any patch of the package or your own: `shape` is `"rectangle"` (then it is `cloth` itself), `"rounded"`, `"circle"` (an ellipse when the box is not square), `"shield"` or `{ path }`, a custom outline of absolute commands `M L C Q Z` and numbers in a 100 by 100 box, at most 400 characters, stretched to the box (anything else, an arc included, is cut as a rounded rectangle; `clothPath` is the check). `id` is the page-unique prefix of its defs; `x, y, w, h` the box in the drawing's units (2.63 to the centimetre at the 170 cm size); `base` the cloth's and `thread` the edge's colour, as `[r, g, b]`; `build` is `{ mm, edge }`, the thickness 3 to 4 mm (3.5 by default) and `"running"` or `"satin"` (`PATCH_MM`, `PATCH_EDGES`). It returns `{ defs, under, over }` as `cloth` does: put `under` (the cut edge standing off the garment, with its lift of shadow, and the cloth's face) first, what is printed on the patch next, then `over` (the weave, the turned edge, the lit line along the upper left and the stitching). `clothOutline(shape, w, h)` is the outline alone, centred on the origin. The drawing is the one the jiu-jitsu gi's patches have, and a test holds the two equal. `import { shapedCloth } from "@johnmorrisdotca/senshu-jerseys"`.

**Thick, and stitched.** Every patch is 3 to 4 mm thick (`thicknessMm`, kept to `PATCH_MM`, 3.5 by default): its cut edge stands off the gi as a wall of layers on the side away from the light, with a faint shadow under it, and its edge is stitched either as a running stitch near the edge (`edge: "running"`, the default) or as a dense satin border (`edge: "satin"`). A rectangle is drawn by `cloth` of the package's patch drawing (the back number's, judogiPatch.ts); the other shapes draw the same cloth, wall and stitch round their own outline, by `shapedCloth` of the same file (below). The wall is a flat offset: it reads when the gi is turned about 150 degrees and barely at a right angle to the patch.

**The zones.** Left and right are the wearer's, as the rules and the other places in this package have them. Each zone is on one face, so a patch turns with the cloth it is sewn on, and leans with the sleeve or the lapel where the cloth does.

| Face | Zones the IBJJF authorizes | More, in the `covered` look |
| --- | --- | --- |
| Jacket, front | `upper-arm-left`, `upper-arm-right`, `shoulder-left`, `shoulder-right`, `lapel-left`, `lapel-right`, `skirt-front` | `forearm-left`, `forearm-right`, `skirt-front-right` |
| Jacket, back | `upper-back`, `skirt-back` | `lower-back`, `shoulder-back-left`, `shoulder-back-right`, `arm-back-left`, `arm-back-right` |
| Trousers, front | `thigh-left`, `thigh-right`, `shin-left`, `shin-right` | `hip-left`, `hip-right`, `knee-left`, `knee-right` |
| Trousers, back | `thigh-back-left`, `thigh-back-right`, `calf-back-left`, `calf-back-right` | |

`BJJ_ZONES` has each zone's `room` and, where the manual authorizes it, its `legal` size, in centimetres at a 170 cm wearer.

**What the IBJJF says.** The IBJJF's [Uniform Manual for Manufactures](https://ibjjf.com/uniform), Section A (Kimonos: Juvenile, Adult and Master), edition EN-07, which the IBJJF's uniform page names as in force after the 2024 Gi World Championships, says, in its section 6, "Patches or embroidery may only be present at authorized locations. The patches must be properly sewn", and draws the locations: on the jacket's front both upper arms, a shoulder piece each side of the collar, a long strip along the left lapel, a smaller piece on the right chest and a strip across the skirt; on its back a large piece under the collar and a strip across the skirt; on the trousers, front and back, a piece on each thigh and one below the knee (the calf, behind), with "the patch must be 15 cm distance from the edge of the parts", and a spot for the maker's label on each cuff. Embroidery follows the same locations, and nothing is embroidered or printed inside or outside the collar. The manual prints no patch size. The `legal` sizes are this package's own reading of the diagram's proportions, so a patch inside them is not a ruling that a gi passes an inspection; the 15 cm is the manual's. The IBJJF's Rules Book (Article 13, which Wikipedia's "Brazilian jiu-jitsu gi" cites for the same locations) was not read.

The same manual gives the rest of what `judogiCheck` reports for this gi (`bjj-*`): the jacket goes to the thighs and its sleeves come to no more than 2 cm from the wrist (2.1); the collar is 1 to 1.3 cm thick and 4.5 to 5 cm wide, and the sleeve's space is at least 7 cm over its length (2.1); the trousers reach no more than 2 cm above the ankle bone (2.2); double reinforcement is allowed on the shoulders, underarms and skirt cut but not the forearm, the knees may be doubled from 10 cm above the cuff up to the crotch, and the hem's reinforcement is at most 2.5 cm and the waistband's 5 cm (3); the jacket is embossed braided fabric of 380 to 650 g/m2 and the trousers twill or rip-stop of 220 to 300 g/m2, with no solid detail in a colour other than the gi's (1.1, 1.2); the gi is white, royal blue or black (8.1); the belt is 4 to 5 cm wide with a tip of 20 to 30 cm (2.1). The IBJJF's [uniform page](https://ibjjf.com/uniform) gives the same measures and says patches must be cotton and properly sewn, and that unseamed patches or ones in unauthorized places are removed at inspection.

**What differs from the judogi.** The jacket is cut shorter (its hem 71 cm down at 170 cm against the judogi's 78) and fitted, taken in about 8 per cent at the waist and flaring back toward the hem, with its skirt standing out a little over the trousers; its sleeves narrow to the cuff; its cloth is a pearl weave of small raised beads, with no quilted skirt and no waist seam; its collar is 1.3 cm thick, the most the manual allows, and 4.9 cm wide, stitched in seven rows and drawn as a rubber-filled roll, which in the turning view is a strap of its own. The trousers are the judogi's with a long reinforced knee panel (doubled, stitched round twice and across in a lattice) and six loops on the back waistband and four on the front. The belt is tied as the other arts tie it, twice round and the ends hanging side by side, 25 cm (`GARMENT_TIES.bjj`; any of the `bjj` belt presets goes with it).

**Not done here.** The trousers are the judogi's length, which ends about 5 cm above the ankle, not the manual's 2 cm. The maker's label spot on each cuff, the label inside the jacket and the contrast side tape of many makers' gis are not drawn. The gi has no women's cut.
