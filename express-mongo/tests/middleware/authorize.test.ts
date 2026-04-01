import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Response } from "express";
import { authorize } from "../../src/middleware/authorize.js";
import { AuthRequest } from "../../src/middleware/auth.js";
import { ForbiddenError } from "../../src/utils/AppError.js";

describe("authorize middleware", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      user: {
        userId: "user123",
        email: "user@test.com",
        role: "USER",
      },
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it("should call next with ForbiddenError when user is not authenticated", () => {
    mockReq.user = undefined;
    const middleware = authorize("ADMIN");

    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should call next with ForbiddenError when user role is not allowed", () => {
    const middleware = authorize("ADMIN");

    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should call next without error when user has required role", () => {
    mockReq.user!.role = "ADMIN";
    const middleware = authorize("ADMIN");

    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should allow access when user has one of multiple allowed roles", () => {
    mockReq.user!.role = "USER";
    const middleware = authorize("ADMIN", "USER");

    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should deny access when user does not have any of the allowed roles", () => {
    mockReq.user!.role = "GUEST";
    const middleware = authorize("ADMIN", "USER");

    middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
