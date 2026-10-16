import { expect, test } from "@playwright/test";

const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const yawOf = (page) => page.locator("#stage svg").getAttribute("data-yaw").then(Number);

test("the page draws a jersey, loads the presets, and does not scroll sideways", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await expect(page.locator("#stage svg")).toBeVisible();
  await expect(page.locator("#wallgrid li").first()).toBeAttached();
  expect(await noSideways(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("the controls change the drawing, and the address says so", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-testid="seg-cut"] button[data-value="soccer"]').click();
  await expect(page).toHaveURL(/cut=soccer/);
  await expect(page.locator("#stage svg title")).toContainText("Soccer shirt");
  await page.locator('[data-testid="in-number"]').fill("10");
  await expect(page.locator("#stage svg title")).toContainText("number 10");
  await page.locator('[data-testid="seg-look"] button[data-value="line"]').click();
  await expect(page.locator("#stage svg").first()).toBeVisible();
  expect(await page.locator("#stage").innerHTML()).toContain("currentColor");
  await page.locator('[data-testid="sel-pattern"]').selectOption("hoops");
  await expect(page).toHaveURL(/pattern=hoops/);
  // The address is the whole state: a fresh page from it draws the same.
  const url = page.url();
  await page.goto(url);
  await expect(page.locator("#stage svg title")).toContainText("Soccer shirt, number 10");
  await expect(page.locator('[data-testid="sel-pattern"]')).toHaveValue("hoops");
  await expect(page.locator('[data-testid="in-number"]')).toHaveValue("10");
});

test("dragging turns the jersey from the front to the back, and the keys do too", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9&name=Gray&vol=0");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg")).toBeVisible();
  expect(await yawOf(page)).toBe(0);
  // A finger, or a mouse: pointer events either way, so the same on every project.
  await stage.evaluate(async (node) => {
    const box = node.getBoundingClientRect();
    const at = (type, x) => node.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: "touch", isPrimary: true, bubbles: true, clientX: x, clientY: box.top + box.height / 2, button: 0 }));
    at("pointerdown", box.left + box.width * 0.2);
    for (let i = 1; i <= 8; i++) at("pointermove", box.left + box.width * (0.2 + 0.075 * i));
    at("pointerup", box.left + box.width * 0.8);
  });
  const turned = await yawOf(page);
  expect(Math.abs(turned)).toBeGreaterThan(60);
  await stage.focus();
  await page.keyboard.press("Home");
  expect(await yawOf(page)).toBe(0);
  for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");
  expect(Math.abs(await yawOf(page))).toBe(180);
  // The back shows, with its name and number.
  await expect(stage.locator('[data-turn="back"]')).not.toHaveAttribute("display", "none");
  await expect(stage.locator('[data-turn="front"]')).toHaveAttribute("display", "none");
  await page.getByTestId("front").click();
  expect(await yawOf(page)).toBe(0);
});

// Which way the jersey turns, measured: the front face is the near one, so when the jersey turns with the hand (a drag to the right) the front goes to the right of the middle of the cloth and the
// edge shows on the left, and the Right arrow does the same.
const frontOffset = (page) =>
  page.locator("#stage").evaluate((node) => {
    const middle = (sel) => {
      const b = node.querySelector(sel).getBoundingClientRect();
      return (b.left + b.right) / 2;
    };
    return middle('[data-turn="front"]') - middle('[data-turn="edge"]');
  });

test("a drag to the right takes the front of the jersey to the right, a drag to the left to the left, and the arrows do the same", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9&name=Gray&vol=0");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg")).toBeVisible();
  // Pointer events on the stage, as in the test above, so that it is the same on every project whatever is scrolled into view.
  const dragTo = (from, to) =>
    stage.evaluate((node, [a, b]) => {
      const box = node.getBoundingClientRect();
      const at = (type, f) => node.dispatchEvent(new PointerEvent(type, { pointerId: 5, pointerType: "mouse", isPrimary: true, bubbles: true, clientX: box.left + box.width * f, clientY: box.top + box.height / 2, button: 0 }));
      at("pointerdown", a);
      for (let i = 1; i <= 6; i++) at("pointermove", a + ((b - a) * i) / 6);
      at("pointerup", b);
    }, [from, to]);
  await dragTo(0.4, 0.5);
  expect(await yawOf(page)).toBeGreaterThan(10);
  expect(await frontOffset(page)).toBeGreaterThan(1);
  await stage.focus();
  await page.keyboard.press("Home");
  expect(await yawOf(page)).toBe(0);
  await dragTo(0.5, 0.4);
  expect(await yawOf(page)).toBeLessThan(-10);
  expect(await frontOffset(page)).toBeLessThan(-1);
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  expect(await yawOf(page)).toBeGreaterThan(0);
  expect(await frontOffset(page)).toBeGreaterThan(0.3);
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  expect(await yawOf(page)).toBeLessThan(0);
  expect(await frontOffset(page)).toBeLessThan(-0.3);
});

test("nothing moves until Play is pressed, then it turns, and Pause stops it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#stage svg")).toBeVisible();
  await page.waitForTimeout(700);
  expect(await yawOf(page)).toBe(0);
  const play = page.locator('[data-testid="play"]');
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page), { timeout: 4000 }).not.toBe(0);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  const stopped = await yawOf(page);
  await page.waitForTimeout(500);
  expect(await yawOf(page)).toBe(stopped);
  // Space on the focused stage toggles it too.
  await page.locator("#stage").focus();
  await page.keyboard.press("Space");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("a reader who prefers reduced motion gets a still jersey from the element and from the frame", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/embed.html?cut=hockey&number=9&turn=auto");
  await expect(page.locator("#frame svg")).toBeVisible();
  await page.waitForTimeout(600);
  expect(Number(await page.locator("#frame svg").getAttribute("data-yaw"))).toBe(0);
  await context.close();
});

test("the embed frame draws what its address says, and turns when asked", async ({ page }) => {
  await page.goto("/embed.html?cut=basketball&colors=1f3a8a,f4f0e4&number=33&view=back");
  await expect(page.locator("#frame svg title")).toContainText("Basketball jersey, number 33, back");
  await page.goto("/embed.html?cut=hockey&number=9&turn=auto");
  await expect(page.locator("#frame svg")).toBeVisible();
  await expect.poll(async () => Number(await page.locator("#frame svg").getAttribute("data-yaw")), { timeout: 4000 }).not.toBe(0);
});

test("<senshu-jersey> draws from attributes, redraws when one changes, turns by hand, and cleans up", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    await import("/dist/element-define.js");
    const el = document.createElement("senshu-jersey");
    el.setAttribute("cut", "rugby");
    el.setAttribute("colors", "#1f3a8a,#f4f0e4");
    el.setAttribute("number", "8");
    document.body.append(el);
    await new Promise((r) => setTimeout(r, 30));
    const first = el.shadowRoot.querySelector("svg title")?.textContent;
    el.setAttribute("number", "15");
    await new Promise((r) => setTimeout(r, 30));
    const second = el.shadowRoot.querySelector("svg title")?.textContent;
    el.setAttribute("turnable", "");
    el.setAttribute("autoplay", "");
    await new Promise((r) => setTimeout(r, 30));
    const turnable = el.shadowRoot.querySelector(".box")?.getAttribute("role");
    el.remove();
    await new Promise((r) => setTimeout(r, 30));
    return { first, second, turnable, left: el.shadowRoot.querySelector(".box")?.childElementCount };
  });
  expect(result.first).toContain("Rugby shirt, number 8");
  expect(result.second).toContain("number 15");
  expect(result.turnable).toBe("group");
  expect(result.left).toBe(0);
});

test("a preset sets the colours and the cut, and the wall lists every preset, filters them and tries one", async ({ page }) => {
  await page.goto("/");
  const count = page.locator('[data-testid="wall-count"]');
  await expect(count).toContainText("presets");
  const total = await page.locator("#wallgrid li").count();
  expect(total).toBeGreaterThanOrEqual(200);
  // A league chip and a search.
  await page.locator('[data-testid="chip-mlb"]').click();
  const league = await page.locator("#wallgrid li:not([hidden])").count();
  expect(league).toBeGreaterThan(0);
  expect(league).toBeLessThan(total);
  await expect(page).toHaveURL(/wl=mlb/);
  await page.locator('[data-testid="wall-q"]').fill("yankees");
  const found = await page.locator("#wallgrid li:not([hidden])").count();
  expect(found).toBeGreaterThan(0);
  expect(found).toBeLessThan(league);
  // The cards draw as they come into view.
  await page.locator("#wallgrid li:not([hidden])").first().scrollIntoViewIfNeeded();
  await expect(page.locator("#wallgrid li:not([hidden]) svg").first()).toBeVisible();
  // Trying one loads it into the playground.
  const first = page.locator("#wallgrid li:not([hidden]) button").first();
  await first.click();
  await expect(page).toHaveURL(/cut=baseball/);
  await expect(page.locator("#stage svg")).toBeVisible();
  expect(await page.locator('[data-testid="preset"]').inputValue()).not.toBe("");
  expect(await noSideways(page)).toBe(true);
});

test("the officials section lists every referee, filters by sport and tries one, and the wall has an Officials filter", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-testid="officials"] li');
  await expect(cards.first()).toBeAttached();
  const total = await cards.count();
  expect(total).toBeGreaterThanOrEqual(30);
  await expect(page.locator('[data-testid="officials"] svg').first()).toBeAttached();
  await page.locator('[data-testid="osport-hockey"]').click();
  await expect(page).toHaveURL(/os=hockey/);
  const hockey = await page.locator('[data-testid="officials"] li:not([hidden])').count();
  expect(hockey).toBeGreaterThan(3);
  expect(hockey).toBeLessThan(total);
  await expect(page.locator('[data-testid="officials-count"]')).toContainText(`${hockey} officials`);
  // A referee: the armbands are in the drawing, the linesman's are not.
  await page.locator('[data-testid="officials"] li[data-id="ref:nhl-modern-referee"] button').click();
  await expect(page).toHaveURL(/armbands=/);
  expect(await page.locator("#stage").innerHTML()).toContain('fill="#f58220"');
  await page.goto("/?preset=ref:nhl-modern-linesman");
  await expect(page.locator("#stage svg")).toBeVisible();
  expect(await page.locator("#stage").innerHTML()).not.toContain('fill="#f58220"');
  // The wall's own filter.
  await page.locator('[data-testid="chip-officials"]').click();
  await expect(page).toHaveURL(/wl=officials/);
  expect(await page.locator("#wallgrid li:not([hidden])").count()).toBe(total);
  expect(await noSideways(page)).toBe(true);
});

test("the controls take the officials' parts: armbands, a pocket, a badge spot and a zip collar", async ({ page }) => {
  await page.goto("/?cut=soccer&number=5");
  await page.locator('[data-testid="tog-pocket"]').click();
  await expect(page).toHaveURL(/pocket=true/);
  await page.locator('[data-testid="seg-badge"] button[data-value="shield"]').click();
  await expect(page).toHaveURL(/badge=shield/);
  await page.locator('[data-testid="tog-armbands"]').click();
  await expect(page).toHaveURL(/armbands=true/);
  await page.locator('[data-testid="sel-collar"]').selectOption("zip");
  await expect(page).toHaveURL(/collar=zip/);
  await expect(page.locator("#stage svg")).toBeVisible();
  expect(await noSideways(page)).toBe(true);
});

test("the hall of rafters, the matchup, the lineup and the caps draw", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.locator('[data-testid="rafters"] svg').count()).toBeGreaterThanOrEqual(14);
  await expect(page.locator('[data-testid="m-out"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="l-out"] svg')).toBeVisible();
  await expect(page.locator('[data-testid="caps"] svg')).toHaveCount(6);
  await page.locator('[data-testid="l-form"]').selectOption("4-3-3");
  await expect(page).toHaveURL(/lf=4-3-3/);
  await page.locator('[data-testid="m-view"] button[data-value="both"]').click();
  await expect(page).toHaveURL(/mv=both/);
  await page.locator('[data-testid="l-labels"] button[data-value="number"]').click();
  await expect(page).toHaveURL(/ll=number/);
  expect(await noSideways(page)).toBe(true);
});

test("the copy tabs show the code for the jersey, and copy it", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/?cut=hockey&number=9");
  const code = page.locator('[data-testid="embed-code"]');
  await expect(code).toContainText("<senshu-jersey");
  await expect(code).toContainText('cut="hockey"');
  await page.locator('[data-testid="tab-iframe"]').click();
  await expect(code).toContainText("embed.html?");
  await expect(code).toContainText("cut=hockey");
  await page.locator('[data-testid="tab-module"]').click();
  await expect(code).toContainText("renderJersey(");
  await page.locator('[data-testid="tab-svg"]').click();
  await expect(code).toContainText("<svg");
  await page.locator('[data-testid="tab-data"]').click();
  await expect(code).toContainText("data:image/svg+xml");
  await page.locator('[data-testid="tab-element"]').click();
  await page.locator('[data-testid="embed-copy"]').click();
  await expect(page.locator("#embed-status")).toHaveText("Copied");
  expect(await noSideways(page)).toBe(true);
});

test("in Japanese the words change, and nothing scrolls sideways", async ({ page }) => {
  await page.goto("/?lang=ja");
  await expect(page.locator("#try-h")).toHaveText("試してみる");
  await expect(page.locator('[data-testid="seg-cut"] button[data-value="hockey"]')).toHaveText("アイスホッケー");
  await expect(page.locator("#stage svg title")).toContainText("アイスホッケーのジャージ");
  await expect(page.locator("#wall-h")).toHaveText("ユニフォーム一覧");
  expect(await noSideways(page)).toBe(true);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#try-h")).toHaveText("Try it");
});

test("44 pixels is the least a control gives a finger", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-testid="chip-mlb"]')).toBeVisible();
  const controls = await page.locator("#controls button:not([hidden]), #controls select:not([hidden]), #controls input:not([hidden]), #background, #turnbar button, #turnbar input, #wallbar button, #wallbar select, #wallbar input, #officials-sports button, #teams select, #teams button, #embed button").all();
  expect(controls.length).toBeGreaterThan(40);
  for (const control of controls) {
    if (!(await control.isVisible())) continue;
    const box = await control.boundingBox();
    expect(box.height, await control.evaluate((n) => n.outerHTML.slice(0, 90))).toBeGreaterThanOrEqual(43.5);
  }
});

test("the background is off by default, and a chosen one is a picture behind the stage that leaves the jersey as it was", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?cut=hockey&number=9&name=Beaumont");
  await expect(page.locator("#stage svg")).toBeVisible();
  const background = () => page.locator("#stage").evaluate((stage) => stage.style.backgroundImage);
  // The jersey string without turning in it: the "both" view is drawn once and does not move.
  const jersey = () => page.locator("#stage > svg").evaluate((svg) => svg.outerHTML);
  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "Both" }).click();
  const plain = await jersey();
  expect(await background()).toBe("");
  await page.locator("#background").selectOption("ice");
  await expect.poll(background).toContain("data:image/svg+xml");
  expect(page.url()).toContain("background=ice");
  expect(await jersey()).toBe(plain);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(background).toContain("data:image/svg+xml");
  expect(await jersey()).toBe(plain);
  // The address says which, and None takes it away again.
  await page.goto("/?background=floodlights&view=both");
  await expect(page.locator("#background")).toHaveValue("floodlights");
  await expect.poll(background).toContain("data:image/svg+xml");
  await page.locator("#background").selectOption("");
  await expect.poll(background).toBe("");
  expect(page.url()).not.toContain("background");
  await page.goto("/?background=nope");
  await expect(page.locator("#background")).toHaveValue("");
  expect(await noSideways(page)).toBe(true);
  expect(errors).toEqual([]);
});

// ----- The garment with volume (the demo's default stage).
const shown = (page) => page.locator("#stage [data-vc]:not([display])").count();

test("the stage draws a garment with volume, and the fixed views turn it to the front, the sides, the back and the three-quarter", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?cut=hockey&number=19&name=Morris&sleeve-numbers=true");
  await expect(page.locator("#stage svg[data-vol]")).toBeVisible();
  await expect(page.getByTestId("vol")).toHaveAttribute("aria-pressed", "true");
  for (const [view, yaw] of [["view-right", 90], ["view-back", 180], ["view-left", -90], ["view-three", 40], ["view-front", 0]]) {
    await page.getByTestId(view).click();
    expect(Math.abs(await yawOf(page))).toBe(Math.abs(yaw));
    expect(await shown(page)).toBeGreaterThan(20);
  }
  expect(errors).toEqual([]);
  expect(await noSideways(page)).toBe(true);
});

test("the garment turns by hand and by the keys, and the volume and the comparison are switches kept in the address", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9&name=Gray");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  expect(await yawOf(page)).toBe(15);
  await page.keyboard.press("Shift+ArrowRight");
  expect(await yawOf(page)).toBe(60);
  await page.keyboard.press("Home");
  expect(await yawOf(page)).toBe(0);
  await page.getByTestId("cmp").click();
  await expect(page.getByTestId("compare")).toBeVisible();
  await expect(page).toHaveURL(/cmp=1/);
  await expect(page.locator("#cmp-flat svg")).toBeVisible();
  expect(await page.locator("#cmp-flat").innerHTML()).toContain('data-turn="slab"');
  expect(await page.locator("#cmp-vol").innerHTML()).toContain("data-vol");
  await page.getByTestId("view-right").click();
  expect(await page.locator("#cmp-vol svg").getAttribute("data-yaw")).toBe("90");
  expect(await noSideways(page)).toBe(true);
  await page.getByTestId("vol").click();
  await expect(page).toHaveURL(/vol=0/);
  await expect(stage.locator("svg[data-turn], svg:has([data-turn])")).toBeVisible();
  expect(await stage.locator("[data-vol]").count()).toBe(0);
  await page.getByTestId("vol").click();
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
});

test("the garment keeps the options: a pattern, a sleeve number and a look, at an angle, and an update keeps the angle", async ({ page }) => {
  await page.goto("/?cut=soccer&pattern=hoops&number=10&sleeve-numbers=true&yaw=135");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
  expect(await yawOf(page)).toBe(135);
  await page.locator('[data-testid="seg-look"] button[data-value="line"]').click();
  expect(await yawOf(page)).toBe(135);
  expect(await stage.innerHTML()).toContain("currentColor");
  await page.locator('[data-testid="seg-look"] button[data-value="cloth"]').click();
  await page.locator('[data-testid="in-number"]').fill("77");
  expect(await yawOf(page)).toBe(135);
  expect(await shown(page)).toBeGreaterThan(20);
});

test("a reader who prefers reduced motion gets a still garment from the frame, and the frame draws one at an angle", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/embed.html?cut=hockey&number=9&volume=1&turn=auto");
  await expect(page.locator("#frame svg[data-vol]")).toBeVisible();
  await page.waitForTimeout(600);
  expect(Number(await page.locator("#frame svg").getAttribute("data-yaw"))).toBe(0);
  await page.goto("/embed.html?cut=hockey&number=9&volume=1&yaw=90");
  await expect(page.locator("#frame svg[data-vol]")).toBeVisible();
  expect(Number(await page.locator("#frame svg").getAttribute("data-yaw"))).toBe(90);
  await context.close();
});
