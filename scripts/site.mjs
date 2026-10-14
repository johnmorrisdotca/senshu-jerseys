// Builds the static demo for GitHub Pages into ./site: the page (made by page.mjs from the family's shared header and footer), the embed frame, its scripts and styles, and the compiled library beside them.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { renderEmbed, renderIndex } from "./page.mjs";

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true, filter: (from) => !/\.d\.ts$/.test(from) });
// The declarations are for editors, not for a browser.
cpSync("dist", "site/dist", { recursive: true, filter: (from) => !/\.d\.ts$/.test(from) });
writeFileSync("site/index.html", renderIndex());
writeFileSync("site/embed.html", renderEmbed());
console.log("site/ is ready");
