# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- **The worn belt's knot is a solid square knot** (SPX-792). It stood about 3.4 cm out from the cloth and, seen edge on (turns of 255 to 285 degrees, worst at 3x), read as a fan of thin ribbons. It is now two closed lengths of the belt with their own thickness from every side (face, back, two edges and cut ends): the wrap across the front, sinking into the turns at each side, and the crossing end lying over it and running down to the right-hand end, with a slight swell at the middle for the light. It stands 2.7 cm out at the most and its edge-on width never breaks into strips (`src/judogiKnot.ts`, which replaces the knot in `judogiStrap.ts`). A belt strap's cells are also grown less at their corners (0.3 against 0.9 of the cloth's, `STRAP_GROW`), so a cell seen along its face no longer shows as a spike. `test/beltWrap.test.ts` holds the knot within 2.9 cm of the body's outline and its edge-on silhouette at least 4.5 units wide and in one piece at 75, 90, 270 and 285 degrees, at tilts of -20, 0 and 15.

## [0.24.0] - 2026-10-30

### Added

- **A karate gi** (SPX-724): `karate` on `renderJudogi` and `judogiFrame` draws the judogi's jacket, trousers and belt as a karate gi: a lighter, plainer cloth (one fine weave, no quilted skirt, no waist seam, a single hem, softer folds), a narrower lapel and collar, no reinforced knee, a sleeve to the wrist, mid-forearm or the elbow (`sleeve: "full" | "three-quarter" | "short"`), a `training`, `kumite` or `kata` cut (`cut`; the hem and the softness of the cloth, and what is carried unasked), kanji stitched down the wearer's left chest (`text`, `thread`; `空手` by default on the training cut), a round patch on the left sleeve and left leg in neutral placeholder art (`patches`) (`tailCm` and longer belt ends are not part of this: the belt's hanging ends stay 25 cm until the belt variants land). `judogiCheck` reports the WKF's measures (sleeves between halfway down the forearm and the bend of the wrist, the jacket covering the hips, the trousers covering two thirds of the shin, the belt leaving 15 cm free each side of the knot, no personal embroidery on a competition gi) in place of the IJF's. Exports `KARATE_CUTS`, `KARATE_SLEEVES`, `KARATE_SLEEVE_SHARE`, `KARATE_TEXT` and the types `JudogiKarate`, `KarateCut`, `KarateSleeve`. The Uniforms page has a tile for each sleeve and for the kumite and kata cuts, and the designer a Karate gi switch with its controls. Sources, read 2026-10-30: the WKF Kumite Competition Rules (valid from 1.1.2024) and Karate Competition Rules (effective from 1.1.2020), Article 2, and Wikipedia's Karate gi (docs/judogi.md, "The karate gi").

## [0.23.3] - 2026-10-30

### Fixed

- **The worn belt's hanging ends lie on the jacket's skirt** (SPX-744). They hung straight down in front of it, so seen from the side (turns of 60 to 105 and 255 to 285 degrees) they stood 2 to 3 cm clear of the body's outline, and over the lapel they were hidden by it. Each end now rests on the belt's lower edge where it hangs from the knot and settles onto the cloth below (the jacket's rows ride in the belt's description, `StrapDesc.skirt`, about 0.2 kB a drawing), a lapel's thickness off the cloth. The belt ring wrapping the side walls, the sleeve in front of the belt and the knot's cells were already right since 0.21.3. `test/beltWrap.test.ts` holds the ends and the knot within reach of the body's outline at 60, 90, 105, 120, 240, 255, 270 and 285 degrees, the belt behind the near sleeve where it covers it, and the painter's order.

## [0.23.2] - 2026-10-30

### Added

- **A Uniforms page in the demo** (SPX-789): `uniforms.html` shows every garment side by side as picture tiles, each wearing the chosen belt (judogi white and blue now; a later garment is one more entry in `demo/uniformsList.js`), a row of belts folded (the grade colours and every real arrangement of `BELT_PRESETS`), and the chosen garment large and turnable (worn, belt alone or folded belt). Garment, belt, display, angle, tilt and zoom are kept in the address. It reuses the designer's view, tiles and styles. The package itself is unchanged.

### Changed

- **Sewn patches are 3 to 4 mm thick, 3.5 mm by default, with a stitched edge.** A back patch, an emblem and a flag patch stand off the cloth by their thickness (John's spec, 2026-10-30: an embroidered or woven patch on backing, stitched on, not bulky), and their cut edge shows in shade as the garment turns. The back patch's edge is a running stitch near the edge (`edge: "running"`, the default), and a woven square and a bordered emblem have a satin border. `backPatch.thicknessMm` and `backPatch.edge` set them; `PATCH_MM` and `PATCH_EDGES` are exported. The flag patch's merrowed edge stays 1.7 mm.

## [0.23.1] - 2026-10-30

### Changed

- **The trousers' drawstring is a flat braided cord, 1 cm wide and about 4 mm thick** (it was a round cord drawn about 9 mm across). Its lower and right edges stand up as its thickness, the top is shaded across, and the braid shows as fine ticks; the bow's loops, the knots and the hanging ends turn with the trousers. The 1 cm width and the 3 to 5 mm thickness are John's spec for judogi cord (2026-10-30); the makers' published pages I could reach gave no drawstring width. `test/judogiDrawstring.test.ts` holds the width and thickness, face on and turned at 30, 60 and 90 degrees.

## [0.23.0] - 2026-10-28

### Fixed

- **The folded belt and the gift box draw quickly again, in WebKit as well as Chromium** (SPX-735). The folded belt had grown to about 9,100 cells (it was about 3,000), which took Safari's engine tens of seconds to paint as an SVG and a fifth of a second a turn. It is now about 3,700 cells, with the same look: a layer's run is cut only where the cloth bends (a run that lies on the straight line between its neighbours, to a fiftieth of a centimetre, is one cell, never longer than 6 cm), a fold takes eight steps round its half circle (it was sixteen), the broad face is two strips across (it was four) and each rounded edge two cells (it was three). **A drawing that stands still** (`view: "flat"` and `"flat-back"` of the folded belt and the box) **no longer carries the cells nobody sees**: those facing away, and those wholly covered by cells drawn after them (`seenCells`), so a folded belt's flat SVG is under 800 kB, where it was 4.8 MB. **Painting a face for the canvas** no longer carries the SVG's per-cell triangles and clips in its defs (they are in a group, `<g data-cells>`, that `judogiCanvas` leaves out): a jacket and trousers on the canvas take about a fifth of the time to set up. In the designer the folded belt and the box laid flat are drawn on the canvas like the turning views, and a canvas is made from the new **`bare: true`** option of `renderJudogi` and `judogiFrame` (each piece's description and the pictures of its faces, none of its cells: a third of the work for the page to make and parse), with the whole drawing used only where the canvas cannot be made.
- **The designer's mouse is back as John had it** (SPX-750). A press and drag turns the piece at every zoom, as before (the last release made a drag pan once zoomed in). To move a zoomed view: Shift and drag, the middle or right button, or two fingers. The Drag: move / Drag: turn button is gone. **The wheel tips the piece the way it first did** (wheel down shows it more from below, as before the drag fix flipped it, which was only meant for the drag); Arrow Up and Arrow Down go back with it. A drag up still lifts the front, and the Tilt slider is as it was. In a flat layout, which cannot turn, a drag still moves a zoomed view.

### Added

- **The Kodokan emblem** (SPX-751). `emblem: { mark: "kodokan" }` draws the Kodokan's emblem (a white flower of sixteen petals with a thin dark edge round a red disc) on the left chest or a sleeve, with no patch border unless `frame: "patch"` is asked for; artwork you give still wins. In the designer it is a tile of the emblem picker (`emblem=kodokan`). Drawn by the package as vector, about 1 kB, from how it looks, not from any file; its trademark status is unchecked and it is included at the maintainer's choice (docs/judogi.md, NOTICE.md).
- **Marks no longer collide.** Every mark (embroidery, maker's logo, national emblem, Approved label, the branding's S) now belongs to an area of one face of a garment, held 1 cm in from seams, the side vent, the hem's stitching, the belt's band, the drawstring, the neck label, the knee panel and a belt end's tip and bars (`src/judogiPlaces.ts`). Marks are laid out in a fixed order; one that would touch another or leave its area is made smaller (down to 60 per cent) and moved to the nearest free spot in its area, with 1 cm between marks. One that cannot fit is not drawn, and `judogiCheck` reports it (`skipped-<mark>`, `met: false`); the designer shows the note. `test/mark-places.test.ts` checks every mark alone, every pair and every triple that can meet, at every belt width, for boxes inside their area and clear of everything else.
- **New places on the trousers:** `pants-thigh-left` and `pants-thigh-right` for an embroidery (the upper front of the leg, where a maker's tonal logo sits) and for the maker's logo; the existing `pants-left` and `pants-right` embroidery are KuSakura's "pants embroidery, left and right side" at the hip under the waistband, and the maker's woven patch `pants-waist-*` sits off centre beside the fly and drawstring.
- **`tonal: true`** on an embroidery and on a logo: thread the colour of the cloth (white on white, blue on blue), seen by its sheen and relief only. In the designer: a "Thread colour" switch on each embroidery line and a "Logo thread" switch, in the address as `e1n`, `e2n` and `logon`.
- The designer's embroidery places are grouped by garment (jacket, trousers, belt), with the new places in English and Japanese.
- **`mode: "folded"` and `mode: "box"`: a belt folded flat as a shop shows it, and in its gift box.** The folded belt is a stiff band doubled back on itself (see Changed), both free ends at the near end with the label right at the tip, lying at an angle, with an optional white paper band (`band`); it takes everything the belt takes (colour, kohaku sections, `beltStyle`, width, marks, label, branding). The box is a long kiri (paulownia) wood box 7 x 7 cm with a slide-on lid engraved `御帯` (`boxText`, `boxWood`), or a silver cardboard box with a white label strip and a neutral round red seal (`boxType`), closed, open with the lid beside it and the belt in it, or empty (`boxState`). The box size follows the belt size (`beltSize`, `boxSizeFor`, `boxDims`, `beltCmOfSize`): the wooden box holds a belt of size 6 at most and the silver one 6.5, and a longer belt is not drawn in a box (`judogiCheck` says so). Designer: two Display tiles, their controls and the address keys `bsz`, `bnd`, `bxt`, `bxs`, `bxx`, `bxw`, `bxz`. Docs: "The folded belt and the gift boxes" in docs/judogi.md.
- **Belt specifications as data** (`beltWidthsFor`, `BELT_MODELS`, `BELT_SIZES`, `KOHAKU`, `MAKER_EMBROIDERY`, `BELT_THICKNESSES`, `BELT_END_TAGS`, `BELT_SIZE_TAG_LINE`, `EMBROIDERY_STITCHINGS` and the helpers): the widths, stitch lines, thicknesses and lengths by size number that a maker's catalogue gives, the kohaku belt's sections, and the embroidery a maker offers, with sources and the day read (docs/judogi.md, "Belt specifications").
- **`stitching: "integrated"`** on an embroidery: worked into the belt as it is made, flatter than the default `applied`, on every garment.

### Changed

- **The folded belt is a stiff, thick band folded the way a shop folds it.** It is doubled back eight times for a size 4 (six to ten layers by the belt's length, always even, so both free ends are at the near end and the bundle is about seven belt widths long, where it was six layers, about ten), each layer with the belt's own thickness (a kohaku or black belt is drawn in its thick grade unless `beltThickness` says otherwise) and rounded edges. The layers never lie flat: they lie close in the middle of the bundle and spring apart toward its ends, so the stack is taller than its layers, and each fold is a thick round U-bend. The bundle bows a little, the lower layers stand out a little further at the near end, and the folds are uneven (the same way every time for the same belt). It is looked at from higher up (44 degrees, was 28) and turned (`FOLDED_TURN` -126) so that the top layer's whole face shows with its stitch rows, as in a shop's photograph. With `beltTags` the label and the size tag sit on the top layer's tip (the size tag shows the belt's size number, not the judogi's).
- **The folded belt is cloth, not planks, and its colours fall where they really do.** Each layer bends along its length (the gap to the layer below opens and closes along the bundle, the lower layers droop toward the near end, they bow and skew in plan and stand out unevenly), the cloth is a little crowned across its width with rounder edges, the folds are round and tight, and a loose belt is about 1.6 times its stitched thickness (about a centimetre a layer, as in the photographs). A kohaku belt's red and white sections are laid by the belt's real length (about 16 cm, an odd number of them so it is red at both ends, `kohakuSection`, `foldedPanels`): the top layer is red from the tip for the first section, then white, and a fold carries the colours round it. The maker's label and size tag sit at the tip as in a shop's photograph: with `beltTags` a folded belt shows a navy label with the Senshu S over its name and the fibre line, then the size tag (a black tag with an orange numeral and the "made in Japan" line), no white tag unless `white` is asked for, all lettered across the belt; new `makerColour`, `makerThread` and `sizeThread` on `beltTags` change them. The rows of stitches are finer (16 rows by default, fine dashes, each row started at its own place) and a white belt's thread is nearly the cloth's own.
- **A boxed belt is folded in eight, and a box keeps the maker's size.** The wooden box is 7 x 7 cm outside with a standard 4.5 cm belt (the maker's own figures; walls 6 mm and a 1 cm lid slab leave 5.4 cm inside) and the silver one about 5 cm wide with a 5.5 cm base, whatever the belt's thickness; a box grows only for a belt that needs more (wider than it takes with a little play, or so thick that pressed as far as it goes it still does not fit). With the lid on, the lid presses the springy bundle down: its layers are squeezed (up to a fifth of their thickness) and their gaps closed until the bundle is exactly as high as the inside (`closedBundle`, `boxInnerHeight`, `bundleHeight`). With the lid off, the bundle springs back and stands proud of the tray's rim by a few millimetres that follow the belt's thickness (`openBundle`, `SPRING_PROUD`: about 4 mm for a standard belt, a little more in the middle than at the ends), as a stiff belt does in the maker's photograph. The length still follows the box size. New exports `bundleHeight`, `closedBundle`, `openBundle`, `boxInnerHeight`, `foldedLayersFor` and the type `BoxFit`.
- **A folded belt's or a box's cells are grown less at their corners** (a quarter of a unit, was nine tenths), which drew spikes round the folds and the rounded edges, and a folded belt on its own is judged by depth per pixel on the graphics card.
- **The jacket is solid cloth inside as well as out** (turned, from any side and tip). The upper body has an inner face for the back and the front panel (the same weave, darker, shaded under the collar, a cloth's thickness inside the outer one), a rim round the neck's edge, and a wall down each inner side, so looking into the neck shows cloth, not the page. The V between the lapels is cut through the cloth (it was a flat grey card painted on the front), and through it the inside of the back shows. **The neck label and the size tag are sewn on the inside of the back panel**, just under the collar, and are seen only from the front through the opening (new mark place `jacket-back-inner`, which the marks keep clear of), no longer decals on the front's drawing. The face's picture carries the inner drawing below the jacket's own (`Face.extra`, `INNER_DY`); the flat views never show it. `VolumeDesc.inner`, `innerCells` (`judogiInner.ts`).
- **The collar sits on the neck with no gap** (the band stood 3 mm off the cloth) and, on the graphics card, is hidden by the body pixel by pixel where the body is in front (the lapels, seen from behind, no longer show as ragged tabs and notches at the neck): `placeCell(..., exact)` leaves out the whole-cell guess (`Cell.also`) there, and a collar stands 0.5 unit nearer than the cloth it lies on. The 2D painter and the SVG keep the whole-cell guess.
- **The judogi's proportions are measured from real photographs.** The jacket and trousers were redrawn to the medians of John's reference photographs (landmarks marked on each photograph and divided by its own jacket height, so the picture's size drops out): shoulder to shoulder .64 of the jacket's height (photographs' median .62), armpit to armpit .43, the belted waist .45, the hem .55, the sleeves hanging 14 degrees from the body, the belt at .63 of the way down the jacket (the form's belts sit higher, a man's lower), the waistband of the trousers .345 and both legs at the hem .42 of their length. The wide cut of the last change (57 cm across the chest, which read as a bodybuilder's) is gone: the body is about 47 cm across under the shoulders, as the photographs show, and the shoulders are 3 cm wider than the cut before it, as the standing men's are. Laid over each photograph at the same height, the outline of the render now agrees with the photograph's (overlap 0.93 on the white form turned a little, 0.87 on the standing man). The depth of the body is unchanged: no photograph shows it. The belted waist is a little fuller (it was a form's), the skirt hangs shorter below the belt, and the trousers' hips are narrower inside the jacket. `test/judogiProportions.test.ts` pins each ratio to its photograph median.
- **The jacket's inside runs to the hem.** Tipped to look up into the open bottom (or from behind), the jacket showed nothing behind its front shell: the inner faces stopped at the chest. The back panel's and the front panel's inner faces and the walls between them now run down to the hem, with a rim of cloth along the hem's edge, shaded darker inward as at the neck (`INNER_TO` is the hem). A test renders the jacket alone tipped from below at every 20 degrees and finds no background inside its silhouette.
- **The national emblem is centred on the chest from the jacket's own outline.** The chest's area is worked out from the top lapel's band and the sleeve's seam (`chestSpan`, `CHEST_TOP`, `CHEST_BOTTOM`), not fixed numbers for an older cut, and the emblem sits in the middle of it, clear of both. The belt's band and the hem's corner follow the belt's new height (`BELT_BOTTOM`), and a sleeve's marks follow its real lean (`SLEEVE_ANGLE`). Tests: the emblem's whole box lies on the front's body, off both sleeves, in every style and belt width, and no sleeve covers its corners at turns of up to 30 degrees either way.
- **A flag patch is the flag edge to edge**, with only a thin merrowed (overlock) edge of 1.7 mm in the colours of the flag's own edge, as flag patches are made; it was a white patch with a wide stitched border and a margin of cloth round a small flag. `frame: "bordered"` keeps the old white patch with its margin, as an option; `frame: "none"` is the artwork alone. The Kodokan's round badge and a placeholder keep their own looks.
- **The designer's emblem controls:** "Emblem style" (picture tiles: flag patch, name under it, white square with a script word), "Words under the emblem" and "Emblem place" (left chest, left or right upper sleeve), in the address as `ems`, `emc` and `emp`, in English and Japanese. The trousers' thigh places are labelled "(not an IJF place)" in the lists, as `judogiCheck` says.
- **The emblem sits where real ones do** (high on the left chest, a hand under the shoulder and clear of the lapel, not at the collar) and **the lapel is slimmer** (4.8 cm, it was drawn 5.5 cm; the rules give 4 to 5). New `emblem.caption` (the country's name under the artwork) and `emblem.style: "square"` (a white woven square with the artwork and a word in script, as a Japan team patch), `emblem.place` for the sleeve.
- **The maker's logo `jacket-shoulder-left/right` is on the front of the outer upper sleeve**, under the shoulder seam and turned with the sleeve's slope (it was on the back, an upright diamond floating by the armhole). The emblem takes `place: "sleeve-left" | "sleeve-right"` for a flag patch there. Embroidery gets down to 50 per cent of its size to stay inside a belt end, kept 2.4 units from the strap's bowed edges (a long name overhung the belt's edge).
- **Marks moved to their real places.** The jacket's maker's logo and Approved label sit in the corner right of the belt's hanging end and left of the side vent, one above the other (the label was under the belt end and the logo 2 units from the vent); the shoulder strip text is held on the sleeve (it ran off the outer edge); belt-end text is kept to the belt end's length and clear of the logo and the label; the label on the trousers and the vertical name beside the drawstring no longer overlap. A name on the lapel's hem set `direction: "down"` now runs down the lapel.
- **A strap's cells grown at their corners take their depth from their own plane** on the graphics card (`judogiGl.ts`), so a large flat cell no longer fights thin cloth just behind it; a folded belt or a box (`solid`) is drawn in its settled order alone, without the depth test.
- **Woven labels show a twill** (diagonal ribs, a lit one and a dark one in turn) over their weave, and the Senshu S has a thin outline stitch in a lighter second colour round its satin.
- **A belt's width is one a belt of its grade is made in**: 4.2 cm for white and the rank colours, 4.5 cm for black, red-white and red (they were 4, 4.75 and 5); the designer's Belt width control lists only the widths that exist for the chosen belt (white 4.2 or 4.5, black 4.2, 4.5 or 4.7), and `judogiCheck`'s `belt-width` note fails a width the grade is not made in. The IJF rules' text gives no belt width, so the old "4 to 5 cm" claim is gone.

## [0.22.0] - 2026-10-28

### Added

- **A belt's end tags and grade lines** (`beltTags: true`, or `{ end, maker, size, sizeLine, white, gradeLines, gradeThread }`): the woven maker's label (neutral art, the Senshu S), right under it a size tag with the size number and `日本製` ("made in Japan", the wearer's to change or remove), and under that a small white tag, blank or with the wearer's own words, on the right end or the left; the tags go together (a size tag needs the label, the white tag needs the size tag); and up to ten short grade lines above them. They read down the end as embroidery does, on the worn, flat and turning belts. In the designer: an "End tags" switch, the end, and the grade lines (`tg`, `te`, `gl`).

### Changed

- The sleeve's head stands less proud of the body, so the armhole reads as a seam and not a shelf.

## [0.21.3] - 2026-10-28

### Fixed

- **The worn belt, the sleeves and the body cover one another as they stand.** On the graphics card the jacket with its collar and belt is one scene judged by nearness at each point (each piece's depth is brought to the same footing by where it lies in the drawing), where the belt, the sleeve and the body used to be drawn in groups: the belt no longer ends in mid-air at the body's side walls, the sleeve in front of it hides it whole, and the knot's cells no longer show as slabs. The 2D and SVG painters keep their order.
- A sleeve's head goes over to the round of the arm over a longer way and with its corner rounded, so the shoulder reads less as one tube set on another.

## [0.21.2] - 2026-10-28

### Fixed

- **A sleeve or a trouser leg ends in an open tube**, not a closed lid: the rim has the hem's thickness (a ring facing along the sleeve), the inside of the cloth goes in 5 cm, darker than the outside (`Cell.inside`), and a lining closes the bottom of it. Seen from below along a leg the hollow shows; the trousers' silhouette test still finds no hole.
- **A sleeve hid nothing at its seam**: pinholes along the sleeve's side let the belt behind show through as dashes. The cloth under each sleeve, leg, body and hip block now runs a little past its outline, so the cells along an edge find no see-through texel.
- **The approval label's shadow** is a hair all round (it was a slab down one side) and its curl is smaller and fainter.

## [0.21.1] - 2026-10-28

### Fixed

- **The whole piece is in view at 1x at every angle and tilt** (a belt seen from behind and tipped had its loop cut off at the top, with no way to move it). `judogiCanvas` fits the drawing as turned: smaller if it must be, moved only as far as it must be, with a margin (`camera.fit`, true by default, and `data-bounds` and `data-fit` on the canvas say where it lies); the zoom and the pan are on top of that.
- **Zoomed in, a plain drag moves the view**, and a toggle beside the zoom buttons (shown only when zoomed) gives the drag back to turning; Shift swaps whichever it is; on touch one finger turns at 1x and moves the view when zoomed, with two fingers still pinching and moving. A **Fit** button puts the zoom and the pan back. Zoom still centres on the pointer or the pinch, and the plus and minus buttons about the middle.

## [0.21.0] - 2026-10-28

### Added

- **`gradeBelt(grade)`**: a grade of any belt system (`BELT_SYSTEMS`) as the `belt` and `beltStyle` that draw it: its colour or two colours (split lengthwise, or in panels that take turns: the jiu-jitsu coral belt), a stripe along it, a tip block with bars, tags. `beltStyle` takes a `base` colour (grey, purple, silver, gold) and an `alternate` colour for such belts, and `silver` joins `STRIPE_COLOURS`.
- **A picture of every belt system** (`docs/images/belts/<system id>.webp`, made by `pnpm belt-sheets`) with all its grades drawn from its data, on `docs/martial-arts.md`. A test draws every grade of every system and checks the page and the pictures.

## [0.20.1] - 2026-10-28

### Changed

- **A kohaku belt's red and white sections are 12 to 18 cm**, longer with the size (12 cm at 150, 18 cm at 200), and the pattern is set so that both cut ends are well inside a red section, on the strap, the worn belt and the flat drawing. A test checks the sections and the ends.
- The README's belts picture and the animation script use the widths belts are made in (black 4.2, 4.5 or 4.7 cm; red-and-white 4.5).
- A test checks that text on a belt's two hanging ends reads down the end, top to bottom, on the left end as on the right, in the flat, worn and turning drawings.

## [0.20.0] - 2026-10-28

### Added

- **A belt's rows of stitching, thickness and cover** (`beltStitchLines` 8, 10, 13, 14, 15 or 16; `beltThickness` `standard`, `thick` or `extra-thick`; `beltCover` `cotton`, `shusu` or `silk`): the rows are drawn, the thickness (about 5, 6 and 7 mm) shows at every edge and fold of the strap, and a satin or silk cover has a sheen. The designer offers, for the belt colour on show, only what a belt of that colour is made with (`beltStitchLinesFor`, `beltThicknessesFor`, `beltCoversFor`), as `sl`, `th` and `cv` in the address. (The names carry `belt` because `thickness` is already the cloth's thickness at the edge on every garment.)

## [0.19.1] - 2026-10-28

### Fixed

- **No wedge or crack at the trousers' crotch.** Turned about 45 to 60 degrees and tipped, the trousers showed a dark wedge where the hip block meets the legs and a hairline of the page behind it. The legs were a little narrower than the hip's last row (the cleft's edge sat 2 units short and the lip of the block hung over them), they began only under the hip, and the cleft between the lobes began high and deep. The legs are now as wide as the hip's last row and begin 12 units up inside it, the cleft forms later and smoother (`LOBES`), cells at the cleft are judged from the middle of their own lobe, and the shade does not average across the crease. A test fills every seen cell for a turn every 15 degrees at seven tips and fails on a hole in the silhouette (it found one of 9.5 square units before).

## [0.19.0] - 2026-10-28

### Added

- **`beltStyle`: stripes, halves, tips and tags on the belt.** A second colour split lengthwise (`split`, the half grades), stripes along the belt (`along`: centre, edges, top, bottom or a place across it), bars or tags across the ends (`bars`: count, which ends, width, gap, distance from the end) and a tip block with degree stripes on it (`tip`), in any combination and any number, on the worn, flat, turned and belt-alone drawings, together with embroidery, labels, the brand and logos.
- **`BELT_PRESETS`, `beltPreset`, `STRIPE_COLOURS`**: Judo Canada's half grades, British Judo's 18 Mon grades (a coloured belt with one to three tags), the women's black belt with a white line down its length (the AJJF-approved kuro-obi), kids' centre stripes, a tip with degree stripes (`tip.fromEndCm` sets how far from the end it starts) and junior bars at the ends, each with its system and source, listed with the pages they rest on in `docs/judogi.md` (what could not be confirmed is said there).
- **The designer's "Stripes, tips and tags"** group: a list of the real systems and a control for each part (`ss`, `sc`, `st`, `stn`, `stc`, `sb`, `sbn`, `se` in the address, `bp=<preset id>` to start from one).

### Changed

- The README's belts picture shows a yellow-orange half grade, a green belt with a black centre stripe and a black belt with red bars.

## [0.18.5] - 2026-10-28

### Changed

- **The designer's Display tiles show the package's own drawing.** The five pictures (Pieces, Suit, Jacket, Trousers, Belt) were hand-drawn outlines, and the Suit one was wrong; each is now the judogi in that display mode, as the designer draws it, made small by `scripts/mode-icons.mjs` (`pnpm mode-icons`, after the drawing changes) into `demo/judogiIcons.js`. A test checks that every mode has one.

## [0.18.4] - 2026-10-28

### Changed

- **A flat layout shows no turn controls.** In the Flat and Flat, back views the Angle and Tilt sliders, Auto-turn and Front are taken away instead of greyed, with a line saying why (a flat layout is a drawing on the table; choose Front or Back to turn it). The zoom stays. A test goes through every display mode in every view for a control that does nothing.
- **The designer zooms from 1x to 5x** (it was 3x), with the pinch, Ctrl or Command and the wheel, the buttons and the keys as before; a double press still goes to 2x and back. The picture is drawn again sharper past 3.5x (`judogiCanvas` takes a `scale` up to 8 where it took 6; at 8 a face is 2240 by 2560 pixels, so the designer asks for it only at that zoom). The same suit turned at about 40 frames a second at 1x and 32 at 5x in a headless browser on software graphics.

## [0.18.3] - 2026-10-28

### Fixed

- **The designer's tilt goes the right way.** A drag up (or the wheel up, Arrow Up, the Tilt slider toward its top) now lifts the FRONT of the piece, as a mouse or a finger on the slider would expect; it lowered it. The Tilt value is positive when the front is up; the package's own `tilt` is unchanged (positive when the piece is seen more from above), the designer gives it the opposite sign. An address with `tilt=` from before tips the other way.

## [0.18.2] - 2026-10-28

### Fixed

- **What is sewn on a belt's end no longer shows on the other side.** Embroidery, labels and logos on a hanging end showed through the strap mirrored when it turned away, because the reverse face used the same drawing as the outer one. The reverse (and the inside of the turns) now has a plain strip of the same cloth. Tests check at 0, 90, 180 and 270 degrees that a belt's marks show on its outer face only, and that a jacket's front marks and back patch each lie on their own face.

## [0.18.1] - 2026-10-28

### Fixed

- **No slivers or saw-teeth through the belt's knot** at any turn or tip. The knot is two lengths of strap that cross one another and the turns, and ordering its cells by their middles drew some of the layer underneath over the one above. A band's cells are now ordered by where they lie over one another (the nearer one last), and the graphics-card painter tests how near each part of a strap or a collar is at each point.

## [0.18.0] - 2026-10-28

### Changed

- **Embroidery is raised and shows its stitching.** Thread (letters, kanji, patches' text) has a side wall and a thin shadow on the lower right, a fine light line inside its lit upper-left edge, and finer rows of satin stitches that read as rows when zoomed (to 5x); a patch's border stitch has a lit upper edge and a shadow in each needle hole. It is the same drawing at any zoom, so it costs the painters nothing: a suit with embroidery weighs 5 kB more and draws in the same 31 ms.

### Added

- **`BELT_SYSTEMS`**: the belt systems of the martial arts as data, each read from a governing body's own pages where one could be read (the day and the page are in the data): judo (the IJF's belts and ends, Judo Canada's half grades, the British Judo Association's 18 mon grades with their tags), Brazilian jiu-jitsu (the IBJJF's kids' belts with white or black stripes, the adult belts, the black bar with degrees, the coral and red belts), ITF taekwon-do tips, and WKF karate competition belts; karate's kyu and dan bars and the other arts are leads, marked so. Each grade is a body of one or two colours, a stripe, a tip block with bars, or tags; each system has its width, the hang of the ends, where it is worn and the text customary on it. `docs/martial-arts.md` is written from the data (`node scripts/make-martial-arts-doc.mjs`).

- **Hangul embroidery and lettering.** Korean text is set as one square per syllable, in a font stack that names Korean faces after the Japanese ones (Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, Nanum), and tagged `lang="ko"` so Han characters beside it take Korean forms (`ja` beside kana). A column (`direction: "down"`) works the same.

### Changed

- **Text from outside is cleaned the same way everywhere** (embroidery, back patches, labels, brand, banners, names): composed to NFC (Hangul sent as parts is one syllable), control, direction and joiner characters out, and emoji, flags and right-to-left scripts, which thread and type here cannot set, taken out; it is cut to its length in whole characters (an accented letter or an astral character is one). A text left empty draws nothing. An invalid SVG from a control character is no longer possible.
- **The zekken** is drawn at the smallest size the rule allows, 30 by 25 cm and 5 cm below the collar, and any back patch stops 1.3 cm above the belt's top edge.

### Fixed

- **Zekken and back-number lettering stays inside its patch:** system text is centred on its line (it sat a third of a letter too high), and lettering shrinks to fit down to half its height, then is cut with an ellipsis.

## [0.17.2] - 2026-10-27

### Added

- **`beltWidthCm`**: a belt's width in centimetres (3 to 6 drawn; `judogiCheck` reports one outside the IJF's 4 to 5). By default a belt keeps its grade's own width, 4 cm for the rank colours, 4.75 for black, 5 for red-white and red. The designer has a "Belt width" choice (`bw=4`, `4.5` or `5` in the address).

### Changed

- **The belts picture** in the README shows ten belts, no two dressed alike: plain, a maker's logo, the Senshu brand, a club name, a surname in kanji, handwriting script (`font: "cursive"`), a name at each end, the Approved label, the Kodokan name beside a surname, and a narrow and a wide black belt. Red is left out of it.

## [0.17.1] - 2026-10-27

### Added

- **Two new pictures in the README's "The best of it"**: a row of six judogi jackets (back numbers, a national emblem, branding, embroidery, red-and-white, brown, black and white belts, one without) and a row of ten belts in every grade colour with embroidery, labels and logos, each on a tatami mat under floodlights, one piece turning in each. `pnpm animations` makes them (`ONLY=judogi-turn,belts-turn`), and each caption links to the designer with that piece's choices in the address.

## [0.17.0] - 2026-10-27

### Added

- **`JUDOGI_BELT_RGB`**: the belt colours the package draws, as `[r, g, b]` by belt name, for a page that shows a swatch of each.
- **The designer's form is visual.** A colour is a swatch (cloth, belt, back-number band, zekken ink, thread, label and brand colours), a few-way choice is a picture tile (display mode, back patch, stitching, emblem, brush mark), on or off is a switch (the branding), a set of places is a set of checkboxes (the maker's logos), a short choice of words is a segmented control (view, lettering, rules), and a dropdown is left only for the size and the embroidery's place. It is in groups with headings and works on a phone.
- **Only what matters to the display is shown.** Trousers only has no belt, back patch, emblem or neck-label words, and its places are the trousers'; a belt alone has no cloth colour; the jacket's places show only where the jacket is. What is hidden stays in the address and is back as it was when the display changes.

### Changed

- **The maker's logos are none to many places** (`logo=jacket-hem,belt-end-left` in the address; the old single value still reads). The IJF's one logo to a garment is a note under the places, not a block: two places on one garment are both kept and the first picked is drawn.

### Fixed

- The two jacket shoulder logo places showed their keys (`judoLogo_jacket-shoulder-left`) instead of "Jacket, shoulder left" and "Jacket, shoulder right". A test holds every place, style, mode and font to a name in both languages.
- On a phone the pinned view took most of the screen; the picture is held to a third of its height and the control rows are one line each.

## [0.16.0] - 2026-10-27

### Added

- **`judogiCanvas` takes a camera.** `turn(yaw, tilt, camera)` looks from `tilt` degrees further above (negative: below) than the drawing was made for, up to 45, and zooms about the drawing's middle (`zoom`, 1 up to 8) and moves it (`panX`, `panY`, CSS pixels) inside the canvas, which the new `box` option can make wider than the SVG so a zoomed drawing has the room. A zoom costs the painter nothing more: the same cells are drawn at a larger scale into a canvas of the same size, and `scale` (the pictures' pixels a unit) gives it the sharpness. `judogiTurn(svg, yaw, tilt)` tips an SVG the same way.
- **The designer is turned by hand.** A drag across the view is a half turn and up and down tips it up to 30 degrees (on a finger the browser keeps the vertical drag to scroll the page, so the Tilt slider tips it); a sideways swipe on a trackpad turns it; the wheel over the view tips it when the view has focus and otherwise scrolls the page as before; the arrow keys step it. Grabbing it stops the automatic turn. The Tilt slider and the angle are in the address (`tilt`).
- **Zoom from 1x to 3x** by a pinch, Ctrl (or Command) and the wheel, the zoom buttons, the keys `+`, `-` and `0`, and a double press (in to 2x where it was pressed, and again back); Shift and a drag, or two fingers, move a zoomed view. In the address (`zoom`).

## [0.15.1] - 2026-10-27

### Fixed

- **The emblem stays on the chest.** The national emblem was set on the front's drawing over the sleeve's head, so turned a little its end showed on the sleeve. It is now placed above where the lapels cross, between the lapel and the sleeve, and kept inside that room however large it is asked for.
- **The emblem is small.** Its default is a hand's width (a flag about 9.5 by 4.75 cm, a placeholder 6.5 cm square), well inside the IJF's 100 cm2 limit, not most of the chest.
- **The jacket no longer widens when it turns a little.** A body with flat sides is wider turned some degrees than face on (its corners swing out); the jacket's side wall is now shallow (`side` on the volume), so its width only narrows from the front to the side, and the belt and the collar follow the same section. A test measures the body's width at 0, 1, 2, 3, 4, 8, 15, 30, 45, 60 and 90 degrees.
- **Patches are thin.** A sewn patch and the emblem's patch were drawn with a soft cushion of shadow a centimetre wide. They now have a hair of contact shadow and a thin cut edge on the shaded side, as 1 to 2 mm of cloth does.
- **The trousers' drawstring is a round cord**, not a flat band: it has a shadow on the cloth, shading across it, a light along it, the twist of its strands, a bow of two loops with a knot, and two ends that hang with a small knot at each tip.

## [0.15.0] - 2026-10-27

### Added

- **Branding** (`branding` on `renderJudogi` and `judogiFrame`): the package's own made-up brand Senshu (`選手`), in one swappable option. A woven neck label inside the back of the collar (the name in spaced letters, a brush mark in a ring, a small line, satin thread on dark cloth with a woven border), a size tag sewn under it (the garment's size, or yours such as `3B`), and the stylised S as the maker's logo at the spots the rules name (the jacket's bottom front or a shoulder, a trouser leg or waist, a belt end), one to a garment. The brush mark is drawn as tapered strokes, with no font: `手` hand (default), `力` strength or `心` heart, spirit; any other text is set in a system font. The name, the small line, the size, the cloth and thread colours, the logo (your own SVG in place of the S) and the spots are all yours to change. The approval label takes the brand's colours. New logo places `jacket-shoulder-left` and `jacket-shoulder-right`.

## [0.14.0] - 2026-10-27

### Added

- **The "Approved Judogi" label** (`label` on `renderJudogi` and `judogiFrame`): the package's own woven label, on by one option on the jacket's bottom front beside the maker's logo spot, the trousers' front near the waist and the belt's left hanging end. "APPROVED" above, "JUDOGI" below, and between them one white judogi in a circle ringed by "SENSHU JERSEYS FEDERATION". Five colour variants (navy, forest green `深緑`, black, wine `えんじ`, cream `生成り`) or your own cloth and thread. Woven cloth: weave, satin thread, woven border, sheen, a curled corner. It is not the IJF's label (none of its coloured judogi, red border, serif lettering or name), and the made-up Senshu Jerseys Federation it names certifies nothing. The designer switches it on and off and picks the variant.

## [0.13.0] - 2026-10-27

### Added

- **Embroidery** (`embroidery` on `renderJudogi` and `judogiFrame`): names and words stitched as satin thread (fine stitches across each stroke, a shadow under, a sheen along) in the places the rules name: the jacket's lapel hem, left chest, sleeves and shoulders, a belt's two ends (on the belt as it hangs, flat or turned) and the trousers' top. Latin in the package's own stroke letters, or Japanese and other text in a system font (`gothic`, `kaisho` `楷書体`, `gyosho` `行書体`, `cursive`), or in a font you pass (`font: { family, css }`, an `@font-face` with `data:` sources, which a saved SVG and the canvas painter both need), or as outlines you made (`path`). Text can run along, across or down. No font is shipped.
- **Thread colours**: the twenty-four named presets, each with its Japanese name (`THREAD_COLOURS`, `THREAD_LABELS`, `THREAD_RGB`), or any `#rrggbb`.
- **Manufacturer's logos** (`logos`): one to a garment in the named spots (the jacket's bottom front, a belt end, the trousers' waist and legs), your own SVG or a neutral placeholder.
- **National emblem** (`emblem`): the left chest as a sewn patch with a stitched border, from a flag as SVG text (Hata's, by country code or region), your own artwork or a neutral placeholder.
- **Limits** (`judogiCheck({ rules })`): each mark reported against the IJF Judogi Rules (09 03 2022) or the All Japan Judo Federation's marking rules, as a retailer's chart states them; drawings are held to the limits.
- The designer has two embroidery lines, a logo spot, the emblem (a flag by code) and the rules, in the address.

## [0.12.0] - 2026-10-27

### Added

- **Back patches** (`backPatch` on `renderJudogi` and `judogiFrame`): the IJF-style back number (a name band, the nation's three letters large, an optional bottom band for a club or sponsor; band colours blue, gold, red, black, white or your own; stitched round its edge and crossed into an X or three lines) and the Japanese domestic zekken `ゼッケン` (white cloth, the surname large in the upper two thirds, the affiliation below, black or vermilion `朱` ink). A patch is sewn cloth: a turned and stitched edge, a soft shadow, the weave over its lettering. It lies on the jacket's back, curves with the body and turns with it. Places and sizes cite the IJF Judogi Rules (09 03 2022) and the All Japan Judo Federation's zekken rules as a retailer's chart states them; no federation mark is drawn. `judogiCheck` reports a patch against its rules.
- **`flat-back` view**: the cloth laid out, seen from behind.
- The designer has the back patch's choices (style, words, colour, ink, stitching), all in the address.

## [0.11.0] - 2026-10-26

### Changed

- **The judogi, drawn again from the ground up.** 0.10.0's judogi was flat and did not look like one. Its proportions follow product photographs. The jacket now has a body to mid-thigh with side vents, measured from a product photograph of a contest judogi on a form: sloping shoulders to the points where the sleeves are set on, a body that narrows under the sleeves' heads and hangs straight and narrow from the armpit to the belt (about two thirds of the shoulders' width), and a skirt that flares out below the belt to the hem. The sleeves are straight bands, as wide under the arm as at the cuff, angled a little out from the body with a gap to it below the armpit; turned, each sleeve's head is set on along the armhole and goes over the shoulder, so no gap opens between sleeve and body and the shoulder is round side on. Side on, the jacket and the trousers are as deep as a person: some 24 cm at the chest and the hips, with round sleeves and legs. The collar is a thick band of six stitched rows standing round the back of the neck and running down the front, the wearer's left over the right, with the inside of the neck in shadow. The upper body has a fine grain weave and the skirt quilted diamonds below the waist seam. The trousers have a deep waistband gathered by a drawstring tied in a bow (worn under the jacket, the waist is drawn in and the hips sit inside the skirt; laid out, they keep their full width), full hips down to a low crotch that part into two straight legs set a little apart (they turn as two legs, not as one board), reinforced knees and a turned hem. The belt ties with a square knot and two hanging ends, and stands alone as a tied ring. Each body is cut into rows no more than 3 cm apart, so white cloth shades smoothly instead of in bands. The pieces layout ties the chosen belt on the jacket. Contest white is brighter and contest blue a royal blue. The options are the same.
- **The belt is a solid strap.** Turned, it is no longer a picture on the jacket or on an empty ring: its two turns are 5 mm thick each (IJF: 4–5 mm) with a top and a bottom edge, the square knot is two lengths of the strap itself (one wrapped across the front, the other folded over the top edge and crossing it down to an end), and each hanging end has a front, a back, two edges and a cut end. On its own, the far half of the ring shows its inside and from behind the knot's ends are seen from the back; worn, the knot and ends stand clear of the jacket side on, and the jacket carries only the belt's shadow. A rank belt is 4 cm wide, a black belt 4.75 cm and a master's red or red-white belt 5 cm, stitched in 10 rows (quality belts carry 8 to 15). A red-white belt's panels run along the belt, on its ends as on its turns, turned or flat.
- **The collar is a band of its own.** Turned, it is a separate piece 9 mm thick (IJF: up to 1 cm) laid on the jacket: it stands up round the back of the neck, lies down the front with its edges showing their thickness, and the top lapel lies over the under one. From behind the body hides the lapels.
- **The near sleeve hangs over the belt.** The collar and a tied belt are drawn after the jacket's body and before the sleeve nearest the eye, so a turned jacket no longer shows its belt across the arm. The same order holds in the SVG, on WebGL and on the 2D canvas.
- **A white cloth's shade.** A judogi piece is shaded smoothly, in opaque greys that multiply onto the cloth, so a white judogi no longer shows the grid of its cells as lines.

### Added

- **`judogiCanvas`** (from `@johnmorrisdotca/senshu-jerseys/turn`): paints a judogi's SVG on a canvas that turns it at the screen's full frame rate, every cell of a piece in one WebGL 2 draw, with a 2D canvas where WebGL 2 is missing. As an SVG, a pair of pieces took about a second a frame to turn in Safari. The returned SVG keeps the drawing itself.
- **`judogiTurn`** (from the same entry): turns a judogi's SVG already on a page to another angle in place.
- **The designer turns.** It stays still until a mouse comes over it or Auto-turn is pressed, turns in place with the angle slider, keeps its angle when a choice changes, and its controls are in the page's own style. A browser test holds it.

## [0.10.0] - 2026-10-23

### Added

- **Judogi** (`renderJudogi`, `judogiFrame`, `judogiCheck`): jacket, trousers and belt as original SVG. Contest white or blue; rank belts including red-white; named sizes (1–7 and 150–200 cm); display modes pieces, suit, jacket, trousers or belt; front, back and flat; a turning frame with cloth thickness. The designer is `judogi.html`, choices in the address, export to SVG or PNG. No maker or federation marks. Sizes cite the IJF Judogi Rules (09 03 2022). [docs/judogi.md](docs/judogi.md).

## [0.9.1] - 2026-10-21

The turning pictures show one thing moving: in a row, only the centre one turns.

### Changed

- **Only the centre jersey turns in the README's rows** (`pnpm animations`): five jerseys of five sports (the basketball tank turns, and a football jersey joins the row) and three hockey patterns (the black sawtooth sweater turns); the others stand still, a little turned. The hero sweater, which is alone, is unchanged, and so are the speed (half of the first pictures') and the still hero first. The demo already keeps every jersey still until the pointer is over it; nothing there changed.

## [0.9.0] - 2026-10-21

The jersey can turn the other way, and the pictures and the demo are slower and wait for the pointer.

### Added

- **`direction` for the automatic turn**: `bindTurn(container, options, { direction: "clockwise" })` (seen from above; the default, `"counterclockwise"`, is how it has always turned, the front swinging to the viewer's right). `handle.setDirection(direction)` changes it while it turns without stopping it, `handle.direction()` reads it, and `turnDirection(value)` is the check the option goes through (`./turn`). A drag, the keys and `setYaw` are not reversed. The `<senshu-jersey>` element has the attribute `direction`, `embed.html` the parameter `direction=clockwise`. Tests: `test/turn.test.ts` and the demo's.

### Changed

- **README: it opens on the still picture again** (seven jerseys, one in each cut) with the turned and phone pictures under it, as before 0.8.2. The moving pictures sit lower, each beside its own point of "The best of it" (the four kits beside the cuts, the hockey patterns, the single sweater beside turning), never stacked.
- **The moving pictures turn at half the speed** (`pnpm animations` shows each frame 140 ms, it was 70; `DELAY=70` for the old pace).
- **Demo: the jersey waits still and turns while the mouse is over it.** Leaving stops it where it is; a tap on a phone turns it and a second tap holds it (a drag turns it by hand as before). Auto-turn keeps it going wherever the pointer is, and `?turn=1` starts it with the page. The turn is 20 degrees a second (it was 40). A **Reverse** button (`逆回転`, "reverse rotation", with the label `逆向きに回す`, "Turn the other way") turns it the other way, kept in the address as `dir=cw`. A reader who prefers reduced motion is never turned for by the pointer. `turn=0`, `yaw=` and the other addresses work as before; the package's own default speed (40) is unchanged.

## [0.8.2] - 2026-10-20

The npm page and the demo open on a jersey that turns. No change to the package's code beyond its version.

### Changed

- **README: the first thing is a turning jersey.** A hockey sweater turning in 3D, four jerseys of four sports turning out of step and the hockey patterns turning, each an animated webp in a light and a dark twin (`docs/images/hero-turn-*.webp`, `kits-turn-*.webp`, `patterns-turn-*.webp`, each under 1 MB), then "The best of it": the seven cuts, the hockey patterns, the officials and the banners, a picture each. The detail of cuffs, diagonal text and arm bands moved to `docs/cuffs-and-text.md` (nothing removed); the README is shorter than before.
- **The pictures are made by a script from the demo:** `pnpm animations` (`scripts/animations.mjs`) takes one frame per angle with Playwright and joins them with `img2webp`.
- **Demo: it opens on the jersey turning by itself**, with its controls (the angle, Pause, Front, the fixed views, the volume switch) under it and the stage pinned in view while the options scroll past, on a phone and on a desk. Changing the cut, the look, the fit or the colours while it turns leaves the turn going from where it was. The address holds `turn=0` once it is paused (an address with an angle opens still); a reader who prefers reduced motion gets it still.

### Fixed

- The shared background module in `scripts/` (tooling for the demo and the README pictures; the package ships none of it) is now the family's version 1.0.1: the `id` it is given is made safe (letters, digits, `_` and `-`; `bg-` in front of one that does not start with a letter) before it is written into element ids and `url(#...)`. `test/family-backgrounds.test.ts` draws every preset with hostile ids.

## [0.8.1] - 2026-10-19

The npm page shows the hockey patterns of 0.8.0. No change to the package's code.

### Changed

- **README and docs: a showcase for the shrinking sleeve bands, the sawtooth sleeves and the pointed yoke.** A new picture of the four `hockey-patterns` sweaters, front and back, in a light and a dark twin, a new page, `docs/hockey-patterns.md`, with a short example, and a link to it from the README; the turning sweater's picture is remade with the closed sleeves. `ONLY=<name> node scripts/screenshots.mjs` takes one picture.
- **`CONTRIBUTING.md` has a release-checklist line for visual features:** new visual feature? update the README images and add a showcase section if the examples do not show it well.

## [0.8.0] - 2026-10-18

### Added

- **Shrinking sleeve bands, sawtooth sleeves and a pointed yoke.** `sleeveStripes` and `hemStripes` take `{ shrink: { count, from, to, colour?, gap? } }` (bands and gaps that thin out toward the cuff or the hem), `sleeveTeeth` draws a row of teeth where two sleeve colours meet (`at`, `colour`, `count`, `depth`, `direction`), and `yoke: "pointed"` ends in a V. The `hockey-patterns` presets ("Shrinking bands" and "Sawtooth sleeves", home and away) show them in plain colours; nothing in them is a team's mark. The preset spec has `sh=`, `hh=` and `tt=` and `y=p`.

### Added

- **Tilt the turning garment up to 30 degrees.** `pitch` now goes from 0 to 30 (it was 0 to 20; 8 is still the default), on `jerseyFrame`, `bindTurn` and the `<senshu-jersey>` element's `pitch` attribute. Past the default the picture grows taller so a sleeve is never cut off, and the cells, their order and the closed torso and arms hold at every tilt. The flat turn is a card and ignores it. The demo has a Tilt slider (`?pitch=`) beside the angle, shown with the volume view.

### Changed

- **A captain's C and A look like the ones on a hockey sweater.** They are the bare letter in a heavy block face with a thick outline in a contrasting colour (the second trim, white or black, whichever sets it off from the letter and the cloth), no disc, flat and on the turning garment. `style: "disc"` on a chest badge, and `patchStyle: "disc"` (the `patch-style` attribute) on the old `patch`, keep the round patch.

### Fixed

- **Sleeves are closed tubes in the volume view.** Each sleeve's cuff has a lining, so a side or three-quarter view no longer looks up an open tube (a T-shirt, soccer, baseball, football, rugby and handball sleeve, in both fits). A tank's rows now run in order from the neck to the hem, which removes the ragged edge and the see-through wedges at its side, and its side wall samples a little further in from the outline. `test/volume.test.ts` checks that nothing behind an arm shows through, in every cut and both fits.

## [0.7.1] - 2026-10-18

### Changed

- **The README's pictures are made from the current code.** The turning strip is the volume view (`volume: true`), the sweater turned in seven steps from the front through the side to the back, so it shows a solid garment instead of the flat cards. A women's and a men's cut side by side (`fit: "womens"`) and Canada's diagonal national layout (`national: "canada:diagonal"`) each have a picture, and the championship banners (`renderTitleBanner`) a new one. `scripts/screenshots.mjs` makes them all; the captions and alt text match.

## [0.7.0] - 2026-10-17

### Added

- **Women's cuts.** `fit: "womens"` (the `fit` attribute, `?fit=womens` in the demo) on every sport's cut: a shorter body, narrower shoulders and chest, narrower and slightly shorter sleeves, a waist that tapers in and a hem that flares back out (curved where the men's is level; a hockey sweater's stays level). The places for the number, name, text, crest and badges move and shrink with it. Every pattern, stripe, yoke, name, number, sleeve number, chest badge and national layout follows the women's outline, flat and in the volume view, whose body is lofted from it and stays closed at every angle. `fit: "mens"` is the default and its drawings are unchanged; the title says "Women's". `FIT_IDS`, `cutSpec(cut, fit)`, a fit control, and a men's and women's sheet of every cut in the demo, `docs/fit.md`.

### Changed

- **The diagonal national layout reads top-down.** The country's name now starts high on the chest and runs down toward the hem, with the split mark above it on the wearer's left, as on the Canada jersey it follows. `direction: "up"` (`national: "canada:diagonal:up"`, `{ country, layout, direction }`) keeps the old rising look. The name stays on its own side of the cut and the mark clears it, flat and on the turning garment (`NATIONAL_DIRECTIONS`).

## [0.6.0] - 2026-10-17

### Added

- **National layouts.** `national: "canada:diagonal"` (or `{ country, layout, text? }`) draws a country's own simplified mark and its flag in one of eight layouts: `quadrant`, `diagonal` (the mark cut along a slant, the name set up the cut), `centred`, `arched` (the name arched over the mark, marks at the hem corners and on the sleeves), `serrated`, `stepped`, `wordmark` and the whole `flag` (the stars over the chest and shoulders for the United States). All twelve countries of the national hockey styles have a mark (a leaf, a star, a Nordic cross, a plain cross, a wedge, a double cross, bars, a disc, a lily) and a flag; the marks are this package's own shapes, never a federation's crest. They work on every cut, in every look, flat and on the turning garment. `NATIONAL_COUNTRIES`, `NATIONAL_LAYOUTS`, `NATIONAL_NAMES`, `nationalStyle` (in `presets/hockey-styles`), the `national` attribute of the element and `embed.html`, a gallery of every country in each layout in the demo, and `docs/national.md`. The jersey bundle's size limit is raised to 28 kB gzipped (the banner's to 25, the turn's to 30, the element's to 36).

## [0.5.3] - 2026-10-17

### Fixed

- **Name and number letters are no longer cut off.** Glyph strokes were butt-capped, so the foot of an M, R, I or H stem stopped half a stroke short of the letter's box and the outline (a stroke of the same shape) never closed round the end. They are square-capped now, fill and outline, the dot, comma, colon and apostrophe were redrawn to match, and the Q's tail stays inside its box. Tests hold every letter and digit, in every weight, to its box.
- **A sleeve number is centred on the arm in a side view.** `around` now defaults to -90 (the middle of the arm's outer face), where it was -55, which put the number toward the front of the arm at 90 and 270 degrees. It stays on the arm as it turns; seen from the front it is edge-on, and `around: -55` brings the old place back. A test holds the number's middle to the arm's at a straight side view on four cuts.
- **A volume jersey's side view is solid.** The body's rows follow the side seam (and a tank's armhole) so a row is never wider than the drawing there, the side wall's two halves overlap at the middle, and every cell samples the drawing a little inside its edge. The slits under the sleeve at 84 and 90 degrees, the clear sliver at the shoulder tip and the ragged neck rim are gone. A test checks every 15 degrees that nothing behind the torso shows through.

## [0.5.2] - 2026-10-17

### Changed

- **Title-banner type is condensed sports sans.** Honour, city, club and years are SVG `<text>` (`Arial Narrow` and a condensed sans stack, even tracking, size drops to fit). They are no longer the jersey's tackle-twill stroke glyphs, which looked warped on a pennant. No `textLength`.
- **A volume jersey's side is cloth.** The torso's front and back halves no longer meet as a line at z = 0: a side wall wraps the drawing's own edge, so a side or three-quarter view is solid (stripes wrap) instead of a hole under the arm.

## [0.5.1] - 2026-10-17

### Added

- **`renderTitleBanner`**: championship pennants (black rod, gold knobs, honour and years) and garden flags (stars bar, city and club as letters, honour and years). The caller passes colours, honour, years and an optional logo; the package still draws no team's mark and no league shield. `TITLE_BANNER_KINDS`, `yearLines`.

## [0.5.0] - 2026-10-17

### Added

- **`kind: "hanging"`** on `renderBanner`: a hanging plate (last name, a large number, an optional caller-supplied logo, hem stripes, no years and no sweater), next to the rafter pennant. `logo` is an SVG document, a `data:image` address, or an `http(s)` or root-relative image; anything else is ignored (`logoHref`). The package still draws no team's own mark.

### Changed

- **A rafter banner's sweater fills the cloth.** The number and the last name sit on the jersey's back, the years sit below in a larger size, and a pennant can take a sweater too (it did not). `sweater: true` or its own options ask for this; a banner without a sweater is unchanged.

## [0.4.0] - 2026-10-16

### Added

- **A volumetric turn.** `jerseyFrame`, `bindTurn` and `applyTurn` take `volume: true` (and `pitch`, 0 to 20 degrees, 8 by default) and draw the shirt as a garment: a body lofted from the cut's measures and two tapered sleeves, with the front and back drawings wrapped over them in small triangles, cloth that faces away hidden, the sleeve behind the body drawn first, and a little shade. Front, back, both sides and the angles between keep a believable silhouette, and every option follows the surfaces. The flat turn is the default and is unchanged. `docs/turning.md` says how it is drawn; `test/volume.test.ts` holds it (the eight angles, every cut, the box, the matrices against the points, hostile values). The element takes `volume` and `pitch`, `embed.html` takes `volume=1` and `yaw`, and the demo has a Volume switch, fixed views (front, left side, back, right side, three-quarter) and a Compare of the flat card with the garment.
- A pattern that differs from side to side (halves, quarters, an odd stripe count) is mirrored on the back of the volumetric garment, so it runs on round the side seam.

- **Sleeve numbers and patches that stay on the arm.** `sleeveNumbers` takes `"left"` and `"right"` (the wearer's) as well as `true`, and `sleeveLeft` and `sleeveRight` give each sleeve its own number, size, place down the sleeve, place round the arm, fill and outline, and a plain patch (round, shield or square, with up to three letters). On the volumetric turn they are drawn on the arm's surface in their own cells: attached as the shirt turns, hidden where the arm turns away, never mirrored, and the back number is never taken for a sleeve number. A flat drawing with `sleeveNumbers: true` is unchanged. The element takes `sleeve-numbers="left"`, `sleeve-left` and `sleeve-right`; the demo has the controls; `docs/sleeves.md` says it all, and `test/sleeves.test.ts` holds it.
- **Chest badges.** `chestBadges` puts captain's and alternate's letters, plain patches and flags on the chest, each on the wearer's left or right breast, with a size, an offset and colours, up to four. A flag is the caller's: stripes, a canton and a disc from their colours, or any SVG or emblem id as `art`; the package draws none of its own. A badge keeps clear of the collar, the crest, the pocket, the chest text and number, the old `patch` and the other badges, by sliding down (`nudge: false` keeps it where it is put). The `patch` option is unchanged. On the volumetric turn a badge is on the chest and turns with it. The element takes `chest-badges`; the demo has the controls; `docs/chest.md` says it all, and `test/chest.test.ts` holds it.
- **Twelve national hockey styles** (`presets/hockey-styles`): Canada, the United States, Sweden, Finland, Czechia, Slovakia, Switzerland, Germany, Latvia, Norway, Japan and France, each home and away (24 presets, `style:<country>-2026-home`), each a layout of its own (a curved yoke, a chest band, raglan sleeves, hoops, chevrons, stripe sets, wide band, a sash, halves ...) with its own collar, cuffs and number treatment. Colours of the countries, layouts drawn here, no crest, flag, federation, sponsor or maker's mark. The presets are frozen and `personalStyle(id, overrides)` returns fresh options with a name, a number, a palette, the number's outline, the striping, the collar, a patch and chest badges laid over them. They turn on the volumetric garment with everything following the surfaces. The demo has a *National styles* section with the twelve at once (home or away) and the stage's controls to personalise one; `docs/hockey-styles.md` and `docs/hockey-styles.ja.md` (the first Japanese page of the docs) say it all, and `test/styles.test.ts` holds it.
- `test/photos.test.ts` holds the five things the photos of the Canadiens, Rangers, Kraken, Flames and Stars asked for on the presets that carry them: red cuffs over the stripes and a yoke, diagonal chest text either way for the caller's letters, stripe sets in three colours, a wide elbow band, and a shoulder patch (the caller's, with the sleeve words; `docs/sleeves.md` shows it on the Stars' away shirt).
- **Officials: numbers on the sleeves and their caps.** The hockey, basketball and football officials' shirts (NHL, Hockey Canada and PWHL referees and linesmen, the NHL's candy stripes, the NBA's two striped shirts, the NFL, CFL, NCAA and high school) say `sn=1`, so a number given is drawn on the back and on both upper arms, flat and on the turning garment. `OFFICIAL_CAPS` (`presets/officials`): the white cap of the NFL and CFL referee, the black of their other officials and the umpire's navy, with no letters, for `renderCap`; the demo's Officials section shows them. `docs/officials.md` is updated and `test/officials.test.ts` holds both.

### Changed

- The size limits of the bundles are raised, gzipped, for the volume, the sleeves and the chest badges: the jersey's from 20 to 24 kB, the banner's from 16 to 20, the turn's from 17 to 25 and the element's from 24 to 32.


### Fixed

- **The letters on a cap seen from the side are whole.** They ran off the edge of the crown ("CAN" read "CA", "USA" read "US"). They are now turned away with the front panel, narrowed to just over half and set in the middle of the panel, clear of the seam and of the crown's edge, for one to three letters and for kanji. 
- **The letters on a two-tone cap seen from the front read on both colours.** The front panel is narrower than the letters, so "CAN" lost its "C" against a white panel and "USA" and "JPN" ran across the seam. The letters now have an outline in the other colour (a real cap's lettering has one), chosen so that the fill or the outline has at least 4.5 to 1 against the panel and the crown both. A one-colour cap is unchanged. On the side view the letters were also set lower and a little smaller, so they stay on the front panel and clear of its far edge.
- The cap and helmet pictures in the README are made again.

### Changed

- **The demo, the README and the docs show real countries instead of made-up teams.** The two-kit example is Japan against Canada (it was "Gulls" against "Bison"), the retired-number banners and the caps are in the colours of Canada, the USA and Japan (they were eight invented clubs, with names such as "Harbour City Gulls"), and the caps read CAN, USA and JPN. Colours and stripes only, as before: no crest, no federation mark, no flag. The names of the players are still made up. The banner and cap pictures are made again.
- The demo's banners are captioned with the country, in Japanese too (`カナダ代表`, `アメリカ代表`, `日本代表`, as in the national-team presets).
- **The docs are single-language.** `CONTRIBUTING.md` says so (one page per language, no mixed tables, the Japanese twin named `<name>.ja.md`), and a new test, `test/docs-language.test.ts`, fails when an English page holds Japanese outside code or a Japanese page holds English prose. The one exception, the list of the family in the README, is named in the test with its reason.

## [0.3.3] - 2026-10-14

### Fixed

- **The years and the name on a banner no longer touch the notch or the inner line.** On the rectangle with a sweater, the years ran across the inner line and into the swallow-tail notch; on the shield, a long run of years crossed the curve, and on the pennant a name or the years touched its sides. The writing is now stacked higher and shrunk where it must, so it stays on the cloth with clear space round it, for a long name and long years too. The banner itself is unchanged. `test/banner.test.ts` measures it from the finished drawing: every shape, with and without the sweater, in every look.
- The banner pictures in the README are made again.
- The demo's Background menu hint reads more naturally in Japanese.

## [0.3.2] - 2026-10-14

The README's pictures are redone, because npm shows only the README that was published: every picture now stands on one of the family's shared backgrounds, and the demo can put one behind the stage.

### Changed

- **Every README picture stands on a background** from the family's shared set (`scripts/family-backgrounds.ts`, version 1.0.0, copied byte for byte from taisen-brackets and held to its sha256 by `test/family-backgrounds.test.ts`), in a light and a dark twin: each of the seven cuts on the ground of its sport (ice, infield, hardwood, turf, pitch), the officials under floodlights (midnight in the dark), the caps on an infield and the helmets on turf, the retired-number banners on royal purple (crimson in the dark), the phone's four jerseys on four grounds and the turned sweater on ice. Line drawings and labels take the ink the background returns, and every grid is full and runs edge to edge.
- The pictures are webp now (1.3 MB in all, they were PNG). The officials, the caps and helmets and the banners have a picture of their own, in the README and in `docs/officials.md`; the turned sweater has a dark twin (`turn-desk-dark.webp`).
- `pnpm screenshots` makes every picture in one run, on port 7302 or `TEST_PORT` (`ONLY=name,name` takes some, `PRESET=name` tries one background, `IMAGES_OUT` writes elsewhere).

### Added

- **A Background menu in the demo's preview**, off by default (`?background=ice`): one of the twenty-five, in the dark or light variant of the page's look, behind the stage, with the stage's text in the ink it returns. It is presentation only: the jersey the package draws is the same string with or without it (an end-to-end test checks it), and the background module is loaded only when one is chosen. The package has no new code and still no dependency.

## [0.3.1] - 2026-10-14

### Added

- **`plate`** (spec word `bp=1` or `bp=<hex>`, attribute and query word `plate`): a solid plate behind the back's name and number, so stripes cannot reach a letter. `true` takes the lighter of the body and the trim, or give a colour (and `numberFill` for the ink on it). The NFL's and the NCAA's officials' shirts have a white one, and the 1950-1970 NBA striped shirt a black one with a white number.

### Fixed

- **Black numbers and surnames on black-and-white stripes were hard to read.** The lettering of the striped officials' shirts (the NHL referee and linesman, the NBA classic, the NFL, CFL, NCAA and high school football shirts and both lacrosse shirts) and of striped or hooped team shirts (Newcastle, Juventus, Leicester, Bath and others) had a hair of an outline, so a stripe the colour of the ink touched the edge of every letter. When the fill is lost on one of the stripe colours the outline is now `0.45` of a stroke wide on each side, rounded at the corners, and the colours a `repeat` uses (a second trim, the number's fill) count as grounds the ink must read on; the same holds for sleeve numbers over striped sleeves. A new test (`test/legible.test.ts`) paints each drawing and wants nothing of the ink's colour within a third of a stroke of a letter; it fails on 0.3.0 for 80 of the 122 striped presets, 15 of them officials.

## [0.3.0] - 2026-10-14

### Added

- **Officials' shirts**: a new preset module, `OFFICIALS` (`@johnmorrisdotca/senshu-jerseys/presets/officials`, ids `ref:...`, also in `PRESETS` and in the demo's Officials section and Jersey wall filter), of referees, linesmen and umpires, each sourced in `src/presets/officials.ts` and marked `// unsure:` where a colour, an era or a layout is a reading. Hockey: `ref:nhl-modern-referee` and `ref:nhl-modern-linesman` (the orange armbands are the difference), their zip-collar variants, Hockey Canada's red and the PWHL's purple armbands, the orange half-zip and the cream sweater of the 1930s to the 1950s, and `ref:nhl-1950s-candy` (red-and-white stripes, from a photograph, marked unsure). Basketball: `ref:nba-classic`, `ref:nba-modern` (grey with white pin-stripes, black sleeves, a red collar), the Summer League, WNBA, FIBA, EuroLeague, Australian NBL and NCAA shirts. Football: `ref:nfl`, `ref:cfl`, `ref:ncaa-football`, high school and the plain white shirt before the 1920s. Soccer: `ref:soccer-black-classic`, `-yellow`, `-lime`, `-coral`, `-cyan` and the red, green, burgundy, turquoise and purple of other eras, with a chest pocket and a plain badge spot (never the FIFA badge). Baseball: `ref:mlb-umpire-navy`, with a chest protector, the 1980 light blue shirt and the 2000 black polo. Rugby union and lacrosse officials. `docs/officials.md` lists them with their sources; `node scripts/officials-sheet.mjs <out.png>` draws a contact sheet of every one, front and back.
- **`armbands`** (spec word `ab=colour.width.at`): a band round each upper arm, square to the sleeve, in any look: a colour (1 trim, 2 second trim, 3 number's fill), a width in drawing units (3 to 30) and a place down the sleeve in percent (10 to 80). Also the `armbands` attribute and query word.
- **`pocket`** (`pk=1`) and **`badge`** (`bd=r`, `s` or `q`; `BADGE_IDS`): a patch pocket on the wearer's left chest, and a badge spot on it, a plain round, shield or square patch that never holds a mark; a caller's `crest` takes the spot's place.
- **`protector`** (`pr=1`): an umpire's chest protector over the front of a shirt.
- **Collars `zip` and `point`** (`co=z`, `co=t`): a stand collar over a zipper with its teeth and slider, and a dress collar with long points and three buttons. The hockey, baseball, football, soccer and rugby cuts take them (the baseball and football cuts also take `polo`).
- **`collarColor: 3`**: the collar in the number's fill colour. **`na=s`** in a spec: the name set straight.
- Tests (`test/officials.test.ts`) for the armbands, pocket, badge, zip and point collars, the preset decoding and the stripe widths, and demo tests for the Officials section, the wall filter and the new controls.

### Changed

- A number whose fill and outline are both given is kept over stripes of two colours when together they read on both (a black number with a white edge on black-and-white stripes), where before the pair was replaced by one ink that read on neither.
- The size limits are 20 kB gzipped for the drawing (it was 18), 16 for a banner (14.5), 17 for the turn (15.5) and 24 for the element (22), for the new parts of the shirt.

## [0.2.0] - 2026-10-14

### Added

- **`overlap`** for `jerseyLineup`, `kitMatchup` and the `both` view of `renderJersey`: neighbouring shirts tuck under each other, like shirts hung on a rail. It is a fraction of a shirt's width, 0 to 0.4 (anything else is clamped, and a value that is not a number is the default). Each shirt is drawn over the one on its left, so its body covers the last one's sleeve, with a soft shadow (one SVG filter) where it overlaps; the first shirt of a row casts none, and the document is as much narrower as the shirts moved. The default is 0.15 for a lineup and a matchup (its front and back in the `both` view): the sleeves slip under the next body and no number or collar is covered, where 0.25 begins to hide the shoulder and 0.35 the sleeve and part of the body. Pass `overlap: 0` for the spacing 0.1.1 drew. `renderJersey`'s `both` view stays side by side by default (`overlap: 0`), as the element, the embeds and the turn draw it. `docs/overlap.md`, `test/overlap.test.ts`.

### Changed

- A lineup and a matchup in the `both` view are tucked by 0.15 by default, so their documents are narrower than in 0.1.1 (a row of five by 9 percent); set `overlap: 0` for the old spacing.
- The size limit for the custom element's bundle is 22 kB gzipped (it was 21), for the shadow.

## [0.1.1] - 2026-10-14

### Added

- **`cuffs`**: the sleeve's end in a contrasting colour, with a length and a colour (`cuffs: [18, 1]`, spec word `cf=18.1`), a knit seam where it starts, drawn over the sleeve's stripes. The Canadiens' red tips.
- **`frontTextAngle`**: `"straight"`, `"arch"`, `"diagonal-up"` (each upright letter a step higher than the last, rising to the right) or `"diagonal-down"`, fitted to the chest of every cut and escaped like any other text. Basketball keeps the arch as its default. Also the `front-text-angle` attribute and query word, and `TEXT_ANGLE_IDS`.
- **Documented, no new option**: a set of three colours and a wide elbow band with thin edges are `sleeveStripes` and `hemStripes` lists with a gap first (README, `docs/presets.md`).
- Presets: Seattle Kraken home and away with the wide elbow band; Montreal Canadiens away with `cuffs`; New York Rangers with the stripes at the elbow and red numbers with white trim; Calgary Flames home with the yellow, white and yellow set, and a new away (`nhl:flames-2020-away`); Dallas Stars with the stripe sets at the elbow.

### Changed

- A number or name whose fill does not read on the cloth alone (red on royal blue) now keeps the fill when the outline asked for reads on the cloth and the fill reads on the outline, as tackle-twill does; without such an outline the fill is still replaced by one that reads at 4.5 to 1.

### Fixed

- A `patch` (the C or A) was drawn on the back as well as the front; it is on the front only.
- **The football, rugby, soccer and baseball shirts had their sleeves cut off by the box, still and turned, and handball's as it turned.** The drawing's box was the body's 200 by 232, and the sleeves of four cuts reach past it at rest (football by 9.1 units of 200 in the default sleeve and up to 14.1 in the elbow sleeve, rugby 3.4 and up to 8.3, soccer 3.3 and up to 5.4, baseball 2.1 and up to 4.2, each side, the `line` look the worst), while a turn pushes the cloth's edge further: by up to 2.3 more at the thickest (40) and at the worst angle, about 5 to 10 degrees either side of the front and the back (football 11.4, rugby 5.9, soccer 5.7, baseball 4.6 for the default sleeve), and the thick elbow sleeve of a handball shirt went 1.6 past it only as it turned. Each cut now has a box that holds its widest sleeve at every angle and thickness, `jerseyBox(cut)` (`CUTS[cut].reach` more on each side: football 16.9, rugby 11.2, soccer 8.4, baseball 7.2, handball 2.2; hockey and basketball keep the body's own box), and `renderJersey` (front, back and both), `jerseyFrame` and the resting view of `bindTurn` draw in it, so a turn is one size from the first frame to the last and the still is the same size. `size` is still the width of the body, so the shirt is drawn at the same scale in every cut and the document is `size` wide for hockey and basketball and 8 percent wider for soccer, the default cut, and up to 17 percent for football (the height is the same). The two shirts of the `both` view are a box and a gap apart (their sleeves touched in football), a `kitMatchup` and a whole uniform (`renderKit`) leave the room a cut's sleeves need, and the iframe an `embedCode` writes has the shape of the box. The uniform's column was also too short for a short sock: the football, baseball and basketball socks ran 16 units off the bottom and are no longer cut off. `test/jerseybox.test.ts` measures the ink of every cut, sleeve, look and view, still and at every angle and thickness, against its box; `node scripts/jersey-boxes.mjs` prints the `reach` a new cut needs and `node scripts/turn-sheet.mjs` draws a sheet to look at.

## [0.1.0] - 2026-10-14

The first preview.

### Added

- **`renderJersey`**: seven cuts (hockey, baseball, basketball, football, soccer, rugby, handball), front, back or both, in the `cloth`, `flat` and `line` styles. Collars (lace-up, V, crew, polo, round, wishbone, band), sleeves (long, elbow, short, none), yokes (curved, square, full-arm), baseball closures (button, pullover, vest), raglan sleeves and piping; ten patterns (solid, stripes, hoops, halves, quarters, sash, chevron, pinstripes, yoke, chest band) with any repeat of widths and colours, an equal count of stripes, and the choice to keep a pattern off the sleeves; sleeve, hem and chest bands as lists of widths and colours; side panels; shoulder numbers; a C or A patch; a crest as any SVG or an emblem id.
- **Numbers and names drawn as vectors**: block stroke glyphs for letters and numerals (no font file, no system font), an arched or straight nameplate, a stitched number with an outline, an ink with 4.5 to 1 contrast against what is behind it. A Japanese name is set as system text.
- **`renderCap`, `renderHelmet`, `renderBanner`**: a solid or two-tone cap, front or side; football, hockey and batting helmets; retired-number banners as a rectangle, a pennant or a shield with an optional small sweater.
- **`kitMatchup`, `kitClash` and `jerseyLineup`**: two kits side by side, whether they clash, and a formation of shirts.
- **`kit: true` and `renderKit`**: the pants or shorts, the socks and the helmet that go with a jersey.
- **Turning** (`./turn`): `jerseyFrame` at any angle (the front foreshortens to an edge where the cloth's thickness shows, the back shows from 90 to 270 degrees) and `bindTurn` with a drag, arrow keys, Home, Space and an automatic turn that waits for the reader, pauses while dragging and on a hidden tab, and starts still under `prefers-reduced-motion`.
- **`<senshu-jersey>`** (`./element`, `./define`) with an attribute for every option, `turnable`, `autoplay` and `speed`, and `embed.html` with `embedCode` for pages that cannot run script.
- **Presets** (`./presets/<league>`): 1,472 uniforms: the NHL and its defunct teams (418), national hockey teams (139), MLB, the NBA, the NFL, the CFL, soccer clubs and nations, and rugby, as colours and stripes only, one line of text each; never a crest, logo, monogram, wordmark or sponsor mark.
- **The demo**: Try it (every option, drag or Auto-turn), the Jersey wall (every preset, filtered by league and era), the Hall of rafters, matchup and lineup builders, caps and helmets, and Put it in your page; in English and Japanese, with every choice in the address.
