// Packs the package the way it is published (`npm pack`), installs the tarball into an empty project, and uses it as somebody who installed it would: every entry in `exports`
// imported (a wildcard entry once for each module of its folder), a jersey drawn that must equal the one this checkout draws, the turn and the element's class loaded. Then it
// bundles ONE item from the installed package with esbuild, as a page that wants only a banner would, and holds the result small. A package whose `exports` name a file that is not
// in the tarball fails here, before it is published. `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "senshu-package-"));

function run(command, args, cwd, viaShell = false) {
  const shell = viaShell && windows;
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
const shipped = [...inTarball].filter((file) => file.startsWith("docs/") || file.startsWith("demo/") || /\.(webp|png|jpe?g|gif)$/.test(file));
if (shipped.length > 0) {
  console.error(`FAIL the tarball holds the demo, docs or pictures: ${shipped.join(", ")}`);
  process.exit(1);
}
console.log("ok   no demo, doc or picture is in the tarball");

// 2. Everything package.json points at is in the tarball.
const expand = (file) => {
  if (!file.includes("*")) return [file];
  const [before, after] = file.replace(/^\.\//, "").split("*");
  return [...inTarball].filter((path) => path.startsWith(before) && path.endsWith(after));
};
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))].flatMap(expand);
for (const file of new Set(pointed)) {
  if (!inTarball.has(file.replace(/^\.\//, ""))) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);
for (const named of pkg.files) {
  if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) {
    console.error(`FAIL package.json's files names ${named}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   everything in package.json's files is in the tarball (${pkg.files.length})`);
if (Object.keys(pkg.dependencies ?? {}).length > 0) {
  console.error("FAIL the package has runtime dependencies; it is dependency-free");
  process.exit(1);
}
console.log("ok   no runtime dependencies");

// 3. Install it into an empty project.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball], project, true);
console.log("ok   npm install of the tarball");

// What the built package in this checkout makes: the installed one must make the same.
const local = await import(new URL("../dist/index.js", import.meta.url).href);
const localTurn = await import(new URL("../dist/turn-entry.js", import.meta.url).href);
const jersey = local.renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Morris", view: "both" });
const banner = local.renderBanner({ shape: "shield", number: 9, name: "Morris", years: "1948-1963", sweater: true });
const frame = localTurn.jerseyFrame({ cut: "soccer", number: 10, yaw: 140 });

// 4. Every entry in `exports`, by ESM; a wildcard entry once for each module in its folder.
const entries = [];
for (const key of Object.keys(pkg.exports)) {
  if (!key.includes("*")) {
    entries.push(key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`);
    continue;
  }
  const folder = pkg.exports[key].import.replace(/^\.\//, "").replace(/\*\.js$/, "");
  const names = [...inTarball].filter((path) => path.startsWith(folder) && path.endsWith(".js")).map((path) => path.slice(folder.length, -3));
  for (const name of names) entries.push(`${pkg.name}/${key.slice(2).replace("*", name)}`);
}
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
all.forEach((m, i) => { if (Object.keys(m).length === 0 && !names[i].endsWith("/define")) throw new Error(names[i] + " exports nothing"); });
const { renderJersey, renderBanner, VERSION } = m0;
if (renderJersey({ cut: "hockey", colors: ["#af1e2d", "#ffffff", "#192168"], number: 9, name: "Morris", view: "both" }) !== ${JSON.stringify(jersey)}) throw new Error("the installed package drew another jersey");
if (renderBanner({ shape: "shield", number: 9, name: "Morris", years: "1948-1963", sweater: true }) !== ${JSON.stringify(banner)}) throw new Error("the installed package drew another banner");
if (VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + VERSION);
const byName = Object.fromEntries(names.map((name, i) => [name, all[i]]));
if (byName[${JSON.stringify(`${pkg.name}/turn`)}].jerseyFrame({ cut: "soccer", number: 10, yaw: 140 }) !== ${JSON.stringify(frame)}) throw new Error("the installed package turned the jersey another way");
if (typeof byName[${JSON.stringify(`${pkg.name}/element`)}].SenshuJersey !== "function") throw new Error("the element's class is missing");
console.log(names.length + " entries");
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);

// 5. A page that wants one banner: esbuild bundles the installed package's one function; the turn, the element and the presets stay out.
const { build } = await import("esbuild");
const bundle = async (source) => {
  const out = await build({ stdin: { contents: source, resolveDir: project, loader: "js" }, bundle: true, minify: true, format: "esm", write: false, logLevel: "silent" });
  const text = out.outputFiles[0].text;
  return { text, gzip: gzipSync(text).length };
};
const cap = await bundle(`import { renderCap } from ${JSON.stringify(pkg.name)}; console.log(renderCap({ initials: "HC" }));`);
if (cap.text.includes("bindTurn") || cap.text.includes("SenshuJersey") || cap.text.includes("senshu-jersey")) {
  console.error("FAIL the bundle of the cap alone holds the turn or the element");
  process.exit(1);
}
if (cap.gzip > 7 * 1024) {
  console.error(`FAIL the cap alone bundles to ${cap.gzip} bytes gzipped, over 7 kB`);
  process.exit(1);
}
console.log(`ok   one cap, bundled from the installed package: ${cap.text.length} bytes, ${cap.gzip} gzipped`);
const jerseyOnly = await bundle(`import { renderJersey } from ${JSON.stringify(pkg.name)}; console.log(renderJersey({ number: 9 }));`);
if (jerseyOnly.text.includes("bindTurn") || jerseyOnly.text.includes("customElements")) {
  console.error("FAIL the bundle of renderJersey alone holds the turn or the element");
  process.exit(1);
}
console.log(`ok   one jersey, bundled from the installed package: ${jerseyOnly.text.length} bytes, ${jerseyOnly.gzip} gzipped`);
console.log(`ok   ${packed[0].files.length} files, ${(packed[0].size / 1024).toFixed(0)} kB packed, ${(packed[0].unpackedSize / 1024).toFixed(0)} kB unpacked`);
