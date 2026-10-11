import { expect, test } from "@playwright/test";

test("presets, randomize and pause respond without stealing form keys", async ({ page }) => {
  await page.goto("/s/test");
  await page.getByRole("button", { name: "Calm", exact: true }).click();
  await expect(page.getByLabel("Rings")).toHaveValue("8");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const canvas = page.locator("canvas");
  const first = await canvas.screenshot();
  expect((await canvas.screenshot()).equals(first)).toBe(true);
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect.poll(async () => (await canvas.screenshot()).equals(first)).toBe(false);
  await page.keyboard.press("r");
  await expect(page).toHaveURL(/s=(?!1&)[0-9]+/);
  const url = page.url();
  await page.getByLabel("Rings").focus();
  await page.keyboard.press("r");
  await page.waitForTimeout(200);
  expect(page.url()).toBe(url);
});

test("J3: copy captures current values before debounce and restores them in another page", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/s/test");
  await expect(page.getByLabel("Rings")).toBeVisible();
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>("#param-rings");
    if (!input) throw new Error("Missing slider");
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "30");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const copy = [...document.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Copy link"),
    );
    copy?.click();
  });
  await expect(page.getByRole("status")).toHaveText("Link copied");
  const url = await page.evaluate(() => navigator.clipboard.readText());
  const shared = await context.newPage();
  await shared.goto(url);
  await expect(shared.getByLabel("Rings")).toHaveValue("30");
  await shared.close();
});

test("clipboard denial exposes a selectable link", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Denied")) },
    }),
  );
  await page.goto("/s/test");
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.getByLabel("Shareable link")).toHaveValue(/\/s\/test\?v=1&s=1&p=/);
  await expect(page.getByRole("status")).toContainText("Copy this link");
});

test("J2: slider changes both URL and pixels @smoke", async ({ page }) => {
  await page.goto("/s/terrain");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const canvas = page.locator("canvas");
  const first = await canvas.screenshot();
  await page.getByLabel("Warp", { exact: true }).fill("1.8");
  await expect(page).toHaveURL(/\?v=1&s=1&p=/);
  await expect.poll(async () => (await canvas.screenshot()).equals(first)).toBe(false);
});
