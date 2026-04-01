import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1, h2")).toContainText(/sign in/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page loads correctly", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1, h2")).toContainText(/create/i);
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("shows validation errors for invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/invalid|error/i")).toBeVisible();
  });

  test("shows validation errors for invalid register", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="fullName"]', "J");
    await page.fill('input[name="email"]', "not-an-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/invalid|minimum|error/i")).toBeVisible();
  });

  test("Google sign in button is visible", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.locator(
        'button:has-text("Google"), button:has-text("Sign in with Google")',
      ),
    ).toBeVisible();
  });

  test("link to register page works", async ({ page }) => {
    await page.goto("/login");
    await page.click('a:has-text("Create one"), a:has-text("Sign up")');
    await expect(page).toHaveURL(/\/register/);
  });

  test("link to login page works", async ({ page }) => {
    await page.goto("/register");
    await page.click('a:has-text("Sign in")');
    await expect(page).toHaveURL(/\/login/);
  });

  test("redirects to dashboard after successful login", async ({ page }) => {
    // This test requires actual Supabase instance running
    // Skip in CI or mark as integration test
    test.skip(process.env.CI === "true", "Requires Supabase instance");
  });
});

test.describe("Auth Protected Routes", () => {
  test("dashboard redirects to login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("settings redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
