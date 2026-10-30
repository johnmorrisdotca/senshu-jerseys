// Every garment the Uniforms page shows, as data: a later garment (a karate gi, a dobok, a jiu-jitsu gi) is one more entry here and its words in words.js.
// `options` is what the package's judogi drawing is given for that garment; the page adds the chosen belt and the display.
export const GARMENTS = [
  { id: "judogi-white", options: { colour: "white" } },
  { id: "judogi-blue", options: { colour: "blue" } },
  { id: "karate-full", options: { karate: { sleeve: "full" } } },
  { id: "karate-three-quarter", options: { karate: { sleeve: "three-quarter" } } },
  { id: "karate-short", options: { karate: { sleeve: "short" } } },
  { id: "karate-kumite", options: { karate: { cut: "kumite" } } },
  { id: "karate-kata", options: { karate: { cut: "kata" } } },
];
