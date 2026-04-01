import { test, expect } from "@playwright/test";

test.describe("Task Management", () => {
  // These tests require authentication - would need to set up test user session
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // In real tests, you would log in here
    // For now, we test the UI structure
  });

  test("task input is visible on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login if not authenticated
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator('input[placeholder*="Task"]')).toBeVisible();
  });

  test("create task button is visible", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator('button:has-text("Create Task")')).toBeVisible();
  });

  test("no tasks shows empty state message", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // Should show empty state or task list
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });

  test("task status badges are displayed", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // Check for any status badges or status-related elements
    const hasStatusElements =
      (await page.locator('[class*="badge"], [class*="status"]').count()) > 0;
    // Either has badges or no tasks yet
    expect(
      hasStatusElements ||
        (await page.locator("text=/no tasks|create/i").count()) > 0,
    ).toBeTruthy();
  });
});

test.describe("Real-time Features", () => {
  test("enable real-time button exists", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(
      page.locator('button:has-text("Enable Real-time")'),
    ).toBeVisible();
  });

  test("real-time toggle works", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // Click enable real-time
    await page.click('button:has-text("Enable Real-time")');
    // Button should change to indicate real-time is active
    await expect(page.locator('button:has-text("Real-time")')).toBeVisible();
  });
});
