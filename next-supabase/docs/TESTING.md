# Testing Strategy

## Overview

This project uses a multi-layered testing approach:

- **Unit Tests** - Vitest for isolated logic
- **Component Tests** - React Testing Library for UI
- **E2E Tests** - Playwright for full workflows

## Test Commands

```bash
# Run all unit tests
yarn test

# Watch mode (auto-reload on changes)
yarn test:watch

# Run specific test file
yarn test src/__tests__/lib/validations.test.ts

# Run with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e

# E2E tests with UI
yarn test:e2e:ui

# E2E tests with debugging
yarn test:e2e:debug
```

## Unit Tests (Vitest)

### What to Test

1. **Validation Schemas** (`src/lib/validations.ts`)
   - Login/register input validation
   - Task creation validation
   - Edge cases (empty strings, special characters)

2. **Utility Functions** (`src/lib/utils.ts`)
   - `cn()` - className merging
   - `formatDate()` - date formatting
   - `formatCurrency()` - currency formatting

3. **Server Actions** (`src/actions/`)
   - Auth flows (with mocked Supabase)
   - Task CRUD operations

### Example: Validation Test

```typescript
// src/__tests__/lib/validations.test.ts
import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("validates correct email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});
```

### Mocking Supabase

Mock the Supabase client for Server Action tests using shared mock references:

```typescript
const authMock = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
};

const supabaseMock = {
  auth: authMock,
  from: vi.fn(() => ({
    insert: vi.fn(),
    update: vi.fn(),
  })),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => supabaseMock),
}));

// In your tests, configure mocks like:
authMock.signInWithPassword.mockResolvedValue({
  data: { user: { id: "123" } },
  error: null,
});
```

## Component Tests (React Testing Library)

### What to Test

1. **UI Components** (`src/components/ui/`)
   - Button variants and states
   - Input validation states
   - Card composition

2. **Form Components**
   - Validation error display
   - Loading states
   - Disabled states

### Example: Button Test

```typescript
// src/__tests__/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## E2E Tests (Playwright)

### What to Test

1. **Auth Flows**
   - Login page loads
   - Register page loads
   - Form validation works
   - Protected routes redirect

2. **User Flows**
   - Create task
   - Complete task
   - Delete task
   - Real-time updates

3. **Subscription Flow**
   - View subscription page
   - Subscribe button redirects to Stripe

### Example: Auth E2E Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1, h2")).toContainText(/sign in/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("shows validation errors for invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/invalid|error/i")).toBeVisible();
  });
});
```

### E2E Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

## Test Organization

```
src/__tests__/
├── lib/
│   ├── validations.test.ts
│   └── utils.test.ts
├── actions/
│   └── auth.test.ts
└── components/
    ├── button.test.tsx
    └── card.test.tsx

e2e/
├── auth.spec.ts
├── tasks.spec.ts
├── dashboard.spec.ts
└── stripe.spec.ts
```

## Best Practices

### Unit Tests

- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Aim for meaningful coverage, not 100%

### Component Tests

- Test behavior, not implementation
- Use `userEvent` over `fireEvent`
- Test accessibility (screen readers)

### E2E Tests

- Keep tests independent
- Use `test.skip()` for tests needing full environment
- Clean up test data
- Take screenshots on failure

## Coverage

Run coverage report:

```bash
yarn test:coverage
```

Coverage is generated in `coverage/` directory.

## CI Integration

Tests run automatically on GitHub Actions (see `.github/workflows/test.yml`):

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: yarn test:unit
    - run: yarn test:e2e
```

## Debugging

### Vitest

```bash
yarn test:watch --reporter=verbose
```

### Playwright

```bash
# UI mode
yarn test:e2e:ui

# Debug mode
yarn test:e2e:debug

# View trace
npx playwright show-trace trace.zip
```
