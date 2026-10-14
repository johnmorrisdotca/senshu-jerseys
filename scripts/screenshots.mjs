// Takes the README's pictures into docs/images, as webp made in the browser: the seven cuts front, back and in line (each cut on the ground of its own sport), a hockey sweater turned through
// eight angles, the officials, the caps and helmets, the retired-number banners, and jerseys on a phone (each light and dark). Every sheet stands on the family's shared backgrounds
// (scripts/family-backgrounds.ts, drawn in code, copied from taisen-brackets and never edited here), in the dark or the light variant, and its labels and line drawings take the ink the
// background returns, so they read. The grid runs edge to edge, every row is full, and a sheet may be cut into zones that each have a background of their own (the cuts, one ground per sport).
// It serves the demo on port 7302, or TEST_PORT (this package's own block, tests and tools from 7301 up) and stops the server it started. It needs a build (`pnpm screenshots` builds first).
// IMAGES_OUT writes somewhere else than docs/images; ONLY=name,name takes some; PRESET=name puts one background behind every zone of the sheets taken (to try them: use it with IMAGES_OUT).
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

import { BACKGROUND_PRESETS, backgroundSvg } from "./family-backgrounds.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = process.env.IMAGES_OUT ?? `${root}docs/images`;
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const override = process.env.PRESET;
if (override !== undefined && !BACKGROUND_PRESETS.includes(override)) throw new Error(`PRESET ${override} is not one of the family's backgrounds`);
mkdirSync(out, { recursive: true });
const port = Number(process.env.TEST_PORT ?? 7302);
const server = spawn(process.execPath, ["scripts/dev.mjs"], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
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
  /** Photographs a page element as a webp, made in the browser (no tool beyond Chromium), small enough for a README. */
  const webp = async (png, file) => {
    const page = await browser.newPage();
    const base64 = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      const blob = await new Promise((done) => canvas.toBlob(done, "image/webp", 0.82));
      const reader = new globalThis.FileReader();
      reader.readAsDataURL(blob);
      await new Promise((done) => { reader.onloadend = done; });
      return String(reader.result).split(",")[1];
    }, png.toString("base64"));
    await page.close();
    writeFileSync(file, Buffer.from(base64, "base64"));
  };
  /**
   * Opens the demo, replaces the page by a grid of equal cells the callback fills from the built package, and photographs it, standing on the family's backgrounds.
   * Every row is full (the cell count is `cols` times the number of `rows`), each row has its own height and the grid runs edge to edge, so no picture has a ragged last row or a band of empty paper.
   * `zones` says which preset stands behind which cells: `{ preset, cols: [from, to], rows: [from, to], intensity }` (all the cells by default). Each zone is drawn at its own size in the variant of the scheme,
   * and a cell takes the ink its zone returns (the cell's text colour, so a line-look jersey draws in it too, and `--muted` for a caption). The callback gets (S, T, O): the package, its turn and its officials' presets.
   */
  const sheet = async (name, { width, cols, rows, gap = 6, pad = 14, scheme = "light", phone = false, zones, seed = 1, scale = 2 }, make) => {
    if (only && !only.includes(name)) return;
    const height = pad * 2 + rows.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
    const colW = (width - 2 * pad - gap * (cols - 1)) / cols;
    const colAt = (i) => (i <= 0 ? 0 : i >= cols ? width : pad + i * (colW + gap) - gap / 2);
    const rowAt = (i) => (i <= 0 ? 0 : i >= rows.length ? height : pad + rows.slice(0, i).reduce((a, b) => a + b, 0) + i * gap - gap / 2);
    const placed = zones.map((zone, n) => {
      const [c0, c1] = zone.cols ?? [0, cols];
      const [r0, r1] = zone.rows ?? [0, rows.length];
      const x0 = colAt(c0), x1 = colAt(c1), y0 = rowAt(r0), y1 = rowAt(r1);
      const w = Math.round(x1 - x0), h = Math.round(y1 - y0);
      const made = backgroundSvg(override ?? zone.preset, { width: w, height: h, theme: scheme, seed: seed + n, ...(zone.intensity === undefined ? {} : { intensity: zone.intensity }), id: `bg-${name}-${n}` });
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:${Math.round(x0)}px;top:${Math.round(y0)}px;z-index:0" aria-hidden="true"><defs>${made.defs}</defs><rect width="${w}" height="${h}" fill="${made.ink.base}"/>${made.body}</svg>`;
      return { svg, ink: { text: made.ink.text, muted: made.ink.muted }, c0, c1, r0, r1 };
    });
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, hasTouch: phone, isMobile: phone, deviceScaleFactor: scale, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector("#stage svg");
    await page.evaluate(async ({ source, cols, rows, gap, pad, width, placed }) => {
      const S = await import("/dist/index.js");
      const T = await import("/dist/turn-entry.js");
      const O = await import("/dist/presets/officials.js");
      const box = document.createElement("div");
      box.id = "sheet";
      box.style.cssText = `position:relative;display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));grid-template-rows:${rows.map((h) => `${h}px`).join(" ")};gap:${gap}px;padding:${pad}px;width:${width}px;box-sizing:border-box;font:600 11px system-ui,sans-serif`;
      box.innerHTML = placed.map((z) => z.svg).join("") + new Function("S", "T", "O", `return (${source})(S, T, O)`)(S, T, O);
      const cells = [...box.children].filter((cell) => cell.tagName === "FIGURE");
      cells.forEach((cell, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const zone = placed.find((z) => col >= z.c0 && col < z.c1 && row >= z.r0 && row < z.r1);
        cell.style.cssText += `;position:relative;z-index:1;color:${zone.ink.text};--muted:${zone.ink.muted}`;
      });
      document.body.replaceChildren(box);
    }, { source: make.toString(), cols, rows, gap, pad, width, placed });
    await webp(await (await page.$("#sheet")).screenshot({ type: "png" }), `${out}/${name}.webp`);
    await context.close();
  };
  // (Each function is sent to the page as text, so each carries what it uses.)
  // The seven cuts, front, back and in one line, one column each.
  const cuts = (S) => {
    const cuts = ["hockey", "baseball", "basketball", "football", "soccer", "rugby", "handball"];
    const look = [
      { colors: ["#af1e2d", "#ffffff", "#192168"] },
      { colors: ["#f4f0e4", "#1b2a6b"], pattern: "pinstripes", cl: "button" },
      { colors: ["#1f3a8a", "#f4f0e4", "#e8b900"] },
      { colors: ["#0b6e4f", "#f4f0e4", "#e8b900"], sleeveStripes: 2 },
      { colors: ["#6cace4", "#ffffff"], pattern: "stripes", stripeCount: 9 },
      { colors: ["#14181c", "#ffffff"] },
      { colors: ["#c8102e", "#f4f0e4", "#1b2a6b"], pattern: "halves" },
    ];
    const row = (view, extra = {}) => cuts.map((cut, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${S.renderJersey({ cut, ...look[i], number: [9, 3, 23, 12, 10, 8, 7][i], name: ["Beaumont", "Ruthven", "Morris", "Larocque", "Gray", "Tui", "Moreau"][i], view, size: 168, ...extra })}</figure>`).join("");
    return row("front") + row("back") + row("front", { look: "line", size: 96 });
  };
  // Four jerseys on a phone, two by two.
  const phoneCells = (S) => ["hockey", "soccer", "basketball", "baseball"].map((cut, i) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${S.renderJersey({ cut, colors: [["#af1e2d", "#ffffff", "#192168"], ["#6cace4", "#ffffff"], ["#1f3a8a", "#f4f0e4"], ["#f4f0e4", "#1b2a6b"]][i], pattern: cut === "soccer" ? "stripes" : cut === "baseball" ? "pinstripes" : "solid", number: [9, 10, 23, 3][i], name: ["Beaumont", "Gray", "Morris", "Ruthven"][i], view: "both", size: 150 })}</figure>`).join("");
  // A hockey sweater turned through eight angles, in two rows of four.
  const turned = (S, T) => [-135, -90, -45, 0, 45, 90, 135, 180].map((yaw) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${T.jerseyFrame({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", yaw, size: 190 })}</figure>`).join("");
  // Officials: eight of the shirts, front (with the preset's id under it) and back (a made-up name and the number, the name straight as an official wears it).
  const officials = (S, T, O) => {
    S.usePresets(O.OFFICIALS);
    const ids = ["ref:nhl-modern-referee", "ref:nhl-modern-linesman", "ref:nba-modern", "ref:nfl", "ref:soccer-yellow", "ref:soccer-cyan", "ref:mlb-umpire-navy-protector", "ref:rugby-union-yellow"];
    const names = ["Beaumont", "Okafor", "Lindqvist", "Tanaka", "Marchetti", "Hollis", "Duval", "Reyes"];
    const one = (id, i, view) => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center">${S.renderJersey({ ...S.presetOptions(id), number: 14 + i * 7, name: names[i], nameArch: "straight", view, size: 158 })}${view === "front" ? `<figcaption style="margin-top:2px;color:var(--muted);font-size:11px">${id.slice(4)}</figcaption>` : ""}</figure>`;
    return ids.map((id, i) => one(id, i, "front")).join("") + ids.map((id, i) => one(id, i, "back")).join("");
  };
  // Caps (front, side), then football, hockey and batting helmets facing both ways, in six team colours.
  const gear = (S) => {
    const teams = [["#1f3a8a", "#f4f0e4", "#c8102e"], ["#c8102e", "#1b2a6b", "#f4f0e4"], ["#14181c", "#e8b900", "#f4f0e4"], ["#0b6e4f", "#f4f0e4", "#e8b900"], ["#6c2fa0", "#f4f0e4", "#e8b900"], ["#00808c", "#f4f0e4", "#1b2a6b"]];
    const tones = ["solid", "two-tone", "solid", "two-tone", "solid", "two-tone"];
    const letters = ["HC", "RS", "A", "KB", "LH", "NL"];
    const kinds = ["football", "hockey", "batting"];
    const f = (svg) => `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${svg}</figure>`;
    return teams.map((c, i) => f(S.renderCap({ colors: c, tone: tones[i], initials: letters[i], size: 150 }))).join("")
      + teams.map((c, i) => f(S.renderCap({ colors: c, tone: tones[i], initials: letters[i], view: "side", size: 150 }))).join("")
      + teams.map((c, i) => f(S.renderHelmet({ kind: kinds[i % 3], colors: c, mark: i % 2 === 0 ? "number" : "star", number: [12, 9, 4, 27, 88, 17][i], size: 150 }))).join("")
      + teams.map((c, i) => f(S.renderHelmet({ kind: kinds[(i + 1) % 3], colors: c, mark: i % 2 === 0 ? "star" : "number", number: [34, 5, 21, 7, 10, 99][i], facing: "left", size: 150 }))).join("");
  };
  // Retired-number banners: three shapes in six sets of colours, the sweater above where the shape has room, and the same six again with the colours turned round.
  const banners = (S) => {
    const sets = [
      ["rectangle", ["#1f3a8a", "#f4f0e4", "#c8102e"], 9, "Beaumont", "1948-1963", "hockey"],
      ["pennant", ["#0b6e4f", "#f4f0e4", "#e8b900"], 12, "Larocque", "Retired 1972", "football"],
      ["shield", ["#6c2fa0", "#f4f0e4", "#e8b900"], 33, "Fontaine", "1979-1996", "basketball"],
      ["rectangle", ["#14181c", "#e8b900", "#f4f0e4"], 4, "Ashworth", "1931-1947", "baseball"],
      ["shield", ["#b5452c", "#f4f0e4", "#1b2a6b"], 10, "Tanaka", "2001-2016", "soccer"],
      ["pennant", ["#00808c", "#f4f0e4", "#1b2a6b"], 99, "Lindqvist", "Retired 1999", "hockey"],
    ];
    const one = ([shape, colors, number, name, years, cut], flip) => {
      const c = flip ? [colors[1], colors[0], colors[2]] : colors;
      return `<figure style="margin:0;display:flex;align-items:center;justify-content:center">${S.renderBanner({ shape, colors: c, number, name, years, sweater: shape === "pennant" ? false : { cut, colors: [c[1], c[0], c[2]], pattern: cut === "baseball" ? "pinstripes" : "solid" }, size: 200 })}</figure>`;
    };
    return sets.map((s) => one(s, false)).join("") + sets.map((s) => one(s, true)).join("");
  };
  // Which preset stands behind which picture (dark and light variants): each cut on the ground of its sport (ice, infield, hardwood, turf, pitch), the officials under floodlights (midnight in the dark),
  // the caps and the helmets on an infield and on turf, the banners on royal purple (crimson in the dark), the phone's four jerseys on four grounds and the turned sweater on ice.
  const grounds = ["ice", "infield", "hardwood", "turf", "pitch", "turf", "hardwood"];
  for (const scheme of ["light", "dark"]) {
    await sheet(`hero-desk-${scheme}`, { width: 1400, cols: 7, rows: [200, 200, 118], scheme, zones: grounds.map((preset, i) => ({ preset, cols: [i, i + 1], intensity: 0.9 })) }, cuts);
    await sheet(`phone-${scheme}`, { width: 390, cols: 2, rows: [200, 200], gap: 4, pad: 8, phone: true, scheme, zones: [["ice", 0, 0], ["pitch", 1, 0], ["hardwood", 0, 1], ["infield", 1, 1]].map(([preset, c, r]) => ({ preset, cols: [c, c + 1], rows: [r, r + 1], intensity: 0.9 })) }, phoneCells);
    await sheet(`turn-desk-${scheme}`, { width: 1000, cols: 4, rows: [230, 230], scheme, zones: [{ preset: "ice", intensity: 0.9 }] }, turned);
    await sheet(`officials-desk-${scheme}`, { width: 1400, cols: 8, rows: [230, 215], scheme, zones: [{ preset: scheme === "dark" ? "midnight" : "floodlights", intensity: 0.9 }] }, officials);
    await sheet(`caps-desk-${scheme}`, { width: 1400, cols: 6, rows: [170, 170, 170, 170], scheme, zones: [{ preset: "infield", rows: [0, 2], intensity: 0.9 }, { preset: "turf", rows: [2, 4], intensity: 0.9 }] }, gear);
    await sheet(`banners-desk-${scheme}`, { width: 1400, cols: 6, rows: [270, 270], scheme, zones: [{ preset: scheme === "dark" ? "crimson" : "royal", intensity: 0.9 }] }, banners);
  }
  await browser.close();
  console.log(`pictures written to ${out}`);
} finally {
  server.kill();
}
