import { test, expect } from "@playwright/test";

test.describe("Posts Page", () => {
  test("should load posts page", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.locator("h1")).toContainText("All Posts");
  });

  test("should show empty state when no posts", async ({ page }) => {
    await page.goto("/posts");
    await expect(page.locator("text=No posts")).toBeVisible();
  });

  test("should navigate back to home", async ({ page }) => {
    await page.goto("/posts");
    await page.click('text="Mini Payload CMS"');
    await expect(page).toHaveURL("/");
  });
});
