// Championship pennants and garden flags: honour, years and a caller logo; no league shield; hostile logos ignored.
import assert from "node:assert/strict";
import { test } from "node:test";

import { TITLE_BANNER_KINDS, renderTitleBanner, yearLines } from "../src/index.ts";

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#ff4c00"/></svg>`;
const oilers = { colors: ["#041e42", "#ff4c00", "#ffffff"] as const, title: "Stanley Cup", subtitle: "Champions", years: [1984, 1985, 1987, 1988, 1990], logo: mark };

test("year lines wrap past three years", () => {
  assert.deepEqual(yearLines([1984, 1985, 1987]), ["1984 1985 1987"]);
  assert.deepEqual(yearLines([1984, 1985, 1987, 1988, 1990]), ["1984 1985 1987", "1988 1990"]);
  assert.deepEqual(yearLines("1984 1985 1987 / 1988 1990"), ["1984 1985 1987", "1988 1990"]);
  assert.deepEqual(yearLines([]), []);
});

test("a pennant hangs from a rod with gold knobs, honour and years, no jersey number", () => {
  const svg = renderTitleBanner({ kind: "pennant", ...oilers, size: 180 });
  assert.match(svg, /^<svg /);
  assert.match(svg, /Championship banner, STANLEY CUP, CHAMPIONS, 1984 1985 1987, 1988 1990/);
  assert.match(svg, /<circle cx="32"/);
  assert.match(svg, /<circle cx="168"/);
  assert.match(svg, /<image href="data:image\/svg\+xml/);
  assert.doesNotMatch(svg, /<image href="javascript:/i);
  assert.doesNotMatch(svg, /\bNHL\b/);
});

test("a garden flag has a stars bar, city, club, honour and years, and no league shield", () => {
  const svg = renderTitleBanner({ kind: "garden", ...oilers, city: "Edmonton", club: "Oilers", size: 180 });
  assert.match(svg, /Championship banner, EDMONTON, OILERS, STANLEY CUP, CHAMPIONS/);
  assert.match(svg, /1988 1990/);
  assert.equal((svg.match(/<path d="M46 /g) ?? []).length, 1);
  assert.doesNotMatch(svg, /\bNHL\b/);
});

test("honour as one string splits before the last word", () => {
  const svg = renderTitleBanner({ honour: "Stanley Cup Champions", years: "1990" });
  assert.match(svg, /STANLEY CUP, CHAMPIONS, 1990/);
});

test("a hostile logo is ignored", () => {
  const svg = renderTitleBanner({ kind: "pennant", title: "Grey Cup", subtitle: "Champions", logo: `javascript:alert(1)` });
  assert.doesNotMatch(svg, /javascript:/i);
  assert.doesNotMatch(svg, /<image /);
  const broke = renderTitleBanner({ kind: "garden", logo: `"><script>alert(1)</script>` });
  assert.doesNotMatch(broke, /<script/i);
});

test("TITLE_BANNER_KINDS lists pennant and garden", () => {
  assert.deepEqual([...TITLE_BANNER_KINDS], ["pennant", "garden"]);
});
