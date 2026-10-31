import { expect, test } from "@playwright/test";

// The Uniforms page: every garment and belt is a picture tile, the chosen garment turns, every choice is in the address, and no control is left in the browser's own style.
const pick = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();
const BJJ_TILES = ["bjj-white", "bjj-white-ibjjf", "bjj-white-covered", "bjj-blue", "bjj-blue-ibjjf", "bjj-blue-covered", "bjj-black", "bjj-black-ibjjf", "bjj-black-covered"];
const DOBOK_TILES = ["dobok-wt", "dobok-wt-poom", "dobok-wt-dan", "dobok-itf", "dobok-itf-dan"];
const yawOf = (page) => page.locator("#uni-stage canvas").getAttribute("data-yaw").then(Number);

test("the page loads, the large view is drawn and every tile has its picture", async ({ page }) => {
  test.slow();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const tiles = page.locator(".uni-tiles .judo-tile");
  expect(await tiles.count()).toBeGreaterThanOrEqual(21 + 9 + 20);
  await expect(page.locator('.uni-garments .judo-tile[data-value="judogi-white"]')).toBeVisible();
  await expect(page.locator('.uni-garments .judo-tile[data-value="judogi-blue"]')).toBeVisible();
  // The karate gi: a tile for each sleeve, and the kumite and kata cuts.
  for (const id of ["karate-full", "karate-three-quarter", "karate-short", "karate-kumite", "karate-kata"]) await expect(page.locator(`.uni-garments .judo-tile[data-value="${id}"]`)).toBeVisible();
  // The jiu-jitsu gi: plain, with the IBJJF-legal patches and covered in patches, in white, blue and black.
  for (const id of BJJ_TILES) await expect(page.locator(`.uni-garments .judo-tile[data-value="${id}"]`)).toBeVisible();
  // The dobok: the V-neck with each collar, and the ITF wrap plain and with a black belt's hem.
  for (const id of DOBOK_TILES) await expect(page.locator(`.uni-garments .judo-tile[data-value="${id}"]`)).toBeVisible();
  // A tile is drawn when it comes near the screen: bring each one there and wait for its picture.
  test.setTimeout(240000);
  for (const tile of await tiles.all()) {
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60000 });
  }
  const blank = await page.evaluate(() => [...document.querySelectorAll(".uni-tiles img")].filter((i) => !i.complete || i.naturalWidth < 8).length);
  expect(blank).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  // A browser may say it is letting go of an old graphics context while the tiles are drawn one after another; that is not a fault of the page.
  expect(errors.filter((e) => !/GL Driver|ReadPixels|WebGL/.test(e))).toEqual([]);
});

test("garment, belt, show, angle and zoom are kept in the address and survive a reload", async ({ page }) => {
  // The tiles are still being drawn one by one on a slow machine: give the clicks room.
  test.slow();
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await pick(page, "uni-garment", "judogi-blue");
  await pick(page, "uni-belt", "brown");
  await pick(page, "uni-belt-bjj", "tip-red-degrees-3");
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
  await expect(page.locator('[data-testid="uni-belt-bjj"] [data-value="tip-red-degrees-3"]')).toHaveAttribute("aria-pressed", "true");
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

test("every karate tile is drawn, and the sleeve choice is kept in the address and survives a reload", async ({ page }) => {
  test.slow();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  for (const id of ["karate-full", "karate-three-quarter", "karate-short", "karate-kumite", "karate-kata"]) {
    const tile = page.locator(`[data-testid="uni-garment"] [data-value="${id}"]`);
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60000 });
    expect(await tile.locator("img").evaluate((i) => i.complete && i.naturalWidth > 8)).toBe(true);
  }
  // Each sleeve is its own picture.
  const srcs = await page.locator('[data-testid="uni-garment"] [data-value^="karate-"] img').evaluateAll((imgs) => imgs.map((i) => i.src.length));
  expect(new Set(srcs).size).toBeGreaterThan(2);
  await pick(page, "uni-garment", "karate-short");
  await expect(page).toHaveURL(/garment=karate-short/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="uni-garment"] [data-value="karate-short"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await pick(page, "uni-garment", "karate-three-quarter");
  await expect(page).toHaveURL(/garment=karate-three-quarter/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="uni-garment"] [data-value="karate-three-quarter"]')).toHaveAttribute("aria-pressed", "true");
  expect(errors.filter((e) => !/GL Driver|ReadPixels|WebGL/.test(e))).toEqual([]);
});

test("every jiu-jitsu gi tile is drawn, each its own picture, and the choice is kept in the address and survives a reload", async ({ page }) => {
  test.slow();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  for (const id of BJJ_TILES) {
    const tile = page.locator(`[data-testid="uni-garment"] [data-value="${id}"]`);
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60000 });
    expect(await tile.locator("img").evaluate((i) => i.complete && i.naturalWidth > 8)).toBe(true);
  }
  // The three colours and the three patch looks are nine pictures of their own.
  const srcs = await page.locator('[data-testid="uni-garment"] [data-value^="bjj-"] img').evaluateAll((imgs) => imgs.map((i) => i.src));
  expect(new Set(srcs).size).toBe(BJJ_TILES.length);
  for (const id of ["bjj-black-covered", "bjj-blue-ibjjf"]) {
    await pick(page, "uni-garment", id);
    await expect(page).toHaveURL(new RegExp(`garment=${id}`));
    await page.goto(page.url());
    await expect(page.locator(`[data-testid="uni-garment"] [data-value="${id}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#uni-stage canvas")).toBeVisible();
  }
  expect(errors.filter((e) => !/GL Driver|ReadPixels|WebGL/.test(e))).toEqual([]);
});

test("every dobok tile is drawn, each its own picture, and the choice is kept in the address and survives a reload", async ({ page }) => {
  test.slow();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/uniforms.html");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  for (const id of DOBOK_TILES) {
    const tile = page.locator(`[data-testid="uni-garment"] [data-value="${id}"]`);
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60000 });
    expect(await tile.locator("img").evaluate((i) => i.complete && i.naturalWidth > 8)).toBe(true);
  }
  // The collars and the hem are each a picture of their own.
  const srcs = await page.locator('[data-testid="uni-garment"] [data-value^="dobok-"] img').evaluateAll((imgs) => imgs.map((i) => i.src));
  expect(new Set(srcs).size).toBe(DOBOK_TILES.length);
  for (const id of ["dobok-wt-dan", "dobok-itf-dan"]) {
    await pick(page, "uni-garment", id);
    await expect(page).toHaveURL(new RegExp(`garment=${id}`));
    await page.goto(page.url());
    await expect(page.locator(`[data-testid="uni-garment"] [data-value="${id}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#uni-stage canvas")).toBeVisible();
  }
  expect(errors.filter((e) => !/GL Driver|ReadPixels|WebGL/.test(e))).toEqual([]);
});

test("every art's belt variants are tiles, tied as worn and folded, and the tie is kept in the address", async ({ page }) => {
  test.slow();
  test.setTimeout(240000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/uniforms.html?garment=karate-full");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const VARIANTS = { "uni-belt-karate": ["karate-brown-1", "karate-dan-3"], "uni-belt-taekwondo": ["itf-senior-4", "itf-junior-2", "itf-gup-blue-red", "poom", "wt-dan-bars-3"], "uni-belt-bjj": ["tip-black-degrees-3"], "uni-belt-judo": ["half-yellow-orange", "mon-12"] };
  // Each variant drawn tied (the belt row shows the belt as it is worn), then folded once the folded belt is on show: a different picture each time.
  const drawn = async () => {
    const out = {};
    for (const [group, ids] of Object.entries(VARIANTS)) {
      for (const id of ids) {
        const tile = page.locator(`[data-testid="${group}"] [data-value="${id}"]`);
        await tile.scrollIntoViewIfNeeded();
        await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60000 });
        out[id] = await tile.locator("img").evaluate((i) => (i.complete && i.naturalWidth > 8 ? i.src : ""));
        expect(out[id].length).toBeGreaterThan(0);
      }
    }
    return out;
  };
  const tied = await drawn();
  await pick(page, "uni-show", "folded");
  await expect(page).toHaveURL(/show=folded/);
  const folded = await drawn();
  for (const id of Object.keys(tied)) expect(folded[id]).not.toBe(tied[id]);
  // Worn on the garment: the large view draws it, and the knot and the ends' length are choices kept in the address.
  await pick(page, "uni-show", "worn");
  await pick(page, "uni-belt-taekwondo", "itf-senior-4");
  await pick(page, "uni-knot", "single");
  await pick(page, "uni-tail", "55");
  await expect(page).toHaveURL(/belt=itf-senior-4/);
  await expect(page).toHaveURL(/knot=single/);
  await expect(page).toHaveURL(/tail=55/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="uni-knot"] [data-value="single"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="uni-tail"] [data-value="55"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="uni-belt-taekwondo"] [data-value="itf-senior-4"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  expect(errors.filter((e) => !/GL Driver|ReadPixels|WebGL/.test(e))).toEqual([]);
});

test("the trouser hem is a control, kept in the address, and survives a reload", async ({ page }) => {
  test.slow();
  await page.goto("/uniforms.html?garment=bjj-white");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await expect(page.locator('[data-testid="uni-hem"] [data-value="auto"]')).toHaveAttribute("aria-pressed", "true");
  await pick(page, "uni-hem", "10");
  await expect(page).toHaveURL(/hem=10/);
  await page.goto(page.url());
  await expect(page.locator('[data-testid="uni-hem"] [data-value="10"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await pick(page, "uni-hem", "auto");
  await expect(page).not.toHaveURL(/hem=/);
});
