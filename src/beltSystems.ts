// The belt systems of the martial arts as data: each system's grades, and for each grade what the belt looks like, in a neutral declarative form a belt
// drawing can render (a body of one or two colours, a stripe along it, a tip block with bars across it, tags, ends). No drawing happens here. Every system names
// the pages it was read from and the day, and says whether each is a governing body's own text (`primary`) or only a lead (a retailer's chart, a picture).
// Original data; nothing is copied from a chart's artwork.

/** Where a fact was read: a governing body's own text, or a lead (a retailer's or club's chart, a picture) to be confirmed. */
export interface BeltSource {
  id: string;
  title: string;
  url: string;
  /** The day the page was read. */
  read: string;
  kind: "primary" | "lead";
  /** What was taken from it. */
  note: string;
}

/** A belt colour by name; the drawing code maps the names to its own colours. */
export type BeltColour = "white" | "grey" | "yellow" | "orange" | "green" | "blue" | "purple" | "brown" | "black" | "red" | "silver" | "gold";

/** A block at one end of the belt in its own colour (the black tip of a jiu-jitsu belt) with bars across it. */
export interface BeltTip {
  colour: BeltColour;
  /** Length of the block along the belt, in centimetres. */
  lengthCm: number;
  /** How far the block starts from the end of the belt, in centimetres. */
  fromEndCm: number;
  /** Bars laid across the block, each at most `max` (the degrees), in this colour. */
  bars?: { colour: BeltColour; max: number; widthCm: number };
}

/** Short bars across the belt near an end (a taekwondo tip, a judo tag): `count` of them in `colour`. */
export interface BeltTags {
  colour: BeltColour;
  count: number;
  /** `tag`: a small woven tab sewn round the belt (the British mon grades); `tip`: the end of the belt dyed or banded in this colour. */
  form: "tag" | "tip";
}

export interface BeltGrade {
  /** Stable key within the system, e.g. `kyu-6`, `dan-1`, `mon-4`, `grey-white`. */
  id: string;
  name: string;
  /** A kyu or gup counts down, a dan or degree up; `0` for a grade with no number. */
  number: number;
  rankKind: "kyu" | "dan" | "mon" | "level" | "colour" | "degree";
  /** One colour, or two: a belt made of two colours split lengthwise, `body[0]` on one face edge and `body[1]` on the other (a judo half grade). */
  body: [BeltColour] | [BeltColour, BeltColour];
  /** For a body of two colours: `lengthwise` is a belt cut in halves along its length (judo half grades); `alternating` is panels in turn along it (the red and white of a kohaku belt). */
  split?: "lengthwise" | "alternating";
  /** A stripe of this colour along the full length down the centre of the belt (a kid's BJJ grey/white, grey/black). */
  centreStripe?: BeltColour;
  tip?: BeltTip;
  tags?: BeltTags;
  /** Where the grade is worn: ages, as the body states them. */
  ages?: string;
  note?: string;
}

export interface BeltEnds {
  /** How far each end hangs from the knot, in centimetres: the range the rules or the custom give, and the usual. */
  hangCm: { min: number; max: number; usual: number };
  /** Width of the belt in centimetres, the range and the usual. */
  widthCm: { min: number; max: number; usual: number };
  /** Where on the body the belt is tied. */
  worn: "waist" | "hips";
}

export interface BeltTextCustom {
  /** What is customarily embroidered on a belt end here. */
  text: string;
  /** The script it is written in. */
  script: "latin" | "kanji" | "hangul";
  /** The embroidery font that suits it. */
  font: "block" | "gothic" | "kaisho";
  /** What the text means, for the reader who does not read it. */
  meaning?: string;
  basis: "primary" | "lead";
}

export interface BeltSystem {
  id: string;
  /** The art and the body or style the system is of. */
  name: string;
  art: "judo" | "bjj" | "karate" | "taekwondo" | "aikido" | "ju-jutsu" | "capoeira" | "krav-maga";
  /** `sourced`: every grade is read from a governing body's own text; `partly`: the structure is, the rest a lead; `lead`: charts and pictures only, to confirm. */
  status: "sourced" | "partly" | "lead";
  ends: BeltEnds;
  /** What is customary on the belt, and in what script. */
  customary: BeltTextCustom[];
  grades: BeltGrade[];
  sources: string[];
  notes: string[];
}

const READ = "2026-10-27";

export const BELT_SOURCES: Record<string, BeltSource> = {
  ijfJudogi: { id: "ijfJudogi", title: "IJF Judogi Rules (09 03 2022)", url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2022/04/IJF_Judogi_rules_-_09_03_2022_-1649423105.pdf", read: READ, kind: "primary", note: "Belt thickness 4 to 5 mm; ends 20 to 30 cm from the central knot; worn on the waist above the hip bone, tied tightly; name on one side of a belt only; maker logo at one of the two edges." },
  ijfHistory: { id: "ijfHistory", title: "IJF, Judo culture: the belts", url: "https://www.ijf.org/history/judo-culture/2250", read: READ, kind: "primary", note: "Coloured belts from England in the mid-1920s; kyu split into white and brown in 1913 (purple for the young); red and white for 6th to 9th dan from 1931, red for 9th dan from 1943; two-tone belts introduced in France in 1990 for young judoka's intermediate grades." },
  judoCanada: { id: "judoCanada", title: "Judo Canada, Grading", url: "https://judocanada.org/grading/", read: READ, kind: "primary", note: "Kyu sequence with half grades: white, white-yellow, yellow, yellow-orange, orange, orange-green, green, green-blue, blue, blue-brown, brown; dan from black, ten degrees; 6-7-8 dan and 9-10 dan belts differ from black." },
  bjaMon: { id: "bjaMon", title: "British Judo Association, Mon Grade Promotion Syllabus (Dec 2024)", url: "https://britishjudo.org.uk/wp-content/uploads/2024/12/Mon-Grade-Promotion-Syllabus-Dec-2024.pdf", read: READ, kind: "primary", note: "The 18 mon grades: red belt with 1 to 3 yellow tags, yellow, orange, green, blue and brown belts each with 1 to 3 red tags; ages 8 to 17 (page on the BJA site)." },
  bjaMonPage: { id: "bjaMonPage", title: "British Judo Association, Mon Grade Scheme", url: "https://www.britishjudo.org.uk/get-started/grading/mon-grade-scheme/", read: READ, kind: "primary", note: "Aimed at 8 to 17 year olds; 18 grades, each a different coloured belt and/or belt tag(s)." },
  ibjjf: { id: "ibjjf", title: "IBJJF General System of Graduation, v2.0 (2015), French edition hosted by the CFJJB", url: "https://cfjjb.com/images/rules2022/general-graduation-system-french.pdf", read: READ, kind: "primary", note: "Belt lists for 4 to 15 and 16 and over; belt widths; the black bar of about 10 cm 2 to 3 cm from an end; the red bar of the black belt, white bars at its ends, up to 6 degrees; coral belts' white bar of about 15 cm with silver bars, the red belt's with gold bars of 2 cm; minimum ages; the kids' degree suggestions." },
  ibjjfPage: { id: "ibjjfPage", title: "IBJJF, Graduation system", url: "https://ibjjf.com/graduation-system", read: READ, kind: "primary", note: "Says the system unifies the teaching and competition of jiu-jitsu from white to red, with three suggested kids' degree systems (monthly, triannual, quarterly)." },
  itf: { id: "itf", title: "ITF Taekwon-Do, Belt colour meanings", url: "https://www.itftaekwondo.com/belt-colour-meanings/", read: READ, kind: "primary", note: "The tip system: white, white with yellow tip (9th gup), yellow, yellow with green tip, green, green with blue tip, blue, blue with red tip, red, red with black tip (1st gup), black 1st to 9th degree." },
  wkf: { id: "wkf", title: "WKF Kumite Competition Rules 2024 (as hosted by the Finnish Karate Federation)", url: "https://karateliitto.fi/app/uploads/2024/02/WKF_Kumite_Competition_Rules_2024.pdf", read: READ, kind: "primary", note: "A contestant wears one red belt (aka) or blue belt (ao), plain, with no embroidery or marks beyond the maker's label; belts of grade are not worn in the bout; about 5 cm wide, 15 cm free each side of the knot, no longer than three-quarters thigh length." },
  jka: { id: "jka", title: "JKA, DAN Ranking", url: "https://jka.or.jp/en/about-jka/dan-ranking/", read: READ, kind: "primary", note: "10 kyu and 10 dan; the page was unavailable when read (HTTP 503): the figures are from a search result's summary of it, to confirm." },
  itfApp2: { id: "itfApp2", title: "ITF Umpire Rules, Appendix 2, Approved Clothing (in force January 1st, 2015)", url: "https://itftkd.sport/wp-content/uploads/2014/10/2015-Appendix-2-ITF-Approved-Clothing-Jan-20.pdf", read: "2026-10-30", kind: "primary", note: "Junior (under 18) and senior black belts: of sufficient length to wrap only one time around the waist; at most 5 cm wide; the degree in gold coloured Roman numerals positioned transversally across one end; the junior belt with a 1 cm white stripe lengthwise down the centre of one face; a name and the federation's name optional, in gold." },
  wtIdent: { id: "wtIdent", title: "World Taekwondo, 2022 Guidelines of Identifications", url: "https://www.worldtaekwondo.org/att_file_up/partners_suppliers/2022/2022_WT_Guidelines_of_Identifications.pdf", read: "2026-10-30", kind: "primary", note: "Poomsae uniforms: a Black and Red (Poom Belt) for cadets and juniors, a Black (Dan Belt) for the older divisions; the maker's identification at the end of the belt within 6 cm2; nothing on how a belt is tied or how long its ends are." },
  chartArts: { id: "chartArts", title: "John's reference: 'Martial arts belt ranks' chart (picture, Dropbox belt-stripes)", url: "dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-martial-arts-belt-ranks-by-art.png", read: READ, kind: "lead", note: "Aikido, BJJ, capoeira, ju-jutsu, ITF taekwondo, shotokan karate, krav maga and judo belt orders as an infographic; a lead, unsourced." },
  chartKarate: { id: "chartKarate", title: "John's reference: karate belt ranking (picture, social media)", url: "dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-karate-kyu-dan-bars.png", read: READ, kind: "lead", note: "Nine kyu from white to brown (brown with 1 to 3 bars), dan belts black with 1 to 7 bars across one end; a lead, unsourced." },
  chartDegrees: { id: "chartDegrees", title: "John's references: black belt with tip bars (pictures)", url: "dropbox:/Projects/Resources/senshu-jerseys/belt-stripes/2026-10-28-black-tip-red-bars-degrees.png", read: READ, kind: "lead", note: "Black belts sold with red or white bars across them (martial-arts supplier); a lead." },
};

const cm = (min: number, max: number, usual: number): { min: number; max: number; usual: number } => ({ min, max, usual });
const g = (id: string, name: string, number: number, rankKind: BeltGrade["rankKind"], body: BeltGrade["body"], extra: Partial<BeltGrade> = {}): BeltGrade => ({ id, name, number, rankKind, body, ...extra });

// Judo. Kyu belts and half grades from Judo Canada, the dan belts from the IJF's history page.
const JUDO_KYU: [number, BeltColour, BeltColour | undefined][] = [
  [6, "white", undefined], [5, "yellow", undefined], [4, "orange", undefined], [3, "green", undefined], [2, "blue", undefined], [1, "brown", undefined],
];
const judoGrades: BeltGrade[] = [];
JUDO_KYU.forEach(([n, colour], i) => {
  judoGrades.push(g(`kyu-${n}`, `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} kyu`, n, "kyu", [colour]));
  const next = JUDO_KYU[i + 1];
  if (next !== undefined) judoGrades.push(g(`kyu-${n}-half`, `${n}+ kyu (half grade)`, n - 0.5, "kyu", [colour, next[1]], { split: "lengthwise", note: "Judo Canada's intermediate grade: two colours split lengthwise, one on each face edge." }));
});
judoGrades.push(
  g("dan-1", "1st dan to 5th dan", 1, "dan", ["black"], { note: "Black for 1st to 5th dan; the IJF page says 1st to 9th at first." }),
  g("dan-6", "6th dan to 8th dan", 6, "dan", ["red", "white"], { split: "alternating", note: "Wide alternating red and white panels (kohaku obi); Judo Canada marks the 6-7-8 dan belt as its own." }),
  g("dan-9", "9th dan and 10th dan", 9, "dan", ["red"], { note: "Red belt; the IJF page says 9th and 10th dan are symbolised by a red belt (authorised for 9th dan from 1943)." }),
);

// BJA mon grades: coloured belt with 1 to 3 tags.
const monGrades: BeltGrade[] = [];
const MON: [string, BeltColour, BeltColour][] = [["red", "red", "yellow"], ["yellow", "yellow", "red"], ["orange", "orange", "red"], ["green", "green", "red"], ["blue", "blue", "red"], ["brown", "brown", "red"]];
MON.forEach(([, belt, tag], bi) => {
  for (let t = 1; t <= 3; t++) {
    const n = bi * 3 + t;
    monGrades.push(g(`mon-${n}`, `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"} mon`, n, "mon", [belt], { tags: { colour: tag, count: t, form: "tag" }, ages: "8 to 17" }));
  }
});

// IBJJF: the kids' belts are a colour with a white or a black stripe along the whole belt; every belt carries a black bar near one end.
const KIDS: [string, string, BeltColour][] = [["grey", "Grey", "grey"], ["yellow", "Yellow", "yellow"], ["orange", "Orange", "orange"], ["green", "Green", "green"]];
const KIDS_AGES: Record<string, string> = { grey: "4 to 15", yellow: "7 to 15", orange: "10 to 15", green: "13 to 15" };
const kidsGrades: BeltGrade[] = [g("white", "White", 0, "colour", ["white"], { ages: "any", tip: { colour: "black", lengthCm: 10, fromEndCm: 2.5, bars: { colour: "white", max: 4, widthCm: 0.6 } } })];
for (const [id, name, colour] of KIDS) {
  const tip: BeltTip = { colour: "black", lengthCm: 10, fromEndCm: 2.5, bars: { colour: "white", max: 3, widthCm: 0.6 } };
  kidsGrades.push(
    g(`${id}-white`, `${name} and white`, 0, "colour", [colour], { centreStripe: "white", tip, ages: KIDS_AGES[id] }),
    g(id, name, 0, "colour", [colour], { tip, ages: KIDS_AGES[id] }),
    g(`${id}-black`, `${name} and black`, 0, "colour", [colour], { centreStripe: "black", tip, ages: KIDS_AGES[id] }),
  );
}
const bjjTip: BeltTip = { colour: "black", lengthCm: 10, fromEndCm: 2.5, bars: { colour: "white", max: 4, widthCm: 0.6 } };
const adultGrades: BeltGrade[] = [
  g("white", "White", 0, "colour", ["white"], { ages: "any", tip: bjjTip }),
  g("blue", "Blue", 0, "colour", ["blue"], { ages: "16 and over", tip: bjjTip }),
  g("purple", "Purple", 0, "colour", ["purple"], { ages: "16 and over", tip: bjjTip }),
  g("brown", "Brown", 0, "colour", ["brown"], { ages: "18 and over", tip: bjjTip }),
  g("black", "Black", 0, "colour", ["black"], { ages: "19 and over", tip: { colour: "red", lengthCm: 10, fromEndCm: 2.5, bars: { colour: "white", max: 6, widthCm: 0.6 } }, note: "Red bar with a white bar at each of its ends; up to 6 degrees as white bars on the red." }),
  g("red-black", "Red and black (7th degree)", 7, "degree", ["red", "black"], { split: "alternating", tip: { colour: "white", lengthCm: 15, fromEndCm: 2.5, bars: { colour: "red", max: 2, widthCm: 0.6 } }, ages: "50 and over", note: "Panels of 20 cm in turn; a white bar of about 15 cm bounded by two silver bars; degrees marked in red." }),
  g("red-white", "Red and white (8th degree)", 8, "degree", ["red", "white"], { split: "alternating", tip: { colour: "white", lengthCm: 15, fromEndCm: 2.5, bars: { colour: "red", max: 2, widthCm: 0.6 } }, ages: "57 and over", note: "Panels of 20 cm in turn; the same white bar bounded by silver bars; degrees in red." }),
  g("red", "Red (9th and 10th degree)", 9, "degree", ["red"], { tip: { colour: "white", lengthCm: 15, fromEndCm: 2.5, bars: { colour: "red", max: 2, widthCm: 0.6 } }, ages: "67 and over", note: "A white bar of about 15 cm bounded by two gold bars of 2 cm; degrees in red." }),
];

// ITF taekwon-do: a tip of the next colour at the end of the belt.
const ITF: [string, string, number, BeltColour, BeltColour | undefined][] = [
  ["white", "White", 10, "white", undefined], ["white-yellow", "White, yellow tip", 9, "white", "yellow"], ["yellow", "Yellow", 8, "yellow", undefined],
  ["yellow-green", "Yellow, green tip", 7, "yellow", "green"], ["green", "Green", 6, "green", undefined], ["green-blue", "Green, blue tip", 5, "green", "blue"],
  ["blue", "Blue", 4, "blue", undefined], ["blue-red", "Blue, red tip", 3, "blue", "red"], ["red", "Red", 2, "red", undefined], ["red-black", "Red, black tip", 1, "red", "black"],
];
const itfGrades: BeltGrade[] = ITF.map(([id, name, n, body, tip]) => g(`gup-${id}`, `${name} (${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} gup)`, n, "kyu", [body], tip === undefined ? {} : { tags: { colour: tip, count: 1, form: "tip" } }));
itfGrades.push(g("dan-1", "Black (1st to 9th degree)", 1, "dan", ["black"], { note: "Black for 1st to 9th degree; the degree in gold Roman numerals across one end, the belt once round the waist and at most 5 cm wide (ITF Umpire Rules, Appendix 2); under 18, a junior black belt with a 1 cm white stripe down the middle of one face. Drawn with the `numeral` of beltStyle (the `itf-*` presets)." }));

const leadKyu = (rows: [string, number, BeltColour][], kind: BeltGrade["rankKind"] = "kyu"): BeltGrade[] => rows.map(([name, n, c]) => g(`${kind}-${n}`, name, n, kind, [c]));

export const BELT_SYSTEMS: BeltSystem[] = [
  {
    id: "judo-ijf",
    name: "Judo: IJF and Kodokan colours, with Judo Canada's half grades",
    art: "judo",
    status: "sourced",
    ends: { hangCm: cm(20, 30, 25), widthCm: cm(4, 5, 4.5), worn: "waist" },
    customary: [
      { text: "柔道", script: "kanji", font: "kaisho", meaning: "judo, 'the gentle way'", basis: "lead" },
      { text: "SMITH", script: "latin", font: "block", meaning: "the wearer's surname, on one end only (IJF: one side of the belt)", basis: "primary" },
    ],
    grades: judoGrades,
    sources: ["ijfJudogi", "ijfHistory", "judoCanada", "chartArts"],
    notes: [
      "The IJF belt is 4 to 5 mm thick with ends 20 to 30 cm from the knot, worn at the waist above the hip bone.",
      "Half grades (two colours split lengthwise, a woven maker tag near one end) are Judo Canada's list; the IJF page dates two-tone belts for young judoka to France, 1990.",
      "Black is 1st to 5th dan; red and white 6th to 8th dan; red 9th and 10th dan (the IJF page and Judo Canada).",
    ],
  },
  {
    id: "judo-bja-mon",
    name: "Judo: British Judo Association mon grades (juniors, 8 to 17)",
    art: "judo",
    status: "sourced",
    ends: { hangCm: cm(20, 30, 25), widthCm: cm(3.5, 5, 4), worn: "waist" },
    customary: [{ text: "NAME", script: "latin", font: "block", basis: "lead" }],
    grades: monGrades,
    sources: ["bjaMon", "bjaMonPage"],
    notes: [
      "Each tag is a small band sewn round the belt near one end; mon 1 to 3 carry yellow tags on a red belt, every later colour red tags.",
      "Widths and hang are the IJF's, which the BJA's mon belt is not stated to differ from.",
    ],
  },
  {
    id: "bjj-ibjjf-kids",
    name: "Brazilian jiu-jitsu: IBJJF belts for ages 4 to 15",
    art: "bjj",
    status: "sourced",
    ends: { hangCm: cm(20, 30, 25), widthCm: cm(2.5, 3.5, 3), worn: "waist" },
    customary: [{ text: "ACADEMY", script: "latin", font: "block", basis: "lead" }],
    grades: kidsGrades,
    sources: ["ibjjf", "ibjjfPage", "chartDegrees"],
    notes: [
      "Each colour has three belts: all of it, with a white stripe down the whole length, or with a black one (grey and white, grey, grey and black; likewise yellow, orange, green).",
      "A black bar of about 10 cm sits 2 to 3 cm from one end; degrees are bars across it (the IBJJF suggests three or four a belt for the kids; the bar colour on the kids' belts is white, from the references).",
      "Hang is not given by the IBJJF text read; 20 to 30 cm is the usual and the IJF's figure for a judo belt.",
    ],
  },
  {
    id: "bjj-ibjjf-adult",
    name: "Brazilian jiu-jitsu: IBJJF belts for 16 and over",
    art: "bjj",
    status: "sourced",
    ends: { hangCm: cm(20, 30, 25), widthCm: cm(3.5, 4.5, 4), worn: "waist" },
    customary: [{ text: "ACADEMY", script: "latin", font: "block", basis: "lead" }],
    grades: adultGrades,
    sources: ["ibjjf", "chartDegrees"],
    notes: [
      "White to brown carry a black bar of about 10 cm; up to four degrees as white bars across it (the system text divides each into 4 degrees).",
      "The black belt has a red bar of about 10 cm with a white bar at each end, up to 6 degrees; 7th and 8th degrees are coral belts (red and black, red and white panels of 20 cm) with a white bar of about 15 cm; 9th and 10th degrees are red with gold bars of 2 cm.",
    ],
  },
  {
    id: "taekwondo-itf",
    name: "Taekwon-do: ITF colour belts with tips",
    art: "taekwondo",
    status: "partly",
    ends: { hangCm: cm(20, 45, 40), widthCm: cm(4, 5, 4.5), worn: "hips" },
    customary: [
      { text: "태권도", script: "hangul", font: "gothic", meaning: "taekwondo (the way of the foot and fist)", basis: "lead" },
      { text: "NAME", script: "latin", font: "block", basis: "lead" },
    ],
    grades: itfGrades,
    sources: ["itf", "itfApp2", "wtIdent", "chartArts"],
    notes: [
      "Ten gup belts (the odd ones carry a tip of the next colour) and black for 1st to 9th degree; the ITF page gives colours only, with no length or width.",
      "An ITF black belt goes once round the waist (ITF Umpire Rules, Appendix 2), so the same belt leaves longer ends than one tied twice round; the hang (about 40 cm drawn) is read from photographs, not a rule.",
      "World Taekwondo and Kukkiwon set dan and poom, not colour belts (schools choose): see the notes in docs/martial-arts.md.",
    ],
  },
  {
    id: "karate-competition",
    name: "Karate: WKF competition belts (aka red, ao blue)",
    art: "karate",
    status: "sourced",
    ends: { hangCm: cm(15, 40, 15), widthCm: cm(4.5, 5.5, 5), worn: "waist" },
    customary: [{ text: "空手", script: "kanji", font: "kaisho", meaning: "karate, 'empty hand'", basis: "lead" }],
    grades: [g("aka", "Aka (red)", 0, "colour", ["red"]), g("ao", "Ao (blue)", 0, "colour", ["blue"])],
    sources: ["wkf", "jka"],
    notes: [
      "Belts of grade are not worn in a WKF bout; the red and blue belts are plain, about 5 cm wide, with 15 cm free each side of the knot and no longer than three-quarters thigh length.",
      "The JKA states 10 kyu and 10 dan; its page gave no colour chart (and was unavailable when read).",
    ],
  },
  {
    id: "karate-kyu-dan",
    name: "Karate: common kyu and dan belts with bars (a lead, style by style)",
    art: "karate",
    status: "lead",
    ends: { hangCm: cm(20, 45, 30), widthCm: cm(4, 5, 4.5), worn: "waist" },
    customary: [{ text: "空手道", script: "kanji", font: "kaisho", meaning: "karate-do, 'the way of the empty hand'", basis: "lead" }],
    grades: [
      ...leadKyu([["9th kyu", 9, "white"], ["8th kyu", 8, "yellow"], ["7th kyu", 7, "orange"], ["6th kyu", 6, "green"], ["5th kyu", 5, "blue"], ["4th kyu", 4, "purple"], ["3rd kyu", 3, "brown"], ["2nd kyu", 2, "brown"], ["1st kyu", 1, "brown"]]),
      ...[1, 2, 3, 4, 5, 6, 7].map((n) => g(`dan-${n}`, `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} dan`, n, "dan", ["black"], { tip: { colour: "black", lengthCm: 8, fromEndCm: 1, bars: { colour: "gold", max: n, widthCm: 0.5 } } })),
    ],
    sources: ["chartKarate", "chartArts", "jka"],
    notes: [
      "Colours differ by style and by dojo: the chart in the references is shotokan-like (white to brown), with brown carrying 1 to 3 bars and black 1 to 7 bars across one end. None of it is read from a style body yet.",
      "Karate belts are usually longer than a judo belt's ends (references: kyokushin gi), hence the larger hang.",
    ],
  },
  {
    id: "other-arts-leads",
    name: "Aikido, ju-jutsu, capoeira, krav maga (leads only)",
    art: "ju-jutsu",
    status: "lead",
    ends: { hangCm: cm(20, 30, 25), widthCm: cm(4, 5, 4.5), worn: "waist" },
    customary: [],
    grades: [
      ...leadKyu([["6th kyu", 6, "white"], ["5th kyu", 5, "yellow"], ["4th kyu", 4, "orange"], ["3rd kyu", 3, "green"], ["2nd kyu", 2, "blue"], ["1st kyu", 1, "brown"]]),
      g("dan-1", "1st dan and up", 1, "dan", ["black"]),
    ],
    sources: ["chartArts"],
    notes: [
      "The chart in the references shows aikido and ju-jutsu on the six-kyu colours (white, yellow, orange, green, blue, brown) with black for dan, ju-jutsu's 6th to 8th dan red and white, 9th and 10th red; capoeira's cordas (white, yellow, orange, blue, green, purple, brown, black) and krav maga's levels (white, yellow, orange, green, blue, brown, black).",
      "Nothing here is read from a governing body: aikido's main bodies use white and black only with a hakama, and a cord belt (capoeira) is a different object. Not drawn until sourced.",
    ],
  },
];

/** A system by id, or `undefined`. */
export const beltSystem = (id: string): BeltSystem | undefined => BELT_SYSTEMS.find((s) => s.id === id);

/** The sources a system cites, in full. */
export const beltSystemSources = (s: BeltSystem): BeltSource[] => s.sources.map((id) => BELT_SOURCES[id] as BeltSource);
