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
  { id: "dobok-wt", options: { dobok: { cut: "wt" } } },
  { id: "dobok-wt-poom", options: { dobok: { cut: "wt", grade: "poom" } } },
  { id: "dobok-wt-dan", options: { dobok: { cut: "wt", grade: "dan" } } },
  { id: "dobok-itf", options: { dobok: { cut: "itf" } } },
  { id: "dobok-itf-dan", options: { dobok: { cut: "itf", grade: "dan" } } },
];
