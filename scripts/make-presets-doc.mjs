// Writes docs/presets.md from the built package: every preset with its id, team, years and colours, grouped by league. `--check` exits 1 when the file is not what the package makes.
//
//   node scripts/make-presets-doc.mjs           rewrite docs/presets.md
//   node scripts/make-presets-doc.mjs --check   say so, and exit 1, when it is out of date
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dir = `${root}dist/presets/`;
const modules = readdirSync(dir).filter((f) => f.endsWith(".js") && f !== "core.js").sort();
const groups = [];
for (const file of modules) {
  const mod = await import(`${dir}${file}`);
  for (const [name, list] of Object.entries(mod)) if (Array.isArray(list) && list.length > 0 && list[0].options !== undefined) groups.push({ name, file, list });
}
const order = ["NHL_CLASSIC", "NHL", "HOCKEY_NATIONS", "MLB", "NBA", "NFL", "CFL", "IFAF", "SOCCER", "SOCCER_NATIONS", "RUGBY", "OFFICIALS"];
groups.sort((a, b) => (order.indexOf(a.name) + 1 || 99) - (order.indexOf(b.name) + 1 || 99) || a.name.localeCompare(b.name));
const dot = (c) => (c === undefined ? "" : `\`${c}\``);
let out = `# Presets

A preset is a team's uniform of one era written as colours and stripes: the body, the trim, the sleeve, hem and chest bands, the yoke, the collar and the number's colours, with the matching pants, socks and helmet where they are known.
**A preset never draws a crest, a logo, a monogram, a wordmark or a sponsor's mark**, and nothing on it is a team's mark: the chest stays empty or takes the caller's own \`crest\`. This holds for defunct teams too, whose marks
are still owned and sold today. The colours and the stripe layouts are facts taken from the uniform sections of Wikipedia articles, Wikidata and the clubs' published colour codes and recorded here as data; no picture is copied.
They are an honest reading, not a proof: where a layout could not be said with the stripes the renderer draws, the nearest plain one is used.

Made from the built package by \`node scripts/make-presets-doc.mjs\`; \`pnpm test:readme\` checks that it is current. ${groups.reduce((n, g) => n + g.list.length, 0)} presets in ${groups.length} modules.

## What the one-line spec can say

A preset is a line of colours (body, trim, second trim, number fill, number outline) followed by \`key=value\` words; \`-\` skips a colour. The bands are lists of widths and colour indexes joined by dots.

| Word | Option | Reads as |
| --- | --- | --- |
| \`ss=\`, \`hs=\`, \`cb=\` | \`sleeveStripes\`, \`hemStripes\`, \`chestBand\` | A count (\`ss=2\`) or \`Bands\`: pairs of a width and a colour (\`0\` the body, \`1\` the trim, \`2\` the second trim, \`3\` the number's fill), from the cuff or hem inward. |
| \`cf=\` | \`cuffs\` | The sleeve's end in a colour: \`cf=18.1\` is a cuff 18 units long in the trim (the Canadiens' red tips); \`cf=10\` is the same with the default colour (the trim). |
| \`as=\` | \`armStripes\` | Bands down the length of the sleeve, from the shoulder to the cuff. |
| \`y=\`, \`p=y\` | \`yoke\`, \`pattern: "yoke"\` | A shoulder yoke (curved, square or full-arm). |
| \`sn=1\` | \`sleeveNumbers\` | The number on the upper arm, where the cut puts it. |
| \`ab=\` | \`armbands\` | Armbands: \`ab=2.12.30\` is a band in the second trim, 12 units wide, 30 percent down the sleeve (an official's); \`ab=2\` takes the defaults. |
| \`pk=1\`, \`bd=\` | \`pocket\`, \`badge\` | A chest pocket, and a plain badge spot on it: \`r\` round, \`s\` shield, \`q\` square. |
| \`pr=1\`, \`na=s\` | \`protector\`, \`nameArch: "straight"\` | An umpire's chest protector; the name set straight, as officials wear it. |
| \`co=z\`, \`co=t\` | \`collar: "zip"\`, \`collar: "point"\` | A zip collar, and a long-point dress collar (the other collar words are \`l\` lace-up, \`v\`, \`c\` crew, \`p\` polo, \`r\` round, \`w\` wishbone, \`b\` band). |

**Multi-colour stripe sets** need no new word: a stripe set is a list with a gap and as many bands as you like, in as many colours as there are indexes. The Flames' elbow set of yellow, white and yellow with the red of the body showing between is \`ss=20.0.4.1.3.0.8.2.3.0.4.1\`: a gap of 20 from the cuff, a yellow band of 4, a gap of 3, a white band of 8, a gap of 3, a yellow band of 4.

**A wide elbow band with thin edges** (the Kraken's) is the same list: \`ss=20.0.3.2.14.1.3.2\` is a gap of 20, a thin edge of 3 in the second trim, a band of 14 in the trim, another edge. The gap is what moves a stripe from the cuff to the elbow.

**Diagonal chest text** is not in a preset: the team's word on the chest is its wordmark, so presets leave the chest empty. A page draws it with its own text: \`frontText: "HOMETOWN", frontTextAngle: "diagonal-up"\` (rising to the right) or \`"diagonal-down"\`.

| Module | Import | Presets |
| --- | --- | --- |
${groups.map((g) => `| \`${g.name}\` | \`@johnmorrisdotca/senshu-jerseys/presets/${g.file.replace(/\.js$/, "")}\` | ${g.list.length} |`).join("\n")}

The officials' shirts (\`OFFICIALS\`, ids that start with \`ref:\`) are described, with their sources, in [officials.md](./officials.md).
`;
for (const g of groups) {
  out += `\n## ${g.name}\n\n| Id | Team | Years | Colours (body, trim, second trim) |\n| --- | --- | --- | --- |\n`;
  for (const p of g.list) {
    const o = p.options;
    out += `| \`${p.id}\` | ${p.team} | ${p.years} | ${[dot(o.body), dot(o.trim), dot(o.accent)].filter(Boolean).join(" ")} |\n`;
  }
}
const target = `${root}docs/presets.md`;
if (process.argv.includes("--check")) {
  let have = "";
  try { have = readFileSync(target, "utf8"); } catch { /* no file yet */ }
  if (have !== out) {
    console.error("docs/presets.md is not what the package makes: run `pnpm presets:doc`");
    process.exit(1);
  }
  console.log("ok   docs/presets.md is current");
} else {
  writeFileSync(target, out);
  console.log(`docs/presets.md written, ${groups.length} modules`);
}
