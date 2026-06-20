import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the @/* alias from tsconfig natively (no extra plugin needed).
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Unit tests live here; Playwright e2e specs (tests/e2e) are excluded so
    // they aren't picked up by Vitest.
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
