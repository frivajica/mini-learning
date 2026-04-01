import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("should load admin login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("text=Login")).toBeVisible();
  });

  test("should show email and password fields", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});
