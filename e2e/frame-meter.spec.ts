import { expect, test } from "@playwright/test";

test("F toggles the frame meter, which shows the p95 frame time", async ({ page }) => {
  await page.goto("/");
  const meter = page.getByText(/^p95 /);
  await expect(meter).toBeHidden();

  await page.keyboard.press("f");
  await expect(meter).toHaveText(/^p95 \d+\.\d ms$/);

  await page.keyboard.press("f");
  await expect(meter).toBeHidden();
});
