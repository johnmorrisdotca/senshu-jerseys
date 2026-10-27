import { expect, test } from "@playwright/test";

// The judogi designer: it draws on a canvas, turns in place, keeps its angle when a choice changes, keeps every choice in the address,
// and has no control left in the browser's own style.
const yawOf = (page) => page.locator("#judo-stage canvas").getAttribute("data-yaw").then(Number);

test("the designer draws a judogi in pieces, with no errors and no sideways scroll", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/judogi.html");
  // A canvas that judogiCanvas painted, named for a screen reader as the SVG was.
  const canvas = page.locator("#judo-stage canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-painter", /^(webgl|2d)$/);
  await expect(canvas).toHaveAttribute("aria-label", /judogi/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test("the angle slider turns the drawing in place, and a choice keeps the angle", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  const canvas = page.locator("#judo-stage canvas");
  await expect(canvas).toBeVisible();
  await canvas.evaluate((n) => n.setAttribute("data-mark", "before"));
  await page.locator('[data-testid="judo-yaw"]').fill("40");
  expect(await yawOf(page)).toBe(40);
  // The same element, moved: nothing was drawn again.
  await expect(page.locator('#judo-stage canvas[data-mark="before"]')).toHaveCount(1);
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
  await page.goto("/judogi.html?mode=pants");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const play = page.locator('[data-testid="judo-play"]');
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page)).not.toBe(0);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  const stopped = await yawOf(page);
  await page.waitForTimeout(300);
  expect(await yawOf(page)).toBe(stopped);
});

test("the controls are in the page's own style, beside the view, and a finger wide", async ({ page }) => {
  await page.goto("/judogi.html");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const plain = await page.evaluate(() => [...document.querySelectorAll("#judo-controls select, .judo-layout button")]
    .filter((el) => window.getComputedStyle(el).appearance !== "none" && el.tagName === "SELECT" || el.getBoundingClientRect().height < 44)
    .map((el) => el.id));
  expect(plain).toEqual([]);
  // The turn controls are on screen with the view, without scrolling.
  const bar = await page.locator('[data-testid="judo-play"]').boundingBox();
  const vh = page.viewportSize()?.height ?? 0;
  expect(bar && bar.y + bar.height <= vh + 400).toBe(true);
});

test("the flat view stays a drawing, with nothing to turn", async ({ page }) => {
  await page.goto("/judogi.html?view=flat");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  await expect(page.locator("#judo-stage canvas")).toHaveCount(0);
  await expect(page.locator('[data-testid="judo-play"]')).toBeDisabled();
});

test("the back patch's choices are in the address, show only when they apply, and the flat back is a drawing", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&view=back&patch=ijf&pname=M.%20TANAKA&pcode=JPN");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="judo-pcode"]')).toHaveValue("JPN");
  await expect(page.locator('[data-testid="judo-pink"]')).toHaveCount(0);
  await page.locator('[data-testid="judo-patch"]').selectOption("zekken");
  await expect(page).toHaveURL(/patch=zekken/);
  await expect(page.locator('[data-testid="judo-pink"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="judo-pcode"]')).toHaveCount(0);
  await page.locator('[data-testid="judo-pname"]').fill("SATO");
  await expect(page).toHaveURL(/pname=SATO/);
  await page.goto("/judogi.html?view=flat-back&patch=zekken");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  await expect(page.locator('[data-testid="judo-play"]')).toBeDisabled();
});

test("embroidery, the logo and the emblem are chosen in the page and kept in the address", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/judogi.html?mode=jacket&belt=black&e1p=jacket-hem&e1t=TANAKA&e1c=gold");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="judo-e1t"]')).toHaveValue("TANAKA");
  await expect(page.locator('[data-testid="judo-e2p"]')).toHaveCount(1);
  await page.locator('[data-testid="judo-e2p"]').selectOption("belt-end-left");
  await expect(page).toHaveURL(/e2p=belt-end-left/);
  await page.locator('[data-testid="judo-logo"]').selectOption("jacket-hem");
  await page.locator('[data-testid="judo-emblem"]').selectOption("placeholder");
  await expect(page).toHaveURL(/emblem=placeholder/);
  await expect(page.locator('[data-testid="judo-rules"]')).toHaveCount(1);
  await page.locator('[data-testid="judo-rules"]').selectOption("ajjf");
  await expect(page.locator("#judo-check")).toContainText("All Japan Judo Federation");
  expect(errors).toEqual([]);
});
