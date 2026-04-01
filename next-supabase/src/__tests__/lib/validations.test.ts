import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  taskSchema,
  profileUpdateSchema,
} from "@/lib/validations";

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

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct input", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      fullName: "John Doe",
    });
    expect(result.success).toBe(true);
  });

  it("requires minimum 8 char password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      fullName: "John Doe",
    });
    expect(result.success).toBe(false);
  });

  it("requires minimum 2 char full name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      fullName: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate fields", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      fullName: "John Doe",
    });
    expect(result.success).toBe(true);
  });
});

describe("taskSchema", () => {
  it("validates task with required fields", () => {
    const result = taskSchema.safeParse({
      title: "Test Task",
    });
    expect(result.success).toBe(true);
  });

  it("validates task with all fields", () => {
    const result = taskSchema.safeParse({
      title: "Test Task",
      description: "A description",
      status: "in_progress",
      dueDate: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = taskSchema.safeParse({
      title: "Test Task",
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = taskSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title too long", () => {
    const result = taskSchema.safeParse({
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to pending", () => {
    const result = taskSchema.safeParse({
      title: "Test Task",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
    }
  });
});

describe("profileUpdateSchema", () => {
  it("validates empty update (no fields)", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates full name update", () => {
    const result = profileUpdateSchema.safeParse({
      fullName: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("validates avatar URL", () => {
    const result = profileUpdateSchema.safeParse({
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid avatar URL", () => {
    const result = profileUpdateSchema.safeParse({
      avatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null avatar URL", () => {
    const result = profileUpdateSchema.safeParse({
      avatarUrl: null,
    });
    expect(result.success).toBe(true);
  });
});
