# Overlap

`jerseyLineup`, `kitMatchup` and the `both` view of `renderJersey` can tuck neighbouring shirts under each other, like shirts hung on a rail.

```js
import { jerseyLineup, kitMatchup, renderJersey } from "@johnmorrisdotca/senshu-jerseys";

const players = Array.from({ length: 11 }, (_, i) => ({ number: i + 1 }));
const away = { cut: "soccer", colors: ["#1f3a8a", "#ffffff"], label: "Gulls" };
const home = { cut: "soccer", colors: ["#c8102e", "#ffffff"], label: "Bison" };

const lineup = jerseyLineup(players, { formation: "4-4-2", jersey: { cut: "soccer" }, overlap: 0.25 });
const matchup = kitMatchup({ away, home, view: "both", overlap: 0.25 });
const both = renderJersey({ cut: "football", view: "both", overlap: 0.2 });
console.log([lineup, matchup, both].every((svg) => svg.includes("<filter"))); // true
```

## The option

- `overlap` is a fraction of a shirt's width (the body's 200 units), from 0 to 0.4. A larger number is 0.4, a negative one is 0.
- It moves each shirt closer to the one on its left by that part of its width, and the document gets as much narrower, so nothing is cut off.
- **Where it counts:** along a row of a lineup, and between the front and the back of a side in the `both` view of a matchup or of `renderJersey`. A matchup's two sides stay apart, with the word between them, and a single view has nothing to tuck.
- **Defaults:** 0.15 for `jerseyLineup` and `kitMatchup`; 0 for `renderJersey`, whose `both` view is also what the element, the embeds and the turn draw, so it stays side by side unless asked. Pass `overlap: 0` for the spacing 0.1.1 drew.

## How it is drawn

- Shirts are drawn left to right, so each one's body covers the sleeve of the shirt before it. The first shirt of a row is the lowest.
- Each shirt but the first has a soft shadow on its left edge, one SVG `filter` (a blur, a small offset and a lower opacity) in the shirt's own units, so it follows the shape of the shirt. With no overlap there is no filter and the markup is the same as before.
- The shadow is black at about a third of its strength and takes no option; it reads on light and dark pages alike.

## What looks right

Looked at on a sheet of five-shirt football and soccer lineups and matchups at 0, 0.15, 0.25 and 0.35:

| `overlap` | What it looks like |
| --- | --- |
| 0 | Spaced out, a gap of a few units between sleeve tips. Reads as separate pieces. |
| 0.15 | The sleeves slip under the next body, the row holds together, and every number and collar is clear. The default. |
| 0.25 | The next body covers the sleeve and a little of the shoulder; numbers still clear. A tighter, rack-like row. |
| 0.35 to 0.4 | The sleeves are gone and part of the shoulder with them; good for a crowd of shirts, not for showing a cut's sleeves. |
