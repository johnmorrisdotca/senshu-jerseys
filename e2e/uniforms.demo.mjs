import { expect, test } from "@playwright/test";

// The Uniforms page: every garment and belt is a picture tile, the chosen garment turns, every choice is in the address, and no control is left in the browser's own style.
const pick = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();
const yawOf = (page) => page.locator("#uni-stage canvas").getAttribute("data-yaw").then(Number);

test("the page loads, the large view is drawn and every tile has its picture", async ({ page }) => {
  test.slow();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const tiles = page.locator(".uni-tiles .judo-tile");
  expect(await tiles.count()).toBeGreaterThanOrEqual(2 + 9 + 20);
  await expect(page.locator('.uni-garments .judo-tile[data-value="judogi-white"]')).toBeVisible();
  await expect(page.locator('.uni-garments .judo-tile[data-value="judogi-blue"]')).toBeVisible();
  await expect.poll(() => page.locator(".uni-tiles .judo-tile:not([data-ready])").count(), { timeout: 90000 }).toBe(0);
  const blank = await page.evaluate(() => [...document.querySelectorAll(".uni-tiles img")].filter((i) => !i.complete || i.naturalWidth < 8).length);
  expect(blank).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors.filter((e) => !/GL Driver|ReadPixels/.test(e))).toEqual([]);
});

test("garment, belt, show, angle and zoom are kept in the address and survive a reload", async ({ page }) => {
  // The tiles are still being drawn one by one on a slow machine: give the clicks room.
  test.slow();
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await pick(page, "uni-garment", "judogi-blue");
  await pick(page, "uni-belt", "brown");
  await pick(page, "uni-belt-style", "tip-red-degrees-3");
  await page.locator('[data-testid="uni-yaw"]').fill("40");
  await expect(page).toHaveURL(/garment=judogi-blue/);
  await expect(page).toHaveURL(/belt=tip-red-degrees-3/);
  await expect(page).toHaveURL(/yaw=40/);
  await pick(page, "uni-show", "folded");
  await expect(page).toHaveURL(/show=folded/);
  await page.locator('[data-testid="uni-zoom-in"]').click();
  await expect(page).toHaveURL(/zoom=1\.4/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="uni-garment"] [data-value="judogi-blue"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="uni-belt-style"] [data-value="tip-red-degrees-3"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="uni-show"] [data-value="folded"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  expect(await yawOf(page)).toBe(40);
});

test("a choice keeps the angle, and it turns on its own with the button", async ({ page }) => {
  test.slow();
  await page.goto("/uniforms.html?yaw=60");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await pick(page, "uni-belt", "green");
  await expect(page.locator('[data-testid="uni-belt"] [data-value="green"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  expect(await yawOf(page)).toBe(60);
  const play = page.locator('[data-testid="uni-play"]');
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page)).not.toBe(60);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("no visible control is in the browser's own style, and each is a finger wide", async ({ page }) => {
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const bad = await page.evaluate(() => [...document.querySelectorAll(".judo-layout select, .judo-layout button, .judo-layout input:not([type=range])")]
    .filter((el) => !el.hidden && el.getBoundingClientRect().width > 0)
    .filter((el) => el.tagName === "SELECT" || el.tagName === "INPUT" || el.getBoundingClientRect().height < 47)
    .map((el) => el.id || el.dataset.value || el.className));
  expect(bad).toEqual([]);
  const buttons = await page.evaluate(() => [...document.querySelectorAll(".judo-layout button")].filter((el) => {
    const s = window.getComputedStyle(el);
    return s.borderRadius === "0px" && s.backgroundColor === "rgb(239, 239, 239)";
  }).length);
  expect(buttons).toBe(0);
});
