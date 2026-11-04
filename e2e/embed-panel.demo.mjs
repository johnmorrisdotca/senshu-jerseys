// "Put it in your page" is the family's <kazoku-embed-panel>, on the index page and on the builder. Nothing the old panels had is gone, and a test counts it: the five tabs (Element, Iframe, JavaScript, SVG,
// Data URI), a note for each, Turnable, Copy, Download SVG; and the panel adds React, Vue, Angular and Svelte, a size, the picture beside the code, the embed page, the docs and the credit.
import { expect, test } from "@playwright/test";

const PANEL = "#embed-panel";

test("the index panel keeps the five ways with a note each, Turnable, Copy and Download, and adds the frameworks, a size, the picture, the links and the credit", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9");
  const panel = page.locator(PANEL);
  await expect(panel.locator('[role="tab"]')).toHaveText(["HTML", "ES module", "React", "Vue", "Angular", "Svelte", "iframe", "SVG", "Data URI"]);
  await expect(panel.locator('[part="size-button"]')).toHaveText(["160", "200", "320", "480"]);
  await expect(panel.locator('[part="size-button"][aria-pressed="true"]')).toHaveText("200");
  await expect(panel.locator('[part="preview"] svg')).toHaveCount(1);
  const picture = await panel.locator('[part="preview"] svg').boundingBox();
  expect(picture.width).toBeGreaterThan(100);
  await expect(panel.locator('[part="copy"]')).toHaveText("Copy code");
  await expect(panel.locator('[part="open"]')).toHaveText("Open the embed page");
  await expect(panel.locator('[part="open"]')).toHaveAttribute("href", /^embed\.html\?cut=hockey/);
  await expect(panel.locator('[part="docs"]')).toHaveText("Read the docs");
  await expect(panel.locator('[part="credits"]')).toContainText("Senshu Jerseys");
  const code = panel.locator('[part="code"]');
  const note = panel.locator('[part="note"]');
  const ways = [
    ["html", "<senshu-jersey", "A standard custom element"],
    ["iframe", "embed.html?", "For a page that cannot run scripts"],
    ["module", "renderJersey(", "Import the package from npm or a CDN"],
    ["svg", "<svg", "The finished drawing as one file"],
    ["data", "data:image/svg+xml", "as an address for an image"],
    ["react", "useEffect", "for a page built with a framework"],
    ["vue", "onMounted", "for a page built with a framework"],
    ["angular", "CUSTOM_ELEMENTS_SCHEMA", "for a page built with a framework"],
    ["svelte", "onMount", "for a page built with a framework"],
  ];
  for (const [kind, needle, words] of ways) {
    await panel.locator(`button[data-kind="${kind}"]`).click();
    await expect(code, kind).toContainText(needle);
    await expect(note, kind).toContainText(words);
  }
  await expect(page).toHaveURL(/et=svelte/);
});

test("Turnable adds turnable to the tag, the frame and the framework tabs, and Download shows on the SVG tab only", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9");
  const panel = page.locator(PANEL);
  const code = panel.locator('[part="code"]');
  const turnable = page.locator("#embed-turnable");
  await expect(turnable).toHaveText("Turnable");
  await expect(code).not.toContainText("turnable");
  await turnable.click();
  await expect(code).toContainText("turnable");
  await panel.locator('button[data-kind="iframe"]').click();
  await expect(code).toContainText("turn=1");
  await panel.locator('button[data-kind="react"]').click();
  await expect(code).toContainText("turnable");
  await panel.locator('button[data-kind="svg"]').click();
  await expect(turnable).toBeHidden();
  await expect(page.locator("#embed-download")).toBeVisible();
  await expect(page.locator("#embed-download")).toHaveText("Download SVG");
  await panel.locator('button[data-kind="html"]').click();
  await expect(page.locator("#embed-download")).toBeHidden();
});

test("a size is in the code when it is not the drawing's own 200, and the address keeps it", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9");
  const panel = page.locator(PANEL);
  await expect(panel.locator('[part="code"]')).not.toContainText('size="');
  await panel.locator('[part="size-button"]', { hasText: "320" }).click();
  await expect(panel.locator('[part="code"]')).toContainText('size="320"');
  await expect(page).toHaveURL(/es=320/);
});

test("the builder keeps its five tabs and Copy, and adds the frameworks, the docs and the credit", async ({ page }) => {
  await page.goto("/builder.html");
  await page.waitForSelector('body[data-ready="true"]');
  const panel = page.locator(PANEL);
  await expect(panel.locator('[role="tab"]')).toHaveText(["HTML", "ES module", "React", "Vue", "Angular", "Svelte", "iframe", "SVG", "Data URI"]);
  await expect(panel.locator('[part="copy"]')).toHaveText("Copy code");
  await expect(panel.locator('[part="docs"]')).toHaveText("Read the docs");
  await expect(panel.locator('[part="open"]')).toHaveText("Open the embed page");
  await expect(panel.locator('[part="credits"]')).toContainText("Senshu Jerseys");
});

test("the page stays still when it opens and when the language changes, whatever the panel draws", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "日本語", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
