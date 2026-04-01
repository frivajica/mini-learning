import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1, h2")).toContainText(/Mini Payload CMS/i);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('text="Posts"')).toBeVisible();
    await expect(page.locator('text="Admin"')).toBeVisible();
  });

  test("should navigate to posts page", async ({ page }) => {
    await page.goto("/");
    await page.click('text="Posts"');
    await expect(page).toHaveURL(/\/posts/);
  });

  test("should navigate to admin", async ({ page }) => {
    await page.goto("/");
    await page.click('text="Admin"');
    await expect(page).toHaveURL(/\/admin/);
  });
});
