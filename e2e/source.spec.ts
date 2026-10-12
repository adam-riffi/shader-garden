import { expect, test } from "@playwright/test";

test("source opens with S, highlights GLSL, and closes without changing parameters", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/s/terrain");
  await expect(page.getByLabel("Warp", { exact: true })).toBeVisible();
  expect(requests.some((url) => /SourceViewer/.test(url))).toBe(false);
  await page.keyboard.press("s");
  const source = page.getByRole("region", { name: "GLSL source" });
  await expect(source).toBeVisible();
  await expect(source.locator("code")).toContainText("uWarp");
  await expect(source.locator("code span[style]").first()).toBeVisible();
  await expect(page.getByLabel("Warp", { exact: true })).toHaveValue("0.6");
  await page.getByLabel("Warp", { exact: true }).focus();
  await page.keyboard.press("s");
  await expect(source).toBeVisible();
  await page.getByRole("button", { name: "Source", exact: true }).click();
  await expect(source).toHaveCount(0);
});

test("simulation source offers display, seed, simulation and vertex passes", async ({ page }) => {
  await page.goto("/s/bloom");
  await page.getByRole("button", { name: "Source", exact: true }).click();
  const file = page.getByLabel("Source file");
  await file.selectOption("Simulation");
  await expect(page.locator("code")).toContainText("uFeed");
  await file.selectOption("Seed");
  await expect(page.locator("code")).toContainText("uReseed");
  await file.selectOption("Vertex");
  await expect(page.locator("code")).toContainText("gl_Position");
});
