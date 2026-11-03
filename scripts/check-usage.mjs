// Every way of using the package that the guides and the README show, run against the package as npm packs it: the files in examples/ are copied beside a copy of the
// packed package (.usage/node_modules/@johnmorrisdotca/senshu-jerseys) and each one is built, type-checked or run, and the ones with a page are opened in a browser,
// which must show a jersey. The guides must hold these files' text, word for word, so what a reader copies is what was tested.
// `pnpm test:usage` (builds the package and the site first). One browser, one page at a time.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, join, relative } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { build as esbuild } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (...parts) => join(root, ...parts);
const usage = at(".usage");
const NAME = "@johnmorrisdotca/senshu-jerseys";
const require = createRequire(import.meta.url);

/** Run a program and, if it fails, say what it printed. */
const sh = (program, args, cwd) => {
  try {
    return execFileSync(program, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    throw new Error(`${program} ${args.join(" ")} failed:\n${error.stdout ?? ""}${error.stderr ?? ""}`);
  }
};

const only = process.argv.slice(2);
const results = [];
const failures = [];
const step = async (name, run) => {
  if (only.length > 0 && !only.includes(name)) return;
  const started = Date.now();
  try {
    await run();
    results.push(`ok   ${name} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
    results.push(`FAIL ${name}`);
  }
  console.log(results[results.length - 1]);
};

// 1. The package as npm packs it, installed beside the examples.
rmSync(usage, { recursive: true, force: true });
mkdirSync(usage, { recursive: true });
const packed = JSON.parse(execFileSync("npm", ["pack", "--json", "--pack-destination", usage], { cwd: root, encoding: "utf8" }));
const installed = join(usage, "node_modules", "@johnmorrisdotca", "senshu-jerseys");
mkdirSync(installed, { recursive: true });
execFileSync("tar", ["-xzf", join(usage, packed[0].filename), "-C", installed, "--strip-components=1"]);
cpSync(at("examples"), join(usage, "examples"), { recursive: true });
const examples = (name) => join(usage, "examples", name);

// 2. A page that is a folder of built files, served to the browser without a port.
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp" };
const serve = async (page, origin, folder, prefix = "") => {
  await page.route(`${origin}${prefix}/**`, (route) => {
    const pathname = new URL(route.request().url()).pathname.slice(prefix.length);
    const file = join(folder, decodeURIComponent(pathname.endsWith("/") ? `${pathname}index.html` : pathname));
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? "application/octet-stream" });
  });
};

const opened = async (browser, run) => {
  const context = await browser.newContext({ viewport: { width: 800, height: 700 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  try {
    await run(page, errors);
  } finally {
    await context.close();
  }
  if (errors.length > 0) throw new Error(`the page reported errors:\n${errors.join("\n")}`);
};

/** The jersey is drawn: an <svg> with its paths in the element's shadow root (or, for the plain string, in the page). */
const seesJersey = async (page, selector = "senshu-jersey") => {
  await page.locator(selector).first().waitFor({ state: "attached", timeout: 20_000 });
  await page.waitForFunction((css) => (document.querySelector(css)?.shadowRoot?.querySelectorAll("svg path").length ?? 0) > 20, selector, { timeout: 20_000 });
};

/** A CDN's answer for a file of the package: jsDelivr and unpkg both serve it as it is. */
const cdnAnswer = (pathname) => {
  const own = /^\/(?:npm\/)?@johnmorrisdotca\/senshu-jerseys(?:@[^/]+)?\/(.+)$/.exec(pathname);
  const file = own ? join(installed, own[1]) : "";
  return file !== "" && existsSync(file) ? readFileSync(file, "utf8") : null;
};

const pageOf = (file) => readFileSync(file, "utf8");
const browser = await chromium.launch();

await step("node", () => {
  const out = execFileSync(process.execPath, [join(examples("node"), "server.mjs")], { cwd: usage, encoding: "utf8" }).trim();
  if (out !== "true true true") throw new Error(`unexpected output: ${out}`);
});

await step("typescript", () => {
  writeFileSync(join(examples("typescript"), "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "esnext", moduleResolution: "bundler", strict: true, noEmit: true, lib: ["es2023", "dom", "dom.iterable"], types: [], skipLibCheck: true }, include: ["index.ts"] }));
  sh(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", join(examples("typescript"), "tsconfig.json")], usage);
  // The same file, run: types are erased, so it is plain JavaScript to Node.
  const run = execFileSync(process.execPath, [join(examples("typescript"), "index.ts")], { cwd: usage, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (!/^true /.test(run)) throw new Error(`unexpected output: ${run}`);
});

for (const [name, host, file] of [["cdn-jsdelivr", "https://cdn.jsdelivr.net/**", "cdn-jsdelivr.html"], ["cdn-unpkg", "https://unpkg.com/**", "cdn-unpkg.html"]]) {
  await step(name, async () => {
    await opened(browser, async (page) => {
      await page.route(host, (route) => {
        const body = cdnAnswer(new URL(route.request().url()).pathname);
        return body === null ? route.fulfill({ status: 404, body: "" }) : route.fulfill({ body, contentType: "text/javascript" });
      });
      await page.route("https://page.test/**", (route) => route.fulfill({ body: pageOf(join(examples(""), file)), contentType: "text/html" }));
      await page.goto("https://page.test/");
      await seesJersey(page);
      if ((await page.locator("senshu-jersey").getAttribute("cut")) !== "hockey") throw new Error("the element lost its attributes");
    });
  });
}

await step("iframe", async () => {
  if (!existsSync(at("site", "embed.html"))) throw new Error("site/ is not built: `pnpm test:usage` builds it");
  await opened(browser, async (page) => {
    await serve(page, "https://johnmorrisdotca.github.io", at("site"), "/senshu-jerseys");
    await page.route("https://page.test/**", (route) => route.fulfill({ body: pageOf(join(examples(""), "iframe.html")), contentType: "text/html" }));
    await page.goto("https://page.test/");
    const frame = page.frameLocator("iframe");
    await frame.locator("#frame svg").first().waitFor({ timeout: 20_000 });
    if ((await frame.locator("#frame svg").count()) < 1) throw new Error("the embed drew nothing");
  });
});

// The bundlers and frameworks: built, then opened.
const { build: viteBuild } = await import("vite");
const viteApp = async (name, plugins = [], ready = async (page) => seesJersey(page)) => {
  const out = join(usage, "out", name);
  await viteBuild({ root: examples(name), plugins, logLevel: "warn", build: { outDir: out, emptyOutDir: true }, base: "./", configFile: false });
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await ready(page);
  });
};

await step("vite", () =>
  viteApp("vite", [], async (page) => {
    await seesJersey(page);
    await page.locator("#plain svg").waitFor({ timeout: 20_000 });
  }),
);
await step("react", () => viteApp("react"));
await step("vue", async () => viteApp("vue", [(await import("@vitejs/plugin-vue")).default()]));
await step("svelte", async () => viteApp("svelte", [(await import("@sveltejs/vite-plugin-svelte")).svelte()]));

await step("react-ssr", async () => {
  const script = join(usage, "ssr-react.tsx");
  writeFileSync(script, `import { renderToString } from "react-dom/server";\nimport { SenshuJersey } from "./examples/react/SenshuJersey";\nconst html = renderToString(<SenshuJersey />);\nif (!html.includes("<senshu-jersey")) throw new Error("no element in " + html);\nconsole.log(html);\n`);
  const out = join(usage, "ssr-react.mjs");
  await esbuild({ entryPoints: [script], outfile: out, bundle: true, platform: "node", format: "esm", jsx: "automatic", absWorkingDir: root, logLevel: "silent", external: ["react", "react-dom"], splitting: false });
  const html = execFileSync(process.execPath, [out], { cwd: root, encoding: "utf8" });
  if (!html.includes('cut="hockey"')) throw new Error(`the server render lost the attributes: ${html}`);
});

await step("webpack", async () => {
  const { default: webpack } = await import("webpack");
  const dir = examples("webpack");
  const config = (await import(pathToFileURL(join(dir, "webpack.config.mjs")).href)).default;
  const stats = await new Promise((resolve, reject) => {
    webpack({ ...config, context: dir, output: { ...config.output, path: join(usage, "out", "webpack") } }, (error, result) => (error || !result ? reject(error ?? new Error("no result")) : resolve(result)));
  });
  if (stats.hasErrors()) throw new Error(stats.toString({ colors: false, errors: true }));
  const out = join(usage, "out", "webpack");
  writeFileSync(join(out, "index.html"), `<!doctype html><html><body><script src="main.js"></script></body></html>`);
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await seesJersey(page);
  });
});

await step("angular", async () => {
  const dir = examples("angular");
  const out = join(usage, "out", "angular");
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "esnext", experimentalDecorators: true, useDefineForClassFields: false } }));
  await esbuild({ entryPoints: [join(dir, "main.ts")], outdir: out, bundle: true, splitting: true, format: "esm", tsconfig: join(dir, "tsconfig.json"), absWorkingDir: root, logLevel: "silent", minify: true });
  writeFileSync(join(out, "index.html"), readFileSync(join(dir, "index.html")));
  await opened(browser, async (page) => {
    await serve(page, "https://app.test", out);
    await page.goto("https://app.test/");
    await seesJersey(page);
  });
});

await browser.close();

// 3. The guides hold what was tested, word for word.
const everything = only.length === 0;
const FILES = {
  "cdn-jsdelivr.html": ["docs/guides/html-and-cdn.md", "docs/guides/ja/html-and-cdn.md"],
  "cdn-unpkg.html": ["docs/guides/html-and-cdn.md", "docs/guides/ja/html-and-cdn.md"],
  "iframe.html": ["docs/guides/embed-in-an-iframe.md", "docs/guides/ja/embed-in-an-iframe.md"],
  "vite/main.ts": ["docs/guides/bundlers.md", "docs/guides/ja/bundlers.md"],
  "vite/index.html": ["docs/guides/bundlers.md", "docs/guides/ja/bundlers.md"],
  "webpack/src/index.js": ["docs/guides/bundlers.md", "docs/guides/ja/bundlers.md"],
  "webpack/webpack.config.mjs": ["docs/guides/bundlers.md", "docs/guides/ja/bundlers.md"],
  "react/SenshuJersey.tsx": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "react/senshu-jersey.d.ts": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "vue/JerseyView.vue": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "vue/main.ts": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "svelte/SenshuJersey.svelte": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "angular/senshu-jersey.component.ts": ["docs/guides/frameworks.md", "docs/guides/ja/frameworks.md"],
  "typescript/index.ts": ["docs/guides/typescript-and-node.md", "docs/guides/ja/typescript-and-node.md"],
  "node/server.mjs": ["docs/guides/typescript-and-node.md", "docs/guides/ja/typescript-and-node.md"],
};
const normal = (text) => text.replace(/\r\n/g, "\n").trim();
for (const [file, places] of everything ? Object.entries(FILES) : []) {
  const code = normal(readFileSync(at("examples", file), "utf8"));
  for (const place of places) {
    if (!normal(readFileSync(at(place), "utf8")).includes(code)) failures.push(`${place} does not hold examples/${file} word for word`);
  }
}
const unlisted = (folder) => readdirSync(at("examples", folder), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? unlisted(join(folder, entry.name)) : [relative("", join(folder, entry.name)).split("\\").join("/")]));
const known = new Set([...Object.keys(FILES), "angular/index.html", "angular/main.ts", "react/index.html", "react/main.tsx", "svelte/index.html", "svelte/main.ts", "vue/index.html"]);
for (const file of everything ? unlisted("") : []) if (!known.has(file)) failures.push(`examples/${file} is not listed in scripts/check-usage.mjs: say where the guides show it`);

console.log(failures.length === 0 ? `\nusage ok: ${results.length} ways to use ${NAME}` : `\n${failures.length} failure${failures.length === 1 ? "" : "s"}:\n- ${failures.join("\n- ")}`);
if (failures.length > 0) process.exit(1);
