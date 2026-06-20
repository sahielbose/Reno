import { test, expect } from "@playwright/test";

// Smoke test: the app boots and the root route responds. Expanded into the
// full bid -> built golden path in Phase 17.
test("home page loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
});
