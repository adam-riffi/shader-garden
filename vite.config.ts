import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), glsl()],
  test: {
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // Components (.tsx) are UI glue and are covered by e2e (ENGINEERING.md section 8).
      include: ["src/**/*.ts"],
      thresholds: {
        lines: 80,
        "src/engine/**": { lines: 90 },
        "src/params/**": { lines: 90 },
      },
    },
  },
});
