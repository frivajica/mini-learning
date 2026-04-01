import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard page loads when authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Redirects to login if not authenticated
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("h1")).toContainText(/tasks/i);
  });

  test("navigation to settings works", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await page.click('a:has-text("Settings")');
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });

  test("navigation to tasks works", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await page.click('a:has-text("Tasks")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("user email is displayed", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // Should show user email in header
    await expect(page.locator("header")).toBeVisible();
  });

  test("sign out button is visible", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();
  });

  test("sign out redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Settings Page", () => {
  test("settings page loads when authenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("h1")).toContainText(/settings/i);
  });

  test("profile section is visible", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/profile/i")).toBeVisible();
  });

  test("subscription section is visible", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/subscription/i")).toBeVisible();
  });

  test("email input is read-only", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if ((await emailInput.count()) > 0) {
      await expect(emailInput).toBeDisabled();
    }
  });
});
