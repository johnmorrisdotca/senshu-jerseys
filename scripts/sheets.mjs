// Contact sheets of the package's drawings, to look at while changing them: every cut in a few patterns (front and back), the collars, caps, helmets, banners, a matchup, a
// lineup and a whole uniform. Needs a build (`pnpm sheets` builds first). The PNGs go in the folder named (outside the repository), or `.cache/sheets`.
//
//   node scripts/sheets.mjs [out-dir]
import { mkdirSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = process.argv[2] ?? `${root}.cache/sheets`;
mkdirSync(out, { recursive: true });
const S = await import(`${root}dist/index.js`);

async function sheet(name, rows, { width = 1500, dark = false } = {}) {
  let html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:${dark ? "#141614" : "#f4efe4"};color:${dark ? "#ece8dc" : "#1f2320"};font:12px system-ui}.row{display:flex;align-items:flex-end;gap:8px;margin:8px 10px;flex-wrap:wrap}.lab{width:74px;font-size:11px;opacity:.7}</style>`;
  for (const r of rows) html += `<div class="row"><div class="lab">${r.label ?? ""}</div>${r.cells.join("")}</div>`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 300 }, deviceScaleFactor: 1.6 });
  await page.setContent(html);
  writeFileSync(`${out}/${name}.png`, await page.screenshot({ fullPage: true }));
  await browser.close();
  console.log(`${out}/${name}.png`);
}

const cuts = S.CUT_IDS;
const red = ["#c8102e", "#f4f0e4", "#1b2a6b"];
const navy = ["#1b2a6b", "#f4f0e4", "#c8102e"];
const base = { number: 23, name: "Morris", size: 150 };
const draw = (o) => S.renderJersey({ ...base, ...o });

for (const [pattern, extra, colors] of [["solid", {}, red], ["stripes", { stripeCount: 9 }, ["#6cace4", "#ffffff"]], ["hoops", { repeat: [14, 1, 14, 0] }, ["#1f3a8a", "#f4f0e4"]], ["pinstripes", {}, ["#f4f0e4", "#1b2a6b"]], ["halves", {}, red], ["sash", {}, ["#ffffff", "#c8102e"]], ["chevron", {}, navy], ["yoke", { yoke: "curved" }, ["#14181c", "#e8b900"]]]) {
  await sheet(`cuts-${pattern}`, [
    { label: `${pattern} front`, cells: cuts.map((cut) => draw({ cut, pattern, colors, ...extra })) },
    { label: `${pattern} back`, cells: cuts.map((cut) => draw({ cut, pattern, colors, view: "back", ...extra })) },
  ]);
}
await sheet("collars", cuts.flatMap((cut) => [{ label: cut, cells: S.CUTS[cut].collars.map((collar) => draw({ cut, collar, colors: red, size: 120 })) }]), { width: 900 });
await sheet("line-and-dark", [
  { label: "line 16-64", cells: [16, 24, 32, 48, 64].flatMap((size) => cuts.map((cut) => draw({ cut, look: "line", size }))) },
  { label: "flat", cells: cuts.map((cut) => draw({ cut, look: "flat", colors: navy })) },
  { label: "cloth dark", cells: cuts.map((cut) => draw({ cut, colors: ["#14181c", "#e8b900", "#f4f0e4"], view: "both", size: 100 })) },
], { dark: true });
await sheet("caps-helmets-banners", [
  { label: "caps", cells: [S.renderCap({ colors: ["#1f3a8a"], initials: "CAN", size: 130 }), S.renderCap({ colors: ["#c8102e", "#1b2a6b", "#f4f0e4"], tone: "two-tone", initials: "USA", size: 130 }), S.renderCap({ colors: ["#14181c", "#e8b900"], initials: "A", view: "side", size: 130 }), S.renderCap({ colors: ["#c8102e", "#f4f0e4", "#f4f0e4"], tone: "two-tone", initials: "JPN", view: "side", size: 130 }), S.renderCap({ look: "line", size: 40 })] },
  { label: "helmets", cells: ["football", "hockey", "batting"].flatMap((kind) => [S.renderHelmet({ kind, colors: ["#1f3a8a", "#f4f0e4"], mark: "number", number: 12, size: 140 }), S.renderHelmet({ kind, colors: ["#c8102e", "#e8b900"], mark: "star", facing: "left", size: 140 })]).concat([S.renderHelmet({ look: "line", size: 40 })]) },
  { label: "banners", cells: ["rectangle", "pennant", "shield"].flatMap((shape) => [S.renderBanner({ shape, colors: red, number: 9, name: "Beaumont", years: "1948-1963", sweater: shape !== "pennant", size: 150 }), S.renderBanner({ shape, colors: ["#14181c", "#e8b900", "#f4f0e4"], number: 99, name: "Lindqvist", years: "Retired 1999", size: 150 })]).concat([S.renderBanner({ look: "line", number: 4, size: 50 })]) },
]);
await sheet("matchup-lineup-kit", [
  { label: "matchup", cells: [S.kitMatchup({ away: { colors: ["#ffffff", "#1b2a6b"], pattern: "stripes", label: "Japan", number: 7 }, home: { colors: ["#c8102e", "#ffffff"], label: "Canada", number: 9 }, view: "both", size: 700 })] },
  { label: "lineup", cells: [S.jerseyLineup(Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: `P${i + 1}` })), { formation: "4-3-3", jersey: { cut: "soccer", colors: ["#c8102e", "#ffffff"] }, field: true, size: 420 })] },
  { label: "kit", cells: cuts.slice(0, 5).map((cut) => S.renderJersey({ cut, colors: red, kit: true, helmet: "#1b2a6b", pants: cut === "hockey" ? "#1b2a6b" : "#f4f0e4", pantsBands: [4, 1], socks: "#c8102e", socksBands: [18, 0, 5, 1, 3, 2, 5, 1], size: 130 })) },
]);
