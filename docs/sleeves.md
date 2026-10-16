# Sleeve numbers and patches

A number or a patch on a sleeve is placed on the sleeve itself. On a flat drawing it sits where the cut puts it and turns with the sleeve's slant, as it always has. On the turning garment with `volume: true` (see [turning](./turning.md)) it is drawn on the arm's surface in its own cells, so it stays attached as the shirt turns, is hidden when the arm turns away, reads the right way round from outside, and never takes the place of the back number.

**Left and right are the wearer's.** `sleeveLeft` is the sleeve on the wearer's left arm: the right of the picture in the front view and its left in the back view. The same words are used in every view and at every angle, so a number on `sleeveRight` stays on the wearer's right arm as the shirt turns.

```js
import { renderJersey } from "@johnmorrisdotca/senshu-jerseys";
import { jerseyFrame } from "@johnmorrisdotca/senshu-jerseys/turn";

const shirt = { cut: "hockey", colors: ["#c8102e", "#fff", "#0a3161"], number: 77, name: "Morris" };

// true (or "both") puts the jersey's number on both sleeves, as before; "left" or "right" on one.
console.log((renderJersey({ ...shirt, sleeveNumbers: true }).match(/rotate\(/g) ?? []).length); // 2
console.log((renderJersey({ ...shirt, sleeveNumbers: "left" }).match(/rotate\(/g) ?? []).length); // 1

// Each sleeve on its own: a different number, a size, a place, colours, and a patch.
const both = {
  ...shirt,
  sleeveNumbers: true,
  sleeveLeft: { number: 66, size: 18, at: 40, fill: "#ffd100", outline: "#0a3161" },
  sleeveRight: { patch: "shield", patchText: "A" },
};
const side = jerseyFrame({ ...both, volume: true, yaw: 270 }); // the wearer's left arm is toward the viewer
console.log(side.includes("data-vol")); // true
```

## The options

| Option | What it says |
| --- | --- |
| `sleeveNumbers` | `true` or `"both"`, `"left"`, `"right"` (the wearer's), or `false`. Gives the sleeve the jersey's `number`. |
| `sleeveLeft`, `sleeveRight` | One sleeve's own settings (below). A `number` here puts that number on the sleeve whatever `sleeveNumbers` says; `number: false` leaves it off. |
| `number` | Up to two digits, as for the back. |
| `size` | The number's height in drawing units, 6 to 32 (the cut's own by default: hockey 21, soccer 15). |
| `at` | How far down the sleeve its middle lies, in percent of the sleeve, 8 to 92 (the cut's own). |
| `around` | With volume: how far round the arm from the front, in degrees, -150 to 60. 0 is the front of the arm, -90 straight out, -150 round to the back. -55 by default, out and a little forward, which shows from the front and from the side. |
| `fill`, `outline` | The number's colours. Without them it takes the ink that reads on the cloth (4.5 to 1), and an outline over stripes. |
| `patch` | `"round"`, `"shield"` or `"square"`: a plain patch, never a mark. |
| `patchText` | Up to three letters on it. |
| `patchSize`, `patchAt`, `patchAround`, `patchFill`, `patchOutline` | As for the number. A patch with no place of its own goes above the number, or below it where there is no room, so the two do not overlap. |

A value that is not allowed is replaced by the default; nothing throws. The element and `embed.html` take the same words as attributes: `sleeve-numbers="left"` and `sleeve-left="number:66;size:18;at:40;fill:ffd100"` (the keys of the table, in kebab case, and a colour with or without its `#`).

## Layers

From the cloth outwards: the pattern, the sleeve stripes and the cuffs, the armbands, the patch, then the number. The seam at the shoulder is under all of them. A number or a patch is placed on the sleeve and not on its stripes' own bands, so they coexist; to keep a number clear of an armband, give it an `at` that is off it.

## What the turn does with them

- A thing on a sleeve is a small drawing of its own, placed in the arm's own frame: down the sleeve and round the arm. Its cells are a grid of triangles over the arm's surface, so it curves round the arm, foreshortens as the arm turns, and is hidden where the cloth faces away.
- The number reads left to right for a viewer facing the sleeve's outside, on both arms, so no digit is ever mirrored (a test holds every cell of every cut at twelve angles to a drawing that is not turned over), and it stands upright with the arm hanging.
- `update` and `applyTurn` keep the angle: changing a number, a colour or a place at 135 degrees draws the new one at 135.
- The flat drawing in the front and back views is unchanged for `sleeveNumbers: true`.
