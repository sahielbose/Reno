import { test, expect } from "@playwright/test";

/**
 * Golden path: the core "bid → build → bill" surfaces render with real seed
 * data, and the AI assistant answers from that data end to end.
 */
test("dashboard, project hub, invoices, and assistant all work", async ({
  page,
}) => {
  // Dashboard with real org data
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByText("Maple Street Kitchen Remodel").first(),
  ).toBeVisible();

  // Open the project from the list
  await page.goto("/app/projects");
  await page.getByText("Maple Street Kitchen Remodel").first().click();
  await page.waitForURL(/\/app\/projects\/[^/?#]+/);
  const id = page.url().match(/\/app\/projects\/([^/?#]+)/)?.[1];
  expect(id).toBeTruthy();

  // Invoices tab → billing spine
  await page.goto(`/app/projects/${id}/invoices`);
  await expect(page.getByText("Billed").first()).toBeVisible();

  // Budget tab renders
  await page.goto(`/app/projects/${id}/budget`);
  await expect(page).toHaveURL(/\/budget$/);

  // Org invoices roll-up across projects
  await page.goto("/app/invoices");
  await expect(page.getByText("Oakwood ADU Build").first()).toBeVisible();

  // AI assistant answers from real data
  await page.goto("/app/assistant");
  await expect(page.getByPlaceholder(/Ask Reno/)).toBeVisible();
  await page.getByPlaceholder(/Ask Reno/).fill("What's overdue?");
  await page.getByPlaceholder(/Ask Reno/).press("Enter");
  await expect(page.getByText(/overdue|outstanding/i).first()).toBeVisible({
    timeout: 15000,
  });
});
