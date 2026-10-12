import { expect, test } from "@playwright/test";

test("keyboard visitors can skip navigation and reach the collection", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.getByRole("link", { name: /Explore / })).toHaveCount(6);
});

test("narrow screens fit the collection and honor reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Play previews" })).toBeVisible();
  const tile = page.locator('canvas[data-shader="terrain"]');
  await tile.scrollIntoViewIfNeeded();
  await expect(tile).toHaveAttribute("data-ready", "true");
  const image = await tile.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(300);
  expect(await tile.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(image);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
