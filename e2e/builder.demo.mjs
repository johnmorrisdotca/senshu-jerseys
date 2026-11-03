// The builder page: each row of choices redraws the jersey and rewrites the code, the number and the name are fields, and nothing is wider than the screen.
import { expect, test } from "@playwright/test";

test("a choice redraws the jersey and rewrites the code", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto("/builder.html");
  await page.waitForSelector('body[data-ready="true"]');
  await expect(page.locator('[data-testid="stage"] > svg')).toBeVisible();
  await expect(page.locator('[data-testid="code"]')).toContainText('cut="hockey"');
  await page.locator('[data-choice="cut"] button[data-value="soccer"]').click();
  await expect(page.locator('[data-testid="code"]')).toContainText('cut="soccer"');
  await page.locator('[data-testid="number"]').fill("10");
  await page.locator('[data-testid="name"]').fill("Gray");
  await expect(page.locator('[data-testid="stage"]')).toContainText("number 10");
  await page.locator('#tabs button[data-way="iframe"]').click();
  await expect(page.locator('[data-testid="code"]')).toContainText("embed.html?cut=soccer");
  await page.locator('#tabs button[data-way="module"]').click();
  await expect(page.locator('[data-testid="code"]')).toContainText("renderJersey");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
