// Centre and the pan clamp on the designer and the Uniforms page, with a real pointer: zoom in, drag far off, the piece is still in view, press Centre and it is back in the middle at Fit.
// The shared drag rule (a drag right turns it right, up lifts it, Auto-turn goes right) is in ground.demo.mjs; the arrow keys are in judogi.demo.mjs.
import { expect, test } from "@playwright/test";

// The bar opens at its basic level; the Centre button is among the rest on a phone, which More opens and the controls remember.
test.beforeEach(({ page }) => page.addInitScript(() => { try { window.localStorage.setItem("kazoku-view-controls", "advanced"); } catch { /* a page with no storage */ } }));

const bar = (page) => page.locator("kazoku-view-controls");
const part = (page, name) => page.locator(`kazoku-view-controls [data-b="${name}"]`);
const seen = (page) => bar(page).evaluate((el) => ({ yaw: el.state.yaw, tilt: el.state.tilt, zoom: el.state.zoom, panX: el.state.panX, panY: el.state.panY }));
/** How much of the drawn piece (the canvas's own `data-bounds`, in its own pixels) is inside the canvas, as a share of the piece's width and height, and where its middle is against the canvas's. */
const where = (page, stage) =>
  page.locator(`#${stage} canvas`).evaluate((c) => {
    const [w, h] = (c.getAttribute("data-size") ?? "").split(" ").map(Number);
    const [x0, y0, x1, y1] = (c.getAttribute("data-bounds") ?? "").split(" ").map(Number);
    return { shareX: (Math.min(x1, w) - Math.max(x0, 0)) / (x1 - x0), shareY: (Math.min(y1, h) - Math.max(y0, 0)) / (y1 - y0), dx: (x0 + x1) / 2 - w / 2, dy: (y0 + y1) / 2 - h / 2, w, h };
  });
const dragFar = async (page, view, dx, dy) => {
  await page.locator(view).scrollIntoViewIfNeeded();
  const box = await page.locator(view).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + (dx * i) / 8, y + (dy * i) / 8);
  await page.mouse.up();
};

for (const [name, url, view, stage] of [
  ["the designer", "/judogi.html?mode=jacket&belt=black", "#judo-turntable", "judo-stage"],
  ["the Uniforms page", "/uniforms.html?garment=jacket", "#uni-turntable", "uni-stage"],
]) {
  test(`${name}: Centre comes in once the view is moved, a drag far off cannot lose the piece, and Centre puts it back`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator(`#${stage} canvas`)).toBeVisible();
    await bar(page).evaluate((el) => el.pause());
    await expect(part(page, "centre")).toBeHidden();
    const zoomIn = part(page, "in");
    for (let i = 0; i < 3; i++) await zoomIn.click();
    await expect(part(page, "centre")).toBeVisible();
    for (const [dx, dy] of [[4000, 0], [-8000, 0], [0, 4000], [0, -8000], [5000, 5000]]) {
      await dragFar(page, view, dx, dy);
      await page.waitForTimeout(250);
      const at = await where(page, stage);
      expect(Math.min(at.shareX, at.shareY), `after a drag of ${dx},${dy} a quarter of the piece is still in view each way`).toBeGreaterThanOrEqual(0.22);
    }
    expect(Math.abs((await seen(page)).panX) + Math.abs((await seen(page)).panY)).toBeGreaterThan(50);
    await part(page, "centre").click();
    await expect.poll(async () => await seen(page)).toMatchObject({ zoom: 1, panX: 0, panY: 0, yaw: 0, tilt: 0 });
    await expect(part(page, "centre")).toBeHidden();
    await expect.poll(async () => {
      const back = await where(page, stage);
      return Math.max(Math.abs(back.dx), Math.abs(back.dy)) < Math.max(back.w, back.h) * 0.08;
    }, { message: "the piece is back in the middle of the view" }).toBe(true);
  });
}

test("the Home key is Centre without the move", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&belt=black");
  await expect(page.locator("#judo-stage canvas")).toBeVisible();
  await bar(page).evaluate((el) => el.pause());
  await part(page, "in").click();
  await part(page, "in").click();
  await dragFar(page, "#judo-turntable", 400, 200);
  await page.locator("#judo-turntable").focus();
  await page.keyboard.press("Home");
  await expect.poll(async () => await seen(page)).toMatchObject({ zoom: 1, panX: 0, panY: 0 });
});
