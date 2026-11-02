import { expect, test } from "@playwright/test";

// The judogi designer must never ask a lot of the machine. Played in headless Chromium that draws WebGL in software (playwright.config.mjs; never on a Mac's own graphics card), these
// fail on a view that draws when nothing moves, that asks for more than one frame at a time, that leaves WebGL contexts or graphics memory behind when a choice changes, that draws
// while out of sight, and on a canvas past 6 million pixels or 4096 a side on a 5K screen.
const URL = "/judogi.html?mode=jacket&belt=black";
const MAX_PIXELS = 6_000_000;
const MAX_SIDE = 4096;
const vc = (page, name) => page.locator(`kazoku-view-controls ${name}`);

test.beforeEach(({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-desk", "WebGL is drawn in software in the desk Chromium; no other project draws it here");
});

/** Counts what the page asks of the graphics card and of the frame clock, from before any script runs. */
const COUNT = () => {
  const seen = { contexts: [], counts: new Map(), frames: 0, pending: new Set(), draws: 0 };
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const context = getContext.call(this, type, ...rest);
    if (context && /webgl/.test(type) && !seen.contexts.includes(context)) seen.contexts.push(context);
    return context;
  };
  for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    for (const kind of ["Buffer", "Texture", "VertexArray", "Program", "Framebuffer", "Renderbuffer"]) {
      for (const verb of ["create", "delete"]) {
        const original = proto[verb + kind];
        if (!original) continue;
        proto[verb + kind] = function (...args) {
          // by context: a context let go takes what it held with it, so only a live one counts
          const own = seen.counts.get(this) ?? { made: {}, freed: {} };
          seen.counts.set(this, own);
          const into = verb === "create" ? own.made : own.freed;
          into[kind] = (into[kind] ?? 0) + 1;
          return original.apply(this, args);
        };
      }
    }
    for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"]) {
      const original = proto[name];
      if (original) proto[name] = function (...args) { seen.draws++; return original.apply(this, args); };
    }
  }
  let last = -1;
  const frame = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    const id = frame((time) => {
      seen.pending.delete(id);
      if (time !== last) seen.frames++;
      last = time;
      callback(time);
    });
    seen.pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    seen.pending.delete(id);
    cancel(id);
  };
  window.__seen = seen;
};

const usage = (page) =>
  page.evaluate(() => {
    const seen = window.__seen;
    const live = (kind) => [...seen.counts].filter(([context]) => !context.isContextLost()).reduce((sum, [, own]) => sum + (own.made[kind] ?? 0) - (own.freed[kind] ?? 0), 0);
    return { contexts: seen.contexts.filter((context) => !context.isContextLost()).length, buffers: live("Buffer"), textures: live("Texture"), programs: live("Program"), draws: seen.draws, frames: seen.frames, pending: seen.pending.size };
  });
const canvas = (page) => page.locator("#judo-stage canvas");
/** The stage's canvas, painted by WebGL: a browser that cannot (or a page that fell back to 2D) skips the test rather than failing it. */
const reachGl = async (page) => {
  await expect(canvas(page)).toBeVisible({ timeout: 90_000 });
  const painter = await canvas(page).getAttribute("data-painter");
  test.skip(painter !== "webgl", `the stage was painted by ${painter}, not WebGL`);
};
const pick = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(COUNT);
});

test("at rest nothing is drawn and no frame waits", async ({ page }) => {
  await page.goto(URL);
  await reachGl(page);
  await page.waitForTimeout(1500);
  const before = await usage(page);
  await page.waitForTimeout(2500);
  const after = await usage(page);
  expect(after.draws - before.draws).toBe(0);
  expect(after.pending).toBeLessThanOrEqual(before.pending);
  expect(after.pending).toBeLessThanOrEqual(1);
});

test("while it turns, one frame is asked for at a time and it draws at most once a frame", async ({ page }) => {
  await page.goto(URL);
  await reachGl(page);
  await vc(page, '[data-b="play"]').click();
  await page.waitForTimeout(1500);
  const start = await usage(page);
  await expect.poll(async () => (await usage(page)).frames - start.frames, { timeout: 90_000 }).toBeGreaterThanOrEqual(20);
  const end = await usage(page);
  const frames = end.frames - start.frames;
  const draws = end.draws - start.draws;
  expect(draws).toBeGreaterThan(0);
  // a piece is a few draws; a loop that doubles every frame draws many times more. Allow the pieces' draws a frame, never a growing number.
  expect(draws / frames).toBeLessThanOrEqual(40);
  expect(end.pending).toBeLessThanOrEqual(3);
  await vc(page, '[data-b="play"]').click();
  // the turn stopped: nothing is drawn afterwards
  await page.waitForTimeout(600);
  const stopped = await usage(page);
  await page.waitForTimeout(1500);
  expect((await usage(page)).draws - stopped.draws).toBe(0);
});

test("a view scrolled out of sight draws nothing, even while it would turn", async ({ page }) => {
  await page.goto(URL);
  await reachGl(page);
  await vc(page, '[data-b="play"]').click();
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "8000px";
    document.body.append(spacer);
    window.scrollTo(0, document.body.scrollHeight);
  });
  // a slow runner takes a while to hear that the view left the screen: wait for it to stop, then it must stay stopped
  await expect
    .poll(
      async () => {
        const mark = (await usage(page)).draws;
        await page.waitForTimeout(1500);
        return (await usage(page)).draws - mark;
      },
      { timeout: 60_000, intervals: [500] },
    )
    .toBe(0);
});

test("changes give back what they took: contexts, buffers and textures do not grow", async ({ page }) => {
  await page.goto(URL);
  await reachGl(page);
  const round = async () => {
    for (const [id, value] of [["judo-colour", "blue"], ["judo-colour", "white"], ["judo-mode", "pants"], ["judo-mode", "jacket"], ["judo-colour", "blue"], ["judo-colour", "white"]]) {
      await canvas(page).evaluate((node) => (window.__old = node));
      await pick(page, id, value);
      await expect.poll(() => canvas(page).evaluate((node) => node !== window.__old && node.dataset.painter === "webgl"), { timeout: 90_000 }).toBe(true);
    }
    await page.waitForTimeout(600);
  };
  // the first round fills the caches that are kept on purpose
  await round();
  const first = await usage(page);
  await round();
  await round();
  const last = await usage(page);
  expect(last.contexts).toBeLessThanOrEqual(1);
  expect(last.buffers).toBeLessThanOrEqual(first.buffers);
  expect(last.textures).toBeLessThanOrEqual(first.textures);
  expect(last.programs).toBeLessThanOrEqual(first.programs);
});

test.describe("on a 5K screen", () => {
  test.use({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2 });

  test("the canvas stays inside its pixel budget", async ({ page }) => {
    await page.goto(URL);
    await reachGl(page);
    // as large as a page can make it: the stage the width and height of the screen
    await page.addStyleTag({ content: ".judo-layout, .stagebox, .stagepin { display: block !important; max-width: none !important; width: 100vw !important; } #judo-turntable { width: 100vw !important; height: 95vh !important; max-width: none !important; }" });
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await expect.poll(() => canvas(page).evaluate((node) => node.clientWidth), { timeout: 60_000 }).toBeGreaterThan(2000);
    for (const zoom of ["1", "2", "4"]) {
      await page.evaluate((z) => document.querySelector("kazoku-view-controls").set?.({ zoom: Number(z) }), zoom);
      await page.waitForTimeout(1500);
      const size = await canvas(page).evaluate((node) => ({ w: node.width, h: node.height }));
      expect(size.w * size.h, `${size.w} x ${size.h} at zoom ${zoom}`).toBeLessThanOrEqual(MAX_PIXELS);
      expect(Math.max(size.w, size.h)).toBeLessThanOrEqual(MAX_SIDE);
    }
  });
});
