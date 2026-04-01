import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "../../src/utils/AppError.js";

describe("AppError", () => {
  it("should create an error with statusCode and message", () => {
    const error = new AppError(400, "Bad request");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad request");
    expect(error.isOperational).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it("should allow setting isOperational to false", () => {
    const error = new AppError(500, "Server error", false);
    expect(error.isOperational).toBe(false);
  });
});

describe("UnauthorizedError", () => {
  it("should have statusCode 401", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });

  it("should accept custom message", () => {
    const error = new UnauthorizedError("Token expired");
    expect(error.message).toBe("Token expired");
  });
});

describe("NotFoundError", () => {
  it("should have statusCode 404", () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
  });

  it("should accept custom message", () => {
    const error = new NotFoundError("Product not found");
    expect(error.message).toBe("Product not found");
  });
});

describe("ConflictError", () => {
  it("should have statusCode 409", () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Conflict");
  });

  it("should accept custom message", () => {
    const error = new ConflictError("Email already exists");
    expect(error.message).toBe("Email already exists");
  });
});
