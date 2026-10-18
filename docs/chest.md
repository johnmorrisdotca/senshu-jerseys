# Chest badges

`chestBadges` puts captain's and alternate's letters, flags and patches on the chest, each on the wearer's left or right breast. The old `patch: "C"` (or `"A"`) is still there, in the cut's one place; `chestBadges` is for more, or for something else.

**Left and right are the wearer's:** `"left"` is the wearer's left breast, the right of the picture. A cut puts its C on its own side (hockey the wearer's left, football, soccer and rugby the right, so that the left is free for a crest); a badge with no `side` takes that side.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const japan = { cut: "hockey", colors: ["#ffffff", "#bc002d", "#1b2a6b"], number: 19, name: "Tanaka", language: "ja" };

// The captain: a C on the cut's own side.
const captain = renderJersey({ ...japan, chestBadges: { kind: "C" } });
// An alternate on the other breast.
const alternate = renderJersey({ ...japan, chestBadges: { kind: "A", side: "right" } });
// A flag alone: white with a red disc, drawn from the caller's own colours.
const flagOnly = renderJersey({ ...japan, chestBadges: { kind: "flag", flag: { stripes: ["#ffffff", "#ffffff"], disc: "#bc002d" } } });
// The captain and the flag, a personalised national jersey.
const both = renderJersey({ ...japan, chestBadges: [{ kind: "C" }, { kind: "flag", side: "right", flag: { stripes: ["#ffffff", "#ffffff"], disc: "#bc002d" } }] });
console.log(captain.length < alternate.length + 1000, flagOnly.includes("clipPath"), both.includes("clipPath")); // true true true
```

## The options

| Option | What it says |
| --- | --- |
| `kind` | `"C"`, `"A"`, `"patch"` (a shape with up to three letters) or `"flag"` (a rectangle). `"C"` by default. |
| `side` | `"left"` or `"right"`, the wearer's. |
| `text` | For a patch: up to three letters. |
| `style` | For the C and A: `"letter"` (the default) is the bare letter in a heavy block face with a thick outline, as it is sewn on a hockey sweater, size about a sleeve number; `"disc"` puts it on a round patch. The letter is the jersey's trim (`fill` or `ink` change it) and its outline whichever of the second trim, white or black sets it off best from the letter and the body (`outline` changes it). The old `patch` takes `patchStyle` the same way. |
| `shape` | For a patch: `"round"`, `"shield"` or `"square"`. |
| `flag` | For a flag: `stripes`, 2 to 5 colours from the top (or the left), `direction` (`"horizontal"` or `"vertical"`), and the colours of a `canton` (the corner by the hoist) and a `disc` (a circle in the middle). |
| `art` | An SVG document or an emblem id, shown in the badge's place: a flag from a flag package, a federation's patch. It is shown as an image, so nothing in it runs. An id needs `useEmblems` or the `emblems` option, as for `crest`. |
| `size` | The height in drawing units, 8 to 40 (a flag's width is half as much again). The C and A take the cut's own, 20 to 22; a patch 16; a flag 14. |
| `dx`, `dy` | The offset from its place, -40 to 40. |
| `fill`, `outline`, `ink` | Colours: the badge's cloth, its edge and its letters. By default the trim, a darker edge and the ink that reads on the trim. |
| `nudge` | `false` keeps the badge exactly where it is put. |

At most four badges are read. A value that is not allowed is replaced by the default; nothing throws. The element and `embed.html` take the same words as one attribute, `chest-badges`: badges separated by `|`, each of `key:value` pairs separated by `;`, with a flag's colours joined by `+`:
`chest-badges="kind:C|kind:flag;side:right;flag:d52b1e+ffffff+d52b1e;flag-direction:vertical"`. Colours are with or without a `#`.

## Where a badge goes, and what it keeps clear of

A badge starts at the cut's own place for its side, moved by `dx` and `dy`. Unless it says `nudge: false` it then **slides down** until it is clear of everything else on the chest, and if its side has no room it tries the other side. What it keeps clear of:

- the neck opening and, for a polo, dress or zip collar, the leaves of the collar;
- the crest, or the badge spot, and the pocket;
- the chest text and the chest number;
- the old `patch`;
- the badges placed before it, in the order they are given.

If there is no room at all, the badge stays where it was put. The layers, from the cloth outwards: the pattern and bands, the crest, the badges, the lettering.

## On the turning garment

A badge is part of the front's drawing, so with `volume: true` (see [turning](./turning.md)) it is wrapped onto the chest with the rest: it curves round the breast, foreshortens as the chest turns, goes out of sight with it, comes back on the other breast's side as the shirt comes round, and is never on the back. The same options do the same in the flat views. A badge is on the front only.

## What the package draws

A plain shape in the caller's colours, up to three letters, stripes and a disc from the caller's colours, or the caller's own art. **There is no flag, crest or mark in the package**, and the presets stay colours and stripes only; a flag of a country is the caller's, from a flag package or from colours they choose.
