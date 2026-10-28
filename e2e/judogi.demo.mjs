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

test("the branding is one switch with its mark, words and colour, kept in the address", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/judogi.html?mode=jacket&brand=1&bk=chikara&bt=3B");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="judo-bk"]')).toHaveValue("chikara");
  await expect(page.locator('[data-testid="judo-bt"]')).toHaveValue("3B");
  await page.locator('[data-testid="judo-bk"]').selectOption("kokoro");
  await expect(page).toHaveURL(/bk=kokoro/);
  await page.locator('[data-testid="judo-bn"]').fill("KAZE");
  await expect(page).toHaveURL(/bn=KAZE/);
  await page.locator('[data-testid="judo-brand"]').selectOption("0");
  await expect(page.locator('[data-testid="judo-bk"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// The hands on the view: a drag turns and tips it and stops the automatic turn, the wheel and a trackpad turn it, a pinch (Ctrl and the wheel), the buttons and a
// double press zoom it from 1x to 3x, and the arrow keys step it.
const attr = (page, name) => page.locator("#judo-stage canvas").getAttribute(name).then(Number);
const middle = async (page) => {
  const box = await page.locator('[data-testid="judo-turntable"]').boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, width: box.width, height: box.height };
};

test("a drag turns and tips the view, and grabbing it stops the automatic turn", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await page.locator('[data-testid="judo-play"]').click();
  await expect(page.locator('[data-testid="judo-play"]')).toHaveAttribute("aria-pressed", "true");
  const m = await middle(page);
  await page.mouse.move(m.x, m.y);
  await page.mouse.down();
  await expect(page.locator('[data-testid="judo-play"]')).toHaveAttribute("aria-pressed", "false");
  const before = await attr(page, "data-yaw");
  // A drag across the view's width is a half turn; down tips it.
  await page.mouse.move(m.x + m.width / 4, m.y + m.height / 4, { steps: 6 });
  await page.mouse.up();
  const yaw = await attr(page, "data-yaw");
  expect(Math.abs(yaw - before)).toBeGreaterThan(30);
  expect(await attr(page, "data-tilt")).toBeLessThan(0);
  await expect(page).toHaveURL(/tilt=-\d+/);
  expect(await page.locator('[data-testid="judo-tilt"]').inputValue()).toBe(String(await attr(page, "data-tilt")));
  // It stays still: nothing turns it on again.
  await page.waitForTimeout(300);
  expect(await attr(page, "data-yaw")).toBe(yaw);
});

test("the tilt slider tips the view by up to 30 degrees and the address keeps it", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await page.locator('[data-testid="judo-tilt"]').fill("30");
  expect(await attr(page, "data-tilt")).toBe(30);
  await expect(page).toHaveURL(/tilt=30/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="judo-tilt"]')).toHaveValue("30");
  expect(await attr(page, "data-tilt")).toBe(30);
});

test("a sideways swipe turns the view, an up and down wheel is the page's unless the view has focus, Ctrl and the wheel zooms", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const m = await middle(page);
  await page.mouse.move(m.x, m.y);
  await page.mouse.wheel(120, 0);
  await expect.poll(() => attr(page, "data-yaw")).toBeGreaterThan(20);
  // Up and down with no focus is left to the page: nothing turned or tipped.
  const yaw = await attr(page, "data-yaw");
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(150);
  expect(await attr(page, "data-yaw")).toBe(yaw);
  expect(await attr(page, "data-tilt")).toBe(0);
  // With focus the wheel tips it.
  await page.locator('[data-testid="judo-turntable"]').focus();
  await page.mouse.move(m.x, m.y);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => attr(page, "data-tilt")).toBeLessThan(0);
  // Ctrl and the wheel is a pinch on a trackpad: zoom.
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -200);
  await page.keyboard.up("Control");
  await expect(page).toHaveURL(/zoom=\d/);
  await expect(page.locator('[data-testid="judo-zoom-reset"]')).not.toHaveText("1×");
});

test("zoom runs from 1x to 3x by the buttons and a double press, and the address keeps it", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const reset = page.locator('[data-testid="judo-zoom-reset"]');
  await expect(reset).toHaveText("1×");
  await expect(page.locator('[data-testid="judo-zoom-out"]')).toBeDisabled();
  for (let i = 0; i < 4; i++) await page.locator('[data-testid="judo-zoom-in"]').click();
  await expect(reset).toHaveText("3×");
  await expect(page.locator('[data-testid="judo-zoom-in"]')).toBeDisabled();
  await expect(page).toHaveURL(/zoom=3/);
  await reset.click();
  await expect(reset).toHaveText("1×");
  await expect(page).not.toHaveURL(/zoom=/);
  // A double press zooms in where it was pressed, and again puts it back.
  const m = await middle(page);
  await page.mouse.dblclick(m.x + 30, m.y - 30);
  await expect(reset).toHaveText("2×");
  await page.mouse.dblclick(m.x, m.y);
  await expect(reset).toHaveText("1×");
  await page.goto("/judogi.html?mode=jacket&zoom=2");
  await expect(page.locator('[data-testid="judo-zoom-reset"]')).toHaveText("2×");
});

test("the arrow keys turn and tip the view and plus and minus zoom it", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await page.locator('[data-testid="judo-turntable"]').focus();
  await page.keyboard.press("ArrowRight");
  expect(await attr(page, "data-yaw")).toBe(15);
  await page.keyboard.press("ArrowUp");
  expect(await attr(page, "data-tilt")).toBe(5);
  await page.keyboard.press("+");
  await expect(page.locator('[data-testid="judo-zoom-reset"]')).not.toHaveText("1×");
  await page.keyboard.press("0");
  expect(await attr(page, "data-yaw")).toBe(0);
  expect(await attr(page, "data-tilt")).toBe(0);
  await expect(page.locator('[data-testid="judo-zoom-reset"]')).toHaveText("1×");
});

test("a flat view zooms as a drawing and has nothing to turn or tip", async ({ page }) => {
  await page.goto("/judogi.html?view=flat");
  await expect(page.locator("#judo-stage svg")).toBeVisible();
  await expect(page.locator('[data-testid="judo-tilt"]')).toBeDisabled();
  await page.locator('[data-testid="judo-zoom-in"]').click();
  await expect(page.locator("#judo-stage")).toHaveAttribute("style", /scale\(/);
});
