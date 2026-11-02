import { expect, test } from "@playwright/test";

// The row of gi besides judo: on the home page, the designer and the Uniforms page, every karate, jiu-jitsu and taekwondo garment the package draws has a labelled tile with its
// own picture, in English and in Japanese, and choosing one opens it, turning, with its controls.
const ARTS = {
  karate: ["karate-full", "karate-three-quarter", "karate-short", "karate-kumite", "karate-kata", "karate-plain"],
  bjj: ["bjj-white", "bjj-white-ibjjf", "bjj-white-covered", "bjj-blue", "bjj-blue-ibjjf", "bjj-blue-covered", "bjj-black", "bjj-black-ibjjf", "bjj-black-covered"],
  taekwondo: ["dobok-wt", "dobok-wt-poom", "dobok-wt-dan", "dobok-itf", "dobok-itf-dan", "dobok-itf-dan5"],
};
const ALL = Object.values(ARTS).flat();

for (const lang of ["en", "ja"]) {
  for (const path of ["/", "/judogi.html", "/uniforms.html"]) {
    test(`${path}: every non-judo gi has a labelled picture tile (${lang})`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${path}?lang=${lang}`);
      const row = page.locator('[data-testid="gi-row"]');
      await row.scrollIntoViewIfNeeded();
      await expect(row.locator(".gi-group")).toHaveCount(3);
      for (const [art, ids] of Object.entries(ARTS)) {
        await expect(row.locator(`.gi-group[data-art="${art}"] .gi-tile`)).toHaveCount(ids.length);
      }
      for (const id of ALL) {
        const tile = row.locator(`[data-garment="${id}"]`);
        await tile.scrollIntoViewIfNeeded();
        // its own picture, drawn from the package, not a blank
        await expect(tile).toHaveAttribute("data-ready", "1", { timeout: 60_000 });
        expect(await tile.locator("img").evaluate((img) => img.naturalWidth)).toBeGreaterThanOrEqual(8);
        // labelled, in the page's language, and a finger wide
        const label = (await tile.locator(".judo-cap").textContent()) ?? "";
        expect(label.length).toBeGreaterThan(3);
        if (lang === "ja") expect(label).toMatch(/[぀-ヿ一-鿿]/);
        else expect(label).not.toMatch(/[぀-ヿ一-鿿]/);
        expect((await tile.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      // the three groups are named for their art, once each
      const names = await row.locator(".gi-art").allTextContents();
      expect(new Set(names).size).toBe(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("a tile on the home page opens that garment on the Uniforms page, with its controls", async ({ page }) => {
  await page.goto("/");
  const tile = page.locator('[data-testid="gi-dobok-itf-dan5"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await expect(page).toHaveURL(/uniforms\.html\?garment=dobok-itf-dan5/);
  await expect(page.locator('[data-testid="uni-garment"] [data-value="dobok-itf-dan5"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#uni-stage canvas")).toBeVisible();
  await expect(page.locator("kazoku-view-controls")).toBeVisible();
});

test("a tile on the Uniforms page chooses that garment in place", async ({ page }) => {
  await page.goto("/uniforms.html");
  const tile = page.locator('[data-testid="gi-bjj-black-covered"]');
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/garment=bjj-black-covered/);
  await expect(page.locator('[data-testid="uni-garment"] [data-value="bjj-black-covered"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="gi-karate-full"]')).toHaveAttribute("aria-pressed", "false");
});
