import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { asyncHandler } from "../../src/utils/asyncHandler.js";

describe("asyncHandler", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it("should call the wrapped function and return the result", async () => {
    const mockFn = jest.fn<() => Promise<string>>().mockResolvedValue("result");
    const handler = asyncHandler(mockFn);

    await handler(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next with error when function throws", async () => {
    const error = new Error("Test error");
    const mockFn = jest.fn<() => Promise<never>>().mockRejectedValue(error);
    const handler = asyncHandler(mockFn);

    await handler(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it("should catch and forward non-Error rejections", async () => {
    const mockFn = jest
      .fn<() => Promise<never>>()
      .mockRejectedValue("string error");
    const handler = asyncHandler(mockFn);

    await handler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith("string error");
  });
});
