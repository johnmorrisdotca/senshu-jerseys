# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.11.0] - 2026-10-26

### Changed

- **The judogi, drawn again from the ground up.** 0.10.0's judogi was flat and did not look like one. Its proportions follow product photographs. The jacket now has a body to mid-thigh with side vents, drawn in hard at the waist by a tied belt (to about four fifths of the chest) and flaring out below it, broad shoulders whose sleeves are set on low and wide: each sleeve head runs on out along the line of the shoulder and rounds down into the arm, so a sleeve is about as wide under the arm as at the cuff and hangs almost straight, a little out from the body. The collar is a thick band of six stitched rows standing round the back of the neck and running down the front, the wearer's left over the right, with the inside of the neck in shadow. The upper body has a fine grain weave and the skirt quilted diamonds below the waist seam. The trousers have a deep waistband gathered by a drawstring tied in a bow, full hips down to a low crotch that part into two wide legs set a little apart (they turn as two legs, not as one board), reinforced knees and a turned hem. The belt ties with a square knot and two hanging ends, and stands alone as a tied ring. Each body is cut into rows no more than 3 cm apart, so white cloth shades smoothly instead of in bands. The pieces layout ties the chosen belt on the jacket. Contest white is brighter and contest blue a royal blue. The options are the same.
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
