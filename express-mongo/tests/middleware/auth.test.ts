import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Response } from "express";
import { authenticate, AuthRequest } from "../../src/middleware/auth.js";
import { UnauthorizedError } from "../../src/utils/AppError.js";

jest.mock("../../src/config/index.js", () => ({
  config: {
    jwt: {
      secret: "test-secret-min-32-characters-long",
      refreshSecret: "test-refresh-min-32-characters-long",
    },
  },
}));

describe("authenticate middleware", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn<() => Response>().mockReturnThis(),
      json: jest.fn<() => Response>(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  it("should call next with UnauthorizedError when no authorization header", () => {
    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("should call next with UnauthorizedError when header doesn't start with Bearer", () => {
    mockReq.headers = { authorization: "Basic abc123" };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("should call next with UnauthorizedError for invalid token", () => {
    mockReq.headers = { authorization: "Bearer invalid-token" };

    authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
