import { readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Every shader folder with metadata, the hidden test pattern included (an engine regression check).
const names = readdirSync("src/shaders", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "common")
  .map((entry) => entry.name);

test.describe("golden screenshots (seed 1, t = 2 s, 512x512)", () => {
  // DESIGN.md section 14: goldens are SwiftShader renders from CI's Linux runner only.
  test.skip(process.platform !== "linux", "goldens are rendered on CI's Linux runner");
  test.use({ viewport: { width: 512, height: 512 } });

  for (const name of names) {
    test(name, async ({ page }) => {
      await page.goto(`/s/${name}?t=2`);
      await expect(page.locator("canvas")).toHaveScreenshot(`${name}.png`, {
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
