import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidatePath = vi.fn();
const mockRedirect = vi.fn();

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

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => supabaseMock),
}));

describe("login action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid email format", async () => {
    const { login } = await import("@/actions/auth");
    const result = await login({ email: "invalid", password: "password123" });
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Invalid email");
  });

  it("returns error for empty password", async () => {
    const { login } = await import("@/actions/auth");
    const result = await login({ email: "test@example.com", password: "" });
    expect(result.error).toBeDefined();
  });

  it("calls revalidatePath on success", async () => {
    authMock.signInWithPassword.mockResolvedValue({
      data: { user: { id: "123" } },
      error: null,
    });

    const { login } = await import("@/actions/auth");
    await login({ email: "test@example.com", password: "password123" });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("register action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for short password", async () => {
    const { register } = await import("@/actions/auth");
    const result = await register({
      email: "test@example.com",
      password: "short",
      fullName: "John Doe",
    });
    expect(result.error).toBeDefined();
  });

  it("returns error for short name", async () => {
    const { register } = await import("@/actions/auth");
    const result = await register({
      email: "test@example.com",
      password: "password123",
      fullName: "J",
    });
    expect(result.error).toBeDefined();
  });
});

describe("logout action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls signOut and redirects", async () => {
    authMock.signOut.mockResolvedValue({
      error: null,
    });

    const { logout } = await import("@/actions/auth");
    await logout();

    expect(authMock.signOut).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
