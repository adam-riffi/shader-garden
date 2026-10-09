import { expect, test } from "@playwright/test";

test("without WebGL2 the page keeps its title and explains why nothing renders", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/");
  await expect(page.getByText("This browser cannot run WebGL2 shaders.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shader Garden" })).toBeVisible();
});
