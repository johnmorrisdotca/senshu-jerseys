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
- **Belt (obi):** a strap 5 mm thick (IJF: 4–5 mm), 4.2 cm wide for white and the rank colours, 4.5 cm for black, red-white and red, stitched in 10 rows, tied in two turns round the waist with a square knot and two ends hanging 20–30 cm. Turned, it is solid: its edges show their thickness, the square knot is the strap itself, wrapped and folded over and on its own the inside of the ring shows. Red-white is the panels of a kohaku belt, running along the belt. `beltWidthCm` sets the width in centimetres (3 to 6 drawn); `judogiCheck` reports a width the grade is not made in (see below). Without it the grade's own width is drawn: 4.2 cm for white and the rank colours, 4.5 for black, red-white and red. It applies to the worn and the belt-alone drawings; the flat layout keeps one width.

No maker, federation or sponsor mark is drawn. Sizes and positions cite the [IJF Judogi Rules (09 03 2022)](https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf) as facts. That document's pictures and wording are not copied.

```js
import { renderJudogi, judogiFrame, judogiCheck } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ colour: "white", mode: "pieces", belt: "white", size: "170" });
judogiFrame({ colour: "blue", mode: "jacket", yaw: 40 });
judogiCheck({ size: "180" });
```

`mode` is `pieces` (the jacket with its belt tied, and the trousers beside it), `suit`, `jacket`, `pants` or `belt`; `view` is `front`, `back`, `flat` (the pieces laid out with no volume, the belt beside them) or `flat-back` (the same, from behind).

`judogiCheck` reports whether a named size meets the cited length facts (jacket to mid-thigh, sleeves leaving about 5 cm to the wrist, trousers leaving about 5 cm to the ankle, belt 4–5 cm wide with 20–30 cm hanging ends). Traditional sizes 1–7 map onto those heights.

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

**Zekken (`style: "zekken"`).** The domestic Japanese patch: white cloth, the surname large in the upper two thirds (`name`) and the affiliation small in the lower third (`line`), in black (`ink: "black"`) or vermilion (`ink: "vermilion"`). The rule is read from the judo event requirements of Tochigi Prefecture's 2022 National Sports Festival ([PDF](https://www.pref.tochigi.lg.jp/tochigikokutai2022/hp/2019/wp-content/uploads/2022/06/710f38a4f609edf78deef82d1e3aeeeb.pdf), section `ゼッケン`, read 2026-10-27), which follows the All Japan Judo Federation's: the surname in the upper two thirds and the prefecture in the lower third, in regular script, bold gothic or mincho, black for men and dark red for women, sewn on 5 to 10 cm below the back collar, 25 to 30 cm tall and 30 to 35 cm across, stitched along its edge and diagonals. Here it is the smallest the rule allows, 30 by 25 cm and 5 cm below the collar, which at the jacket's 2.63 units to the centimetre leaves it clear of the belt: whatever size and place are asked for, the drawing stops a centimetre and a third above the belt's top edge (`judogiCheck` still reports a size outside the rule). Lettering is shrunk to fit the cloth down to half its size, and a longer text is cut and ends in an ellipsis. Japanese lettering is drawn as text in the reader's own gothic font: the package has no Japanese font of its own.

Words in the demo: `ゼッケン` (zekken, the numbered patch), `苗字` (surname), `所属` (affiliation), `黒` (black), `朱色` (vermilion).

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

Colours are the belt colours (`white` to `red`) or `grey`, `purple`, `gold` or any `#rrggbb` (`STRIPE_COLOURS`). It all rides on the belt's own cloth, so it turns with it, in every view, and it combines with embroidery, the label, the brand and a maker's logo. A style with no colour that exists draws nothing and the belt is drawn as before. The designer's "Stripes, tips and tags" group has a control for each part and a list of the real systems (`bp=<preset id>` in the address chooses one; `ss`, `sc`, `st`, `stn`, `stc`, `sb`, `sbn` and `se` hold the rest).

**The presets, and where they come from.** Only a page a person read is a source here; the rest are marked as leads.

| Preset ids | System | Source |
|---|---|---|
| `half-white-yellow`, `half-yellow-orange`, `half-orange-green`, `half-green-blue`, `half-blue-brown` | Judo Canada's kyu list: White, White-Yellow (6+), Yellow, Yellow-Orange (5+), Orange, Orange-Green (4+), Green, Green-Blue (3+), Blue, Blue-Brown (2+), Brown | [Judo Canada, Grading](https://judocanada.org/grading/) (read) |
| `mon-4` to `mon-18` | British Judo's 18 Mon grades: a coloured belt with one to three tags, red tags on yellow, orange, green, blue and brown | [British Judo, Mon Grade Promotion Syllabus, Dec 2024](https://britishjudo.org.uk/wp-content/uploads/2024/12/Mon-Grade-Promotion-Syllabus-Dec-2024.pdf) (read, its table of Mon grades) |
| `womens-black-white-line` | The women's black belt of the AJJF-approved kind (Kodokan women's belt): black with one white line down the middle of its whole length, sold in Japan | [KuSakura, Kodokan black belt for women (JGRK)](https://www.kusakurashop.com/products/judo-kodokan-belts-black-jgrk) (a retailer: read for what is sold, not a federation's rules; the line's width, about a quarter of the belt, is taken from its product picture) |
| `kids-centre-white`, `kids-centre-black`, `kids-centre-black-yellow` | Jiu-jitsu kids' two-colour belts (a centre stripe) | [Brazilian Black Belt, Kids belt system](https://brazilianblackbelt.com/2011/07/jiu-jitsu-kids-belt-system-from-2012-on-bjj) (read: two-colour belts, optional stripes) and [IBJJF, Graduation system](https://ibjjf.com/graduation-system) (read: it names three kids' graduation systems of degrees and stripes) |
| `tip-black-degrees-3`, `tip-red-degrees-3` | Degree stripes on a coloured tip | the same two pages; the tip's look is from John's reference photographs (jiu-jitsu and karate retailers' belts), not a federation page |
| `bars-white-1` to `bars-white-3`, `stripes-red-2` | Junior bars at each end (Australia: 3, 2 or 1 white bars by age) and one to three red stripes on both ends (Finland) | [Wikipedia, Rank in judo](https://en.wikipedia.org/wiki/Rank_in_judo) (read, **a secondary source: a lead, not confirmed from either federation**) |

Not confirmed: Judo Australia's and Finland's own pages (the Judo Australia policy PDF would not load), and any Kodokan junior belt (the Kodokan's page was not found, and Wikipedia says nothing of one). IBJJF's own graduation PDF would not load either, so the adult rank bars (a red bar on a black belt, coral belts) and karate's and taekwondo's stripes are not claimed here. Wikipedia also reports sub-rank tabs as "a small piece of fabric on the end of the belt" (Austria, Brazil's ends in the next colour, Denmark's half belts); those are what `bars` and `split` draw.

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

The package ships no Japanese font: a Japanese face is megabytes. A drawing saved as SVG, and the canvas painter (`judogiCanvas`, which draws the SVG as an image), can use only the fonts the computer has or the SVG carries, so pass the font with the text: `font: { family: "Yuji Syuku", css: "@font-face{font-family:'Yuji Syuku';src:url(data:font/woff2;base64,...)}" }`. The CSS must be `@font-face` rules with `data:` sources only (anything else is dropped). To keep it small, take a subset of just the characters you use: Google Fonts serves one when its address ends `&text=山田`, and `pyftsubset` makes one from a font file. Or skip fonts altogether and pass outlines you made yourself (opentype.js, say): `{ place, path: { d: "M...Z", width, height } }` is set as thread, scaled to the place.

**Manufacturer's logo** (`logos`): one logo to a garment, in the spots the rules name: `jacket-hem` (bottom front, wearer's left), `belt-end-left`, `belt-end-right`, `pants-waist-left`, `pants-waist-right` (just under the waistband, off centre beside the fly and the drawstring), `pants-thigh-left`, `pants-thigh-right` (the upper front of the leg, a hand lower) and `pants-leg-left`, `pants-leg-right` (near the hem). `tonal: true` draws a placeholder in thread the colour of the cloth. Give `svg` (SVG text) or `href` (a `data:image/` address) for your own artwork; without either a neutral placeholder is drawn, and the package ships nothing else. Artwork is drawn as an image, so nothing in it can run.

**Where marks go, and when they share.** Every mark belongs to an area of one face of a garment (the hem's corner on the jacket's front, the chest, the lapel's hem, a sleeve, the back of a sleeve for the shoulder strip, the trousers' hip beside the drawstring, the upper thigh, the lower leg, a hanging belt end), held a centimetre in from the seams, the vent, the hem's stitching, the belt's band, the drawstring, the neck label, the knee panel and a belt end's tip and bars. Marks are laid out in a fixed order (the emblem, the maker's logos, the embroidery, the Approved label, then the branding's own S), each at its usual spot if that is free: a mark that would touch another, or leave its area, is made smaller (down to 60 per cent, 70 for the emblem and the label) and moved to the nearest free spot in its area, always keeping 1 cm clear of the next. A mark that cannot be placed at that size is not drawn, and `judogiCheck` lists it (`skipped-<mark>`, `met: false`: "is not drawn: no room left in its area"), so the earlier marks are never moved or overdrawn. The designer shows the same note. `test/mark-places.test.ts` lays out every mark alone, every pair and every triple that can meet, at every belt width, and holds each box inside its area and clear of everything else.

**National emblem** (`emblem`): the left chest, a patch sewn on with a stitched border (`frame: "none"` for the artwork alone). Pass a flag as SVG text: [Hata](https://github.com/johnmorrisdotca/hata) gives one by country code, and by region (a Canadian province, say), as `import ca from "@johnmorrisdotca/hata/flags/ca"`; this package does not depend on it. Without artwork, a placeholder star in a ring.

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

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "pieces", belt: "black", label: { colour: "navy" } });
```

The label is a tribute and is nobody's: "APPROVED" across the top, "JUDOGI" across the bottom and, between them, one white judogi in a circle ringed by the words "SENSHU JERSEYS FEDERATION". The Senshu Jerseys Federation is made up, and **the label certifies nothing**. It is not the IJF's label and does not copy it: the colours, lettering, proportions and drawing are this package's own, with no coloured judogi in a ring, no red rectangular border, no serif lettering and no federation name. It is drawn as woven cloth: a fine weave, satin thread, a woven border, a sheen and a curl at one corner. `colour` is `navy` (the default), `forest` (`深緑`, deep green), `black`, `wine` (`えんじ`) or `cream` (`生成り`, unbleached), or `#rrggbb` for the cloth; `thread` is a thread preset or `#rrggbb`. They are `LABEL_COLOURS`. A label takes no size: it is 3.5 cm by 5 cm on the jacket and 2.6 cm by 3.7 cm on the trousers and the belt.

## Branding

`branding: true` puts the package's own made-up brand, Senshu (`選手`, "athlete"), everywhere a brand goes:

- **A woven neck label** inside the back of the collar, seen through the opening of the jacket: dark cloth, the name in spaced Latin letters across the top, a bold brush mark in a ring in the middle with a brush stroke either side, and a small line under it (`SINCE 2026` by default), sewn on with satin thread, a woven border and a slight curl.
- **A size tag** sewn under it, with the size you chose for the garment (`3`, `170`) or your own text (`3B`).
- **The S as the maker's logo**, a stylised S in one brush stroke, at the spots the rules name for a manufacturer's logo, one to a garment: the jacket's bottom front (or a shoulder: `spots.jacket: "shoulder-left"`), a trouser leg (or a waist) and a belt end. A logo you give in `logos` keeps its garment.
- The approval label (`label`) takes the brand's cloth and thread.

```js
import { renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

renderJudogi({ mode: "pieces", belt: "black", size: "3", branding: true });
renderJudogi({ mode: "jacket", branding: { name: "KAZE", kanji: "chikara", line: "MODEL 7", sizeTag: "3B", colour: "black", thread: "silver", logo: { svg: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>' } } });
```

**The brush mark** is drawn here as tapered strokes (no font): `te` `手` (hand, as in `選手`, an athlete; the default), `chikara` `力` (strength) or `kokoro` `心` (heart, spirit). Give `kanji` any other text and it is set in a system font instead (the same `font` rules as embroidery apply: the font has to be on the computer or in the drawing). **Swapping:** `name`, `line` and `sizeTag` are your words; `colour` is a cloth variant (`navy`, `forest`, `black`, `wine`, `cream`) or `#rrggbb` and `thread` a thread preset or `#rrggbb`; `logo` is your artwork (SVG text or a `data:image/` address) in place of the S; `neckLabel: false` and `logos: false` turn a part off. Nothing here is a real maker's or federation's mark, and the package ships no other brand.
