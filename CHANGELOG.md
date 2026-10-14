# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
