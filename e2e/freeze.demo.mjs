import { expect, test } from "@playwright/test";

// The demo must never ask a lot of the machine. Played in headless Chromium, these fail on a draw loop that runs when nothing moves or more than once a frame, on more than one WebGL
// context, on graphics objects or script memory that grow with each change, on a canvas past its pixel budget, on a view that keeps drawing out of sight or in a hidden tab, and on a
// lost context that is not recovered. The counters are the same the family's kazoku-ui 0.9 `/testing` kit has, kept here so the demo stays on the view controls it ships with.
// A SOAK_MS environment variable lengthens the soak (600000 is ten minutes); the default is a minute.
const bar = (page) => page.locator("kazoku-view-controls");
const press = (page, id, value) => page.locator(`[data-testid="${id}"] [data-value="${value}"]`).click();
const canvas = (page, stage = "judo-stage") => page.locator(`#${stage} canvas`);
const MAX_PIXELS = 6_000_000;
const MAX_SIDE = 4096;

test.beforeEach(({ browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "chromium-desk", "the counts are made in the desk Chromium");
});

/** Counts what the page asks of the graphics card and of the frame loop, from before any script runs. */
const COUNT = () => {
  const c = { contexts: [], maxLive: 0, made: {}, freed: {}, frames: 0, requests: 0, callbacks: 0, maxChains: 0, outstanding: 0, maxOutstanding: 0 };
  const kinds = ["Buffer", "Texture", "VertexArray", "Program", "Framebuffer", "Renderbuffer", "Shader"];
  const getContext = window.HTMLCanvasElement.prototype.getContext;
  window.HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const context = getContext.call(this, type, ...rest);
    if (context && /webgl/.test(type) && !c.contexts.includes(context)) {
      c.contexts.push(context);
      c.maxLive = Math.max(c.maxLive, c.contexts.filter((x) => !x.isContextLost()).length);
    }
    return context;
  };
  for (const proto of [window.WebGLRenderingContext.prototype, window.WebGL2RenderingContext.prototype]) {
    for (const kind of kinds) {
      for (const [verb, into] of [["create", c.made], ["delete", c.freed]]) {
        const original = proto[verb + kind];
        if (!original) continue;
        proto[verb + kind] = function (...args) {
          if (verb === "create" || args[0]) into[kind] = (into[kind] ?? 0) + 1;
          return original.apply(this, args);
        };
      }
    }
  }
  // A "chain" is a callback that asks for the next frame from inside itself. The callbacks that do are counted per frame.
  let last = -1;
  let chains = 0;
  let inside = null;
  const raf = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  const live = new Set();
  window.requestAnimationFrame = (callback) => {
    c.requests++;
    if (inside) inside.asked = true;
    let id = 0;
    const mine = { asked: false };
    id = raf((time) => {
      live.delete(id);
      c.outstanding = live.size;
      c.callbacks++;
      if (time !== last) {
        c.frames++;
        last = time;
        chains = 0;
      }
      const before = inside;
      inside = mine;
      try {
        callback(time);
      } finally {
        inside = before;
        if (mine.asked) {
          chains++;
          c.maxChains = Math.max(c.maxChains, chains);
        }
      }
    });
    live.add(id);
    c.outstanding = live.size;
    c.maxOutstanding = Math.max(c.maxOutstanding, live.size);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    live.delete(id);
    c.outstanding = live.size;
    return cancel(id);
  };
  window.__seen = c;
};

const usage = (page) =>
  page.evaluate(() => {
    const c = window.__seen;
    const live = (kind) => (c.made[kind] ?? 0) - (c.freed[kind] ?? 0);
    const kinds = ["Buffer", "Texture", "VertexArray", "Program", "Framebuffer", "Renderbuffer", "Shader"];
    return {
      contexts: c.contexts.filter((x) => !x.isContextLost()).length,
      everLive: c.maxLive,
      gpu: kinds.reduce((sum, k) => sum + live(k), 0),
      textures: live("Texture"),
      buffers: live("Buffer"),
      programs: live("Program"),
      frames: c.frames,
      requests: c.requests,
      callbacks: c.callbacks,
      chains: c.maxChains,
      outstanding: c.maxOutstanding,
      paints: Number(document.querySelector("canvas[data-paints]")?.getAttribute("data-paints") ?? 0),
    };
  });
const heapOf = async (page) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("HeapProfiler.collectGarbage");
  const { usedSize } = await cdp.send("Runtime.getHeapUsage");
  await cdp.detach();
  return usedSize;
};
const settle = (page, ms) => page.waitForTimeout(ms);
const sizeOfCanvases = (page) =>
  page.evaluate(() => {
    const all = [...document.querySelectorAll("canvas")];
    return { pixels: Math.max(0, ...all.map((c) => c.width * c.height)), side: Math.max(0, ...all.map((c) => Math.max(c.width, c.height))), count: all.length };
  });
const hideTab = (page, hidden) =>
  page.evaluate((h) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => h });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (h ? "hidden" : "visible") });
    document.dispatchEvent(new window.Event("visibilitychange"));
  }, hidden);
const ready = async (page, url, stage = "judo-stage") => {
  await page.goto(url);
  await expect(canvas(page, stage)).toBeVisible();
  await expect(canvas(page, stage)).toHaveAttribute("data-painter", /^(webgl|2d)$/);
  await bar(page).evaluate((node) => node.pause());
  // the turn runs down (the controls glide to a stop) before anything is counted
  await settle(page, 1200);
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(COUNT);
});

for (const [name, url, stage] of [["judogi designer", "/judogi.html?mode=suit", "judo-stage"], ["uniforms page", "/uniforms.html", "uni-stage"]]) {
  test.describe(name, () => {
    test("nothing is drawn, asked for or counted while it stands still, and the count of contexts is one", async ({ page }) => {
      await ready(page, url, stage);
      const before = await usage(page);
      await settle(page, 3000);
      const after = await usage(page);
      console.log(`${name} idle 3 s: paints ${after.paints - before.paints}, frames ${after.frames - before.frames}, frame requests ${after.requests - before.requests}, callbacks ${after.callbacks - before.callbacks}`);
      expect(after.paints - before.paints).toBe(0);
      expect(after.requests - before.requests).toBe(0);
      expect(after.callbacks - before.callbacks).toBe(0);
      expect(after.contexts).toBe(1);
      // one context at a time over the whole load, tiles included
      expect(after.everLive).toBeLessThanOrEqual(1);
    });

    test("turning paints at most once a frame and from one frame loop, and stops asking when it stops", async ({ page }) => {
      await ready(page, url, stage);
      const before = await usage(page);
      await bar(page).evaluate((node) => node.play());
      await settle(page, 3000);
      const after = await usage(page);
      const paints = after.paints - before.paints;
      const frames = after.frames - before.frames;
      console.log(`${name} turning 3 s: paints ${paints}, page frames ${frames}, most frame loops ${after.chains}, most frames asked at once ${after.outstanding}`);
      expect(paints).toBeGreaterThan(10);
      expect(paints).toBeLessThanOrEqual(frames + 2);
      // a cap of about 60 a second, however fast the screen
      expect(paints).toBeLessThanOrEqual(3 * 62);
      expect(after.chains).toBeLessThanOrEqual(1);
      expect(after.outstanding).toBeLessThanOrEqual(2);
      await bar(page).evaluate((node) => node.pause());
      await settle(page, 1500);
      const stopped = await usage(page);
      await settle(page, 2500);
      const quiet = await usage(page);
      expect(quiet.paints - stopped.paints).toBe(0);
      expect(quiet.callbacks - stopped.callbacks).toBe(0);
    });

    test("out of sight, and in a hidden tab, it paints nothing while the controls keep turning, and paints again when it is back", async ({ page }) => {
      await ready(page, url, stage);
      await bar(page).evaluate((node) => node.play());
      await settle(page, 600);
      await hideTab(page, true);
      await settle(page, 500);
      const hidden = await usage(page);
      await settle(page, 2000);
      const hiddenAfter = await usage(page);
      expect(hiddenAfter.paints - hidden.paints).toBe(0);
      await hideTab(page, false);
      await expect.poll(async () => (await usage(page)).paints, { timeout: 5000 }).toBeGreaterThan(hiddenAfter.paints);
      // scrolled away
      await page.evaluate(() => {
        const spacer = document.createElement("div");
        spacer.id = "spacer";
        spacer.style.height = "6000px";
        document.body.append(spacer);
        window.scrollTo(0, 5500);
      });
      await settle(page, 800);
      const away = await usage(page);
      await settle(page, 2000);
      const awayAfter = await usage(page);
      console.log(`${name} out of sight 2 s: paints ${awayAfter.paints - away.paints}, callbacks ${awayAfter.callbacks - away.callbacks}`);
      expect(awayAfter.paints - away.paints).toBe(0);
      expect(awayAfter.callbacks - away.callbacks).toBeLessThanOrEqual(2);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(async () => (await usage(page)).paints, { timeout: 5000 }).toBeGreaterThan(awayAfter.paints);
      await bar(page).evaluate((node) => node.pause());
    });

    test("changes give back what they took: contexts, graphics objects and script memory do not grow", async ({ page }) => {
      test.setTimeout(240_000);
      await ready(page, url, stage);
      const round = async () => {
        if (stage === "judo-stage") {
          for (const [id, value] of [["judo-colour", "blue"], ["judo-mode", "jacket"], ["judo-mode", "belt"], ["judo-mode", "suit"], ["judo-colour", "white"]]) {
            await press(page, id, value);
            await settle(page, 400);
          }
        } else {
          for (const [id, value] of [["uni-garment", "judogi-blue"], ["uni-belt", "brown"], ["uni-show", "folded"], ["uni-show", "worn"], ["uni-garment", "judogi-white"]]) {
            await press(page, id, value);
            await settle(page, 400);
          }
        }
        await settle(page, 600);
      };
      // the first round fills what is kept on purpose
      await round();
      const first = { used: await usage(page), heap: await heapOf(page) };
      for (let i = 0; i < 4; i++) await round();
      const last = { used: await usage(page), heap: await heapOf(page) };
      console.log(`${name} after 20 changes: contexts ${last.used.contexts}, graphics objects ${first.used.gpu} -> ${last.used.gpu}, textures ${first.used.textures} -> ${last.used.textures}, heap ${(first.heap / 1e6).toFixed(1)} -> ${(last.heap / 1e6).toFixed(1)} MB`);
      expect(last.used.contexts).toBe(1);
      expect(last.used.gpu).toBeLessThanOrEqual(first.used.gpu);
      expect(last.used.textures).toBeLessThanOrEqual(first.used.textures);
      expect(last.used.buffers).toBeLessThanOrEqual(first.used.buffers);
      expect(last.heap).toBeLessThanOrEqual(first.heap + 12e6);
      expect(last.used.everLive).toBeLessThanOrEqual(1);
    });

    test("a lost context leaves the picture, the 2D painter takes over, and the card paints again when it is back", async ({ page }) => {
      await ready(page, url, stage);
      await expect(canvas(page, stage)).toHaveAttribute("data-painter", "webgl");
      const filled = () =>
        canvas(page, stage).evaluate((node) => {
          const copy = document.createElement("canvas");
          copy.width = node.width;
          copy.height = node.height;
          const g = copy.getContext("2d", { willReadFrequently: true });
          g.drawImage(node, 0, 0);
          const data = g.getImageData(0, 0, copy.width, copy.height).data;
          let n = 0;
          for (let i = 3; i < data.length; i += 4 * 97) if (data[i] > 24) n++;
          return n;
        });
      const before = await filled();
      expect(before).toBeGreaterThan(50);
      await page.evaluate(() => {
        // the extension is asked for while the context is alive: a lost context gives none
        window.__lose = window.__seen.contexts.find((x) => !x.isContextLost())?.getExtension("WEBGL_lose_context");
        window.__lose?.loseContext();
      });
      await expect(canvas(page, stage)).toHaveAttribute("data-painter", "2d", { timeout: 10_000 });
      // the picture is still there, and a turn paints it on the 2D canvas
      expect(await filled()).toBeGreaterThan(50);
      const paints = (await usage(page)).paints;
      await bar(page).evaluate((node) => node.set({ yaw: 70 }));
      await expect.poll(async () => (await usage(page)).paints, { timeout: 10_000 }).toBeGreaterThan(paints);
      expect(await filled()).toBeGreaterThan(50);
      await page.evaluate(() => window.__lose?.restoreContext());
      await expect(canvas(page, stage)).toHaveAttribute("data-painter", "webgl", { timeout: 15_000 });
      expect(await filled()).toBeGreaterThan(50);
      const again = (await usage(page)).paints;
      await bar(page).evaluate((node) => node.set({ yaw: 110 }));
      await expect.poll(async () => (await usage(page)).paints, { timeout: 10_000 }).toBeGreaterThan(again);
      expect(await filled()).toBeGreaterThan(50);
      expect((await usage(page)).contexts).toBe(1);
    });
  });
}

test("reduced motion: nothing turns by itself, not even under the mouse, and nothing is drawn", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript(COUNT);
  try {
    for (const [url, stage, view] of [["/judogi.html?mode=suit", "judo-stage", "#judo-turntable"], ["/uniforms.html", "uni-stage", "#uni-turntable"]]) {
      await page.goto(url);
      await expect(canvas(page, stage)).toBeVisible();
      await settle(page, 800);
      await page.locator(view).hover();
      const before = await usage(page);
      await settle(page, 2000);
      const after = await usage(page);
      expect(await bar(page).evaluate((node) => node.state.turning)).toBe(false);
      expect(after.paints - before.paints).toBe(0);
      expect(after.callbacks - before.callbacks).toBe(0);
    }
    // the jersey page: even asked to turn by itself in the address, a reader who prefers less motion gets it still
    await page.goto("/?turn=1");
    await settle(page, 1500);
    const before = await usage(page);
    await settle(page, 2000);
    const after = await usage(page);
    expect(after.callbacks - before.callbacks).toBe(0);
  } finally {
    await context.close();
  }
});

test.describe("on a 5K screen", () => {
  test.use({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 2 });

  test("the canvas stays inside 4096 pixels a side and 6 million, at every zoom, whatever the box and the ratio asked for", async ({ page }) => {
    test.setTimeout(240_000);
    await ready(page, "/judogi.html?mode=suit");
    for (const zoom of [1, 2, 4, 8]) {
      await bar(page).evaluate((node, z) => node.set({ zoom: z }), zoom);
      await expect.poll(async () => canvas(page).evaluate((n) => Number(n.getAttribute("data-fit")) > 0)).toBe(true);
      await settle(page, 700);
      const size = await sizeOfCanvases(page);
      console.log(`5K DPR 2 zoom ${zoom}: biggest canvas ${size.pixels} pixels, ${size.side} a side, ${size.count} canvases`);
      expect(size.pixels).toBeLessThanOrEqual(MAX_PIXELS);
      expect(size.side).toBeLessThanOrEqual(MAX_SIDE);
    }
    // the library on its own: a box as wide as a 5K screen at the sharpest ratio a caller can ask for, with and without the card
    const asked = await page.evaluate(async () => {
      const { judogiFrame } = await import("/dist/index.js");
      const { judogiCanvas } = await import("/dist/turn-entry.js");
      const out = [];
      for (const webgl of [true, false]) {
        for (const [width, height, pixelRatio] of [[5120, 2880, 4], [2560, 1440, 4], [9000, 700, 3], [300, 400, 4]]) {
          const holder = document.createElement("div");
          holder.innerHTML = judogiFrame({ cut: "judogi", bare: true, width: 360 });
          const svg = holder.firstElementChild ?? document.createElementNS("http://www.w3.org/2000/svg", "svg");
          const made = await judogiCanvas(svg, { box: { width, height }, fill: true, pixelRatio, webgl });
          if (made === undefined) {
            out.push({ webgl, width, height, pixelRatio, made: false });
            continue;
          }
          made.turn(30, 0);
          out.push({ webgl, width, height, pixelRatio, made: true, w: made.canvas.width, h: made.canvas.height });
          made.dispose();
        }
      }
      return out;
    });
    console.log(`library, box and ratio: ${JSON.stringify(asked.map((a) => `${a.width}x${a.height}@${a.pixelRatio}${a.webgl ? "" : " 2d"} -> ${a.w}x${a.h}`))}`);
    const made = asked.filter((a) => a.made);
    expect(made.length).toBeGreaterThanOrEqual(6);
    for (const a of made) {
      expect(a.w * a.h).toBeLessThanOrEqual(MAX_PIXELS);
      expect(Math.max(a.w, a.h)).toBeLessThanOrEqual(MAX_SIDE);
    }
  });
});

test.describe("the jersey page", () => {
  test("nothing runs at rest, one frame loop while turning, none out of sight or in a hidden tab", async ({ page }) => {
    await page.goto("/");
    await settle(page, 2500);
    const rest = await usage(page);
    await settle(page, 2500);
    const restAfter = await usage(page);
    expect(restAfter.callbacks - rest.callbacks).toBe(0);
    const play = page.locator('[data-testid="play"]');
    await expect(play).toBeVisible();
    await play.click();
    await settle(page, 600);
    const a = await usage(page);
    await settle(page, 3000);
    const b = await usage(page);
    console.log(`jersey page turning 3 s: callbacks ${b.callbacks - a.callbacks}, frames ${b.frames - a.frames}, most frame loops ${b.chains}, most frames asked at once ${b.outstanding}`);
    expect(b.callbacks - a.callbacks).toBeGreaterThan(10);
    expect(b.chains).toBeLessThanOrEqual(1);
    expect(b.outstanding).toBeLessThanOrEqual(2);
    expect(b.callbacks - a.callbacks).toBeLessThanOrEqual(3 * 62 + 4);
    await hideTab(page, true);
    await settle(page, 400);
    const hidden = await usage(page);
    await settle(page, 1500);
    expect((await usage(page)).callbacks - hidden.callbacks).toBe(0);
    await hideTab(page, false);
    await page.evaluate(() => {
      // the stage is pinned to the top of the page: put it far below the screen
      for (const pin of document.querySelectorAll(".stagepin")) pin.style.cssText = "position: absolute; top: 20000px; left: 0; right: 0";
      const spacer = document.createElement("div");
      spacer.style.height = "9000px";
      document.body.prepend(spacer);
      window.scrollTo(0, 8800);
    });
    await settle(page, 800);
    const away = await usage(page);
    await settle(page, 2000);
    const awayAfter = await usage(page);
    console.log(`jersey page out of sight 2 s: callbacks ${awayAfter.callbacks - away.callbacks}`);
    expect(awayAfter.callbacks - away.callbacks).toBeLessThanOrEqual(2);
  });
});

test("soak: turning, with a change every two seconds, leaves the memory and the graphics objects flat", async ({ page }) => {
  const soak = Number(process.env.SOAK_MS ?? 60_000);
  test.setTimeout(soak + 180_000);
  await ready(page, "/judogi.html?mode=suit");
  const colours = ["blue", "white"];
  // the colour is a choice of the jacket and the trousers, so every mode here has it
  const modes = ["jacket", "pants", "suit"];
  await bar(page).evaluate((node) => node.play());
  const samples = [];
  const started = Date.now();
  let n = 0;
  let nextSample = started + Math.min(10_000, soak / 6);
  const every = Math.min(10_000, soak / 6);
  while (Date.now() - started < soak) {
    await press(page, "judo-colour", colours[n % colours.length]);
    if (n % 3 === 2) await press(page, "judo-mode", modes[Math.floor(n / 3) % modes.length]);
    n++;
    await settle(page, 2000);
    if (Date.now() >= nextSample) {
      nextSample += every;
      const u = await usage(page);
      const heap = await heapOf(page);
      samples.push({ at: Math.round((Date.now() - started) / 1000), heap, gpu: u.gpu, textures: u.textures, contexts: u.contexts, paints: u.paints, canvases: (await sizeOfCanvases(page)).count });
    }
  }
  console.log(`soak ${Math.round(soak / 1000)} s, ${n} changes:\n${samples.map((s) => `  ${String(s.at).padStart(4)} s  heap ${(s.heap / 1e6).toFixed(1)} MB  graphics objects ${s.gpu}  textures ${s.textures}  contexts ${s.contexts}  canvases ${s.canvases}`).join("\n")}`);
  expect(samples.length).toBeGreaterThanOrEqual(4);
  const third = Math.max(1, Math.floor(samples.length / 3));
  const mean = (list) => list.reduce((s, x) => s + x, 0) / list.length;
  const early = mean(samples.slice(0, third).map((s) => s.heap));
  const late = mean(samples.slice(-third).map((s) => s.heap));
  expect(late).toBeLessThanOrEqual(early + 15e6);
  for (const s of samples) expect(s.contexts).toBe(1);
  // the number of graphics objects moves a little with what is on show (a belt has fewer pieces than a suit); it never climbs
  expect(Math.max(...samples.map((s) => s.gpu))).toBeLessThanOrEqual(Math.min(...samples.map((s) => s.gpu)) + 8);
  expect(Math.max(...samples.map((s) => s.canvases))).toBeLessThanOrEqual(Math.min(...samples.map((s) => s.canvases)) + 2);
});
