// family.test.ts: what this package holds the same way as every package of the family: the shared template and the README writer, the one list of the family, and the README
// block written from it. Changing a shared file means changing it in every repository at once, with the new hash recorded here.
//
// THIS COPY OF THE TEMPLATE IS AHEAD OF THE FAMILY'S. It is the template of 2026-10-15b (Dougu Sports' copy) with exactly three lines added for this package: its row in FAMILY,
// its line in FAMILY_PITCH, and its id in FAMILY_NOT_ON_NPM (it comes out the day the package is published). The family-wide pass that adds Senshu Jerseys to every repository
// replaces this hash with the one it records.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

interface Template {
  FAMILY: { id: string; name: string; kana: string }[];
  FAMILY_PITCH: Record<string, string>;
  FAMILY_NOT_ON_NPM: string[];
  FAMILY_TEMPLATE_VERSION: string;
  familyHeader(options: { id: string }): string;
  familyFooter(options: { id: string }): string;
}
interface Writer {
  familyBlockOf(readme: string): string | null;
  familyReadmeBlock(id: string): string;
}
const template = (await import(new URL("../scripts/family-template.mjs", import.meta.url).href)) as Template;
const writer = (await import(new URL("../scripts/family-readme.mjs", import.meta.url).href)) as Writer;

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const pkg = JSON.parse(read("package.json")) as { name: string };
const id = pkg.name.replace(/^@[^/]+\//, "");

// The template of 2026-10-15b, with Dougu Sports (already in the copy it comes from) and Senshu Jerseys added, lists twenty-eight packages.
const TEMPLATE = { version: "2026-10-15b", sha256: "61a94e82145dc12e334bd826c3f7659fe5a305aff7d7314f030846bf27c58ece" };
const WRITER_SHA256 = "6752eaa287a9007af87d9019e4cee4c36fe1d79b60bf24478e7851ebe75138c4";

test("the family template is the one file, byte for byte, as recorded", () => {
  assert.equal(template.FAMILY_TEMPLATE_VERSION, TEMPLATE.version);
  assert.equal(sha("scripts/family-template.mjs"), TEMPLATE.sha256);
  assert.equal(sha("scripts/family-readme.mjs"), WRITER_SHA256);
});

test("it lists every package of the family, in order, each with its Japanese name and a line on it", () => {
  assert.deepEqual(
    template.FAMILY.map((one) => one.id),
    [
      "korokoro", "kyuubu", "hitotsu", "toranpu", "tane", "narabe", "tenka", "kumimoji", "tsunagi", "jarajara",
      "suido", "domino", "kotoba", "sugoroku", "kazu", "meikyuu", "hikidashi", "chizu", "bushu", "tobiishi", "jirai", "gunjin", "karakuri", "houseki", "kyogijo-stadiums", "taisen-brackets", "dougu-sports", "senshu-jerseys",
    ],
  );
  for (const one of template.FAMILY) {
    const slug = one.name.toLowerCase().replaceAll(" ", "-");
    assert.ok(one.id === slug || one.id.startsWith(`${slug}-`), one.id);
    assert.match(one.kana, /\S/, one.id);
    assert.match(template.FAMILY_PITCH[one.id] ?? "", /^[^A-Z.].*[^.]$/, one.id);
  }
  assert.deepEqual(Object.keys(template.FAMILY_PITCH).sort(), template.FAMILY.map((one) => one.id).sort());
  assert.ok(template.FAMILY.some((one) => one.id === id));
});

test("this package is not on npm yet: the header has no npm pill and the footer says so (take it out of FAMILY_NOT_ON_NPM the day it is published)", () => {
  assert.ok(template.FAMILY_NOT_ON_NPM.includes(id));
  assert.ok(!template.familyHeader({ id }).includes("npmjs.com"));
  assert.ok(template.familyFooter({ id }).includes("Not on npm yet"));
});

test("the demo page is made with the family's header and footer", () => {
  const page = read("scripts/page.mjs");
  for (const call of ["familyHead(", "familyHeader(", "familyFooter(", "familyUnreviewed(", "FAMILY_SCRIPT"]) assert.ok(page.includes(call), call);
  const html = read("demo/index.html");
  for (const marker of ["family:head", "family:header", "family:unreviewed", "family:footer", "family:scripts"]) assert.ok(html.includes(`<!--${marker}`), marker);
});

test("the README's family is the block scripts/family-readme.mjs writes from the template, under a heading of its own, naming every package once", () => {
  const readme = read("README.md");
  const block = writer.familyBlockOf(readme);
  assert.notEqual(block, null, "README.md has no family markers");
  assert.equal(block, writer.familyReadmeBlock(id));
  assert.equal(readme.split("<!-- family:start").length - 1, 1);
  assert.match(readme, /\n#{2,3} The family\n+<!-- family:start/);
  for (const one of template.FAMILY) assert.equal((block ?? "").split(`](https://github.com/johnmorrisdotca/${one.id})`).length - 1, 1, one.id);
});
