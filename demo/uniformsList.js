// Every garment the Uniforms page shows, as data: a later garment (a karate gi, a dobok, a jiu-jitsu gi) is one more entry here and its words in words.js.
// `options` is what the package's judogi drawing is given for that garment; the page adds the chosen belt and the display.
export const GARMENTS = [
  { id: "judogi-white", art: "judo", options: { colour: "white" } },
  { id: "judogi-blue", art: "judo", options: { colour: "blue" } },
  { id: "karate-full", art: "karate", options: { karate: { sleeve: "full" } } },
  { id: "karate-three-quarter", art: "karate", options: { karate: { sleeve: "three-quarter" } } },
  { id: "karate-short", art: "karate", options: { karate: { sleeve: "short" } } },
  { id: "karate-kumite", art: "karate", options: { karate: { cut: "kumite" } } },
  { id: "karate-kata", art: "karate", options: { karate: { cut: "kata" } } },
  { id: "karate-plain", art: "karate", options: { karate: { text: false, patches: false } } },
  { id: "bjj-white", art: "bjj", options: { bjj: { colour: "white" } } },
  { id: "bjj-white-ibjjf", art: "bjj", options: { bjj: { colour: "white", patches: "ibjjf" } } },
  { id: "bjj-white-covered", art: "bjj", options: { bjj: { colour: "white", patches: "covered" } } },
  { id: "bjj-blue", art: "bjj", options: { bjj: { colour: "blue" } } },
  { id: "bjj-blue-ibjjf", art: "bjj", options: { bjj: { colour: "blue", patches: "ibjjf" } } },
  { id: "bjj-blue-covered", art: "bjj", options: { bjj: { colour: "blue", patches: "covered" } } },
  { id: "bjj-black", art: "bjj", options: { bjj: { colour: "black" } } },
  { id: "bjj-black-ibjjf", art: "bjj", options: { bjj: { colour: "black", patches: "ibjjf" } } },
  { id: "bjj-black-covered", art: "bjj", options: { bjj: { colour: "black", patches: "covered" } } },
  { id: "dobok-wt", art: "taekwondo", options: { dobok: { cut: "wt" } } },
  { id: "dobok-wt-poom", art: "taekwondo", options: { dobok: { cut: "wt", grade: "poom" } } },
  { id: "dobok-wt-dan", art: "taekwondo", options: { dobok: { cut: "wt", grade: "dan" } } },
  { id: "dobok-itf", art: "taekwondo", options: { dobok: { cut: "itf" } } },
  { id: "dobok-itf-dan", art: "taekwondo", options: { dobok: { cut: "itf", grade: "dan" } } },
  { id: "dobok-itf-dan5", art: "taekwondo", options: { dobok: { cut: "itf", grade: "dan", dan: 5 } } },
];

/** The garments that are not judo, in the order a row shows them, grouped by art: a gi for each sleeve, cut, colour, patch set and collar the package draws. */
export const OTHER_ARTS = ["karate", "bjj", "taekwondo"].map((art) => ({ art, garments: GARMENTS.filter((g) => g.art === art) }));
