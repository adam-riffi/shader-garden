import { expect, test } from "@playwright/test";

test("home page loads and shows the title @smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Shader Garden" })).toBeVisible();
});

test("a shader page opens from a deep link @smoke", async ({ page }) => {
  const response = await page.goto("/s/test");
  expect(response?.status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible();
});
