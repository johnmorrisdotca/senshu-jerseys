// The demo's pages, made from demo/index.html and the family's shared head, header, footer and language chooser (family-template.mjs), and the embed frame. The Pages build (site.mjs) writes
// them into site/, and the dev server (dev.mjs) serves the same text, so the tests play the page that is published.
import { readFileSync } from "node:fs";

import { transformSync } from "esbuild";

import { WORDS } from "../demo/words.js";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "senshu-jerseys";
const TITLE = "Senshu Jerseys 選手: sports jerseys as SVG";
const DESCRIPTION = "Jerseys, sweaters, kits, caps, helmets and retired-number banners as SVG strings, front and back, with optional 2.5D turning and a custom element. Zero dependencies.";

/** A page's text with the family's blocks put in where its comments say. The page's words (both languages) are the table in demo/words.js. */
function withFamily(html, { title, description }) {
  return html
    .replace("<!--family:head-->", familyHead({ id, title, description }))
    .replace("<!--family:header-->", familyHeader({ id }))
    .replace("<!--family:unreviewed-->", familyUnreviewed({ id }))
    .replace("<!--family:footer-->", familyFooter({ id }))
    .replace(
      /<!--family:scripts ([\w.-]+)-->/,
      (_, script) => `<script>${FAMILY_SCRIPT}</script>\n<script>window.senshuLanguage = familyLanguage({ id: ${JSON.stringify(id)}, words: ${JSON.stringify(WORDS)}, onChange: function (lang) { window.dispatchEvent(new CustomEvent("senshu-language", { detail: lang })); } });</script>${script === "none" ? "" : `\n<script type="module" src="${script}"></script>`}`,
    );
}

/** demo/index.html, the playground. */
export function renderIndex() {
  return withFamily(readFileSync(new URL("../demo/index.html", import.meta.url), "utf8"), { title: TITLE, description: DESCRIPTION });
}

/** demo/judogi.html, the judogi designer. */
export function renderJudogi() {
  return withFamily(readFileSync(new URL("../demo/judogi.html", import.meta.url), "utf8"), {
    title: "Senshu Jerseys: judogi designer",
    description: "Jacket, trousers and belt as SVG. Contest white or blue, rank belts, named sizes, pieces or a worn suit.",
  });
}

/** demo/uniforms.html, every garment side by side. */
export function renderUniforms() {
  return withFamily(readFileSync(new URL("../demo/uniforms.html", import.meta.url), "utf8"), {
    title: "Senshu Jerseys: uniforms",
    description: "Every martial-arts garment side by side, each wearing a belt you choose: judogi and belts, turning in 3D.",
  });
}

/** demo/embed.html, the frame a page puts in an iframe: plain, no family blocks. */
export function renderEmbed() {
  return readFileSync(new URL("../demo/embed.html", import.meta.url), "utf8");
}

/** The family's background module as the plain JavaScript the demo's preview imports when a background is chosen (the module is TypeScript, copied from taisen-brackets into scripts/; the demo is the only thing that loads it). */
export function backgroundsModule() {
  return transformSync(readFileSync(new URL("family-backgrounds.ts", import.meta.url), "utf8"), { loader: "ts", format: "esm" }).code;
}
