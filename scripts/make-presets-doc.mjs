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
const order = ["NHL_CLASSIC", "NHL", "HOCKEY_NATIONS", "MLB", "NBA", "NFL", "CFL", "IFAF", "SOCCER", "SOCCER_NATIONS", "RUGBY"];
groups.sort((a, b) => (order.indexOf(a.name) + 1 || 99) - (order.indexOf(b.name) + 1 || 99) || a.name.localeCompare(b.name));
const dot = (c) => (c === undefined ? "" : `\`${c}\``);
let out = `# Presets

A preset is a team's uniform of one era written as colours and stripes: the body, the trim, the sleeve, hem and chest bands, the yoke, the collar and the number's colours, with the matching pants, socks and helmet where they are known.
**A preset never draws a crest, a logo, a monogram, a wordmark or a sponsor's mark**, and nothing on it is a team's mark: the chest stays empty or takes the caller's own \`crest\`. This holds for defunct teams too, whose marks
are still owned and sold today. The colours and the stripe layouts are facts taken from the uniform sections of Wikipedia articles, Wikidata and the clubs' published colour codes and recorded here as data; no picture is copied.
They are an honest reading, not a proof: where a layout could not be said with the stripes the renderer draws, the nearest plain one is used.

Made from the built package by \`node scripts/make-presets-doc.mjs\`; \`pnpm test:readme\` checks that it is current. ${groups.reduce((n, g) => n + g.list.length, 0)} presets in ${groups.length} modules.

| Module | Import | Presets |
| --- | --- | --- |
${groups.map((g) => `| \`${g.name}\` | \`@johnmorrisdotca/senshu-jerseys/presets/${g.file.replace(/\.js$/, "")}\` | ${g.list.length} |`).join("\n")}
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
