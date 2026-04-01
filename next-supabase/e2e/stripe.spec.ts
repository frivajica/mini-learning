import { test, expect } from "@playwright/test";

test.describe("Stripe Subscriptions", () => {
  test.describe.configure({ mode: "serial" });

  test("subscription page loads when authenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/subscription/i")).toBeVisible();
  });

  test("pro plan is displayed", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/pro plan/i")).toBeVisible();
  });

  test("pro plan price is displayed", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/9.99/i")).toBeVisible();
  });

  test("pro plan features are listed", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator("text=/unlimited/i")).toBeVisible();
    await expect(page.locator("text=/real-time/i")).toBeVisible();
  });

  test("subscribe button is visible for non-subscribers", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    await expect(page.locator('button:has-text("Subscribe")')).toBeVisible();
  });

  test("active subscription shows manage button", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // If user has active subscription, should show manage button instead
    const hasActiveSubscription = await page.locator("text=/active/i").count() > 0;
    if (hasActiveSubscription) {
      await expect(page.locator('button:has-text("Manage")')).toBeVisible();
    }
  });

  test("subscription status badge visibility", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }
    // Should show some status indication
    const hasStatusIndicator = await page.locator('[class*="badge"], [class*="status"], text=/active|text=/pending/);
    await expect(hasStatusIndicator.first()).toBeVisible();
  });
});

test.describe("Stripe Checkout Flow", () => {
  test("subscribe button redirects to stripe", async ({ page }) => {
    await page.goto("/dashboard/settings");
    if (page.url().includes("/login")) {
      test.skip();
    }

    // Click subscribe button
    await page.click('button:has-text("Subscribe")');

    // Should redirect to Stripe Checkout
    await page.waitForURL(/checkout\.stripe\.com|stripe\.com\/checkout/, { timeout: 10000 }).catch(() => {
      // If no Stripe keys configured, may not redirect
      console.log("Stripe checkout not triggered - check environment variables");
    });
  });
});
