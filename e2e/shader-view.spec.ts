import { expect, test } from "@playwright/test";

test("home page renders an animated shader canvas without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  // The time uniform advances every frame, so two captures of the canvas differ.
  const first = await canvas.screenshot();
  await expect.poll(async () => (await canvas.screenshot()).equals(first)).toBe(false);
  expect(errors).toEqual([]);
});
