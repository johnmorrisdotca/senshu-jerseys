import { renderJersey, renderJudogi } from "@johnmorrisdotca/senshu-jerseys";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const jersey = renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", view: "both" });
const judogi = renderJudogi({ mode: "suit", belt: "black" });
const page = `<!doctype html><title>Jerseys</title>${jersey}${judogi}`;
console.log(jersey.startsWith("<svg"), judogi.startsWith("<svg"), page.length > 1000);
