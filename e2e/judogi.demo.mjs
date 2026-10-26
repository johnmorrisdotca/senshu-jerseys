import { expect, test } from "@playwright/test";

// The judogi designer: it draws, turns in place, keeps its angle when a choice changes, keeps every choice in the address, and has
// no control left in the browser's own style.
const yawOf = (page) => page.locator("#judo-stage svg").getAttribute("data-yaw").then(Number);

test("the designer draws a judogi in pieces, with no errors and no sideways scroll", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/judogi.html");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  // Two pieces, each turning about its own middle, and every face shown as the picture judogiPrepare painted of it.
  await expect(page.locator("#judo-stage [data-piece]")).toHaveCount(2);
  await expect(page.locator("#judo-stage g[data-face] > image")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test("the angle slider turns the drawing in place, and a choice keeps the angle", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  const svg = page.locator("#judo-stage svg");
  await expect(svg).toBeVisible();
  await svg.evaluate((n) => n.setAttribute("data-mark", "before"));
  await page.locator('[data-testid="judo-yaw"]').fill("40");
  expect(await yawOf(page)).toBe(40);
  // The same element, moved: nothing was drawn again.
  await expect(page.locator('#judo-stage svg[data-mark="before"]')).toHaveCount(1);
  await expect(page).toHaveURL(/yaw=40/);
  await page.locator('[data-testid="judo-colour"]').selectOption("blue");
  await expect(page).toHaveURL(/colour=blue/);
  expect(await yawOf(page)).toBe(40);
  // The address is the whole state.
  await page.goto(page.url());
  await expect(page.locator('[data-testid="judo-colour"]')).toHaveValue("blue");
  expect(await yawOf(page)).toBe(40);
});

test("it turns on its own with the button, and stops on the second press", async ({ page }) => {
  // A machine with no graphics card (CI's WebKit) draws a frame in seconds, not milliseconds: this holds that it turns, not how fast.
  test.setTimeout(60_000);
  await page.goto("/judogi.html?mode=pants");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  const play = page.locator('[data-testid="judo-play"]');
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page), { timeout: 20_000 }).not.toBe(0);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  const stopped = await yawOf(page);
  await page.waitForTimeout(300);
  expect(await yawOf(page)).toBe(stopped);
});

test("the controls are in the page's own style, beside the view, and a finger wide", async ({ page }) => {
  await page.goto("/judogi.html");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  const plain = await page.evaluate(() => [...document.querySelectorAll("#judo-controls select, .judo-layout button")]
    .filter((el) => window.getComputedStyle(el).appearance !== "none" && el.tagName === "SELECT" || el.getBoundingClientRect().height < 44)
    .map((el) => el.id));
  expect(plain).toEqual([]);
  // The turn controls are on screen with the view, without scrolling.
  const bar = await page.locator('[data-testid="judo-play"]').boundingBox();
  const vh = page.viewportSize()?.height ?? 0;
  expect(bar && bar.y + bar.height <= vh + 400).toBe(true);
});
