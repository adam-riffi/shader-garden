import { expect, test } from "@playwright/test";
import { encode } from "../src/params/codec";
import { defaults } from "../src/params/schema";
import { meta } from "../src/shaders/test/meta";

test("moving a slider updates the shareable URL within 250 ms", async ({ page }) => {
  await page.goto("/s/test");
  const rings = page.getByLabel("Rings");
  await expect(rings).toHaveValue("18");

  // Time the app itself, from the input event to the URL write, without Playwright round-trips.
  await page.evaluate(() => {
    const marks = window as unknown as Record<"inputAt" | "urlAt", number>;
    addEventListener("input", () => (marks.inputAt = performance.now()), { capture: true });
    const replace = history.replaceState.bind(history);
    history.replaceState = (...args) => {
      marks.urlAt = performance.now();
      replace(...args);
    };
  });

  await rings.fill("30");
  const expected = encode(meta, 1, { ...defaults(meta), rings: 30 });
  await expect(page).toHaveURL(`/s/test?${expected}`);
  const latency = await page.evaluate(() => {
    const marks = window as unknown as Record<"inputAt" | "urlAt", number>;
    return marks.urlAt - marks.inputAt;
  });
  expect(latency).toBeLessThan(250);
});

test("opening a shared URL restores its values", async ({ page }) => {
  await page.goto(`/s/test?${encode(meta, 9, { ...defaults(meta), rings: 12.5, invert: true })}`);
  await expect(page.getByLabel("Rings")).toHaveValue("12.5");
  await expect(page.getByLabel("Invert")).toBeChecked();
});

test("a link from a newer version shows the defaults and says so", async ({ page }) => {
  await page.goto("/s/test?v=99&p=AAAA");
  await expect(page.getByRole("status")).toContainText("newer version");
  await expect(page.getByLabel("Rings")).toHaveValue("18");
});
