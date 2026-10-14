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
