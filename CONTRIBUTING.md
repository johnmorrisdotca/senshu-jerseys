# Contributing

Thank you for helping. Bug reports, ideas and pull requests are all welcome.
Bug reports and ideas go in the
[issues](https://github.com/johnmorrisdotca/senshu-jerseys/issues).

## The rules

- **No runtime dependencies.** The package is a few modules of plain TypeScript that return strings; a dependency is not
  added for convenience.
- **The core is pure.** Every function returns new values and never changes what it was given. The pure entry (`src/index.ts`)
  has no timer, no DOM and no network; turning (`src/turn.ts`) and the element (`src/element.ts`) are their own entries.
- **A drawing is a pure function of its options.** No clock, no random number, no counter: the same options give the same
  string, and a test holds it. An id comes from a hash of the options.
- **Anything from outside is made safe.** A colour is read as `#rgb`, `#rrggbb` or `rgb()` and anything else is ignored; text is
  escaped or drawn as strokes; a crest is shown as an image. A new option that reaches the markup has a test with a hostile value.
- **No font.** Latin letters and numerals are the strokes of `src/glyphs.ts`; only a character with no glyph there (a Japanese
  name) is system text.
- **A preset is colours and stripes only.** No crest, logo, monogram, wordmark, chest lettering that is a team's mark, or
  sponsor's or manufacturer's mark, for a current team or a defunct one (their marks are still owned and sold). A preset is a line of
  text in `src/presets/<league>.ts` (the format is in `src/presets/core.ts`), with the source page of each team in a comment above
  its rows and `// unsure:` on any row whose layout could not be confirmed. Take facts from the uniform sections of Wikipedia
  articles, Wikidata and the clubs' published colour codes; never copy a picture from Wikimedia Commons. Look at the contact
  sheet (`node scripts/preset-sheet.mjs <module> out.png`) before you commit.
- **Japanese names are read** by someone who reads Japanese before they ship (the demo's `WORDS.ja`, `src/names.ts`, and each
  preset team's Japanese name).
- **Docs pages are single-language.** Every page of the README and of `docs/` is in one language: one page per language, made from one source where that is practical, the Japanese one named `<name>.ja.md`, and the two linked at the top with a line such as `日本語 · English`. No page mixes English and Japanese in a table or in its prose, and a demo switches language with a control. Proper nouns and code identifiers (an id such as `gear:judogi`, a constant) stay as they are on both pages, and a Japanese term that is itself the subject (the package's own name, a knot) may appear once on an English page as a quoted name. The exception is a page about the translations themselves (`docs/strings-ja.md`, a terminology reference), which may show both languages side by side. A test, `docs-language.test`, holds the docs to this and lists each exception with its reason.
- **Test what you change.** Tests sit in `test/`. A rule you change has a test that would have caught it. `test/size.test.ts` holds
  the drawing, a cap, a helmet, a banner, the turn, the element and one league of presets to a size.
- **The README's examples run**: `pnpm test:readme` runs every `js` block of the README and of `docs/` against the built
  package, and checks that the README names every export and that `docs/presets.md` is what the package makes (`pnpm presets:doc`).
- **Option values and names are kebab case where they are words** (`"lace-up"`, `"full-arm"`).
- **Needs Node 22 or later**; the tests run the TypeScript source with `node --test`, which needs 22.18 or later.
- **Ports.** This package owns local ports 7300 to 7399 and nothing outside them. The demo's server is on 7300 (`scripts/dev.mjs`),
  the tests' on 7301 (`playwright.config.mjs`), the picture script's on 7302, and any other server or worktree takes 7303 and up.
  Check with `lsof -iTCP:<port> -sTCP:LISTEN` first, and stop a server by its process id, never by name.

## Reference images

Reference images live in Dropbox at `/Projects/Resources/senshu-jerseys/`, never in this repository (photo licences are
unknown): `national-quadrant` (Team Canada and USA national jersey layouts, files 1-9) and `womens` (women's cut references).

## Pull requests

One change per pull request. Say what changed and how you checked it, and add a line to `CHANGELOG.md` under **Unreleased**:
for a change a user would notice, and for one to the repository alone.

## Commands

```sh
pnpm check          # lint, types, tests, the build and the packed package
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry, bundle one item
pnpm test:demo      # build the demo and play it in a real browser at a phone's width and a desk's
pnpm test:readme    # run the examples of the README and of docs/ against the built package
pnpm presets:doc    # rewrite docs/presets.md from the built package
pnpm screenshots    # the README's pictures, into docs/images
pnpm sheets         # contact sheets of every cut, pattern, cap, helmet and banner
pnpm dev            # the demo on http://127.0.0.1:7300/
```

## Releasing

Maintainers bump the version in `package.json` and in `src/version.ts`, move *Unreleased* to the new version in
`CHANGELOG.md`, dated, push, wait for CI and tag `vX.Y.Z`, the same as `package.json`'s version. The Release workflow
(`.github/workflows/release.yml`) checks and builds the package, attaches the tarball to a GitHub release and publishes it to
npm by trusted publishing, with provenance and no token. A version already on npm is not published again. The first publish is
by hand from a Mac with npm's one-time code; then the package's *Access* page on npmjs.com sets the trusted publisher
(this repository, the `release.yml` workflow). When it is published, take `senshu-jerseys` out of `FAMILY_NOT_ON_NPM` in every
repository's copy of `scripts/family-template.mjs`.
