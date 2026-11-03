import { jerseyToParams, renderJersey, type JerseyOptions } from "@johnmorrisdotca/senshu-jerseys";
import type { SenshuJersey } from "@johnmorrisdotca/senshu-jerseys/element";
import { bindTurn, type TurnHandle } from "@johnmorrisdotca/senshu-jerseys/turn";

const options: JerseyOptions = { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9 };
const svg: string = renderJersey(options);
console.log(svg.startsWith("<svg"), String(jerseyToParams(options)));

export function turn(box: HTMLElement): TurnHandle {
  return bindTurn(box, options, { autoPlay: true });
}

export function recolour(jersey: SenshuJersey): void {
  jersey.setAttribute("colors", "#192168,#ffffff");
}

// @ts-expect-error "polo" is not a cut
renderJersey({ cut: "polo" });
