// Draws the five pictures on the designer's Display tiles (Pieces, Suit, Jacket, Trousers, Belt) from the package itself, so that they are always what
// the designer then draws: each is the judogi in that display mode, a blue jacket and trousers with a black belt (the belt on its own is red and white, which shows on a dark page too), drawn as the package draws it and
// rasterised small with a clear background (so it sits on a light page and a dark one). The result is demo/judogiIcons.js, three times the tile's
// pixel size as WebP data. Run it after the judogi drawing changes (`pnpm mode-icons`; it needs `cwebp`: `brew install webp`).
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const S = await import(pathToFileURL(join(root, "dist/index.js")).href);
if (spawnSync("cwebp", ["-version"], { stdio: "ignore" }).status === null) throw new Error("cwebp is not installed: `brew install webp`");

/** The tile's picture box in CSS pixels, and how much sharper the picture is made. */
const W = 64;
const H = 56;
const SCALE = 3;
const MODES = ["pieces", "suit", "jacket", "pants", "belt"];
const work = mkdtempSync(join(tmpdir(), "senshu-icons-"));
const browser = await chromium.launch();
const icons = {};
try {
  for (const mode of MODES) {
    const svg = S.renderJudogi({ mode, colour: "blue", belt: mode === "belt" ? "red-white" : "black", size: "170", view: "front", yaw: 0, width: 400 });
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    await page.setContent(`<!doctype html><body style="margin:0;background:transparent;width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center"><div style="width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center">${svg.replace("<svg ", `<svg style="max-width:${W}px;max-height:${H}px;width:auto;height:auto" `)}</div>`);
    // The drawing's own width sets its size: scale it to the box.
    await page.evaluate(({ W, H }) => {
      const el = document.querySelector("svg");
      const vb = el.viewBox.baseVal;
      const k = Math.min(W / vb.width, H / vb.height);
      el.setAttribute("width", String(vb.width * k));
      el.setAttribute("height", String(vb.height * k));
      el.style.cssText = "";
    }, { W, H });
    const png = join(work, `${mode}.png`);
    const webp = join(work, `${mode}.webp`);
    await page.screenshot({ path: png, omitBackground: true });
    const run = spawnSync("cwebp", ["-quiet", "-q", "88", "-alpha_q", "100", "-m", "6", png, "-o", webp], { encoding: "utf8" });
    if (run.status !== 0) throw new Error(`cwebp failed: ${run.stderr}`);
    icons[mode] = `data:image/webp;base64,${readFileSync(webp).toString("base64")}`;
    await page.close();
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
const lines = MODES.map((m) => `  ${m}: "${icons[m]}",`).join("\n");
writeFileSync(join(root, "demo/judogiIcons.js"), `// Made by scripts/mode-icons.mjs from the package's own drawing: do not edit by hand. Each is the display mode drawn small (${W} by ${H} pixels, ${SCALE}x), as WebP data.\nexport const MODE_ICON_SIZE = [${W}, ${H}];\nexport const MODE_ICONS = {\n${lines}\n};\n`);
console.log(`demo/judogiIcons.js written: ${MODES.map((m) => `${m} ${Math.round(icons[m].length / 1024)} kB`).join(", ")}`);
