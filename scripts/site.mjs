// Builds the static demo for GitHub Pages into ./site: the page (made by page.mjs from the family's shared header and footer), the embed frame, its scripts and styles, and the compiled library beside them.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { buildSync } from "esbuild";

import { publishThumbnails, thumbnailHead } from "./family-thumbnail.mjs";
import { backgroundsModule, renderEmbed, renderIndex, renderJudogi, renderUniforms } from "./page.mjs";

/** What the family's card shows (scripts/screenshots.mjs makes it): the words of og:image:alt and of the README's top picture. */
const ALT = "Senshu Jerseys: a soccer shirt in stripes, a baseball jersey in pinstripes, a hockey sweater from the back with its name and number, a basketball jersey and a cap, drawn as SVG.";

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true, filter: (from) => !/\.d\.ts$/.test(from) });
// The declarations are for editors, not for a browser.
cpSync("dist", "site/dist", { recursive: true, filter: (from) => !/\.d\.ts$/.test(from) });
// The shared view controls (a dev dependency, used only by the demo) are served beside the pages.
cpSync("node_modules/@johnmorrisdotca/kazoku-ui/dist", "site/kazoku-ui", { recursive: true, dereference: true, filter: (from) => !/\.d\.ts$/.test(from) });
// The family header's language picker and theme switch as one small module, for the documentation site's pages (scripts/docs-site.mjs loads /kazoku-parts.js).
buildSync({ stdin: { contents: 'import "@johnmorrisdotca/kazoku-ui/language-picker/define";\nimport "@johnmorrisdotca/kazoku-ui/theme-switch/define";\n', resolveDir: process.cwd() }, outfile: "site/kazoku-parts.js", bundle: true, format: "esm", minify: true, logLevel: "silent" });
// The demo's page carries the family's card in its <head> (og:image, twitter:image, the icon); the three pictures are published beside it.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
writeFileSync("site/index.html", renderIndex().replace("</head>", `  ${thumbnailHead(pkg, { alt: ALT })}\n</head>`));
publishThumbnails(".", "site");
writeFileSync("site/judogi.html", renderJudogi());
writeFileSync("site/uniforms.html", renderUniforms());
writeFileSync("site/embed.html", renderEmbed());
writeFileSync("site/family-backgrounds.js", backgroundsModule());
console.log("site/ is ready");
