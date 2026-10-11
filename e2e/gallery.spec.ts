import { expect, test } from "@playwright/test";

test("J1: six live thumbnails use one GPU context and open their shaders @smoke", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const contexts = new Set<HTMLCanvasElement>();
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        if (kind === "webgl2") contexts.add(this);
        document.documentElement.dataset.gpuContexts = String(contexts.size);
        return Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const tiles = page.locator("canvas[data-shader]");
  await expect(tiles).toHaveCount(6);
  for (const tile of await tiles.all()) {
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveAttribute("data-ready", "true");
    await expect(tile).toHaveAttribute("width", "256");
    const first = await tile.evaluate((node: HTMLCanvasElement) => node.toDataURL());
    await expect.poll(() => tile.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(first);
  }
  await expect(page.locator("html")).toHaveAttribute("data-gpu-contexts", "1");
  await page.getByRole("link", { name: /Explore Terrain/ }).click();
  await expect(page).toHaveURL(/\/s\/terrain/);
  await expect(page.getByLabel("Warp", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("previews pause on request and while outside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/");
  const tile = page.locator('canvas[data-shader="terrain"]');
  await tile.scrollIntoViewIfNeeded();
  await expect(tile).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Pause previews" }).click();
  const paused = await tile.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.waitForTimeout(300);
  expect(await tile.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(paused);
  await page.getByRole("button", { name: "Play previews" }).click();
  await tile.scrollIntoViewIfNeeded();
  await expect.poll(() => tile.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(paused);
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "2000px";
    document.body.append(spacer);
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(tile).toHaveAttribute("data-visible", "false");
  const hidden = await tile.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await page.waitForTimeout(300);
  expect(await tile.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(hidden);
});
