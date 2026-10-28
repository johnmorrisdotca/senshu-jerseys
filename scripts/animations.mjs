// Makes the README's moving pictures into docs/images, as animated webp: a hockey sweater turning through a full circle, and two rows (five jerseys of five sports, three hockey patterns) in which only the centre one turns and the others stand still.
// Each is drawn by the package's own turn (`jerseyFrame`, the frames the demo's turntable shows) inside the demo page, on one of the family's shared backgrounds (scripts/family-backgrounds.ts), in a light and
// a dark twin. Playwright takes one png per angle and `img2webp` (libwebp's tool: `brew install webp`) joins them into a looping lossy animation, each file well under 1.5 MB.
//
//   node scripts/animations.mjs                 all of them (needs a build: `pnpm animations` builds first)
//   ONLY=hero-turn node scripts/animations.mjs  one scene (hero-turn, kits-turn, patterns-turn), both twins
//   IMAGES_OUT=dir                              writes somewhere else than docs/images
//   FRAMES=48 DELAY=140 QUALITY=80              the number of frames in the circle, the milliseconds each is shown (140: half the speed of the first pictures, which used 70), the webp quality
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
const delay = Number(process.env.DELAY ?? 140);
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
    { cut: "football", colors: ["#1f5a3d", "#ffffff", "#e8b900"], number: 12, name: "Okafor" },
    { cut: "baseball", colors: ["#f4f0e4", "#1b2a6b"], pattern: "pinstripes", number: 3, name: "Ruthven" },
  ];
  // Only the centre one turns; the others stand still, a little turned, so they read as jerseys and not as flat pictures.
  const rest = [-14, 14, 0, -14, 14];
  return looks.map((look, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${T.jerseyFrame({ ...look, volume: true, pitch: 8, yaw: i === 2 ? yaw : rest[i], size: 160 })}</figure>`).join("");
};
const patterns = (S, T, H, yaw) => {
  S.usePresets(H.HOCKEY_PATTERNS);
  // The home shrinking-bands sweater, the home sawtooth sweater (the centre one, which turns) and the away sawtooth sweater.
  const ids = [H.HOCKEY_PATTERNS[0].id, H.HOCKEY_PATTERNS[2].id, H.HOCKEY_PATTERNS[3].id];
  const rest = [-14, 0, 14];
  return ids.map((id, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${T.jerseyFrame({ ...S.presetOptions(id), number: [9, 17, 88][i], name: ["Beaumont", "Okafor", "Lindqvist"][i], volume: true, pitch: 8, yaw: i === 1 ? yaw : rest[i], size: 230 })}</figure>`).join("");
};

// Judo is done on a mat: the family's floodlights over a tatami floor, with the red danger border of a contest area along its far edge. Drawn here, because the shared backgrounds file is never edited.
const matFloor = (frac) => (width, height, scheme) => {
  const dark = scheme === "dark";
  const top = Math.round(height * frac);
  const mat = dark ? ["#24402f", "#1a3023"] : ["#b9d3a6", "#9cbd88"];
  const line = dark ? "#0f2017" : "#7da06b";
  const red = dark ? "#8f2a2a" : "#d04545";
  const cell = 46;
  let grid = "";
  for (let y = top + 18, k = 0; y < height; y += cell * (1 + k * 0.18), k++) grid += `<path d="M0 ${y.toFixed(1)}H${width}" stroke="${line}" stroke-width="1.4" opacity=".7"/>`;
  for (let x = -cell; x < width + cell; x += cell * 1.5) grid += `<path d="M${x} ${height}L${(width / 2 + (x - width / 2) * 0.55).toFixed(1)} ${top + 18}" stroke="${line}" stroke-width="1.4" opacity=".7"/>`;
  return `<g aria-hidden="true"><defs><linearGradient id="mat-${scheme}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mat[0]}"/><stop offset="1" stop-color="${mat[1]}"/></linearGradient><clipPath id="matclip"><rect x="0" y="${top}" width="${width}" height="${height - top}"/></clipPath></defs>`
    + `<rect x="0" y="${top}" width="${width}" height="${height - top}" fill="url(#mat-${scheme})" opacity=".92"/><rect x="0" y="${top}" width="${width}" height="18" fill="${red}" opacity=".9"/><g clip-path="url(#matclip)">${grid}</g><rect x="0" y="${top}" width="${width}" height="3" fill="#000" opacity=".12"/></g>`;
};

// The judogi row: six jackets, one turning (the blue one, third from the left, with a label and embroidery) and the rest standing still. The chest emblem is on a jacket that does not turn, at exactly 0 degrees.
const JUDOGI_ROW = [
  { colour: "white", belt: "brown", view: "back", backPatch: { style: "ijf", name: "K. TANAKA", code: "JPN", line: "SENSHU JUDO CLUB", colour: "blue" }, rest: 12 },
  { colour: "white", belt: "red-white", emblem: { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/></svg>' }, rest: 0 },
  { colour: "blue", belt: "black", branding: true, label: { colour: "navy" }, embroidery: [{ place: "jacket-hem", text: "LEBLANC", thread: "gold" }], turns: true },
  { colour: "white", belt: "white", branding: true, embroidery: [{ place: "sleeve-left", text: "SENSHU", thread: "navy" }], rest: 14 },
  { colour: "blue", belt: "black", view: "back", backPatch: { style: "ijf", name: "M. LEBLANC", code: "CAN", line: "KESTREL JUDO", colour: "gold" }, rest: -12 },
  { colour: "white", belt: "none", view: "back", backPatch: { style: "zekken", name: "山田", line: "千秋館", ink: "black" }, rest: 12 },
];
const judogiRow = (S, T, H, yaw, row) => row.map((o) => {
  const { rest, turns, ...opts } = o;
  return `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${S.judogiFrame({ mode: "jacket", ...opts, yaw: turns ? yaw : rest, width: 200 })}</figure>`;
});

// The belts row: every belt colour, one turning (the blue one in the middle), several with a mark: embroidery at an end, the Approved label, a maker's logo.
const BELT_ROW = [
  { belt: "white", embroidery: [{ place: "belt-end-left", text: "SENSHU", thread: "navy" }], rest: 0 },
  { belt: "yellow", logos: [{ place: "belt-end-right" }], rest: 0 },
  { belt: "orange", label: { colour: "navy" }, turns: true },
  { belt: "green", embroidery: [{ place: "belt-end-left", text: "JUDO", thread: "white" }], rest: 0 },
  { belt: "blue", embroidery: [{ place: "belt-end-left", text: "SENSHU", thread: "white" }], rest: 0 },
  { belt: "brown", embroidery: [{ place: "belt-end-right", text: "柔道", font: "kaisho", thread: "gold" }], rest: 0 },
  { belt: "black", embroidery: [{ place: "belt-end-left", text: "TANAKA", thread: "gold" }], label: { colour: "black" }, rest: 0 },
  { belt: "red-white", logos: [{ place: "belt-end-left" }], rest: 0 },
  { belt: "red", embroidery: [{ place: "belt-end-right", text: "10 DAN", thread: "gold" }], rest: 0 },
  { belt: "black", logos: [{ place: "belt-end-right" }], label: { colour: "forest" }, rest: 0 },
];
const beltRow = (S, T, H, yaw, row) => row.map((o) => {
  const { rest, turns, ...opts } = o;
  return `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${S.judogiFrame({ mode: "belt", ...opts, yaw: turns ? yaw : rest, width: 170 })}</figure>`;
});

const SCENES = [
  { name: "judogi-turn", width: 1000, height: 340, cols: 6, preset: "floodlights", intensity: 0.8, make: judogiRow, data: JUDOGI_ROW, floor: matFloor(0.7) },
  { name: "belts-turn", width: 1000, height: 360, cols: 5, rows: 2, preset: "floodlights", intensity: 0.8, make: beltRow, data: BELT_ROW, floor: matFloor(0.46) },
  { name: "hero-turn", width: 760, height: 460, cols: 1, preset: "ice", intensity: 0.9, make: hero },
  { name: "kits-turn", width: 760, height: 300, cols: 5, preset: "floodlights", intensity: 0.8, make: kits },
  { name: "patterns-turn", width: 760, height: 300, cols: 3, preset: "ice", intensity: 0.9, make: patterns },
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
      const ground = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="position:absolute;left:0;top:0" aria-hidden="true"><defs>${made.defs}</defs><rect width="${width}" height="${height}" fill="${made.ink.base}"/>${made.body}${scene.floor ? scene.floor(width, height, scheme) : ""}</svg>`;
      const context = await browser.newContext({ viewport: { width, height: height + 40 }, colorScheme: scheme, deviceScaleFactor: 1.25, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/?turn=0`);
      await page.waitForSelector("#stage svg");
      await page.evaluate(async ({ source, cols, width, height, ground, data }) => {
        const S = await import("/dist/index.js");
        const T = await import("/dist/turn-entry.js");
        const H = await import("/dist/presets/hockey-patterns.js");
        const box = document.createElement("div");
        box.id = "scene";
        box.style.cssText = `position:relative;width:${width}px;height:${height}px;overflow:hidden;font:600 11px system-ui,sans-serif`;
        box.innerHTML = `${ground}<div id="cells" style="position:relative;z-index:1;display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));align-items:center;height:100%;padding:10px"></div>`;
        document.body.replaceChildren(box);
        globalThis.draw = new Function("S", "T", "H", "yaw", "data", `return (${source})(S, T, H, yaw, data)`);
        globalThis.deps = [S, T, H];
        // A row of heavy drawings (judogi) comes back as a list of cells: the still ones are drawn once and only the turning one is drawn again for each angle.
        globalThis.cellsDone = false;
        globalThis.paint = (yaw) => {
          const cells = document.getElementById("cells");
          const made = globalThis.draw(...globalThis.deps, yaw, data);
          if (typeof made === "string") { cells.innerHTML = made; return; }
          if (!globalThis.cellsDone) { cells.innerHTML = made.join(""); globalThis.cellsDone = true; return; }
          const at = data.findIndex((o) => o.turns);
          const holder = document.createElement("div");
          holder.innerHTML = made[at];
          cells.children[at].replaceWith(holder.firstElementChild);
        };
      }, { source: scene.make.toString(), cols: scene.cols, width, height, ground, data: scene.data ?? null });
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
