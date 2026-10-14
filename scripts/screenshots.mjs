// Takes the README's pictures into docs/images: the seven cuts front, back and in line (desk, light and dark), a hockey sweater turned through seven angles, and jerseys on a phone.
// It serves the demo on port 7302 (this package's own block, tests and tools from 7301 up; the tests use 7301) and stops the server it started.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = `${root}docs/images`;
mkdirSync(out, { recursive: true });
const port = 7302;
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
  /** Opens the demo, replaces the page by a sheet the callback makes from the built package, and photographs the sheet. */
  const sheet = async (name, { width, height = 900, scheme = "light", phone = false }, make) => {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, hasTouch: phone, isMobile: phone, deviceScaleFactor: 2, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector("#stage svg");
    await page.evaluate(async (source) => {
      const S = await import("/dist/index.js");
      const T = await import("/dist/turn-entry.js");
      const box = document.createElement("div");
      box.id = "sheet";
      const dark = matchMedia("(prefers-color-scheme: dark)").matches;
      box.style.cssText = `display:flex;flex-wrap:wrap;gap:14px 18px;align-items:flex-end;justify-content:center;padding:18px;width:${window.innerWidth}px;box-sizing:border-box;background:${dark ? "#141614" : "#f4efe4"};color:${dark ? "#ece8dc" : "#1f2320"};font:600 13px system-ui,sans-serif`;
      box.innerHTML = new Function("S", "T", `return (${source})(S, T)`)(S, T);
      document.body.replaceChildren(box);
    }, make.toString());
    await (await page.$("#sheet")).screenshot({ path: `${out}/${name}.png` });
    await context.close();
  };
  const hero = (S) => {
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
    const row = (view, extra = {}) => cuts.map((cut, i) => S.renderJersey({ cut, ...look[i], number: [9, 3, 23, 12, 10, 8, 7][i], name: ["Beaumont", "Ruthven", "Morris", "Larocque", "Gray", "Tui", "Moreau"][i], view, size: 150, ...extra })).join("");
    return `${row("front")}<div style="flex-basis:100%"></div>${row("back")}<div style="flex-basis:100%"></div>${row("front", { look: "line", size: 90 })}`;
  };
  const phone = (S) => ["hockey", "soccer", "basketball", "baseball"].map((cut, i) => S.renderJersey({ cut, colors: [["#af1e2d", "#ffffff", "#192168"], ["#6cace4", "#ffffff"], ["#1f3a8a", "#f4f0e4"], ["#f4f0e4", "#1b2a6b"]][i], pattern: cut === "soccer" ? "stripes" : cut === "baseball" ? "pinstripes" : "solid", number: [9, 10, 23, 3][i], view: "both", size: 80 })).join("");
  const turned = (S, T) => `<div style="display:flex;gap:6px;align-items:flex-end">${[-135, -90, -45, 0, 45, 90, 135, 180].map((yaw) => T.jerseyFrame({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Beaumont", yaw, size: 120 })).join("")}</div>`;
  await sheet("hero-desk-light", { width: 1280 }, hero);
  await sheet("hero-desk-dark", { width: 1280, scheme: "dark" }, hero);
  await sheet("phone-light", { width: 390, height: 844, phone: true }, phone);
  await sheet("phone-dark", { width: 390, height: 844, phone: true, scheme: "dark" }, phone);
  await sheet("turn-desk-light", { width: 1280 }, turned);
  await browser.close();
  console.log(`pictures written to ${out}`);
} finally {
  server.kill();
}
