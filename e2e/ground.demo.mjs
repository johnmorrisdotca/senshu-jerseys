import { expect, test } from "@playwright/test";
import { checkFollowsTheHand } from "./ground.mjs";

// The family's drag rule on the judogi designer (WebGL): the surface under the pointer follows the pointer. e2e/ground.mjs is kazoku-ui's templates/e2e-ground.mjs, copied unchanged.
// The jersey's own turn is measured in demo.demo.mjs. The arrow keys are in judogi.demo.mjs ("the arrow keys turn and tip the view").
test("the judogi jacket follows the hand: a drag right and up, and Auto-turn", async ({ page }) => {
  await page.goto("/judogi.html?mode=jacket&view=front&belt=black");
  await expect(page.locator("#judo-turntable")).toBeVisible();
  await page.waitForTimeout(5000);
  await page.locator("kazoku-view-controls").evaluate((el) => el.pause());
  // A drag across 12% of the view's width turns it by about 22 degrees, at a phone's width and a desk's.
  const { width } = await page.locator("#judo-turntable").boundingBox();
  await checkFollowsTheHand(page, { view: "#judo-turntable", controls: "kazoku-view-controls", keys: false, autoTurn: "right", settle: 1500, distance: Math.round(width * 0.12), min: 1, window: [0.4, 0.62, 0.15, 0.85] });
});
