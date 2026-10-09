import { expect, test } from "@playwright/test";

test("home page renders an animated shader canvas without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/s/test");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  // The time uniform advances every frame, so two captures of the canvas differ.
  const first = await canvas.screenshot();
  await expect.poll(async () => (await canvas.screenshot()).equals(first)).toBe(false);
  expect(errors).toEqual([]);
});

test("Seed restarts a simulation without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/s/bloom");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Seed" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  expect(errors).toEqual([]);
});
