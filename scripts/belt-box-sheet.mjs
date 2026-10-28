// Draws the picture in docs/judogi.md of the folded belt and the two gift boxes, from the package itself (the designer's own canvas drawing, so it is what the page shows):
// a folded red-white belt with its paper band, the kiri box closed, open with the belt in it and empty, and the silver box closed and open. A transparent WebP, so it sits on a
// light page and a dark one. Run it after the drawing changes (`pnpm belt-box-sheet`; it needs `cwebp`: `brew install webp`). The server uses this package's port 7375 (PORT overrides it).
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, mkdtempSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT ?? 7375);
if (spawnSync("cwebp", ["-version"], { stdio: "ignore" }).status === null) throw new Error("cwebp is not installed: `brew install webp`");

/** Each cell: what to draw, how far in to look, and the angle. The belt is red-white with the package's own branding, so the marks on its ends show. */
const belt = { belt: "red-white", branding: true, label: true, beltSize: 4 };
const CELLS = [
  { o: { mode: "folded", ...belt, band: true }, zoom: 2.3 },
  { o: { mode: "box", boxState: "closed", beltSize: 4 }, zoom: 1.55 },
  { o: { mode: "box", boxState: "open", ...belt }, zoom: 1.75 },
  { o: { mode: "box", boxState: "empty", beltSize: 4 }, zoom: 1.95 },
  { o: { mode: "box", boxType: "silver", boxState: "closed", beltSize: 4 }, zoom: 1.55 },
  { o: { mode: "box", boxType: "silver", boxState: "open", belt: "black", branding: true, beltSize: 4 }, zoom: 1.5 },
];
const W = 560;
const H = 440;
const page = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:transparent"><div id="g" style="display:grid;grid-template-columns:repeat(3,${W}px);gap:0"></div><script type="module">
import { renderJudogi } from "/dist/index.js";
import { judogiCanvas } from "/dist/turn-entry.js";
window.draw = async (cells) => {
  const g = document.getElementById("g");
  for (const c of cells) {
    const host = document.createElement("div");
    host.style.cssText = "width:${W}px;height:${H}px;position:relative;overflow:hidden";
    const tpl = document.createElement("div");
    tpl.innerHTML = renderJudogi({ width: ${H} * 0.95, ...c.o });
    const svg = tpl.firstChild;
    document.body.append(svg);
    svg.style.cssText = "position:absolute;left:-9999px";
    const canvas = await judogiCanvas(svg, { box: { width: ${W}, height: ${H} }, scale: 6, pixelRatio: 1.5 });
    canvas.turn(0, 0, { zoom: c.zoom });
    canvas.canvas.style.cssText = "position:absolute;left:0;top:0;width:${W}px;height:${H}px";
    host.append(canvas.canvas);
    g.append(host);
    svg.remove();
  }
  return g.children.length;
};
</script>`;
const TYPES = { ".js": "text/javascript", ".html": "text/html" };
const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://x").pathname;
  if (path === "/") return void res.writeHead(200, { "content-type": "text/html" }).end(page);
  try {
    res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(readFileSync(join(root, path)));
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, "127.0.0.1");
const work = mkdtempSync(join(tmpdir(), "senshu-belt-box-"));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const tab = await browser.newPage({ viewport: { width: 3 * W, height: 2 * H }, deviceScaleFactor: 1 });
  await tab.goto(`http://127.0.0.1:${port}/`);
  await tab.evaluate((cells) => window.draw(cells), CELLS);
  await tab.waitForTimeout(400);
  const png = join(work, "sheet.png");
  await tab.screenshot({ path: png, omitBackground: true });
  const out = join(root, "docs/images/belt-box.webp");
  const run = spawnSync("cwebp", ["-quiet", "-q", "86", "-alpha_q", "100", "-m", "6", "-resize", String(3 * W * 0.75), "0", png, "-o", out], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(`cwebp failed: ${run.stderr}`);
  console.log(`docs/images/belt-box.webp written, ${Math.round(readFileSync(out).length / 1024)} kB`);
} finally {
  await browser.close();
  server.close();
  rmSync(work, { recursive: true, force: true });
}
