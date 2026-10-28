// Writes docs/martial-arts.md from src/beltSystems.ts, so the page and the data cannot differ: `node scripts/make-martial-arts-doc.mjs` (add `--check` to fail when the file is stale).
import { readFileSync, writeFileSync } from "node:fs";
import { BELT_SYSTEMS, beltSystemSources } from "../src/beltSystems.ts";

const colours = (g) => (g.body.length === 2 ? `${g.body[0]} and ${g.body[1]}${g.split === "lengthwise" ? " (split lengthwise)" : g.split === "alternating" ? " (alternating panels)" : ""}` : g.body[0]);
const look = (g) => {
  const parts = [];
  if (g.centreStripe) parts.push(`${g.centreStripe} stripe along the whole belt`);
  if (g.tip) parts.push(`${g.tip.colour} block ${g.tip.lengthCm} cm long, ${g.tip.fromEndCm} cm from the end${g.tip.bars ? `, up to ${g.tip.bars.max} ${g.tip.bars.colour} bars across it` : ""}`);
  if (g.tags) parts.push(`${g.tags.count} ${g.tags.colour} ${g.tags.form === "tag" ? (g.tags.count === 1 ? "tag" : "tags") + " round the belt near one end" : "tip at the end"}`);
  return parts.length ? parts.join("; ") : "plain";
};
const cell = (s) => String(s ?? "").replace(/\|/g, "/");

let md = `# Martial arts belts

The belt systems the package knows, as data (\`BELT_SYSTEMS\` in \`src/beltSystems.ts\`) and as this page, which is written from it by \`node scripts/make-martial-arts-doc.mjs\`. Each system lists its grades, what the belt looks like in a plain declarative form (a body of one or two colours, a stripe along it, a block at one end with bars across it, tags), the usual width and the ends' hang, and the pages it was read from with the day. **Sourced** means a governing body's own text was read; **lead** means a retailer's chart or a picture only, to be confirmed before it is drawn. Pictures of each belt are not here yet: they are made once the belt drawing takes these fields.

\`\`\`js
import { BELT_SYSTEMS, beltSystem } from "@johnmorrisdotca/senshu-jerseys";

beltSystem("bjj-ibjjf-kids")?.grades.map((grade) => grade.name);
\`\`\`

`;
for (const s of BELT_SYSTEMS) {
  md += `## ${s.name}\n\n![Every grade of ${cell(s.name)}, drawn from its data](images/belts/${s.id}.webp)\n\nStatus: ${s.status}. Worn at the ${s.ends.worn}; width ${s.ends.widthCm.min} to ${s.ends.widthCm.max} cm (usually ${s.ends.widthCm.usual}); ends hang ${s.ends.hangCm.min} to ${s.ends.hangCm.max} cm from the knot (usually ${s.ends.hangCm.usual}).\n\n`;
  md += `| Grade | Colours | Marks | Ages |\n|---|---|---|---|\n`;
  for (const g of s.grades) md += `| ${cell(g.name)} | ${cell(colours(g))} | ${cell(look(g))}${g.note ? `. ${cell(g.note)}` : ""} | ${cell(g.ages ?? "")} |\n`;
  if (s.customary.length) {
    md += `\nCustomary text on the belt end:\n\n`;
    for (const t of s.customary) md += `- ${t.script} script, ${t.font} lettering${t.meaning ? `: ${t.meaning}` : ""} (${t.basis === "primary" ? "from a governing body" : "a lead"})\n`;
  }
  md += `\nNotes:\n\n${s.notes.map((n) => `- ${n}`).join("\n")}\n\nSources:\n\n${beltSystemSources(s).map((x) => `- [${x.title}](${x.url}), read ${x.read} (${x.kind}): ${x.note}`).join("\n")}\n\n`;
}
md = md.trimEnd() + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(new URL("../docs/martial-arts.md", import.meta.url), "utf8") !== md) { console.error("docs/martial-arts.md is stale: run node scripts/make-martial-arts-doc.mjs"); process.exit(1); }
} else writeFileSync(new URL("../docs/martial-arts.md", import.meta.url), md);
