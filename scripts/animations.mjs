// Makes the README's moving pictures into docs/images, as animated webp: a hockey sweater turning through a full circle, four jerseys of four sports turning out of step, and the hockey patterns turning.
// Each is drawn by the package's own turn (`jerseyFrame`, the frames the demo's turntable shows) inside the demo page, on one of the family's shared backgrounds (scripts/family-backgrounds.ts), in a light and
// a dark twin. Playwright takes one png per angle and `img2webp` (libwebp's tool: `brew install webp`) joins them into a looping lossy animation, each file well under 1.5 MB.
//
//   node scripts/animations.mjs                 all of them (needs a build: `pnpm animations` builds first)
//   ONLY=hero-turn node scripts/animations.mjs  one scene (hero-turn, kits-turn, patterns-turn), both twins
//   IMAGES_OUT=dir                              writes somewhere else than docs/images
//   FRAMES=48 DELAY=70 QUALITY=80               the number of frames in the circle, the milliseconds each is shown, the webp quality
//
// It serves the demo on port 7303, or TEST_PORT (this package's own block, tests and tools from 7301 up), and stops the server it started.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

import { backgroundSvg } from "./family-backgrounds.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = process.env.IMAGES_OUT ?? `${root}docs/images`;
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const frames = Number(process.env.FRAMES ?? 48);
const delay = Number(process.env.DELAY ?? 70);
const quality = Number(process.env.QUALITY ?? 80);
const port = Number(process.env.TEST_PORT ?? 7303);
const MAX_BYTES = 1.5 * 1024 * 1024;

if (spawnSync("img2webp", ["-version"], { stdio: "ignore" }).status === null) throw new Error("img2webp is not installed: `brew install webp` (libwebp's animation tool)");
mkdirSync(out, { recursive: true });

// The cells of each scene at one angle, as the page builds them from the built package (each function is sent to the page as text, so each carries what it uses).
const hero = (S, T, H, yaw) =>
  `<figure style="margin:0;display:flex;align-items:center;justify-content:center;width:100%">${T.jerseyFrame({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", sleeveNumbers: true, volume: true, pitch: 8, yaw, size: 390 })}</figure>`;
const kits = (S, T, H, yaw) => {
  const looks = [
    { cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont" },
    { cut: "soccer", colors: ["#6cace4", "#ffffff"], pattern: "stripes", stripeCount: 9, number: 10, name: "Gray" },
    { cut: "basketball", colors: ["#1f3a8a", "#f4f0e4", "#e8b900"], number: 23, name: "Morris" },
    { cut: "baseball", colors: ["#f4f0e4", "#1b2a6b"], pattern: "pinstripes", number: 3, name: "Ruthven" },
  ];
  // Each one a quarter turn behind the one before, so the row is never all front or all back.
  return looks.map((look, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${T.jerseyFrame({ ...look, volume: true, pitch: 8, yaw: yaw + i * 90, size: 190 })}</figure>`).join("");
};
const patterns = (S, T, H, yaw) => {
  S.usePresets(H.HOCKEY_PATTERNS);
  const ids = H.HOCKEY_PATTERNS.map((p) => p.id).slice(0, 4);
  return ids.map((id, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${T.jerseyFrame({ ...S.presetOptions(id), number: [9, 17, 19, 88][i], name: ["Beaumont", "Okafor", "Morris", "Lindqvist"][i], volume: true, pitch: 8, yaw: yaw + i * 45, size: 190 })}</figure>`).join("");
};

const SCENES = [
  { name: "hero-turn", width: 760, height: 460, cols: 1, preset: "ice", intensity: 0.9, make: hero },
  { name: "kits-turn", width: 760, height: 300, cols: 4, preset: "floodlights", intensity: 0.8, make: kits },
  { name: "patterns-turn", width: 760, height: 300, cols: 4, preset: "ice", intensity: 0.9, make: patterns },
];

const server = spawn(process.execPath, ["scripts/dev.mjs"], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
const work = mkdtempSync(join(tmpdir(), "senshu-animations-"));
try {
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = async () => {
      try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return resolve(); } catch { /* not up yet */ }
      if (Date.now() - started > 8000) return reject(new Error("the demo server did not start"));
      setTimeout(poll, 150);
    };
    poll();
  });
  const browser = await chromium.launch();
  for (const scene of SCENES) {
    if (only && !only.includes(scene.name)) continue;
    for (const scheme of ["light", "dark"]) {
      const { width, height } = scene;
      const made = backgroundSvg(scene.preset, { width, height, theme: scheme, seed: 3, intensity: scene.intensity, id: `bg-${scene.name}` });
      const ground = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="position:absolute;left:0;top:0" aria-hidden="true"><defs>${made.defs}</defs><rect width="${width}" height="${height}" fill="${made.ink.base}"/>${made.body}</svg>`;
      const context = await browser.newContext({ viewport: { width, height: height + 40 }, colorScheme: scheme, deviceScaleFactor: 1.25, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/?turn=0`);
      await page.waitForSelector("#stage svg");
      await page.evaluate(async ({ source, cols, width, height, ground }) => {
        const S = await import("/dist/index.js");
        const T = await import("/dist/turn-entry.js");
        const H = await import("/dist/presets/hockey-patterns.js");
        const box = document.createElement("div");
        box.id = "scene";
        box.style.cssText = `position:relative;width:${width}px;height:${height}px;overflow:hidden;font:600 11px system-ui,sans-serif`;
        box.innerHTML = `${ground}<div id="cells" style="position:relative;z-index:1;display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));align-items:center;height:100%;padding:10px"></div>`;
        document.body.replaceChildren(box);
        globalThis.draw = new Function("S", "T", "H", "yaw", `return (${source})(S, T, H, yaw)`);
        globalThis.deps = [S, T, H];
        globalThis.paint = (yaw) => { document.getElementById("cells").innerHTML = globalThis.draw(...globalThis.deps, yaw); };
      }, { source: scene.make.toString(), cols: scene.cols, width, height, ground });
      const dir = join(work, `${scene.name}-${scheme}`);
      mkdirSync(dir);
      const files = [];
      for (let i = 0; i < frames; i++) {
        await page.evaluate((yaw) => globalThis.paint(yaw), (i * 360) / frames);
        const file = join(dir, `${String(i).padStart(3, "0")}.png`);
        writeFileSync(file, await (await page.$("#scene")).screenshot({ type: "png" }));
        files.push(file);
      }
      const target = join(out, `${scene.name}-${scheme}.webp`);
      const run = spawnSync("img2webp", ["-loop", "0", "-lossy", "-q", String(quality), "-m", "6", "-d", String(delay), ...files, "-o", target], { encoding: "utf8" });
      if (run.status !== 0) throw new Error(`img2webp failed: ${run.stderr}`);
      const size = statSync(target).size;
      if (size > MAX_BYTES) throw new Error(`${target} is ${size} bytes, over 1.5 MB: lower FRAMES or QUALITY`);
      console.log(`ok   ${scene.name}-${scheme}.webp  ${Math.round(size / 1024)} kB, ${frames} frames`);
      await context.close();
    }
  }
  await browser.close();
} finally {
  server.kill();
  rmSync(work, { recursive: true, force: true });
}
