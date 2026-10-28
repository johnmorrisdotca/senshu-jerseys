// Draws one picture for each belt system of `BELT_SYSTEMS` (src/beltSystems.ts): every grade as a belt, with its name under it, drawn by the package from the grade's own data
// (`gradeBelt`), into docs/images/belts/<system id>.webp. docs/martial-arts.md shows them. `node scripts/belt-sheets.mjs` (needs a build and `cwebp`: `brew install webp`).
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const S = await import(pathToFileURL(join(root, "dist/index.js")).href);
if (spawnSync("cwebp", ["-version"], { stdio: "ignore" }).status === null) throw new Error("cwebp is not installed: `brew install webp`");
const out = join(root, "docs/images/belts");
mkdirSync(out, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "senshu-belts-"));
const COLS = 5;
const CELL = 190;
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const browser = await chromium.launch();
try {
  for (const system of S.BELT_SYSTEMS) {
    const cells = system.grades.map((grade) => {
      const { belt, beltStyle } = S.gradeBelt(grade);
      return `<figure>${S.judogiFrame({ mode: "belt", belt, beltStyle, size: "170", yaw: 0, width: CELL - 20 })}<figcaption>${esc(grade.name)}</figcaption></figure>`;
    });
    const rows = Math.ceil(cells.length / COLS);
    const page = await browser.newPage({ viewport: { width: COLS * CELL, height: rows * 150 }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><body style="margin:0;background:#f4f2ec;font:12px/1.25 system-ui,sans-serif;color:#222"><style>div{display:grid;grid-template-columns:repeat(${COLS},${CELL}px);padding:6px 0}figure{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;height:138px;padding:0 6px;text-align:center}figure svg{height:auto;max-width:${CELL - 20}px}figcaption{margin-top:2px}</style><div>${cells.join("")}</div>`);
    const png = join(work, `${system.id}.png`);
    const el = await page.$("div");
    await el.screenshot({ path: png });
    const run = spawnSync("cwebp", ["-quiet", "-q", "85", "-m", "6", png, "-o", join(out, `${system.id}.webp`)], { encoding: "utf8" });
    if (run.status !== 0) throw new Error(`cwebp failed: ${run.stderr}`);
    await page.close();
    console.log(`ok   ${system.id}.webp  ${system.grades.length} grades`);
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
