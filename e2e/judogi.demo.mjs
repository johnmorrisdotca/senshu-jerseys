import { expect, test } from "@playwright/test";

// The judogi designer: it draws on a canvas, turns in place, keeps its angle when a choice changes, keeps every choice in the address,
// and has no control left in the browser's own style.
/** Choose an option of a swatch, tile or segmented picker. */
const pick = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();
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
  await pick(page, "judo-colour", "blue");
  await expect(page).toHaveURL(/colour=blue/);
  expect(await yawOf(page)).toBe(40);
  // The address is the whole state.
  await page.goto(page.url());
  await expect(page.locator('[data-testid="judo-colour"] [data-value="blue"]')).toHaveAttribute("aria-pressed", "true");
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
  await pick(page, "judo-patch", "zekken");
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
  await page.locator('[data-testid="judo-logo"] input[data-value="jacket-hem"]').check();
  await expect(page).toHaveURL(/logo=jacket-hem/);
  await pick(page, "judo-emblem", "placeholder");
  await expect(page).toHaveURL(/emblem=placeholder/);
  await expect(page.locator('[data-testid="judo-rules"]')).toHaveCount(1);
  await pick(page, "judo-rules", "ajjf");
  await expect(page.locator("#judo-check")).toContainText("All Japan Judo Federation");
  expect(errors).toEqual([]);
});

test("the branding is one switch with its mark, words and colour, kept in the address", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/judogi.html?mode=jacket&brand=1&bk=chikara&bt=3B");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="judo-bk"] [data-value="chikara"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="judo-bt"]')).toHaveValue("3B");
  await pick(page, "judo-bk", "kokoro");
  await expect(page).toHaveURL(/bk=kokoro/);
  await page.locator('[data-testid="judo-bn"]').fill("KAZE");
  await expect(page).toHaveURL(/bn=KAZE/);
  await page.locator('[data-testid="judo-brand"]').click();
  await expect(page.locator('[data-testid="judo-brand"]')).toHaveAttribute("aria-checked", "false");
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

// The form: colours are swatches, few-way visual choices are picture tiles, on and off is a switch, places are checkboxes, and only long lists are dropdowns.
test("a colour is a swatch, a few-way choice a picture tile, on or off a switch, and only long lists are dropdowns", async ({ page }) => {
  await page.goto("/judogi.html?mode=pieces&belt=brown&patch=ijf&emblem=flag&brand=1&e1p=jacket-chest&e1t=X");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const selects = await page.locator("#judo-controls select").evaluateAll((nodes) => nodes.map((n) => n.id));
  expect(selects.sort()).toEqual(["judo-e1p", "judo-e2p", "judo-size"]);
  // Swatches: the belt's ten colours, one pressed, each named.
  const belts = page.locator('[data-testid="judo-belt"] button');
  await expect(belts).toHaveCount(10);
  await expect(page.locator('[data-testid="judo-belt"] [data-value="brown"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="judo-belt"] [data-value="red-white"]')).toHaveAttribute("aria-label", /.+/);
  await pick(page, "judo-belt", "black");
  await expect(page).toHaveURL(/belt=black/);
  await expect(page.locator('[data-testid="judo-belt"] [data-value="black"]')).toHaveAttribute("aria-pressed", "true");
  // The thread colours and the patch colours are swatches too.
  await expect(page.locator('[data-testid="judo-e1c"] button')).toHaveCount(24);
  await expect(page.locator('[data-testid="judo-pcolour"] button')).toHaveCount(5);
  // Tiles carry a picture over the name.
  for (const id of ["judo-patch", "judo-emblem", "judo-bk", "judo-mode", "judo-psew"]) {
    const tile = page.locator(`[data-testid="${id}"] button`).first();
    await expect(tile.locator("svg, .is-glyph")).toHaveCount(1);
  }
  // The branding is a switch.
  const brand = page.locator('[data-testid="judo-brand"]');
  await expect(brand).toHaveAttribute("role", "switch");
  await expect(brand).toHaveAttribute("aria-checked", "true");
  await brand.click();
  await expect(page).not.toHaveURL(/brand=1/);
  await expect(page.locator('[data-testid="judo-bk"]')).toHaveCount(0);
});

test("only the options that change the current display mode are shown, and the others stay in the address", async ({ page }) => {
  const shown = (id) => page.locator(`[data-testid="${id}"]`);
  await page.goto("/judogi.html?mode=pants&belt=black&patch=ijf&emblem=flag&logo=jacket-hem,belt-end-left&e1p=jacket-chest&e1t=X&brand=1&bk=chikara");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  // Trousers only: no belt, no back patch, no emblem, no neck label words; the places are the trousers'.
  for (const id of ["judo-belt", "judo-patch", "judo-emblem", "judo-bk", "judo-pname"]) await expect(shown(id)).toHaveCount(0);
  await expect(shown("judo-colour")).toHaveCount(1);
  await expect(page.locator('[data-testid="judo-logo"] input')).toHaveCount(4);
  await expect(page.locator('[data-testid="judo-e1p"] option, #judo-e1p option').first()).toBeAttached();
  const places = await page.locator("#judo-e1p option").evaluateAll((nodes) => nodes.map((n) => n.value));
  expect(places.every((p) => p === "none" || p.startsWith("pants"))).toBe(true);
  // Choosing something does not drop what is hidden.
  await pick(page, "judo-colour", "blue");
  await expect(page).toHaveURL(/patch=ijf/);
  await expect(page).toHaveURL(/emblem=flag/);
  await expect(page).toHaveURL(/logo=jacket-hem/);
  await expect(page).toHaveURL(/belt=black/);
  // Back to the jacket: they are there as they were left.
  await pick(page, "judo-mode", "jacket");
  await expect(page.locator('[data-testid="judo-patch"] [data-value="ijf"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="judo-emblem"] [data-value="flag"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="judo-logo"] input[data-value="jacket-hem"]')).toBeChecked();
  await expect(shown("judo-belt")).toHaveCount(1);
  // A belt alone has no cloth colour, no patch and no jacket places.
  await pick(page, "judo-mode", "belt");
  await expect(shown("judo-colour")).toHaveCount(0);
  await expect(shown("judo-patch")).toHaveCount(0);
  await expect(page.locator('[data-testid="judo-logo"] input')).toHaveCount(2);
  // A suit and the pieces show everything.
  await pick(page, "judo-mode", "suit");
  await expect(shown("judo-patch")).toHaveCount(1);
  await expect(page.locator('[data-testid="judo-logo"] input')).toHaveCount(9);
});

test("the maker's logo places are none to many, with no raw key in any label, in either language", async ({ page }) => {
  test.setTimeout(120_000);
  for (const lang of ["en", "ja"]) {
    await page.goto(`/judogi.html?mode=suit&lang=${lang}`);
    await expect(page.locator("#judo-stage canvas")).toBeVisible();
    const boxes = page.locator('[data-testid="judo-logo"] input');
    await expect(boxes).toHaveCount(9);
    // Every label is words, not the key it is looked up by.
    const labels = await page.locator("#judo-controls").evaluate((root) => [...root.querySelectorAll("label, button, option, h3, .judo-cap, .judo-label")].map((n) => n.textContent ?? "").concat([...root.querySelectorAll("[aria-label]")].map((n) => n.getAttribute("aria-label") ?? "")));
    for (const text of labels) expect(text, text).not.toMatch(/judo[A-Z_]|judo[A-Za-z]*_|shoulder-left|shoulder-right/);
    await expect(page.locator('[data-testid="judo-logo-note"]')).toBeVisible();
  }
  // Any number of places, none included (each choice draws the judogi again, so the page is given time).
  await page.goto("/judogi.html?mode=suit");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  const check = (v) => page.locator(`[data-testid="judo-logo"] input[data-value="${v}"]`);
  await check("jacket-hem").check();
  await check("pants-leg-left").check();
  await check("belt-end-right").check();
  await expect(page).toHaveURL(/logo=jacket-hem%2Cpants-leg-left%2Cbelt-end-right/);
  await check("jacket-shoulder-left").check();
  await expect(page.locator('[data-testid="judo-logo"] input:checked')).toHaveCount(4);
  for (const v of ["jacket-hem", "pants-leg-left", "belt-end-right", "jacket-shoulder-left"]) await check(v).uncheck();
  await expect(page).not.toHaveURL(/logo=/);
  await page.goto("/judogi.html?mode=jacket");
  await expect(page.locator('[data-testid="judo-logo"] label', { hasText: "Jacket, shoulder left" })).toHaveCount(1);
  await expect(page.locator('[data-testid="judo-logo"] label', { hasText: "Jacket, shoulder right" })).toHaveCount(1);
  await expect(page.locator('[data-testid="judo-logo-note"]')).toContainText("one maker's logo on each garment");
});

test("two logos on one garment are both kept and only the first is drawn, with no error", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/judogi.html?mode=jacket&logo=jacket-hem,jacket-shoulder-left");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="judo-logo"] input:checked')).toHaveCount(2);
  expect(errors).toEqual([]);
});
