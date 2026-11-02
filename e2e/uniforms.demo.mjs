import { expect, test } from "@playwright/test";

// The Uniforms page: every garment and belt is a picture tile, the chosen garment turns, every choice is in the address, and no control is left in the browser's own style.
const pick = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();
const BJJ_TILES = ["bjj-white", "bjj-white-ibjjf", "bjj-white-covered", "bjj-blue", "bjj-blue-ibjjf", "bjj-blue-covered", "bjj-black", "bjj-black-ibjjf", "bjj-black-covered"];
const DOBOK_TILES = ["dobok-wt", "dobok-wt-poom", "dobok-wt-dan", "dobok-itf", "dobok-itf-dan", "dobok-itf-dan5"];
// The view controls are the shared <kazoku-view-controls>: its parts are inside its shadow root, which these selectors reach.
const PARTS = { yaw: "#yaw", tilt: "#tilt", play: '[data-b="play"]', in: '[data-b="in"]', fit: '[data-b="fit"]', pan: '[data-g="pan"]', left: '[data-b="left"]', right: '[data-b="right"]', up: '[data-b="up"]', down: '[data-b="down"]', turn: '[data-b="turn"]' };
const vc = (page, name) => page.locator(`kazoku-view-controls ${PARTS[name]}`);
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
  await vc(page, "yaw").fill("40");
  await expect(page).toHaveURL(/garment=judogi-blue/);
  await expect(page).toHaveURL(/belt=tip-red-degrees-3/);
  await expect(page).toHaveURL(/yaw=40/);
  await pick(page, "uni-show", "folded");
  await expect(page).toHaveURL(/show=folded/);
  await vc(page, "in").click();
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
  const play = vc(page, "play");
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

// ---- Framing, zoom and panning of the large view ----
const SIZE = (page) => page.locator("#uni-stage canvas").evaluate((c) => { const [w, h] = (c.getAttribute("data-size") ?? "").split(" ").map(Number); return { b: (c.getAttribute("data-bounds") ?? "").split(" ").map(Number), w, h, fit: Number(c.getAttribute("data-fit")) }; });
const inside = async (page, where) => {
  const r = await SIZE(page);
  expect(r.b.length, where).toBe(4);
  expect(r.fit, where).toBeLessThanOrEqual(1);
  expect(r.b[0], `${where}: left`).toBeGreaterThanOrEqual(-1);
  expect(r.b[1], `${where}: top`).toBeGreaterThanOrEqual(-1);
  expect(r.b[2], `${where}: right`).toBeLessThanOrEqual(r.w + 1);
  expect(r.b[3], `${where}: bottom`).toBeLessThanOrEqual(r.h + 1);
};
/** Nothing is painted along the canvas's four edges: every edge pixel of its picture is the view's own colour. */
const edgesClear = async (page, where) => {
  const png = (await page.locator("#uni-stage canvas").screenshot()).toString("base64");
  const bad = await page.evaluate(async (data) => {
    const img = await window.createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const px = (x, y) => g.getImageData(x, y, 1, 1).data;
    const ref = px(48, 48);
    let n = 0;
    const off = (x, y) => { const p = px(x, y); if (Math.abs(p[0] - ref[0]) + Math.abs(p[1] - ref[1]) + Math.abs(p[2] - ref[2]) > 12) n++; };
    // The view's rounded corners are left out.
    for (let x = 40; x < c.width - 40; x += 2) { off(x, 1); off(x, c.height - 2); }
    for (let y = 40; y < c.height - 40; y += 2) { off(1, y); off(c.width - 2, y); }
    return n;
  }, png);
  expect(bad, `${where}: pixels on the canvas's edge`).toBe(0);
};
const KINDS = ["judogi-white", "karate-full", "dobok-wt", "dobok-itf-dan", "bjj-white-covered"];

test("at 1x every garment, in every display and with the longest belt ends, fits the view at every angle and tilt", async ({ page }) => {
  test.setTimeout(300000);
  for (const garment of KINDS) {
    for (const show of ["worn", "belt", "folded"]) {
      await page.goto(`/uniforms.html?garment=${garment}&show=${show}&tail=55&knot=hanging&belt=red-white`);
      await expect(page.locator("#uni-stage canvas")).toBeVisible();
      for (const tilt of [-30, 0, 30]) {
        await vc(page, "tilt").fill(String(tilt));
        for (const yaw of [-179, 0, 90]) {
          await vc(page, "yaw").fill(String(yaw));
          await inside(page, `${garment} ${show} yaw ${yaw} tilt ${tilt}`);
        }
      }
    }
  }
});

test("at 1x nothing is cut at the canvas's edge at the extreme angles (what is painted, not only what is measured)", async ({ page }) => {
  test.setTimeout(300000);
  for (const garment of ["judogi-white", "karate-full", "bjj-white-covered"]) {
    for (const show of ["worn", "belt", "folded"]) {
      await page.goto(`/uniforms.html?garment=${garment}&show=${show}&tail=55&knot=hanging&belt=red-white`);
      await expect(page.locator("#uni-stage canvas")).toBeVisible();
      for (const [yaw, tilt] of [[-179, -30], [90, 30], [0, -30], [-179, 30]]) {
        await vc(page, "tilt").fill(String(tilt));
        await vc(page, "yaw").fill(String(yaw));
        await edgesClear(page, `${garment} ${show} yaw ${yaw} tilt ${tilt}`);
      }
    }
  }
});

test("John's case: the belt at -179 degrees, -30 tilt and 2x is not cut by the canvas, and the arrow buttons bring every part of it into view", async ({ page }) => {
  await page.goto("/uniforms.html?garment=judogi-white&show=belt&belt=red-white&yaw=-179&tilt=-30&zoom=2");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const view = await page.locator('[data-testid="uni-turntable"]').boundingBox();
  const canvas = await page.locator("#uni-stage canvas").boundingBox();
  // The canvas is the whole of the view, so a zoomed drawing is never cut inside it.
  expect(Math.abs(canvas.width - view.width)).toBeLessThan(2);
  expect(Math.abs(canvas.height - view.height)).toBeLessThan(2);
  await expect(vc(page, "pan")).toBeVisible();
  const top = async () => (await SIZE(page)).b[1];
  for (let i = 0; i < 4 && (await top()) < 0; i++) {
    await vc(page, "down").click();
    await page.waitForTimeout(150);
  }
  expect(await top()).toBeGreaterThanOrEqual(-1);
});

test("the + button zooms about the piece's middle, and a Ctrl-wheel or a double press zooms about the pointer", async ({ page }) => {
  await page.goto("/uniforms.html?garment=judogi-white&show=belt&belt=red-white");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  // The middle of the piece as it is turned (its silhouette), which is not always the canvas's middle: at -179 degrees and -30 tilt the belt lies high.
  for (const [yaw, tilt] of [[0, 0], [-179, -30], [90, 30]]) {
    await vc(page, "tilt").fill(String(tilt));
    await vc(page, "yaw").fill(String(yaw));
    await page.waitForTimeout(300);
    const b0 = (await SIZE(page)).b;
    await vc(page, "in").click();
    await page.waitForTimeout(500);
    const b1 = (await SIZE(page)).b;
    const k = (b1[2] - b1[0]) / (b0[2] - b0[0]);
    expect(k, `${yaw} ${tilt}`).toBeGreaterThan(1.3);
    const mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
    expect(Math.abs(mid(b1)[0] - mid(b0)[0]), `${yaw} ${tilt}: x`).toBeLessThan(3);
    expect(Math.abs(mid(b1)[1] - mid(b0)[1]), `${yaw} ${tilt}: y`).toBeLessThan(3);
    await vc(page, "fit").click();
  }
  await vc(page, "fit").click();
  // A point of the view stays where it is while the zoom grows round it.
  const box = await page.locator('[data-testid="uni-turntable"]').boundingBox();
  const [px, py] = [box.x + box.width * 0.3, box.y + box.height * 0.3];
  const c0 = (await SIZE(page)).b;
  await page.mouse.move(px, py);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -120);
  await page.keyboard.up("Control");
  await page.waitForTimeout(600);
  const c1 = (await SIZE(page)).b;
  const z = (c1[2] - c1[0]) / (c0[2] - c0[0]);
  expect(z).toBeGreaterThan(1.5);
  const [qx, qy] = [px - box.x, py - box.y];
  expect(Math.abs(c1[0] - (qx + z * (c0[0] - qx)))).toBeLessThan(3);
  expect(Math.abs(c1[1] - (qy + z * (c0[1] - qy)))).toBeLessThan(3);
});

test("zoomed in, a drag moves the view, the Turn button turns it, the arrows move it and the choices are kept in the address", async ({ page }) => {
  test.slow();
  await page.goto("/uniforms.html?garment=judogi-white&show=belt&belt=red-white&zoom=3");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const drag = async (dx) => {
    const box = await page.locator('[data-testid="uni-turntable"]').boundingBox();
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down();
    const yaw0 = Number(await page.locator("#uni-stage canvas").getAttribute("data-yaw"));
    const b0 = (await SIZE(page)).b;
    await page.mouse.move(x + dx, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    return { turned: Math.abs(Number(await page.locator("#uni-stage canvas").getAttribute("data-yaw")) - yaw0), moved: (await SIZE(page)).b[0] - b0[0] };
  };
  let r = await drag(60);
  expect(r.turned).toBeLessThan(2);
  expect(r.moved).toBeGreaterThan(20);
  await vc(page, "turn").click();
  await expect(page).toHaveURL(/drag=turn/);
  r = await drag(120);
  expect(r.turned).toBeGreaterThan(10);
  await page.goto(page.url());
  await expect(vc(page, "turn")).toHaveAttribute("aria-pressed", "true");
  for (const dir of ["left", "right", "up", "down"]) await expect(vc(page, dir)).toBeVisible();
  await vc(page, "fit").click();
  await expect(vc(page, "pan")).toBeHidden();
});

test("on a finger one touch turns the piece at 1x and moves it when zoomed", async ({ page, browserName }, info) => {
  test.skip(!info.project.name.endsWith("phone") || browserName !== "chromium", "touch is driven through the chromium phone");
  await page.goto("/uniforms.html?garment=judogi-white&show=belt&belt=red-white");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  const touch = async (dx) => {
    const box = await page.locator('[data-testid="uni-turntable"]').boundingBox();
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    const yaw0 = Number(await page.locator("#uni-stage canvas").getAttribute("data-yaw"));
    const b0 = (await SIZE(page)).b;
    await page.locator('[data-testid="uni-turntable"]').evaluate((node, a) => {
      const ev = (type, px) => node.dispatchEvent(new PointerEvent(type, { pointerId: 9, pointerType: "touch", isPrimary: true, bubbles: true, clientX: px, clientY: a.y, button: 0 }));
      ev("pointerdown", a.x);
      for (let i = 1; i <= 6; i++) ev("pointermove", a.x + (a.dx * i) / 6);
      ev("pointerup", a.x + a.dx);
    }, { x, y, dx });
    await page.waitForTimeout(500);
    return { turned: Math.abs(Number(await page.locator("#uni-stage canvas").getAttribute("data-yaw")) - yaw0), moved: (await SIZE(page)).b[0] - b0[0] };
  };
  let r = await touch(80);
  expect(r.turned).toBeGreaterThan(10);
  await vc(page, "in").click();
  await vc(page, "in").click();
  r = await touch(60);
  expect(r.turned).toBeLessThan(2);
  expect(r.moved).toBeGreaterThan(15);
});
