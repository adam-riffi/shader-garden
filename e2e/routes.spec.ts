import { expect, test } from "@playwright/test";

test("an unknown shader name explains itself and links home", async ({ page }) => {
  await page.goto("/s/no-such-shader");
  await expect(page.getByText("There is no shader called no-such-shader.")).toBeVisible();
  await page.getByRole("link", { name: "Back to the gallery" }).click();
  await expect(page).toHaveURL("/");
});
