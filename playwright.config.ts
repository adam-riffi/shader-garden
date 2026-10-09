import { defineConfig, devices } from "@playwright/test";

// BASE_URL points the suite at a deployment (smoke.yml); without it, test the local production build.
const baseURL = process.env.BASE_URL ?? "http://localhost:4173";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(process.env.BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm preview --port 4173 --strictPort",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
