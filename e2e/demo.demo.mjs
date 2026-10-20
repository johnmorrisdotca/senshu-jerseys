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
  await page.goto("/?cut=hockey&number=9&name=Gray&vol=0&turn=0");
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
  await page.goto("/?cut=hockey&number=9&name=Gray&vol=0&turn=0");
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

test("the jersey turns by itself when the page opens, Pause stops it and Auto-turn starts it again", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#stage svg")).toBeVisible();
  const play = page.locator('[data-testid="play"]');
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page), { timeout: 4000 }).not.toBe(0);
  // The address says it is turning by leaving the angle out; pausing writes the angle and turn=0.
  expect(page.url()).not.toMatch(/yaw=/);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/turn=0/);
  const stopped = await yawOf(page);
  await page.waitForTimeout(500);
  expect(await yawOf(page)).toBe(stopped);
  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => yawOf(page), { timeout: 4000 }).not.toBe(stopped);
  await play.click();
  // Space on the focused stage toggles it too.
  await page.locator("#stage").focus();
  await page.keyboard.press("Space");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(play).toHaveAttribute("aria-pressed", "false");
});

test("an address with turn=0 or with an angle opens still", async ({ page }) => {
  await page.goto("/?turn=0");
  await expect(page.locator("#stage svg")).toBeVisible();
  await page.waitForTimeout(600);
  expect(await yawOf(page)).toBe(0);
  await page.goto("/?yaw=70");
  await expect(page.locator('[data-testid="play"]')).toHaveAttribute("aria-pressed", "false");
  await page.waitForTimeout(600);
  expect(await yawOf(page)).toBe(70);
});

// The page opens on the turning jersey with its controls beside it, so that nothing has to be scrolled to for, and a change never stops or resets the turn.
test("the turn controls are in the first screen, and a toggle while it turns leaves the turn going", async ({ page }) => {
  // A garment with volume is heavy to draw on a slow machine (a shared CI runner), where the turn, which never jumps more than a twentieth of a second's worth, crawls: so each wait is long and asks for a degree.
  test.setTimeout(120_000);
  await page.goto("/");
  const height = page.viewportSize().height;
  for (const id of ["stage", "yaw", "play", "front", "vol", "view-front", "view-back"]) {
    const box = await page.locator(`[data-testid="${id}"]`).boundingBox();
    expect(box, id).not.toBeNull();
    expect(box.y + box.height, `${id} is in the first screen`).toBeLessThanOrEqual(height);
  }
  await expect(page.locator('[data-testid="seg-cut"]')).toBeVisible();
  await expect.poll(() => yawOf(page), { timeout: 15_000 }).not.toBe(0);
  // Change things while it turns: the garment's volume, the cut, the style and the fit. The angle goes on advancing after each, from where it was.
  const checks = [
    () => page.getByTestId("vol").click(),
    () => page.getByTestId("vol").click(),
    () => page.locator('[data-testid="seg-cut"] button[data-value="soccer"]').click(),
    () => page.locator('[data-testid="seg-look"] button[data-value="line"]').click(),
    () => page.locator('[data-testid="seg-look"] button[data-value="cloth"]').click(),
  ];
  for (const change of checks) {
    const before = await yawOf(page);
    await change();
    await expect(page.getByTestId("play")).toHaveAttribute("aria-pressed", "true");
    // Not reset to the front: the angle is near where it was (the turn is 40 degrees a second) and keeps moving.
    const right_after = await yawOf(page);
    const wrapped = Math.abs(right_after - before);
    expect(Math.min(wrapped, 360 - wrapped), "the angle was not reset").toBeLessThan(45);
    await expect.poll(async () => {
      const now = await yawOf(page);
      const gap = Math.abs(now - right_after);
      return Math.min(gap, 360 - gap);
    }, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  }
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
  await expect.poll(() => page.locator('[data-testid="titles"] svg').count()).toBeGreaterThanOrEqual(4);
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
  test.setTimeout(60_000);
  await page.goto("/?turn=0");
  await expect(page.locator('[data-testid="chip-mlb"]')).toBeVisible();
  const controls = await page.locator("#controls button:not([hidden]), #controls select:not([hidden]), #controls input:not([hidden]), #background, #turnbar button, #turnbar input, #viewbar button, #cmp, #wallbar button, #wallbar select, #wallbar input, #officials-sports button, #teams select, #teams button, #embed button").all();
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
  await page.goto("/?cut=hockey&number=9&name=Gray&turn=0");
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

test("the sleeve controls place a number and a patch on the arm, at an angle, and an update keeps the angle", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?cut=hockey&number=77&name=Morris&yaw=90");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
  expect(await stage.locator('[id$="D0"]').count()).toBe(0);
  await page.locator('[data-testid="seg-sleeve-numbers"] button[data-value="right"]').click();
  await expect(page).toHaveURL(/sleeve-numbers=right/);
  await expect(stage.locator('[id$="D0"]')).toHaveCount(1);
  expect(await yawOf(page)).toBe(90);
  // The wearer's right arm is on the picture's left, so its number is in the cells of the left sleeve (group 1).
  expect(await stage.locator('[data-vol="1"] [data-vc]:not([display]) use[href*="D"]').count()).toBeGreaterThan(0);
  await page.locator('[data-testid="seg-sleeve-patch"] button[data-value="shield"]').click();
  await expect(page).toHaveURL(/sleeve-left=/);
  await expect(stage.locator('[id$="D1"]')).toHaveCount(1);
  await page.locator('[data-testid="rng-sleeve-at"]').fill("60");
  await expect(page).toHaveURL(/at%3A60/);
  expect(await yawOf(page)).toBe(90);
  await page.getByTestId("view-left").click();
  expect(Math.abs(await yawOf(page))).toBe(90);
  // The wearer's left arm has no number now: its group shows only the patch's cells, if any.
  expect(await stage.locator('[data-vol="2"] [data-vc]:not([display]) use[href$="D0"]').count()).toBe(0);
  expect(errors).toEqual([]);
  expect(await noSideways(page)).toBe(true);
});

test("the chest controls put a captain's letter and a flag on either breast, and they go round with the chest", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?cut=hockey&number=19&name=Morris");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
  await page.locator('[data-testid="seg-chest-left"] button[data-value="C"]').click();
  await expect(page).toHaveURL(/chest-badges=kind%3AC%3Bside%3Aleft/);
  await page.locator('[data-testid="seg-chest-right"] button[data-value="flag"]').click();
  await expect(page).toHaveURL(/flag%3A/);
  expect(await stage.locator("svg").innerHTML()).toContain("translate(134 78)");
  expect(await noSideways(page)).toBe(true);
  await page.getByTestId("view-back").click();
  expect(Math.abs(await yawOf(page))).toBe(180);
  await page.locator('[data-testid="seg-chest-left"] button[data-value="none"]').click();
  expect(Math.abs(await yawOf(page))).toBe(180);
  await expect(page).not.toHaveURL(/kind%3AC/);
  // The address is the whole state.
  await page.goto(page.url());
  await expect(page.locator('[data-testid="seg-chest-right"] button[data-value="flag"]')).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("the twelve national styles are on a sheet, home or away, and a tap puts one on the stage to be personalised", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const grid = page.locator("#styles-grid");
  await expect(grid.locator("li")).toHaveCount(12);
  await expect(grid.locator("li svg").first()).toBeVisible();
  const home = await grid.locator("li").first().getAttribute("data-id");
  expect(home).toBe("style:canada-2026-home");
  await page.getByTestId("style-away").click();
  await expect(page).toHaveURL(/sw=away/);
  await expect(grid.locator("li").first()).toHaveAttribute("data-id", "style:canada-2026-away");
  await page.getByTestId("style-japan").click();
  await expect(page).toHaveURL(/preset=style%3Ajapan-2026-away/);
  await expect(page.locator("#stage svg title")).toContainText("Hockey");
  // Personalise it: a name and a number go on without changing the style.
  await page.locator('[data-testid="in-number"]').fill("19");
  await page.locator('[data-testid="in-name"]').fill("Tanaka");
  await expect(page.locator("#stage svg title")).toContainText("number 19");
  expect(await noSideways(page)).toBe(true);
  // In Japanese the names are Japanese.
  await page.goto("/?lang=ja");
  await expect(page.locator("#styles-grid li").first()).toContainText("カナダ");
  expect(await noSideways(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("the national layouts: every country in eight layouts, one at a time, and a tap puts it on the stage", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const grid = page.locator("#national-grid");
  await expect(page.locator("#national-layouts button")).toHaveCount(8);
  await expect(grid.locator("li")).toHaveCount(12);
  await expect(grid.locator("li svg").first()).toBeVisible();
  const before = await grid.locator("li svg").first().innerHTML();
  await page.getByTestId("nlayout-flag").click();
  await expect(page).toHaveURL(/nl=flag/);
  await expect.poll(() => grid.locator("li svg").first().innerHTML()).not.toBe(before);
  await page.getByTestId("national-usa").click();
  await expect(page).toHaveURL(/national=usa%3Aflag/);
  await expect(page.locator("#stage svg")).toBeVisible();
  expect(await noSideways(page)).toBe(true);
  await page.goto("/?national=canada:diagonal&view=back");
  await expect(page.locator("#stage svg")).toBeVisible();
  await page.goto("/?lang=ja");
  await expect(page.locator("#national-layouts button").first()).toBeVisible();
  expect(await noSideways(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("the fit: a control makes the shirt a women's cut, a preset keeps it, and every cut is shown both ways", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?cut=hockey&vol=0");
  const flat = await page.locator("#stage svg").first().innerHTML();
  await page.locator('[data-testid="seg-fit"] button[data-value="womens"]').click();
  await expect(page).toHaveURL(/fit=womens/);
  await expect(page.locator("#stage svg title")).toContainText("Women's Hockey sweater");
  await expect.poll(() => page.locator("#stage svg").first().innerHTML()).not.toBe(flat);
  await page.locator('[data-testid="preset"]').selectOption({ index: 1 });
  await expect(page).toHaveURL(/fit=womens/);
  await expect(page.locator("#fit-grid li")).toHaveCount(7);
  await expect(page.locator("#fit-grid li svg")).toHaveCount(14);
  await page.getByTestId("fit-soccer-womens").click();
  await expect(page).toHaveURL(/cut=soccer/);
  await expect(page.locator("#stage svg title")).toContainText("Women's Soccer shirt");
  expect(await noSideways(page)).toBe(true);
  await page.goto("/?fit=womens&vol=1&yaw=90");
  await expect(page.locator("#stage svg")).toBeVisible();
  await page.goto("/?lang=ja");
  await expect(page.locator("#fit-grid li").first()).toBeVisible();
  expect(await noSideways(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("the officials section shows the caps, and a number on a striped referee goes on both sleeves", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#official-caps figure")).toHaveCount(5);
  await expect(page.locator("#official-caps figure svg").first()).toBeVisible();
  expect(await noSideways(page)).toBe(true);
  await page.goto("/?preset=ref:nhl-modern-referee&number=14");
  await expect(page.locator("#stage svg")).toBeVisible();
  await expect.poll(() => page.locator("#stage").innerHTML()).toContain("rotate(");
});

test("the tilt slider tips the garment forward up to 30 degrees, is kept in the address and goes with the volume", async ({ page }) => {
  await page.goto("/?cut=hockey&number=9&pitch=30&yaw=40");
  const stage = page.locator("#stage");
  await expect(stage.locator("svg[data-vol]")).toBeVisible();
  expect(await stage.locator("svg").getAttribute("data-vol")).toContain('"pitch":30');
  await expect(page.getByTestId("pitch")).toHaveValue("30");
  await page.getByTestId("pitch").fill("0");
  expect(await stage.locator("svg").getAttribute("data-vol")).toContain('"pitch":0');
  await expect(page).toHaveURL(/pitch=0/);
  await page.getByTestId("vol").click();
  await expect(page.locator("#pitchbar")).toBeHidden();
});
