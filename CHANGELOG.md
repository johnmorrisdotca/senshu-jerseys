# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **`cuffs`**: the sleeve's end in a contrasting colour, with a length and a colour (`cuffs: [18, 1]`, spec word `cf=18.1`), a knit seam where it starts, drawn over the sleeve's stripes. The Canadiens' red tips.
- **`frontTextAngle`**: `"straight"`, `"arch"`, `"diagonal-up"` (each upright letter a step higher than the last, rising to the right) or `"diagonal-down"`, fitted to the chest of every cut and escaped like any other text. Basketball keeps the arch as its default. Also the `front-text-angle` attribute and query word, and `TEXT_ANGLE_IDS`.
- **Documented, no new option**: a set of three colours and a wide elbow band with thin edges are `sleeveStripes` and `hemStripes` lists with a gap first (README, `docs/presets.md`).
- Presets: Seattle Kraken home and away with the wide elbow band; Montreal Canadiens away with `cuffs`; New York Rangers with the stripes at the elbow and red numbers with white trim; Calgary Flames home with the yellow, white and yellow set, and a new away (`nhl:flames-2020-away`); Dallas Stars with the stripe sets at the elbow.

### Changed

- A number or name whose fill does not read on the cloth alone (red on royal blue) now keeps the fill when the outline asked for reads on the cloth and the fill reads on the outline, as tackle-twill does; without such an outline the fill is still replaced by one that reads at 4.5 to 1.

### Fixed

- A `patch` (the C or A) was drawn on the back as well as the front; it is on the front only.

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
