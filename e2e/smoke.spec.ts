import { expect, test } from "@playwright/test";

test("home page loads and shows the title @smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Shader Garden" })).toBeVisible();
});
