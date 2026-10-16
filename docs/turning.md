# Turning

A jersey turns about its vertical axis as a thin piece of cloth: 2.5D, flat drawings on a turning plane. Nothing here is a 3D engine; each frame is a string of SVG.

- **0 degrees** is the front, drawn at full width.
- The front **foreshortens** by the cosine of the angle as it turns, and darkens a little as it turns away from the light.
- At **90 degrees** the front is an edge. What shows is the thickness of the cloth: a few slices of the outline at depths through it, side by side, so the shoulders and the hem and the sides have a width.
- From 90 to 270 degrees the **back** shows, with its name and its number, foreshortened the same way.

```js
import { jerseyFrame, turnState } from "@johnmorrisdotca/senshu-jerseys/turn";

console.log(turnState(0).front.visible); // true
console.log(turnState(90).front.visible); // false
console.log(turnState(150).back.visible); // true

// Any angle is taken round; anything that is not a number is the front.
console.log(jerseyFrame({ yaw: Number.NaN }) === jerseyFrame({ yaw: 0 })); // true
```

`thickness` (0 to 40 drawing units, 14 by default) is how thick the edge is.

## The box of a turn

A jersey is drawn in a box, and the body is 200 by 232 units. The sleeves of a football, rugby, soccer or baseball shirt reach past the 200 at rest, and a turn pushes the cloth's edge further out: the slices of the edge are shifted by up to half the thickness, so a sleeve goes past the body by a few units more at an angle of a few degrees either side of the front and the back. So **every cut has a box that holds its widest sleeve at every angle and thickness** (`jerseyBox(cut)`, the 200 units and `CUTS[cut].reach` more on each side), and a frame, a still, both views and the resting view of `bindTurn` are all drawn in it: nothing is cut off, and the drawing does not change size as it turns. Hockey and basketball fit the body, so their box is the body's own. `size` is still the width of the body, so a shirt is the same scale in every cut and the document is a little wider for a cut with a wider box.

```js
import { jerseyBox, renderJersey } from "@johnmorrisdotca/senshu-jerseys";
import { jerseyFrame } from "@johnmorrisdotca/senshu-jerseys/turn";

const box = (svg) => /viewBox="([^"]*)"/.exec(svg)[1];
console.log(box(renderJersey({ cut: "football" })) === box(jerseyFrame({ cut: "football", yaw: 8, thickness: 40 }))); // true
console.log(box(renderJersey({ cut: "football", sleeve: "short" })) === box(renderJersey({ cut: "football", sleeve: "long" }))); // true
console.log(jerseyBox("hockey").w, jerseyBox("football").w); // 200 233.8
```

`test/jerseybox.test.ts` measures the ink of every cut, sleeve, look and view, still and turned, against the box; `node scripts/jersey-boxes.mjs` prints the `reach` a changed cut needs, to put in `src/cuts.ts`, and `node scripts/turn-sheet.mjs <out.png>` draws a sheet of the sleeves to look at.

## Volume: the shirt as a garment

`volume: true` draws the shirt as a garment with depth instead of a card. Front, back, both sides and every angle between show a body with a neck, shoulders, sleeves and a hem, and a sleeve number stays on its arm. The flat turn above is still the default, so nobody's drawing changes.

```js
import { jerseyFrame } from "@johnmorrisdotca/senshu-jerseys/turn";

const options = { cut: "hockey", number: 19, name: "Morris", colors: ["#c8102e", "#fff", "#0a3161"], sleeveNumbers: true };
const side = jerseyFrame({ ...options, volume: true, yaw: 90 }); // the wearer's right side
const flat = jerseyFrame({ ...options, yaw: 90 }); // the card, an edge
console.log(side.includes("data-vol"), flat.includes("data-vol")); // true false

// Anything else than true is the flat turn; `pitch` is how far the camera looks down, 0 to 20 degrees (8 by default).
console.log(jerseyFrame({ ...options, volume: "yes", yaw: 30 }) === jerseyFrame({ ...options, yaw: 30 })); // true
```

**How it is drawn.** There is no 3D engine and no new way of drawing. The front and the back are the same drawings as before, made once, with every option (colours, stripes, yoke, collar, name, number, patch) in them. The garment is a mesh that they are wrapped over:

- The **body** is a loft of rounded sections: narrow at the neck, a chest's depth at the armpit, the width of the drawing at each height (a square-ish section, so it fills out to the sleeves).
- Each **sleeve** is a tapered tube from the armhole to the cuff, lying where the flat drawing has it.
- Each surface is cut into small **triangles**, and each triangle is a clipped copy of its face's drawing under an affine matrix worked out from where its three corners lie after the turn (`yaw` about the vertical, then `pitch`). A triangle is exact at its corners, so neighbours meet with no gap, and they overlap by a fraction of a unit under the clip so no hairline shows between them.
- A triangle whose cloth faces away from the viewer is hidden, so the far side never shows through; the sleeve behind the body is drawn first and the sleeve in front last. A little shade, from a light above and to the left, is laid over each cell by the way it faces.
- The back is drawn as seen from behind: a pattern that is not the same on both sides (halves, quarters, an odd number of stripes) is mirrored on it, so it carries on round the side seam.

At 0 degrees the front is drawn as it is by `renderJersey`, and the camera's `pitch` curves the hem and the neck a little. The box is the cut's own (`jerseyBox`), the output is a pure function of the options, and nothing outside the options reaches the markup but `volume` (only `true` counts) and `pitch` (a number, clamped).

`bindTurn(container, { ...options, volume: true })` turns it by hand or by itself like the flat one; only the matrices, which cells show and the order of the sleeves change from frame to frame (`applyTurn` does this, the markup is made once). A frame is some 130 kilobytes of SVG (about 17 gzipped) because each cell is a short element and the two drawings are held once in the defs.

**What it does not do.** The front and the back drawings are all there is to wrap, so the cloth under the arm and at the side seam is the drawings' own edge, stretched a little at the sleeve's sides. The `kit` view and the `both` view do not turn. The `<senshu-jersey>` element takes `volume` and `pitch` as attributes, and `embed.html` takes `volume=1` and `yaw`.

## `bindTurn(container, options, settings)`

Draws the jersey into a container and lets the reader turn it.

| Input | What it does |
| --- | --- |
| Pointer drag | Turns it: a drag across the container's width is a half turn. Works with a mouse, a finger and a pen. |
| Left and right arrows | 15 degrees; with Shift, 45. |
| Home | Back to the front. |
| Space | Starts and stops the automatic turn. |

It returns `{ yaw, setYaw, playing, play, pause, togglePlay, update, destroy }`. `settings` has `yaw` (where to start), `autoPlay`, `speed` (degrees a second, 40 by default), `force` and `onChange`.

- **Nothing runs while nobody asked.** There is no timer. The automatic turn is a loop of animation frames with the time between frames taken from the clock and clamped to 50 ms, so a tab that was away does not jump.
- It **pauses while you drag** and goes on after, and **stops while the tab is hidden** and goes on when it is back.
- **`prefers-reduced-motion`**: `autoPlay` is ignored and the jersey starts still, unless `force: true`. `play()` always plays: the reader asked.
- Only the transforms change from frame to frame (`applyTurn`); the drawing is made once.
- `destroy()` removes every listener and empties the container. `update(options)` draws again with new options and keeps the angle.

```js no-run
import { bindTurn } from "@johnmorrisdotca/senshu-jerseys/turn";

const handle = bindTurn(document.querySelector("#shirt"), { cut: "soccer", number: 10, name: "Gray" }, { autoPlay: true, speed: 30 });
handle.pause();
handle.setYaw(180);
```

The turn lives in its own module, `@johnmorrisdotca/senshu-jerseys/turn`, outside the pure entry: a page that only draws never loads it. A whole uniform (`kit: true`) does not turn.
