# National layouts

`national` puts a country's own mark, or its whole flag, on a jersey in one of eight arrangements, for every one of the twelve countries of the [national hockey styles](./hockey-styles.md). It works on flat cards and on the turning garment (`volume: true`), and the marks stay on the cloth as it turns.

The marks are **original, simplified shapes drawn in this package**: a leaf, a star, a Nordic cross, a plain cross, a wedge, a double cross, bars, a disc and a lily. They are not any federation's crest, and no manufacturer's or sponsor's mark is drawn. The flags are the countries' own, built from their colours and proportions.

```js
import { renderJersey, NATIONAL_COUNTRIES, NATIONAL_LAYOUTS, NATIONAL_NAMES } from "@johnmorrisdotca/senshu-jerseys";
import { nationalStyle } from "@johnmorrisdotca/senshu-jerseys/presets/hockey-styles";

console.log(NATIONAL_COUNTRIES.length, NATIONAL_LAYOUTS.length); // 12 8
console.log(NATIONAL_NAMES.canada); // CANADA

// Any jersey: the country and the layout in one word, or an object with the words to set.
const leaf = renderJersey({ cut: "hockey", colors: ["#d52b1e", "#ffffff", "#111111"], national: "canada:diagonal" });
const own = renderJersey({ cut: "hockey", colors: ["#0a3161", "#ffffff", "#b31942"], national: { country: "usa", layout: "wordmark", text: "Team USA" } });

// A style of one of the twelve countries, in a layout, home or away, with a name and a number of one's own.
const mine = nationalStyle("japan", "arched", { away: true, name: "Tanaka", number: 19 });
console.log(leaf.length > 1000, own.includes("<svg"), mine?.national); // true true { country: 'japan', layout: 'arched' }
console.log(renderJersey(mine ?? {}).length > 1000); // true
```

## The layouts

| Layout | What is drawn |
| --- | --- |
| `quadrant` | The mark, large, in the lower quarter of the front on the wearer's right (the picture's left). |
| `diagonal` | The mark cut along a slant, and the country's name set along the cut. |
| `centred` | One big mark in the middle of the chest, and a small one on each sleeve. |
| `arched` | The name arched over a centred mark, the mark again at each hem corner and on each sleeve. |
| `serrated` | The upper body and shoulders in the trim colour, the body colour coming up in the points of a leaf, and the same points across each sleeve. |
| `stepped` | The name in upright letters, each a step higher than the one before, rising to the right. |
| `wordmark` | The name straight across the chest between two thin lines (they run round the back too). |
| `flag` | The country's whole flag over the body and the sleeves (the stars on the chest and shoulders for the United States), the name on the chest, and the back in the flag too. |

The mark is the trim colour with an edge of the second trim (or of the body colour when there is none). The name is set with the jersey's own lettering, so its outline is the number's. `stepped`, `wordmark`, `arched` and `flag` set the chest text for you (`frontText`, `frontTextAngle`): anything you give for those, or for `chestBand`, wins. `quadrant`, `diagonal`, `centred` and `serrated` set no words of their own.

## Options

| Option | What it says |
| --- | --- |
| `national` | `"country:layout"`, or `{ country, layout, text? }`. A country that is not one of the twelve is ignored; a layout that is not one is `centred`. |
| `text` | In the object form: the words to set, up to 14 characters; the country's name by default. |

The element and `embed.html` take `national="canada:quadrant"`. `nationalStyle(country, layout, who)` (in `presets/hockey-styles`) is `personalStyle` with a layout: `who` takes `away`, `text` and everything `personalStyle` takes.

## Where things go

The marks keep clear of the collar, the chest text and the shirt's edge, and the slanted name of `diagonal` stays on its side of the cut, on every cut. `test/national.test.ts` holds these, together with a drawing of every country in every layout, front, back and both, in each look and on the garment. The layouts are tuned for the hockey cut; on a soccer, rugby or handball shirt the same places are used, and a cut with a different chest (a tank, say) gets the same marks in the middle of its body.
