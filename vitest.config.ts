import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const empty = fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url));

export default defineConfig({
  // Resolve the @/* alias from tsconfig natively (no extra plugin needed).
  resolve: {
    tsconfigPaths: true,
    // Next's RSC markers throw outside a server bundle; stub them in tests.
    alias: {
      "server-only": empty,
      "client-only": empty,
    },
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
