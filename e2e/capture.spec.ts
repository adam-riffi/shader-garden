import { expect, test } from "@playwright/test";

test("capture mode signals when its frozen frame is ready", async ({ page }) => {
  await page.goto("/s/test?t=2");
  await expect(page.locator("html")).toHaveAttribute("data-capture-ready", "true");
});

test("a live view never claims to be a capture", async ({ page }) => {
  await page.goto("/s/test");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-capture-ready");
});
